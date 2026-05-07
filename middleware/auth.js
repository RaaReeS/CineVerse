/*
 * ============================================================
 *  MIDDLEWARE DE AUTENTICACIÓN JWT
 * ============================================================
 *  Verifica el token JWT en el header Authorization
 *  y añade los datos del usuario a req.user
 * ============================================================
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'CineVerse_Secret_Key_2026_!CambiaEsto!';

/**
 * Middleware que verifica el token JWT
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Token de autenticación requerido'
        });
    }

    // Esperamos formato: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
            success: false,
            message: 'Formato de token inválido. Usa: Bearer <token>'
        });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email
        };
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Inicia sesión nuevamente.'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Token inválido o corrupto'
        });
    }
}

/**
 * Genera un token JWT para un usuario
 */
function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

module.exports = { authMiddleware, generateToken, JWT_SECRET };
