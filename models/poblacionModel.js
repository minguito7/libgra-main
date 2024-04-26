const mongoose = require('mongoose');

// Esquema de población
const poblacionSchema = new mongoose.Schema({
    // Otros campos de la tabla poblacion
    nombre: { type: String, required: true },

});

const PoblacionModel = mongoose.model('Poblacion', poblacionSchema);
module.exports = PoblacionModel;
