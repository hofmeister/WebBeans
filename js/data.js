/**
 * @fileOverview
 * All methods and classes related to data handling is in here
 * @author <a href="http://twitter.com/vonhofdk"/>Henrik Hofmeister</a>
 * @version 1.0
 */


$wb.data = {};

$wb.data.Model = $wb.Class('Model',{
    __extends:[$wb.core.Events,$wb.core.Utils],
    _defaults:{
        id:null,
        name:null,
        valueType:"string",
        shortName:null,
        defaultValue: null,
        validator:null,
        primary:false
    },
    _fields:{},
    _type:null,
    __construct:function(type,fields) {
        this.__super({});
        this._type = type;
        if (fields) {
            this.addFields(fields);
        }
    },
    getType:function() {
        return this._type;
    },
    addFields:function(fields) {
        var ids = [];
        for(var id in fields) {
            ids.push(id);
            this._fields[id] = $.extend({},this._defaults,fields[id]);
            this._fields[id].id = id;
            if (!this._fields[id].shortName)
                this._fields[id].shortName = this._fields[id].name;
        }
        this.trigger('added',[ids]);
    },
    addField:function(id,name,valueType,validator,defaultValue,shortName) {
        this._fields[id] = {
            id:id,
            name:name,
            valueType:valueType,
            shortName:shortName ? shortName : name,
            defaultValue: defaultValue ? defaultValue : null,
            validator:validator ? validator : null
        };
        this.trigger('added',[[id]]);
        return this._fields[id];
    },
    
    getField:function(id) {
        return this._fields[id];
    },
    getFields:function() {
        return this._fields;
    },
    create:function(data) {
        if (!data) data = {};
        var row = {};
        for(var id in this._fields) {
            var f = this._fields[id];
            row[id] = f.defaultValue;
        }
        var out = $.extend({},row,data);
        return out;
    },
    getKey:function(row) {
        var key = [];
        for(var id in this._fields) {
            var f = this._fields[id];
            if (f.primary) {
                key.push(row[id]);
            }
        }
        return key.join(",");
    },
    validate:function(row) {
        for(var id in row) {
            if (!this._fields[id])
                continue;
            var f = this._fields[id];
            var value = row[id];
            if (!value)
                value = f.defaultValue;
            if (f.validator) {
                if (!f.validator(value)) {
                    return false;
                }
            };
            if ($wb.utils.type(value) != f.valueType) {
                return false;
            }
        }
        return true;
    }
});

$wb.data.Service = $wb.Class('Service',{
    __extends:[$wb.core.Events,$wb.core.Utils],
    _autoSync:true,
    _adder:null,
    _remover:null,
    _updater:null,
    _getter:null,
    _loader:null,
    _listener:null,
    _connection:null,
    __construct:function(opts) {
        if (!opts) opts = {};
        if (typeof opts.autoSync != 'undefined')
            this._autoSync = opts.autoSync;
        if (opts.adder)
            this._adder = opts.adder;
        if (opts.remover)
            this._remover = opts.remover;
        if (opts.updater)
            this._updater = opts.updater;
        if (opts.getter)
            this._getter = opts.getter;
        if (opts.loader)
            this._loader = opts.loader;
        if (opts.listener)
            this._listener = opts.listener;
    },
    startListening:function() {
        this.stopListening();
        if (this._listener) {
            this._connection = this._listener.apply(this);
        }
    },
    stopListening:function() {
        if (this._connection) {
            this._connection.close();
            this._connection = null;
        }
    },
    get:function(id) {
        if (this._getter)
            this._getter.apply(this,[id]);
    },
    load:function(opts) {
        if (this._loader)
            this._loader.apply(this,[opts]);
    },
    update:function(rows) {
        if ($.type(rows) != 'array')
            rows = [rows];
        if (this._updater)
            this._updater.apply(this,[rows]);
    },
    add:function(rows) {
        if ($.type(rows) != 'array')
            rows = [rows];
        if (this._adder)
            this._adder.apply(this,[rows]);
    },
    remove:function(ids) {
        if ($.type(ids) != 'array')
            ids = [ids];
        if (this._remover)
            this._remover.apply(this,[ids]);
    }
});
$wb.data.JsonSocket = $wb.Class('JsonSocket',{
    __extends:[$wb.core.Events,$wb.core.Utils],
    _url:null,
    _ws:null,
    _opened:false,
    __construct:function(url) {
        this._url = new $wb.Url(url,$wb.location);
        this._url.protocol = 'ws';
        this._url.anchor = '';
        this._url.params = {};
    },
    open:function(callback) {
        if (this._opened) {
            if (callback)
                callback();
            return;
        }
        this._opened = true;
        this._ws = new WebSocket(this._url.toString());
        this._ws.onopen = function() {
            this.trigger('open');
            if (callback)
                callback();
        }.bind(this);
        
        this._ws.onmessage = this._onMessage.bind(this);
        this._ws.onclose = function() {
            this._opened = false;
            this.trigger('close');
        }.bind(this);
    },
    isOpened:function() {
        return this._opened;
    },
    _onMessage:function(evt) {
        var d = JSON.parse(evt.data);
        this.trigger('message',[d,evt]);
    },
    send:function(data) {
        var self = this;
        this.open(function() {
            self._ws.send(JSON.stringify(data));
        });
    }
});

