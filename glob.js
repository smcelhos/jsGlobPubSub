var glob = (function () {
    'use strict';
    var GLOB_PATTERN_CHECK = /[*?\[]/;

    var hasGlobbing = function (s) {
        return !!GLOB_PATTERN_CHECK.exec(s);
    };

    var escapeRegExp = function (str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };
    /**
     * Translate a glob to a regex
     */
    var globToRegex = function (pat) {
        // Adapted from python fnmatch
        var i = 0,
            j,
            c,
            n = pat.length,
            res = '',
            stuff;
        while (i < n) {
            c = pat[i];
            ++i;
            if (c === '*') {
                res += '.*';
            } else if (c === '?') {
                res += '.';
            } else if (c === '[') {
                j = i;
                if (j < n && pat[j] === '!') {
                    ++j;
                }
                if (j < n && pat[j]) {
                    ++j;
                }
                while (j < n && pat[j] !== ']') {
                    ++j;
                }
                if (j >= n) {
                    res += '\\[';
                } else {
                    stuff = pat.substring(i, j).replace(/\\/g, '\\\\');
                    i = j + 1;
                    if (stuff[0] === '!') {
                        stuff = '^' + stuff.substring(1);
                    } else if (stuff[0] === '^') {
                        stuff = '\\' + stuff;
                    }
                    res = res + '[' + stuff + ']';
                }
            } else {
                res = res + escapeRegExp(c);
            }

        }
        return res + '$';
    };

    return {
        hasGlobbing: hasGlobbing,
        globToRegex: globToRegex
    };

}());