const { LibroModel } = require('../models/libroModel.js');

exports.addBook = async (req, res) => {
    try {
      // Obtener los datos del formulario
      const { titulo, id_autor, id_categoria, isbn, fecha_publicacion, id_genero, descripcion, activo } = req.body;
  
      let archivoPath;
      let imagenBase64;
  
      // Si se envía un archivo de imagen
      if (req.file && req.file.mimetype.startsWith('image')) {
        // Leer el archivo de imagen
        const imageData = fs.readFileSync(req.file.path);
        
        // Convertir la imagen a base64
        imagenBase64 = `data:${req.file.mimetype};base64,${imageData.toString('base64')}`;
  
        // Eliminar el archivo temporal subido
        fs.unlinkSync(req.file.path);
      } else if (req.body.imagen.startsWith('data:image')) {
        // Si la imagen ya se envió en formato base64
        imagenBase64 = req.body.imagen;
      }
  
      // Si se envía un archivo PDF
      if (req.file && req.file.mimetype === 'application/pdf') {
        // Generar un nombre de archivo único para el PDF
        const pdfFileName = req.file.originalname + `.pdf`;
        const pdfFilePath = path.join(__dirname, './public/uploads/pdf', pdfFileName);
        
        // Mover el archivo PDF a la carpeta de uploads
        fs.renameSync(req.file.path, pdfFilePath);
        
        // Establecer la ruta del archivo en la variable archivo
        archivoPath = pdfFilePath;
      }
  
      // Crear una nueva instancia del modelo de libro con los datos
      const newBook = new LibroModel({
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
  
      // Enviar una respuesta de éxito
      res.status(201).send('Libro guardado con éxito');
    } catch (error) {
      // Manejar errores
      console.error(error);
      res.status(500).send('Hubo un error al guardar el libro');
    }
  };

exports.getAllBooks = async (req, res) => {
    try {
      const books = await LibroModel.find();
      res.status(200).json(books);
    } catch (error) {
      console.error(error);
      res.status(500).send('Hubo un error al obtener los libros');
    }
  };

  exports.getBook = async (req, res) => {
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
  };

  exports.deleteBook = async (req, res) => {
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
  };
