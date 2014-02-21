//@module core.ui.form @prio 99
/**
 * @fileOverview
 * All form widgets are in here
 * @author <a href="http://twitter.com/vonhofdk"/>Henrik Hofmeister</a>
 * @version 1.0
 */


$wb.ui.form = {};

$wb.ui.form.FieldContainer = $wb.Class('FieldContainer',{
    __extends:[$wb.ui.Widget],
    __defaults:{
        data:{}
    },
    _dirtyData:false,
    _rendered:false,
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        this.bind('render',function() {
            this._rendered = true;
            this.setData(this.opts.data);
        });
    },
    disable:function() {
        var elms = this.elm().find('.wb-input');
        elms.each(function() {
            var el = $(this);
            var type = el.attr('type') ? el.attr('type').toLowerCase() : '';
            if (type !== 'button' && this.tagName.toLowerCase() !== 'button') {
                el.widget().disable();
            }
                
        });
    },
    enable:function() {
        var elms = this.elm().find('.wb-input');
        elms.each(function() {
            var el = $(this);
            var type = el.attr('type') ? el.attr('type').toLowerCase() : '';
            if (type !== 'button' && this.tagName.toLowerCase() !== 'button') {
                el.widget().enable();
            }
        });
    },
    reset:function() {
        if (this.elm()[0].reset)
            this.elm()[0].reset();
        this.opts.data = {};
        var elms = this.elm().find('.wb-input');
        elms.each(function() {
            $wb(this).value(null);
        });
    },
    getField:function(name) {
        if (this._rendered) {
            var el = this.elm().find('[name="'+name+'"]');
            return $wb(el);
        }
        var result = this.findWidgets(function(widget) {
            if (!(widget instanceof $wb.ui.form.BaseField)) 
                return false;
            if (widget.name() == name) 
                return true;
        });
        if (result.length > 0)
            return result[0];
        return null;
    },
	getFields:function() {
		var out = {};
		this.findWidgets(function(widget) {
			if (!(widget instanceof $wb.ui.form.BaseField))
				return false;

			out[widget.name()] = widget;
		});

		return out;
	},
	addFields: function( fields ) {
		$wb.each(fields, function(field) {
			var fieldType = $wb.ui.FieldType.type(field.valueType);
			var fieldWidget = fieldType.getFormField(field, field.defaultValue);
			this.add(fieldWidget);
		}.bind(this));
		return this;
	},
	reorder: function() {
		var fields = this.getFields();
		console.log('Fields', fields);
		this.clear();
		for(var i = 0; i < arguments.length; i++) {
			var fieldId = arguments[i];
			var field = fields[fieldId];
			if (!field) {
				continue;
			}
			this.add(field);
		}
	},
    setData:function(data) {
        if (typeof data != 'object') 
            return this;
        if (this._rendered) {
            var elms = this.elm().find('.wb-input');
            elms.each(function() {
                var el = $(this),w,name,tag,type;
                if (!el.widget()) {
                    return;
                }

                w = el.widget();
                name = w.name();
                tag = el[0].tagName.toLowerCase();
                type = null;

                if (!name) {
                    return;
                }

                if (el.attr('type')) {
                    type = el.attr('type').toLowerCase();
                }

                if (tag === 'input') {
                    switch(type) {
                        case 'button':
                        case 'submit':
                            return;
                    }
                }

				name = name.replace(/\[\]/g,'').replace(/\]/g,'').replace(/\[/g,'.');

                if (typeof $wb.utils.GetValue(data,name) !== 'undefined') {
                    w.value($wb.utils.GetValue(data,name));
                }
            });
        } else {
            this._dirtyData = true;
        }
        
        this.opts.data = data;
        this.trigger('data',[data]);
        return this;
    },
    getData:function() {
        var elms = this.elm().find('.wb-input'),
            out = {};
        elms.each(function() {
            var el = $(this),w,name,value,tag,type,i;
            
            if (!el.widget()) {
                return;
            }
            w = el.widget();
            name = w.name();
            if (!name) {
                return;
            }
            
            if (el.widget().isDisabled()) {
                out[name] = null;
                return;
            }
            
            value = el.widget().value();
            tag = this.tagName.toLowerCase();
            
            if (el.attr('type')) {
                type = el.attr('type').toLowerCase();
            }
            
            if (tag === 'input') {
                switch(type) {
                    case 'button':
                    case 'submit':
                        return;
                }
            }
            
            var obj = out;
            var isArray = (name.substr(-2) === '[]');
            var parts = name.split('[');
            for(i = 0; i < parts.length;i++) {
                var part = parts[i].replace(/\]$/,'');
                var last = (parts.length-1)===i;
                if (isArray && last) {
                    name = parts[i-1];
                    break;
                }
                    
                
                if (!obj[part])
                    obj[part] = {};
                if (last)
                    name = part;
                else
                    obj = obj[part];
            }
        
            if (isArray) {
                if ($.type(obj[name]) !== 'array')
                    obj[name] = [];
                obj[name].push(value);
            } else {
                obj[name] = value;
            }
        });
        return out;
    }
});

