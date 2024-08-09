const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Libro  = require('../models/libroModel.js'); // Asegúrate de que esta ruta es correcta

const { Autor } = require('../models/autorModel.js');
const { Categoria } = require('../models/categoriaModel.js');
const { Genero } = require('../models/generoModel.js');
const { Resena } = require('../models/resenaModel.js');

// Función para calcular la letra del DNI (si es relevante)
const calcularLetraDNI = (numerosDNI) => {
    const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const modulo = parseInt(numerosDNI, 10) % 23;
    return letras.charAt(modulo);
};
 
// Ruta para añadir un libro
router.post('/add-book', async (req, res) => {
    try {
        const { titulo, id_autor, id_categoria, isbn, fecha_publicacion, id_genero, descripcion, activo } = req.body;
        let archivoPath;
        let imagenBase64;

        // Si se envía un archivo de imagen
        if (req.file && req.file.mimetype.startsWith('image')) {
            const imageData = fs.readFileSync(req.file.path);
            imagenBase64 = `data:${req.file.mimetype};base64,${imageData.toString('base64')}`;
            fs.unlinkSync(req.file.path);
        } else if (req.body.imagen && req.body.imagen.startsWith('data:image')) {
            imagenBase64 = req.body.imagen;
        }

        // Si se envía un archivo PDF
        if (req.file && req.file.mimetype === 'application/pdf') {
            const pdfFileName = req.file.originalname + `.pdf`;
            const pdfFilePath = path.join(__dirname, '../public/uploads/pdf', pdfFileName);
            fs.renameSync(req.file.path, pdfFilePath);
            archivoPath = pdfFilePath;
        }

        // Crear una nueva instancia del modelo de libro con los datos
        const newBook = new Libro({
            titulo,
            id_autor,
            id_categoria,
            isbn,
            fecha_publicacion,
            id_genero,
            descripcion,
            activo,
            archivo: archivoPath,
            imagen: imagenBase64
        });

        // Guardar el libro en la base de datos
        await newBook.save();
        res.status(201).send('Libro guardado con éxito');
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al guardar el libro');
    }
});

// Ruta para obtener todos los libros
router.get('/', async (req, res) => {
    try {
      const libros = await Libro.find()
          .populate('id_autor') //AutorModel Poblar datos del autor
          .populate('categorias') // Poblar datos de la categoría
          .populate('generos')// Poblar datos del género
          .populate('resenas') 
          .exec(); // Ejecutar la consulta

      if (libros.length > 0) {
          res.send({ ok: true, resultado: libros });
      } else {
          res.status(404).send({ ok: false, error: "No se encontraron libros" });
      }
  } catch (err) {
      res.status(500).send({
          ok: false,
          error: err.message
      });
  }
});

// Ruta para obtener un libro específico
router.get('/books/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const book = await LibroModel.findById(id);
        if (!book) {
            return res.status(404).send('Libro no encontrado');
        }
        res.status(200).json(book);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al buscar el libro');
    }
});

// Ruta para actualizar un libro
router.put('/books/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const book = await LibroModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!book) {
            return res.status(404).send('Libro no encontrado');
        }
        res.status(200).json(book);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al actualizar el libro');
    }
});

// Ruta para eliminar un libro
router.delete('/books/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedBook = await LibroModel.findByIdAndDelete(id);
        if (!deletedBook) {
            return res.status(404).send('Libro no encontrado');
        }
        res.status(200).send('Libro eliminado correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al eliminar el libro');
    }
});

module.exports = router;
