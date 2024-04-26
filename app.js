const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const auth = require('./controllers/authController.js');
const usuario = require('./controllers/userController.js');
const methodOverride = require('method-override');

const app = express();



// URL de conexión a la base de datos
const DB_URI = 'mongodb+srv://minguito0799:Ernano21@cluster0.6b7qgaf.mongodb.net/db_libfree?retryWrites=true&w=majority';

// Opciones de configuración de mongoose

// Conectar a la base de datos
mongoose.connect(DB_URI)
    .then(() => {
        console.log('Conexión exitosa a la base de datos');
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos:', err);
    });


app.use(cors());
app.use(express.json());

// Middleware para analizar cuerpos de solicitud
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

// Definir el puerto en el que escuchará la aplicación
const PORT = process.env.PORT || 3000; // Utiliza el puerto proporcionado por el entorno o 3000 si no se proporciona ninguno

app.use(express.static('/public/uploads'));
app.get('/', auth)
app.use('/auth', auth);
//app.use('/usuario', usuario);


// Escuchar en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});


module.exports = app;