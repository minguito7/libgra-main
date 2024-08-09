
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
const titulos = {
    'hombre': 'Sr. ',
    'mujer': 'Sra. ',
    'otro': 'Sre. '
};
const directorioPadre = path.join(__dirname, '..');
let guardarImagen = path.join(directorioPadre, '/public/uploads/avatar/');


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
router.post('/registro-admin', validate.protegerRuta(''), upload.single('myFile'), async(req, res) => {
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
router.get('/', validate.protegerRuta(''), (req, res) => {
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

//RECUPERAR TODOS LOS USUARIOS ACTIVOS
router.get('/activos', validate.protegerRuta(''), (req, res) => {
    Usuario.find({ ACTIVO: true }).then(x => {
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
//RECUPERAR TODOS LOS USUARIOS NO ACTIVOS - false
router.get('/desactivos', validate.protegerRuta(''), (req, res) => {
    Usuario.find({ ACTIVO: false }).then(x => {
        if (x.length > 0) {
            res.send({ ok: guardarImagenrue, resultado: x });
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


//RECUPERAR UN USUARIO
router.get('/:id', validate.protegerRuta(''), async(req, res) => {
    try {
        const id = req.params._id;
        const usuario = await Usuario.findOne({ id });
        //console.log(usuario);
        if (usuario) {
            res.send({ ok: true, resultado: usuario });
        } else {
            res.status(404).send({ ok: false, error: "No se encontró ningún usuario" });
        }
    } catch (error) {
        res.status(500).send({ ok: false, error: "Error al buscar el usuario" });
    }
});

//MODIFICAR USUARIO (NAME / EMAIL)
router.put('/edit-profile/:id', validate.protegerRuta(''), async(req, res) => {
    const id = req.params.id; // Asegúrate de que estás usando 'id' en lugar de '_id' si ese es el nombre del parámetro en la URL
    let body = _.pick(req.body, ['NOMBRE', 'APELLIDOS', 'EMAIL', 'DIRECCION', 'ID_POBLACION', 'COD_POSTAL', 'SEXO']);

    // Filtrar propiedades no definidas
    Object.keys(body).forEach(key => {
        if (body[key] === undefined) {
            delete body[key];
        }
    });

    try {
        const actualizarTitulo = titulos[req.body.SEXO.toLowerCase()] || 'Sre. ';
        body.TITULO1 = actualizarTitulo

        const usuarioActualizado = await Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();

        if (!usuarioActualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json({
            ok: true,
            usuario: usuarioActualizado
        });
    } catch (err) {
        res.status(400).json({
            ok: false,
            error: err
        });
    }
});

//MODIFICAR USUARIO (PASSWORD)
router.post('/edit-password/:id', validate.protegerRuta(''), async(req, res) => {
    let id = req.params.id;
    let passEncriptada = await codifyPassword(req.body.PASSWORD);

    try {
        const passActualizadaUsu = await Usuario.findByIdAndUpdate(id, { $set: { PASSWORD: passEncriptada } }, { new: true, runValidators: true }).lean();
        if (!passActualizadaUsu) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json({
            ok: true,
            usuario: passActualizadaUsu
        });
    } catch (err) {
        res.status(400).json({
            ok: false,
            error: err
        });
    }

});

/* BORRAR USUARIO - ACTUALIZAR ESTADO ACTIVO A false */
router.put('/edit-activo/:id', validate.protegerRuta(''), async(req, res) => {
    try {
        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            req.params.id, { $set: { ACTIVO: false } }, { new: true, runValidators: true }
        ).lean();

        if (!usuarioActualizado) {
            return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
        }
        res.json({ ok: true, mensaje: 'Usuario desactivado correctamente', usuario: usuarioActualizado });
    } catch (error) {
        console.error('Error desactivando el usuario:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al desactivar el usuario', error });
    }
});


//MODIFICAR USUARIO (AVATAR)
router.post('/modify-avatar/:id', upload.single('myFile'), async(req, res) => {
    try {
        // Validar que se haya enviado un archivo
        if (!req.file) {
            return res.status(400).send({
                ok: false,
                error: "Por favor, sube un archivo"
            });
        }

        // Buscar al usuario por su DNI o por algún identificador único
        const usuario = await Usuario.findOne({ id: req.body.id });
        console.log(req.body.id);
        if (!usuario) {
            return res.status(404).send({
                ok: false,
                error: "Usuario no encontrado"
            });
        }

        // Actualizar el avatar del usuario
        usuario.AVATAR = req.file.path;
        await usuario.save();

        res.status(200).send({
            ok: true,
            mensaje: "Avatar actualizado correctamente",
            resultado: usuario
        });
    } catch (error) {
        console.error('Error al cambiar el avatar:', error);
        res.status(500).json({ mensaje: 'Error al cambiar el avatar' });
    }
});

module.exports = router;