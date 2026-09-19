/**
 * BEATS v2.0 - Coordinador Principal de la Aplicación (Entry Point)
 * @author Brayan Balza
 */

import { ApiService } from './api-service.js';
import { AudioPlayer } from './audio-player.js';
import { UIController } from './ui-controller.js';

class BeatsApp {
    constructor() {
        this.audioElement = document.getElementById('audio-player');
        this.player = new AudioPlayer(this.audioElement);
        this.ui = new UIController();
        
        this.allSongs = [];
        this.filteredSongs = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
    }

    /**
     * Inicializa la aplicación completa.
     */
    async init() {
        this.bindPlayerCallbacks();
        this.bindUIEvents();
        this.bindKeyboardShortcuts();
        await this.loadCatalog();
    }

    /**
     * Conecta los callbacks del reproductor con la interfaz de usuario.
     */
    bindPlayerCallbacks() {
        this.player.callbacks.onTrackChange = (song, index) => {
            this.ui.updatePlayerDetails(song, index);
        };

        this.player.callbacks.onPlayStateChange = (isPlaying) => {
            this.ui.setPlayState(isPlaying);
        };

        this.player.callbacks.onTimeUpdate = (current, duration) => {
            this.ui.updateProgress(current, duration);
        };

        this.player.callbacks.onDurationChange = (duration) => {
            if (this.ui.dom.totalDuration) {
                this.ui.dom.totalDuration.textContent = UIController.formatTime(duration);
            }
        };

        this.player.callbacks.onVolumeChange = (volume, isMuted) => {
            this.ui.updateVolumeUI(volume, isMuted);
        };

        this.player.callbacks.onModeChange = ({ shuffle, repeat }) => {
            // Shuffle
            if (this.ui.dom.shuffleBtn) {
                if (shuffle) {
                    this.ui.dom.shuffleBtn.classList.add('active');
                    this.ui.dom.shuffleBtn.setAttribute('aria-pressed', 'true');
                } else {
                    this.ui.dom.shuffleBtn.classList.remove('active');
                    this.ui.dom.shuffleBtn.setAttribute('aria-pressed', 'false');
                }
            }

            // Repeat
            if (this.ui.dom.repeatBtn) {
                this.ui.dom.repeatBtn.dataset.mode = repeat;
                if (repeat === 'off') {
                    this.ui.dom.repeatBtn.classList.remove('active');
                    this.ui.dom.repeatBadge?.classList.add('hidden');
                } else if (repeat === 'all') {
                    this.ui.dom.repeatBtn.classList.add('active');
                    this.ui.dom.repeatBadge?.classList.add('hidden');
                } else if (repeat === 'one') {
                    this.ui.dom.repeatBtn.classList.add('active');
                    this.ui.dom.repeatBadge?.classList.remove('hidden');
                }
            }
        };

        this.player.callbacks.onError = (message) => {
            this.ui.showToast(message, 'error');
        };
    }

