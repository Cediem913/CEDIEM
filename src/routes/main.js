var express = require('express');
var router = express.Router();
var mainController = require("../controllers/mainController");

router.get('/', mainController.main);

router.get('/acceso_directo', mainController.signinDirect);

router.post('/aceptarPago', mainController.checkOutP);

router.post('/preparar/',mainController.buy);

router.get('/comprar/:type/:product',mainController.buy);

router.get('/contacto', mainController.contact);

module.exports = router;