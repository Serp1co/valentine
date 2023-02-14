class GlitchedImage {
    static glitch(context, width, height) {
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;
        const length = width * height;
        const factor = Math.random() * 12;

        let randR = Math.floor(Math.random() * factor);
        let randG = Math.floor(Math.random() * factor) * 3;
        let randB = Math.floor(Math.random() * factor);
        for (let i = 0; i < length; i++) {
            let r = data[(i + randR) * 4];
            let g = data[(i + randG) * 4 + 2];
            let b = data[(i + randB) * 4 + 4];
            if (r + g + b === 0) r = g = b = 255;
            data[i * 4] = r;
            data[i * 4 + 1] = g;
            data[i * 4 + 2] = b;
        }
        context.putImageData(imageData, 0, 0);
    }

    static glitchWave(context, width, height) {
        const renderLineHeight = Math.random() * height;
        const cuttingHeight = 5;
        const imageData = context.getImageData(0, renderLineHeight, width, cuttingHeight);
        context.putImageData(imageData, 0, renderLineHeight - 10);
    }

    static glitchSlip(context, width, height) {
        const waveDistance = 100;
        const startHeight = height * Math.random();
        const endHeight = startHeight + 30 + Math.random() * 40;
        for (let h = startHeight; h < endHeight; h++) {
            if (Math.random() < .1) h++;
            let imageData = context.getImageData(0, h, width, 1);
            context.putImageData(imageData, Math.random() * waveDistance - waveDistance * .5, h);
        }
    }

    static glitchColor(context, width, height) {
        const waveDistance = 30;
        const startHeight = height * Math.random();
        const endHeight = startHeight + 30 + Math.random() * 40;
        const imageData = context.getImageData(0, startHeight, width, endHeight);
        const length = width * height;
        let data = imageData.data;
        let r = 0;
        let g = 0;
        let b = 0;
        for (let i = 0; i < length; i++) {
            if (i % width === 0) {
                r = i + Math.floor((Math.random() - .5) * waveDistance);
                g = i + Math.floor((Math.random() - .5) * waveDistance);
                b = i + Math.floor((Math.random() - .5) * waveDistance);
            }
            data[i * 4] = data[r * 4];
            data[i * 4 + 1] = data[g * 4 + 1];
            data[i * 4 + 2] = data[b * 4 + 2];
        }
        context.putImageData(imageData, 0, startHeight);
    }

    effectList = [GlitchedImage.glitch, GlitchedImage.glitchWave, GlitchedImage.glitchSlip];

    constructor(imageBoard, delay) {
        let image = imageBoard.querySelector('img');
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        imageBoard.appendChild(canvas);
        this._context = context;
        this._image = image;
        this._canvas = canvas;
        this._delay = delay;
        let imageData = new Image();
        imageData.crossOrigin = "Anonymous";
        imageData.src = this._image.getAttribute('src');
        this._imageData = imageData;
        this.isPlaying = false;
        let resizeFn = this.onResize.bind(this);
        let renderFn = this._render.bind(this);
        this._imageData.onload = function (event) {
            window.addEventListener('resize', resizeFn, false);
            window.dispatchEvent(new Event('resize'));
            window.requestAnimationFrame(renderFn);
        };
        this._image.remove();
    }

    onResize() {
        this._canvas.width = this._image.width;
        this._canvas.height = this._image.height;
    }

    play() {
        this.isPlaying = true;
        this._render();
    }

    stop() {
        this.isPlaying = false;
    }

    _render() {
        let width = this._canvas.width;
        let height = this._canvas.height;
        this._context.clearRect(0, 0, width, height);
        this._context.drawImage(this._imageData, 0, 0, this._image.width, this._image.height);
        if(this.isPlaying) {
            if (.5 < Math.random()) {
                this.getRandomValue(this.effectList)(this._context, width, height);
            }
            setTimeout(() => window.requestAnimationFrame(this._render.bind(this)), this._delay);
        }
    }

    getRandomValue(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

}
