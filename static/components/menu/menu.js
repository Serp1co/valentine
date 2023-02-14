class Menu {
    static _can_play = true;
    static _muted = false;

    constructor(background, glitch, effectManager, musicManager) {
        this.setupBtnsEffects(effectManager)
        this.setupAshleyBtn(background, glitch, musicManager);
    }

    setupBtnsEffects(effectManager) {
        this.btnList = document.querySelectorAll(".menu-item-btn");
        this.btnList.forEach(e => {
            e.addEventListener("mouseover", _ => {
                if (!Menu._can_play && Menu._muted)
                    return;
                effectManager.playAudio("nav");
            });
            e.addEventListener("click", _ => {
                if (!Menu._can_play && Menu._muted)
                    return;
                effectManager.playAudio("ok");
                Menu._can_play = false;
            });
        })
    }

    setupAshleyBtn(background, glitch, musicManager) {
        this.ashleyBtn = document.querySelector("#aslheybtn");
        this.menunav = document.querySelector("#menu-nav");
        this.ashleyBtn.addEventListener("click", () => {
            if (this.menunav.classList.contains("hidden"))
                return;
            this.menunav.classList.add("hidden");
            document.querySelector("#starter").classList.remove("hidden");
            document.querySelector("#backgroundCanvas").classList.remove("hidden");
            background.draw();
            musicManager.audioCtx.resume().then(_ => {
                musicManager.loadAudio().then(() => {
                    glitch.play();
                });
            })
        })
    }
}
