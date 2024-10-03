const Categoria = require('../models/categoriaModel');
const Libro = require('../models/libroModel');

const validate = require('./validate-token');
const express = require('express');
let router = express.Router();

async function obtenerUltimaCategoria() {
    try {
        const ultimaCategoria = await Categoria.find().sort({ num_categoria: -1 }).limit(1);
        const nuevoNumero = ultimaCategoria.length > 0 ? ultimaCategoria[0].num_categoria + 1 : 1;
        //console.log('Nuevo número de categoría:', nuevoNumero);
        return nuevoNumero;
      } catch (error) {
        console.error('Error al obtener la última categoría:', error);
        throw error;
      }
}

router.post('/add-categoria', validate.protegerRuta(['editor','soid','admin']) ,async (req, res) => {
    try {
        const { nombre } = req.body;
        
        // Verificar que el nombre está presente
        if (!nombre) {
            return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
        }
        const num_categoria = await obtenerUltimaCategoria();
        // Verifica que numCategoria no sea null o undefined
        if (num_categoria == null) {
          throw new Error('No se pudo obtener un número válido para la categoría.');
        }
        const nuevaCategoria = new Categoria({
          nombre: nombre,
          num_categoria: num_categoria
        });
        await nuevaCategoria.save();
        console.log('Categoría creada con éxito:', nuevaCategoria);
      } catch (error) {
        console.error('Error al crear la categoría:', error);
        throw error;
      }
});

router.get('/', async (req, res) => {
    try {
      const categoria = await Categoria.find().exec(); // Ejecutar la consulta         
      if (categoria.length > 0) {
          res.send({ ok: true, resultado: categoria});
      } else {
          res.status(404).send({ ok: false, error: "No se encontraron categorias" });
      }
  } catch (err) {
      res.status(500).send({
          ok: false,
          error: err.message
      });
  }
});

router.get('/libros/:id', async (req, res) => {
    try {
        const categoria = req.params.id
        const libros = await Libro.find({activo: true}).populate({
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
          .exec();;
        //console.log('Categoria: '+categoria);

        const librosCategoria = [];
        
        for (let z = 0; z < libros.length; z++) {  // Cambia <= por <
            if (libros[z] && libros[z].categorias_libro) {
                for (let i = 0; i < libros[z].categorias_libro.length; i++) {  // Cambia <= por <
                    let encontrado = libros[z].categorias_libro[i]?.id;  // Usa el operador opcional ?. para evitar undefined
                    if (categoria === encontrado) {
                        librosCategoria.push(libros[z]);
                    }
                }
            }
        }
        
            
        
        //console.log('Libros: '+ librosCategoria);
        if(librosCategoria){          
            res.send({ ok: true, resultado: librosCategoria});

        }else{
            res.status(404).send({ ok: false, error: "No se encontraron libros de esa categoria" });

        }

    }
    catch(err) {
      res.status(500).send({
          ok: false,
          error: err.message
      });
    }
});

module.exports = router;