Runner.duckingStartTime = Infinity;
Runner.LastDuckingLength = 0;

Runner.prototype.onKeyDown = function (e) {
    // Prevent native page scrolling whilst tapping on mobile.
    if (IS_MOBILE && this.playing) {
        e.preventDefault();
    }
    
    if (this.isCanvasInView()) {
        // Allow toggling of speed toggle.
        if (Runner.keycodes.JUMP[e.keyCode] &&
            e.target == this.slowSpeedCheckbox) {
            return;
        }
        
        if (!this.crashed && !this.paused) {
            // For a11y, screen reader activation.
            const isMobileMouseInput = IS_MOBILE &&
                                       e.type === Runner.events.POINTERDOWN && e.pointerType == 'mouse' &&
                                       (e.target == this.containerEl ||
                                        (IS_IOS &&
                                         (e.target == this.touchController || e.target == this.canvas)));
            
            if (Runner.keycodes.JUMP[e.keyCode] ||
                e.type === Runner.events.TOUCHSTART || isMobileMouseInput) {
                e.preventDefault();
                // Starting the game for the first time.
                if (!this.playing) {
                    // Started by touch so create a touch controller.
                    if (!this.touchController && e.type === Runner.events.TOUCHSTART) {
                        this.createTouchController();
                    }
                    
                    if (isMobileMouseInput) {
                        this.handleCanvasKeyPress(e);
                    }
                    this.loadSounds();
                    this.setPlayStatus(true);
                    this.update();
                    if (window.errorPageController) {
                        errorPageController.trackEasterEgg();
                    }
                }
                // Start jump.
//                if (!this.tRex.jumping && !this.tRex.ducking) {
                if (!this.tRex.ducking) {
                //去掉当前是否正在跳跃的检查
                    if (Runner.audioCues) {
                        this.generatedSoundFx.cancelFootSteps();
                    } else {
                        this.playSound(this.soundFx.BUTTON_PRESS);
                    }
                    let thisJump = new Date().getTime();
                    if(Runner.ap >= 30 && thisJump - Runner.lastJump >= 10){
                        Runner.ap -= 30;
                        this.tRex.startJump(this.currentSpeed);
                        Runner.lastJump = thisJump;
                    }
                    if(Runner.energy == 100 && Runner.life.count < 5){
                        Runner.energy = 0;
                        Runner.life.count += 1;
                        Runner.textEffectController.push('trex', '自愈 15000');
                        Runner.textEffectController.push('life', '+1 HP');
                    }
                }
            } else if (this.playing && Runner.keycodes.DUCK[e.keyCode]) {
                e.preventDefault();
                if (this.tRex.jumping) {
                    // Speed drop, activated only when jump key is not pressed.
                    this.tRex.setSpeedDrop();
                } else if (!this.tRex.jumping && !this.tRex.ducking) {
                    // Duck.
                    this.tRex.setDuck(true);
                }
            }
        }
    }
}

Trex.prototype.startJump = function(speed){
    //if (!this.jumping) {
    // 去掉对于当前是否在跳跃的检查
      this.update(0, Trex.status.JUMPING);
      // Tweak the jump velocity based on the speed.
      this.jumpVelocity = this.config.INITIAL_JUMP_VELOCITY - (speed / 10);
      this.jumping = true;
      this.reachedMinHeight = false;
      this.speedDrop = false;

      if (this.config.INVERT_JUMP) {
        this.minJumpHeight = this.groundYPos + this.config.MIN_JUMP_HEIGHT;
      }
    //}
}