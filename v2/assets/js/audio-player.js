/**
 * BEATS v2.0 - Controlador del Motor de Audio y Estado
 * @author Brayan Balza
 */

import { APP_CONFIG } from './config.js';

export class AudioPlayer {
    /**
     * @param {HTMLAudioElement} audioElement 
     */
    constructor(audioElement) {
        this.audio = audioElement;
        this.playlist = [];
        this.filteredPlaylist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = APP_CONFIG.DEFAULT_VOLUME;
        this.previousVolume = APP_CONFIG.DEFAULT_VOLUME;
        this.isShuffle = false;
        this.repeatMode = 'off'; // 'off' | 'all' | 'one'
        this.currentSpeedIndex = 0;

        // Callbacks para la UI
        this.callbacks = {
            onTrackChange: null,
            onPlayStateChange: null,
            onTimeUpdate: null,
            onDurationChange: null,
            onVolumeChange: null,
            onModeChange: null,
            onError: null,
        };

        this.initAudioListeners();
        this.setVolume(this.volume);
    }

    /**
     * Configura los escuchadores de eventos nativos del elemento de audio.
     */
    initAudioListeners() {
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.callbacks.onPlayStateChange?.(true);
            this.updateMediaSessionPlaybackState('playing');
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.callbacks.onPlayStateChange?.(false);
            this.updateMediaSessionPlaybackState('paused');
        });

        this.audio.addEventListener('timeupdate', () => {
            const current = this.audio.currentTime || 0;
            const duration = this.audio.duration || 0;
            this.callbacks.onTimeUpdate?.(current, duration);
            this.updateMediaSessionPosition();
        });

        this.audio.addEventListener('loadedmetadata', () => {
            const duration = this.audio.duration || 0;
            this.callbacks.onDurationChange?.(duration);
        });

        this.audio.addEventListener('ended', () => {
            this.handleTrackEnded();
        });

        this.audio.addEventListener('error', (e) => {
            console.error('[BEATS Audio] Error de reproducción:', e);
            this.callbacks.onError?.('No se pudo reproducir este archivo de audio. Saltando al siguiente...');
            // Intentar saltar tras error
            setTimeout(() => this.next(true), 1500);
        });
    }

    /**
     * Establece la lista de canciones principal.
     * @param {Array} songs 
     */
    setPlaylist(songs) {
        this.playlist = songs;
        this.filteredPlaylist = [...songs];
    }

    /**
     * Obtiene la canción actual.
     */
    getCurrentSong() {
        return this.filteredPlaylist[this.currentIndex] || null;
    }

    /**
     * Carga una pista por su índice.
     * @param {number} index 
     * @param {boolean} autoPlay 
     */
    loadTrack(index, autoPlay = true) {
        if (this.filteredPlaylist.length === 0) return;

        if (index < 0) {
            this.currentIndex = this.filteredPlaylist.length - 1;
        } else if (index >= this.filteredPlaylist.length) {
            this.currentIndex = 0;
        } else {
            this.currentIndex = index;
        }

        const song = this.getCurrentSong();
        if (!song) return;

        this.audio.src = song.audioUrl;
        this.audio.playbackRate = APP_CONFIG.PLAYBACK_SPEEDS[this.currentSpeedIndex];

        this.callbacks.onTrackChange?.(song, this.currentIndex);
        this.setupMediaSession(song);

        if (autoPlay) {
            this.play();
        }
    }

    /**
     * Alterna entre reproducir y pausar.
     */
    async togglePlay() {
        if (!this.audio.src && this.filteredPlaylist.length > 0) {
            this.loadTrack(0, true);
            return;
        }

        if (this.audio.paused) {
            await this.play();
        } else {
            this.pause();
        }
    }

    async play() {
        try {
            await this.audio.play();
        } catch (err) {
            console.warn('[BEATS Audio] La reproducción automática fue prevenida por el navegador:', err);
            this.isPlaying = false;
            this.callbacks.onPlayStateChange?.(false);
        }
    }

    pause() {
        this.audio.pause();
    }

    /**
     * Avanza a la siguiente canción respetando modos de reproducción.
     * @param {boolean} autoPlay 
     */
    next(autoPlay = true) {
        if (this.filteredPlaylist.length === 0) return;

        if (this.isShuffle) {
            let nextIndex = Math.floor(Math.random() * this.filteredPlaylist.length);
            if (this.filteredPlaylist.length > 1 && nextIndex === this.currentIndex) {
                nextIndex = (nextIndex + 1) % this.filteredPlaylist.length;
            }
            this.loadTrack(nextIndex, autoPlay);
        } else {
            this.loadTrack(this.currentIndex + 1, autoPlay);
        }
    }

    /**
     * Retrocede a la canción anterior o reinicia la pista actual.
     */
    previous(autoPlay = true) {
        if (this.filteredPlaylist.length === 0) return;

        // Si la pista lleva más de 3 segundos reproduciéndose, reiniciarla
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            if (!this.isPlaying && autoPlay) this.play();
            return;
        }

        this.loadTrack(this.currentIndex - 1, autoPlay);
    }

    /**
     * Maneja el fin de una canción según el modo de repetición.
     */
    handleTrackEnded() {
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.play();
        } else if (this.repeatMode === 'all') {
            this.next(true);
        } else {
            // 'off'
            if (this.currentIndex < this.filteredPlaylist.length - 1) {
                this.next(true);
            } else {
                this.pause();
                this.audio.currentTime = 0;
            }
        }
    }

    /**
     * Salta a un segundo específico en la pista.
     * @param {number} seconds 
     */
    seekTo(seconds) {
        if (!isNaN(seconds) && isFinite(seconds)) {
            this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration || 0));
        }
    }

    /**
     * Salta según un porcentaje (0 a 1).
     * @param {number} percent 
     */
    seekPercent(percent) {
        if (this.audio.duration) {
            const time = percent * this.audio.duration;
            this.seekTo(time);
        }
    }

    /**
     * Ajusta el volumen (0 a 1).
     * @param {number} value 
     */
    setVolume(value) {
        const clamped = Math.max(0, Math.min(1, value));
        this.volume = clamped;
        this.audio.volume = clamped;
        this.isMuted = clamped === 0;
        this.callbacks.onVolumeChange?.(this.volume, this.isMuted);
    }

    /**
     * Alterna silenciar (mute).
     */
    toggleMute() {
        if (this.isMuted) {
            this.setVolume(this.previousVolume > 0 ? this.previousVolume : APP_CONFIG.DEFAULT_VOLUME);
        } else {
            this.previousVolume = this.volume;
            this.setVolume(0);
        }
    }

    /**
     * Alterna modo aleatorio.
     */
    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        this.callbacks.onModeChange?.({ shuffle: this.isShuffle, repeat: this.repeatMode });
        return this.isShuffle;
    }

    /**
     * Alterna modo repetición: off -> all -> one -> off
     */
    toggleRepeat() {
        const modes = ['off', 'all', 'one'];
        const currentIdx = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIdx + 1) % modes.length];
        this.callbacks.onModeChange?.({ shuffle: this.isShuffle, repeat: this.repeatMode });
        return this.repeatMode;
    }

    /**
     * Cicla la velocidad de reproducción.
     */
    cyclePlaybackSpeed() {
        this.currentSpeedIndex = (this.currentSpeedIndex + 1) % APP_CONFIG.PLAYBACK_SPEEDS.length;
        const newSpeed = APP_CONFIG.PLAYBACK_SPEEDS[this.currentSpeedIndex];
        this.audio.playbackRate = newSpeed;
        return newSpeed;
    }

    /**
     * Configuración del estándar Media Session API para controles en pantalla de bloqueo y hardware.
     * @param {Object} song 
     */
    setupMediaSession(song) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: song.author,
                album: 'BEATS Playlist',
                artwork: [
                    { src: song.imageUrl, sizes: '512x512', type: 'image/jpeg' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => this.play());
            navigator.mediaSession.setActionHandler('pause', () => this.pause());
            navigator.mediaSession.setActionHandler('previoustrack', () => this.previous(true));
            navigator.mediaSession.setActionHandler('nexttrack', () => this.next(true));
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime) this.seekTo(details.seekTime);
            });
            navigator.mediaSession.setActionHandler('seekforward', () => {
                this.seekTo(this.audio.currentTime + 10);
            });
            navigator.mediaSession.setActionHandler('seekbackward', () => {
                this.seekTo(this.audio.currentTime - 10);
            });
        }
    }

    updateMediaSessionPlaybackState(state) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = state;
        }
    }

    updateMediaSessionPosition() {
        if ('mediaSession' in navigator && this.audio.duration) {
            try {
                navigator.mediaSession.setPositionState({
                    duration: this.audio.duration || 0,
                    playbackRate: this.audio.playbackRate || 1,
                    position: this.audio.currentTime || 0
                });
            } catch (e) {
                // Ignorar si no está soportado exactamente
            }
        }
    }
}
