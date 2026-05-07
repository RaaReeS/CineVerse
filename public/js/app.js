/*
 * ============================================================
 *  CINEVERSE - Aplicación de Películas y Series con TMDB
 * ============================================================
 *  Características:
 *  - Explorar tendencias, películas y series
 *  - Buscador con autocompletado
 *  - Filtros por género, tipo, año y orden
 *  - Modo oscuro / claro
 *  - Vista de detalle con información completa
 *  - Reproducción de tráilers
 *  - Diseño responsivo tipo Netflix
 * ============================================================
 */

'use strict';

// ============================================================
//  ESTADO GLOBAL DE LA APLICACIÓN
// ============================================================
const state = {
    currentPage: 1,
    totalPages: 1,
    currentType: 'trending',   // 'trending', 'movie', 'tv', 'search', 'favorites'
    searchQuery: '',
    filters: {
        type: 'all',
        genre: 'all',
        yearFrom: '',
        sortBy: 'popularity.desc'
    },
    viewMode: 'grid',          // 'grid' o 'list'
    genres: { movie: [], tv: [] },
    isLoading: false,
    heroItem: null,
    // Auth & favorites
    isLoggedIn: false,
    currentUser: null,
    favorites: [],              // Lista completa de favoritos del usuario
    favoritesMap: {}            // Mapa rápido: "tmdbId_type" => favoriteId
};

// ============================================================
//  DOM REFERENCES
// ============================================================
const DOM = {};

function cacheDOM() {
    DOM.navLinks = document.querySelectorAll('.nav-link');
    DOM.homeLink = document.getElementById('homeLink');
    DOM.searchInput = document.getElementById('searchInput');
    DOM.searchBtn = document.getElementById('searchBtn');
    DOM.searchResults = document.getElementById('searchResults');
    DOM.themeToggle = document.getElementById('themeToggle');
    DOM.filterToggle = document.getElementById('filterToggle');
    DOM.filterPanel = document.getElementById('filterPanel');
    DOM.closeFilters = document.getElementById('closeFilters');
    DOM.overlay = document.getElementById('overlay');
    DOM.hamburger = document.getElementById('hamburger');
    DOM.mainNav = document.getElementById('mainNav');

    DOM.hero = document.getElementById('hero');
    DOM.heroBg = document.getElementById('heroBg');
    DOM.heroBadge = document.getElementById('heroBadge');
    DOM.heroTitle = document.getElementById('heroTitle');
    DOM.heroYear = document.getElementById('heroYear');
    DOM.heroRating = document.getElementById('heroRating');
    DOM.heroRuntime = document.getElementById('heroRuntime');
    DOM.heroDesc = document.getElementById('heroDesc');
    DOM.heroPlayBtn = document.getElementById('heroPlayBtn');
    DOM.heroInfoBtn = document.getElementById('heroInfoBtn');

    DOM.sectionTitle = document.getElementById('sectionTitle');
    DOM.resultsGrid = document.getElementById('resultsGrid');
    DOM.loader = document.getElementById('loader');
    DOM.errorMessage = document.getElementById('errorMessage');
    DOM.errorText = document.getElementById('errorText');
    DOM.retryBtn = document.getElementById('retryBtn');
    DOM.emptyState = document.getElementById('emptyState');
    DOM.emptyText = document.getElementById('emptyText');
    DOM.pagination = document.getElementById('pagination');
    DOM.prevPage = document.getElementById('prevPage');
    DOM.nextPage = document.getElementById('nextPage');
    DOM.pageInfo = document.getElementById('pageInfo');

    DOM.filterType = document.getElementById('filterType');
    DOM.filterGenre = document.getElementById('filterGenre');
    DOM.filterYearFrom = document.getElementById('filterYearFrom');
    DOM.filterSort = document.getElementById('filterSort');
    DOM.applyFilters = document.getElementById('applyFilters');
    DOM.resetFilters = document.getElementById('resetFilters');

    DOM.detailModal = document.getElementById('detailModal');
    DOM.detailClose = document.getElementById('detailClose');
    DOM.detailContainer = document.getElementById('detailContainer');

    DOM.trailerModal = document.getElementById('trailerModal');
    DOM.trailerClose = document.getElementById('trailerClose');
    DOM.trailerContainer = document.getElementById('trailerContainer');

    DOM.toastContainer = document.getElementById('toastContainer');

    DOM.viewBtns = document.querySelectorAll('.view-btn');

    // Auth & User
    DOM.authSection = document.getElementById('authSection');
    DOM.loginBtn = document.getElementById('loginBtn');
    DOM.registerBtn = document.getElementById('registerBtn');
    DOM.userMenu = document.getElementById('userMenu');
    DOM.userAvatar = document.getElementById('userAvatar');
    DOM.userName = document.getElementById('userName');
    DOM.logoutBtn = document.getElementById('logoutBtn');
    DOM.favoritesNavLink = document.getElementById('favoritesNavLink');
    DOM.favoritesDropdownBtn = document.getElementById('favoritesDropdownBtn');

    // Auth modals
    DOM.loginModal = document.getElementById('loginModal');
    DOM.registerModal = document.getElementById('registerModal');
    DOM.loginClose = document.getElementById('loginClose');
    DOM.registerClose = document.getElementById('registerClose');
    DOM.loginForm = document.getElementById('loginForm');
    DOM.registerForm = document.getElementById('registerForm');
    DOM.switchToRegister = document.getElementById('switchToRegister');
    DOM.switchToLogin = document.getElementById('switchToLogin');

    // Auth form inputs
    DOM.loginEmail = document.getElementById('loginEmail');
    DOM.loginPassword = document.getElementById('loginPassword');
    DOM.loginError = document.getElementById('loginError');
    DOM.registerUsername = document.getElementById('registerUsername');
    DOM.registerEmail = document.getElementById('registerEmail');
    DOM.registerPassword = document.getElementById('registerPassword');
    DOM.registerError = document.getElementById('registerError');
}

