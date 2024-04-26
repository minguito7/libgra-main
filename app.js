const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');


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
  
// Importar las rutas
const userRoutes = require('./routes/userRoutes.js');
const authRoutes = require('./routes/authRoutes.js');

//const librosRoutes = require('./routes/librosRoutes.js');


const app = express();

app.use(cors());
// Middleware para analizar cuerpos de solicitud
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rutas
app.use('/users', userRoutes);
app.use('/auth', authRoutes);

//app.use('./libros', librosRoutes);


// Manejador de errores para rutas no encontradas
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Manejador de errores genérico
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

// Definir el puerto en el que escuchará la aplicación
const PORT = process.env.PORT || 3000; // Utiliza el puerto proporcionado por el entorno o 3000 si no se proporciona ninguno

// Escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});


module.exports = app;
