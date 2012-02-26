$wb.ui = {};

//Layouts
$wb.ui.layout = {};
$wb.ui.layout.Stack = function() {
    this.elm().css({
        position:'relative'
    });
    var width = this.elm().width();
    var height = this.elm().height();
    var nodes = this.children();
    for(var i in nodes) {
        nodes[i].elm().css({
            position:'absolute',
            top:0,
            left:0,
            zIndex:i === 0 ? 10 : 1
        });
        nodes[i].elm().outerWidth(width);
        nodes[i].elm().outerHeight(height);
    }
}
$wb.ui.layout.Flow = function() {
    var nodes = this.children();
    for(var i in nodes) {
        nodes[i].elm().css({'float':'left'});
    }
};

$wb.ui.layout.Box = function() {
    var width = this.elm().width();
    var nodes = this.children();
    for(var i in nodes) {
        nodes[i].elm().outerWidth(width);
    }
};

$wb.ui.layout.GridBag = function() {

    var w = this.elm().width();
    var h = this.elm().height();
    var nodes = this.children();
    var others = [];
    if (nodes.length === 0)
        return;

    var last = null;
    for(var i in nodes) {
        var isLast = i == (nodes.length-1);
        if (isLast) {
            last = nodes[i].elm();
        } else {
            others.push(nodes[i].elm());
        }
    }

    var usedSize = $wb.utils.fullSize(others);
    last.outerHeight(h-usedSize.height);
    last.outerWidth(w);
};

//Widgets
$wb.ui.Widget = $wb.Class('Widget',{
    __extends:[$wb.core.Events,$wb.core.Utils],
    _elm:null,
    _id:null,
    _layoutMethod:null,
    _tmpl:null,
    _children:[],
    _target:null,
    _context:null,
    __construct:function(opts) {
        this.__super();

        this.require(opts,'tmpl');

        this._tmpl = opts.tmpl;
        this._elm = $(this._tmpl());
        
        this._elm.widget(this);

        if (opts.target) {
            this._target = this._elm.find(opts.target);
        } else {
            this._target = this._elm;
        }
        this._id = opts.id;

        if (this._id) {
            this.target().attr('id',this._id);
        }

        this._layoutMethod = opts.layout ? opts.layout : function() {};

        if (!opts.bindInner) {
            opts.bindInner = {};
        }
        if (!opts.bind) {
            opts.bind = {};
        }

        this.bind('resize',this._layout);
    },
    add:function(child) {
        this.children().push(child);
    },
    children:function() {
        return this._children;
    },
    html: function(html) {
        return this.target().html(html);
    },
    find: function(path) {
        return this.elm().find(path);
    },
    elm: function() {
        return this._elm;
    },
    target:function() {
        return this._target;
    },
    render: function(container) {
        this._paint();
        this._place(container);
        this._renderChildren();

        this._layout();

        this.trigger('render');
        return this.elm();
    },
    setContextMenu:function(w) {
        var ccontext_id = '-wb-state-current-context';
        
        this.elm().bind('contextmenu',function(evt) {
            //Remove all others
            $('.'+ccontext_id).detach();
            evt.preventDefault();
            evt.stopPropagation();
            
            var elm = w.elm();
            
            $('body').append(elm);
            elm.css({
                position:'absolute',
                left:evt.pageX,
                top:evt.pageY,
                zIndex:9999
            });
            elm.addClass(ccontext_id);
            w.render();
            w.source($(evt.target).widget());
            var hideHandler = function(evt) {
                evt.stopPropagation();
                elm.detach();
                $('body').unbind('click',hideHandler);
                elm.unbind('click',hideHandler);
            };
            
            elm.bind('click',hideHandler);
            $('body').bind('click',hideHandler);
            
        });
    },
    _paint: function() {
        for(var i in this.children()) {
            this.target().append(this._children[i].elm());
        }
        this.trigger('paint');
    },
    _place: function(container) {
        if (container) {
            $(container).append(this.elm());
        }
    },
    _layout: function() {
        this.trigger('beforelayout');
        if (this._layoutMethod) {
            this._layoutMethod.apply(this);
        }
        for(var i in this._children) {
            var child = this._children[i];
            child._layout();
        }
        this.trigger('afterlayout');
    },
    _renderChildren: function() {
        this.trigger('beforerenderchildren');
        for(var i in this._children) {
            this._children[i].render();
        }
    },
    _resize: function() {
        this._layout.apply(this);
        for(var i in this._children) {
            var child = this._children[i];
            child._resize();
        }
    }
});