$wb.data.JsonService = $wb.Class('JsonService',{
    __extends:[$wb.core.Events,$wb.core.Utils],
    opts:{},
    _socket:{},
    _socketInstances:{},
    __construct:function(opts) {
        if (!opts) opts = {};
        this.__super(opts);
        this.require(opts,'schema');
        this.opts = opts;
    },
    socket:function(name,type) {
        if (!type)
            type = $wb.data.JsonSocket;
        
        if (!this._socketInstances[name])
            this._socketInstances[name] = new type(this._socket[name].url);
        return this._socketInstances[name];
    },
    load:function() {
        var self = this;
        $.getJSON(this.opts.schema,function(data) {
            var baseUrl = new $wb.Url(data.url,self.opts.schema);
            if (data.sockets) {
                for(var socketName in data.sockets) {
                    var socket = data.sockets[socketName];
                    self._socket[socketName] = socket;
                }
            }
            self.baseUrl = baseUrl;
            for(var controllerName in data.methods) {
                var controller = data.methods[controllerName];
                self[controllerName] = {};
                for(var methodName in controller.methods) {
                    (function() {
                        var method = controller.methods[methodName][0];
                        self[controllerName][methodName] = function(args,callback) {
                            var url = baseUrl+method.url;
                            var data = null;
                            
                            //@TODO: Validate body against model and generate Model's from schema
                            var bodyType = null;
                        
                            if (typeof args == 'function') {
                                callback = args;
                                args = null;
                            }

                            if (method.args) {

                                if (method.args.length == 1 && method.args[0].transport == 'BODY') {
                                    data = args;
                                    bodyType = method.args[0].type;
                                } else {
                                    for(var i = 0; i < method.args.length;i++) {
                                        var arg = method.args[i];
                                        var value = args != null ? args[arg.name] : undefined;
                                        if (arg.required && (typeof value == "undefined")) {
                                            throw "Required argument missing: "+arg.name;
                                        }
                                    
                                        if (typeof value == "undefined")
                                            continue;

                                        switch(arg.transport) {
                                            case 'GET':
                                                url += (url.indexOf('?') > -1) ? "&" : "?";
                                                url += arg.name + "=" + encodeURIComponent(value);
                                                break;
                                            case 'BODY':
                                                data = value;
                                                bodyType = arg.type;
                                                break;
                                        }

                                        if (arg.type == 'enum' && arg['enum'].indexOf(value) == -1) {
                                            throw "Invalid value for enum argument: "+arg.name+" = "+value
                                            +"\nMust be one of "+arg['enum'].join(', ');
                                        }
                                    }
                                }
                            }
                        
                            if (data) {
                                data = JSON.stringify(data);
                            }

                            return $.ajax({
                                url:url,
                                type:method.method,
                                dataType:'json',
                                contentType:'application/json',
                                data:data,
                                success:function(out) {
                                    if (callback)
                                        callback(true,out);
                                },
                                error:function(out) {
                                    if (callback)
                                        callback(false);
                                }
                            });
                        };
                    })();
                }
            }
            self.trigger('ready');
        });
    }
});

$wb.data.Store = $wb.Class('Store',
    /**
     * @lends $wb.data.TreeStore.prototype
     * @augments $wb.data.Events
     * @augments $wb.core.Utils
     */
    {
        __extends:[$wb.core.Events,$wb.core.Utils],
        
        /**
         * The model instance - if any.
         * @private
         */
        _model:null,
        /**
         * The options
         * @private
         */
        opts:{},
        /**
         * @constructs
         * @param {Object} opts Options
         * @param {$wb.data.Model} [opts.model] Model for the data store. Usage is defined by subclasses
         */
        __construct:function(opts) {
            if (!opts) opts = {};
            this.__super(opts);
            if (opts && opts.model) {
                if (!$wb.utils.isA(opts.model, "Model"))
                    throw "'model' argument must be instance of Model";
                this._model = opts.model;
            }
            this.opts = opts;
        },
        getModel:function() {
            return this._model;
        }
    }
);