// ============================================================
//  API - TMDB SERVICE
// ============================================================
const TMDB = {
    /**
     * Realiza una petición a la API de TMDB
     */
    async fetch(endpoint, params = {}) {
        const defaultParams = {
            api_key: TMDB_CONFIG.API_KEY,
            language: TMDB_CONFIG.LANGUAGE,
            region: TMDB_CONFIG.REGION
        };

        // Si no hay API key configurada, lanzar error
        if (TMDB_CONFIG.API_KEY === 'TU_API_KEY_AQUI') {
            throw new Error('API_KEY_NO_CONFIGURADA');
        }

        const queryParams = new URLSearchParams({ ...defaultParams, ...params }).toString();
        const url = `${TMDB_CONFIG.BASE_URL}${endpoint}?${queryParams}`;

        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.status_message || `Error HTTP: ${response.status}`);
        }
        return response.json();
    },

    /**
     * Obtener tendencias de la semana
     */
    async getTrending(page = 1) {
        return this.fetch('/trending/all/week', { page });
    },

    /**
     * Obtener películas populares
     */
    async getPopularMovies(page = 1) {
        return this.fetch('/movie/popular', { page });
    },

    /**
     * Obtener series populares
     */
    async getPopularTV(page = 1) {
        return this.fetch('/tv/popular', { page });
    },

    /**
     * Buscar contenido multi (películas y series)
     */
    async searchMulti(query, page = 1) {
        return this.fetch('/search/multi', { query, page });
    },

    /**
     * Buscar con filtros (discover)
     */
    async discover({ type = 'movie', genreId, year, sortBy, page = 1 } = {}) {
        const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';
        const params = { page, sort_by: sortBy || 'popularity.desc' };

        if (genreId && genreId !== 'all') {
            params.with_genres = genreId;
        }
        if (year) {
            const key = type === 'tv' ? 'first_air_date_year' : 'primary_release_year';
            params[key] = year;
        }

        return this.fetch(endpoint, params);
    },

    /**
     * Obtener géneros
     */
    async getGenres(type = 'movie') {
        return this.fetch(`/genre/${type}/list`);
    },

    /**
     * Obtener detalles de una película
     */
    async getMovieDetails(id) {
        return this.fetch(`/movie/${id}`, {
            append_to_response: 'videos,credits'
        });
    },

    /**
     * Obtener detalles de una serie
     */
    async getTVDetails(id) {
        return this.fetch(`/tv/${id}`, {
            append_to_response: 'videos,credits'
        });
    },

    /**
     * Obtener videos (tráilers) de una película o serie
     */
    async getVideos(mediaType, id) {
        return this.fetch(`/${mediaType}/${id}/videos`);
    }
};

// ============================================================
//  UTILITY FUNCTIONS
// ============================================================
const Utils = {
    /**
     * Formatea una fecha a año
     */
    getYear(dateStr) {
        if (!dateStr) return '—';
        return dateStr.split('-')[0];
    },

    /**
     * Formatea la puntuación a un decimal
     */
    formatRating(vote) {
        return vote ? vote.toFixed(1) : 'N/A';
    },

    /**
     * Trunca texto
     */
    truncate(text, maxLen = 150) {
        if (!text) return '';
        return text.length > maxLen ? text.slice(0, maxLen).trim() + '...' : text;
    },

    /**
     * Obtiene el placeholder de póster
     */
    getPosterPlaceholder(type = 'movie') {
        return `
            <div class="no-poster">
                <i class="fas fa-${type === 'tv' ? 'tv' : 'film'}" style="font-size:2rem;opacity:0.4;"></i>
            </div>
        `;
    },

    /**
     * Formatea duración (minutos a horas)
     */
    formatRuntime(minutes) {
        if (!minutes) return null;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    },

    /**
     * Formatea fecha completa
     */
    formatDate(dateStr) {
        if (!dateStr) return '—';
        try {
            const date = new Date(dateStr + 'T00:00:00');
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    },

    /**
     * Encuentra el tráiler oficial en YouTube
     */
    findTrailer(videos) {
        if (!videos || !videos.results) return null;
        // Prioridad: Tráiler oficial > Teaser > cualquier video
        const official = videos.results.find(
            v => v.type === 'Trailer' && v.official === true && v.site === 'YouTube'
        );
        if (official) return official;
        const anyTrailer = videos.results.find(
            v => v.type === 'Trailer' && v.site === 'YouTube'
        );
        if (anyTrailer) return anyTrailer;
        const teaser = videos.results.find(
            v => v.type === 'Teaser' && v.site === 'YouTube'
        );
        return teaser || null;
    },

    /**
     * Muestra un toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
        toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
        DOM.toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    },

    /**
     * Debounce para búsqueda
     */
    debounce(fn, delay = 400) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }
};

