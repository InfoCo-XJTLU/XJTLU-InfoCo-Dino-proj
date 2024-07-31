
Runner.mikiriTime = 0;
Runner.collisionTime = Infinity;
Runner.gameoverflag = 0;
Runner.skillStartTime = 0;
Runner.perfect = 0;
Runner.energy = 0;
Runner.ap = 100;
Runner.lastJump = 0;
Runner.lastdt = 0;
Runner.lag = 0;
Runner.judges = [];
Runner.immortalStartTime = 0;
Runner.immortalLength = 0;
Runner.immortalStartFlag = false;
Runner.debugDeltaTime = 0;
Runner.lastImmortalJudge = 0;

function skill1xpos(dt){
  var x=0;
  if(dt > 0 && dt < 50){
    x=0.024*dt*(dt-100);
  } else if(dt >= 50 && dt < 75){
    x=(-0.112)*dt*dt+16.8*dt-620;
  } else if(dt >= 75 && dt < 100){
    x=10-2*Math.sqrt(dt-75);
  } else {
    x=0;
  }
  return x;
}

function skill1Eff(dt){
  var dy=0;
  if(dt <= 50.005){
    dy = 5 * Math.atan(dt - 5.8) + 7;
  } else {
    dy = -5 * Math.atan(dt - 94.21) + 7;
  }
  Runner.instance_.canvasCtx.fillRect(0, 105-dy*0.05, 600*dt/20, dy*0.1);
}

function immortalTime(){
  return 3600 / (Runner.debugDeltaTime / Runner.instance_.currentSpeed);
}

