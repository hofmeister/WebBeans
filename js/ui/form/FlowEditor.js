$wb.ui.form.FlowEditor = $wb.Class('FlowEditor',{
    __extends:[$wb.ui.Pane],
    _connections:[],
    _layers:[],
    _interval:null,
    __defaults:{
        flowElementFinder:'.wb-flow-element',
        connectorFinder:'.wb-flow-connector',
        tmpl:function() {
            return '<div class="wb-pane wb-flow-editor"></div>';
        },
        layout:function(){
            this.target().outerWidth(this.elm().innerWidth());
            this.target().outerHeight(this.elm().innerHeight());
            this._canvas.elm().outerHeight(this.target().innerHeight());
            this._canvas.elm().outerWidth(this.target().innerWidth());
        },
        boxMargin:10,
        grid:[30,30]
    },
    _canvas:null,
    _obstacles:[],
    _dragging:false,
    _drawing:false,
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        
        this._canvas = new $wb.draw.Canvas();
        this._canvas.addLayer('tmp',2);
        this._canvas.addLayer('connections',1);
        
        this.add(this._canvas);
        
        this._bindDragging();
        
        this._bindConnectionDrawing();
        
        this._bindConnectionHover();
        
        this._setupContextMenu();
        
        this._startAnimating();
        
        this.bind('after-layout',function() {
            this._paintConnections(true);
        });
        
        this.bind('detach',function() {
            this._stopAnimating();
        });
        
        var gridLayer = this._canvas.addLayer('grid',0);
        gridLayer.add(new $wb.draw.Grid({
            width:this.opts.grid[0],
            height:this.opts.grid[1],
            strokeStyle:"#EEEEEE",
            offset:{
                left:this.opts.boxMargin-this.opts.grid[0],
                top:this.opts.boxMargin-this.opts.grid[1]
            }
        }));
    },
    
    _setupContextMenu:function() {
        var context = new $wb.ui.ContextMenu();
        var self = this;
        this.setContextMenu(context);
        
        context.bind('before-paint',function() {
            context.clear();
            var src = $wb(context.source().elm().closest('.wb-obstacle'));
            var offset = context.elm().offset();
            var conn = null;
            
            if (!(src instanceof $wb.ui.form.FlowEditorElement)) {
                conn = this.getConnectionAt({x:offset.left,y:offset.top});
                if (!conn)
                    return false;
            }
            context.add([
                {title:"Remove",arg:function() {
                    if (!(src instanceof $wb.ui.form.FlowEditorElement)) {
                        //Remove connection
                        conn.path.destroy();
                    } else {
                        src.destroy();
                    }
                    self._paintConnections();
                }}
            ]);
            return this.trigger('before-context',[context,conn | src]);
        }.bind(this));
        this._context = context;
    },
    _removeConnection:function(conn) {
        var ix = this._connections.indexOf(conn);
        if (ix > -1) {
            this._connections.splice(ix,1);
        }
    },
    /**
     * Get context menu element
     * @private
     */
    getContextMenu:function() {
        return this._context;
    },
    /**
     * Stop repainting
     * @private
     */
    _stopAnimating:function() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
    },
    /**
     * Repainting connections in an interval while the drag event of draggable is inaccurate
     * @private
     */
    _startAnimating:function() {
        this._stopAnimating()
        var self = this;
        this._interval = setInterval(function() {
            if (!self._dragging) {
                return;
            }
            var elm = self._dragging;
            var current = elm.offset();
            var old = elm.data('oldOffset');
            
            if (!old || old.left != current.left || old.top != current.top) {
                
                self._refreshObstacles();
                $wb(elm).changed = true;
                self._paintConnections();
            }
            elm.data('oldOffset',current);
        },10);
    },
    /**
     * Clear active and hovering state from all connections
     * @private
     */
    _clearActive:function() {
       $(this._connections).each(function() {
            this.active = false;
            this.hover = false;
        }); 
    },
    /**
     * Clear hovering state from all connections
     * @private
     */
    _clearHover:function() {
        
        var out = false;
        $(this._connections).each(function() {
            if (this.hover)
                out = true;
            this.hover = false;
        });
        return out;
    },
    /**
     * Bind events related to dragging elements around
     * @private
     */
    _bindDragging:function() {
        var self = this;
        this.target().bind('dragstart',function(evt) { 
            var elm = $(evt.target);
            var draggable = elm.data('draggable');
            draggable.oldPosition = elm.position();
            elm.css('z-index',10);
            self._dragging = elm;
        });
        
        this.target().bind('dragstop',function(evt) {
            var elm = $(evt.target);
            var draggable = elm.data('draggable');
            
            var tolerance = self.opts.boxMargin;
            
            var collisions = $(this).find(self.opts.flowElementFinder).not(elm).collidesWith(elm,tolerance);
            if (collisions.length > 0) {
                elm.animate(draggable.oldPosition,{
                    //=duration:'normal',
                    step:function() {
                        $wb(elm).changed = true;
                        self._paintConnections();
                        
                    },
                    complete:function() {
                        self._paintConnections(true);
                        self._dragging = null;
                    }
                });
            } else {
                $wb(elm).changed = true;
                self._paintConnections(true);
                self._dragging = null;
            }
            elm.css('z-index',4); 
        });
    },
    /**
     * Bind events related to drawing connections between connectors
     * @private
     */
    _bindConnectionDrawing:function() {
        
        var self = this;
        this.target().bind('connectorstart',function(evt,element,startPoint) {
            var start = startPoint.offset();
            var base = this.target().offset();
            start.left -= base.left-(startPoint.outerWidth()/2);
            start.top -= base.top-(startPoint.outerHeight()/2);
            self._drawing = true;
            //self.target().css('cursor','none');
            
            //Handler that continuesly paints the drawn connection
            var handler = function(evt) {
                var endPoint = self.target().find(self.opts.connectorFinder).not(startPoint).elementAt(evt.pageX,evt.pageY);
                self._canvas.getLayer('tmp').clear();
                
                var conn = {
                    start:startPoint,
                    end:endPoint.length > 0 ? $(endPoint[0]) : null,
                    changed:true
                };
                
                self._makeConnection(conn,{x:evt.pageX,y:evt.pageY});
                
                var layer = self._canvas.getLayer('tmp');
                conn.path.opts.strokeStyle = endPoint.length > 0 ? '#00AA00' : '#AA0000';
                conn.path.opts.lineWidth = 3;
                //No obstacles for temp path
                conn.path.setObstacles([]);
                conn.path.render(layer);
            }
            
            this.target()
                .mousemove(handler)
                .one('mouseup',function(evt) {
                    var layer = this._canvas.getLayer('connections');
                    var endPoint = this.target().find(this.opts.connectorFinder).not(startPoint).elementAt(evt.pageX,evt.pageY);
                    if (endPoint.length > 0) {
                        self._clearActive();
                        endPoint = $(endPoint[0]);
                        var conn = this.addConnection(startPoint,endPoint);
                        conn.active = true;
                        conn.hover = true;
                        
                        this._paintConnections();
                    }
                    self._drawing = false;
                    //self.target().css('cursor','default');
                    this._canvas.getLayer('tmp').clear();
                    this.target().unbind('mousemove',handler);
                }.bind(this));
            
        }.bind(this));
        
        //Calculate obstacles for paths
        this.bind('after-layout',this._refreshObstacles.bind(this));
    },
    addConnection:function(from,to) {
        var layer = this._canvas.getLayer('connections');
        var conn = this._makeConnection({
            start:from,
            end:to,
            active:false,
            hover:false,
            changed:true
        });
        //Add connection to elements
        var startId = from.attr('rel');
        $wb(from).addConnection(startId,conn);

        var endId = to.attr('rel');
        $wb(to).addConnection(endId,conn);

        this._connections.push(conn);
        layer.add(conn.path);
        conn.path.bind('destroy',function() {
            this._removeConnection(conn);
        }.bind(this));
        return conn;
    },
    /**
     * Refresh the obstacles within the edtior pane. Called whenever they are manipulated
     * @private
     */
    _refreshObstacles:function() {
        var self = this;
        this._obstacles.splice(0,this._obstacles.length);
        var base = this.target().offset();
        if (!base) return;

        this.target().find(self.opts.flowElementFinder).each(function() {
            self._obstacles.push(self._getBoundingBox(this,base));
        });
    },
    /**
     * Bind connection hover and click handling. Requires som special handling as they are simply lines on a canvas
     * @private
     */
    _bindConnectionHover:function() {
        var self = this;
        //Handle mouse over and click events on connections
        var getTranslatedPoint = function(evt) {
            if (self._drawing 
                    || self._dragging
                    || self._connections.length == 0) 
                return null;
            //Find the closest connector
            var base = self.target().offset();
            var point = {
                x:evt.pageX-base.left,
                y:evt.pageY-base.top
            }
            
            if (self.target().find(self.opts.flowElementFinder).elementAt(evt.pageX,evt.pageY).length > 0) {
                return null;
            }
            return point;
        }
        
        //Connection clicking
        this.target().bind('mousedown',function(evt){
            if (evt.button != 0) 
                return;
            var point = getTranslatedPoint(evt);
            if (!point) return;
            
            //Find the closest connector
            self._clearActive();
            
            var connector = self._getConnectionAt(point,self.opts.boxMargin);
            if (connector && !connector.active) {
                connector.active = true
                self._paintConnections();
            } else if (!connector)
                self._paintConnections();
        });
        
        //Connection hovering
        this.target().bind('mousemove',function(evt){
            var point = getTranslatedPoint(evt);
            if (!point) return;
            
            var conn = self._getConnectionAt(point,self.opts.boxMargin);
            if (conn) {
                if (!conn.hover) {
                    self._clearHover();
                    conn.hover = true
                    self.target().css('cursor','pointer');
                    self._paintConnections();
                }
                
            } else if (self._clearHover()) {
                self.target().css('cursor','default');
            }
        });
    },
    /**
     * Add element to editor. Should be suitable for wrapping in a FlowEditorElement instance
     */
    add:function(widget,offset) {
        if (widget instanceof $wb.draw.Canvas)
            return this.__super(widget);
        if (offset) {
            var base = this.target().offset();
            offset.left -= base.left;
            offset.top -= base.top;
        }
        var child;
        if (widget instanceof $wb.ui.form.FlowEditorElement) {
            child = widget;
        } else {
            child = new $wb.ui.form.FlowEditorElement();
            child.add(widget);
        }
        child.setFlow(this);
        
        if (offset)
            child.setOffset(offset);
        
        this.__super(child);
        return child;
    },
    /**
     * Get connection line at point
     * @private
     */
    _getConnectionAt:function(point,min) {
        var closest = min;
        var ix = 0;
        var closestIx = -1;
        $(this._connections).each(function() {
            var points = this.path.getPoints();
            for(var i = 1; i < points.length;i++) {
                var last = points[i-1];
                var here =  points[i];
                var dist = $wb.geo.distanceToLine(last,here,point);
                if (dist < closest) {
                    closestIx = ix;
                    closest = dist;
                }
            }

            ix++;
        });
        if (closestIx > -1) {
            return this._connections[closestIx];
        }
        return null;

    },
    getConnectionAt:function(point) {
        var base = this.target().offset();
        point.x -= base.left;
        point.y -= base.top;
        return this._getConnectionAt(point,this.opts.boxMargin);
    },
    /**
     * Calculates corresponding point outside of the box margin
     * @private
     */
    _getEdgePoint:function(edge,p) {
        var margin = this.opts.boxMargin;
        switch(edge) {
            case 'top':
                return {x:p.left,y:p.top-margin};
            case 'bottom':
                return {x:p.left,y:p.top+margin};
            case 'left':
                return {x:p.left-margin,y:p.top};
            case 'right':
                return {x:p.left+margin,y:p.top};
        }
    },
    /**
     * Adjusts point to center of connector element
     * @private
     */
    _centerEdgePoint:function(edge,point,offsetX,offsetY) {
        switch(edge) {
            case 'top':
            case 'bottom':
                point.left += offsetX;
                break;
            case 'left':
            case 'right':
                point.top += offsetY;
                break;
        }

    },
    /**
     * Resets relevant attribute of point to the box' coordinates instead of the initial connector coords
     * @private
     */
    _putOnEdge:function(edge,point,boxWidget) {
        var base = this.target().offset();
        var bbox = boxWidget.elm().boundingBox();
        switch(edge) {
            case 'top':
                point.top = bbox.top-base.top;
                break;
            case 'bottom':
                point.top = bbox.bottom-base.top;
                break;
            case 'left':
                point.left = bbox.left-base.left;
                break;
            case 'right':
                point.left = bbox.right-base.left;
                break;
        }
    },
    /**
     * Make or update new canvas connection
     * @private
     */
    _makeConnection:function(conn,to) {
        var base = this.target().offset();
        //Do some calculations to make the line offset straight (90 degress) out from connectors before 
        //beginning path finding
        var elmCenterX = (conn.start.outerWidth()/2);
        var elmCenterY = (conn.start.outerHeight()/2);
        var start = conn.start.offset();
        start.left -= base.left;
        start.top -= base.top;

        var startElm = $wb(conn.start);
        if (!startElm)
            throw new $wb.Error(_('Could not find start element'));
        
        var startEdge = startElm.getEdge(conn.start.attr('rel'));
        conn.startEdge = startEdge ;
        
        //Make sure we start at the center of the connector
        this._centerEdgePoint(startEdge ,start,elmCenterX,elmCenterY);
        

        //Attach to box edge instead of connector icon edge
        this._putOnEdge(startEdge ,start,startElm);
        
        if (!conn.path) {
            conn.path = new $wb.draw.Path({
                lineEnding:new $wb.draw.Arrow()
            });
        }
        
        conn.path.clearPoints();
        conn.path.setObstacles(this._getObstacles());
        conn.path.addPoint({x:start.left,y:start.top});
        var startEdgePoint = this._getEdgePoint(startEdge,start);
        
        conn.path.addPoint(startEdgePoint);
        
        if (conn.end) {
            var end = conn.end.offset();
            end.left -= base.left;
            end.top -= base.top;
            var endElm = $wb(conn.end);
            if (!endElm)
                throw new $wb.Error(_('Could not find end element'));
        
            var endEdge = endElm.getEdge(conn.end.attr('rel'));
            conn.endEdge = endEdge ;

            this._centerEdgePoint(endEdge ,end,elmCenterX,elmCenterY);

            this._putOnEdge(endEdge ,end,endElm);

            var dest = this._getEdgePoint(endEdge,end);
            
            //Calculate path to
            conn.path.pathTo(dest);
            
            //And add the end point
            conn.path.addPoint({x:end.left,y:end.top});
        } else {
            conn.path.pathTo({x:to.x-base.left,y:to.y-base.top});
        }

        conn.changed = false;
        return conn;
    },
    /**
     * Get all obstacles currently available
     * @private
     */
    _getObstacles:function() {
        return this._obstacles;
    },
    /**
     * Get bounding box - including margin, relative to the base
     * @private
     */
    _getBoundingBox:function(elm,base) {
        var margin = this.opts.boxMargin;
        if (!base)
            base = this.target().offset();
        var box = $(elm).boundingBox();
        return {
            left:box.left-margin-base.left,
            top:box.top-margin-base.top,
            bottom:box.bottom+margin-base.top,
            right:box.right+margin-base.left
        };
    },
    /**
     * Paint all canvas connections. Only recalculates those that are marked as "changed".
     * @private
     */
    _paintConnections:function(forceRefresh) {
        var layer = this._canvas.getLayer('connections');
        if (this._connections.length == 0) {
            layer.render();
            return;
        }
        var self = this;
        
        $(this._connections).each(function() {
            var startElm = $wb(this.start);
            var endElm = $wb(this.end);
            
            //Only recalculate given certain conditions
            if (forceRefresh || this.changed || startElm.changed || endElm.changed) {
                self._makeConnection(this);
            } else {
                this.path.setObstacles(self._getObstacles());
            }
            
            this.path.opts.strokeStyle = this.active ? '#0000AA' : (this.hover ? '#5555FF' : '#333');
            this.path.opts.lineWidth = this.active ? 3 : 2;
            this.path.opts.zIndex = this.active ? 3 : (this.hover ? 2 : 1);
            this.path.setLineCap(new $wb.draw.Arrow());
            
            this.changed = false;
        });
        
        $(this.children()).each(function() {
            this.changed = false; 
        });
        
        layer.render();
    }
});

