var express = require('express');
var router = express.Router();
var mainController = require("../controllers/mainController");
var userController = require("../controllers/userController");

router.post('/validarUsuario/:user', userController.validateUser);
router.post('/validarCorreo/:email', userController.validateEmail);
router.post('/olvidoUsuario/:value', userController.forgetUser);

router.get('/registro', mainController.redirectHome, userController.login);
router.post('/registro', mainController.redirectHome, userController.loginP);

router.post('/cerrar', mainController.redirectLogin, userController.logoutP);

router.get('/acceso', mainController.redirectHome, userController.signin);
router.post('/acceso', mainController.redirectHome, userController.signinP);

router.get('/olvido', mainController.redirectHome, userController.forget);
router.post('/olvido', mainController.redirectHome, userController.forgetP);

router.get('/recuperar/:user/:token', mainController.redirectHome, userController.recover);
router.post('/recuperar/', mainController.redirectHome, userController.recoverP);

router.get('/activar/:user/:token', mainController.redirectHome, userController.activate);

router.get('/dudas/', userController.faq);

module.exports = router;