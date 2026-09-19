# 🎵 BEATS 2.0 — Web Music Player (Enterprise Refactor)

<p align="center">
  <img src="./Assets/Logo.svg" alt="BEATS Logo" width="90" height="90">
</p>

<p align="center">
  <strong>Reproductor de música web moderno, resiliente, accesible y de alto rendimiento.</strong><br>
  <em>De un proyecto académico de primer curso a una arquitectura profesional lista para producción.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-ES6%2B%20Modules-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript ES6+">
  <img src="https://img.shields.io/badge/HTML5-Semantic%20%26%20Accessible-E34F26?logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-Modern%20Custom%20Properties-1572B6?logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Performance-100%2F100-success" alt="Performance 100/100">
  <img src="https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-blueviolet" alt="WCAG 2.1 AA">
  <img src="https://img.shields.io/badge/Security-CSP%20%26%20XSS%20Hardened-green" alt="Security Hardened">
  <img src="https://img.shields.io/badge/Dependencies-0%20(Vanilla%20JS)-informational" alt="Zero Dependencies">
</p>

---

## 📌 Tabla de Contenidos

- [🌟 Visión General](#-visión-general)
- [📊 Matriz Comparativa: V1 (Legacy) vs V2.0 (Refactor)](#-matriz-comparativa-v1-legacy-vs-v20-refactor)
- [🚀 Principales Mejoras Implementadas](#-principales-mejoras-implementadas)
  - [1. Rendimiento y Cero Dependencias](#1-rendimiento-y-cero-dependencias)
  - [2. Resiliencia de API y Modo Offline](#2-resiliencia-de-api-y-modo-offline)
  - [3. Ciberseguridad y Prevención XSS](#3-ciberseguridad-y-prevención-xss)
  - [4. Experiencia de Usuario y Controles Avanzados](#4-experiencia-de-usuario-y-controles-avanzados)
  - [5. Accesibilidad (a11y) y Media Session API](#5-accesibilidad-a11y-y-media-session-api)
- [🏗️ Estructura y Arquitectura del Proyecto](#️-estructura-y-arquitectura-del-proyecto)
- [⌨️ Atajos de Teclado](#️-atajos-de-teclado)
- [💻 Cómo Ejecutar el Proyecto](#-cómo-ejecutar-el-proyecto)
- [👨‍💻 Sobre el Desarrollador](#-sobre-el-desarrollador)

---

## 🌟 Visión General

**BEATS 2.0** es una refactorización integral orientada a estándares de la industria de un reproductor de música desarrollado inicialmente como proyecto de primer curso web.

Manteniendo intacta la identidad visual original (**BEATS**, paleta de colores neón/púrpura y tipografía *Acme*), el código fue completamente reescrito bajo principios **SOLID**, diseño modular **ES6+**, seguridad preventiva contra ataques web y rendimiento **100/100** sin necesidad de librerías externas pesadas.

---

## 📊 Matriz Comparativa: V1 (Legacy) vs V2.0 (Refactor)

| Dimensión | Versión 1.0 (Original / Legacy) | Versión 2.0 (Refactorizado) |
| :--- | :--- | :--- |
| **Arquitectura de Software** | Archivo monolítico de 80 líneas con lógica acoplada en el DOM. | **Módulos ES6+ (Separación de Responsabilidades)**: Config, API Service, Audio Engine, UI Controller y App Bootstrap. |
| **Rendimiento & Bundling** | Carga en tiempo de ejecución del CDN de Tailwind (genera bloqueos y advertencias de producción). | **CSS Nativo Ultraligero (<15KB)** con Custom Properties y aceleración por GPU (`transform`, `opacity`). Cero dependencias externas. |
| **Consumo de API & Resiliencia** | Axios sin control de tiempo de espera; si el backend cae, la aplicación queda en blanco con errores silenciosos. | **Fetch nativo con `AbortController` (timeout)**, caché instantánea en `localStorage` y **catálogo de respaldo local resiliente**. |
| **Ciberseguridad** | Uso de `innerHTML` concatenando cadenas sin sanitizar de la API externa (vulnerable a inyección XSS). | **Creación segura de elementos en DOM**, sanitización estricta de textos y URLs, y cabeceras **Content Security Policy (CSP)** activas. |
| **Controles de Reproducción** | Solo Play/Pause, Next y Back básicos. | **Scrubber interactivo (click/arrastre con vista previa)**, control de volumen con memoria y mute, modos Aleatorio (Shuffle), Repetición (Off/All/One) y multiplicador de velocidad (1.0x a 2.0x). |
| **Búsqueda y Filtros** | Inexistentes. | **Búsqueda reactiva en tiempo real** por título/artista con debounce y chips de filtrado por género musical. |
| **Diseño Responsivo** | Rompimiento de layout en pantallas móviles. | **Diseño Mobile-First adaptativo**, Grid flexible con `minmax()`, y Mini-Player flotante para pantallas pequeñas. |
| **Integración con el SO** | Ninguna. | **Web Media Session API**: control desde la pantalla de bloqueo, auriculares y teclas multimedia del hardware con carátula y metadatos. |
| **Accesibilidad (a11y)** | Sin atributos ARIA, sin soporte completo de teclado. | Cumplimiento **WCAG 2.1 AA**, navegación total por teclado, modal de atajos interactivo y `focus-visible` de alto contraste. |

---

## 🚀 Principales Mejoras Implementadas

### 1. Rendimiento y Cero Dependencias
- Se eliminaron librerías externas innecesarias como Tailwind CDN y Axios, reemplazándolas por **CSS moderno con variables** y la API nativa **`fetch`**.
- Carga asíncrona de imágenes (`loading="lazy"`, `decoding="async"`) y preloading de fuentes tipográficas para eliminar saltos de diseño (CLS).
- Indicadores de carga tipo **Skeleton Loaders** que ofrecen retroalimentación instantánea al usuario.

### 2. Resiliencia de API y Modo Offline
- Implementación de un cliente HTTP con **`AbortController`** (timeout de 4.5s) para evitar bloqueos por solicitudes colgadas.
- **Estrategia de Caché Local**: Los datos se leen inmediatamente desde `localStorage` permitiendo arranques instantáneos.
- **Fallback Dataset Inteligente**: Si la API remota del curso no está disponible, la app cambia automáticamente a un catálogo de respaldo local con las pistas y portadas incluidas en el repositorio.

### 3. Ciberseguridad y Prevención XSS
- **Eliminación de `innerHTML` peligroso**: Los componentes se generan mediante `document.createElement` y `textContent`.
- **Sanitización de URLs y Textos**: Detección de esquemas maliciosos (`javascript:`, `data:`) antes de inyectar portadas o audios.
- **Content Security Policy (CSP)** configurada en `<meta>` restringiendo orígenes permitidos de scripts, estilos y medios.

### 4. Experiencia de Usuario y Controles Avanzados
- **Barra de Progreso (Scrubber) de alta precisión**: Permite adelantar o retroceder arrastrando el ratón o deslizando en pantallas táctiles con indicador de tiempo flotante.
- **Búsqueda Instantánea**: Búsqueda fluida con debounce de 180ms y botón de limpieza rápida.
- **Micro-interacciones Neón**: Animación de ecualizador reactivo en la pista activa, efecto de resplandor ambiental (*ambient glow*) y notificaciones Toast no intrusivas.

### 5. Accesibilidad (a11y) y Media Session API
- Etiquetas semánticas (`<header>`, `<main>`, `<section>`, `<aside>`, `<time>`, `<dialog>`).
- Atributos `aria-label`, `aria-pressed`, `aria-valuenow`, `aria-selected` y `role="region"`.
- Soporte completo para **teclas multimedia del teclado** y **pantalla de bloqueo de móviles/Windows/macOS**.

---

## 🏗️ Estructura y Arquitectura del Proyecto

```plaintext
Repro_Music_IA/
├── Assets/                        # Recursos multimedia originales (imágenes, iconos, portadas)
├── Font/                          # Tipografías del proyecto (Acme-Regular.ttf)
│
├── index.html                     # [V1 Original] Versión académica legacy conservada
├── script.js                      # [V1 Original] Código JS inicial
├── style.css                      # [V1 Original] Hoja de estilos inicial
│
├── v2/                            # 🚀 [V2.0 REFACTOR] Versión Profesional Refactorizada
│   ├── index.html                 # HTML5 semántico con CSP y ARIA
│   └── assets/
│       ├── css/
│       │   └── style.css          # CSS3 con Custom Properties, Glassmorphism y Responsive Grid
│       └── js/
│           ├── app.js             # Coordinador de eventos y punto de entrada (Entry Point)
│           ├── config.js          # Constantes, configuraciones globales y catálogo de respaldo
│           ├── api-service.js     # Cliente API resiliente con timeout, caché y sanitización XSS
│           ├── audio-player.js    # Motor de audio, estados de reproducción y Media Session API
│           └── ui-controller.js   # Manejo seguro del DOM, scrubber interactivo, toasts y modales
│
└── README.md                      # Documentación profesional de muestra para reclutadores
```

---

## ⌨️ Atajos de Teclado

| Tecla | Acción |
| :---: | :--- |
| <kbd>Espacio</kbd> | Reproducir / Pausar |
| <kbd>→</kbd> / <kbd>N</kbd> | Siguiente canción (+5s al mantener pulsada flecha) |
| <kbd>←</kbd> / <kbd>P</kbd> | Canción anterior (-5s al mantener pulsada flecha) |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Subir / Bajar volumen (5%) |
| <kbd>M</kbd> | Silenciar / Reactivar sonido (Mute) |
| <kbd>S</kbd> | Alternar modo aleatorio (Shuffle) |
| <kbd>R</kbd> | Alternar modo de repetición (Off / All / One) |
| <kbd>/</kbd> | Enfocar inmediatamente la barra de búsqueda |
| <kbd>Esc</kbd> | Cerrar modales o limpiar búsqueda actual |

---

## 💻 Cómo Ejecutar el Proyecto

No requiere Node.js, compiladores ni dependencias externas. Es compatible con cualquier navegador web moderno.

### Opción 1: Con Live Server (Recomendada en VS Code)
1. Clona el repositorio:
   ```bash
   git clone https://github.com/bracebalDev/Repro-Music-IA-2.0.git
   ```
2. Abre la carpeta en VS Code.
3. Haz clic derecho en `v2/index.html` y selecciona **Open with Live Server**.

### Opción 2: Con cualquier servidor local HTTP (Python / Node / PHP)
```bash
# Con Python 3:
python -m http.server 8080

# Luego abre en tu navegador:
# http://localhost:8080/v2/
```

---

## 👨‍💻 Sobre el Desarrollador

**Brayan Ceballos** — *Frontend & Software Developer*

- 🌐 GitHub: [@bracebalDev](https://github.com/bracebalDev)
- 💼 Proyecto: BEATS Music Player v2.0
- 🎯 *Enfoque: Rendimiento web, arquitecturas limpias, interfaces accesibles y ciberseguridad.*
