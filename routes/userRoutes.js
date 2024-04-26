const express = require('express');
const {verificarToken, verificarAdmin } = require('../middleware/middleware.js');
const { uploadImageUser } = require('../middleware/multerConfig.js');
//const verificarToken = require('../middleware/middleware.js');
const router = express.Router();
const UserController = require('../controllers/userController.js');

// Ruta para obtener todos los usuarios
router.get('/', verificarToken ,UserController.getAllUsers);

// Ruta para obtener un usuario por su ID
router.get('/:userId',verificarToken, UserController.getUserById);

// Ruta para crear un nuevo usuario
router.post('/', verificarToken, verificarAdmin,UserController.createUser);
//router.post('/registro', UserController.registrarUsuario);
//router.post('/login', UserController.iniciarSesion);


// Ruta para actualizar un usuario existente
router.put('/:userId',verificarToken, UserController.updateUser);

// Ruta para eliminar un usuario existente
router.delete('/:userId',verificarToken, UserController.deleteUser);

module.exports = router;
