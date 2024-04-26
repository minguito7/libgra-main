const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel.js');

// Middleware para verificar el rol del usuario
exports.verificarAdmin = async (req, res, next) => {
    const usuario = req.usuario; // Suponiendo que tienes el usuario almacenado en el objeto de solicitud
    console.log(req.usuario);
    const user = await UserModel.findById(req.usuario.userId);
    console.log(user.ROLE);

    // Verificar si el usuario es administrador
    if (!user || user.ROLE !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso denegado. Solo los administradores pueden acceder a esta ruta.' });
    }

    // Si el usuario es administrador, permite el acceso a la ruta
    next();
};

exports.verificarPublicador = (req, res, next) => {
    const usuario = req.usuario; // Suponiendo que tienes el usuario almacenado en el objeto de solicitud

    // Verificar si el usuario es administrador
    if (!usuario || usuario.ROLE !== 'creador') {
        return res.status(403).json({ mensaje: 'Acceso denegado. Solo los administradores pueden acceder a esta ruta.' });
    }

    // Si el usuario es administrador, permite el acceso a la ruta
    next();
};


exports.verificarToken = (req, res, next) => {
    //console.log(req.headers.authorization )
    const token = req.headers.authorization;
    console.log(token)
    if (!token) {
        return res.status(401).json({ mensaje: 'Token de acceso no proporcionado' });
    }
    jwt.verify(token, 'secreto', (error, decodedToken) => {
        if (error) {
            return res.status(401).json({ mensaje: 'Token de acceso inválido' });
        }
        req.usuario = decodedToken; // Almacena la información del usuario en el objeto de solicitud
        next();
    });
};





/* Ejemplo de uso del middleware para proteger una ruta específica

app.get('/ruta-protegida', verificarRol('admin'), (req, res) => {
    // Esta función solo se ejecutará si el usuario tiene el rol de 'admin'
    res.json({ mensaje: 'Acceso permitido' });
});*/