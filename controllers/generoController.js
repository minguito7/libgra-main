const Genero = require('../models/generoModel');
const Libro = require('../models/libroModel');
const validate = require('./validate-token');
const express = require('express');
let router = express.Router();


async function obtenerUltimaGenero() {
    try {
        const ultimaCategoria = await Genero.find().sort({ numGenero: -1 }).limit(1);
        const nuevoNumero = ultimaCategoria.length > 0 ? ultimaCategoria[0].numGenero + 1 : 1;
        //console.log('Nuevo número de categoría:', nuevoNumero);
        return nuevoNumero;
      } catch (error) {
        console.error('Error al obtener la última genero:', error);
        throw error;
      }
}

router.post('/add-genero', validate.protegerRuta(['editor','soid','admin']) ,async (req, res) => {
    try {
        const { nombre } = req.body;
        console.log(nombre);
        let detUltGen = await obtenerUltimaGenero();
        // Verificar que el nombre está presente
        if (!nombre) {
            return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
        }

        // Crear una nueva instancia del modelo
        const nuevaGenero = new Genero({nombre: nombre,numGenero:detUltGen});

        // Guardar la nueva población en la base de datos
        await nuevaGenero.save();

        // Enviar una respuesta exitosa
        res.status(201).json({
            mensaje: 'Genero creada exitosamente',
            poblacion: nuevaGenero
        });
    } catch (error) {
        console.error('Error al crear genero:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

router.get('/', async (req, res) => {
    try {
      const genero = await Genero.find().exec(); // Ejecutar la consulta         
      if (genero.length > 0) {
          res.send({ ok: true, resultado: genero});
      } else {
          res.status(404).send({ ok: false, error: "No se encontraron generos" });
      }
  } catch (err) {
      res.status(500).send({
          ok: false,
          error: err.message
      });
  }
});

router.get('/:id', async (req, res) => {
    try {
      const bookId = req.params.id;
      const librosGeneroIndicado = [];
      const genero = await Genero.findById(bookId).exec(); // Ejecutar la consulta         
      const librosGeneros = await Libro.find().populate({
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
      .exec();

     
      librosGeneros.forEach((libro)=>{
        console.log('genero.id: '+genero.id);

        for(let i=0;i<libro.generos_libro.length;i++){
            console.log('libro.generos_libro: '+libro.generos_libro[i].nombre);
            if(libro.generos_libro[i].id == genero.id){
                librosGeneroIndicado.push(libro);
                console.log('NOMBRE: '+libro.generos_libro[i].nombre);
            }
        }

        
      });
      if (librosGeneroIndicado.length > 0) {
          res.send({ ok: true, resultado: librosGeneroIndicado, nombreGenero: genero.nombre});
      } else {
          res.status(404).send({ ok: false, error: "No se encontraron libros para ese genero" });
      }
  } catch (err) {
    console.log('ERROR: '+err)
      res.status(500).send({
          ok: false,
          error: 'ERROR: '+err.message
      });
      
  }
});


module.exports = router;