/**
 * BEATS v2.0 - Servicio de API Resiliente y Sanitización
 * @author Brayan Balza
 */

import { APP_CONFIG, FALLBACK_PLAYLIST } from './config.js';

export class ApiService {
    /**
     * Sanitiza cadenas de texto para prevenir inyecciones de código (XSS).
     * @param {string} str 
     * @returns {string}
     */
    static sanitizeText(str) {
        if (!str || typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }

    /**
     * Valida y sanitiza URLs para evitar esquemas peligrosos como javascript: o data: maliciosos.
     * @param {string} url 
     * @param {string} fallback 
     * @returns {string}
     */
    static sanitizeUrl(url, fallback = '../Assets/starting.jpg') {
        if (!url || typeof url !== 'string') return fallback;
        const trimmed = url.trim();
        // Solo permite protocolos seguros o rutas relativas
        if (trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('../') || trimmed.startsWith('./') || trimmed.startsWith('blob:')) {
            return encodeURI(trimmed);
        }
        return fallback;
    }

    /**
     * Obtiene el catálogo de canciones aplicando timeout, caché local y fallback offline.
     * @returns {Promise<{ songs: Array, source: 'live' | 'cached' | 'offline' }>}
     */
    static async fetchSongs() {
        // 1. Intentar cargar desde la API remota con AbortController
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.API_TIMEOUT_MS);

            const response = await fetch(APP_CONFIG.API_BASE_URL, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data.songs) && data.songs.length > 0) {
                    const normalized = this.normalizeApiResponse(data.songs);
                    this.saveToCache(normalized);
                    return { songs: normalized, source: 'live' };
                }
            }
        } catch (error) {
            console.warn('[BEATS API] La API remota no está disponible o excedió el tiempo límite:', error.message);
        }

        // 2. Intentar recuperar desde caché local
        const cached = this.loadFromCache();
        if (cached && cached.length > 0) {
            return { songs: cached, source: 'cached' };
        }

        // 3. Fallback resiliente con datos locales preconfigurados
        return {
            songs: FALLBACK_PLAYLIST.map((song) => ({
                id: song.id,
                title: song.title,
                author: song.author,
                genre: song.genre || 'Pop',
                imageUrl: song.image.fallbackPath,
                audioUrl: song.audio.streamUrl || `https://api.institutoalfa.org/api/songs/audio/${song.audio.filename}`,
                duration: song.duration || 180
            })),
            source: 'offline'
        };
    }

    /**
     * Normaliza los datos de la API para garantizar compatibilidad y seguridad.
     * @param {Array} rawSongs 
     * @returns {Array}
     */
    static normalizeApiResponse(rawSongs) {
        return rawSongs.map((song, index) => {
            const imageFilename = song.image?.filename || 'starting.jpg';
            const audioFilename = song.audio?.filename || '';
            
            return {
                id: song._id || `song-${index}`,
                title: this.sanitizeText(song.title) || `Pista ${index + 1}`,
                author: this.sanitizeText(song.author) || 'Artista Desconocido',
                genre: song.genre || 'General',
                imageUrl: `https://api.institutoalfa.org/api/songs/image/${imageFilename}`,
                audioUrl: `https://api.institutoalfa.org/api/songs/audio/${audioFilename}`,
                duration: song.duration || 0
            };
        });
    }

    /**
     * Guarda el catálogo en localStorage para funcionamiento offline y rendimiento instantáneo.
     * @param {Array} songs 
     */
    static saveToCache(songs) {
        try {
            localStorage.setItem(APP_CONFIG.CACHE_STORAGE_KEY, JSON.stringify(songs));
            localStorage.setItem(APP_CONFIG.CACHE_TIMESTAMP_KEY, Date.now().toString());
        } catch (e) {
            console.warn('[BEATS Storage] No se pudo escribir en el almacenamiento local.', e);
        }
    }

    /**
     * Recupera el catálogo de la caché si no ha expirado.
     * @returns {Array|null}
     */
    static loadFromCache() {
        try {
            const cached = localStorage.getItem(APP_CONFIG.CACHE_STORAGE_KEY);
            const time = localStorage.getItem(APP_CONFIG.CACHE_TIMESTAMP_KEY);
            if (!cached || !time) return null;

            const isExpired = Date.now() - parseInt(time, 10) > APP_CONFIG.CACHE_TTL_MS;
            if (isExpired) return null;

            return JSON.parse(cached);
        } catch (e) {
            return null;
        }
    }
}
