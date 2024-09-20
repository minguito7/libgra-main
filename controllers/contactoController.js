const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
require('dotenv').config();
const accountTransport = require("./../account-transport.json");

// Configuración de la función para crear el transportador de correo con OAuth2
const mail_libgra = async (callback) => {
    const oauth2Client = new OAuth2(
        accountTransport.auth.clientId,
        accountTransport.auth.clientSecret,
        "https://developers.google.com/oauthplayground",
    );
    
    oauth2Client.setCredentials({
        refresh_token: accountTransport.auth.refreshToken,
        tls: {
            rejectUnauthorized: false
        }
    });
    
    oauth2Client.getAccessToken((err, token) => {
        if (err) {
            return console.log('Error obteniendo el access token', err);
        }
        accountTransport.auth.accessToken = token;
        callback(nodemailer.createTransport(accountTransport));
    });
};

// Ruta POST para enviar el correo
router.post('/send', (req, res) => {
    const { nombre, apellidos, telefono, email, sugerencia } = req.body; // Recibe los datos del front

    // Verificar que todos los campos están presentes
    if (!nombre || !apellidos || !telefono || !email || !sugerencia) {
        return res.status(400).json({ message: 'Faltan datos del formulario' });
    }
  
    // Crear el correo electrónico con los datos recibidos
    mail_libgra((emailTransporter) => {
        const mailOptions = {
            from: `${nombre} ${apellidos} <${email}>`,  // Correo del remitente
            to: 'libgra.registro@gmail.com',  // Destinatario
            subject: 'Nuevo mensaje de contacto',  // Asunto del correo
            html: `
                <h2>Nuevo mensaje de contacto</h2>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Apellidos:</strong> ${apellidos}</p>
                <p><strong>Teléfono:</strong> ${telefono}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Sugerencia/Descripción: </strong> ${sugerencia}</p>
            `,  // Contenido HTML del correo con los datos del formulario
        };

        // Enviar el correo
        emailTransporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error enviando el correo:', error);
                return res.status(500).json({ message: 'Error enviando el correo' });
            }
            console.log('Correo enviado:', info.response);
            res.status(200).json({ message: 'Correo enviado con éxito' });
        });
    });
});

module.exports = router;
