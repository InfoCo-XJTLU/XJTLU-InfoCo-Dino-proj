Gauge = function(canvas){
    this.canvas = canvas;
    this.canvasCtx =
            /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
}

Gauge.config = {
    x: 27,
    y: 3,
    w: 100,
    h: 6,
}

Gauge.prototype = {
    draw: function(){
        this.canvasCtx.strokeRect(Gauge.config.x, Gauge.config.y, Gauge.config.w, Gauge.config.h);
        this.canvasCtx.fillRect(Gauge.config.x, Gauge.config.y, Runner.energy, Gauge.config.h);
        this.canvasCtx.strokeRect(Gauge.config.x, Gauge.config.y+12, Gauge.config.w, Gauge.config.h);
        this.canvasCtx.fillRect(Gauge.config.x, Gauge.config.y+12, Runner.ap, Gauge.config.h);
        this.canvasCtx.font = '14px serif';
        this.canvasCtx.textAlign = 'left';
        this.canvasCtx.fillText('MP', 10, 10);
        this.canvasCtx.fillText('AP', 10, 22);
        this.canvasCtx.fillText(Runner.energy.toString(), 130, 10);
        this.canvasCtx.fillText(Math.floor(Runner.ap).toString(), 130, 22);
        var nowtime = new Date().getTime();
        if(nowtime - Runner.immortalStartTime <= Runner.immortalLength){
            this.canvasCtx.fillText('必杀剑·地天', 10, 34);
            this.canvasCtx.fillText(Math.ceil((Runner.immortalLength + Runner.immortalStartTime - nowtime)/1000).toString(), 130, 34);
        }
    },

    update: function(){
        this.draw();
    },

    addEnergy: function(n){
        if(Runner.energy + n >= 100){
            Runner.energy = 100;
            return;
        } else {
            Runner.energy += n;
        }
    },
}

Runner.gauge = new Gauge(Runner.instance_.canvas);