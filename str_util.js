"use strict";

module.exports = {
    /**
     * Replaces tokens of the form {N} where N indicates the index of the value to use
     * for replacement. Replacement values are passed as parameters to the function.
     * @param {String} str
     * String to be formatted. All the known tokens present in 'str' are replaced with
     * the values given by the rest of the function arguments.
     * @param {*} [subs...]
     * Values to be used during substitution.
     * @return {String}
     * Returns the formatted string.
     * @example
     *  <caption>Converts text="Name: {{0}}, Last: {{1}}, Age: {{2}}" into
     *  formatted_text="Name: John, Last: Doe, Age: 43"</caption>
     *      let date_util = require("twt/date_util");
     *      let person = { Name: "John", Last: "Doe", Age: 43 };
     *      let text = "Name: {{0}}, Last: {{1}}, Age: {{2}}";
     *      let formatted_text = str_util.format(text, person.Name, person.Last person.Age);
     */
    format: function (str, subs /*, [subs2, ...]*/) {
        if (0 === arguments.length)
            throw new Error("Invalid call to 'str_util.format', no string was supplied");

        if (!str.toString)
            throw new Error("Invalid call to 'str_util.format', the 'str' parameter " +
                "must be a 'String' or support the 'toString' method.");


        str = str.toString();       // Make sure we have a string to work with
        if (1 === arguments.length)
            return str;

        let args = Array.prototype.slice.call(arguments).slice(1, arguments.length);
        if ("function" === typeof arguments[1])
            throw new Error("Invalid call to 'str_util.format', the first substitution " +
                "value is a function. Use 'expand' to use a substitution function.");

        return str.replace(/{{([^}}]+)}}/g, function (match, token) {
            let number = Number(token.trim());
            if (isNaN(number))
                return match;

            if (number < args.length)
                return args[number];

            return match;
        });
    }

};
