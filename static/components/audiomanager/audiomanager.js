class MusicManager {

    static async adjustVolume(
        element,
        newVolume,
        duration = 1000,
        interval = 13,
        easing = MusicManager.swing,
    ) {
        return new Promise(resolve => {
            const originalVolume = element.volume;
            const delta = newVolume - originalVolume;

            if (!delta || !duration || !easing || !interval) {
                element.volume = newVolume;
                resolve();
            }

            const ticks = Math.floor(duration / interval);
            let tick = 1;

            const timer = setInterval(() => {
                element.volume = originalVolume + (
                    easing(tick / ticks) * delta
                );

                if (++tick === ticks + 1) {
                    clearInterval(timer);
                    resolve();
                }
            }, interval);
        })
    }

    static swing(p) {
        return 0.5 - Math.cos(p * Math.PI) / 2;
    }

    constructor() {
        this.initCanvas();
        this.initUI();
        this.initAudio();
        this.render();
    }

    initCanvas() {
        this.tick = 0;
    }

    initUI() {
        this.progressBar = document.querySelector("#progress-bar");
        this.controls = {
            volume: document.querySelector("#btn-volume"),
            next: document.querySelector("#btn-music-next"),
            prev: document.querySelector("#btn-music-prev"),
        };
        this.controls.volume.onclick = this.switchVolume.bind(this);
        this.controls.prev.onclick = this.previousAudio.bind(this);
        this.controls.next.onclick = this.nextAudio.bind(this);
        this.title = document.getElementById("audiotitle");
        this.loader = document.getElementById("loader");
    }

    initAudio() {
        this.currentSong = 1;
        this.volume = 1;
        this.baseURL = "https://audio.jukehost.co.uk/";
        this.fileNames = [
            "8hFOrKf1BYhpBqBMb9OhqJcoXI2HoOJC",
            "fqLzHHcHM4n2EFijfRiUu2iAKVumkPFy",
        ];

        this.songTitles = [
            "Rosa Walton & Hallie Coggins - I Really Want to Stay at Your House",
            "Madame - Sentimi",
        ];

        this.audio = document.getElementById("audio");
        this.audio.addEventListener("ended", () => {
            this.audio.currentTime = 0;
            this.nextAudio();
        });
        this.audio.addEventListener("timeupdate", () => {
            this.progressBar.style = `transform: scaleX(${this.audio.currentTime / this.audio.duration})`;
        });
        this.audioCtx = new AudioContext();
        this.source = this.audioCtx.createMediaElementSource(this.audio);
        this.gainNode = this.audioCtx.createGain();
        this.analyser = this.audioCtx.createAnalyser();
        this.source.connect(this.gainNode);
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        this.gainNode.gain.value = this.volume;
    }

    async loadAudio() {
        this.controls.next.disabled = true;
        this.controls.prev.disabled = true;
        this.loader.classList.remove("hidden");
        this.title.classList.add("hidden");
        await MusicManager.adjustVolume(this.audio, 0).catch((exception) => console.error(exception));
        return await fetch(this.baseURL + this.fileNames[this.currentSong - 1], {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        })
            .then((response) => response.blob())
            .then((data) => {
                this.playAudio(data);
            })
            .catch((exception) => console.error(exception))
            .finally(_ => {
                this.controls.next.disabled = false;
                this.controls.prev.disabled = false;
            })
    }

    async playAudio(data) {
        this.loader.classList.add("hidden");
        this.title.classList.remove("hidden");
        this.title.innerHTML = this.songTitles[this.currentSong - 1];
        this.audio.src = window.URL.createObjectURL(data);
        this.audio.play();
        await MusicManager.adjustVolume(this.audio, 1);
    }

    async previousAudio() {
        this.currentSong = this.currentSong > 1 ?
            this.currentSong - 1 :
            this.fileNames.length;
        await this.loadAudio();
    }

    async nextAudio() {
        this.currentSong = this.currentSong < this.fileNames.length ?
            this.currentSong + 1 :
            1;
        await this.loadAudio();
    }

    switchVolume() {
        let i = this.controls.volume.getElementsByTagName("i")[0];
        this.volume = this.volume > 0 ? 0 : 1;
        switch (this.volume) {
            case 1:
                i.classList.remove("fa-volume-off");
                i.classList.add("fa-volume-up");
                break;
            case 0:
                i.classList.remove("fa-volume-up");
                i.classList.add("fa-volume-off");
                break;
            default:
                break;
        }
        this.gainNode.gain.value = this.volume;
    };

    update() {

    }

    render() {
        this.tick++;
        this.update();
        window.requestAnimationFrame(this.render.bind(this));
    }
}

class EffectManager {

    constructor() {
        this.audio =
        this.baseURL = "https://audio.jukehost.co.uk/";
        this.fileNames = {
            "nav": "W2JoUy9O64oAknescbUVFAL2TD1qfJb5",
            "ok":"jGZW2eMVRvXjZVuAbEDTKgFMwtD7Lu9d",
            "back":"2A8rf57R8yfgMPIOTUCkDjs4o8gw6TKo",
        }
        this.data = {};
        this.audio = document.querySelector("#effectplayer");
    }

    async init(){
        let promises = [];
        for (const [key, value] of Object.entries(this.fileNames)) {
            promises.concat(fetch(this.baseURL + value, {
                method: "GET", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, *cors, same-origin
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            })
                .then((response) => response.blob())
                .then((blob) => this.data[key] = blob)
                .catch((exception) => console.error(exception)))
        }
        await Promise.all(promises);
    }

    playAudio(key) {
        this.audio.src = window.URL.createObjectURL(this.data[key]);
        this.audio.play();
    }

}

class AudioManager {

    static _instance;

    static async getInstance() {
        if(!AudioManager._instance) {
            let out = new AudioManager();
            await out.effectManager.init();
            this._instance = out;
        }
        return AudioManager._instance;
    }

    constructor() {
        this.effectManager = new EffectManager();
        this.musicManager = new MusicManager();
    }
}

window.requestAnimationFrame = (() => {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        });

})();
