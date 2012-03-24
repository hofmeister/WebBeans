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
        for(var id in fields) {
            this._fields[id] = $.extend({},this._defaults,fields[id]);
            this._fields[id].id = id;
            if (!this._fields[id].shortName)
                this._fields[id].shortName = this._fields[id].name;
        }
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
        this.trigger('added',[id]);
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

$wb.data.Store = $wb.Class('Store',{
    __extends:[$wb.core.Events,$wb.core.Utils],
    _data:null,
    _model:null,
    __construct:function(opts) {
        this.__super(opts);
        if (opts && opts.model) {
            if (!$wb.utils.isA(opts.model, "Model"))
                throw "'model' argument must be instance of Model";
            this._model = opts.model;
        }            
    }
});

$wb.data.KeyValueStore = $wb.Class('KeyValueStore',{
    __extends:[$wb.data.Store],
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
        var self = this;
        for(var i = 0; i < rows.length;i++) {
            if (this._model)
                rows[i] = this._model.create(rows[i]);
            var found = false;
            if (this._model) {
                var key = this._model.getKey(rows[i]);
                var oldRow = this.getByMethod(key,function(row) {
                    return self._model.getKey(row);
                });

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
    get:function(ix) {
        return this._data.rows.get(ix);
    },
    remove:function(ix) {
        this.removeAll([ix]);
    },
    removeAll:function(ixs) {
        var self = this;
        for(var i = 0; i < ixs.length;i++) {
            var ix = ixs[i];
            if (this._model) {
                ix = this.getIndexByMethod(""+ix,function(row) {
                    return self._model.getKey(row);
                });
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