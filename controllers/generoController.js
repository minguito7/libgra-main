const Genero = require('../models/generoModel');
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

module.exports = router;