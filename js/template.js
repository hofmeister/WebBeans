$wb.template = {
    base:function() {
        return '<div class="wb-base"></div>';
    },
    top: {
        bar:function() {
            return '<ul class="wb-menu wb-topmenu line"><li class="wb-logo wb-menuitem"><img alt="WebBeans" title="WebBeans" src="images/logo.png" /></li></ul>';
        }
    },
    header:{
        bar:function() {
            return '<ul class="wb-menu wb-header line"></ul>';
        },
        searchField:function() {
            return '<input type="text" class="wb-menuitem wb-search-global" />';
        }
    },
    footer:function() {
        return '<ul class="wb-footer"></ul>';
    },
    menu: {
        base:function() {
            return '<ul class="wb-menu line"></ul>';
        },
        menuItem:function() {
            return '<li class="wb-menuitem"><div class="wb-title" /></li>';
        },
        subMenu:function() {
            return '<ul class="wb-submenu line"></ul>';
        }
    },
    window: {
        container:function() {
            return '<div class="wb-window"></div>';
        },
        header:function(fixed) {
            return '<div class="wb-window-header '+(fixed ? 'wb-fixed' : '')+'"></div>';
        },
        headerTab:function() {
            return '<div class="wb-window-tab"><span class="wb-title"></span><a class="wb-close" href="#"></a></div>';
        },
        toolbar:function() {
            return '<div class="wb-window-toolbar"></div>';
        },
        toolbarButton:function() {
            return '<div class="wb-toolbar-button"></div>';
        },
        toolbarDivider:function() {
            return '<div class="wb-toolbar-divider"></div>';
        },
        scrollbar:function() {
            return '<div class="wb-scrollbar"><div class="wb-scroller"></div></div>';
        }
    },
    button: function() {
        return '<a href="#" class="wb-button"></a>';
    },
    panes: {
        pane:function() {
             return '<div class="wb-pane"></div>';
        },
        split:function() {
            return '<div class="wb-pane wb-splitpane"><div class="wb-splitter"></div></div>';
        },
        tab:function() {
            return '<div class="wb-pane wb-tabpane"><ul class="wb-tabs line" /><div class="wb-panes" /></div>';
        },
        tab_button:function() {
            return '<li class="wb-tab"><div class="wb-title" /></li>';
        },
        html:function() {
             return '<div class="wb-pane wb-pane-html"><div class="wb-inner" /></div>';
        }
    },
    tree: {
        base:function() {
            return '<div class="wb-component wb-tree"><ul class="wb-tree-root" /></div>';
        },
        sub:function() {
            return '<ul class="wb-tree-sub" />';
        },
        node:function() {
            return '<li class="wb-tree-node"><div class="wb-handle" /><div class="wb-icon" /><div class="wb-title" /></li>';
        }
    },
    accordion:function() {
        return '<ul class="wb-pane wb-accordion"></ul>';
    }

};