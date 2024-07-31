// 各位发现的单行MOD可以放在这里。

// 地面不动，小恐龙原地跑步并加分
Runner.instance_.playingIntro = true;

// 通过删除碰撞检测导致撞了障碍物还能接着跑
boxCompare = function(tRexBox, obstacleBox) {return false;}

// 通过删除 gameOver() 本身导致撞了障碍物还能接着跑
Runner.prototype.gameOver = function(){}