$wb.ui.BasePane = $wb.Class('BasePane',{
   __extends:[$wb.ui.Widget],
   __construct:function(topbar,header) {
        this.__super({
            tmpl:$wb.template.base,
            layout:$wb.ui.layout.GridBag
        });

        var self = this;
        var resizeTimeout = null;
        $(window).bind('resize',function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                self._resize();
            },0);
        });

        this.add(topbar);
        this.add(header);
        this.bind('beforelayout',this.makeFullScreen);
    },
    makeFullScreen: function() {
        var w = $(window).width();
        var h = $(window).height();
        this.elm().width(w);
        this.elm().height(h);
    }
});

$wb.ui.Button = $wb.Class('Button',{
    _titleElm:null,
    __extends:[$wb.ui.Widget],
    __construct:function(opts) {
        opts = $.extend({titleElm:'.wb-title'},opts)
        this.__super(opts);

        this._titleElm = opts.titleElm;
    },
    title:function(title) {
        return this.elm().find(this._titleElm).html(title);
    }
});


$wb.ui.MenuButton = $wb.Class('MenuButton',{
    __extends:[$wb.ui.Button],
    __construct:function(opts) {
        this.__super(opts);
    }
});

$wb.ui.Menu = $wb.Class('Menu',{
    _itemTmpl:null,
    _subTmpl:null,
    __extends:[$wb.ui.Widget],
    _vertical:null,
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.menu.base,
            itemTmpl:$wb.template.menu.menuItem,
            subTmpl:$wb.template.menu.subMenu,
            vertical:true
        },opts);
        this.__super(opts);

        this.require(opts,'itemTmpl','subTmpl');

        this._vertical = opts.vertical;
        this._subTmpl = opts.subTmpl;
        this._itemTmpl = opts.itemTmpl;

        this.bind('paint',function() {
            this.elm().addClass(this._vertical ? 'wb-vertical' : 'wb-horizontal');
        });

    },
    _makeButton:function(title,callback) {
        var btn =  new $wb.ui.MenuButton({
            tmpl:this._itemTmpl
        });
        btn.bind('paint',function() {
            this.title(title);
            if ($.type(callback) == 'function')
                this.elm().unbind('click').bind('click',callback);
        });

        return btn;
    },
    _makeSubMenu:function(title,menus) {
        var subMenuBtn = this._makeButton(title);
        var submenu = new $wb.ui.Menu({
            tmpl:this._subTmpl,
            itemTmpl:this._itemTmpl,
            subTmpl:this._subTmpl,
            vertical:true
        });
        for(var i in menus) {
            var m = menus[i];
            submenu.add(m.title,m.arg);
        }

        subMenuBtn.add(submenu);

        return subMenuBtn;
    },
    add: function(title,arg) {
        var elm;
        if ($.type(arg) == 'array') {
            elm = this._makeSubMenu(title,arg);
        } else if ($.type(title) == 'array') {
            for(var i = 0; i < title.length;i++) {
                var m = title[i];
                this.add(m.title,m.arg);
            }
            return this._children;
        } else {
            elm = this._makeButton(title,arg);
        }
        this._children.push(elm);
        return elm;
    }
});

$wb.ui.TopBar = $wb.Class('TopBar',{
    __extends:[$wb.ui.Menu],
    __construct:function(opts) {
        if (!opts) opts = {};
        $.extend(opts,{tmpl:$wb.template.top.bar,vertical:false});
        this.__super(opts);
    }
});

