const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        return res.status(401).json({
            mensaje: 'No autenticado, no hay JWT'
        });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            mensaje: 'No autenticado, token inválido'
        });
    }

    try {
        const revisarToken = jwt.verify(token, process.env.SECRETKEY);
        req.user = revisarToken;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                mensaje: 'Token expirado'
            });
        }
        return res.status(401).json({
            mensaje: 'Token inválido'
        });
    }
};