$wb.ui.form.FieldPane = $wb.Class('FieldPane',{
    __extends:[$wb.ui.Pane,$wb.ui.form.FieldContainer],
    __defaults:{
        layout:function() {
            var labels = this.target().find('.wb-input-container.wb-label-left .wb-label:visible:first-child');
            var widest = labels.widest();
            labels.outerWidth(widest.outerWidth());
            
            var maxW = Math.floor(this.target().innerWidth() / this.opts.cols);
            var leftover = this.target().innerWidth()-(maxW*this.opts.cols);
            var nodes = this.children();
            for(var i = 0; i < nodes.length;i++) {
                var node = nodes[i];
                node.elm().outerWidth(maxW);
                if (this.opts.cols > 1)
                    node.elm().css('float','left');
                if (i % this.opts.cols == 0) {
                    node.elm().outerWidth(maxW+leftover);
                    node.elm().addClass('wb-first');
                }
            }
        },
        cols:1,
        columnClass:'wb-columns'
    },
    
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        this.bind('render',function() {
            var elm = $wb(this.find('.wb-input:eq(0)'));
            if (elm) {
                elm.focus();
            }
            if (this.opts.cols > 1) {
                this.elm().addClass(this.opts.columnClass);
            } else {
                this.elm().removeClass(this.opts.columnClass);
            }
        });
    }
});

$wb.ui.form.Form = $wb.Class('Form',{
    __extends:[$wb.ui.form.FieldPane],
    __defaults:{
        tmpl:$wb.template.form.form,
        data:{}
    },
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        
        this.bind('render',function() {
            var self = this;
        })
    },
    submit:function() {
        if (arguments.length == 1) {
            var self = this;
            var cb = arguments[0];
            this.elm().submit(function(evt) {
                evt.preventDefault();
                cb(self.getData());
            });
        } else {
            this.elm().submit();
        }
        return this;
    }
});

$wb.ui.form.FieldSet = $wb.Class('FieldSet',{
    __extends:[$wb.ui.Section,$wb.ui.form.FieldPane],
    __defaults:{
        tmpl:$wb.template.form.fieldset
    },
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
    }
});