$wb.data.KeyValueStore = $wb.Class('KeyValueStore',{
    __extends:[$wb.data.Store],
    _data:null,
    __construct:function(opts) {
        this.__super(opts);
        if (this.model)
            this._data = this.model.create();
        else
            this._data = {};
    },
    put:function(key,value) {
        this._data[key] = value;
        this.trigger('change');
        this.trigger('put',[key]);
    },
    putAll:function(keyValue) {
        for(var key in keyValue) {
            this._data[key] = keyValue[key];
        }
        this.trigger('change');
        this.trigger('putAll',[keyValue]);
    },
    get:function(key) {
        return this._data[key];
    },
    remove:function(key) {
        delete this._data[key];
        this.trigger('change');
        this.trigger('remove',[key]);
    }
});

$wb.data.ListStore = $wb.Class('ListStore',{
    __extends:[$wb.data.Store],
    _filtered:new $wb.Array(),
    _dirty:false,
    _filters:new $wb.Array(),
    _sortFunction:null,
    _limit:0,
    _offset:0,
    _data:null,
    __construct:function(opts) {
        this.__super(opts);
        this._data = {
            rows:new $wb.Array(),
            total:0
        };
    },
    add:function(row) {
        this.addAll([row]);
    },
    addAll:function(rows) {
        for(var i = 0; i < rows.length;i++) {
            if (this._model)
                rows[i] = this._model.create(rows[i]);
            var found = false;
            if (this._model) {
                var key = this._model.getKey(rows[i]);
                var oldRow = this.getByKey(key);
                if (oldRow) {
                    $.extend(oldRow,rows[i]);
                    found = true;
                }
            }
            if (!found)
                this._data.rows.push(rows[i]);
        }
        
        if (rows.length > 0) {
            this._makeDirty();
            this.trigger('change');
            this.trigger('added',[rows]);
        }
    },
    update:function(row) {
        var i = this.indexOf(row);
        if (i < 0) 
            return;
        $.extend(this._data.rows.get(i),row);
        this.trigger('change');
        this.trigger('updated',[[row]]);
    },
    getByMethod:function(value,comparator) {
        var i = this.getIndexByMethod(value,comparator);
        if (i > -1)
            return this._data.rows.get(i);
        return null;
    },
    getIndexByMethod:function(value,comparator) {
        for(var i = 0; i < this._data.rows.length();i++) {
            var key = comparator(this._data.rows.get(i));
            if (key == value)
                return i;
        }
        return -1;
    },
    getByKey:function(key) {
        var i = this.getIndexByKey(key);
        if (i > -1)
            return this._data.rows.get(i);
        return null;
    },
    getIndexByKey:function(key) {
        if ($.type(key) == 'array') {
            key = key.join(',');
        }
        var i = this.getIndexByMethod(key,function(row) {
            return this.getModel().getKey(row);
        }.bind(this));
        return i;
    },
    indexOf:function(row) {
        var key = this.getModel().getKey(row);
        return this.getIndexByKey(key);
    },
    get:function(ix) {
        return this._data.rows.get(ix);
    },
    remove:function(ix) {
        this.removeAll([ix]);
    },
    removeAll:function(ixs) {
         for(var i = 0; i < ixs.length;i++) {
            var ix = ixs[i];
            if (this._model && $.type(ix) == 'object') {
                ix = this.indexOf(ix);
                if (ix > -1)
                    this._data.rows.remove(ix);
            } else {
                this._data.rows.remove(ix);
            }
        }
        
        this._makeDirty();
        this.trigger('change');
        this.trigger('remove',ixs);
    },
    addFilter:function(filterFunction) {
        this._filters.push(filterFunction);
        this._makeDirty();
        this.trigger('change');
    },
    removeFilter:function(filterFunction) {
        this._filters.removeValue(filterFunction);
        this._makeDirty();
        this.trigger('change');
    },
    clear:function() {
        this._data.rows.clear();
        this._clearFiltered();
    },
    find:function(fieldName,value) {
        return this._filtered.find(fieldName,value);
    },
    getRows:function() {
        this._processRows();
        return this._filtered;
    },
    setSort:function(sortFunction) {
        this._sortFunction = sortFunction;
        this._makeDirty();
        this.trigger('change');
    },
    setSortBy:function(fieldName,desc) {
        var adjust = desc ? -1 : 1;
        this.setSort(function(rowA,rowB) {
            var valA = $wb.utils.GetValue(rowA,fieldName);
            var valB = $wb.utils.GetValue(rowB,fieldName);
            if (valA > valB)
                return 1*adjust;
            if (valA < valB)
                return -1*adjust;
            return 0;
        });
    },
    setOffset:function(offset,limit) {
        this._offset = offset;
        if (limit)
            this._limit = limit;
        this._makeDirty();
        this.trigger('change');
    },
    
    _makeDirty:function() {
        if (!this._dirty) {
            this._dirty = true;
            this.trigger("dirty");
        }
    },
    _makeClean:function() {
        if (this._dirty) {
            this._dirty = false;
            this.trigger("clean");
        }
    },
    _clearFiltered:function() {
        this._filtered.clear();
    },
    _processRows:function() {
        if (!this._dirty) 
            return;
        this._clearFiltered();
        this._sort();
        var rowI = 0;
        var rows = this._data.rows.toArray();
        for(var i = 0; i < rows.length;i++ ) {
            var row = this._data.rows.get(i);
            if (this._isValidRow(row)) {
                if (rowI < this._offset) continue;
                if (this._limit > 0 && rowI >= this._limit)  break;
                this._filtered.push(row);
                rowI++;
            }
        }
        this._makeClean();
        
    },
    _sort:function() {
        if (this._sortFunction)
            this._data.rows.sort(this._sortFunction);
        
    },
    _isValidRow:function(row) {
        var filters = this._filters.toArray();
        for(var fi = 0; fi < filters.length;fi++) {
            var f = this._filters.get(fi);
            if (!f(row))
                return false;
        }
        return true;
    }
});

