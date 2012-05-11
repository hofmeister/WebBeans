/**
 * @fileOverview
 * All form widgets are in here
 * @author <a href="http://twitter.com/vonhofdk"/>Henrik Hofmeister</a>
 * @version 1.0
 */


$wb.ui.form = {};


$wb.ui.form.Form = $wb.Class('Form',{
    __extends:[$wb.ui.Pane],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.form.form,
            data:{}
        },opts);
        this.__super(opts);
        this.bind('render',function() {
            this.setData(this.opts.data);
            this.find('.wb-input:eq(0)').focus();
        });
    },
    disable:function() {
        var elms = this.elm().find('.wb-input');
        elms.each(function() {
            var el = $(this);
            if (el.attr('type') != 'button' && this.tagName != 'button') {
                el.widget().disable();
            }
                
        });
    },
    enable:function() {
        var elms = this.elm().find('.wb-input');
        elms.each(function() {
            var el = $(this);
            if (el.attr('type') != 'button' && this.tagName != 'button') {
                el.widget().enable();
            }
        });
    },
    reset:function() {
        this.elm()[0].reset();
        this.opts.data = {};
        var elms = this.elm().find('.wb-input');
        elms.each(function() {
            $wb(this).value(null);
        });
    },
    getField:function(name) {
        var el = this.elm().find('[name="'+name+'"]');
        return el.widget();
    },
    setData:function(data) {
        this.opts.data = data;
        for(var key in data) {
            var el = this.elm().find('[name="'+key+'"]');
            if (el.length == 0) 
                continue;
            var value = data[key];
            
            var tag = el[0].tagName.toLowerCase();
            
            if (el.attr('type'))
                var type = el.attr('type').toLowerCase();
            
            if (tag == 'input') {
                switch(type) {
                    case 'button':
                    case 'submit':
                        return;
                        
                    case 'checkbox':
                    case 'radio':
                        if (value)
                            el.attr('checked',true);
                        else
                            el.removeAttr('checked');
                        return;
                }
            }
            
            el.widget().value(value);
        }
    },
    getData:function() {
        var elms = this.elm().find('.wb-input');
        var out = {};
        elms.each(function() {
            var el = $(this);
            var name = el.attr('name');
            if (!name) return;
            if (el.widget().isDisabled()) {
                out[name] = null;
                return;
            }
            
            var value = el.widget().value();
            var tag = this.tagName.toLowerCase();
            if (el.attr('type'))
                var type = el.attr('type').toLowerCase();
            
            if (tag == 'input') {
                switch(type) {
                    case 'button':
                    case 'submit':
                        return;
                        
                    case 'checkbox':
                    case 'radio':
                        if (!el.is(':checked'))
                            return;
                }
            }
            
            var obj = out;
            var isArray = (name.substr(-2) == '[]');
            var parts = name.split('[');
            for(var i = 0; i < parts.length;i++) {
                var part = parts[i];
                var last = (parts.length-1)==i;
                if (isArray && last) {
                    name = parts[i-1];
                    break;
                }
                    
                
                if (!obj[part])
                    obj[part] = {};
                if (last)
                    name = part
                else
                    obj = obj[part];
            }
        
            if (isArray) {
                if ($.type(obj[name]) != 'array')
                    obj[name] = [];
                obj[name].push(value);
            } else {
                obj[name] = value;
            }
        });
        return out;
    }
});

