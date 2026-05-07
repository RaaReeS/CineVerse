/*
 * ============================================================
 *  AUTH - Módulo de autenticación en el frontend
 * ============================================================
 *  Gestiona registro, login, sesión con JWT,
 *  y expone funciones para el resto de la app.
 * ============================================================
 */

'use strict';

const Auth = (() => {
    // ============================================================
    //  ESTADO INTERNO
    // ============================================================
    let _currentUser = null;
    let _token = null;
    let _listeners = [];

    // ============================================================
    //  INICIALIZACIÓN
    // ============================================================
    function init() {
        _loadSession();
    }

    // ============================================================
    //  GESTIÓN DEL TOKEN (localStorage)
    // ============================================================
    function _saveSession(token, user) {
        try {
            localStorage.setItem('cineverse_token', token);
            localStorage.setItem('cineverse_user', JSON.stringify(user));
        } catch (e) { /* ignore */ }
        _token = token;
        _currentUser = user;
        _notify();
    }

    function _loadSession() {
        try {
            const token = localStorage.getItem('cineverse_token');
            const userStr = localStorage.getItem('cineverse_user');
            if (token && userStr) {
                _token = token;
                _currentUser = JSON.parse(userStr);
                _notify();
            }
        } catch (e) {
            _clearSession();
        }
    }

    function _clearSession() {
        try {
            localStorage.removeItem('cineverse_token');
            localStorage.removeItem('cineverse_user');
        } catch (e) { /* ignore */ }
        _token = null;
        _currentUser = null;
        _notify();
    }

    // ============================================================
    //  SISTEMA DE NOTIFICACIÓN (para que app.js se entere)
    // ============================================================
    function _notify() {
        const user = _currentUser;
        const token = _token;
        _listeners.forEach(fn => {
            try {
                fn(user, token);
            } catch (e) {
                console.warn('[Auth] Error en listener:', e);
            }
        });
    }

    function onAuthChange(fn) {
        _listeners.push(fn);
        // Notificar inmediatamente con el estado actual
        if (_currentUser || _token) {
            try { fn(_currentUser, _token); } catch (e) { /* ignore */ }
        }
        return () => {
            _listeners = _listeners.filter(f => f !== fn);
        };
    }

    // ============================================================
    //  HEADER DE AUTORIZACIÓN
    // ============================================================
    function _authHeaders() {
        if (!_token) return {};
        return {
            'Authorization': `Bearer ${_token}`,
            'Content-Type': 'application/json'
        };
    }

    // ============================================================
    //  PETICIONES A LA API DEL BACKEND
    // ============================================================
    async function _apiFetch(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;

        // Construir headers combinando Content-Type + Auth + opciones
        const headers = {
            'Content-Type': 'application/json',
            ..._authHeaders(),
            ...(options.headers || {})
        };

        // Construir config explícitamente (evitar que ...options sobrescriba headers)
        const config = {
            method: options.method || 'GET',
            headers,
            body: options.body || undefined
        };

        console.log('[API]', config.method, url);

        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            const err = new Error(data.message || `Error ${response.status}`);
            err.status = response.status;
            err.data = data;
            throw err;
        }

        return data;
    }

    // ============================================================
    //  REGISTRO
    // ============================================================
    async function register(username, email, password) {
        const data = await _apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });

        if (data.token && data.user) {
            _saveSession(data.token, data.user);
        }

        return data;
    }

    // ============================================================
    //  LOGIN
    // ============================================================
    async function login(email, password) {
        const data = await _apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data.token && data.user) {
            _saveSession(data.token, data.user);
        }

        return data;
    }

    // ============================================================
    //  LOGOUT
    // ============================================================
    function logout() {
        _clearSession();
    }

    // ============================================================
    //  VERIFICAR SESIÓN EN EL SERVIDOR
    // ============================================================
    async function verifySession() {
        if (!_token) return null;
        try {
            const data = await _apiFetch('/auth/me');
            if (data.user) {
                _currentUser = data.user;
                _saveSession(_token, data.user);
                return data.user;
            }
            return null;
        } catch (err) {
            if (err.status === 401) {
                _clearSession();
            }
            return null;
        }
    }

    // ============================================================
    //  GETTERS
    // ============================================================
    function getUser() { return _currentUser; }
    function getToken() { return _token; }
    function isLoggedIn() { return !!_token && !!_currentUser; }

    // ============================================================
    //  API DE FAVORITOS
    // ============================================================
    const Favorites = {
        async getAll() {
            if (!isLoggedIn()) throw new Error('Debes iniciar sesión');
            return _apiFetch('/favorites');
        },

        async add({ tmdb_id, media_type, title, poster_path, year, vote_average }) {
            if (!isLoggedIn()) throw new Error('Debes iniciar sesión');
            return _apiFetch('/favorites', {
                method: 'POST',
                body: JSON.stringify({ tmdb_id, media_type, title, poster_path, year, vote_average })
            });
        },

        async remove(id) {
            if (!isLoggedIn()) throw new Error('Debes iniciar sesión');
            return _apiFetch(`/favorites/${id}`, { method: 'DELETE' });
        },

        async check(tmdbId, mediaType) {
            if (!isLoggedIn()) return { is_favorite: false, favorite_id: null };
            try {
                return _apiFetch(`/favorites/check/${tmdbId}/${mediaType}`);
            } catch {
                return { is_favorite: false, favorite_id: null };
            }
        }
    };

    // ============================================================
    //  API PÚBLICA
    // ============================================================
    return {
        init,
        register,
        login,
        logout,
        verifySession,
        getUser,
        getToken,
        isLoggedIn,
        onAuthChange,
        Favorites
    };
})();
