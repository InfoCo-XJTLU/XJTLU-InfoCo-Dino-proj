GameOverPanel.prototype.draw = function (opt_altGameModeActive, opt_tRex) {
    if (opt_altGameModeActive) {
      this.altGameModeActive = opt_altGameModeActive;
    }

    this.drawGameOverText(GameOverPanel.dimensions, false);
    this.drawRestartButton();
    this.drawAltGameElements(opt_tRex);
    this.update();
    if(Runner.judges.length >= 1){
        console.log('Statistics: ');
        var freq = [];
        var maxfreq = 0;
        for (let i = -160; i <= 150; i+=10) {
            const count = Runner.judges.filter(((v) => v >= i && v < i+10)).length;
            freq.push(count);
            if(count > freq[maxfreq]){
                maxfreq = i / 10 + 16;
            }
        }
        for (let i = 0; i <= 31; i++) {
            var tmp = (i*10-160).toString() + ' ~ ' + (i*10-150).toString() + 'ms';
            if(tmp.length <= 11){
                tmp += '\t'
            }
            tmp += '\t|'
            for(let j = 0; j <= freq[i]; j++){
                tmp += '■';
            }
            console.log(tmp + ' ' + freq[i]);
        }
        console.log('Avg: '+((Runner.judges.filter(((v) => v >= (maxfreq-16)*10 && v < (maxfreq-16)*10+10)).reduce((a, b) => a + b)) / freq[maxfreq]).toString());
    }
}