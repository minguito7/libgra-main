const Categoria = require('../models/categoriaModel');
const validate = require('./validate-token');
const express = require('express');
let router = express.Router();

async function obtenerUltimaCAt() {
    try {
        // Consultar todos los usuarios ordenados por el ID de manera descendente

        const allGenero = await Categoria.find();
        let ultimoCat = 1;
        allGenero.forEach(g => {
            //console.log(usuario);
            if (g.numCategoria > ultimoCat) {
                ultimoCat = g.numCategoria
            }
        });

        // Si se encontró un usuario, devolver su ID + 1, de lo contrario devolver 1
        if (ultimoCat > 0) {
            //console.log(ultimoUsuario);
            return ultimoCat + 1;
        } else {
            return 1; // Establecer el ID en 1 si no hay usuarios
        }
    } catch (error) {
        console.error('Error al obtener el último NUM de categoria:', error);
        throw error; // Puedes manejar el error según sea necesario en tu aplicación
    }
}

router.post('/add-categoria', validate.protegerRuta(['editor','soid','admin']) ,async (req, res) => {
    try {
        const { nombre } = req.body;
        
        // Verificar que el nombre está presente
        if (!nombre) {
            return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
        }
        let ultCat = await obtenerUltimaCAt();
        // Crear una nueva instancia del modelo
        const nuevaCategoria = new Categoria({nombre,ultCat});

        // Guardar la nueva población en la base de datos
        await nuevaCategoria.save();

        // Enviar una respuesta exitosa
        res.status(201).json({
            mensaje: 'Categoria creada exitosamente',
            poblacion: nuevaCategoria
        });
    } catch (error) {
        console.error('Error al crear categoria:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
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

module.exports = router;