$wb.ui.form = {};

$wb.ui.form.Form = $wb.Class('Form',{
    __extends:[$wb.ui.Pane],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.form.form
        },opts);
        this.__super(opts);
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
            labelPosition:'left'
        },opts);
        
        opts.tmpl = function() {
            return $wb.template.form.input.apply(this,[opts.type])
        };
        
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