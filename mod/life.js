heart = new Image(5,5);
heart.src = 'https://undertale.com/favicon.ico';
heart.onload = function() {
    Life = function(canvas, canvasWidth){
        this.canvas = canvas;
        this.canvasCtx =
            /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
        this.x = 0;
        this.y = 22;
        this.sprite = heart;
        this.count = 5;
        this.canvasWidth = canvasWidth;
        this.init(canvasWidth);
    }
    
    Life.dimensions = {
        WIDTH: 5,
        HEIGHT: 5,
        DEST_WIDTH: 50,
    };
    
    Life.prototype = {
        init(width) {
            this.calcXPos(width);
            for (let i = 0; i < 5; i++) {
                this.draw(i, 0);
            }
        },
    
        calcXPos(canvasWidth) {
            this.x = canvasWidth - Life.dimensions.DEST_WIDTH;
        },
    
        draw(pos){
            const targetX = this.x - pos * Life.dimensions.DEST_WIDTH;
            const targetY = this.y;
            if(this.count != 0){
                this.canvasCtx.drawImage(
                    this.sprite,
                    targetX,
                    targetY
                );
            }
        },
    
        update(){
            for (let i = 0; i < this.count; i++) {
                this.draw(i)
            }
        }
    }
    Runner.life = new Life(Runner.instance_.canvas, Runner.instance_.dimensions.WIDTH);
}

