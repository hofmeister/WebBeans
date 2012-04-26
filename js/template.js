/**
 * @fileOverview
 * Contains all the default templates
 * @author <a href="http://twitter.com/vonhofdk"/>Henrik Hofmeister</a>
 * @version 1.0
 */


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
    frame: function() {
        return '<div class="wb-frame wb-pane"><div class="wb-frame-header"><div class="wb-title" /></div><div class="wb-content" /></div>';
    },
    window: function() {
        return '<div class="wb-window wb-frame wb-pane"><div class="wb-frame-header"><div class="wb-title" /><a href="#" class="wb-close" /></div><div class="wb-content" /></div>';
    },
    shade: function() {
        return '<div class="wb-shade"></div>';
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
            return $wb.template.form.container(type,'<input class="wb-input" type="'+type+'" value="" />');
        },
        color:function() {
            return $wb.template.form.container("color",'#<input class="wb-input" type="text" value="" />');
        },
        date:function() {
            return $wb.template.form.container("date",'<input class="wb-input" type="text" value="" />');
        },
        container:function(type,contents) {
            return '<div class="wb-input-container wb-input-'+type+'"><label><span class="wb-label" />'+contents+'</label></div>';
        },
        button:function(type) {
            return '<input class="wb-form-button" type="'+type+'" value="" />';
        },
        text:function(type) {
            return '<div class="wb-target" />';
        },
        textarea:function() {
            return $wb.template.form.container('textarea','<textarea class="wb-input wb-input-textarea" />');
        },
        select:function() {
            return $wb.template.form.container('select','<select class="wb-input wb-input-select" />');
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
