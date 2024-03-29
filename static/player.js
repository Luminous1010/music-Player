const fs = require('fs')
const path = require('path')

const log = console.log.bind(console)
const e = (selector) => document.querySelector(selector)
const es = (sel) => document.querySelectorAll(sel)

const secondFillZero = (second) => {
    let t = second
    if (t < 10) {
        t = '0' + t
    }
    return t
}

const templatePlayerList = (song, img, i) => {
    let imagBaseUrl = 'audios/'+img
    let t = `
                <div class="aka-playlist-item" data-index=${i}>
                    <li class="aka-playlist-selected">
                        <span class="aka-playlist-thumb"><img src=${imagBaseUrl} alt="">${img}</span>
                        <a href="#" class="aka-playlist-title">${song}</a>
                    </li>
                    </div>
                `
    return t
}

const initVolumeBar = (player) => {
    let volume = e('.aka-volume-level')
    volume.style.width = player.volume * 70 + 'px'
}

const nextSong = (songs) => {
    let currentSong = e('.aka-active')
    let index = (Number(currentSong.dataset.index) + 1) % songs.length
    return songs[index]
}

const previousSong = (songs) => {
    let currentSong = e('.aka-active')
    let index = (Number(currentSong.dataset.index) - 1 + songs.length) % songs.length
    log(index)
    return songs[index]
}

const allSongs = () => {
    let musics = es('.aka-playlist-title')
    // log(musics)
    let songs = []
    for (let i = 0; i < musics.length; i++) {
        let m = musics[i]
        let path = `audios\\`+ m.textContent
        songs.push(path)
    }
    return songs
}

const choice = (array) => {
    let a = Math.random()
    a = a * array.length
    let index = Math.floor(a)
    return array[index]
}

const randomSong = (songs) => {
    let s = choice(songs)
    return s
}

const updateBar = (x, player) => {
    let volumeLevel = e('.aka-volume-level')
    volumeLevel.style.width = x / 90 * 70 + 'px'
    player.volume = x / 90
}

const songTitle = (songname) => {
    let title = e('#id-song-title')
    title.innerHTML = songname
}

const scrollSongsList = () => {
    const list = e('#id-ul-song-list')
    list.addEventListener('mousewheel', (event) => {
        let top = window.getComputedStyle(list, null).getPropertyValue("top")
        top = Number(top.split('p')[0])
        let down = true
        if (event.wheelDelta < 0) {
            down = true
        } else if (event.wheelDelta > 0) {
            down = false
        }
        if (down) {
            top  = top - 10
        } else {
            top  = top + 10
        }
        if (top < 10 && top > -200) {
            list.style.top = top + 'px'
        }
    })
}

const togglePlayPause = (t) => {
    if (t.classList.contains('fa-play')) {
        t.classList.remove('fa-play')
        t.classList.add('fa-pause')
    } else if (t.classList.contains('fa-pause')) {
        t.classList.remove('fa-pause')
        t.classList.add('fa-play')
    }
}

const akaToggleClass = (element, classNameA, classNameB) => {
    if (element.classList.contains(classNameA)) {
        element.classList.remove(classNameA)
        element.classList.remove(classNameB)

    }
}

const seekProgress = (player) => {
    let a = player
    let o = {}
    o.time = a.duration
    o.totalMinutes = (o.time / 60).toFixed(0)
    o.totalSeconds = (o.time % 60).toFixed(0)
    o.current = a.currentTime
    o.minutes = (o.current / 60).toFixed(0)
    o.Seconds = (o.current % 60).toFixed(0)
    return o
}

const btnAnimation = () => {
    let container = e('#aka-wrapper')
    container.addEventListener('mouseover', (event) => {
        let self = event.target
        if (self.classList.contains('aka-icon-color') && !self.classList.contains('fa-random')) {
            self.classList.add('aka-icon-rollover-color')
            self.classList.remove('aka-icon-color')
        }
    })

    container.addEventListener('mouseout', (event) => {
        let self = event.target
        if (self.classList.contains('aka-icon-rollover-color') && !self.classList.contains('fa-random')) {
            self.classList.add('aka-icon-color')
            self.classList.remove('aka-icon-rollover-color')
        }
    })
    scrollSongsList()

}

const initPlayer = () => {
    let audioDir = 'audios'
    // readdir 读取文件夹并以函数的形式返回所有文件
    // 我们的音乐都放在 audios 文件夹中
    fs.readdir(audioDir, function(error, files) {
        let items = files
        let o = {
            song: [],
            img: [],
        }

        for (let file of items) {
            if (file.endsWith('mp3')) {
                o.song.push(file)
            } else if (file.endsWith('jpg')) {
                o.img.push(file)
            }
        }

        for (let i = 0; i < o.song.length; i++) {
            let song = o.song[i]
            let img = o.img[i]
            let t = templatePlayerList(song, img, i)
            e('#id-ul-song-list').insertAdjacentHTML('beforeend', t)
        }
    })
}

const bindEventPlay = (event, player) => {
        // self 是被点击的 a 标签
        let self = event.target
        if (self.classList.contains('aka-playlist-title')) {
            let father = self.closest('.aka-playlist-item')
            let allItems = document.querySelectorAll('.aka-active')
            for (let r of allItems) {
                r.classList.remove('aka-active')
            }
            father.classList.add('aka-active')
            let filepath = path.join('audios', self.textContent)
            player.src = filepath
            // 播放
            player.play()
        }
}