$wb.ui.ContextMenu = $wb.Class('ContextMenu',{
    __extends:[$wb.ui.Menu],
    _source:null,
    __construct:function(opts) {
        if (!opts) opts = {};
        $.extend(opts,{tmpl:$wb.template.context.menu,vertical:true});
        this.__super(opts);
    },
    source:function(source) {
        if (source) {
            this._source = source;
            return this;
        } else {
            return this._source;
        }
    }
});

$wb.ui.Header = $wb.Class('Header',{
    __extends:[$wb.ui.Menu],
    __construct:function(opts) {
        if (!opts) opts = {};
        $.extend(opts,{tmpl:$wb.template.header.bar,vertical:false});
        this.__super(opts);
    }
});

$wb.ui.Pane = $wb.Class('Pane',{
    __extends:[$wb.ui.Widget],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.panes.pane,
            layout:$wb.ui.layout.Box
        },opts);

        this.__super(opts);
    }
});


$wb.ui.SplitPane = $wb.Class('SplitPane',{
    defaultOpts: {
        vertical:true,
        splitPosition:.5
    },
    _vertical:true,
    _splitPosition:.5,
    __extends:[$wb.ui.Pane],
    __construct:function(opts) {
        if (!opts) opts = {};
        var self = this;
        opts = $.extend({},this.defaultOpts,opts,{
            tmpl:$wb.template.panes.split,
            layout:function() {
                self.setSplitPosition(this._splitPosition);
            }
        });

        this.__super(opts);

        this._vertical = opts.vertical;
        this._splitPosition = opts.splitPosition;
        this.elm().addClass(opts.vertical ? 'wb-vertical' : 'wb-horizontal');
        this.bind('beforelayout',function() {
            this.getSplitter().addClass(opts.vertical ? 'wb-vertical' : 'wb-horizontal');
        });
        this.bind('render',function() {
            var moving = false;
            var self = this;
            this.getSplitter().mousedown(function(evt) {
                evt.preventDefault();
                //evt.stopPropagation();
                moving = true;
                self.elm().css('cursor',self._vertical ?  'col-resize': 'row-resize');
            });
            $('body').mouseup(function(evt) {
                //evt.stopPropagation();
                moving = false;
                self.elm().css('cursor','inherit');
            });
            $('body').mousemove(function(evt) {
                var fullSize,globalOffset,elmOffset;
                if (!moving) return;
                var splitterSize = self.getSplitter().fullSize();

                if (self._vertical) {
                    fullSize= self.elm().width()-splitterSize.width;
                    globalOffset = evt.pageX-Math.ceil(splitterSize.width/2);
                    elmOffset = self.elm().offset().left;
                } else {
                    fullSize= self.elm().height()-splitterSize.height;
                    globalOffset = evt.pageY-Math.ceil(splitterSize.height/2);
                    elmOffset = self.elm().offset().top;

                }
                var offset = (globalOffset-elmOffset)/fullSize;

                self.setSplitPosition(offset);
                self._children[0]._layout();
                self._children[1]._layout();
            });

        });
    },
    add:function() {throw "Add is not supported for split panes";},
    set: function(ix,pane) {
        if (ix < 0 || ix > 1)
            throw "Invalid index for split pane: "+ix;
        this._children[ix] = pane;
    },
    get: function(ix) {
        return this._children[ix];
    },
    getSplitter: function() {
        return this.elm().children('.wb-splitter');
    },
    _paint: function() {
        this.getSplitter()
                .before(this._children[0].elm())
                .after(this._children[1].elm());
    },
    setSplitPosition: function(splitPosition) {
        var width,height;

        if (!splitPosition)
            splitPosition = this._splitPosition;
        this._splitPosition = splitPosition;
        var splitterSize = this.getSplitter().fullSize();

        if (this._vertical) {
            width = this.elm().width()-splitterSize.width;
            height = parseInt(this.elm().css('height'));
            this.getSplitter().height(height);
            var w1 = width*splitPosition;
            var w2 = width-w1;
            this.get(0).elm().outerWidth(w1).outerHeight(height);
            this.get(1).elm().outerWidth(w2).outerHeight(height);
        } else {
            height = this.elm().height()-splitterSize.height;
            width = this.elm().width();
            this.getSplitter().width(width);
            var h1 = height*splitPosition;
            var h2 = height-h1;
            this.get(0).elm().outerHeight(h1).outerWidth(width);
            this.get(1).elm().outerHeight(h2).outerWidth(width);
        }
    }
});