$wb.ui.form.AutoForm = $wb.Class('AutoForm',{
    __extends:[$wb.ui.form.Form],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend(true,{
            okTitle:_('Ok'),
            cancelTitle:_('Cancel'),
            resetTitle:_('Reset'),
            showOk:true,
            showCancel:true,
            showReset:false,
            showButtons:true
        },opts)
        this.__super(opts);
        this.require(opts,'model');
        
        var fields = opts.model.getFields();
        
        for(var fieldId in fields) {
            var field = fields[fieldId];
            if (field.hidden)
                continue;
            var fieldType = $wb.ui.FieldType.type(field.valueType);
            var fieldWidget = fieldType.getFormField(field,field.defaultValue);
            this.add(fieldWidget);
        }
        
        if (this.opts.showButtons) {
            var btnPane = new $wb.ui.form.ButtonPane();
            if (this.opts.showOk)
                btnPane.add(new $wb.ui.form.SubmitButton({label:this.opts.okTitle,action:this._onOk.bind(this)}));
            if (this.opts.showCancel)
                btnPane.add(new $wb.ui.form.Button({label:this.opts.cancelTitle,action:this._onCancel.bind(this)}));
            if (this.opts.showReset)
                btnPane.add(new $wb.ui.form.Button({label:this.opts.resetTitle,action:this._onReset.bind(this)}));
            
            this.bind('before-paint',function() {
                this.remove(btnPane);
                this.add(btnPane);
            });
        }
    },
    _onOk:function() {
        this.trigger('ok');
    },
    _onCancel:function() {
        this.trigger('cancel');
    },
    _onReset:function() {
        this.reset();
        this.trigger('reset');
    }
});

$wb.ui.form.BaseField = $wb.Class('BaseField',{
    __extends:[$wb.ui.Widget],
    _labelElm:null,
    _label:null,
    _labelPosition:null,
    _container:null,
    _value:null,
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            target:'.wb-input',
            type:'text',
            labelElm:'.wb-label',
            labelPosition:'left',
            disabled:false,
            tmpl: function() {
                return $wb.template.form.container.apply(this,[this.opts.type,opts.inputTmpl()])
            }
        },opts);
        
        this.__super(opts);
        
        this._label = opts.label;
        this._labelElm = opts.labelElm;
        this._name = opts.name;
        this._labelPosition = opts.labelPosition;
        this._container = this.elm().children('label');
        
        this.target().bind('change',function() {
            this.trigger('change');
        }.bind(this));
        
        
        this.bind('render',function() {
            this.label(this._label);
            var lblClass = "wb-label-"+this._labelPosition;
            this.elm()
                .removeClass('wb-label-top')
                .removeClass('wb-label-left')
                .removeClass('wb-label-right')
                .addClass(lblClass);
                
            if (this._name)
                this.target().attr('name',this._name); 
            else
                this.target().removeAttr('name'); 
            
            this.target().val(this._value);
            
            if (this.opts.disabled)
                this.disable();
            if (this.opts.readonly)
                this.readonly();
                
            switch(this._labelPosition) {
                default:
                case 'top':
                case 'left':
                    this._container.prepend(this.labelElm());
                    break;
                case 'bottom':
                case 'right':
                    this._container.append(this.labelElm());
                    break;
                case 'inside':
                    this.labelElm().detach();
                    var self = this;
                    this.target().focus(function() {
                        if (self.value() == self._label)
                            self.value('');
                        
                        $(this).removeClass('wb-empty');
                    });
                    
                    this.target().blur(function() {
                        if (self.value() == '') {
                            self.value(self._label);
                            $(this).addClass('wb-empty');
                        }
                    });
                    self.value(self._label);
                    this.target().addClass('wb-empty');
                    break;
            }
        });
    },
    enable:function() {
        this.opts.disabled = false;
        this.target().removeAttr('disabled');
        this.target().removeClass('wb-disabled');
    },
    readonly:function() {
        this.opts.readonly = true;
        this.target().attr('readonly','on');
        this.target().addClass('wb-readonly');
    },
    disable:function() {
        this.opts.disabled = true;
        this.target().attr('disabled','disabled');
        this.target().addClass('wb-disabled');
    },
    isDisabled:function() {
        return this.opts.disabled;
    },
    editable:function() {
        this.opts.readonly = false;
        this.target().removeAttr('readonly');
        this.target().removeClass('wb-readonly');
    },
    value:function(val) {
        if (typeof val == 'undefined') {
            this._value = this.target().val();
            return this.target().val();
        } else {
            this._value = val;
            var out = this.target().val(val);
            this.trigger('change');
            return out;
        }
    },
    labelElm:function() {
        return this.elm().find(this._labelElm);
    },
    label:function() {
        if (arguments.length > 0) {
            this._label = arguments[0];
            this.labelElm().html(this._label);
        } else
            return this._label;
        return this;
    },
    container:function() {
        return this._container;
    }
    
});

