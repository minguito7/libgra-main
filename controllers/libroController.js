const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const validate = require('./validate-token');
const Libro  = require('../models/libroModel.js'); // Asegúrate de que esta ruta es correcta

const { Autor } = require('../models/autorModel.js');
const { Categoria } = require('../models/categoriaModel.js');
const { Genero } = require('../models/generoModel.js');
const { Resena } = require('../models/resenaModel.js');
const directorioPadre = path.join(__dirname, '..');
let guardarImagen = path.join(directorioPadre, '/public/uploads/imgLibros/');
let guardarPDF = path.join(directorioPadre, '/public/uploads/pdfLibros/');

// Configuración del almacenamiento de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define las carpetas para imágenes y PDFs
        if (file.mimetype.startsWith('image/')) {
            cb(null, guardarImagen); // Carpeta para imágenes
        } else if (file.mimetype === 'application/pdf') {
            cb(null, guardarPDF); // Carpeta para PDFs
        } else {
            cb(new Error('Tipo de archivo no soportado'), ''); // Manejo de errores si el archivo no es imagen ni PDF
        }
    },
    filename: function (req, file, cb) {
        // Usa el timestamp para evitar conflictos de nombres de archivos
        const timestamp = Date.now();
        const fileExtension = path.extname(file.originalname);
        const fileName = `${timestamp}-${path.basename(file.originalname, fileExtension)}${fileExtension}`;
        cb(null, fileName);
    }
})

// Crear un middleware de multer con la configuración de almacenamiento
const upload = multer({ storage: storage });

// Ruta para añadir un libro
router.post('/add-libro', validate.protegerRuta('') ,upload.array('files', 2) , async (req, res) => {
    try {
        const { titulo, id_autor, id_categoria, isbn, fecha_publicacion, id_genero, descripcion, activo } = req.body;
        let archivoPath;
        let avatarPath
        req.files.forEach(file => {
            if (file.mimetype.startsWith('image/')) {
                // Procesar imágenes
                 console.log(file);
                 avatarPath = file ? file.path : 'public/uploads/imgLibro/prede.png';
                
            } else if (file.mimetype === 'application/pdf') {
                // Procesar PDFs
                 archivoPath = file.path; // La ruta del archivo PDF subido
            }
        });

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
            imagen: avatarPath
        });

        // Guardar el libro en la base de datos
        
      
        const libroGuardado = await newBook.save();
        res.status(200).send({
            ok: true,
            resultado: libroGuardado
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al guardar el libro');
    }
});

// Ruta para obtener todos los libros
router.get('/', async (req, res) => {
    try {
      const libros = await Libro.find()
          .populate({
            path: 'id_autor',
            populate: [
              { path: 'generos' },  // Poblar generos dentro de Autor
              { path: 'libros' }    // Poblar libros dentro de Autor
            ]
          }) 
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
