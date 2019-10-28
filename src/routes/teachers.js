var express = require('express');
var router = express.Router();
var teacherController = require ("../controllers/teacherController");

router.get('/nosotros/:id_especialidad?', teacherController.teachers);

module.exports = router;