$wb.ui.form.Text = $wb.Class('Text',{
    __extends:[$wb.ui.form.BaseField],
    _html:"",
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            target:'.wb-target',
            inputTmpl:function() {
                return '<div class="wb-target" />';
            }
        },opts);
        this.__super(opts);
        
        this.bind('render',function() {
            this.html(this._html);
        });
    },
    value:function(val) {
        throw _("Form texts are informational - value is invalid");
    },
    html:function(html) {
        if (typeof html != 'undefined') {
            this._html = html;
        }
        return this.__super(html);
    }
});

$wb.ui.form.InputField = $wb.Class('InputField',{
    __extends:[$wb.ui.form.BaseField],
    _type:null,
    _labelElm:null,
    _label:null,
    _name:null,
    _labelPosition:null,
    _container:null,
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            type:'text',
            tmpl: function() {
                return $wb.template.form.input.apply(this,[opts.type])
            }
        },opts);
        
        this.__super(opts);
        this._type = opts.type;
    }
});

$wb.ui.form.TextField = $wb.Class('TextField',{
    __extends:[$wb.ui.form.InputField],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            type:'text'
        },opts);
        this.__super(opts);
    }
});

$wb.ui.form.ColorField = $wb.Class('ColorField',{
    __extends:[$wb.ui.form.InputField],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl: $wb.template.form.color
        },opts);
        this.__super(opts);
    }
});

$wb.ui.form.DateField = $wb.Class('DateField',{
    __extends:[$wb.ui.form.InputField],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl: $wb.template.form.date
        },opts);
        this.__super(opts);
    }
});

$wb.ui.form.CheckBox = $wb.Class('CheckBox',{
    __extends:[$wb.ui.form.InputField],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            type:'checkbox',
            checkedvalue:true,
            uncheckedValue:false
        },opts);
        this.__super(opts);
    },
    value:function() {
        if (arguments.length > 0) {
            if (arguments[0])
                this.target().attr('checked',true);
            else
                this.target().removeAttr('checked');
            return this;
        } 
        
        if (this.target().is(':checked'))
            return this.opts.checkedvalue;
        return this.opts.uncheckedValue;
    }
});

$wb.ui.form.RadioButton = $wb.Class('RadioButton',{
    __extends:[$wb.ui.form.InputField],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            type:'radio'
        },opts);
        this.__super(opts);
    }
});

$wb.ui.form.PasswordField = $wb.Class('PasswordField',{
    __extends:[$wb.ui.form.InputField],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            type:'password'
        },opts);
        this.__super(opts);
    }
});


$wb.ui.form.SearchField = $wb.Class('SearchField',{
    __extends:[$wb.ui.form.InputField],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            type:'search'
        },opts);
        this.__super(opts);
    }
});

$wb.ui.form.Button = $wb.Class('Button',{
    __extends:[$wb.ui.Widget],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            type:'button',
            target:null,
            tmpl: function() {
                return $wb.template.form.button.apply(this,[opts.type])
            }
        },opts);
        this.__super(opts);
        
        var self = this;
        this.elm().click(function(evt) {
            evt.preventDefault();
            if (self.opts.action) {
                self.opts.action(evt);
            }
        });
        
        this.bind('paint',function() {
            this.title(this.opts.label);
        });
    },
    title:function() {
        if (arguments.length > 0) {
            this.opts.label = arguments[0];
            this.elm().val(this.opts.label);
            return this;
        } else {
            return this.opts.label;
        }
    }
});

$wb.ui.form.SubmitButton = $wb.Class('SubmitButton',{
    __extends:[$wb.ui.form.Button],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            type:'submit'
        },opts);
        this.__super(opts);
    }
});

$wb.ui.form.ButtonPane = $wb.Class('ButtonPane',{
    __extends:[$wb.ui.Pane],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.form.button_pane,
            layout:$wb.ui.layout.Flow
        },opts);
        this.__super(opts);
    }
});

$wb.ui.form.SelectOption = $wb.Class('SelectOption',{
    __extends:[$wb.ui.Widget],
    _name:null,
    _value:null,
    __construct:function(opts) {
        opts = $.extend({
            tmpl:$wb.template.form.select_option
        },opts);
        
        this.require(opts,'value');
        this.__super(opts);
        
        if (!opts.name)
            opts.name = opts.value;
        
        this._name = opts.name;
        this._value = opts.value;
        this.bind('paint',function() {
            this.elm().attr('value',this._value);
            this.elm().html(this._name);
        });
    }
});

