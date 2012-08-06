/**
 * @fileOverview
 * All localization related methods are in here
 * @author <a href="http://twitter.com/vonhofdk"/>Henrik Hofmeister</a>
 * @version 1.0
 */


/**
 * @description Placeholder translation function - needs proper implementation.
 * @param {String} str the actual message
 * @param {String ...} arguments all additional arguments a put inside the str argument by use of %s or $1,$2 etc.
 * @type String the formatted string
 */
var _ = function() {
    var out = arguments[0];
    if (!out)
        throw "Missing text argument from translation method";
    var args = [];
    for(var i = 1;i < arguments.length;i++) {
        args.push(arguments[i]);
    }
    
    return String.prototype.format.apply(out,args);
};


/* Date Format Extension */

Date.monthNames = [
    _('January'),
    _('February'),
    _('March'),
    _('April'),
    _('May'),
    _('June'),
    _('July'),
    _('August'),
    _('September'),
    _('October'),
    _('November'),
    _('December')
];

Date.dayNames = [
    _('Sunday'),
    _('Monday'),
    _('Tueday'),
    _('Wednesday'),
    _('Thursday'),
    _('Friday'),
    _('Saturday')
];

//Default formats
Date.DATE = 'yyyy-MM-dd';
Date.DATETIME = 'yyyy-MM-dd HH:mm:ss';
Date.TIME = 'HH:mm:ss';

Date.prototype.format = function(format) {
    var year = this.getFullYear()+"";
    var monthName = Date.monthNames[this.getMonth()];
    var weekName = Date.dayNames[this.getDay()];
    var zf = function(num) {
        if (num < 10)
            return "0"+num;
        return ""+num;
    }
    return format
            .replace(/\byyyy\b/g,year)
            .replace(/\byy\b/g,year.substr(2))
            .replace(/\bMMMM\b/g,monthName)
            .replace(/\bMMM\b/g,monthName.substr(0,3))
            .replace(/\bMM\b/g,zf(this.getMonth()+1))
            .replace(/\bM\b/g,this.getMonth()+1)
            .replace(/\bdd\b/g,zf(this.getDate()))
            .replace(/\bd\b/g,this.getDate())
            .replace(/\bEEEE+\b/g,weekName)
            .replace(/\bEEE\b/g,weekName.substr(0,3))
            .replace(/\baa\b/g,this.getHours() > 12 ? 'PM' : 'AM')
            .replace(/\bHH\b/g,zf(this.getHours()))
            .replace(/\bH\b/g,this.getHours())
            .replace(/\bkk\b/g,zf(this.getHours()+1))
            .replace(/\bk\b/g,this.getHours()+1)
            .replace(/\bKK\b/g,zf(this.getHours()%12))
            .replace(/\bK\b/g,this.getHours()%12)
            .replace(/\bhh\b/g,zf((this.getHours()+1)%12))
            .replace(/\bh\b/g,(this.getHours()+1)%12)
            .replace(/\bmm\b/g,zf(this.getMinutes()))
            .replace(/\bm\b/g,this.getMinutes())
            .replace(/\bss\b/g,zf(this.getSeconds()))
            .replace(/\bs\b/g,this.getSeconds())
            .replace(/\bSS\b/g,zf(this.getMilliseconds()))
            .replace(/\bS\b/g,this.getMilliseconds());

};