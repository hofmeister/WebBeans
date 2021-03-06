//@module core.draw @prio 99
/**
 * @fileOverview
 * This file contains canvas elements
 * @author <a href="http://twitter.com/vonhofdk"/>Henrik Hofmeister</a>
 * @version 1.0
 */

/**
 * @namespace Drawing API
 */

$wb.draw = {};


$wb.draw.Canvas = $wb.Class('Canvas',{
    __extends: [$wb.ui.Widget],
    __defaults: {
        tmpl:$wb.template.draw.canvas,
        maxSize: 6000, //Large sized canvassed are unsupported in most browsers
        layout:function() {
            var target = this.target();
            var me = this;
            var buffer = 100;

            var vbox = this.elm().visibleBox();
            var width = (vbox.right - vbox.left) + (buffer * 2);
            var height = (vbox.bottom - vbox.top) + (buffer * 2);

			this.elm().find('.wb-layer').css({
                position:'absolute',
                top: buffer*-1,
                left: buffer*-1
            }).each(function () {
                var layer = $(this).widget();
                layer.canvas()
                        .attr('width', width)
                        .attr('height',height)
                        .css('z-index',layer.getOrder());

                layer.clear();
            });
        }
    },
    _layerNames:{},
    __construct:function() {
        this.__super(this.getDefaults());
		this.elm().disableMarking();
    },
    addLayer:function(name,zIndex) {
        if (typeof zIndex == 'undefined')
            zIndex = this.children().length;
        var layer = new $wb.draw.Layer({
            order:zIndex,
            canvas:this,
            name:name
        });
        if (name) {
            this._layerNames[name] = this.children().length;
        }
        this.add(layer);
        return layer;
    },
    getLayer:function(ix) {
        if ($.type(ix) == 'string')
            ix = this._layerNames[ix];
        if ($.type(ix) == 'number')
            return this.children()[ix];
        return null;
    },
    clear:function() {
        for(var i = 0;i < this.children().length;i++) {
            this.children()[i].clear();
        }
    },
    deleteLayer:function(ix) {
        if ($.type(ix) == 'string') {
            var name = ix;
            ix = this._layerNames[name];
            delete this._layerNames[name];
        }
        
        if ($.type(ix) == 'number') {
            var layer = this.children().splice(ix,1);
            layer.elm().detach();
            layer = undefined;
        }
            
        return this;
    }
});

$wb.draw.Layer = $wb.Class('Layer',{
    __extends:[$wb.ui.Widget],
    __defaults:{
        tmpl:$wb.template.draw.layer,
        order:-1,
        name:null,
        layout:function() {
            this._paintElements();
        }
    },
    _elements:[],
    __construct:function(opts) {
        this.require(opts,'order');
        this.__super(this.getDefaults(opts));
    },
    add:function(elm) {
        elm.setLayer(this);
        this._elements.push(elm);
        this.trigger('add',[elm]);
    },
    remove:function(elm) {
        var ix = this._elements.indexOf(elm);
        if (ix > -1) {
            this._elements.splice(ix,1);
        }
        this.trigger('remove',[elm]);
    },
    render:function(container) {
        if (!this.isReady()) return;
        this.trigger('before-render');
        if (container)
            this.elm().append(container);
        this._paintElements();
        this.trigger('render');
    },
    _paintElements:function() {
        this.clear();
        this._elements.sort(function(a,b) {
            return a.opts.zIndex-b.opts.zIndex;
        });

        var buffer = 100;

        var ppos = this.parent().elm().position();
        var offset = {
            x: ppos.left + buffer,
            y: ppos.top + buffer
        }
        this.elm().css({
                top:offset.y * -1,
                left:offset.x * -1
            });


        var vbox = this.parent().elm().visibleBox();
        for(var i = 0; i < this._elements.length;i++) {
            var child = this._elements[i];
            if (child.isVisible()) {
                if (child.getBoundingBox) {
                    var bbox = child.getBoundingBox();
                    if (bbox.x2 < vbox.left ||
                        bbox.x1 > vbox.right ||
                        bbox.y2 < vbox.top ||
                        bbox.y1 > vbox.bottom) {
                        continue;
                    }
                }
                child.setOffset(offset.x,offset.y);
                child.draw(this);
            }
        }
    },
    elements:function() {
        return this._elements;
    },
    getOrder:function() {
        return this.opts.order;
    },
    setOrder:function(order) {
        this.opts.order = order;
        return this;
    },
    canvas:function() {
        return this.elm();
    },
    clear:function() {
        this.context().clearRect(0,0,parseInt(this.elm().attr('width')),parseInt(this.elm().attr('height')));
        
    },
    empty:function() {
        while(this._elements.length > 0) {
            var elm = this._elements.pop();
            elm.destroy();
        }
        this.clear();
    },
    context:function() {
        return this.elm()[0].getContext('2d');
    }
});