const bindEventsPlay = (player) => {
    let button = e('.aka-playback-toggle')
    let list = e('#id-ul-song-list')
    initVolumeBar(player)
    player.addEventListener('canplay', () => {
        togglePlayPause(button)
    })
    list.addEventListener('click',  (event) => {
        bindEventPlay(event, player)
    })
}

const bindEventPause = (player) => {
    let button = e('.aka-playback-toggle')
    player.addEventListener('pause', () => {
        button.classList.remove('fa-pause')
        button.classList.add('fa-play')
    })
    button.addEventListener('click', (event) => {
        let self = event.target
        if (self.classList.contains('fa-play')) {
            self.classList.remove('fa-play')
            self.classList.add('fa-pause')
            player.play()
        } else {
            self.classList.remove('fa-pause')
            self.classList.add('fa-play')
            player.pause()
        }
    })
}

const bindEventNextSong = (player) => {
    let next = e('.fa-step-forward')
    next.addEventListener('click', (event) => {
        let songs = allSongs()
        let song = nextSong(songs)
        let currentSong = e('.aka-active')
        let i = (Number(currentSong.dataset.index) + 1) % songs.length
        let next = es('.aka-playlist-item')[i]
        currentSong.classList.remove('aka-active')
        next.classList.add('aka-active')

        player.src = song
        player.play()
    })
}

const bindEventPreviousSong = (player) => {
    let next = e('.fa-step-backward')
    next.addEventListener('click', () => {
        let songs = allSongs()
        let song = previousSong(songs)
        let currentSong = e('.aka-active')
        let i = (Number(currentSong.dataset.index) - 1 + songs.length) % songs.length
        let next = es('.aka-playlist-item')[i]
        currentSong.classList.remove('aka-active')
        next.classList.add('aka-active')

        player.src = song
        player.play()
    })
}

const bindEventShuffle = (player) => {
    let randombtn = e('.fa-random')
    randombtn.addEventListener('click', (event) => {
        let self = randombtn

        if (player.dataset.mode !== 'shuffle') {
            self.classList.add('aka-icon-rollover-color')
            self.classList.remove('aka-icon-color')
            player.dataset.mode = 'shuffle'
        } else {
            self.classList.add('aka-icon-color')
            self.classList.remove('aka-icon-rollover-color')
            player.dataset.mode = 'loop'
        }
    })
}

const bindEventVolumeControl = (player) => {
    let volumeDrag = false
    let bar = e('.aka-volume-seekbar')
    bar.addEventListener('click', (event) => {
        volumeDrag = true
        updateBar(event.offsetX, player)

    })
}

const bindEventEnded = (player) => {
    e('#id-audio-player').addEventListener('ended', () => {
        let playMode = player.dataset.mode
        let songs = allSongs()
        log("播放结束, 当前播放模式是", playMode)
        // 如果播放模式是 loop 就重新播放
        if (playMode === 'loop') {
            player.play()
        } else if (playMode === 'list') {
            player.src = nextSong(songs)
            player.play()
        } else if (playMode === 'shuffle') {
            log('mode', playMode)
            player.src = randomSong(songs)
            player.play()
        }
    })
}

const bindEventCurrentTime = function(player) {
    let a = player
    let currentTime = e('.aka-progress-level')
    a.addEventListener('canplay', (event) => {
        setInterval(function() {
            let time = a.currentTime
            let totaltime = a.duration
            let progress = time / totaltime * 280
            currentTime.style.width= `${progress}px`
        },1000)
    })
}

const bindEventShowTime = function(player) {
    let seekbar = e('.aka-seekbar')
    let tooltip = e('.aka-tooltip')
    seekbar.addEventListener('mousemove', (event) => {
        let seekX = Number(event.offsetX)
        let totalTime = player.duration
        if (!totalTime) {
            return
        }
        tooltip.style.display = 'block'
        let current = seekX / 280 * totalTime
        let minutes = (current / 60).toFixed(0)
        let seconds = (current % 60).toFixed(0)
        seconds = secondFillZero(seconds)
        let totalMinutes = (totalTime / 60).toFixed(0)
        let totalSeconds = (totalTime % 60).toFixed(0)
        totalSeconds = secondFillZero(totalSeconds)
        tooltip.innerHTML = `<p>${minutes}:${seconds} / ${totalMinutes}:${totalSeconds} </p>`
        if (seekX < 250) {
            tooltip.style.left = event.offsetX + 'px'
        } else {
            tooltip.style.left = '250px'
        }
    })

    seekbar.addEventListener('mouseout', () => {
        tooltip.style.display = 'none'
    })

    seekbar.addEventListener('click', (event) => {
        let seekX = Number(event.offsetX)
        let totalTime = player.duration
        if (!totalTime) {
            return
        }
        let time = seekX / 280 * totalTime
        player.currentTime = time
    })
}

const bindEventCoverChange = (player) => {
    player.addEventListener('canplay', () => {
        let song = player.src
        let cover = e('#id-audio-cover')
        let covername = song.split('.')[0] + '.jpg'
        cover.src = covername
        let father = e('.aka-active')
        let child = father.querySelector('a')
        let text = child.textContent.split('.')[0]
        songTitle(text)
    })
}

const bindEvents = (player) => {
    bindEventCurrentTime(player)
    bindEventsPlay(player)
    bindEventShuffle(player)
    bindEventEnded(player)
    bindEventPause(player)
    bindEventNextSong(player)
    bindEventPreviousSong(player)
    bindEventCoverChange(player)
    bindEventShowTime(player)
    bindEventVolumeControl(player)
}

const __main = () => {
    const player = e('#id-audio-player')
    initPlayer(player)
    btnAnimation()
    bindEvents(player)
}

__main()