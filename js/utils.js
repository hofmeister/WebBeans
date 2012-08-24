/**
 * @fileOverview
 * This file contains all utilities provided and used by webbeans
 * @author <a href="http://twitter.com/vonhofdk"/>Henrik Hofmeister</a>
 * @version 1.0
 */

(function() {
    
    var parseCssSize = function(size) {
        if (!size) return 0;
        var out = parseInt(size, 10);
        if (isNaN(out))
            return 0;
        return out;
    };

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
            html = ""+html;
            html = html.replace(/</g,"&lt;");
            html = html.replace(/>/g,"&gt;");
            return html;
        },
        /**
         * Generate a random UUID. 
         * Copy / pasted from http://www.broofa.com/Tools/Math.uuid.js
         */
        uuid:function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
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
        * Generate a range of numbers from start to end - optionally formatted by provided format string
        * @param {number} start number
        * @param {number} end number
        * @param {format} optional format
        * @example
        * 
        * var myRange = $wb.utils.Range(1,10,"%s. place");
        */
        Range:function(start,end,format) {
            var out = {};
            for(var i = start;i <= end;i++) {
                if (format)
                    out[i] = format.format(i);
                else
                    out[i] = i;
            }
            return out;
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
                +parseCssSize(el.css('padding-left'))
                +parseCssSize(el.css('padding-right'))
                +parseCssSize(el.css('margin-left'))
                +parseCssSize(el.css('margin-right'))
                +parseCssSize(el.css('border-left-width'))
                +parseCssSize(el.css('border-right-width'));
                out.height += el.height() 
                +parseCssSize(el.css('padding-top'))
                +parseCssSize(el.css('padding-bottom'))
                +parseCssSize(el.css('margin-top'))
                +parseCssSize(el.css('margin-bottom'))
                +parseCssSize(el.css('border-top-width'))
                +parseCssSize(el.css('border-bottom-width'));
            });
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
        
        $.fn.findFirst = function(selector) {
            return $($(this).find(selector)[0]);
        }
        
        $.fn.noclick = function() {
            $(this).bind('mousedown click mouseup',function(evt) {
                evt.stopImmediatePropagation();
                evt.preventDefault();
                return false;
            }).removeAttr('onclick')
            .removeAttr('onmousedown')
            .removeAttr('onmouseup');
        };
        
        $.fn.attrs = function() {
            var attributes = {}; 

            if(!this.length)
                return attributes;

            $.each(this[0].attributes, function(index, attr) {
                attributes[attr.name] = attr.value;
            }); 

            return attributes;
        };
        
        $.fn.clearAttrs = function() {
            var elm = $(this);
            var attrs = elm.attrs();
            
            for(var name in attrs) {
                elm.removeAttr(name);
            }

            return elm;
        };
        
        
        
        $.fn.cloneFrom = function(source) {
            if(!this.length)
                return this;
            
            source = $(source);
            
            var elm = $(this);
            
            elm.clearAttrs();
            var newAttrs = source.attrs();
            
            if (!newAttrs) 
                return this;
            
            for(var name in newAttrs) {
                var val = newAttrs[name];
                elm.attr(name,val);
            }
            return this;
        };
        
        $.fn.path = function(ignoreTags,last) {
            if (!ignoreTags)
                ignoreTags = [];
            if (!last) last = '';
            
            var el = $(this);

            if (!el[0] || !el[0].tagName) return last;
            
            if (el[0].tagName.toUpperCase() == 'HTML') 
                return last;
            
            var tag = el[0].tagName.toLowerCase();
            
            if (tag.indexOf(':') > -1)
                return last;

            if (el.attr('id')) {
                var id = el.attr('id');
                
                //If element has ID that does not look like a generic id... use that
                if (!/[0-9]/.test(id)) {
                    return tag+'#'+id+' '+last;
                } else {
                    if (/[A-Z]{4,}/i.test(id)) {
                        //If the generic id ends with some letters - use those
                        var result = /[A-Z]{4,}/i.exec(id);
                        return tag+'[id$='+result[0]+"] "+last;
                    }
                }
                
            }
            
            var p = el.parent();
            
            var similarCount = p.length > 0 ? p.find(last).length : 1;
            
            if (last.length > 0 
                        && p.length > 0
                        && similarCount == 1) { 
                //Parent has only one
                return p.path(ignoreTags,last);
            }
            
            var out = '';
            if (p.length == 0 || ignoreTags.indexOf(tag) == -1) {
                var name = tag;

                var attrs = ['name','rel','type','title','alt'];
                var found = false;
                for(var i = 0; i < attrs.length;i++) {
                    var attr = attrs[i];
                    var val = $(el[0]).attr(attr);
                    if (val) {
                        name += '['+ attr +'="' + val + '"]';
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    var className = el[0].className.split(' ')[0];
                    if (className.length > 0) {
                        name += '.' + className;
                        found = true;
                    }
                }
                
                if (p.length > 0) {
                    
                    similarCount = p.find((name+' '+last).trim()).length
                    
                    if (similarCount > 1) {
                        var index = el.prevAll(name).length;
                        name += ":nth-child(" + (index+1) + ")";
                        found = true;
                    }
                }
                
                
                if (found)
                    out = name;
            }
            if (p) {
                return p.path(ignoreTags,out+' '+last);
            }
                
            
            return out.trim()+last;
        }
        
        $.fn.scrollTo = function(elm,margin) {
            
            if (typeof elm == 'string') {
                elm = $(this).find(elm);
            } else {
                elm = $(elm);
            }
            if (!margin)
                margin = ($(this).innerHeight()-elm.outerHeight())/2;
            
            var pOffset = $(this).offset();
            if (!pOffset) 
                return;
            var offset = elm.offset();
            if (!offset) 
                return;
            offset.top -= pOffset.top;
            offset.left -= pOffset.left;
            $(this).scrollTop(Math.max(0,offset.top-margin));
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
            return parseCssSize(el.css('padding-top'))
            +parseCssSize(el.css('padding-bottom'));
        };

        $.fn.paddingWidth= function() {
            var el = $(this);
            return parseCssSize(el.css('padding-left'))
            +parseCssSize(el.css('padding-right'));
        };
        
        $.fn.cssSize = function() {
            var el = $(this);
            var out = 0;
            $(arguments).each(function() {
                out += parseCssSize(el.css(""+this));
            });
            return out;
        }
        
        
        $.fn.boxHeight= function() {
            var el = $(this);
            return el.height()
                        +el.paddingHeight()
                        +parseCssSize(el.css('border-top'))
                        +parseCssSize(el.css('border-bottom'));
        };

        $.fn.boxWidth = function() {
            var el = $(this);
            return el.width()
                        +el.paddingWidth()
                        +parseCssSize(el.css('border-left'))
                        +parseCssSize(el.css('border-right'));
        };


        $.fn.outerEdgeSize = function() {
            var el = $(this);
            var out = 0;
            $(arguments).each(function() {
                var size = parseCssSize(el.css('padding-'+this))
                        +parseCssSize(el.css('margin-'+this))
                        +parseCssSize(el.css('border-'+this+'-width'));


                out += size;
            });

            return out;
        };

        $.fn.innerEdgeSize = function() {
            var el = $(this);
            var out = 0;
            

            return out;
        };

        $.fn.outerEdgeWidth = function() {
            var el = $(this);
            return el.outerEdgeSize('left','right');
        };


        $.fn.outerEdgeHeight = function() {
            var el = $(this);
            return el.outerEdgeSize('top','bottom');
        };

        $.fn.innerEdgeHeight = function() {
            var el = $(this);
            return el.innerEdgeSize('top','bottom');
        };

        $.fn.innerEdgeWidth = function() {
            var el = $(this);
            return el.innerEdgeSize('left','right');
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
            var el = $(this);
            if (typeof width == 'undefined') {
                return el.width()+el.outerEdgeWidth();
            } else {
                $(this).each(function() {
                    $(this).width(Math.max(0,width-$(this).outerEdgeWidth()));
                });
            }
            return $(this);
        };
        
        $.fn.outerHeight= function(height) {
            var el = $(this);
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
            var el = $(this);
            if (typeof width == 'undefined')
                return el.width()-el.innerEdgeWidth();
            else {
                $(this).each(function() {
                    $(this).width(width+el.innerEdgeWidth());
                });
            }
            return $(this);
        };

        $.fn.innerHeight= function(height) {
            var el = $(this);
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
            var el = $(this);
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

            var input = $('<input type="text" class="wb-keynav-input" style="position:absolute;left:-9999px" />');
            elm.append(input);

            elm.bind('click',function(evt) {
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
        
        $.fn.isOutside = function(container,newOffset) {
            var thisBBox = $(this).boundingBox(false);
            
            if (!thisBBox)
                return false;
            
            if (newOffset) {
                thisBBox = newOffset;
                thisBBox.right = thisBBox.left + $(this).outerWidth();
                thisBBox.bottom = thisBBox.top + $(this).outerHeight();
            }
        
            
            
            var containerBBox = $(container).boundingBox(false);
            
            if (!containerBBox)
                return false;
            
            if (thisBBox.left < containerBBox.left) 
                return 'left';
            
            if (thisBBox.right > containerBBox.right) 
                return 'right';
            
            if (thisBBox.top < containerBBox.top) 
                return 'top';
            
            if (thisBBox.bottom > containerBBox.bottom) 
                return 'bottom';
            return null;
        }
        

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
            var val = 'rotate('+degrees+'deg)';
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
        };
        $.fn.onscreen = function() {
            $(this).removeClass('wb-offscreen');
        };

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
            if (!out) return null;
            out.right = out.left+elm.outerWidth();
            out.bottom = out.top+elm.outerHeight();
            return out;
        };
        
        $.fn.isOnPage = function() {
            return ($(this).closest('body').length != 0);
        };
        
        $.fn.widest = function() {
            var widest = null,width = 0;
            $(this).each(function() {
                if ($(this).outerWidth() > width) {
                    widest = this;
                    width = $(this).outerWidth();
                }
            });
            return $(widest);
        }
        
        $.fn.highest = function() {
            var highest = null,height = 0;
            $(this).each(function() {
                if ($(this).outerHeight() > height) {
                    highest = this;
                    height = $(this).outerHeight();
                }
            });
            return $(highest);
        }

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


        $.fn.collidesWith = function(elm,tolerance) {
            if (!tolerance)
                tolerance = 0;
            elm = $(elm);
            var collider = elm.boundingBox();
            var out = [];

            function between(num,a,b,tolerance) {
                return num >= (a-tolerance) && num <= (b+tolerance);
            }

            $(this).each(function() {
                var testElm = $(this);
                if (testElm[0] == elm[0]) 
                    return;
                var bbox = testElm.boundingBox();
                var horizontal = (between(collider.left,bbox.left,bbox.right,tolerance)
                                    || between(collider.right,bbox.left,bbox.right,tolerance));
                var vertical = (between(collider.bottom,bbox.top,bbox.bottom,tolerance)
                                    || between(collider.top,bbox.top,bbox.bottom,tolerance));
                if (horizontal && vertical)
                    out.push(this);
            });
            return $(out);
        };

        
        $.fn.elementAt = function(x,y) {
            var out = [];
            $(this).each(function() {
                var elm = $(this);
                var bbox = elm.boundingBox();
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

    })(jQuery);

})();