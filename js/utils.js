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
            if ($wb.utils.isClass(v))
                return v.clz;
            return null;
        },
        function(v) {
            if ($wb.utils.isA(v,'Model'))
                return "Model/"+v.getType();
            return null;
        },
        function(v) {
            return $.type(v);
        }
    ],
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
            var p = parts[i];
            cur = cur[p];
            if (!cur)
                break;
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
    getClass:function(obj) {
        if (this.isClass(obj))
            return obj._clz;
        return null;
    },
    /**
     * Determine if an object is a class (created with $wb.Class)
     * @param {Object} obj The instance
     * @type Boolean
     */
    isClass:function(obj) {
        return obj && (typeof obj._clz != 'undefined');
    },
    /**
     * Determine if an object is an instance of class. Does not yet check for inheritance.
     * @param {Object} obj The instance
     * @param {Class} clz The class
     * @type Boolean
     */
    isA:function(obj,clz) {
        if (!this.isClass(obj)) 
            return false;
        return obj._clz == clz;
    },
    /**
     * Type resolving of value
     * @param {Object} v value
     * @type String
     */
    type:function(v) {
        if (v) {
            for(var i = 0; i < this._typeResolvers.length;i++) {
                var func = this._typeResolvers[i];
                var type = func(v);
                if (type != null)
                    return type;
            }
        }
        return "undefined";
    }
};
//jQuery util methods
$(function() {
    
    
    jQuery.fn.widget = function(widget) {
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
    
    jQuery.fn.fullSize = function() {
        return $wb.utils.fullSize(this);
    };
    
    jQuery.fn.makeFullScreen = function(listenForResize) {
        return $wb.utils.makeFullScreen(this, listenForResize);
    };
    
    jQuery.fn.fillContainer = function(listenForResize) {
        return $wb.utils.fillContainer(this, listenForResize);
    };
    
    jQuery.fn.paddingHeight= function() {
        var el = $(this);
        return parseInt(el.css('padding-top'))
        +parseInt(el.css('padding-bottom'));
    };
    
    jQuery.fn.paddingWidth= function() {
        var el = $(this);
        return parseInt(el.css('padding-left'))
        +parseInt(el.css('padding-right'));
    };
    
    jQuery.fn.outerEdgeWidth = function() {
        var el = $(this);
        
        var out = parseInt(el.css('padding-left'))
                +parseInt(el.css('padding-right'))
                +parseInt(el.css('margin-left'))
                +parseInt(el.css('margin-right'));
        //Input fields has inner border
        if (el[0].tagName.toLowerCase() != 'input')
            out += parseInt(el.css('border-left-width'))
                    +parseInt(el.css('border-right-width'))
    
        return out;
    };
    
    jQuery.fn.outerEdgeHeight = function() {
        var el = $(this);
        var out = parseInt(el.css('padding-bottom'))
                +parseInt(el.css('padding-top'))
                +parseInt(el.css('margin-top'))
                +parseInt(el.css('margin-bottom'));
        //Input fields has inner border
        if (el[0].tagName.toLowerCase() != 'input')
            out += parseInt(el.css('border-top-width'))
                    +parseInt(el.css('border-bottom-width'));
            
            
        return out;
    };
    jQuery.fn.innerEdgeHeight = function() {
        var el = $(this);
        var out = parseInt(el.css('padding-top'))
                +parseInt(el.css('padding-bottom'));
        
        //Input fields has inner border
        if (el[0].tagName.toLowerCase() == 'input')
            out += parseInt(el.css('border-top-width'))
                    +parseInt(el.css('border-bottom-width'));
            
            
        return out;
    };
    
    jQuery.fn.innerEdgeWidth = function() {
        var el = $(this);
        
        var out = parseInt(el.css('padding-left'))
                +parseInt(el.css('padding-right'));
        //Input fields has inner border
        if (el[0].tagName.toLowerCase() == 'input')
            out += parseInt(el.css('border-left-width'))
                    +parseInt(el.css('border-right-width'))
    
        return out;
    };
    
    jQuery.fn.outerWidth = function(width) {
        var el = $(this)
        if (typeof width == 'undefined')
            return el.width()+el.outerEdgeWidth();
        else {
            $(this).each(function() {
                $(this).width(Math.max(0,width-$(this).outerEdgeWidth()));
            })
        }
        return $(this);
    };
    
    jQuery.fn.outerHeight= function(height) {
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
    
    jQuery.fn.innerWidth = function(width) {
        var el = $(this)
        if (typeof width == 'undefined')
            return el.width();
        else {
            $(this).each(function() {
                $(this).width(width);
            })
        }
        return $(this);
    };
    
    jQuery.fn.innerHeight= function(height) {
        var el = $(this)
        if (typeof height == 'undefined')
            return el.height();
        else {
            $(this).each(function() {
                $(this).height(height); 
            });
        }
        return $(this);
    };
    
    jQuery.fn.outerMinHeight= function(height) {
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
    
    jQuery.fn.disableMarking = function() {
        $(this).css({
            '-webkit-touch-callout': 'none',
            '-webkit-user-select': 'none',
            '-khtml-user-select': 'none',
            '-moz-user-select': 'none',
            '-ms-user-select': 'none',
            '-o-user-select': 'none',
            'user-select': 'none'
        });
        $(this).attr('unselectable','true');
    };
    
    jQuery.fn.keyboardNavigation = function() {
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
    
    jQuery.fn.enableMarking = function(textOnly) {
        var val = textOnly ? 'text' : 'auto';
        $(this).css({
            '-webkit-touch-callout': val,
            '-webkit-user-select': val,
            '-khtml-user-select':val,
            '-moz-user-select': val,
            '-ms-user-select': val,
            '-o-user-select':val,
            'user-select':val
        });
        $(this).removeAttr('unselectable');
    };
    jQuery.fn.rotate = function(degrees) {
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
    jQuery.fn.offscreen = function() {
        $(this).addClass('wb-offscreen');
    }
    jQuery.fn.onscreen = function() {
        $(this).removeClass('wb-offscreen');
    }
    
    jQuery.fn.clear = function() {
        $(this).html('');
    };
    
    jQuery.fn.bindOnce = function(evt,handler) {
        $(this).unbind(evt,handler).bind(evt,handler);
    };
    
    jQuery.fn.contains = function(elms) {
        return $(this).has(elms).length > 0;
    };
})