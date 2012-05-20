$(function() {
    var game = {
        ui:{
            units:{}
        }
    };
    
    
    game.ui.units.Car = $wb.Class('Car',{
        __extends:[$wb.ui.Canvas],
        _colorStart:null,
        _colorEnd:null,
        __construct:function(color) {
            this.__super(this._painter);
            switch(color) {
                default:
                case 'red':
                    this._colorStart = "rgb(171, 34, 33)";
                    this._colorEnd = "rgb(102, 46, 44)";
                    break;
                case 'yellow':
                    this._colorStart = "#CCCC66";
                    this._colorEnd = "#FFFF00";
                    break;
                case 'blue':
                    this._colorStart = "#3333CC";
                    this._colorEnd = "#9999FF";
                    break;
            }
            
            
        },
        _painter:function() {
            var self = this;
            this.target().draw(function draw(ctx) {
                var gradient;

                // layer1/
                ctx.save();
                ctx.restore();

                // layer2/Group
                ctx.save();

                // layer2/Group/Path
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(267.4, 58.3);
                ctx.bezierCurveTo(267.4, 58.3, 266.9, 87.5, 267.3, 92.9);
                ctx.bezierCurveTo(267.6, 98.3, 269.4, 116.8, 243.1, 116.0);
                ctx.bezierCurveTo(216.7, 115.3, 204.5, 111.3, 186.4, 108.5);
                ctx.bezierCurveTo(168.4, 105.6, 111.7, 107.0, 90.0, 109.2);
                ctx.bezierCurveTo(68.4, 111.3, 55.4, 116.0, 38.8, 116.0);
                ctx.bezierCurveTo(22.2, 116.0, 0.5, 109.5, 0.5, 81.4);
                ctx.lineTo(0.5, 35.2);
                ctx.bezierCurveTo(0.5, 7.0, 22.2, 0.5, 38.8, 0.5);
                ctx.bezierCurveTo(55.4, 0.5, 68.4, 5.2, 90.0, 7.4);
                ctx.bezierCurveTo(111.7, 9.5, 168.4, 11.0, 186.4, 8.1);
                ctx.bezierCurveTo(204.5, 5.2, 216.7, 1.2, 243.1, 0.5);
                ctx.bezierCurveTo(269.4, -0.2, 267.6, 18.2, 267.3, 23.6);
                ctx.bezierCurveTo(266.9, 29.0, 267.4, 58.3, 267.4, 58.3);
                ctx.closePath();
                gradient = ctx.createLinearGradient(133.4, 1.1, 134.7, 114.1);
                gradient.addColorStop(0.00, self._colorStart);
                gradient.addColorStop(1.00, self._colorEnd);
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.stroke();

                // layer2/Group/Path
                ctx.beginPath();
                ctx.moveTo(108.1, 94.4);
                ctx.bezierCurveTo(108.1, 94.4, 85.0, 84.6, 85.3, 58.3);
                ctx.bezierCurveTo(85.7, 31.9, 100.5, 26.1, 108.1, 22.9);
                ctx.bezierCurveTo(108.1, 22.9, 129.1, 38.8, 127.3, 38.1);
                ctx.bezierCurveTo(125.5, 37.4, 128.1, 73.8, 128.1, 73.8);
                ctx.lineTo(108.1, 94.4);
                ctx.closePath();
                gradient = ctx.createLinearGradient(106.2, 23.9, 107.0, 92.5);
                gradient.addColorStop(0.00, "rgb(104, 197, 223)");
                gradient.addColorStop(1.00, "rgb(231, 245, 252)");
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.stroke();

                // layer2/Group/Path
                ctx.beginPath();
                ctx.moveTo(29.7, 22.4);
                ctx.bezierCurveTo(29.7, 25.3, 26.3, 27.6, 22.2, 27.6);
                ctx.bezierCurveTo(18.0, 27.6, 14.6, 25.3, 14.6, 22.4);
                ctx.bezierCurveTo(14.6, 19.5, 18.0, 17.1, 22.2, 17.1);
                ctx.bezierCurveTo(26.3, 17.1, 29.7, 19.5, 29.7, 22.4);
                ctx.closePath();
                ctx.fillStyle = "rgb(253, 250, 224)";
                ctx.fill();
                ctx.stroke();

                // layer2/Group/Path
                ctx.beginPath();
                ctx.moveTo(29.7, 94.4);
                ctx.bezierCurveTo(29.7, 97.3, 26.3, 99.6, 22.2, 99.6);
                ctx.bezierCurveTo(18.0, 99.6, 14.6, 97.3, 14.6, 94.4);
                ctx.bezierCurveTo(14.6, 91.5, 18.0, 89.1, 22.2, 89.1);
                ctx.bezierCurveTo(26.3, 89.1, 29.7, 91.5, 29.7, 94.4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // layer2/Group/Path
                ctx.beginPath();
                ctx.moveTo(108.1, 22.9);
                ctx.bezierCurveTo(108.1, 22.9, 145.6, 18.2, 199.0, 22.9);
                ctx.lineTo(190.0, 38.4);
                ctx.lineTo(127.3, 38.1);
                ctx.lineTo(108.1, 22.9);
                ctx.closePath();
                gradient = ctx.createLinearGradient(108.1, 29.6, 199.0, 29.6);
                gradient.addColorStop(0.00, "rgb(104, 197, 223)");
                gradient.addColorStop(1.00, "rgb(231, 245, 252)");
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.stroke();

                // layer2/Group/Path
                ctx.beginPath();
                ctx.moveTo(108.1, 94.3);
                ctx.bezierCurveTo(108.1, 94.3, 145.6, 98.9, 199.0, 94.3);
                ctx.lineTo(189.3, 73.8);
                ctx.lineTo(128.1, 73.8);
                ctx.lineTo(108.1, 94.3);
                ctx.closePath();
                gradient = ctx.createLinearGradient(108.1, 85.1, 199.0, 85.1);
                gradient.addColorStop(0.00, "rgb(104, 197, 223)");
                gradient.addColorStop(1.00, "rgb(231, 245, 252)");
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.stroke();

                // layer2/Group/Path
                ctx.beginPath();
                ctx.moveTo(199.0, 94.3);
                ctx.bezierCurveTo(199.0, 94.3, 241.3, 85.0, 240.9, 58.6);
                ctx.bezierCurveTo(240.6, 32.3, 206.6, 26.1, 199.0, 22.9);
                ctx.bezierCurveTo(199.0, 22.9, 186.4, 39.9, 188.2, 39.1);
                ctx.bezierCurveTo(190.0, 38.4, 189.3, 73.8, 189.3, 73.8);
                ctx.lineTo(199.0, 94.3);
                ctx.closePath();
                gradient = ctx.createLinearGradient(214.8, 24.1, 214.0, 92.5);
                gradient.addColorStop(0.00, "rgb(104, 197, 223)");
                gradient.addColorStop(1.00, "rgb(231, 245, 252)");
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.stroke();
                ctx.restore();
                ctx.restore();
            });
        }
    });
    
    var base = new $wb.ui.BasePane();
        
    
    base.add(new game.ui.units.Car("red"));
    base.add(new game.ui.units.Car("blue"));

    base.render($('body'));
});