$wb.ui.form.AutoForm = $wb.Class('AutoForm',{
    __extends:[$wb.ui.form.Form],
    __defaults:{
        okTitle:_('Ok'),
        cancelTitle:_('Cancel'),
        resetTitle:_('Reset'),
        showOk:true,
        showCancel:true,
        showReset:false,
        showButtons:true
    },
    __construct:function(opts) {
        this.require(opts,'model');
        
        this.__super(this.getDefaults(opts));
        
        var fields = opts.model.getFields();
        
        for(var fieldId in fields) {
            var field = fields[fieldId];
            if (field.hidden)
                continue;
            var fieldType = $wb.ui.FieldType.type(field.valueType);
            var fieldWidget = fieldType.getFormField(field,field.defaultValue);
            this.add(fieldWidget);
        }
        
        this.bind('submit',function() {
            this.trigger('ok');
        });
        
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
    _onOk:function(evt) {
        evt.preventDefault();
        this.trigger('ok');
    },
    _onCancel:function(evt) {
        evt.preventDefault();
        this.trigger('cancel');
    },
    _onReset:function(evt) {
        evt.preventDefault();
        this.reset();
        this.trigger('reset');
    }
});

$wb.ui.form.BaseField = $wb.Class('BaseField',{
    __extends:[$wb.ui.Widget],
    __defaults:{
        target:'.wb-input',
        type:'text',
        labelElm:'.wb-label',
        labelPosition:'left',
        containerElm:'label',
        disabled:false,
        tmpl: function() {
            var inputHtml = this.opts.inputTmpl ? this.opts.inputTmpl() : '';
            return $wb.template.form.container.apply(this,[this.opts.type,inputHtml]);
        },
        layout:function() {
            var maxW = this._container.innerWidth();
            if (maxW < 1)
                maxW = this.elm().innerWidth();
            var labelW = this.labelElm().outerWidth();
            if (this._labelPosition == 'none') {
                labelW = 0;
            }
            var w = maxW-labelW;
            if (this.opts.type == 'checkbox' 
                    || this.opts.type == 'radio') {
               return;
            }
            if (w > 0)
                this.target().outerWidth(w);
        }
    },
    _labelElm:null,
    _label:null,
    _labelPosition:null,
    _container:null,
    _value:null,
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        
        this._label = this.opts.label;
        this._labelElm = this.opts.labelElm;
        this._name = this.opts.name;
        this._labelPosition = this.opts.labelPosition;
        if (this.opts.containerElm)
            this._container = this.elm().children(this.opts.containerElm);
        if (!this._container || this._container.length == 0)
            this._container = this.elm();
        
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
                case 'none':
                    this.labelElm().detach();
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
    name:function() {
        return this._name;
    },
    focus:function() {
        this.target().focus();
    },
    labelElm:function() {
        return this.elm().findFirst(this._labelElm);
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
/**
 * A simple text component for inserting non-writable info into form
 * @constructor
 */
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
        
        if (opts.text) {
            if (opts.monotype) {
                this._html = "<pre>%s</pre>".format(opts.text);
            } else {
                this._html = opts.text;
            }
        }
            
        this.bind('render',function() {
            this.target().enableMarking();
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
                return $wb.template.form.input.apply(this,[opts.type]);
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
        
        if (this.isChecked())
            return this.opts.checkedvalue;
        return this.opts.uncheckedValue;
    },
    isChecked:function() {
        return this.target().is(':checked')
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
    },
    isChecked:function() {
        return this.target().is(':checked')
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

$wb.ui.form.FileField = $wb.Class('FileField',{
    __extends:[$wb.ui.form.InputField],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            type:'file'
        },opts);
        this.__super(opts);
    }
});

$wb.ui.form.FileUploader = $wb.Class('FileUploader',{
    __defaults:{
        tmpl:function() {
            var frameId = $wb.utils.uuid().replace(/\-/g,'');
            var html = 
            '<div class="wb-fileuploader" ><form class="wb-target" method="post" enctype="multipart/form-data" target="$1" /><iframe name="$1" class="wb-offscreen" /></div>'
                .format(frameId);
            return html;
        },
        target:'> .wb-target',
        type:'json'
    },
    __extends:[$wb.ui.Pane],
    __construct:function(opts) {
        this.require(opts,'url');
        this.__super(this.getDefaults(opts));
        
        var self = this;
        
        var fileField = new $wb.ui.form.FileField({name:this.opts.name,label:this.opts.label || null});
        this.add(fileField);
        
        this.bind('render',function() {
            var form = this.target();
            form.attr('action',this.opts.url);
            
        });
        
        fileField.bind('change',function() {
            if (!this.value()) return;
            var form = self.target();
            self.elm().find('iframe').one('load',function() {
                var content = this.contentWindow.document;
                var result;
                if (self.opts.type == 'json')
                    result = JSON.parse(content.body.innerHTML);
                else
                    result = content.body.innerHTML;

                self.trigger('data',[result]);
                fileField.value('');
            });
            form.submit();
        });
    }
})


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

$wb.ui.form.CronField = $wb.Class('CronField',{
    __extends:[$wb.ui.form.InputField],
    __defaults:{
        cronElm:'.wb-target',
        tmpl: $wb.template.form.cron,
        defaultValue:'* * * * * * *',
        anyLabels:[
            _('Every second of'),
            _('every minute of'),
            _('every hour of'),
            _('every day of'),
            _('every month of'),
            _('on any day of the week of'),
            _('any year')
        ],
        options:[
            $wb.utils.Range(0,59,'The %s. second of'),
            $wb.utils.Range(0,59,'the %s. minute of'),
            $wb.utils.Range(0,23,'the %s. hour of'),
            $wb.utils.Range(1,31,"the %s. of"),
            {
                1:_('every January'),
                2:_('every February'),
                3:_('every March'),
                4:_('every April'),
                5:_('every May'),
                6:_('every June'),
                7:_('every July'),
                8:_('every August'),
                91:_('every September'),
                10:_('every October'),
                11:_('every November'),
                12:_('every December')
            },
            {
                1:_('on Mondays'),
                2:_('on Tuedays'),
                3:_('on Wednesdays'),
                4:_('on Thursdays'),
                5:_('on Fridays'),
                6:_('on Saturdays'),
                0:_('on Sundays')
            },
            $wb.utils.Range(new Date().getFullYear()-10,new Date().getFullYear()+10),
        ],
        layout:function() {
            var maxW = this.labelElm().parent().innerWidth();
            var labelW = this.labelElm().outerWidth();
            this._cronElm().outerWidth(maxW-labelW);
        }
    },
    _fields:[],
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        
        this.bind('render',function() {
            for(var i = 0; i < 7;i++) {
                var label = this.opts.anyLabels[i];
                var options = $.extend({'*':label},this.opts.options[i]);
                if (!this._fields[i])
                    this._fields[i] = new $wb.ui.form.Select({options:options,container:false});
                this._fields[i].render(this._cronElm());
            }
            this.trigger('change');
        });
        this.elm().bind('change',function() {
            this._syncTo();
        }.bind(this));
        
        this.bind('change',function() {
            this._syncFrom();
        });
    },
    _syncFrom:function() {
        var value = this.value();
        if (!value) {
            this.value(this.opts.defaultValue);
            return;
        }
        var vals = value.trim().split(' ');
        
        for(var i = 0; i < 7;i++) {
            var val = vals[i];
            if (!val)
                val = '*'; 
            this._fields[i].value(val.trim());
        }
    },
    _syncTo:function() {
        var vals = [];
        this.elm().find('select').each(function() {
            vals.push($(this).val());
        });
        var value = vals.join(' ');
        
        this.value(value);
    },
    _cronElm:function() {
        return this.elm().findFirst(this.opts.cronElm);
    }
});

$wb.ui.form.EmailField = $wb.Class('EmailField',{
    __extends:[$wb.ui.form.InputField],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl: $wb.template.form.email,
            validate:/\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i
        },opts);
        this.__super(opts);
    }
});

