const express = require('express');
const router = express.Router();
const GeneroController = require('../controllers/generoController.js');
const { verificarAdmin } = require('../middleware/middleware.js');


// Ruta para obtener todos los usuarios
router.get('/', verificarToken ,GeneroController.getAllUsers);

// Ruta para obtener un usuario por su ID
router.get('/:generoId',verificarToken ,GeneroController.getUserById);

router.post('/',verificarToken, verificarAdmin,GeneroController.addCategoria);

// Ruta para actualizar una categoria existente
router.put('/:generoId', verificarToken, verificarAdmin ,GeneroController.updateUser);

// Ruta para eliminar una categoria existente
router.delete('/:generoId', verificarToken, verificarAdmin ,GeneroController.deleteUser);

module.exports = router;