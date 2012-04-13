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
    for(var i = 1;i < arguments.length;i++) {
        out = out.replace('%s', arguments[i])
                .replace('$'+i, arguments[i]);
    }
    
    return out;
}
