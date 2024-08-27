const PoblacionModel = require('../models/poblacionModel');

const express = require('express');
let router = express.Router();

router.post('/add-poblacion', async (req, res) => {
    try {
        const { nombre } = req.body;
        console.log(nombre);
        // Verificar que el nombre está presente
        if (!nombre) {
            return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
        }

        // Crear una nueva instancia del modelo
        const nuevaPoblacion = new PoblacionModel({nombre});

        // Guardar la nueva población en la base de datos
        await nuevaPoblacion.save();

        // Enviar una respuesta exitosa
        res.status(201).json({
            mensaje: 'Población creada exitosamente',
            poblacion: nuevaPoblacion
        });
    } catch (error) {
        console.error('Error al crear población:', error);
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
});

router.get('/', async (req, res) => {
    try {
      const poblacion = await PoblacionModel.find().exec(); // Ejecutar la consulta         
      if (poblacion.length > 0) {
          res.send({ ok: true, resultado: poblacion});
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

module.exports = router;