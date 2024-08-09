const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
//
let router = express.Router();
const _ = require('underscore');
const Usuario = require('../models/userModel.js');
const multer = require('multer');
const sharp = require('sharp');

router.use(express.json());
let TOKEN_SECRET = 'secreto';
const directorioPadre = path.join(__dirname, '..');
let guardarImagen = path.join(directorioPadre, '/public/uploads/avatar/');



/* CODIFICAR EL PASSWORD */
async function codifyPassword(passwordBody) {
    try {
        if (!passwordBody) {
            throw new Error('No hay contraseña');
        }
        const saltos = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(passwordBody, saltos);

        return password;
    } catch (error) {
        throw error;
    }
}
/* DETERMINAR NAMEAPP, SI EXISTE UNO IGUAL DARLE OPCIONES DISTINTAS */
async function obtenerVariantesNickname(nickName) {
    const variantes = [];
    const maxVariantes = 5; // Número máximo de variantes sugeridas
    let suffix = 1;

    // Genera variantes hasta encontrar algunas disponibles
    while (variantes.length < maxVariantes) {
        const nuevoNickname = `${nickName}${suffix}`;
        const existe = await Usuario.findOne({ NAMEAPP: nuevoNickname });

        if (!existe) {
            variantes.push(nuevoNickname);
        }

        suffix++;
    }

    return variantes;
}


/* DETERMINAR EL ULTIMO NUMERO DE USUARIO REGISTRADO EN LA APP */


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

//-- lOGIN// Método para generar el token tras login correcto
let generarToken = (login, role) => {
    console.log(role);
    return jwt.sign({ login: login, role: role },
        TOKEN_SECRET, { expiresIn: 86400 });
};

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

/*REGISTRO USUARIO*/

router.post('/registro', upload.single('myFile'), async (req, res) => {
    try {
        const { DNI, NAMEAPP, PASSWORD, NOMBRE, APELLIDOS, EMAIL, DIRECCION, ID_POBLACION, COD_POSTAL, SEXO } = req.body;

        // Comprobar si el DNI ya existe
        const comprobacion_dni = await Usuario.findOne({ DNI });
        if (comprobacion_dni) {
            return res.status(400).send({
                ok: false,
                error: "Error, este DNI ya existe"
            });
        }

        // Comprobar si el nickname ya existe
        const comprobacion_nickname = await Usuario.findOne({ NAMEAPP });
        if (comprobacion_nickname) {
            const variantes = await obtenerVariantesNickname(NAMEAPP);
            return res.status(400).send({
                ok: false,
                error: "Error, este nickname ya existe",
                sugerencias: variantes
            });
        }

        // Codificar la contraseña
        const passwordCodificada = await codifyPassword(PASSWORD);

        // Obtener el último número de usuario
        const detUltimoNum = await obtenerUltimoUsuario();

        // Determinar el título según el sexo
        const titulo1 = titulos[SEXO.toLowerCase()] || 'Sre. ';

        // Determinar la ruta del avatar
        const avatarPath = req.file ? req.file.path : 'public/uploads/avatar/prede.png';

        // Crear un nuevo usuario
        const nuevoUsuario = new Usuario({
            DNI,
            NOMBRE,
            NAMEAPP,
            APELLIDOS,
            EMAIL: EMAIL.toLowerCase(),
            PASSWORD: passwordCodificada,
            DIRECCION,
            ID_POBLACION,
            COD_POSTAL,
            SEXO: SEXO.toLowerCase(),
            NUM_USUARIO: detUltimoNum,
            TITULO1: titulo1,
            AVATAR: avatarPath
        });

        // Guardar el nuevo usuario en la base de datos
        const usuarioGuardado = await nuevoUsuario.save();
        res.status(200).send({
            ok: true,
            resultado: usuarioGuardado
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ mensaje: 'Error en el registro' });
    }
});EMAIL

/*  LOGIN* 
router.post('/login', async(req, res) => {
    
    const usuario = await Usuario.findOne({ EMAIL: req.body.EMAIL });
    if (!usuario) return res.status(400).json({ error: 'Usuario no encontrado' });
    console.log(usuario);
    const passValida = await bcrypt.compare(req.body.PASSWORD, usuario.PASSWORD);
    if (!passValida) return res.status(400).json({ error: 'contraseña no válida' })

    if (usuario && passValida) {
        res.send({ ok: true, token: generarToken(usuario.EMAIL, usuario.ROLE) });
    } else {
        res.send({ ok: false });
    }


})*/
router.post('/login', async (req, res) => {
    try {
        const { EMAIL, PASSWORD } = req.body;

        // Buscar usuario por correo electrónico o nameapp
        const usuario = await Usuario.findOne({
            $or: [
                { EMAIL: EMAIL },
                { NAMEAPP: EMAIL } // Utilizamos el mismo campo para buscar por email o nameapp
            ]
        });

        if (!usuario) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        // Verificar la contraseña
        const passValida = await bcrypt.compare(PASSWORD, usuario.PASSWORD);
        if (!passValida) {
            return res.status(400).json({ error: 'Contraseña no válida' });
        }

        // Si las credenciales son válidas, generar y devolver el token
        const token = generarToken(usuario.EMAIL, usuario.ROLE);
        res.send({ ok: true, token });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ mensaje: 'Error en el login' });
    }
});

module.exports = router;
/* 

     try {
        const passwordCod = await codifyPassword(req.body.PASSWORD);
        const fotoPrede = 'public/uploads/avatar/prede.png';
        const detUltimoNum = await obtenerUltimoUsuario();

        console.log(req.body.AVATAR);
        if (req.body.AVATAR == '' | req.body.AVATAR == undefined) {
            // Si no se envía ninguna imagen, asigna una imagen predeterminada
            const nuevoUsuario = new Usuario({
                DNI: req.body.DNI,
                NOMBRE: req.body.NOMBRE,
                APELLIDOS: req.body.APELLIDOS,
                EMAIL: req.body.EMAIL.toLowerCase(),
                PASSWORD: passwordCod,
                DIRECCION: req.body.DIRECCION,
                ID_POBLACION: req.body.ID_POBLACION,
                COD_POSTAL: req.body.COD_POSTAL,
                SEXO: req.body.SEXO.toLowerCase(),
                NUM_USUARIO: detUltimoNum,
                AVATAR: fotoPrede // Ruta a la imagen predeterminada
            });

            if (req.body.SEXO.toLowerCase() === 'hombre') {
                titulo1 = 'Sr. ';
            } else if (req.body.SEXO.toLowerCase() === 'mujer') {
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
        } else {

            let avatar = req.body.AVATAR;
            let base64Image = avatar.split(';base64,').pop();
            //TODO
            //CONSEGUIR EL TIPO DE LA IMAGEN Y AÑADIRSELO (.PNG/.JPG)
            let rutaImagen = 'avatar' + req.body.NOMBRE + Date.now() + '.png';

            const nuevoUsuario = new Usuario({
                DNI: req.body.DNI,
                NOMBRE: req.body.NOMBRE,
                APELLIDOS: req.body.APELLIDOS,
                EMAIL: req.body.EMAIL,
                PASSWORD: passwordCod,
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

        }
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ mensaje: 'Error en el registro' });
    }
}) */