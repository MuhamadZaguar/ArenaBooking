const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    // Support both 'Authorization: Bearer <token>' and raw token in header
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    try {
        const decoded = jwt.verify(token, 'secretkey');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Token tidak valid'
        });
    }

};