$wb.draw.Element = $wb.Class('Element',{
    __extends:[$wb.core.Utils,$wb.core.Events],
    __defaults:{
        visible:true,
        cache:false,
        fillStyle:'#000000',
        strokeStyle:'#000000',
        rounded:false,
        lineWidth:1,
        zIndex:0,
        miterLimit:10,
        shadowColor:'#000000',
        shadowOffsetX:0,
        shadowOffsetY:0,
        shadowBlur:0
    },
    _offset: {x:0,y:0},
    _ctxtOpts:[ 'fillStyle','strokeStyle','lineWidth','miterLimit',
                'shadowColor','shadowOffsetX','shadowOffsetY','shadowBlur'],
    _cached:null,
    _layer:null,
    __construct:function(opts) {
        this.opts = this.getDefaults(opts);
    },
    setLayer:function(layer) {
        this._layer = layer;
        return this;
    },
    destroy:function() {
        var layer = this._layer;
        layer.remove(this);
        this.trigger('destroy');
        delete this.opts;
        delete this._ctxtOpts;
        delete this._cached;
    },
    getLayer:function() {
        return this._layer;
    },
    render:function(layer) {
        if (!layer) {
            layer = this._layer;
        }

        if (layer) {
            return this.draw(layer);
            layer.render();
            this.trigger('render');
        } else {
            console.warn('Layer not found for elm',this);
        }
        return this;
    },
    draw:function(layer) {
        
        if (!layer) {
            layer = this._layer;
        }
        if (!layer ){
            console.warn('Layer not found for elm',this);
            return;
        }
        this.trigger('before-draw');
        
        if (this.opts.cache) {
            if (!this._cached) {
                this._cached = $('<canvas width="%s" height="%s" />'.
                    format( layer.canvas().attr('width'),
                            layer.canvas().attr('height')))[0];
                            
                var ctxt = this._cached.getContext('2d');
                this._setOptions(ctxt);
                
                this._paint(ctxt,$(this._cached));
            }
            layer.context().drawImage(this._cached,0,0);
        } else {
            this._setOptions(layer.context());
            this._paint(layer.context(),layer.canvas());
        }
        this.trigger('draw');
        return this;
    },
    
    _setOptions:function(ctxt) {
        for(var i = 0; i < this._ctxtOpts.length;i++) {
            var opt = this._ctxtOpts[i];
            ctxt[opt] = this.opts[opt];
        }
        if (this.opts.rounded) {
            ctxt.lineCap = 'round';
            ctxt.lineJoin = 'round';
        } else {
            ctxt.lineCap = 'square';
            ctxt.lineJoin = 'miter';
        }
    },
    clearCache:function() {
        if (this._cached) {
            this._cached.detach();
            delete this._cached;
            this._cached = null;
        }
    },
    _paint:function(ctxt,canvas) {
        throw new $wb.Error('$wb.draw.Element\'s has to implement a _paint method');
    },
    isVisible:function() {
        return this.opts.visible;
    },
    setVisible:function(visible) {
        if (this.opts.visible != visible) {
            this.opts.visible = visible;
            this.render();
        }
    },
    setOffset: function(x,y) {
        this._offset = {
            x:x,
            y:y
        };
    }
});


