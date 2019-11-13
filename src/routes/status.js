var express = require('express');
const router = express.Router();

var statusController = require("../controllers/statusController");

router.post('/estatus', statusController.main);

module.exports = router;