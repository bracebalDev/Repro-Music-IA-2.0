/**
 * BEATS v2.0 - Controlador de Interfaz de Usuario y DOM Seguro
 * @author Brayan Balza
 */

import { ApiService } from './api-service.js';

export class UIController {
    constructor() {
        this.dom = {
            trackList: document.getElementById('track-list'),
            trackCount: document.getElementById('track-count'),
            emptyState: document.getElementById('empty-state'),
            resetFilterBtn: document.getElementById('reset-filter-btn'),
            searchInput: document.getElementById('search-input'),
            clearSearchBtn: document.getElementById('clear-search-btn'),
            filterChips: document.querySelectorAll('.filter-chip'),
            connectionStatus: document.getElementById('connection-status'),
            
            // Panel de Reproductor
            playerCard: document.getElementById('player'),
            songImage: document.getElementById('song-image'),
            songTitle: document.getElementById('song-title'),
            songAuthor: document.getElementById('song-author'),
            songGenreTag: document.getElementById('song-genre-tag'),
            playPauseBtn: document.getElementById('play-pause-button'),
            playPauseIcon: document.getElementById('play-pause-icon'),
            backBtn: document.getElementById('back-button'),
            nextBtn: document.getElementById('next-button'),
            shuffleBtn: document.getElementById('shuffle-button'),
            repeatBtn: document.getElementById('repeat-button'),
            repeatBadge: document.getElementById('repeat-badge'),
            speedBtn: document.getElementById('speed-btn'),
            
            // Barra de Progreso
            progressContainer: document.getElementById('progress-container'),
            progressBarFill: document.getElementById('progress-bar-fill'),
            progressHoverFill: document.getElementById('progress-hover-fill'),
            progressThumb: document.getElementById('progress-thumb'),
            progressTooltip: document.getElementById('progress-tooltip'),
            currentTime: document.getElementById('current-time'),
            totalDuration: document.getElementById('total-duration'),
            
            // Volumen
            volumeSlider: document.getElementById('volume-slider'),
            muteBtn: document.getElementById('mute-button'),
            volumeIcon: document.getElementById('volume-icon'),
            
            // Mini Reproductor Móvil
            mobileMiniPlayer: document.getElementById('mobile-mini-player'),
            mobileThumb: document.getElementById('mobile-thumb'),
            mobileTitle: document.getElementById('mobile-title'),
            mobileArtist: document.getElementById('mobile-artist'),
            mobilePlayBtn: document.getElementById('mobile-play-btn'),
            mobileNextBtn: document.getElementById('mobile-next-btn'),
            
            // Modal de Atajos y Toasts
            shortcutsBtn: document.getElementById('shortcuts-btn'),
            shortcutsModal: document.getElementById('shortcuts-modal'),
            closeModalBtn: document.getElementById('close-modal-btn'),
            toastContainer: document.getElementById('toast-container')
        };

        this.isSeeking = false;
        this.initStaticListeners();
    }

