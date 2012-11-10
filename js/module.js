$wb.Module = new $wb.Class('Module',{
    __extends:[$wb.core.Events,$wb.core.Utils],
    __defaults:{
        //Key fields
        idField:'id',
        parentField:'parentId',
        nameField:'name',
        
        //Determines which fields to edit/display
        listFields:null,
        detailFields:null,
        overviewFields:['name'],
        formFields:null,
        
        model:null,
        source:null,
        
        
        views:{},
        stores:{},
        
        //MVC Controller
        controller:null,
        
        //Other modes can be readonly, writeonly
        mode:'readwrite',
        actions:[]
    },
    opts:{},
    _readyListeners:[],
    _ready:false,
    actions:{},
    __construct:function(opts) {
        
        this.opts = this.getDefaults(opts);
        
        for(var funcName in this.opts.actions) {
            this.actions[funcName] = function() {
                if (!this.trigger('before%s'.format(funcName)))
                    return false;
                return this.opts.actions[funcName].apply(this,arguments);
                this.trigger('after%s'.format(funcName));
            }.bind(this);
        }
        
        if (this.opts.controller) {
            this.opts.controller.context(this);
        }
    },
    controller:function()  {
        return this.opts.controller;
    },
    listView:function(opts) {
        if (this.opts.views.list)
            return this.opts.views.list.apply(this,[opts]);
        return new $wb.ui.Table($.extend({
            store:this.tableStore(),
            fields:this.opts.listFields,
            actions:this.opts.actions
        },opts));
    },
    formView:function(data) {
        if (this.opts.views.form)
            return this.opts.views.form.apply(this,[data]);
        return new $wb.ui.form.AutoForm({
            model:this.model(),
            data:data,
            fields:this.opts.formFields
        });
    },
    overView:function(entry) {
        if (this.opts.views.overview)
            return this.opts.views.overview.apply(this,[entry]);
        return new $wb.ui.KeyValuePane({
            model:this.model(),
            entry:entry,
            fields:this.opts.overviewFields
        });
    },
    detailView:function(entry) {
        if (this.opts.views.detail)
            return this.opts.views.detail.apply(this,[entry]);
        var keyVal = new $wb.ui.KeyValuePane({
            model:this.model(),
            entry:entry,
            fields:this.opts.detailFields,
            actions:this.opts.actions
        });
        var title = entry[this.opts.nameField];
        var out = new $wb.ui.Frame({title:title});
        out.add(keyVal);
        return out;
    },
    view:function(name,entry) {
        if (this.opts.views[name]) {
            return this.opts.views[name].apply(this,[entry]);
        }
        throw new $wb.Error('View not found: %s'.format(name));
    },
    listStore:function() {
        if (this.opts.stores.list)
            return this.opts.stores.list.apply(this);
        return new $wb.data.ListStore({
            source:this.source(),
            model:this.model(),
            fields:this.opts.listFields
        });
    },
    treeStore:function() {
        if (this.opts.stores.tree)
            return this.opts.stores.tree.apply(this);
        return new $wb.data.TreeStore({
            model:this.model(),
            source:this.source(),
            idField:this.opts.idField,
            nameField:this.opts.nameField,
            parentField:this.opts.parentField
        });
    },
    tableStore:function() {
        if (this.opts.stores.table)
            return this.opts.stores.table.apply(this);
        return new $wb.data.TableStore({
            model:this.model(),
            source:this.source(),
            fields:this.opts.listFields
        });
    },
    model:function() {
        return this.opts.model
    },
    source:function() {
        return this.opts.source;
    },
    whenReady:function(cb) {
        if (!cb) return;
        this._readyListeners.push(cb);
        if (this._ready) {
            cb.apply(this);
        }
    },
    _setReady:function(ready) {
        if (ready != this._ready) {
            this._ready = ready;
            if (ready) {
                var self = this;
                for(var i = 0; i < this._readyListeners.length;i++) {
                    this._readyListeners[i].apply(this);
                }
            }
        }
    },
    enable:function(cb) {
        if (cb)
            this.whenReady(cb);
        this.source().load({},function() {
            this._setReady(true);
            this.source().startListening();
        }.bind(this));
        this.trigger('enable');
    },
    disable:function() {
        this.source().stopListening();
        this._setReady(false);
        this.trigger('disable');
    }
});