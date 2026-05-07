/*
 * ============================================================
 *  CINEVERSE - SERVIDOR EXPRESS
 * ============================================================
 *  Sirve el frontend estático y las APIs REST:
 *    - /api/auth/*      → Registro, login, perfil
 *    - /api/favorites/* → CRUD de favoritos
 *    - /api/tmdb/*      → Proxy TMDB (oculta la API Key)
 * ============================================================
 */

// Cargar variables de entorno desde .env
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDatabase, closeDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');
const tmdbRoutes = require('./routes/tmdb');

// ============================================================
//  CONFIGURACIÓN
// ============================================================
const PORT = process.env.PORT || 3000;
const app = express();

// ============================================================
//  MIDDLEWARE GLOBAL
// ============================================================

// CORS - permitir peticiones desde cualquier origen en desarrollo
app.use(cors());

// Parsear JSON en el body de las peticiones
app.use(express.json({ limit: '1mb' }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Logging simple de peticiones
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (req.path.startsWith('/api')) {
            console.log(
                `[${new Date().toLocaleTimeString()}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`
            );
        }
    });
    next();
});

// ============================================================
//  RUTAS DE API
// ============================================================

app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/tmdb', tmdbRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'CineVerse API funcionando correctamente',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// ============================================================
//  SPA FALLBACK - Todas las rutas no-API sirven index.html
// ============================================================
app.get('*', (req, res) => {
    // No interferir con rutas de API
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: 'Ruta de API no encontrada'
        });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================
//  MANEJO GLOBAL DE ERRORES
// ============================================================
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// ============================================================
//  INICIO DEL SERVIDOR
// ============================================================
async function startServer() {
    try {
        // Inicializar base de datos (async con sql.js)
        await initDatabase();

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('');
            console.log('╔══════════════════════════════════════════╗');
            console.log('║         🎬  CINEVERSE  v2.0  🎬         ║');
            console.log('╠══════════════════════════════════════════╣');
            console.log(`║  Servidor:  http://localhost:${PORT}        ║`);
            console.log(`║  API:       http://localhost:${PORT}/api   ║`);
            console.log('╚══════════════════════════════════════════╝');
            console.log('');
        });
    } catch (err) {
        console.error('❌ Error al iniciar el servidor:', err);
        process.exit(1);
    }
}

// Manejar cierre graceful
process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor...');
    closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', () => {
    closeDatabase();
    process.exit(0);
});

startServer();
