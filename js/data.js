$wb.data = {};
$wb.data.Store = $wb.Class('Store',{
    __extends:[$wb.core.Events,$wb.core.Utils],
    
    _data:null,
    __construct:function(opts) {
        this.__super(opts);
    }
});

$wb.data.KeyValueStore = $wb.Class('KeyValueStore',{
    __extends:[$wb.data.Store],
    __construct:function(opts) {
        this.__super(opts);
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
        this._data.rows.push(row);
        this._makeDirty();
        this.trigger('change');
        this.trigger('add',[row]);
    },
    addAll:function(rows) {
        for(var i in rows) {
            this._data.rows.push(rows[i]);
        }
        if (rows.length > 0) {
            this._makeDirty();
            this.trigger('change');
            this.trigger('addAll',[rows]);
        }
    },
    get:function(ix) {
        return this._data.rows[ix];
    },
    remove:function(ix) {
        delete this._data.rows.remove(ix);
        this._makeDirty();
        this.trigger('change');
        this.trigger('remove',[ix]);
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
        for(var i in this._data.rows.toArray()) {
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
        if (this._sort)
            this._data.rows.sort(this._sortFunction);
        
    },
    _isValidRow:function(row) {
        for(var fi in this._filters.toArray()) {
            var f = this._filters.get(fi);
            if (!f(row))
                return false;
        }
        return true;
    }
});