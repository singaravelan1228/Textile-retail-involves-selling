const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/products')),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product_${Date.now()}_${Math.round(Math.random()*1e6)}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg','.jpeg','.png','.webp'];
  allowed.includes(path.extname(file.originalname).toLowerCase()) ? cb(null,true) : cb(new Error('Only JPG, PNG, WEBP allowed'),false);
};
module.exports = multer({ storage, fileFilter, limits: { fileSize: 3*1024*1024 } });