$wb.draw.PolyLine = $wb.Class('PolyLine',{
    __extends:[$wb.draw.Element],
    __defaults:{
        smooth: false,
        lineEnding:null,
        style:'normal' //normal or dashed
    },
    _points:[],
    __construct:function(opts) {
        this.__super(opts);
    },
    addPoint:function(x,y) {
        if ($.type(x) == 'object') {
            this._points.push(x);
        } else {
            this._points.push({
                x:x,y:y
            });
        }
        
        this.clearCache();
        return this;
    },
    addPoints:function(points) {
        for(var i = 0;i < points.length;i++) {
            this._points.push(points[i]);
        }
        
        this.clearCache();
        return this;
    },
    clearPoints:function() {
        this._points = [];
        this.clearCache();
        return this;
    },
    setLineCap:function(lineEnding) {
        this.opts.lineEnding = lineEnding;
        if (this.opts.lineEnding) {
            this.opts.lineEnding.setOffset(this._offset.x,this._offset.y);
        }
        this.clearCache();
        return this;
    },
    _paint:function(ctxt,canvas) {
        var first = this._points[0];
        ctxt.beginPath();
        if (this.opts.style == 'dashed') {
            ctxt.setLineDash([8]);
        }
        ctxt.moveTo(first.x + this._offset.x, first.y + this._offset.y);

        if (this.opts.smooth) {
            this._paintSmooth(ctxt, canvas);
        } else {
            this._paintStraight(ctxt, canvas);
        }

        ctxt.stroke();

        if (this.opts.style == 'dashed') {
            ctxt.setLineDash([]);
        }

        ctxt.beginPath();
        this._paintLineEnding(ctxt,canvas);
        ctxt.stroke();
    },
    _paintStraight: function(ctxt, canvas) {
        for(var i = 1;i < this._points.length;i++) {
            var p = this._point(i);

            ctxt.lineTo( p.x, p.y );
        }
    },
    _point: function(i) {
        if (!this._points[i]) {
            return null;
        }
        return {
            x: this._points[i].x + this._offset.x,
            y: this._points[i].y + this._offset.y
        };
    },
    _paintSmooth: function(ctxt, canvas) {
        if (this._points.length < 3) {
            this._paintStraight(ctxt, canvas);
            return;
        }

        var points = [];
        for(var i = 0;i < this._points.length;i++) {
            var p = this._point(i);
            points.push(p);
        }

        var iPoints = this._getInterpolatedPoints(points, 20);

        for(var i = 0;i < iPoints.length;i++) {
            var p = iPoints[i]

            ctxt.lineTo(p.x, p.y);
        }
    },
    _getInterpolationSegment: function(pnt0, pnt1, pnt2, pnt3, buff, buff_base, pointsPerSegment){
        var rv = false;
        var steps = 0;
        var step = 0.0;
        var t = 0.0;
        var tt = 0.0;
        var ttt = 0.0;
        var p0x = pnt0.x;
        var p1x = pnt1.x;
        var p2x = pnt2.x;
        var p3x = pnt3.x;
        var p0y = pnt0.y;
        var p1y = pnt1.y;
        var p2y = pnt2.y;
        var p3y = pnt3.y;
        //var ipps = this._interpolatedPointsPerSegment;
        var ipps = pointsPerSegment;
        var i = 0;
        if (buff){
            steps = ipps - 1;
            if (steps > 0){
                step = 1.0 / steps;
                steps = buff_base + steps;
                //t = 0.0 => point = pnt1
                buff[buff_base].x = pnt1.x;
                buff[buff_base].y = pnt1.y;

                //0.0<t<1.0 => ...
                for (i = buff_base+1; i < steps; ++i){
                    t += step;
                    tt = t*t;
                    ttt = tt * t;
                    buff[i].x = 0.5 * ( (2*p1x) +
                        (-p0x + p2x) * t +
                        (2*p0x - 5*p1x + 4*p2x - p3x) * tt +
                        (-p0x + 3*p1x - 3*p2x + p3x) * ttt);
                    buff[i].y = 0.5 * ( (2*p1y) +
                        (-p0y + p2y) * t +
                        (2*p0y - 5*p1y + 4*p2y - p3y) * tt +
                        (-p0y + 3*p1y - 3*p2y + p3y) * ttt);
                }

                //t = 1.0 => point = pnt2
                buff[steps].x = pnt2.x;
                buff[steps].y = pnt2.y;
                rv = true;
            }
        }
        return rv;
    },
    _getInterpolatedPoints: function(points, pointsPerSegment) {
        var pnts,pnt,pnt0,pnt1,pnt2,pnt3,rv;

        var ipps = pointsPerSegment - 1,
            subsegments = ipps * (points.length - 1) + 1,
            n = 0,
            current_base = 0;

        if ((!rv || (rv.length !== subsegments)) && (points.length > 2)){
            rv = [];
            for (i = 0; i < subsegments; ++i){
                rv.push({'x': 0.0, 'y': 0.0});
            }

            pnts = points;

            pnt1 = pnts[0];
            pnt2 = pnts[1];
            pnt3 = pnts[2];
            pnt0 = pnt = {'x': pnt1.x + (pnt1.x - pnt2.x), 'y': pnt1.y + (pnt1.y - pnt2.y)};

            this._getInterpolationSegment(pnt0, pnt1, pnt2, pnt3, rv, current_base, pointsPerSegment);
            current_base += ipps;

            //
            n = pnts.length;
            for (i = 3; i < n; ++i){
                pnt0 = pnt1;
                pnt1 = pnt2;
                pnt2 = pnt3;
                pnt3 = pnts[i];

                this._getInterpolationSegment(pnt0, pnt1, pnt2, pnt3, rv, current_base, pointsPerSegment);
                current_base += ipps;
            }

            //the last segment
            pnt0 = pnt1;
            pnt1 = pnt2;
            pnt2 = pnt3;
            pnt3 = pnt; pnt3.x = pnt2.x + (pnt2.x - pnt1.x); pnt3.y = pnt2.y + (pnt2.y - pnt1.y);
            this._getInterpolationSegment(pnt0, pnt1, pnt2, pnt3, rv, current_base, pointsPerSegment);
            current_base += ipps;

        } else if (!(rv && (points.length > 2))){
            rv = [];

            pnts = points;
            n = pnts.length;
            for (i = 0; i < n; ++i){
                pnt = pnts[i];
                rv.push({'x': pnt.x, 'y': pnt.y});
            }
        }
        return rv;
    },

    _paintLineEnding:function(ctxt,canvas) {
        if (this.opts.lineEnding && this._points.length > 1) {
            var offset = 0;
            var tip = this._points[this._points.length-1];
            var ref = this._points[this._points.length-2];
            if (this._points.length > 2) {
                if (tip.x == ref.x && Math.abs(tip.y-ref.y) < 3) {
                    tip = ref;
                    ref = this._points[this._points.length-3];
                } else if (tip.y == ref.y && Math.abs(tip.x-ref.x) < 3) {
                    tip = ref;
                    ref = this._points[this._points.length-3];
                }
            }
            
            this.opts.lineEnding.setPoints(tip,ref);
            this.opts.lineEnding._paint(ctxt,canvas);
        }
    },
    getPoints:function() {
        return this._points;
    },
    getBoundingBox:function() {
        var out = {
            x1:-1,
            y1:-1,
            x2:-1,
            y2:-1
        };

        this._points.forEach(function(point) {
            if (out.x1 < 0) {
                out.x1 = out.x2 = point.x;
            } else {
                out.x1 = Math.min(out.x1,point.x);
                out.x2 = Math.max(out.x2,point.x);
            }
            if (out.y1 < 0) {
                out.y1 = out.y2 = point.y;
            } else {
                out.y1 = Math.min(out.y1,point.y);
                out.y2 = Math.max(out.y2,point.y);
            }
        });

        return out;
    },
    destroy:function() {
        delete this._points;
        this.__super();
    },
    setOffset: function(x, y) {
        if (this.opts.lineEnding) {
            this.opts.lineEnding.setOffset(x,y);
        }
        return this.__super(x, y);
    }
});


