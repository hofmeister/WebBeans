var $wb = {};
(function() {
    $wb = {
        Class: function(name,opts) {
            var clz = function() {
                for(var key in clz.prototype) {
                    var val = clz.prototype[key];
                    if ($.type(val) == 'function')
                        continue;
                    if ($.type(val) == 'array')
                        val = $.extend(true,[],val);
                    if ($.type(val) == 'object')
                        val = $.extend(true,{},val);
                    this[key] = val;
                }

                this.__callConstructor.apply(this,arguments);
            };

            if (!opts.__construct)
                opts.__construct = function() {};

            var parents = new $wb.Set();
            if (opts.__extends) {
                for(var i in opts.__extends) {
                    var parent = opts.__extends[i];
                    $.extend(true,clz.prototype,parent.prototype);
                    parents.add(parent.prototype.constructor);
                }
            }


            delete opts.__extends;
            delete clz.prototype.__extends;

            $.extend(true,clz.prototype,opts);
            clz.prototype._clz = name;
            clz.__extends = parents.toArray();

            clz.prototype.__callConstructor = function() {

                this.__super = clz.__super;
                clz.prototype.__construct.apply(this,arguments);
                delete this.__super;
            };

            clz.__super = function() {

                for(var i in clz.__extends) {
                    var parent = clz.__extends[i];
                    //console.log(clz.prototype._clz + " calls: "+parent.prototype._clz);
                    parent.prototype.__callConstructor.apply(this,arguments);
                }
            };

            return clz;
        }
    };
    $wb.Set = function() {
        this._arr = [];
    };
    $wb.Set.prototype = {
        _clz:"Set",
        add:function(elm) {
            if (this._arr.indexOf(elm) == -1)
                this._arr.push(elm);
        },
        addAll:function(elms) {
            for(var i in elms) {
                this.add(elms[i]);
            }
        },
        get:function(i) {
            return this._arr[i];
        },
        toArray:function() {
            return $.extend([],this._arr);
        }
    };


    $wb.core = {};
    $wb.core.Events = $wb.Class('Events',{
        _bindings:{},
        trigger:function(evt,args) {
            if (this._bindings[evt]) {
                for(var i in this._bindings[evt]) {
                    var handler = this._bindings[evt][i];
                    handler.apply(this,args);
                }
            }
        },
        bind:function(evt,handler) {
            if (!this._bindings[evt])
                this._bindings[evt] = [];
            this._bindings[evt].push(handler);
        }
    });
    $wb.core.Utils = $wb.Class('Utils',{

        require:function(obj) {
            for(var i = 1; i < arguments.length;i++) {
                var arg = arguments[i];
                if (!obj[arg])
                    throw "Missing argument: "+this._clz+": "+arg;
            }
        }
    });
})()
