const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const path = require('path');
const auth = require('./controllers/authController.js');
const usuario = require('./controllers/userController.js');
const libros = require('./controllers/libroController.js');
const librosLeidos = require('./controllers/libroLeidoController.js');
const poblacion = require('./controllers/poblacionController.js');
const genero = require('./controllers/generoController.js');
const autor = require('./controllers/autorController.js');
const categoria = require('./controllers/categoriaController.js');
const contacto = require('./controllers/contactoController.js');

const methodOverride = require('method-override');
const cors = require('cors');
const app = express();
// función middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public/uploads')));
app.use(cors({
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Kuma-Revision'], 
}));
// Configuración de la URL base desde las variables de entorno
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Ruta para servir archivos estáticos
// Configura el middleware para servir archivos estáticos



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


// Permitir solicitudes desde el frontend (por ejemplo, localhost:4200)

app.use(express.json());


// Configurar body-parser para permitir tamaños de cuerpo más grandes
app.use(express.json({ limit: '50mb' })); // Ajusta el tamaño según sea necesario
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

// Definir el puerto en el que escuchará la aplicación
const PORT = process.env.PORT || 3000; // Utiliza el puerto proporcionado por el entorno o 3000 si no se proporciona ninguno
app.get('/', libros);
app.use('/auth', auth);
app.use('/usuarios', usuario);
app.use('/libros', libros);
app.use('/libros-leidos', librosLeidos);
app.use('/poblaciones', poblacion);
app.use('/generos', genero);
app.use('/autores', autor);
app.use('/categorias', categoria);
app.use('/contacto',contacto);

// Escuchar en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});


module.exports = app;