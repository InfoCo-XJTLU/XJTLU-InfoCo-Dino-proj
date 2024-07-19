Casting = function(canvas){
    this.canvas = canvas;
    this.canvasCtx =
            /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
    this.str = '1.13';
}

Casting.config = {
    X: 250,
    TIMER_X: 350,
    INTERRUPTED_X: 260,
    RECT_Y: 90,
    TEXT_Y: 107,
    TIMER_Y: 108,
    INTERRUPTED_Y: 98,
    NAME_Y: 89,
    WIDTH: 100,
    HEIGHT: 6,
    LENGTH: 1130,
    RATE: 100 / 1130,
}

Casting.prototype = {
    draw: function(startTime, nowTime, Interrupted){
        this.canvasCtx.strokeRect(Casting.config.X, Casting.config.RECT_Y, Casting.config.WIDTH, Casting.config.HEIGHT);
        this.canvasCtx.font = '14px serif';
        this.canvasCtx.textAlign = 'left';
        if(nowTime - startTime >= 1130) {
            this.canvasCtx.fillText('READY', Casting.config.X, Casting.config.TEXT_Y);
        } else {
            this.canvasCtx.fillText('CASTING', Casting.config.X, Casting.config.TEXT_Y);
        }
        this.canvasCtx.fillText('斩铁剑', Casting.config.X, Casting.config.NAME_Y);
        if(!Interrupted){
            var len = (nowTime - startTime) * Casting.config.RATE;
            this.canvasCtx.fillRect(Casting.config.X, Casting.config.RECT_Y, (len<100)?len:100 , Casting.config.HEIGHT);
            
            this.str = ((1130 - nowTime + startTime) / 1000).toFixed(2);
            if(this.str.length == 3){
                this.str = this.str + '0'
            }
            if(nowTime - startTime >= 1130){
                this.str = '0.00';
            }
        } else {
            var tmp = [1,0,1,0,1];
            if(tmp[Math.floor((nowTime - startTime) / 200)]){
                this.canvasCtx.fillText('INTERRUPTED', Casting.config.INTERRUPTED_X, Casting.config.INTERRUPTED_Y);
            }
        }
        this.canvasCtx.textAlign = 'right'
        this.canvasCtx.fillText(this.str, Casting.config.TIMER_X, Casting.config.TIMER_Y);
    },

    update: function(){
        var nowTime = new Date().getTime();
        if(Runner.duckingStartTime != Infinity){ // Casting
            this.draw(Runner.duckingStartTime, nowTime, false);
        } else {
            if(Runner.LastDuckingLength < 1100 && nowTime - Runner.mikiriTime <= 1000){ // Interrupted
                this.draw(Runner.mikiriTime, nowTime, true);
            }
        }
    }
}

Runner.casting = new Casting(Runner.instance_.canvas);