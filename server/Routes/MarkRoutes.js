const express = require('express');
const router = express.Router();
const markController = require('../Controllers/MarkController');

router.post('/marks', markController.createMark);
router.get('/marks', markController.getAllMarks);
router.get('/marks/:id', markController.getMarkById);
router.put('/marks/:id', markController.updateMark);
router.delete('/marks/:id', markController.deleteMark);

module.exports = router;
