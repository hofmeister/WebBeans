//@module core.geo @prio 99

$wb.geo = {};

$wb.geo.distanceToLine = function(lineStart,lineEnd,point) {
    var p2 = {x:lineEnd.x - lineStart.x,y:lineEnd.y - lineStart.y};
    var something = p2.x*p2.x + p2.y*p2.y;
    var u = ((point.x - lineStart.x) * p2.x + (point.y - lineStart.y) * p2.y) / something;

    if (u > 1)
        u = 1;
    else if (u < 0)
        u = 0;

    var x = lineStart.x + u * p2.x;
    var y = lineStart.y + u * p2.y;

    var dx = x - point.x;
    var dy = y - point.y;

    return Math.sqrt(dx*dx + dy*dy);
};

$wb.geo.rect = {
    isInside:function(p,rect) {
        return (p.x >= rect.left
                && p.y >= rect.top
                && p.x <= rect.right
                && p.y <= rect.bottom);
    },
    nearestEdgePoint:function(p,rect) {
        //Note - works only on a simple rectangel that is not rotated
        var nw = {x:rect.left,y:rect.top};
        var ne = {x:rect.right,y:rect.top};
        var sw = {x:rect.left,y:rect.bottom};
        var se = {x:rect.right,y:rect.bottom};
        
        var delta = {
            top:$wb.geo.distanceToLine(nw,ne,p),
            left:$wb.geo.distanceToLine(nw,sw,p),
            right:$wb.geo.distanceToLine(ne,se,p),
            bottom:$wb.geo.distanceToLine(sw,se,p)
        }; 
        var smallest = -1;
        var smallestSide = null;
        for(var side in delta) {
            if (smallest == -1 || smallest > delta[side]) {
                smallest = delta[side];
                smallestSide = side;
            }
        }
        switch(smallestSide) {
            case 'top':
            case 'bottom':
                return {x:p.x,y:rect[smallestSide]};
            case 'left':
            case 'right':
                return {x:rect[smallestSide],y:p.y};
        }
        return null;
    }
};

