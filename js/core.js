var $wb = null;
(function() {
    $wb = function(elm) {
        if (typeof elm == 'function') {
            return elm();
        } else {
            return $(elm).widget();
        }
    };
    $wb.MESSAGE_HANDLER = "MESSAGE_HANDLER";
    $wb.DEBUG_ENABLE = "DEBUG_ENABLE";
    $wb.Class = function(name,opts) {
        var clz = function() {
            if (!this.__callConstructor) {
                throw "You must instantiate this prototype using the new operator: "+clz.prototype._clz;
            }
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
    };
    
    
    
    $wb.Set = function() {
        this._arr = [];
    };
    $wb.Set.prototype = {
        get length() {
            return this.arr.length;
        },
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
    
    $wb.Array = function(arr) {
        this._arr = arr ? arr : [];
    };
    $wb.Array.prototype = {
        _clz:"Array",
        push:function(elm) {
            this._arr.push(elm);
        },
        pushAll:function(elms) {
            for(var i in elms) {
                this.add(elms[i]);
            }
        },
        get:function(i) {
            return this._arr[i];
        },
        remove:function(i) {
            return this._arr.splice(i,1);
        },
        removeValue:function(value) {
            var ix = this._arr.indexOf(value);
            if (ix > -1)
                this.remove(ix);
        },
        length:function() {
            return this._arr.length;
        },
        sort:function(compareFunction) {
            this._arr.sort(compareFunction);
        },
        clear:function() {
            for(var i = (this._arr.length-1); i > -1;i--) {
                this.remove(i);
            }
        },
        find:function(path,value) {
            var out = [];
            this.each(function(elm) {
                if ($wb.utils.GetValue(elm,path) == value) {
                    out.push(elm);
                }
            });
            return out;
        },
        each:function(cb) {
            for(var i in this._arr) {
                cb.apply(this,[this._arr[i]]);
            }
        },
        toArray:function() {
            return this._arr;
        }
    };
    
    // parseUri 1.2.2
    // (c) Steven Levithan <stevenlevithan.com>
    // MIT License
    $wb.Url = $wb.Class('Url',{
        opts:{
                strictMode: false,
                key: ["source","protocol","authority","userInfo","username","password","host","port","relative","path","directory","file","query","anchor"],
                q:   {
                        name:   "params",
                        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
                },
                parser: {
                        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
                }
        },
        anchor:"",
        authority:"",
        directory:"",
        file:"",
        host:"",
        password:"",
        path:"/",
        port:80,
        protocol:"http",
        query:"",
        params:{},
        relative:"",
        url:"",
        username:"",
        userInfo:"",
        __construct:function(arg) {
            if (typeof arg == 'string') {
                this.fromString(arg);
            } else {
                this.fromObject(arg);
            }
        },
        get:function(key) {
            if (!this.params)
                return null;
            return this.params[key];
        },
        getHost:function() {
            return this.host;
        },
        getPort:function() {
            return this.port;
        },
        getPath:function() {
            return this.path;
        },
        getAnchor:function() {
            return this.anchor;
        },
        fromObject:function(obj) {
            for(var i = 0;i < this.opts.key.length;i++) {
                var key = this.opts.key[i];
                this[key] = obj[key];
            }
            if (obj.params) {
                for(var key in obj.params) {
                    this.params[key] = obj.params[key];
                }
            }
        
        },
        fromString:function(str) {
                var	o   = this.opts,
                        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
                        uri = this,
                        i   = 14;

                while (i--) uri[o.key[i]] = m[i] || "";

                uri[o.q.name] = {};
                uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
                        if ($1) uri[o.q.name][$1] = $2;
                });
                if (uri.port)
                    uri.port = parseInt(uri.port);
        },
        toString:function() {
            var out = "";
            if (this.host) {
                out += this.protocol+"://";
                if (this.username) {
                    out += this.username;
                    if (this.password) {
                        out += ":"+this.password;
                    }
                    out += "@";
                }
                out += this.host;
                
                var defPort = $wb.Url.protocols[this.protocol];
                if (defPort && this.port && this.port != defPort) {
                    out += ":"+this.port;
                }
            }
            
            if (!this.path)
                this.path = "/";
            out += this.path;
            var first = true;
            for(var key in this.params) {
                if (first) {
                    first = false;
                    out += "?";
                } else {
                    out += "&";
                }
                out += key+"="+encodeURIComponent(this.params[key]);
            }
            if (this.anchor)
                out += "#"+this.anchor;
            return out;
        }
    });
    $wb.Url.protocols = {
        'http':80,
        'https':443,
        'ftp':21,
    }
    
    $wb.__defineGetter__("location",function() {
        if (!this._location) {
            this._location = new $wb.Url(top.location.href);
        }
        return this._location;
    });
    
    $wb.core = {};
    
    $wb.core.Registry = $wb.Class('Registry',{
        _data:{},
        get:function(key,defaultValue) {
            var out = this._data[key.toLowerCase()];
            if (!out)
                return defaultValue;
            return out;
        },
        has:function(key) {
            return typeof this._data[key.toLowerCase()] != 'undefined';
        },
        register:function(key,value) {
            this._data[key.toLowerCase()] = value;
        },
        unregister:function(key) {
            delete this._data[key.toLowerCase()];
        }
    });
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
                if (typeof obj[arg] == 'undefined')
                    throw "Missing argument: "+this._clz+": "+arg;
            }
        }
    });
    
    //Init global registry
    $wb.registry = new $wb.core.Registry();
    
    //Messaging
    $wb.debug = function(msg,source) {
        if ($wb.registry.get($wb.DEBUG_ENABLE,false)) {
            console.log(msg);
        }
        
    };
    
    $wb.error = function(msg,source) {
        if ($wb.registry.has($wb.MESSAGE_HANDLER)) {
            $wb.registry.get($wb.MESSAGE_HANDLER).error(msg);
        }
        $wb.debug(msg,source);
    };
    $wb.message = function(msg,source) {
        if ($wb.registry.has($wb.MESSAGE_HANDLER)) {
            $wb.registry.get($wb.MESSAGE_HANDLER).message(msg,source);
        }
        $wb.debug(msg,source);
    };
})()


var using = function(pkg,cb) {
    if (window.__using)
        throw "Attempted to use when using()";
    window.__using = true;
    var old = {};
    for(var key in pkg) {
        old[key] = window[key] ? window[key] : null;
        window[key] = pkg[key];
    }
    cb();
    
    for(var key in old) {
        if (!old[key])
            delete window[key];
        else
            window[key] = old[key];
    }
    window.__using = false;
}
var require = function(path,cb) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = path;
    script.async = true;
    script.onload = function() {
        cb();
        $(script).detach();
    };
    document.getElementsByTagName('body')[0].appendChild(script);
}