const ReceiptTemplate = require('../models/ReceiptTemplate');

// GET all templates
const getTemplates = async (req, res, next) => {
  try {
    const templates = await ReceiptTemplate.find().sort({ isDefault: -1, createdAt: 1 });
    res.json({ success: true, data: templates });
  } catch(err) { next(err); }
};

// POST create template
const createTemplate = async (req, res, next) => {
  try {
    // If new template is default, unset all others
    if (req.body.isDefault) await ReceiptTemplate.updateMany({}, { isDefault: false });
    const t = await ReceiptTemplate.create(req.body);
    res.status(201).json({ success: true, data: t });
  } catch(err) { next(err); }
};

// PUT update template
const updateTemplate = async (req, res, next) => {
  try {
    // If setting as default, unset all others first
    if (req.body.isDefault) await ReceiptTemplate.updateMany({ _id: { $ne: req.params.id } }, { isDefault: false });
    const t = await ReceiptTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, data: t });
  } catch(err) { next(err); }
};

// DELETE template (cannot delete the default)
const deleteTemplate = async (req, res, next) => {
  try {
    const t = await ReceiptTemplate.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Template not found' });
    if (t.isDefault) return res.status(400).json({ success: false, message: 'Cannot delete the default template. Set another template as default first.' });
    await t.deleteOne();
    res.json({ success: true, message: 'Template deleted' });
  } catch(err) { next(err); }
};

// Set as default
const setDefault = async (req, res, next) => {
  try {
    await ReceiptTemplate.updateMany({}, { isDefault: false });
    const t = await ReceiptTemplate.findByIdAndUpdate(req.params.id, { isDefault: true }, { new: true });
    if (!t) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, data: t, message: `"${t.name}" is now the default template` });
  } catch(err) { next(err); }
};

module.exports = { getTemplates, createTemplate, updateTemplate, deleteTemplate, setDefault };
