
const mongoose = require('mongoose');

const categoriaModel = new mongoose.Schema({
    
    nombre: { type: String, required: true },
    numCategoria: { type: Number }
});

const CategoriaModel = mongoose.model('Categoria', categoriaModel);
module.exports = CategoriaModel;