$wb.data.TableStore = $wb.Class('TableStore',{
    __extends:[$wb.data.ListStore],
    _cols:[],
    __construct:function(opts) {
        this.__super(opts);
        if (this._model) {
            
            var fields = this._model.getFields();
            
            for(var id in fields) {
                var f = fields[id];
                if (!f.hidden)
                    this._addColumn(f.id,f.shortName);
            }
            var self = this;
            this._model.bind('added',function(id) {
                var f = self._model.getField(id);
                self._addColumn(f.id,f.shortName);
            });
        }
    },
    setColumns:function() {
        this._clearColumns();
        this._addColumns(arguments);
        this.trigger('columns-changed');
        this.trigger('change');
        return this;
    },
    getColumns:function() {
        return this._cols;
    },
    clearColumns:function() {
        this._clearColumns();
        this.trigger('columns-changed');
        this.trigger('change');
        return this;
        
    },
    addColumn:function(id,name) {
        this._addColumn(id,name);
        this.trigger('columns-changed');
        this.trigger('change');
        return this;
    },
    addColumns:function(columns) {
        this._addColumns(columns);
        this.trigger('columns-changed');
        this.trigger('change');
        return this;
    },
    _clearColumns:function() {
        this._cols = [];
        
    },
    _addColumn:function(id,name) {
        if (!name)
            name = id;
        this._cols.push({id:id,name:name});
    },
    _addColumns:function(columns) {
        
        for(var i = 0;i < columns.length;i++) {
            var col = columns[i];
            if ($.type(col) == 'string')
                col = {id:col};
            
            
            if (!col || !col.id) continue;
            if (!col.name)
                col.name = col.id;
            this._cols.push(col);
        }
        
    }
});


