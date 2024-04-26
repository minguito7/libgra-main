const express = require('express');
const router = express.Router();
const { LibroLeido } = require('../controllers/libroLeidoController.js');
const {verificarToken, verificarAdmin } = require('../middleware/middleware.js');

// Ruta para añadir un libro leído
router.post('/add-read-book',verificarToken, LibroLeido.addReadBook);

// Ruta para borrar un libro leído por su ID
router.delete('/delete-read-book/:id', verificarAdmin,LibroLeido.deleteReadBook);

// Ruta para ver un libro leído por su ID
router.get('/read-book/:id',verificarToken, LibroLeido.getReadBook);

// Ruta para ver todos los libros leídos
router.get('/read-books',verificarToken, LibroLeido.getAllReadBooks);

// Ruta para obtener todos los usuarios que han leido un libro
router.get('/books-read/:id_usuario', verificarToken, LibroLeido.getUsersWhoReadBook);

// Ruta para obtener todos los libros leídos por un usuario
router.get('/books-read/:id_usuario', verificarToken, LibroLeido.getBooksReadByUser);

module.exports = router;