    /**
     * Enlaza los eventos de la interfaz interactiva.
     */
    bindUIEvents() {
        const { dom } = this.ui;

        // Botón Play / Pause Principal
        dom.playPauseBtn?.addEventListener('click', () => {
            this.player.togglePlay();
        });

        // Botones Siguiente y Anterior
        dom.nextBtn?.addEventListener('click', () => {
            this.player.next(true);
        });

        dom.backBtn?.addEventListener('click', () => {
            this.player.previous(true);
        });

        // Modos Aleatorio y Repetición
        dom.shuffleBtn?.addEventListener('click', () => {
            const isShuffle = this.player.toggleShuffle();
            this.ui.showToast(isShuffle ? 'Modo aleatorio activado' : 'Modo aleatorio desactivado', 'info');
        });

        dom.repeatBtn?.addEventListener('click', () => {
            const mode = this.player.toggleRepeat();
            const labels = { off: 'Repetición desactivada', all: 'Repetir toda la lista', one: 'Repetir esta canción' };
            this.ui.showToast(labels[mode], 'info');
        });

        // Velocidad de reproducción
        dom.speedBtn?.addEventListener('click', () => {
            const speed = this.player.cyclePlaybackSpeed();
            if (dom.speedBtn) dom.speedBtn.textContent = `${speed.toFixed(1)}x`;
            this.ui.showToast(`Velocidad: ${speed}x`, 'info');
        });

        // Control de Volumen y Mute
        dom.volumeSlider?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.player.setVolume(val);
        });

        dom.muteBtn?.addEventListener('click', () => {
            this.player.toggleMute();
        });

        // Scrubber / Barra de Progreso (Click y Arrastre)
        if (dom.progressContainer) {
            const handleSeek = (e) => {
                const rect = dom.progressContainer.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                this.player.seekPercent(ratio);
            };

            dom.progressContainer.addEventListener('mousedown', (e) => {
                this.ui.isSeeking = true;
                handleSeek(e);

                const onMouseMove = (moveEvent) => {
                    handleSeek(moveEvent);
                };

                const onMouseUp = () => {
                    this.ui.isSeeking = false;
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                };

                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
            });

            // Touch events para móviles
            dom.progressContainer.addEventListener('touchstart', (e) => {
                this.ui.isSeeking = true;
                const touch = e.touches[0];
                const rect = dom.progressContainer.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
                this.player.seekPercent(ratio);
            }, { passive: true });

            dom.progressContainer.addEventListener('touchend', () => {
                this.ui.isSeeking = false;
            });
        }

        // Búsqueda en tiempo real
        let searchTimeout;
        dom.searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim().toLowerCase();
            this.searchQuery = query;

            if (dom.clearSearchBtn) {
                if (query.length > 0) {
                    dom.clearSearchBtn.classList.remove('hidden');
                } else {
                    dom.clearSearchBtn.classList.add('hidden');
                }
            }

            searchTimeout = setTimeout(() => {
                this.applyFilterAndSearch();
            }, 180);
        });

        dom.clearSearchBtn?.addEventListener('click', () => {
            if (dom.searchInput) dom.searchInput.value = '';
            this.searchQuery = '';
            dom.clearSearchBtn.classList.add('hidden');
            this.applyFilterAndSearch();
            dom.searchInput?.focus();
        });

        // Filtros por Categoría
        dom.filterChips?.forEach((chip) => {
            chip.addEventListener('click', () => {
                dom.filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.currentFilter = chip.dataset.filter || 'all';
                this.applyFilterAndSearch();
            });
        });

        // Botón de restablecer búsqueda
        dom.resetFilterBtn?.addEventListener('click', () => {
            if (dom.searchInput) dom.searchInput.value = '';
            this.searchQuery = '';
            dom.clearSearchBtn?.classList.add('hidden');
            this.currentFilter = 'all';
            dom.filterChips?.forEach((c, idx) => {
                if (idx === 0) c.classList.add('active');
                else c.classList.remove('active');
            });
            this.applyFilterAndSearch();
        });

        // Mini Reproductor Móvil
        dom.mobilePlayBtn?.addEventListener('click', () => {
            this.player.togglePlay();
        });

        dom.mobileNextBtn?.addEventListener('click', () => {
            this.player.next(true);
        });
    }

    /**
     * Registra atajos globales de teclado para mejorar la accesibilidad.
     */
    bindKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            // No interceptar si el usuario está escribiendo en el input de búsqueda
            const isTyping = document.activeElement === this.ui.dom.searchInput;

            if (e.key === '/' && !isTyping) {
                e.preventDefault();
                this.ui.dom.searchInput?.focus();
                return;
            }

            if (e.key === 'Escape') {
                this.ui.toggleShortcutsModal(false);
                if (isTyping) {
                    this.ui.dom.searchInput?.blur();
                }
                return;
            }

            if (isTyping) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.player.togglePlay();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.player.seekTo(this.player.audio.currentTime + 5);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.player.seekTo(this.player.audio.currentTime - 5);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.player.setVolume(this.player.volume + 0.05);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.player.setVolume(this.player.volume - 0.05);
                    break;
                case 'KeyM':
                    this.player.toggleMute();
                    break;
                case 'KeyN':
                    this.player.next(true);
                    break;
                case 'KeyP':
                    this.player.previous(true);
                    break;
                case 'KeyS':
                    this.player.toggleShuffle();
                    break;
                case 'KeyR':
                    this.player.toggleRepeat();
                    break;
            }
        });
    }

    /**
     * Aplica filtros de texto y género sobre el catálogo completo.
     */
    applyFilterAndSearch() {
        this.filteredSongs = this.allSongs.filter((song) => {
            const matchesQuery = !this.searchQuery || 
                song.title.toLowerCase().includes(this.searchQuery) ||
                song.author.toLowerCase().includes(this.searchQuery);

            const matchesCategory = this.currentFilter === 'all' || 
                song.genre?.toLowerCase() === this.currentFilter.toLowerCase();

            return matchesQuery && matchesCategory;
        });

        this.player.filteredPlaylist = this.filteredSongs;
        this.renderCatalog();
    }

    /**
     * Carga el catálogo desde la API / Caché / Fallback.
     */
    async loadCatalog() {
        try {
            const { songs, source } = await ApiService.fetchSongs();
            this.allSongs = songs;
            this.filteredSongs = [...songs];
            this.player.setPlaylist(songs);
            
            this.ui.updateConnectionStatus(source);
            this.renderCatalog();

            // Cargar la primera pista en modo de espera (sin reproducción automática forzada)
            if (songs.length > 0) {
                this.player.loadTrack(0, false);
            }
        } catch (error) {
            console.error('[BEATS App] Error cargando catálogo:', error);
            this.ui.showToast('Error al inicializar la lista de música.', 'error');
        }
    }

    /**
     * Renderiza la lista actual en la UI.
     */
    renderCatalog() {
        this.ui.renderTrackList(this.filteredSongs, this.player.currentIndex, (index) => {
            this.player.loadTrack(index, true);
        });
    }
}

// Inicializar la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    const app = new BeatsApp();
    app.init();
});
