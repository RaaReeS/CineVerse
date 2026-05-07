/*
 * ============================================================
 *  BASE DE DATOS SQLite - CineVerse
 * ============================================================
 *  Usa sql.js (SQLite compilado a WebAssembly) para evitar
 *  dependencias nativas. Las tablas se guardan en un archivo
 *  para persistencia entre reinicios.
 * ============================================================
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'cineverse.db');

let db = null;
let SQL = null;

/**
 * Inicializa la conexión a la base de datos.
 * Carga el archivo existente o crea uno nuevo.
 */
async function initDatabase() {
    SQL = await initSqlJs();

    // Cargar DB existente o crear nueva
    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
        console.log('📂 Base de datos cargada desde archivo');
    } else {
        db = new SQL.Database();
        console.log('🆕 Nueva base de datos creada');
    }

    // Crear tablas si no existen
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT    UNIQUE NOT NULL,
            email       TEXT    UNIQUE NOT NULL,
            password    TEXT    NOT NULL,
            avatar_url  TEXT,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS favorites (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            tmdb_id     INTEGER NOT NULL,
            media_type  TEXT    NOT NULL CHECK(media_type IN ('movie', 'tv')),
            title       TEXT    NOT NULL,
            poster_path TEXT,
            year        TEXT,
            vote_average REAL,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, tmdb_id, media_type),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Crear índices (sql.js no tiene CREATE INDEX IF NOT EXISTS para estos casos simples)
    try { db.run('CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)'); } catch (e) { /* ignore */ }
    try { db.run('CREATE INDEX IF NOT EXISTS idx_favorites_tmdb ON favorites(tmdb_id, media_type)'); } catch (e) { /* ignore */ }
    try { db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'); } catch (e) { /* ignore */ }

    // Guardar cambios iniciales
    saveDatabase();

    console.log('✅ Base de datos inicializada correctamente');
    return db;
}

/**
 * Guarda la base de datos en disco
 */
function saveDatabase() {
    if (!db) return;
    try {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    } catch (err) {
        console.error('Error al guardar la base de datos:', err);
    }
}

/**
 * Obtiene la instancia de la base de datos
 */
function getDatabase() {
    if (!db) {
        throw new Error('La base de datos no ha sido inicializada. Llama a initDatabase() primero.');
    }
    return db;
}

/**
 * Cierra la conexión a la base de datos
 */
function closeDatabase() {
    if (db) {
        saveDatabase();
        db.close();
        db = null;
        console.log('🔒 Base de datos cerrada');
    }
}

// ============================================================
//  HELPERS - API similar a better-sqlite3
// ============================================================

/**
 * Ejecuta una consulta SELECT y devuelve la primera fila como objeto
 */
function dbGet(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    let row = null;
    if (stmt.step()) {
        row = stmt.getAsObject();
    }
    stmt.free();
    return row;
}

/**
 * Ejecuta una consulta SELECT y devuelve todas las filas como array de objetos
 */
function dbAll(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
}

/**
 * Ejecuta una consulta INSERT/UPDATE/DELETE y devuelve el resultado
 */
function dbRun(sql, params = []) {
    db.run(sql, params);
    saveDatabase();
    return {
        lastInsertRowid: db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0],
        changes: db.getRowsModified()
    };
}

module.exports = { initDatabase, getDatabase, closeDatabase, dbGet, dbAll, dbRun };
