const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const validate = require('./validate-token');
const Libro  = require('../models/libroModel.js'); // Asegúrate de que esta ruta es correcta
const { PDFDocument, rgb } = require('pdf-lib');

const TOKEN_SECRET = 'secreto';
const Usuario = require('../models/userModel.js');
const Autor = require('../models/autorModel.js');
const Categoria = require('../models/categoriaModel.js');
const Genero  = require('../models/generoModel.js');
const Resena  = require('../models/resenaModel.js');
const directorioPadre = path.join(__dirname, '..');
let guardarImagen = path.join(directorioPadre+'/public/uploads/imgLibros/');
let guardarPDFOriginales = path.join(directorioPadre+'/public/uploads/pdfLibrosOriginales');
let guardarPDF = path.join(directorioPadre+'/public/uploads/pdfLibrosLogo');

// Configuración de la URL base desde las variables de entorno
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function obtenerUsuario(req) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        throw new Error('Autorización no proporcionada');
    }
    
    const token = authHeader.split(' ')[1]; // Se espera el formato "Bearer <token>"
    if (!token) {
        throw new Error('Token no proporcionado');
    }

    let decoded;

    try {
        decoded = jwt.verify(token, TOKEN_SECRET);
        
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
   

    return decoded;
}


// Configuración del almausuariocenamiento de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define las carpetas para imágenes y PDFs
        if (file.mimetype.startsWith('image/')) {
            cb(null, guardarImagen); // Carpeta para imágenes
        } else if (file.mimetype === 'application/pdf') {
            cb(null, guardarPDFOriginales); // Carpeta para PDFs
        } else {
            cb(new Error('Tipo de archivo no soportado')); // Manejo de errores si el archivo no es imagen ni PDF
        }
    },
    filename: async function (req, file, cb) {
        try {
            // Obtener el usuario del token
            const tokenUsu = await obtenerUsuario(req);
            
            // Utiliza un caché para almacenar los datos del usuario
            const userCache = req.userCache || {};
            let user;
            
            if (userCache[tokenUsu.login]) {
                user = userCache[tokenUsu.login];
            } else {
                // Primero, intenta buscar por email
                user = await Usuario.findOne({ EMAIL: tokenUsu.login });
        
                // Si no se encuentra por email, intenta buscar por nameapp (si se dispone del valor)
                if (!user && tokenUsu.nameapp) {
                    user = await Usuario.findOne({ NAMEAPP: tokenUsu.nameapp });
                }

                if (user) {
                    userCache[tokenUsu.login] = user;
                    req.userCache = userCache;
                }
            }
            let random = Math.floor(Math.random() * (1 - 1000 + 1)) + 1;
            // Usa el timestamp para evitar conflictos de nombres de archivos
            const timestamp = Date.now();
            const date = new Date(timestamp);

            const year = date.getFullYear(); // Obtiene el año (e.g., 2024)
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Obtiene el mes (0-11, por eso se suma 1)
            const day = String(date.getDate()).padStart(2, '0'); // Obtiene el día del mes

            const formattedDate = `${year}-${month}-${day}`; 
            const fileExtension = path.extname(file.originalname);
            const fileName = user 
                ? `${formattedDate}-${random}-${user.NAMEAPP}-${user.NUM_USUARIO}-${path.basename(file.originalname, fileExtension)}${fileExtension}`
                : `${formattedDate}-${random}-${path.basename(file.originalname, fileExtension)}${fileExtension}`; // Si no se encuentra el usuario
            
            cb(null, fileName);
        } catch (error) {
            // Manejar errores aquí
            cb(new Error(`Error al obtener usuario: ${error.message}`));
        }
    }
});


// Crear un middleware de multer con la configuración de almacenamiento
const upload = multer({ storage: storage });



async function validarPDF(pdfPath) {
    try {
        // Leer el archivo PDF
        const pdfBytes = fs.readFileSync(pdfPath);

        // Intentar cargar el PDF
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Verificar si el PDF está encriptado
        if (pdfDoc.isEncrypted) {
            throw new Error('El PDF está encriptado. No se puede procesar.');
        }

        // Verificar que el PDF tenga al menos 2 páginas
        if (pdfDoc.getPageCount() < 2) {
            throw new Error('El PDF debe tener al menos dos páginas.');
        }

        // Verificar que no tenga errores estructurales comunes
        const pages = pdfDoc.getPages();
        pages.forEach(page => {
            if (!page) {
                throw new Error('El PDF tiene una página corrupta.');
            }
        });

        // Si pasa todas las comprobaciones, devolver true
        return true;
    } catch (error) {
        throw new Error(`PDF no válido: ${error.message}`);
    }
}

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
    secondPage.drawText('URL PÁGINA WEB', {
        x: x + imgWidth + margin, // Posiciona el texto a la derecha de la imagen
        y: y + imgHeight / 2 - 10, // Centrar el texto verticalmente con respecto a la imagen
        size: 12,
        color: rgb(0, 0, 0), // Color del texto (negro)
    });

    // Guardar el PDF modificado
    const modifiedPdfBytes = await pdfDoc.save();
   

    // Extrae el nombre original del archivo y crea una nueva ruta en el directorio de salida
    const originalFileName = path.basename(pdfPath, path.extname(pdfPath));
    const modifiedPdfPath = path.join(guardarPDF, `${originalFileName}_libgra.pdf`);

    // Guardar el PDF modificado en la nueva ruta
    fs.writeFileSync(modifiedPdfPath, modifiedPdfBytes);

    return modifiedPdfPath;
}

