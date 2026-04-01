const express = require('express');
const router  = express.Router();
const { getTemplates, createTemplate, updateTemplate, deleteTemplate, setDefault } = require('../controllers/receiptTemplateController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',              protect, getTemplates);
router.post('/',             protect, adminOnly, createTemplate);
router.put('/:id/default',   protect, adminOnly, setDefault);
router.put('/:id',           protect, adminOnly, updateTemplate);
router.delete('/:id',        protect, adminOnly, deleteTemplate);

module.exports = router;