// ============================================================
//  RENDER FUNCTIONS
// ============================================================
const Render = {
    /**
     * Renderiza el héroe con una película/serie destacada
     */
    hero(item) {
        if (!item) return;

        state.heroItem = item;

        const title = item.title || item.name || 'Sin título';
        const year = Utils.getYear(item.release_date || item.first_air_date);
        const rating = Utils.formatRating(item.vote_average);
        const desc = item.overview || 'Sin descripción disponible.';
        const backdrop = TMDB_CONFIG.getBackdropUrl(item.backdrop_path);

        const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');

        // Badge
        DOM.heroBadge.textContent = mediaType === 'tv' ? 'Serie destacada' : 'Película destacada';

        // Título
        DOM.heroTitle.textContent = title;

        // Año
        DOM.heroYear.textContent = year;

        // Rating
        const ratingSpan = DOM.heroRating.querySelector('span');
        if (ratingSpan) ratingSpan.textContent = rating;
        DOM.heroRating.style.display = item.vote_average ? 'flex' : 'none';

        // Runtime / temporadas
        DOM.heroRuntime.textContent = '';

        // Descripción
        DOM.heroDesc.textContent = Utils.truncate(desc, 200);

        // Background con efecto parallax
        if (backdrop) {
            DOM.heroBg.style.backgroundImage = `url(${backdrop})`;
        } else {
            DOM.heroBg.style.backgroundImage = 'none';
            DOM.heroBg.style.backgroundColor = 'var(--bg-tertiary)';
        }

        // Data attributes para los botones
        DOM.heroPlayBtn.dataset.id = item.id;
        DOM.heroPlayBtn.dataset.type = mediaType;
        DOM.heroInfoBtn.dataset.id = item.id;
        DOM.heroInfoBtn.dataset.type = mediaType;
    },

    /**
     * Renderiza la cuadrícula de tarjetas
     */
    cards(items) {
        DOM.resultsGrid.innerHTML = '';
        DOM.resultsGrid.className = `results-grid ${state.viewMode === 'list' ? 'list-view' : ''}`;

        if (!items || items.length === 0) {
            DOM.emptyState.classList.add('active');
            DOM.resultsGrid.classList.remove('active');
            return;
        }

        DOM.emptyState.classList.remove('active');
        DOM.resultsGrid.classList.add('active'); // asegura display

        items.forEach(item => {
            // Si es de search/multi, puede no tener media_type
            const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
            const title = item.title || item.name || 'Sin título';
            const year = Utils.getYear(item.release_date || item.first_air_date);
            const rating = Utils.formatRating(item.vote_average);
            const desc = item.overview || '';
            const posterPath = TMDB_CONFIG.getPosterUrl(item.poster_path, 'medium');

            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.id = item.id;
            card.dataset.type = mediaType;

            const posterHtml = posterPath
                ? `<img src="${posterPath}" alt="${title}" loading="lazy">`
                : Utils.getPosterPlaceholder(mediaType);

            const typeLabel = mediaType === 'tv' ? 'Serie' : 'Película';
            const typeClass = mediaType === 'tv' ? 'tv' : 'movie';

            // Verificar si está en favoritos
            const favKey = `${item.id}_${mediaType}`;
            const isFav = !!state.favoritesMap[favKey];

            card.innerHTML = `
                <div class="card__poster">
                    ${posterHtml}
                    <span class="card__rating"><i class="fas fa-star"></i> ${rating}</span>
                    <span class="card__type-badge ${typeClass}">${typeLabel}</span>
                    <div class="card__play-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                    <button class="card__fav-btn ${isFav ? 'is-favorite' : ''}"
                            data-id="${item.id}"
                            data-type="${mediaType}"
                            data-title="${title.replace(/"/g, '&quot;')}"
                            data-poster="${item.poster_path || ''}"
                            data-year="${year}"
                            data-rating="${item.vote_average || ''}"
                            aria-label="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="card__body">
                    <h3 class="card__title">${title}</h3>
                    <div class="card__meta">
                        <span>${year}</span>
                        ${item.vote_average ? `<span><i class="fas fa-star"></i> ${rating}</span>` : ''}
                    </div>
                    ${state.viewMode === 'list' && desc ? `<p class="card__desc">${Utils.truncate(desc, 120)}</p>` : ''}
                </div>
            `;

            // Click para abrir detalle
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                Render.openDetail(item.id, mediaType);
            });

            // Doble click para tráiler
            card.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                Render.openTrailer(item.id, mediaType);
            });

            // Click en overlay de play para tráiler
            const playOverlay = card.querySelector('.card__play-overlay');
            playOverlay.addEventListener('click', (e) => {
                e.stopPropagation();
                Render.openTrailer(item.id, mediaType);
            });

            // Click en botón de favoritos
            const favBtn = card.querySelector('.card__fav-btn');
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                App.toggleFavorite(favBtn);
            });

            DOM.resultsGrid.appendChild(card);
        });
    },

    /**
     * Abre el modal de detalle
     */
    async openDetail(id, mediaType) {
        try {
            DOM.detailContainer.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;padding:80px 20px;">
                    <div class="spinner"></div>
                </div>
            `;
            DOM.detailModal.classList.add('active');
            document.body.style.overflow = 'hidden';

            const data = mediaType === 'tv'
                ? await TMDB.getTVDetails(id)
                : await TMDB.getMovieDetails(id);

            Render.detailContent(data, mediaType);
        } catch (err) {
            console.error('Error al cargar detalle:', err);
            DOM.detailContainer.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px;text-align:center;">
                    <i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:var(--accent-color);"></i>
                    <p style="color:var(--text-secondary);">No se pudo cargar la información completa.</p>
                    <button class="btn btn-primary" onclick="Render.openDetail(${id}, '${mediaType}')">Reintentar</button>
                </div>
            `;
        }
    },

    /**
     * Renderiza el contenido del modal de detalle
     */
    detailContent(data, mediaType) {
        const isTV = mediaType === 'tv';
        const title = data.title || data.name || 'Sin título';
        const tagline = data.tagline || '';
        const year = Utils.getYear(data.release_date || data.first_air_date);
        const rating = Utils.formatRating(data.vote_average);
        const voteCount = data.vote_count || 0;
        const overview = data.overview || 'Sin descripción disponible.';
        const runtime = isTV
            ? (data.number_of_seasons ? `${data.number_of_seasons} temporada${data.number_of_seasons !== 1 ? 's' : ''}` : null)
            : Utils.formatRuntime(data.runtime);
        const status = data.status || '—';
        const genres = data.genres || [];
        const poster = TMDB_CONFIG.getPosterUrl(data.poster_path, 'large');
        const backdrop = TMDB_CONFIG.getBackdropUrl(data.backdrop_path, 'original');
        const date = Utils.formatDate(data.release_date || data.first_air_date);

        const posterHtml = poster
            ? `<img src="${poster}" alt="${title}">`
            : Utils.getPosterPlaceholder(mediaType);

        const backdropHtml = backdrop
            ? `<img src="${backdrop}" alt="${title}">`
            : '';

        const creators = isTV
            ? (data.created_by || []).map(c => c.name).join(', ') || '—'
            : (data.director || '—');

        // Obtener director de credits si es película
        let director = '—';
        if (!isTV && data.credits && data.credits.crew) {
            const d = data.credits.crew.find(person => person.job === 'Director');
            if (d) director = d.name;
        }

        const cast = data.credits && data.credits.cast
            ? data.credits.cast.slice(0, 5).map(p => p.name).join(', ')
            : '—';

        DOM.detailContainer.innerHTML = `
            <div class="detail__hero">
                ${backdropHtml || `<div style="height:100%;background:var(--bg-tertiary);"></div>`}
                <div class="detail__hero-overlay"></div>
            </div>
            <div class="detail__body">
                <div class="detail__poster">
                    ${posterHtml}
                </div>
                <div class="detail__info">
                    <h2 class="detail__title">${title}</h2>
                    ${tagline ? `<p class="detail__tagline">${tagline}</p>` : ''}
                    <div class="detail__meta">
                        <span>${year}</span>
                        <span class="dot"></span>
                        <span class="detail__rating">
                            <i class="fas fa-star"></i> ${rating}
                            <span style="font-weight:400;font-size:0.8rem;color:var(--text-tertiary);">(${voteCount})</span>
                        </span>
                        <span class="dot"></span>
                        <span>${runtime || '—'}</span>
                        <span class="dot"></span>
                        <span>${status}</span>
                    </div>
                    ${genres.length ? `
                        <div class="detail__genres">
                            ${genres.map(g => `<span class="detail__genre">${g.name}</span>`).join('')}
                        </div>
                    ` : ''}
                    <p class="detail__overview">${overview}</p>
                    <div class="detail__extra">
                        <div class="detail__extra-item">
                            <span class="label">Fecha de estreno</span>
                            <span class="value">${date}</span>
                        </div>
                        <div class="detail__extra-item">
                            <span class="label">${isTV ? 'Creado por' : 'Director'}</span>
                            <span class="value">${isTV ? creators : director}</span>
                        </div>
                        <div class="detail__extra-item">
                            <span class="label">Reparto principal</span>
                            <span class="value">${cast}</span>
                        </div>
                        ${data.homepage ? `
                            <div class="detail__extra-item" style="grid-column:1/-1;">
                                <span class="label">Sitio web</span>
                                <span class="value"><a href="${data.homepage}" target="_blank" rel="noopener" style="color:var(--accent-color);">${data.homepage}</a></span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="detail__actions">
                        <button class="btn btn-primary btn-lg" id="detailTrailerBtn" data-id="${data.id}" data-type="${mediaType}">
                            <i class="fas fa-play"></i> Ver Tráiler
                        </button>
                        <button class="btn btn-outline btn-lg" id="detailFavBtn"
                                data-id="${data.id}"
                                data-type="${mediaType}"
                                data-title="${title.replace(/"/g, '&quot;')}"
                                data-poster="${data.poster_path || ''}"
                                data-year="${year}"
                                data-rating="${data.vote_average || ''}">
                            <i class="fas fa-heart"></i> <span>Añadir a Favoritos</span>
                        </button>
                        <button class="btn btn-secondary btn-lg" id="detailCloseBtn">
                            <i class="fas fa-times"></i> Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Evento para tráiler desde detalle
        document.getElementById('detailTrailerBtn').addEventListener('click', () => {
            Render.openTrailer(data.id, mediaType);
        });

        // Evento para favoritos desde detalle
        const detailFavBtn = document.getElementById('detailFavBtn');
        if (detailFavBtn) {
            // Verificar estado inicial
            const favKey = `${data.id}_${mediaType}`;
            if (state.favoritesMap[favKey]) {
                detailFavBtn.classList.add('is-favorite');
                detailFavBtn.querySelector('span').textContent = 'Quitar de Favoritos';
            }
            detailFavBtn.addEventListener('click', () => {
                App.toggleFavorite(detailFavBtn);
            });
        }

        // Evento para cerrar
        document.getElementById('detailCloseBtn').addEventListener('click', () => {
            Render.closeDetail();
        });
    },

    /**
     * Cierra el modal de detalle
     */
    closeDetail() {
        DOM.detailModal.classList.remove('active');
        document.body.style.overflow = '';
    },

    /**
     * Abre el tráiler en el modal
     */
    async openTrailer(id, mediaType) {
        try {
            DOM.trailerContainer.innerHTML = `<p class="trailer-placeholder">Cargando tráiler...</p>`;
            DOM.trailerModal.classList.add('active');
            document.body.style.overflow = 'hidden';

            const data = await TMDB.getVideos(mediaType, id);
            const trailer = Utils.findTrailer(data);

            if (trailer) {
                DOM.trailerContainer.innerHTML = `
                    <iframe
                        src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        title="Tráiler"
                    ></iframe>
                `;
            } else {
                DOM.trailerContainer.innerHTML = `
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-tertiary);gap:12px;padding:20px;text-align:center;">
                        <i class="fas fa-video-slash" style="font-size:3rem;"></i>
                        <p style="font-size:1.1rem;">No hay tráiler disponible para este contenido.</p>
                        <button class="btn btn-secondary" onclick="Render.closeTrailer()">Cerrar</button>
                    </div>
                `;
            }
        } catch (err) {
            console.error('Error al cargar tráiler:', err);
            DOM.trailerContainer.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-tertiary);gap:12px;padding:20px;text-align:center;">
                    <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:var(--accent-color);"></i>
                    <p style="font-size:1.1rem;">Error al cargar el tráiler.</p>
                    <button class="btn btn-secondary" onclick="Render.closeTrailer()">Cerrar</button>
                </div>
            `;
        }
    },

    /**
     * Cierra el tráiler
     */
    closeTrailer() {
        DOM.trailerModal.classList.remove('active');
        document.body.style.overflow = '';
        // Detener el video
        DOM.trailerContainer.innerHTML = `<p class="trailer-placeholder">Cargando tráiler...</p>`;
    },

    /**
     * Actualiza la paginación
     */
    pagination(current, total) {
        if (total <= 1) {
            DOM.pagination.classList.remove('active');
            return;
        }
        DOM.pagination.classList.add('active');
        DOM.pageInfo.textContent = `Página ${current} de ${total}`;
        DOM.prevPage.disabled = current <= 1;
        DOM.nextPage.disabled = current >= total;
    },

    /**
     * Muestra/oculta el loader
     */
    showLoader(show) {
        if (show) {
            DOM.loader.classList.add('active');
            DOM.resultsGrid.style.display = 'none';
        } else {
            DOM.loader.classList.remove('active');
            DOM.resultsGrid.style.display = '';
        }
        state.isLoading = show;
    },

    /**
     * Muestra error
     */
    showError(message) {
        DOM.errorText.textContent = message || 'Ha ocurrido un error al cargar los datos.';
        DOM.errorMessage.classList.add('active');
        DOM.resultsGrid.style.display = 'none';
    },

    /**
     * Oculta error
     */
    hideError() {
        DOM.errorMessage.classList.remove('active');
        DOM.resultsGrid.style.display = '';
    },

    /**
     * Actualiza el título de la sección
     */
    updateSectionTitle(text) {
        DOM.sectionTitle.textContent = text;
    }
};

// ============================================================
//  APP LOGIC
// ============================================================
const App = {
    /**
     * Inicializa la aplicación
     */
    async init() {
        try {
            cacheDOM();
            this.bindEvents();

            // Inicializar auth ANTES de cargar contenido (para que cualquier
            // restauración de sesión no interfiera con el renderizado inicial)
            Auth.init();

            // Sincronizar la UI con el estado de auth actual (por si el callback
            // de onAuthChange no se disparó o si hay un token guardado)
            const savedUser = Auth.getUser();
            const savedToken = Auth.getToken();
            if (savedToken && savedUser) {
                this.updateAuthUI(savedUser, savedToken);
            }

            await this.loadGenres();
            this.populateYearOptions();

            // Cargar vista inicial
            await this.loadTrending();

            // Verificar API key
            if (TMDB_CONFIG.API_KEY === 'TU_API_KEY_AQUI') {
                Utils.showToast(
                    '⚠️ Configura tu API key de TMDB en js/config.js',
                    'error'
                );
            }

            // Verificar sesión guardada contra el servidor (asíncrono, no bloquea)
            Auth.verifySession().catch(err => {
                console.warn('[Auth] verifySession falló:', err);
            });
        } catch (err) {
            console.error('[App] Error fatal en init():', err);
            Utils.showToast('Error al iniciar la aplicación: ' + err.message, 'error');
        }
    },

    /**
     * Vincula todos los eventos
     */
    bindEvents() {
        // Nav links
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const type = link.dataset.type;
                this.switchTab(type);
            });
        });

        // Home link
        DOM.homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchTab('trending');
        });

        // Búsqueda
        DOM.searchBtn.addEventListener('click', () => this.handleSearch());
        DOM.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        DOM.searchInput.addEventListener('input', Utils.debounce(() => {
            const query = DOM.searchInput.value.trim();
            if (query.length >= 2) {
                this.autocompleteSearch(query);
            } else {
                DOM.searchResults.classList.remove('active');
            }
        }, 350));

        // Cerrar resultados al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                DOM.searchResults.classList.remove('active');
            }
        });

        // Theme toggle
        DOM.themeToggle.addEventListener('click', this.toggleTheme);

        // Filter panel
        DOM.filterToggle.addEventListener('click', () => this.openFilters());
        DOM.closeFilters.addEventListener('click', () => this.closeFilters());
        DOM.overlay.addEventListener('click', () => this.closeFilters());
        DOM.applyFilters.addEventListener('click', () => this.applyFilters());
        DOM.resetFilters.addEventListener('click', () => this.resetFilters());

        // Paginación
        DOM.prevPage.addEventListener('click', () => this.goToPage(state.currentPage - 1));
        DOM.nextPage.addEventListener('click', () => this.goToPage(state.currentPage + 1));

        // Hamburger menu
        DOM.hamburger.addEventListener('click', () => {
            DOM.mainNav.classList.toggle('active');
            DOM.hamburger.classList.toggle('active');
        });

        // Cerrar nav al hacer click en un link (móvil)
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                DOM.mainNav.classList.remove('active');
                DOM.hamburger.classList.remove('active');
            });
        });

        // View mode
        DOM.viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                DOM.viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.viewMode = btn.dataset.view;
                // Re-renderizar con el mismo estado
                this.reloadCurrentView();
            });
        });

        // Modales - cerrar
        DOM.detailClose.addEventListener('click', () => Render.closeDetail());
        DOM.detailModal.querySelector('.modal__backdrop')?.addEventListener('click', () => Render.closeDetail());

        DOM.trailerClose.addEventListener('click', () => Render.closeTrailer());
        DOM.trailerModal.querySelector('.modal__backdrop')?.addEventListener('click', () => Render.closeTrailer());

        // Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (DOM.trailerModal.classList.contains('active')) Render.closeTrailer();
                else if (DOM.detailModal.classList.contains('active')) Render.closeDetail();
                else if (DOM.filterPanel.classList.contains('active')) this.closeFilters();
            }
        });

        // Hero buttons
        DOM.heroPlayBtn.addEventListener('click', () => {
            const { id, type } = DOM.heroPlayBtn.dataset;
            if (id) Render.openTrailer(id, type);
        });

        DOM.heroInfoBtn.addEventListener('click', () => {
            const { id, type } = DOM.heroInfoBtn.dataset;
            if (id) Render.openDetail(id, type);
        });

        // Retry
        DOM.retryBtn.addEventListener('click', () => this.reloadCurrentView());

        // ============================================================
        //  AUTH EVENTS
        // ============================================================
        // Botones de login/register
        DOM.loginBtn.addEventListener('click', () => this.openLoginModal());
        DOM.registerBtn.addEventListener('click', () => this.openRegisterModal());

        // Cerrar modales auth
        DOM.loginClose.addEventListener('click', () => this.closeAuthModals());
        DOM.registerClose.addEventListener('click', () => this.closeAuthModals());
        DOM.loginModal.querySelector('.modal__backdrop')?.addEventListener('click', () => this.closeAuthModals());
        DOM.registerModal.querySelector('.modal__backdrop')?.addEventListener('click', () => this.closeAuthModals());

        // Switch entre modales
        DOM.switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            this.openRegisterModal();
        });
        DOM.switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.openLoginModal();
        });

        // Submit forms
        DOM.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        DOM.registerForm.addEventListener('submit', (e) => this.handleRegister(e));

        // Logout
        DOM.logoutBtn.addEventListener('click', () => {
            Auth.logout();                           // Limpia localStorage y estado interno
            this.updateAuthUI(null, null);            // Actualiza UI directamente
            if (state.currentType === 'favorites') {
                this.switchTab('trending');           // Vuelve a inicio si estábamos en favoritos
            }
            Utils.showToast('Sesión cerrada', 'info');
        });

        // Favorites nav link
        DOM.favoritesNavLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchTab('favorites');
            // Cerrar hamburger menu si está abierto
            DOM.mainNav.classList.remove('active');
            DOM.hamburger.classList.remove('active');
        });

        // Favorites dropdown button
        DOM.favoritesDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.switchTab('favorites');
        });

        // Escuchar cambios de autenticación
        Auth.onAuthChange((user, token) => {
            this.updateAuthUI(user, token);
        });
    },

    /**
     * Cambia de pestaña (Tendencias, Películas, Series)
     */
    switchTab(type) {
        // Reset filters when switching tabs
        this.resetFiltersUI();

        DOM.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.type === type);
        });

        state.currentType = type;
        state.currentPage = 1;
        state.searchQuery = '';

        // Limpiar búsqueda
        DOM.searchInput.value = '';

        // Mostrar/ocultar el héroe según la pestaña
        DOM.hero.classList.toggle('hidden', type === 'favorites');

        switch (type) {
            case 'trending':
                Render.updateSectionTitle('Tendencias de la Semana');
                this.loadTrending();
                break;
            case 'movies':
                Render.updateSectionTitle('Películas Populares');
                this.loadMovies();
                break;
            case 'tv':
                Render.updateSectionTitle('Series Populares');
                this.loadTV();
                break;
            case 'favorites':
                this.loadFavoritesPage();
                break;
        }
    },

    /**
     * Carga tendencias
     */
    async loadTrending(page = 1) {
        Render.showLoader(true);
        Render.hideError();
        try {
            const data = await TMDB.getTrending(page);
            state.totalPages = data.total_pages;

            // Héroe con el primer resultado
            if (data.results && data.results.length > 0) {
                Render.hero(data.results[0]);
            }

            Render.cards(data.results || []);
            Render.pagination(data.page, data.total_pages);
            state.currentPage = data.page;
        } catch (err) {
            this.handleError(err);
        } finally {
            Render.showLoader(false);
        }
    },

    /**
     * Carga películas populares
     */
    async loadMovies(page = 1) {
        Render.showLoader(true);
        Render.hideError();
        try {
            const data = await TMDB.getPopularMovies(page);
            state.totalPages = data.total_pages;

            if (data.results && data.results.length > 0) {
                Render.hero(data.results[0]);
            }

            Render.cards(data.results || []);
            Render.pagination(data.page, data.total_pages);
            state.currentPage = data.page;
        } catch (err) {
            this.handleError(err);
        } finally {
            Render.showLoader(false);
        }
    },

    /**
     * Carga series populares
     */
    async loadTV(page = 1) {
        Render.showLoader(true);
        Render.hideError();
        try {
            const data = await TMDB.getPopularTV(page);
            state.totalPages = data.total_pages;

            if (data.results && data.results.length > 0) {
                Render.hero(data.results[0]);
            }

            Render.cards(data.results || []);
            Render.pagination(data.page, data.total_pages);
            state.currentPage = data.page;
        } catch (err) {
            this.handleError(err);
        } finally {
            Render.showLoader(false);
        }
    },

    /**
     * Maneja la búsqueda
     */
    async handleSearch() {
        const query = DOM.searchInput.value.trim();
        if (!query) return;

        DOM.searchResults.classList.remove('active');
        DOM.hero.classList.remove('hidden');
        state.searchQuery = query;
        state.currentPage = 1;
        state.currentType = 'search';

        // Desactivar nav links
        DOM.navLinks.forEach(link => link.classList.remove('active'));

        Render.updateSectionTitle(`Resultados: "${query}"`);
        Render.showLoader(true);
        Render.hideError();

        try {
            const data = await TMDB.searchMulti(query, 1);
            state.totalPages = data.total_pages;

            if (data.results && data.results.length > 0) {
                // Filtramos solo películas y series
                const filtered = data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
                Render.hero(filtered[0] || data.results[0]);
                Render.cards(filtered);
            } else {
                Render.cards([]);
            }

            Render.pagination(data.page, data.total_pages);
            state.currentPage = data.page;
        } catch (err) {
            this.handleError(err);
        } finally {
            Render.showLoader(false);
        }
    },

    /**
     * Autocompletado de búsqueda (dropdown)
     */
    async autocompleteSearch(query) {
        try {
            const data = await TMDB.searchMulti(query, 1);
            const results = (data.results || [])
                .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
                .slice(0, 6);

            if (results.length === 0) {
                DOM.searchResults.classList.remove('active');
                return;
            }

            DOM.searchResults.innerHTML = results.map(item => {
                const title = item.title || item.name || 'Sin título';
                const year = Utils.getYear(item.release_date || item.first_air_date);
                const mediaType = item.media_type || 'movie';
                const poster = TMDB_CONFIG.getPosterUrl(item.poster_path, 'small');
                const posterImg = poster
                    ? `<img src="${poster}" alt="${title}">`
                    : `<div style="width:40px;height:56px;background:var(--bg-tertiary);border-radius:4px;display:flex;align-items:center;justify-content:center;"><i class="fas fa-${mediaType === 'tv' ? 'tv' : 'film'}" style="opacity:0.3;"></i></div>`;

                return `
                    <div class="search-result-item" data-id="${item.id}" data-type="${mediaType}">
                        ${posterImg}
                        <div class="result-info">
                            <div class="result-title">${title}</div>
                            <div class="result-meta">
                                <span>${year}</span>
                                <span class="type-badge ${mediaType}">${mediaType === 'tv' ? 'Serie' : 'Película'}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Eventos para los items del dropdown
            DOM.searchResults.querySelectorAll('.search-result-item').forEach(el => {
                el.addEventListener('click', () => {
                    const id = el.dataset.id;
                    const type = el.dataset.type;
                    DOM.searchResults.classList.remove('active');
                    DOM.searchInput.value = '';
                    Render.openDetail(id, type);
                });
            });

            DOM.searchResults.classList.add('active');
        } catch {
            DOM.searchResults.classList.remove('active');
        }
    },

    /**
     * Carga los géneros desde TMDB
     */
    async loadGenres() {
        try {
            const [movieGenres, tvGenres] = await Promise.all([
                TMDB.getGenres('movie'),
                TMDB.getGenres('tv')
            ]);
            state.genres.movie = movieGenres.genres || [];
            state.genres.tv = tvGenres.genres || [];

            // Poblar selector de géneros
            this.populateGenreOptions();
        } catch (err) {
            console.warn('No se pudieron cargar los géneros:', err);
        }
    },

    /**
     * Puebla las opciones de género en el filtro
     */
    populateGenreOptions() {
        const select = DOM.filterGenre;
        // Combinar géneros únicos de movie y tv
        const allGenres = [...state.genres.movie, ...state.genres.tv];
        const unique = new Map();
        allGenres.forEach(g => unique.set(g.id, g));
        const sorted = Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));

        select.innerHTML = '<option value="all">Todos</option>';
        sorted.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = g.name;
            select.appendChild(opt);
        });
    },

    /**
     * Puebla las opciones de año
     */
    populateYearOptions() {
        const select = DOM.filterYearFrom;
        const currentYear = new Date().getFullYear();
        select.innerHTML = '<option value="">Cualquiera</option>';
        for (let y = currentYear; y >= 1900; y--) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            select.appendChild(opt);
        }
    },

    /**
     * Abre el panel de filtros
     */
    openFilters() {
        DOM.filterPanel.classList.add('active');
        DOM.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    /**
     * Cierra el panel de filtros
     */
    closeFilters() {
        DOM.filterPanel.classList.remove('active');
        DOM.overlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    /**
     * Aplica los filtros seleccionados
     */
    async applyFilters() {
        const type = DOM.filterType.value;
        const genre = DOM.filterGenre.value;
        const yearFrom = DOM.filterYearFrom.value;
        const sortBy = DOM.filterSort.value;

        state.filters = { type, genre, yearFrom, sortBy };
        state.currentPage = 1;

        this.closeFilters();
        DOM.hero.classList.remove('hidden');

        // Si estamos en search, llevar a tendencias
        if (state.currentType === 'search') {
            DOM.navLinks.forEach(link => link.classList.remove('active'));
            document.querySelector('.nav-link[data-type="trending"]')?.classList.add('active');
            state.currentType = 'trending';
        }

        Render.updateSectionTitle('Resultados filtrados');
        Render.showLoader(true);
        Render.hideError();

        try {
            let results;

            if (type === 'all') {
                // Hacemos discover para movie y tv por separado
                const [movieData, tvData] = await Promise.all([
                    TMDB.discover({
                        type: 'movie',
                        genreId: genre,
                        year: yearFrom,
                        sortBy,
                        page: 1
                    }),
                    TMDB.discover({
                        type: 'tv',
                        genreId: genre,
                        year: yearFrom,
                        sortBy,
                        page: 1
                    })
                ]);

                const combined = [
                    ...(movieData.results || []).map(r => ({ ...r, media_type: 'movie' })),
                    ...(tvData.results || []).map(r => ({ ...r, media_type: 'tv' }))
                ];
                // Ordenar por popularidad
                combined.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                results = { results: combined.slice(0, 20), page: 1, total_pages: 1 };

                if (combined.length > 0) Render.hero(combined[0]);

            } else {
                results = await TMDB.discover({
                    type,
                    genreId: genre,
                    year: yearFrom,
                    sortBy,
                    page: 1
                });
                if (results.results && results.results.length > 0) {
                    Render.hero(results.results[0]);
                }
            }

            state.totalPages = results.total_pages || 1;
            Render.cards(results.results || []);
            Render.pagination(results.page || 1, results.total_pages || 1);
            state.currentPage = results.page || 1;
        } catch (err) {
            this.handleError(err);
        } finally {
            Render.showLoader(false);
        }
    },

    /**
     * Restablece los filtros a valores por defecto
     */
    resetFilters() {
        this.resetFiltersUI();
        this.closeFilters();
        this.reloadCurrentView();
    },

    resetFiltersUI() {
        DOM.filterType.value = 'all';
        DOM.filterGenre.value = 'all';
        DOM.filterYearFrom.value = '';
        DOM.filterSort.value = 'popularity.desc';
        state.filters = { type: 'all', genre: 'all', yearFrom: '', sortBy: 'popularity.desc' };
    },

    /**
     * Navega a una página específica
     */
    async goToPage(page) {
        if (page < 1 || page > state.totalPages || state.isLoading) return;
        state.currentPage = page;

        Render.showLoader(true);
        Render.hideError();

        try {
            let data;

            if (state.currentType === 'favorites') {
                await this.loadFavoritesPage();
                Render.showLoader(false);
                return;
            } else if (state.currentType === 'search' && state.searchQuery) {
                data = await TMDB.searchMulti(state.searchQuery, page);
                data.results = (data.results || []).filter(
                    r => r.media_type === 'movie' || r.media_type === 'tv'
                );
            } else {
                switch (state.currentType) {
                    case 'trending':
                        data = await TMDB.getTrending(page);
                        break;
                    case 'movies':
                        data = await TMDB.getPopularMovies(page);
                        break;
                    case 'tv':
                        data = await TMDB.getPopularTV(page);
                        break;
                    default:
                        data = await TMDB.getTrending(page);
                }
            }

            state.totalPages = data.total_pages;
            Render.cards(data.results || []);
            Render.pagination(data.page, data.total_pages);
            state.currentPage = data.page;

            // Scroll suave hacia arriba
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            this.handleError(err);
        } finally {
            Render.showLoader(false);
        }
    },

    /**
     * Recarga la vista actual (útil al cambiar modo vista)
     */
    reloadCurrentView() {
        if (state.currentType === 'search' && state.searchQuery) {
            this.handleSearch();
        } else {
            this.goToPage(state.currentPage);
        }
    },

    /**
     * Cambia entre tema oscuro y claro
     */
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);

        // Cambiar icono
        const icon = DOM.themeToggle.querySelector('i');
        if (newTheme === 'dark') {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }

        // Guardar preferencia
        try {
            localStorage.setItem('cineverse-theme', newTheme);
        } catch { /* ignore */ }
    },

    /**
     * Carga el tema guardado
     */
    loadSavedTheme() {
        try {
            const saved = localStorage.getItem('cineverse-theme');
            if (saved === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
                const icon = DOM.themeToggle?.querySelector('i');
                if (icon) icon.className = 'fas fa-sun';
            }
        } catch { /* ignore */ }
    },

    // ============================================================
    //  AUTH & FAVORITES METHODS
    // ============================================================

    /**
     * Actualiza la UI según el estado de autenticación
     */
    updateAuthUI(user, token) {
        const isLoggedIn = !!token && !!user;
        const wasLoggedIn = state.isLoggedIn;
        state.isLoggedIn = isLoggedIn;
        state.currentUser = user;

        if (isLoggedIn) {
            // Login / Register buttons → ocultar
            if (DOM.authSection) DOM.authSection.style.display = 'none';
            // User menu → mostrar
            if (DOM.userMenu) DOM.userMenu.style.display = 'flex';
            if (DOM.userName) DOM.userName.textContent = user.username || user.email;
            const initial = (user.username || user.email || '?')[0].toUpperCase();
            if (DOM.userAvatar) DOM.userAvatar.textContent = initial;
            if (DOM.favoritesNavLink) DOM.favoritesNavLink.style.display = 'flex';
            // Cargar favoritos (async, no esperar)
            this.loadFavorites();
        } else {
            // Login / Register buttons → mostrar
            if (DOM.authSection) DOM.authSection.style.display = 'flex';
            // User menu → ocultar
            if (DOM.userMenu) DOM.userMenu.style.display = 'none';
            if (DOM.favoritesNavLink) DOM.favoritesNavLink.style.display = 'none';
            state.favorites = [];
            state.favoritesMap = {};

            // Si estábamos en la página de favoritos y cerramos sesión, volver a inicio
            if (wasLoggedIn && state.currentType === 'favorites') {
                this.switchTab('trending');
            }
        }
    },

    /**
     * Carga los favoritos del usuario desde el backend
     */
    async loadFavorites() {
        if (!state.isLoggedIn) return;
        try {
            const data = await Auth.Favorites.getAll();
            state.favorites = data.favorites || [];
            // Construir mapa rápido
            const map = {};
            state.favorites.forEach(fav => {
                map[`${fav.tmdb_id}_${fav.media_type}`] = fav.id;
            });
            state.favoritesMap = map;
        } catch (err) {
            console.warn('Error al cargar favoritos:', err);
            state.favorites = [];
            state.favoritesMap = {};
        }
    },

    /**
     * Añade o quita un favorito
     * @param {HTMLElement} btn - El botón que fue clickeado (con data-* attributes)
     */
    async toggleFavorite(btn) {
        if (!state.isLoggedIn) {
            Utils.showToast('Debes iniciar sesión para guardar favoritos', 'error');
            this.openLoginModal();
            return;
        }

        const id = btn.dataset.id;
        const mediaType = btn.dataset.type;
        const title = btn.dataset.title;
        const poster = btn.dataset.poster;
        const year = btn.dataset.year;
        const rating = btn.dataset.rating;

        const favKey = `${id}_${mediaType}`;
        const isFav = !!state.favoritesMap[favKey];

        try {
            if (isFav) {
                // Quitar de favoritos
                const favId = state.favoritesMap[favKey];
                await Auth.Favorites.remove(favId);
                delete state.favoritesMap[favKey];
                state.favorites = state.favorites.filter(f => f.id !== favId);
                btn.classList.remove('is-favorite');
                btn.querySelector('i').className = 'fas fa-heart';
                const span = btn.querySelector('span');
                if (span) span.textContent = 'Añadir a Favoritos';
                btn.setAttribute('aria-label', 'Añadir a favoritos');
                Utils.showToast('Eliminado de favoritos', 'info');
            } else {
                // Añadir a favoritos
                const data = await Auth.Favorites.add({
                    tmdb_id: parseInt(id),
                    media_type: mediaType,
                    title,
                    poster_path: poster || null,
                    year: year || null,
                    vote_average: rating ? parseFloat(rating) : null
                });
                if (data.favorite) {
                    state.favoritesMap[favKey] = data.favorite.id;
                    state.favorites.unshift(data.favorite);
                }
                btn.classList.add('is-favorite');
                btn.querySelector('i').className = 'fas fa-heart';
                const span = btn.querySelector('span');
                if (span) span.textContent = 'Quitar de Favoritos';
                btn.setAttribute('aria-label', 'Quitar de favoritos');
                Utils.showToast('Añadido a favoritos', 'success');
            }

            // Forzar actualización de la UI de favoritos si estamos en esa vista
            if (state.currentType === 'favorites') {
                this.loadFavoritesPage();
            }
        } catch (err) {
            console.error('Error al cambiar favorito:', err);
            Utils.showToast(err.message || 'Error al modificar favoritos', 'error');
        }
    },

    /**
     * Carga y muestra la página de favoritos
     */
    async loadFavoritesPage() {
        if (!state.isLoggedIn) {
            Render.updateSectionTitle('Mis Favoritos');
            Render.cards([]);
            DOM.pagination.classList.remove('active');
            return;
        }

        Render.showLoader(true);
        Render.hideError();

        try {
            // Recargar favoritos desde el servidor
            await this.loadFavorites();

            if (!state.favorites || state.favorites.length === 0) {
                Render.updateSectionTitle('Mis Favoritos');
                Render.cards([]);
                DOM.pagination.classList.remove('active');
                // El empty state ya se muestra desde Render.cards([])
                return;
            }

            // Convertir favoritos a formato de tarjeta
            const items = state.favorites.map(fav => ({
                id: fav.tmdb_id,
                media_type: fav.media_type,
                title: fav.title,
                poster_path: fav.poster_path,
                release_date: fav.year ? `${fav.year}-01-01` : null,
                first_air_date: fav.year ? `${fav.year}-01-01` : null,
                vote_average: fav.vote_average,
                overview: ''
            }));

            Render.updateSectionTitle(`Mis Favoritos (${items.length})`);
            Render.cards(items);
            DOM.pagination.classList.remove('active');
        } catch (err) {
            console.error('[Favoritos] Error:', err);
            Render.showError('Error al cargar tus favoritos. Intenta de nuevo.');
        } finally {
            Render.showLoader(false);
        }
    },

    /**
     * Abre el modal de login
     */
    openLoginModal() {
        DOM.loginError.textContent = '';
        DOM.loginError.style.display = 'none';
        DOM.registerModal.classList.remove('active');
        DOM.loginModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => DOM.loginEmail?.focus(), 100);
    },

    /**
     * Abre el modal de registro
     */
    openRegisterModal() {
        DOM.registerError.textContent = '';
        DOM.registerError.style.display = 'none';
        DOM.loginModal.classList.remove('active');
        DOM.registerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => DOM.registerUsername?.focus(), 100);
    },

    /**
     * Cierra los modales de auth
     */
    closeAuthModals() {
        DOM.loginModal.classList.remove('active');
        DOM.registerModal.classList.remove('active');
        document.body.style.overflow = '';
    },

    /**
     * Maneja el envío del formulario de login
     */
    async handleLogin(e) {
        e.preventDefault();
        const email = DOM.loginEmail.value.trim();
        const password = DOM.loginPassword.value;

        DOM.loginError.style.display = 'none';
        const submitBtn = DOM.loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';

        try {
            await Auth.login(email, password);

            // Confirmar que la sesión se estableció y actualizar UI
            const user = Auth.getUser();
            const token = Auth.getToken();

            if (token && user) {
                // Llamar directamente a updateAuthUI para asegurar que la UI se actualice
                this.updateAuthUI(user, token);
                this.closeAuthModals();
                Utils.showToast(`Bienvenido, ${user.username || user.email}`, 'success');
                DOM.loginForm.reset();
            } else {
                throw new Error('No se recibieron los datos de sesión');
            }
        } catch (err) {
            console.error('[Login Error]', err);
            DOM.loginError.textContent = err.message || 'Error al iniciar sesión';
            DOM.loginError.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Entrar';
        }
    },

    /**
     * Maneja el envío del formulario de registro
     */
    async handleRegister(e) {
        e.preventDefault();
        const username = DOM.registerUsername.value.trim();
        const email = DOM.registerEmail.value.trim();
        const password = DOM.registerPassword.value;

        DOM.registerError.style.display = 'none';
        const submitBtn = DOM.registerForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';

        try {
            await Auth.register(username, email, password);

            // Confirmar sesión y actualizar UI
            const user = Auth.getUser();
            const token = Auth.getToken();

            if (token && user) {
                this.updateAuthUI(user, token);
                this.closeAuthModals();
                Utils.showToast(`¡Bienvenido, ${user.username || user.email}!`, 'success');
                DOM.registerForm.reset();
            } else {
                throw new Error('No se recibieron los datos de sesión');
            }
        } catch (err) {
            console.error('[Register Error]', err);
            DOM.registerError.textContent = err.message || 'Error al registrarse';
            DOM.registerError.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Crear Cuenta';
        }
    },

    /**
     * Maneja errores de la API
     */
    handleError(err) {
        console.error('App Error:', err);
        Render.showLoader(false);

        if (err.message === 'API_KEY_NO_CONFIGURADA') {
            Render.showError(
                '⚠️ No has configurado tu API key de TMDB. Abre el archivo <code>js/config.js</code> y reemplaza <code>TU_API_KEY_AQUI</code> con tu clave personal.'
            );
            Utils.showToast('Configura tu API key en js/config.js', 'error');
        } else if (err.message && err.message.includes('429')) {
            Render.showError('Demasiadas solicitudes. Espera un momento y vuelve a intentarlo.');
            Utils.showToast('Límite de solicitudes alcanzado', 'error');
        } else {
            Render.showError('Error al conectar con TMDB. Verifica tu conexión e inténtalo de nuevo.');
            Utils.showToast('Error de conexión', 'error');
        }
    }
};

// ============================================================
//  ARRANQUE DE LA APLICACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    App.loadSavedTheme();
});
