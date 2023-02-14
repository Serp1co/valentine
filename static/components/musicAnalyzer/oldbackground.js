class Background {
    constructor(canvas, width, height) {
        this.w = canvas.width = width;
        this.h = canvas.height = height;
        this.ctx = canvas.getContext('2d');
        this.tick = 0;
        this.lines = [];
        this.baseRad = Math.PI * 2 / 6;
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, width, height);
        this.opts = {
            len: 20,
            count: 50,
            baseTime: 10,
            addedTime: 10,
            dieChance: .05,
            spawnChance: 1,
            sparkChance: .1,
            sparkDist: 10,
            sparkSize: 2,
            color: 'hsl(hue,100%,light%)',
            baseLight: 50,
            addedLight: 10, // [50-10,50+10]
            shadowToTimePropMult: 6,
            baseLightInputMultiplier: .01,
            addedLightInputMultiplier: .02,
            cx: width / 2,
            cy: height / 2,
            repaintAlpha: .01,
            hueChange: .0
        };
        this.dieX = width / 2 / this.opts.len;
        this.dieY = height / 2 / this.opts.len;
    }
    loop() {
        window.requestAnimationFrame(this.loop.bind(this));
        ++this.tick;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = 'rgba(0,0,0,alp)'.replace('alp', this.opts.repaintAlpha);
        this.ctx.fillRect(0, 0, this.w, this.h);
        this.ctx.globalCompositeOperation = 'lighter';
        let self = this;
        if (this.lines.length < this.opts.count && Math.random() < this.opts.spawnChance)
            this.lines.push(new Line(self));
        this.lines.map(function (line) {
            line.step(self);
        });
    }
}

class Line {
    constructor(background) {
        this.reset(background);
    }
    reset(background) {
        this.x = 0;
        this.y = 0;
        this.addedX = 0;
        this.addedY = 0;
        this.rad = 0;
        this.lightInputMultiplier = background.opts.baseLightInputMultiplier + background.opts.addedLightInputMultiplier * Math.random();
        this.color = background.opts.color.replace('hue', background.tick * background.opts.hueChange);
        this.cumulativeTime = 0;
        this.beginPhase(background);
    }
    beginPhase(background) {
        this.x += this.addedX;
        this.y += this.addedY;

        this.time = 0;
        this.targetTime = (background.opts.baseTime + background.opts.addedTime * Math.random()) | 0;

        this.rad += background.baseRad * (Math.random() < .5 ? 1 : -1);
        this.addedX = Math.cos(this.rad);
        this.addedY = Math.sin(this.rad);

        if (Math.random() < background.opts.dieChance || this.x > background.dieX || this.x < -background.dieX || this.y > background.dieY || this.y < -background.dieY)
            this.reset(background);
    }
    step(background) {
        ++this.time;
        ++this.cumulativeTime;
        if (this.time >= this.targetTime)
            this.beginPhase(background);
        let prop = this.time / this.targetTime,
            wave = Math.sin(prop * Math.PI / 2),
            x = this.addedX * wave,
            y = this.addedY * wave;
        background.ctx.shadowBlur = prop * background.opts.shadowToTimePropMult;
        background.ctx.fillStyle = background.ctx.shadowColor = this.color.replace('light', background.opts.baseLight /*+ background.opts.addedLight * Math.sin(this.cumulativeTime * this.lightInputMultiplier)*/);
        background.ctx.fillRect(background.opts.cx + (this.x + x) * background.opts.len, background.opts.cy + (this.y + y) * background.opts.len, 2, 2);
        if (Math.random() < background.opts.sparkChance)
            background.ctx.fillRect(background.opts.cx + (this.x + x) * background.opts.len + Math.random() * background.opts.sparkDist * (Math.random() < .5 ? 1 : -1) - background.opts.sparkSize / 2,
                background.opts.cy + (this.y + y) * background.opts.len + Math.random() * background.opts.sparkDist * (Math.random() < .5 ? 1 : -1) - background.opts.sparkSize / 2,
                background.opts.sparkSize,
                background.opts.sparkSize)
    }
}