const express = require('express');
const router = express.Router();
const LibroController = require('../controllers/libroController.js');
const uploadMiddle  = require('../middleware/multerConfig.js');
const {verificarToken, verificarAdmin } = require('../middleware/middleware.js');

// Ruta para borrar un libro por su ID
router.delete('/books/:id', verificarAdmin, LibroController.deleteBook);

// Ruta para ver un libro por su ID
router.get('/books/:id', verificarToken, LibroController.getBook);

// Ruta para ver todos los libros
router.get('/books', verificarToken,LibroController.getAllBooks);

// Ruta para añadir un libro
router.post('/add-book', verificarToken, uploadMiddle, LibroController.addBook);

module.exports = router;
