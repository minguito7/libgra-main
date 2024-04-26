const mongoose = require('mongoose');

// URL de conexión a la base de datos
const DB_URI = 'mongodb+srv://minguito0799:Ernano21@cluster0.6b7qgaf.mongodb.net/db_libfree?retryWrites=true&w=majority';

// Opciones de configuración de mongoose
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Conectar a la base de datos
mongoose.connect(DB_URI, mongooseOptions)
  .then(() => {
    console.log('Conexión exitosa a la base de datos');
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err);
  });

module.exports = mongoose;