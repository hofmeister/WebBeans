$wb.utils = {
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
    resetMPB:function(elm) {
        elm.css({
            'padding':0,
            'margin':0,
            'border':0
        });
    },
    isClass:function(obj) {
        return typeof obj.clz != 'undefined';
    },
    isA:function(obj,clz) {
        if (!this.isClass(obj)) 
            return false;
        return obj.clz == clz;
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
    
    jQuery.fn.edgeWidth = function() {
        var el = $(this);
        return parseInt(el.css('padding-left'))
        +parseInt(el.css('padding-right'))
        +parseInt(el.css('margin-left'))
        +parseInt(el.css('margin-right'))
        +parseInt(el.css('border-left-width'))
        +parseInt(el.css('border-right-width'))
    };
    
    jQuery.fn.edgeHeight = function() {
        var el = $(this);
        return parseInt(el.css('padding-top'))
        +parseInt(el.css('padding-bottom'))
        +parseInt(el.css('margin-top'))
        +parseInt(el.css('margin-bottom'))
        +parseInt(el.css('border-top-width'))
        +parseInt(el.css('border-bottom-width'))
    };
    
    jQuery.fn.outerWidth = function(width) {
        var el = $(this)
        if (typeof width == 'undefined')
            return el.width()+el.edgeWidth();
        else {
            $(this).each(function() {
                $(this).width(width-$(this).edgeWidth());
            })
        }
        return $(this);
    };
    
    jQuery.fn.outerHeight= function(height) {
        var el = $(this)
        if (typeof height == 'undefined')
            return el.height()+el.edgeHeight();
        else {
            $(this).each(function() {
                $(this).height(height-$(this).edgeHeight()); 
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
})