$wb.data.TreeStore = $wb.Class('TreeStore',
    /**
     * @lends $wb.data.TreeStore.prototype
     * @augments $wb.data.Store
     */
    {
        __extends:[$wb.data.Store],
        _nodes:{},
        _children:{},
        _roots:{},
        /**
        * @constructs
        * @param {Object} opts Options
        * @param {String} [opts.idField="id"] field that indicates which field contains the primary id
        * @param {String} [opts.parentField="parentId"] field that indicates which parent a node belongs to
        * @param {String} [opts.nameField="name"] field that indicates what a nodes name is
        */
        __construct:function(opts) {
            opts = $.extend({
                idField:"id",
                parentField:"parentId",
                nameField:"name"
            },opts)
            this.__super(opts);
        },
        /**
         * Get parent id from row
         * @private
         */
        _getParentId:function(row) {
            var out =  $wb.utils.GetValue(row, this.opts.parentField);
            if (!out)
                out = null;
            return out;
        },
        /**
         * Get id from row
         * @private
         */
        _getId:function(row) {
            return $wb.utils.GetValue(row, this.opts.idField);
        },
        /**
         * Get name from row
         * @private
         */
        _getName:function(row) {
            return $wb.utils.GetValue(row, this.opts.nameField);
        },
        /**
         * Add row to store
         * @param {Object|Object[]} row(s)
         * @returns {$wb.data.TreeStore} itself
         */
        add:function(row) {
            this.notEmpty(row,_("row is required"));
            if ($.type(row) != 'array') {
                row = [row];
            }
            for(var i = 0; i < row.length;i++) {
                this._add(row[i]);
            }
            this.trigger('add',[row]);
            return this;
        },
        /**
         * Remove row from store
         * @param {Object|Object[]} row(s)
         * @returns {$wb.data.TreeStore} itself
         */
        remove:function(row) {
            this.notEmpty(row,_("row is required"));
            if ($.type(row) != 'array') {
                row = [row];
            }
            for(var i = 0; i < row.length;i++) {
                this._remove(row[i]);
            }
            this.trigger('remove',[row]);
            return this;
        },
        /**
         * Update row in store
         * @param {Object|Object[]} row(s)
         * @returns {$wb.data.TreeStore} itself
         */
        update:function(row) {
            this.notEmpty(row,_("row is required"));
            if ($.type(row) != 'array') {
                row = [row];
            }
            for(var i = 0; i < row.length;i++) {
                this._update(row[i]);
            }
            this.trigger('update',[row]);
            return this;
        },
        /**
         * Get tree structure
         * @returns {Object} tree structure
         */
        getTree:function() {
            var roots = [];
            for(var id in this._roots) {
                var root = this._roots[id];
                roots.push(root);
                root.children = this.getSubTree(id);
            }
            if (roots.length == 0) {
                return null;
            }
            if (roots.length == 1) {
                return roots[0];
            }
            return {
                name:"root",
                id:"root",
                parentId:null,
                children:roots
            };
        },
        /**
         * Get sub tree structure
         * @returns {Object} tree structure
         */
        getSubTree:function(id) {
            if (!this._children[id])
                return null;
            
            var out = [];
            for(var id in this._children[id]) {
                var node = this._nodes[id];
                out.push(node);
                node.children = this.getSubTree(id);
            }
            return out;
        },
        
        /**
         * Make tree entry from row
         * @private
         * @param {Object} row
         * @returns {Object} entry
         */
        _makeEntry:function(row) {
            var parentId = this._getParentId(row);
            var id = this._getId(row);
            var name = this._getName(row);
            return {id:id,parentId:parentId,row:row,name:name};
        },
        /**
         * Add row to store
         * @private
         * @param {Object} row
         * @returns {$wb.data.TreeStore} itself
         */
        _add:function(row) {
            var parentId = this._getParentId(row);
            var id = this._getId(row);
            
            if (!id)
                throw new $wb.Error(_("Missing id value on tree node"),row);
            
            var entry = this._makeEntry(row);
            
            if (this._nodes[id])
                throw new $wb.Error(_("Row already exists in store: %s",id),row);
            
            this._nodes[id] = entry;
            
            if (parentId) {
                if (!this._children[parentId])
                    this._children[parentId] = {};
                this._children[parentId][id] = this._nodes[id];
            } else {
                this._roots[id] = this._nodes[id];
            }
            return this;
        },
        /**
         * Remove row from store
         * @private
         * @param {Object} row
         * @returns {$wb.data.TreeStore} itself
         */
        _remove:function(row) {
            var parentId = this._getParentId(row);
            var id = this._getId(row);
            
            if (!id)
                throw new $wb.Error(_("Missing id value on tree node"),row);
            
            delete this._nodes[id];
            delete this._roots[id];
            
            if (parentId && this._children[parentId]) {
                var children = this._children[parentId];
                for(var id in children) {
                    this.remove(children[id].row);
                }
            }
            return this;
        },
        /**
         * Update row in store
         * @private
         * @param {Object} row
         * @returns {$wb.data.TreeStore} itself
         */
        _update:function(row) {
            var parentId = this._getParentId(row);
            var id = this._getId(row);
            
            if (!id)
                throw new $wb.Error(_("Missing id value on tree node"),row);
            
            var entry = this._makeEntry(row);
            
            if (!this._nodes[id])
                throw new $wb.Error(_("Row not found in store: %s",id),row);
            
            this._nodes[id] = $.extend(true,this._nodes[id],entry);
            delete this._roots[id];
            
            if (parentId) {
                if (!this._children[parentId])
                    this._children[parentId] = {};
                this._children[parentId][id] = this._nodes[id];
            } else {
                this._roots[id] = this._nodes[id];
            }
            return this;
        }
    }
);