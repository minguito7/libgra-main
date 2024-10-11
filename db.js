// db.js
const mongoose = require('mongoose');

const DB_URI = 'mongodb+srv://minguito0799:Ernano21@cluster0.6b7qgaf.mongodb.net/db_libfree?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
      await mongoose.connect(DB_URI);
      console.log('Conectado a la base de datos');
  } catch (error) {
      console.error('Error al conectar a la base de datos:', error);
      process.exit(1); // Salir del proceso si hay un error
  }
};

module.exports = connectDB;