$wb.draw.Path = $wb.Class('Path',{
    __extends:[$wb.draw.PolyLine],
    __defaults:{
        edgeOffset:10
    },
    _obstacles:[],
    __construct:function(opts) {
        this.__super(opts);
    },
    addObstacle:function(o) {
        this._obstacles.push(0);
        this.clearCache();
    },
    setObstacles:function(obstacles) {
        this._obstacles = obstacles;
        this.clearCache();
    },
    _lookHorizontal:function(from,to) {
        var thisDiff,closestObstacle,closestOffset,blocked = false,diff=-1;
        var out = {
            x:to.x,
            y:from.y
        };
        for(var i = 0; i < this._obstacles.length;i++) {
            var o = this._obstacles[i];
            if (o.top < from.y 
                    && o.bottom > from.y) {
                //Blocking the path in vertical space

                if (o.right > from.x && o.left < to.x) {
                    //Blocking to the right
                    thisDiff = o.right-from.x;

                    if (thisDiff < diff || diff == -1) {
                        diff = thisDiff;
                        closestOffset = o.left;
                        closestObstacle = o;
                    }
                    blocked = true;

                } else if (o.left < from.x && o.right > to.x) {
                    //Blocking to the left
                    thisDiff = from.x-o.left;

                    if (thisDiff < diff || diff == -1) {
                        diff = thisDiff;
                        closestOffset = o.right;
                        closestObstacle = o;
                    }
                    blocked = true;
                }

            }
        }
        if (blocked) {
            out.x = closestOffset;
            if (from.x == out.x) {
                //No move possible - need to move vertically
                //return null;
                out.y = (from.y-to.y) > 0 ? closestObstacle.top : closestObstacle.bottom;
            }
        }
        return out;
    },
    _lookVertical:function(from,to) {
        var out = {
            x:from.x,
            y:to.y
        };
        var closestOffset,thisDiff,closestObstacle,blocked = false,diff = -1;
        closestOffset = null;
        for(var i = 0; i < this._obstacles.length;i++) {
            var o = this._obstacles[i];
            if (o.left < from.x 
                    && o.right > from.x) {
                //Blocking the path in horizontal space

                if (o.bottom > from.y && o.top < to.y) {
                    //Blocking to the below
                    thisDiff = o.bottom-from.y;

                    if (thisDiff < diff || diff == -1) {
                        diff = thisDiff;
                        closestOffset = o.top;
                        closestObstacle = o;
                    }
                    blocked = true;

                } else if (o.top < from.y && o.bottom > to.y) {
                    //Blocking above

                    thisDiff = from.y-o.top;

                    if (thisDiff < diff || diff == -1) {
                        diff = thisDiff;
                        closestOffset = o.bottom;
                        closestObstacle = o;
                    }
                    blocked = true;
                }

            }
        }
        if (blocked) {
            out.y = closestOffset;
            if (from.y == out.y) {
                //No move possible - need to move horizontally
                //return null;
                out.x = (from.x-to.x) > 0 ? closestObstacle.left : closestObstacle.right;
            } 
        }
        return out;
    },
    _checkEnd:function(end) {
        //Check if end point is within obstacle. If so - just move end to nearest edge point
        for(var i = 0; i < this._obstacles.length;i++) {
            var o = this._obstacles[i];
            if ($wb.geo.rect.isInside(end, o)) {
                var p = $wb.geo.rect.nearestEdgePoint(end, o);
                if (p) {
                    return p;
                }
            }
        }
        return end;
    },
    pathTo:function(end) {
        end = this._checkEnd(end);
        var points = this._points;
        var current = points[points.length-1];
        var attempts = 0;
        
        
        
        //Calculate path
        while(current.y != end.y 
                    || current.x != end.x) {
            
            attempts++;
            if (attempts > 20) break;
            
            var diffX = Math.abs(end.x-current.x);
            var diffY = Math.abs(end.y-current.y);

            var newX = end.x;
            var newY = end.y;

            //Cut up long stretches to make it make more versatile paths
            if (diffX > 100) {
                if (end.x < current.x)
                    newX += 50;
                else
                    newX -= 50;
            }

            if (diffY > 100) {
                if (end.y < current.y)
                    newY += 50;
                else
                    newY -= 50;
            }
            
            var newPos = {
                x:newX,
                y:newY
            };


            var next = null;

            if (diffX >= diffY && diffX > 0) {
                //Find the next possible horizontal move;
                next = this._lookHorizontal(current,newPos);
            }

            //Find vertical path
            if ((!next || this._samePoint(next,newPos)) && diffY > 0) {
                next = this._lookVertical(current,newPos);
            }
            
            if (!next) 
                next = newPos;
            current = next;
            points.push(current);
        }
        
        this.clearCache();
        return this;
    },
    _samePoint:function(p1,p2) {
        return Math.floor(p1.x) == Math.floor(p2.x) 
                && Math.floor(p1.y) == Math.floor(p2.y);
    },
    destroy:function() {
        delete this._obstacles;
        this.__super();
    }
});
$wb.draw.LineCap = $wb.Class('LineCap',{
    __extends:[$wb.draw.Element],
    __defaults:{
        tip:{x:0,y:0},
        reference:{x:0,y:0}
    },
    __construct:function(opts) {
        this.__super(opts);
    },
    setPoints:function(tip,reference) {
        this.opts.tip = tip;
        this.opts.reference = reference;
        this.clearCache();
        return this;
    }
});

