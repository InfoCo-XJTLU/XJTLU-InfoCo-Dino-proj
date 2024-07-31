TextEffectInstance = function(canvas, x, y, content, align, font, decay, lifeTime) {
    this.canvas = canvas;
    this.canvasCtx =
            /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
    this.x = x;
    this.y = y;
    this.content = content;
    this.createTime = new Date().getTime();
    this.align = align;
    this.font = font;
    this.decay = decay;
    this.lifeTime = lifeTime;
    if (IS_HIDPI) {
        this.x *= 2;
        this.y *= 2;
    }
}

TextEffectInstance.prototype = {
    draw: function(){
        this.canvasCtx.textAlign = this.align;
        this.canvasCtx.font = this.font;
        this.canvasCtx.fillText(this.content, this.x, this.y);
    },

    update: function(){
        if(this.decay){
            this.y += 0.1;
        }
        this.draw();
    }
}

TextEffectController = function(canvas) {
    this.canvas = canvas;
    this.canvasCtx =
            /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
    this.queue = [];
}

TextEffectController.config = {
    TREX_X: 65,
    TREX_Y: 45,
    TREX_ALIGN: 'left',
    TREX_FONT: '14px serif',
    SCORE_X: 290,
    SCORE_Y: 13,
    SCORE_ALIGN: 'right',
    SCORE_FONT: '18px serif',
    REMARK_X: 150,
    REMARK_Y: 25,
    REMARK_ALIGN: 'center',
    REMARK_FONT: '28px serif',
    LIFE_FONT: '28px sans-serif',
}

TextEffectController.prototype = {
    push: function(type, content) {
        if(type == 'trex'){
            this.queue.push(new TextEffectInstance(this.canvas, 
                TextEffectController.config.TREX_X, 
                TextEffectController.config.TREX_Y,
                content,
                TextEffectController.config.TREX_ALIGN,
                TextEffectController.config.TREX_FONT,
                true,
                350
            ));
        } else if(type == 'score') {
            this.queue.push(new TextEffectInstance(this.canvas, 
                TextEffectController.config.SCORE_X, 
                TextEffectController.config.SCORE_Y,
                content,
                TextEffectController.config.SCORE_ALIGN,
                TextEffectController.config.SCORE_FONT,
                true,
                400
            ));
        } else if(type == 'life') {
            this.queue.push(new TextEffectInstance(this.canvas, 
                TextEffectController.config.SCORE_X, 
                TextEffectController.config.SCORE_Y + 15,
                content,
                TextEffectController.config.SCORE_ALIGN,
                TextEffectController.config.LIFE_FONT,
                true,
                200
            ));
        } else if(type == 'remark') {
            this.queue.push(new TextEffectInstance(this.canvas, 
                TextEffectController.config.REMARK_X, 
                TextEffectController.config.REMARK_Y + 15,
                content,
                TextEffectController.config.REMARK_ALIGN,
                TextEffectController.config.REMARK_FONT,
                false,
                500
            ));
        } else if(type == 'status') {
            this.queue.push(new TextEffectInstance(this.canvas, 
                TextEffectController.config.TREX_X, 
                TextEffectController.config.TREX_Y + 10,
                content,
                TextEffectController.config.TREX_ALIGN,
                TextEffectController.config.TREX_FONT,
                true,
                350
            ));
        } else if(type == 'timing') {
            this.queue.push(new TextEffectInstance(this.canvas, 
                TextEffectController.config.REMARK_X, 
                TextEffectController.config.REMARK_Y + 4,
                content,
                TextEffectController.config.REMARK_ALIGN,
                TextEffectController.config.TREX_FONT,
                false,
                500
            ));
        }
    },

    draw: function(){
        if(this.queue.length > 0){
            var nowTime = new Date().getTime();
            var t = this.queue.length;
            for (let i = 0; i < t; i++) {
                if(nowTime - this.queue[i].createTime >= this.queue[i].lifeTime){
                    this.queue.splice(i, 1);
                    t = this.queue.length;
                    continue;
                }
                this.queue[i].update();
            }
        }
    },
    update: function(){
        this.draw();
    }
}

Runner.textEffectController = new TextEffectController(Runner.instance_.canvas);