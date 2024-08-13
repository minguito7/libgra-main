const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const validate = require('./validate-token');
const Libro  = require('../models/libroModel.js'); // Asegúrate de que esta ruta es correcta
const { PDFDocument, rgb } = require('pdf-lib');

const Usuario = require('../models/userModel.js');
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

async function loadPdf(pdfPath) {
    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
      //console.log('El archivo PDF es válido.');
      return pdfDoc;
    } catch (error) {
      console.error('Error al cargar el archivo PDF:', error.message);
      throw error; // Re-lanzar el error después de registrarlo
    }
  }

// Función para añadir una marca de agua con un logo a un PDF
/*async function addImageWatermark(pdfPath, logoPath) {
    try {
      const pdfDoc = await loadPdf(pdfPath);
      //console.log('El archivo PDF es válido.');
  
      // Leer el logo para la marca de agua
      const logoBuffer = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBuffer); // Usa embedJpg si el logo es JPG
  
      // Obtener las páginas del PDF
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawImage(logoImage, {
          x: width / 4,
          y: height / 4,
          width: 200,
          height: 200,
          opacity: 0.5
        });
      });
  
      // Guardar el PDF modificado
      const modifiedPdfBytes = await pdfDoc.save();
  
      // Escribir el PDF modificado a un archivo
      const modifiedPdfPath = pdfPath.replace('.pdf', '-modified.pdf');
      fs.writeFileSync(modifiedPdfPath, modifiedPdfBytes);
  
      return modifiedPdfPath;
  
    } catch (error) {
      console.error('Error al añadir la marca de agua al PDF:', error.message);
      throw error;
    }
  }*/

// Función para añadir una marca de agua al PDF - addImageWatermark
// Función para añadir una marca de agua al PDF solo en la segunda página
async function addImageWatermark(pdfPath, imagePath) {
    // Leer el archivo PDF
    const pdfBytes = fs.readFileSync(pdfPath);

    // Intentar cargar el PDF, ignorando la encriptación si es necesario
    let pdfDoc;
    try {
        pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    } catch (error) {
        throw new Error(`No se pudo cargar el PDF. Asegúrate de que no esté encriptado o protegido: ${error.message}`);
    }

    // Obtener todas las páginas del PDF
    const pages = pdfDoc.getPages();

    // Verificar si hay al menos dos páginas
    if (pages.length < 2) {
        throw new Error('El PDF debe tener al menos dos páginas para añadir la imagen y el texto.');
    }

    // Obtener la segunda página
    const secondPage = pages[1];

    // Leer y embeder la imagen
    const imageBytes = fs.readFileSync(imagePath);
    const image = await pdfDoc.embedPng(imageBytes);

    // Definir el tamaño de la imagen
    const imgWidth = 50; // Ancho de la imagen
    const imgHeight = 50; // Alto de la imagen

    // Calcular las coordenadas para la esquina superior izquierda
    const margin = 10; // Margen desde la esquina superior izquierda
    const x = margin;
    const y = secondPage.getHeight() - imgHeight - margin; // Ajusta la coordenada Y para el margen superior

    // Añadir la imagen en la esquina superior izquierda con tamaño definido
    secondPage.drawImage(image, {
        x,
        y,
        width: imgWidth,
        height: imgHeight,
        opacity: 0.5
    });

    // Añadir texto a continuación de la imagen
    secondPage.drawText('www.libgra.es', {
        x: x + imgWidth + margin, // Posiciona el texto a la derecha de la imagen
        y: y + imgHeight / 2 - 10, // Centrar el texto verticalmente con respecto a la imagen
        size: 12,
        color: rgb(0, 0, 0), // Color del texto (negro)
    });

    // Guardar el PDF modificado
    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedPdfPath = pdfPath.replace('.pdf', '_modified.pdf');
    fs.writeFileSync(modifiedPdfPath, modifiedPdfBytes);

    return modifiedPdfPath;
}

/*
    INDICE
GET LIBROS - 52 -199
GET ARCHIVO PDF - 159



*/