    /**
     * Formatea segundos a formato mm:ss (ej: 3:45)
     * @param {number} seconds 
     * @returns {string}
     */
    static formatTime(seconds) {
        if (isNaN(seconds) || seconds === Infinity || seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    /**
     * Inicializa eventos visuales estáticos y de scrubber interactivo.
     */
    initStaticListeners() {
        // Modal de atajos
        this.dom.shortcutsBtn?.addEventListener('click', () => {
            this.toggleShortcutsModal(true);
        });

        this.dom.closeModalBtn?.addEventListener('click', () => {
            this.toggleShortcutsModal(false);
        });

        this.dom.shortcutsModal?.addEventListener('click', (e) => {
            if (e.target === this.dom.shortcutsModal) {
                this.toggleShortcutsModal(false);
            }
        });

        // Scrubber interactivo con hover preview
        if (this.dom.progressContainer) {
            this.dom.progressContainer.addEventListener('mousemove', (e) => {
                const rect = this.dom.progressContainer.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                if (this.dom.progressHoverFill) {
                    this.dom.progressHoverFill.style.width = `${ratio * 100}%`;
                }
            });

            this.dom.progressContainer.addEventListener('mouseleave', () => {
                if (this.dom.progressHoverFill) {
                    this.dom.progressHoverFill.style.width = '0%';
                }
                if (this.dom.progressTooltip) {
                    this.dom.progressTooltip.classList.add('hidden');
                }
            });
        }
    }

    /**
     * Renderiza el catálogo de canciones de forma 100% segura (sin inyección innerHTML).
     * @param {Array} songs 
     * @param {number} activeIndex 
     * @param {Function} onSelectSong 
     */
    renderTrackList(songs, activeIndex, onSelectSong) {
        if (!this.dom.trackList) return;

        // Limpiar contenedor
        this.dom.trackList.textContent = '';

        if (!songs || songs.length === 0) {
            this.dom.emptyState?.classList.remove('hidden');
            if (this.dom.trackCount) this.dom.trackCount.textContent = '0 temas';
            return;
        }

        this.dom.emptyState?.classList.add('hidden');
        if (this.dom.trackCount) {
            this.dom.trackCount.textContent = `${songs.length} ${songs.length === 1 ? 'tema' : 'temas'}`;
        }

        songs.forEach((song, index) => {
            const card = document.createElement('div');
            card.className = `song-card ${index === activeIndex ? 'playing' : ''}`;
            card.setAttribute('role', 'option');
            card.setAttribute('aria-selected', index === activeIndex ? 'true' : 'false');
            card.tabIndex = 0;

            // Contenedor de miniatura
            const thumbWrapper = document.createElement('div');
            thumbWrapper.className = 'song-card-thumb-wrapper';

            const img = document.createElement('img');
            img.className = 'song-card-thumb';
            img.src = ApiService.sanitizeUrl(song.imageUrl);
            img.alt = `Portada de ${song.title}`;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.width = 54;
            img.height = 54;
            img.onerror = () => { img.src = '../Assets/starting.jpg'; };

            const overlay = document.createElement('div');
            overlay.className = 'card-play-overlay';
            overlay.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="#FFFFFF"><path d="M8 5v14l11-7z"/></svg>`;

            thumbWrapper.appendChild(img);
            thumbWrapper.appendChild(overlay);

            // Detalles de la canción
            const details = document.createElement('div');
            details.className = 'song-card-details';

            const title = document.createElement('h3');
            title.className = 'song-card-title';
            title.textContent = song.title;

            const artist = document.createElement('p');
            artist.className = 'song-card-artist';
            artist.textContent = song.author;

            details.appendChild(title);
            details.appendChild(artist);

            // Icono ecualizador animado
            const eqIcon = document.createElement('div');
            eqIcon.className = 'card-eq-icon';
            eqIcon.setAttribute('aria-hidden', 'true');
            eqIcon.innerHTML = `<span></span><span></span><span></span>`;

            card.appendChild(thumbWrapper);
            card.appendChild(details);
            card.appendChild(eqIcon);

            // Eventos de selección
            const triggerSelect = () => onSelectSong(index, song);
            card.addEventListener('click', triggerSelect);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerSelect();
                }
            });

            this.dom.trackList.appendChild(card);
        });
    }

    /**
     * Actualiza la vista del reproductor con la canción actual.
     * @param {Object} song 
     * @param {number} activeIndex 
     */
    updatePlayerDetails(song, activeIndex) {
        if (!song) return;

        if (this.dom.songTitle) this.dom.songTitle.textContent = song.title;
        if (this.dom.songAuthor) this.dom.songAuthor.textContent = song.author;
        
        if (this.dom.songImage) {
            this.dom.songImage.src = ApiService.sanitizeUrl(song.imageUrl);
            this.dom.songImage.alt = `Portada de ${song.title} - ${song.author}`;
            this.dom.songImage.onerror = () => { this.dom.songImage.src = '../Assets/starting.jpg'; };
        }

        if (this.dom.songGenreTag) {
            if (song.genre) {
                this.dom.songGenreTag.textContent = song.genre;
                this.dom.songGenreTag.classList.remove('hidden');
            } else {
                this.dom.songGenreTag.classList.add('hidden');
            }
        }

        // Mini reproductor móvil
        if (this.dom.mobileTitle) this.dom.mobileTitle.textContent = song.title;
        if (this.dom.mobileArtist) this.dom.mobileArtist.textContent = song.author;
        if (this.dom.mobileThumb) this.dom.mobileThumb.src = ApiService.sanitizeUrl(song.imageUrl);
        this.dom.mobileMiniPlayer?.classList.remove('hidden');

        // Actualizar tarjeta activa en el grid
        this.highlightActiveCard(activeIndex);
    }

    /**
     * Resalta la tarjeta activa en la lista.
     * @param {number} activeIndex 
     */
    highlightActiveCard(activeIndex) {
        const cards = this.dom.trackList?.querySelectorAll('.song-card');
        cards?.forEach((card, idx) => {
            if (idx === activeIndex) {
                card.classList.add('playing');
                card.setAttribute('aria-selected', 'true');
            } else {
                card.classList.remove('playing');
                card.setAttribute('aria-selected', 'false');
            }
        });
    }

    /**
     * Actualiza la interfaz según el estado de reproducción (Play / Pause).
     * @param {boolean} isPlaying 
     */
    setPlayState(isPlaying) {
        const playIcon = '../Assets/play.png';
        const pauseIcon = '../Assets/pause.png';

        if (this.dom.playPauseIcon) {
            this.dom.playPauseIcon.src = isPlaying ? pauseIcon : playIcon;
        }

        if (this.dom.playPauseBtn) {
            this.dom.playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pausar canción' : 'Reproducir canción');
        }

        if (this.dom.playerCard) {
            if (isPlaying) {
                this.dom.playerCard.classList.add('playing');
            } else {
                this.dom.playerCard.classList.remove('playing');
            }
        }

        // Mobile play button
        if (this.dom.mobilePlayBtn) {
            this.dom.mobilePlayBtn.innerHTML = isPlaying 
                ? `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
                : `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
        }
    }

    /**
     * Actualiza el progreso de reproducción en tiempo real.
     * @param {number} current 
     * @param {number} duration 
     */
    updateProgress(current, duration) {
        if (this.isSeeking) return;

        const percent = duration > 0 ? (current / duration) * 100 : 0;

        if (this.dom.progressBarFill) {
            this.dom.progressBarFill.style.width = `${percent}%`;
        }
        if (this.dom.progressThumb) {
            this.dom.progressThumb.style.left = `${percent}%`;
        }
        if (this.dom.currentTime) {
            this.dom.currentTime.textContent = UIController.formatTime(current);
        }
        if (this.dom.totalDuration && duration > 0) {
            this.dom.totalDuration.textContent = UIController.formatTime(duration);
        }
        if (this.dom.progressContainer) {
            this.dom.progressContainer.setAttribute('aria-valuenow', Math.round(percent).toString());
        }
    }

    /**
     * Actualiza el estado visual del volumen.
     * @param {number} volume 
     * @param {boolean} isMuted 
     */
    updateVolumeUI(volume, isMuted) {
        if (this.dom.volumeSlider) {
            this.dom.volumeSlider.value = isMuted ? '0' : volume.toString();
        }

        if (this.dom.volumeIcon) {
            if (isMuted || volume === 0) {
                this.dom.volumeIcon.innerHTML = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
            } else if (volume < 0.5) {
                this.dom.volumeIcon.innerHTML = `<path d="M7 9v6h4l5 5V4L11 9H7zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>`;
            } else {
                this.dom.volumeIcon.innerHTML = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
            }
        }
    }

    /**
     * Actualiza el badge del estado de conexión a la API.
     * @param {'live' | 'cached' | 'offline'} source 
     */
    updateConnectionStatus(source) {
        if (!this.dom.connectionStatus) return;

        this.dom.connectionStatus.className = `status-badge ${source}`;
        const textSpan = this.dom.connectionStatus.querySelector('.status-text');

        if (source === 'live') {
            if (textSpan) textSpan.textContent = 'API En Línea';
            this.showToast('Conectado a la API remota de Beats', 'success');
        } else if (source === 'cached') {
            if (textSpan) textSpan.textContent = 'Modo Caché';
            this.showToast('Cargado desde caché ultrarrápida', 'info');
        } else {
            if (textSpan) textSpan.textContent = 'Modo Offline';
            this.showToast('Modo resiliente sin conexión activo', 'warning');
        }
    }

    /**
     * Muestra una notificación emergente tipo Toast.
     * @param {string} message 
     * @param {'info' | 'success' | 'warning' | 'error'} type 
     */
    showToast(message, type = 'info') {
        if (!this.dom.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.textContent = message;

        this.dom.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    /**
     * Abre o cierra el modal de atajos de teclado.
     * @param {boolean} show 
     */
    toggleShortcutsModal(show) {
        if (!this.dom.shortcutsModal) return;
        if (show) {
            this.dom.shortcutsModal.classList.remove('hidden');
        } else {
            this.dom.shortcutsModal.classList.add('hidden');
        }
    }
}
