/*
 * ============================================================
 *  PROXY DE TMDB - Oculta la API Key del lado del cliente
 * ============================================================
 *  Todas las peticiones a /api/tmdb/* se redirigen a la API
 *  de TMDB con la API Key desde el .env, evitando exponerla
 *  en el frontend.
 *
 *  Ejemplo:
 *    GET /api/tmdb/trending/all/week?page=1
 *    → https://api.themoviedb.org/3/trending/all/week?api_key=xxx&page=1
 * ============================================================
 */

const express = require('express');
const router = express.Router();

// ============================================================
//  CONFIGURACIÓN
// ============================================================
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Verificar que la API Key esté configurada al cargar el módulo
if (!TMDB_API_KEY || TMDB_API_KEY === 'TU_API_KEY_AQUI') {
    console.warn(
        '⚠️  TMDB_API_KEY no configurada en .env. ' +
        'Establece TMDB_API_KEY en tu archivo .env'
    );
}

// ============================================================
//  PROXY DINÁMICO - Captura cualquier ruta después de /api/tmdb
// ============================================================
router.get('*', async (req, res) => {
    try {
        // req.path viene como, ej: "/trending/all/week"
        const endpoint = req.path; // ej: "/trending/all/week"
        const fullUrl = `${TMDB_BASE_URL}${endpoint}`;

        // Construir query params: añadir api_key + language + region + lo que venga del cliente
        const params = new URLSearchParams({
            api_key: TMDB_API_KEY,
            language: process.env.TMDB_LANGUAGE || 'es-ES',
            region: process.env.TMDB_REGION || 'ES',
            ...Object.fromEntries(
                Object.entries(req.query).map(([k, v]) => [k, String(v)])
            )
        });

        const url = `${fullUrl}?${params.toString()}`;

        console.log(`[TMDB Proxy] GET ${endpoint}`);

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        // Devolver el mismo status code que TMDB
        res.status(response.status).json(data);

    } catch (err) {
        console.error('[TMDB Proxy] Error:', err.message);

        // Si el error es de conexión
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                status_message: 'No se puede conectar con TMDB. Verifica tu conexión a Internet.'
            });
        }

        res.status(500).json({
            success: false,
            status_message: 'Error interno del proxy TMDB'
        });
    }
});

module.exports = router;
