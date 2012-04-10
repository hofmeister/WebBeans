$wb.template = {
    base:function() {
        return '<div class="wb-base"></div>';
    },
    top: {
        bar:function() {
            return '<ul class="wb-menu wb-topmenu line"></ul>';
        }
    },
    context: {
        menu:function() {
            return '<ul class="wb-menu wb-context line"></ul>';
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
        base:function() {
            return '<div class="wb-window wb-pane"></div>';
        },
        header:function() {
            return '<div class="wb-window-header"></div>';
        }
    },
    button: function() {
        return '<a href="#" class="wb-button"></a>';
    },
    panes: {
        pane:function() {
             return '<div class="wb-pane"></div>';
        },
        canvas:function() {
             return '<canvas class="wb-pane"></canvas>';
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
    table: {
        base:function() {
            return '<table class="wb-component wb-table"></table>';
        },
        header:function() {
            return '<thead class="wb-table-head"></thead>';
        },
        footer:function() {
            return '<tfoot class="wb-table-foot"></tfoot>';
        },
        body:function() {
            return '<tbody class="wb-table-body"></tbody>';
        },
        row:function() {
            return '<tr class="wb-table-row" />';
        },
        body_cell:function() {
            return '<td class="wb-table-cell" />';
        },
        header_cell:function() {
            return '<th class="wb-table-cell" />';
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

    form: {
        form:function() {
            return '<form  class="wb-pane" />';
        },
        input:function(type) {
            return '<div class="wb-input-container"><label><span class="wb-label" /><input class="wb-input wb-input-'+type+'" type="'+type+'" value="" /></label></div>';
        },
        button:function(type) {
            return '<input class="wb-form-button" type="'+type+'" value="" />';
        },
        textarea:function() {
            return '<div class="wb-input-container"><label><span class="wb-label" /><textarea class="wb-input wb-input-textarea" /></label></div>';
        },
        select:function() {
            return '<div class="wb-input-container"><label><span class="wb-label" /><select class="wb-input wb-input-select" /></label></div>';
        },
        
        fieldset:function() {
            return '<fieldset />';
        },
        select_option:function() {
            return '<option />';
        },
        button_pane:function() {
            return '<div class="wb-button-pane"></div>';
        }
    },
    accordion:function() {
        return '<ul class="wb-pane wb-accordion"></ul>';
    },
    link:function() {
        return '<a href="#" />'
    }

};