$wb.ui.form.ColorField = $wb.Class('ColorField',{
    __extends:[$wb.ui.form.TextField],
    __defaults:{
        pluginBaseDir:$wbConfig.base+"js/3rdparty/colorpicker/"
    },
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        this.readonly();
        this._loadPlugin();
        this.bind('change',function() {
            this.target().css('background-color',this.color());
        });
    },
    _loadPlugin:function() {
        if (!jQuery.fn.ColorPicker) {
            loadCSS(this.opts.pluginBaseDir+"colorpicker.css");
            require(this.opts.pluginBaseDir+"colorpicker.js",this._init.bind(this));
        } else {
            this._init();
        }
    },
    _init:function() {
        this.target().ColorPicker({
            color:this.color(),
            onSubmit: function(hsb, hex, rgb, el) {
		this.value(hex);
		this.target().ColorPickerHide();
            }.bind(this),
            onChange:function(hsb,hex,rgb) {
                this.value(hex);
                this.target().css('background-color',this.color());
            }.bind(this),
            onBeforeShow: function () {
                    this.target().ColorPickerSetColor(this.value());
                    this.target().css('background-color',this.color());
                    $('.colorpicker').disableMarking();
            }.bind(this)
        });
        this.target().css('background-color',this.color());
    },
    color:function() {
        if (!this.value())
            this.value('FFFFFF');
        return "#"+this.value();
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
                return $wb.template.form.button.apply(this,[opts.type]);
            }
        },opts);
        this.__super(opts);
        
        this.bind('paint',function() {
            this.title(this.opts.label);
        });
        
        this._bind();
    },
    _bind:function() {
        var self = this;
        this.elm().click(function(evt) {
            evt.preventDefault();
            if (self.opts.action) {
                self.opts.action.apply(self,[evt]);
            }
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
    __defaults:{
        type:'submit',
        action:function() {
            var form = $wb(this.elm().closest('form'));
            form.submit();
        }
    },
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
    }
});

