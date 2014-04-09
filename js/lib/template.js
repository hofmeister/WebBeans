//@module core
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
    dropdown: {
        menu:function() {
            return '<ul class="wb-menu wb-dropdown line"></ul>';
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
    wrapper:function() {
        return '<div class="wb-wrapper"><div class="wb-top"></div><div class="wb-bottom"></div><div class="wb-left"></div><div class="wb-right"></div></div>';
    },
    iframe:function() {
        return '<div class="wb-iframe wb-pane"><div class="wb-loader"></div><iframe class="wb-target" src="about:none;" allowTransparency="true" frameborder="0"></iframe></div>';
    },
    section:function() {
        return '<div class="wb-section" ><h3 class="wb-title" /><div class="wb-target" /></div>';
    },
    keyvalue:{
        base:function() {
            return '<div class="wb-keyvalue" ></div>';
        },
        row:function() {
            return '<div class="line wb-row"><div class="wb-label" /><div class="wb-value" /></div>';
        }
    },
    menu: {
        base:function() {
            return '<ul class="wb-menu line"></ul>';
        },
        menuItem:function() {
            return '<li class="wb-menuitem"><span class="wb-icon"/><span class="wb-title" ><span class="wb-text" /></span></li>';
        },
        subMenu:function() {
            return '<ul class="wb-submenu line"></ul>';
        }
    },
    breadcrumb: {
        container:function() {
            return '<ul class="wb-breadcrumb line"></ul>';
        },
        button:function() {
            return '<li class="wb-entry"><span class="wb-icon"/><span class="wb-title" ><span class="wb-text" /></span></li>';
        }
    },
    frame: function() {
        return '<div class="wb-frame wb-pane"><div class="wb-frame-header"><div class="wb-title" /><div class="wb-actions"/></div><div class="wb-content" /></div>';
    },
    window: function() {
        return '<div class="wb-window wb-frame wb-pane"><div class="wb-frame-header"><div class="wb-title" /><div class="wb-actions"/></div><div class="wb-content" /></div>';
    },
    shade: function() {
        return '<div class="wb-shade"></div>';
    },
    button: function() {
        return '<a href="#" class="wb-button"><span class="wb-icon"/><span class="wb-title" /></a>';
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
            return '<div class="wb-pane wb-splitpane"><div class="wb-splitter" /><div class="wb-ruler" /></div>';
        },
        tab:function() {
            return '<div class="wb-pane wb-tabpane"><ul class="wb-tabs line" ><li class="wb-actions" /></ul><div class="wb-panes" /></div>';
        },
        tab_button:function() {
            return '<li class="wb-tab"><span class="wb-title" ><span class="wb-text" /></span></li>';
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
        body_action_cell:function() {
            return '<td class="wb-table-cell wb-actions" ><a href="">&nbsp;</a></td>';
        },
        header_cell:function() {
            return '<th class="wb-table-cell" ><div class="wb-icon wb-sort"/><span class="wb-title" /><div class="wb-icon wb-filter"/></th>';
        },
        header_action_cell:function() {
            return '<th class="wb-table-cell wb-actions" ><a href="">&nbsp;</a></th>';
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
        email:function() {
            return $wb.template.form.container('email','<input class="wb-input" type="text" value="" />');
        },
        cron:function() {
            return $wb.template.form.container('cron','<input class="wb-input" type="hidden" value="" /><div class="wb-target line" />');
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
            return '<fieldset class="wb-section" ><legend class="wb-title" /><div class="wb-target line" /></fieldset>';
        },
        select_option:function() {
            return '<option />';
        },
        select_option_group:function() {
            return '<optgroup />';
        },
        button_pane:function() {
            return '<div class="wb-button-pane line"></div>';
        }
    },
    accordion:function() {
        return '<ul class="wb-pane wb-accordion"></ul>';
    },
    link:function() {
        return '<a href="#" />';
    },
    actions:{
        container:function() {
            return '<div class="wb-actions"/>';
        },
        custom:function(title) {
            return '<a href="#" class="wb-action" title="'+title+'" />';
        },
        base:function(type,title) {
            return '<a href="#" class="wb-action type-'+type+'" title="'+title+'" ><span class="wb-icon icon-'+type+'"/><span class="wb-title">'+title+'</span></a>';
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
            return $wb.template.actions.base.apply(this,['upload-alt',_('Upload')]);
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
