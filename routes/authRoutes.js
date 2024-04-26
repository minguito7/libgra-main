const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController.js');


router.post('/registro', AuthController.registrarUsuario);
router.post('/login', AuthController.iniciarSesion);

module.exports = router;