/*
    INDICE
GET LIBROS - 52 -199
GET ARCHIVO PDF - 159



*/
router.get('/novedades-libros', async (req, res) => {
    try {
      const libros = await Libro.find().sort({ createdAt: -1 }) // Ordenar por fecha de creación en orden descendente
          .limit(6) // Limitar los resultados a los últimos 5 libros    
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

// Definir la ruta con parámetro de usuario
router.get('/activos/:userId', async (req, res) => {
    try {
        // Extraer el `userId` del parámetro de ruta
        const userId = req.params.userId;

        // Construir la consulta
        const query = { activo: true, added_usuario: userId };

        const libros = await Libro.find(query)
            .populate({
                path: 'id_autor',
                populate: [
                    { path: 'generos_autor' },  // Poblar generos dentro de Autor
                    { path: 'libros_autor' }    // Poblar libros dentro de Autor
                ]
            }) 
            .populate('categorias_libro') // Poblar datos de la categoría
            .populate('generos_libro') // Poblar datos del género
            .populate('resenas_libro') 
            .populate('added_usuario')
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

// Ruta para obtener todos los libros - NO ACTIVOS
router.get('/no-activos', validate.protegerRuta('soid'), async (req, res) => {
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

//Ruta para añadir un libro
router.post('/add-libro', validate.protegerRuta('editor'), upload.array('files', 2), async (req, res) => {
    try {
        const { titulo, id_autor, id_categoria, isbn, fecha_publicacion, id_genero, descripcion, activo } = req.body;
        let archivoPath;// Ruta para obtener los últimos 5 libros añadidos
        let avatarPath;      
        const imagenesPredeterminadas = [
            'imgLibros/portadaPrede1.jpeg',
            'imgLibros/portadaPrede2.jpeg',
            'imgLibros/portadaPrede3.jpeg'
        ];
        let portadaPrede;

        req.files.forEach(file => {
            if (file.mimetype.startsWith('image/')) {
                // Procesar imágenes

                avatarPath = file.path;
                const baseDir = 'imgLibros';
                const baseDirIndex = avatarPath.indexOf(baseDir);
                console.log("aquiiiiii portada: "+ baseDirIndex);
                
                if (baseDirIndex !== -1) {
                    const relativePath = avatarPath.substring(baseDirIndex + baseDir.length);
                    avatarPath = path.join(baseDir, relativePath);

                    console.log("Imagen subida: " + avatarPath);
                }
            } else if (file.mimetype === 'application/pdf') {
                // Procesar PDFs
                archivoPath = file.path; // La ruta del archivo PDF subido
                
            }
        });

        // Esperar a que se procesen todos los archivos
        await Promise.all(req.files.map(async (file) => {
            if (file.mimetype === 'application/pdf') {
                await validarPDF(file.path);
                // Añadir la marca de agua a la segunda página del PDF
                const logoPath = 'public/logos/logoLibGra-Proto1.png'; // Ruta a tu logo para la marca de agua
                archivoPath = await addImageWatermark(file.path, logoPath);
                const baseDir2 = 'pdfLibrosLogo';
                const baseDirIndex2 = archivoPath.indexOf(baseDir2);

                if (baseDirIndex2 !== -1) {
                    const relativePath2 = archivoPath.substring(baseDirIndex2 + baseDir2.length);
                    archivoPath = path.join(baseDir2, relativePath2);

                    console.log("Archivo subida: " + archivoPath);
                }
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

        const autorr = await Autor.findById({_id: id_autor});

          // Buscar el autor
          if (!autorr) {
              return res.status(404).json({ mensaje: 'Autor no encontrado' });
          }
          
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

        // Añadir el nuevo libro al array libros_autor del autor
        
        autorr.libros_autor.push(libroGuardado._id);
        await autorr.save();
        
        

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

// Ruta para obtener los últimos 5 libros añadidos





// Ruta para actualizar un libro
router.put('/edit-libro/:id', validate.protegerRuta('editor'), upload.array('files', 2), async (req, res) => {
    try {home
        const { titulo, id_autor, id_categoria, isbn, fecha_publicacion, id_genero, descripcion, activo } = req.body;
        let archivoPath;
        let avatarPath;

        const imagenesPredeterminadas = [
            'public/uploads/imgLibro/portadaPrede1.png',
            'public/uploads/imgLibro/portadaPrede2.png',
            'public/uploads/imgLibro/portadaPrede3.png'
        ];

        // Buscar el libro existente por su ID
        const libroExistente = await Libro.findById(libroId);
        if (!libroExistente) {
            return res.status(404).send('Libro no encontrado');
        }
        const usuToken = await obtenerUsuario(req);
        user = await Usuario.findOne({ EMAIL: usuToken.login });
        // Si no se encuentra por email, intenta buscar por nameapp (si se dispone del valor)
        if (!user && usuToken.nameapp) {
            user = await Usuario.findOne({ NAMEAPP: usuToken.nameapp });
        }    

        if(user.id != libroExistente.added_usuario || user.ROLE != 'admin' || user.ROLE != 'soid'){
            return res.status(404).send('NO eres el usuario que ha añadido el libro, ni tienes privilegios para hacerlo');
        }
    

        req.files.forEach(file => {
            if (file.mimetype.startsWith('image/')) {
                avatarPath = file.path;
                console.log("Imagen subida: " + avatarPath);
            } else if (file.mimetype === 'application/pdf') {
                archivoPath = file.path;
            }
        });

        // Procesar y añadir la marca de agua al PDF si fue subido
        if (archivoPath) {
            await validarPDF(archivoPath);
            const logoPath = 'public/logos/logoLibGra-Proto1.png';
            archivoPath = await addImageWatermark(archivoPath, logoPath);
        }

        // Si no se subió ninguna nueva imagen, mantener la existente
        if (!avatarPath) {
            avatarPath = libroExistente.portada;
        }

        // Si no se subió ninguna nueva imagen y la existente es predeterminada, mantenerla como está
        if (!avatarPath && !libroExistente.portada) {
            const indiceAleatorio = Math.floor(Math.random() * imagenesPredeterminadas.length);
            avatarPath = imagenesPredeterminadas[indiceAleatorio];
        }

        // Actualizar los campos del libro con los nuevos valores proporcionados
        libroExistente.titulo = titulo || libroExistente.titulo;
        libroExistente.id_autor = id_autor || libroExistente.id_autor;
        libroExistente.id_categoria = id_categoria || libroExistente.id_categoria;
        libroExistente.isbn = isbn || libroExistente.isbn;
        libroExistente.fecha_publicacion = fecha_publicacion || libroExistente.fecha_publicacion;
        libroExistente.id_genero = id_genero || libroExistente.id_genero;
        libroExistente.descripcion = descripcion || libroExistente.descripcion;
        libroExistente.activo = activo !== undefined ? activo : libroExistente.activo;
        libroExistente.archivo = archivoPath || libroExistente.archivo;
        libroExistente.portada = avatarPath || libroExistente.portada;

        // Guardar los cambios en la base de datos
        const libroActualizado = await libroExistente.save();

        res.status(200).send({
            ok: true,
            resultado: libroActualizado
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al editar el libro');
    }
});


// Ruta para eliminar un libro
router.delete('/delete/:id', validate.protegerRuta('editor'), async (req, res) => {
    const { id } = req.params;
    let user;
    try {
        const usuToken = await obtenerUsuario(req);
        user = await Usuario.findOne({ EMAIL: usuToken.login });
        // Si no se encuentra por email, intenta buscar por nameapp (si se dispone del valor)
        if (!user && usuToken.nameapp) {
            user = await Usuario.findOne({ NAMEAPP: usuToken.nameapp });
        }
        
        const libro = await Libro.findById(req.params.id).exec();

        if(user.id == libro.added_usuario || user.ROLE == 'admin' || user.ROLE == 'soid'){
            // Intentar actualizar el libro y establecer el campo 'activo' a false
            const updatedBook = await Libro.findByIdAndUpdate(
                id,
                { activo: false }, // Actualiza el campo 'activo' a false
                { new: true } // Devuelve el documento modificado
            );

            // Verificar si el libro fue encontrado y actualizado
            if (!updatedBook) {
                return res.status(404).send('Libro no encontrado');
            }
            res.status(200).send('Libro desactivado correctamente');
        }
        else{
            return res.status(404).send('No puedes borrar este libro ya que no eres el editor. Tampoco eres Administrador');
        }
       
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al desactivar el libro');
    }
});


module.exports = router;
