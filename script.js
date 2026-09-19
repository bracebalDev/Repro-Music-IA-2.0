/*let contenedor = document.getElementById('track-list')

axios.get('https://api.institutoalfa.org/api/songs').then((response) => {
    console.log(response.data.songs.map((song) => {
        contenedor.innerHTML += song.title
    }))
})*/

let contenedor = document.getElementById('track-list')
let audioPlayer = document.getElementById('audio-player')
let playPauseButton = document.getElementById('play-pause-button')
let currentSongIndex = 0
let songs = []

axios.get('https://api.institutoalfa.org/api/songs').then((response) => {
    songs = response.data.songs
    songs.map((song, index) => {
        // Ocurre por cada canción
        let div = document.createElement('div')
        div.setAttribute('class', 'flex p-4 gap-4 items-center cursor-pointer song')

        div.innerHTML = `
            <img src="https://api.institutoalfa.org/api/songs/image/${song.image.filename}" class="rounded-full h-16" alt="">
            <div>
                <h3 class="font-bold">${song.title}</h3>
                <p class="opacity-40">${song.author}</p>
            </div>
        `
        contenedor.appendChild(div)

        div.addEventListener('click', () => {
            currentSongIndex = index
            loadSong(song)
            highlightPlayingSong()
        })
    })
})

function loadSong(song) {
    playPauseButton.querySelector('img').src = '/Assets/pause.png'
    document.getElementById('song-image').src = `https://api.institutoalfa.org/api/songs/image/${song.image.filename}`
    document.getElementById('song-title').textContent = song.title
    document.getElementById('song-author').textContent = song.author
    audioPlayer.src = `https://api.institutoalfa.org/api/songs/audio/${song.audio.filename}`
    // audioPlayer.play()
    highlightPlayingSong()
}

function highlightPlayingSong() {
    let songDivs = document.querySelectorAll('#track-list .song')
    songDivs.forEach((div, index) => {
        if (index === currentSongIndex) {
            div.classList.add('playing')
        } else {
            div.classList.remove('playing')
        }
    })
}

// Botones de reproductor
playPauseButton.addEventListener('click', () => {
    if (audioPlayer.paused) {
        audioPlayer.play()
        playPauseButton.querySelector('img').src = '/Assets/pause.png'
    } else {
        audioPlayer.pause()
        playPauseButton.querySelector('img').src = '/Assets/play.png'
    }
})

// Back
document.getElementById('back-button').addEventListener('click', () => {
    currentSongIndex = (currentSongIndex === 0) ? songs.length - 1 : currentSongIndex - 1
    loadSong(songs[currentSongIndex])
})

// Next
document.getElementById('next-button').addEventListener('click', () => {
    currentSongIndex = (currentSongIndex === songs.length - 1) ? 0 : currentSongIndex + 1
    loadSong(songs[currentSongIndex])
})