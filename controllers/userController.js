const Usuario = require('../models/userModel.js');
const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');

let router = express.Router();
const validates = require('./validate-token');
const _ = require('underscore');
let TOKEN_SECRET = 'secreto';
router.use(express.json());

/*REGISTRO USUARIO SIENDO ADMIN*/
router.post('/registro', async(req, res) => {
    try {
        const password = await codifyPassword(req.body.password);
        const fotoPrede = 'public/uploads/avatar/prede.png'
        if (req.body.avatar != '') {
            let avatar = req.body.avatar;
            let base64Image = avatar.split(';base64,').pop();
            //TODO
            //CONSEGUIR EL TIPO DE LA IMAGEN Y AÑADIRSELO (.PNG/.JPG)
            let rutaImagen = 'avatar' + req.body.NOMBRE + Date.now() + '.png';

            const nuevoUsuario = new Usuario({
                DNI: req.body.DNI,
                NOMBRE: req.body.NOMBRE,
                APELLIDOS: req.body.APELLIDOS,
                EMAIL: req.body.EMAIL,
                PASSWORD: password,
                DIRECCION: req.body.DIRECCION,
                ID_POBLACION: req.body.ID_POBLACION,
                COD_POSTAL: req.body.COD_POSTAL,
                SEXO: req.body.SEXO,
                NUM_USUARIO: detUltimoNum,
            });

            if (req.body.SEXO === 'hombre') {
                titulo1 = 'Sr. ';
            } else if (req.body.SEXO === 'mujer') {
                titulo1 = 'Sra. ';
            } else {
                titulo1 = 'Sre. ';
            }
            nuevoUsuario.TITULO1 = titulo1;
            fs.writeFile('public/uploads/avatar/' + rutaImagen + base64Image, { encoding: 'base64' }, (error) => {
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
        } else {
            // Si no se envía ninguna imagen, asigna una imagen predeterminada
            const nuevoUsuario = new Usuario({
                DNI: req.body.DNI,
                NOMBRE: req.body.NOMBRE,
                APELLIDOS: req.body.APELLIDOS,
                EMAIL: req.body.EMAIL,
                PASSWORD: password,
                DIRECCION: req.body.DIRECCION,
                ID_POBLACION: req.body.ID_POBLACION,
                COD_POSTAL: req.body.COD_POSTAL,
                SEXO: req.body.SEXO,
                NUM_USUARIO: detUltimoNum,
                AVATAR: fotoPrede // Ruta a la imagen predeterminada
            });

            if (req.body.SEXO === 'hombre') {
                titulo1 = 'Sr. ';
            } else if (req.body.SEXO === 'mujer') {
                titulo1 = 'Sra. ';
            } else {
                titulo1 = 'Sre. ';
            }
            nuevoUsuario.TITULO1 = titulo1;

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



// Obtener todos los usuarios
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

// Crear un nuevo usuario
exports.createUser = async(req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const { DNI, NOMBRE, APELLIDOS, EMAIL, PASSWORD, DIRECCION, ID_POBLACION, COD_POSTAL, TITULO1, SEXO, IMAGEN } = req.body;
        let imagenUserPath;

        if (req.file) {
            // Leer el archivo y convertirlo a Base64
            const imagenBuffer = fs.readFileSync(req.file.path);
            const imagenBase64 = Buffer.from(imagenBuffer).toString('base64');
            imagenUserPath = `data:${req.file.mimetype};base64,${imagenBase64}`;

            // Eliminar el archivo después de obtener la cadena Base64
            fs.unlinkSync(req.file.path);
        }

        if (IMAGEN && IMAGEN.startsWith('data:image')) {
            // La imagen se envía en formato Base64, guardarla en la base de datos
            imagenUserPath = IMAGEN;
        } else {
            console.log(imagenUserPath)
            return res.status(400).json({ mensaje: 'NO ENCONTRAMOS NINGUNA IMAGEN', imagenUserPath });
        }
        if (!PASSWORD) {
            return res.status(400).json({ mensaje: 'Contraseña inexistente', PASSWORD });

        }
        console.log(req.body);
        // Verificar si el usuario ya existe en la base de datos
        const usuarioExistente = await UserModel.findOne({ DNI });

        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El usuario ya existe', usuarioExistente });
        }
        const ultimoNUM = await obtenerUltimoUsuario();
        const hashedPassword = await bcrypt.hash(PASSWORD, salt);

        console.log(ultimoNUM);

        // Crear un nuevo usuario
        const nuevoUsuario = new UserModel({
            DNI,
            NOMBRE,
            APELLIDOS,
            EMAIL,
            PASSWORD: hashedPassword,
            DIRECCION,
            ID_POBLACION,
            COD_POSTAL,
            TITULO1,
            SEXO,
            NUM_USUARIO: ultimoNUM,
            IMAGEN: imagenUserPath
        });

        // Guardar el usuario en la base de datos
        await nuevoUsuario.save();

        res.status(201).json({ mensaje: 'Usuario registrado correctamente:', nuevoUsuario });
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ mensaje: 'Error en el registro' });
    }
}

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
};


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