Runner.mikiriTime = 0;
Runner.collisionTime = Infinity;
Runner.gameoverflag = 0;

Runner.prototype.onKeyUp = function (e) {
    const keyCode = String(e.keyCode);
    const isjumpKey = Runner.keycodes.JUMP[keyCode] ||
                      e.type === Runner.events.TOUCHEND || e.type === Runner.events.POINTERUP;
    
    if (this.isRunning() && isjumpKey) {
        this.tRex.endJump();
    } else if (Runner.keycodes.DUCK[keyCode]) {
        this.tRex.speedDrop = false;
        this.tRex.setDuck(false);

        Runner.mikiriTime = new Date().getTime(); //见切时间
    } else if (this.crashed) {
        // Check that enough time has elapsed before allowing jump key to restart.
        const deltaTime = getTimeStamp() - this.time;
        
        if (this.isCanvasInView() &&
            (Runner.keycodes.RESTART[keyCode] || this.isLeftClickOnCanvas(e) ||
             (deltaTime >= this.config.GAMEOVER_CLEAR_TIME &&
              Runner.keycodes.JUMP[keyCode]))) {
            this.handleGameOverClicks(e);
        }
    } else if (this.paused && isjumpKey) {
        // Reset the jump state
        this.tRex.reset();
        this.play();
    }
}

Runner.prototype.update = function() {
    this.updatePending = false;

    const now = getTimeStamp();
    let deltaTime = now - (this.time || now);

    // Flashing when switching game modes.
    if (this.altGameModeFlashTimer < 0 || this.altGameModeFlashTimer === 0) {
      this.altGameModeFlashTimer = null;
      this.tRex.setFlashing(false);
      this.enableAltGameMode();
    } else if (this.altGameModeFlashTimer > 0) {
      this.altGameModeFlashTimer -= deltaTime;
      this.tRex.update(deltaTime);
      deltaTime = 0;
    }

    this.time = now;

    if (this.playing) {
      this.clearCanvas();

      // Additional fade in - Prevents jump when switching sprites
      if (this.altGameModeActive &&
          this.fadeInTimer <= this.config.FADE_DURATION) {
        this.fadeInTimer += deltaTime / 1000;
        this.canvasCtx.globalAlpha = this.fadeInTimer;
      } else {
        this.canvasCtx.globalAlpha = 1;
      }

      if (this.tRex.jumping) {
        this.tRex.updateJump(deltaTime);
      }

      this.runningTime += deltaTime;
      const hasObstacles = this.runningTime > this.config.CLEAR_TIME;

      // First jump triggers the intro.
      if (this.tRex.jumpCount === 1 && !this.playingIntro) {
        this.playIntro();
      }

      // The horizon doesn't move until the intro is over.
      if (this.playingIntro) {
        this.horizon.update(0, this.currentSpeed, hasObstacles);
      } else if (!this.crashed) {
        const showNightMode = this.isDarkMode ^ this.inverted;
        deltaTime = !this.activated ? 0 : deltaTime;
        this.horizon.update(
            deltaTime, this.currentSpeed, hasObstacles, showNightMode);
      }
      Runner.life.update();

      // Check for collisions.
      let collision = hasObstacles &&
          checkForCollision(this.horizon.obstacles[0], this.tRex);

      // For a11y, audio cues.
      if (Runner.audioCues && hasObstacles) {
        const jumpObstacle =
            this.horizon.obstacles[0].typeConfig.type != 'COLLECTABLE';

        if (!this.horizon.obstacles[0].jumpAlerted) {
          const threshold = Runner.isMobileMouseInput ?
              Runner.config.AUDIOCUE_PROXIMITY_THRESHOLD_MOBILE_A11Y :
              Runner.config.AUDIOCUE_PROXIMITY_THRESHOLD;
          const adjProximityThreshold = threshold +
              (threshold * Math.log10(this.currentSpeed / Runner.config.SPEED));

          if (this.horizon.obstacles[0].xPos < adjProximityThreshold) {
            if (jumpObstacle) {
              this.generatedSoundFx.jump();
            }
            this.horizon.obstacles[0].jumpAlerted = true;
          }
        }
      }

      // Activated alt game mode.
      if (Runner.isAltGameModeEnabled() && collision &&
          this.horizon.obstacles[0].typeConfig.type == 'COLLECTABLE') {
        this.horizon.removeFirstObstacle();
        this.tRex.setFlashing(true);
        collision = false;
        this.altGameModeFlashTimer = this.config.FLASH_DURATION;
        this.runningTime = 0;
        this.generatedSoundFx.collect();
      }

      // INFOCO MODIFIED BEGIN

      nowtime = new Date().getTime(); //获取当前时间

      if((!collision) && (nowtime - Runner.collisionTime <= 200)){
        this.distanceRan += this.currentSpeed * deltaTime / this.msPerFrame;

        if (this.currentSpeed < this.config.MAX_SPEED) {
          this.currentSpeed += this.config.ACCELERATION;
        }
      }else{
        //this.gameOver();
        // 不立即 game over 而是先记录撞击时间，如果±0.1秒内GP成功则能够取消掉这次 game over
        if (Runner.collisionTime == Infinity) {
            Runner.collisionTime = nowtime;
        }
        collision = false;
      }

      if (Math.abs(Runner.mikiriTime - Runner.collisionTime) <= 200) {
        Runner.collisionTime = Infinity;
        this.horizon.obstacles[0].remove = true;
        this.playSound(this.soundFx.BUTTON_PRESS);
      }

      if(Runner.gameoverflag == 1){
        collision = true;
        this.gameOver();
      }

      // 真正的 game over 判定
      if(nowtime - Runner.collisionTime >= 100){
        Runner.life.count-=1;
        Runner.collisionTime = Infinity;
        this.horizon.obstacles[0].remove = true;
        if(Runner.life.count == 0){
          Runner.gameoverflag = 1;
        }
      }

      // INFOCO MODIFIED END

      const playAchievementSound = this.distanceMeter.update(deltaTime,
          Math.ceil(this.distanceRan));

      if (!Runner.audioCues && playAchievementSound) {
        this.playSound(this.soundFx.SCORE);
      }

      // Night mode.
      if (!Runner.isAltGameModeEnabled()) {
        if (this.invertTimer > this.config.INVERT_FADE_DURATION) {
          this.invertTimer = 0;
          this.invertTrigger = false;
          this.invert(false);
        } else if (this.invertTimer) {
          this.invertTimer += deltaTime;
        } else {
          const actualDistance =
              this.distanceMeter.getActualDistance(Math.ceil(this.distanceRan));

          if (actualDistance > 0) {
            this.invertTrigger =
                !(actualDistance % this.config.INVERT_DISTANCE);

            if (this.invertTrigger && this.invertTimer === 0) {
              this.invertTimer += deltaTime;
              this.invert(false);
            }
          }
        }
      }
    }

    if (this.playing || (!this.activated &&
        this.tRex.blinkCount < Runner.config.MAX_BLINK_COUNT)) {
      this.tRex.update(deltaTime);
      this.scheduleNextUpdate();
    }
  }

