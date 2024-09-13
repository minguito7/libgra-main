
const mongoose = require('mongoose');

const generoModel = new mongoose.Schema({
    nombre: { type: String, required: true },
    numGenero: { type: Number }

});

const GeneroModel = mongoose.model('Genero', generoModel);
module.exports = GeneroModel;