$wb.ui.form.Select = $wb.Class('Select',{
    __extends:[$wb.ui.form.BaseField],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            type:'select',
            tmpl:$wb.template.form.select
        },opts);
        this.__super(opts);
        
        if (opts.options) {
            if ($.type(opts.options) == 'function') {
                var options = opts.options.apply(this);
                if (typeof options != 'undefined') {
                    this.setOptions(options);
                }
            } else {
                this.setOptions(opts.options);
            }
        }
    },
    setOptions:function(options) {
        this.opts.options = options;
        this.clear();
        if ($.type(options) == 'array') {
            for(var i = 0; i < options.length;i++) {
                var option = options[i];
                if (!option) continue;
                if (typeof option == 'string')
                    this.add(option);
                else
                    this.add(option.value,option.name);
            }
        }
        if ($.type(options) == 'object') {
            for(var value in options) {
                this.add(value,options[value]);
            }
        }
    },
    add:function(value,name) {
        var opt = new $wb.ui.form.SelectOption({name:name,value:value});
        this.children().push(opt);
    }
});

$wb.ui.form.TextArea = $wb.Class('TextArea',{
    __extends:[$wb.ui.form.BaseField],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.form.textarea
        },opts);
        this.__super(opts);
    }
});


$wb.ui.form.TextEditor = $wb.Class('TextEditor',{
    __extends:[$wb.ui.form.TextArea],
    _codemirror:null,
    _rendered:false,
    _copyMethods:[  
        'getSelection','replaceSelection','focus','scrollTo','setOption','getOption','cursorCoords',
        'charCoords','coordsChar','undo','redo','historySize','clearHistory','indentLine','getTokenAt',
        'markText','setBookmark','findMarksAt','setMarker','clearMarker','setLineClass','hideLine',
        'showLine','onDeleteLine','lineInfo','getLineHandle','addWidget','matchBrackets','lineCount',
        'getCursor','somethingSelected','setCursor','setSelection','getLine','setLine','removeLine',
        ,'getRange','replaceRange','posFromIndex','indexFromPos'
    ],
    __construct:function(opts) {
        if (!opts) opts = {};
        
        opts = $.extend({
            mode:null,
            indentUnit:4,
            lineWrapping:true,
            lineNumbers:true,
            onFocus:function() {
                this._codeMirrorElm().addClass('wb-focus');
            }.bind(this),
            onBlur:function() {
                this._codeMirrorElm().removeClass('wb-focus');
            }.bind(this),
            extraKeys: {
                "Ctrl-Space": function(cm) {
                    if (opts.mode != 'javascript') 
                        return;
                    CodeMirror.simpleHint(cm, CodeMirror.javascriptHint);
                }
            },
            codemirrorBase:$wbConfig.base+"js/3rdparty/codemirror/"
        },opts);
        
        this.__super(opts);
        
        this.bind('render',function() {
            this._rendered = true;
        });
        
        this._loadCodeMirror();
    },
    _codeMirrorElm:function() {
        return this.elm().find('.CodeMirror-scroll');
    },
    _loadCodeMirror:function() {
        if (typeof CodeMirror == 'undefined') {
            loadCSS(this.opts.codemirrorBase+"codemirror.css");
            var required = [
                this.opts.codemirrorBase+"codemirror.js"
            ]
            require(required,this._loadMode.bind(this));
        } else {
            this._loadMode();
        }
        
    },
    _loadMode:function() {
        if (typeof CodeMirror.modes[this.opts.mode] == 'undefined') {
            //Load mode
            var modeName = $.type(this.opts.mode) == 'string' ? this.opts.mode : this.opts.mode.name;
            var jsFile = this.opts.codemirrorBase+"mode/"+modeName+"/"+modeName+".js";
            var required = [jsFile];
            if (modeName == 'javascript') {
                required.push(this.opts.codemirrorBase+"util/simple-hint.js");
                required.push(this.opts.codemirrorBase+"util/javascript-hint.js");
                loadCSS(this.opts.codemirrorBase+"util/simple-hint.css");
            }
            //var cssFile = this.opts.codemirrorBase+"mode/"+this.opts.mode+"/"+this.opts.mode+".css";
            require(required,this._init.bind(this));
        } else {
            this._init();
        }
    },
    _init:function() {
        var destroyIt = function() {
            this.elm().find('.CodeMirror').detach();
            delete this._codemirror;
            this._codemirror = null;
        }.bind(this);
        this.bind('detach',function() {
            destroyIt();
        });
        this.bind('render',function() {
            destroyIt();
            this._codemirror = CodeMirror.fromTextArea(this.target()[0],this.opts);
            this._codeMirrorElm().addClass('wb-input');
            
            //Copy most of the code mirror methods directly onto this widget
            for(var i in this._copyMethods) {
                var m = this._copyMethods[i];
                this[m] = this._codemirror[m].bind(this._codemirror);
            }
            this._rendered = false;
        });
        
        /**
         * If the widget had time to render before we got the whole thing loaded
         * trigger render event manually to ensure we get code mirror setup
         */
        if (this._rendered) {
            this.trigger('render');
        }
    },
    value:function() {
        if (arguments.length > 0) {
            this.__super(arguments[0]);
            this.target().trigger('change');
            
            if (this._codemirror) {
                if (!arguments[0])
                    arguments[0] = "";
                this._codemirror.setValue(arguments[0]);
            }
            return this;
        } else {
            if (this._codemirror) {
                this._codemirror.save()
            }
            return this.__super();
        }
    }
});