Runner.prototype.restart = function () {
  if (!this.raqId) {
    this.playCount++;
    this.runningTime = 0;
    this.setPlayStatus(true);
    this.toggleSpeed();
    this.paused = false;
    /**INFOCO MODIFIED*/ Runner.mikiriTime = 0;
    /**INFOCO MODIFIED*/ Runner.collisionTime = Infinity;
    /**INFOCO MODIFIED*/ Runner.life = new Life(Runner.instance_.canvas, Runner.instance_.dimensions.WIDTH);
    /**INFOCO MODIFIED*/ Runner.gameoverflag = 0;
    this.crashed = false;
    this.distanceRan = 0;
    this.setSpeed(this.config.SPEED);
    this.time = getTimeStamp();
    this.containerEl.classList.remove(Runner.classes.CRASHED);
    this.clearCanvas();
    this.distanceMeter.reset();
    this.horizon.reset();
    this.tRex.reset();
    this.playSound(this.soundFx.BUTTON_PRESS);
    this.invert(true);
    this.flashTimer = null;
    this.update();
    this.gameOverPanel.reset();
    this.generatedSoundFx.background();
    
    this.containerEl.setAttribute('title', getA11yString(A11Y_STRINGS.jump));
    announcePhrase(getA11yString(A11Y_STRINGS.started));
  }
}