Runner.prototype.onKeyUp = function (e) {
    const keyCode = String(e.keyCode);
    const isjumpKey = Runner.keycodes.JUMP[keyCode] ||
                      e.type === Runner.events.TOUCHEND || e.type === Runner.events.POINTERUP;
    
    if (this.isRunning() && isjumpKey) {
        this.tRex.endJump();
    } else if (Runner.keycodes.DUCK[keyCode]) {
        this.tRex.speedDrop = false;
        this.tRex.setDuck(false);

        //INFOCO_MODIFIED
        var nowtime = new Date().getTime();
        Runner.mikiriTime = nowtime; //抬头时刻
        Runner.LastDuckingLength = Runner.mikiriTime - Runner.duckingStartTime;
        Runner.duckingStartTime = Infinity;
        if(Runner.energy == 100){
          Runner.immortalStartTime = nowtime;
          Runner.immortalLength = immortalTime();
          Runner.energy = 0;
          Runner.immortalStartFlag = true;
          Runner.textEffectController.push('status', '+必杀剑·地天');
        }

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
    var nowtime = new Date().getTime(); //获取当前时间
    this.updatePending = false;
    var isImmortal = (nowtime - Runner.immortalStartTime <= Runner.immortalLength);

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

      //INFOCO MODIFIED
      var dt = (nowtime - Runner.mikiriTime)/4;
      Runner.instance_.tRex.xInitialPos = 60 + skill1xpos(dt);
      Runner.instance_.tRex.xPos = 60 + skill1xpos(dt);
      if(!this.tRex.jumping){
        if(Runner.ap + deltaTime*0.04 > 100){
          Runner.ap = 100;
        } else {
          Runner.ap += deltaTime*0.08;
        }
      }

      Runner.debugDeltaTime =  deltaTime;

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
      
      //INFOCO MODIFIED
      var collision;
      // Check for collisions.
      if(Runner.skillStartTime == 0){
        collision = hasObstacles &&
            checkForCollision(this.horizon.obstacles[0], this.tRex);
      }

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
      

      if((!collision) && (nowtime - Runner.collisionTime <= 200)){
        this.distanceRan += this.currentSpeed * deltaTime / this.msPerFrame;

        if (this.currentSpeed < this.config.MAX_SPEED) {
          this.currentSpeed += this.config.ACCELERATION;
        }
      }else{
        //this.gameOver();
        // 不立即 game over 而是先记录撞击时间
        if (Runner.collisionTime == Infinity) {
            Runner.collisionTime = nowtime;
        }
        collision = false;
      }

      if(Runner.collisionTime != Infinity && isImmortal && nowtime - Runner.lastImmortalJudge > 20){
        Runner.collisionTime = Infinity;
        this.playSound(this.soundFx.SCORE);
        Runner.textEffectController.push('trex', '必杀剑·地天 2000');
        Runner.instance_.playingIntro = true;
        Runner.perfect = 3;
        Runner.lastImmortalJudge = nowtime;
      }

      var absdt = Math.abs(Runner.mikiriTime - Runner.collisionTime - 24 + Runner.lag); //调延迟需要手输代码

      if(Runner.immortalStartFlag){
        Runner.immortalStartFlag = false;
      }else{
        if (absdt <= 160 && Runner.LastDuckingLength >= 930) { // 如果头部下压时间大于咏唱时间并且±80ms内GP成功则能够取消掉这次 game over
          Runner.lastdt = Runner.mikiriTime - Runner.collisionTime - 24 + Runner.lag;
          Runner.collisionTime = Infinity;
          this.playSound(this.soundFx.SCORE);
          Runner.skillStartTime = nowtime;
          Runner.instance_.playingIntro = true;
          if(absdt <= 40){
            Runner.perfect = 1;
            Runner.textEffectController.push('trex', '斩铁剑 58500');
            Runner.textEffectController.push('status', '+崩破');
          } else {
            Runner.perfect = 2;
            Runner.textEffectController.push('trex', '斩铁剑 24000');
          }
        }
      }

      if (nowtime - Runner.mikiriTime > 400 && Runner.perfect != 0) {
        if(Runner.perfect == 1){
          Runner.instance_.playingIntro = false;
          Runner.instance_.distanceMeter.addBonus(1000);
          Runner.textEffectController.push('score', '+1000');
          Runner.textEffectController.push('remark', 'PERFECT');
          this.horizon.obstacles[0].remove = true;
          Runner.skillStartTime = 0;
          Runner.perfect = 0;
          Runner.gauge.addEnergy(25);
        } else if(Runner.perfect == 2){
          Runner.instance_.playingIntro = false;
          Runner.instance_.distanceMeter.addBonus(500);
          Runner.textEffectController.push('score', '+500');
          Runner.textEffectController.push('remark', 'GOOD');
          this.horizon.obstacles[0].remove = true;
          Runner.skillStartTime = 0;
          Runner.perfect = 0;
          Runner.gauge.addEnergy(10);
        } else if (Runner.perfect == 3) {
          Runner.instance_.playingIntro = false;
          Runner.perfect = 0;
          this.horizon.obstacles[0].remove = true;
          Runner.textEffectController.push('score', '+250');
          Runner.textEffectController.push('remark', 'AUTOPLAY');
          Runner.instance_.distanceMeter.addBonus(250);
        } else {
          return;
        }
        if(!isImmortal){
          Runner.judges.push(Runner.lastdt);
          if(Runner.lastdt < 0){
            Runner.textEffectController.push('timing', 'EARLY ' + Runner.lastdt.toString() + 'ms');
          } else {
            Runner.textEffectController.push('timing', 'LATE +' + Runner.lastdt.toString() + 'ms');
          }
        }
      }

      // 真正的 game over 判定
      if(Runner.gameoverflag == 1){
        collision = true;
        this.gameOver();
      }

      if(nowtime - Runner.collisionTime >= 100){
        Runner.life.count-=1;
        Runner.textEffectController.push('life', '-1 HP');
        Runner.textEffectController.push('remark', 'MISS');
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

    // INFOCO MODIFY
    if(dt >= 50 && dt < 100 && (!Runner.casting.Interrupted) && !isImmortal){
      skill1Eff(dt/2);
    }

    if(!this.inverted){
      this.canvasCtx.fillStyle = '#000000';
      this.canvasCtx.strokeStyle = '#000000';
    }else{
      this.canvasCtx.fillStyle = '#ffffff';
      this.canvasCtx.strokeStyle = '#ffffff';
    }
    Runner.life.update();
    Runner.textEffectController.update();
    Runner.casting.update();
    Runner.gauge.update();
  }

Runner.prototype.restart = function () {
  if (!this.raqId) {
    if(matchMedia('(prefers-color-scheme: dark)')){
      this.canvasCtx.fillStyle = '#000000';
    } else {
      this.canvasCtx.fillStyle = '#FFFFFF';
    }
    this.playCount++;
    
    this.runningTime = 0;
    this.setPlayStatus(true);
    this.toggleSpeed();
    this.paused = false;

    /**INFOCO MODIFIED*/ 
    Runner.mikiriTime = 0;
    Runner.collisionTime = Infinity;
    Runner.life = new Life(Runner.instance_.canvas, Runner.instance_.dimensions.WIDTH)
    Runner.gameoverflag = 0;
    Runner.perfect = 0;
    Runner.skillStartTime = 0;
    Runner.instance_.playingIntro = false;
    Runner.energy = 0;
    Runner.ap = 100;
    Runner.lastdt = 0;
    Runner.immortalStartTime = 0;
    Runner.immortalLength = 0;
    Runner.immortalStartFlag = false;

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