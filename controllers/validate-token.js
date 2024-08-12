const jwt = require('jsonwebtoken');
let TOKEN_SECRET = 'secreto';
// middleware to validate token (rutas protegidas)
let validaToken = (token) => {
    try {
        let resultado = jwt.verify(token, TOKEN_SECRET);
        return resultado;
    } catch (error) {}
};



let protegerRuta = rolesPermitidos => {
    return (req, res, next) => {
        let token = req.headers['authorization'];

        if (!token) return res.send({ ok: false, error: "Token no proporcionado" });

        token = token.substring(7);
        let resultado = validaToken(token);

        if (!resultado) return res.send({ ok: false, error: "Token inválido" });

        if (Array.isArray(rolesPermitidos)) {
            if (!rolesPermitidos.includes("") && !rolesPermitidos.includes(resultado.role)) {
                return res.send({ ok: false, error: `Usuario no autorizado, roles necesarios: ${rolesPermitidos.join(', ')}` });
            }
        } else {
            if (rolesPermitidos !== "" && rolesPermitidos !== resultado.role) {
                return res.send({ ok: false, error: `Usuario no autorizado, rol necesario: ${rolesPermitidos}` });
            }
        }
        next();
    };
};

function obtenerUsuarioDesdeToken(token) {
    try {
        const decoded = jwt.verify(token, TOKEN_SECRET); // Verifica y decodifica el token

        console.log(decoded); // Esto te mostrará todo el payload del token

        // Accede al campo correcto. Por ejemplo, si deseas obtener el login:
        return decoded.login; // O el campo que necesites, por ejemplo, decoded.role

    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null; // Devuelve null si hay un error al decodificar el token
    }
}

module.exports = { protegerRuta: protegerRuta, obtenerUsuarioDesdeToken: obtenerUsuarioDesdeToken };