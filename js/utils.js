$wb.utils = {
    makeFullScreen:function(elm,listenForResize) {
        var resize = function() {
            var w = $(window).width();
            var h = $(window).height();
            $(elm).width(w);
            $(elm).height(h);
            elm.trigger('resize');
        }
        if (listenForResize) {
            $(window).bind('resize',resize);
        }
        resize();
    },
    fullSize:function(elm) {
        var out = {
            width:0,
            height:0
        }
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
        }
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
    }
};
//jQuery util methods
$(function() {
    
    
    jQuery.fn.widget = function(widget) {
        return $(this).data('__widget',widget);
    }
    
    jQuery.fn.fullSize = function() {
        return $wb.utils.fullSize(this);
    }
    
    jQuery.fn.makeFullScreen = function(listenForResize) {
        return $wb.utils.makeFullScreen(this, listenForResize);
    }
    
    jQuery.fn.fillContainer = function(listenForResize) {
        return $wb.utils.fillContainer(this, listenForResize);
    }
    
    jQuery.fn.paddingHeight= function() {
        var el = $(this)
        return parseInt(el.css('padding-top'))
                    +parseInt(el.css('padding-bottom'));
    }
    
    jQuery.fn.paddingWidth= function() {
        var el = $(this)
        return parseInt(el.css('padding-left'))
                    +parseInt(el.css('padding-right'));
    }
    jQuery.fn.edgeWidth = function() {
        var el = $(this);
        return parseInt(el.css('padding-left'))
                        +parseInt(el.css('padding-right'))
                        +parseInt(el.css('margin-left'))
                        +parseInt(el.css('margin-right'))
                        +parseInt(el.css('border-left-width'))
                        +parseInt(el.css('border-right-width'))
    }
    jQuery.fn.edgeHeight = function() {
        var el = $(this);
        return parseInt(el.css('padding-top'))
                        +parseInt(el.css('padding-bottom'))
                        +parseInt(el.css('margin-top'))
                        +parseInt(el.css('margin-bottom'))
                        +parseInt(el.css('border-top-width'))
                        +parseInt(el.css('border-bottom-width'))
    }
    
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
            
    }
    
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
    }
})