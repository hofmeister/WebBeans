$wb.template = {
    base:function() {
        return '<div class="wb-base"></div>';
    },
    top: {
        bar:function() {
            return '<ul class="wb-topmenu"></ul>';
        },
        logo:function() {
            return '<li class="wb-logo"></li>';
        },
        menuItem:function(leaf) {
            return '<li class="wb-menuitem '+(leaf ? "wb-leaf" : "")+'"></li>';
        },
        subMenu:function() {
            return '<ul class="wb-submenu"></ul>';
        }
    },
    header:{
        bar:function() {
            return '<ul class="wb-header"></ul>';
        },
        button:function() {
            return '<li class="wb-header-button"></li>';
        },
        searchField:function() {
            return '<input type="text" class="wb-search-global" />';
        }
    },
    footer:function() {
        return '<ul class="wb-footer"></ul>';
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
        scrollbar:function(vertical) {
            return '<div class="wb-scrollbar '+(vertical ? 'wb-vertical' : '')+'"><div class="wb-scroller"></div></div>';
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
            return '<div class="wb-splitpane"><div class="wb-splitter"></div></div>';
        }
    }
    
};