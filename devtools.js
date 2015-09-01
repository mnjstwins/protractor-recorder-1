// Copyright (c) 2015 @katspaugh
// Use of this source code is governed by the BSD license

// Code that runs in the context of the inspected page
var page = {
    addListeners: function () {
        var getUniqSelector = function (target) {
            if (target == document) {
                return 'body';
            }

            var id = target.id;
            if (id) {
                return '#' + id;
            }

            var attrs = [
                'ng-click',
                'ng-model',
                'ng-href',
                'href',
                'name',
                'class'
            ];

            var attrName = attrs.filter(function (name) {
                return target.getAttribute(name);
            })[0];

            if (attrName) {
                return '[' + attrName + '="' + target.getAttribute(attrName) + '"]';
            }

            return getUniqSelector(target.parentNode) + '>' + target.tagName;
        };

        var currentLocation = window.location.hash;
        var output = function (selector, eventName, options) {
            var options = options || {};  //options ||= {};
            var result = {
                    'event': eventName,
                    'selector': 'element(by.css(\'' + selector + '\')',
                    'previous_url': currentLocation,
                    'current_url': (currentLocation = window.location.hash)
                };

            // Extend output with additional information
            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    result[key] = options[key];
                }
            }

            return result;
        };

        var listeners = {
            click: function (e) {
                //inspect(e.target);

                var options = {};

                // @todo This can be strongly improved
                if (e.target.attributes['ng-href']) {
                  options['ng-href'] = e.target.attributes['ng-href'].value;
                }
                else if (e.target.attributes['ng-click']) {
                  options['ng-click'] = e.target.attributes['ng-click'].value;
                }

                console.table([ output(getUniqSelector(e.target), 'click()', options) ]);

                // console.log(
                //     'element(by.css(\'' + getUniqSelector(e.target) + '\').click()'
                // );
            }
        }

        for (var event in listeners) {
            document.addEventListener(event, listeners[event]);
        }

        return actions;
    }
};

chrome.devtools.panels.create(
    'Protractor Recorder',
    '',
    'panel.html',

    function (panel) {
        var actions = chrome.devtools.inspectedWindow.eval(
            '(' + page.addListeners.toString() + ')()'
        );
    }
);
