/**
 * @fileOverview
 * This file contains all utilities provided and used by webbeans
 * @author <a href="http://twitter.com/vonhofdk"/>Henrik Hofmeister</a>
 * @version 1.0
 */


/**
 * @namespace Utility functions
 */
$wb.utils = {
    _typeResolvers:[
        function(v) {
            if ($wb.utils.isA(v,$wb.data.Model))
                return "Model/"+v.getType();
            return null;
        },
        function(v) {
            if ($wb.utils.isClass(v))
                return $wb.utils.getClassName(v);
            return null;
        },
        function(v) {
            return $.type(v);
        }
    ],
    htmlentities:function(html) {
        if (!html) return "";
        html = html.replace(/</g,"&lt;");
        html = html.replace(/>/g,"&gt;");
        return html;
    },
    /**
     * Get value using path on object
     * @param {Object} obj the object
     * @param {String} path the path
     * @type Object
     * @example
     * 
     * var obj = {hello:{world:"test"}}
     * var val = $wb.utils.GetValue(obj,"hello.world");
     * console.log(val); //Emits "test"
     */
    GetValue:function(obj,path) {
        var parts = path.split('.');
        var cur = obj;
        for(var i in parts) {
            
            try {
                var p = parts[i];
                cur = cur[p];
                if (!cur)
                    break;
            } catch(e) {
                break;
            }
            
        }
        return cur;
    },
    /**
     * Sets value using path on object
     * @param {Object} obj the object
     * @param {String} path the path
     * @param {Object} value
     * @example
     * 
     * var obj = {hello:{world:"test"}}
     * var val = $wb.utils.SetValue(obj,"hello.world","hi");
     * console.log(obj.hello.world); //Emits "hi"
     */
    SetValue:function(obj,path,value) {
        var parts = path.split('.');
        var cur = obj;
        for(var i in parts) {
            var p = parts[i];
            if (i == (parts.length-1))
                break;
            cur = cur[p];
            if (!cur)
                break;
        }
        if (p && cur)
            cur[p] = value;
    },
    /**
     * Make an element full screen - optionally listening for window resize events
     * @param {DOMNode|String} elm the element (passed to jQuery)
     * @param {boolean} listenForResize if true - listen for resize events
     */
    makeFullScreen:function(elm,listenForResize) {
        var resize = function() {
            var w = $(window).width();
            var h = $(window).height();
            $(elm).width(w);
            $(elm).height(h);
            elm.trigger('resize');
        };
        if (listenForResize) {
            $(window).bind('resize',resize);
        }
        resize();
    },
    /**
     * Get full size including padding, borders and margin for element
     * @param {DOMNode|String} elm the element (passed to jQuery)
     * @type Object
     */
    fullSize:function(elm) {
        var out = {
            width:0,
            height:0
        };
        $(elm).each(function() {
            var el = $(this);
            out.width += el.width()
            +parseInt(el.css('padding-left'))
            +parseInt(el.css('padding-right'))
            +parseInt(el.css('margin-left'))
            +parseInt(el.css('margin-right'))
            +parseInt(el.css('border-left-width'))
            +parseInt(el.css('border-right-width'));
            out.height += el.height() 
            +parseInt(el.css('padding-top'))
            +parseInt(el.css('padding-bottom'))
            +parseInt(el.css('margin-top'))
            +parseInt(el.css('margin-bottom'))
            +parseInt(el.css('border-top-width'))
            +parseInt(el.css('border-bottom-width'));
        })
        return out;
    },
    
    /**
     * make element fill available space in parent
     * @param {DOMNode|String} elm the element (passed to jQuery)
     * @param {Boolean} listenForResize listen for resize events on parent
     * @type Object
     */
    fillContainer:function(elm,listenForResize) {
        var parent = $(elm).parent();
        
        var resize = function() {
            var w = parent.width();
            var h = parent.height();
            var others = parent.children().not(elm);
            var usedSize = $wb.utils.fullSize(others);
            elm.height(h-usedSize.height);
            elm.width(w);
        };
        if (listenForResize) {
            parent.bind('resize',resize);
        }
        resize();
    },
    
    /**
     * Reset padding,margin and border to 0 on element
     * @param {DOMNode|String} elm the element (passed to jQuery)
     */
    resetMPB:function(elm) {
        elm.css({
            'padding':0,
            'margin':0,
            'border':0
        });
    },
    /**
     * Get class name of instance (created with $wb.Class)
     * @param {Object} obj The instance
     * @type String
     */
    getClassName:function(obj) {
        if (this.isClass(obj))
            return obj._clz;
        return null;
    },
    /**
     * Get class of instance (created with $wb.Class)
     * @param {Object} obj The instance
     * @type String
     */
    getClass:function(obj) {
        if (this.isClass(obj))
            return obj.__proto__.constructor;
        return null;
    },
    /**
     * Determine if an object is a class (created with $wb.Class)
     * @param {Object} obj The instance
     * @type Boolean
     */
    isClass:function(obj) {
        if (obj && (obj instanceof $wb.Object))
            return true;
        return false;
    },
    /**
     * Determine if an object is an instance of class. 
     * @param {Object} obj The instance
     * @param {Class} clz The class
     * @type Boolean
     */
    isA:function(obj,clz) {
        if (!this.isClass(obj)) 
            return false;
        return obj instanceof clz;
    },
    /**
     * Type resolving of value
     * @param {Object} v value
     * @type String
     */
    type:function(v) {
        if (typeof v != 'undefined') {
            for(var i = 0; i < this._typeResolvers.length;i++) {
                var func = this._typeResolvers[i];
                var type = func(v);
                if (type !== null)
                    return type;
            }
        }
        return "undefined";
    }
};
//jQuery util methods
(function($) {
    
    
    $.fn.widget = function(widget) {
        var clz = '-wb-state-widget';
        var elm = $(this);
        if (widget) {
            elm .addClass(clz);
            return elm.data('__widget',widget);
        } else {
            if (elm.is('.'+clz))
                return elm.data('__widget');
            return elm.closest('.'+clz).data('__widget');
        }
    };
    
    $.fn.fullSize = function() {
        return $wb.utils.fullSize(this);
    };
    
    $.fn.makeFullScreen = function(listenForResize) {
        return $wb.utils.makeFullScreen(this, listenForResize);
    };
    
    $.fn.fillContainer = function(listenForResize) {
        return $wb.utils.fillContainer(this, listenForResize);
    };
    
    $.fn.paddingHeight= function() {
        var el = $(this);
        return parseInt(el.css('padding-top'))
        +parseInt(el.css('padding-bottom'));
    };
    
    $.fn.paddingWidth= function() {
        var el = $(this);
        return parseInt(el.css('padding-left'))
        +parseInt(el.css('padding-right'));
    };
    
    $.fn.outerEdgeWidth = function() {
        var el = $(this);
        
        var out = parseInt(el.css('padding-left'))
                +parseInt(el.css('padding-right'))
                +parseInt(el.css('margin-left'))
                +parseInt(el.css('margin-right'));
                
        //Input fields has inner border
        if (el[0] && el[0].tagName) {
            switch(el[0].tagName.toLowerCase()) {
                case 'input':
                case 'th': //Padding and border is part of width
                    return parseInt(el.css('margin-left'))
                            +parseInt(el.css('margin-right'));
                    break;
            }
        }
    
        return out;
    };
    
    $.fn.outerEdgeHeight = function() {
        var el = $(this);
        var out = parseInt(el.css('padding-bottom'))
                +parseInt(el.css('padding-top'))
                +parseInt(el.css('margin-top'))
                +parseInt(el.css('margin-bottom'));
                
        
        if (el[0] && el[0].tagName) {
            switch(el[0].tagName.toLowerCase()) {
                case 'input':
                case 'th': //Padding and border is part of width
                    return parseInt(el.css('margin-top'))
                            +parseInt(el.css('margin-width'));
                    break;
            }
        }
            
            
        return out;
    };
    $.fn.innerEdgeHeight = function() {
        var el = $(this);
        var out = parseInt(el.css('padding-top'))
                +parseInt(el.css('padding-bottom'));
        
        //Input fields has inner border
        if (el[0] && el[0].tagName) {
            switch(el[0].tagName.toLowerCase()) {
                case 'input':
                case 'th':
                    out += parseInt(el.css('border-top-width'))
                        +parseInt(el.css('border-bottom-width'));
                    break;
            }
        }
            
            
        return out;
    };
    
    $.fn.innerEdgeWidth = function() {
        var el = $(this);
        
        var out = parseInt(el.css('padding-left'))
                +parseInt(el.css('padding-right'));
        //Input fields has inner border
        if (el[0] && el[0].tagName) {
            switch(el[0].tagName.toLowerCase()) {
                case 'input':
                case 'th':
                    out += parseInt(el.css('border-left-width'))
                        +parseInt(el.css('border-right-width'))
                    break;
            }
        }    
    
        return out;
    };
    
    $.fn.totalOuterWidth = function() {
        var out = 0;
        $(this).each(function() {
            out += $(this).outerWidth();
        });
        return out;
    };
    
    $.fn.totalOuterHeight = function() {
        var out = 0;
        $(this).each(function() {
            out += $(this).outerHeight();
        });
        return out;
    };
    
    $.fn.outerWidth = function(width) {
        var el = $(this)
        if (typeof width == 'undefined') {
            return el.width()+el.outerEdgeWidth();
        } else {
            $(this).each(function() {
                $(this).width(Math.max(0,width-$(this).outerEdgeWidth()));
            })
        }
        return $(this);
    };
    
    $.fn.outerHeight= function(height) {
        var el = $(this)
        if (typeof height == 'undefined')
            return el.height()+el.outerEdgeHeight();
        else {
            $(this).each(function() {
                $(this).height(Math.max(0,height-$(this).outerEdgeHeight())); 
            });
        }
        return $(this);
    };
    
    $.fn.innerWidth = function(width) {
        var el = $(this)
        if (typeof width == 'undefined')
            return el.width()-el.innerEdgeWidth();
        else {
            $(this).each(function() {
                $(this).width(width+el.innerEdgeWidth());
            })
        }
        return $(this);
    };
    
    $.fn.innerHeight= function(height) {
        var el = $(this)
        if (typeof height == 'undefined')
            return el.height()-el.innerEdgeHeight();
        else {
            $(this).each(function() {
                $(this).height(height+el.innerEdgeHeight()); 
            });
        }
        return $(this);
    };
    
    $.fn.outerMinHeight= function(height) {
        var el = $(this)
        if (typeof height == 'undefined')
            return el.height()+el.edgeHeight();
        else {
            $(this).each(function() {
                $(this).css('min-height',height-$(this).edgeHeight()); 
            });
        }
        return $(this);
    };
    
    
    $.fn.keyboardNavigation = function() {
        var elm = $(this);
        
        if (elm.children('input.wb-keynav-input').length > 0) 
            return;
        
        var input = $('<input type="text" class="wb-keynav-input" style="position:absolute;left:-9999px" />')
        elm.append(input);
        
        elm.bind('mousedown',function(evt) {
            evt.preventDefault();
            $(this).mouseup();
            $(this).click();
        })
        elm.bind('click mousedown',function(evt) {
            evt.stopPropagation();
            input.focus();
        });
        input.focus(function() {
            elm.addClass('wb-focus');
        });
        input.blur(function(evt) {
            elm.removeClass('wb-focus');
        });
        
    };
    
    $.fn.disableMarking = function() {
        $(this).css({
            '-webkit-touch-callout': 'none',
            '-webkit-user-select': 'none',
            '-khtml-user-select': 'none',
            '-moz-user-select': 'none',
            '-ms-user-select': 'none',
            '-o-user-select': 'none',
            'user-select': 'none'
        });
        //$(this).attr('unselectable','true');
    };
    
    $.fn.enableMarking = function() {
        var val = 'auto';
        $(this).css({
            '-webkit-touch-callout': val,
            '-webkit-user-select': val,
            '-khtml-user-select':val,
            '-moz-user-select': val,
            '-ms-user-select': val,
            '-o-user-select':val,
            'user-select':val
        });
    };
    $.fn.rotate = function(degrees) {
        var val = 'rotate('+degrees+'deg)'
        $(this).css({
            '-webkit-transform': val,
            '-moz-transform': val,
            '-ms-transform': val,
            '-o-transform': val,
            'transform': val,
            'zoom': 1
        });
    };
    $.fn.offscreen = function() {
        $(this).addClass('wb-offscreen');
    }
    $.fn.onscreen = function() {
        $(this).removeClass('wb-offscreen');
    }
    
    $.fn.clear = function() {
        $(this).children().detach();
    };
    
    $.fn.bindOnce = function(evt,handler) {
        $(this).unbind(evt,handler).bind(evt,handler);
    };
    
    $.fn.contains = function(elms) {
        return $(this).has(elms).length > 0;
    };
    
    $.fn.boundingBox = function(relative) {
        var elm = $(this[0]);
        var out = {};
        if (relative)
            out = elm.position();
        else
            out = elm.offset();
        out.right = out.left+elm.outerWidth();
        out.bottom = out.top+elm.outerHeight();
        return out;
    };
    
    //Temporarily detach element to reduce dom changes when doing alot of manipulating. Reintroduce it into the dom 
    //using "putBack"
    $.fn.putAway = function() {
        var elm = $(this[0]);
        if (elm.closest('body').length == 0) return;//Already removed from dom
        elm.data('parent',elm.parent())
            .data('prev',elm.prev());
        elm.detach();
    };
    
    $.fn.putBack = function() {
        var elm = $(this[0]);
        if (elm.closest('body').length > 0) return;//Already in dom
        
        var parent = elm.data('parent');
        var prev = elm.data('prev');
        if (!parent) return; //Not detached using putAway
        if (!prev || prev.length == 0) {
            parent.prepend(elm);
        } else {
            prev.after(elm);    
        }
        
        elm.data('parent',null);
        elm.data('prev',null);
    };
    
    $.fn.hitTest = function(x,y) {
        var out = [];
        $(this).each(function() {
            var bbox = $(this).boundingBox();
            if (bbox.left <= x 
                    && bbox.right >= x
                    && bbox.top <= y 
                    && bbox.bottom >= y) {

                if (out.indexOf(this) == -1) 
                    out.push(this);   
            }
        });
        return $(out);
    };
    
    $.fn.elementAt = function(x,y) {
        var out = [];
        $(this).each(function() {
            $(this).children().each(function() {
                var elm = $(this);
                var bbox = elm.boundingBox();
                if (bbox.left <= x 
                        && bbox.right >= x
                        && bbox.top <= y 
                        && bbox.bottom >= y) {

                    if (out.indexOf(this) == -1) 
                        out.push(this);   
                }

                elm.elementAt(x,y).each(function() {
                        if (out.indexOf(this) == -1) 
                            out.push(this);
                });
            });
        });
        return $(out);
    };
    
})(jQuery);