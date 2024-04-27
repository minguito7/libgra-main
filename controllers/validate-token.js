const jwt = require('jsonwebtoken');
let TOKEN_SECRET = 'secreto';
// middleware to validate token (rutas protegidas)
let validaToken = (token) => {
    try {
        let resultado = jwt.verify(token, TOKEN_SECRET);
        console.log(resultado + 'lloran2');
        return resultado;
    } catch (error) {}
};



let protegerRuta = role => {
    return (req, res, next) => {
        let token = req.headers['authorization'];
        if (token) {
            token = token.substring(7);
            let resultado = validaToken(token);
            console.log(resultado);
            if (resultado && (role === "" || role === resultado.ROLE)) next();
            else res.send({ ok: false, error: "Usuario no autorizado" });
        } else res.send({ ok: false, error: "Usuario no autorizado" });
    }
};

module.exports = { protegerRuta: protegerRuta };