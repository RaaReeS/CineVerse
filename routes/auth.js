/*
 * ============================================================
 *  RUTAS DE AUTENTICACIÓN
 * ============================================================
 *  POST /api/auth/register  - Registro de nuevo usuario
 *  POST /api/auth/login     - Inicio de sesión
 *  GET  /api/auth/me        - Obtener datos del usuario autenticado
 * ============================================================
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { dbGet, dbAll, dbRun } = require('../db');
const { authMiddleware, generateToken } = require('../middleware/auth');

const router = express.Router();

// ============================================================
//  POST /api/auth/register
// ============================================================
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validaciones
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios: username, email, password'
            });
        }

        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario debe tener entre 3 y 30 caracteres'
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de email inválido'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Verificar si el email ya existe
        const existingEmail = dbGet('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe una cuenta con este email'
            });
        }

        // Verificar si el username ya existe
        const existingUser = dbGet('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Este nombre de usuario ya está en uso'
            });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar usuario
        const result = dbRun(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        const userId = result.lastInsertRowid;

        // Generar token
        const user = { id: userId, username, email };
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente',
            token,
            user: {
                id: userId,
                username,
                email,
                avatar_url: null
            }
        });

    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al registrar usuario'
        });
    }
});

// ============================================================
//  POST /api/auth/login
// ============================================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son obligatorios'
            });
        }

        // Buscar usuario por email
        const user = dbGet('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email o contraseña incorrectos'
            });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email o contraseña incorrectos'
            });
        }

        // Generar token
        const token = generateToken({
            id: user.id,
            username: user.username,
            email: user.email
        });

        res.json({
            success: true,
            message: 'Inicio de sesión correcto',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url
            }
        });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al iniciar sesión'
        });
    }
});

// ============================================================
//  GET /api/auth/me
// ============================================================
router.get('/me', authMiddleware, (req, res) => {
    try {
        const user = dbGet(
            'SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (err) {
        console.error('Error al obtener usuario:', err);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;