$wb.ui.form.FlowEditorElement = $wb.Class('FlowEditorElement',{
    __extends:[$wb.ui.Widget],
    __defaults:{
        tmpl:function () {
            return '<div class="wb-flow-element wb-obstacle" />';
        },
        connectorTmpl:function() {
            return '<div class="wb-flow-connector" />';
        },
        connectors:{
            left:{left:0,top:'50%'},
            top:{left:'50%',top:0},
            right:{left:'100%',top:'50%'},
            bottom:{left:'50%',top:'100%'}
        }
    },
    changed:true,
    _flow:null,
    _edge:{},
    _connections:{},
    _connectors:{},
    __construct:function() {
        this.__super(this.getDefaults());
        this.elm().css({
            position:'absolute',
            zIndex:4
        });
        
        this._paintConnectors();
        
        this.bind('after-layout',function() {
            var width = this.target().outerWidth();
            if (width < 1) return;
            var height = this.target().outerHeight();
            
            //Place connectors
            for(var id in this._connectors) {
                var elm = this._connectors[id];
                var c = $.extend({},this.opts.connectors[id]);
                var elmHeight = elm.outerHeight();
                var elmWidth = elm.outerWidth();
                
                c.left = this._positionToNumber(c.left,width,elmWidth);
                c.top = this._positionToNumber(c.top,height,elmHeight);
                this._edge[id] = 'top';
                
                if (c.top == height) {
                    this._edge[id] = 'bottom';
                } else if (c.left == 0) {
                    this._edge[id] = 'left';
                } else if (c.left == width) {
                    this._edge[id] = 'right';
                }
                
                c.left -= (elm.outerWidth()/2)+elm.outerEdgeSize('left');
                c.top -= (elm.outerWidth()/2)+elm.outerEdgeSize('top');
                elm.css(c);
            }
        });
        
        this.bind('detach',function() {
            for(var id in this._connections) {
                for(var i = 0; i < this._connections[id].length;i++) {
                    this._connections[id][i].path.destroy();
                }
            }
        });
    },
    _paintConnectors:function() {
        var connectors = [];
        if (this.opts.connectors) {
            for(var id in this.opts.connectors) {
                if (this._connectors[id]) {
                    continue;
                }
                    
                var conn = $(this.opts.connectorTmpl());
                conn.attr('rel',id);
                connectors.push(conn[0]);
                this.target().append(conn);
                this._connectors[id] = conn;
            }
        }
        $(connectors).mousedown(function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            this.elm().trigger('connectorstart',[this,$(evt.target)]);
        }.bind(this));
    },
    _positionToNumber:function(pos,sizeContainer,sizeElm) {
        if (typeof pos == 'number')
            return pos;
        if (typeof pos == 'string' && pos.indexOf('%')) {
            var percent = parseInt(pos)/100;
            var out = (sizeContainer*percent);
            return out;
        }
        return parseInt(pos);
    },
    setFlow:function(flow) {
        this._flow = flow;
        
        this.elm().draggable({
            containment:'parent',
            grid:this._flow.option('grid')
        });
    },
    addConnection:function(connectorId,conn) {
        if (!this._connections[connectorId])
            this._connections[connectorId] = [];
        this._connections[connectorId].push(conn);
        this.trigger('connection-added',[connectorId,conn]);
        conn.path.bind('destroy',function() {
            this.trigger('connection-removed',[connectorId,conn]);
        }.bind(this))
    },
    getConnector:function(id) {
        return this._connectors[id];
    },
    getEdge:function(id) {
        return this._edge[id];
    },
    setOffset:function(offset) {
        if (!this._flow) throw new $wb.Error(_('Cannot set offset on flow elements without a flow'));
        var margin = this._flow.opts.boxMargin
        var grid = this._flow.opts.grid;
        var left = (Math.floor((offset.left-margin) / 
                        grid[0])*grid[0])+margin;
        var top = (Math.floor((offset.top-margin) / 
                        grid[1])*grid[1])+margin;
        this.elm().css({
            left:left,
            top:top
        });
    }
});
