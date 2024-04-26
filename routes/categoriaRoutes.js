const express = require('express');
const router = express.Router();
const CategoriaController = require('../controllers/categoriaController.js');
const { verificarAdmin } = require('../middleware/middleware.js');


// Ruta para obtener todos los usuarios
router.get('/', verificarToken ,CategoriaController.getAllCategorias);

// Ruta para obtener un usuario por su ID
router.get('/:categoriaId',verificarToken ,CategoriaController.getCategoriaById);

router.post('/',verificarToken, verificarAdmin,CategoriaController.addCategoria);

// Ruta para actualizar una categoria existente
router.put('/:categoriaId', verificarToken, verificarAdmin ,CategoriaController.editCategoriaById);

// Ruta para eliminar una categoria existente
router.delete('/:categoriaId', verificarToken, verificarAdmin ,CategoriaController.deleteCategoriaById);

module.exports = router;