$wb.ui.form.ButtonPane = $wb.Class('ButtonPane',{
    __extends:[$wb.ui.Pane],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.form.button_pane,
            layout:$wb.ui.layout.FlowReverse
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
    __defaults:{
        emptyText:_('Choose...'),
        emptyValue:'',
        showEmpty:false
    },
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            type:'select',
            tmpl:$wb.template.form.select,
            multi:false
        },opts);
        this.__super(opts);
        
        if (opts.multi) {
            this.elm().addClass('wb-multiple');
            this.target().attr('multiple','multiple');
        }
        
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
        
        if (this.opts.showEmpty) {
            this.add(this.opts.emptyValue,this.opts.emptyText);
        }
        
        if ($.type(options) == 'array') {
            for(var i = 0; i < options.length;i++) {
                var option = options[i];
                if (!option) continue;
                if (typeof option == 'object')
                    this.add(option.value,option.name);
                else
                    this.add(option);
                    
            }
        }
        if ($.type(options) == 'object') {
            for(var value in options) {
                this.add(value,options[value]);
            }
        }
        //If this has already been painted - just update instantly
        if (this.isAttached()) {
            this.render();
        }
    },
    add:function(value,name) {
        var opt = new $wb.ui.form.SelectOption({name:name,value:value});
        this.__super(opt);
    }
});

$wb.ui.form.TextArea = $wb.Class('TextArea',{
    __extends:[$wb.ui.form.BaseField],
    __defaults:{
        tmpl:$wb.template.form.textarea
    },
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
    }
});


$wb.ui.form.TextEditor = $wb.Class('TextEditor',{
    __extends:[$wb.ui.form.TextArea],
    __defaults:{
        mode:'javascript',
        indentUnit:4,
        lineWrapping:true,
        lineNumbers:true,
        codemirrorBase:$wbConfig.base+"js/3rdparty/codemirror/",
        layout:$wb.ui.layout.None
    },
    _codemirror:null,
    _rendered:false,
    _copyMethods:[  
        'getSelection','replaceSelection','focus','scrollTo','setOption','getOption','cursorCoords',
        'charCoords','coordsChar','undo','redo','historySize','clearHistory','indentLine','getTokenAt',
        'markText','setBookmark','findMarksAt','setMarker','clearMarker','setLineClass','hideLine',
        'showLine','onDeleteLine','lineInfo','getLineHandle','addWidget','matchBrackets','lineCount',
        'getCursor','somethingSelected','setCursor','setSelection','getLine','setLine','removeLine',
        'getRange','replaceRange','posFromIndex','indexFromPos'
    ],
    __construct:function(opts) {
        
        opts = $.extend({
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
            }
        },this.getDefaults(opts));
        
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
            throw 'Code mirror not loaded. Remember to include all needed files before invoking TextEditor.';
        }
        this._loadMode();
        
    },
    _loadMode:function() {
        if (typeof CodeMirror.modes[this.opts.mode] == 'undefined') {
            throw 'Invalid code mirror mode: ' + this.opts.mode + '. Remember to include all needed files before invoking TextEditor.';
        }
        this._init();
    },
    _init:function() {
        var destroyIt = function() {
            if (this.elm().find('.CodeMirror').length < 1) {
                return;
            }

            console.log('destroying');
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
            //this._codeMirrorElm().addClass('wb-input');
            
            //Copy most of the code mirror methods directly onto this widget
            for(var i = 0; i < this._copyMethods.length;i++) {
                var m = this._copyMethods[i];
                this[m] = this._codemirror[m].bind(this._codemirror);
            }

            //Cause a slight delay to allow it to properly refresh
            //@TODO: Find root cause and fix
            setTimeout(function() {
                this._codemirror.refresh();
                this.value(this.value());
            }.bind(this),100);

        });
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
                this._codemirror.save();
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


