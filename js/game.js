$wb.ui.game = {};

$wb.ui.game.Board = $wb.Class('Board',{
    __extends:[$wb.ui.Widget],
    __construct:function() {
        this.__super({
            tmpl:$wb.template.base
        });

        var self = this;
        var resizeTimeout = null;
        $(window).bind('resize',function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                self._resize();
            },0);
        });

        this.bind('beforelayout',this.makeFullScreen);
        this.bind('paint',function() {
            this.elm().addClass('game-board'); 
        });
    },
    makeFullScreen: function() {
        var w = $(window).width();
        var h = $(window).height();
        this.elm().width(w);
        this.elm().height(h);
    }
});

$wb.ui.game.Structure = $wb.Class('Structure',{
    __extends:[$wb.ui.Widget],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:function() {
                return '<div class="game-structure" />';
            }
        },opts);
        this.__super(opts);
    }
});
$wb.ui.game.Car = $wb.Class('Car',{
    __extends:[$wb.ui.Widget],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:function() {
                return '<div class="game-car" />';
            }
        },opts);
        this.__super(opts);
        this._directionOffset = 90;
        this._direction = 90;
        this._topSpeed = 20;
        this._topReverseSpeed = -10;
        this._speed = 0;
        var self = this;
        var position = {
            left:0,
            top:0
        }
        
        this.bind('paint',function() {
            $('body').keyboardNavigation();
            $('body').disableMarking();
            var throttle = false;
            var turn = false;
            $('body').bind('keyup',function(evt) {
                switch(evt.keyCode) {
                    case 38://UP
                        throttle = false;
                        break;
                    case 40://DOWN
                        throttle = false;
                        break;
                    case 39://RIGHT
                        turn = false;
                        break;
                    case 37://LEFT
                        turn = false;
                        break;
                }
            });
            $('body').bind('keydown',function(evt) {
                switch(evt.keyCode) {
                    case 38://UP
                        throttle = 'up';
                        break;
                    case 40://DOWN
                        throttle = 'down';
                        break;
                    case 39://RIGHT
                        turn = 'right';
                        break;
                    case 37://LEFT
                        turn = 'left';
                        break;
                }                
                
            });
            setInterval(function() {
                var dir = self._direction;
                switch(throttle) {
                    case 'up'://UP
                        if (self._speed < self._topSpeed)
                            self._speed++;
                        break;
                    case 'down'://DOWN
                        if (self._speed > self._topReverseSpeed)
                            self._speed--;
                        break;
                    default:
                        if (self._speed > 0) {
                            self._speed--;
                        } else if (self._speed < 0) {
                            self._speed++;
                        }
                        break;
                }
                var turnSpeed = 0;
                if (self._speed > 1)
                    turnSpeed = Math.abs(self._speed/self._topSpeed);
                else if (self._speed < 1)
                    turnSpeed = Math.abs(self._speed/self._topReverseSpeed);
                
                var turnDegree = 0;
                switch(turn) {
                    case 'right'://RIGHT
                        turnDegree = 5*turnSpeed;
                        break;
                    case 'left'://LEFT
                        turnDegree = -5*turnSpeed;break;
                }
                
                if (self._speed < 0)
                    turnDegree*=-1;
                
                dir += turnDegree;
                if (dir > 360)
                    dir -= 360;
                else if (dir < 0)
                    dir += 360
                
                self._direction = dir;    
            },50);
            
            setInterval(function() {
                var el = self.elm();
                var dir = (self._direction-self._directionOffset) % 360;
                
                if (self._speed == 0) return;
                
                el.rotate(dir);
                
                var way = Math.abs(self._direction % 360);
                
                var dirX = Math.abs(self._direction % 180);
                if (dirX > 90)
                    dirX = 90 - (dirX-90);
                
                var speedX = (self._speed * (dirX/90));
                
                var speedY = (self._speed-speedX);
                
                if (way > 180)
                    speedX *= -1;
                
                
                if (!(way > 90 && way < 270))
                    speedY *= -1;
                
                
                var o = position;
                
                o.left +=speedX;
                o.top += speedY;
                
                el.css(o);
                
            },20);
        });
    }
});