$wb.draw.Arrow = $wb.Class('Arrow',{
    __extends:[$wb.draw.LineCap],
    __defaults:{
        size:10
    },
    __construct:function(opts) {
        this.__super(opts);
    },
    _paint:function(ctxt,canvas) {
        var size = this.opts.size;
        var to = this.opts.tip;
        var from = this.opts.reference;
        var angle = Math.atan2(to.y-from.y,to.x-from.x);
        
        var offset = {
            x:to.x+3*Math.cos(angle),
            y:to.y+3*Math.sin(angle)
        };
        
        ctxt.moveTo(offset.x + this._offset.x, offset.y + this._offset.y);
        ctxt.lineTo(
            (offset.x + this._offset.x) - size * Math.cos(angle-Math.PI/6),
            (offset.y + this._offset.y) - size * Math.sin(angle-Math.PI/6)
        );
        ctxt.moveTo(offset.x + this._offset.x, offset.y + this._offset.y);
        ctxt.lineTo(
            (offset.x + this._offset.x) - size * Math.cos(angle+Math.PI/6),
            (offset.y + this._offset.y) - size * Math.sin(angle+Math.PI/6)
        );
    }
});


$wb.draw.Polygon = $wb.Class('Polygon',{
    __extends:[$wb.draw.PolyLine],
    __construct:function(opts) {
        this.__super(opts);
    },
    _paint:function(ctxt,canvas) {
        var first = this._points[0];
        ctxt.beginPath();
        ctxt.moveTo(
            first.x + this._offset.x,
            first.y + this._offset.y);
        for(var i = 1;i < this._points.length;i++) {
            ctxt.lineTo(
                this._points[i].x + this._offset.x,
                this._points[i].y + this._offset.y);
        }
        ctxt.lineTo(
            first.x + this._offset.x,
            first.y + this._offset.y
        );
        ctxt.stroke();
        ctxt.fill();
    }
});

