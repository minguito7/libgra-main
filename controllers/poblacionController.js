const PoblacionModel = require('../models/poblacionModel');

const express = require('express');
let router = express.Router();

async function obtenerUltimaPoblacion() {
    try {
        // Consultar todos los usuarios ordenados por el ID de manera descendente

        const allGenero = await PoblacionModel.find();
        let ultimoGenero = 1;


        allGenero.forEach(g => {
            //console.log(usuario);
            if (g.numGenero > ultimoGenero) {
                ultimoGenero = g.numGenero
            }
        });

        // Si se encontró un usuario, devolver su ID + 1, de lo contrario devolver 1
        if (ultimoGenero > 0) {
            //console.log(ultimoUsuario);
            return ultimoGenero + 1;
        } else {
            return 1; // Establecer el ID en 1 si no hay usuarios
        }
    } catch (error) {
        console.error('Error al obtener el último NUM de genero:', error);
        throw error; // Puedes manejar el error según sea necesario en tu aplicación
    }
}


router.post('/add-poblacion', async (req, res) => {
    try {
        const { nombre } = req.body;
        console.log(nombre);
        let detUltPob = await obtenerUltimaPoblacion();

        // Verificar que el nombre está presente
        if (!nombre) {
            return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
        }
        console.log(detUltPob)
        // Crear una nueva instancia del modelo
        const nuevaPoblacion = new PoblacionModel({nombre: nombre.toLowerCase(),numPoblacion:detUltPob});

        // Guardar la nueva población en la base de datos
        await nuevaPoblacion.save();

        // Enviar una respuesta exitosa
        res.status(201).json({
            mensaje: 'Población creada exitosamente',
            poblacion: nuevaPoblacion
        });
    } catch (error) {
        console.error('Error al crear población:', error.errorResponse.errmsg);
        res.status(500).json({ mensaje: 'Error al crear población:' + error.errorResponse.errmsg });
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