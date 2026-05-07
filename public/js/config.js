/*
 * ============================================================
 *  CONFIGURACIÓN DE TMDB
 * ============================================================
 * Para obtener tu propia API key:
 * 1. Regístrate en https://www.themoviedb.org/
 * 2. Ve a https://www.themoviedb.org/settings/api
 * 3. Solicita una API key (es gratuita)
 * 4. Reemplaza el valor de TMDB_API_KEY con tu key
 * ============================================================
 */

// ============================================================
//  CONFIGURACIÓN DEL BACKEND (API propia)
// ============================================================
const API_CONFIG = {
    // URL base del backend - detecta automáticamente el origen
    BASE_URL: (window.location.origin && window.location.origin !== 'null')
        ? window.location.origin + '/api'
        : 'http://localhost:3000/api',
};

// ============================================================
//  CONFIGURACIÓN DE TMDB
// ============================================================
const TMDB_CONFIG = {
    // ⚠️ REEMPLAZA ESTO CON TU PROPIA API KEY DE TMDB
    API_KEY: '33a501b9c8e2a08ae860499747f83a6f',

    BASE_URL: 'https://api.themoviedb.org/3',
    IMG_BASE: 'https://image.tmdb.org/t/p',

    // Tamaños de imagen disponibles
    POSTER_SIZES: {
        small: 'w185',
        medium: 'w342',
        large: 'w500',
        original: 'original'
    },

    BACKDROP_SIZES: {
        small: 'w780',
        large: 'w1280',
        original: 'original'
    },

    // Idioma por defecto
    LANGUAGE: 'es-ES',

    // Región por defecto
    REGION: 'ES'
};

/**
 * Obtiene la URL completa para una imagen de poster
 * @param {string} path - Ruta relativa de la imagen
 * @param {string} size - Tamaño (small, medium, large, original)
 * @returns {string} URL completa o placeholder
 */
TMDB_CONFIG.getPosterUrl = function(path, size = 'medium') {
    if (!path) return null;
    return `${this.IMG_BASE}/${this.POSTER_SIZES[size]}${path}`;
};

/**
 * Obtiene la URL completa para un backdrop
 * @param {string} path - Ruta relativa de la imagen
 * @param {string} size - Tamaño (small, large, original)
 * @returns {string} URL completa o placeholder
 */
TMDB_CONFIG.getBackdropUrl = function(path, size = 'large') {
    if (!path) return null;
    return `${this.IMG_BASE}/${this.BACKDROP_SIZES[size]}${path}`;
};