// Ruta para obtener todos los libros - ACTIVOS
router.get('/', async (req, res) => {
    try {
      const libros = await Libro.find({activo: true})
          .populate({
            path: 'id_autor',
            populate: [
              { path: 'generos_autor' },  // Poblar generos dentro de Autor
              { path: 'libros_autor' }    // Poblar libros dentro de Autor
            ]
          }) 
          .populate('categorias_libro') // Poblar datos de la categoría
          .populate('generos_libro')// Poblar datos del género
          .populate('resenas_libro') 
          .populate('added_usuario')
          .exec(); // Ejecutar la consulta

        const libros_no_activos = await Libro.find({activo: false})
          .populate({
            path: 'id_autor',
            populate: [
              { path: 'generos_autor' },  // Poblar generos dentro de Autor
              { path: 'libros_autor' }    // Poblar libros dentro de Autor
            ]
          }) 
          .populate('categorias_libro') // Poblar datos de la categoría
          .populate('generos_libro')// Poblar datos del género
          .populate('resenas_libro') 
          .populate('added_usuario')
          .exec(); // Ejecutar la consulta

      if (libros.length > 0) {
          res.send({ ok: true, resultado: {ACTIVOS: libros, NO_ACTIVOS: libros_no_activos }});
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

// Ruta para obtener todos los libros - ACTIVOS
router.get('/activos', async (req, res) => {
    try {
      const libros = await Libro.find({activo: true})
          .populate({
            path: 'id_autor',
            populate: [
              { path: 'generos_autor' },  // Poblar generos dentro de Autor
              { path: 'libros_autor' }    // Poblar libros dentro de Autor
            ]
          }) 
          .populate('categorias_libro') // Poblar datos de la categoría
          .populate('generos_libro')// Poblar datos del género
          .populate('resenas_libro') 
          .populate('added_usuario')
          .exec(); // Ejecutar la consulta

         
      if (libros.length > 0) {
          res.send({ ok: true, resultado: libros});
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

// Ruta para obtener todos los libros - NO ACTIVOS
router.get('/activos', async (req, res) => {
    try {
      const libros = await Libro.find({activo: false})
          .populate({
            path: 'id_autor',
            populate: [
              { path: 'generos_autor' },  // Poblar generos dentro de Autor
              { path: 'libros_autor' }    // Poblar libros dentro de Autor
            ]
          }) 
          .populate('categorias_libro') // Poblar datos de la categoría
          .populate('generos_libro')// Poblar datos del género
          .populate('resenas_libro') 
          .populate('added_usuario')
          .exec(); // Ejecutar la consulta

         
      if (libros.length > 0) {
          res.send({ ok: true, resultado: libros});
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

// Ruta para descargar el archivo del libro
router.get('/descargar-libro/:id', validate.protegerRuta(''), async (req, res) => {
    try {
        const libroId = req.params.id;

        // Buscar el libro en la base de datos por su ID
        const libro = await Libro.findById(libroId);

        if (!libro || libro.activo == false) {
            return res.status(404).send({
                ok: false,
                mensaje: 'Libro no encontrado'
            });
        }

        // Obtener la ruta del archivo
        const archivoPath = libro.archivo;

        // Comprobar si el archivo existe en awaitel servidor
        if (!archivoPath || !fs.existsSync(archivoPath)) {
            return res.status(404).send({
                ok: false,
                mensaje: 'Archivo no encontrado o no existe'
            });
        }

        // Enviar la ruta para descargar el archivo
        res.download(path.resolve(archivoPath), (err) => {
            if (err) {
                console.error('Error al descargar el archivo:', err);
                return res.status(500).send({
                    ok: false,
                    mensaje: 'Error al descargar el archivo'
                });
            }
        });

    } catch (error) {
        console.error('Error en la descarga del archivo:', error);
        res.status(500).send('Hubo un error al descargar el archivo');
    }
});

/* Ruta para añadir un libro*/
router.post('/add-libro', validate.protegerRuta(''), upload.array('files', 2), async (req, res) => {
    try {
        const { titulo, id_autor, id_categoria, isbn, fecha_publicacion, id_genero, descripcion, activo } = req.body;
        let archivoPath;
        let avatarPath;

        const imagenesPredeterminadas = [
            'public/uploads/imgLibro/portadaPrede1.png',
            'public/uploads/imgLibro/portadaPrede2.png',
            'public/uploads/imgLibro/portadaPrede3.png'
        ];
        let portadaPrede;

        req.files.forEach(file => {
            if (file.mimetype.startsWith('image/')) {
                // Procesar imágenes
                avatarPath = file.path;
                console.log("Imagen subida: " + avatarPath);
            } else if (file.mimetype === 'application/pdf') {
                // Procesar PDFs
                archivoPath = file.path; // La ruta del archivo PDF subido
            }
        });

        // Esperar a que se procesen todos los archivos
        await Promise.all(req.files.map(async (file) => {
            if (file.mimetype === 'application/pdf') {
                // Añadir la marca de agua a la segunda página del PDF
                const logoPath = 'public/logos/logoLibGra-Proto1.png'; // Ruta a tu logo para la marca de agua
                archivoPath = await addImageWatermark(file.path, logoPath);
            }
        }));

        // Si no se subió ninguna imagen, asignar una portada predeterminada aleatoria
        if (!avatarPath) {
            const indiceAleatorio = Math.floor(Math.random() * imagenesPredeterminadas.length);
            avatarPath = imagenesPredeterminadas[indiceAleatorio];
            console.log("Portada predeterminada asignada: " + avatarPath);
        }

        const token_add = req.header('Authorization').split(' ');
        const usuario = validate.obtenerUsuarioDesdeToken(token_add[1]);
        const find_usuario = await Usuario.find({ EMAIL: usuario });
        const added_usuario = find_usuario[0]._id;

        // Crear una nueva instancia del modelo de libro con los datos
        const newBook = new Libro({
            titulo,
            added_usuario,
            id_autor,
            id_categoria,
            isbn,
            fecha_publicacion,
            id_genero,
            descripcion,
            activo,
            archivo: archivoPath, // Usa la ruta del PDF modificado
            portada: avatarPath
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


// Ruta para obtener un libro específico
router.get('/:id', validate.protegerRuta(''), async (req, res) => {
    const { id } = req.params;
    try {
        const book = await Libro.findById(id);
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
