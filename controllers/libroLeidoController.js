const LibroLeidoModel = require('../models/librosLeidosModel.js');

exports.addReadBook = async (req, res) => {
  const { id_usuario, id_libro } = req.body;

  try {
    const newReadBook = new LibroLeidoModel({
      id_usuario,
      id_libro
    });

    await newReadBook.save();
    res.status(201).send('Libro leído añadido con éxito');
  } catch (error) {
    console.error(error);
    res.status(500).send('Hubo un error al añadir el libro leído');
  }
};

exports.deleteReadBook = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedReadBook = await LibroLeidoModel.findByIdAndDelete(id);
      if (!deletedReadBook) {
        return res.status(404).send('Libro leído no encontrado');
      }
      res.status(200).send('Libro leído eliminado correctamente');
    } catch (error) {
      console.error(error);
      res.status(500).send('Hubo un error al eliminar el libro leído');
    }
  };

  exports.getReadBook = async (req, res) => {
    const { id } = req.params;
  
    try {
      const readBook = await LibroLeidoModel.findById(id);
      if (!readBook) {
        return res.status(404).send('Libro leído no encontrado');
      }
      res.status(200).json(readBook);
    } catch (error) {
      console.error(error);
      res.status(500).send('Hubo un error al buscar el libro leído');
    }
  };

  exports.getAllReadBooks = async (req, res) => {
    try {
      const readBooks = await LibroLeidoModel.find();
      res.status(200).json(readBooks);
    } catch (error) {
      console.error(error);
      res.status(500).send('Hubo un error al obtener los libros leídos');
    }
  };
//Ver todos los usuarios que han leído un libro
  exports.getUsersWhoReadBook = async (req, res) => {
    const { id_libro } = req.params;
  
    try {
      const users = await LibroLeidoModel.find({ id_libro }).populate('id_usuario');
      if (!users) {
        return res.status(404).send('No se encontraron usuarios que hayan leído este libro');
      }
      res.status(200).json(users.map(user => user.id_usuario));
    } catch (error) {
      console.error(error);
      res.status(500).send('Hubo un error al obtener los usuarios que han leído el libro');
    }
  };

//Ver todos los LIBROS que ha leído un USUARIO
  exports.getBooksReadByUser = async (req, res) => {
    const { id_usuario } = req.params;
  
    try {
      const books = await LibroLeidoModel.find({ id_usuario }).populate('id_libro');
      if (!books) {
        return res.status(404).send('No se encontraron libros leídos por este usuario');
      }
      res.status(200).json(books.map(book => book.id_libro));
    } catch (error) {
      console.error(error);
      res.status(500).send('Hubo un error al obtener los libros leídos por el usuario');
    }
  };

  //Ver todos los LIBROS que ha leído un USUARIO
  exports.getBooksReadByUser = async (req, res) => {
    const { id_usuario } = req.params;
  
    try {
      const books = await LibroLeidoModel.find({ id_usuario }).populate('id_libro');
      if (!books) {
        return res.status(404).send('No se encontraron libros leídos por este usuario');
      }
      res.status(200).json(books.map(book => book.id_libro));
    } catch (error) {
      console.error(error);
      res.status(500).send('Hubo un error al obtener los libros leídos por el usuario');
    }
  };