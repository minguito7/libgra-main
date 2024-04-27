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




/*REGISTRO USUARIO SIENDO ADMIN*/
// Crear un nuevo usuario
router.post('/registro-admin', validate.protegerRuta('admin'), async(req, res) => {
    try {

        let titulo1;
        const password = await codifyPassword(req.body.PASSWORD);
        const detUltimoNum = await obtenerUltimoUsuario();

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

        if (req.body.AVATAR == '' || req.body.AVATAR == undefined) {


            // Si no se envía ninguna imagen, asigna una imagen predeterminada
            nuevoUsuario.AVATAR = fotoPrede;

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
        } else {
            let avatar = req.body.AVATAR;
            let base64Image = avatar.split(';base64,').pop();


            // TODO
            //FALTA DETERMINAR EL TIPO DE LA IMAGEN
            let rutaImagen = Date.now() + 'avatar' + req.body.NOMBRE + '.png';
            // Comprimir la imagen antes de guardarla
            const compressedImage = await sharp(Buffer.from(base64Image, 'base64'))
                .resize({ width: 300 }) // Redimensionar la imagen si es necesario
                .jpeg({ quality: 80 }) // Comprimir la imagen JPEG al 80% de calidad
                .toBuffer();

            //GUARDAR LA IMAGEN EN UN DIRECTORIO
            fs.writeFile('public/uploads/avatar/' + rutaImagen + compressedImage, { encoding: 'base64' }, (error) => {
                nuevoUsuario.AVATAR = 'public/uploads/avatar/' + rutaImage;
                nuevoUsuario.then(x => {

                    res.status(200).send({
                        ok: true,
                        resultado: x
                    })
                }).catch(err => {
                    res.status(400).send({
                        ok: false,
                        error: "Error guardando la foto del el usuario" + err
                    });
                });

            });
        }
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ mensaje: 'Error en el registro' });
    }
})



// Obtener todos los usuarios
/*
exports.getAllUsers = async(req, res) => {
    try {
        const users = await UserModel.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener un usuario por su ID
exports.getUserById = async(req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// Actualizar un usuario existente
exports.updateUser = async(req, res) => {
    try {
        const { userId } = req.params;
        let updatedUserData = req.body;

        // Verificar si se está enviando una nueva imagen de usuario
        if (req.file) {
            // Si hay una nueva imagen, actualiza la ruta de la imagen en los datos del usuario
            updatedUserData.foto = req.file.path;
        }

        // Actualizar el usuario en la base de datos
        const user = await UserModel.findByIdAndUpdate(userId, updatedUserData, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un usuario existente
exports.deleteUser = async(req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        user.ACTIVO = 0;
        await user.save();
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};*/

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

        const allUsuarios = await UserModel.find();
        let ultimoUsuario = 1;
        allUsuarios.forEach(usuario => {
            console.log(usuario);
            if (usuario.NUM_USUARIO > ultimoUsuario) {
                ultimoUsuario = usuario.NUM_USUARIO
            }
        });

        // Si se encontró un usuario, devolver su ID + 1, de lo contrario devolver 1
        if (ultimoUsuario > 0) {
            console.log(ultimoUsuario);
            return ultimoUsuario + 1;
        } else {
            return 1; // Establecer el ID en 1 si no hay usuarios
        }
    } catch (error) {
        console.error('Error al obtener el último NUM de usuario:', error);
        throw error; // Puedes manejar el error según sea necesario en tu aplicación
    }
}

module.exports = router;