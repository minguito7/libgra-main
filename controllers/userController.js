const Usuario = require('../models/userModel.js');
const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const validates = require('./validate-token.js');
let router = express.Router();
const validate = require('./validate-token');
const _ = require('underscore');
const sharp = require('sharp');
let TOKEN_SECRET = 'secreto';
router.use(express.json());
const path = require('path');
const multer = require('multer');



/* SUBIR EL AVATAR A UNA CARPETA */
const storage = multer.diskStorage({

    destination: function(req, file, cb) {
        cb(null, guardarImagen)
    },
    filename: function(req, file, cb) {
        // console.log(file);

        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({ storage: storage });
//upload.single('myFile');

const uploadAvatar = (req, res) => {
    res.send({ data: 'Enviar un archivo' })
}

/* CODIFICAR EL PASSWORD */
async function codifyPassword(passwordBody) {
    const saltos = await bcrypt.genSalt(10);
    let password;
    return password = await bcrypt.hash(passwordBody, saltos);
}
/*OBTENER ULTIMO USUARIO DEL SISTEMA */
async function obtenerUltimoUsuario() {
    try {
        // Consultar todos los usuarios ordenados por el ID de manera descendente

        const allUsuarios = await Usuario.find();
        let ultimoUsuario = 1;
        allUsuarios.forEach(usuario => {
            //console.log(usuario);
            if (usuario.NUM_USUARIO > ultimoUsuario) {
                ultimoUsuario = usuario.NUM_USUARIO
            }
        });

        // Si se encontró un usuario, devolver su ID + 1, de lo contrario devolver 1
        if (ultimoUsuario > 0) {
            //console.log(ultimoUsuario);
            return ultimoUsuario + 1;
        } else {
            return 1; // Establecer el ID en 1 si no hay usuarios
        }
    } catch (error) {
        console.error('Error al obtener el último NUM de usuario:', error);
        throw error; // Puedes manejar el error según sea necesario en tu aplicación
    }
}

/*REGISTRO USUARIO SIENDO ADMIN*/
// Crear un nuevo usuario
router.post('/registro-admin', validate.protegerRuta('lector'), upload.single('myFile'), async(req, res) => {
    try {
        comprobacion_dni = await Usuario.find({ DNI: req.body.DNI });

        if (comprobacion_dni != '') {
            res.status(400).send({
                ok: false,
                error: "Error este DNI ya existe"
            });
        } else {

            let titulo1;
            const password = await codifyPassword(req.body.PASSWORD);
            const detUltimoNum = await obtenerUltimoUsuario();
            //console.log(req.file);
            const fotoPrede = 'public/uploads/avatar/prede.png';

            // Crear un nuevo usuario
            const nuevoUsuario = new Usuario({
                DNI: req.body.DNI,
                NOMBRE: req.body.NOMBRE,
                APELLIDOS: req.body.APELLIDOS,
                EMAIL: req.body.EMAIL.toLowerCase(),
                PASSWORD: password,
                DIRECCION: req.body.DIRECCION,
                ID_POBLACION: req.body.ID_POBLACION,
                COD_POSTAL: req.body.COD_POSTAL,
                SEXO: req.body.SEXO.toLowerCase(),
                NUM_USUARIO: detUltimoNum,
            });
            if (req.body.SEXO.toLowerCase() === 'hombre') {
                titulo1 = 'Sr. ';
            } else if (req.body.SEXO.toLowerCase() === 'mujer') {
                titulo1 = 'Sra. ';
            } else {
                titulo1 = 'Sre. ';
            }
            nuevoUsuario.TITULO1 = titulo1;
            if (req.file == '' || req.file == undefined || req.file == null) {
                // Si no se envía ninguna imagen, asigna una imagen predeterminada
                nuevoUsuario.AVATAR = fotoPrede;
            } else {
                nuevoUsuario.AVATAR = req.file.path;
            }
            nuevoUsuario.save().then(x => {
                res.status(200).send({
                    ok: true,
                    resultado: x
                });
            }).catch(err => {
                res.status(400).send({
                    ok: false,
                    error: "Error guardando el usuario" + err
                });
            });
        }
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ mensaje: 'Error en el registro' });
    }
})

/* ENVIAR TODOS LOS USUARIOS */
router.get('/', (req, res) => {
    Usuario.find().then(x => {
        if (x.length > 0) {
            res.send({ ok: true, resultado: x });
        } else {
            res.status(500).send({ ok: false, error: "No se encontro ningun usuario" })
        }
    }).catch(err => {
        res.status(500).send({
            ok: false,
            error: err
        });
    });
});


module.exports = router;