$wb.ui.form.StringListField = $wb.Class('StringListField',{
    __extends:[$wb.ui.form.TextArea],
    __defaults:{
        'class':'wb-stringlist'
    },
    __construct:function(opts) {
        if (!opts) opts = {};
        this.__super(opts);
        this.value([]);
        this.target().addClass('wb-offscreen');

        var modal = null;

        var model = new $wb.data.Model('stringList',{
            name:{name:"Entry",valueType:"string",required:true,unique:true}
        });

        var store = new $wb.data.TableStore({model:model});

        var table = new $wb.ui.Table({
            store:store,
            header:true,
            footer:false,
            editable:true,
            headerActions:{
                'add':new $wb.Action(_('Add'),function() {
                    table.newRow();
                },'plus')
            },
            rowActions:{
                'remove':new $wb.Action(_('Remove'),function() {
                    store.remove(this.getData());
                },'remove'),
                'edit':new $wb.Action(_('Edit'),function() {
                    this.makeEditable();
                },'edit')
            },
            rowEditActions:{
                'save':new $wb.Action(_('Save'),function() {
                    var data = this.getData();
                    if (!data.name) return;
                    if (this.isNew())
                        store.add(data);
                    else
                        store.update(data);
                    this.makeStatic();
                },'save')
            }
        });


        var btnPane = new $wb.ui.form.ButtonPane();
        btnPane.add(new $wb.ui.form.Button({label:_('Apply'),action:function() {
            var rows = store.getRows().toArray();
            var list = [];
            $wb.each(rows,function(row) {
                list.push(row.name);
            });

            this.value(list);
            modal.close();
        }.bind(this)}));
        btnPane.add(new $wb.ui.form.Button({label:_('Cancel'),action:function() {
            modal.close();
        }}));

        btnPane.elm().css('margin-top',15);

        var pane = new $wb.ui.Pane();
        pane.add(table);
        pane.add(btnPane);

        var opener = new $wb.ui.Link({title:'Add...',action:function() {
            if (this.value()) {
                var list = this.value();
                var entries = [];
                $wb.each(list,function(name) {
                    entries.push({name:name});
                });


                store.setRows(entries);
            }

            modal = $wb.createModal({title:'Edit list',content:pane,height:450});
        }.bind(this)});



        this.bind('change',function() {
            var list = this.value();
            if (list && list.length > 0) {
                opener.html(list.join(', '));
            } else {
                opener.html(_('None'));
            }
        });

        this.bind('paint',function() {
            this.container().append(opener.render());
            this.trigger('change');
        });
    },
    value:function(val) {
        if (arguments.length > 0) {
            if ($.type(val) !== 'string') {
                if (!Array.isArray(val)) {
                    val = [];
                }
                val = JSON.stringify(val.unique());
            }

            if (val === undefined)
                val = [];
            return this.__super(val);
        } else {
            val = this.__super();
            if (!val) {
                val = [];
            } else if ($.type(val) === 'string') {
                val = JSON.parse(val);
            }
            if (!Array.isArray(val)) {
                val = [];
            }
            return val.unique();
        }
    }
});



