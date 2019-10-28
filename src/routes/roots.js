const express = require('express');
var router = express.Router();
var rootController = require ("../controllers/rootController");

//secambia de ramo a area (ambas son root)
router.get('/areas', rootController.roots);

router.get('/area/:id_ramo', rootController.root);

module.exports = router;