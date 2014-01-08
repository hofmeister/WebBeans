//@module core @prio 99
/**
 * @fileOverview
 * <p>
 * This is the webbeans bootstrap file. You should only include this file directly on the page and use "require" to load
 * additional modules and js files.
 * <hr/>
 * </p>
 * <p><b>$wbConfig</b> is read when including this file. </p>
 * 
 * <p>
 * it has the following options:<br/>
 * 
 * <br/><b>jQuery:</b> Path to a jquery js file - defaults to google CDN. Required.
 * <br/><b>skin:</b> Name of the skin (or path to costum CSS file). Defaults to "default" - set to null to skip skin handling
 * <br/><b>base:</b> Url that points to the base of webbeans. Required.
 * <br/><b>noCSS:</b> Boolean - set to true to skip loading of all webbeans css files. Defaults to false. Optional.
 * </p>
 * @author <a href="http://twitter.com/vonhofdk"/>Henrik Hofmeister</a>
 * @version 1.0
 */


if (typeof $wbConfig === 'undefined') {
    throw "$wbConfig not initialized. You must initialize $wbConfig within the <head> tag and provide at least the 'base' property. The core.js file should be included in the bottom of the <body> tag";
}

//Set default jquery path
if (!$wbConfig.jQuery) {
    $wbConfig.jQuery = 'https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min';
}

//Set default skin
if (typeof $wbConfig.skin === 'undefined') {
    $wbConfig.skin = 'default';
}

if (typeof $wbConfig.base === 'undefined') {
    throw "Remember to provide $wbConfig.base with a valid url pointing to a webbeans CDN";
}

/**
    @description Loads one or more scripts/moduyle into the current document. Deletes the script tag after it is loaded.
    @param {String|String[]} path One or more paths to the scripts. 
                                If a string equals /^[A-Z]+$/i it is assumed to be a webbeans module. 
                                If a string equals "*" every std. module of webbeans is included
    @param {Function} [cb] Optional callback to call when all scripts has been loaded
    @param {Boolean} [async=false] Use async loading (load all at once)
    @type Void
*/
var require = function(path,cb,async) {
    var i,paths = null;
    if (!async) async = false;
    
    if (typeof path == "string")
        paths = [path];
    else
        paths = path;
    
    var requireAllIx = -1;
    for(i = 0; i < paths.length;i++) {
        path = paths[i];
        if (path == '*') {
            paths.splice(i,1);
            requireAllIx = i;
        }
    }
    if (requireAllIx > -1) {
        paths.splice(requireAllIx,0,
                "js/3rdparty/jquery/jquery-ui","js/3rdparty/jquery/jquery-mousewheel","js/lib/utils","js/lib/localization","js/lib/data","js/lib/template","js/lib/widget","js/lib/form",'js/lib/widget-ext','js/lib/module','js/lib/draw','js/lib/geo');
    }
    
    var oks = new Array(paths.length);
    
    var check = function() {
        for(var i = 0; i < oks.length;i++) {
            if (!oks[i])
                return;
        }
        if (cb)
            cb();
    };
    
    var build = function(i,path,buildCallback) {
        if (!path) return;
        if (/^[A-Z\-]+$/i.test(path)) {
            //WebBeans module
            if (typeof $wbConfig.base == 'undefined')
                throw "Remember to provide $wbConfig.base with a valid url pointing to a webbeans CDN";
            path = $wbConfig.base+"js/"+path+".js";
        }
        
        var container = document.getElementsByTagName("head")[0] || document.documentElement;
            
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = path + ".js";
        
        var onload = function() {
            oks[i] = true;
            $(script).detach();
            //console.log("Loaded:"+path);
            check();
            if (buildCallback)
                buildCallback();
        };
        if(document.all){
            script.onreadystatechange = function() {
                if (!script.readyState 
                    || script.readyState == 'loaded' 
                    || script.readyState == 'complete') {
                    script.onload = script.onreadystatechange = null;
                    onload();
                }
            }
        } else {
            script.async = async;
            script.onload = onload
        }
        
        container.insertBefore(script,container.firstChild);
    };
    
    if (async) {
        for(i = 0; i < paths.length;i++) {
            path = paths[i];
            build(i,path);
        }
    } else {
        var ix = 0;
        var recurse = function() {
            if (paths.length <= ix)
                return;
            var oldIx = ix;
            var path = paths[ix];
            ix++;
            build(oldIx,path,recurse);
        };
        recurse();
    }   
};
/**
    @description Loads a single CSS file into play.
    @param {String|String[]} path Path to the CSS file
                                If a string equals /^[A-Z]+$/i it is assumed to be a built-in webbeans stylesheet. 
    @type Void
*/
var loadCSS = function(path) {
    if (/^[A-Z]+$/i.test(path)) {
        //WebBeans stylesheet
        if (typeof $wbConfig.base == 'undefined')
            throw "Remember to provide $wbConfig.base with a valid url pointing to a webbeans CDN";
        path = $wbConfig.base+"style/"+path+".css";
    }
    
    var link = document.createElement('link');
    link.type = 'text/css';
    link.href = path;
    link.rel = "stylesheet";
    
    document.getElementsByTagName('head')[0].appendChild(link);
};

