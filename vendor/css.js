;(function(context) {
    var updateCssPaths = function(cssText, callback) {
        return cssText.replace(/url\(\s*(["']?)([^\1)]+)\1\s*\)/g,
                function(match, quote, url, index, cssText) {
                    return ['url(', quote, callback(url), quote, ')'].join('');
                });
    };
    if (require && typeof define === 'function' && define.amd) {
        context.updateCssPaths = updateCssPaths;
    } else {
        exports.updateCssPaths = updateCssPaths;
    }
})(this);
/**
 * @license RequireCSS 0.3.1 Copyright (c) 2011, VIISON All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/VIISON/RequireCSS for details
 *
 * This version has been modified by StoredIQ to allow loading CSS as text in
 * <style> tags and avoid JS errors (see loadCssAsText() below).
 */

/*jslint forin: true */
/*global document: true, setTimeout: true, define: true */

;(function (global) {
    "use strict";

    var loadAsStyleTags, maxNumStyleSheets, head, nativeLoad, a, TEXT = 3,
        doc = global.document;

    if (doc) {
        head = doc.head || doc.getElementsByTagName('head')[0];
        // Eliminate browsers that admit to not support the link load event (e.g. Firefox < 9)
        nativeLoad = doc.createElement('link').onload === null ? undefined : false;
        a = doc.createElement('a');
    }

    function isObject(obj) {
        return obj === Object(obj);
    }

    function basename(path) {
        var i = path.length-1;
        while (path[i--] !== '/');
        return path.slice(0, i+1);
    }

    function ieVersion() {
        if (navigator.appName === 'Microsoft Internet Explorer') {
            var matches = navigator.userAgent.match(/MSIE (?:(\d+)[\.\d]*)/);
            if (matches && matches[1]) {
                return parseFloat(matches[1], 10);
            }
        }
        return Number.MAX_VALUE;
    }

    function styleSheets() {
        var i, len, node, childNodes = head.childNodes, ret = [];
        for (i = 0, len = childNodes.length; i < len; i++) {
            node = childNodes[i];
            if (node.nodeType !== TEXT) {
                if (node.tagName.toLowerCase() === 'style' ||
                    (node.tagName.toLowerCase() === 'link' &&
                     node.getAttribute('rel') === 'stylesheet')) {
                    ret.push(node);
                }
            }
        }
        return ret;
    }

    function createLink(url) {
        var link = doc.createElement('link');

        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = url;

        return link;
    }

    function styleSheetLoaded(url) {
        var i;

        // Get absolute url by assigning to a link and reading it back below
        a.href = url;

        for (i in doc.styleSheets) {
            if (doc.styleSheets[i].href === a.href) {
                return true;
            }
        }

        return false;
    }

    // we want to support adding an ordering parameter to the css, so that we
    // can enforce a global ordering like so:
    //
    //  'css!100:style1.css'
    //  'css!200:style2.css'
    //
    // in this case style1.css would always come before style2.css in the
    // <head> even if it was loaded second
    function appendToHead(el, order) {
        var i, child, len, children = head.childNodes, tag, curOrder, inserted;

        order = order || 0;
        el.setAttribute('data-order', order);
        for (i = 0, len = children.length; i < len; i++) {
            child = children[i];
            if (child.nodeType === 3) {
                continue; // skip text nodes
            }
            tag = child.tagName.toLowerCase();
            if (tag === 'style' || (tag === 'link' && /css/i.test(child.type))) {
                curOrder = +child.getAttribute('data-order');
                if (curOrder > order) {
                    inserted = head.insertBefore(el, child);
                    break;
                }
            }
        }
        if (!inserted) {
            head.appendChild(el);
        }
    }

    // Load using the browsers built-in load event on link tags
    function loadLink(url, load, config, order) {
        var link = createLink(url);

        link.onload = function () {
            load();
        };

        appendToHead(link, order);
    }

    // Insert a script tag and use it's onload & onerror to know when the CSS
    // is loaded, this will unfortunately also fire on other errors (file not
    // found, network problems)
    function loadScript(url, load) {
        var link = createLink(url),
            script = doc.createElement('script');

        head.appendChild(link);

        script.onload = script.onerror = function () {
            head.removeChild(script);

            // In Safari the stylesheet might not yet be applied, when
            // the script is loaded so we poll document.styleSheets for it
            var checkLoaded = function () {
                if (styleSheetLoaded(url)) {
                    load();

                    return;
                }

                setTimeout(checkLoaded, 25);
            };
            checkLoaded();
        };
        script.src = url;

        head.appendChild(script);
    }

    // This was added for StoredIQ, since we can't have JS errors caused by
    // loading CSS as JS.
    function loadCssAsText(url, req, load, config, order) {
        req(['text!' + url], function(text) {
            if (text.replace(/^\s+|\s+$/g,"") === '') {
                load();
            }

            var css = document.createElement('style');
            css.setAttribute('type', 'text/css');
            css.setAttribute('data-sourceurl', url);

            if (typeof window.updateCssPaths !== 'undefined') {
                text = window.updateCssPaths(text, function(cssUrl) {
                    return (/^https?:|^data:|^file:|^\//).test(cssUrl)?
                        cssUrl : basename(url) + '/' + cssUrl;
                });
            }

            // i don't think this works like it does for JS eval()...
            text += '\n/*@ sourceURL='+url+' */\n';

            if (css.styleSheet) { // b/c of IE...
                css.styleSheet.cssText = text;
            } else {
                css.innerHTML = text;
            }

            appendToHead(css, order);

            // webkit sometimes doesn't fully load the style even though the
            // tag has been appended to the head.  append a dummy style and
            // remove it to ensure that the require'ed style is processesed
            // setTimeout(function() {
            //     var dummyStyle = document.createElement('style');
            //     appendToHead(dummyStyle, order);
            //     setTimeout(function() {
            //         head.removeChild(dummyStyle);
            //         setTimeout(load, 0);
            //     }, 0);
            // }, 0);
            doc.body.style.visibility = 'hidden';
            setTimeout(function() {
                doc.body.style.visibility = '';
                setTimeout(load, 150);
            }, 150);
        });
    }

    function loadSwitch(url, req, load, config, order) {
        var sheets = styleSheets();
        if (!loadAsStyleTags && nativeLoad && sheets.length < maxNumStyleSheets) {
            loadLink(url, load, config, order);
        } else {
            // loadScript(url, load);
            loadCssAsText(url, req, load, config, order);
        }
    }

    define(function () {
        var css;

        css = {
            version: '0.3.1',

            load: function (name, req, load, config) {

                // if we're not in a browser environment, then we don't need to
                // do anything/load anything else, so just return
                if (typeof doc === 'undefined') {
                    load();
                    return;
                }

                var url, order, split = name.split(':');

                if (typeof config.maxNumStyleSheets !== 'undefined') {
                    maxNumStyleSheets = config.maxNumStyleSheets;
                } else if (typeof maxNumStyleSheets === 'undefined') {
                    maxNumStyleSheets = ieVersion() < 10? 28 : Number.MAX_VALUE;
                }

                if (isObject(config.css)) {
                    loadAsStyleTags = config.css.loadAsStyleTags;
                }

                // pull off the optional ordering from the name, something like
                // the '100' in 'css!100:style.css'
                if (name.indexOf(':') >= 0) {
                    name = split[1];
                    order = +split[0];
                } else {
                    name = split[0];
                }

                // convert name to actual url
                url = req.toUrl(/\.css$/.test(name) ? name : name + '.css');

                // Test if the browser supports the link load event,
                // in case we don't know yet (mostly WebKit)
                if (nativeLoad === undefined) {
                    // Create a link element with a data url,
                    // it would fire a load event immediately
                    var link = createLink('data:text/css,');

                    link.onload = function () {
                        // Native link load event works
                        nativeLoad = true;
                    };

                    head.appendChild(link);

                    // Schedule function in event loop, this will
                    // execute after a potential execution of the link onload
                    setTimeout(function () {
                        head.removeChild(link);

                        if (nativeLoad !== true) {
                            // Native link load event is broken
                            nativeLoad = false;
                        }

                        loadSwitch(url, req, load, config, order);
                    }, 0);
                } else {
                    loadSwitch(url, req, load, config, order);
                }
            },

            normalize: function(name, normalize) {
                var rest = name, order = '0', split = name.split(':');
                if (split.length > 1) {
                    order = split[0];
                    rest = split.slice(1).join(':');
                }
                return order + ':' + normalize(rest);
            },

            write: function (pluginName, moduleName, write) {
                write("define('" + pluginName + "!" + moduleName +
                      "', function () { return '';});\n");
            }
        };

        return css;
    });
})(this);

