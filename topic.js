var topic = (function (glob) {
    'use strict';

    var _topics = {};
    var _patterns = {keys: []}; // TODO: maybe we should just store all topics in _topics and just have globbing keys for iteration here

    var publish = function (topic) {
        var callbacks = [],
            args = Array.prototype.slice.call(arguments, 1);
        if (_topics.hasOwnProperty(topic)) {
            callbacks = callbacks.concat(_topics[topic]);
        }

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
        if (glob.hasGlobbing(topic)) {
            // do something special so we remember what topics are globbed
            if (!_patterns[topic]) {
                _patterns[topic] = {
                    regex: new RegExp(glob.globToRegex(topic)),
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
        var i,
            len;
        if (glob.hasGlobbing(topic)) {
            // do whatever special clean up I need to do for patterns
            if (!_patterns[topic]) {
                return false;
            }
            for (i = 0, len = _patterns[topic].callbacks.length; i < len; i++) {
                if (_patterns[topic].callbacks[i] === callback) {
                    _patterns[topic].callbacks.splice(i, 1);
                    return true;
                }
            }
        } else {
            if (!_topics[topic]) {
                return false;
            }
            for (i = 0, len = _topics[topic].length; i < len; i++) {
                if (_topics[topic][i] === callback) {
                    _topics[topic].splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    };

    return {
        publish: publish,
        subscribe: subscribe,
        unsubscribe: unsubscribe
    };
}(glob));