$wb.draw.Rectangle = $wb.Class('Rectangle',{
    __extends:[$wb.draw.Element],
    __defaults:{
        x1:0,
        y1:0,
        x2:0,
        y2:0
    },
    __construct:function(opts) {
        this.__super(opts);
    },
    setPoints:function(x1,y1,x2,y2) {
        this.opts.x1 = x1;
        this.opts.y1 = y1;
        this.opts.x2 = x2;
        this.opts.y2 = y2;
        
        this.clearCache();
    },
    _paint:function(ctxt) {

        var x1 = this.opts.x1 + this._offset.x,
            y1 = this.opts.y1 + this._offset.y,
            w = (this.opts.x2 + this._offset.x) - (this.opts.x1 + this._offset.x),
            h = (this.opts.y2 + this._offset.y) - (this.opts.y1 + this._offset.y);

        if (this.opts.fillStyle) {
            ctxt.fillRect(x1,y1,w,h);
        }
        if (this.opts.strokeStyle) {
            ctxt.strokeRect(x1,y1,w,h);
        }
    }
});

$wb.draw.Grid = $wb.Class('Grid',{
    __extends:[$wb.draw.Element],
    __defaults:{
        dashed:true,
        lineCap:'round',
        dashArray:[0,5],
        lineWidth:1,
        width:50,
        height:50,
        offset:{
            left:0,
            top:0
        }
    },
    __construct:function(opts) {
        this.__super(opts);
    },
    setPoints:function(x1,y1,x2,y2) {
        this.opts.x1 = x1;
        this.opts.y1 = y1;
        this.opts.x2 = x2;
        this.opts.y2 = y2;
        
        this.clearCache();
    },
    _paint:function(ctxt,canvas) {
        var offset = {
            x:this.opts.offset.left,
            y:this.opts.offset.top
        };
        
        var size = {
            width:parseInt(canvas.attr('width'), 10)-offset.x,
            height:parseInt(canvas.attr('height'), 10)-offset.y
        };
        
        if (!size.width) return;
        
        var cellWidth = Math.ceil(size.width/this.opts.width);
        var cellHeight = Math.ceil(size.height/this.opts.height);
        
        
        ctxt.beginPath();
        for(var x = 0; x < cellWidth;x++) {
            var offsetX = offset.x+x*this.opts.width;
            
            ctxt.moveTo(offsetX + this._offset.x,offset.y + this._offset.y);
            ctxt.lineTo(offsetX + this._offset.x,size.height + this._offset.y);
            
            for(var y = 0; y < cellHeight;y++) {
                var offsetY = offset.y+y*this.opts.height;
                
                ctxt.moveTo(offset.x + this._offset.x,offsetY + this._offset.y);
                ctxt.lineTo(size.width + this._offset.x,offsetY + this._offset.y);
            }
        }
        ctxt.stroke();
    }
});