$wb.ui.TabButton = $wb.Class('TabButton',{
    __extends:[$wb.ui.Button],
    __construct:function(opts) {
        this.__super(opts);
    }
});

$wb.ui.TabPane = $wb.Class('TabPane',{
    __extends:[$wb.ui.Widget],

    _tabTmpl:null,
    _orientation:'top',
    _tabButtonWidgets:[],
    _tabButtonFull:false,
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.panes.tab,
            tabTmpl:$wb.template.panes.tab_button,
            orientation:'top',
            tabButtonFull:false,
            target:'.wb-panes'
        },opts);

        opts.layout = function() {
            var layoutHorizontal = function() {
                var h,w,tabs;
                h = this.elm().height();
                var btnH = this._tabButtons().outerHeight();
                this.elm().find('.wb-pane').outerHeight(h-btnH);

                if (this._tabButtonFull) {
                    w = this._tabButtons().width();
                    tabs = this._tabButtons().find('.wb-tab');
                    if (tabs.length > 0) {
                        var btnW = Math.floor(w / tabs.length);
                        tabs.outerWidth(btnW);

                        var first = btnW + (w-(btnW*tabs.length));

                        $(tabs[0]).outerWidth(first);
                    }
                }
            };

            switch(this._orientation) {
                case 'top':
                case 'bottom':
                    layoutHorizontal.apply(this);
                    break;
                case 'left':
                case 'right':
                    break;
            }

        };

        this.__super(opts);

        this.require(opts,'tabTmpl','orientation');

        this._orientation = opts.orientation;
        this._tabTmpl = opts.tabTmpl;
        this._tabButtonFull = opts.tabButtonFull;

        this.bind('paint',function() {
            this.elm().addClass("wb-"+this._orientation);
            switch(this._orientation) {
                case 'top':
                    this.elm().prepend(this._tabButtons());
                    break;
                case 'bottom':
                    this.elm().append(this._tabButtons());
                    break;
                case 'left':
                case 'right':
                    break;
            }
        });
        this.bind('beforerenderchildren',function() {
            for(var i in this._tabButtonWidgets) {
                var btn = this._tabButtonWidgets[i];
                btn.render();
                this._tabButtons().append(btn.elm());
            }
        });
        this.bind('render',function() {
            var btns = this._tabButtons().find('.wb-tab');
            if (btns.length > 0)
                $(btns[0]).click();
        });

    },
    _tabButtons:function() {
        return this.elm().children('.wb-tabs');
    },
    _panes:function() {
        return this.elm().children('.wb-panes');
    },
    _makeTabButton:function(title,pane) {
        var btn =  new $wb.ui.TabButton({
            tmpl:this._tabTmpl
        });
        var self = this;
        btn.bind('paint',function() {
            this.title(title);
            btn.elm().click(function() {
                self._tabButtons().find('.wb-tab').removeClass('wb-active');
                $(this).addClass('wb-active');
                self.target().children().hide();
                pane.elm().show();
            });
        });

        return btn;
    },
    add: function(title,pane) {
        var btn = this._makeTabButton(title,pane);
        this._tabButtonWidgets.push(btn);
        this._children.push(pane);
        return pane;
    }
});

