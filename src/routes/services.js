var express = require('express');
var router = express.Router();
var serviceController = require ("../controllers/serviceController");

router.get('/servicios/:page/:query?/:method?', serviceController.findServices);

router.get('/servicio/:id_service', serviceController.service);

router.get('/servicio/listaEventos/:id_service/:id_room/:date', serviceController.listEvents);

module.exports = router;