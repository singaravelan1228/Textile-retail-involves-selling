/**
 * TextilePOS — Automatic Daily Backup
 * Uses mongodump to backup the database
 * Keeps last 30 backups, deletes older ones
 */

const { exec } = require('child_process');
const path     = require('path');
const fs       = require('fs');

const DB_NAME     = 'textilepos';
const MONGO_URI   = 'mongodb://localhost:27017';
const KEEP_DAYS   = 30;   // keep last 30 backups
const BACKUP_HOUR = 2;    // run at 2:00 AM

function getBackupDir(dataDir) {
  return path.join(dataDir, 'backups');
}

// ── Run a single backup ────────────────────────────────────
function run(dataDir, log = console.log) {
  return new Promise((resolve, reject) => {
    const backupsDir = getBackupDir(dataDir);
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outDir    = path.join(backupsDir, `backup_${timestamp}`);

    const cmd = `mongodump --uri="${MONGO_URI}/${DB_NAME}" --out="${outDir}"`;
    log(`Running backup → ${outDir}`);

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        // mongodump not found — fall back to JSON export via mongoose
        log('mongodump not found, using JSON export fallback');
        jsonFallbackBackup(dataDir, outDir, timestamp, log)
          .then(resolve)
          .catch(reject);
        return;
      }
      log('mongodump backup complete');
      cleanOldBackups(backupsDir, log);
      resolve(outDir);
    });
  });
}

// ── JSON fallback (no mongodump needed) ───────────────────
async function jsonFallbackBackup(dataDir, outDir, timestamp, log) {
  try {
    const mongoose = require('mongoose');

    const MONGO_URI_FULL = 'mongodb://localhost:27017/textilepos';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGO_URI_FULL);
    }

    const models = [
      'User', 'Category', 'Brand', 'Product',
      'Customer', 'Bill', 'Settings', 'ReceiptTemplate',
    ];

    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const backupData = { timestamp, database: DB_NAME, collections: {} };

    for (const modelName of models) {
      try {
        // Access collection directly
        const collection = mongoose.connection.collection(modelName.toLowerCase() + 's');
        const docs = await collection.find({}).toArray();
        backupData.collections[modelName] = docs;
        log(`  Backed up ${docs.length} ${modelName} records`);
      } catch (e) {
        log(`  Skipped ${modelName}: ${e.message}`);
      }
    }

    const outFile = path.join(outDir, `textilepos_backup_${timestamp}.json`);
    fs.writeFileSync(outFile, JSON.stringify(backupData, null, 2));
    log(`JSON backup saved: ${outFile} (${(fs.statSync(outFile).size / 1024).toFixed(1)} KB)`);

    cleanOldBackups(getBackupDir(dataDir), log);
    return outFile;
  } catch (err) {
    throw new Error('Backup failed: ' + err.message);
  }
}

// ── Delete backups older than KEEP_DAYS ───────────────────
function cleanOldBackups(backupsDir, log = console.log) {
  try {
    const entries = fs.readdirSync(backupsDir)
      .filter(f => f.startsWith('backup_'))
      .map(f => ({ name: f, mtime: fs.statSync(path.join(backupsDir, f)).mtime }))
      .sort((a, b) => b.mtime - a.mtime);

    const toDelete = entries.slice(KEEP_DAYS);
    for (const entry of toDelete) {
      const p = path.join(backupsDir, entry.name);
      fs.rmSync(p, { recursive: true, force: true });
      log(`Deleted old backup: ${entry.name}`);
    }
    log(`Backup cleanup: kept ${Math.min(entries.length, KEEP_DAYS)}, removed ${toDelete.length}`);
  } catch (e) {
    log('Cleanup error: ' + e.message);
  }
}

// ── Schedule daily backup ──────────────────────────────────
function schedule(dataDir, log = console.log) {
  log(`Backup scheduler started — runs daily at ${BACKUP_HOUR}:00 AM`);

  const checkAndRun = () => {
    const now = new Date();
    if (now.getHours() === BACKUP_HOUR && now.getMinutes() === 0) {
      log('Running scheduled backup...');
      run(dataDir, log).catch(err => log('Scheduled backup error: ' + err.message));
    }
  };

  // Check every minute
  setInterval(checkAndRun, 60 * 1000);

  // Also run on startup if last backup was > 24 hours ago
  const backupsDir = getBackupDir(dataDir);
  if (fs.existsSync(backupsDir)) {
    const entries = fs.readdirSync(backupsDir).filter(f => f.startsWith('backup_'));
    if (entries.length === 0) {
      log('No backups found — running initial backup...');
      setTimeout(() => run(dataDir, log).catch(e => log('Initial backup error: ' + e.message)), 10000);
    } else {
      entries.sort();
      const latest = entries[entries.length - 1];
      const latestDate = latest.replace('backup_', '').replace(/-/g, ':').slice(0, 10);
      const daysSince = (Date.now() - new Date(latestDate)) / (1000 * 60 * 60 * 24);
      if (daysSince >= 1) {
        log(`Last backup was ${daysSince.toFixed(1)} days ago — running now...`);
        setTimeout(() => run(dataDir, log).catch(e => log('Catchup backup error: ' + e.message)), 10000);
      } else {
        log(`Last backup was recent (${daysSince.toFixed(1)} days ago) — skipping startup backup`);
      }
    }
  } else {
    setTimeout(() => run(dataDir, log).catch(e => log('Initial backup error: ' + e.message)), 10000);
  }
}

module.exports = { run, schedule };