$wb.draw.Circle = $wb.Class('Circle',{
    __extends:[$wb.draw.Element],
    __defaults:{
        x:0,y:0,
        radius:50,
        start:0,
        end:0,
        clockwise:true
    },
    __construct:function(opts) {
        this.__super(opts);
    },
    setCenter:function(x,y) {
        this.opts.x = x;
        this.opts.y = y;
        this.clearCache();
        return this;
    },
    setRadius:function(radius) {
        this.opts.radius = radius;
        this.clearCache();
        return this;
    },
    setSegment:function(startAngle,endAngle) {
        this.opts.start = startAngle*Math.PI;
        this.opts.end= endAngle*Math.PI;
        this.clearCache();
        return this;
    },
    setClockwise:function(clockwise) {
        this.opts.clockwise = clockwise ? true : false;
        this.clearCache();
        return this;
    },
    _paint:function(ctxt) {
        ctxt.beginPath();
        ctxt.arc(
            this.opts.x + this._offset.x,
            this.opts.y + this._offset.y,
            this.opts.radius,
            this.opts.start,
            this.opts.end,
            this.opts.clockwise
        );

        if (this.opts.fillStyle) {
            ctxt.fill();
        }
        if (this.opts.strokeStyle) {
            ctxt.stroke();
        }

    }
});


$wb.draw.Image = $wb.Class('Image',{
    __extends:[$wb.draw.Element],
    __defaults:{
        data:'',
        x:0,
        y:0
    },
    __construct:function(opts) {
        this.__super(opts);
    },
    setData:function(data) {
        this.opts.data = 'data:image/jpeg;base64,'+data;
        return this;
    },
    setOffset:function(x,y) {
        this.opts.x = x;
        this.opts.y = y;
    },
    _paint:function(ctxt) {
        var imgObj = new Image();
        var me = this;
        imgObj.onload = function() {
            ctxt.drawImage(imgObj,
                me.opts.x + this._offset.x,
                me.opts.y + this._offset.y
            );
        };
        
        imgObj.src = this.opts.data;
    }
});



$wb.draw.Text = $wb.Class('Text',{
    __extends:[$wb.draw.Element],
    __defaults:{
        font:'10px Verdana',
        textAlign:'left',
        textBaseline:'top',
        text:'',
        x:0,
        y:0
    },
    __construct:function(opts) {
        this.__super(opts);
    },
    setText:function(text) {
        this.opts.text = text
        return this;
    },
    _paint:function(ctxt) {
        ctxt.font = this.opts.font;
        ctxt.textAlign  = this.opts.textAlign ;
        ctxt.textBaseline  = this.opts.textBaseline ;

        var x = this._offset.x + this.opts.x,
            y = this._offset.y + this.opts.y;


        ctxt.fillText(this.opts.text,
            x,
            y
        );
    }
});


//Extensions to the default API
var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
if (CP && CP.lineTo){
    CP.dashedLineTo = function(x,y,x2,y2,dashArray) {
        if (!dashArray) {
            dashArray = [5];
        }

        if (dashLength === 0) {
            dashLength = 0.001; // Hack for Safari
        }

        var dashCount = dashArray.length;
        this.moveTo(x, y);
        var dx = (x2-x), dy = (y2-y);
        var slope = dy/dx;
        var distRemaining = Math.sqrt( dx*dx + dy*dy );

        var dashIndex=0, draw=true;
        while (distRemaining>=0.1){
            var dashLength = dashArray[dashIndex++%dashCount];
            if (dashLength > distRemaining) {
                dashLength = distRemaining;
            }
            var xStep = Math.sqrt( dashLength*dashLength / (1 + slope*slope) );
            x += xStep;
            y += slope*xStep;
            this[draw ? 'lineTo' : 'moveTo'](x,y);
            distRemaining -= dashLength;
            draw = !draw;
        }
    };
}
