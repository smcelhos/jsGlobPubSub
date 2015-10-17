(function () {
    'use strict';

    var _topics = {};
    var _patterns = {keys: []}; // TODO: maybe we should just store all topics in _topics and just have globbing keys for iteration here
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
    var translate = function (pat) {
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

    var publish = function (topic) {
        var callbacks = [],
            args = Array.prototype.slice.call(arguments, 1);
        if (_topics.hasOwnProperty(topic)) {
            callbacks = callbacks.concat(_topics[topic]);
        }
        // TODO: add matching globs to callbacks
        _patterns.keys.forEach(function (pattern) {
            if (_patterns[pattern].regex.exec(topic)) {
                callbacks = callbacks.concat(_patterns[pattern].callbacks);
            }
        });

        if (!callbacks.length) {
            return false;
        }

        callbacks.forEach(function (func) {
            func.apply(undefined, args);
        });

        return true;
    };
    var subscribe = function (topic, callback) {
        if (hasGlobbing(topic)) {
            // do something special so we remember what topics are globbed
            if (!_patterns[topic]) {
                _patterns[topic] = {
                    regex: new RegExp(translate(topic)),
                    callbacks: []
                };
                _patterns.keys.push(topic);
            }
            _patterns[topic].callbacks.push(callback);
            return true;
        }

        if (!_topics.hasOwnProperty(topic)) {
            _topics[topic] = [];
        }
        _topics[topic].push(callback);
        return true;
    };

    var unsubscribe = function (topic, callback) {
        if (hasGlobbing(topic)) {
            // do whatever special clean up I need to do for
        }

    };

    return {
        publish: publish,
        subscribe: subscribe,
        unsubscribe: unsubscribe
    };
}());

