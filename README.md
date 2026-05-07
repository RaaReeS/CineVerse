<div align="center">
  <br/>
  <a href="#">
    <img src="https://img.shields.io/badge/version-2.0.0-blue.svg" alt="Version 2.0.0">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg" alt="Node >= 16">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/PRs-welcome-orange.svg" alt="PRs Welcome">
  </a>
  <br/><br/>
</div>

<h1 align="center">
  🎬 CineVerse
</h1>

<p align="center">
  <strong>Catálogo de películas y series con datos de TMDB</strong><br/>
  Una aplicación web tipo Netflix para explorar tendencias, descubrir contenido, gestionar favoritos y más.
</p>

<p align="center">
  <a href="#características">Características</a> •
  <a href="#capturas-de-pantalla">Capturas</a> •
  <a href="#stack-tecnológico">Stack</a> •
  <a href="#instalación">Instalación</a> •
  <a href="#configuración">Configuración</a> •
  <a href="#uso">Uso</a> •
  <a href="#api-reference">API</a> •
  <a href="#estructura-del-proyecto">Estructura</a> •
  <a href="#seguridad">Seguridad</a> •
  <a href="#licencia">Licencia</a>
</p>

---

## 📖 Descripción

**CineVerse** es una aplicación web moderna (SPA) que consume la API de [The Movie Database (TMDB)](https://www.themoviedb.org/) para ofrecer un catálogo completo de películas y series. Construida con **Node.js + Express** en el backend y **JavaScript Vanilla** en el frontend, proporciona una experiencia fluida tipo Netflix con autenticación de usuarios, gestión de favoritos, tema oscuro/claro y diseño responsive.

> 🚀 **Sin frameworks frontend. Sin build steps. Directo al navegador.**

---

## ✨ Características

### 🎯 Exploración y Descubrimiento

| Funcionalidad | Descripción |
|---|---|
| **Tendencias semanales** | Contenido trending actualizado cada semana desde TMDB |
| **Películas populares** | Las películas más populares del momento |
| **Series populares** | Las series con mayor popularidad |
| **Búsqueda multiconenido** | Busca películas y series con autocompletado en tiempo real |
| **Descubrimiento con filtros** | Filtra por tipo (película/serie), género, año y orden |
| **Paginación** | Navegación entre páginas de resultados |

### 📺 Visualización

- **Vista en cuadrícula** (grid) con pósters
- **Vista en lista** con información más detallada
- **Modal de detalle completo**: sinopsis, reparto, puntuación, año, duración, etiquetas
- **Reproducción de tráilers** de YouTube en modal integrado
- **Hero section** con contenido destacado al inicio

### 🔐 Autenticación y Usuarios

- **Registro** de nuevos usuarios con validación
- **Inicio de sesión** con JWT (expiración: 7 días)
- **Sesión persistente** en localStorage
- **Perfil de usuario** con datos básicos

### ⭐ Favoritos

- **Añadir/eliminar** contenido de una lista personal de favoritos
- **Verificación en tiempo real** del estado de favorito en cada contenido
- **Lista completa** de favoritos del usuario autenticado

### 🎨 Experiencia de Usuario

- **Tema oscuro/claro** con toggle y persistencia en `localStorage`
- **Notificaciones toast** con tipos: `success`, `error`, `info`
- **Atajos de teclado**: `Escape` para cerrar modales
- **Diseño responsive** con 3 breakpoints: 1024px, 768px, 480px
- **Estados visuales**: loading, error, empty state para cada operación

---

## 📸 Capturas de Pantalla

> *Agrega aquí capturas de tu aplicación.*

```
[Vista principal - Tendencias]
[Modal de detalle de película]
[Modal de tráiler]
[Panel de filtros]
[Vista de favoritos]
[Modo claro vs modo oscuro]
```

---

## 🧰 Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| [Node.js](https://nodejs.org/) | ≥ 16 | Entorno de ejecución |
| [Express](https://expressjs.com/) | 4.18.2 | Framework web |
| [sql.js](https://github.com/sql-js/sql.js) | 1.11.0 | SQLite compilado a WebAssembly |
| [bcryptjs](https://github.com/dcodeIO/bcryptjs) | 2.4.3 | Hash de contraseñas |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | 9.0.2 | Tokens JWT |
| [cors](https://github.com/expressjs/cors) | 2.8.5 | Middleware CORS |
| [dotenv](https://github.com/motdotla/dotenv) | 17.4.2 | Variables de entorno |

### Frontend

| Tecnología | Propósito |
|---|---|
| **HTML5** | Estructura semántica |
| **CSS3** | Estilos con theming (oscuro/claro) |
| **JavaScript ES6+** | Lógica de la SPA (sin frameworks) |
| [Font Awesome 6.5.0](https://fontawesome.com/) | Iconografía |
| [Google Fonts (Inter)](https://fonts.google.com/specimen/Inter) | Tipografía |

### APIs Externas

| API | Uso |
|---|---|
| [TMDB API v3](https://developers.themoviedb.org/3) | Datos de películas, series, imágenes y vídeos |
| [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) | Reproducción de tráilers |

---

## 📦 Instalación

### Requisitos previos

- **Node.js** versión 16 o superior
- **Navegador moderno** (Chrome, Firefox, Edge, Safari)
- **Conexión a Internet** (para consumir la API de TMDB y cargar fuentes externas)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/cineverse.git
cd cineverse

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional)
#    Edita el archivo .env con tus valores o usa los valores por defecto

# 4. Iniciar el servidor
npm start
#    o en modo desarrollo
npm run dev

# 5. Abrir en el navegador
#    http://localhost:3000
```

> 💡 **Nota:** La base de datos SQLite se crea automáticamente en la primera ejecución. No requiere configuración adicional.

---

## ⚙️ Configuración

### Variables de Entorno (.env)

Copia el archivo `.env` proporcionado o crea uno nuevo:

```env
# ============================================================
#  CINEVERSE - VARIABLES DE ENTORNO
# ============================================================

# Puerto del servidor Express
PORT=3000

# Entorno: development | production
NODE_ENV=development

# ----------------------------------------------------------
#  JWT - Clave secreta para firmar los tokens de autenticación
# ----------------------------------------------------------
#  En producción, genera una clave segura con:
#    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=tu_clave_secreta_aqui

# ----------------------------------------------------------
#  TMDB (The Movie Database) - API Configuration
# ----------------------------------------------------------
#  Obtén tu API Key gratuita en:
#  https://www.themoviedb.org/settings/api
TMDB_API_KEY=tu_api_key_de_tmdb

# Idioma por defecto para las respuestas de TMDB
TMDB_LANGUAGE=es-ES

# Región por defecto para TMDB
TMDB_REGION=ES

# ----------------------------------------------------------
#  BASE DE DATOS SQLite
# ----------------------------------------------------------
#  Ruta donde se guardará el archivo de la base de datos
DATABASE_PATH=./cineverse.db
```

### Descripción de Variables

| Variable | Por Defecto | Obligatoria | Descripción |
|---|---|---|---|
| `PORT` | `3000` | No | Puerto donde escucha el servidor Express |
| `NODE_ENV` | `development` | No | Entorno de ejecución |
| `JWT_SECRET` | — | **Sí** | Clave secreta para firmar tokens JWT |
| `TMDB_API_KEY` | — | **Sí** | API Key de The Movie Database |
| `TMDB_LANGUAGE` | `es-ES` | No | Idioma de las respuestas de TMDB |
| `TMDB_REGION` | `ES` | No | Región para contenido regionalizado |
| `DATABASE_PATH` | `./cineverse.db` | No | Ruta del archivo de base de datos SQLite |

> ⚠️ **Importante:** Nunca subas tu archivo `.env` a un repositorio público. El `.gitignore` ya lo excluye automáticamente.

---

## 🚀 Uso

### Navegación Principal

1. **Tendencias** → Muestra las tendencias semanales de TMDB
2. **Películas** → Películas más populares
3. **Series** → Series más populares
4. **Favoritos** (🔒 requiere inicio de sesión) → Contenido guardado por el usuario

### Búsqueda

Escribe en la barra de búsqueda para obtener resultados con autocompletado. Presiona `Enter` o haz clic en el icono de lupa para ver todos los resultados de la búsqueda.

### Filtros

Haz clic en el icono de filtro (`sliders-h`) para abrir el panel lateral y refinar los resultados por:

- **Tipo**: Todos, Películas o Series
- **Género**: Acción, Comedia, Drama, etc. (se carga dinámicamente)
- **Año desde**: Filtra por año de lanzamiento
- **Ordenar por**: Popularidad, Puntuación, Año, Título

### Vista de Detalle

Haz clic en cualquier tarjeta de contenido para abrir el modal de detalle con:

- Póster y backdrop
- Título original y sinopsis
- Año, duración, género
- Puntuación y número de votos
- Reparto principal
- Botón "Ver Tráiler" (⚠️ solo visible si hay tráiler disponible)
- Botón "Favorito" (❤️ / 🤍)

### Temas

Usa el botón de luna/sol en la esquina superior derecha para alternar entre modo oscuro (por defecto) y modo claro. La preferencia se guarda automáticamente.

### Atajos de Teclado

| Tecla | Acción |
|---|---|
| `Escape` | Cierra cualquier modal abierto |

---

## 📡 API Reference

### Health Check

```
GET /api/health
```

**Respuesta:**
```json
{
  "success": true,
  "message": "CineVerse API funcionando correctamente",
  "version": "2.0.0",
  "timestamp": "2026-05-07T12:00:00.000Z"
}
```

### Autenticación

---

#### `POST /api/auth/register`

Registra un nuevo usuario.

**Body:**
```json
{
  "username": "usuario123",
  "email": "usuario@email.com",
  "password": "miPassword123"
}
```

**Validaciones:**
- `username`: 3-30 caracteres, obligatorio
- `email`: formato válido, obligatorio, único
- `password`: mínimo 6 caracteres, obligatorio

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@email.com",
    "avatar_url": null
  }
}
```

**Errores:**
- `400` → Campos obligatorios faltantes o formato inválido
- `409` → Email o nombre de usuario ya existente

---

#### `POST /api/auth/login`

Inicia sesión con credenciales existentes.

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "miPassword123"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión correcto",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@email.com",
    "avatar_url": null
  }
}
```

**Errores:**
- `400` → Email o contraseña faltantes
- `401` → Credenciales incorrectas

---

#### `GET /api/auth/me`

Obtiene los datos del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "usuario123",
    "email": "usuario@email.com",
    "avatar_url": null,
    "created_at": "2026-05-07 12:00:00"
  }
}
```

**Errores:**
- `401` → Token no proporcionado, expirado o inválido
- `404` → Usuario no encontrado

---

### Favoritos (🔒 Requieren JWT)

Todas las rutas de favoritos requieren el header:

```
Authorization: Bearer <token>
```

---

#### `GET /api/favorites`

Lista todos los favoritos del usuario autenticado.

**Respuesta (200):**
```json
{
  "success": true,
  "favorites": [
    {
      "id": 1,
      "tmdb_id": 550,
      "media_type": "movie",
      "title": "Fight Club",
      "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "year": "1999",
      "vote_average": 8.4,
      "created_at": "2026-05-07 12:00:00"
    }
  ]
}
```

---

#### `POST /api/favorites`

Añade un nuevo favorito.

**Body:**
```json
{
  "tmdb_id": 550,
  "media_type": "movie",
  "title": "Fight Club",
  "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "year": "1999",
  "vote_average": 8.4
}
```

**Campos obligatorios:** `tmdb_id`, `media_type` (`"movie"` o `"tv"`), `title`

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Añadido a favoritos",
  "favorite": {
    "id": 1,
    "user_id": 1,
    "tmdb_id": 550,
    "media_type": "movie",
    "title": "Fight Club",
    "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    "year": "1999",
    "vote_average": 8.4,
    "created_at": "2026-05-07 12:00:00"
  }
}
```

**Errores:**
- `400` → Campos obligatorios faltantes o `media_type` inválido
- `409` → El contenido ya está en favoritos

---

#### `DELETE /api/favorites/:id`

Elimina un favorito por su ID.

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Eliminado de favoritos"
}
```

**Errores:**
- `404` → Favorito no encontrado o no pertenece al usuario

---

#### `GET /api/favorites/check/:tmdbId/:mediaType`

Verifica si un contenido está en favoritos.

**Parámetros de ruta:** `tmdbId` (number), `mediaType` (`movie` | `tv`)

**Respuesta (200):**
```json
{
  "success": true,
  "is_favorite": true,
  "favorite_id": 1
}
```

---

### Proxy TMDB

Todas las rutas hacia TMDB se realizan a través de un proxy en el backend para ocultar la API Key.

```
GET /api/tmdb/*
```

El proxy reenvía cualquier ruta después de `/api/tmdb/` a `https://api.themoviedb.org/3/`, añadiendo automáticamente los parámetros `api_key`, `language` y `region` desde las variables de entorno.

**Ejemplos de uso desde el frontend:**

| Frontend (fetch) | Equivalente TMDB |
|---|---|
| `/api/tmdb/trending/all/week?page=1` | `GET /3/trending/all/week?api_key=xxx&page=1` |
| `/api/tmdb/movie/popular` | `GET /3/movie/popular?api_key=xxx` |
| `/api/tmdb/tv/popular` | `GET /3/tv/popular?api_key=xxx` |
| `/api/tmdb/search/multi?query=batman` | `GET /3/search/multi?api_key=xxx&query=batman` |
| `/api/tmdb/discover/movie?with_genres=28` | `GET /3/discover/movie?api_key=xxx&with_genres=28` |
| `/api/tmdb/genre/movie/list` | `GET /3/genre/movie/list?api_key=xxx` |
| `/api/tmdb/movie/550?append_to_response=videos,credits` | `GET /3/movie/550?api_key=xxx&append_to_response=videos,credits` |
| `/api/tmdb/movie/550/videos` | `GET /3/movie/550/videos?api_key=xxx` |

---

## 📂 Estructura del Proyecto

```
CineVerse/
├── .env                          # Variables de entorno (no trackeado)
├── .gitignore                    # Archivos ignorados por git
├── package.json                  # Dependencias y scripts
├── LICENSE                       # Licencia MIT
│
├── server.js                     # Servidor Express principal
│                                 # - Sirve archivos estáticos
│                                 # - Monta rutas de API
│                                 # - Health check
│                                 # - SPA fallback
│                                 # - Manejo global de errores
│
├── db.js                         # Módulo de base de datos SQLite
│                                 # - Inicialización y persistencia
│                                 # - Helpers: dbGet, dbAll, dbRun
│                                 # - Creación automática de tablas
│
├── cineverse.db                  # Archivo de base de datos (generado)
│
├── middleware/
│   └── auth.js                   # Middleware de autenticación JWT
│                                 # - authMiddleware: verifica token
│                                 # - generateToken: crea token (7d)
│
├── routes/
│   ├── auth.js                   # Rutas de autenticación
│   │   ├── POST /api/auth/register
│   │   ├── POST /api/auth/login
│   │   └── GET  /api/auth/me
│   │
│   ├── favorites.js              # Rutas CRUD de favoritos
│   │   ├── GET    /api/favorites
│   │   ├── POST   /api/favorites
│   │   ├── DELETE /api/favorites/:id
│   │   └── GET    /api/favorites/check/:tmdbId/:mediaType
│   │
│   └── tmdb.js                   # Proxy genérico hacia TMDB API
│                                 # - Oculta la API Key del cliente
│                                 # - Añade language y region
│                                 # - Manejo de errores de conexión
│
└── public/
    ├── index.html                # SPA - Único archivo HTML
    │                             # - Navbar, Hero, Main, Footer
    │                             # - Modales (detalle, tráiler, auth)
    │                             # - Toast container
    │
    ├── css/
    │   └── styles.css            # Estilos completos
    │                             # - Sistema de theming (CSS vars)
    │                             # - Diseño responsive (3 breakpoints)
    │                             # - Componentes: navbar, hero, grid, modal, etc.
    │
    └── js/
        ├── config.js             # Configuración del frontend
        │                         # - API_CONFIG (URL del backend)
        │                         # - TMDB_CONFIG (proxy, imágenes)
        │
        ├── auth.js               # Módulo de autenticación cliente
        │                         # - Auth (registro, login, logout)
        │                         # - Manejo de sesión (localStorage)
        │                         # - Favorites API wrapper
        │                         # - Sistema de listeners onAuthChange
        │
        └── app.js                # Lógica principal de la aplicación
                                  # - Estado global (state)
                                  # - Renderizado de resultados
                                  # - Navegación y filtros
                                  # - Búsqueda con autocompletado
                                  # - Hero section
                                  # - Modal de detalle y tráiler
                                  # - Paginación
                                  # - Sistema de notificaciones toast
                                  # - Atajos de teclado
                                  # - Integración con Auth y Favorites
```

---

## 🗄️ Modelo de Datos

### Tabla: `users`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | INTEGER | `PRIMARY KEY AUTOINCREMENT` | Identificador único |
| `username` | TEXT | `UNIQUE NOT NULL` | Nombre de usuario (3-30 caracteres) |
| `email` | TEXT | `UNIQUE NOT NULL` | Correo electrónico |
| `password` | TEXT | `NOT NULL` | Hash de contraseña (bcrypt, salt=10) |
| `avatar_url` | TEXT | — | URL del avatar (opcional) |
| `created_at` | DATETIME | `DEFAULT CURRENT_TIMESTAMP` | Fecha de registro |
| `updated_at` | DATETIME | `DEFAULT CURRENT_TIMESTAMP` | Última actualización |

### Tabla: `favorites`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | INTEGER | `PRIMARY KEY AUTOINCREMENT` | Identificador único |
| `user_id` | INTEGER | `NOT NULL, FK → users(id) ON DELETE CASCADE` | Usuario propietario |
| `tmdb_id` | INTEGER | `NOT NULL` | ID del contenido en TMDB |
| `media_type` | TEXT | `NOT NULL CHECK(IN ('movie','tv'))` | Tipo de contenido |
| `title` | TEXT | `NOT NULL` | Título del contenido |
| `poster_path` | TEXT | — | Ruta del póster (relativa) |
| `year` | TEXT | — | Año de lanzamiento |
| `vote_average` | REAL | — | Puntuación media en TMDB |
| `created_at` | DATETIME | `DEFAULT CURRENT_TIMESTAMP` | Fecha de añadido |

> 🔗 **Índices:** `favorites(user_id)`, `favorites(tmdb_id, media_type)`, `users(email)`
>
> 🔒 **Restricción única:** `UNIQUE(user_id, tmdb_id, media_type)` — no se puede duplicar un favorito

---

## 🔒 Seguridad

El proyecto implementa las siguientes medidas de seguridad:

### 🔐 Protección de Credenciales

| Medida | Detalle |
|---|---|
| **API Key oculta** | La `TMDB_API_KEY` se configura en el servidor (`.env`) y nunca se expone al frontend. Todas las peticiones a TMDB pasan por un proxy en `/api/tmdb/*`. |
| **Contraseñas hasheadas** | Utiliza `bcryptjs` con 10 rondas de sal (`salt rounds`) para almacenar las contraseñas de forma segura. |
| **Tokens JWT** | Los tokens de sesión se firman con una clave secreta (`JWT_SECRET`) y expiran en 7 días. |

### 🛡️ Protección de Rutas

| Ruta | Protección |
|---|---|
| `GET /api/auth/me` | Requiere token JWT válido |
| `GET /api/favorites/*` | Requiere token JWT válido |
| `POST /api/favorites` | Requiere token JWT válido |
| `DELETE /api/favorites/:id` | Requiere token JWT válido + verifica propiedad |
| `/api/tmdb/*` | Público (la API Key se inyecta del lado del servidor) |

### ✅ Validaciones en Backend

- **Registro**: validación de formato de email, longitud de username (3-30) y contraseña (≥ 6 caracteres)
- **Login**: verificación de credenciales contra la base de datos
- **Favoritos**: validación de `media_type` (`movie`/`tv`), verificación de unicidad por usuario

### 📁 Archivos Sensibles

- `.env` está incluido en `.gitignore` para evitar subir credenciales al repositorio
- `*.db` está incluido en `.gitignore` para evitar subir datos de usuarios

---

## 🧪 Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor en modo producción |
| `npm run dev` | Inicia el servidor en modo desarrollo (actualmente igual que `start`) |

---

## 🌐 Endpoints TMDB Consumidos

A través del proxy `/api/tmdb/` se accede a los siguientes endpoints de la API v3 de TMDB:

| Endpoint TMDB | Propósito |
|---|---|
| `GET /trending/all/week` | Tendencias semanales |
| `GET /movie/popular` | Películas populares |
| `GET /tv/popular` | Series populares |
| `GET /search/multi` | Búsqueda multiconenido |
| `GET /discover/movie` | Descubrimiento de películas con filtros |
| `GET /discover/tv` | Descubrimiento de series con filtros |
| `GET /genre/movie/list` | Lista de géneros de películas |
| `GET /genre/tv/list` | Lista de géneros de series |
| `GET /{type}/{id}` | Detalle de contenido (con `append_to_response=videos,credits`) |
| `GET /{type}/{id}/videos` | Vídeos/tráilers de un contenido |

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Haz un **fork** del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -m 'feat: añadir nueva funcionalidad'`)
4. Sube los cambios (`git push origin feature/nueva-funcionalidad`)
5. Abre un **Pull Request**

### Guías de Estilo

- **Backend**: Código limpio con comentarios en bloque descriptivos al inicio de cada archivo/función
- **Frontend**: JavaScript Vanilla con el patrón de módulo (`IIFE`), estructura clara y comentada
- **Commits**: Preferir el formato `tipo: descripción` (ej: `feat:`, `fix:`, `refactor:`, `docs:`)

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.

```
MIT License

Copyright (c) 2026 CineVerse

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Agradecimientos

- **[The Movie Database (TMDB)](https://www.themoviedb.org/)** por proporcionar una API tan completa y generosa para datos de películas y series
- **[Font Awesome](https://fontawesome.com/)** por la increíble biblioteca de iconos
- **[Google Fonts](https://fonts.google.com/)** por la tipografía Inter

---

<div align="center">
  <br/>
  <p>
    Hecho con ❤️ y mucho ☕
  </p>
  <p>
    <sub>Datos proporcionados por <a href="https://www.themoviedb.org/" target="_blank" rel="noopener">TMDB</a>. Esta aplicación es solo con fines educativos.</sub>
  </p>
</div>
