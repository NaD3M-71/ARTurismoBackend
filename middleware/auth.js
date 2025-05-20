const jwt = require('jsonwebtoken');


module.exports = (req,res,next) =>{
    // autorizacion mediante el header
    const authHeader = req.get('Authorization');

    if(!authHeader) {
        const error = new Error('no autenticado, no hay JWT');
        error.statusCode = 401;
        throw error;
    }
    // obtener token y verificar
    const token = authHeader.split(' ')[1];
    let revisarToken;
    try {
        revisarToken = jwt.verify(token, process.env.SECRETKEY)
    } catch (error) {
        error.statusCode = 500
        throw error;
    }
    // Si el token es valido pero hay errores
    if(!revisarToken){
        const error = new Error('No autenticado');
        error.statusCode = 401;
        throw error;
    }

    next();
}