//Define basic field types
(function() {
    $wb.ui.FieldType._default = new $wb.ui.FieldType({
            type:"string"
        }
    );
        
    new $wb.ui.FieldType({
            type:"email"
        }
    );
    
    new $wb.ui.FieldType({
            type:"phone"
        }
    );
    new $wb.ui.FieldType({
            type:"password",
            formField:function(opts,value) {
                var out = new $wb.ui.form.PasswordField({label:opts.name,name:opts.id});
                out.value(value);
                return out;
            },
            format:function(opts,value) {
                return "*****";
            }
        }
    );
    new $wb.ui.FieldType({
            type:"int"
        }
    );
    new $wb.ui.FieldType({
            type:"fullname"
        }
    );
    new $wb.ui.FieldType({
            type:"name"
        }
    );
    new $wb.ui.FieldType({
            type:"fieldName"
        }
    );
        
        
    
    new $wb.ui.FieldType({
            type:"number",
            inherits:'string'
        }
    );    
    
    
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
                    return '<span style="width:16px;height:16px;background-color:#%s" />'.format(value);
                }
                return _('None');
            },
            formField:function(opts,value) {
                var out = new $wb.ui.form.ColorField({label:opts.name,name:opts.id});
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
                    if (typeof value == 'number')
                        value = new Date(value);
                    return value.format(Date.DATE);
                }
                return _('None');
            },
            formField:function(opts,value) {
                var out = new $wb.ui.form.DateField({label:opts.name,name:opts.id});
                out.value(value);
                return out;
            }
        }
    );
    new $wb.ui.FieldType(
        {
            type:"datetime",
            
            format:function(opts,value) {
                if (value) {
                    if (typeof value == 'number')
                        value = new Date(value);
                    return value.format(Date.DATETIME);
                }
                return _('None');
            },
            formField:function(opts,value) {
                var out = new $wb.ui.form.DateField({label:opts.name,name:opts.id});
                out.value(value);
                return out;
            }
        }
    );
    new $wb.ui.FieldType(
        {
            type:"time",
            
            format:function(opts,value) {
                if (value) {
                    if (typeof value == 'number')
                        value = new Date(value);
                    return value.format(Date.TIME);
                }
                return _('None');
            },
            formField:function(opts,value) {
                var out = new $wb.ui.form.DateField({label:opts.name,name:opts.id});
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
                var options = this.options;
                if (!options && opts.options) 
                    options = opts.options;
                if (!options)
                    return value;
                if ($.type(options) == 'array') {
                    return value;
                }
                
                return options[value];
            },
            formField:function(opts,value) {
                var options = this.options;
                if (!options && opts.options) 
                    options = opts.options;
                
                var out = new $wb.ui.form.Select({label:opts.name,name:opts.id,options:options});
                out.value(value);
                return out;
            }
        }
    );
    
    new $wb.ui.FieldType(
        {
            type:"text",
            formField:function(opts,value) {
                var out = new $wb.ui.form.TextArea({name:opts.id,label:opts.name});
                out.value(value);
                return out;
            }
        }
    );
    
     
    new $wb.ui.FieldType({
        type:"code",
        inherits:'text',
        mode:'javascript',
        formField:function(opts,value) {
            var out = new $wb.ui.form.TextEditor({name:opts.id,label:opts.name,mode:this.mode});
            out.value(value);
            return out;
        }
    });
        
    new $wb.ui.FieldType({
        type:"javascript",
        inherits:'code',
        mode:'javascript'
    });
    
    new $wb.ui.FieldType({
        type:"html",
        inherits:'code',
        mode:'html'
    });
    
    new $wb.ui.FieldType({
        type:"xml",
        inherits:'code',
        mode:'xml'
    });
    
    new $wb.ui.FieldType({
        type:"markdown",
        inherits:'code',
        mode:'markdown'
    });
    
    new $wb.ui.FieldType({
        type:"json",
        inherits:'code',
        mode:{name:'javascript',json:true}
    });


    new $wb.ui.FieldType(
        {
            type:"string[]",
            formField:function(opts,value) {
                var out = new $wb.ui.form.StringListField({name:opts.id,label:opts.name});
                out.value(value);
                return out;
            },
            format:function(opts,value) {
                return (value && value.length > 0) ? value.join(', ') : _('None');
            }
        }
    );


})();