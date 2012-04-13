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
            tmpl:$wb.template.form.form
        },opts);
        this.__super(opts);
        this.bind('render',function() {
            this.find('.wb-input:eq(0)').focus();
        });
    },
    disable:function() {
        var elms = this.elm().find('input,select,textarea');
        elms.each(function() {
            var el = $(this);
            if (el.attr('type') != 'button' && this.tagName != 'button') {
                el.widget().disable();
            }
                
        });
    },
    enable:function() {
        var elms = this.elm().find('input,select,textarea');
        elms.each(function() {
            var el = $(this);
            if (el.attr('type') != 'button' && this.tagName != 'button') {
                el.widget().enable();
            }
        });
    },
    reset:function() {
        this.elm()[0].reset();
    },
    setData:function(data) {
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
            
            el.val(value);
        }
    },
    getData:function() {
        var elms = this.elm().find('input,select,textarea');
        var out = {};
        elms.each(function() {
            var el = $(this);
            var name = el.attr('name');
            if (!name) return;
            var value = el.val();
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

$wb.ui.form.InputField = $wb.Class('InputField',{
    __extends:[$wb.ui.Widget],
    _type:null,
    _labelElm:null,
    _label:null,
    _name:null,
    _labelPosition:null,
    _container:null,
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            target:'.wb-input',
            type:'text',
            labelElm:'.wb-label',
            labelPosition:'left',
            disabled:false,
            tmpl: function() {
                return $wb.template.form.input.apply(this,[opts.type])
            }
        },opts);
        
        
        this.__super(opts);
        this._type = opts.type;
        this._label = opts.label;
        this._labelElm = opts.labelElm;
        this._name = opts.name;
        this._labelPosition = opts.labelPosition;
        this._container = this.elm().children('label');
        this.bind('paint',function() {
            if (this._name)
                this.target().attr('name',this._name); 
            else
                this.target().removeAttr('name'); 
            this.label(this._label);
            var lblClass = "wb-label-"+this._labelPosition;
            this.elm()
                .removeClass('wb-label-top')
                .removeClass('wb-label-left')
                .removeClass('wb-label-right')
                .addClass(lblClass);
            
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
                            console.log("Set label:"+self._label);
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
        this.target().remoteAttr('disabled');
        this.target().removeClass('wb-disabled');
    },
    readonly:function() {
        this.target().attr('readonly','on');
        this.target().addClass('wb-readonly');
    },
    disable:function() {
        this.target().attr('disabled','disabled');
        this.target().addClass('wb-disabled');
    },
    editable:function() {
        this.target().removeAttr('readonly');
        this.target().removeClass('wb-readonly');
    },
    value:function(val) {
        if (typeof val == 'undefined')
            return this.target().val();
        else
            return this.target().val(val);
    },
    labelElm:function() {
        return this.elm().find(this._labelElm);
    },
    label:function(label) {
        if (label)
            this._label = label;
        this.labelElm().html(label);
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

$wb.ui.form.CheckBox = $wb.Class('CheckBox',{
    __extends:[$wb.ui.form.InputField],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            type:'checkbox'
        },opts);
        this.__super(opts);
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
            this.elm().val(this.opts.label);
        });
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
    __extends:[$wb.ui.form.InputField],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            type:'select',
            tmpl:$wb.template.form.select
        },opts);
        this.__super(opts);
        
        if (opts.options) {
            for(var i = 0; i < opts.options.length;i++) {
                var option = opts.options[i];
                if (!option) continue;
                if (typeof option == 'string')
                    this.add(option);
                else
                    this.add(option.value,option.name);
            }
        }
    },
    add:function(value,name) {
        var opt = new $wb.ui.form.SelectOption({name:name,value:value});
        this.children().push(opt);
    }
});

$wb.ui.form.TextArea = $wb.Class('TextArea',{
    __extends:[$wb.ui.form.InputField],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            type:'select',
            tmpl:$wb.template.form.textarea
        },opts);
        this.__super(opts);
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