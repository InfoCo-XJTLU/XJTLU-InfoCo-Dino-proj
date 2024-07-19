heart = new Image(20,20);
heart.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAABISURBVChTYwCBNWvW/AdhMAcJIIszoisICQlhBNHo4hgKcQEmKE0QUF8hVoejA5AHwQpBAJdiWCjAFYIArqDCCkCKMU1nYAAAXmgoJKpWkvoAAAAASUVORK5CYII=';
heart.onload = function() {
    Life = function(canvas, canvasWidth){
        this.canvas = canvas;
        this.canvasCtx =
            /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
        this.x = 0;
        this.y = 25;
        this.sprite = heart;
        this.count = 5;
        this.canvasWidth = canvasWidth;
        this.init(canvasWidth);
    }
    
    Life.dimensions = {
        WIDTH: 25,
        HEIGHT: 25,
        DEST_WIDTH: 30,
        START_DEST: 38
    };
    
    Life.prototype = {
        init(width) {
            this.calcXPos(width);
            for (let i = 0; i < 5; i++) {
                this.draw(i, 0);
            }
        },
    
        calcXPos(canvasWidth) {
            this.x = canvasWidth - Life.dimensions.START_DEST;
        },
    
        draw(pos){
            const targetX = this.x - pos * Life.dimensions.DEST_WIDTH;
            const targetY = this.y;
            if(this.count != 0){
                this.canvasCtx.drawImage(
                    this.sprite,
                    targetX,
                    targetY,
                    Life.dimensions.WIDTH,
                    Life.dimensions.HEIGHT
                );
            }
        },
    
        update(){
            for (let i = 0; i < this.count; i++) {
                this.draw(i)
            }
        },
    }
    Runner.life = new Life(Runner.instance_.canvas, Runner.instance_.dimensions.WIDTH);
}