$wb.ui.form.WindowForm = $wb.Class('WindowForm',{
    __extends:[$wb.ui.Window],
    _buttonPane:null,
    _Form:null,
    __construct:function(opts) {
        if (!opts) opts = {};
        this.__super(opts);
        
        this._form = new $wb.ui.form.Form(opts);
        this.children().push(this._form);
        
        this._buttonPane = new $wb.ui.form.ButtonPane();
        
        this.bind('paint',function() {
            this._form.add(this._buttonPane);
        });
    },
    add:function(child) {
        this._form.add(child);
    },
    addButton:function(button) {
        this._buttonPane.add(button);
    }
});



//Define basic field types
(function() {
    $wb.ui.FieldType._default = new $wb.ui.FieldType(
        {
            type:"string"
        }
    );
    
    new $wb.ui.FieldType({type:"text"});
    new $wb.ui.FieldType({type:"json"});
    
    new $wb.ui.FieldType(
        {
            type:"timestamp",
            format:function(opts,value) {
                return new Date(parseInt(value)).toString();
            }
        }
    );
    
    new $wb.ui.FieldType(
        {
            type:"color",
            format:function(opts,value) {
                if (value) {
                    return '<span style="width:16px;height:16px;background-color:#%" />'.format(value);
                }
                return _('None');
            },
            formField:function(opts,value) {
                var out = new $wb.ui.form.ColorField({label:opts.name,name:opts.id})
                out.value(value);
                return out;
            }
        }
    );
    new $wb.ui.FieldType(
        {
            type:"date",
            format:function(opts,value) {
                if (value) {
                    return value.toString();
                }
                return _('None');
            },
            formField:function(opts,value) {
                var out = new $wb.ui.form.DateField({label:opts.name,name:opts.id})
                out.value(value);
                return out;
            }
        }
    );
    
    new $wb.ui.FieldType(
        {
            type:"boolean",
            format:function(opts,value) {
                return (value) ? _("Yes") : _("No");
            },
            formField:function(opts,value) {
                var out = new $wb.ui.form.CheckBox({label:opts.name,name:opts.id});
                
                return out;
            }
        }
    );
    
    new $wb.ui.FieldType(
        {
            type:"enum",
            format:function(opts,value) {
                if ($.type(this.values) == 'array') {
                    return value;
                }
                
                return this.values[value];
            },
            formField:function(opts,value) {
                var out = new $wb.ui.form.Select({label:opts.name,name:opts.id,options:this.values})
                out.value(value);
                return out;
            }
        }
    );
})()