$wb.ui.TreeNode = $wb.Class('TreeNode',{
    __extends:[$wb.ui.Button],
    __construct:function(opts) {
        this.__super(opts);
    }
});
$wb.ui.Tree = $wb.Class('Tree',{
    __extends:[$wb.ui.Widget],
    _nodeTmpl:null,
    _subTreeTmpl:null,
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.tree.base,
            nodeTmpl:$wb.template.tree.node,
            subTreeTmpl:$wb.template.tree.sub,
            hideRoot:false,
            target:'.wb-tree-root'

        },opts);
        this.__super(opts);
        this._nodeTmpl = opts.nodeTmpl;
        this._subTreeTmpl = opts.subTreeTmpl;
        this.bind('paint',function() {
            if (opts.hideRoot) {
                this.elm().addClass('wb-noroot');
            }
            this.elm().disableMarking();
        });
    },
    add:function(title,arg) {
        if ($wb.utils.isA(title,'TreeNode')) {
            title.elm().addClass('wb-leaf');
            this.children().push(title);
            return title;
        }
        if ($wb.utils.isA(title,'Tree')) {
            this.children().push(title);
            return title;
        }

        var elm;
        if ($.type(arg) == 'array') {
            elm = this._makeSubTree(title,arg);
        } else {
            elm = this._makeNode(title,arg);
            elm.elm().addClass('wb-leaf');
        }
        this._children.push(elm);
        return elm;
    },
    _makeNode:function(title,callback) {
        var btn =  new $wb.ui.TreeNode({
            tmpl:this._nodeTmpl
        });

        btn.bind('paint',function() {
            this.title(title);
            var toggleOpen = function(evt) {
                evt.preventDefault();
                //evt.stopPropagation();
                var parent = $(this).parent();
                if (!parent.is('.wb-open'))
                    parent.children('.wb-tree-sub').slideDown('fast');
                else {
                    parent.children('.wb-tree-sub').slideUp('fast');
                }
                parent.toggleClass('wb-open');
            };
            this.elm().find('.wb-handle').bind('click',toggleOpen);
            this.elm().find('.wb-title,.wb-icon').bind('dblclick',toggleOpen);
            this.elm().find('.wb-title,.wb-icon').bind('click',function(evt) {
                evt.preventDefault();
                //evt.stopPropagation();
                $(this).closest('.wb-tree').find('.wb-active').removeClass('wb-active');
                $(this).parent().addClass('wb-active');
                if (callback)
                    callback.apply(this);
            });
        });

        return btn;
    },
    _makeSubTree:function(title,nodes) {
        var node = this._makeNode(title);
        var subTree = new $wb.ui.Tree({
            tmpl:this._subTreeTmpl,
            nodeTmpl:this._nodeTmpl,
            subTreeTmpl:this._subTreeTmpl,
            target:null
        });
        for(var i in nodes) {
            var m = nodes[i];
            subTree.add(m.title,m.arg);
        }

        node.add(subTree);

        return node;
    }
});


$wb.ui.HtmlPane = $wb.Class('HtmlPane',{
    __extends:[$wb.ui.Pane],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.panes.html,
            target:'.wb-inner',
            editable:false,
            layout:function() {
                var width = this.elm().width();
                var height = this.elm().height();
                this.target().outerWidth(width);
                this.target().outerHeight(height);
            }
        },opts);
        this.__super(opts);

        this.bind('paint',function() {
            if (opts.editable) {
                this.target().attr('contentEditable','true');
            } else {
                this.target().removeAttr('contentEditable');
            }
        });
    }
});

$wb.ui.Accordion = $wb.Class('Accordion',{
    __extends:[$wb.ui.Menu],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.accordion
        },opts);
        this.__super(opts);
        this.bind('paint',function() {
            var self = this;
            var mainBtns = this.elm().children('.wb-menuitem');
            mainBtns.click(function() {
                mainBtns.removeClass('wb-active');
                var menu = $(this);
                menu.addClass('wb-active');

                var submenu = menu.find('.wb-submenu');
                self.find('.wb-submenu').not(submenu).slideUp('fast');
                submenu.slideDown('fast');
            });
            this.elm().disableMarking();

        });
        this.bind('render',function() {
            var first = $(this.elm().children('.wb-menuitem')[0]);
            first.addClass('wb-active');
            first.find('.wb-submenu').show().slideDown();
        });
        this.bind('afterlayout',function() {
            var h = this.elm().height();
            var mainBtns = this.elm().children('.wb-menuitem').children('.wb-title');
            var btnSize = mainBtns.fullSize();
            var availH = h - btnSize.height;
            this.elm().find('.wb-submenu').outerHeight(availH);
        });
    }
});