if (!$wbConfig.noCSS) {
    //Load the base webbeans css
    loadCSS("webbeans");
    //loadCSS($wbConfig.base+"style/font-awesome.css");
    loadCSS($wbConfig.base+"style/jquery-ui.css");

    if ($wbConfig.skin) {
        //Load the skin
        loadCSS($wbConfig.skin);
    }
}
(function() {
    var loader = function() {



        /**
        * @description Short for $(elm).widget();
        * @Param {String|DOMNode} elm The element - same as the argument for the jQuery function ($)
        * @namespace the main namespace in webbeans
        */
        $wb = function(elm) {
            if (typeof elm == 'function') {
                return elm();
            } else {
                if (typeof elm == 'string' && elm.indexOf('<') == 0) {
                    //Html
                    return new $wb.ui.Html(elm);
                }
                jQueryElm = $(elm);
                return jQueryElm.widget();
            }
        };
        /**
        * @description Convert and splice arguments objects into arrays
        */
        var getArguments = function(args,num) {
            var out = [];
            for(var i = num;i < args.length;i++) {
            out.push(args[i]); 
            }
            return out;
        };

        /**
        * @constant message handlers handles $wb.message and $wb.error
        */
        $wb.MESSAGE_HANDLER = "MESSAGE_HANDLER";

        /**
        * @constant enable debugging (affects $wb.debug)
        */
        $wb.DEBUG_ENABLE = "DEBUG_ENABLE";

        /**
        * @description Function for creating simulated classes with support for multiple inheritance and calling overriden methods.
        * Can be used stand alone - only dependency is $wb.Set
        * 
        * @param {String} name The name of the class. This will be the name of the constructor as well.
        * @param {Object} opts The fields and methods for the class
        * @param {Class[]} [opts.__extends] Extend these classes. Notice that order matters and last wins in conflicts.
        * @param {Function} [opts.__construct] The constructor of the class
        * @Type $wb.Class
        * @example
        * var MySuperClass = $wb.Class("MySuperClass",{
        *      text:null,
        *      __construct:function(text) {
        *          this.text = text;
        *      }
        *      emit:function() {
        *          console.log(this.text);
        *      }
        * });
        * var MySubClass = $wb.Class("MySubClass",{
        *      __extends:[MySuperClass],
        *      __construct:function(text) {
        *          this.__super(text+ "world");
        *      }
        * });
        * 
        * var instance = new MySubClass("hello");
        * instance.emit(); // Emits hello world in the console.
        */
        $wb.Object = null;
        $wb.Class = function (name,opts) {
            /**
            * @description Base class
            * This may need to change because of the use of Function. This is the only way to give the constructor a proper
            * name (afaik) - if not all of them would be "clz".
            * @class $wb.Class
            * @constructor 
            * @function
            */
            var clz = new Function("return function "+name+"() { "+
                //Check that function gets called correctly
                "   if (!(this instanceof arguments.callee)) throw new $wb.Error('"+name+" is a constructor',arguments.callee);"+
                //First - grab all fields from the prototype and add as actual fields on "this"
                "    if (arguments[0] == '__inheritance__') return; "+
                "    var clz = this.constructor; "+
                "    for(var key in clz.prototype) {"+
                "        var val = clz.prototype[key];"+
                "        if ($.type(val) == 'function')"+
                "            continue;"+
                "        if ($.type(val) == 'array') {"+
                "            val = $.extend(true,[],val);"+
                "        } else if (val instanceof $wb.Object) {"+
                "            val = val.clone();"+
                "        } else if ($.type(val) == 'object') {"+
                "            val = $.extend(true,{},val);"+
                "        } "+
                "        this[key] = val;"+
                "    }"+



                    //Call the constructor - this method is actually not the defined constructor but a placeholder. 
                    //See further down
                "    this.__initArgs = arguments;"+
                "    this.__construct.apply(this,arguments);"+
                "};")();


            //Make sure we have a constructor
            if (!opts.__construct)
                opts.__construct = function() {};
            
            
            //Holds the arguments passed to the constructor - used for cloning
            opts.__initArgs = [];

            //Compile a list of unique parent classes    
            var parents = [];

            var defaults = {};
            if ((!opts.__extends || opts.__extends.length == 0) && $wb.Object) {
                opts.__extends = [$wb.Object];
            }
            if (opts.__extends) {
                var firstExtend = opts.__extends[0];
                if (firstExtend)
                    clz.prototype = new firstExtend('__inheritance__');

                for(var i = 0; i < opts.__extends.length;i++) {
                    var parent = opts.__extends[i];
                    //Extend the prototype with all inherited prototypes
                    if (!parent || !parent.prototype) {
                        throw _("Non-existing class added as parent to %s",name);
                    }
                    $.extend(true,clz.prototype,parent.prototype);

                    //Add to set
                    parents.push(parent.prototype);
                }
            }

            clz.__defaults = opts.__defaults;
            opts.__defaults = null;

            clz.prototype.constructor = clz;

            //Clean up
            delete opts.__extends;

            delete clz.prototype.__extends;

            //Sets the super context and calls method. 
            var call = function(clzContext,methodName,func,args) {
                var oldSuper = this.__super;
                this.__super = function () {
                    return clzContext.__super.apply(this,[methodName,arguments]);
                };
                var out =  func.apply(this,args);
                if (!oldSuper)
                    delete this.__super;
                else
                    this.__super = oldSuper;
                return out;
            };

            //Final methods - cannot be overridden.
            var fixed = {
                /**
                *@private
                * @description Class name
                * @memberOf $wb.Class.prototype
                */
                _clz: name,

                /**
                * @description Wrapper used to call all member methods (Is what allows the __super() calls)
                * @private
                * @memberOf $wb.Class.prototype
                */
                __callMethod: function(name,args) {
                    if (this && this.__deleted) {
                        throw new $wb.Error('Attempted to call method on deleted object: '+name+"()");
                    }
                
                    var m = clz.methods[name];
                    if (!m) {
                        //Check if a superclass has it
                        var parentMethods = clz.__getParentMethods(name);
                        if (parentMethods && parentMethods.length > 0) {
                            m = parentMethods[0].method;
                        }
                    }

                    if (!m)
                        throw "Method not found: "+clz.prototype._clz+"::"+name;

                    return call.apply(this,[clz,name,m,args]);
                }

            };
            //
            //Methods contain the methods that are defined in *this* class
            //Note that they are placed on the constructor
            clz.methods = {};
            for(var j in opts) {
                (function() {
                    var key = j;
                    var val = opts[key];
                    if ((typeof val == 'function')) {
                        //Add the method to the class method map
                        clz.methods[key] = val;
                        //And add a place holder to the prototype that uses _callMethod.
                        //Call method enabled you to call __super() and execute overridden methods
                        opts[key] = function() {
                            return this.__callMethod(key,arguments);
                        };
                    }
                }());
            }
            //Extend the prototype with opts and fixed
            $.extend(true,clz.prototype,opts,fixed);
            


            /**
            * @description Allows to override the defaults set by the definition
            * @static
            * @memberOf $wb.Object
            */
            clz.setDefault = function(name,value) {
                if (!clz.__defaults) {
                    clz.__defaults = {};
                }
                clz.__defaults[name] = value;
            };
            clz.setDefaults = function(defaults) {
                clz.__defaults = defaults;
            };

            clz.getDefaults = clz.prototype.getDefaults = function(opts) {
                var defaults = {};
                if (!opts || !opts.__defaultInited) {
                    for(var i = 0 ; i < clz.__extends.length;i++) {
                        var parent = clz.__extends[i];
                        
                        defaults = $.extend(defaults,parent.constructor.__defaults);
                        defaults = parent.getDefaults(defaults);
                    }
                }

                return $.extend(defaults,clz.__defaults,opts,{__defaultInited:true});
            }.bind(clz);

            clz.getDefault = clz.prototype.getDefault = function(name) {
                var defaults = clz.getDefaults();

                if (typeof defaults[name] == 'undefined')
                    return null;
                return defaults[name];
            }.bind(clz);

            clz.prototype.clone = function() {
                var func = new Function("return function "+this._clz+"() {}")();
                func.prototype = clz.prototype;
                var out = new func();
                clz.apply(out,this.__initArgs);

                return out;
            };
            /**
             * Mark this object for deletion in next cycle
             */
            clz.prototype.__deleteLater = function() {
                if (this.__deleted) return;
                var self = this;
                setTimeout(function() {
                    //Release all properties (If they are referenced elsewhere - they won't be.)
                    for(var prop in self) {
                        delete self[prop];
                    }
                    self.__deleted = true;
                },0);
            };
            clz.prototype.__isDeleted = function() {
                return typeof this.__deleted != 'undefined' && this.__deleted;
            };
            

            //Extends contains a unique array of all directly inherited classes (Note: NOT entire hierarchy)
            clz.__extends = parents.unique();

            /**
            * @description The super method is a class specific method that is used to call overridden methods.
            * It is injected into the "this" scope whenever you call a method (through the placeholder __callMethod)
            * @memberOf $wb.Object
            */
            clz.__super = function(name,args) {
                var ms = clz.__getParentMethods(name);
                if (ms && ms.length > 0) {
                    var realOut = undefined;
                    for(var i = 0; i < ms.length;i++) {
                        var m = ms[i];
                        var out = call.apply(this,[m.type.constructor,name,m.method,args]);
                        if (typeof out != 'undefined') {
                            realOut = out;
                        }
                    }
                    return realOut;
                }
                throw "No parents had method "+name;
            };
            /**
            * @description Used internally to get the closest parent method named "name"
            * @memberOf $wb.Class
            * @static
            */
            clz.__getParentMethods = function(name) {
                var list = [];
                var out = [];
                for(var i = 0; i < clz.__extends.length;i++) {
                    
                    var parent = clz.__extends[i];

                    list.push(parent._clz);
                    
                    var m = parent.constructor.methods[name];
                    if (m) {
                        out.push({type:parent,method:m});
                    } else {
                        var ms = parent.constructor.__getParentMethods(name);

                        if (ms) {
                            out = out.concat(ms);
                        }
                    }
                }
                return out;
            };


            return clz;
        };

        $wb.Object = $wb.Class('Object',{
            __defaults:{}
        });


        //Maybe extend Array instead
        /**
        * @description An array wrapper
        * @constructor
        */
        $wb.Array = $wb.Class('Array',{
            _arr:[],

            __construct:function(arr) {
                this._arr = arr ? arr : [];
            },
            /**
            * @description Push element onto end
            * @param {Object} elm
            */
            push:function(elm) {
                this._arr.push(elm);
            },
            
            shift:function() {
                return this._arr.shift();
            },
            unshift:function(elm) {
                this._arr.splice(0,0,elm);
            },
            /**
            * @description Push several elements onto end
            * @param {Object[]} elms
            */
            pushAll:function(elms) {
                for(var i = 0; i < elms.length;i++) {
                    this.add(elms[i]);
                }
            },
            /**
            * @description Get element by index
            * @param {int} i The index to get
            * @type Object
            */
            get:function(i) {
                return this._arr[i];
            },
            /**
            * @description remove element at specified index
            * @param {int} i the index to remove
            */
            remove:function(i) {
                return this._arr.splice(i,1);
            },
            /**
            * @description remove element from array
            * @param {Object} value the value to remove
            */
            removeValue:function(value) {
                var ix = this._arr.indexOf(value);
                if (ix > -1)
                    this.remove(ix);
            },
            /**
            * @description get the length of the array
            * @type int
            */
            length:function() {
                return this._arr.length;
            },
            /**
            * @description Sort the array
            * @param {Function} compareFunction the sort function
            */
            sort:function(compareFunction) {
                this._arr.sort(compareFunction);
            },
            /**
            * @description Empty the array
            */
            clear:function() {
                while(this.length() > 0) {
                    this.remove(0);
                }
            },
            /**
            * @description Find an element in the array by path and value
            * @param {String} path the path to look for in each element
            * @param {Object} value the value to look for in each path
            * @type Object[] the entries matching the query
            */
            find:function(path,value) {
                var out = [];
                this.each(function(elm) {
                    if ($wb.utils.GetValue(elm,path) == value) {
                        out.push(elm);
                    }
                });
                return out;
            },
            /**
            * @description iterate through the array using a callback function
            * @param {Function} cb the callback function - is called with 2 parameters - value and index.
            */
            each:function(cb) {
                for(var i = 0; i < this._arr.length;i++) {
                    cb.apply(this,[this._arr[i],i]);
                }
            },
            /**
            * @description Get the internal std. js array
            * @type Object[]
            */
            toArray:function() {
                return this._arr;
            },
            contains:function(val) {
                return this._arr.indexOf(val) > -1
            },
            containsOnly:function() {
                var args = [],i;
                for(i = 0; i < arguments;i++) {
                    args.push(arguments[i]);
                    if (!this.contains(arguments[i])) {
                        return false;
                    }

                }

                for(i = 0; i < this._arr.length;i++) {
                    if (args.indexOf(this._arr[i]) == -1) {
                        return false;
                    }
                }

                return true;
            }
        });

        /**
         * @description A Set collection (unique list)
         * @constructor
         */
        $wb.Set = $wb.Class('Set',{
            __extends : [$wb.Array],

            __construct:function(arr) {
                this.__super(arr ? arr.unique() : arr);
            },

            /**
             * @description Add element to Set
             * @param {Object} elm
             */
            add:function(elm) {
                if (this._arr.indexOf(elm) == -1)
                    this._arr.push(elm);
            },
            /**
             * @description Add several elements to Set
             * @param {Object[]} elms
             */
            addAll:function(elms) {
                for(var i = 0; i < elms.length;i++) {
                    this.add(elms[i]);
                }
            },
            push:function(elm) {
                this.add(elm);
            },
            pushAll:function(elms) {
                this.addAll(elms);
            },
            unshift:function(elm) {
                if (this._arr.indexOf(elm) == -1)
                    this._arr.unshift(elm);
            }
        });


        // Heavily inspired by:
        // parseUri 1.2.2
        // (c) Steven Levithan <stevenlevithan.com>
        // MIT License
        $wb.Url = $wb.Class('Url',
            /**
            * @lends $wb.Url.prototype
            * @augments $wb.Class
            */
            {
                __defaults:{
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
                opts:null,
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
                /** 
                * @constructs
                * @param {String|Object} arg the url or an object containing url information
                * @param {String|Object} [ref] Optional argument to indicate the reference. Is used to set default values
                */
                __construct:function(arg,ref) {
                    this.opts = this.getDefaults();
                    if (ref) {
                        if (typeof ref == 'string') {
                            this.fromString(ref);
                        } else {
                            this.fromObject(ref);
                        }
                    }

                    if (typeof arg == 'string') {
                        this.fromString(arg);
                    } else {
                        this.fromObject(arg);
                    }
                },
                /**
                * @description Gets HTTP GET parameter values
                * @param {String} key the name of the parameter
                * @type String
                */
                get:function(key) {
                    if (!this.params)
                        return null;
                    return this.params[key];
                },
                /**
                * @description Gets host name
                * @type String
                */
                getHost:function() {
                    return this.host;
                },
                /**
                * @description Gets port
                * @type int
                */
                getPort:function() {
                    return this.port;
                },
                /**
                * @description Gets path
                * @type String
                */
                getPath:function() {
                    return this.path;
                },
                /**
                * @description Gets anchor (#whatever)
                * @type String
                */
                getAnchor:function() {
                    return this.anchor;
                },
                /**
                * @description Read url from object
                * @param {Object} obj
                */
                fromObject:function(obj) {
                    if (!obj) {
                        return;
                    }
                    for(var i = 0;i < this.opts.key.length;i++) {
                        var key = this.opts.key[i];
                        this[key] = obj[key];
                    }
                    if (obj.params) {
                        for(key in obj.params) {
                            this.params[key] = obj.params[key];
                        }
                    }

                },
                base:function() {
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
                        if (!defPort || this.port && this.port != defPort) {
                            out += ":"+this.port;
                        }
                    }

                    if (!this.path)
                        this.path = "/";
                    out += this.path;

                    return out.substr(0,out.lastIndexOf('/')+1);
                },
                /**
                * @description Read url from string
                * @param {String} str
                */
                fromString:function(str) {
                    var	o   = this.opts,
                    m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
                    uri = this,
                    i   = 14;
                    while (i--) {
                        if (m[i])
                            uri[o.key[i]] = m[i];
                    }

                    uri[o.q.name] = {};
                    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
                        if ($1) uri[o.q.name][$1] = $2;
                    });
                    if (uri.port)
                        uri.port = parseInt(uri.port, 10);
                },
                /**
                * @description Convert this url to a string
                * @type String
                */
                toString:function() {
                    return this.asString();
                },
                asString:function() {
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
                        if (!defPort || this.port && this.port != defPort) {
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
            }
        );
        /**
        * @description Protocol to port map
        * @static
        * @type Object
        */
        $wb.Url.protocols = {
            'http':80,
            'https':443,
            'ftp':21
        };

        /**
        * @description A read-only "location" field on the $wb namespace that reads the current location and gets a $wb.Url
        * @field
        * @name location
        * @memberOf $wb
        * @Type $wb.Url
        */
        $wb.location = function() {
            if (!this._location) {
                this._location = new $wb.Url(top.location.href);
            }
            return this._location;
        };


        /**
        * @namespace Core classes
        */
        $wb.core = {};

        /**
        * @description Registry class used for name/value stores
        * @class
        */
        $wb.core.Registry = $wb.Class('Registry',
            /**
            * @lends $wb.core.Registry.prototype
            * @augments $wb.Class
            */
            {
                /**
                * @description Internal var used for the data
                * @private
                * @type Object
                */
                _data:{},
                /**
                * @description get value - or default value if not available
                * @param {String} key the registry key
                * @param {Object} [defaultValue=null] default value
                * @type Object
                */
                get:function(key,defaultValue) {
                    var out = this._data[key.toLowerCase()];
                    if (!out)
                        return defaultValue;
                    return out;
                },
                /**
                * @description Registry key existance check
                * @param {String} key the registry key
                * @type Boolean
                */
                has:function(key) {
                    return typeof this._data[key.toLowerCase()] != 'undefined';
                },
                /**
                * @description Register key with value
                * @param {String} key the registry key
                * @param {Object} value the value
                */
                register:function(key,value) {
                    this._data[key.toLowerCase()] = value;
                },
                /**
                * @description Remove key
                * @param {String} key the registry key
                */
                unregister:function(key) {
                    delete this._data[key.toLowerCase()];
                }
            }
        );


        $wb.Error = $wb.Class('Error',
            /**
            * @description Error class 
            * @lends $wb.core.Error.prototype
            * @augments $wb.Class
            */
            {
                /**
                * @description error message
                * @private
                * @type String
                */
                _msg:'',
                /**
                * @description error source
                * @private
                * @type Source
                */
                _src:'',

                /**
                * @constructs
                * @parem {String} msg - the error message
                * @param {Object} [src=null] - the error source
                */
                __construct:function(msg,src) {
                    this._msg = msg;
                    this._src = src;
                },
                getMessage:function() {
                    return this._msg;
                },
                getSource:function() {
                    return this._src;
                },
                toString:function() {
                    return this._msg;
                }
            }
        );

        /**
        * @description Provides basic event handling
        * @class
        */
        $wb.core.Events = $wb.Class('Events',
            /**
            * @lends $wb.core.Events.prototype
            * @augments $wb.Class
            */
            {
                /**
                * @private
                */
                _bindings:{},
                /**
                * @description Trigger event with optional arguments
                * @param {String} evt the event name
                * @param {Object[]} [args] Optional arguments to send as parms to event handlers
                * @return {Boolean} returns true unless a handler specifically returns false (which stops execution)
                */
                trigger:function(evt,args) {
                    if (!args)
                        args = [];
                    if (this._bindings[evt]) {
                        for(var i = 0; i < this._bindings[evt].length;i++) {
                            var handler = this._bindings[evt][i];
                            var out = handler.apply(this,args);
                            if (out === false)
                                return false;
                        }
                    }
                    return true;
                },
                /**
                * @description Bind handler to event
                * @param {String} evt the event name
                * @param {Function} handler Event handler
                */
                bind:function(evt,handler) {
                    if (!this._bindings[evt])
                        this._bindings[evt] = [];
                    this._bindings[evt].push(handler);
                    return this;
                },
                unbind:function(evt,handler) {
                    if (!handler) {
                        delete this._bindings[evt];
                    } else {
                        if (!this._bindings[evt]) 
                            return this;
                        var ix = this._bindings[evt].indexOf(handler);
                        if (ix > -1)
                            this._bindings[evt].splice(ix,1);
                    }
                    return this;
                }
            }
        );

        /**
        * @description Provides basic class utilities
        * @class
        */
        $wb.core.Utils = $wb.Class('Utils',
            /**
            * @lends $wb.core.Utils.prototype
            * @augments $wb.Class
            */
            {
                /**
                * The provided options.
                * @type Object
                */
                opts:{},
                /**
                * @description require certain keys to be present within map
                * @param {Object} obj the map
                * @param {String ...} arguments additional arguments will all be checked against the map
                * @throws String
                */
                require:function(obj) {
                    this.notEmpty(obj);
                    for(var i = 1; i < arguments.length;i++) {
                        var arg = arguments[i];
                        if (typeof obj[arg] == 'undefined') {
                            throw new $wb.Error(_("Missing argument: %s: %s",this._clz,arg),this);   
                        }
                    }
                    return this;
                },
                notEmpty:function(obj,msg) {
                    if (!msg) msg = _("Required value was empty");
                    if (!obj) 
                        throw new $wb.Error(msg,this);
                    return this;
                },
                option:function(name) {
                    if (arguments.length > 1) {
                        this.opts[name] = arguments[1];
                        return this;
                    }
                    return this.opts[name];
                }
            }
        );

        /**
        * @description App descriptor. Use as main namespace for app
        * @class
        */
        $wb.App = $wb.Class('App',
        /**
        * @lends $wb.core.Events.prototype
        * @augments $wb.Class
        */
        {
            __extends:[ $wb.core.Events,
                        $wb.core.Utils],
            /**
            * The provided options.
            * @type Object
            */
            opts:{
                name:"None"
            },
            _ready:false,


            /**
            * @constructs
            * @param {Object} opts 
            * @param {Function} opts.tmpl template function
            * @param {String} opts.id Id of the element
            * @param {Function} opts.layout Layout function
            * @param {boolean} [opts.async] If true - rendering will be hold off untill "ready" event is triggered
            */
            __construct:function(opts) {
                this.opts = $.extend(this.opts,opts);
            },
            name:function() {
                return this.opts.name;
            },
            setReady:function(ready) {
                if (!this._ready && ready) {
                    this.trigger('ready');
                }
                this._ready = ready;
            },
            whenReady:function(cb) {
                if (this._ready) {
                    cb();
                } else {
                    this.bind('ready',cb);
                }
            }
        });

        $wb.Controller = $wb.Class('MVCController',{
            _actions:{},
            _context:null,
            __construct:function(actions) {
                this._actions = actions;
            },
            context:function() {
                if (arguments.length > 0) {
                    this._context = arguments[0];

                    for(var actionName in this._actions) {
                        this._actions[actionName].context(this._context);
                        this[actionName] = this._actions[actionName].method();
                    }

                    return this;
                }
                return this._context;
            },
            actions:function() {
                return this._actions;
            }
        });

        $wb.Action = $wb.Class('MVCAction',{
            _method:null,
            _name:'',
            _type:'default',
            _context:null,
            __construct:function(name,method,type,ctxt) {
                this._name = name;
                this._method = method;
                this._type = type;
                if (ctxt)
                    this._context = ctxt;
            },
            context:function() {
                if (arguments.length > 0) {
                    this._context = arguments[0];
                    return this;
                }
                return this._context;
            },
            name:function() {
                return this._name;
            },
            method:function() {
                return this._method.bind(this.context());
            },
            type:function() {
                return this._type;
            },
            exec:function() {
                return this.method.apply(this.context(),arguments);
            }
        });

        /**
         * Used to defer execution untill future is resolved
         * @constructor
         */
        $wb.Future = $wb.Class('Future',{
            _resolved:false,
            _resolvedValue:null,
            _listeners:[],
            _rejectionListeners:[],
            _rejected:false,
            __construct:function() {

            },
            /**
             * Add callback that will be invoked when future is resolved
             * @param {Function} callback
             * @return {$wb.Future}
             */
            then:function(callback) {
                if (this._rejected) {
                    return;
                }

                if (this._resolved) {
                    callback.apply(null,this._resolvedValue);
                }
                this._listeners.push(callback);
                return this;
            },
            /**
             * Add callback that will be invoked if the future is rejected
             * @param {Function} callback
             * @return {$wb.Future}
             */
            else:function(callback) {
                if (!this._rejected) {
                    return;
                }

                if (this._resolved) {
                    callback.apply(null,this._resolvedValue);
                }
                this._rejectionListeners.push(callback);
                return this;
            },
            /**
             * Resolve future.
             * @param {...} values to send to callbacks
             * @return {$wb.Future}
             */
            resolve:function() {
                if (this._resolved) {
                    throw new $wb.Error("Future already resolved");
                }
                this._resolvedValue = arguments;
                this._resolved = true;

                while(this._listeners.length > 0) {
                    var callback = this._listeners.pop();
                    callback.apply(null,this._resolvedValue);
                }
                //Clear all rejection listeners
                this._rejectionListeners = null;
                return this;
            },
            /**
             * Reject future
             * @param {...} values to send to callbacks
             * @return {$wb.Future}
             */
            reject:function() {
                if (this._resolved) {
                    throw new $wb.Error("Future already resolved");
                }

                this._resolvedValue = arguments;
                this._resolved = true;
                this._rejected= true;
                this._listeners = null;//Clear listeners (don't want to hang on to the contained mem)

                while(this._rejectionListeners.length > 0) {
                    var callback = this._rejectionListeners.pop();
                    callback.apply(null,this._resolvedValue);
                }
                return this;
            }

        });

        /**
         * Create a new future
         * @return {$wb.Future}
         */
        $wb.defer = function() {
            return new $wb.Future();
        };


        /**
         * A couple of helper functions for common tasks
         */


        /**
        * @description global registry
        * @static
        * @type $wb.core.Registry
        */
        $wb.registry = new $wb.core.Registry();

        /** Messaging **/

        /**
        * @function
        * @description Send debug message to console - if debug is enabled
        * @param {String} msg the message
        * @param {Object} [source] the source of the message
        */
        $wb.debug = function(msg,source) {
            if ($wb.registry.get($wb.DEBUG_ENABLE,false)) {
                console.log(msg);
            }

        };

        /**
        * @description Send error message
        * @param {String} msg the message
        * @param {Object} [source] the source of the error
        */
        $wb.error = function(msg,source) {
            if ($wb.registry.has($wb.MESSAGE_HANDLER)) {
                $wb.registry.get($wb.MESSAGE_HANDLER).error(msg);
            }
            $wb.debug(msg,source);
        };

        /**
        * @description Send message
        * @param {String} msg the message
        * @param {Object} [source] the source of the message
        */
        $wb.message = function(msg,source) {
            if ($wb.registry.has($wb.MESSAGE_HANDLER)) {
                $wb.registry.get($wb.MESSAGE_HANDLER).message(msg,source);
            }
            $wb.debug(msg,source);
        };

        /**
        * @description Show confirm box
        * @param {String} msg the message
        * @param {Function} [cb] Called with a single boolean paramenter (result of confirm box)
        */
        $wb.confirm = function(msg,cb) {
            var ok = confirm(msg);
            if (cb)
                cb(ok);
        };

        /**
        * @description Prompt for input
        * @param {String} msg the message
        * @param {Function} [cb] Called with a single string paramenter (result of prompt box)
        */
        $wb.prompt = function(msg,cb) {
            var out = prompt(msg);
            if (cb)
                cb(out);
        };

        /**
        * @description Show alert box
        * @param {String} msg the message
        * @param {Function} [cb] Called when alert box is closed
        */
        $wb.alert = function(msg,cb) {
            alert(msg);
            if (cb)
                cb();
        };


        /**
         * Iterate through object
         * @param {Object} obj
         * @param callback receives value as first argument and key as second (if this is a map)
         * @return {mixed) returns true or the first value returned from callback (which stops it)¡
         */
        $wb.each = function(obj,callback) {
            var i,key,result;
            if (!obj) {
                return undefined;
            }

            if (Array.isArray(obj)) {
                for(i = 0; i < obj.length;i++) {
                    result = callback(obj[i],i);
                    if (result !==  undefined) {
                        return result;
                    }
                }
                return undefined;
            }
            if ($wb.utils.isA(obj,$wb.Array)) {

                for(i = 0; i < obj.length();i++) {
                    result = callback(obj.get(i),i);
                    if (result !==  undefined) {
                        return result;
                    }
                }
                return undefined;
            }

            if ($wb.utils.isClass(obj)) {
                throw new $wb.Error('Could not iterate instance of class %s'.format($wb.utils.getClassName(obj)));
            }

            for(key in obj) {
                if (obj.hasOwnProperty(key)
                        && typeof obj[key] !== 'function') {
                    result = callback(obj[key],key);
                    if (result !==  undefined) {
                        return result;
                    }
                }
            }
            return undefined;
        };

        /**
         * Iterate through object and collect output values from callback
         * @param {Object} obj
         * @param callback receives value as first argument and key as second (if this is a map) - should return value
         * @return {mixed) returns array of collected values from callbacks
         */
        $wb.collect = function(obj,callback) {
            var i,key,result,out = [];
            if (!obj) {
                return [];
            }

            if (typeof obj.length === 'number') {
                for(i = 0; i < obj.length;i++) {
                    result = callback(obj[i],i);
                    if (result !==  undefined) {
                        out.push(result);
                    }
                }
                return out;
            }

            if (obj instanceof $wb.Array) {
                for(i = 0; i < obj.length();i++) {
                    result = callback(obj.get(i),i);
                    if (result !==  undefined) {
                        out.push(result);
                    }
                }
                return out;
            }

            for(key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result = callback(obj[key],key);
                    if (result !==  undefined) {
                        out.push(result);
                    }
                }
            }
            return out;
        };



        /**
         * Get keys as list
         * @param {Object} obj
         * @return {Array}
         */
        $wb.keys = function(obj) {
            var out = [];
            for(var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    out.push(key);
                }
            }
            return out;
        };

        /**
         * Get values as list
         * @param obj
         * @return {Array}
         */
        $wb.values = function(obj) {
            var out = [];
            for(var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    out.push(obj[key]);
                }
            }
            return out;
        };

        /**
         * Count values in map or list
         * @param {Array|Object} obj
         * @return {Array}
         */
        $wb.count = function(obj) {
            if (typeof obj.length === 'number') {
                return obj.length;
            }

            if (typeof obj.length === 'function') {
                return obj.length();
            }

            return $wb.values(obj).length;
        };


        /**
         * Returns a set of property names that differ in the 2 provided objects
         * @param {Object} obj1
         * @param {Object} obj2
         * @param {boolean} deep Compare nested objects recursively. Defaults to true
         * @return {$wb.Set}
         */
        $wb.diff = function(obj1,obj2,deep) {

            if (typeof deep === 'undefined') {
                deep = true;
            }



            var out = new $wb.Set();
            [[obj1,obj2],[obj2,obj1]].forEach(function(objects) {
                var obj1 = objects[0];
                var obj2 = objects[1];

                $wb.each(obj1,function(value,key) {

                    if (!obj2 || obj2[key] !== value) {
                        if (deep
                                && obj2
                                && typeof value === 'object'
                                &&  typeof obj2[key] === 'object') {

                            if ($wb.diff(value,obj2[key],deep).length() > 0) {
                                out.add(key);
                            }
                        } else {
                            out.add(key);
                        }
                    }
                });
            });

            return out;
        };


        window.$wb = $wb;
        
        //jQuery setup
        $.ajaxSetup({cache: false});
    };




    /**
     * Update prototypes that are lacking basic JS methods (hello IE)
     */


    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/(^[\n\s\t]+|[\n\s\t]+$)/g,'');
        };
    }

    if (!Function.prototype.bind) {
        //Ensure bind exists
        Function.prototype.bind = function(ctxt) {
            return $.proxy(this,ctxt);
        };
    }


    if (!Array.prototype.indexOf) {
        //Ensure indexOf exists
        Array.prototype.indexOf = function(elm) {
            for(var i = 0; i < this.length;i++) {
                if (this[i] === elm) return i;
            }
            return -1;
        };
    }

    if (!Array.prototype.lastIndexOf) {
        //Ensure lastIndexOf exists
        Array.prototype.lastIndexOf = function(elm) {
            for(var i = (this.length-1); i > -1;i--) {
                if (this[i] === elm) return i;
            }
            return -1;
        };
    }

    if (!Array.prototype.remove) {
        /**
         * Remove value at index from array
         * @param {int} ix
         * @return {Array}
         */
        Array.prototype.remove = function(ix) {
            this.splice(ix,1);
            return this;
        };
    }

    if (!Array.prototype.removeValue) {
        /**
         * Remove all values matching argument from array
         * @param {mixed} value
         * @return {boolean} true if something was removed
         */
        Array.prototype.removeValue = function(value) {
            var ix,
                found = false;
            while((ix = this.indexOf(value)) > -1) {
                this.remove(ix);
                found = true
            };

            return found;
        };
    }

    if (!Array.prototype.pushUnique) {
        /**
         * Add value only if it's not already in array
         * @param {mixed} value
         * @return {boolean} true if value was added
         */
        Array.prototype.pushUnique = function(value) {
            if (this.indexOf(value) === -1) {
                this.push(value);
                return true;
            }
            return false;
        };
    }

    if (!Array.prototype.replace) {
        /**
         * Replace all values with value
         * @param {mixed} find
         * @param {mixed} replace
         * @return {Array}
         */
        Array.prototype.replace = function(find,replace) {
            var ix;
            while((ix = this.indexOf(find)) > -1) {
                this.splice(ix,1,replace);
            }
            return this;
        };
    }

    if (!Array.prototype.unique) {
        /**
         * Remove all duplicates in array
         * @param {mixed} find
         * @param {mixed} replace
         * @return {Array}
         */
        Array.prototype.unique = function(find,replace) {
            var ix,val,valIx,
                vals = [],
                duplicates = [];

            for(ix = 0; ix < this.length;ix++) {
                val = this[ix];
                valIx = vals.indexOf(val);
                if (valIx > -1) {
                    duplicates.push(val);
                } else if (valIx === -1) {
                    vals.push(val);
                }
            }

            while(duplicates.length > 0)  {
                val = duplicates.pop();
                ix = this.lastIndexOf(val);
                this.remove(ix);
            }
            return this;
        };
    }

    if (!Array.prototype.pushAll) {
        /**
         * Add multiple values to the end of this array
         * @param {Array} values
         * @return {Array} itself
         */
        Array.prototype.pushAll = function(values) {
            var ix;
            for(ix = 0; ix < values.length;ix++) {
                this.push(values[ix]);
            }
            return this;
        };
    }

    if (!Array.prototype.flatten) {
        /**
         * Flattens multi dimensional array into 1
         * @return {Array} A flattened copy of current array
         */
        Array.prototype.flatten = function() {
            var out = [],val,ix;
            for(ix = 0; ix < this.length;ix++) {
                val = this[ix];
                if (Array.isArray(val)) {
                    out.pushAll(val.flatten());
                } else {
                    out.push(val);
                }
            }
            return out;
        };
    }



    /**
    * @params {Any ...} arguments all arguments will be put into %s or $1,$2 ... within the string
    */
    String.prototype.format = function() {
        var out = this.toString();
        if (!out)
            throw "Missing text argument from translation method";
        for(var i = 0;i < arguments.length;i++) {
            out = out.replace(/\%s/, arguments[i])
                    .replace(new RegExp('\\$'+(i+1),'g'), arguments[i]);
        }
        return out;
    };


    if (typeof jQuery !== 'undefined') {
        loader();
    } else {
        require($wbConfig.jQuery,loader);
    }
})();