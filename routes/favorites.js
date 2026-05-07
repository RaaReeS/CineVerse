/*
 * ============================================================
 *  RUTAS DE FAVORITOS
 * ============================================================
 *  GET    /api/favorites    - Obtener todos los favoritos del usuario
 *  POST   /api/favorites    - Añadir un favorito
 *  DELETE /api/favorites/:id - Eliminar un favorito
 *  GET    /api/favorites/check/:tmdbId/:mediaType - Verificar si es favorito
 * ============================================================
 */

const express = require('express');
const { dbGet, dbAll, dbRun } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ============================================================
//  GET /api/favorites
//  Obtiene todos los favoritos del usuario autenticado
// ============================================================
router.get('/', (req, res) => {
    try {
        const favorites = dbAll(
            `SELECT id, tmdb_id, media_type, title, poster_path, year, vote_average, created_at
             FROM favorites
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            favorites
        });

    } catch (err) {
        console.error('Error al obtener favoritos:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener favoritos'
        });
    }
});

// ============================================================
//  POST /api/favorites
//  Añade un nuevo favorito
// ============================================================
router.post('/', (req, res) => {
    try {
        const { tmdb_id, media_type, title, poster_path, year, vote_average } = req.body;

        if (!tmdb_id || !media_type || !title) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios: tmdb_id, media_type, title'
            });
        }

        if (!['movie', 'tv'].includes(media_type)) {
            return res.status(400).json({
                success: false,
                message: 'media_type debe ser "movie" o "tv"'
            });
        }

        // Verificar si ya existe
        const existing = dbGet(
            'SELECT id FROM favorites WHERE user_id = ? AND tmdb_id = ? AND media_type = ?',
            [req.user.id, tmdb_id, media_type]
        );

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Este contenido ya está en tus favoritos',
                favorite_id: existing.id
            });
        }

        // Insertar favorito
        const result = dbRun(
            `INSERT INTO favorites (user_id, tmdb_id, media_type, title, poster_path, year, vote_average)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                tmdb_id,
                media_type,
                title,
                poster_path || null,
                year || null,
                vote_average || null
            ]
        );

        const favorite = dbGet('SELECT * FROM favorites WHERE id = ?', [result.lastInsertRowid]);

        res.status(201).json({
            success: true,
            message: 'Añadido a favoritos',
            favorite
        });

    } catch (err) {
        console.error('Error al añadir favorito:', err);
        res.status(500).json({
            success: false,
            message: 'Error al añadir a favoritos'
        });
    }
});

// ============================================================
//  DELETE /api/favorites/:id
//  Elimina un favorito por su ID
// ============================================================
router.delete('/:id', (req, res) => {
    try {
        // Verificar que el favorito pertenece al usuario
        const fav = dbGet(
            'SELECT id FROM favorites WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!fav) {
            return res.status(404).json({
                success: false,
                message: 'Favorito no encontrado o no te pertenece'
            });
        }

        dbRun('DELETE FROM favorites WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Eliminado de favoritos'
        });

    } catch (err) {
        console.error('Error al eliminar favorito:', err);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar de favoritos'
        });
    }
});

// ============================================================
//  GET /api/favorites/check/:tmdbId/:mediaType
//  Verifica si un contenido está en favoritos
// ============================================================
router.get('/check/:tmdbId/:mediaType', (req, res) => {
    try {
        const fav = dbGet(
            'SELECT id FROM favorites WHERE user_id = ? AND tmdb_id = ? AND media_type = ?',
            [req.user.id, req.params.tmdbId, req.params.mediaType]
        );

        res.json({
            success: true,
            is_favorite: !!fav,
            favorite_id: fav ? fav.id : null
        });

    } catch (err) {
        console.error('Error al verificar favorito:', err);
        res.status(500).json({
            success: false,
            message: 'Error al verificar favorito'
        });
    }
});

module.exports = router;
