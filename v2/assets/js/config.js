/**
 * BEATS v2.0 - Configuración Global y Datos de Respaldo
 * @author Brayan Balza
 */

export const APP_CONFIG = {
    APP_NAME: 'BEATS',
    VERSION: '2.0.0',
    API_BASE_URL: 'https://api.institutoalfa.org/api/songs',
    API_TIMEOUT_MS: 4500,
    CACHE_STORAGE_KEY: 'beats_v2_catalog_cache',
    CACHE_TIMESTAMP_KEY: 'beats_v2_cache_time',
    CACHE_TTL_MS: 1000 * 60 * 60 * 24, // 24 Horas
    DEFAULT_VOLUME: 0.8,
    PLAYBACK_SPEEDS: [1.0, 1.25, 1.5, 2.0],
};

/**
 * Catálogo de respaldo local resiliente de alta calidad.
 * Se utiliza cuando la API externa no responde o no cuenta con conexión a internet.
 * Vincula directamente los recursos visuales del repositorio en ../Assets/
 */
export const FALLBACK_PLAYLIST = [
    {
        id: 'fb-01',
        title: 'Moth To A Flame',
        author: 'Swedish House Mafia & The Weeknd',
        genre: 'Pop',
        duration: 234,
        image: {
            filename: 'moth to a flame.jpg',
            fallbackPath: '../Assets/moth to a flame.jpg'
        },
        audio: {
            filename: 'moth_to_a_flame.mp3',
            streamUrl: 'https://cdn.freesound.org/previews/612/612627_5674468-lq.mp3'
        }
    },
    {
        id: 'fb-02',
        title: 'Blinding Lights',
        author: 'The Weeknd',
        genre: 'Pop',
        duration: 200,
        image: {
            filename: 'the weeknd.jpg',
            fallbackPath: '../Assets/the weeknd.jpg'
        },
        audio: {
            filename: 'blinding_lights.mp3',
            streamUrl: 'https://cdn.freesound.org/previews/676/676402_14690325-lq.mp3'
        }
    },
    {
        id: 'fb-03',
        title: 'Vampire',
        author: 'Olivia Rodrigo',
        genre: 'Pop',
        duration: 219,
        image: {
            filename: 'Olivia Rodrigo.jpg',
            fallbackPath: '../Assets/Olivia Rodrigo.jpg'
        },
        audio: {
            filename: 'vampire.mp3',
            streamUrl: 'https://cdn.freesound.org/previews/557/557815_11861866-lq.mp3'
        }
    },
    {
        id: 'fb-04',
        title: 'High & Dry (Cover)',
        author: 'Rawayana',
        genre: 'Latino',
        duration: 228,
        image: {
            filename: 'Rawayana.jpg',
            fallbackPath: '../Assets/Rawayana.jpg'
        },
        audio: {
            filename: 'rawayana.mp3',
            streamUrl: 'https://cdn.freesound.org/previews/682/682633_11861866-lq.mp3'
        }
    },
    {
        id: 'fb-05',
        title: 'Bohemian Rhapsody',
        author: 'Queen',
        genre: 'Rock',
        duration: 354,
        image: {
            filename: 'queen.jpg',
            fallbackPath: '../Assets/queen.jpg'
        },
        audio: {
            filename: 'queen.mp3',
            streamUrl: 'https://cdn.freesound.org/previews/530/530415_11861866-lq.mp3'
        }
    },
    {
        id: 'fb-06',
        title: "There's Nothing Holdin' Me Back",
        author: 'Shawn Mendes',
        genre: 'Pop',
        duration: 199,
        image: {
            filename: 'shawn_mendes.jpg',
            fallbackPath: '../Assets/shawn_mendes.jpg'
        },
        audio: {
            filename: 'shawn_mendes.mp3',
            streamUrl: 'https://cdn.freesound.org/previews/511/511384_11861866-lq.mp3'
        }
    },
    {
        id: 'fb-07',
        title: 'Those Eyes',
        author: 'New West',
        genre: 'Indie',
        duration: 220,
        image: {
            filename: 'those eyes.jpg',
            fallbackPath: '../Assets/those eyes.jpg'
        },
        audio: {
            filename: 'those_eyes.mp3',
            streamUrl: 'https://cdn.freesound.org/previews/615/615099_11861866-lq.mp3'
        }
    },
    {
        id: 'fb-08',
        title: 'Midnight Beats Intro',
        author: 'Beats Original Studio',
        genre: 'Indie',
        duration: 180,
        image: {
            filename: 'starting.jpg',
            fallbackPath: '../Assets/starting.jpg'
        },
        audio: {
            filename: 'intro.mp3',
            streamUrl: 'https://cdn.freesound.org/previews/612/612627_5674468-lq.mp3'
        }
    }
];
