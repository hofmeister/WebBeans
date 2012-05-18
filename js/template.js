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
    draw:{
        canvas:function() {
             return '<div class="wb-canvas"></div>';
        },
        layer:function() {
             return '<canvas class="wb-layer"></canvas>';
        }
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
    table: {
        base:function() {
            return '<table  cellspacing="0" cellpadding="0" class="wb-component wb-table"></table>';
        },
        header:function() {
            return '<thead class="wb-table-head"></thead>';
        },
        footer:function() {
            return '<tfoot class="wb-table-foot"></tfoot>';
        },
        body:function() {
            return '<tbody class="wb-table-body"><td class="wb-inner-table-container" valign="top"><div class="wb-table-body-scroll"><table  cellspacing="0" cellpadding="0"><tbody class="wb-inner-table" /></table></div></td></tbody>';
        },
        row:function() {
            return '<tr class="wb-table-row" />';
        },
        body_cell:function() {
            return '<td class="wb-table-cell" />';
        },
        header_cell:function() {
            return '<th class="wb-table-cell" ><div class="wb-icon wb-sort"/><span class="wb-title" /><div class="wb-icon wb-filter"/></th>';
        }
    },
    paging:{
        base:function() {
            return '<ul class="wb-paging line"></ul>';
        },
        count:function() {
            return '<li class="wb-count">%s</li>'.format(_("Page %s/%s",this.opts.currentPage+1,this.opts.totalPages));
        },
        entry:function(name) {
            return '<li><a href="#">'+name+'</a></ul>';
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
            return '<div class="wb-button-pane line"></div>';
        }
    },
    accordion:function() {
        return '<ul class="wb-pane wb-accordion"></ul>';
    },
    link:function() {
        return '<a href="#" />'
    },
    actions:{
        custom:function(title) {
            return '<a href="#" class="wb-action" title="'+title+'" />'
        },
        base:function(type,title) {
            return '<a href="#" class="wb-action icon-'+type+'" title="'+title+'" />'
        },
        hide:function() {
            return $wb.template.actions.base.apply(this,['eye-close',_('Hide')]);
        },
        show:function() {
            return $wb.template.actions.base.apply(this,['eye-open',_('Show')]);
        },
        refresh:function() {
            return $wb.template.actions.base.apply(this,['refresh',_('Refresh')]);
        },
        openFolder:function() {
            return $wb.template.actions.base.apply(this,['folder-open',_('Open')]);
        },
        closeFolder:function() {
            return $wb.template.actions.base.apply(this,['folder-close',_('Close')]);
        },
        comment:function() {
            return $wb.template.actions.base.apply(this,['comment',_('Comment')]);
        },
        search:function() {
            return $wb.template.actions.base.apply(this,['search',_('Search')]);
        },
        user:function() {
            return $wb.template.actions.base.apply(this,['user',_('User')]);
        },
        upload:function() {
            return $wb.template.actions.base.apply(this,['upload-at',_('Upload')]);
        },
        download:function() {
            return $wb.template.actions.base.apply(this,['download-alt',_('Download')]);
        },
        close:function() {
            return $wb.template.actions.base.apply(this,['remove',_('Close')]);
        },
        edit:function() {
            return $wb.template.actions.base.apply(this,['edit',_('Edit')]);
        },
        apply:function() {
            return $wb.template.actions.base.apply(this,['ok-sign',_('Apply')]);
        },
        save:function() {
            return $wb.template.actions.apply.apply(this);
        },
        cancel:function() {
            return $wb.template.actions.base.apply(this,['ban-circle',_('Cancel')]);
        },
        remove:function() {
            return $wb.template.actions.base.apply(this,['remove-sign',_('Remove')]);
        },
        add:function() {
            return $wb.template.actions.base.apply(this,['plus-sign',_('Add')]);
        },
        open:function() {
            return $wb.template.actions.base.apply(this,['folder-open',_('Open')]);
        },
        share:function() {
            return $wb.template.actions.base.apply(this,['share',_('Share')]);
        },
        clear:function() {
            return $wb.template.actions.base.apply(this,['remove',_('Clear')]);
        },
        prev:function() {
            return $wb.template.actions.base.apply(this,['chevron-left',_('Previous')]);
        },
        next:function() {
            return $wb.template.actions.base.apply(this,['chevron-right',_('Next')]);
        }
    }

};
