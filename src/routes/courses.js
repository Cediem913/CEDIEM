var express = require('express');
var router = express.Router();
var courseController = require ("../controllers/courseController");

//router.get('/cursos/:id_ramo?', courseController.courses);
router.get('/cursos/:page/:query?', courseController.findCourses);

router.get('/curso/:id_curso', courseController.course);

module.exports = router;