(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var TAU, cos, sin;

cos = Math.cos, sin = Math.sin;

TAU = Math.PI * 2;

module.exports = function(options) {
  var angle, angles, distanceFromCenter, pairs, vertices;
  if (options == null) {
    options = {};
  }
  angles = (function() {
    var _i, _ref, _results;
    _results = [];
    for (angle = _i = 0, _ref = TAU / options.vertices; _ref > 0 ? _i < TAU : _i > TAU; angle = _i += _ref) {
      _results.push(angle);
    }
    return _results;
  })();
  pairs = [];
  vertices = [
    {
      x: midX,
      y: midY
    }
  ];
  distanceFromCenter = 50;
  angles.forEach(function(angle) {
    var vertex, x, y;
    x = cos(angle) * distanceFromCenter + midX;
    y = sin(angle) * distanceFromCenter + midY;
    vertex = {
      x: x,
      y: y
    };
    vertices.forEach(function(v) {
      return pairs.push([vertex, v]);
    });
    return vertices.push(vertex);
  });
  return {
    vertices: vertices,
    pairs: pairs
  };
};


},{}],2:[function(require,module,exports){
module.exports = function() {
  var queue, self;
  queue = [];
  return self = {
    push: function(fn) {
      return queue.push(fn);
    },
    next: function() {
      if (queue.length) {
        return queue.shift().call();
      }
    },
    start: function() {
      return self.next();
    }
  };
};


},{}],3:[function(require,module,exports){
// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ┌────────────────────────────────────────────────────────────┐ \\
// │ Eve 0.4.2 - JavaScript Events Library                      │ \\
// ├────────────────────────────────────────────────────────────┤ \\
// │ Author Dmitry Baranovskiy (http://dmitry.baranovskiy.com/) │ \\
// └────────────────────────────────────────────────────────────┘ \\

(function (glob) {
    var version = "0.4.2",
        has = "hasOwnProperty",
        separator = /[\.\/]/,
        wildcard = "*",
        fun = function () {},
        numsort = function (a, b) {
            return a - b;
        },
        current_event,
        stop,
        events = {n: {}},
    /*\
     * eve
     [ method ]

     * Fires event with given `name`, given scope and other parameters.

     > Arguments

     - name (string) name of the *event*, dot (`.`) or slash (`/`) separated
     - scope (object) context for the event handlers
     - varargs (...) the rest of arguments will be sent to event handlers

     = (object) array of returned values from the listeners
    \*/
        eve = function (name, scope) {
			name = String(name);
            var e = events,
                oldstop = stop,
                args = Array.prototype.slice.call(arguments, 2),
                listeners = eve.listeners(name),
                z = 0,
                f = false,
                l,
                indexed = [],
                queue = {},
                out = [],
                ce = current_event,
                errors = [];
            current_event = name;
            stop = 0;
            for (var i = 0, ii = listeners.length; i < ii; i++) if ("zIndex" in listeners[i]) {
                indexed.push(listeners[i].zIndex);
                if (listeners[i].zIndex < 0) {
                    queue[listeners[i].zIndex] = listeners[i];
                }
            }
            indexed.sort(numsort);
            while (indexed[z] < 0) {
                l = queue[indexed[z++]];
                out.push(l.apply(scope, args));
                if (stop) {
                    stop = oldstop;
                    return out;
                }
            }
            for (i = 0; i < ii; i++) {
                l = listeners[i];
                if ("zIndex" in l) {
                    if (l.zIndex == indexed[z]) {
                        out.push(l.apply(scope, args));
                        if (stop) {
                            break;
                        }
                        do {
                            z++;
                            l = queue[indexed[z]];
                            l && out.push(l.apply(scope, args));
                            if (stop) {
                                break;
                            }
                        } while (l)
                    } else {
                        queue[l.zIndex] = l;
                    }
                } else {
                    out.push(l.apply(scope, args));
                    if (stop) {
                        break;
                    }
                }
            }
            stop = oldstop;
            current_event = ce;
            return out.length ? out : null;
        };
		// Undocumented. Debug only.
		eve._events = events;
    /*\
     * eve.listeners
     [ method ]

     * Internal method which gives you array of all event handlers that will be triggered by the given `name`.

     > Arguments

     - name (string) name of the event, dot (`.`) or slash (`/`) separated

     = (array) array of event handlers
    \*/
    eve.listeners = function (name) {
        var names = name.split(separator),
            e = events,
            item,
            items,
            k,
            i,
            ii,
            j,
            jj,
            nes,
            es = [e],
            out = [];
        for (i = 0, ii = names.length; i < ii; i++) {
            nes = [];
            for (j = 0, jj = es.length; j < jj; j++) {
                e = es[j].n;
                items = [e[names[i]], e[wildcard]];
                k = 2;
                while (k--) {
                    item = items[k];
                    if (item) {
                        nes.push(item);
                        out = out.concat(item.f || []);
                    }
                }
            }
            es = nes;
        }
        return out;
    };
    
    /*\
     * eve.on
     [ method ]
     **
     * Binds given event handler with a given name. You can use wildcards “`*`” for the names:
     | eve.on("*.under.*", f);
     | eve("mouse.under.floor"); // triggers f
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) returned function accepts a single numeric parameter that represents z-index of the handler. It is an optional feature and only used when you need to ensure that some subset of handlers will be invoked in a given order, despite of the order of assignment. 
     > Example:
     | eve.on("mouse", eatIt)(2);
     | eve.on("mouse", scream);
     | eve.on("mouse", catchIt)(1);
     * This will ensure that `catchIt()` function will be called before `eatIt()`.
	 *
     * If you want to put your handler before non-indexed handlers, specify a negative value.
     * Note: I assume most of the time you don’t need to worry about z-index, but it’s nice to have this feature “just in case”.
    \*/
    eve.on = function (name, f) {
		name = String(name);
		if (typeof f != "function") {
			return function () {};
		}
        var names = name.split(separator),
            e = events;
        for (var i = 0, ii = names.length; i < ii; i++) {
            e = e.n;
            e = e.hasOwnProperty(names[i]) && e[names[i]] || (e[names[i]] = {n: {}});
        }
        e.f = e.f || [];
        for (i = 0, ii = e.f.length; i < ii; i++) if (e.f[i] == f) {
            return fun;
        }
        e.f.push(f);
        return function (zIndex) {
            if (+zIndex == +zIndex) {
                f.zIndex = +zIndex;
            }
        };
    };
    /*\
     * eve.f
     [ method ]
     **
     * Returns function that will fire given event with optional arguments.
	 * Arguments that will be passed to the result function will be also
	 * concated to the list of final arguments.
 	 | el.onclick = eve.f("click", 1, 2);
 	 | eve.on("click", function (a, b, c) {
 	 |     console.log(a, b, c); // 1, 2, [event object]
 	 | });
     > Arguments
	 - event (string) event name
	 - varargs (…) and any other arguments
	 = (function) possible event handler function
    \*/
	eve.f = function (event) {
		var attrs = [].slice.call(arguments, 1);
		return function () {
			eve.apply(null, [event, null].concat(attrs).concat([].slice.call(arguments, 0)));
		};
	};
    /*\
     * eve.stop
     [ method ]
     **
     * Is used inside an event handler to stop the event, preventing any subsequent listeners from firing.
    \*/
    eve.stop = function () {
        stop = 1;
    };
    /*\
     * eve.nt
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     > Arguments
     **
     - subname (string) #optional subname of the event
     **
     = (string) name of the event, if `subname` is not specified
     * or
     = (boolean) `true`, if current event’s name contains `subname`
    \*/
    eve.nt = function (subname) {
        if (subname) {
            return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(current_event);
        }
        return current_event;
    };
    /*\
     * eve.nts
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     **
     = (array) names of the event
    \*/
    eve.nts = function () {
        return current_event.split(separator);
    };
    /*\
     * eve.off
     [ method ]
     **
     * Removes given function from the list of event listeners assigned to given name.
	 * If no arguments specified all the events will be cleared.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
    \*/
    /*\
     * eve.unbind
     [ method ]
     **
     * See @eve.off
    \*/
    eve.off = eve.unbind = function (name, f) {
		if (!name) {
		    eve._events = events = {n: {}};
			return;
		}
        var names = name.split(separator),
            e,
            key,
            splice,
            i, ii, j, jj,
            cur = [events];
        for (i = 0, ii = names.length; i < ii; i++) {
            for (j = 0; j < cur.length; j += splice.length - 2) {
                splice = [j, 1];
                e = cur[j].n;
                if (names[i] != wildcard) {
                    if (e[names[i]]) {
                        splice.push(e[names[i]]);
                    }
                } else {
                    for (key in e) if (e[has](key)) {
                        splice.push(e[key]);
                    }
                }
                cur.splice.apply(cur, splice);
            }
        }
        for (i = 0, ii = cur.length; i < ii; i++) {
            e = cur[i];
            while (e.n) {
                if (f) {
                    if (e.f) {
                        for (j = 0, jj = e.f.length; j < jj; j++) if (e.f[j] == f) {
                            e.f.splice(j, 1);
                            break;
                        }
                        !e.f.length && delete e.f;
                    }
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        var funcs = e.n[key].f;
                        for (j = 0, jj = funcs.length; j < jj; j++) if (funcs[j] == f) {
                            funcs.splice(j, 1);
                            break;
                        }
                        !funcs.length && delete e.n[key].f;
                    }
                } else {
                    delete e.f;
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        delete e.n[key].f;
                    }
                }
                e = e.n;
            }
        }
    };
    /*\
     * eve.once
     [ method ]
     **
     * Binds given event handler with a given name to only run once then unbind itself.
     | eve.once("login", f);
     | eve("login"); // triggers f
     | eve("login"); // no listeners
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) same return function as @eve.on
    \*/
    eve.once = function (name, f) {
        var f2 = function () {
            eve.unbind(name, f2);
            return f.apply(this, arguments);
        };
        return eve.on(name, f2);
    };
    /*\
     * eve.version
     [ property (string) ]
     **
     * Current version of the library.
    \*/
    eve.version = version;
    eve.toString = function () {
        return "You are running Eve " + version;
    };
    (typeof module != "undefined" && module.exports) ? (module.exports = eve) : (typeof define != "undefined" ? (define("eve", [], function() { return eve; })) : (glob.eve = eve));
})(this);

},{}],4:[function(require,module,exports){
// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ "Raphaël 2.1.0" - JavaScript Vector Library                         │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

var eve = require('eve');

(function () {
    /*\
     * Raphael
     [ method ]
     **
     * Creates a canvas object on which to draw.
     * You must do this first, as all future calls to drawing methods
     * from this instance will be bound to this canvas.
     > Parameters
     **
     - container (HTMLElement|string) DOM element or its ID which is going to be a parent for drawing surface
     - width (number)
     - height (number)
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - x (number)
     - y (number)
     - width (number)
     - height (number)
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - all (array) (first 3 or 4 elements in the array are equal to [containerID, width, height] or [x, y, width, height]. The rest are element descriptions in format {type: type, <attributes>}). See @Paper.add.
     - callback (function) #optional callback function which is going to be executed in the context of newly created paper
     * or
     - onReadyCallback (function) function that is going to be called on DOM ready event. You can also subscribe to this event via Eve’s “DOMLoad” event. In this case method returns `undefined`.
     = (object) @Paper
     > Usage
     | // Each of the following examples create a canvas
     | // that is 320px wide by 200px high.
     | // Canvas is created at the viewport’s 10,50 coordinate.
     | var paper = Raphael(10, 50, 320, 200);
     | // Canvas is created at the top left corner of the #notepad element
     | // (or its top right corner in dir="rtl" elements)
     | var paper = Raphael(document.getElementById("notepad"), 320, 200);
     | // Same as above
     | var paper = Raphael("notepad", 320, 200);
     | // Image dump
     | var set = Raphael(["notepad", 320, 200, {
     |     type: "rect",
     |     x: 10,
     |     y: 10,
     |     width: 25,
     |     height: 25,
     |     stroke: "#f00"
     | }, {
     |     type: "text",
     |     x: 30,
     |     y: 40,
     |     text: "Dump"
     | }]);
    \*/
    function R(first) {
        if (R.is(first, "function")) {
            return loaded ? first() : eve.on("raphael.DOMload", first);
        } else if (R.is(first, array)) {
            return R._engine.create[apply](R, first.splice(0, 3 + R.is(first[0], nu))).add(first);
        } else {
            var args = Array.prototype.slice.call(arguments, 0);
            if (R.is(args[args.length - 1], "function")) {
                var f = args.pop();
                return loaded ? f.call(R._engine.create[apply](R, args)) : eve.on("raphael.DOMload", function () {
                    f.call(R._engine.create[apply](R, args));
                });
            } else {
                return R._engine.create[apply](R, arguments);
            }
        }
    }
    R.version = "2.1.0";
    R.eve = eve;
    var loaded,
        separator = /[, ]+/,
        elements = {circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1},
        formatrg = /\{(\d+)\}/g,
        proto = "prototype",
        has = "hasOwnProperty",
        g = {
            doc: document,
            win: window
        },
        oldRaphael = {
            was: Object.prototype[has].call(g.win, "Raphael"),
            is: g.win.Raphael
        },
        Paper = function () {
            /*\
             * Paper.ca
             [ property (object) ]
             **
             * Shortcut for @Paper.customAttributes
            \*/
            /*\
             * Paper.customAttributes
             [ property (object) ]
             **
             * If you have a set of attributes that you would like to represent
             * as a function of some number you can do it easily with custom attributes:
             > Usage
             | paper.customAttributes.hue = function (num) {
             |     num = num % 1;
             |     return {fill: "hsb(" + num + ", 0.75, 1)"};
             | };
             | // Custom attribute “hue” will change fill
             | // to be given hue with fixed saturation and brightness.
             | // Now you can use it like this:
             | var c = paper.circle(10, 10, 10).attr({hue: .45});
             | // or even like this:
             | c.animate({hue: 1}, 1e3);
             | 
             | // You could also create custom attribute
             | // with multiple parameters:
             | paper.customAttributes.hsb = function (h, s, b) {
             |     return {fill: "hsb(" + [h, s, b].join(",") + ")"};
             | };
             | c.attr({hsb: "0.5 .8 1"});
             | c.animate({hsb: [1, 0, 0.5]}, 1e3);
            \*/
            this.ca = this.customAttributes = {};
        },
        paperproto,
        appendChild = "appendChild",
        apply = "apply",
        concat = "concat",
        supportsTouch = "createTouch" in g.doc,
        E = "",
        S = " ",
        Str = String,
        split = "split",
        events = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel"[split](S),
        touchMap = {
            mousedown: "touchstart",
            mousemove: "touchmove",
            mouseup: "touchend"
        },
        lowerCase = Str.prototype.toLowerCase,
        math = Math,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        pow = math.pow,
        PI = math.PI,
        nu = "number",
        string = "string",
        array = "array",
        toString = "toString",
        fillString = "fill",
        objectToString = Object.prototype.toString,
        paper = {},
        push = "push",
        ISURL = R._ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
        colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,
        isnan = {"NaN": 1, "Infinity": 1, "-Infinity": 1},
        bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
        round = math.round,
        setAttribute = "setAttribute",
        toFloat = parseFloat,
        toInt = parseInt,
        upperCase = Str.prototype.toUpperCase,
        availableAttrs = R._availableAttrs = {
            "arrow-end": "none",
            "arrow-start": "none",
            blur: 0,
            "clip-rect": "0 0 1e9 1e9",
            cursor: "default",
            cx: 0,
            cy: 0,
            fill: "#fff",
            "fill-opacity": 1,
            font: '10px "Arial"',
            "font-family": '"Arial"',
            "font-size": "10",
            "font-style": "normal",
            "font-weight": 400,
            gradient: 0,
            height: 0,
            href: "http://raphaeljs.com/",
            "letter-spacing": 0,
            opacity: 1,
            path: "M0,0",
            r: 0,
            rx: 0,
            ry: 0,
            src: "",
            stroke: "#000",
            "stroke-dasharray": "",
            "stroke-linecap": "butt",
            "stroke-linejoin": "butt",
            "stroke-miterlimit": 0,
            "stroke-opacity": 1,
            "stroke-width": 1,
            target: "_blank",
            "text-anchor": "middle",
            title: "Raphael",
            transform: "",
            width: 0,
            x: 0,
            y: 0
        },
        availableAnimAttrs = R._availableAnimAttrs = {
            blur: nu,
            "clip-rect": "csv",
            cx: nu,
            cy: nu,
            fill: "colour",
            "fill-opacity": nu,
            "font-size": nu,
            height: nu,
            opacity: nu,
            path: "path",
            r: nu,
            rx: nu,
            ry: nu,
            stroke: "colour",
            "stroke-opacity": nu,
            "stroke-width": nu,
            transform: "transform",
            width: nu,
            x: nu,
            y: nu
        },
        whitespace = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]/g,
        commaSpaces = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/,
        hsrg = {hs: 1, rg: 1},
        p2s = /,?([achlmqrstvxz]),?/gi,
        pathCommand = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        tCommand = /([rstm])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
        pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig,
        radial_gradient = R._radial_gradient = /^r(?:\(([^,]+?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*([^\)]+?)\))?/,
        eldata = {},
        sortByKey = function (a, b) {
            return a.key - b.key;
        },
        sortByNumber = function (a, b) {
            return toFloat(a) - toFloat(b);
        },
        fun = function () {},
        pipe = function (x) {
            return x;
        },
        rectPath = R._rectPath = function (x, y, w, h, r) {
            if (r) {
                return [["M", x + r, y], ["l", w - r * 2, 0], ["a", r, r, 0, 0, 1, r, r], ["l", 0, h - r * 2], ["a", r, r, 0, 0, 1, -r, r], ["l", r * 2 - w, 0], ["a", r, r, 0, 0, 1, -r, -r], ["l", 0, r * 2 - h], ["a", r, r, 0, 0, 1, r, -r], ["z"]];
            }
            return [["M", x, y], ["l", w, 0], ["l", 0, h], ["l", -w, 0], ["z"]];
        },
        ellipsePath = function (x, y, rx, ry) {
            if (ry == null) {
                ry = rx;
            }
            return [["M", x, y], ["m", 0, -ry], ["a", rx, ry, 0, 1, 1, 0, 2 * ry], ["a", rx, ry, 0, 1, 1, 0, -2 * ry], ["z"]];
        },
        getPath = R._getPath = {
            path: function (el) {
                return el.attr("path");
            },
            circle: function (el) {
                var a = el.attrs;
                return ellipsePath(a.cx, a.cy, a.r);
            },
            ellipse: function (el) {
                var a = el.attrs;
                return ellipsePath(a.cx, a.cy, a.rx, a.ry);
            },
            rect: function (el) {
                var a = el.attrs;
                return rectPath(a.x, a.y, a.width, a.height, a.r);
            },
            image: function (el) {
                var a = el.attrs;
                return rectPath(a.x, a.y, a.width, a.height);
            },
            text: function (el) {
                var bbox = el._getBBox();
                return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
            },
            set : function(el) {
                var bbox = el._getBBox();
                return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
            }
        },
        /*\
         * Raphael.mapPath
         [ method ]
         **
         * Transform the path string with given matrix.
         > Parameters
         - path (string) path string
         - matrix (object) see @Matrix
         = (string) transformed path string
        \*/
        mapPath = R.mapPath = function (path, matrix) {
            if (!matrix) {
                return path;
            }
            var x, y, i, j, ii, jj, pathi;
            path = path2curve(path);
            for (i = 0, ii = path.length; i < ii; i++) {
                pathi = path[i];
                for (j = 1, jj = pathi.length; j < jj; j += 2) {
                    x = matrix.x(pathi[j], pathi[j + 1]);
                    y = matrix.y(pathi[j], pathi[j + 1]);
                    pathi[j] = x;
                    pathi[j + 1] = y;
                }
            }
            return path;
        };

    R._g = g;
    /*\
     * Raphael.type
     [ property (string) ]
     **
     * Can be “SVG”, “VML” or empty, depending on browser support.
    \*/
    R.type = (g.win.SVGAngle || g.doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
    if (R.type == "VML") {
        var d = g.doc.createElement("div"),
            b;
        d.innerHTML = '<v:shape adj="1"/>';
        b = d.firstChild;
        b.style.behavior = "url(#default#VML)";
        if (!(b && typeof b.adj == "object")) {
            return (R.type = E);
        }
        d = null;
    }
    /*\
     * Raphael.svg
     [ property (boolean) ]
     **
     * `true` if browser supports SVG.
    \*/
    /*\
     * Raphael.vml
     [ property (boolean) ]
     **
     * `true` if browser supports VML.
    \*/
    R.svg = !(R.vml = R.type == "VML");
    R._Paper = Paper;
    /*\
     * Raphael.fn
     [ property (object) ]
     **
     * You can add your own method to the canvas. For example if you want to draw a pie chart,
     * you can create your own pie chart function and ship it as a Raphaël plugin. To do this
     * you need to extend the `Raphael.fn` object. You should modify the `fn` object before a
     * Raphaël instance is created, otherwise it will take no effect. Please note that the
     * ability for namespaced plugins was removed in Raphael 2.0. It is up to the plugin to
     * ensure any namespacing ensures proper context.
     > Usage
     | Raphael.fn.arrow = function (x1, y1, x2, y2, size) {
     |     return this.path( ... );
     | };
     | // or create namespace
     | Raphael.fn.mystuff = {
     |     arrow: function () {…},
     |     star: function () {…},
     |     // etc…
     | };
     | var paper = Raphael(10, 10, 630, 480);
     | // then use it
     | paper.arrow(10, 10, 30, 30, 5).attr({fill: "#f00"});
     | paper.mystuff.arrow();
     | paper.mystuff.star();
    \*/
    R.fn = paperproto = Paper.prototype = R.prototype;
    R._id = 0;
    R._oid = 0;
    /*\
     * Raphael.is
     [ method ]
     **
     * Handfull replacement for `typeof` operator.
     > Parameters
     - o (…) any object or primitive
     - type (string) name of the type, i.e. “string”, “function”, “number”, etc.
     = (boolean) is given value is of given type
    \*/
    R.is = function (o, type) {
        type = lowerCase.call(type);
        if (type == "finite") {
            return !isnan[has](+o);
        }
        if (type == "array") {
            return o instanceof Array;
        }
        return  (type == "null" && o === null) ||
                (type == typeof o && o !== null) ||
                (type == "object" && o === Object(o)) ||
                (type == "array" && Array.isArray && Array.isArray(o)) ||
                objectToString.call(o).slice(8, -1).toLowerCase() == type;
    };

    function clone(obj) {
        if (Object(obj) !== obj) {
            return obj;
        }
        var res = new obj.constructor;
        for (var key in obj) if (obj[has](key)) {
            res[key] = clone(obj[key]);
        }
        return res;
    }

    /*\
     * Raphael.angle
     [ method ]
     **
     * Returns angle between two or three points
     > Parameters
     - x1 (number) x coord of first point
     - y1 (number) y coord of first point
     - x2 (number) x coord of second point
     - y2 (number) y coord of second point
     - x3 (number) #optional x coord of third point
     - y3 (number) #optional y coord of third point
     = (number) angle in degrees.
    \*/
    R.angle = function (x1, y1, x2, y2, x3, y3) {
        if (x3 == null) {
            var x = x1 - x2,
                y = y1 - y2;
            if (!x && !y) {
                return 0;
            }
            return (180 + math.atan2(-y, -x) * 180 / PI + 360) % 360;
        } else {
            return R.angle(x1, y1, x3, y3) - R.angle(x2, y2, x3, y3);
        }
    };
    /*\
     * Raphael.rad
     [ method ]
     **
     * Transform angle to radians
     > Parameters
     - deg (number) angle in degrees
     = (number) angle in radians.
    \*/
    R.rad = function (deg) {
        return deg % 360 * PI / 180;
    };
    /*\
     * Raphael.deg
     [ method ]
     **
     * Transform angle to degrees
     > Parameters
     - deg (number) angle in radians
     = (number) angle in degrees.
    \*/
    R.deg = function (rad) {
        return rad * 180 / PI % 360;
    };
    /*\
     * Raphael.snapTo
     [ method ]
     **
     * Snaps given value to given grid.
     > Parameters
     - values (array|number) given array of values or step of the grid
     - value (number) value to adjust
     - tolerance (number) #optional tolerance for snapping. Default is `10`.
     = (number) adjusted value.
    \*/
    R.snapTo = function (values, value, tolerance) {
        tolerance = R.is(tolerance, "finite") ? tolerance : 10;
        if (R.is(values, array)) {
            var i = values.length;
            while (i--) if (abs(values[i] - value) <= tolerance) {
                return values[i];
            }
        } else {
            values = +values;
            var rem = value % values;
            if (rem < tolerance) {
                return value - rem;
            }
            if (rem > values - tolerance) {
                return value - rem + values;
            }
        }
        return value;
    };
    
    /*\
     * Raphael.createUUID
     [ method ]
     **
     * Returns RFC4122, version 4 ID
    \*/
    var createUUID = R.createUUID = (function (uuidRegEx, uuidReplacer) {
        return function () {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase();
        };
    })(/[xy]/g, function (c) {
        var r = math.random() * 16 | 0,
            v = c == "x" ? r : (r & 3 | 8);
        return v.toString(16);
    });

    /*\
     * Raphael.setWindow
     [ method ]
     **
     * Used when you need to draw in `&lt;iframe>`. Switched window to the iframe one.
     > Parameters
     - newwin (window) new window object
    \*/
    R.setWindow = function (newwin) {
        eve("raphael.setWindow", R, g.win, newwin);
        g.win = newwin;
        g.doc = g.win.document;
        if (R._engine.initWin) {
            R._engine.initWin(g.win);
        }
    };
    var toHex = function (color) {
        if (R.vml) {
            // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
            var trim = /^\s+|\s+$/g;
            var bod;
            try {
                var docum = new ActiveXObject("htmlfile");
                docum.write("<body>");
                docum.close();
                bod = docum.body;
            } catch(e) {
                bod = createPopup().document.body;
            }
            var range = bod.createTextRange();
            toHex = cacher(function (color) {
                try {
                    bod.style.color = Str(color).replace(trim, E);
                    var value = range.queryCommandValue("ForeColor");
                    value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
                    return "#" + ("000000" + value.toString(16)).slice(-6);
                } catch(e) {
                    return "none";
                }
            });
        } else {
            var i = g.doc.createElement("i");
            i.title = "Rapha\xebl Colour Picker";
            i.style.display = "none";
            g.doc.body.appendChild(i);
            toHex = cacher(function (color) {
                i.style.color = color;
                return g.doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
            });
        }
        return toHex(color);
    },
    hsbtoString = function () {
        return "hsb(" + [this.h, this.s, this.b] + ")";
    },
    hsltoString = function () {
        return "hsl(" + [this.h, this.s, this.l] + ")";
    },
    rgbtoString = function () {
        return this.hex;
    },
    prepareRGB = function (r, g, b) {
        if (g == null && R.is(r, "object") && "r" in r && "g" in r && "b" in r) {
            b = r.b;
            g = r.g;
            r = r.r;
        }
        if (g == null && R.is(r, string)) {
            var clr = R.getRGB(r);
            r = clr.r;
            g = clr.g;
            b = clr.b;
        }
        if (r > 1 || g > 1 || b > 1) {
            r /= 255;
            g /= 255;
            b /= 255;
        }
        
        return [r, g, b];
    },
    packageRGB = function (r, g, b, o) {
        r *= 255;
        g *= 255;
        b *= 255;
        var rgb = {
            r: r,
            g: g,
            b: b,
            hex: R.rgb(r, g, b),
            toString: rgbtoString
        };
        R.is(o, "finite") && (rgb.opacity = o);
        return rgb;
    };
    
    /*\
     * Raphael.color
     [ method ]
     **
     * Parses the color string and returns object with all values for the given color.
     > Parameters
     - clr (string) color string in one of the supported formats (see @Raphael.getRGB)
     = (object) Combined RGB & HSB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••,
     o     error (boolean) `true` if string can’t be parsed,
     o     h (number) hue,
     o     s (number) saturation,
     o     v (number) value (brightness),
     o     l (number) lightness
     o }
    \*/
    R.color = function (clr) {
        var rgb;
        if (R.is(clr, "object") && "h" in clr && "s" in clr && "b" in clr) {
            rgb = R.hsb2rgb(clr);
            clr.r = rgb.r;
            clr.g = rgb.g;
            clr.b = rgb.b;
            clr.hex = rgb.hex;
        } else if (R.is(clr, "object") && "h" in clr && "s" in clr && "l" in clr) {
            rgb = R.hsl2rgb(clr);
            clr.r = rgb.r;
            clr.g = rgb.g;
            clr.b = rgb.b;
            clr.hex = rgb.hex;
        } else {
            if (R.is(clr, "string")) {
                clr = R.getRGB(clr);
            }
            if (R.is(clr, "object") && "r" in clr && "g" in clr && "b" in clr) {
                rgb = R.rgb2hsl(clr);
                clr.h = rgb.h;
                clr.s = rgb.s;
                clr.l = rgb.l;
                rgb = R.rgb2hsb(clr);
                clr.v = rgb.b;
            } else {
                clr = {hex: "none"};
                clr.r = clr.g = clr.b = clr.h = clr.s = clr.v = clr.l = -1;
            }
        }
        clr.toString = rgbtoString;
        return clr;
    };
    /*\
     * Raphael.hsb2rgb
     [ method ]
     **
     * Converts HSB values to RGB object.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - v (number) value or brightness
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••
     o }
    \*/
    R.hsb2rgb = function (h, s, v, o) {
        if (this.is(h, "object") && "h" in h && "s" in h && "b" in h) {
            v = h.b;
            s = h.s;
            h = h.h;
            o = h.o;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = v * s;
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = v - C;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return packageRGB(R, G, B, o);
    };
    /*\
     * Raphael.hsl2rgb
     [ method ]
     **
     * Converts HSL values to RGB object.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - l (number) luminosity
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••
     o }
    \*/
    R.hsl2rgb = function (h, s, l, o) {
        if (this.is(h, "object") && "h" in h && "s" in h && "l" in h) {
            l = h.l;
            s = h.s;
            h = h.h;
        }
        if (h > 1 || s > 1 || l > 1) {
            h /= 360;
            s /= 100;
            l /= 100;
        }
        h *= 360;
        var R, G, B, X, C;
        h = (h % 360) / 60;
        C = 2 * s * (l < .5 ? l : 1 - l);
        X = C * (1 - abs(h % 2 - 1));
        R = G = B = l - C / 2;

        h = ~~h;
        R += [C, X, 0, 0, X, C][h];
        G += [X, C, C, X, 0, 0][h];
        B += [0, 0, X, C, C, X][h];
        return packageRGB(R, G, B, o);
    };
    /*\
     * Raphael.rgb2hsb
     [ method ]
     **
     * Converts RGB values to HSB object.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (object) HSB object in format:
     o {
     o     h (number) hue
     o     s (number) saturation
     o     b (number) brightness
     o }
    \*/
    R.rgb2hsb = function (r, g, b) {
        b = prepareRGB(r, g, b);
        r = b[0];
        g = b[1];
        b = b[2];

        var H, S, V, C;
        V = mmax(r, g, b);
        C = V - mmin(r, g, b);
        H = (C == 0 ? null :
             V == r ? (g - b) / C :
             V == g ? (b - r) / C + 2 :
                      (r - g) / C + 4
            );
        H = ((H + 360) % 6) * 60 / 360;
        S = C == 0 ? 0 : C / V;
        return {h: H, s: S, b: V, toString: hsbtoString};
    };
    /*\
     * Raphael.rgb2hsl
     [ method ]
     **
     * Converts RGB values to HSL object.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (object) HSL object in format:
     o {
     o     h (number) hue
     o     s (number) saturation
     o     l (number) luminosity
     o }
    \*/
    R.rgb2hsl = function (r, g, b) {
        b = prepareRGB(r, g, b);
        r = b[0];
        g = b[1];
        b = b[2];

        var H, S, L, M, m, C;
        M = mmax(r, g, b);
        m = mmin(r, g, b);
        C = M - m;
        H = (C == 0 ? null :
             M == r ? (g - b) / C :
             M == g ? (b - r) / C + 2 :
                      (r - g) / C + 4);
        H = ((H + 360) % 6) * 60 / 360;
        L = (M + m) / 2;
        S = (C == 0 ? 0 :
             L < .5 ? C / (2 * L) :
                      C / (2 - 2 * L));
        return {h: H, s: S, l: L, toString: hsltoString};
    };
    R._path2string = function () {
        return this.join(",").replace(p2s, "$1");
    };
    function repush(array, item) {
        for (var i = 0, ii = array.length; i < ii; i++) if (array[i] === item) {
            return array.push(array.splice(i, 1)[0]);
        }
    }
    function cacher(f, scope, postprocessor) {
        function newf() {
            var arg = Array.prototype.slice.call(arguments, 0),
                args = arg.join("\u2400"),
                cache = newf.cache = newf.cache || {},
                count = newf.count = newf.count || [];
            if (cache[has](args)) {
                repush(count, args);
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            count.length >= 1e3 && delete cache[count.shift()];
            count.push(args);
            cache[args] = f[apply](scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
    }

    var preload = R._preload = function (src, f) {
        var img = g.doc.createElement("img");
        img.style.cssText = "position:absolute;left:-9999em;top:-9999em";
        img.onload = function () {
            f.call(this);
            this.onload = null;
            g.doc.body.removeChild(this);
        };
        img.onerror = function () {
            g.doc.body.removeChild(this);
        };
        g.doc.body.appendChild(img);
        img.src = src;
    };
    
    function clrToString() {
        return this.hex;
    }

    /*\
     * Raphael.getRGB
     [ method ]
     **
     * Parses colour string as RGB object
     > Parameters
     - colour (string) colour string in one of formats:
     # <ul>
     #     <li>Colour name (“<code>red</code>”, “<code>green</code>”, “<code>cornflowerblue</code>”, etc)</li>
     #     <li>#••• — shortened HTML colour: (“<code>#000</code>”, “<code>#fc0</code>”, etc)</li>
     #     <li>#•••••• — full length HTML colour: (“<code>#000000</code>”, “<code>#bd2300</code>”)</li>
     #     <li>rgb(•••, •••, •••) — red, green and blue channels’ values: (“<code>rgb(200,&nbsp;100,&nbsp;0)</code>”)</li>
     #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (“<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>”)</li>
     #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (“<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>”)</li>
     #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsl(•••, •••, •••) — same as hsb</li>
     #     <li>hsl(•••%, •••%, •••%) — same as hsb</li>
     # </ul>
     = (object) RGB object in format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue
     o     hex (string) color in HTML/CSS format: #••••••,
     o     error (boolean) true if string can’t be parsed
     o }
    \*/
    R.getRGB = cacher(function (colour) {
        if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
            return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
        }
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none", toString: clrToString};
        }
        !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
        var res,
            red,
            green,
            blue,
            opacity,
            t,
            values,
            rgb = colour.match(colourRegExp);
        if (rgb) {
            if (rgb[2]) {
                blue = toInt(rgb[2].substring(5), 16);
                green = toInt(rgb[2].substring(3, 5), 16);
                red = toInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                green = toInt((t = rgb[3].charAt(2)) + t, 16);
                red = toInt((t = rgb[3].charAt(1)) + t, 16);
            }
            if (rgb[4]) {
                values = rgb[4][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
            }
            if (rgb[5]) {
                values = rgb[5][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsb2rgb(red, green, blue, opacity);
            }
            if (rgb[6]) {
                values = rgb[6][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsl2rgb(red, green, blue, opacity);
            }
            rgb = {r: red, g: green, b: blue, toString: clrToString};
            rgb.hex = "#" + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
            R.is(opacity, "finite") && (rgb.opacity = opacity);
            return rgb;
        }
        return {r: -1, g: -1, b: -1, hex: "none", error: 1, toString: clrToString};
    }, R);
    /*\
     * Raphael.hsb
     [ method ]
     **
     * Converts HSB values to hex representation of the colour.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - b (number) value or brightness
     = (string) hex representation of the colour.
    \*/
    R.hsb = cacher(function (h, s, b) {
        return R.hsb2rgb(h, s, b).hex;
    });
    /*\
     * Raphael.hsl
     [ method ]
     **
     * Converts HSL values to hex representation of the colour.
     > Parameters
     - h (number) hue
     - s (number) saturation
     - l (number) luminosity
     = (string) hex representation of the colour.
    \*/
    R.hsl = cacher(function (h, s, l) {
        return R.hsl2rgb(h, s, l).hex;
    });
    /*\
     * Raphael.rgb
     [ method ]
     **
     * Converts RGB values to hex representation of the colour.
     > Parameters
     - r (number) red
     - g (number) green
     - b (number) blue
     = (string) hex representation of the colour.
    \*/
    R.rgb = cacher(function (r, g, b) {
        return "#" + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1);
    });
    /*\
     * Raphael.getColor
     [ method ]
     **
     * On each call returns next colour in the spectrum. To reset it back to red call @Raphael.getColor.reset
     > Parameters
     - value (number) #optional brightness, default is `0.75`
     = (string) hex representation of the colour.
    \*/
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
            rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
        }
        return rgb.hex;
    };
    /*\
     * Raphael.getColor.reset
     [ method ]
     **
     * Resets spectrum position for @Raphael.getColor back to red.
    \*/
    R.getColor.reset = function () {
        delete this.start;
    };

    // http://schepers.cc/getting-to-the-point
    function catmullRom2bezier(crp, z) {
        var d = [];
        for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
            var p = [
                        {x: +crp[i - 2], y: +crp[i - 1]},
                        {x: +crp[i],     y: +crp[i + 1]},
                        {x: +crp[i + 2], y: +crp[i + 3]},
                        {x: +crp[i + 4], y: +crp[i + 5]}
                    ];
            if (z) {
                if (!i) {
                    p[0] = {x: +crp[iLen - 2], y: +crp[iLen - 1]};
                } else if (iLen - 4 == i) {
                    p[3] = {x: +crp[0], y: +crp[1]};
                } else if (iLen - 2 == i) {
                    p[2] = {x: +crp[0], y: +crp[1]};
                    p[3] = {x: +crp[2], y: +crp[3]};
                }
            } else {
                if (iLen - 4 == i) {
                    p[3] = p[2];
                } else if (!i) {
                    p[0] = {x: +crp[i], y: +crp[i + 1]};
                }
            }
            d.push(["C",
                  (-p[0].x + 6 * p[1].x + p[2].x) / 6,
                  (-p[0].y + 6 * p[1].y + p[2].y) / 6,
                  (p[1].x + 6 * p[2].x - p[3].x) / 6,
                  (p[1].y + 6*p[2].y - p[3].y) / 6,
                  p[2].x,
                  p[2].y
            ]);
        }

        return d;
    }
    /*\
     * Raphael.parsePathString
     [ method ]
     **
     * Utility method
     **
     * Parses given path string into an array of arrays of path segments.
     > Parameters
     - pathString (string|array) path string or array of segments (in the last case it will be returned straight away)
     = (array) array of segments.
    \*/
    R.parsePathString = function (pathString) {
        if (!pathString) {
            return null;
        }
        var pth = paths(pathString);
        if (pth.arr) {
            return pathClone(pth.arr);
        }
        
        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (R.is(pathString, array) && R.is(pathString[0], array)) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data.length) {
            Str(pathString).replace(pathCommand, function (a, b, c) {
                var params = [],
                    name = b.toLowerCase();
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                if (name == "m" && params.length > 2) {
                    data.push([b][concat](params.splice(0, 2)));
                    name = "l";
                    b = b == "m" ? "l" : "L";
                }
                if (name == "r") {
                    data.push([b][concat](params));
                } else while (params.length >= paramCounts[name]) {
                    data.push([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
        }
        data.toString = R._path2string;
        pth.arr = pathClone(data);
        return data;
    };
    /*\
     * Raphael.parseTransformString
     [ method ]
     **
     * Utility method
     **
     * Parses given path string into an array of transformations.
     > Parameters
     - TString (string|array) transform string or array of transformations (in the last case it will be returned straight away)
     = (array) array of transformations.
    \*/
    R.parseTransformString = cacher(function (TString) {
        if (!TString) {
            return null;
        }
        var paramCounts = {r: 3, s: 4, t: 2, m: 6},
            data = [];
        if (R.is(TString, array) && R.is(TString[0], array)) { // rough assumption
            data = pathClone(TString);
        }
        if (!data.length) {
            Str(TString).replace(tCommand, function (a, b, c) {
                var params = [],
                    name = lowerCase.call(b);
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                data.push([b][concat](params));
            });
        }
        data.toString = R._path2string;
        return data;
    });
    // PATHS
    var paths = function (ps) {
        var p = paths.ps = paths.ps || {};
        if (p[ps]) {
            p[ps].sleep = 100;
        } else {
            p[ps] = {
                sleep: 100
            };
        }
        setTimeout(function () {
            for (var key in p) if (p[has](key) && key != ps) {
                p[key].sleep--;
                !p[key].sleep && delete p[key];
            }
        });
        return p[ps];
    };
    /*\
     * Raphael.findDotsAtSegment
     [ method ]
     **
     * Utility method
     **
     * Find dot coordinates on the given cubic bezier curve at the given t.
     > Parameters
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     - t (number) position on the curve (0..1)
     = (object) point information in format:
     o {
     o     x: (number) x coordinate of the point
     o     y: (number) y coordinate of the point
     o     m: {
     o         x: (number) x coordinate of the left anchor
     o         y: (number) y coordinate of the left anchor
     o     }
     o     n: {
     o         x: (number) x coordinate of the right anchor
     o         y: (number) y coordinate of the right anchor
     o     }
     o     start: {
     o         x: (number) x coordinate of the start of the curve
     o         y: (number) y coordinate of the start of the curve
     o     }
     o     end: {
     o         x: (number) x coordinate of the end of the curve
     o         y: (number) y coordinate of the end of the curve
     o     }
     o     alpha: (number) angle of the curve derivative at the point
     o }
    \*/
    R.findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t,
            t13 = pow(t1, 3),
            t12 = pow(t1, 2),
            t2 = t * t,
            t3 = t2 * t,
            x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
            y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
            mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
            my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
            nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
            ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
            ax = t1 * p1x + t * c1x,
            ay = t1 * p1y + t * c1y,
            cx = t1 * c2x + t * p2x,
            cy = t1 * c2y + t * p2y,
            alpha = (90 - math.atan2(mx - nx, my - ny) * 180 / PI);
        (mx > nx || my < ny) && (alpha += 180);
        return {
            x: x,
            y: y,
            m: {x: mx, y: my},
            n: {x: nx, y: ny},
            start: {x: ax, y: ay},
            end: {x: cx, y: cy},
            alpha: alpha
        };
    };
    /*\
     * Raphael.bezierBBox
     [ method ]
     **
     * Utility method
     **
     * Return bounding box of a given cubic bezier curve
     > Parameters
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     * or
     - bez (array) array of six points for bezier curve
     = (object) point information in format:
     o {
     o     min: {
     o         x: (number) x coordinate of the left point
     o         y: (number) y coordinate of the top point
     o     }
     o     max: {
     o         x: (number) x coordinate of the right point
     o         y: (number) y coordinate of the bottom point
     o     }
     o }
    \*/
    R.bezierBBox = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
        if (!R.is(p1x, "array")) {
            p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
        }
        var bbox = curveDim.apply(null, p1x);
        return {
            x: bbox.min.x,
            y: bbox.min.y,
            x2: bbox.max.x,
            y2: bbox.max.y,
            width: bbox.max.x - bbox.min.x,
            height: bbox.max.y - bbox.min.y
        };
    };
    /*\
     * Raphael.isPointInsideBBox
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside bounding boxes.
     > Parameters
     - bbox (string) bounding box
     - x (string) x coordinate of the point
     - y (string) y coordinate of the point
     = (boolean) `true` if point inside
    \*/
    R.isPointInsideBBox = function (bbox, x, y) {
        return x >= bbox.x && x <= bbox.x2 && y >= bbox.y && y <= bbox.y2;
    };
    /*\
     * Raphael.isBBoxIntersect
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if two bounding boxes intersect
     > Parameters
     - bbox1 (string) first bounding box
     - bbox2 (string) second bounding box
     = (boolean) `true` if they intersect
    \*/
    R.isBBoxIntersect = function (bbox1, bbox2) {
        var i = R.isPointInsideBBox;
        return i(bbox2, bbox1.x, bbox1.y)
            || i(bbox2, bbox1.x2, bbox1.y)
            || i(bbox2, bbox1.x, bbox1.y2)
            || i(bbox2, bbox1.x2, bbox1.y2)
            || i(bbox1, bbox2.x, bbox2.y)
            || i(bbox1, bbox2.x2, bbox2.y)
            || i(bbox1, bbox2.x, bbox2.y2)
            || i(bbox1, bbox2.x2, bbox2.y2)
            || (bbox1.x < bbox2.x2 && bbox1.x > bbox2.x || bbox2.x < bbox1.x2 && bbox2.x > bbox1.x)
            && (bbox1.y < bbox2.y2 && bbox1.y > bbox2.y || bbox2.y < bbox1.y2 && bbox2.y > bbox1.y);
    };
    function base3(t, p1, p2, p3, p4) {
        var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
            t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
        return t * t2 - 3 * p1 + 3 * p2;
    }
    function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
        if (z == null) {
            z = 1;
        }
        z = z > 1 ? 1 : z < 0 ? 0 : z;
        var z2 = z / 2,
            n = 12,
            Tvalues = [-0.1252,0.1252,-0.3678,0.3678,-0.5873,0.5873,-0.7699,0.7699,-0.9041,0.9041,-0.9816,0.9816],
            Cvalues = [0.2491,0.2491,0.2335,0.2335,0.2032,0.2032,0.1601,0.1601,0.1069,0.1069,0.0472,0.0472],
            sum = 0;
        for (var i = 0; i < n; i++) {
            var ct = z2 * Tvalues[i] + z2,
                xbase = base3(ct, x1, x2, x3, x4),
                ybase = base3(ct, y1, y2, y3, y4),
                comb = xbase * xbase + ybase * ybase;
            sum += Cvalues[i] * math.sqrt(comb);
        }
        return z2 * sum;
    }
    function getTatLen(x1, y1, x2, y2, x3, y3, x4, y4, ll) {
        if (ll < 0 || bezlen(x1, y1, x2, y2, x3, y3, x4, y4) < ll) {
            return;
        }
        var t = 1,
            step = t / 2,
            t2 = t - step,
            l,
            e = .01;
        l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
        while (abs(l - ll) > e) {
            step /= 2;
            t2 += (l < ll ? 1 : -1) * step;
            l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
        }
        return t2;
    }
    function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        if (
            mmax(x1, x2) < mmin(x3, x4) ||
            mmin(x1, x2) > mmax(x3, x4) ||
            mmax(y1, y2) < mmin(y3, y4) ||
            mmin(y1, y2) > mmax(y3, y4)
        ) {
            return;
        }
        var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
            ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
            denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        if (!denominator) {
            return;
        }
        var px = nx / denominator,
            py = ny / denominator,
            px2 = +px.toFixed(2),
            py2 = +py.toFixed(2);
        if (
            px2 < +mmin(x1, x2).toFixed(2) ||
            px2 > +mmax(x1, x2).toFixed(2) ||
            px2 < +mmin(x3, x4).toFixed(2) ||
            px2 > +mmax(x3, x4).toFixed(2) ||
            py2 < +mmin(y1, y2).toFixed(2) ||
            py2 > +mmax(y1, y2).toFixed(2) ||
            py2 < +mmin(y3, y4).toFixed(2) ||
            py2 > +mmax(y3, y4).toFixed(2)
        ) {
            return;
        }
        return {x: px, y: py};
    }
    function inter(bez1, bez2) {
        return interHelper(bez1, bez2);
    }
    function interCount(bez1, bez2) {
        return interHelper(bez1, bez2, 1);
    }
    function interHelper(bez1, bez2, justCount) {
        var bbox1 = R.bezierBBox(bez1),
            bbox2 = R.bezierBBox(bez2);
        if (!R.isBBoxIntersect(bbox1, bbox2)) {
            return justCount ? 0 : [];
        }
        var l1 = bezlen.apply(0, bez1),
            l2 = bezlen.apply(0, bez2),
            n1 = ~~(l1 / 5),
            n2 = ~~(l2 / 5),
            dots1 = [],
            dots2 = [],
            xy = {},
            res = justCount ? 0 : [];
        for (var i = 0; i < n1 + 1; i++) {
            var p = R.findDotsAtSegment.apply(R, bez1.concat(i / n1));
            dots1.push({x: p.x, y: p.y, t: i / n1});
        }
        for (i = 0; i < n2 + 1; i++) {
            p = R.findDotsAtSegment.apply(R, bez2.concat(i / n2));
            dots2.push({x: p.x, y: p.y, t: i / n2});
        }
        for (i = 0; i < n1; i++) {
            for (var j = 0; j < n2; j++) {
                var di = dots1[i],
                    di1 = dots1[i + 1],
                    dj = dots2[j],
                    dj1 = dots2[j + 1],
                    ci = abs(di1.x - di.x) < .001 ? "y" : "x",
                    cj = abs(dj1.x - dj.x) < .001 ? "y" : "x",
                    is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);
                if (is) {
                    if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
                        continue;
                    }
                    xy[is.x.toFixed(4)] = is.y.toFixed(4);
                    var t1 = di.t + abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
                        t2 = dj.t + abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);
                    if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
                        if (justCount) {
                            res++;
                        } else {
                            res.push({
                                x: is.x,
                                y: is.y,
                                t1: t1,
                                t2: t2
                            });
                        }
                    }
                }
            }
        }
        return res;
    }
    /*\
     * Raphael.pathIntersection
     [ method ]
     **
     * Utility method
     **
     * Finds intersections of two paths
     > Parameters
     - path1 (string) path string
     - path2 (string) path string
     = (array) dots of intersection
     o [
     o     {
     o         x: (number) x coordinate of the point
     o         y: (number) y coordinate of the point
     o         t1: (number) t value for segment of path1
     o         t2: (number) t value for segment of path2
     o         segment1: (number) order number for segment of path1
     o         segment2: (number) order number for segment of path2
     o         bez1: (array) eight coordinates representing beziér curve for the segment of path1
     o         bez2: (array) eight coordinates representing beziér curve for the segment of path2
     o     }
     o ]
    \*/
    R.pathIntersection = function (path1, path2) {
        return interPathHelper(path1, path2);
    };
    R.pathIntersectionNumber = function (path1, path2) {
        return interPathHelper(path1, path2, 1);
    };
    function interPathHelper(path1, path2, justCount) {
        path1 = R._path2curve(path1);
        path2 = R._path2curve(path2);
        var x1, y1, x2, y2, x1m, y1m, x2m, y2m, bez1, bez2,
            res = justCount ? 0 : [];
        for (var i = 0, ii = path1.length; i < ii; i++) {
            var pi = path1[i];
            if (pi[0] == "M") {
                x1 = x1m = pi[1];
                y1 = y1m = pi[2];
            } else {
                if (pi[0] == "C") {
                    bez1 = [x1, y1].concat(pi.slice(1));
                    x1 = bez1[6];
                    y1 = bez1[7];
                } else {
                    bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
                    x1 = x1m;
                    y1 = y1m;
                }
                for (var j = 0, jj = path2.length; j < jj; j++) {
                    var pj = path2[j];
                    if (pj[0] == "M") {
                        x2 = x2m = pj[1];
                        y2 = y2m = pj[2];
                    } else {
                        if (pj[0] == "C") {
                            bez2 = [x2, y2].concat(pj.slice(1));
                            x2 = bez2[6];
                            y2 = bez2[7];
                        } else {
                            bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
                            x2 = x2m;
                            y2 = y2m;
                        }
                        var intr = interHelper(bez1, bez2, justCount);
                        if (justCount) {
                            res += intr;
                        } else {
                            for (var k = 0, kk = intr.length; k < kk; k++) {
                                intr[k].segment1 = i;
                                intr[k].segment2 = j;
                                intr[k].bez1 = bez1;
                                intr[k].bez2 = bez2;
                            }
                            res = res.concat(intr);
                        }
                    }
                }
            }
        }
        return res;
    }
    /*\
     * Raphael.isPointInsidePath
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside a given closed path.
     > Parameters
     - path (string) path string
     - x (number) x of the point
     - y (number) y of the point
     = (boolean) true, if point is inside the path
    \*/
    R.isPointInsidePath = function (path, x, y) {
        var bbox = R.pathBBox(path);
        return R.isPointInsideBBox(bbox, x, y) &&
               interPathHelper(path, [["M", x, y], ["H", bbox.x2 + 10]], 1) % 2 == 1;
    };
    R._removedFactory = function (methodname) {
        return function () {
            eve("raphael.log", null, "Rapha\xebl: you are calling to method \u201c" + methodname + "\u201d of removed object", methodname);
        };
    };
    /*\
     * Raphael.pathBBox
     [ method ]
     **
     * Utility method
     **
     * Return bounding box of a given path
     > Parameters
     - path (string) path string
     = (object) bounding box
     o {
     o     x: (number) x coordinate of the left top point of the box
     o     y: (number) y coordinate of the left top point of the box
     o     x2: (number) x coordinate of the right bottom point of the box
     o     y2: (number) y coordinate of the right bottom point of the box
     o     width: (number) width of the box
     o     height: (number) height of the box
     o     cx: (number) x coordinate of the center of the box
     o     cy: (number) y coordinate of the center of the box
     o }
    \*/
    var pathDimensions = R.pathBBox = function (path) {
        var pth = paths(path);
        if (pth.bbox) {
            return clone(pth.bbox);
        }
        if (!path) {
            return {x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0};
        }
        path = path2curve(path);
        var x = 0, 
            y = 0,
            X = [],
            Y = [],
            p;
        for (var i = 0, ii = path.length; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = p[1];
                y = p[2];
                X.push(x);
                Y.push(y);
            } else {
                var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                X = X[concat](dim.min.x, dim.max.x);
                Y = Y[concat](dim.min.y, dim.max.y);
                x = p[5];
                y = p[6];
            }
        }
        var xmin = mmin[apply](0, X),
            ymin = mmin[apply](0, Y),
            xmax = mmax[apply](0, X),
            ymax = mmax[apply](0, Y),
            width = xmax - xmin,
            height = ymax - ymin,
                bb = {
                x: xmin,
                y: ymin,
                x2: xmax,
                y2: ymax,
                width: width,
                height: height,
                cx: xmin + width / 2,
                cy: ymin + height / 2
            };
        pth.bbox = clone(bb);
        return bb;
    },
        pathClone = function (pathArray) {
            var res = clone(pathArray);
            res.toString = R._path2string;
            return res;
        },
        pathToRelative = R._pathToRelative = function (pathArray) {
            var pth = paths(pathArray);
            if (pth.rel) {
                return pathClone(pth.rel);
            }
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = pathArray[0][1];
                y = pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res.push(["M", x, y]);
            }
            for (var i = start, ii = pathArray.length; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != lowerCase.call(pa[0])) {
                    r[0] = lowerCase.call(pa[0]);
                    switch (r[0]) {
                        case "a":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] - x).toFixed(3);
                            r[7] = +(pa[7] - y).toFixed(3);
                            break;
                        case "v":
                            r[1] = +(pa[1] - y).toFixed(3);
                            break;
                        case "m":
                            mx = pa[1];
                            my = pa[2];
                        default:
                            for (var j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    r = res[i] = [];
                    if (pa[0] == "m") {
                        mx = pa[1] + x;
                        my = pa[2] + y;
                    }
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                var len = res[i].length;
                switch (res[i][0]) {
                    case "z":
                        x = mx;
                        y = my;
                        break;
                    case "h":
                        x += +res[i][len - 1];
                        break;
                    case "v":
                        y += +res[i][len - 1];
                        break;
                    default:
                        x += +res[i][len - 2];
                        y += +res[i][len - 1];
                }
            }
            res.toString = R._path2string;
            pth.rel = pathClone(res);
            return res;
        },
        pathToAbsolute = R._pathToAbsolute = function (pathArray) {
            var pth = paths(pathArray);
            if (pth.abs) {
                return pathClone(pth.abs);
            }
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            if (!pathArray || !pathArray.length) {
                return [["M", 0, 0]];
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = +pathArray[0][1];
                y = +pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[0] = ["M", x, y];
            }
            var crz = pathArray.length == 3 && pathArray[0][0] == "M" && pathArray[1][0].toUpperCase() == "R" && pathArray[2][0].toUpperCase() == "Z";
            for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
                res.push(r = []);
                pa = pathArray[i];
                if (pa[0] != upperCase.call(pa[0])) {
                    r[0] = upperCase.call(pa[0]);
                    switch (r[0]) {
                        case "A":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] + x);
                            r[7] = +(pa[7] + y);
                            break;
                        case "V":
                            r[1] = +pa[1] + y;
                            break;
                        case "H":
                            r[1] = +pa[1] + x;
                            break;
                        case "R":
                            var dots = [x, y][concat](pa.slice(1));
                            for (var j = 2, jj = dots.length; j < jj; j++) {
                                dots[j] = +dots[j] + x;
                                dots[++j] = +dots[j] + y;
                            }
                            res.pop();
                            res = res[concat](catmullRom2bezier(dots, crz));
                            break;
                        case "M":
                            mx = +pa[1] + x;
                            my = +pa[2] + y;
                        default:
                            for (j = 1, jj = pa.length; j < jj; j++) {
                                r[j] = +pa[j] + ((j % 2) ? x : y);
                            }
                    }
                } else if (pa[0] == "R") {
                    dots = [x, y][concat](pa.slice(1));
                    res.pop();
                    res = res[concat](catmullRom2bezier(dots, crz));
                    r = ["R"][concat](pa.slice(-2));
                } else {
                    for (var k = 0, kk = pa.length; k < kk; k++) {
                        r[k] = pa[k];
                    }
                }
                switch (r[0]) {
                    case "Z":
                        x = mx;
                        y = my;
                        break;
                    case "H":
                        x = r[1];
                        break;
                    case "V":
                        y = r[1];
                        break;
                    case "M":
                        mx = r[r.length - 2];
                        my = r[r.length - 1];
                    default:
                        x = r[r.length - 2];
                        y = r[r.length - 1];
                }
            }
            res.toString = R._path2string;
            pth.abs = pathClone(res);
            return res;
        },
        l2c = function (x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },
        q2c = function (x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3,
                _23 = 2 / 3;
            return [
                    _13 * x1 + _23 * ax,
                    _13 * y1 + _23 * ay,
                    _13 * x2 + _23 * ax,
                    _13 * y2 + _23 * ay,
                    x2,
                    y2
                ];
        },
        a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
            // for more information of where this math came from visit:
            // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
            var _120 = PI * 120 / 180,
                rad = PI / 180 * (+angle || 0),
                res = [],
                xy,
                rotate = cacher(function (x, y, rad) {
                    var X = x * math.cos(rad) - y * math.sin(rad),
                        Y = x * math.sin(rad) + y * math.cos(rad);
                    return {x: X, y: Y};
                });
            if (!recursive) {
                xy = rotate(x1, y1, -rad);
                x1 = xy.x;
                y1 = xy.y;
                xy = rotate(x2, y2, -rad);
                x2 = xy.x;
                y2 = xy.y;
                var cos = math.cos(PI / 180 * angle),
                    sin = math.sin(PI / 180 * angle),
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2;
                var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                if (h > 1) {
                    h = math.sqrt(h);
                    rx = h * rx;
                    ry = h * ry;
                }
                var rx2 = rx * rx,
                    ry2 = ry * ry,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
                    f2 = math.asin(((y2 - cy) / ry).toFixed(9));

                f1 = x1 < cx ? PI - f1 : f1;
                f2 = x2 < cx ? PI - f2 : f2;
                f1 < 0 && (f1 = PI * 2 + f1);
                f2 < 0 && (f2 = PI * 2 + f2);
                if (sweep_flag && f1 > f2) {
                    f1 = f1 - PI * 2;
                }
                if (!sweep_flag && f2 > f1) {
                    f2 = f2 - PI * 2;
                }
            } else {
                f1 = recursive[0];
                f2 = recursive[1];
                cx = recursive[2];
                cy = recursive[3];
            }
            var df = f2 - f1;
            if (abs(df) > _120) {
                var f2old = f2,
                    x2old = x2,
                    y2old = y2;
                f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                x2 = cx + rx * math.cos(f2);
                y2 = cy + ry * math.sin(f2);
                res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
            }
            df = f2 - f1;
            var c1 = math.cos(f1),
                s1 = math.sin(f1),
                c2 = math.cos(f2),
                s2 = math.sin(f2),
                t = math.tan(df / 4),
                hx = 4 / 3 * rx * t,
                hy = 4 / 3 * ry * t,
                m1 = [x1, y1],
                m2 = [x1 + hx * s1, y1 - hy * c1],
                m3 = [x2 + hx * s2, y2 - hy * c2],
                m4 = [x2, y2];
            m2[0] = 2 * m1[0] - m2[0];
            m2[1] = 2 * m1[1] - m2[1];
            if (recursive) {
                return [m2, m3, m4][concat](res);
            } else {
                res = [m2, m3, m4][concat](res).join()[split](",");
                var newres = [];
                for (var i = 0, ii = res.length; i < ii; i++) {
                    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                }
                return newres;
            }
        },
        findDotAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t;
            return {
                x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
            };
        },
        curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                c = p1x - c1x,
                t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
                t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
                y = [p1y, p2y],
                x = [p1x, p2x],
                dot;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
            b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
            c = p1y - c1y;
            t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
            t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x.push(dot.x);
                y.push(dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x.push(dot.x);
                y.push(dot.y);
            }
            return {
                min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
            };
        }),
        path2curve = R._path2curve = cacher(function (path, path2) {
            var pth = !path2 && paths(path);
            if (!path2 && pth.curve) {
                return pathClone(pth.curve);
            }
            var p = pathToAbsolute(path),
                p2 = path2 && pathToAbsolute(path2),
                attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                processPath = function (path, d) {
                    var nx, ny;
                    if (!path) {
                        return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                    }
                    !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                    switch (path[0]) {
                        case "M":
                            d.X = path[1];
                            d.Y = path[2];
                            break;
                        case "A":
                            path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                            break;
                        case "S":
                            nx = d.x + (d.x - (d.bx || d.x));
                            ny = d.y + (d.y - (d.by || d.y));
                            path = ["C", nx, ny][concat](path.slice(1));
                            break;
                        case "T":
                            d.qx = d.x + (d.x - (d.qx || d.x));
                            d.qy = d.y + (d.y - (d.qy || d.y));
                            path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                            break;
                        case "Q":
                            d.qx = path[1];
                            d.qy = path[2];
                            path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                            break;
                        case "L":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                            break;
                        case "H":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                            break;
                        case "V":
                            path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                            break;
                        case "Z":
                            path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                            break;
                    }
                    return path;
                },
                fixArc = function (pp, i) {
                    if (pp[i].length > 7) {
                        pp[i].shift();
                        var pi = pp[i];
                        while (pi.length) {
                            pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                        }
                        pp.splice(i, 1);
                        ii = mmax(p.length, p2 && p2.length || 0);
                    }
                },
                fixM = function (path1, path2, a1, a2, i) {
                    if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                        path2.splice(i, 0, ["M", a2.x, a2.y]);
                        a1.bx = 0;
                        a1.by = 0;
                        a1.x = path1[i][1];
                        a1.y = path1[i][2];
                        ii = mmax(p.length, p2 && p2.length || 0);
                    }
                };
            for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
                p[i] = processPath(p[i], attrs);
                fixArc(p, i);
                p2 && (p2[i] = processPath(p2[i], attrs2));
                p2 && fixArc(p2, i);
                fixM(p, p2, attrs, attrs2, i);
                fixM(p2, p, attrs2, attrs, i);
                var seg = p[i],
                    seg2 = p2 && p2[i],
                    seglen = seg.length,
                    seg2len = p2 && seg2.length;
                attrs.x = seg[seglen - 2];
                attrs.y = seg[seglen - 1];
                attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                attrs2.x = p2 && seg2[seg2len - 2];
                attrs2.y = p2 && seg2[seg2len - 1];
            }
            if (!p2) {
                pth.curve = pathClone(p);
            }
            return p2 ? [p, p2] : p;
        }, null, pathClone),
        parseDots = R._parseDots = cacher(function (gradient) {
            var dots = [];
            for (var i = 0, ii = gradient.length; i < ii; i++) {
                var dot = {},
                    par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                dot.color = R.getRGB(par[1]);
                if (dot.color.error) {
                    return null;
                }
                dot.color = dot.color.hex;
                par[2] && (dot.offset = par[2] + "%");
                dots.push(dot);
            }
            for (i = 1, ii = dots.length - 1; i < ii; i++) {
                if (!dots[i].offset) {
                    var start = toFloat(dots[i - 1].offset || 0),
                        end = 0;
                    for (var j = i + 1; j < ii; j++) {
                        if (dots[j].offset) {
                            end = dots[j].offset;
                            break;
                        }
                    }
                    if (!end) {
                        end = 100;
                        j = ii;
                    }
                    end = toFloat(end);
                    var d = (end - start) / (j - i + 1);
                    for (; i < j; i++) {
                        start += d;
                        dots[i].offset = start + "%";
                    }
                }
            }
            return dots;
        }),
        tear = R._tear = function (el, paper) {
            el == paper.top && (paper.top = el.prev);
            el == paper.bottom && (paper.bottom = el.next);
            el.next && (el.next.prev = el.prev);
            el.prev && (el.prev.next = el.next);
        },
        tofront = R._tofront = function (el, paper) {
            if (paper.top === el) {
                return;
            }
            tear(el, paper);
            el.next = null;
            el.prev = paper.top;
            paper.top.next = el;
            paper.top = el;
        },
        toback = R._toback = function (el, paper) {
            if (paper.bottom === el) {
                return;
            }
            tear(el, paper);
            el.next = paper.bottom;
            el.prev = null;
            paper.bottom.prev = el;
            paper.bottom = el;
        },
        insertafter = R._insertafter = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.top && (paper.top = el);
            el2.next && (el2.next.prev = el);
            el.next = el2.next;
            el.prev = el2;
            el2.next = el;
        },
        insertbefore = R._insertbefore = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.bottom && (paper.bottom = el);
            el2.prev && (el2.prev.next = el);
            el.prev = el2.prev;
            el2.prev = el;
            el.next = el2;
        },
        /*\
         * Raphael.toMatrix
         [ method ]
         **
         * Utility method
         **
         * Returns matrix of transformations applied to a given path
         > Parameters
         - path (string) path string
         - transform (string|array) transformation string
         = (object) @Matrix
        \*/
        toMatrix = R.toMatrix = function (path, transform) {
            var bb = pathDimensions(path),
                el = {
                    _: {
                        transform: E
                    },
                    getBBox: function () {
                        return bb;
                    }
                };
            extractTransform(el, transform);
            return el.matrix;
        },
        /*\
         * Raphael.transformPath
         [ method ]
         **
         * Utility method
         **
         * Returns path transformed by a given transformation
         > Parameters
         - path (string) path string
         - transform (string|array) transformation string
         = (string) path
        \*/
        transformPath = R.transformPath = function (path, transform) {
            return mapPath(path, toMatrix(path, transform));
        },
        extractTransform = R._extractTransform = function (el, tstr) {
            if (tstr == null) {
                return el._.transform;
            }
            tstr = Str(tstr).replace(/\.{3}|\u2026/g, el._.transform || E);
            var tdata = R.parseTransformString(tstr),
                deg = 0,
                dx = 0,
                dy = 0,
                sx = 1,
                sy = 1,
                _ = el._,
                m = new Matrix;
            _.transform = tdata || [];
            if (tdata) {
                for (var i = 0, ii = tdata.length; i < ii; i++) {
                    var t = tdata[i],
                        tlen = t.length,
                        command = Str(t[0]).toLowerCase(),
                        absolute = t[0] != command,
                        inver = absolute ? m.invert() : 0,
                        x1,
                        y1,
                        x2,
                        y2,
                        bb;
                    if (command == "t" && tlen == 3) {
                        if (absolute) {
                            x1 = inver.x(0, 0);
                            y1 = inver.y(0, 0);
                            x2 = inver.x(t[1], t[2]);
                            y2 = inver.y(t[1], t[2]);
                            m.translate(x2 - x1, y2 - y1);
                        } else {
                            m.translate(t[1], t[2]);
                        }
                    } else if (command == "r") {
                        if (tlen == 2) {
                            bb = bb || el.getBBox(1);
                            m.rotate(t[1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            deg += t[1];
                        } else if (tlen == 4) {
                            if (absolute) {
                                x2 = inver.x(t[2], t[3]);
                                y2 = inver.y(t[2], t[3]);
                                m.rotate(t[1], x2, y2);
                            } else {
                                m.rotate(t[1], t[2], t[3]);
                            }
                            deg += t[1];
                        }
                    } else if (command == "s") {
                        if (tlen == 2 || tlen == 3) {
                            bb = bb || el.getBBox(1);
                            m.scale(t[1], t[tlen - 1], bb.x + bb.width / 2, bb.y + bb.height / 2);
                            sx *= t[1];
                            sy *= t[tlen - 1];
                        } else if (tlen == 5) {
                            if (absolute) {
                                x2 = inver.x(t[3], t[4]);
                                y2 = inver.y(t[3], t[4]);
                                m.scale(t[1], t[2], x2, y2);
                            } else {
                                m.scale(t[1], t[2], t[3], t[4]);
                            }
                            sx *= t[1];
                            sy *= t[2];
                        }
                    } else if (command == "m" && tlen == 7) {
                        m.add(t[1], t[2], t[3], t[4], t[5], t[6]);
                    }
                    _.dirtyT = 1;
                    el.matrix = m;
                }
            }

            /*\
             * Element.matrix
             [ property (object) ]
             **
             * Keeps @Matrix object, which represents element transformation
            \*/
            el.matrix = m;

            _.sx = sx;
            _.sy = sy;
            _.deg = deg;
            _.dx = dx = m.e;
            _.dy = dy = m.f;

            if (sx == 1 && sy == 1 && !deg && _.bbox) {
                _.bbox.x += +dx;
                _.bbox.y += +dy;
            } else {
                _.dirtyT = 1;
            }
        },
        getEmpty = function (item) {
            var l = item[0];
            switch (l.toLowerCase()) {
                case "t": return [l, 0, 0];
                case "m": return [l, 1, 0, 0, 1, 0, 0];
                case "r": if (item.length == 4) {
                    return [l, 0, item[2], item[3]];
                } else {
                    return [l, 0];
                }
                case "s": if (item.length == 5) {
                    return [l, 1, 1, item[3], item[4]];
                } else if (item.length == 3) {
                    return [l, 1, 1];
                } else {
                    return [l, 1];
                }
            }
        },
        equaliseTransform = R._equaliseTransform = function (t1, t2) {
            t2 = Str(t2).replace(/\.{3}|\u2026/g, t1);
            t1 = R.parseTransformString(t1) || [];
            t2 = R.parseTransformString(t2) || [];
            var maxlength = mmax(t1.length, t2.length),
                from = [],
                to = [],
                i = 0, j, jj,
                tt1, tt2;
            for (; i < maxlength; i++) {
                tt1 = t1[i] || getEmpty(t2[i]);
                tt2 = t2[i] || getEmpty(tt1);
                if ((tt1[0] != tt2[0]) ||
                    (tt1[0].toLowerCase() == "r" && (tt1[2] != tt2[2] || tt1[3] != tt2[3])) ||
                    (tt1[0].toLowerCase() == "s" && (tt1[3] != tt2[3] || tt1[4] != tt2[4]))
                    ) {
                    return;
                }
                from[i] = [];
                to[i] = [];
                for (j = 0, jj = mmax(tt1.length, tt2.length); j < jj; j++) {
                    j in tt1 && (from[i][j] = tt1[j]);
                    j in tt2 && (to[i][j] = tt2[j]);
                }
            }
            return {
                from: from,
                to: to
            };
        };
    R._getContainer = function (x, y, w, h) {
        var container;
        container = h == null && !R.is(x, "object") ? g.doc.getElementById(x) : x;
        if (container == null) {
            return;
        }
        if (container.tagName) {
            if (y == null) {
                return {
                    container: container,
                    width: container.style.pixelWidth || container.offsetWidth,
                    height: container.style.pixelHeight || container.offsetHeight
                };
            } else {
                return {
                    container: container,
                    width: y,
                    height: w
                };
            }
        }
        return {
            container: 1,
            x: x,
            y: y,
            width: w,
            height: h
        };
    };
    /*\
     * Raphael.pathToRelative
     [ method ]
     **
     * Utility method
     **
     * Converts path to relative form
     > Parameters
     - pathString (string|array) path string or array of segments
     = (array) array of segments.
    \*/
    R.pathToRelative = pathToRelative;
    R._engine = {};
    /*\
     * Raphael.path2curve
     [ method ]
     **
     * Utility method
     **
     * Converts path to a new path where all segments are cubic bezier curves.
     > Parameters
     - pathString (string|array) path string or array of segments
     = (array) array of segments.
    \*/
    R.path2curve = path2curve;
    /*\
     * Raphael.matrix
     [ method ]
     **
     * Utility method
     **
     * Returns matrix based on given parameters.
     > Parameters
     - a (number)
     - b (number)
     - c (number)
     - d (number)
     - e (number)
     - f (number)
     = (object) @Matrix
    \*/
    R.matrix = function (a, b, c, d, e, f) {
        return new Matrix(a, b, c, d, e, f);
    };
    function Matrix(a, b, c, d, e, f) {
        if (a != null) {
            this.a = +a;
            this.b = +b;
            this.c = +c;
            this.d = +d;
            this.e = +e;
            this.f = +f;
        } else {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.e = 0;
            this.f = 0;
        }
    }
    (function (matrixproto) {
        /*\
         * Matrix.add
         [ method ]
         **
         * Adds given matrix to existing one.
         > Parameters
         - a (number)
         - b (number)
         - c (number)
         - d (number)
         - e (number)
         - f (number)
         or
         - matrix (object) @Matrix
        \*/
        matrixproto.add = function (a, b, c, d, e, f) {
            var out = [[], [], []],
                m = [[this.a, this.c, this.e], [this.b, this.d, this.f], [0, 0, 1]],
                matrix = [[a, c, e], [b, d, f], [0, 0, 1]],
                x, y, z, res;

            if (a && a instanceof Matrix) {
                matrix = [[a.a, a.c, a.e], [a.b, a.d, a.f], [0, 0, 1]];
            }

            for (x = 0; x < 3; x++) {
                for (y = 0; y < 3; y++) {
                    res = 0;
                    for (z = 0; z < 3; z++) {
                        res += m[x][z] * matrix[z][y];
                    }
                    out[x][y] = res;
                }
            }
            this.a = out[0][0];
            this.b = out[1][0];
            this.c = out[0][1];
            this.d = out[1][1];
            this.e = out[0][2];
            this.f = out[1][2];
        };
        /*\
         * Matrix.invert
         [ method ]
         **
         * Returns inverted version of the matrix
         = (object) @Matrix
        \*/
        matrixproto.invert = function () {
            var me = this,
                x = me.a * me.d - me.b * me.c;
            return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
        };
        /*\
         * Matrix.clone
         [ method ]
         **
         * Returns copy of the matrix
         = (object) @Matrix
        \*/
        matrixproto.clone = function () {
            return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
        };
        /*\
         * Matrix.translate
         [ method ]
         **
         * Translate the matrix
         > Parameters
         - x (number)
         - y (number)
        \*/
        matrixproto.translate = function (x, y) {
            this.add(1, 0, 0, 1, x, y);
        };
        /*\
         * Matrix.scale
         [ method ]
         **
         * Scales the matrix
         > Parameters
         - x (number)
         - y (number) #optional
         - cx (number) #optional
         - cy (number) #optional
        \*/
        matrixproto.scale = function (x, y, cx, cy) {
            y == null && (y = x);
            (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
            this.add(x, 0, 0, y, 0, 0);
            (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
        };
        /*\
         * Matrix.rotate
         [ method ]
         **
         * Rotates the matrix
         > Parameters
         - a (number)
         - x (number)
         - y (number)
        \*/
        matrixproto.rotate = function (a, x, y) {
            a = R.rad(a);
            x = x || 0;
            y = y || 0;
            var cos = +math.cos(a).toFixed(9),
                sin = +math.sin(a).toFixed(9);
            this.add(cos, sin, -sin, cos, x, y);
            this.add(1, 0, 0, 1, -x, -y);
        };
        /*\
         * Matrix.x
         [ method ]
         **
         * Return x coordinate for given point after transformation described by the matrix. See also @Matrix.y
         > Parameters
         - x (number)
         - y (number)
         = (number) x
        \*/
        matrixproto.x = function (x, y) {
            return x * this.a + y * this.c + this.e;
        };
        /*\
         * Matrix.y
         [ method ]
         **
         * Return y coordinate for given point after transformation described by the matrix. See also @Matrix.x
         > Parameters
         - x (number)
         - y (number)
         = (number) y
        \*/
        matrixproto.y = function (x, y) {
            return x * this.b + y * this.d + this.f;
        };
        matrixproto.get = function (i) {
            return +this[Str.fromCharCode(97 + i)].toFixed(4);
        };
        matrixproto.toString = function () {
            return R.svg ?
                "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")" :
                [this.get(0), this.get(2), this.get(1), this.get(3), 0, 0].join();
        };
        matrixproto.toFilter = function () {
            return "progid:DXImageTransform.Microsoft.Matrix(M11=" + this.get(0) +
                ", M12=" + this.get(2) + ", M21=" + this.get(1) + ", M22=" + this.get(3) +
                ", Dx=" + this.get(4) + ", Dy=" + this.get(5) + ", sizingmethod='auto expand')";
        };
        matrixproto.offset = function () {
            return [this.e.toFixed(4), this.f.toFixed(4)];
        };
        function norm(a) {
            return a[0] * a[0] + a[1] * a[1];
        }
        function normalize(a) {
            var mag = math.sqrt(norm(a));
            a[0] && (a[0] /= mag);
            a[1] && (a[1] /= mag);
        }
        /*\
         * Matrix.split
         [ method ]
         **
         * Splits matrix into primitive transformations
         = (object) in format:
         o dx (number) translation by x
         o dy (number) translation by y
         o scalex (number) scale by x
         o scaley (number) scale by y
         o shear (number) shear
         o rotate (number) rotation in deg
         o isSimple (boolean) could it be represented via simple transformations
        \*/
        matrixproto.split = function () {
            var out = {};
            // translation
            out.dx = this.e;
            out.dy = this.f;

            // scale and shear
            var row = [[this.a, this.c], [this.b, this.d]];
            out.scalex = math.sqrt(norm(row[0]));
            normalize(row[0]);

            out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
            row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];

            out.scaley = math.sqrt(norm(row[1]));
            normalize(row[1]);
            out.shear /= out.scaley;

            // rotation
            var sin = -row[0][1],
                cos = row[1][1];
            if (cos < 0) {
                out.rotate = R.deg(math.acos(cos));
                if (sin < 0) {
                    out.rotate = 360 - out.rotate;
                }
            } else {
                out.rotate = R.deg(math.asin(sin));
            }

            out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
            out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
            out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
            return out;
        };
        /*\
         * Matrix.toTransformString
         [ method ]
         **
         * Return transform string that represents given matrix
         = (string) transform string
        \*/
        matrixproto.toTransformString = function (shorter) {
            var s = shorter || this[split]();
            if (s.isSimple) {
                s.scalex = +s.scalex.toFixed(4);
                s.scaley = +s.scaley.toFixed(4);
                s.rotate = +s.rotate.toFixed(4);
                return  (s.dx || s.dy ? "t" + [s.dx, s.dy] : E) + 
                        (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E) +
                        (s.rotate ? "r" + [s.rotate, 0, 0] : E);
            } else {
                return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
            }
        };
    })(Matrix.prototype);

    // WebKit rendering bug workaround method
    var version = navigator.userAgent.match(/Version\/(.*?)\s/) || navigator.userAgent.match(/Chrome\/(\d+)/);
    if ((navigator.vendor == "Apple Computer, Inc.") && (version && version[1] < 4 || navigator.platform.slice(0, 2) == "iP") ||
        (navigator.vendor == "Google Inc." && version && version[1] < 8)) {
        /*\
         * Paper.safari
         [ method ]
         **
         * There is an inconvenient rendering bug in Safari (WebKit):
         * sometimes the rendering should be forced.
         * This method should help with dealing with this bug.
        \*/
        paperproto.safari = function () {
            var rect = this.rect(-99, -99, this.width + 99, this.height + 99).attr({stroke: "none"});
            setTimeout(function () {rect.remove();});
        };
    } else {
        paperproto.safari = fun;
    }
 
    var preventDefault = function () {
        this.returnValue = false;
    },
    preventTouch = function () {
        return this.originalEvent.preventDefault();
    },
    stopPropagation = function () {
        this.cancelBubble = true;
    },
    stopTouch = function () {
        return this.originalEvent.stopPropagation();
    },
    addEvent = (function () {
        if (g.doc.addEventListener) {
            return function (obj, type, fn, element) {
                var realName = supportsTouch && touchMap[type] ? touchMap[type] : type,
                    f = function (e) {
                        var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                            scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                            x = e.clientX + scrollX,
                            y = e.clientY + scrollY;
                    if (supportsTouch && touchMap[has](type)) {
                        for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
                            if (e.targetTouches[i].target == obj) {
                                var olde = e;
                                e = e.targetTouches[i];
                                e.originalEvent = olde;
                                e.preventDefault = preventTouch;
                                e.stopPropagation = stopTouch;
                                break;
                            }
                        }
                    }
                    return fn.call(element, e, x, y);
                };
                obj.addEventListener(realName, f, false);
                return function () {
                    obj.removeEventListener(realName, f, false);
                    return true;
                };
            };
        } else if (g.doc.attachEvent) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    e = e || g.win.event;
                    var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                        scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
                        x = e.clientX + scrollX,
                        y = e.clientY + scrollY;
                    e.preventDefault = e.preventDefault || preventDefault;
                    e.stopPropagation = e.stopPropagation || stopPropagation;
                    return fn.call(element, e, x, y);
                };
                obj.attachEvent("on" + type, f);
                var detacher = function () {
                    obj.detachEvent("on" + type, f);
                    return true;
                };
                return detacher;
            };
        }
    })(),
    drag = [],
    dragMove = function (e) {
        var x = e.clientX,
            y = e.clientY,
            scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
            scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft,
            dragi,
            j = drag.length;
        while (j--) {
            dragi = drag[j];
            if (supportsTouch) {
                var i = e.touches.length,
                    touch;
                while (i--) {
                    touch = e.touches[i];
                    if (touch.identifier == dragi.el._drag.id) {
                        x = touch.clientX;
                        y = touch.clientY;
                        (e.originalEvent ? e.originalEvent : e).preventDefault();
                        break;
                    }
                }
            } else {
                e.preventDefault();
            }
            var node = dragi.el.node,
                o,
                next = node.nextSibling,
                parent = node.parentNode,
                display = node.style.display;
            g.win.opera && parent.removeChild(node);
            node.style.display = "none";
            o = dragi.el.paper.getElementByPoint(x, y);
            node.style.display = display;
            g.win.opera && (next ? parent.insertBefore(node, next) : parent.appendChild(node));
            o && eve("raphael.drag.over." + dragi.el.id, dragi.el, o);
            x += scrollX;
            y += scrollY;
            eve("raphael.drag.move." + dragi.el.id, dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
        }
    },
    dragUp = function (e) {
        R.unmousemove(dragMove).unmouseup(dragUp);
        var i = drag.length,
            dragi;
        while (i--) {
            dragi = drag[i];
            dragi.el._drag = {};
            eve("raphael.drag.end." + dragi.el.id, dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
        }
        drag = [];
    },
    /*\
     * Raphael.el
     [ property (object) ]
     **
     * You can add your own method to elements. This is usefull when you want to hack default functionality or
     * want to wrap some common transformation or attributes in one method. In difference to canvas methods,
     * you can redefine element method at any time. Expending element methods wouldn’t affect set.
     > Usage
     | Raphael.el.red = function () {
     |     this.attr({fill: "#f00"});
     | };
     | // then use it
     | paper.circle(100, 100, 20).red();
    \*/
    elproto = R.el = {};
    /*\
     * Element.click
     [ method ]
     **
     * Adds event handler for click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unclick
     [ method ]
     **
     * Removes event handler for click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.dblclick
     [ method ]
     **
     * Adds event handler for double click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.undblclick
     [ method ]
     **
     * Removes event handler for double click for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.mousedown
     [ method ]
     **
     * Adds event handler for mousedown for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmousedown
     [ method ]
     **
     * Removes event handler for mousedown for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.mousemove
     [ method ]
     **
     * Adds event handler for mousemove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmousemove
     [ method ]
     **
     * Removes event handler for mousemove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.mouseout
     [ method ]
     **
     * Adds event handler for mouseout for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseout
     [ method ]
     **
     * Removes event handler for mouseout for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.mouseover
     [ method ]
     **
     * Adds event handler for mouseover for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseover
     [ method ]
     **
     * Removes event handler for mouseover for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.mouseup
     [ method ]
     **
     * Adds event handler for mouseup for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.unmouseup
     [ method ]
     **
     * Removes event handler for mouseup for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.touchstart
     [ method ]
     **
     * Adds event handler for touchstart for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchstart
     [ method ]
     **
     * Removes event handler for touchstart for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.touchmove
     [ method ]
     **
     * Adds event handler for touchmove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchmove
     [ method ]
     **
     * Removes event handler for touchmove for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.touchend
     [ method ]
     **
     * Adds event handler for touchend for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchend
     [ method ]
     **
     * Removes event handler for touchend for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    
    /*\
     * Element.touchcancel
     [ method ]
     **
     * Adds event handler for touchcancel for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    /*\
     * Element.untouchcancel
     [ method ]
     **
     * Removes event handler for touchcancel for the element.
     > Parameters
     - handler (function) handler for the event
     = (object) @Element
    \*/
    for (var i = events.length; i--;) {
        (function (eventName) {
            R[eventName] = elproto[eventName] = function (fn, scope) {
                if (R.is(fn, "function")) {
                    this.events = this.events || [];
                    this.events.push({name: eventName, f: fn, unbind: addEvent(this.shape || this.node || g.doc, eventName, fn, scope || this)});
                }
                return this;
            };
            R["un" + eventName] = elproto["un" + eventName] = function (fn) {
                var events = this.events || [],
                    l = events.length;
                while (l--) if (events[l].name == eventName && events[l].f == fn) {
                    events[l].unbind();
                    events.splice(l, 1);
                    !events.length && delete this.events;
                    return this;
                }
                return this;
            };
        })(events[i]);
    }
    
    /*\
     * Element.data
     [ method ]
     **
     * Adds or retrieves given value asociated with given key.
     ** 
     * See also @Element.removeData
     > Parameters
     - key (string) key to store data
     - value (any) #optional value to store
     = (object) @Element
     * or, if value is not specified:
     = (any) value
     > Usage
     | for (var i = 0, i < 5, i++) {
     |     paper.circle(10 + 15 * i, 10, 10)
     |          .attr({fill: "#000"})
     |          .data("i", i)
     |          .click(function () {
     |             alert(this.data("i"));
     |          });
     | }
    \*/
    elproto.data = function (key, value) {
        var data = eldata[this.id] = eldata[this.id] || {};
        if (arguments.length == 1) {
            if (R.is(key, "object")) {
                for (var i in key) if (key[has](i)) {
                    this.data(i, key[i]);
                }
                return this;
            }
            eve("raphael.data.get." + this.id, this, data[key], key);
            return data[key];
        }
        data[key] = value;
        eve("raphael.data.set." + this.id, this, value, key);
        return this;
    };
    /*\
     * Element.removeData
     [ method ]
     **
     * Removes value associated with an element by given key.
     * If key is not provided, removes all the data of the element.
     > Parameters
     - key (string) #optional key
     = (object) @Element
    \*/
    elproto.removeData = function (key) {
        if (key == null) {
            eldata[this.id] = {};
        } else {
            eldata[this.id] && delete eldata[this.id][key];
        }
        return this;
    };
     /*\
     * Element.getData
     [ method ]
     **
     * Retrieves the element data
     = (object) data
    \*/
    elproto.getData = function () {
        return clone(eldata[this.id] || {});
    };
    /*\
     * Element.hover
     [ method ]
     **
     * Adds event handlers for hover for the element.
     > Parameters
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     - icontext (object) #optional context for hover in handler
     - ocontext (object) #optional context for hover out handler
     = (object) @Element
    \*/
    elproto.hover = function (f_in, f_out, scope_in, scope_out) {
        return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
    };
    /*\
     * Element.unhover
     [ method ]
     **
     * Removes event handlers for hover for the element.
     > Parameters
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     = (object) @Element
    \*/
    elproto.unhover = function (f_in, f_out) {
        return this.unmouseover(f_in).unmouseout(f_out);
    };
    var draggable = [];
    /*\
     * Element.drag
     [ method ]
     **
     * Adds event handlers for drag of the element.
     > Parameters
     - onmove (function) handler for moving
     - onstart (function) handler for drag start
     - onend (function) handler for drag end
     - mcontext (object) #optional context for moving handler
     - scontext (object) #optional context for drag start handler
     - econtext (object) #optional context for drag end handler
     * Additionaly following `drag` events will be triggered: `drag.start.<id>` on start, 
     * `drag.end.<id>` on end and `drag.move.<id>` on every move. When element will be dragged over another element 
     * `drag.over.<id>` will be fired as well.
     *
     * Start event and start handler will be called in specified context or in context of the element with following parameters:
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * Move event and move handler will be called in specified context or in context of the element with following parameters:
     o dx (number) shift by x from the start point
     o dy (number) shift by y from the start point
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * End event and end handler will be called in specified context or in context of the element with following parameters:
     o event (object) DOM event object
     = (object) @Element
    \*/
    elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
        function start(e) {
            (e.originalEvent || e).preventDefault();
            var scrollY = g.doc.documentElement.scrollTop || g.doc.body.scrollTop,
                scrollX = g.doc.documentElement.scrollLeft || g.doc.body.scrollLeft;
            this._drag.x = e.clientX + scrollX;
            this._drag.y = e.clientY + scrollY;
            this._drag.id = e.identifier;
            !drag.length && R.mousemove(dragMove).mouseup(dragUp);
            drag.push({el: this, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope});
            onstart && eve.on("raphael.drag.start." + this.id, onstart);
            onmove && eve.on("raphael.drag.move." + this.id, onmove);
            onend && eve.on("raphael.drag.end." + this.id, onend);
            eve("raphael.drag.start." + this.id, start_scope || move_scope || this, e.clientX + scrollX, e.clientY + scrollY, e);
        }
        this._drag = {};
        draggable.push({el: this, start: start});
        this.mousedown(start);
        return this;
    };
    /*\
     * Element.onDragOver
     [ method ]
     **
     * Shortcut for assigning event handler for `drag.over.<id>` event, where id is id of the element (see @Element.id).
     > Parameters
     - f (function) handler for event, first argument would be the element you are dragging over
    \*/
    elproto.onDragOver = function (f) {
        f ? eve.on("raphael.drag.over." + this.id, f) : eve.unbind("raphael.drag.over." + this.id);
    };
    /*\
     * Element.undrag
     [ method ]
     **
     * Removes all drag event handlers from given element.
    \*/
    elproto.undrag = function () {
        var i = draggable.length;
        while (i--) if (draggable[i].el == this) {
            this.unmousedown(draggable[i].start);
            draggable.splice(i, 1);
            eve.unbind("raphael.drag.*." + this.id);
        }
        !draggable.length && R.unmousemove(dragMove).unmouseup(dragUp);
        drag = [];
    };
    /*\
     * Paper.circle
     [ method ]
     **
     * Draws a circle.
     **
     > Parameters
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - r (number) radius
     = (object) Raphaël element object with type “circle”
     **
     > Usage
     | var c = paper.circle(50, 50, 40);
    \*/
    paperproto.circle = function (x, y, r) {
        var out = R._engine.circle(this, x || 0, y || 0, r || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.rect
     [ method ]
     *
     * Draws a rectangle.
     **
     > Parameters
     **
     - x (number) x coordinate of the top left corner
     - y (number) y coordinate of the top left corner
     - width (number) width
     - height (number) height
     - r (number) #optional radius for rounded corners, default is 0
     = (object) Raphaël element object with type “rect”
     **
     > Usage
     | // regular rectangle
     | var c = paper.rect(10, 10, 50, 50);
     | // rectangle with rounded corners
     | var c = paper.rect(40, 40, 50, 50, 10);
    \*/
    paperproto.rect = function (x, y, w, h, r) {
        var out = R._engine.rect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.ellipse
     [ method ]
     **
     * Draws an ellipse.
     **
     > Parameters
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - rx (number) horizontal radius
     - ry (number) vertical radius
     = (object) Raphaël element object with type “ellipse”
     **
     > Usage
     | var c = paper.ellipse(50, 50, 40, 20);
    \*/
    paperproto.ellipse = function (x, y, rx, ry) {
        var out = R._engine.ellipse(this, x || 0, y || 0, rx || 0, ry || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.path
     [ method ]
     **
     * Creates a path element by given path data string.
     > Parameters
     - pathString (string) #optional path string in SVG format.
     * Path string consists of one-letter commands, followed by comma seprarated arguments in numercal form. Example:
     | "M10,20L30,40"
     * Here we can see two commands: “M”, with arguments `(10, 20)` and “L” with arguments `(30, 40)`. Upper case letter mean command is absolute, lower case—relative.
     *
     # <p>Here is short list of commands available, for more details see <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path's data attribute's format are described in the SVG specification.">SVG path string format</a>.</p>
     # <table><thead><tr><th>Command</th><th>Name</th><th>Parameters</th></tr></thead><tbody>
     # <tr><td>M</td><td>moveto</td><td>(x y)+</td></tr>
     # <tr><td>Z</td><td>closepath</td><td>(none)</td></tr>
     # <tr><td>L</td><td>lineto</td><td>(x y)+</td></tr>
     # <tr><td>H</td><td>horizontal lineto</td><td>x+</td></tr>
     # <tr><td>V</td><td>vertical lineto</td><td>y+</td></tr>
     # <tr><td>C</td><td>curveto</td><td>(x1 y1 x2 y2 x y)+</td></tr>
     # <tr><td>S</td><td>smooth curveto</td><td>(x2 y2 x y)+</td></tr>
     # <tr><td>Q</td><td>quadratic Bézier curveto</td><td>(x1 y1 x y)+</td></tr>
     # <tr><td>T</td><td>smooth quadratic Bézier curveto</td><td>(x y)+</td></tr>
     # <tr><td>A</td><td>elliptical arc</td><td>(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+</td></tr>
     # <tr><td>R</td><td><a href="http://en.wikipedia.org/wiki/Catmull–Rom_spline#Catmull.E2.80.93Rom_spline">Catmull-Rom curveto</a>*</td><td>x1 y1 (x y)+</td></tr></tbody></table>
     * * “Catmull-Rom curveto” is a not standard SVG command and added in 2.0 to make life easier.
     * Note: there is a special case when path consist of just three commands: “M10,10R…z”. In this case path will smoothly connects to its beginning.
     > Usage
     | var c = paper.path("M10 10L90 90");
     | // draw a diagonal line:
     | // move to 10,10, line to 90,90
     * For example of path strings, check out these icons: http://raphaeljs.com/icons/
    \*/
    paperproto.path = function (pathString) {
        pathString && !R.is(pathString, string) && !R.is(pathString[0], array) && (pathString += E);
        var out = R._engine.path(R.format[apply](R, arguments), this);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.image
     [ method ]
     **
     * Embeds an image into the surface.
     **
     > Parameters
     **
     - src (string) URI of the source image
     - x (number) x coordinate position
     - y (number) y coordinate position
     - width (number) width of the image
     - height (number) height of the image
     = (object) Raphaël element object with type “image”
     **
     > Usage
     | var c = paper.image("apple.png", 10, 10, 80, 80);
    \*/
    paperproto.image = function (src, x, y, w, h) {
        var out = R._engine.image(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.text
     [ method ]
     **
     * Draws a text string. If you need line breaks, put “\n” in the string.
     **
     > Parameters
     **
     - x (number) x coordinate position
     - y (number) y coordinate position
     - text (string) The text string to draw
     = (object) Raphaël element object with type “text”
     **
     > Usage
     | var t = paper.text(50, 50, "Raphaël\nkicks\nbutt!");
    \*/
    paperproto.text = function (x, y, text) {
        var out = R._engine.text(this, x || 0, y || 0, Str(text));
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Paper.set
     [ method ]
     **
     * Creates array-like object to keep and operate several elements at once.
     * Warning: it doesn’t create any elements for itself in the page, it just groups existing elements.
     * Sets act as pseudo elements — all methods available to an element can be used on a set.
     = (object) array-like object that represents set of elements
     **
     > Usage
     | var st = paper.set();
     | st.push(
     |     paper.circle(10, 10, 5),
     |     paper.circle(30, 10, 5)
     | );
     | st.attr({fill: "red"}); // changes the fill of both circles
    \*/
    paperproto.set = function (itemsArray) {
        !R.is(itemsArray, "array") && (itemsArray = Array.prototype.splice.call(arguments, 0, arguments.length));
        var out = new Set(itemsArray);
        this.__set__ && this.__set__.push(out);
        out["paper"] = this;
        out["type"] = "set";
        return out;
    };
    /*\
     * Paper.setStart
     [ method ]
     **
     * Creates @Paper.set. All elements that will be created after calling this method and before calling
     * @Paper.setFinish will be added to the set.
     **
     > Usage
     | paper.setStart();
     | paper.circle(10, 10, 5),
     | paper.circle(30, 10, 5)
     | var st = paper.setFinish();
     | st.attr({fill: "red"}); // changes the fill of both circles
    \*/
    paperproto.setStart = function (set) {
        this.__set__ = set || this.set();
    };
    /*\
     * Paper.setFinish
     [ method ]
     **
     * See @Paper.setStart. This method finishes catching and returns resulting set.
     **
     = (object) set
    \*/
    paperproto.setFinish = function (set) {
        var out = this.__set__;
        delete this.__set__;
        return out;
    };
    /*\
     * Paper.setSize
     [ method ]
     **
     * If you need to change dimensions of the canvas call this method
     **
     > Parameters
     **
     - width (number) new width of the canvas
     - height (number) new height of the canvas
    \*/
    paperproto.setSize = function (width, height) {
        return R._engine.setSize.call(this, width, height);
    };
    /*\
     * Paper.setViewBox
     [ method ]
     **
     * Sets the view box of the paper. Practically it gives you ability to zoom and pan whole paper surface by 
     * specifying new boundaries.
     **
     > Parameters
     **
     - x (number) new x position, default is `0`
     - y (number) new y position, default is `0`
     - w (number) new width of the canvas
     - h (number) new height of the canvas
     - fit (boolean) `true` if you want graphics to fit into new boundary box
    \*/
    paperproto.setViewBox = function (x, y, w, h, fit) {
        return R._engine.setViewBox.call(this, x, y, w, h, fit);
    };
    /*\
     * Paper.top
     [ property ]
     **
     * Points to the topmost element on the paper
    \*/
    /*\
     * Paper.bottom
     [ property ]
     **
     * Points to the bottom element on the paper
    \*/
    paperproto.top = paperproto.bottom = null;
    /*\
     * Paper.raphael
     [ property ]
     **
     * Points to the @Raphael object/function
    \*/
    paperproto.raphael = R;
    var getOffset = function (elem) {
        var box = elem.getBoundingClientRect(),
            doc = elem.ownerDocument,
            body = doc.body,
            docElem = doc.documentElement,
            clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
            top  = box.top  + (g.win.pageYOffset || docElem.scrollTop || body.scrollTop ) - clientTop,
            left = box.left + (g.win.pageXOffset || docElem.scrollLeft || body.scrollLeft) - clientLeft;
        return {
            y: top,
            x: left
        };
    };
    /*\
     * Paper.getElementByPoint
     [ method ]
     **
     * Returns you topmost element under given point.
     **
     = (object) Raphaël element object
     > Parameters
     **
     - x (number) x coordinate from the top left corner of the window
     - y (number) y coordinate from the top left corner of the window
     > Usage
     | paper.getElementByPoint(mouseX, mouseY).attr({stroke: "#f00"});
    \*/
    paperproto.getElementByPoint = function (x, y) {
        var paper = this,
            svg = paper.canvas,
            target = g.doc.elementFromPoint(x, y);
        if (g.win.opera && target.tagName == "svg") {
            var so = getOffset(svg),
                sr = svg.createSVGRect();
            sr.x = x - so.x;
            sr.y = y - so.y;
            sr.width = sr.height = 1;
            var hits = svg.getIntersectionList(sr, null);
            if (hits.length) {
                target = hits[hits.length - 1];
            }
        }
        if (!target) {
            return null;
        }
        while (target.parentNode && target != svg.parentNode && !target.raphael) {
            target = target.parentNode;
        }
        target == paper.canvas.parentNode && (target = svg);
        target = target && target.raphael ? paper.getById(target.raphaelid) : null;
        return target;
    };

    /*\
     * Paper.getElementsByBBox
     [ method ]
     **
     * Returns set of elements that have an intersecting bounding box
     **
     > Parameters
     **
     - bbox (object) bbox to check with
     = (object) @Set
     \*/
    paperproto.getElementsByBBox = function (bbox) {
        var set = this.set();
        this.forEach(function (el) {
            if (R.isBBoxIntersect(el.getBBox(), bbox)) {
                set.push(el);
            }
        });
        return set;
    };

    /*\
     * Paper.getById
     [ method ]
     **
     * Returns you element by its internal ID.
     **
     > Parameters
     **
     - id (number) id
     = (object) Raphaël element object
    \*/
    paperproto.getById = function (id) {
        var bot = this.bottom;
        while (bot) {
            if (bot.id == id) {
                return bot;
            }
            bot = bot.next;
        }
        return null;
    };
    /*\
     * Paper.forEach
     [ method ]
     **
     * Executes given function for each element on the paper
     *
     * If callback function returns `false` it will stop loop running.
     **
     > Parameters
     **
     - callback (function) function to run
     - thisArg (object) context object for the callback
     = (object) Paper object
     > Usage
     | paper.forEach(function (el) {
     |     el.attr({ stroke: "blue" });
     | });
    \*/
    paperproto.forEach = function (callback, thisArg) {
        var bot = this.bottom;
        while (bot) {
            if (callback.call(thisArg, bot) === false) {
                return this;
            }
            bot = bot.next;
        }
        return this;
    };
    /*\
     * Paper.getElementsByPoint
     [ method ]
     **
     * Returns set of elements that have common point inside
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (object) @Set
    \*/
    paperproto.getElementsByPoint = function (x, y) {
        var set = this.set();
        this.forEach(function (el) {
            if (el.isPointInside(x, y)) {
                set.push(el);
            }
        });
        return set;
    };
    function x_y() {
        return this.x + S + this.y;
    }
    function x_y_w_h() {
        return this.x + S + this.y + S + this.width + " \xd7 " + this.height;
    }
    /*\
     * Element.isPointInside
     [ method ]
     **
     * Determine if given point is inside this element’s shape
     **
     > Parameters
     **
     - x (number) x coordinate of the point
     - y (number) y coordinate of the point
     = (boolean) `true` if point inside the shape
    \*/
    elproto.isPointInside = function (x, y) {
        var rp = this.realPath = this.realPath || getPath[this.type](this);
        return R.isPointInsidePath(rp, x, y);
    };
    /*\
     * Element.getBBox
     [ method ]
     **
     * Return bounding box for a given element
     **
     > Parameters
     **
     - isWithoutTransform (boolean) flag, `true` if you want to have bounding box before transformations. Default is `false`.
     = (object) Bounding box object:
     o {
     o     x: (number) top left corner x
     o     y: (number) top left corner y
     o     x2: (number) bottom right corner x
     o     y2: (number) bottom right corner y
     o     width: (number) width
     o     height: (number) height
     o }
    \*/
    elproto.getBBox = function (isWithoutTransform) {
        if (this.removed) {
            return {};
        }
        var _ = this._;
        if (isWithoutTransform) {
            if (_.dirty || !_.bboxwt) {
                this.realPath = getPath[this.type](this);
                _.bboxwt = pathDimensions(this.realPath);
                _.bboxwt.toString = x_y_w_h;
                _.dirty = 0;
            }
            return _.bboxwt;
        }
        if (_.dirty || _.dirtyT || !_.bbox) {
            if (_.dirty || !this.realPath) {
                _.bboxwt = 0;
                this.realPath = getPath[this.type](this);
            }
            _.bbox = pathDimensions(mapPath(this.realPath, this.matrix));
            _.bbox.toString = x_y_w_h;
            _.dirty = _.dirtyT = 0;
        }
        return _.bbox;
    };
    /*\
     * Element.clone
     [ method ]
     **
     = (object) clone of a given element
     **
    \*/
    elproto.clone = function () {
        if (this.removed) {
            return null;
        }
        var out = this.paper[this.type]().attr(this.attr());
        this.__set__ && this.__set__.push(out);
        return out;
    };
    /*\
     * Element.glow
     [ method ]
     **
     * Return set of elements that create glow-like effect around given element. See @Paper.set.
     *
     * Note: Glow is not connected to the element. If you change element attributes it won’t adjust itself.
     **
     > Parameters
     **
     - glow (object) #optional parameters object with all properties optional:
     o {
     o     width (number) size of the glow, default is `10`
     o     fill (boolean) will it be filled, default is `false`
     o     opacity (number) opacity, default is `0.5`
     o     offsetx (number) horizontal offset, default is `0`
     o     offsety (number) vertical offset, default is `0`
     o     color (string) glow colour, default is `black`
     o }
     = (object) @Paper.set of elements that represents glow
    \*/
    elproto.glow = function (glow) {
        if (this.type == "text") {
            return null;
        }
        glow = glow || {};
        var s = {
            width: (glow.width || 10) + (+this.attr("stroke-width") || 1),
            fill: glow.fill || false,
            opacity: glow.opacity || .5,
            offsetx: glow.offsetx || 0,
            offsety: glow.offsety || 0,
            color: glow.color || "#000"
        },
            c = s.width / 2,
            r = this.paper,
            out = r.set(),
            path = this.realPath || getPath[this.type](this);
        path = this.matrix ? mapPath(path, this.matrix) : path;
        for (var i = 1; i < c + 1; i++) {
            out.push(r.path(path).attr({
                stroke: s.color,
                fill: s.fill ? s.color : "none",
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
                "stroke-width": +(s.width / c * i).toFixed(3),
                opacity: +(s.opacity / c).toFixed(3)
            }));
        }
        return out.insertBefore(this).translate(s.offsetx, s.offsety);
    };
    var curveslengths = {},
    getPointAtSegmentLength = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
        if (length == null) {
            return bezlen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
        } else {
            return R.findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, getTatLen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length));
        }
    },
    getLengthFactory = function (istotal, subpath) {
        return function (path, length, onlystart) {
            path = path2curve(path);
            var x, y, p, l, sp = "", subpaths = {}, point,
                len = 0;
            for (var i = 0, ii = path.length; i < ii; i++) {
                p = path[i];
                if (p[0] == "M") {
                    x = +p[1];
                    y = +p[2];
                } else {
                    l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                    if (len + l > length) {
                        if (subpath && !subpaths.start) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            sp += ["C" + point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                            if (onlystart) {return sp;}
                            subpaths.start = sp;
                            sp = ["M" + point.x, point.y + "C" + point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]].join();
                            len += l;
                            x = +p[5];
                            y = +p[6];
                            continue;
                        }
                        if (!istotal && !subpath) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            return {x: point.x, y: point.y, alpha: point.alpha};
                        }
                    }
                    len += l;
                    x = +p[5];
                    y = +p[6];
                }
                sp += p.shift() + p;
            }
            subpaths.end = sp;
            point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
            point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
            return point;
        };
    };
    var getTotalLength = getLengthFactory(1),
        getPointAtLength = getLengthFactory(),
        getSubpathsAtLength = getLengthFactory(0, 1);
    /*\
     * Raphael.getTotalLength
     [ method ]
     **
     * Returns length of the given path in pixels.
     **
     > Parameters
     **
     - path (string) SVG path string.
     **
     = (number) length.
    \*/
    R.getTotalLength = getTotalLength;
    /*\
     * Raphael.getPointAtLength
     [ method ]
     **
     * Return coordinates of the point located at the given length on the given path.
     **
     > Parameters
     **
     - path (string) SVG path string
     - length (number)
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate
     o     y: (number) y coordinate
     o     alpha: (number) angle of derivative
     o }
    \*/
    R.getPointAtLength = getPointAtLength;
    /*\
     * Raphael.getSubpath
     [ method ]
     **
     * Return subpath of a given path from given length to given length.
     **
     > Parameters
     **
     - path (string) SVG path string
     - from (number) position of the start of the segment
     - to (number) position of the end of the segment
     **
     = (string) pathstring for the segment
    \*/
    R.getSubpath = function (path, from, to) {
        if (this.getTotalLength(path) - to < 1e-6) {
            return getSubpathsAtLength(path, from).end;
        }
        var a = getSubpathsAtLength(path, to, 1);
        return from ? getSubpathsAtLength(a, from).end : a;
    };
    /*\
     * Element.getTotalLength
     [ method ]
     **
     * Returns length of the path in pixels. Only works for element of “path” type.
     = (number) length.
    \*/
    elproto.getTotalLength = function () {
        if (this.type != "path") {return;}
        if (this.node.getTotalLength) {
            return this.node.getTotalLength();
        }
        return getTotalLength(this.attrs.path);
    };
    /*\
     * Element.getPointAtLength
     [ method ]
     **
     * Return coordinates of the point located at the given length on the given path. Only works for element of “path” type.
     **
     > Parameters
     **
     - length (number)
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate
     o     y: (number) y coordinate
     o     alpha: (number) angle of derivative
     o }
    \*/
    elproto.getPointAtLength = function (length) {
        if (this.type != "path") {return;}
        return getPointAtLength(this.attrs.path, length);
    };
    /*\
     * Element.getSubpath
     [ method ]
     **
     * Return subpath of a given element from given length to given length. Only works for element of “path” type.
     **
     > Parameters
     **
     - from (number) position of the start of the segment
     - to (number) position of the end of the segment
     **
     = (string) pathstring for the segment
    \*/
    elproto.getSubpath = function (from, to) {
        if (this.type != "path") {return;}
        return R.getSubpath(this.attrs.path, from, to);
    };
    /*\
     * Raphael.easing_formulas
     [ property ]
     **
     * Object that contains easing formulas for animation. You could extend it with your own. By default it has following list of easing:
     # <ul>
     #     <li>“linear”</li>
     #     <li>“&lt;” or “easeIn” or “ease-in”</li>
     #     <li>“>” or “easeOut” or “ease-out”</li>
     #     <li>“&lt;>” or “easeInOut” or “ease-in-out”</li>
     #     <li>“backIn” or “back-in”</li>
     #     <li>“backOut” or “back-out”</li>
     #     <li>“elastic”</li>
     #     <li>“bounce”</li>
     # </ul>
     # <p>See also <a href="http://raphaeljs.com/easing.html">Easing demo</a>.</p>
    \*/
    var ef = R.easing_formulas = {
        linear: function (n) {
            return n;
        },
        "<": function (n) {
            return pow(n, 1.7);
        },
        ">": function (n) {
            return pow(n, .48);
        },
        "<>": function (n) {
            var q = .48 - n / 1.04,
                Q = math.sqrt(.1734 + q * q),
                x = Q - q,
                X = pow(abs(x), 1 / 3) * (x < 0 ? -1 : 1),
                y = -Q - q,
                Y = pow(abs(y), 1 / 3) * (y < 0 ? -1 : 1),
                t = X + Y + .5;
            return (1 - t) * 3 * t * t + t * t * t;
        },
        backIn: function (n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        backOut: function (n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic: function (n) {
            if (n == !!n) {
                return n;
            }
            return pow(2, -10 * n) * math.sin((n - .075) * (2 * PI) / .3) + 1;
        },
        bounce: function (n) {
            var s = 7.5625,
                p = 2.75,
                l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + .75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + .9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + .984375;
                    }
                }
            }
            return l;
        }
    };
    ef.easeIn = ef["ease-in"] = ef["<"];
    ef.easeOut = ef["ease-out"] = ef[">"];
    ef.easeInOut = ef["ease-in-out"] = ef["<>"];
    ef["back-in"] = ef.backIn;
    ef["back-out"] = ef.backOut;

    var animationElements = [],
        requestAnimFrame = window.requestAnimationFrame       ||
                           window.webkitRequestAnimationFrame ||
                           window.mozRequestAnimationFrame    ||
                           window.oRequestAnimationFrame      ||
                           window.msRequestAnimationFrame     ||
                           function (callback) {
                               setTimeout(callback, 16);
                           },
        animation = function () {
            var Now = +new Date,
                l = 0;
            for (; l < animationElements.length; l++) {
                var e = animationElements[l];
                if (e.el.removed || e.paused) {
                    continue;
                }
                var time = Now - e.start,
                    ms = e.ms,
                    easing = e.easing,
                    from = e.from,
                    diff = e.diff,
                    to = e.to,
                    t = e.t,
                    that = e.el,
                    set = {},
                    now,
                    init = {},
                    key;
                if (e.initstatus) {
                    time = (e.initstatus * e.anim.top - e.prev) / (e.percent - e.prev) * ms;
                    e.status = e.initstatus;
                    delete e.initstatus;
                    e.stop && animationElements.splice(l--, 1);
                } else {
                    e.status = (e.prev + (e.percent - e.prev) * (time / ms)) / e.anim.top;
                }
                if (time < 0) {
                    continue;
                }
                if (time < ms) {
                    var pos = easing(time / ms);
                    for (var attr in from) if (from[has](attr)) {
                        switch (availableAnimAttrs[attr]) {
                            case nu:
                                now = +from[attr] + pos * ms * diff[attr];
                                break;
                            case "colour":
                                now = "rgb(" + [
                                    upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                    upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                    upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                ].join(",") + ")";
                                break;
                            case "path":
                                now = [];
                                for (var i = 0, ii = from[attr].length; i < ii; i++) {
                                    now[i] = [from[attr][i][0]];
                                    for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                        now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                    }
                                    now[i] = now[i].join(S);
                                }
                                now = now.join(S);
                                break;
                            case "transform":
                                if (diff[attr].real) {
                                    now = [];
                                    for (i = 0, ii = from[attr].length; i < ii; i++) {
                                        now[i] = [from[attr][i][0]];
                                        for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                            now[i][j] = from[attr][i][j] + pos * ms * diff[attr][i][j];
                                        }
                                    }
                                } else {
                                    var get = function (i) {
                                        return +from[attr][i] + pos * ms * diff[attr][i];
                                    };
                                    // now = [["r", get(2), 0, 0], ["t", get(3), get(4)], ["s", get(0), get(1), 0, 0]];
                                    now = [["m", get(0), get(1), get(2), get(3), get(4), get(5)]];
                                }
                                break;
                            case "csv":
                                if (attr == "clip-rect") {
                                    now = [];
                                    i = 4;
                                    while (i--) {
                                        now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                    }
                                }
                                break;
                            default:
                                var from2 = [][concat](from[attr]);
                                now = [];
                                i = that.paper.customAttributes[attr].length;
                                while (i--) {
                                    now[i] = +from2[i] + pos * ms * diff[attr][i];
                                }
                                break;
                        }
                        set[attr] = now;
                    }
                    that.attr(set);
                    (function (id, that, anim) {
                        setTimeout(function () {
                            eve("raphael.anim.frame." + id, that, anim);
                        });
                    })(that.id, that, e.anim);
                } else {
                    (function(f, el, a) {
                        setTimeout(function() {
                            eve("raphael.anim.frame." + el.id, el, a);
                            eve("raphael.anim.finish." + el.id, el, a);
                            R.is(f, "function") && f.call(el);
                        });
                    })(e.callback, that, e.anim);
                    that.attr(to);
                    animationElements.splice(l--, 1);
                    if (e.repeat > 1 && !e.next) {
                        for (key in to) if (to[has](key)) {
                            init[key] = e.totalOrigin[key];
                        }
                        e.el.attr(init);
                        runAnimation(e.anim, e.el, e.anim.percents[0], null, e.totalOrigin, e.repeat - 1);
                    }
                    if (e.next && !e.stop) {
                        runAnimation(e.anim, e.el, e.next, null, e.totalOrigin, e.repeat);
                    }
                }
            }
            R.svg && that && that.paper && that.paper.safari();
            animationElements.length && requestAnimFrame(animation);
        },
        upto255 = function (color) {
            return color > 255 ? 255 : color < 0 ? 0 : color;
        };
    /*\
     * Element.animateWith
     [ method ]
     **
     * Acts similar to @Element.animate, but ensure that given animation runs in sync with another given element.
     **
     > Parameters
     **
     - el (object) element to sync with
     - anim (object) animation to sync with
     - params (object) #optional final attributes for the element, see also @Element.attr
     - ms (number) #optional number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept on of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     * or
     - element (object) element to sync with
     - anim (object) animation to sync with
     - animation (object) #optional animation object, see @Raphael.animation
     **
     = (object) original element
    \*/
    elproto.animateWith = function (el, anim, params, ms, easing, callback) {
        var element = this;
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var a = params instanceof Animation ? params : R.animation(params, ms, easing, callback),
            x, y;
        runAnimation(a, element, a.percents[0], null, element.attr());
        for (var i = 0, ii = animationElements.length; i < ii; i++) {
            if (animationElements[i].anim == anim && animationElements[i].el == el) {
                animationElements[ii - 1].start = animationElements[i].start;
                break;
            }
        }
        return element;
        // 
        // 
        // var a = params ? R.animation(params, ms, easing, callback) : anim,
        //     status = element.status(anim);
        // return this.animate(a).status(a, status * anim.ms / a.ms);
    };
    function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
        var cx = 3 * p1x,
            bx = 3 * (p2x - p1x) - cx,
            ax = 1 - cx - bx,
            cy = 3 * p1y,
            by = 3 * (p2y - p1y) - cy,
            ay = 1 - cy - by;
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function solve(x, epsilon) {
            var t = solveCurveX(x, epsilon);
            return ((ay * t + by) * t + cy) * t;
        }
        function solveCurveX(x, epsilon) {
            var t0, t1, t2, x2, d2, i;
            for(t2 = x, i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < epsilon) {
                    return t2;
                }
                d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                if (abs(d2) < 1e-6) {
                    break;
                }
                t2 = t2 - x2 / d2;
            }
            t0 = 0;
            t1 = 1;
            t2 = x;
            if (t2 < t0) {
                return t0;
            }
            if (t2 > t1) {
                return t1;
            }
            while (t0 < t1) {
                x2 = sampleCurveX(t2);
                if (abs(x2 - x) < epsilon) {
                    return t2;
                }
                if (x > x2) {
                    t0 = t2;
                } else {
                    t1 = t2;
                }
                t2 = (t1 - t0) / 2 + t0;
            }
            return t2;
        }
        return solve(t, 1 / (200 * duration));
    }
    elproto.onAnimation = function (f) {
        f ? eve.on("raphael.anim.frame." + this.id, f) : eve.unbind("raphael.anim.frame." + this.id);
        return this;
    };
    function Animation(anim, ms) {
        var percents = [],
            newAnim = {};
        this.ms = ms;
        this.times = 1;
        if (anim) {
            for (var attr in anim) if (anim[has](attr)) {
                newAnim[toFloat(attr)] = anim[attr];
                percents.push(toFloat(attr));
            }
            percents.sort(sortByNumber);
        }
        this.anim = newAnim;
        this.top = percents[percents.length - 1];
        this.percents = percents;
    }
    /*\
     * Animation.delay
     [ method ]
     **
     * Creates a copy of existing animation object with given delay.
     **
     > Parameters
     **
     - delay (number) number of ms to pass between animation start and actual animation
     **
     = (object) new altered Animation object
     | var anim = Raphael.animation({cx: 10, cy: 20}, 2e3);
     | circle1.animate(anim); // run the given animation immediately
     | circle2.animate(anim.delay(500)); // run the given animation after 500 ms
    \*/
    Animation.prototype.delay = function (delay) {
        var a = new Animation(this.anim, this.ms);
        a.times = this.times;
        a.del = +delay || 0;
        return a;
    };
    /*\
     * Animation.repeat
     [ method ]
     **
     * Creates a copy of existing animation object with given repetition.
     **
     > Parameters
     **
     - repeat (number) number iterations of animation. For infinite animation pass `Infinity`
     **
     = (object) new altered Animation object
    \*/
    Animation.prototype.repeat = function (times) { 
        var a = new Animation(this.anim, this.ms);
        a.del = this.del;
        a.times = math.floor(mmax(times, 0)) || 1;
        return a;
    };
    function runAnimation(anim, element, percent, status, totalOrigin, times) {
        percent = toFloat(percent);
        var params,
            isInAnim,
            isInAnimSet,
            percents = [],
            next,
            prev,
            timestamp,
            ms = anim.ms,
            from = {},
            to = {},
            diff = {};
        if (status) {
            for (i = 0, ii = animationElements.length; i < ii; i++) {
                var e = animationElements[i];
                if (e.el.id == element.id && e.anim == anim) {
                    if (e.percent != percent) {
                        animationElements.splice(i, 1);
                        isInAnimSet = 1;
                    } else {
                        isInAnim = e;
                    }
                    element.attr(e.totalOrigin);
                    break;
                }
            }
        } else {
            status = +to; // NaN
        }
        for (var i = 0, ii = anim.percents.length; i < ii; i++) {
            if (anim.percents[i] == percent || anim.percents[i] > status * anim.top) {
                percent = anim.percents[i];
                prev = anim.percents[i - 1] || 0;
                ms = ms / anim.top * (percent - prev);
                next = anim.percents[i + 1];
                params = anim.anim[percent];
                break;
            } else if (status) {
                element.attr(anim.anim[anim.percents[i]]);
            }
        }
        if (!params) {
            return;
        }
        if (!isInAnim) {
            for (var attr in params) if (params[has](attr)) {
                if (availableAnimAttrs[has](attr) || element.paper.customAttributes[has](attr)) {
                    from[attr] = element.attr(attr);
                    (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                    to[attr] = params[attr];
                    switch (availableAnimAttrs[attr]) {
                        case nu:
                            diff[attr] = (to[attr] - from[attr]) / ms;
                            break;
                        case "colour":
                            from[attr] = R.getRGB(from[attr]);
                            var toColour = R.getRGB(to[attr]);
                            diff[attr] = {
                                r: (toColour.r - from[attr].r) / ms,
                                g: (toColour.g - from[attr].g) / ms,
                                b: (toColour.b - from[attr].b) / ms
                            };
                            break;
                        case "path":
                            var pathes = path2curve(from[attr], to[attr]),
                                toPath = pathes[1];
                            from[attr] = pathes[0];
                            diff[attr] = [];
                            for (i = 0, ii = from[attr].length; i < ii; i++) {
                                diff[attr][i] = [0];
                                for (var j = 1, jj = from[attr][i].length; j < jj; j++) {
                                    diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                                }
                            }
                            break;
                        case "transform":
                            var _ = element._,
                                eq = equaliseTransform(_[attr], to[attr]);
                            if (eq) {
                                from[attr] = eq.from;
                                to[attr] = eq.to;
                                diff[attr] = [];
                                diff[attr].real = true;
                                for (i = 0, ii = from[attr].length; i < ii; i++) {
                                    diff[attr][i] = [from[attr][i][0]];
                                    for (j = 1, jj = from[attr][i].length; j < jj; j++) {
                                        diff[attr][i][j] = (to[attr][i][j] - from[attr][i][j]) / ms;
                                    }
                                }
                            } else {
                                var m = (element.matrix || new Matrix),
                                    to2 = {
                                        _: {transform: _.transform},
                                        getBBox: function () {
                                            return element.getBBox(1);
                                        }
                                    };
                                from[attr] = [
                                    m.a,
                                    m.b,
                                    m.c,
                                    m.d,
                                    m.e,
                                    m.f
                                ];
                                extractTransform(to2, to[attr]);
                                to[attr] = to2._.transform;
                                diff[attr] = [
                                    (to2.matrix.a - m.a) / ms,
                                    (to2.matrix.b - m.b) / ms,
                                    (to2.matrix.c - m.c) / ms,
                                    (to2.matrix.d - m.d) / ms,
                                    (to2.matrix.e - m.e) / ms,
                                    (to2.matrix.f - m.f) / ms
                                ];
                                // from[attr] = [_.sx, _.sy, _.deg, _.dx, _.dy];
                                // var to2 = {_:{}, getBBox: function () { return element.getBBox(); }};
                                // extractTransform(to2, to[attr]);
                                // diff[attr] = [
                                //     (to2._.sx - _.sx) / ms,
                                //     (to2._.sy - _.sy) / ms,
                                //     (to2._.deg - _.deg) / ms,
                                //     (to2._.dx - _.dx) / ms,
                                //     (to2._.dy - _.dy) / ms
                                // ];
                            }
                            break;
                        case "csv":
                            var values = Str(params[attr])[split](separator),
                                from2 = Str(from[attr])[split](separator);
                            if (attr == "clip-rect") {
                                from[attr] = from2;
                                diff[attr] = [];
                                i = from2.length;
                                while (i--) {
                                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                }
                            }
                            to[attr] = values;
                            break;
                        default:
                            values = [][concat](params[attr]);
                            from2 = [][concat](from[attr]);
                            diff[attr] = [];
                            i = element.paper.customAttributes[attr].length;
                            while (i--) {
                                diff[attr][i] = ((values[i] || 0) - (from2[i] || 0)) / ms;
                            }
                            break;
                    }
                }
            }
            var easing = params.easing,
                easyeasy = R.easing_formulas[easing];
            if (!easyeasy) {
                easyeasy = Str(easing).match(bezierrg);
                if (easyeasy && easyeasy.length == 5) {
                    var curve = easyeasy;
                    easyeasy = function (t) {
                        return CubicBezierAtTime(t, +curve[1], +curve[2], +curve[3], +curve[4], ms);
                    };
                } else {
                    easyeasy = pipe;
                }
            }
            timestamp = params.start || anim.start || +new Date;
            e = {
                anim: anim,
                percent: percent,
                timestamp: timestamp,
                start: timestamp + (anim.del || 0),
                status: 0,
                initstatus: status || 0,
                stop: false,
                ms: ms,
                easing: easyeasy,
                from: from,
                diff: diff,
                to: to,
                el: element,
                callback: params.callback,
                prev: prev,
                next: next,
                repeat: times || anim.times,
                origin: element.attr(),
                totalOrigin: totalOrigin
            };
            animationElements.push(e);
            if (status && !isInAnim && !isInAnimSet) {
                e.stop = true;
                e.start = new Date - ms * status;
                if (animationElements.length == 1) {
                    return animation();
                }
            }
            if (isInAnimSet) {
                e.start = new Date - e.ms * status;
            }
            animationElements.length == 1 && requestAnimFrame(animation);
        } else {
            isInAnim.initstatus = status;
            isInAnim.start = new Date - isInAnim.ms * status;
        }
        eve("raphael.anim.start." + element.id, element, anim);
    }
    /*\
     * Raphael.animation
     [ method ]
     **
     * Creates an animation object that can be passed to the @Element.animate or @Element.animateWith methods.
     * See also @Animation.delay and @Animation.repeat methods.
     **
     > Parameters
     **
     - params (object) final attributes for the element, see also @Element.attr
     - ms (number) number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept one of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     **
     = (object) @Animation
    \*/
    R.animation = function (params, ms, easing, callback) {
        if (params instanceof Animation) {
            return params;
        }
        if (R.is(easing, "function") || !easing) {
            callback = callback || easing || null;
            easing = null;
        }
        params = Object(params);
        ms = +ms || 0;
        var p = {},
            json,
            attr;
        for (attr in params) if (params[has](attr) && toFloat(attr) != attr && toFloat(attr) + "%" != attr) {
            json = true;
            p[attr] = params[attr];
        }
        if (!json) {
            return new Animation(params, ms);
        } else {
            easing && (p.easing = easing);
            callback && (p.callback = callback);
            return new Animation({100: p}, ms);
        }
    };
    /*\
     * Element.animate
     [ method ]
     **
     * Creates and starts animation for given element.
     **
     > Parameters
     **
     - params (object) final attributes for the element, see also @Element.attr
     - ms (number) number of milliseconds for animation to run
     - easing (string) #optional easing type. Accept one of @Raphael.easing_formulas or CSS format: `cubic&#x2010;bezier(XX,&#160;XX,&#160;XX,&#160;XX)`
     - callback (function) #optional callback function. Will be called at the end of animation.
     * or
     - animation (object) animation object, see @Raphael.animation
     **
     = (object) original element
    \*/
    elproto.animate = function (params, ms, easing, callback) {
        var element = this;
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var anim = params instanceof Animation ? params : R.animation(params, ms, easing, callback);
        runAnimation(anim, element, anim.percents[0], null, element.attr());
        return element;
    };
    /*\
     * Element.setTime
     [ method ]
     **
     * Sets the status of animation of the element in milliseconds. Similar to @Element.status method.
     **
     > Parameters
     **
     - anim (object) animation object
     - value (number) number of milliseconds from the beginning of the animation
     **
     = (object) original element if `value` is specified
     * Note, that during animation following events are triggered:
     *
     * On each animation frame event `anim.frame.<id>`, on start `anim.start.<id>` and on end `anim.finish.<id>`.
    \*/
    elproto.setTime = function (anim, value) {
        if (anim && value != null) {
            this.status(anim, mmin(value, anim.ms) / anim.ms);
        }
        return this;
    };
    /*\
     * Element.status
     [ method ]
     **
     * Gets or sets the status of animation of the element.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     - value (number) #optional 0 – 1. If specified, method works like a setter and sets the status of a given animation to the value. This will cause animation to jump to the given position.
     **
     = (number) status
     * or
     = (array) status if `anim` is not specified. Array of objects in format:
     o {
     o     anim: (object) animation object
     o     status: (number) status
     o }
     * or
     = (object) original element if `value` is specified
    \*/
    elproto.status = function (anim, value) {
        var out = [],
            i = 0,
            len,
            e;
        if (value != null) {
            runAnimation(anim, this, -1, mmin(value, 1));
            return this;
        } else {
            len = animationElements.length;
            for (; i < len; i++) {
                e = animationElements[i];
                if (e.el.id == this.id && (!anim || e.anim == anim)) {
                    if (anim) {
                        return e.status;
                    }
                    out.push({
                        anim: e.anim,
                        status: e.status
                    });
                }
            }
            if (anim) {
                return 0;
            }
            return out;
        }
    };
    /*\
     * Element.pause
     [ method ]
     **
     * Stops animation of the element with ability to resume it later on.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.pause = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            if (eve("raphael.anim.pause." + this.id, this, animationElements[i].anim) !== false) {
                animationElements[i].paused = true;
            }
        }
        return this;
    };
    /*\
     * Element.resume
     [ method ]
     **
     * Resumes animation if it was paused with @Element.pause method.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.resume = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            var e = animationElements[i];
            if (eve("raphael.anim.resume." + this.id, this, e.anim) !== false) {
                delete e.paused;
                this.status(e.anim, e.status);
            }
        }
        return this;
    };
    /*\
     * Element.stop
     [ method ]
     **
     * Stops animation of the element.
     **
     > Parameters
     **
     - anim (object) #optional animation object
     **
     = (object) original element
    \*/
    elproto.stop = function (anim) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.id == this.id && (!anim || animationElements[i].anim == anim)) {
            if (eve("raphael.anim.stop." + this.id, this, animationElements[i].anim) !== false) {
                animationElements.splice(i--, 1);
            }
        }
        return this;
    };
    function stopAnimation(paper) {
        for (var i = 0; i < animationElements.length; i++) if (animationElements[i].el.paper == paper) {
            animationElements.splice(i--, 1);
        }
    }
    eve.on("raphael.remove", stopAnimation);
    eve.on("raphael.clear", stopAnimation);
    elproto.toString = function () {
        return "Rapha\xebl\u2019s object";
    };

    // Set
    var Set = function (items) {
        this.items = [];
        this.length = 0;
        this.type = "set";
        if (items) {
            for (var i = 0, ii = items.length; i < ii; i++) {
                if (items[i] && (items[i].constructor == elproto.constructor || items[i].constructor == Set)) {
                    this[this.items.length] = this.items[this.items.length] = items[i];
                    this.length++;
                }
            }
        }
    },
    setproto = Set.prototype;
    /*\
     * Set.push
     [ method ]
     **
     * Adds each argument to the current set.
     = (object) original element
    \*/
    setproto.push = function () {
        var item,
            len;
        for (var i = 0, ii = arguments.length; i < ii; i++) {
            item = arguments[i];
            if (item && (item.constructor == elproto.constructor || item.constructor == Set)) {
                len = this.items.length;
                this[len] = this.items[len] = item;
                this.length++;
            }
        }
        return this;
    };
    /*\
     * Set.pop
     [ method ]
     **
     * Removes last element and returns it.
     = (object) element
    \*/
    setproto.pop = function () {
        this.length && delete this[this.length--];
        return this.items.pop();
    };
    /*\
     * Set.forEach
     [ method ]
     **
     * Executes given function for each element in the set.
     *
     * If function returns `false` it will stop loop running.
     **
     > Parameters
     **
     - callback (function) function to run
     - thisArg (object) context object for the callback
     = (object) Set object
    \*/
    setproto.forEach = function (callback, thisArg) {
        for (var i = 0, ii = this.items.length; i < ii; i++) {
            if (callback.call(thisArg, this.items[i], i) === false) {
                return this;
            }
        }
        return this;
    };
    for (var method in elproto) if (elproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname][apply](el, arg);
                });
            };
        })(method);
    }
    setproto.attr = function (name, value) {
        if (name && R.is(name, array) && R.is(name[0], "object")) {
            for (var j = 0, jj = name.length; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items.length; i < ii; i++) {
                this.items[i].attr(name, value);
            }
        }
        return this;
    };
    /*\
     * Set.clear
     [ method ]
     **
     * Removeds all elements from the set
    \*/
    setproto.clear = function () {
        while (this.length) {
            this.pop();
        }
    };
    /*\
     * Set.splice
     [ method ]
     **
     * Removes given element from the set
     **
     > Parameters
     **
     - index (number) position of the deletion
     - count (number) number of element to remove
     - insertion… (object) #optional elements to insert
     = (object) set elements that were deleted
    \*/
    setproto.splice = function (index, count, insertion) {
        index = index < 0 ? mmax(this.length + index, 0) : index;
        count = mmax(0, mmin(this.length - index, count));
        var tail = [],
            todel = [],
            args = [],
            i;
        for (i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        for (i = 0; i < count; i++) {
            todel.push(this[index + i]);
        }
        for (; i < this.length - index; i++) {
            tail.push(this[index + i]);
        }
        var arglen = args.length;
        for (i = 0; i < arglen + tail.length; i++) {
            this.items[index + i] = this[index + i] = i < arglen ? args[i] : tail[i - arglen];
        }
        i = this.items.length = this.length -= count - arglen;
        while (this[i]) {
            delete this[i++];
        }
        return new Set(todel);
    };
    /*\
     * Set.exclude
     [ method ]
     **
     * Removes given element from the set
     **
     > Parameters
     **
     - element (object) element to remove
     = (boolean) `true` if object was found & removed from the set
    \*/
    setproto.exclude = function (el) {
        for (var i = 0, ii = this.length; i < ii; i++) if (this[i] == el) {
            this.splice(i, 1);
            return true;
        }
    };
    setproto.animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items.length,
            i = len,
            item,
            set = this,
            collector;
        if (!len) {
            return this;
        }
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        easing = R.is(easing, string) ? easing : collector;
        var anim = R.animation(params, ms, easing, collector);
        item = this.items[--i].animate(anim);
        while (i--) {
            this.items[i] && !this.items[i].removed && this.items[i].animateWith(item, anim, anim);
        }
        return this;
    };
    setproto.insertAfter = function (el) {
        var i = this.items.length;
        while (i--) {
            this.items[i].insertAfter(el);
        }
        return this;
    };
    setproto.getBBox = function () {
        var x = [],
            y = [],
            x2 = [],
            y2 = [];
        for (var i = this.items.length; i--;) if (!this.items[i].removed) {
            var box = this.items[i].getBBox();
            x.push(box.x);
            y.push(box.y);
            x2.push(box.x + box.width);
            y2.push(box.y + box.height);
        }
        x = mmin[apply](0, x);
        y = mmin[apply](0, y);
        x2 = mmax[apply](0, x2);
        y2 = mmax[apply](0, y2);
        return {
            x: x,
            y: y,
            x2: x2,
            y2: y2,
            width: x2 - x,
            height: y2 - y
        };
    };
    setproto.clone = function (s) {
        s = this.paper.set();
        for (var i = 0, ii = this.items.length; i < ii; i++) {
            s.push(this.items[i].clone());
        }
        return s;
    };
    setproto.toString = function () {
        return "Rapha\xebl\u2018s set";
    };

    setproto.glow = function(glowConfig) {
        var ret = this.paper.set();
        this.forEach(function(shape, index){
            var g = shape.glow(glowConfig);
            if(g != null){
                g.forEach(function(shape2, index2){
                    ret.push(shape2);
                });
            }
        });
        return ret;
    };

    /*\
     * Raphael.registerFont
     [ method ]
     **
     * Adds given font to the registered set of fonts for Raphaël. Should be used as an internal call from within Cufón’s font file.
     * Returns original parameter, so it could be used with chaining.
     # <a href="http://wiki.github.com/sorccu/cufon/about">More about Cufón and how to convert your font form TTF, OTF, etc to JavaScript file.</a>
     **
     > Parameters
     **
     - font (object) the font to register
     = (object) the font you passed in
     > Usage
     | Cufon.registerFont(Raphael.registerFont({…}));
    \*/
    R.registerFont = function (font) {
        if (!font.face) {
            return font;
        }
        this.fonts = this.fonts || {};
        var fontcopy = {
                w: font.w,
                face: {},
                glyphs: {}
            },
            family = font.face["font-family"];
        for (var prop in font.face) if (font.face[has](prop)) {
            fontcopy.face[prop] = font.face[prop];
        }
        if (this.fonts[family]) {
            this.fonts[family].push(fontcopy);
        } else {
            this.fonts[family] = [fontcopy];
        }
        if (!font.svg) {
            fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
            for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w: path.w,
                    k: {},
                    d: path.d && "M" + path.d.replace(/[mlcxtrv]/g, function (command) {
                            return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                        }) + "z"
                };
                if (path.k) {
                    for (var k in path.k) if (path[has](k)) {
                        fontcopy.glyphs[glyph].k[k] = path.k[k];
                    }
                }
            }
        }
        return font;
    };
    /*\
     * Paper.getFont
     [ method ]
     **
     * Finds font object in the registered fonts by given parameters. You could specify only one word from the font name, like “Myriad” for “Myriad Pro”.
     **
     > Parameters
     **
     - family (string) font family name or any word from it
     - weight (string) #optional font weight
     - style (string) #optional font style
     - stretch (string) #optional font stretch
     = (object) the font object
     > Usage
     | paper.print(100, 100, "Test string", paper.getFont("Times", 800), 30);
    \*/
    paperproto.getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        if (!R.fonts) {
            return;
        }
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family.replace(/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
            for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font.length; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    /*\
     * Paper.print
     [ method ]
     **
     * Creates path that represent given text written using given font at given position with given size.
     * Result of the method is path element that contains whole text as a separate path.
     **
     > Parameters
     **
     - x (number) x position of the text
     - y (number) y position of the text
     - string (string) text to print
     - font (object) font object, see @Paper.getFont
     - size (number) #optional size of the font, default is `16`
     - origin (string) #optional could be `"baseline"` or `"middle"`, default is `"middle"`
     - letter_spacing (number) #optional number in range `-1..1`, default is `0`
     = (object) resulting path element, which consist of all letters
     > Usage
     | var txt = r.print(10, 50, "print", r.getFont("Museo"), 30).attr({fill: "#fff"});
    \*/
    paperproto.print = function (x, y, string, font, size, origin, letter_spacing) {
        origin = origin || "middle"; // baseline|middle
        letter_spacing = mmax(mmin(letter_spacing || 0, 1), -1);
        var letters = Str(string)[split](E),
            shift = 0,
            notfirst = 0,
            path = E,
            scale;
        R.is(font, "string") && (font = this.getFont(font));
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            var bb = font.face.bbox[split](separator),
                top = +bb[0],
                lineHeight = bb[3] - bb[1],
                shifty = 0,
                height = +bb[1] + (origin == "baseline" ? lineHeight + (+font.face.descent) : lineHeight / 2);
            for (var i = 0, ii = letters.length; i < ii; i++) {
                if (letters[i] == "\n") {
                    shift = 0;
                    curr = 0;
                    notfirst = 0;
                    shifty += lineHeight;
                } else {
                    var prev = notfirst && font.glyphs[letters[i - 1]] || {},
                        curr = font.glyphs[letters[i]];
                    shift += notfirst ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * letter_spacing) : 0;
                    notfirst = 1;
                }
                if (curr && curr.d) {
                    path += R.transformPath(curr.d, ["t", shift * scale, shifty * scale, "s", scale, scale, top, height, "t", (x - top) / scale, (y - height) / scale]);
                }
            }
        }
        return this.path(path).attr({
            fill: "#000",
            stroke: "none"
        });
    };

    /*\
     * Paper.add
     [ method ]
     **
     * Imports elements in JSON array in format `{type: type, <attributes>}`
     **
     > Parameters
     **
     - json (array)
     = (object) resulting set of imported elements
     > Usage
     | paper.add([
     |     {
     |         type: "circle",
     |         cx: 10,
     |         cy: 10,
     |         r: 5
     |     },
     |     {
     |         type: "rect",
     |         x: 10,
     |         y: 10,
     |         width: 10,
     |         height: 10,
     |         fill: "#fc0"
     |     }
     | ]);
    \*/
    paperproto.add = function (json) {
        if (R.is(json, "array")) {
            var res = this.set(),
                i = 0,
                ii = json.length,
                j;
            for (; i < ii; i++) {
                j = json[i] || {};
                elements[has](j.type) && res.push(this[j.type]().attr(j));
            }
        }
        return res;
    };

    /*\
     * Raphael.format
     [ method ]
     **
     * Simple format function. Replaces construction of type “`{<number>}`” to the corresponding argument.
     **
     > Parameters
     **
     - token (string) string to format
     - … (string) rest of arguments will be treated as parameters for replacement
     = (string) formated string
     > Usage
     | var x = 10,
     |     y = 20,
     |     width = 40,
     |     height = 50;
     | // this will draw a rectangular shape equivalent to "M10,20h40v50h-40z"
     | paper.path(Raphael.format("M{0},{1}h{2}v{3}h{4}z", x, y, width, height, -width));
    \*/
    R.format = function (token, params) {
        var args = R.is(params, array) ? [0][concat](params) : arguments;
        token && R.is(token, string) && args.length - 1 && (token = token.replace(formatrg, function (str, i) {
            return args[++i] == null ? E : args[i];
        }));
        return token || E;
    };
    /*\
     * Raphael.fullfill
     [ method ]
     **
     * A little bit more advanced format function than @Raphael.format. Replaces construction of type “`{<name>}`” to the corresponding argument.
     **
     > Parameters
     **
     - token (string) string to format
     - json (object) object which properties will be used as a replacement
     = (string) formated string
     > Usage
     | // this will draw a rectangular shape equivalent to "M10,20h40v50h-40z"
     | paper.path(Raphael.fullfill("M{x},{y}h{dim.width}v{dim.height}h{dim['negative width']}z", {
     |     x: 10,
     |     y: 20,
     |     dim: {
     |         width: 40,
     |         height: 50,
     |         "negative width": -40
     |     }
     | }));
    \*/
    R.fullfill = (function () {
        var tokenRegex = /\{([^\}]+)\}/g,
            objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, // matches .xxxxx or ["xxxxx"] to run over object properties
            replacer = function (all, key, obj) {
                var res = obj;
                key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
                    name = name || quotedName;
                    if (res) {
                        if (name in res) {
                            res = res[name];
                        }
                        typeof res == "function" && isFunc && (res = res());
                    }
                });
                res = (res == null || res == obj ? all : res) + "";
                return res;
            };
        return function (str, obj) {
            return String(str).replace(tokenRegex, function (all, key) {
                return replacer(all, key, obj);
            });
        };
    })();
    /*\
     * Raphael.ninja
     [ method ]
     **
     * If you want to leave no trace of Raphaël (Well, Raphaël creates only one global variable `Raphael`, but anyway.) You can use `ninja` method.
     * Beware, that in this case plugins could stop working, because they are depending on global variable existance.
     **
     = (object) Raphael object
     > Usage
     | (function (local_raphael) {
     |     var paper = local_raphael(10, 10, 320, 200);
     |     …
     | })(Raphael.ninja());
    \*/
    R.ninja = function () {
        oldRaphael.was ? (g.win.Raphael = oldRaphael.is) : delete Raphael;
        return R;
    };
    /*\
     * Raphael.st
     [ property (object) ]
     **
     * You can add your own method to elements and sets. It is wise to add a set method for each element method
     * you added, so you will be able to call the same method on sets too.
     **
     * See also @Raphael.el.
     > Usage
     | Raphael.el.red = function () {
     |     this.attr({fill: "#f00"});
     | };
     | Raphael.st.red = function () {
     |     this.forEach(function (el) {
     |         el.red();
     |     });
     | };
     | // then use it
     | paper.set(paper.circle(100, 100, 20), paper.circle(110, 100, 20)).red();
    \*/
    R.st = setproto;
    // Firefox <3.6 fix: http://webreflection.blogspot.com/2009/11/195-chars-to-help-lazy-loading.html
    (function (doc, loaded, f) {
        if (doc.readyState == null && doc.addEventListener){
            doc.addEventListener(loaded, f = function () {
                doc.removeEventListener(loaded, f, false);
                doc.readyState = "complete";
            }, false);
            doc.readyState = "loading";
        }
        function isLoaded() {
            (/in/).test(doc.readyState) ? setTimeout(isLoaded, 9) : R.eve("raphael.DOMload");
        }
        isLoaded();
    })(document, "DOMContentLoaded");

    oldRaphael.was ? (g.win.Raphael = R) : (Raphael = R);
    
    eve.on("raphael.DOMload", function () {
        loaded = true;
    });

    require('./raphael.svg');
    require('./raphael.vml');

    module.exports = Raphael;
})();

},{"./raphael.svg":5,"./raphael.vml":6,"eve":3}],5:[function(require,module,exports){
// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël - JavaScript Vector Library                                 │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ SVG Module                                                          │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\
window.Raphael && window.Raphael.svg && function (R) {
    var has = "hasOwnProperty",
        Str = String,
        toFloat = parseFloat,
        toInt = parseInt,
        math = Math,
        mmax = math.max,
        abs = math.abs,
        pow = math.pow,
        separator = /[, ]+/,
        eve = R.eve,
        E = "",
        S = " ";
    var xlink = "http://www.w3.org/1999/xlink",
        markers = {
            block: "M5,0 0,2.5 5,5z",
            classic: "M5,0 0,2.5 5,5 3.5,3 3.5,2z",
            diamond: "M2.5,0 5,2.5 2.5,5 0,2.5z",
            open: "M6,1 1,3.5 6,6",
            oval: "M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z"
        },
        markerCounter = {};
    R.toString = function () {
        return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
    };
    var $ = function (el, attr) {
        if (attr) {
            if (typeof el == "string") {
                el = $(el);
            }
            for (var key in attr) if (attr[has](key)) {
                if (key.substring(0, 6) == "xlink:") {
                    el.setAttributeNS(xlink, key.substring(6), Str(attr[key]));
                } else {
                    el.setAttribute(key, Str(attr[key]));
                }
            }
        } else {
            el = R._g.doc.createElementNS("http://www.w3.org/2000/svg", el);
            el.style && (el.style.webkitTapHighlightColor = "rgba(0,0,0,0)");
        }
        return el;
    },
    addGradientFill = function (element, gradient) {
        var type = "linear",
            id = element.id + gradient,
            fx = .5, fy = .5,
            o = element.node,
            SVG = element.paper,
            s = o.style,
            el = R._g.doc.getElementById(id);
        if (!el) {
            gradient = Str(gradient).replace(R._radial_gradient, function (all, _fx, _fy) {
                type = "radial";
                if (_fx && _fy) {
                    fx = toFloat(_fx);
                    fy = toFloat(_fy);
                    var dir = ((fy > .5) * 2 - 1);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 &&
                        (fy = math.sqrt(.25 - pow(fx - .5, 2)) * dir + .5) &&
                        fy != .5 &&
                        (fy = fy.toFixed(5) - 1e-5 * dir);
                }
                return E;
            });
            gradient = gradient.split(/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
                var vector = [0, 0, math.cos(R.rad(angle)), math.sin(R.rad(angle))],
                    max = 1 / (mmax(abs(vector[2]), abs(vector[3])) || 1);
                vector[2] *= max;
                vector[3] *= max;
                if (vector[2] < 0) {
                    vector[0] = -vector[2];
                    vector[2] = 0;
                }
                if (vector[3] < 0) {
                    vector[1] = -vector[3];
                    vector[3] = 0;
                }
            }
            var dots = R._parseDots(gradient);
            if (!dots) {
                return null;
            }
            id = id.replace(/[\(\)\s,\xb0#]/g, "_");
            
            if (element.gradient && id != element.gradient.id) {
                SVG.defs.removeChild(element.gradient);
                delete element.gradient;
            }

            if (!element.gradient) {
                el = $(type + "Gradient", {id: id});
                element.gradient = el;
                $(el, type == "radial" ? {
                    fx: fx,
                    fy: fy
                } : {
                    x1: vector[0],
                    y1: vector[1],
                    x2: vector[2],
                    y2: vector[3],
                    gradientTransform: element.matrix.invert()
                });
                SVG.defs.appendChild(el);
                for (var i = 0, ii = dots.length; i < ii; i++) {
                    el.appendChild($("stop", {
                        offset: dots[i].offset ? dots[i].offset : i ? "100%" : "0%",
                        "stop-color": dots[i].color || "#fff"
                    }));
                }
            }
        }
        $(o, {
            fill: "url(#" + id + ")",
            opacity: 1,
            "fill-opacity": 1
        });
        s.fill = E;
        s.opacity = 1;
        s.fillOpacity = 1;
        return 1;
    },
    updatePosition = function (o) {
        var bbox = o.getBBox(1);
        $(o.pattern, {patternTransform: o.matrix.invert() + " translate(" + bbox.x + "," + bbox.y + ")"});
    },
    addArrow = function (o, value, isEnd) {
        if (o.type == "path") {
            var values = Str(value).toLowerCase().split("-"),
                p = o.paper,
                se = isEnd ? "end" : "start",
                node = o.node,
                attrs = o.attrs,
                stroke = attrs["stroke-width"],
                i = values.length,
                type = "classic",
                from,
                to,
                dx,
                refX,
                attr,
                w = 3,
                h = 3,
                t = 5;
            while (i--) {
                switch (values[i]) {
                    case "block":
                    case "classic":
                    case "oval":
                    case "diamond":
                    case "open":
                    case "none":
                        type = values[i];
                        break;
                    case "wide": h = 5; break;
                    case "narrow": h = 2; break;
                    case "long": w = 5; break;
                    case "short": w = 2; break;
                }
            }
            if (type == "open") {
                w += 2;
                h += 2;
                t += 2;
                dx = 1;
                refX = isEnd ? 4 : 1;
                attr = {
                    fill: "none",
                    stroke: attrs.stroke
                };
            } else {
                refX = dx = w / 2;
                attr = {
                    fill: attrs.stroke,
                    stroke: "none"
                };
            }
            if (o._.arrows) {
                if (isEnd) {
                    o._.arrows.endPath && markerCounter[o._.arrows.endPath]--;
                    o._.arrows.endMarker && markerCounter[o._.arrows.endMarker]--;
                } else {
                    o._.arrows.startPath && markerCounter[o._.arrows.startPath]--;
                    o._.arrows.startMarker && markerCounter[o._.arrows.startMarker]--;
                }
            } else {
                o._.arrows = {};
            }
            if (type != "none") {
                var pathId = "raphael-marker-" + type,
                    markerId = "raphael-marker-" + se + type + w + h;
                if (!R._g.doc.getElementById(pathId)) {
                    p.defs.appendChild($($("path"), {
                        "stroke-linecap": "round",
                        d: markers[type],
                        id: pathId
                    }));
                    markerCounter[pathId] = 1;
                } else {
                    markerCounter[pathId]++;
                }
                var marker = R._g.doc.getElementById(markerId),
                    use;
                if (!marker) {
                    marker = $($("marker"), {
                        id: markerId,
                        markerHeight: h,
                        markerWidth: w,
                        orient: "auto",
                        refX: refX,
                        refY: h / 2
                    });
                    use = $($("use"), {
                        "xlink:href": "#" + pathId,
                        transform: (isEnd ? "rotate(180 " + w / 2 + " " + h / 2 + ") " : E) + "scale(" + w / t + "," + h / t + ")",
                        "stroke-width": (1 / ((w / t + h / t) / 2)).toFixed(4)
                    });
                    marker.appendChild(use);
                    p.defs.appendChild(marker);
                    markerCounter[markerId] = 1;
                } else {
                    markerCounter[markerId]++;
                    use = marker.getElementsByTagName("use")[0];
                }
                $(use, attr);
                var delta = dx * (type != "diamond" && type != "oval");
                if (isEnd) {
                    from = o._.arrows.startdx * stroke || 0;
                    to = R.getTotalLength(attrs.path) - delta * stroke;
                } else {
                    from = delta * stroke;
                    to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                }
                attr = {};
                attr["marker-" + se] = "url(#" + markerId + ")";
                if (to || from) {
                    attr.d = Raphael.getSubpath(attrs.path, from, to);
                }
                $(node, attr);
                o._.arrows[se + "Path"] = pathId;
                o._.arrows[se + "Marker"] = markerId;
                o._.arrows[se + "dx"] = delta;
                o._.arrows[se + "Type"] = type;
                o._.arrows[se + "String"] = value;
            } else {
                if (isEnd) {
                    from = o._.arrows.startdx * stroke || 0;
                    to = R.getTotalLength(attrs.path) - from;
                } else {
                    from = 0;
                    to = R.getTotalLength(attrs.path) - (o._.arrows.enddx * stroke || 0);
                }
                o._.arrows[se + "Path"] && $(node, {d: Raphael.getSubpath(attrs.path, from, to)});
                delete o._.arrows[se + "Path"];
                delete o._.arrows[se + "Marker"];
                delete o._.arrows[se + "dx"];
                delete o._.arrows[se + "Type"];
                delete o._.arrows[se + "String"];
            }
            for (attr in markerCounter) if (markerCounter[has](attr) && !markerCounter[attr]) {
                var item = R._g.doc.getElementById(attr);
                item && item.parentNode.removeChild(item);
            }
        }
    },
    dasharray = {
        "": [0],
        "none": [0],
        "-": [3, 1],
        ".": [1, 1],
        "-.": [3, 1, 1, 1],
        "-..": [3, 1, 1, 1, 1, 1],
        ". ": [1, 3],
        "- ": [4, 3],
        "--": [8, 3],
        "- .": [4, 3, 1, 3],
        "--.": [8, 3, 1, 3],
        "--..": [8, 3, 1, 3, 1, 3]
    },
    addDashes = function (o, value, params) {
        value = dasharray[Str(value).toLowerCase()];
        if (value) {
            var width = o.attrs["stroke-width"] || "1",
                butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                dashes = [],
                i = value.length;
            while (i--) {
                dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
            }
            $(o.node, {"stroke-dasharray": dashes.join(",")});
        }
    },
    setFillAndStroke = function (o, params) {
        var node = o.node,
            attrs = o.attrs,
            vis = node.style.visibility;
        node.style.visibility = "hidden";
        for (var att in params) {
            if (params[has](att)) {
                if (!R._availableAttrs[has](att)) {
                    continue;
                }
                var value = params[att];
                attrs[att] = value;
                switch (att) {
                    case "blur":
                        o.blur(value);
                        break;
                    case "href":
                    case "title":
                    case "target":
                        var pn = node.parentNode;
                        if (pn.tagName.toLowerCase() != "a") {
                            var hl = $("a");
                            pn.insertBefore(hl, node);
                            hl.appendChild(node);
                            pn = hl;
                        }
                        if (att == "target") {
                            pn.setAttributeNS(xlink, "show", value == "blank" ? "new" : value);
                        } else {
                            pn.setAttributeNS(xlink, att, value);
                        }
                        break;
                    case "cursor":
                        node.style.cursor = value;
                        break;
                    case "transform":
                        o.transform(value);
                        break;
                    case "arrow-start":
                        addArrow(o, value);
                        break;
                    case "arrow-end":
                        addArrow(o, value, 1);
                        break;
                    case "clip-rect":
                        var rect = Str(value).split(separator);
                        if (rect.length == 4) {
                            o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                            var el = $("clipPath"),
                                rc = $("rect");
                            el.id = R.createUUID();
                            $(rc, {
                                x: rect[0],
                                y: rect[1],
                                width: rect[2],
                                height: rect[3]
                            });
                            el.appendChild(rc);
                            o.paper.defs.appendChild(el);
                            $(node, {"clip-path": "url(#" + el.id + ")"});
                            o.clip = rc;
                        }
                        if (!value) {
                            var path = node.getAttribute("clip-path");
                            if (path) {
                                var clip = R._g.doc.getElementById(path.replace(/(^url\(#|\)$)/g, E));
                                clip && clip.parentNode.removeChild(clip);
                                $(node, {"clip-path": E});
                                delete o.clip;
                            }
                        }
                    break;
                    case "path":
                        if (o.type == "path") {
                            $(node, {d: value ? attrs.path = R._pathToAbsolute(value) : "M0,0"});
                            o._.dirty = 1;
                            if (o._.arrows) {
                                "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                                "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                            }
                        }
                        break;
                    case "width":
                        node.setAttribute(att, value);
                        o._.dirty = 1;
                        if (attrs.fx) {
                            att = "x";
                            value = attrs.x;
                        } else {
                            break;
                        }
                    case "x":
                        if (attrs.fx) {
                            value = -attrs.x - (attrs.width || 0);
                        }
                    case "rx":
                        if (att == "rx" && o.type == "rect") {
                            break;
                        }
                    case "cx":
                        node.setAttribute(att, value);
                        o.pattern && updatePosition(o);
                        o._.dirty = 1;
                        break;
                    case "height":
                        node.setAttribute(att, value);
                        o._.dirty = 1;
                        if (attrs.fy) {
                            att = "y";
                            value = attrs.y;
                        } else {
                            break;
                        }
                    case "y":
                        if (attrs.fy) {
                            value = -attrs.y - (attrs.height || 0);
                        }
                    case "ry":
                        if (att == "ry" && o.type == "rect") {
                            break;
                        }
                    case "cy":
                        node.setAttribute(att, value);
                        o.pattern && updatePosition(o);
                        o._.dirty = 1;
                        break;
                    case "r":
                        if (o.type == "rect") {
                            $(node, {rx: value, ry: value});
                        } else {
                            node.setAttribute(att, value);
                        }
                        o._.dirty = 1;
                        break;
                    case "src":
                        if (o.type == "image") {
                            node.setAttributeNS(xlink, "href", value);
                        }
                        break;
                    case "stroke-width":
                        if (o._.sx != 1 || o._.sy != 1) {
                            value /= mmax(abs(o._.sx), abs(o._.sy)) || 1;
                        }
                        if (o.paper._vbSize) {
                            value *= o.paper._vbSize;
                        }
                        node.setAttribute(att, value);
                        if (attrs["stroke-dasharray"]) {
                            addDashes(o, attrs["stroke-dasharray"], params);
                        }
                        if (o._.arrows) {
                            "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                            "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                        }
                        break;
                    case "stroke-dasharray":
                        addDashes(o, value, params);
                        break;
                    case "fill":
                        var isURL = Str(value).match(R._ISURL);
                        if (isURL) {
                            el = $("pattern");
                            var ig = $("image");
                            el.id = R.createUUID();
                            $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse", height: 1, width: 1});
                            $(ig, {x: 0, y: 0, "xlink:href": isURL[1]});
                            el.appendChild(ig);

                            (function (el) {
                                R._preload(isURL[1], function () {
                                    var w = this.offsetWidth,
                                        h = this.offsetHeight;
                                    $(el, {width: w, height: h});
                                    $(ig, {width: w, height: h});
                                    o.paper.safari();
                                });
                            })(el);
                            o.paper.defs.appendChild(el);
                            $(node, {fill: "url(#" + el.id + ")"});
                            o.pattern = el;
                            o.pattern && updatePosition(o);
                            break;
                        }
                        var clr = R.getRGB(value);
                        if (!clr.error) {
                            delete params.gradient;
                            delete attrs.gradient;
                            !R.is(attrs.opacity, "undefined") &&
                                R.is(params.opacity, "undefined") &&
                                $(node, {opacity: attrs.opacity});
                            !R.is(attrs["fill-opacity"], "undefined") &&
                                R.is(params["fill-opacity"], "undefined") &&
                                $(node, {"fill-opacity": attrs["fill-opacity"]});
                        } else if ((o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value)) {
                            if ("opacity" in attrs || "fill-opacity" in attrs) {
                                var gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                                if (gradient) {
                                    var stops = gradient.getElementsByTagName("stop");
                                    $(stops[stops.length - 1], {"stop-opacity": ("opacity" in attrs ? attrs.opacity : 1) * ("fill-opacity" in attrs ? attrs["fill-opacity"] : 1)});
                                }
                            }
                            attrs.gradient = value;
                            attrs.fill = "none";
                            break;
                        }
                        clr[has]("opacity") && $(node, {"fill-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                    case "stroke":
                        clr = R.getRGB(value);
                        node.setAttribute(att, clr.hex);
                        att == "stroke" && clr[has]("opacity") && $(node, {"stroke-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                        if (att == "stroke" && o._.arrows) {
                            "startString" in o._.arrows && addArrow(o, o._.arrows.startString);
                            "endString" in o._.arrows && addArrow(o, o._.arrows.endString, 1);
                        }
                        break;
                    case "gradient":
                        (o.type == "circle" || o.type == "ellipse" || Str(value).charAt() != "r") && addGradientFill(o, value);
                        break;
                    case "opacity":
                        if (attrs.gradient && !attrs[has]("stroke-opacity")) {
                            $(node, {"stroke-opacity": value > 1 ? value / 100 : value});
                        }
                        // fall
                    case "fill-opacity":
                        if (attrs.gradient) {
                            gradient = R._g.doc.getElementById(node.getAttribute("fill").replace(/^url\(#|\)$/g, E));
                            if (gradient) {
                                stops = gradient.getElementsByTagName("stop");
                                $(stops[stops.length - 1], {"stop-opacity": value});
                            }
                            break;
                        }
                    default:
                        att == "font-size" && (value = toInt(value, 10) + "px");
                        var cssrule = att.replace(/(\-.)/g, function (w) {
                            return w.substring(1).toUpperCase();
                        });
                        node.style[cssrule] = value;
                        o._.dirty = 1;
                        node.setAttribute(att, value);
                        break;
                }
            }
        }

        tuneText(o, params);
        node.style.visibility = vis;
    },
    leading = 1.2,
    tuneText = function (el, params) {
        if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
            return;
        }
        var a = el.attrs,
            node = el.node,
            fontSize = node.firstChild ? toInt(R._g.doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;

        if (params[has]("text")) {
            a.text = params.text;
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            var texts = Str(params.text).split("\n"),
                tspans = [],
                tspan;
            for (var i = 0, ii = texts.length; i < ii; i++) {
                tspan = $("tspan");
                i && $(tspan, {dy: fontSize * leading, x: a.x});
                tspan.appendChild(R._g.doc.createTextNode(texts[i]));
                node.appendChild(tspan);
                tspans[i] = tspan;
            }
        } else {
            tspans = node.getElementsByTagName("tspan");
            for (i = 0, ii = tspans.length; i < ii; i++) if (i) {
                $(tspans[i], {dy: fontSize * leading, x: a.x});
            } else {
                $(tspans[0], {dy: 0});
            }
        }
        $(node, {x: a.x, y: a.y});
        el._.dirty = 1;
        var bb = el._getBBox(),
            dif = a.y - (bb.y + bb.height / 2);
        dif && R.is(dif, "finite") && $(tspans[0], {dy: dif});
    },
    Element = function (node, svg) {
        var X = 0,
            Y = 0;
        /*\
         * Element.node
         [ property (object) ]
         **
         * Gives you a reference to the DOM object, so you can assign event handlers or just mess around.
         **
         * Note: Don’t mess with it.
         > Usage
         | // draw a circle at coordinate 10,10 with radius of 10
         | var c = paper.circle(10, 10, 10);
         | c.node.onclick = function () {
         |     c.attr("fill", "red");
         | };
        \*/
        this[0] = this.node = node;
        /*\
         * Element.raphael
         [ property (object) ]
         **
         * Internal reference to @Raphael object. In case it is not available.
         > Usage
         | Raphael.el.red = function () {
         |     var hsb = this.paper.raphael.rgb2hsb(this.attr("fill"));
         |     hsb.h = 1;
         |     this.attr({fill: this.paper.raphael.hsb2rgb(hsb).hex});
         | }
        \*/
        node.raphael = true;
        /*\
         * Element.id
         [ property (number) ]
         **
         * Unique id of the element. Especially usesful when you want to listen to events of the element, 
         * because all events are fired in format `<module>.<action>.<id>`. Also useful for @Paper.getById method.
        \*/
        this.id = R._oid++;
        node.raphaelid = this.id;
        this.matrix = R.matrix();
        this.realPath = null;
        /*\
         * Element.paper
         [ property (object) ]
         **
         * Internal reference to “paper” where object drawn. Mainly for use in plugins and element extensions.
         > Usage
         | Raphael.el.cross = function () {
         |     this.attr({fill: "red"});
         |     this.paper.path("M10,10L50,50M50,10L10,50")
         |         .attr({stroke: "red"});
         | }
        \*/
        this.paper = svg;
        this.attrs = this.attrs || {};
        this._ = {
            transform: [],
            sx: 1,
            sy: 1,
            deg: 0,
            dx: 0,
            dy: 0,
            dirty: 1
        };
        !svg.bottom && (svg.bottom = this);
        /*\
         * Element.prev
         [ property (object) ]
         **
         * Reference to the previous element in the hierarchy.
        \*/
        this.prev = svg.top;
        svg.top && (svg.top.next = this);
        svg.top = this;
        /*\
         * Element.next
         [ property (object) ]
         **
         * Reference to the next element in the hierarchy.
        \*/
        this.next = null;
    },
    elproto = R.el;

    Element.prototype = elproto;
    elproto.constructor = Element;

    R._engine.path = function (pathString, SVG) {
        var el = $("path");
        SVG.canvas && SVG.canvas.appendChild(el);
        var p = new Element(el, SVG);
        p.type = "path";
        setFillAndStroke(p, {
            fill: "none",
            stroke: "#000",
            path: pathString
        });
        return p;
    };
    /*\
     * Element.rotate
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds rotation by given angle around given point to the list of
     * transformations of the element.
     > Parameters
     - deg (number) angle in degrees
     - cx (number) #optional x coordinate of the centre of rotation
     - cy (number) #optional y coordinate of the centre of rotation
     * If cx & cy aren’t specified centre of the shape is used as a point of rotation.
     = (object) @Element
    \*/
    elproto.rotate = function (deg, cx, cy) {
        if (this.removed) {
            return this;
        }
        deg = Str(deg).split(separator);
        if (deg.length - 1) {
            cx = toFloat(deg[1]);
            cy = toFloat(deg[2]);
        }
        deg = toFloat(deg[0]);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
            cx = bbox.x + bbox.width / 2;
            cy = bbox.y + bbox.height / 2;
        }
        this.transform(this._.transform.concat([["r", deg, cx, cy]]));
        return this;
    };
    /*\
     * Element.scale
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds scale by given amount relative to given point to the list of
     * transformations of the element.
     > Parameters
     - sx (number) horisontal scale amount
     - sy (number) vertical scale amount
     - cx (number) #optional x coordinate of the centre of scale
     - cy (number) #optional y coordinate of the centre of scale
     * If cx & cy aren’t specified centre of the shape is used instead.
     = (object) @Element
    \*/
    elproto.scale = function (sx, sy, cx, cy) {
        if (this.removed) {
            return this;
        }
        sx = Str(sx).split(separator);
        if (sx.length - 1) {
            sy = toFloat(sx[1]);
            cx = toFloat(sx[2]);
            cy = toFloat(sx[3]);
        }
        sx = toFloat(sx[0]);
        (sy == null) && (sy = sx);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
        }
        cx = cx == null ? bbox.x + bbox.width / 2 : cx;
        cy = cy == null ? bbox.y + bbox.height / 2 : cy;
        this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
        return this;
    };
    /*\
     * Element.translate
     [ method ]
     **
     * Deprecated! Use @Element.transform instead.
     * Adds translation by given amount to the list of transformations of the element.
     > Parameters
     - dx (number) horisontal shift
     - dy (number) vertical shift
     = (object) @Element
    \*/
    elproto.translate = function (dx, dy) {
        if (this.removed) {
            return this;
        }
        dx = Str(dx).split(separator);
        if (dx.length - 1) {
            dy = toFloat(dx[1]);
        }
        dx = toFloat(dx[0]) || 0;
        dy = +dy || 0;
        this.transform(this._.transform.concat([["t", dx, dy]]));
        return this;
    };
    /*\
     * Element.transform
     [ method ]
     **
     * Adds transformation to the element which is separate to other attributes,
     * i.e. translation doesn’t change `x` or `y` of the rectange. The format
     * of transformation string is similar to the path string syntax:
     | "t100,100r30,100,100s2,2,100,100r45s1.5"
     * Each letter is a command. There are four commands: `t` is for translate, `r` is for rotate, `s` is for
     * scale and `m` is for matrix.
     *
     * There are also alternative “absolute” translation, rotation and scale: `T`, `R` and `S`. They will not take previous transformation into account. For example, `...T100,0` will always move element 100 px horisontally, while `...t100,0` could move it vertically if there is `r90` before. Just compare results of `r90t100,0` and `r90T100,0`.
     *
     * So, the example line above could be read like “translate by 100, 100; rotate 30° around 100, 100; scale twice around 100, 100;
     * rotate 45° around centre; scale 1.5 times relative to centre”. As you can see rotate and scale commands have origin
     * coordinates as optional parameters, the default is the centre point of the element.
     * Matrix accepts six parameters.
     > Usage
     | var el = paper.rect(10, 20, 300, 200);
     | // translate 100, 100, rotate 45°, translate -100, 0
     | el.transform("t100,100r45t-100,0");
     | // if you want you can append or prepend transformations
     | el.transform("...t50,50");
     | el.transform("s2...");
     | // or even wrap
     | el.transform("t50,50...t-50-50");
     | // to reset transformation call method with empty string
     | el.transform("");
     | // to get current value call it without parameters
     | console.log(el.transform());
     > Parameters
     - tstr (string) #optional transformation string
     * If tstr isn’t specified
     = (string) current transformation string
     * else
     = (object) @Element
    \*/
    elproto.transform = function (tstr) {
        var _ = this._;
        if (tstr == null) {
            return _.transform;
        }
        R._extractTransform(this, tstr);

        this.clip && $(this.clip, {transform: this.matrix.invert()});
        this.pattern && updatePosition(this);
        this.node && $(this.node, {transform: this.matrix});
    
        if (_.sx != 1 || _.sy != 1) {
            var sw = this.attrs[has]("stroke-width") ? this.attrs["stroke-width"] : 1;
            this.attr({"stroke-width": sw});
        }

        return this;
    };
    /*\
     * Element.hide
     [ method ]
     **
     * Makes element invisible. See @Element.show.
     = (object) @Element
    \*/
    elproto.hide = function () {
        !this.removed && this.paper.safari(this.node.style.display = "none");
        return this;
    };
    /*\
     * Element.show
     [ method ]
     **
     * Makes element visible. See @Element.hide.
     = (object) @Element
    \*/
    elproto.show = function () {
        !this.removed && this.paper.safari(this.node.style.display = "");
        return this;
    };
    /*\
     * Element.remove
     [ method ]
     **
     * Removes element from the paper.
    \*/
    elproto.remove = function () {
        if (this.removed || !this.node.parentNode) {
            return;
        }
        var paper = this.paper;
        paper.__set__ && paper.__set__.exclude(this);
        eve.unbind("raphael.*.*." + this.id);
        if (this.gradient) {
            paper.defs.removeChild(this.gradient);
        }
        R._tear(this, paper);
        if (this.node.parentNode.tagName.toLowerCase() == "a") {
            this.node.parentNode.parentNode.removeChild(this.node.parentNode);
        } else {
            this.node.parentNode.removeChild(this.node);
        }
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
        this.removed = true;
    };
    elproto._getBBox = function () {
        if (this.node.style.display == "none") {
            this.show();
            var hide = true;
        }
        var bbox = {};
        try {
            bbox = this.node.getBBox();
        } catch(e) {
            // Firefox 3.0.x plays badly here
        } finally {
            bbox = bbox || {};
        }
        hide && this.hide();
        return bbox;
    };
    /*\
     * Element.attr
     [ method ]
     **
     * Sets the attributes of the element.
     > Parameters
     - attrName (string) attribute’s name
     - value (string) value
     * or
     - params (object) object of name/value pairs
     * or
     - attrName (string) attribute’s name
     * or
     - attrNames (array) in this case method returns array of current values for given attribute names
     = (object) @Element if attrsName & value or params are passed in.
     = (...) value of the attribute if only attrsName is passed in.
     = (array) array of values of the attribute if attrsNames is passed in.
     = (object) object of attributes if nothing is passed in.
     > Possible parameters
     # <p>Please refer to the <a href="http://www.w3.org/TR/SVG/" title="The W3C Recommendation for the SVG language describes these properties in detail.">SVG specification</a> for an explanation of these parameters.</p>
     o arrow-end (string) arrowhead on the end of the path. The format for string is `<type>[-<width>[-<length>]]`. Possible types: `classic`, `block`, `open`, `oval`, `diamond`, `none`, width: `wide`, `narrow`, `medium`, length: `long`, `short`, `midium`.
     o clip-rect (string) comma or space separated values: x, y, width and height
     o cursor (string) CSS type of the cursor
     o cx (number) the x-axis coordinate of the center of the circle, or ellipse
     o cy (number) the y-axis coordinate of the center of the circle, or ellipse
     o fill (string) colour, gradient or image
     o fill-opacity (number)
     o font (string)
     o font-family (string)
     o font-size (number) font size in pixels
     o font-weight (string)
     o height (number)
     o href (string) URL, if specified element behaves as hyperlink
     o opacity (number)
     o path (string) SVG path string format
     o r (number) radius of the circle, ellipse or rounded corner on the rect
     o rx (number) horisontal radius of the ellipse
     o ry (number) vertical radius of the ellipse
     o src (string) image URL, only works for @Element.image element
     o stroke (string) stroke colour
     o stroke-dasharray (string) [“”, “`-`”, “`.`”, “`-.`”, “`-..`”, “`. `”, “`- `”, “`--`”, “`- .`”, “`--.`”, “`--..`”]
     o stroke-linecap (string) [“`butt`”, “`square`”, “`round`”]
     o stroke-linejoin (string) [“`bevel`”, “`round`”, “`miter`”]
     o stroke-miterlimit (number)
     o stroke-opacity (number)
     o stroke-width (number) stroke width in pixels, default is '1'
     o target (string) used with href
     o text (string) contents of the text element. Use `\n` for multiline text
     o text-anchor (string) [“`start`”, “`middle`”, “`end`”], default is “`middle`”
     o title (string) will create tooltip with a given text
     o transform (string) see @Element.transform
     o width (number)
     o x (number)
     o y (number)
     > Gradients
     * Linear gradient format: “`‹angle›-‹colour›[-‹colour›[:‹offset›]]*-‹colour›`”, example: “`90-#fff-#000`” – 90°
     * gradient from white to black or “`0-#fff-#f00:20-#000`” – 0° gradient from white via red (at 20%) to black.
     *
     * radial gradient: “`r[(‹fx›, ‹fy›)]‹colour›[-‹colour›[:‹offset›]]*-‹colour›`”, example: “`r#fff-#000`” –
     * gradient from white to black or “`r(0.25, 0.75)#fff-#000`” – gradient from white to black with focus point
     * at 0.25, 0.75. Focus point coordinates are in 0..1 range. Radial gradients can only be applied to circles and ellipses.
     > Path String
     # <p>Please refer to <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path’s data attribute’s format are described in the SVG specification.">SVG documentation regarding path string</a>. Raphaël fully supports it.</p>
     > Colour Parsing
     # <ul>
     #     <li>Colour name (“<code>red</code>”, “<code>green</code>”, “<code>cornflowerblue</code>”, etc)</li>
     #     <li>#••• — shortened HTML colour: (“<code>#000</code>”, “<code>#fc0</code>”, etc)</li>
     #     <li>#•••••• — full length HTML colour: (“<code>#000000</code>”, “<code>#bd2300</code>”)</li>
     #     <li>rgb(•••, •••, •••) — red, green and blue channels’ values: (“<code>rgb(200,&nbsp;100,&nbsp;0)</code>”)</li>
     #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (“<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>”)</li>
     #     <li>rgba(•••, •••, •••, •••) — red, green and blue channels’ values: (“<code>rgba(200,&nbsp;100,&nbsp;0, .5)</code>”)</li>
     #     <li>rgba(•••%, •••%, •••%, •••%) — same as above, but in %: (“<code>rgba(100%,&nbsp;175%,&nbsp;0%, 50%)</code>”)</li>
     #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (“<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>”)</li>
     #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsba(•••, •••, •••, •••) — same as above, but with opacity</li>
     #     <li>hsl(•••, •••, •••) — almost the same as hsb, see <a href="http://en.wikipedia.org/wiki/HSL_and_HSV" title="HSL and HSV - Wikipedia, the free encyclopedia">Wikipedia page</a></li>
     #     <li>hsl(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsla(•••, •••, •••, •••) — same as above, but with opacity</li>
     #     <li>Optionally for hsb and hsl you could specify hue as a degree: “<code>hsl(240deg,&nbsp;1,&nbsp;.5)</code>” or, if you want to go fancy, “<code>hsl(240°,&nbsp;1,&nbsp;.5)</code>”</li>
     # </ul>
    \*/
    elproto.attr = function (name, value) {
        if (this.removed) {
            return this;
        }
        if (name == null) {
            var res = {};
            for (var a in this.attrs) if (this.attrs[has](a)) {
                res[a] = this.attrs[a];
            }
            res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
            res.transform = this._.transform;
            return res;
        }
        if (value == null && R.is(name, "string")) {
            if (name == "fill" && this.attrs.fill == "none" && this.attrs.gradient) {
                return this.attrs.gradient;
            }
            if (name == "transform") {
                return this._.transform;
            }
            var names = name.split(separator),
                out = {};
            for (var i = 0, ii = names.length; i < ii; i++) {
                name = names[i];
                if (name in this.attrs) {
                    out[name] = this.attrs[name];
                } else if (R.is(this.paper.customAttributes[name], "function")) {
                    out[name] = this.paper.customAttributes[name].def;
                } else {
                    out[name] = R._availableAttrs[name];
                }
            }
            return ii - 1 ? out : out[names[0]];
        }
        if (value == null && R.is(name, "array")) {
            out = {};
            for (i = 0, ii = name.length; i < ii; i++) {
                out[name[i]] = this.attr(name[i]);
            }
            return out;
        }
        if (value != null) {
            var params = {};
            params[name] = value;
        } else if (name != null && R.is(name, "object")) {
            params = name;
        }
        for (var key in params) {
            eve("raphael.attr." + key + "." + this.id, this, params[key]);
        }
        for (key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
            var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
            this.attrs[key] = params[key];
            for (var subkey in par) if (par[has](subkey)) {
                params[subkey] = par[subkey];
            }
        }
        setFillAndStroke(this, params);
        return this;
    };
    /*\
     * Element.toFront
     [ method ]
     **
     * Moves the element so it is the closest to the viewer’s eyes, on top of other elements.
     = (object) @Element
    \*/
    elproto.toFront = function () {
        if (this.removed) {
            return this;
        }
        if (this.node.parentNode.tagName.toLowerCase() == "a") {
            this.node.parentNode.parentNode.appendChild(this.node.parentNode);
        } else {
            this.node.parentNode.appendChild(this.node);
        }
        var svg = this.paper;
        svg.top != this && R._tofront(this, svg);
        return this;
    };
    /*\
     * Element.toBack
     [ method ]
     **
     * Moves the element so it is the furthest from the viewer’s eyes, behind other elements.
     = (object) @Element
    \*/
    elproto.toBack = function () {
        if (this.removed) {
            return this;
        }
        var parent = this.node.parentNode;
        if (parent.tagName.toLowerCase() == "a") {
            parent.parentNode.insertBefore(this.node.parentNode, this.node.parentNode.parentNode.firstChild); 
        } else if (parent.firstChild != this.node) {
            parent.insertBefore(this.node, this.node.parentNode.firstChild);
        }
        R._toback(this, this.paper);
        var svg = this.paper;
        return this;
    };
    /*\
     * Element.insertAfter
     [ method ]
     **
     * Inserts current object after the given one.
     = (object) @Element
    \*/
    elproto.insertAfter = function (element) {
        if (this.removed) {
            return this;
        }
        var node = element.node || element[element.length - 1].node;
        if (node.nextSibling) {
            node.parentNode.insertBefore(this.node, node.nextSibling);
        } else {
            node.parentNode.appendChild(this.node);
        }
        R._insertafter(this, element, this.paper);
        return this;
    };
    /*\
     * Element.insertBefore
     [ method ]
     **
     * Inserts current object before the given one.
     = (object) @Element
    \*/
    elproto.insertBefore = function (element) {
        if (this.removed) {
            return this;
        }
        var node = element.node || element[0].node;
        node.parentNode.insertBefore(this.node, node);
        R._insertbefore(this, element, this.paper);
        return this;
    };
    elproto.blur = function (size) {
        // Experimental. No Safari support. Use it on your own risk.
        var t = this;
        if (+size !== 0) {
            var fltr = $("filter"),
                blur = $("feGaussianBlur");
            t.attrs.blur = size;
            fltr.id = R.createUUID();
            $(blur, {stdDeviation: +size || 1.5});
            fltr.appendChild(blur);
            t.paper.defs.appendChild(fltr);
            t._blur = fltr;
            $(t.node, {filter: "url(#" + fltr.id + ")"});
        } else {
            if (t._blur) {
                t._blur.parentNode.removeChild(t._blur);
                delete t._blur;
                delete t.attrs.blur;
            }
            t.node.removeAttribute("filter");
        }
    };
    R._engine.circle = function (svg, x, y, r) {
        var el = $("circle");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
        res.type = "circle";
        $(el, res.attrs);
        return res;
    };
    R._engine.rect = function (svg, x, y, w, h, r) {
        var el = $("rect");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
        res.type = "rect";
        $(el, res.attrs);
        return res;
    };
    R._engine.ellipse = function (svg, x, y, rx, ry) {
        var el = $("ellipse");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
        res.type = "ellipse";
        $(el, res.attrs);
        return res;
    };
    R._engine.image = function (svg, src, x, y, w, h) {
        var el = $("image");
        $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
        el.setAttributeNS(xlink, "href", src);
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {x: x, y: y, width: w, height: h, src: src};
        res.type = "image";
        return res;
    };
    R._engine.text = function (svg, x, y, text) {
        var el = $("text");
        svg.canvas && svg.canvas.appendChild(el);
        var res = new Element(el, svg);
        res.attrs = {
            x: x,
            y: y,
            "text-anchor": "middle",
            text: text,
            font: R._availableAttrs.font,
            stroke: "none",
            fill: "#000"
        };
        res.type = "text";
        setFillAndStroke(res, res.attrs);
        return res;
    };
    R._engine.setSize = function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;
        this.canvas.setAttribute("width", this.width);
        this.canvas.setAttribute("height", this.height);
        if (this._viewBox) {
            this.setViewBox.apply(this, this._viewBox);
        }
        return this;
    };
    R._engine.create = function () {
        var con = R._getContainer.apply(0, arguments),
            container = con && con.container,
            x = con.x,
            y = con.y,
            width = con.width,
            height = con.height;
        if (!container) {
            throw new Error("SVG container not found.");
        }
        var cnvs = $("svg"),
            css = "overflow:hidden;",
            isFloating;
        x = x || 0;
        y = y || 0;
        width = width || 512;
        height = height || 342;
        $(cnvs, {
            height: height,
            version: 1.1,
            width: width,
            xmlns: "http://www.w3.org/2000/svg"
        });
        if (container == 1) {
            cnvs.style.cssText = css + "position:absolute;left:" + x + "px;top:" + y + "px";
            R._g.doc.body.appendChild(cnvs);
            isFloating = 1;
        } else {
            cnvs.style.cssText = css + "position:relative";
            if (container.firstChild) {
                container.insertBefore(cnvs, container.firstChild);
            } else {
                container.appendChild(cnvs);
            }
        }
        container = new R._Paper;
        container.width = width;
        container.height = height;
        container.canvas = cnvs;
        container.clear();
        container._left = container._top = 0;
        isFloating && (container.renderfix = function () {});
        container.renderfix();
        return container;
    };
    R._engine.setViewBox = function (x, y, w, h, fit) {
        eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
        var size = mmax(w / this.width, h / this.height),
            top = this.top,
            aspectRatio = fit ? "meet" : "xMinYMin",
            vb,
            sw;
        if (x == null) {
            if (this._vbSize) {
                size = 1;
            }
            delete this._vbSize;
            vb = "0 0 " + this.width + S + this.height;
        } else {
            this._vbSize = size;
            vb = x + S + y + S + w + S + h;
        }
        $(this.canvas, {
            viewBox: vb,
            preserveAspectRatio: aspectRatio
        });
        while (size && top) {
            sw = "stroke-width" in top.attrs ? top.attrs["stroke-width"] : 1;
            top.attr({"stroke-width": sw});
            top._.dirty = 1;
            top._.dirtyT = 1;
            top = top.prev;
        }
        this._viewBox = [x, y, w, h, !!fit];
        return this;
    };
    /*\
     * Paper.renderfix
     [ method ]
     **
     * Fixes the issue of Firefox and IE9 regarding subpixel rendering. If paper is dependant
     * on other elements after reflow it could shift half pixel which cause for lines to lost their crispness.
     * This method fixes the issue.
     **
       Special thanks to Mariusz Nowak (http://www.medikoo.com/) for this method.
    \*/
    R.prototype.renderfix = function () {
        var cnvs = this.canvas,
            s = cnvs.style,
            pos;
        try {
            pos = cnvs.getScreenCTM() || cnvs.createSVGMatrix();
        } catch (e) {
            pos = cnvs.createSVGMatrix();
        }
        var left = -pos.e % 1,
            top = -pos.f % 1;
        if (left || top) {
            if (left) {
                this._left = (this._left + left) % 1;
                s.left = this._left + "px";
            }
            if (top) {
                this._top = (this._top + top) % 1;
                s.top = this._top + "px";
            }
        }
    };
    /*\
     * Paper.clear
     [ method ]
     **
     * Clears the paper, i.e. removes all the elements.
    \*/
    R.prototype.clear = function () {
        R.eve("raphael.clear", this);
        var c = this.canvas;
        while (c.firstChild) {
            c.removeChild(c.firstChild);
        }
        this.bottom = this.top = null;
        (this.desc = $("desc")).appendChild(R._g.doc.createTextNode("Created with Rapha\xebl " + R.version));
        c.appendChild(this.desc);
        c.appendChild(this.defs = $("defs"));
    };
    /*\
     * Paper.remove
     [ method ]
     **
     * Removes the paper from the DOM.
    \*/
    R.prototype.remove = function () {
        eve("raphael.remove", this);
        this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
    };
    var setproto = R.st;
    for (var method in elproto) if (elproto[has](method) && !setproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname].apply(el, arg);
                });
            };
        })(method);
    }
}(window.Raphael);
},{}],6:[function(require,module,exports){
// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël - JavaScript Vector Library                                 │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ VML Module                                                          │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license. │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\
window.Raphael && window.Raphael.vml && function (R) {
    var has = "hasOwnProperty",
        Str = String,
        toFloat = parseFloat,
        math = Math,
        round = math.round,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        fillString = "fill",
        separator = /[, ]+/,
        eve = R.eve,
        ms = " progid:DXImageTransform.Microsoft",
        S = " ",
        E = "",
        map = {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
        bites = /([clmz]),?([^clmz]*)/gi,
        blurregexp = / progid:\S+Blur\([^\)]+\)/g,
        val = /-?[^,\s-]+/g,
        cssDot = "position:absolute;left:0;top:0;width:1px;height:1px",
        zoom = 21600,
        pathTypes = {path: 1, rect: 1, image: 1},
        ovalTypes = {circle: 1, ellipse: 1},
        path2vml = function (path) {
            var total =  /[ahqstv]/ig,
                command = R._pathToAbsolute;
            Str(path).match(total) && (command = R._path2curve);
            total = /[clmz]/g;
            if (command == R._pathToAbsolute && !Str(path).match(total)) {
                var res = Str(path).replace(bites, function (all, command, args) {
                    var vals = [],
                        isMove = command.toLowerCase() == "m",
                        res = map[command];
                    args.replace(val, function (value) {
                        if (isMove && vals.length == 2) {
                            res += vals + map[command == "m" ? "l" : "L"];
                            vals = [];
                        }
                        vals.push(round(value * zoom));
                    });
                    return res + vals;
                });
                return res;
            }
            var pa = command(path), p, r;
            res = [];
            for (var i = 0, ii = pa.length; i < ii; i++) {
                p = pa[i];
                r = pa[i][0].toLowerCase();
                r == "z" && (r = "x");
                for (var j = 1, jj = p.length; j < jj; j++) {
                    r += round(p[j] * zoom) + (j != jj - 1 ? "," : E);
                }
                res.push(r);
            }
            return res.join(S);
        },
        compensation = function (deg, dx, dy) {
            var m = R.matrix();
            m.rotate(-deg, .5, .5);
            return {
                dx: m.x(dx, dy),
                dy: m.y(dx, dy)
            };
        },
        setCoords = function (p, sx, sy, dx, dy, deg) {
            var _ = p._,
                m = p.matrix,
                fillpos = _.fillpos,
                o = p.node,
                s = o.style,
                y = 1,
                flip = "",
                dxdy,
                kx = zoom / sx,
                ky = zoom / sy;
            s.visibility = "hidden";
            if (!sx || !sy) {
                return;
            }
            o.coordsize = abs(kx) + S + abs(ky);
            s.rotation = deg * (sx * sy < 0 ? -1 : 1);
            if (deg) {
                var c = compensation(deg, dx, dy);
                dx = c.dx;
                dy = c.dy;
            }
            sx < 0 && (flip += "x");
            sy < 0 && (flip += " y") && (y = -1);
            s.flip = flip;
            o.coordorigin = (dx * -kx) + S + (dy * -ky);
            if (fillpos || _.fillsize) {
                var fill = o.getElementsByTagName(fillString);
                fill = fill && fill[0];
                o.removeChild(fill);
                if (fillpos) {
                    c = compensation(deg, m.x(fillpos[0], fillpos[1]), m.y(fillpos[0], fillpos[1]));
                    fill.position = c.dx * y + S + c.dy * y;
                }
                if (_.fillsize) {
                    fill.size = _.fillsize[0] * abs(sx) + S + _.fillsize[1] * abs(sy);
                }
                o.appendChild(fill);
            }
            s.visibility = "visible";
        };
    R.toString = function () {
        return  "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version;
    };
    var addArrow = function (o, value, isEnd) {
        var values = Str(value).toLowerCase().split("-"),
            se = isEnd ? "end" : "start",
            i = values.length,
            type = "classic",
            w = "medium",
            h = "medium";
        while (i--) {
            switch (values[i]) {
                case "block":
                case "classic":
                case "oval":
                case "diamond":
                case "open":
                case "none":
                    type = values[i];
                    break;
                case "wide":
                case "narrow": h = values[i]; break;
                case "long":
                case "short": w = values[i]; break;
            }
        }
        var stroke = o.node.getElementsByTagName("stroke")[0];
        stroke[se + "arrow"] = type;
        stroke[se + "arrowlength"] = w;
        stroke[se + "arrowwidth"] = h;
    },
    setFillAndStroke = function (o, params) {
        // o.paper.canvas.style.display = "none";
        o.attrs = o.attrs || {};
        var node = o.node,
            a = o.attrs,
            s = node.style,
            xy,
            newpath = pathTypes[o.type] && (params.x != a.x || params.y != a.y || params.width != a.width || params.height != a.height || params.cx != a.cx || params.cy != a.cy || params.rx != a.rx || params.ry != a.ry || params.r != a.r),
            isOval = ovalTypes[o.type] && (a.cx != params.cx || a.cy != params.cy || a.r != params.r || a.rx != params.rx || a.ry != params.ry),
            res = o;


        for (var par in params) if (params[has](par)) {
            a[par] = params[par];
        }
        if (newpath) {
            a.path = R._getPath[o.type](o);
            o._.dirty = 1;
        }
        params.href && (node.href = params.href);
        params.title && (node.title = params.title);
        params.target && (node.target = params.target);
        params.cursor && (s.cursor = params.cursor);
        "blur" in params && o.blur(params.blur);
        if (params.path && o.type == "path" || newpath) {
            node.path = path2vml(~Str(a.path).toLowerCase().indexOf("r") ? R._pathToAbsolute(a.path) : a.path);
            if (o.type == "image") {
                o._.fillpos = [a.x, a.y];
                o._.fillsize = [a.width, a.height];
                setCoords(o, 1, 1, 0, 0, 0);
            }
        }
        "transform" in params && o.transform(params.transform);
        if (isOval) {
            var cx = +a.cx,
                cy = +a.cy,
                rx = +a.rx || +a.r || 0,
                ry = +a.ry || +a.r || 0;
            node.path = R.format("ar{0},{1},{2},{3},{4},{1},{4},{1}x", round((cx - rx) * zoom), round((cy - ry) * zoom), round((cx + rx) * zoom), round((cy + ry) * zoom), round(cx * zoom));
        }
        if ("clip-rect" in params) {
            var rect = Str(params["clip-rect"]).split(separator);
            if (rect.length == 4) {
                rect[2] = +rect[2] + (+rect[0]);
                rect[3] = +rect[3] + (+rect[1]);
                var div = node.clipRect || R._g.doc.createElement("div"),
                    dstyle = div.style;
                dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect);
                if (!node.clipRect) {
                    dstyle.position = "absolute";
                    dstyle.top = 0;
                    dstyle.left = 0;
                    dstyle.width = o.paper.width + "px";
                    dstyle.height = o.paper.height + "px";
                    node.parentNode.insertBefore(div, node);
                    div.appendChild(node);
                    node.clipRect = div;
                }
            }
            if (!params["clip-rect"]) {
                node.clipRect && (node.clipRect.style.clip = "auto");
            }
        }
        if (o.textpath) {
            var textpathStyle = o.textpath.style;
            params.font && (textpathStyle.font = params.font);
            params["font-family"] && (textpathStyle.fontFamily = '"' + params["font-family"].split(",")[0].replace(/^['"]+|['"]+$/g, E) + '"');
            params["font-size"] && (textpathStyle.fontSize = params["font-size"]);
            params["font-weight"] && (textpathStyle.fontWeight = params["font-weight"]);
            params["font-style"] && (textpathStyle.fontStyle = params["font-style"]);
        }
        if ("arrow-start" in params) {
            addArrow(res, params["arrow-start"]);
        }
        if ("arrow-end" in params) {
            addArrow(res, params["arrow-end"], 1);
        }
        if (params.opacity != null || 
            params["stroke-width"] != null ||
            params.fill != null ||
            params.src != null ||
            params.stroke != null ||
            params["stroke-width"] != null ||
            params["stroke-opacity"] != null ||
            params["fill-opacity"] != null ||
            params["stroke-dasharray"] != null ||
            params["stroke-miterlimit"] != null ||
            params["stroke-linejoin"] != null ||
            params["stroke-linecap"] != null) {
            var fill = node.getElementsByTagName(fillString),
                newfill = false;
            fill = fill && fill[0];
            !fill && (newfill = fill = createNode(fillString));
            if (o.type == "image" && params.src) {
                fill.src = params.src;
            }
            params.fill && (fill.on = true);
            if (fill.on == null || params.fill == "none" || params.fill === null) {
                fill.on = false;
            }
            if (fill.on && params.fill) {
                var isURL = Str(params.fill).match(R._ISURL);
                if (isURL) {
                    fill.parentNode == node && node.removeChild(fill);
                    fill.rotate = true;
                    fill.src = isURL[1];
                    fill.type = "tile";
                    var bbox = o.getBBox(1);
                    fill.position = bbox.x + S + bbox.y;
                    o._.fillpos = [bbox.x, bbox.y];

                    R._preload(isURL[1], function () {
                        o._.fillsize = [this.offsetWidth, this.offsetHeight];
                    });
                } else {
                    fill.color = R.getRGB(params.fill).hex;
                    fill.src = E;
                    fill.type = "solid";
                    if (R.getRGB(params.fill).error && (res.type in {circle: 1, ellipse: 1} || Str(params.fill).charAt() != "r") && addGradientFill(res, params.fill, fill)) {
                        a.fill = "none";
                        a.gradient = params.fill;
                        fill.rotate = false;
                    }
                }
            }
            if ("fill-opacity" in params || "opacity" in params) {
                var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+R.getRGB(params.fill).o + 1 || 2) - 1);
                opacity = mmin(mmax(opacity, 0), 1);
                fill.opacity = opacity;
                if (fill.src) {
                    fill.color = "none";
                }
            }
            node.appendChild(fill);
            var stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0]),
            newstroke = false;
            !stroke && (newstroke = stroke = createNode("stroke"));
            if ((params.stroke && params.stroke != "none") ||
                params["stroke-width"] ||
                params["stroke-opacity"] != null ||
                params["stroke-dasharray"] ||
                params["stroke-miterlimit"] ||
                params["stroke-linejoin"] ||
                params["stroke-linecap"]) {
                stroke.on = true;
            }
            (params.stroke == "none" || params.stroke === null || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false);
            var strokeColor = R.getRGB(params.stroke);
            stroke.on && params.stroke && (stroke.color = strokeColor.hex);
            opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+strokeColor.o + 1 || 2) - 1);
            var width = (toFloat(params["stroke-width"]) || 1) * .75;
            opacity = mmin(mmax(opacity, 0), 1);
            params["stroke-width"] == null && (width = a["stroke-width"]);
            params["stroke-width"] && (stroke.weight = width);
            width && width < 1 && (opacity *= width) && (stroke.weight = 1);
            stroke.opacity = opacity;
        
            params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
            stroke.miterlimit = params["stroke-miterlimit"] || 8;
            params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
            if (params["stroke-dasharray"]) {
                var dasharray = {
                    "-": "shortdash",
                    ".": "shortdot",
                    "-.": "shortdashdot",
                    "-..": "shortdashdotdot",
                    ". ": "dot",
                    "- ": "dash",
                    "--": "longdash",
                    "- .": "dashdot",
                    "--.": "longdashdot",
                    "--..": "longdashdotdot"
                };
                stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E;
            }
            newstroke && node.appendChild(stroke);
        }
        if (res.type == "text") {
            res.paper.canvas.style.display = E;
            var span = res.paper.span,
                m = 100,
                fontSize = a.font && a.font.match(/\d+(?:\.\d*)?(?=px)/);
            s = span.style;
            a.font && (s.font = a.font);
            a["font-family"] && (s.fontFamily = a["font-family"]);
            a["font-weight"] && (s.fontWeight = a["font-weight"]);
            a["font-style"] && (s.fontStyle = a["font-style"]);
            fontSize = toFloat(a["font-size"] || fontSize && fontSize[0]) || 10;
            s.fontSize = fontSize * m + "px";
            res.textpath.string && (span.innerHTML = Str(res.textpath.string).replace(/</g, "&#60;").replace(/&/g, "&#38;").replace(/\n/g, "<br>"));
            var brect = span.getBoundingClientRect();
            res.W = a.w = (brect.right - brect.left) / m;
            res.H = a.h = (brect.bottom - brect.top) / m;
            // res.paper.canvas.style.display = "none";
            res.X = a.x;
            res.Y = a.y + res.H / 2;

            ("x" in params || "y" in params) && (res.path.v = R.format("m{0},{1}l{2},{1}", round(a.x * zoom), round(a.y * zoom), round(a.x * zoom) + 1));
            var dirtyattrs = ["x", "y", "text", "font", "font-family", "font-weight", "font-style", "font-size"];
            for (var d = 0, dd = dirtyattrs.length; d < dd; d++) if (dirtyattrs[d] in params) {
                res._.dirty = 1;
                break;
            }
        
            // text-anchor emulation
            switch (a["text-anchor"]) {
                case "start":
                    res.textpath.style["v-text-align"] = "left";
                    res.bbx = res.W / 2;
                break;
                case "end":
                    res.textpath.style["v-text-align"] = "right";
                    res.bbx = -res.W / 2;
                break;
                default:
                    res.textpath.style["v-text-align"] = "center";
                    res.bbx = 0;
                break;
            }
            res.textpath.style["v-text-kern"] = true;
        }
        // res.paper.canvas.style.display = E;
    },
    addGradientFill = function (o, gradient, fill) {
        o.attrs = o.attrs || {};
        var attrs = o.attrs,
            pow = Math.pow,
            opacity,
            oindex,
            type = "linear",
            fxfy = ".5 .5";
        o.attrs.gradient = gradient;
        gradient = Str(gradient).replace(R._radial_gradient, function (all, fx, fy) {
            type = "radial";
            if (fx && fy) {
                fx = toFloat(fx);
                fy = toFloat(fy);
                pow(fx - .5, 2) + pow(fy - .5, 2) > .25 && (fy = math.sqrt(.25 - pow(fx - .5, 2)) * ((fy > .5) * 2 - 1) + .5);
                fxfy = fx + S + fy;
            }
            return E;
        });
        gradient = gradient.split(/\s*\-\s*/);
        if (type == "linear") {
            var angle = gradient.shift();
            angle = -toFloat(angle);
            if (isNaN(angle)) {
                return null;
            }
        }
        var dots = R._parseDots(gradient);
        if (!dots) {
            return null;
        }
        o = o.shape || o.node;
        if (dots.length) {
            o.removeChild(fill);
            fill.on = true;
            fill.method = "none";
            fill.color = dots[0].color;
            fill.color2 = dots[dots.length - 1].color;
            var clrs = [];
            for (var i = 0, ii = dots.length; i < ii; i++) {
                dots[i].offset && clrs.push(dots[i].offset + S + dots[i].color);
            }
            fill.colors = clrs.length ? clrs.join() : "0% " + fill.color;
            if (type == "radial") {
                fill.type = "gradientTitle";
                fill.focus = "100%";
                fill.focussize = "0 0";
                fill.focusposition = fxfy;
                fill.angle = 0;
            } else {
                // fill.rotate= true;
                fill.type = "gradient";
                fill.angle = (270 - angle) % 360;
            }
            o.appendChild(fill);
        }
        return 1;
    },
    Element = function (node, vml) {
        this[0] = this.node = node;
        node.raphael = true;
        this.id = R._oid++;
        node.raphaelid = this.id;
        this.X = 0;
        this.Y = 0;
        this.attrs = {};
        this.paper = vml;
        this.matrix = R.matrix();
        this._ = {
            transform: [],
            sx: 1,
            sy: 1,
            dx: 0,
            dy: 0,
            deg: 0,
            dirty: 1,
            dirtyT: 1
        };
        !vml.bottom && (vml.bottom = this);
        this.prev = vml.top;
        vml.top && (vml.top.next = this);
        vml.top = this;
        this.next = null;
    };
    var elproto = R.el;

    Element.prototype = elproto;
    elproto.constructor = Element;
    elproto.transform = function (tstr) {
        if (tstr == null) {
            return this._.transform;
        }
        var vbs = this.paper._viewBoxShift,
            vbt = vbs ? "s" + [vbs.scale, vbs.scale] + "-1-1t" + [vbs.dx, vbs.dy] : E,
            oldt;
        if (vbs) {
            oldt = tstr = Str(tstr).replace(/\.{3}|\u2026/g, this._.transform || E);
        }
        R._extractTransform(this, vbt + tstr);
        var matrix = this.matrix.clone(),
            skew = this.skew,
            o = this.node,
            split,
            isGrad = ~Str(this.attrs.fill).indexOf("-"),
            isPatt = !Str(this.attrs.fill).indexOf("url(");
        matrix.translate(-.5, -.5);
        if (isPatt || isGrad || this.type == "image") {
            skew.matrix = "1 0 0 1";
            skew.offset = "0 0";
            split = matrix.split();
            if ((isGrad && split.noRotation) || !split.isSimple) {
                o.style.filter = matrix.toFilter();
                var bb = this.getBBox(),
                    bbt = this.getBBox(1),
                    dx = bb.x - bbt.x,
                    dy = bb.y - bbt.y;
                o.coordorigin = (dx * -zoom) + S + (dy * -zoom);
                setCoords(this, 1, 1, dx, dy, 0);
            } else {
                o.style.filter = E;
                setCoords(this, split.scalex, split.scaley, split.dx, split.dy, split.rotate);
            }
        } else {
            o.style.filter = E;
            skew.matrix = Str(matrix);
            skew.offset = matrix.offset();
        }
        oldt && (this._.transform = oldt);
        return this;
    };
    elproto.rotate = function (deg, cx, cy) {
        if (this.removed) {
            return this;
        }
        if (deg == null) {
            return;
        }
        deg = Str(deg).split(separator);
        if (deg.length - 1) {
            cx = toFloat(deg[1]);
            cy = toFloat(deg[2]);
        }
        deg = toFloat(deg[0]);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
            cx = bbox.x + bbox.width / 2;
            cy = bbox.y + bbox.height / 2;
        }
        this._.dirtyT = 1;
        this.transform(this._.transform.concat([["r", deg, cx, cy]]));
        return this;
    };
    elproto.translate = function (dx, dy) {
        if (this.removed) {
            return this;
        }
        dx = Str(dx).split(separator);
        if (dx.length - 1) {
            dy = toFloat(dx[1]);
        }
        dx = toFloat(dx[0]) || 0;
        dy = +dy || 0;
        if (this._.bbox) {
            this._.bbox.x += dx;
            this._.bbox.y += dy;
        }
        this.transform(this._.transform.concat([["t", dx, dy]]));
        return this;
    };
    elproto.scale = function (sx, sy, cx, cy) {
        if (this.removed) {
            return this;
        }
        sx = Str(sx).split(separator);
        if (sx.length - 1) {
            sy = toFloat(sx[1]);
            cx = toFloat(sx[2]);
            cy = toFloat(sx[3]);
            isNaN(cx) && (cx = null);
            isNaN(cy) && (cy = null);
        }
        sx = toFloat(sx[0]);
        (sy == null) && (sy = sx);
        (cy == null) && (cx = cy);
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1);
        }
        cx = cx == null ? bbox.x + bbox.width / 2 : cx;
        cy = cy == null ? bbox.y + bbox.height / 2 : cy;
    
        this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]));
        this._.dirtyT = 1;
        return this;
    };
    elproto.hide = function () {
        !this.removed && (this.node.style.display = "none");
        return this;
    };
    elproto.show = function () {
        !this.removed && (this.node.style.display = E);
        return this;
    };
    elproto._getBBox = function () {
        if (this.removed) {
            return {};
        }
        return {
            x: this.X + (this.bbx || 0) - this.W / 2,
            y: this.Y - this.H,
            width: this.W,
            height: this.H
        };
    };
    elproto.remove = function () {
        if (this.removed || !this.node.parentNode) {
            return;
        }
        this.paper.__set__ && this.paper.__set__.exclude(this);
        R.eve.unbind("raphael.*.*." + this.id);
        R._tear(this, this.paper);
        this.node.parentNode.removeChild(this.node);
        this.shape && this.shape.parentNode.removeChild(this.shape);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
        this.removed = true;
    };
    elproto.attr = function (name, value) {
        if (this.removed) {
            return this;
        }
        if (name == null) {
            var res = {};
            for (var a in this.attrs) if (this.attrs[has](a)) {
                res[a] = this.attrs[a];
            }
            res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
            res.transform = this._.transform;
            return res;
        }
        if (value == null && R.is(name, "string")) {
            if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                return this.attrs.gradient;
            }
            var names = name.split(separator),
                out = {};
            for (var i = 0, ii = names.length; i < ii; i++) {
                name = names[i];
                if (name in this.attrs) {
                    out[name] = this.attrs[name];
                } else if (R.is(this.paper.customAttributes[name], "function")) {
                    out[name] = this.paper.customAttributes[name].def;
                } else {
                    out[name] = R._availableAttrs[name];
                }
            }
            return ii - 1 ? out : out[names[0]];
        }
        if (this.attrs && value == null && R.is(name, "array")) {
            out = {};
            for (i = 0, ii = name.length; i < ii; i++) {
                out[name[i]] = this.attr(name[i]);
            }
            return out;
        }
        var params;
        if (value != null) {
            params = {};
            params[name] = value;
        }
        value == null && R.is(name, "object") && (params = name);
        for (var key in params) {
            eve("raphael.attr." + key + "." + this.id, this, params[key]);
        }
        if (params) {
            for (key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                var par = this.paper.customAttributes[key].apply(this, [].concat(params[key]));
                this.attrs[key] = params[key];
                for (var subkey in par) if (par[has](subkey)) {
                    params[subkey] = par[subkey];
                }
            }
            // this.paper.canvas.style.display = "none";
            if (params.text && this.type == "text") {
                this.textpath.string = params.text;
            }
            setFillAndStroke(this, params);
            // this.paper.canvas.style.display = E;
        }
        return this;
    };
    elproto.toFront = function () {
        !this.removed && this.node.parentNode.appendChild(this.node);
        this.paper && this.paper.top != this && R._tofront(this, this.paper);
        return this;
    };
    elproto.toBack = function () {
        if (this.removed) {
            return this;
        }
        if (this.node.parentNode.firstChild != this.node) {
            this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
            R._toback(this, this.paper);
        }
        return this;
    };
    elproto.insertAfter = function (element) {
        if (this.removed) {
            return this;
        }
        if (element.constructor == R.st.constructor) {
            element = element[element.length - 1];
        }
        if (element.node.nextSibling) {
            element.node.parentNode.insertBefore(this.node, element.node.nextSibling);
        } else {
            element.node.parentNode.appendChild(this.node);
        }
        R._insertafter(this, element, this.paper);
        return this;
    };
    elproto.insertBefore = function (element) {
        if (this.removed) {
            return this;
        }
        if (element.constructor == R.st.constructor) {
            element = element[0];
        }
        element.node.parentNode.insertBefore(this.node, element.node);
        R._insertbefore(this, element, this.paper);
        return this;
    };
    elproto.blur = function (size) {
        var s = this.node.runtimeStyle,
            f = s.filter;
        f = f.replace(blurregexp, E);
        if (+size !== 0) {
            this.attrs.blur = size;
            s.filter = f + S + ms + ".Blur(pixelradius=" + (+size || 1.5) + ")";
            s.margin = R.format("-{0}px 0 0 -{0}px", round(+size || 1.5));
        } else {
            s.filter = f;
            s.margin = 0;
            delete this.attrs.blur;
        }
    };

    R._engine.path = function (pathString, vml) {
        var el = createNode("shape");
        el.style.cssText = cssDot;
        el.coordsize = zoom + S + zoom;
        el.coordorigin = vml.coordorigin;
        var p = new Element(el, vml),
            attr = {fill: "none", stroke: "#000"};
        pathString && (attr.path = pathString);
        p.type = "path";
        p.path = [];
        p.Path = E;
        setFillAndStroke(p, attr);
        vml.canvas.appendChild(el);
        var skew = createNode("skew");
        skew.on = true;
        el.appendChild(skew);
        p.skew = skew;
        p.transform(E);
        return p;
    };
    R._engine.rect = function (vml, x, y, w, h, r) {
        var path = R._rectPath(x, y, w, h, r),
            res = vml.path(path),
            a = res.attrs;
        res.X = a.x = x;
        res.Y = a.y = y;
        res.W = a.width = w;
        res.H = a.height = h;
        a.r = r;
        a.path = path;
        res.type = "rect";
        return res;
    };
    R._engine.ellipse = function (vml, x, y, rx, ry) {
        var res = vml.path(),
            a = res.attrs;
        res.X = x - rx;
        res.Y = y - ry;
        res.W = rx * 2;
        res.H = ry * 2;
        res.type = "ellipse";
        setFillAndStroke(res, {
            cx: x,
            cy: y,
            rx: rx,
            ry: ry
        });
        return res;
    };
    R._engine.circle = function (vml, x, y, r) {
        var res = vml.path(),
            a = res.attrs;
        res.X = x - r;
        res.Y = y - r;
        res.W = res.H = r * 2;
        res.type = "circle";
        setFillAndStroke(res, {
            cx: x,
            cy: y,
            r: r
        });
        return res;
    };
    R._engine.image = function (vml, src, x, y, w, h) {
        var path = R._rectPath(x, y, w, h),
            res = vml.path(path).attr({stroke: "none"}),
            a = res.attrs,
            node = res.node,
            fill = node.getElementsByTagName(fillString)[0];
        a.src = src;
        res.X = a.x = x;
        res.Y = a.y = y;
        res.W = a.width = w;
        res.H = a.height = h;
        a.path = path;
        res.type = "image";
        fill.parentNode == node && node.removeChild(fill);
        fill.rotate = true;
        fill.src = src;
        fill.type = "tile";
        res._.fillpos = [x, y];
        res._.fillsize = [w, h];
        node.appendChild(fill);
        setCoords(res, 1, 1, 0, 0, 0);
        return res;
    };
    R._engine.text = function (vml, x, y, text) {
        var el = createNode("shape"),
            path = createNode("path"),
            o = createNode("textpath");
        x = x || 0;
        y = y || 0;
        text = text || "";
        path.v = R.format("m{0},{1}l{2},{1}", round(x * zoom), round(y * zoom), round(x * zoom) + 1);
        path.textpathok = true;
        o.string = Str(text);
        o.on = true;
        el.style.cssText = cssDot;
        el.coordsize = zoom + S + zoom;
        el.coordorigin = "0 0";
        var p = new Element(el, vml),
            attr = {
                fill: "#000",
                stroke: "none",
                font: R._availableAttrs.font,
                text: text
            };
        p.shape = el;
        p.path = path;
        p.textpath = o;
        p.type = "text";
        p.attrs.text = Str(text);
        p.attrs.x = x;
        p.attrs.y = y;
        p.attrs.w = 1;
        p.attrs.h = 1;
        setFillAndStroke(p, attr);
        el.appendChild(o);
        el.appendChild(path);
        vml.canvas.appendChild(el);
        var skew = createNode("skew");
        skew.on = true;
        el.appendChild(skew);
        p.skew = skew;
        p.transform(E);
        return p;
    };
    R._engine.setSize = function (width, height) {
        var cs = this.canvas.style;
        this.width = width;
        this.height = height;
        width == +width && (width += "px");
        height == +height && (height += "px");
        cs.width = width;
        cs.height = height;
        cs.clip = "rect(0 " + width + " " + height + " 0)";
        if (this._viewBox) {
            R._engine.setViewBox.apply(this, this._viewBox);
        }
        return this;
    };
    R._engine.setViewBox = function (x, y, w, h, fit) {
        R.eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit]);
        var width = this.width,
            height = this.height,
            size = 1 / mmax(w / width, h / height),
            H, W;
        if (fit) {
            H = height / h;
            W = width / w;
            if (w * H < width) {
                x -= (width - w * H) / 2 / H;
            }
            if (h * W < height) {
                y -= (height - h * W) / 2 / W;
            }
        }
        this._viewBox = [x, y, w, h, !!fit];
        this._viewBoxShift = {
            dx: -x,
            dy: -y,
            scale: size
        };
        this.forEach(function (el) {
            el.transform("...");
        });
        return this;
    };
    var createNode;
    R._engine.initWin = function (win) {
            var doc = win.document;
            doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
            try {
                !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
                createNode = function (tagName) {
                    return doc.createElement('<rvml:' + tagName + ' class="rvml">');
                };
            } catch (e) {
                createNode = function (tagName) {
                    return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
                };
            }
        };
    R._engine.initWin(R._g.win);
    R._engine.create = function () {
        var con = R._getContainer.apply(0, arguments),
            container = con.container,
            height = con.height,
            s,
            width = con.width,
            x = con.x,
            y = con.y;
        if (!container) {
            throw new Error("VML container not found.");
        }
        var res = new R._Paper,
            c = res.canvas = R._g.doc.createElement("div"),
            cs = c.style;
        x = x || 0;
        y = y || 0;
        width = width || 512;
        height = height || 342;
        res.width = width;
        res.height = height;
        width == +width && (width += "px");
        height == +height && (height += "px");
        res.coordsize = zoom * 1e3 + S + zoom * 1e3;
        res.coordorigin = "0 0";
        res.span = R._g.doc.createElement("span");
        res.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;";
        c.appendChild(res.span);
        cs.cssText = R.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", width, height);
        if (container == 1) {
            R._g.doc.body.appendChild(c);
            cs.left = x + "px";
            cs.top = y + "px";
            cs.position = "absolute";
        } else {
            if (container.firstChild) {
                container.insertBefore(c, container.firstChild);
            } else {
                container.appendChild(c);
            }
        }
        res.renderfix = function () {};
        return res;
    };
    R.prototype.clear = function () {
        R.eve("raphael.clear", this);
        this.canvas.innerHTML = E;
        this.span = R._g.doc.createElement("span");
        this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
        this.canvas.appendChild(this.span);
        this.bottom = this.top = null;
    };
    R.prototype.remove = function () {
        R.eve("raphael.remove", this);
        this.canvas.parentNode.removeChild(this.canvas);
        for (var i in this) {
            this[i] = typeof this[i] == "function" ? R._removedFactory(i) : null;
        }
        return true;
    };

    var setproto = R.st;
    for (var method in elproto) if (elproto[has](method) && !setproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                var arg = arguments;
                return this.forEach(function (el) {
                    el[methodname].apply(el, arg);
                });
            };
        })(method);
    }
}(window.Raphael);
},{}],7:[function(require,module,exports){
(function (global){
var Points, Raphael, animations, canvas, outerPoints, outerRadius, pairs, vertices, _ref;

Raphael = require("raphael");

canvas = Raphael("logo", 400, 400);

global.midX = canvas.width / 2;

global.midY = canvas.height / 2;

Points = require("../lib/points.coffee");

animations = require("../lib/queue.coffee")();

outerPoints = 3;

_ref = Points({
  vertices: outerPoints
}), pairs = _ref.pairs, vertices = _ref.vertices;

canvas.setStart();

outerRadius = 12;

vertices.forEach(function(vertex) {
  animations.push(function() {
    return canvas.circle(vertex.x, vertex.y, 0).attr({
      stroke: "#000",
      "stroke-width": 3,
      fill: "#fff"
    }).animate({
      r: outerRadius
    }, 250, "backOut", animations.next);
  });
  return animations.push(function() {
    return canvas.circle(vertex.x, vertex.y, 0).attr({
      fill: "#000"
    }).animate({
      r: outerRadius / 2
    }, 250, "backOut", animations.next);
  });
});

pairs.forEach(function(pair) {
  return animations.push(function() {
    canvas.path(["M", pair[0].x, pair[0].y, "L", pair[1].x, pair[1].y]).attr({
      stroke: "#fff",
      "stroke-width": 3
    }).toBack();
    return canvas.path(["M", pair[0].x, pair[0].y, "L", pair[1].x, pair[1].y]).attr({
      stroke: "#000",
      "stroke-width": 0
    }).toBack().animate({
      "stroke-width": 10
    }, 500, "backOut", animations.next);
  });
});

animations.push(function() {
  var set;
  set = canvas.setFinish();
  return set.animate({
    transform: "r270 " + midX + " " + midY
  }, 1000, "backOut", animations.next);
});

animations.push(function() {
  return canvas.circle(midX, midY, 0).attr({
    stroke: "#000",
    "stroke-width": 3
  }).toBack().animate({
    r: 70
  }, 500, "backOut", animations.next);
});

animations.push(function() {
  return canvas.circle(midX, midY, 0).attr({
    stroke: "#000",
    "stroke-width": 8
  }).toBack().animate({
    r: 80
  }, 500, "backOut", animations.next);
});

animations.start();


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../lib/points.coffee":1,"../lib/queue.coffee":2,"raphael":4}]},{},[7])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXR0L0NvZGUvc3V0L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWF0dC9Db2RlL3N1dC9saWIvcG9pbnRzLmNvZmZlZSIsIi9Vc2Vycy9tYXR0L0NvZGUvc3V0L2xpYi9xdWV1ZS5jb2ZmZWUiLCIvVXNlcnMvbWF0dC9Db2RlL3N1dC9ub2RlX21vZHVsZXMvcmFwaGFlbC9ub2RlX21vZHVsZXMvZXZlL2V2ZS5qcyIsIi9Vc2Vycy9tYXR0L0NvZGUvc3V0L25vZGVfbW9kdWxlcy9yYXBoYWVsL3JhcGhhZWwuY29yZS5qcyIsIi9Vc2Vycy9tYXR0L0NvZGUvc3V0L25vZGVfbW9kdWxlcy9yYXBoYWVsL3JhcGhhZWwuc3ZnLmpzIiwiL1VzZXJzL21hdHQvQ29kZS9zdXQvbm9kZV9tb2R1bGVzL3JhcGhhZWwvcmFwaGFlbC52bWwuanMiLCIvVXNlcnMvbWF0dC9Db2RlL3N1dC9zaXRlL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxhQUFBOztBQUFBLFdBQUMsR0FBRCxFQUFNLFdBQUEsR0FBTixDQUFBOztBQUFBLEdBQ0EsR0FBTSxJQUFJLENBQUMsRUFBTCxHQUFVLENBRGhCLENBQUE7O0FBQUEsTUFHTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxPQUFELEdBQUE7QUFDZixNQUFBLGtEQUFBOztJQURnQixVQUFRO0dBQ3hCO0FBQUEsRUFBQSxNQUFBOztBQUFVO1NBQW1CLGlHQUFuQixHQUFBO0FBQUEsb0JBQUEsTUFBQSxDQUFBO0FBQUE7O01BQVYsQ0FBQTtBQUFBLEVBRUEsS0FBQSxHQUFRLEVBRlIsQ0FBQTtBQUFBLEVBR0EsUUFBQSxHQUFXO0lBQ1Q7QUFBQSxNQUFFLENBQUEsRUFBRyxJQUFMO0FBQUEsTUFBVyxDQUFBLEVBQUcsSUFBZDtLQURTO0dBSFgsQ0FBQTtBQUFBLEVBT0Esa0JBQUEsR0FBcUIsRUFQckIsQ0FBQTtBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxTQUFDLEtBQUQsR0FBQTtBQUNiLFFBQUEsWUFBQTtBQUFBLElBQUEsQ0FBQSxHQUFJLEdBQUEsQ0FBSSxLQUFKLENBQUEsR0FBYSxrQkFBYixHQUFrQyxJQUF0QyxDQUFBO0FBQUEsSUFDQSxDQUFBLEdBQUksR0FBQSxDQUFJLEtBQUosQ0FBQSxHQUFhLGtCQUFiLEdBQWtDLElBRHRDLENBQUE7QUFBQSxJQUdBLE1BQUEsR0FBUztBQUFBLE1BQUMsR0FBQSxDQUFEO0FBQUEsTUFBSSxHQUFBLENBQUo7S0FIVCxDQUFBO0FBQUEsSUFLQSxRQUFRLENBQUMsT0FBVCxDQUFpQixTQUFDLENBQUQsR0FBQTthQUNmLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQyxNQUFELEVBQVMsQ0FBVCxDQUFYLEVBRGU7SUFBQSxDQUFqQixDQUxBLENBQUE7V0FRQSxRQUFRLENBQUMsSUFBVCxDQUFjLE1BQWQsRUFUYTtFQUFBLENBQWYsQ0FSQSxDQUFBO1NBbUJBO0FBQUEsSUFBQyxVQUFBLFFBQUQ7QUFBQSxJQUFXLE9BQUEsS0FBWDtJQXBCZTtBQUFBLENBSGpCLENBQUE7Ozs7QUNBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBLEdBQUE7QUFDZixNQUFBLFdBQUE7QUFBQSxFQUFBLEtBQUEsR0FBUSxFQUFSLENBQUE7U0FFQSxJQUFBLEdBQ0U7QUFBQSxJQUFBLElBQUEsRUFBTSxTQUFDLEVBQUQsR0FBQTthQUNKLEtBQUssQ0FBQyxJQUFOLENBQVcsRUFBWCxFQURJO0lBQUEsQ0FBTjtBQUFBLElBR0EsSUFBQSxFQUFNLFNBQUEsR0FBQTtBQUNKLE1BQUEsSUFBd0IsS0FBSyxDQUFDLE1BQTlCO2VBQUEsS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQUFhLENBQUMsSUFBZCxDQUFBLEVBQUE7T0FESTtJQUFBLENBSE47QUFBQSxJQU1BLEtBQUEsRUFBTyxTQUFBLEdBQUE7YUFDTCxJQUFJLENBQUMsSUFBTCxDQUFBLEVBREs7SUFBQSxDQU5QO0lBSmE7QUFBQSxDQUFqQixDQUFBOzs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25YQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdm9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvMENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzU4QkEsSUFBQSxvRkFBQTs7QUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVIsQ0FBVixDQUFBOztBQUFBLE1BQ0EsR0FBUyxPQUFBLENBQVEsTUFBUixFQUFnQixHQUFoQixFQUFxQixHQUFyQixDQURULENBQUE7O0FBQUEsTUFHTSxDQUFDLElBQVAsR0FBYyxNQUFNLENBQUMsS0FBUCxHQUFlLENBSDdCLENBQUE7O0FBQUEsTUFJTSxDQUFDLElBQVAsR0FBYyxNQUFNLENBQUMsTUFBUCxHQUFnQixDQUo5QixDQUFBOztBQUFBLE1BTUEsR0FBUyxPQUFBLENBQVEsc0JBQVIsQ0FOVCxDQUFBOztBQUFBLFVBT0EsR0FBYSxPQUFBLENBQVEscUJBQVIsQ0FBQSxDQUFBLENBUGIsQ0FBQTs7QUFBQSxXQVNBLEdBQWMsQ0FUZCxDQUFBOztBQUFBLE9BVW9CLE1BQUEsQ0FDbEI7QUFBQSxFQUFBLFFBQUEsRUFBVSxXQUFWO0NBRGtCLENBQXBCLEVBQUMsYUFBQSxLQUFELEVBQVEsZ0JBQUEsUUFWUixDQUFBOztBQUFBLE1BYU0sQ0FBQyxRQUFQLENBQUEsQ0FiQSxDQUFBOztBQUFBLFdBZUEsR0FBYyxFQWZkLENBQUE7O0FBQUEsUUFnQlEsQ0FBQyxPQUFULENBQWlCLFNBQUMsTUFBRCxHQUFBO0FBQ2YsRUFBQSxVQUFVLENBQUMsSUFBWCxDQUFnQixTQUFBLEdBQUE7V0FDZCxNQUFNLENBQUMsTUFBUCxDQUFjLE1BQU0sQ0FBQyxDQUFyQixFQUF3QixNQUFNLENBQUMsQ0FBL0IsRUFBa0MsQ0FBbEMsQ0FBb0MsQ0FBQyxJQUFyQyxDQUNFO0FBQUEsTUFBQSxNQUFBLEVBQVEsTUFBUjtBQUFBLE1BQ0EsY0FBQSxFQUFnQixDQURoQjtBQUFBLE1BRUEsSUFBQSxFQUFNLE1BRk47S0FERixDQUlBLENBQUMsT0FKRCxDQUlTO0FBQUEsTUFBRSxDQUFBLEVBQUcsV0FBTDtLQUpULEVBSTZCLEdBSjdCLEVBSWtDLFNBSmxDLEVBSTZDLFVBQVUsQ0FBQyxJQUp4RCxFQURjO0VBQUEsQ0FBaEIsQ0FBQSxDQUFBO1NBT0EsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsU0FBQSxHQUFBO1dBQ2QsTUFBTSxDQUFDLE1BQVAsQ0FBYyxNQUFNLENBQUMsQ0FBckIsRUFBd0IsTUFBTSxDQUFDLENBQS9CLEVBQWtDLENBQWxDLENBQW9DLENBQUMsSUFBckMsQ0FDRTtBQUFBLE1BQUEsSUFBQSxFQUFNLE1BQU47S0FERixDQUVBLENBQUMsT0FGRCxDQUVTO0FBQUEsTUFBRSxDQUFBLEVBQUcsV0FBQSxHQUFjLENBQW5CO0tBRlQsRUFFaUMsR0FGakMsRUFFc0MsU0FGdEMsRUFFaUQsVUFBVSxDQUFDLElBRjVELEVBRGM7RUFBQSxDQUFoQixFQVJlO0FBQUEsQ0FBakIsQ0FoQkEsQ0FBQTs7QUFBQSxLQTZCSyxDQUFDLE9BQU4sQ0FBYyxTQUFDLElBQUQsR0FBQTtTQUNaLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFNBQUEsR0FBQTtBQUNkLElBQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUNWLEdBRFUsRUFDTCxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FESCxFQUNNLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQURkLEVBRVYsR0FGVSxFQUVMLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUZILEVBRU0sSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLENBRmQsQ0FBWixDQUdFLENBQUMsSUFISCxDQUlFO0FBQUEsTUFBQSxNQUFBLEVBQVEsTUFBUjtBQUFBLE1BQ0EsY0FBQSxFQUFnQixDQURoQjtLQUpGLENBTUEsQ0FBQyxNQU5ELENBQUEsQ0FBQSxDQUFBO1dBUUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUNWLEdBRFUsRUFDTCxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FESCxFQUNNLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQURkLEVBRVYsR0FGVSxFQUVMLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUZILEVBRU0sSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLENBRmQsQ0FBWixDQUdFLENBQUMsSUFISCxDQUlFO0FBQUEsTUFBQSxNQUFBLEVBQVEsTUFBUjtBQUFBLE1BQ0EsY0FBQSxFQUFnQixDQURoQjtLQUpGLENBTUEsQ0FBQyxNQU5ELENBQUEsQ0FPQSxDQUFDLE9BUEQsQ0FPUztBQUFBLE1BQUUsY0FBQSxFQUFnQixFQUFsQjtLQVBULEVBT2lDLEdBUGpDLEVBT3NDLFNBUHRDLEVBT2lELFVBQVUsQ0FBQyxJQVA1RCxFQVRjO0VBQUEsQ0FBaEIsRUFEWTtBQUFBLENBQWQsQ0E3QkEsQ0FBQTs7QUFBQSxVQWdEVSxDQUFDLElBQVgsQ0FBZ0IsU0FBQSxHQUFBO0FBQ2QsTUFBQSxHQUFBO0FBQUEsRUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUFOLENBQUE7U0FDQSxHQUFHLENBQUMsT0FBSixDQUFZO0FBQUEsSUFBQyxTQUFBLEVBQVksT0FBQSxHQUFNLElBQU4sR0FBWSxHQUFaLEdBQWMsSUFBM0I7R0FBWixFQUFpRCxJQUFqRCxFQUF1RCxTQUF2RCxFQUFrRSxVQUFVLENBQUMsSUFBN0UsRUFGYztBQUFBLENBQWhCLENBaERBLENBQUE7O0FBQUEsVUFvRFUsQ0FBQyxJQUFYLENBQWdCLFNBQUEsR0FBQTtTQUVkLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBZCxFQUFvQixJQUFwQixFQUEwQixDQUExQixDQUE0QixDQUFDLElBQTdCLENBQ0U7QUFBQSxJQUFBLE1BQUEsRUFBUSxNQUFSO0FBQUEsSUFDQSxjQUFBLEVBQWdCLENBRGhCO0dBREYsQ0FHQSxDQUFDLE1BSEQsQ0FBQSxDQUlBLENBQUMsT0FKRCxDQUlTO0FBQUEsSUFBRSxDQUFBLEVBQUcsRUFBTDtHQUpULEVBSW9CLEdBSnBCLEVBSXlCLFNBSnpCLEVBSW9DLFVBQVUsQ0FBQyxJQUovQyxFQUZjO0FBQUEsQ0FBaEIsQ0FwREEsQ0FBQTs7QUFBQSxVQTREVSxDQUFDLElBQVgsQ0FBZ0IsU0FBQSxHQUFBO1NBRWQsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFkLEVBQW9CLElBQXBCLEVBQTBCLENBQTFCLENBQTRCLENBQUMsSUFBN0IsQ0FDRTtBQUFBLElBQUEsTUFBQSxFQUFRLE1BQVI7QUFBQSxJQUNBLGNBQUEsRUFBZ0IsQ0FEaEI7R0FERixDQUdBLENBQUMsTUFIRCxDQUFBLENBSUEsQ0FBQyxPQUpELENBSVM7QUFBQSxJQUFFLENBQUEsRUFBRyxFQUFMO0dBSlQsRUFJb0IsR0FKcEIsRUFJeUIsU0FKekIsRUFJb0MsVUFBVSxDQUFDLElBSi9DLEVBRmM7QUFBQSxDQUFoQixDQTVEQSxDQUFBOztBQUFBLFVBb0VVLENBQUMsS0FBWCxDQUFBLENBcEVBLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwie2Nvcywgc2lufSA9IE1hdGhcblRBVSA9IE1hdGguUEkgKiAyXG5cbm1vZHVsZS5leHBvcnRzID0gKG9wdGlvbnM9e30pIC0+XG4gIGFuZ2xlcyA9IChhbmdsZSBmb3IgYW5nbGUgaW4gWzAuLi5UQVVdIGJ5IFRBVSAvIG9wdGlvbnMudmVydGljZXMpXG5cbiAgcGFpcnMgPSBbXVxuICB2ZXJ0aWNlcyA9IFtcbiAgICB7IHg6IG1pZFgsIHk6IG1pZFkgfVxuICBdXG5cbiAgZGlzdGFuY2VGcm9tQ2VudGVyID0gNTBcbiAgYW5nbGVzLmZvckVhY2ggKGFuZ2xlKSAtPlxuICAgIHggPSBjb3MoYW5nbGUpICogZGlzdGFuY2VGcm9tQ2VudGVyICsgbWlkWFxuICAgIHkgPSBzaW4oYW5nbGUpICogZGlzdGFuY2VGcm9tQ2VudGVyICsgbWlkWVxuXG4gICAgdmVydGV4ID0ge3gsIHl9XG5cbiAgICB2ZXJ0aWNlcy5mb3JFYWNoICh2KSAtPlxuICAgICAgcGFpcnMucHVzaCBbdmVydGV4LCB2XVxuXG4gICAgdmVydGljZXMucHVzaCB2ZXJ0ZXhcblxuICB7dmVydGljZXMsIHBhaXJzfVxuIiwibW9kdWxlLmV4cG9ydHMgPSAtPlxuICBxdWV1ZSA9IFtdXG5cbiAgc2VsZiA9XG4gICAgcHVzaDogKGZuKSAtPlxuICAgICAgcXVldWUucHVzaChmbilcblxuICAgIG5leHQ6IC0+XG4gICAgICBxdWV1ZS5zaGlmdCgpLmNhbGwoKSBpZiBxdWV1ZS5sZW5ndGhcblxuICAgIHN0YXJ0OiAtPlxuICAgICAgc2VsZi5uZXh0KClcbiIsIi8vIENvcHlyaWdodCAoYykgMjAxMyBBZG9iZSBTeXN0ZW1zIEluY29ycG9yYXRlZC4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIFxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbi8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbi8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuLy8gXG4vLyBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vIFxuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkCBcXFxcXG4vLyDilIIgRXZlIDAuNC4yIC0gSmF2YVNjcmlwdCBFdmVudHMgTGlicmFyeSAgICAgICAgICAgICAgICAgICAgICDilIIgXFxcXFxuLy8g4pSc4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkIFxcXFxcbi8vIOKUgiBBdXRob3IgRG1pdHJ5IEJhcmFub3Zza2l5IChodHRwOi8vZG1pdHJ5LmJhcmFub3Zza2l5LmNvbS8pIOKUgiBcXFxcXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJggXFxcXFxuXG4oZnVuY3Rpb24gKGdsb2IpIHtcbiAgICB2YXIgdmVyc2lvbiA9IFwiMC40LjJcIixcbiAgICAgICAgaGFzID0gXCJoYXNPd25Qcm9wZXJ0eVwiLFxuICAgICAgICBzZXBhcmF0b3IgPSAvW1xcLlxcL10vLFxuICAgICAgICB3aWxkY2FyZCA9IFwiKlwiLFxuICAgICAgICBmdW4gPSBmdW5jdGlvbiAoKSB7fSxcbiAgICAgICAgbnVtc29ydCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYSAtIGI7XG4gICAgICAgIH0sXG4gICAgICAgIGN1cnJlbnRfZXZlbnQsXG4gICAgICAgIHN0b3AsXG4gICAgICAgIGV2ZW50cyA9IHtuOiB7fX0sXG4gICAgLypcXFxuICAgICAqIGV2ZVxuICAgICBbIG1ldGhvZCBdXG5cbiAgICAgKiBGaXJlcyBldmVudCB3aXRoIGdpdmVuIGBuYW1lYCwgZ2l2ZW4gc2NvcGUgYW5kIG90aGVyIHBhcmFtZXRlcnMuXG5cbiAgICAgPiBBcmd1bWVudHNcblxuICAgICAtIG5hbWUgKHN0cmluZykgbmFtZSBvZiB0aGUgKmV2ZW50KiwgZG90IChgLmApIG9yIHNsYXNoIChgL2ApIHNlcGFyYXRlZFxuICAgICAtIHNjb3BlIChvYmplY3QpIGNvbnRleHQgZm9yIHRoZSBldmVudCBoYW5kbGVyc1xuICAgICAtIHZhcmFyZ3MgKC4uLikgdGhlIHJlc3Qgb2YgYXJndW1lbnRzIHdpbGwgYmUgc2VudCB0byBldmVudCBoYW5kbGVyc1xuXG4gICAgID0gKG9iamVjdCkgYXJyYXkgb2YgcmV0dXJuZWQgdmFsdWVzIGZyb20gdGhlIGxpc3RlbmVyc1xuICAgIFxcKi9cbiAgICAgICAgZXZlID0gZnVuY3Rpb24gKG5hbWUsIHNjb3BlKSB7XG5cdFx0XHRuYW1lID0gU3RyaW5nKG5hbWUpO1xuICAgICAgICAgICAgdmFyIGUgPSBldmVudHMsXG4gICAgICAgICAgICAgICAgb2xkc3RvcCA9IHN0b3AsXG4gICAgICAgICAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMiksXG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gZXZlLmxpc3RlbmVycyhuYW1lKSxcbiAgICAgICAgICAgICAgICB6ID0gMCxcbiAgICAgICAgICAgICAgICBmID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgbCxcbiAgICAgICAgICAgICAgICBpbmRleGVkID0gW10sXG4gICAgICAgICAgICAgICAgcXVldWUgPSB7fSxcbiAgICAgICAgICAgICAgICBvdXQgPSBbXSxcbiAgICAgICAgICAgICAgICBjZSA9IGN1cnJlbnRfZXZlbnQsXG4gICAgICAgICAgICAgICAgZXJyb3JzID0gW107XG4gICAgICAgICAgICBjdXJyZW50X2V2ZW50ID0gbmFtZTtcbiAgICAgICAgICAgIHN0b3AgPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGlpOyBpKyspIGlmIChcInpJbmRleFwiIGluIGxpc3RlbmVyc1tpXSkge1xuICAgICAgICAgICAgICAgIGluZGV4ZWQucHVzaChsaXN0ZW5lcnNbaV0uekluZGV4KTtcbiAgICAgICAgICAgICAgICBpZiAobGlzdGVuZXJzW2ldLnpJbmRleCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcXVldWVbbGlzdGVuZXJzW2ldLnpJbmRleF0gPSBsaXN0ZW5lcnNbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5kZXhlZC5zb3J0KG51bXNvcnQpO1xuICAgICAgICAgICAgd2hpbGUgKGluZGV4ZWRbel0gPCAwKSB7XG4gICAgICAgICAgICAgICAgbCA9IHF1ZXVlW2luZGV4ZWRbeisrXV07XG4gICAgICAgICAgICAgICAgb3V0LnB1c2gobC5hcHBseShzY29wZSwgYXJncykpO1xuICAgICAgICAgICAgICAgIGlmIChzdG9wKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3AgPSBvbGRzdG9wO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbCA9IGxpc3RlbmVyc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoXCJ6SW5kZXhcIiBpbiBsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsLnpJbmRleCA9PSBpbmRleGVkW3pdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXQucHVzaChsLmFwcGx5KHNjb3BlLCBhcmdzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHorKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsID0gcXVldWVbaW5kZXhlZFt6XV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbCAmJiBvdXQucHVzaChsLmFwcGx5KHNjb3BlLCBhcmdzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0b3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSB3aGlsZSAobClcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlW2wuekluZGV4XSA9IGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvdXQucHVzaChsLmFwcGx5KHNjb3BlLCBhcmdzKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0b3AgPSBvbGRzdG9wO1xuICAgICAgICAgICAgY3VycmVudF9ldmVudCA9IGNlO1xuICAgICAgICAgICAgcmV0dXJuIG91dC5sZW5ndGggPyBvdXQgOiBudWxsO1xuICAgICAgICB9O1xuXHRcdC8vIFVuZG9jdW1lbnRlZC4gRGVidWcgb25seS5cblx0XHRldmUuX2V2ZW50cyA9IGV2ZW50cztcbiAgICAvKlxcXG4gICAgICogZXZlLmxpc3RlbmVyc1xuICAgICBbIG1ldGhvZCBdXG5cbiAgICAgKiBJbnRlcm5hbCBtZXRob2Qgd2hpY2ggZ2l2ZXMgeW91IGFycmF5IG9mIGFsbCBldmVudCBoYW5kbGVycyB0aGF0IHdpbGwgYmUgdHJpZ2dlcmVkIGJ5IHRoZSBnaXZlbiBgbmFtZWAuXG5cbiAgICAgPiBBcmd1bWVudHNcblxuICAgICAtIG5hbWUgKHN0cmluZykgbmFtZSBvZiB0aGUgZXZlbnQsIGRvdCAoYC5gKSBvciBzbGFzaCAoYC9gKSBzZXBhcmF0ZWRcblxuICAgICA9IChhcnJheSkgYXJyYXkgb2YgZXZlbnQgaGFuZGxlcnNcbiAgICBcXCovXG4gICAgZXZlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHZhciBuYW1lcyA9IG5hbWUuc3BsaXQoc2VwYXJhdG9yKSxcbiAgICAgICAgICAgIGUgPSBldmVudHMsXG4gICAgICAgICAgICBpdGVtLFxuICAgICAgICAgICAgaXRlbXMsXG4gICAgICAgICAgICBrLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGlpLFxuICAgICAgICAgICAgaixcbiAgICAgICAgICAgIGpqLFxuICAgICAgICAgICAgbmVzLFxuICAgICAgICAgICAgZXMgPSBbZV0sXG4gICAgICAgICAgICBvdXQgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMCwgaWkgPSBuYW1lcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICBuZXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoaiA9IDAsIGpqID0gZXMubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgICAgIGUgPSBlc1tqXS5uO1xuICAgICAgICAgICAgICAgIGl0ZW1zID0gW2VbbmFtZXNbaV1dLCBlW3dpbGRjYXJkXV07XG4gICAgICAgICAgICAgICAgayA9IDI7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGstLSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtID0gaXRlbXNba107XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dCA9IG91dC5jb25jYXQoaXRlbS5mIHx8IFtdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVzID0gbmVzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcbiAgICBcbiAgICAvKlxcXG4gICAgICogZXZlLm9uXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBCaW5kcyBnaXZlbiBldmVudCBoYW5kbGVyIHdpdGggYSBnaXZlbiBuYW1lLiBZb3UgY2FuIHVzZSB3aWxkY2FyZHMg4oCcYCpg4oCdIGZvciB0aGUgbmFtZXM6XG4gICAgIHwgZXZlLm9uKFwiKi51bmRlci4qXCIsIGYpO1xuICAgICB8IGV2ZShcIm1vdXNlLnVuZGVyLmZsb29yXCIpOyAvLyB0cmlnZ2VycyBmXG4gICAgICogVXNlIEBldmUgdG8gdHJpZ2dlciB0aGUgbGlzdGVuZXIuXG4gICAgICoqXG4gICAgID4gQXJndW1lbnRzXG4gICAgICoqXG4gICAgIC0gbmFtZSAoc3RyaW5nKSBuYW1lIG9mIHRoZSBldmVudCwgZG90IChgLmApIG9yIHNsYXNoIChgL2ApIHNlcGFyYXRlZCwgd2l0aCBvcHRpb25hbCB3aWxkY2FyZHNcbiAgICAgLSBmIChmdW5jdGlvbikgZXZlbnQgaGFuZGxlciBmdW5jdGlvblxuICAgICAqKlxuICAgICA9IChmdW5jdGlvbikgcmV0dXJuZWQgZnVuY3Rpb24gYWNjZXB0cyBhIHNpbmdsZSBudW1lcmljIHBhcmFtZXRlciB0aGF0IHJlcHJlc2VudHMgei1pbmRleCBvZiB0aGUgaGFuZGxlci4gSXQgaXMgYW4gb3B0aW9uYWwgZmVhdHVyZSBhbmQgb25seSB1c2VkIHdoZW4geW91IG5lZWQgdG8gZW5zdXJlIHRoYXQgc29tZSBzdWJzZXQgb2YgaGFuZGxlcnMgd2lsbCBiZSBpbnZva2VkIGluIGEgZ2l2ZW4gb3JkZXIsIGRlc3BpdGUgb2YgdGhlIG9yZGVyIG9mIGFzc2lnbm1lbnQuIFxuICAgICA+IEV4YW1wbGU6XG4gICAgIHwgZXZlLm9uKFwibW91c2VcIiwgZWF0SXQpKDIpO1xuICAgICB8IGV2ZS5vbihcIm1vdXNlXCIsIHNjcmVhbSk7XG4gICAgIHwgZXZlLm9uKFwibW91c2VcIiwgY2F0Y2hJdCkoMSk7XG4gICAgICogVGhpcyB3aWxsIGVuc3VyZSB0aGF0IGBjYXRjaEl0KClgIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGJlZm9yZSBgZWF0SXQoKWAuXG5cdCAqXG4gICAgICogSWYgeW91IHdhbnQgdG8gcHV0IHlvdXIgaGFuZGxlciBiZWZvcmUgbm9uLWluZGV4ZWQgaGFuZGxlcnMsIHNwZWNpZnkgYSBuZWdhdGl2ZSB2YWx1ZS5cbiAgICAgKiBOb3RlOiBJIGFzc3VtZSBtb3N0IG9mIHRoZSB0aW1lIHlvdSBkb27igJl0IG5lZWQgdG8gd29ycnkgYWJvdXQgei1pbmRleCwgYnV0IGl04oCZcyBuaWNlIHRvIGhhdmUgdGhpcyBmZWF0dXJlIOKAnGp1c3QgaW4gY2FzZeKAnS5cbiAgICBcXCovXG4gICAgZXZlLm9uID0gZnVuY3Rpb24gKG5hbWUsIGYpIHtcblx0XHRuYW1lID0gU3RyaW5nKG5hbWUpO1xuXHRcdGlmICh0eXBlb2YgZiAhPSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbiAoKSB7fTtcblx0XHR9XG4gICAgICAgIHZhciBuYW1lcyA9IG5hbWUuc3BsaXQoc2VwYXJhdG9yKSxcbiAgICAgICAgICAgIGUgPSBldmVudHM7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IG5hbWVzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgIGUgPSBlLm47XG4gICAgICAgICAgICBlID0gZS5oYXNPd25Qcm9wZXJ0eShuYW1lc1tpXSkgJiYgZVtuYW1lc1tpXV0gfHwgKGVbbmFtZXNbaV1dID0ge246IHt9fSk7XG4gICAgICAgIH1cbiAgICAgICAgZS5mID0gZS5mIHx8IFtdO1xuICAgICAgICBmb3IgKGkgPSAwLCBpaSA9IGUuZi5sZW5ndGg7IGkgPCBpaTsgaSsrKSBpZiAoZS5mW2ldID09IGYpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW47XG4gICAgICAgIH1cbiAgICAgICAgZS5mLnB1c2goZik7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoekluZGV4KSB7XG4gICAgICAgICAgICBpZiAoK3pJbmRleCA9PSArekluZGV4KSB7XG4gICAgICAgICAgICAgICAgZi56SW5kZXggPSArekluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIGV2ZS5mXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIGZ1bmN0aW9uIHRoYXQgd2lsbCBmaXJlIGdpdmVuIGV2ZW50IHdpdGggb3B0aW9uYWwgYXJndW1lbnRzLlxuXHQgKiBBcmd1bWVudHMgdGhhdCB3aWxsIGJlIHBhc3NlZCB0byB0aGUgcmVzdWx0IGZ1bmN0aW9uIHdpbGwgYmUgYWxzb1xuXHQgKiBjb25jYXRlZCB0byB0aGUgbGlzdCBvZiBmaW5hbCBhcmd1bWVudHMuXG4gXHQgfCBlbC5vbmNsaWNrID0gZXZlLmYoXCJjbGlja1wiLCAxLCAyKTtcbiBcdCB8IGV2ZS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gXHQgfCAgICAgY29uc29sZS5sb2coYSwgYiwgYyk7IC8vIDEsIDIsIFtldmVudCBvYmplY3RdXG4gXHQgfCB9KTtcbiAgICAgPiBBcmd1bWVudHNcblx0IC0gZXZlbnQgKHN0cmluZykgZXZlbnQgbmFtZVxuXHQgLSB2YXJhcmdzICjigKYpIGFuZCBhbnkgb3RoZXIgYXJndW1lbnRzXG5cdCA9IChmdW5jdGlvbikgcG9zc2libGUgZXZlbnQgaGFuZGxlciBmdW5jdGlvblxuICAgIFxcKi9cblx0ZXZlLmYgPSBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHR2YXIgYXR0cnMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHRcdGV2ZS5hcHBseShudWxsLCBbZXZlbnQsIG51bGxdLmNvbmNhdChhdHRycykuY29uY2F0KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSkpO1xuXHRcdH07XG5cdH07XG4gICAgLypcXFxuICAgICAqIGV2ZS5zdG9wXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBJcyB1c2VkIGluc2lkZSBhbiBldmVudCBoYW5kbGVyIHRvIHN0b3AgdGhlIGV2ZW50LCBwcmV2ZW50aW5nIGFueSBzdWJzZXF1ZW50IGxpc3RlbmVycyBmcm9tIGZpcmluZy5cbiAgICBcXCovXG4gICAgZXZlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0b3AgPSAxO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIGV2ZS5udFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ291bGQgYmUgdXNlZCBpbnNpZGUgZXZlbnQgaGFuZGxlciB0byBmaWd1cmUgb3V0IGFjdHVhbCBuYW1lIG9mIHRoZSBldmVudC5cbiAgICAgKipcbiAgICAgPiBBcmd1bWVudHNcbiAgICAgKipcbiAgICAgLSBzdWJuYW1lIChzdHJpbmcpICNvcHRpb25hbCBzdWJuYW1lIG9mIHRoZSBldmVudFxuICAgICAqKlxuICAgICA9IChzdHJpbmcpIG5hbWUgb2YgdGhlIGV2ZW50LCBpZiBgc3VibmFtZWAgaXMgbm90IHNwZWNpZmllZFxuICAgICAqIG9yXG4gICAgID0gKGJvb2xlYW4pIGB0cnVlYCwgaWYgY3VycmVudCBldmVudOKAmXMgbmFtZSBjb250YWlucyBgc3VibmFtZWBcbiAgICBcXCovXG4gICAgZXZlLm50ID0gZnVuY3Rpb24gKHN1Ym5hbWUpIHtcbiAgICAgICAgaWYgKHN1Ym5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKFwiKD86XFxcXC58XFxcXC98XilcIiArIHN1Ym5hbWUgKyBcIig/OlxcXFwufFxcXFwvfCQpXCIpLnRlc3QoY3VycmVudF9ldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN1cnJlbnRfZXZlbnQ7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogZXZlLm50c1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ291bGQgYmUgdXNlZCBpbnNpZGUgZXZlbnQgaGFuZGxlciB0byBmaWd1cmUgb3V0IGFjdHVhbCBuYW1lIG9mIHRoZSBldmVudC5cbiAgICAgKipcbiAgICAgKipcbiAgICAgPSAoYXJyYXkpIG5hbWVzIG9mIHRoZSBldmVudFxuICAgIFxcKi9cbiAgICBldmUubnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY3VycmVudF9ldmVudC5zcGxpdChzZXBhcmF0b3IpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIGV2ZS5vZmZcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZ2l2ZW4gZnVuY3Rpb24gZnJvbSB0aGUgbGlzdCBvZiBldmVudCBsaXN0ZW5lcnMgYXNzaWduZWQgdG8gZ2l2ZW4gbmFtZS5cblx0ICogSWYgbm8gYXJndW1lbnRzIHNwZWNpZmllZCBhbGwgdGhlIGV2ZW50cyB3aWxsIGJlIGNsZWFyZWQuXG4gICAgICoqXG4gICAgID4gQXJndW1lbnRzXG4gICAgICoqXG4gICAgIC0gbmFtZSAoc3RyaW5nKSBuYW1lIG9mIHRoZSBldmVudCwgZG90IChgLmApIG9yIHNsYXNoIChgL2ApIHNlcGFyYXRlZCwgd2l0aCBvcHRpb25hbCB3aWxkY2FyZHNcbiAgICAgLSBmIChmdW5jdGlvbikgZXZlbnQgaGFuZGxlciBmdW5jdGlvblxuICAgIFxcKi9cbiAgICAvKlxcXG4gICAgICogZXZlLnVuYmluZFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogU2VlIEBldmUub2ZmXG4gICAgXFwqL1xuICAgIGV2ZS5vZmYgPSBldmUudW5iaW5kID0gZnVuY3Rpb24gKG5hbWUsIGYpIHtcblx0XHRpZiAoIW5hbWUpIHtcblx0XHQgICAgZXZlLl9ldmVudHMgPSBldmVudHMgPSB7bjoge319O1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cbiAgICAgICAgdmFyIG5hbWVzID0gbmFtZS5zcGxpdChzZXBhcmF0b3IpLFxuICAgICAgICAgICAgZSxcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIHNwbGljZSxcbiAgICAgICAgICAgIGksIGlpLCBqLCBqaixcbiAgICAgICAgICAgIGN1ciA9IFtldmVudHNdO1xuICAgICAgICBmb3IgKGkgPSAwLCBpaSA9IG5hbWVzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBjdXIubGVuZ3RoOyBqICs9IHNwbGljZS5sZW5ndGggLSAyKSB7XG4gICAgICAgICAgICAgICAgc3BsaWNlID0gW2osIDFdO1xuICAgICAgICAgICAgICAgIGUgPSBjdXJbal0ubjtcbiAgICAgICAgICAgICAgICBpZiAobmFtZXNbaV0gIT0gd2lsZGNhcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVbbmFtZXNbaV1dKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGxpY2UucHVzaChlW25hbWVzW2ldXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBlKSBpZiAoZVtoYXNdKGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwbGljZS5wdXNoKGVba2V5XSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3VyLnNwbGljZS5hcHBseShjdXIsIHNwbGljZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMCwgaWkgPSBjdXIubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgZSA9IGN1cltpXTtcbiAgICAgICAgICAgIHdoaWxlIChlLm4pIHtcbiAgICAgICAgICAgICAgICBpZiAoZikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS5mKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwLCBqaiA9IGUuZi5sZW5ndGg7IGogPCBqajsgaisrKSBpZiAoZS5mW2pdID09IGYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLmYuc3BsaWNlKGosIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgIWUuZi5sZW5ndGggJiYgZGVsZXRlIGUuZjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBlLm4pIGlmIChlLm5baGFzXShrZXkpICYmIGUubltrZXldLmYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmdW5jcyA9IGUubltrZXldLmY7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAwLCBqaiA9IGZ1bmNzLmxlbmd0aDsgaiA8IGpqOyBqKyspIGlmIChmdW5jc1tqXSA9PSBmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Muc3BsaWNlKGosIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgIWZ1bmNzLmxlbmd0aCAmJiBkZWxldGUgZS5uW2tleV0uZjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBlLmY7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIGUubikgaWYgKGUubltoYXNdKGtleSkgJiYgZS5uW2tleV0uZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGUubltrZXldLmY7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZSA9IGUubjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgLypcXFxuICAgICAqIGV2ZS5vbmNlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBCaW5kcyBnaXZlbiBldmVudCBoYW5kbGVyIHdpdGggYSBnaXZlbiBuYW1lIHRvIG9ubHkgcnVuIG9uY2UgdGhlbiB1bmJpbmQgaXRzZWxmLlxuICAgICB8IGV2ZS5vbmNlKFwibG9naW5cIiwgZik7XG4gICAgIHwgZXZlKFwibG9naW5cIik7IC8vIHRyaWdnZXJzIGZcbiAgICAgfCBldmUoXCJsb2dpblwiKTsgLy8gbm8gbGlzdGVuZXJzXG4gICAgICogVXNlIEBldmUgdG8gdHJpZ2dlciB0aGUgbGlzdGVuZXIuXG4gICAgICoqXG4gICAgID4gQXJndW1lbnRzXG4gICAgICoqXG4gICAgIC0gbmFtZSAoc3RyaW5nKSBuYW1lIG9mIHRoZSBldmVudCwgZG90IChgLmApIG9yIHNsYXNoIChgL2ApIHNlcGFyYXRlZCwgd2l0aCBvcHRpb25hbCB3aWxkY2FyZHNcbiAgICAgLSBmIChmdW5jdGlvbikgZXZlbnQgaGFuZGxlciBmdW5jdGlvblxuICAgICAqKlxuICAgICA9IChmdW5jdGlvbikgc2FtZSByZXR1cm4gZnVuY3Rpb24gYXMgQGV2ZS5vblxuICAgIFxcKi9cbiAgICBldmUub25jZSA9IGZ1bmN0aW9uIChuYW1lLCBmKSB7XG4gICAgICAgIHZhciBmMiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGV2ZS51bmJpbmQobmFtZSwgZjIpO1xuICAgICAgICAgICAgcmV0dXJuIGYuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGV2ZS5vbihuYW1lLCBmMik7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogZXZlLnZlcnNpb25cbiAgICAgWyBwcm9wZXJ0eSAoc3RyaW5nKSBdXG4gICAgICoqXG4gICAgICogQ3VycmVudCB2ZXJzaW9uIG9mIHRoZSBsaWJyYXJ5LlxuICAgIFxcKi9cbiAgICBldmUudmVyc2lvbiA9IHZlcnNpb247XG4gICAgZXZlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gXCJZb3UgYXJlIHJ1bm5pbmcgRXZlIFwiICsgdmVyc2lvbjtcbiAgICB9O1xuICAgICh0eXBlb2YgbW9kdWxlICE9IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlLmV4cG9ydHMpID8gKG1vZHVsZS5leHBvcnRzID0gZXZlKSA6ICh0eXBlb2YgZGVmaW5lICE9IFwidW5kZWZpbmVkXCIgPyAoZGVmaW5lKFwiZXZlXCIsIFtdLCBmdW5jdGlvbigpIHsgcmV0dXJuIGV2ZTsgfSkpIDogKGdsb2IuZXZlID0gZXZlKSk7XG59KSh0aGlzKTtcbiIsIi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkCBcXFxcXG4vLyDilIIgXCJSYXBoYcOrbCAyLjEuMFwiIC0gSmF2YVNjcmlwdCBWZWN0b3IgTGlicmFyeSAgICAgICAgICAgICAgICAgICAgICAgICDilIIgXFxcXFxuLy8g4pSc4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkIFxcXFxcbi8vIOKUgiBDb3B5cmlnaHQgKGMpIDIwMDgtMjAxMSBEbWl0cnkgQmFyYW5vdnNraXkgKGh0dHA6Ly9yYXBoYWVsanMuY29tKSAgIOKUgiBcXFxcXG4vLyDilIIgQ29weXJpZ2h0IChjKSAyMDA4LTIwMTEgU2VuY2hhIExhYnMgKGh0dHA6Ly9zZW5jaGEuY29tKSAgICAgICAgICAgICDilIIgXFxcXFxuLy8g4pSCIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgKGh0dHA6Ly9yYXBoYWVsanMuY29tL2xpY2Vuc2UuaHRtbCkgbGljZW5zZS4g4pSCIFxcXFxcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmCBcXFxcXG5cbnZhciBldmUgPSByZXF1aXJlKCdldmUnKTtcblxuKGZ1bmN0aW9uICgpIHtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ3JlYXRlcyBhIGNhbnZhcyBvYmplY3Qgb24gd2hpY2ggdG8gZHJhdy5cbiAgICAgKiBZb3UgbXVzdCBkbyB0aGlzIGZpcnN0LCBhcyBhbGwgZnV0dXJlIGNhbGxzIHRvIGRyYXdpbmcgbWV0aG9kc1xuICAgICAqIGZyb20gdGhpcyBpbnN0YW5jZSB3aWxsIGJlIGJvdW5kIHRvIHRoaXMgY2FudmFzLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBjb250YWluZXIgKEhUTUxFbGVtZW50fHN0cmluZykgRE9NIGVsZW1lbnQgb3IgaXRzIElEIHdoaWNoIGlzIGdvaW5nIHRvIGJlIGEgcGFyZW50IGZvciBkcmF3aW5nIHN1cmZhY2VcbiAgICAgLSB3aWR0aCAobnVtYmVyKVxuICAgICAtIGhlaWdodCAobnVtYmVyKVxuICAgICAtIGNhbGxiYWNrIChmdW5jdGlvbikgI29wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIHdoaWNoIGlzIGdvaW5nIHRvIGJlIGV4ZWN1dGVkIGluIHRoZSBjb250ZXh0IG9mIG5ld2x5IGNyZWF0ZWQgcGFwZXJcbiAgICAgKiBvclxuICAgICAtIHggKG51bWJlcilcbiAgICAgLSB5IChudW1iZXIpXG4gICAgIC0gd2lkdGggKG51bWJlcilcbiAgICAgLSBoZWlnaHQgKG51bWJlcilcbiAgICAgLSBjYWxsYmFjayAoZnVuY3Rpb24pICNvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB3aGljaCBpcyBnb2luZyB0byBiZSBleGVjdXRlZCBpbiB0aGUgY29udGV4dCBvZiBuZXdseSBjcmVhdGVkIHBhcGVyXG4gICAgICogb3JcbiAgICAgLSBhbGwgKGFycmF5KSAoZmlyc3QgMyBvciA0IGVsZW1lbnRzIGluIHRoZSBhcnJheSBhcmUgZXF1YWwgdG8gW2NvbnRhaW5lcklELCB3aWR0aCwgaGVpZ2h0XSBvciBbeCwgeSwgd2lkdGgsIGhlaWdodF0uIFRoZSByZXN0IGFyZSBlbGVtZW50IGRlc2NyaXB0aW9ucyBpbiBmb3JtYXQge3R5cGU6IHR5cGUsIDxhdHRyaWJ1dGVzPn0pLiBTZWUgQFBhcGVyLmFkZC5cbiAgICAgLSBjYWxsYmFjayAoZnVuY3Rpb24pICNvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB3aGljaCBpcyBnb2luZyB0byBiZSBleGVjdXRlZCBpbiB0aGUgY29udGV4dCBvZiBuZXdseSBjcmVhdGVkIHBhcGVyXG4gICAgICogb3JcbiAgICAgLSBvblJlYWR5Q2FsbGJhY2sgKGZ1bmN0aW9uKSBmdW5jdGlvbiB0aGF0IGlzIGdvaW5nIHRvIGJlIGNhbGxlZCBvbiBET00gcmVhZHkgZXZlbnQuIFlvdSBjYW4gYWxzbyBzdWJzY3JpYmUgdG8gdGhpcyBldmVudCB2aWEgRXZl4oCZcyDigJxET01Mb2Fk4oCdIGV2ZW50LiBJbiB0aGlzIGNhc2UgbWV0aG9kIHJldHVybnMgYHVuZGVmaW5lZGAuXG4gICAgID0gKG9iamVjdCkgQFBhcGVyXG4gICAgID4gVXNhZ2VcbiAgICAgfCAvLyBFYWNoIG9mIHRoZSBmb2xsb3dpbmcgZXhhbXBsZXMgY3JlYXRlIGEgY2FudmFzXG4gICAgIHwgLy8gdGhhdCBpcyAzMjBweCB3aWRlIGJ5IDIwMHB4IGhpZ2guXG4gICAgIHwgLy8gQ2FudmFzIGlzIGNyZWF0ZWQgYXQgdGhlIHZpZXdwb3J04oCZcyAxMCw1MCBjb29yZGluYXRlLlxuICAgICB8IHZhciBwYXBlciA9IFJhcGhhZWwoMTAsIDUwLCAzMjAsIDIwMCk7XG4gICAgIHwgLy8gQ2FudmFzIGlzIGNyZWF0ZWQgYXQgdGhlIHRvcCBsZWZ0IGNvcm5lciBvZiB0aGUgI25vdGVwYWQgZWxlbWVudFxuICAgICB8IC8vIChvciBpdHMgdG9wIHJpZ2h0IGNvcm5lciBpbiBkaXI9XCJydGxcIiBlbGVtZW50cylcbiAgICAgfCB2YXIgcGFwZXIgPSBSYXBoYWVsKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibm90ZXBhZFwiKSwgMzIwLCAyMDApO1xuICAgICB8IC8vIFNhbWUgYXMgYWJvdmVcbiAgICAgfCB2YXIgcGFwZXIgPSBSYXBoYWVsKFwibm90ZXBhZFwiLCAzMjAsIDIwMCk7XG4gICAgIHwgLy8gSW1hZ2UgZHVtcFxuICAgICB8IHZhciBzZXQgPSBSYXBoYWVsKFtcIm5vdGVwYWRcIiwgMzIwLCAyMDAsIHtcbiAgICAgfCAgICAgdHlwZTogXCJyZWN0XCIsXG4gICAgIHwgICAgIHg6IDEwLFxuICAgICB8ICAgICB5OiAxMCxcbiAgICAgfCAgICAgd2lkdGg6IDI1LFxuICAgICB8ICAgICBoZWlnaHQ6IDI1LFxuICAgICB8ICAgICBzdHJva2U6IFwiI2YwMFwiXG4gICAgIHwgfSwge1xuICAgICB8ICAgICB0eXBlOiBcInRleHRcIixcbiAgICAgfCAgICAgeDogMzAsXG4gICAgIHwgICAgIHk6IDQwLFxuICAgICB8ICAgICB0ZXh0OiBcIkR1bXBcIlxuICAgICB8IH1dKTtcbiAgICBcXCovXG4gICAgZnVuY3Rpb24gUihmaXJzdCkge1xuICAgICAgICBpZiAoUi5pcyhmaXJzdCwgXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIGxvYWRlZCA/IGZpcnN0KCkgOiBldmUub24oXCJyYXBoYWVsLkRPTWxvYWRcIiwgZmlyc3QpO1xuICAgICAgICB9IGVsc2UgaWYgKFIuaXMoZmlyc3QsIGFycmF5KSkge1xuICAgICAgICAgICAgcmV0dXJuIFIuX2VuZ2luZS5jcmVhdGVbYXBwbHldKFIsIGZpcnN0LnNwbGljZSgwLCAzICsgUi5pcyhmaXJzdFswXSwgbnUpKSkuYWRkKGZpcnN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAgICAgICAgIGlmIChSLmlzKGFyZ3NbYXJncy5sZW5ndGggLSAxXSwgXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHZhciBmID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbG9hZGVkID8gZi5jYWxsKFIuX2VuZ2luZS5jcmVhdGVbYXBwbHldKFIsIGFyZ3MpKSA6IGV2ZS5vbihcInJhcGhhZWwuRE9NbG9hZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGYuY2FsbChSLl9lbmdpbmUuY3JlYXRlW2FwcGx5XShSLCBhcmdzKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBSLl9lbmdpbmUuY3JlYXRlW2FwcGx5XShSLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFIudmVyc2lvbiA9IFwiMi4xLjBcIjtcbiAgICBSLmV2ZSA9IGV2ZTtcbiAgICB2YXIgbG9hZGVkLFxuICAgICAgICBzZXBhcmF0b3IgPSAvWywgXSsvLFxuICAgICAgICBlbGVtZW50cyA9IHtjaXJjbGU6IDEsIHJlY3Q6IDEsIHBhdGg6IDEsIGVsbGlwc2U6IDEsIHRleHQ6IDEsIGltYWdlOiAxfSxcbiAgICAgICAgZm9ybWF0cmcgPSAvXFx7KFxcZCspXFx9L2csXG4gICAgICAgIHByb3RvID0gXCJwcm90b3R5cGVcIixcbiAgICAgICAgaGFzID0gXCJoYXNPd25Qcm9wZXJ0eVwiLFxuICAgICAgICBnID0ge1xuICAgICAgICAgICAgZG9jOiBkb2N1bWVudCxcbiAgICAgICAgICAgIHdpbjogd2luZG93XG4gICAgICAgIH0sXG4gICAgICAgIG9sZFJhcGhhZWwgPSB7XG4gICAgICAgICAgICB3YXM6IE9iamVjdC5wcm90b3R5cGVbaGFzXS5jYWxsKGcud2luLCBcIlJhcGhhZWxcIiksXG4gICAgICAgICAgICBpczogZy53aW4uUmFwaGFlbFxuICAgICAgICB9LFxuICAgICAgICBQYXBlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8qXFxcbiAgICAgICAgICAgICAqIFBhcGVyLmNhXG4gICAgICAgICAgICAgWyBwcm9wZXJ0eSAob2JqZWN0KSBdXG4gICAgICAgICAgICAgKipcbiAgICAgICAgICAgICAqIFNob3J0Y3V0IGZvciBAUGFwZXIuY3VzdG9tQXR0cmlidXRlc1xuICAgICAgICAgICAgXFwqL1xuICAgICAgICAgICAgLypcXFxuICAgICAgICAgICAgICogUGFwZXIuY3VzdG9tQXR0cmlidXRlc1xuICAgICAgICAgICAgIFsgcHJvcGVydHkgKG9iamVjdCkgXVxuICAgICAgICAgICAgICoqXG4gICAgICAgICAgICAgKiBJZiB5b3UgaGF2ZSBhIHNldCBvZiBhdHRyaWJ1dGVzIHRoYXQgeW91IHdvdWxkIGxpa2UgdG8gcmVwcmVzZW50XG4gICAgICAgICAgICAgKiBhcyBhIGZ1bmN0aW9uIG9mIHNvbWUgbnVtYmVyIHlvdSBjYW4gZG8gaXQgZWFzaWx5IHdpdGggY3VzdG9tIGF0dHJpYnV0ZXM6XG4gICAgICAgICAgICAgPiBVc2FnZVxuICAgICAgICAgICAgIHwgcGFwZXIuY3VzdG9tQXR0cmlidXRlcy5odWUgPSBmdW5jdGlvbiAobnVtKSB7XG4gICAgICAgICAgICAgfCAgICAgbnVtID0gbnVtICUgMTtcbiAgICAgICAgICAgICB8ICAgICByZXR1cm4ge2ZpbGw6IFwiaHNiKFwiICsgbnVtICsgXCIsIDAuNzUsIDEpXCJ9O1xuICAgICAgICAgICAgIHwgfTtcbiAgICAgICAgICAgICB8IC8vIEN1c3RvbSBhdHRyaWJ1dGUg4oCcaHVl4oCdIHdpbGwgY2hhbmdlIGZpbGxcbiAgICAgICAgICAgICB8IC8vIHRvIGJlIGdpdmVuIGh1ZSB3aXRoIGZpeGVkIHNhdHVyYXRpb24gYW5kIGJyaWdodG5lc3MuXG4gICAgICAgICAgICAgfCAvLyBOb3cgeW91IGNhbiB1c2UgaXQgbGlrZSB0aGlzOlxuICAgICAgICAgICAgIHwgdmFyIGMgPSBwYXBlci5jaXJjbGUoMTAsIDEwLCAxMCkuYXR0cih7aHVlOiAuNDV9KTtcbiAgICAgICAgICAgICB8IC8vIG9yIGV2ZW4gbGlrZSB0aGlzOlxuICAgICAgICAgICAgIHwgYy5hbmltYXRlKHtodWU6IDF9LCAxZTMpO1xuICAgICAgICAgICAgIHwgXG4gICAgICAgICAgICAgfCAvLyBZb3UgY291bGQgYWxzbyBjcmVhdGUgY3VzdG9tIGF0dHJpYnV0ZVxuICAgICAgICAgICAgIHwgLy8gd2l0aCBtdWx0aXBsZSBwYXJhbWV0ZXJzOlxuICAgICAgICAgICAgIHwgcGFwZXIuY3VzdG9tQXR0cmlidXRlcy5oc2IgPSBmdW5jdGlvbiAoaCwgcywgYikge1xuICAgICAgICAgICAgIHwgICAgIHJldHVybiB7ZmlsbDogXCJoc2IoXCIgKyBbaCwgcywgYl0uam9pbihcIixcIikgKyBcIilcIn07XG4gICAgICAgICAgICAgfCB9O1xuICAgICAgICAgICAgIHwgYy5hdHRyKHtoc2I6IFwiMC41IC44IDFcIn0pO1xuICAgICAgICAgICAgIHwgYy5hbmltYXRlKHtoc2I6IFsxLCAwLCAwLjVdfSwgMWUzKTtcbiAgICAgICAgICAgIFxcKi9cbiAgICAgICAgICAgIHRoaXMuY2EgPSB0aGlzLmN1c3RvbUF0dHJpYnV0ZXMgPSB7fTtcbiAgICAgICAgfSxcbiAgICAgICAgcGFwZXJwcm90byxcbiAgICAgICAgYXBwZW5kQ2hpbGQgPSBcImFwcGVuZENoaWxkXCIsXG4gICAgICAgIGFwcGx5ID0gXCJhcHBseVwiLFxuICAgICAgICBjb25jYXQgPSBcImNvbmNhdFwiLFxuICAgICAgICBzdXBwb3J0c1RvdWNoID0gXCJjcmVhdGVUb3VjaFwiIGluIGcuZG9jLFxuICAgICAgICBFID0gXCJcIixcbiAgICAgICAgUyA9IFwiIFwiLFxuICAgICAgICBTdHIgPSBTdHJpbmcsXG4gICAgICAgIHNwbGl0ID0gXCJzcGxpdFwiLFxuICAgICAgICBldmVudHMgPSBcImNsaWNrIGRibGNsaWNrIG1vdXNlZG93biBtb3VzZW1vdmUgbW91c2VvdXQgbW91c2VvdmVyIG1vdXNldXAgdG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgdG91Y2hjYW5jZWxcIltzcGxpdF0oUyksXG4gICAgICAgIHRvdWNoTWFwID0ge1xuICAgICAgICAgICAgbW91c2Vkb3duOiBcInRvdWNoc3RhcnRcIixcbiAgICAgICAgICAgIG1vdXNlbW92ZTogXCJ0b3VjaG1vdmVcIixcbiAgICAgICAgICAgIG1vdXNldXA6IFwidG91Y2hlbmRcIlxuICAgICAgICB9LFxuICAgICAgICBsb3dlckNhc2UgPSBTdHIucHJvdG90eXBlLnRvTG93ZXJDYXNlLFxuICAgICAgICBtYXRoID0gTWF0aCxcbiAgICAgICAgbW1heCA9IG1hdGgubWF4LFxuICAgICAgICBtbWluID0gbWF0aC5taW4sXG4gICAgICAgIGFicyA9IG1hdGguYWJzLFxuICAgICAgICBwb3cgPSBtYXRoLnBvdyxcbiAgICAgICAgUEkgPSBtYXRoLlBJLFxuICAgICAgICBudSA9IFwibnVtYmVyXCIsXG4gICAgICAgIHN0cmluZyA9IFwic3RyaW5nXCIsXG4gICAgICAgIGFycmF5ID0gXCJhcnJheVwiLFxuICAgICAgICB0b1N0cmluZyA9IFwidG9TdHJpbmdcIixcbiAgICAgICAgZmlsbFN0cmluZyA9IFwiZmlsbFwiLFxuICAgICAgICBvYmplY3RUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgICAgIHBhcGVyID0ge30sXG4gICAgICAgIHB1c2ggPSBcInB1c2hcIixcbiAgICAgICAgSVNVUkwgPSBSLl9JU1VSTCA9IC9edXJsXFwoWydcIl0/KFteXFwpXSs/KVsnXCJdP1xcKSQvaSxcbiAgICAgICAgY29sb3VyUmVnRXhwID0gL15cXHMqKCgjW2EtZlxcZF17Nn0pfCgjW2EtZlxcZF17M30pfHJnYmE/XFwoXFxzKihbXFxkXFwuXSslP1xccyosXFxzKltcXGRcXC5dKyU/XFxzKixcXHMqW1xcZFxcLl0rJT8oPzpcXHMqLFxccypbXFxkXFwuXSslPyk/KVxccypcXCl8aHNiYT9cXChcXHMqKFtcXGRcXC5dKyg/OmRlZ3xcXHhiMHwlKT9cXHMqLFxccypbXFxkXFwuXSslP1xccyosXFxzKltcXGRcXC5dKyg/OiU/XFxzKixcXHMqW1xcZFxcLl0rKT8pJT9cXHMqXFwpfGhzbGE/XFwoXFxzKihbXFxkXFwuXSsoPzpkZWd8XFx4YjB8JSk/XFxzKixcXHMqW1xcZFxcLl0rJT9cXHMqLFxccypbXFxkXFwuXSsoPzolP1xccyosXFxzKltcXGRcXC5dKyk/KSU/XFxzKlxcKSlcXHMqJC9pLFxuICAgICAgICBpc25hbiA9IHtcIk5hTlwiOiAxLCBcIkluZmluaXR5XCI6IDEsIFwiLUluZmluaXR5XCI6IDF9LFxuICAgICAgICBiZXppZXJyZyA9IC9eKD86Y3ViaWMtKT9iZXppZXJcXCgoW14sXSspLChbXixdKyksKFteLF0rKSwoW15cXCldKylcXCkvLFxuICAgICAgICByb3VuZCA9IG1hdGgucm91bmQsXG4gICAgICAgIHNldEF0dHJpYnV0ZSA9IFwic2V0QXR0cmlidXRlXCIsXG4gICAgICAgIHRvRmxvYXQgPSBwYXJzZUZsb2F0LFxuICAgICAgICB0b0ludCA9IHBhcnNlSW50LFxuICAgICAgICB1cHBlckNhc2UgPSBTdHIucHJvdG90eXBlLnRvVXBwZXJDYXNlLFxuICAgICAgICBhdmFpbGFibGVBdHRycyA9IFIuX2F2YWlsYWJsZUF0dHJzID0ge1xuICAgICAgICAgICAgXCJhcnJvdy1lbmRcIjogXCJub25lXCIsXG4gICAgICAgICAgICBcImFycm93LXN0YXJ0XCI6IFwibm9uZVwiLFxuICAgICAgICAgICAgYmx1cjogMCxcbiAgICAgICAgICAgIFwiY2xpcC1yZWN0XCI6IFwiMCAwIDFlOSAxZTlcIixcbiAgICAgICAgICAgIGN1cnNvcjogXCJkZWZhdWx0XCIsXG4gICAgICAgICAgICBjeDogMCxcbiAgICAgICAgICAgIGN5OiAwLFxuICAgICAgICAgICAgZmlsbDogXCIjZmZmXCIsXG4gICAgICAgICAgICBcImZpbGwtb3BhY2l0eVwiOiAxLFxuICAgICAgICAgICAgZm9udDogJzEwcHggXCJBcmlhbFwiJyxcbiAgICAgICAgICAgIFwiZm9udC1mYW1pbHlcIjogJ1wiQXJpYWxcIicsXG4gICAgICAgICAgICBcImZvbnQtc2l6ZVwiOiBcIjEwXCIsXG4gICAgICAgICAgICBcImZvbnQtc3R5bGVcIjogXCJub3JtYWxcIixcbiAgICAgICAgICAgIFwiZm9udC13ZWlnaHRcIjogNDAwLFxuICAgICAgICAgICAgZ3JhZGllbnQ6IDAsXG4gICAgICAgICAgICBoZWlnaHQ6IDAsXG4gICAgICAgICAgICBocmVmOiBcImh0dHA6Ly9yYXBoYWVsanMuY29tL1wiLFxuICAgICAgICAgICAgXCJsZXR0ZXItc3BhY2luZ1wiOiAwLFxuICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgIHBhdGg6IFwiTTAsMFwiLFxuICAgICAgICAgICAgcjogMCxcbiAgICAgICAgICAgIHJ4OiAwLFxuICAgICAgICAgICAgcnk6IDAsXG4gICAgICAgICAgICBzcmM6IFwiXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwiIzAwMFwiLFxuICAgICAgICAgICAgXCJzdHJva2UtZGFzaGFycmF5XCI6IFwiXCIsXG4gICAgICAgICAgICBcInN0cm9rZS1saW5lY2FwXCI6IFwiYnV0dFwiLFxuICAgICAgICAgICAgXCJzdHJva2UtbGluZWpvaW5cIjogXCJidXR0XCIsXG4gICAgICAgICAgICBcInN0cm9rZS1taXRlcmxpbWl0XCI6IDAsXG4gICAgICAgICAgICBcInN0cm9rZS1vcGFjaXR5XCI6IDEsXG4gICAgICAgICAgICBcInN0cm9rZS13aWR0aFwiOiAxLFxuICAgICAgICAgICAgdGFyZ2V0OiBcIl9ibGFua1wiLFxuICAgICAgICAgICAgXCJ0ZXh0LWFuY2hvclwiOiBcIm1pZGRsZVwiLFxuICAgICAgICAgICAgdGl0bGU6IFwiUmFwaGFlbFwiLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBcIlwiLFxuICAgICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMFxuICAgICAgICB9LFxuICAgICAgICBhdmFpbGFibGVBbmltQXR0cnMgPSBSLl9hdmFpbGFibGVBbmltQXR0cnMgPSB7XG4gICAgICAgICAgICBibHVyOiBudSxcbiAgICAgICAgICAgIFwiY2xpcC1yZWN0XCI6IFwiY3N2XCIsXG4gICAgICAgICAgICBjeDogbnUsXG4gICAgICAgICAgICBjeTogbnUsXG4gICAgICAgICAgICBmaWxsOiBcImNvbG91clwiLFxuICAgICAgICAgICAgXCJmaWxsLW9wYWNpdHlcIjogbnUsXG4gICAgICAgICAgICBcImZvbnQtc2l6ZVwiOiBudSxcbiAgICAgICAgICAgIGhlaWdodDogbnUsXG4gICAgICAgICAgICBvcGFjaXR5OiBudSxcbiAgICAgICAgICAgIHBhdGg6IFwicGF0aFwiLFxuICAgICAgICAgICAgcjogbnUsXG4gICAgICAgICAgICByeDogbnUsXG4gICAgICAgICAgICByeTogbnUsXG4gICAgICAgICAgICBzdHJva2U6IFwiY29sb3VyXCIsXG4gICAgICAgICAgICBcInN0cm9rZS1vcGFjaXR5XCI6IG51LFxuICAgICAgICAgICAgXCJzdHJva2Utd2lkdGhcIjogbnUsXG4gICAgICAgICAgICB0cmFuc2Zvcm06IFwidHJhbnNmb3JtXCIsXG4gICAgICAgICAgICB3aWR0aDogbnUsXG4gICAgICAgICAgICB4OiBudSxcbiAgICAgICAgICAgIHk6IG51XG4gICAgICAgIH0sXG4gICAgICAgIHdoaXRlc3BhY2UgPSAvW1xceDA5XFx4MGFcXHgwYlxceDBjXFx4MGRcXHgyMFxceGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XS9nLFxuICAgICAgICBjb21tYVNwYWNlcyA9IC9bXFx4MDlcXHgwYVxceDBiXFx4MGNcXHgwZFxceDIwXFx4YTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjldKixbXFx4MDlcXHgwYVxceDBiXFx4MGNcXHgwZFxceDIwXFx4YTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjldKi8sXG4gICAgICAgIGhzcmcgPSB7aHM6IDEsIHJnOiAxfSxcbiAgICAgICAgcDJzID0gLyw/KFthY2hsbXFyc3R2eHpdKSw/L2dpLFxuICAgICAgICBwYXRoQ29tbWFuZCA9IC8oW2FjaGxtcnFzdHZ6XSlbXFx4MDlcXHgwYVxceDBiXFx4MGNcXHgwZFxceDIwXFx4YTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjksXSooKC0/XFxkKlxcLj9cXGQqKD86ZVtcXC0rXT9cXGQrKT9bXFx4MDlcXHgwYVxceDBiXFx4MGNcXHgwZFxceDIwXFx4YTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjldKiw/W1xceDA5XFx4MGFcXHgwYlxceDBjXFx4MGRcXHgyMFxceGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XSopKykvaWcsXG4gICAgICAgIHRDb21tYW5kID0gLyhbcnN0bV0pW1xceDA5XFx4MGFcXHgwYlxceDBjXFx4MGRcXHgyMFxceGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5LF0qKCgtP1xcZCpcXC4/XFxkKig/OmVbXFwtK10/XFxkKyk/W1xceDA5XFx4MGFcXHgwYlxceDBjXFx4MGRcXHgyMFxceGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XSosP1tcXHgwOVxceDBhXFx4MGJcXHgwY1xceDBkXFx4MjBcXHhhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDBcXHUyMDI4XFx1MjAyOV0qKSspL2lnLFxuICAgICAgICBwYXRoVmFsdWVzID0gLygtP1xcZCpcXC4/XFxkKig/OmVbXFwtK10/XFxkKyk/KVtcXHgwOVxceDBhXFx4MGJcXHgwY1xceDBkXFx4MjBcXHhhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDBcXHUyMDI4XFx1MjAyOV0qLD9bXFx4MDlcXHgwYVxceDBiXFx4MGNcXHgwZFxceDIwXFx4YTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjldKi9pZyxcbiAgICAgICAgcmFkaWFsX2dyYWRpZW50ID0gUi5fcmFkaWFsX2dyYWRpZW50ID0gL15yKD86XFwoKFteLF0rPylbXFx4MDlcXHgwYVxceDBiXFx4MGNcXHgwZFxceDIwXFx4YTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjldKixbXFx4MDlcXHgwYVxceDBiXFx4MGNcXHgwZFxceDIwXFx4YTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjldKihbXlxcKV0rPylcXCkpPy8sXG4gICAgICAgIGVsZGF0YSA9IHt9LFxuICAgICAgICBzb3J0QnlLZXkgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGEua2V5IC0gYi5rZXk7XG4gICAgICAgIH0sXG4gICAgICAgIHNvcnRCeU51bWJlciA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9GbG9hdChhKSAtIHRvRmxvYXQoYik7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1biA9IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgICBwaXBlID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICB9LFxuICAgICAgICByZWN0UGF0aCA9IFIuX3JlY3RQYXRoID0gZnVuY3Rpb24gKHgsIHksIHcsIGgsIHIpIHtcbiAgICAgICAgICAgIGlmIChyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtbXCJNXCIsIHggKyByLCB5XSwgW1wibFwiLCB3IC0gciAqIDIsIDBdLCBbXCJhXCIsIHIsIHIsIDAsIDAsIDEsIHIsIHJdLCBbXCJsXCIsIDAsIGggLSByICogMl0sIFtcImFcIiwgciwgciwgMCwgMCwgMSwgLXIsIHJdLCBbXCJsXCIsIHIgKiAyIC0gdywgMF0sIFtcImFcIiwgciwgciwgMCwgMCwgMSwgLXIsIC1yXSwgW1wibFwiLCAwLCByICogMiAtIGhdLCBbXCJhXCIsIHIsIHIsIDAsIDAsIDEsIHIsIC1yXSwgW1wielwiXV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gW1tcIk1cIiwgeCwgeV0sIFtcImxcIiwgdywgMF0sIFtcImxcIiwgMCwgaF0sIFtcImxcIiwgLXcsIDBdLCBbXCJ6XCJdXTtcbiAgICAgICAgfSxcbiAgICAgICAgZWxsaXBzZVBhdGggPSBmdW5jdGlvbiAoeCwgeSwgcngsIHJ5KSB7XG4gICAgICAgICAgICBpZiAocnkgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJ5ID0gcng7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gW1tcIk1cIiwgeCwgeV0sIFtcIm1cIiwgMCwgLXJ5XSwgW1wiYVwiLCByeCwgcnksIDAsIDEsIDEsIDAsIDIgKiByeV0sIFtcImFcIiwgcngsIHJ5LCAwLCAxLCAxLCAwLCAtMiAqIHJ5XSwgW1wielwiXV07XG4gICAgICAgIH0sXG4gICAgICAgIGdldFBhdGggPSBSLl9nZXRQYXRoID0ge1xuICAgICAgICAgICAgcGF0aDogZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsLmF0dHIoXCJwYXRoXCIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNpcmNsZTogZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGEgPSBlbC5hdHRycztcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxsaXBzZVBhdGgoYS5jeCwgYS5jeSwgYS5yKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbGxpcHNlOiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgYSA9IGVsLmF0dHJzO1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGxpcHNlUGF0aChhLmN4LCBhLmN5LCBhLnJ4LCBhLnJ5KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWN0OiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgYSA9IGVsLmF0dHJzO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWN0UGF0aChhLngsIGEueSwgYS53aWR0aCwgYS5oZWlnaHQsIGEucik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaW1hZ2U6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgIHZhciBhID0gZWwuYXR0cnM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY3RQYXRoKGEueCwgYS55LCBhLndpZHRoLCBhLmhlaWdodCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGV4dDogZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJib3ggPSBlbC5fZ2V0QkJveCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWN0UGF0aChiYm94LngsIGJib3gueSwgYmJveC53aWR0aCwgYmJveC5oZWlnaHQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCA6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJib3ggPSBlbC5fZ2V0QkJveCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWN0UGF0aChiYm94LngsIGJib3gueSwgYmJveC53aWR0aCwgYmJveC5oZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKlxcXG4gICAgICAgICAqIFJhcGhhZWwubWFwUGF0aFxuICAgICAgICAgWyBtZXRob2QgXVxuICAgICAgICAgKipcbiAgICAgICAgICogVHJhbnNmb3JtIHRoZSBwYXRoIHN0cmluZyB3aXRoIGdpdmVuIG1hdHJpeC5cbiAgICAgICAgID4gUGFyYW1ldGVyc1xuICAgICAgICAgLSBwYXRoIChzdHJpbmcpIHBhdGggc3RyaW5nXG4gICAgICAgICAtIG1hdHJpeCAob2JqZWN0KSBzZWUgQE1hdHJpeFxuICAgICAgICAgPSAoc3RyaW5nKSB0cmFuc2Zvcm1lZCBwYXRoIHN0cmluZ1xuICAgICAgICBcXCovXG4gICAgICAgIG1hcFBhdGggPSBSLm1hcFBhdGggPSBmdW5jdGlvbiAocGF0aCwgbWF0cml4KSB7XG4gICAgICAgICAgICBpZiAoIW1hdHJpeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHgsIHksIGksIGosIGlpLCBqaiwgcGF0aGk7XG4gICAgICAgICAgICBwYXRoID0gcGF0aDJjdXJ2ZShwYXRoKTtcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGlpID0gcGF0aC5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcGF0aGkgPSBwYXRoW2ldO1xuICAgICAgICAgICAgICAgIGZvciAoaiA9IDEsIGpqID0gcGF0aGkubGVuZ3RoOyBqIDwgamo7IGogKz0gMikge1xuICAgICAgICAgICAgICAgICAgICB4ID0gbWF0cml4LngocGF0aGlbal0sIHBhdGhpW2ogKyAxXSk7XG4gICAgICAgICAgICAgICAgICAgIHkgPSBtYXRyaXgueShwYXRoaVtqXSwgcGF0aGlbaiArIDFdKTtcbiAgICAgICAgICAgICAgICAgICAgcGF0aGlbal0gPSB4O1xuICAgICAgICAgICAgICAgICAgICBwYXRoaVtqICsgMV0gPSB5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYXRoO1xuICAgICAgICB9O1xuXG4gICAgUi5fZyA9IGc7XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwudHlwZVxuICAgICBbIHByb3BlcnR5IChzdHJpbmcpIF1cbiAgICAgKipcbiAgICAgKiBDYW4gYmUg4oCcU1ZH4oCdLCDigJxWTUzigJ0gb3IgZW1wdHksIGRlcGVuZGluZyBvbiBicm93c2VyIHN1cHBvcnQuXG4gICAgXFwqL1xuICAgIFIudHlwZSA9IChnLndpbi5TVkdBbmdsZSB8fCBnLmRvYy5pbXBsZW1lbnRhdGlvbi5oYXNGZWF0dXJlKFwiaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHMTEvZmVhdHVyZSNCYXNpY1N0cnVjdHVyZVwiLCBcIjEuMVwiKSA/IFwiU1ZHXCIgOiBcIlZNTFwiKTtcbiAgICBpZiAoUi50eXBlID09IFwiVk1MXCIpIHtcbiAgICAgICAgdmFyIGQgPSBnLmRvYy5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgYjtcbiAgICAgICAgZC5pbm5lckhUTUwgPSAnPHY6c2hhcGUgYWRqPVwiMVwiLz4nO1xuICAgICAgICBiID0gZC5maXJzdENoaWxkO1xuICAgICAgICBiLnN0eWxlLmJlaGF2aW9yID0gXCJ1cmwoI2RlZmF1bHQjVk1MKVwiO1xuICAgICAgICBpZiAoIShiICYmIHR5cGVvZiBiLmFkaiA9PSBcIm9iamVjdFwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIChSLnR5cGUgPSBFKTtcbiAgICAgICAgfVxuICAgICAgICBkID0gbnVsbDtcbiAgICB9XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuc3ZnXG4gICAgIFsgcHJvcGVydHkgKGJvb2xlYW4pIF1cbiAgICAgKipcbiAgICAgKiBgdHJ1ZWAgaWYgYnJvd3NlciBzdXBwb3J0cyBTVkcuXG4gICAgXFwqL1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnZtbFxuICAgICBbIHByb3BlcnR5IChib29sZWFuKSBdXG4gICAgICoqXG4gICAgICogYHRydWVgIGlmIGJyb3dzZXIgc3VwcG9ydHMgVk1MLlxuICAgIFxcKi9cbiAgICBSLnN2ZyA9ICEoUi52bWwgPSBSLnR5cGUgPT0gXCJWTUxcIik7XG4gICAgUi5fUGFwZXIgPSBQYXBlcjtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5mblxuICAgICBbIHByb3BlcnR5IChvYmplY3QpIF1cbiAgICAgKipcbiAgICAgKiBZb3UgY2FuIGFkZCB5b3VyIG93biBtZXRob2QgdG8gdGhlIGNhbnZhcy4gRm9yIGV4YW1wbGUgaWYgeW91IHdhbnQgdG8gZHJhdyBhIHBpZSBjaGFydCxcbiAgICAgKiB5b3UgY2FuIGNyZWF0ZSB5b3VyIG93biBwaWUgY2hhcnQgZnVuY3Rpb24gYW5kIHNoaXAgaXQgYXMgYSBSYXBoYcOrbCBwbHVnaW4uIFRvIGRvIHRoaXNcbiAgICAgKiB5b3UgbmVlZCB0byBleHRlbmQgdGhlIGBSYXBoYWVsLmZuYCBvYmplY3QuIFlvdSBzaG91bGQgbW9kaWZ5IHRoZSBgZm5gIG9iamVjdCBiZWZvcmUgYVxuICAgICAqIFJhcGhhw6tsIGluc3RhbmNlIGlzIGNyZWF0ZWQsIG90aGVyd2lzZSBpdCB3aWxsIHRha2Ugbm8gZWZmZWN0LiBQbGVhc2Ugbm90ZSB0aGF0IHRoZVxuICAgICAqIGFiaWxpdHkgZm9yIG5hbWVzcGFjZWQgcGx1Z2lucyB3YXMgcmVtb3ZlZCBpbiBSYXBoYWVsIDIuMC4gSXQgaXMgdXAgdG8gdGhlIHBsdWdpbiB0b1xuICAgICAqIGVuc3VyZSBhbnkgbmFtZXNwYWNpbmcgZW5zdXJlcyBwcm9wZXIgY29udGV4dC5cbiAgICAgPiBVc2FnZVxuICAgICB8IFJhcGhhZWwuZm4uYXJyb3cgPSBmdW5jdGlvbiAoeDEsIHkxLCB4MiwgeTIsIHNpemUpIHtcbiAgICAgfCAgICAgcmV0dXJuIHRoaXMucGF0aCggLi4uICk7XG4gICAgIHwgfTtcbiAgICAgfCAvLyBvciBjcmVhdGUgbmFtZXNwYWNlXG4gICAgIHwgUmFwaGFlbC5mbi5teXN0dWZmID0ge1xuICAgICB8ICAgICBhcnJvdzogZnVuY3Rpb24gKCkge+KApn0sXG4gICAgIHwgICAgIHN0YXI6IGZ1bmN0aW9uICgpIHvigKZ9LFxuICAgICB8ICAgICAvLyBldGPigKZcbiAgICAgfCB9O1xuICAgICB8IHZhciBwYXBlciA9IFJhcGhhZWwoMTAsIDEwLCA2MzAsIDQ4MCk7XG4gICAgIHwgLy8gdGhlbiB1c2UgaXRcbiAgICAgfCBwYXBlci5hcnJvdygxMCwgMTAsIDMwLCAzMCwgNSkuYXR0cih7ZmlsbDogXCIjZjAwXCJ9KTtcbiAgICAgfCBwYXBlci5teXN0dWZmLmFycm93KCk7XG4gICAgIHwgcGFwZXIubXlzdHVmZi5zdGFyKCk7XG4gICAgXFwqL1xuICAgIFIuZm4gPSBwYXBlcnByb3RvID0gUGFwZXIucHJvdG90eXBlID0gUi5wcm90b3R5cGU7XG4gICAgUi5faWQgPSAwO1xuICAgIFIuX29pZCA9IDA7XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuaXNcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEhhbmRmdWxsIHJlcGxhY2VtZW50IGZvciBgdHlwZW9mYCBvcGVyYXRvci5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gbyAo4oCmKSBhbnkgb2JqZWN0IG9yIHByaW1pdGl2ZVxuICAgICAtIHR5cGUgKHN0cmluZykgbmFtZSBvZiB0aGUgdHlwZSwgaS5lLiDigJxzdHJpbmfigJ0sIOKAnGZ1bmN0aW9u4oCdLCDigJxudW1iZXLigJ0sIGV0Yy5cbiAgICAgPSAoYm9vbGVhbikgaXMgZ2l2ZW4gdmFsdWUgaXMgb2YgZ2l2ZW4gdHlwZVxuICAgIFxcKi9cbiAgICBSLmlzID0gZnVuY3Rpb24gKG8sIHR5cGUpIHtcbiAgICAgICAgdHlwZSA9IGxvd2VyQ2FzZS5jYWxsKHR5cGUpO1xuICAgICAgICBpZiAodHlwZSA9PSBcImZpbml0ZVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gIWlzbmFuW2hhc10oK28pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlID09IFwiYXJyYXlcIikge1xuICAgICAgICAgICAgcmV0dXJuIG8gaW5zdGFuY2VvZiBBcnJheTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gICh0eXBlID09IFwibnVsbFwiICYmIG8gPT09IG51bGwpIHx8XG4gICAgICAgICAgICAgICAgKHR5cGUgPT0gdHlwZW9mIG8gJiYgbyAhPT0gbnVsbCkgfHxcbiAgICAgICAgICAgICAgICAodHlwZSA9PSBcIm9iamVjdFwiICYmIG8gPT09IE9iamVjdChvKSkgfHxcbiAgICAgICAgICAgICAgICAodHlwZSA9PSBcImFycmF5XCIgJiYgQXJyYXkuaXNBcnJheSAmJiBBcnJheS5pc0FycmF5KG8pKSB8fFxuICAgICAgICAgICAgICAgIG9iamVjdFRvU3RyaW5nLmNhbGwobykuc2xpY2UoOCwgLTEpLnRvTG93ZXJDYXNlKCkgPT0gdHlwZTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gY2xvbmUob2JqKSB7XG4gICAgICAgIGlmIChPYmplY3Qob2JqKSAhPT0gb2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXMgPSBuZXcgb2JqLmNvbnN0cnVjdG9yO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAob2JqW2hhc10oa2V5KSkge1xuICAgICAgICAgICAgcmVzW2tleV0gPSBjbG9uZShvYmpba2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5hbmdsZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBhbmdsZSBiZXR3ZWVuIHR3byBvciB0aHJlZSBwb2ludHNcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0geDEgKG51bWJlcikgeCBjb29yZCBvZiBmaXJzdCBwb2ludFxuICAgICAtIHkxIChudW1iZXIpIHkgY29vcmQgb2YgZmlyc3QgcG9pbnRcbiAgICAgLSB4MiAobnVtYmVyKSB4IGNvb3JkIG9mIHNlY29uZCBwb2ludFxuICAgICAtIHkyIChudW1iZXIpIHkgY29vcmQgb2Ygc2Vjb25kIHBvaW50XG4gICAgIC0geDMgKG51bWJlcikgI29wdGlvbmFsIHggY29vcmQgb2YgdGhpcmQgcG9pbnRcbiAgICAgLSB5MyAobnVtYmVyKSAjb3B0aW9uYWwgeSBjb29yZCBvZiB0aGlyZCBwb2ludFxuICAgICA9IChudW1iZXIpIGFuZ2xlIGluIGRlZ3JlZXMuXG4gICAgXFwqL1xuICAgIFIuYW5nbGUgPSBmdW5jdGlvbiAoeDEsIHkxLCB4MiwgeTIsIHgzLCB5Mykge1xuICAgICAgICBpZiAoeDMgPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIHggPSB4MSAtIHgyLFxuICAgICAgICAgICAgICAgIHkgPSB5MSAtIHkyO1xuICAgICAgICAgICAgaWYgKCF4ICYmICF5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKDE4MCArIG1hdGguYXRhbjIoLXksIC14KSAqIDE4MCAvIFBJICsgMzYwKSAlIDM2MDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBSLmFuZ2xlKHgxLCB5MSwgeDMsIHkzKSAtIFIuYW5nbGUoeDIsIHkyLCB4MywgeTMpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5yYWRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFRyYW5zZm9ybSBhbmdsZSB0byByYWRpYW5zXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGRlZyAobnVtYmVyKSBhbmdsZSBpbiBkZWdyZWVzXG4gICAgID0gKG51bWJlcikgYW5nbGUgaW4gcmFkaWFucy5cbiAgICBcXCovXG4gICAgUi5yYWQgPSBmdW5jdGlvbiAoZGVnKSB7XG4gICAgICAgIHJldHVybiBkZWcgJSAzNjAgKiBQSSAvIDE4MDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmRlZ1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVHJhbnNmb3JtIGFuZ2xlIHRvIGRlZ3JlZXNcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gZGVnIChudW1iZXIpIGFuZ2xlIGluIHJhZGlhbnNcbiAgICAgPSAobnVtYmVyKSBhbmdsZSBpbiBkZWdyZWVzLlxuICAgIFxcKi9cbiAgICBSLmRlZyA9IGZ1bmN0aW9uIChyYWQpIHtcbiAgICAgICAgcmV0dXJuIHJhZCAqIDE4MCAvIFBJICUgMzYwO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuc25hcFRvXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBTbmFwcyBnaXZlbiB2YWx1ZSB0byBnaXZlbiBncmlkLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSB2YWx1ZXMgKGFycmF5fG51bWJlcikgZ2l2ZW4gYXJyYXkgb2YgdmFsdWVzIG9yIHN0ZXAgb2YgdGhlIGdyaWRcbiAgICAgLSB2YWx1ZSAobnVtYmVyKSB2YWx1ZSB0byBhZGp1c3RcbiAgICAgLSB0b2xlcmFuY2UgKG51bWJlcikgI29wdGlvbmFsIHRvbGVyYW5jZSBmb3Igc25hcHBpbmcuIERlZmF1bHQgaXMgYDEwYC5cbiAgICAgPSAobnVtYmVyKSBhZGp1c3RlZCB2YWx1ZS5cbiAgICBcXCovXG4gICAgUi5zbmFwVG8gPSBmdW5jdGlvbiAodmFsdWVzLCB2YWx1ZSwgdG9sZXJhbmNlKSB7XG4gICAgICAgIHRvbGVyYW5jZSA9IFIuaXModG9sZXJhbmNlLCBcImZpbml0ZVwiKSA/IHRvbGVyYW5jZSA6IDEwO1xuICAgICAgICBpZiAoUi5pcyh2YWx1ZXMsIGFycmF5KSkge1xuICAgICAgICAgICAgdmFyIGkgPSB2YWx1ZXMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKGktLSkgaWYgKGFicyh2YWx1ZXNbaV0gLSB2YWx1ZSkgPD0gdG9sZXJhbmNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhbHVlcyA9ICt2YWx1ZXM7XG4gICAgICAgICAgICB2YXIgcmVtID0gdmFsdWUgJSB2YWx1ZXM7XG4gICAgICAgICAgICBpZiAocmVtIDwgdG9sZXJhbmNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlIC0gcmVtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlbSA+IHZhbHVlcyAtIHRvbGVyYW5jZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAtIHJlbSArIHZhbHVlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgICBcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5jcmVhdGVVVUlEXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIFJGQzQxMjIsIHZlcnNpb24gNCBJRFxuICAgIFxcKi9cbiAgICB2YXIgY3JlYXRlVVVJRCA9IFIuY3JlYXRlVVVJRCA9IChmdW5jdGlvbiAodXVpZFJlZ0V4LCB1dWlkUmVwbGFjZXIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBcInh4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eFwiLnJlcGxhY2UodXVpZFJlZ0V4LCB1dWlkUmVwbGFjZXIpLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgIH07XG4gICAgfSkoL1t4eV0vZywgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgdmFyIHIgPSBtYXRoLnJhbmRvbSgpICogMTYgfCAwLFxuICAgICAgICAgICAgdiA9IGMgPT0gXCJ4XCIgPyByIDogKHIgJiAzIHwgOCk7XG4gICAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICB9KTtcblxuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnNldFdpbmRvd1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXNlZCB3aGVuIHlvdSBuZWVkIHRvIGRyYXcgaW4gYCZsdDtpZnJhbWU+YC4gU3dpdGNoZWQgd2luZG93IHRvIHRoZSBpZnJhbWUgb25lLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBuZXd3aW4gKHdpbmRvdykgbmV3IHdpbmRvdyBvYmplY3RcbiAgICBcXCovXG4gICAgUi5zZXRXaW5kb3cgPSBmdW5jdGlvbiAobmV3d2luKSB7XG4gICAgICAgIGV2ZShcInJhcGhhZWwuc2V0V2luZG93XCIsIFIsIGcud2luLCBuZXd3aW4pO1xuICAgICAgICBnLndpbiA9IG5ld3dpbjtcbiAgICAgICAgZy5kb2MgPSBnLndpbi5kb2N1bWVudDtcbiAgICAgICAgaWYgKFIuX2VuZ2luZS5pbml0V2luKSB7XG4gICAgICAgICAgICBSLl9lbmdpbmUuaW5pdFdpbihnLndpbik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHZhciB0b0hleCA9IGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgICBpZiAoUi52bWwpIHtcbiAgICAgICAgICAgIC8vIGh0dHA6Ly9kZWFuLmVkd2FyZHMubmFtZS93ZWJsb2cvMjAwOS8xMC9jb252ZXJ0LWFueS1jb2xvdXItdmFsdWUtdG8taGV4LWluLW1zaWUvXG4gICAgICAgICAgICB2YXIgdHJpbSA9IC9eXFxzK3xcXHMrJC9nO1xuICAgICAgICAgICAgdmFyIGJvZDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIGRvY3VtID0gbmV3IEFjdGl2ZVhPYmplY3QoXCJodG1sZmlsZVwiKTtcbiAgICAgICAgICAgICAgICBkb2N1bS53cml0ZShcIjxib2R5PlwiKTtcbiAgICAgICAgICAgICAgICBkb2N1bS5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIGJvZCA9IGRvY3VtLmJvZHk7XG4gICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICBib2QgPSBjcmVhdGVQb3B1cCgpLmRvY3VtZW50LmJvZHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmFuZ2UgPSBib2QuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgICAgICB0b0hleCA9IGNhY2hlcihmdW5jdGlvbiAoY29sb3IpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBib2Quc3R5bGUuY29sb3IgPSBTdHIoY29sb3IpLnJlcGxhY2UodHJpbSwgRSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHJhbmdlLnF1ZXJ5Q29tbWFuZFZhbHVlKFwiRm9yZUNvbG9yXCIpO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICgodmFsdWUgJiAyNTUpIDw8IDE2KSB8ICh2YWx1ZSAmIDY1MjgwKSB8ICgodmFsdWUgJiAxNjcxMTY4MCkgPj4+IDE2KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI1wiICsgKFwiMDAwMDAwXCIgKyB2YWx1ZS50b1N0cmluZygxNikpLnNsaWNlKC02KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwibm9uZVwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGkgPSBnLmRvYy5jcmVhdGVFbGVtZW50KFwiaVwiKTtcbiAgICAgICAgICAgIGkudGl0bGUgPSBcIlJhcGhhXFx4ZWJsIENvbG91ciBQaWNrZXJcIjtcbiAgICAgICAgICAgIGkuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgZy5kb2MuYm9keS5hcHBlbmRDaGlsZChpKTtcbiAgICAgICAgICAgIHRvSGV4ID0gY2FjaGVyKGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgICAgICAgICAgIGkuc3R5bGUuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgICAgICAgICByZXR1cm4gZy5kb2MuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShpLCBFKS5nZXRQcm9wZXJ0eVZhbHVlKFwiY29sb3JcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9IZXgoY29sb3IpO1xuICAgIH0sXG4gICAgaHNidG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBcImhzYihcIiArIFt0aGlzLmgsIHRoaXMucywgdGhpcy5iXSArIFwiKVwiO1xuICAgIH0sXG4gICAgaHNsdG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBcImhzbChcIiArIFt0aGlzLmgsIHRoaXMucywgdGhpcy5sXSArIFwiKVwiO1xuICAgIH0sXG4gICAgcmdidG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhleDtcbiAgICB9LFxuICAgIHByZXBhcmVSR0IgPSBmdW5jdGlvbiAociwgZywgYikge1xuICAgICAgICBpZiAoZyA9PSBudWxsICYmIFIuaXMociwgXCJvYmplY3RcIikgJiYgXCJyXCIgaW4gciAmJiBcImdcIiBpbiByICYmIFwiYlwiIGluIHIpIHtcbiAgICAgICAgICAgIGIgPSByLmI7XG4gICAgICAgICAgICBnID0gci5nO1xuICAgICAgICAgICAgciA9IHIucjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZyA9PSBudWxsICYmIFIuaXMociwgc3RyaW5nKSkge1xuICAgICAgICAgICAgdmFyIGNsciA9IFIuZ2V0UkdCKHIpO1xuICAgICAgICAgICAgciA9IGNsci5yO1xuICAgICAgICAgICAgZyA9IGNsci5nO1xuICAgICAgICAgICAgYiA9IGNsci5iO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyID4gMSB8fCBnID4gMSB8fCBiID4gMSkge1xuICAgICAgICAgICAgciAvPSAyNTU7XG4gICAgICAgICAgICBnIC89IDI1NTtcbiAgICAgICAgICAgIGIgLz0gMjU1O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gW3IsIGcsIGJdO1xuICAgIH0sXG4gICAgcGFja2FnZVJHQiA9IGZ1bmN0aW9uIChyLCBnLCBiLCBvKSB7XG4gICAgICAgIHIgKj0gMjU1O1xuICAgICAgICBnICo9IDI1NTtcbiAgICAgICAgYiAqPSAyNTU7XG4gICAgICAgIHZhciByZ2IgPSB7XG4gICAgICAgICAgICByOiByLFxuICAgICAgICAgICAgZzogZyxcbiAgICAgICAgICAgIGI6IGIsXG4gICAgICAgICAgICBoZXg6IFIucmdiKHIsIGcsIGIpLFxuICAgICAgICAgICAgdG9TdHJpbmc6IHJnYnRvU3RyaW5nXG4gICAgICAgIH07XG4gICAgICAgIFIuaXMobywgXCJmaW5pdGVcIikgJiYgKHJnYi5vcGFjaXR5ID0gbyk7XG4gICAgICAgIHJldHVybiByZ2I7XG4gICAgfTtcbiAgICBcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5jb2xvclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUGFyc2VzIHRoZSBjb2xvciBzdHJpbmcgYW5kIHJldHVybnMgb2JqZWN0IHdpdGggYWxsIHZhbHVlcyBmb3IgdGhlIGdpdmVuIGNvbG9yLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBjbHIgKHN0cmluZykgY29sb3Igc3RyaW5nIGluIG9uZSBvZiB0aGUgc3VwcG9ydGVkIGZvcm1hdHMgKHNlZSBAUmFwaGFlbC5nZXRSR0IpXG4gICAgID0gKG9iamVjdCkgQ29tYmluZWQgUkdCICYgSFNCIG9iamVjdCBpbiBmb3JtYXQ6XG4gICAgIG8ge1xuICAgICBvICAgICByIChudW1iZXIpIHJlZCxcbiAgICAgbyAgICAgZyAobnVtYmVyKSBncmVlbixcbiAgICAgbyAgICAgYiAobnVtYmVyKSBibHVlLFxuICAgICBvICAgICBoZXggKHN0cmluZykgY29sb3IgaW4gSFRNTC9DU1MgZm9ybWF0OiAj4oCi4oCi4oCi4oCi4oCi4oCiLFxuICAgICBvICAgICBlcnJvciAoYm9vbGVhbikgYHRydWVgIGlmIHN0cmluZyBjYW7igJl0IGJlIHBhcnNlZCxcbiAgICAgbyAgICAgaCAobnVtYmVyKSBodWUsXG4gICAgIG8gICAgIHMgKG51bWJlcikgc2F0dXJhdGlvbixcbiAgICAgbyAgICAgdiAobnVtYmVyKSB2YWx1ZSAoYnJpZ2h0bmVzcyksXG4gICAgIG8gICAgIGwgKG51bWJlcikgbGlnaHRuZXNzXG4gICAgIG8gfVxuICAgIFxcKi9cbiAgICBSLmNvbG9yID0gZnVuY3Rpb24gKGNscikge1xuICAgICAgICB2YXIgcmdiO1xuICAgICAgICBpZiAoUi5pcyhjbHIsIFwib2JqZWN0XCIpICYmIFwiaFwiIGluIGNsciAmJiBcInNcIiBpbiBjbHIgJiYgXCJiXCIgaW4gY2xyKSB7XG4gICAgICAgICAgICByZ2IgPSBSLmhzYjJyZ2IoY2xyKTtcbiAgICAgICAgICAgIGNsci5yID0gcmdiLnI7XG4gICAgICAgICAgICBjbHIuZyA9IHJnYi5nO1xuICAgICAgICAgICAgY2xyLmIgPSByZ2IuYjtcbiAgICAgICAgICAgIGNsci5oZXggPSByZ2IuaGV4O1xuICAgICAgICB9IGVsc2UgaWYgKFIuaXMoY2xyLCBcIm9iamVjdFwiKSAmJiBcImhcIiBpbiBjbHIgJiYgXCJzXCIgaW4gY2xyICYmIFwibFwiIGluIGNscikge1xuICAgICAgICAgICAgcmdiID0gUi5oc2wycmdiKGNscik7XG4gICAgICAgICAgICBjbHIuciA9IHJnYi5yO1xuICAgICAgICAgICAgY2xyLmcgPSByZ2IuZztcbiAgICAgICAgICAgIGNsci5iID0gcmdiLmI7XG4gICAgICAgICAgICBjbHIuaGV4ID0gcmdiLmhleDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChSLmlzKGNsciwgXCJzdHJpbmdcIikpIHtcbiAgICAgICAgICAgICAgICBjbHIgPSBSLmdldFJHQihjbHIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKFIuaXMoY2xyLCBcIm9iamVjdFwiKSAmJiBcInJcIiBpbiBjbHIgJiYgXCJnXCIgaW4gY2xyICYmIFwiYlwiIGluIGNscikge1xuICAgICAgICAgICAgICAgIHJnYiA9IFIucmdiMmhzbChjbHIpO1xuICAgICAgICAgICAgICAgIGNsci5oID0gcmdiLmg7XG4gICAgICAgICAgICAgICAgY2xyLnMgPSByZ2IucztcbiAgICAgICAgICAgICAgICBjbHIubCA9IHJnYi5sO1xuICAgICAgICAgICAgICAgIHJnYiA9IFIucmdiMmhzYihjbHIpO1xuICAgICAgICAgICAgICAgIGNsci52ID0gcmdiLmI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNsciA9IHtoZXg6IFwibm9uZVwifTtcbiAgICAgICAgICAgICAgICBjbHIuciA9IGNsci5nID0gY2xyLmIgPSBjbHIuaCA9IGNsci5zID0gY2xyLnYgPSBjbHIubCA9IC0xO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNsci50b1N0cmluZyA9IHJnYnRvU3RyaW5nO1xuICAgICAgICByZXR1cm4gY2xyO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuaHNiMnJnYlxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ29udmVydHMgSFNCIHZhbHVlcyB0byBSR0Igb2JqZWN0LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoIChudW1iZXIpIGh1ZVxuICAgICAtIHMgKG51bWJlcikgc2F0dXJhdGlvblxuICAgICAtIHYgKG51bWJlcikgdmFsdWUgb3IgYnJpZ2h0bmVzc1xuICAgICA9IChvYmplY3QpIFJHQiBvYmplY3QgaW4gZm9ybWF0OlxuICAgICBvIHtcbiAgICAgbyAgICAgciAobnVtYmVyKSByZWQsXG4gICAgIG8gICAgIGcgKG51bWJlcikgZ3JlZW4sXG4gICAgIG8gICAgIGIgKG51bWJlcikgYmx1ZSxcbiAgICAgbyAgICAgaGV4IChzdHJpbmcpIGNvbG9yIGluIEhUTUwvQ1NTIGZvcm1hdDogI+KAouKAouKAouKAouKAouKAolxuICAgICBvIH1cbiAgICBcXCovXG4gICAgUi5oc2IycmdiID0gZnVuY3Rpb24gKGgsIHMsIHYsIG8pIHtcbiAgICAgICAgaWYgKHRoaXMuaXMoaCwgXCJvYmplY3RcIikgJiYgXCJoXCIgaW4gaCAmJiBcInNcIiBpbiBoICYmIFwiYlwiIGluIGgpIHtcbiAgICAgICAgICAgIHYgPSBoLmI7XG4gICAgICAgICAgICBzID0gaC5zO1xuICAgICAgICAgICAgaCA9IGguaDtcbiAgICAgICAgICAgIG8gPSBoLm87XG4gICAgICAgIH1cbiAgICAgICAgaCAqPSAzNjA7XG4gICAgICAgIHZhciBSLCBHLCBCLCBYLCBDO1xuICAgICAgICBoID0gKGggJSAzNjApIC8gNjA7XG4gICAgICAgIEMgPSB2ICogcztcbiAgICAgICAgWCA9IEMgKiAoMSAtIGFicyhoICUgMiAtIDEpKTtcbiAgICAgICAgUiA9IEcgPSBCID0gdiAtIEM7XG5cbiAgICAgICAgaCA9IH5+aDtcbiAgICAgICAgUiArPSBbQywgWCwgMCwgMCwgWCwgQ11baF07XG4gICAgICAgIEcgKz0gW1gsIEMsIEMsIFgsIDAsIDBdW2hdO1xuICAgICAgICBCICs9IFswLCAwLCBYLCBDLCBDLCBYXVtoXTtcbiAgICAgICAgcmV0dXJuIHBhY2thZ2VSR0IoUiwgRywgQiwgbyk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5oc2wycmdiXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDb252ZXJ0cyBIU0wgdmFsdWVzIHRvIFJHQiBvYmplY3QuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGggKG51bWJlcikgaHVlXG4gICAgIC0gcyAobnVtYmVyKSBzYXR1cmF0aW9uXG4gICAgIC0gbCAobnVtYmVyKSBsdW1pbm9zaXR5XG4gICAgID0gKG9iamVjdCkgUkdCIG9iamVjdCBpbiBmb3JtYXQ6XG4gICAgIG8ge1xuICAgICBvICAgICByIChudW1iZXIpIHJlZCxcbiAgICAgbyAgICAgZyAobnVtYmVyKSBncmVlbixcbiAgICAgbyAgICAgYiAobnVtYmVyKSBibHVlLFxuICAgICBvICAgICBoZXggKHN0cmluZykgY29sb3IgaW4gSFRNTC9DU1MgZm9ybWF0OiAj4oCi4oCi4oCi4oCi4oCi4oCiXG4gICAgIG8gfVxuICAgIFxcKi9cbiAgICBSLmhzbDJyZ2IgPSBmdW5jdGlvbiAoaCwgcywgbCwgbykge1xuICAgICAgICBpZiAodGhpcy5pcyhoLCBcIm9iamVjdFwiKSAmJiBcImhcIiBpbiBoICYmIFwic1wiIGluIGggJiYgXCJsXCIgaW4gaCkge1xuICAgICAgICAgICAgbCA9IGgubDtcbiAgICAgICAgICAgIHMgPSBoLnM7XG4gICAgICAgICAgICBoID0gaC5oO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoID4gMSB8fCBzID4gMSB8fCBsID4gMSkge1xuICAgICAgICAgICAgaCAvPSAzNjA7XG4gICAgICAgICAgICBzIC89IDEwMDtcbiAgICAgICAgICAgIGwgLz0gMTAwO1xuICAgICAgICB9XG4gICAgICAgIGggKj0gMzYwO1xuICAgICAgICB2YXIgUiwgRywgQiwgWCwgQztcbiAgICAgICAgaCA9IChoICUgMzYwKSAvIDYwO1xuICAgICAgICBDID0gMiAqIHMgKiAobCA8IC41ID8gbCA6IDEgLSBsKTtcbiAgICAgICAgWCA9IEMgKiAoMSAtIGFicyhoICUgMiAtIDEpKTtcbiAgICAgICAgUiA9IEcgPSBCID0gbCAtIEMgLyAyO1xuXG4gICAgICAgIGggPSB+fmg7XG4gICAgICAgIFIgKz0gW0MsIFgsIDAsIDAsIFgsIENdW2hdO1xuICAgICAgICBHICs9IFtYLCBDLCBDLCBYLCAwLCAwXVtoXTtcbiAgICAgICAgQiArPSBbMCwgMCwgWCwgQywgQywgWF1baF07XG4gICAgICAgIHJldHVybiBwYWNrYWdlUkdCKFIsIEcsIEIsIG8pO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwucmdiMmhzYlxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ29udmVydHMgUkdCIHZhbHVlcyB0byBIU0Igb2JqZWN0LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSByIChudW1iZXIpIHJlZFxuICAgICAtIGcgKG51bWJlcikgZ3JlZW5cbiAgICAgLSBiIChudW1iZXIpIGJsdWVcbiAgICAgPSAob2JqZWN0KSBIU0Igb2JqZWN0IGluIGZvcm1hdDpcbiAgICAgbyB7XG4gICAgIG8gICAgIGggKG51bWJlcikgaHVlXG4gICAgIG8gICAgIHMgKG51bWJlcikgc2F0dXJhdGlvblxuICAgICBvICAgICBiIChudW1iZXIpIGJyaWdodG5lc3NcbiAgICAgbyB9XG4gICAgXFwqL1xuICAgIFIucmdiMmhzYiA9IGZ1bmN0aW9uIChyLCBnLCBiKSB7XG4gICAgICAgIGIgPSBwcmVwYXJlUkdCKHIsIGcsIGIpO1xuICAgICAgICByID0gYlswXTtcbiAgICAgICAgZyA9IGJbMV07XG4gICAgICAgIGIgPSBiWzJdO1xuXG4gICAgICAgIHZhciBILCBTLCBWLCBDO1xuICAgICAgICBWID0gbW1heChyLCBnLCBiKTtcbiAgICAgICAgQyA9IFYgLSBtbWluKHIsIGcsIGIpO1xuICAgICAgICBIID0gKEMgPT0gMCA/IG51bGwgOlxuICAgICAgICAgICAgIFYgPT0gciA/IChnIC0gYikgLyBDIDpcbiAgICAgICAgICAgICBWID09IGcgPyAoYiAtIHIpIC8gQyArIDIgOlxuICAgICAgICAgICAgICAgICAgICAgIChyIC0gZykgLyBDICsgNFxuICAgICAgICAgICAgKTtcbiAgICAgICAgSCA9ICgoSCArIDM2MCkgJSA2KSAqIDYwIC8gMzYwO1xuICAgICAgICBTID0gQyA9PSAwID8gMCA6IEMgLyBWO1xuICAgICAgICByZXR1cm4ge2g6IEgsIHM6IFMsIGI6IFYsIHRvU3RyaW5nOiBoc2J0b1N0cmluZ307XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5yZ2IyaHNsXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDb252ZXJ0cyBSR0IgdmFsdWVzIHRvIEhTTCBvYmplY3QuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHIgKG51bWJlcikgcmVkXG4gICAgIC0gZyAobnVtYmVyKSBncmVlblxuICAgICAtIGIgKG51bWJlcikgYmx1ZVxuICAgICA9IChvYmplY3QpIEhTTCBvYmplY3QgaW4gZm9ybWF0OlxuICAgICBvIHtcbiAgICAgbyAgICAgaCAobnVtYmVyKSBodWVcbiAgICAgbyAgICAgcyAobnVtYmVyKSBzYXR1cmF0aW9uXG4gICAgIG8gICAgIGwgKG51bWJlcikgbHVtaW5vc2l0eVxuICAgICBvIH1cbiAgICBcXCovXG4gICAgUi5yZ2IyaHNsID0gZnVuY3Rpb24gKHIsIGcsIGIpIHtcbiAgICAgICAgYiA9IHByZXBhcmVSR0IociwgZywgYik7XG4gICAgICAgIHIgPSBiWzBdO1xuICAgICAgICBnID0gYlsxXTtcbiAgICAgICAgYiA9IGJbMl07XG5cbiAgICAgICAgdmFyIEgsIFMsIEwsIE0sIG0sIEM7XG4gICAgICAgIE0gPSBtbWF4KHIsIGcsIGIpO1xuICAgICAgICBtID0gbW1pbihyLCBnLCBiKTtcbiAgICAgICAgQyA9IE0gLSBtO1xuICAgICAgICBIID0gKEMgPT0gMCA/IG51bGwgOlxuICAgICAgICAgICAgIE0gPT0gciA/IChnIC0gYikgLyBDIDpcbiAgICAgICAgICAgICBNID09IGcgPyAoYiAtIHIpIC8gQyArIDIgOlxuICAgICAgICAgICAgICAgICAgICAgIChyIC0gZykgLyBDICsgNCk7XG4gICAgICAgIEggPSAoKEggKyAzNjApICUgNikgKiA2MCAvIDM2MDtcbiAgICAgICAgTCA9IChNICsgbSkgLyAyO1xuICAgICAgICBTID0gKEMgPT0gMCA/IDAgOlxuICAgICAgICAgICAgIEwgPCAuNSA/IEMgLyAoMiAqIEwpIDpcbiAgICAgICAgICAgICAgICAgICAgICBDIC8gKDIgLSAyICogTCkpO1xuICAgICAgICByZXR1cm4ge2g6IEgsIHM6IFMsIGw6IEwsIHRvU3RyaW5nOiBoc2x0b1N0cmluZ307XG4gICAgfTtcbiAgICBSLl9wYXRoMnN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuam9pbihcIixcIikucmVwbGFjZShwMnMsIFwiJDFcIik7XG4gICAgfTtcbiAgICBmdW5jdGlvbiByZXB1c2goYXJyYXksIGl0ZW0pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gYXJyYXkubGVuZ3RoOyBpIDwgaWk7IGkrKykgaWYgKGFycmF5W2ldID09PSBpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gYXJyYXkucHVzaChhcnJheS5zcGxpY2UoaSwgMSlbMF0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNhY2hlcihmLCBzY29wZSwgcG9zdHByb2Nlc3Nvcikge1xuICAgICAgICBmdW5jdGlvbiBuZXdmKCkge1xuICAgICAgICAgICAgdmFyIGFyZyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksXG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZy5qb2luKFwiXFx1MjQwMFwiKSxcbiAgICAgICAgICAgICAgICBjYWNoZSA9IG5ld2YuY2FjaGUgPSBuZXdmLmNhY2hlIHx8IHt9LFxuICAgICAgICAgICAgICAgIGNvdW50ID0gbmV3Zi5jb3VudCA9IG5ld2YuY291bnQgfHwgW107XG4gICAgICAgICAgICBpZiAoY2FjaGVbaGFzXShhcmdzKSkge1xuICAgICAgICAgICAgICAgIHJlcHVzaChjb3VudCwgYXJncyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBvc3Rwcm9jZXNzb3IgPyBwb3N0cHJvY2Vzc29yKGNhY2hlW2FyZ3NdKSA6IGNhY2hlW2FyZ3NdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY291bnQubGVuZ3RoID49IDFlMyAmJiBkZWxldGUgY2FjaGVbY291bnQuc2hpZnQoKV07XG4gICAgICAgICAgICBjb3VudC5wdXNoKGFyZ3MpO1xuICAgICAgICAgICAgY2FjaGVbYXJnc10gPSBmW2FwcGx5XShzY29wZSwgYXJnKTtcbiAgICAgICAgICAgIHJldHVybiBwb3N0cHJvY2Vzc29yID8gcG9zdHByb2Nlc3NvcihjYWNoZVthcmdzXSkgOiBjYWNoZVthcmdzXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3ZjtcbiAgICB9XG5cbiAgICB2YXIgcHJlbG9hZCA9IFIuX3ByZWxvYWQgPSBmdW5jdGlvbiAoc3JjLCBmKSB7XG4gICAgICAgIHZhciBpbWcgPSBnLmRvYy5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICBpbWcuc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246YWJzb2x1dGU7bGVmdDotOTk5OWVtO3RvcDotOTk5OWVtXCI7XG4gICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB0aGlzLm9ubG9hZCA9IG51bGw7XG4gICAgICAgICAgICBnLmRvYy5ib2R5LnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICBpbWcub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGcuZG9jLmJvZHkucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIH07XG4gICAgICAgIGcuZG9jLmJvZHkuYXBwZW5kQ2hpbGQoaW1nKTtcbiAgICAgICAgaW1nLnNyYyA9IHNyYztcbiAgICB9O1xuICAgIFxuICAgIGZ1bmN0aW9uIGNsclRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oZXg7XG4gICAgfVxuXG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuZ2V0UkdCXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBQYXJzZXMgY29sb3VyIHN0cmluZyBhcyBSR0Igb2JqZWN0XG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGNvbG91ciAoc3RyaW5nKSBjb2xvdXIgc3RyaW5nIGluIG9uZSBvZiBmb3JtYXRzOlxuICAgICAjIDx1bD5cbiAgICAgIyAgICAgPGxpPkNvbG91ciBuYW1lICjigJw8Y29kZT5yZWQ8L2NvZGU+4oCdLCDigJw8Y29kZT5ncmVlbjwvY29kZT7igJ0sIOKAnDxjb2RlPmNvcm5mbG93ZXJibHVlPC9jb2RlPuKAnSwgZXRjKTwvbGk+XG4gICAgICMgICAgIDxsaT4j4oCi4oCi4oCiIOKAlCBzaG9ydGVuZWQgSFRNTCBjb2xvdXI6ICjigJw8Y29kZT4jMDAwPC9jb2RlPuKAnSwg4oCcPGNvZGU+I2ZjMDwvY29kZT7igJ0sIGV0Yyk8L2xpPlxuICAgICAjICAgICA8bGk+I+KAouKAouKAouKAouKAouKAoiDigJQgZnVsbCBsZW5ndGggSFRNTCBjb2xvdXI6ICjigJw8Y29kZT4jMDAwMDAwPC9jb2RlPuKAnSwg4oCcPGNvZGU+I2JkMjMwMDwvY29kZT7igJ0pPC9saT5cbiAgICAgIyAgICAgPGxpPnJnYijigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiKSDigJQgcmVkLCBncmVlbiBhbmQgYmx1ZSBjaGFubmVsc+KAmSB2YWx1ZXM6ICjigJw8Y29kZT5yZ2IoMjAwLCZuYnNwOzEwMCwmbmJzcDswKTwvY29kZT7igJ0pPC9saT5cbiAgICAgIyAgICAgPGxpPnJnYijigKLigKLigKIlLCDigKLigKLigKIlLCDigKLigKLigKIlKSDigJQgc2FtZSBhcyBhYm92ZSwgYnV0IGluICU6ICjigJw8Y29kZT5yZ2IoMTAwJSwmbmJzcDsxNzUlLCZuYnNwOzAlKTwvY29kZT7igJ0pPC9saT5cbiAgICAgIyAgICAgPGxpPmhzYijigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiKSDigJQgaHVlLCBzYXR1cmF0aW9uIGFuZCBicmlnaHRuZXNzIHZhbHVlczogKOKAnDxjb2RlPmhzYigwLjUsJm5ic3A7MC4yNSwmbmJzcDsxKTwvY29kZT7igJ0pPC9saT5cbiAgICAgIyAgICAgPGxpPmhzYijigKLigKLigKIlLCDigKLigKLigKIlLCDigKLigKLigKIlKSDigJQgc2FtZSBhcyBhYm92ZSwgYnV0IGluICU8L2xpPlxuICAgICAjICAgICA8bGk+aHNsKOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIpIOKAlCBzYW1lIGFzIGhzYjwvbGk+XG4gICAgICMgICAgIDxsaT5oc2wo4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSkg4oCUIHNhbWUgYXMgaHNiPC9saT5cbiAgICAgIyA8L3VsPlxuICAgICA9IChvYmplY3QpIFJHQiBvYmplY3QgaW4gZm9ybWF0OlxuICAgICBvIHtcbiAgICAgbyAgICAgciAobnVtYmVyKSByZWQsXG4gICAgIG8gICAgIGcgKG51bWJlcikgZ3JlZW4sXG4gICAgIG8gICAgIGIgKG51bWJlcikgYmx1ZVxuICAgICBvICAgICBoZXggKHN0cmluZykgY29sb3IgaW4gSFRNTC9DU1MgZm9ybWF0OiAj4oCi4oCi4oCi4oCi4oCi4oCiLFxuICAgICBvICAgICBlcnJvciAoYm9vbGVhbikgdHJ1ZSBpZiBzdHJpbmcgY2Fu4oCZdCBiZSBwYXJzZWRcbiAgICAgbyB9XG4gICAgXFwqL1xuICAgIFIuZ2V0UkdCID0gY2FjaGVyKGZ1bmN0aW9uIChjb2xvdXIpIHtcbiAgICAgICAgaWYgKCFjb2xvdXIgfHwgISEoKGNvbG91ciA9IFN0cihjb2xvdXIpKS5pbmRleE9mKFwiLVwiKSArIDEpKSB7XG4gICAgICAgICAgICByZXR1cm4ge3I6IC0xLCBnOiAtMSwgYjogLTEsIGhleDogXCJub25lXCIsIGVycm9yOiAxLCB0b1N0cmluZzogY2xyVG9TdHJpbmd9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2xvdXIgPT0gXCJub25lXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB7cjogLTEsIGc6IC0xLCBiOiAtMSwgaGV4OiBcIm5vbmVcIiwgdG9TdHJpbmc6IGNsclRvU3RyaW5nfTtcbiAgICAgICAgfVxuICAgICAgICAhKGhzcmdbaGFzXShjb2xvdXIudG9Mb3dlckNhc2UoKS5zdWJzdHJpbmcoMCwgMikpIHx8IGNvbG91ci5jaGFyQXQoKSA9PSBcIiNcIikgJiYgKGNvbG91ciA9IHRvSGV4KGNvbG91cikpO1xuICAgICAgICB2YXIgcmVzLFxuICAgICAgICAgICAgcmVkLFxuICAgICAgICAgICAgZ3JlZW4sXG4gICAgICAgICAgICBibHVlLFxuICAgICAgICAgICAgb3BhY2l0eSxcbiAgICAgICAgICAgIHQsXG4gICAgICAgICAgICB2YWx1ZXMsXG4gICAgICAgICAgICByZ2IgPSBjb2xvdXIubWF0Y2goY29sb3VyUmVnRXhwKTtcbiAgICAgICAgaWYgKHJnYikge1xuICAgICAgICAgICAgaWYgKHJnYlsyXSkge1xuICAgICAgICAgICAgICAgIGJsdWUgPSB0b0ludChyZ2JbMl0uc3Vic3RyaW5nKDUpLCAxNik7XG4gICAgICAgICAgICAgICAgZ3JlZW4gPSB0b0ludChyZ2JbMl0uc3Vic3RyaW5nKDMsIDUpLCAxNik7XG4gICAgICAgICAgICAgICAgcmVkID0gdG9JbnQocmdiWzJdLnN1YnN0cmluZygxLCAzKSwgMTYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJnYlszXSkge1xuICAgICAgICAgICAgICAgIGJsdWUgPSB0b0ludCgodCA9IHJnYlszXS5jaGFyQXQoMykpICsgdCwgMTYpO1xuICAgICAgICAgICAgICAgIGdyZWVuID0gdG9JbnQoKHQgPSByZ2JbM10uY2hhckF0KDIpKSArIHQsIDE2KTtcbiAgICAgICAgICAgICAgICByZWQgPSB0b0ludCgodCA9IHJnYlszXS5jaGFyQXQoMSkpICsgdCwgMTYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJnYls0XSkge1xuICAgICAgICAgICAgICAgIHZhbHVlcyA9IHJnYls0XVtzcGxpdF0oY29tbWFTcGFjZXMpO1xuICAgICAgICAgICAgICAgIHJlZCA9IHRvRmxvYXQodmFsdWVzWzBdKTtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbMF0uc2xpY2UoLTEpID09IFwiJVwiICYmIChyZWQgKj0gMi41NSk7XG4gICAgICAgICAgICAgICAgZ3JlZW4gPSB0b0Zsb2F0KHZhbHVlc1sxXSk7XG4gICAgICAgICAgICAgICAgdmFsdWVzWzFdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAoZ3JlZW4gKj0gMi41NSk7XG4gICAgICAgICAgICAgICAgYmx1ZSA9IHRvRmxvYXQodmFsdWVzWzJdKTtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbMl0uc2xpY2UoLTEpID09IFwiJVwiICYmIChibHVlICo9IDIuNTUpO1xuICAgICAgICAgICAgICAgIHJnYlsxXS50b0xvd2VyQ2FzZSgpLnNsaWNlKDAsIDQpID09IFwicmdiYVwiICYmIChvcGFjaXR5ID0gdG9GbG9hdCh2YWx1ZXNbM10pKTtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbM10gJiYgdmFsdWVzWzNdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAob3BhY2l0eSAvPSAxMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJnYls1XSkge1xuICAgICAgICAgICAgICAgIHZhbHVlcyA9IHJnYls1XVtzcGxpdF0oY29tbWFTcGFjZXMpO1xuICAgICAgICAgICAgICAgIHJlZCA9IHRvRmxvYXQodmFsdWVzWzBdKTtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbMF0uc2xpY2UoLTEpID09IFwiJVwiICYmIChyZWQgKj0gMi41NSk7XG4gICAgICAgICAgICAgICAgZ3JlZW4gPSB0b0Zsb2F0KHZhbHVlc1sxXSk7XG4gICAgICAgICAgICAgICAgdmFsdWVzWzFdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAoZ3JlZW4gKj0gMi41NSk7XG4gICAgICAgICAgICAgICAgYmx1ZSA9IHRvRmxvYXQodmFsdWVzWzJdKTtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbMl0uc2xpY2UoLTEpID09IFwiJVwiICYmIChibHVlICo9IDIuNTUpO1xuICAgICAgICAgICAgICAgICh2YWx1ZXNbMF0uc2xpY2UoLTMpID09IFwiZGVnXCIgfHwgdmFsdWVzWzBdLnNsaWNlKC0xKSA9PSBcIlxceGIwXCIpICYmIChyZWQgLz0gMzYwKTtcbiAgICAgICAgICAgICAgICByZ2JbMV0udG9Mb3dlckNhc2UoKS5zbGljZSgwLCA0KSA9PSBcImhzYmFcIiAmJiAob3BhY2l0eSA9IHRvRmxvYXQodmFsdWVzWzNdKSk7XG4gICAgICAgICAgICAgICAgdmFsdWVzWzNdICYmIHZhbHVlc1szXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKG9wYWNpdHkgLz0gMTAwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUi5oc2IycmdiKHJlZCwgZ3JlZW4sIGJsdWUsIG9wYWNpdHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJnYls2XSkge1xuICAgICAgICAgICAgICAgIHZhbHVlcyA9IHJnYls2XVtzcGxpdF0oY29tbWFTcGFjZXMpO1xuICAgICAgICAgICAgICAgIHJlZCA9IHRvRmxvYXQodmFsdWVzWzBdKTtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbMF0uc2xpY2UoLTEpID09IFwiJVwiICYmIChyZWQgKj0gMi41NSk7XG4gICAgICAgICAgICAgICAgZ3JlZW4gPSB0b0Zsb2F0KHZhbHVlc1sxXSk7XG4gICAgICAgICAgICAgICAgdmFsdWVzWzFdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAoZ3JlZW4gKj0gMi41NSk7XG4gICAgICAgICAgICAgICAgYmx1ZSA9IHRvRmxvYXQodmFsdWVzWzJdKTtcbiAgICAgICAgICAgICAgICB2YWx1ZXNbMl0uc2xpY2UoLTEpID09IFwiJVwiICYmIChibHVlICo9IDIuNTUpO1xuICAgICAgICAgICAgICAgICh2YWx1ZXNbMF0uc2xpY2UoLTMpID09IFwiZGVnXCIgfHwgdmFsdWVzWzBdLnNsaWNlKC0xKSA9PSBcIlxceGIwXCIpICYmIChyZWQgLz0gMzYwKTtcbiAgICAgICAgICAgICAgICByZ2JbMV0udG9Mb3dlckNhc2UoKS5zbGljZSgwLCA0KSA9PSBcImhzbGFcIiAmJiAob3BhY2l0eSA9IHRvRmxvYXQodmFsdWVzWzNdKSk7XG4gICAgICAgICAgICAgICAgdmFsdWVzWzNdICYmIHZhbHVlc1szXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKG9wYWNpdHkgLz0gMTAwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUi5oc2wycmdiKHJlZCwgZ3JlZW4sIGJsdWUsIG9wYWNpdHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmdiID0ge3I6IHJlZCwgZzogZ3JlZW4sIGI6IGJsdWUsIHRvU3RyaW5nOiBjbHJUb1N0cmluZ307XG4gICAgICAgICAgICByZ2IuaGV4ID0gXCIjXCIgKyAoMTY3NzcyMTYgfCBibHVlIHwgKGdyZWVuIDw8IDgpIHwgKHJlZCA8PCAxNikpLnRvU3RyaW5nKDE2KS5zbGljZSgxKTtcbiAgICAgICAgICAgIFIuaXMob3BhY2l0eSwgXCJmaW5pdGVcIikgJiYgKHJnYi5vcGFjaXR5ID0gb3BhY2l0eSk7XG4gICAgICAgICAgICByZXR1cm4gcmdiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7cjogLTEsIGc6IC0xLCBiOiAtMSwgaGV4OiBcIm5vbmVcIiwgZXJyb3I6IDEsIHRvU3RyaW5nOiBjbHJUb1N0cmluZ307XG4gICAgfSwgUik7XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuaHNiXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDb252ZXJ0cyBIU0IgdmFsdWVzIHRvIGhleCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29sb3VyLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoIChudW1iZXIpIGh1ZVxuICAgICAtIHMgKG51bWJlcikgc2F0dXJhdGlvblxuICAgICAtIGIgKG51bWJlcikgdmFsdWUgb3IgYnJpZ2h0bmVzc1xuICAgICA9IChzdHJpbmcpIGhleCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29sb3VyLlxuICAgIFxcKi9cbiAgICBSLmhzYiA9IGNhY2hlcihmdW5jdGlvbiAoaCwgcywgYikge1xuICAgICAgICByZXR1cm4gUi5oc2IycmdiKGgsIHMsIGIpLmhleDtcbiAgICB9KTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5oc2xcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENvbnZlcnRzIEhTTCB2YWx1ZXMgdG8gaGV4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb2xvdXIuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGggKG51bWJlcikgaHVlXG4gICAgIC0gcyAobnVtYmVyKSBzYXR1cmF0aW9uXG4gICAgIC0gbCAobnVtYmVyKSBsdW1pbm9zaXR5XG4gICAgID0gKHN0cmluZykgaGV4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb2xvdXIuXG4gICAgXFwqL1xuICAgIFIuaHNsID0gY2FjaGVyKGZ1bmN0aW9uIChoLCBzLCBsKSB7XG4gICAgICAgIHJldHVybiBSLmhzbDJyZ2IoaCwgcywgbCkuaGV4O1xuICAgIH0pO1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnJnYlxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ29udmVydHMgUkdCIHZhbHVlcyB0byBoZXggcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbG91ci5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gciAobnVtYmVyKSByZWRcbiAgICAgLSBnIChudW1iZXIpIGdyZWVuXG4gICAgIC0gYiAobnVtYmVyKSBibHVlXG4gICAgID0gKHN0cmluZykgaGV4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb2xvdXIuXG4gICAgXFwqL1xuICAgIFIucmdiID0gY2FjaGVyKGZ1bmN0aW9uIChyLCBnLCBiKSB7XG4gICAgICAgIHJldHVybiBcIiNcIiArICgxNjc3NzIxNiB8IGIgfCAoZyA8PCA4KSB8IChyIDw8IDE2KSkudG9TdHJpbmcoMTYpLnNsaWNlKDEpO1xuICAgIH0pO1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmdldENvbG9yXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBPbiBlYWNoIGNhbGwgcmV0dXJucyBuZXh0IGNvbG91ciBpbiB0aGUgc3BlY3RydW0uIFRvIHJlc2V0IGl0IGJhY2sgdG8gcmVkIGNhbGwgQFJhcGhhZWwuZ2V0Q29sb3IucmVzZXRcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gdmFsdWUgKG51bWJlcikgI29wdGlvbmFsIGJyaWdodG5lc3MsIGRlZmF1bHQgaXMgYDAuNzVgXG4gICAgID0gKHN0cmluZykgaGV4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb2xvdXIuXG4gICAgXFwqL1xuICAgIFIuZ2V0Q29sb3IgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5nZXRDb2xvci5zdGFydCA9IHRoaXMuZ2V0Q29sb3Iuc3RhcnQgfHwge2g6IDAsIHM6IDEsIGI6IHZhbHVlIHx8IC43NX0sXG4gICAgICAgICAgICByZ2IgPSB0aGlzLmhzYjJyZ2Ioc3RhcnQuaCwgc3RhcnQucywgc3RhcnQuYik7XG4gICAgICAgIHN0YXJ0LmggKz0gLjA3NTtcbiAgICAgICAgaWYgKHN0YXJ0LmggPiAxKSB7XG4gICAgICAgICAgICBzdGFydC5oID0gMDtcbiAgICAgICAgICAgIHN0YXJ0LnMgLT0gLjI7XG4gICAgICAgICAgICBzdGFydC5zIDw9IDAgJiYgKHRoaXMuZ2V0Q29sb3Iuc3RhcnQgPSB7aDogMCwgczogMSwgYjogc3RhcnQuYn0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZ2IuaGV4O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuZ2V0Q29sb3IucmVzZXRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlc2V0cyBzcGVjdHJ1bSBwb3NpdGlvbiBmb3IgQFJhcGhhZWwuZ2V0Q29sb3IgYmFjayB0byByZWQuXG4gICAgXFwqL1xuICAgIFIuZ2V0Q29sb3IucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnN0YXJ0O1xuICAgIH07XG5cbiAgICAvLyBodHRwOi8vc2NoZXBlcnMuY2MvZ2V0dGluZy10by10aGUtcG9pbnRcbiAgICBmdW5jdGlvbiBjYXRtdWxsUm9tMmJlemllcihjcnAsIHopIHtcbiAgICAgICAgdmFyIGQgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlMZW4gPSBjcnAubGVuZ3RoOyBpTGVuIC0gMiAqICF6ID4gaTsgaSArPSAyKSB7XG4gICAgICAgICAgICB2YXIgcCA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHt4OiArY3JwW2kgLSAyXSwgeTogK2NycFtpIC0gMV19LFxuICAgICAgICAgICAgICAgICAgICAgICAge3g6ICtjcnBbaV0sICAgICB5OiArY3JwW2kgKyAxXX0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7eDogK2NycFtpICsgMl0sIHk6ICtjcnBbaSArIDNdfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt4OiArY3JwW2kgKyA0XSwgeTogK2NycFtpICsgNV19XG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAoeikge1xuICAgICAgICAgICAgICAgIGlmICghaSkge1xuICAgICAgICAgICAgICAgICAgICBwWzBdID0ge3g6ICtjcnBbaUxlbiAtIDJdLCB5OiArY3JwW2lMZW4gLSAxXX07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpTGVuIC0gNCA9PSBpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBbM10gPSB7eDogK2NycFswXSwgeTogK2NycFsxXX07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpTGVuIC0gMiA9PSBpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBbMl0gPSB7eDogK2NycFswXSwgeTogK2NycFsxXX07XG4gICAgICAgICAgICAgICAgICAgIHBbM10gPSB7eDogK2NycFsyXSwgeTogK2NycFszXX07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaUxlbiAtIDQgPT0gaSkge1xuICAgICAgICAgICAgICAgICAgICBwWzNdID0gcFsyXTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBbMF0gPSB7eDogK2NycFtpXSwgeTogK2NycFtpICsgMV19O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGQucHVzaChbXCJDXCIsXG4gICAgICAgICAgICAgICAgICAoLXBbMF0ueCArIDYgKiBwWzFdLnggKyBwWzJdLngpIC8gNixcbiAgICAgICAgICAgICAgICAgICgtcFswXS55ICsgNiAqIHBbMV0ueSArIHBbMl0ueSkgLyA2LFxuICAgICAgICAgICAgICAgICAgKHBbMV0ueCArIDYgKiBwWzJdLnggLSBwWzNdLngpIC8gNixcbiAgICAgICAgICAgICAgICAgIChwWzFdLnkgKyA2KnBbMl0ueSAtIHBbM10ueSkgLyA2LFxuICAgICAgICAgICAgICAgICAgcFsyXS54LFxuICAgICAgICAgICAgICAgICAgcFsyXS55XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkO1xuICAgIH1cbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5wYXJzZVBhdGhTdHJpbmdcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogUGFyc2VzIGdpdmVuIHBhdGggc3RyaW5nIGludG8gYW4gYXJyYXkgb2YgYXJyYXlzIG9mIHBhdGggc2VnbWVudHMuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHBhdGhTdHJpbmcgKHN0cmluZ3xhcnJheSkgcGF0aCBzdHJpbmcgb3IgYXJyYXkgb2Ygc2VnbWVudHMgKGluIHRoZSBsYXN0IGNhc2UgaXQgd2lsbCBiZSByZXR1cm5lZCBzdHJhaWdodCBhd2F5KVxuICAgICA9IChhcnJheSkgYXJyYXkgb2Ygc2VnbWVudHMuXG4gICAgXFwqL1xuICAgIFIucGFyc2VQYXRoU3RyaW5nID0gZnVuY3Rpb24gKHBhdGhTdHJpbmcpIHtcbiAgICAgICAgaWYgKCFwYXRoU3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcHRoID0gcGF0aHMocGF0aFN0cmluZyk7XG4gICAgICAgIGlmIChwdGguYXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gcGF0aENsb25lKHB0aC5hcnIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgcGFyYW1Db3VudHMgPSB7YTogNywgYzogNiwgaDogMSwgbDogMiwgbTogMiwgcjogNCwgcTogNCwgczogNCwgdDogMiwgdjogMSwgejogMH0sXG4gICAgICAgICAgICBkYXRhID0gW107XG4gICAgICAgIGlmIChSLmlzKHBhdGhTdHJpbmcsIGFycmF5KSAmJiBSLmlzKHBhdGhTdHJpbmdbMF0sIGFycmF5KSkgeyAvLyByb3VnaCBhc3N1bXB0aW9uXG4gICAgICAgICAgICBkYXRhID0gcGF0aENsb25lKHBhdGhTdHJpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIFN0cihwYXRoU3RyaW5nKS5yZXBsYWNlKHBhdGhDb21tYW5kLCBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBjLnJlcGxhY2UocGF0aFZhbHVlcywgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgYiAmJiBwYXJhbXMucHVzaCgrYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUgPT0gXCJtXCIgJiYgcGFyYW1zLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKFtiXVtjb25jYXRdKHBhcmFtcy5zcGxpY2UoMCwgMikpKTtcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IFwibFwiO1xuICAgICAgICAgICAgICAgICAgICBiID0gYiA9PSBcIm1cIiA/IFwibFwiIDogXCJMXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChuYW1lID09IFwiclwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChbYl1bY29uY2F0XShwYXJhbXMpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Ugd2hpbGUgKHBhcmFtcy5sZW5ndGggPj0gcGFyYW1Db3VudHNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKFtiXVtjb25jYXRdKHBhcmFtcy5zcGxpY2UoMCwgcGFyYW1Db3VudHNbbmFtZV0pKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGFyYW1Db3VudHNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZGF0YS50b1N0cmluZyA9IFIuX3BhdGgyc3RyaW5nO1xuICAgICAgICBwdGguYXJyID0gcGF0aENsb25lKGRhdGEpO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnBhcnNlVHJhbnNmb3JtU3RyaW5nXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIFBhcnNlcyBnaXZlbiBwYXRoIHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIHRyYW5zZm9ybWF0aW9ucy5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gVFN0cmluZyAoc3RyaW5nfGFycmF5KSB0cmFuc2Zvcm0gc3RyaW5nIG9yIGFycmF5IG9mIHRyYW5zZm9ybWF0aW9ucyAoaW4gdGhlIGxhc3QgY2FzZSBpdCB3aWxsIGJlIHJldHVybmVkIHN0cmFpZ2h0IGF3YXkpXG4gICAgID0gKGFycmF5KSBhcnJheSBvZiB0cmFuc2Zvcm1hdGlvbnMuXG4gICAgXFwqL1xuICAgIFIucGFyc2VUcmFuc2Zvcm1TdHJpbmcgPSBjYWNoZXIoZnVuY3Rpb24gKFRTdHJpbmcpIHtcbiAgICAgICAgaWYgKCFUU3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGFyYW1Db3VudHMgPSB7cjogMywgczogNCwgdDogMiwgbTogNn0sXG4gICAgICAgICAgICBkYXRhID0gW107XG4gICAgICAgIGlmIChSLmlzKFRTdHJpbmcsIGFycmF5KSAmJiBSLmlzKFRTdHJpbmdbMF0sIGFycmF5KSkgeyAvLyByb3VnaCBhc3N1bXB0aW9uXG4gICAgICAgICAgICBkYXRhID0gcGF0aENsb25lKFRTdHJpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIFN0cihUU3RyaW5nKS5yZXBsYWNlKHRDb21tYW5kLCBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGxvd2VyQ2FzZS5jYWxsKGIpO1xuICAgICAgICAgICAgICAgIGMucmVwbGFjZShwYXRoVmFsdWVzLCBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICBiICYmIHBhcmFtcy5wdXNoKCtiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBkYXRhLnB1c2goW2JdW2NvbmNhdF0ocGFyYW1zKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBkYXRhLnRvU3RyaW5nID0gUi5fcGF0aDJzdHJpbmc7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0pO1xuICAgIC8vIFBBVEhTXG4gICAgdmFyIHBhdGhzID0gZnVuY3Rpb24gKHBzKSB7XG4gICAgICAgIHZhciBwID0gcGF0aHMucHMgPSBwYXRocy5wcyB8fCB7fTtcbiAgICAgICAgaWYgKHBbcHNdKSB7XG4gICAgICAgICAgICBwW3BzXS5zbGVlcCA9IDEwMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBbcHNdID0ge1xuICAgICAgICAgICAgICAgIHNsZWVwOiAxMDBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gcCkgaWYgKHBbaGFzXShrZXkpICYmIGtleSAhPSBwcykge1xuICAgICAgICAgICAgICAgIHBba2V5XS5zbGVlcC0tO1xuICAgICAgICAgICAgICAgICFwW2tleV0uc2xlZXAgJiYgZGVsZXRlIHBba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwW3BzXTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmZpbmREb3RzQXRTZWdtZW50XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIEZpbmQgZG90IGNvb3JkaW5hdGVzIG9uIHRoZSBnaXZlbiBjdWJpYyBiZXppZXIgY3VydmUgYXQgdGhlIGdpdmVuIHQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHAxeCAobnVtYmVyKSB4IG9mIHRoZSBmaXJzdCBwb2ludCBvZiB0aGUgY3VydmVcbiAgICAgLSBwMXkgKG51bWJlcikgeSBvZiB0aGUgZmlyc3QgcG9pbnQgb2YgdGhlIGN1cnZlXG4gICAgIC0gYzF4IChudW1iZXIpIHggb2YgdGhlIGZpcnN0IGFuY2hvciBvZiB0aGUgY3VydmVcbiAgICAgLSBjMXkgKG51bWJlcikgeSBvZiB0aGUgZmlyc3QgYW5jaG9yIG9mIHRoZSBjdXJ2ZVxuICAgICAtIGMyeCAobnVtYmVyKSB4IG9mIHRoZSBzZWNvbmQgYW5jaG9yIG9mIHRoZSBjdXJ2ZVxuICAgICAtIGMyeSAobnVtYmVyKSB5IG9mIHRoZSBzZWNvbmQgYW5jaG9yIG9mIHRoZSBjdXJ2ZVxuICAgICAtIHAyeCAobnVtYmVyKSB4IG9mIHRoZSBzZWNvbmQgcG9pbnQgb2YgdGhlIGN1cnZlXG4gICAgIC0gcDJ5IChudW1iZXIpIHkgb2YgdGhlIHNlY29uZCBwb2ludCBvZiB0aGUgY3VydmVcbiAgICAgLSB0IChudW1iZXIpIHBvc2l0aW9uIG9uIHRoZSBjdXJ2ZSAoMC4uMSlcbiAgICAgPSAob2JqZWN0KSBwb2ludCBpbmZvcm1hdGlvbiBpbiBmb3JtYXQ6XG4gICAgIG8ge1xuICAgICBvICAgICB4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50XG4gICAgIG8gICAgIHk6IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnRcbiAgICAgbyAgICAgbToge1xuICAgICBvICAgICAgICAgeDogKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSBsZWZ0IGFuY2hvclxuICAgICBvICAgICAgICAgeTogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBsZWZ0IGFuY2hvclxuICAgICBvICAgICB9XG4gICAgIG8gICAgIG46IHtcbiAgICAgbyAgICAgICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgcmlnaHQgYW5jaG9yXG4gICAgIG8gICAgICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIHJpZ2h0IGFuY2hvclxuICAgICBvICAgICB9XG4gICAgIG8gICAgIHN0YXJ0OiB7XG4gICAgIG8gICAgICAgICB4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIHN0YXJ0IG9mIHRoZSBjdXJ2ZVxuICAgICBvICAgICAgICAgeTogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBzdGFydCBvZiB0aGUgY3VydmVcbiAgICAgbyAgICAgfVxuICAgICBvICAgICBlbmQ6IHtcbiAgICAgbyAgICAgICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgZW5kIG9mIHRoZSBjdXJ2ZVxuICAgICBvICAgICAgICAgeTogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBlbmQgb2YgdGhlIGN1cnZlXG4gICAgIG8gICAgIH1cbiAgICAgbyAgICAgYWxwaGE6IChudW1iZXIpIGFuZ2xlIG9mIHRoZSBjdXJ2ZSBkZXJpdmF0aXZlIGF0IHRoZSBwb2ludFxuICAgICBvIH1cbiAgICBcXCovXG4gICAgUi5maW5kRG90c0F0U2VnbWVudCA9IGZ1bmN0aW9uIChwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeSwgdCkge1xuICAgICAgICB2YXIgdDEgPSAxIC0gdCxcbiAgICAgICAgICAgIHQxMyA9IHBvdyh0MSwgMyksXG4gICAgICAgICAgICB0MTIgPSBwb3codDEsIDIpLFxuICAgICAgICAgICAgdDIgPSB0ICogdCxcbiAgICAgICAgICAgIHQzID0gdDIgKiB0LFxuICAgICAgICAgICAgeCA9IHQxMyAqIHAxeCArIHQxMiAqIDMgKiB0ICogYzF4ICsgdDEgKiAzICogdCAqIHQgKiBjMnggKyB0MyAqIHAyeCxcbiAgICAgICAgICAgIHkgPSB0MTMgKiBwMXkgKyB0MTIgKiAzICogdCAqIGMxeSArIHQxICogMyAqIHQgKiB0ICogYzJ5ICsgdDMgKiBwMnksXG4gICAgICAgICAgICBteCA9IHAxeCArIDIgKiB0ICogKGMxeCAtIHAxeCkgKyB0MiAqIChjMnggLSAyICogYzF4ICsgcDF4KSxcbiAgICAgICAgICAgIG15ID0gcDF5ICsgMiAqIHQgKiAoYzF5IC0gcDF5KSArIHQyICogKGMyeSAtIDIgKiBjMXkgKyBwMXkpLFxuICAgICAgICAgICAgbnggPSBjMXggKyAyICogdCAqIChjMnggLSBjMXgpICsgdDIgKiAocDJ4IC0gMiAqIGMyeCArIGMxeCksXG4gICAgICAgICAgICBueSA9IGMxeSArIDIgKiB0ICogKGMyeSAtIGMxeSkgKyB0MiAqIChwMnkgLSAyICogYzJ5ICsgYzF5KSxcbiAgICAgICAgICAgIGF4ID0gdDEgKiBwMXggKyB0ICogYzF4LFxuICAgICAgICAgICAgYXkgPSB0MSAqIHAxeSArIHQgKiBjMXksXG4gICAgICAgICAgICBjeCA9IHQxICogYzJ4ICsgdCAqIHAyeCxcbiAgICAgICAgICAgIGN5ID0gdDEgKiBjMnkgKyB0ICogcDJ5LFxuICAgICAgICAgICAgYWxwaGEgPSAoOTAgLSBtYXRoLmF0YW4yKG14IC0gbngsIG15IC0gbnkpICogMTgwIC8gUEkpO1xuICAgICAgICAobXggPiBueCB8fCBteSA8IG55KSAmJiAoYWxwaGEgKz0gMTgwKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgbToge3g6IG14LCB5OiBteX0sXG4gICAgICAgICAgICBuOiB7eDogbngsIHk6IG55fSxcbiAgICAgICAgICAgIHN0YXJ0OiB7eDogYXgsIHk6IGF5fSxcbiAgICAgICAgICAgIGVuZDoge3g6IGN4LCB5OiBjeX0sXG4gICAgICAgICAgICBhbHBoYTogYWxwaGFcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmJlemllckJCb3hcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogUmV0dXJuIGJvdW5kaW5nIGJveCBvZiBhIGdpdmVuIGN1YmljIGJlemllciBjdXJ2ZVxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBwMXggKG51bWJlcikgeCBvZiB0aGUgZmlyc3QgcG9pbnQgb2YgdGhlIGN1cnZlXG4gICAgIC0gcDF5IChudW1iZXIpIHkgb2YgdGhlIGZpcnN0IHBvaW50IG9mIHRoZSBjdXJ2ZVxuICAgICAtIGMxeCAobnVtYmVyKSB4IG9mIHRoZSBmaXJzdCBhbmNob3Igb2YgdGhlIGN1cnZlXG4gICAgIC0gYzF5IChudW1iZXIpIHkgb2YgdGhlIGZpcnN0IGFuY2hvciBvZiB0aGUgY3VydmVcbiAgICAgLSBjMnggKG51bWJlcikgeCBvZiB0aGUgc2Vjb25kIGFuY2hvciBvZiB0aGUgY3VydmVcbiAgICAgLSBjMnkgKG51bWJlcikgeSBvZiB0aGUgc2Vjb25kIGFuY2hvciBvZiB0aGUgY3VydmVcbiAgICAgLSBwMnggKG51bWJlcikgeCBvZiB0aGUgc2Vjb25kIHBvaW50IG9mIHRoZSBjdXJ2ZVxuICAgICAtIHAyeSAobnVtYmVyKSB5IG9mIHRoZSBzZWNvbmQgcG9pbnQgb2YgdGhlIGN1cnZlXG4gICAgICogb3JcbiAgICAgLSBiZXogKGFycmF5KSBhcnJheSBvZiBzaXggcG9pbnRzIGZvciBiZXppZXIgY3VydmVcbiAgICAgPSAob2JqZWN0KSBwb2ludCBpbmZvcm1hdGlvbiBpbiBmb3JtYXQ6XG4gICAgIG8ge1xuICAgICBvICAgICBtaW46IHtcbiAgICAgbyAgICAgICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgbGVmdCBwb2ludFxuICAgICBvICAgICAgICAgeTogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSB0b3AgcG9pbnRcbiAgICAgbyAgICAgfVxuICAgICBvICAgICBtYXg6IHtcbiAgICAgbyAgICAgICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgcmlnaHQgcG9pbnRcbiAgICAgbyAgICAgICAgIHk6IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgYm90dG9tIHBvaW50XG4gICAgIG8gICAgIH1cbiAgICAgbyB9XG4gICAgXFwqL1xuICAgIFIuYmV6aWVyQkJveCA9IGZ1bmN0aW9uIChwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeSkge1xuICAgICAgICBpZiAoIVIuaXMocDF4LCBcImFycmF5XCIpKSB7XG4gICAgICAgICAgICBwMXggPSBbcDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnldO1xuICAgICAgICB9XG4gICAgICAgIHZhciBiYm94ID0gY3VydmVEaW0uYXBwbHkobnVsbCwgcDF4KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IGJib3gubWluLngsXG4gICAgICAgICAgICB5OiBiYm94Lm1pbi55LFxuICAgICAgICAgICAgeDI6IGJib3gubWF4LngsXG4gICAgICAgICAgICB5MjogYmJveC5tYXgueSxcbiAgICAgICAgICAgIHdpZHRoOiBiYm94Lm1heC54IC0gYmJveC5taW4ueCxcbiAgICAgICAgICAgIGhlaWdodDogYmJveC5tYXgueSAtIGJib3gubWluLnlcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmlzUG9pbnRJbnNpZGVCQm94XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIGdpdmVuIHBvaW50IGlzIGluc2lkZSBib3VuZGluZyBib3hlcy5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gYmJveCAoc3RyaW5nKSBib3VuZGluZyBib3hcbiAgICAgLSB4IChzdHJpbmcpIHggY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnRcbiAgICAgLSB5IChzdHJpbmcpIHkgY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnRcbiAgICAgPSAoYm9vbGVhbikgYHRydWVgIGlmIHBvaW50IGluc2lkZVxuICAgIFxcKi9cbiAgICBSLmlzUG9pbnRJbnNpZGVCQm94ID0gZnVuY3Rpb24gKGJib3gsIHgsIHkpIHtcbiAgICAgICAgcmV0dXJuIHggPj0gYmJveC54ICYmIHggPD0gYmJveC54MiAmJiB5ID49IGJib3gueSAmJiB5IDw9IGJib3gueTI7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5pc0JCb3hJbnRlcnNlY3RcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdHdvIGJvdW5kaW5nIGJveGVzIGludGVyc2VjdFxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBiYm94MSAoc3RyaW5nKSBmaXJzdCBib3VuZGluZyBib3hcbiAgICAgLSBiYm94MiAoc3RyaW5nKSBzZWNvbmQgYm91bmRpbmcgYm94XG4gICAgID0gKGJvb2xlYW4pIGB0cnVlYCBpZiB0aGV5IGludGVyc2VjdFxuICAgIFxcKi9cbiAgICBSLmlzQkJveEludGVyc2VjdCA9IGZ1bmN0aW9uIChiYm94MSwgYmJveDIpIHtcbiAgICAgICAgdmFyIGkgPSBSLmlzUG9pbnRJbnNpZGVCQm94O1xuICAgICAgICByZXR1cm4gaShiYm94MiwgYmJveDEueCwgYmJveDEueSlcbiAgICAgICAgICAgIHx8IGkoYmJveDIsIGJib3gxLngyLCBiYm94MS55KVxuICAgICAgICAgICAgfHwgaShiYm94MiwgYmJveDEueCwgYmJveDEueTIpXG4gICAgICAgICAgICB8fCBpKGJib3gyLCBiYm94MS54MiwgYmJveDEueTIpXG4gICAgICAgICAgICB8fCBpKGJib3gxLCBiYm94Mi54LCBiYm94Mi55KVxuICAgICAgICAgICAgfHwgaShiYm94MSwgYmJveDIueDIsIGJib3gyLnkpXG4gICAgICAgICAgICB8fCBpKGJib3gxLCBiYm94Mi54LCBiYm94Mi55MilcbiAgICAgICAgICAgIHx8IGkoYmJveDEsIGJib3gyLngyLCBiYm94Mi55MilcbiAgICAgICAgICAgIHx8IChiYm94MS54IDwgYmJveDIueDIgJiYgYmJveDEueCA+IGJib3gyLnggfHwgYmJveDIueCA8IGJib3gxLngyICYmIGJib3gyLnggPiBiYm94MS54KVxuICAgICAgICAgICAgJiYgKGJib3gxLnkgPCBiYm94Mi55MiAmJiBiYm94MS55ID4gYmJveDIueSB8fCBiYm94Mi55IDwgYmJveDEueTIgJiYgYmJveDIueSA+IGJib3gxLnkpO1xuICAgIH07XG4gICAgZnVuY3Rpb24gYmFzZTModCwgcDEsIHAyLCBwMywgcDQpIHtcbiAgICAgICAgdmFyIHQxID0gLTMgKiBwMSArIDkgKiBwMiAtIDkgKiBwMyArIDMgKiBwNCxcbiAgICAgICAgICAgIHQyID0gdCAqIHQxICsgNiAqIHAxIC0gMTIgKiBwMiArIDYgKiBwMztcbiAgICAgICAgcmV0dXJuIHQgKiB0MiAtIDMgKiBwMSArIDMgKiBwMjtcbiAgICB9XG4gICAgZnVuY3Rpb24gYmV6bGVuKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCwgeikge1xuICAgICAgICBpZiAoeiA9PSBudWxsKSB7XG4gICAgICAgICAgICB6ID0gMTtcbiAgICAgICAgfVxuICAgICAgICB6ID0geiA+IDEgPyAxIDogeiA8IDAgPyAwIDogejtcbiAgICAgICAgdmFyIHoyID0geiAvIDIsXG4gICAgICAgICAgICBuID0gMTIsXG4gICAgICAgICAgICBUdmFsdWVzID0gWy0wLjEyNTIsMC4xMjUyLC0wLjM2NzgsMC4zNjc4LC0wLjU4NzMsMC41ODczLC0wLjc2OTksMC43Njk5LC0wLjkwNDEsMC45MDQxLC0wLjk4MTYsMC45ODE2XSxcbiAgICAgICAgICAgIEN2YWx1ZXMgPSBbMC4yNDkxLDAuMjQ5MSwwLjIzMzUsMC4yMzM1LDAuMjAzMiwwLjIwMzIsMC4xNjAxLDAuMTYwMSwwLjEwNjksMC4xMDY5LDAuMDQ3MiwwLjA0NzJdLFxuICAgICAgICAgICAgc3VtID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjdCA9IHoyICogVHZhbHVlc1tpXSArIHoyLFxuICAgICAgICAgICAgICAgIHhiYXNlID0gYmFzZTMoY3QsIHgxLCB4MiwgeDMsIHg0KSxcbiAgICAgICAgICAgICAgICB5YmFzZSA9IGJhc2UzKGN0LCB5MSwgeTIsIHkzLCB5NCksXG4gICAgICAgICAgICAgICAgY29tYiA9IHhiYXNlICogeGJhc2UgKyB5YmFzZSAqIHliYXNlO1xuICAgICAgICAgICAgc3VtICs9IEN2YWx1ZXNbaV0gKiBtYXRoLnNxcnQoY29tYik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHoyICogc3VtO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXRUYXRMZW4oeDEsIHkxLCB4MiwgeTIsIHgzLCB5MywgeDQsIHk0LCBsbCkge1xuICAgICAgICBpZiAobGwgPCAwIHx8IGJlemxlbih4MSwgeTEsIHgyLCB5MiwgeDMsIHkzLCB4NCwgeTQpIDwgbGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdCA9IDEsXG4gICAgICAgICAgICBzdGVwID0gdCAvIDIsXG4gICAgICAgICAgICB0MiA9IHQgLSBzdGVwLFxuICAgICAgICAgICAgbCxcbiAgICAgICAgICAgIGUgPSAuMDE7XG4gICAgICAgIGwgPSBiZXpsZW4oeDEsIHkxLCB4MiwgeTIsIHgzLCB5MywgeDQsIHk0LCB0Mik7XG4gICAgICAgIHdoaWxlIChhYnMobCAtIGxsKSA+IGUpIHtcbiAgICAgICAgICAgIHN0ZXAgLz0gMjtcbiAgICAgICAgICAgIHQyICs9IChsIDwgbGwgPyAxIDogLTEpICogc3RlcDtcbiAgICAgICAgICAgIGwgPSBiZXpsZW4oeDEsIHkxLCB4MiwgeTIsIHgzLCB5MywgeDQsIHk0LCB0Mik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbnRlcnNlY3QoeDEsIHkxLCB4MiwgeTIsIHgzLCB5MywgeDQsIHk0KSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIG1tYXgoeDEsIHgyKSA8IG1taW4oeDMsIHg0KSB8fFxuICAgICAgICAgICAgbW1pbih4MSwgeDIpID4gbW1heCh4MywgeDQpIHx8XG4gICAgICAgICAgICBtbWF4KHkxLCB5MikgPCBtbWluKHkzLCB5NCkgfHxcbiAgICAgICAgICAgIG1taW4oeTEsIHkyKSA+IG1tYXgoeTMsIHk0KVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbnggPSAoeDEgKiB5MiAtIHkxICogeDIpICogKHgzIC0geDQpIC0gKHgxIC0geDIpICogKHgzICogeTQgLSB5MyAqIHg0KSxcbiAgICAgICAgICAgIG55ID0gKHgxICogeTIgLSB5MSAqIHgyKSAqICh5MyAtIHk0KSAtICh5MSAtIHkyKSAqICh4MyAqIHk0IC0geTMgKiB4NCksXG4gICAgICAgICAgICBkZW5vbWluYXRvciA9ICh4MSAtIHgyKSAqICh5MyAtIHk0KSAtICh5MSAtIHkyKSAqICh4MyAtIHg0KTtcblxuICAgICAgICBpZiAoIWRlbm9taW5hdG9yKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHB4ID0gbnggLyBkZW5vbWluYXRvcixcbiAgICAgICAgICAgIHB5ID0gbnkgLyBkZW5vbWluYXRvcixcbiAgICAgICAgICAgIHB4MiA9ICtweC50b0ZpeGVkKDIpLFxuICAgICAgICAgICAgcHkyID0gK3B5LnRvRml4ZWQoMik7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHB4MiA8ICttbWluKHgxLCB4MikudG9GaXhlZCgyKSB8fFxuICAgICAgICAgICAgcHgyID4gK21tYXgoeDEsIHgyKS50b0ZpeGVkKDIpIHx8XG4gICAgICAgICAgICBweDIgPCArbW1pbih4MywgeDQpLnRvRml4ZWQoMikgfHxcbiAgICAgICAgICAgIHB4MiA+ICttbWF4KHgzLCB4NCkudG9GaXhlZCgyKSB8fFxuICAgICAgICAgICAgcHkyIDwgK21taW4oeTEsIHkyKS50b0ZpeGVkKDIpIHx8XG4gICAgICAgICAgICBweTIgPiArbW1heCh5MSwgeTIpLnRvRml4ZWQoMikgfHxcbiAgICAgICAgICAgIHB5MiA8ICttbWluKHkzLCB5NCkudG9GaXhlZCgyKSB8fFxuICAgICAgICAgICAgcHkyID4gK21tYXgoeTMsIHk0KS50b0ZpeGVkKDIpXG4gICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7eDogcHgsIHk6IHB5fTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW50ZXIoYmV6MSwgYmV6Mikge1xuICAgICAgICByZXR1cm4gaW50ZXJIZWxwZXIoYmV6MSwgYmV6Mik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludGVyQ291bnQoYmV6MSwgYmV6Mikge1xuICAgICAgICByZXR1cm4gaW50ZXJIZWxwZXIoYmV6MSwgYmV6MiwgMSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludGVySGVscGVyKGJlejEsIGJlejIsIGp1c3RDb3VudCkge1xuICAgICAgICB2YXIgYmJveDEgPSBSLmJlemllckJCb3goYmV6MSksXG4gICAgICAgICAgICBiYm94MiA9IFIuYmV6aWVyQkJveChiZXoyKTtcbiAgICAgICAgaWYgKCFSLmlzQkJveEludGVyc2VjdChiYm94MSwgYmJveDIpKSB7XG4gICAgICAgICAgICByZXR1cm4ganVzdENvdW50ID8gMCA6IFtdO1xuICAgICAgICB9XG4gICAgICAgIHZhciBsMSA9IGJlemxlbi5hcHBseSgwLCBiZXoxKSxcbiAgICAgICAgICAgIGwyID0gYmV6bGVuLmFwcGx5KDAsIGJlejIpLFxuICAgICAgICAgICAgbjEgPSB+fihsMSAvIDUpLFxuICAgICAgICAgICAgbjIgPSB+fihsMiAvIDUpLFxuICAgICAgICAgICAgZG90czEgPSBbXSxcbiAgICAgICAgICAgIGRvdHMyID0gW10sXG4gICAgICAgICAgICB4eSA9IHt9LFxuICAgICAgICAgICAgcmVzID0ganVzdENvdW50ID8gMCA6IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG4xICsgMTsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcCA9IFIuZmluZERvdHNBdFNlZ21lbnQuYXBwbHkoUiwgYmV6MS5jb25jYXQoaSAvIG4xKSk7XG4gICAgICAgICAgICBkb3RzMS5wdXNoKHt4OiBwLngsIHk6IHAueSwgdDogaSAvIG4xfSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG4yICsgMTsgaSsrKSB7XG4gICAgICAgICAgICBwID0gUi5maW5kRG90c0F0U2VnbWVudC5hcHBseShSLCBiZXoyLmNvbmNhdChpIC8gbjIpKTtcbiAgICAgICAgICAgIGRvdHMyLnB1c2goe3g6IHAueCwgeTogcC55LCB0OiBpIC8gbjJ9KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbjE7IGkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBuMjsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpID0gZG90czFbaV0sXG4gICAgICAgICAgICAgICAgICAgIGRpMSA9IGRvdHMxW2kgKyAxXSxcbiAgICAgICAgICAgICAgICAgICAgZGogPSBkb3RzMltqXSxcbiAgICAgICAgICAgICAgICAgICAgZGoxID0gZG90czJbaiArIDFdLFxuICAgICAgICAgICAgICAgICAgICBjaSA9IGFicyhkaTEueCAtIGRpLngpIDwgLjAwMSA/IFwieVwiIDogXCJ4XCIsXG4gICAgICAgICAgICAgICAgICAgIGNqID0gYWJzKGRqMS54IC0gZGoueCkgPCAuMDAxID8gXCJ5XCIgOiBcInhcIixcbiAgICAgICAgICAgICAgICAgICAgaXMgPSBpbnRlcnNlY3QoZGkueCwgZGkueSwgZGkxLngsIGRpMS55LCBkai54LCBkai55LCBkajEueCwgZGoxLnkpO1xuICAgICAgICAgICAgICAgIGlmIChpcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeHlbaXMueC50b0ZpeGVkKDQpXSA9PSBpcy55LnRvRml4ZWQoNCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHh5W2lzLngudG9GaXhlZCg0KV0gPSBpcy55LnRvRml4ZWQoNCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0MSA9IGRpLnQgKyBhYnMoKGlzW2NpXSAtIGRpW2NpXSkgLyAoZGkxW2NpXSAtIGRpW2NpXSkpICogKGRpMS50IC0gZGkudCksXG4gICAgICAgICAgICAgICAgICAgICAgICB0MiA9IGRqLnQgKyBhYnMoKGlzW2NqXSAtIGRqW2NqXSkgLyAoZGoxW2NqXSAtIGRqW2NqXSkpICogKGRqMS50IC0gZGoudCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0MSA+PSAwICYmIHQxIDw9IDEgJiYgdDIgPj0gMCAmJiB0MiA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanVzdENvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogaXMueCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogaXMueSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdDE6IHQxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0MjogdDJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5wYXRoSW50ZXJzZWN0aW9uXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIEZpbmRzIGludGVyc2VjdGlvbnMgb2YgdHdvIHBhdGhzXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHBhdGgxIChzdHJpbmcpIHBhdGggc3RyaW5nXG4gICAgIC0gcGF0aDIgKHN0cmluZykgcGF0aCBzdHJpbmdcbiAgICAgPSAoYXJyYXkpIGRvdHMgb2YgaW50ZXJzZWN0aW9uXG4gICAgIG8gW1xuICAgICBvICAgICB7XG4gICAgIG8gICAgICAgICB4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50XG4gICAgIG8gICAgICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50XG4gICAgIG8gICAgICAgICB0MTogKG51bWJlcikgdCB2YWx1ZSBmb3Igc2VnbWVudCBvZiBwYXRoMVxuICAgICBvICAgICAgICAgdDI6IChudW1iZXIpIHQgdmFsdWUgZm9yIHNlZ21lbnQgb2YgcGF0aDJcbiAgICAgbyAgICAgICAgIHNlZ21lbnQxOiAobnVtYmVyKSBvcmRlciBudW1iZXIgZm9yIHNlZ21lbnQgb2YgcGF0aDFcbiAgICAgbyAgICAgICAgIHNlZ21lbnQyOiAobnVtYmVyKSBvcmRlciBudW1iZXIgZm9yIHNlZ21lbnQgb2YgcGF0aDJcbiAgICAgbyAgICAgICAgIGJlejE6IChhcnJheSkgZWlnaHQgY29vcmRpbmF0ZXMgcmVwcmVzZW50aW5nIGJlemnDqXIgY3VydmUgZm9yIHRoZSBzZWdtZW50IG9mIHBhdGgxXG4gICAgIG8gICAgICAgICBiZXoyOiAoYXJyYXkpIGVpZ2h0IGNvb3JkaW5hdGVzIHJlcHJlc2VudGluZyBiZXppw6lyIGN1cnZlIGZvciB0aGUgc2VnbWVudCBvZiBwYXRoMlxuICAgICBvICAgICB9XG4gICAgIG8gXVxuICAgIFxcKi9cbiAgICBSLnBhdGhJbnRlcnNlY3Rpb24gPSBmdW5jdGlvbiAocGF0aDEsIHBhdGgyKSB7XG4gICAgICAgIHJldHVybiBpbnRlclBhdGhIZWxwZXIocGF0aDEsIHBhdGgyKTtcbiAgICB9O1xuICAgIFIucGF0aEludGVyc2VjdGlvbk51bWJlciA9IGZ1bmN0aW9uIChwYXRoMSwgcGF0aDIpIHtcbiAgICAgICAgcmV0dXJuIGludGVyUGF0aEhlbHBlcihwYXRoMSwgcGF0aDIsIDEpO1xuICAgIH07XG4gICAgZnVuY3Rpb24gaW50ZXJQYXRoSGVscGVyKHBhdGgxLCBwYXRoMiwganVzdENvdW50KSB7XG4gICAgICAgIHBhdGgxID0gUi5fcGF0aDJjdXJ2ZShwYXRoMSk7XG4gICAgICAgIHBhdGgyID0gUi5fcGF0aDJjdXJ2ZShwYXRoMik7XG4gICAgICAgIHZhciB4MSwgeTEsIHgyLCB5MiwgeDFtLCB5MW0sIHgybSwgeTJtLCBiZXoxLCBiZXoyLFxuICAgICAgICAgICAgcmVzID0ganVzdENvdW50ID8gMCA6IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBwYXRoMS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGkgPSBwYXRoMVtpXTtcbiAgICAgICAgICAgIGlmIChwaVswXSA9PSBcIk1cIikge1xuICAgICAgICAgICAgICAgIHgxID0geDFtID0gcGlbMV07XG4gICAgICAgICAgICAgICAgeTEgPSB5MW0gPSBwaVsyXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHBpWzBdID09IFwiQ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlejEgPSBbeDEsIHkxXS5jb25jYXQocGkuc2xpY2UoMSkpO1xuICAgICAgICAgICAgICAgICAgICB4MSA9IGJlejFbNl07XG4gICAgICAgICAgICAgICAgICAgIHkxID0gYmV6MVs3XTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiZXoxID0gW3gxLCB5MSwgeDEsIHkxLCB4MW0sIHkxbSwgeDFtLCB5MW1dO1xuICAgICAgICAgICAgICAgICAgICB4MSA9IHgxbTtcbiAgICAgICAgICAgICAgICAgICAgeTEgPSB5MW07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwLCBqaiA9IHBhdGgyLmxlbmd0aDsgaiA8IGpqOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBqID0gcGF0aDJbal07XG4gICAgICAgICAgICAgICAgICAgIGlmIChwalswXSA9PSBcIk1cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDIgPSB4Mm0gPSBwalsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHkyID0geTJtID0gcGpbMl07XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGpbMF0gPT0gXCJDXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZXoyID0gW3gyLCB5Ml0uY29uY2F0KHBqLnNsaWNlKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4MiA9IGJlejJbNl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTIgPSBiZXoyWzddO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZXoyID0gW3gyLCB5MiwgeDIsIHkyLCB4Mm0sIHkybSwgeDJtLCB5Mm1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgyID0geDJtO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkyID0geTJtO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGludHIgPSBpbnRlckhlbHBlcihiZXoxLCBiZXoyLCBqdXN0Q291bnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGp1c3RDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyArPSBpbnRyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMCwga2sgPSBpbnRyLmxlbmd0aDsgayA8IGtrOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50cltrXS5zZWdtZW50MSA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludHJba10uc2VnbWVudDIgPSBqO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRyW2tdLmJlejEgPSBiZXoxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRyW2tdLmJlejIgPSBiZXoyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgPSByZXMuY29uY2F0KGludHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmlzUG9pbnRJbnNpZGVQYXRoXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIGdpdmVuIHBvaW50IGlzIGluc2lkZSBhIGdpdmVuIGNsb3NlZCBwYXRoLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBwYXRoIChzdHJpbmcpIHBhdGggc3RyaW5nXG4gICAgIC0geCAobnVtYmVyKSB4IG9mIHRoZSBwb2ludFxuICAgICAtIHkgKG51bWJlcikgeSBvZiB0aGUgcG9pbnRcbiAgICAgPSAoYm9vbGVhbikgdHJ1ZSwgaWYgcG9pbnQgaXMgaW5zaWRlIHRoZSBwYXRoXG4gICAgXFwqL1xuICAgIFIuaXNQb2ludEluc2lkZVBhdGggPSBmdW5jdGlvbiAocGF0aCwgeCwgeSkge1xuICAgICAgICB2YXIgYmJveCA9IFIucGF0aEJCb3gocGF0aCk7XG4gICAgICAgIHJldHVybiBSLmlzUG9pbnRJbnNpZGVCQm94KGJib3gsIHgsIHkpICYmXG4gICAgICAgICAgICAgICBpbnRlclBhdGhIZWxwZXIocGF0aCwgW1tcIk1cIiwgeCwgeV0sIFtcIkhcIiwgYmJveC54MiArIDEwXV0sIDEpICUgMiA9PSAxO1xuICAgIH07XG4gICAgUi5fcmVtb3ZlZEZhY3RvcnkgPSBmdW5jdGlvbiAobWV0aG9kbmFtZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXZlKFwicmFwaGFlbC5sb2dcIiwgbnVsbCwgXCJSYXBoYVxceGVibDogeW91IGFyZSBjYWxsaW5nIHRvIG1ldGhvZCBcXHUyMDFjXCIgKyBtZXRob2RuYW1lICsgXCJcXHUyMDFkIG9mIHJlbW92ZWQgb2JqZWN0XCIsIG1ldGhvZG5hbWUpO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwucGF0aEJCb3hcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogUmV0dXJuIGJvdW5kaW5nIGJveCBvZiBhIGdpdmVuIHBhdGhcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gcGF0aCAoc3RyaW5nKSBwYXRoIHN0cmluZ1xuICAgICA9IChvYmplY3QpIGJvdW5kaW5nIGJveFxuICAgICBvIHtcbiAgICAgbyAgICAgeDogKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSBsZWZ0IHRvcCBwb2ludCBvZiB0aGUgYm94XG4gICAgIG8gICAgIHk6IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgbGVmdCB0b3AgcG9pbnQgb2YgdGhlIGJveFxuICAgICBvICAgICB4MjogKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSByaWdodCBib3R0b20gcG9pbnQgb2YgdGhlIGJveFxuICAgICBvICAgICB5MjogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSByaWdodCBib3R0b20gcG9pbnQgb2YgdGhlIGJveFxuICAgICBvICAgICB3aWR0aDogKG51bWJlcikgd2lkdGggb2YgdGhlIGJveFxuICAgICBvICAgICBoZWlnaHQ6IChudW1iZXIpIGhlaWdodCBvZiB0aGUgYm94XG4gICAgIG8gICAgIGN4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgYm94XG4gICAgIG8gICAgIGN5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgYm94XG4gICAgIG8gfVxuICAgIFxcKi9cbiAgICB2YXIgcGF0aERpbWVuc2lvbnMgPSBSLnBhdGhCQm94ID0gZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgICAgdmFyIHB0aCA9IHBhdGhzKHBhdGgpO1xuICAgICAgICBpZiAocHRoLmJib3gpIHtcbiAgICAgICAgICAgIHJldHVybiBjbG9uZShwdGguYmJveCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgICAgICByZXR1cm4ge3g6IDAsIHk6IDAsIHdpZHRoOiAwLCBoZWlnaHQ6IDAsIHgyOiAwLCB5MjogMH07XG4gICAgICAgIH1cbiAgICAgICAgcGF0aCA9IHBhdGgyY3VydmUocGF0aCk7XG4gICAgICAgIHZhciB4ID0gMCwgXG4gICAgICAgICAgICB5ID0gMCxcbiAgICAgICAgICAgIFggPSBbXSxcbiAgICAgICAgICAgIFkgPSBbXSxcbiAgICAgICAgICAgIHA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHBhdGgubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgcCA9IHBhdGhbaV07XG4gICAgICAgICAgICBpZiAocFswXSA9PSBcIk1cIikge1xuICAgICAgICAgICAgICAgIHggPSBwWzFdO1xuICAgICAgICAgICAgICAgIHkgPSBwWzJdO1xuICAgICAgICAgICAgICAgIFgucHVzaCh4KTtcbiAgICAgICAgICAgICAgICBZLnB1c2goeSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBkaW0gPSBjdXJ2ZURpbSh4LCB5LCBwWzFdLCBwWzJdLCBwWzNdLCBwWzRdLCBwWzVdLCBwWzZdKTtcbiAgICAgICAgICAgICAgICBYID0gWFtjb25jYXRdKGRpbS5taW4ueCwgZGltLm1heC54KTtcbiAgICAgICAgICAgICAgICBZID0gWVtjb25jYXRdKGRpbS5taW4ueSwgZGltLm1heC55KTtcbiAgICAgICAgICAgICAgICB4ID0gcFs1XTtcbiAgICAgICAgICAgICAgICB5ID0gcFs2XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgeG1pbiA9IG1taW5bYXBwbHldKDAsIFgpLFxuICAgICAgICAgICAgeW1pbiA9IG1taW5bYXBwbHldKDAsIFkpLFxuICAgICAgICAgICAgeG1heCA9IG1tYXhbYXBwbHldKDAsIFgpLFxuICAgICAgICAgICAgeW1heCA9IG1tYXhbYXBwbHldKDAsIFkpLFxuICAgICAgICAgICAgd2lkdGggPSB4bWF4IC0geG1pbixcbiAgICAgICAgICAgIGhlaWdodCA9IHltYXggLSB5bWluLFxuICAgICAgICAgICAgICAgIGJiID0ge1xuICAgICAgICAgICAgICAgIHg6IHhtaW4sXG4gICAgICAgICAgICAgICAgeTogeW1pbixcbiAgICAgICAgICAgICAgICB4MjogeG1heCxcbiAgICAgICAgICAgICAgICB5MjogeW1heCxcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgICAgICAgY3g6IHhtaW4gKyB3aWR0aCAvIDIsXG4gICAgICAgICAgICAgICAgY3k6IHltaW4gKyBoZWlnaHQgLyAyXG4gICAgICAgICAgICB9O1xuICAgICAgICBwdGguYmJveCA9IGNsb25lKGJiKTtcbiAgICAgICAgcmV0dXJuIGJiO1xuICAgIH0sXG4gICAgICAgIHBhdGhDbG9uZSA9IGZ1bmN0aW9uIChwYXRoQXJyYXkpIHtcbiAgICAgICAgICAgIHZhciByZXMgPSBjbG9uZShwYXRoQXJyYXkpO1xuICAgICAgICAgICAgcmVzLnRvU3RyaW5nID0gUi5fcGF0aDJzdHJpbmc7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9LFxuICAgICAgICBwYXRoVG9SZWxhdGl2ZSA9IFIuX3BhdGhUb1JlbGF0aXZlID0gZnVuY3Rpb24gKHBhdGhBcnJheSkge1xuICAgICAgICAgICAgdmFyIHB0aCA9IHBhdGhzKHBhdGhBcnJheSk7XG4gICAgICAgICAgICBpZiAocHRoLnJlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXRoQ2xvbmUocHRoLnJlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIVIuaXMocGF0aEFycmF5LCBhcnJheSkgfHwgIVIuaXMocGF0aEFycmF5ICYmIHBhdGhBcnJheVswXSwgYXJyYXkpKSB7IC8vIHJvdWdoIGFzc3VtcHRpb25cbiAgICAgICAgICAgICAgICBwYXRoQXJyYXkgPSBSLnBhcnNlUGF0aFN0cmluZyhwYXRoQXJyYXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJlcyA9IFtdLFxuICAgICAgICAgICAgICAgIHggPSAwLFxuICAgICAgICAgICAgICAgIHkgPSAwLFxuICAgICAgICAgICAgICAgIG14ID0gMCxcbiAgICAgICAgICAgICAgICBteSA9IDAsXG4gICAgICAgICAgICAgICAgc3RhcnQgPSAwO1xuICAgICAgICAgICAgaWYgKHBhdGhBcnJheVswXVswXSA9PSBcIk1cIikge1xuICAgICAgICAgICAgICAgIHggPSBwYXRoQXJyYXlbMF1bMV07XG4gICAgICAgICAgICAgICAgeSA9IHBhdGhBcnJheVswXVsyXTtcbiAgICAgICAgICAgICAgICBteCA9IHg7XG4gICAgICAgICAgICAgICAgbXkgPSB5O1xuICAgICAgICAgICAgICAgIHN0YXJ0Kys7XG4gICAgICAgICAgICAgICAgcmVzLnB1c2goW1wiTVwiLCB4LCB5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gc3RhcnQsIGlpID0gcGF0aEFycmF5Lmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgciA9IHJlc1tpXSA9IFtdLFxuICAgICAgICAgICAgICAgICAgICBwYSA9IHBhdGhBcnJheVtpXTtcbiAgICAgICAgICAgICAgICBpZiAocGFbMF0gIT0gbG93ZXJDYXNlLmNhbGwocGFbMF0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJbMF0gPSBsb3dlckNhc2UuY2FsbChwYVswXSk7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoclswXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImFcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzFdID0gcGFbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgclsyXSA9IHBhWzJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbM10gPSBwYVszXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzRdID0gcGFbNF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcls1XSA9IHBhWzVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbNl0gPSArKHBhWzZdIC0geCkudG9GaXhlZCgzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzddID0gKyhwYVs3XSAtIHkpLnRvRml4ZWQoMyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbMV0gPSArKHBhWzFdIC0geSkudG9GaXhlZCgzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJtXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXggPSBwYVsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBteSA9IHBhWzJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMSwgamogPSBwYS5sZW5ndGg7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbal0gPSArKHBhW2pdIC0gKChqICUgMikgPyB4IDogeSkpLnRvRml4ZWQoMyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgciA9IHJlc1tpXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFbMF0gPT0gXCJtXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG14ID0gcGFbMV0gKyB4O1xuICAgICAgICAgICAgICAgICAgICAgICAgbXkgPSBwYVsyXSArIHk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgayA9IDAsIGtrID0gcGEubGVuZ3RoOyBrIDwga2s7IGsrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzW2ldW2tdID0gcGFba107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGxlbiA9IHJlc1tpXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChyZXNbaV1bMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInpcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHggPSBteDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgPSBteTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiaFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgeCArPSArcmVzW2ldW2xlbiAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ2XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB5ICs9ICtyZXNbaV1bbGVuIC0gMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHggKz0gK3Jlc1tpXVtsZW4gLSAyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgKz0gK3Jlc1tpXVtsZW4gLSAxXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXMudG9TdHJpbmcgPSBSLl9wYXRoMnN0cmluZztcbiAgICAgICAgICAgIHB0aC5yZWwgPSBwYXRoQ2xvbmUocmVzKTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH0sXG4gICAgICAgIHBhdGhUb0Fic29sdXRlID0gUi5fcGF0aFRvQWJzb2x1dGUgPSBmdW5jdGlvbiAocGF0aEFycmF5KSB7XG4gICAgICAgICAgICB2YXIgcHRoID0gcGF0aHMocGF0aEFycmF5KTtcbiAgICAgICAgICAgIGlmIChwdGguYWJzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhdGhDbG9uZShwdGguYWJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghUi5pcyhwYXRoQXJyYXksIGFycmF5KSB8fCAhUi5pcyhwYXRoQXJyYXkgJiYgcGF0aEFycmF5WzBdLCBhcnJheSkpIHsgLy8gcm91Z2ggYXNzdW1wdGlvblxuICAgICAgICAgICAgICAgIHBhdGhBcnJheSA9IFIucGFyc2VQYXRoU3RyaW5nKHBhdGhBcnJheSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXBhdGhBcnJheSB8fCAhcGF0aEFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbW1wiTVwiLCAwLCAwXV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmVzID0gW10sXG4gICAgICAgICAgICAgICAgeCA9IDAsXG4gICAgICAgICAgICAgICAgeSA9IDAsXG4gICAgICAgICAgICAgICAgbXggPSAwLFxuICAgICAgICAgICAgICAgIG15ID0gMCxcbiAgICAgICAgICAgICAgICBzdGFydCA9IDA7XG4gICAgICAgICAgICBpZiAocGF0aEFycmF5WzBdWzBdID09IFwiTVwiKSB7XG4gICAgICAgICAgICAgICAgeCA9ICtwYXRoQXJyYXlbMF1bMV07XG4gICAgICAgICAgICAgICAgeSA9ICtwYXRoQXJyYXlbMF1bMl07XG4gICAgICAgICAgICAgICAgbXggPSB4O1xuICAgICAgICAgICAgICAgIG15ID0geTtcbiAgICAgICAgICAgICAgICBzdGFydCsrO1xuICAgICAgICAgICAgICAgIHJlc1swXSA9IFtcIk1cIiwgeCwgeV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgY3J6ID0gcGF0aEFycmF5Lmxlbmd0aCA9PSAzICYmIHBhdGhBcnJheVswXVswXSA9PSBcIk1cIiAmJiBwYXRoQXJyYXlbMV1bMF0udG9VcHBlckNhc2UoKSA9PSBcIlJcIiAmJiBwYXRoQXJyYXlbMl1bMF0udG9VcHBlckNhc2UoKSA9PSBcIlpcIjtcbiAgICAgICAgICAgIGZvciAodmFyIHIsIHBhLCBpID0gc3RhcnQsIGlpID0gcGF0aEFycmF5Lmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICByZXMucHVzaChyID0gW10pO1xuICAgICAgICAgICAgICAgIHBhID0gcGF0aEFycmF5W2ldO1xuICAgICAgICAgICAgICAgIGlmIChwYVswXSAhPSB1cHBlckNhc2UuY2FsbChwYVswXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgclswXSA9IHVwcGVyQ2FzZS5jYWxsKHBhWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChyWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbMV0gPSBwYVsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzJdID0gcGFbMl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgclszXSA9IHBhWzNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbNF0gPSBwYVs0XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzVdID0gcGFbNV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcls2XSA9ICsocGFbNl0gKyB4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzddID0gKyhwYVs3XSArIHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlZcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzFdID0gK3BhWzFdICsgeTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJIXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgclsxXSA9ICtwYVsxXSArIHg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiUlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkb3RzID0gW3gsIHldW2NvbmNhdF0ocGEuc2xpY2UoMSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAyLCBqaiA9IGRvdHMubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3RzW2pdID0gK2RvdHNbal0gKyB4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3RzWysral0gPSArZG90c1tqXSArIHk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgPSByZXNbY29uY2F0XShjYXRtdWxsUm9tMmJlemllcihkb3RzLCBjcnopKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJNXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXggPSArcGFbMV0gKyB4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG15ID0gK3BhWzJdICsgeTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMSwgamogPSBwYS5sZW5ndGg7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbal0gPSArcGFbal0gKyAoKGogJSAyKSA/IHggOiB5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhWzBdID09IFwiUlwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvdHMgPSBbeCwgeV1bY29uY2F0XShwYS5zbGljZSgxKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gcmVzW2NvbmNhdF0oY2F0bXVsbFJvbTJiZXppZXIoZG90cywgY3J6KSk7XG4gICAgICAgICAgICAgICAgICAgIHIgPSBbXCJSXCJdW2NvbmNhdF0ocGEuc2xpY2UoLTIpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMCwga2sgPSBwYS5sZW5ndGg7IGsgPCBrazsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByW2tdID0gcGFba107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3dpdGNoIChyWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJaXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB4ID0gbXg7XG4gICAgICAgICAgICAgICAgICAgICAgICB5ID0gbXk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkhcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHggPSByWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJWXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB5ID0gclsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgbXggPSByW3IubGVuZ3RoIC0gMl07XG4gICAgICAgICAgICAgICAgICAgICAgICBteSA9IHJbci5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHggPSByW3IubGVuZ3RoIC0gMl07XG4gICAgICAgICAgICAgICAgICAgICAgICB5ID0gcltyLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcy50b1N0cmluZyA9IFIuX3BhdGgyc3RyaW5nO1xuICAgICAgICAgICAgcHRoLmFicyA9IHBhdGhDbG9uZShyZXMpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfSxcbiAgICAgICAgbDJjID0gZnVuY3Rpb24gKHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgICAgICAgICByZXR1cm4gW3gxLCB5MSwgeDIsIHkyLCB4MiwgeTJdO1xuICAgICAgICB9LFxuICAgICAgICBxMmMgPSBmdW5jdGlvbiAoeDEsIHkxLCBheCwgYXksIHgyLCB5Mikge1xuICAgICAgICAgICAgdmFyIF8xMyA9IDEgLyAzLFxuICAgICAgICAgICAgICAgIF8yMyA9IDIgLyAzO1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgXzEzICogeDEgKyBfMjMgKiBheCxcbiAgICAgICAgICAgICAgICAgICAgXzEzICogeTEgKyBfMjMgKiBheSxcbiAgICAgICAgICAgICAgICAgICAgXzEzICogeDIgKyBfMjMgKiBheCxcbiAgICAgICAgICAgICAgICAgICAgXzEzICogeTIgKyBfMjMgKiBheSxcbiAgICAgICAgICAgICAgICAgICAgeDIsXG4gICAgICAgICAgICAgICAgICAgIHkyXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgfSxcbiAgICAgICAgYTJjID0gZnVuY3Rpb24gKHgxLCB5MSwgcngsIHJ5LCBhbmdsZSwgbGFyZ2VfYXJjX2ZsYWcsIHN3ZWVwX2ZsYWcsIHgyLCB5MiwgcmVjdXJzaXZlKSB7XG4gICAgICAgICAgICAvLyBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvZiB3aGVyZSB0aGlzIG1hdGggY2FtZSBmcm9tIHZpc2l0OlxuICAgICAgICAgICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHMTEvaW1wbG5vdGUuaHRtbCNBcmNJbXBsZW1lbnRhdGlvbk5vdGVzXG4gICAgICAgICAgICB2YXIgXzEyMCA9IFBJICogMTIwIC8gMTgwLFxuICAgICAgICAgICAgICAgIHJhZCA9IFBJIC8gMTgwICogKCthbmdsZSB8fCAwKSxcbiAgICAgICAgICAgICAgICByZXMgPSBbXSxcbiAgICAgICAgICAgICAgICB4eSxcbiAgICAgICAgICAgICAgICByb3RhdGUgPSBjYWNoZXIoZnVuY3Rpb24gKHgsIHksIHJhZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgWCA9IHggKiBtYXRoLmNvcyhyYWQpIC0geSAqIG1hdGguc2luKHJhZCksXG4gICAgICAgICAgICAgICAgICAgICAgICBZID0geCAqIG1hdGguc2luKHJhZCkgKyB5ICogbWF0aC5jb3MocmFkKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHt4OiBYLCB5OiBZfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghcmVjdXJzaXZlKSB7XG4gICAgICAgICAgICAgICAgeHkgPSByb3RhdGUoeDEsIHkxLCAtcmFkKTtcbiAgICAgICAgICAgICAgICB4MSA9IHh5Lng7XG4gICAgICAgICAgICAgICAgeTEgPSB4eS55O1xuICAgICAgICAgICAgICAgIHh5ID0gcm90YXRlKHgyLCB5MiwgLXJhZCk7XG4gICAgICAgICAgICAgICAgeDIgPSB4eS54O1xuICAgICAgICAgICAgICAgIHkyID0geHkueTtcbiAgICAgICAgICAgICAgICB2YXIgY29zID0gbWF0aC5jb3MoUEkgLyAxODAgKiBhbmdsZSksXG4gICAgICAgICAgICAgICAgICAgIHNpbiA9IG1hdGguc2luKFBJIC8gMTgwICogYW5nbGUpLFxuICAgICAgICAgICAgICAgICAgICB4ID0gKHgxIC0geDIpIC8gMixcbiAgICAgICAgICAgICAgICAgICAgeSA9ICh5MSAtIHkyKSAvIDI7XG4gICAgICAgICAgICAgICAgdmFyIGggPSAoeCAqIHgpIC8gKHJ4ICogcngpICsgKHkgKiB5KSAvIChyeSAqIHJ5KTtcbiAgICAgICAgICAgICAgICBpZiAoaCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaCA9IG1hdGguc3FydChoKTtcbiAgICAgICAgICAgICAgICAgICAgcnggPSBoICogcng7XG4gICAgICAgICAgICAgICAgICAgIHJ5ID0gaCAqIHJ5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgcngyID0gcnggKiByeCxcbiAgICAgICAgICAgICAgICAgICAgcnkyID0gcnkgKiByeSxcbiAgICAgICAgICAgICAgICAgICAgayA9IChsYXJnZV9hcmNfZmxhZyA9PSBzd2VlcF9mbGFnID8gLTEgOiAxKSAqXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRoLnNxcnQoYWJzKChyeDIgKiByeTIgLSByeDIgKiB5ICogeSAtIHJ5MiAqIHggKiB4KSAvIChyeDIgKiB5ICogeSArIHJ5MiAqIHggKiB4KSkpLFxuICAgICAgICAgICAgICAgICAgICBjeCA9IGsgKiByeCAqIHkgLyByeSArICh4MSArIHgyKSAvIDIsXG4gICAgICAgICAgICAgICAgICAgIGN5ID0gayAqIC1yeSAqIHggLyByeCArICh5MSArIHkyKSAvIDIsXG4gICAgICAgICAgICAgICAgICAgIGYxID0gbWF0aC5hc2luKCgoeTEgLSBjeSkgLyByeSkudG9GaXhlZCg5KSksXG4gICAgICAgICAgICAgICAgICAgIGYyID0gbWF0aC5hc2luKCgoeTIgLSBjeSkgLyByeSkudG9GaXhlZCg5KSk7XG5cbiAgICAgICAgICAgICAgICBmMSA9IHgxIDwgY3ggPyBQSSAtIGYxIDogZjE7XG4gICAgICAgICAgICAgICAgZjIgPSB4MiA8IGN4ID8gUEkgLSBmMiA6IGYyO1xuICAgICAgICAgICAgICAgIGYxIDwgMCAmJiAoZjEgPSBQSSAqIDIgKyBmMSk7XG4gICAgICAgICAgICAgICAgZjIgPCAwICYmIChmMiA9IFBJICogMiArIGYyKTtcbiAgICAgICAgICAgICAgICBpZiAoc3dlZXBfZmxhZyAmJiBmMSA+IGYyKSB7XG4gICAgICAgICAgICAgICAgICAgIGYxID0gZjEgLSBQSSAqIDI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghc3dlZXBfZmxhZyAmJiBmMiA+IGYxKSB7XG4gICAgICAgICAgICAgICAgICAgIGYyID0gZjIgLSBQSSAqIDI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmMSA9IHJlY3Vyc2l2ZVswXTtcbiAgICAgICAgICAgICAgICBmMiA9IHJlY3Vyc2l2ZVsxXTtcbiAgICAgICAgICAgICAgICBjeCA9IHJlY3Vyc2l2ZVsyXTtcbiAgICAgICAgICAgICAgICBjeSA9IHJlY3Vyc2l2ZVszXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkZiA9IGYyIC0gZjE7XG4gICAgICAgICAgICBpZiAoYWJzKGRmKSA+IF8xMjApIHtcbiAgICAgICAgICAgICAgICB2YXIgZjJvbGQgPSBmMixcbiAgICAgICAgICAgICAgICAgICAgeDJvbGQgPSB4MixcbiAgICAgICAgICAgICAgICAgICAgeTJvbGQgPSB5MjtcbiAgICAgICAgICAgICAgICBmMiA9IGYxICsgXzEyMCAqIChzd2VlcF9mbGFnICYmIGYyID4gZjEgPyAxIDogLTEpO1xuICAgICAgICAgICAgICAgIHgyID0gY3ggKyByeCAqIG1hdGguY29zKGYyKTtcbiAgICAgICAgICAgICAgICB5MiA9IGN5ICsgcnkgKiBtYXRoLnNpbihmMik7XG4gICAgICAgICAgICAgICAgcmVzID0gYTJjKHgyLCB5MiwgcngsIHJ5LCBhbmdsZSwgMCwgc3dlZXBfZmxhZywgeDJvbGQsIHkyb2xkLCBbZjIsIGYyb2xkLCBjeCwgY3ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRmID0gZjIgLSBmMTtcbiAgICAgICAgICAgIHZhciBjMSA9IG1hdGguY29zKGYxKSxcbiAgICAgICAgICAgICAgICBzMSA9IG1hdGguc2luKGYxKSxcbiAgICAgICAgICAgICAgICBjMiA9IG1hdGguY29zKGYyKSxcbiAgICAgICAgICAgICAgICBzMiA9IG1hdGguc2luKGYyKSxcbiAgICAgICAgICAgICAgICB0ID0gbWF0aC50YW4oZGYgLyA0KSxcbiAgICAgICAgICAgICAgICBoeCA9IDQgLyAzICogcnggKiB0LFxuICAgICAgICAgICAgICAgIGh5ID0gNCAvIDMgKiByeSAqIHQsXG4gICAgICAgICAgICAgICAgbTEgPSBbeDEsIHkxXSxcbiAgICAgICAgICAgICAgICBtMiA9IFt4MSArIGh4ICogczEsIHkxIC0gaHkgKiBjMV0sXG4gICAgICAgICAgICAgICAgbTMgPSBbeDIgKyBoeCAqIHMyLCB5MiAtIGh5ICogYzJdLFxuICAgICAgICAgICAgICAgIG00ID0gW3gyLCB5Ml07XG4gICAgICAgICAgICBtMlswXSA9IDIgKiBtMVswXSAtIG0yWzBdO1xuICAgICAgICAgICAgbTJbMV0gPSAyICogbTFbMV0gLSBtMlsxXTtcbiAgICAgICAgICAgIGlmIChyZWN1cnNpdmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW20yLCBtMywgbTRdW2NvbmNhdF0ocmVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzID0gW20yLCBtMywgbTRdW2NvbmNhdF0ocmVzKS5qb2luKClbc3BsaXRdKFwiLFwiKTtcbiAgICAgICAgICAgICAgICB2YXIgbmV3cmVzID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gcmVzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3cmVzW2ldID0gaSAlIDIgPyByb3RhdGUocmVzW2kgLSAxXSwgcmVzW2ldLCByYWQpLnkgOiByb3RhdGUocmVzW2ldLCByZXNbaSArIDFdLCByYWQpLng7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXdyZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGZpbmREb3RBdFNlZ21lbnQgPSBmdW5jdGlvbiAocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnksIHQpIHtcbiAgICAgICAgICAgIHZhciB0MSA9IDEgLSB0O1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB4OiBwb3codDEsIDMpICogcDF4ICsgcG93KHQxLCAyKSAqIDMgKiB0ICogYzF4ICsgdDEgKiAzICogdCAqIHQgKiBjMnggKyBwb3codCwgMykgKiBwMngsXG4gICAgICAgICAgICAgICAgeTogcG93KHQxLCAzKSAqIHAxeSArIHBvdyh0MSwgMikgKiAzICogdCAqIGMxeSArIHQxICogMyAqIHQgKiB0ICogYzJ5ICsgcG93KHQsIDMpICogcDJ5XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBjdXJ2ZURpbSA9IGNhY2hlcihmdW5jdGlvbiAocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnkpIHtcbiAgICAgICAgICAgIHZhciBhID0gKGMyeCAtIDIgKiBjMXggKyBwMXgpIC0gKHAyeCAtIDIgKiBjMnggKyBjMXgpLFxuICAgICAgICAgICAgICAgIGIgPSAyICogKGMxeCAtIHAxeCkgLSAyICogKGMyeCAtIGMxeCksXG4gICAgICAgICAgICAgICAgYyA9IHAxeCAtIGMxeCxcbiAgICAgICAgICAgICAgICB0MSA9ICgtYiArIG1hdGguc3FydChiICogYiAtIDQgKiBhICogYykpIC8gMiAvIGEsXG4gICAgICAgICAgICAgICAgdDIgPSAoLWIgLSBtYXRoLnNxcnQoYiAqIGIgLSA0ICogYSAqIGMpKSAvIDIgLyBhLFxuICAgICAgICAgICAgICAgIHkgPSBbcDF5LCBwMnldLFxuICAgICAgICAgICAgICAgIHggPSBbcDF4LCBwMnhdLFxuICAgICAgICAgICAgICAgIGRvdDtcbiAgICAgICAgICAgIGFicyh0MSkgPiBcIjFlMTJcIiAmJiAodDEgPSAuNSk7XG4gICAgICAgICAgICBhYnModDIpID4gXCIxZTEyXCIgJiYgKHQyID0gLjUpO1xuICAgICAgICAgICAgaWYgKHQxID4gMCAmJiB0MSA8IDEpIHtcbiAgICAgICAgICAgICAgICBkb3QgPSBmaW5kRG90QXRTZWdtZW50KHAxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5LCB0MSk7XG4gICAgICAgICAgICAgICAgeC5wdXNoKGRvdC54KTtcbiAgICAgICAgICAgICAgICB5LnB1c2goZG90LnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHQyID4gMCAmJiB0MiA8IDEpIHtcbiAgICAgICAgICAgICAgICBkb3QgPSBmaW5kRG90QXRTZWdtZW50KHAxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5LCB0Mik7XG4gICAgICAgICAgICAgICAgeC5wdXNoKGRvdC54KTtcbiAgICAgICAgICAgICAgICB5LnB1c2goZG90LnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYSA9IChjMnkgLSAyICogYzF5ICsgcDF5KSAtIChwMnkgLSAyICogYzJ5ICsgYzF5KTtcbiAgICAgICAgICAgIGIgPSAyICogKGMxeSAtIHAxeSkgLSAyICogKGMyeSAtIGMxeSk7XG4gICAgICAgICAgICBjID0gcDF5IC0gYzF5O1xuICAgICAgICAgICAgdDEgPSAoLWIgKyBtYXRoLnNxcnQoYiAqIGIgLSA0ICogYSAqIGMpKSAvIDIgLyBhO1xuICAgICAgICAgICAgdDIgPSAoLWIgLSBtYXRoLnNxcnQoYiAqIGIgLSA0ICogYSAqIGMpKSAvIDIgLyBhO1xuICAgICAgICAgICAgYWJzKHQxKSA+IFwiMWUxMlwiICYmICh0MSA9IC41KTtcbiAgICAgICAgICAgIGFicyh0MikgPiBcIjFlMTJcIiAmJiAodDIgPSAuNSk7XG4gICAgICAgICAgICBpZiAodDEgPiAwICYmIHQxIDwgMSkge1xuICAgICAgICAgICAgICAgIGRvdCA9IGZpbmREb3RBdFNlZ21lbnQocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnksIHQxKTtcbiAgICAgICAgICAgICAgICB4LnB1c2goZG90LngpO1xuICAgICAgICAgICAgICAgIHkucHVzaChkb3QueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodDIgPiAwICYmIHQyIDwgMSkge1xuICAgICAgICAgICAgICAgIGRvdCA9IGZpbmREb3RBdFNlZ21lbnQocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnksIHQyKTtcbiAgICAgICAgICAgICAgICB4LnB1c2goZG90LngpO1xuICAgICAgICAgICAgICAgIHkucHVzaChkb3QueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1pbjoge3g6IG1taW5bYXBwbHldKDAsIHgpLCB5OiBtbWluW2FwcGx5XSgwLCB5KX0sXG4gICAgICAgICAgICAgICAgbWF4OiB7eDogbW1heFthcHBseV0oMCwgeCksIHk6IG1tYXhbYXBwbHldKDAsIHkpfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIHBhdGgyY3VydmUgPSBSLl9wYXRoMmN1cnZlID0gY2FjaGVyKGZ1bmN0aW9uIChwYXRoLCBwYXRoMikge1xuICAgICAgICAgICAgdmFyIHB0aCA9ICFwYXRoMiAmJiBwYXRocyhwYXRoKTtcbiAgICAgICAgICAgIGlmICghcGF0aDIgJiYgcHRoLmN1cnZlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhdGhDbG9uZShwdGguY3VydmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHAgPSBwYXRoVG9BYnNvbHV0ZShwYXRoKSxcbiAgICAgICAgICAgICAgICBwMiA9IHBhdGgyICYmIHBhdGhUb0Fic29sdXRlKHBhdGgyKSxcbiAgICAgICAgICAgICAgICBhdHRycyA9IHt4OiAwLCB5OiAwLCBieDogMCwgYnk6IDAsIFg6IDAsIFk6IDAsIHF4OiBudWxsLCBxeTogbnVsbH0sXG4gICAgICAgICAgICAgICAgYXR0cnMyID0ge3g6IDAsIHk6IDAsIGJ4OiAwLCBieTogMCwgWDogMCwgWTogMCwgcXg6IG51bGwsIHF5OiBudWxsfSxcbiAgICAgICAgICAgICAgICBwcm9jZXNzUGF0aCA9IGZ1bmN0aW9uIChwYXRoLCBkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBueCwgbnk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcIkNcIiwgZC54LCBkLnksIGQueCwgZC55LCBkLngsIGQueV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgIShwYXRoWzBdIGluIHtUOjEsIFE6MX0pICYmIChkLnF4ID0gZC5xeSA9IG51bGwpO1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHBhdGhbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJNXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZC5YID0gcGF0aFsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkLlkgPSBwYXRoWzJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkFcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoID0gW1wiQ1wiXVtjb25jYXRdKGEyY1thcHBseV0oMCwgW2QueCwgZC55XVtjb25jYXRdKHBhdGguc2xpY2UoMSkpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG54ID0gZC54ICsgKGQueCAtIChkLmJ4IHx8IGQueCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG55ID0gZC55ICsgKGQueSAtIChkLmJ5IHx8IGQueSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBbXCJDXCIsIG54LCBueV1bY29uY2F0XShwYXRoLnNsaWNlKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJUXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZC5xeCA9IGQueCArIChkLnggLSAoZC5xeCB8fCBkLngpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkLnF5ID0gZC55ICsgKGQueSAtIChkLnF5IHx8IGQueSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBbXCJDXCJdW2NvbmNhdF0ocTJjKGQueCwgZC55LCBkLnF4LCBkLnF5LCBwYXRoWzFdLCBwYXRoWzJdKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiUVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQucXggPSBwYXRoWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQucXkgPSBwYXRoWzJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBbXCJDXCJdW2NvbmNhdF0ocTJjKGQueCwgZC55LCBwYXRoWzFdLCBwYXRoWzJdLCBwYXRoWzNdLCBwYXRoWzRdKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBbXCJDXCJdW2NvbmNhdF0obDJjKGQueCwgZC55LCBwYXRoWzFdLCBwYXRoWzJdKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiSFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBbXCJDXCJdW2NvbmNhdF0obDJjKGQueCwgZC55LCBwYXRoWzFdLCBkLnkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJWXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCA9IFtcIkNcIl1bY29uY2F0XShsMmMoZC54LCBkLnksIGQueCwgcGF0aFsxXSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlpcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoID0gW1wiQ1wiXVtjb25jYXRdKGwyYyhkLngsIGQueSwgZC5YLCBkLlkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGF0aDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZpeEFyYyA9IGZ1bmN0aW9uIChwcCwgaSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHBbaV0ubGVuZ3RoID4gNykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHBbaV0uc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwaSA9IHBwW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHBpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBwLnNwbGljZShpKyssIDAsIFtcIkNcIl1bY29uY2F0XShwaS5zcGxpY2UoMCwgNikpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBwLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlpID0gbW1heChwLmxlbmd0aCwgcDIgJiYgcDIubGVuZ3RoIHx8IDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmaXhNID0gZnVuY3Rpb24gKHBhdGgxLCBwYXRoMiwgYTEsIGEyLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXRoMSAmJiBwYXRoMiAmJiBwYXRoMVtpXVswXSA9PSBcIk1cIiAmJiBwYXRoMltpXVswXSAhPSBcIk1cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDIuc3BsaWNlKGksIDAsIFtcIk1cIiwgYTIueCwgYTIueV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYTEuYnggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgYTEuYnkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgYTEueCA9IHBhdGgxW2ldWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYTEueSA9IHBhdGgxW2ldWzJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWkgPSBtbWF4KHAubGVuZ3RoLCBwMiAmJiBwMi5sZW5ndGggfHwgMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gbW1heChwLmxlbmd0aCwgcDIgJiYgcDIubGVuZ3RoIHx8IDApOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIHBbaV0gPSBwcm9jZXNzUGF0aChwW2ldLCBhdHRycyk7XG4gICAgICAgICAgICAgICAgZml4QXJjKHAsIGkpO1xuICAgICAgICAgICAgICAgIHAyICYmIChwMltpXSA9IHByb2Nlc3NQYXRoKHAyW2ldLCBhdHRyczIpKTtcbiAgICAgICAgICAgICAgICBwMiAmJiBmaXhBcmMocDIsIGkpO1xuICAgICAgICAgICAgICAgIGZpeE0ocCwgcDIsIGF0dHJzLCBhdHRyczIsIGkpO1xuICAgICAgICAgICAgICAgIGZpeE0ocDIsIHAsIGF0dHJzMiwgYXR0cnMsIGkpO1xuICAgICAgICAgICAgICAgIHZhciBzZWcgPSBwW2ldLFxuICAgICAgICAgICAgICAgICAgICBzZWcyID0gcDIgJiYgcDJbaV0sXG4gICAgICAgICAgICAgICAgICAgIHNlZ2xlbiA9IHNlZy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIHNlZzJsZW4gPSBwMiAmJiBzZWcyLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBhdHRycy54ID0gc2VnW3NlZ2xlbiAtIDJdO1xuICAgICAgICAgICAgICAgIGF0dHJzLnkgPSBzZWdbc2VnbGVuIC0gMV07XG4gICAgICAgICAgICAgICAgYXR0cnMuYnggPSB0b0Zsb2F0KHNlZ1tzZWdsZW4gLSA0XSkgfHwgYXR0cnMueDtcbiAgICAgICAgICAgICAgICBhdHRycy5ieSA9IHRvRmxvYXQoc2VnW3NlZ2xlbiAtIDNdKSB8fCBhdHRycy55O1xuICAgICAgICAgICAgICAgIGF0dHJzMi5ieCA9IHAyICYmICh0b0Zsb2F0KHNlZzJbc2VnMmxlbiAtIDRdKSB8fCBhdHRyczIueCk7XG4gICAgICAgICAgICAgICAgYXR0cnMyLmJ5ID0gcDIgJiYgKHRvRmxvYXQoc2VnMltzZWcybGVuIC0gM10pIHx8IGF0dHJzMi55KTtcbiAgICAgICAgICAgICAgICBhdHRyczIueCA9IHAyICYmIHNlZzJbc2VnMmxlbiAtIDJdO1xuICAgICAgICAgICAgICAgIGF0dHJzMi55ID0gcDIgJiYgc2VnMltzZWcybGVuIC0gMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXAyKSB7XG4gICAgICAgICAgICAgICAgcHRoLmN1cnZlID0gcGF0aENsb25lKHApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHAyID8gW3AsIHAyXSA6IHA7XG4gICAgICAgIH0sIG51bGwsIHBhdGhDbG9uZSksXG4gICAgICAgIHBhcnNlRG90cyA9IFIuX3BhcnNlRG90cyA9IGNhY2hlcihmdW5jdGlvbiAoZ3JhZGllbnQpIHtcbiAgICAgICAgICAgIHZhciBkb3RzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBncmFkaWVudC5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRvdCA9IHt9LFxuICAgICAgICAgICAgICAgICAgICBwYXIgPSBncmFkaWVudFtpXS5tYXRjaCgvXihbXjpdKik6PyhbXFxkXFwuXSopLyk7XG4gICAgICAgICAgICAgICAgZG90LmNvbG9yID0gUi5nZXRSR0IocGFyWzFdKTtcbiAgICAgICAgICAgICAgICBpZiAoZG90LmNvbG9yLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkb3QuY29sb3IgPSBkb3QuY29sb3IuaGV4O1xuICAgICAgICAgICAgICAgIHBhclsyXSAmJiAoZG90Lm9mZnNldCA9IHBhclsyXSArIFwiJVwiKTtcbiAgICAgICAgICAgICAgICBkb3RzLnB1c2goZG90KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoaSA9IDEsIGlpID0gZG90cy5sZW5ndGggLSAxOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICghZG90c1tpXS5vZmZzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gdG9GbG9hdChkb3RzW2kgLSAxXS5vZmZzZXQgfHwgMCksXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gaSArIDE7IGogPCBpaTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG90c1tqXS5vZmZzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQgPSBkb3RzW2pdLm9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWVuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kID0gMTAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgaiA9IGlpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHRvRmxvYXQoZW5kKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSAoZW5kIC0gc3RhcnQpIC8gKGogLSBpICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydCArPSBkO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG90c1tpXS5vZmZzZXQgPSBzdGFydCArIFwiJVwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRvdHM7XG4gICAgICAgIH0pLFxuICAgICAgICB0ZWFyID0gUi5fdGVhciA9IGZ1bmN0aW9uIChlbCwgcGFwZXIpIHtcbiAgICAgICAgICAgIGVsID09IHBhcGVyLnRvcCAmJiAocGFwZXIudG9wID0gZWwucHJldik7XG4gICAgICAgICAgICBlbCA9PSBwYXBlci5ib3R0b20gJiYgKHBhcGVyLmJvdHRvbSA9IGVsLm5leHQpO1xuICAgICAgICAgICAgZWwubmV4dCAmJiAoZWwubmV4dC5wcmV2ID0gZWwucHJldik7XG4gICAgICAgICAgICBlbC5wcmV2ICYmIChlbC5wcmV2Lm5leHQgPSBlbC5uZXh0KTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9mcm9udCA9IFIuX3RvZnJvbnQgPSBmdW5jdGlvbiAoZWwsIHBhcGVyKSB7XG4gICAgICAgICAgICBpZiAocGFwZXIudG9wID09PSBlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRlYXIoZWwsIHBhcGVyKTtcbiAgICAgICAgICAgIGVsLm5leHQgPSBudWxsO1xuICAgICAgICAgICAgZWwucHJldiA9IHBhcGVyLnRvcDtcbiAgICAgICAgICAgIHBhcGVyLnRvcC5uZXh0ID0gZWw7XG4gICAgICAgICAgICBwYXBlci50b3AgPSBlbDtcbiAgICAgICAgfSxcbiAgICAgICAgdG9iYWNrID0gUi5fdG9iYWNrID0gZnVuY3Rpb24gKGVsLCBwYXBlcikge1xuICAgICAgICAgICAgaWYgKHBhcGVyLmJvdHRvbSA9PT0gZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ZWFyKGVsLCBwYXBlcik7XG4gICAgICAgICAgICBlbC5uZXh0ID0gcGFwZXIuYm90dG9tO1xuICAgICAgICAgICAgZWwucHJldiA9IG51bGw7XG4gICAgICAgICAgICBwYXBlci5ib3R0b20ucHJldiA9IGVsO1xuICAgICAgICAgICAgcGFwZXIuYm90dG9tID0gZWw7XG4gICAgICAgIH0sXG4gICAgICAgIGluc2VydGFmdGVyID0gUi5faW5zZXJ0YWZ0ZXIgPSBmdW5jdGlvbiAoZWwsIGVsMiwgcGFwZXIpIHtcbiAgICAgICAgICAgIHRlYXIoZWwsIHBhcGVyKTtcbiAgICAgICAgICAgIGVsMiA9PSBwYXBlci50b3AgJiYgKHBhcGVyLnRvcCA9IGVsKTtcbiAgICAgICAgICAgIGVsMi5uZXh0ICYmIChlbDIubmV4dC5wcmV2ID0gZWwpO1xuICAgICAgICAgICAgZWwubmV4dCA9IGVsMi5uZXh0O1xuICAgICAgICAgICAgZWwucHJldiA9IGVsMjtcbiAgICAgICAgICAgIGVsMi5uZXh0ID0gZWw7XG4gICAgICAgIH0sXG4gICAgICAgIGluc2VydGJlZm9yZSA9IFIuX2luc2VydGJlZm9yZSA9IGZ1bmN0aW9uIChlbCwgZWwyLCBwYXBlcikge1xuICAgICAgICAgICAgdGVhcihlbCwgcGFwZXIpO1xuICAgICAgICAgICAgZWwyID09IHBhcGVyLmJvdHRvbSAmJiAocGFwZXIuYm90dG9tID0gZWwpO1xuICAgICAgICAgICAgZWwyLnByZXYgJiYgKGVsMi5wcmV2Lm5leHQgPSBlbCk7XG4gICAgICAgICAgICBlbC5wcmV2ID0gZWwyLnByZXY7XG4gICAgICAgICAgICBlbDIucHJldiA9IGVsO1xuICAgICAgICAgICAgZWwubmV4dCA9IGVsMjtcbiAgICAgICAgfSxcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBSYXBoYWVsLnRvTWF0cml4XG4gICAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAgICAgKipcbiAgICAgICAgICogUmV0dXJucyBtYXRyaXggb2YgdHJhbnNmb3JtYXRpb25zIGFwcGxpZWQgdG8gYSBnaXZlbiBwYXRoXG4gICAgICAgICA+IFBhcmFtZXRlcnNcbiAgICAgICAgIC0gcGF0aCAoc3RyaW5nKSBwYXRoIHN0cmluZ1xuICAgICAgICAgLSB0cmFuc2Zvcm0gKHN0cmluZ3xhcnJheSkgdHJhbnNmb3JtYXRpb24gc3RyaW5nXG4gICAgICAgICA9IChvYmplY3QpIEBNYXRyaXhcbiAgICAgICAgXFwqL1xuICAgICAgICB0b01hdHJpeCA9IFIudG9NYXRyaXggPSBmdW5jdGlvbiAocGF0aCwgdHJhbnNmb3JtKSB7XG4gICAgICAgICAgICB2YXIgYmIgPSBwYXRoRGltZW5zaW9ucyhwYXRoKSxcbiAgICAgICAgICAgICAgICBlbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgXzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiBFXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGdldEJCb3g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiYjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBleHRyYWN0VHJhbnNmb3JtKGVsLCB0cmFuc2Zvcm0pO1xuICAgICAgICAgICAgcmV0dXJuIGVsLm1hdHJpeDtcbiAgICAgICAgfSxcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBSYXBoYWVsLnRyYW5zZm9ybVBhdGhcbiAgICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICAgICAqKlxuICAgICAgICAgKiBSZXR1cm5zIHBhdGggdHJhbnNmb3JtZWQgYnkgYSBnaXZlbiB0cmFuc2Zvcm1hdGlvblxuICAgICAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICAgICAtIHBhdGggKHN0cmluZykgcGF0aCBzdHJpbmdcbiAgICAgICAgIC0gdHJhbnNmb3JtIChzdHJpbmd8YXJyYXkpIHRyYW5zZm9ybWF0aW9uIHN0cmluZ1xuICAgICAgICAgPSAoc3RyaW5nKSBwYXRoXG4gICAgICAgIFxcKi9cbiAgICAgICAgdHJhbnNmb3JtUGF0aCA9IFIudHJhbnNmb3JtUGF0aCA9IGZ1bmN0aW9uIChwYXRoLCB0cmFuc2Zvcm0pIHtcbiAgICAgICAgICAgIHJldHVybiBtYXBQYXRoKHBhdGgsIHRvTWF0cml4KHBhdGgsIHRyYW5zZm9ybSkpO1xuICAgICAgICB9LFxuICAgICAgICBleHRyYWN0VHJhbnNmb3JtID0gUi5fZXh0cmFjdFRyYW5zZm9ybSA9IGZ1bmN0aW9uIChlbCwgdHN0cikge1xuICAgICAgICAgICAgaWYgKHRzdHIgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbC5fLnRyYW5zZm9ybTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRzdHIgPSBTdHIodHN0cikucmVwbGFjZSgvXFwuezN9fFxcdTIwMjYvZywgZWwuXy50cmFuc2Zvcm0gfHwgRSk7XG4gICAgICAgICAgICB2YXIgdGRhdGEgPSBSLnBhcnNlVHJhbnNmb3JtU3RyaW5nKHRzdHIpLFxuICAgICAgICAgICAgICAgIGRlZyA9IDAsXG4gICAgICAgICAgICAgICAgZHggPSAwLFxuICAgICAgICAgICAgICAgIGR5ID0gMCxcbiAgICAgICAgICAgICAgICBzeCA9IDEsXG4gICAgICAgICAgICAgICAgc3kgPSAxLFxuICAgICAgICAgICAgICAgIF8gPSBlbC5fLFxuICAgICAgICAgICAgICAgIG0gPSBuZXcgTWF0cml4O1xuICAgICAgICAgICAgXy50cmFuc2Zvcm0gPSB0ZGF0YSB8fCBbXTtcbiAgICAgICAgICAgIGlmICh0ZGF0YSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHRkYXRhLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHQgPSB0ZGF0YVtpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRsZW4gPSB0Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmQgPSBTdHIodFswXSkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFic29sdXRlID0gdFswXSAhPSBjb21tYW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW52ZXIgPSBhYnNvbHV0ZSA/IG0uaW52ZXJ0KCkgOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgeDEsXG4gICAgICAgICAgICAgICAgICAgICAgICB5MSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHgyLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTIsXG4gICAgICAgICAgICAgICAgICAgICAgICBiYjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbW1hbmQgPT0gXCJ0XCIgJiYgdGxlbiA9PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWJzb2x1dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4MSA9IGludmVyLngoMCwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTEgPSBpbnZlci55KDAsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgyID0gaW52ZXIueCh0WzFdLCB0WzJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5MiA9IGludmVyLnkodFsxXSwgdFsyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cmFuc2xhdGUoeDIgLSB4MSwgeTIgLSB5MSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJhbnNsYXRlKHRbMV0sIHRbMl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT0gXCJyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0bGVuID09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYiA9IGJiIHx8IGVsLmdldEJCb3goMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5yb3RhdGUodFsxXSwgYmIueCArIGJiLndpZHRoIC8gMiwgYmIueSArIGJiLmhlaWdodCAvIDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZyArPSB0WzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0bGVuID09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWJzb2x1dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDIgPSBpbnZlci54KHRbMl0sIHRbM10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5MiA9IGludmVyLnkodFsyXSwgdFszXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0ucm90YXRlKHRbMV0sIHgyLCB5Mik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5yb3RhdGUodFsxXSwgdFsyXSwgdFszXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZyArPSB0WzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT0gXCJzXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0bGVuID09IDIgfHwgdGxlbiA9PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmIgPSBiYiB8fCBlbC5nZXRCQm94KDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uc2NhbGUodFsxXSwgdFt0bGVuIC0gMV0sIGJiLnggKyBiYi53aWR0aCAvIDIsIGJiLnkgKyBiYi5oZWlnaHQgLyAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeCAqPSB0WzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5ICo9IHRbdGxlbiAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0bGVuID09IDUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWJzb2x1dGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDIgPSBpbnZlci54KHRbM10sIHRbNF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5MiA9IGludmVyLnkodFszXSwgdFs0XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uc2NhbGUodFsxXSwgdFsyXSwgeDIsIHkyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnNjYWxlKHRbMV0sIHRbMl0sIHRbM10sIHRbNF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeCAqPSB0WzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5ICo9IHRbMl07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29tbWFuZCA9PSBcIm1cIiAmJiB0bGVuID09IDcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uYWRkKHRbMV0sIHRbMl0sIHRbM10sIHRbNF0sIHRbNV0sIHRbNl0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF8uZGlydHlUID0gMTtcbiAgICAgICAgICAgICAgICAgICAgZWwubWF0cml4ID0gbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qXFxcbiAgICAgICAgICAgICAqIEVsZW1lbnQubWF0cml4XG4gICAgICAgICAgICAgWyBwcm9wZXJ0eSAob2JqZWN0KSBdXG4gICAgICAgICAgICAgKipcbiAgICAgICAgICAgICAqIEtlZXBzIEBNYXRyaXggb2JqZWN0LCB3aGljaCByZXByZXNlbnRzIGVsZW1lbnQgdHJhbnNmb3JtYXRpb25cbiAgICAgICAgICAgIFxcKi9cbiAgICAgICAgICAgIGVsLm1hdHJpeCA9IG07XG5cbiAgICAgICAgICAgIF8uc3ggPSBzeDtcbiAgICAgICAgICAgIF8uc3kgPSBzeTtcbiAgICAgICAgICAgIF8uZGVnID0gZGVnO1xuICAgICAgICAgICAgXy5keCA9IGR4ID0gbS5lO1xuICAgICAgICAgICAgXy5keSA9IGR5ID0gbS5mO1xuXG4gICAgICAgICAgICBpZiAoc3ggPT0gMSAmJiBzeSA9PSAxICYmICFkZWcgJiYgXy5iYm94KSB7XG4gICAgICAgICAgICAgICAgXy5iYm94LnggKz0gK2R4O1xuICAgICAgICAgICAgICAgIF8uYmJveC55ICs9ICtkeTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXy5kaXJ0eVQgPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBnZXRFbXB0eSA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICB2YXIgbCA9IGl0ZW1bMF07XG4gICAgICAgICAgICBzd2l0Y2ggKGwudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJ0XCI6IHJldHVybiBbbCwgMCwgMF07XG4gICAgICAgICAgICAgICAgY2FzZSBcIm1cIjogcmV0dXJuIFtsLCAxLCAwLCAwLCAxLCAwLCAwXTtcbiAgICAgICAgICAgICAgICBjYXNlIFwiclwiOiBpZiAoaXRlbS5sZW5ndGggPT0gNCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2wsIDAsIGl0ZW1bMl0sIGl0ZW1bM11dO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbbCwgMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgXCJzXCI6IGlmIChpdGVtLmxlbmd0aCA9PSA1KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbbCwgMSwgMSwgaXRlbVszXSwgaXRlbVs0XV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLmxlbmd0aCA9PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbbCwgMSwgMV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtsLCAxXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVxdWFsaXNlVHJhbnNmb3JtID0gUi5fZXF1YWxpc2VUcmFuc2Zvcm0gPSBmdW5jdGlvbiAodDEsIHQyKSB7XG4gICAgICAgICAgICB0MiA9IFN0cih0MikucmVwbGFjZSgvXFwuezN9fFxcdTIwMjYvZywgdDEpO1xuICAgICAgICAgICAgdDEgPSBSLnBhcnNlVHJhbnNmb3JtU3RyaW5nKHQxKSB8fCBbXTtcbiAgICAgICAgICAgIHQyID0gUi5wYXJzZVRyYW5zZm9ybVN0cmluZyh0MikgfHwgW107XG4gICAgICAgICAgICB2YXIgbWF4bGVuZ3RoID0gbW1heCh0MS5sZW5ndGgsIHQyLmxlbmd0aCksXG4gICAgICAgICAgICAgICAgZnJvbSA9IFtdLFxuICAgICAgICAgICAgICAgIHRvID0gW10sXG4gICAgICAgICAgICAgICAgaSA9IDAsIGosIGpqLFxuICAgICAgICAgICAgICAgIHR0MSwgdHQyO1xuICAgICAgICAgICAgZm9yICg7IGkgPCBtYXhsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHR0MSA9IHQxW2ldIHx8IGdldEVtcHR5KHQyW2ldKTtcbiAgICAgICAgICAgICAgICB0dDIgPSB0MltpXSB8fCBnZXRFbXB0eSh0dDEpO1xuICAgICAgICAgICAgICAgIGlmICgodHQxWzBdICE9IHR0MlswXSkgfHxcbiAgICAgICAgICAgICAgICAgICAgKHR0MVswXS50b0xvd2VyQ2FzZSgpID09IFwiclwiICYmICh0dDFbMl0gIT0gdHQyWzJdIHx8IHR0MVszXSAhPSB0dDJbM10pKSB8fFxuICAgICAgICAgICAgICAgICAgICAodHQxWzBdLnRvTG93ZXJDYXNlKCkgPT0gXCJzXCIgJiYgKHR0MVszXSAhPSB0dDJbM10gfHwgdHQxWzRdICE9IHR0Mls0XSkpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZyb21baV0gPSBbXTtcbiAgICAgICAgICAgICAgICB0b1tpXSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAoaiA9IDAsIGpqID0gbW1heCh0dDEubGVuZ3RoLCB0dDIubGVuZ3RoKTsgaiA8IGpqOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaiBpbiB0dDEgJiYgKGZyb21baV1bal0gPSB0dDFbal0pO1xuICAgICAgICAgICAgICAgICAgICBqIGluIHR0MiAmJiAodG9baV1bal0gPSB0dDJbal0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZnJvbTogZnJvbSxcbiAgICAgICAgICAgICAgICB0bzogdG9cbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgUi5fZ2V0Q29udGFpbmVyID0gZnVuY3Rpb24gKHgsIHksIHcsIGgpIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lcjtcbiAgICAgICAgY29udGFpbmVyID0gaCA9PSBudWxsICYmICFSLmlzKHgsIFwib2JqZWN0XCIpID8gZy5kb2MuZ2V0RWxlbWVudEJ5SWQoeCkgOiB4O1xuICAgICAgICBpZiAoY29udGFpbmVyID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29udGFpbmVyLnRhZ05hbWUpIHtcbiAgICAgICAgICAgIGlmICh5ID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGNvbnRhaW5lci5zdHlsZS5waXhlbFdpZHRoIHx8IGNvbnRhaW5lci5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBjb250YWluZXIuc3R5bGUucGl4ZWxIZWlnaHQgfHwgY29udGFpbmVyLm9mZnNldEhlaWdodFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcjogY29udGFpbmVyLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogeSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB3XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udGFpbmVyOiAxLFxuICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICB3aWR0aDogdyxcbiAgICAgICAgICAgIGhlaWdodDogaFxuICAgICAgICB9O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwucGF0aFRvUmVsYXRpdmVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogQ29udmVydHMgcGF0aCB0byByZWxhdGl2ZSBmb3JtXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHBhdGhTdHJpbmcgKHN0cmluZ3xhcnJheSkgcGF0aCBzdHJpbmcgb3IgYXJyYXkgb2Ygc2VnbWVudHNcbiAgICAgPSAoYXJyYXkpIGFycmF5IG9mIHNlZ21lbnRzLlxuICAgIFxcKi9cbiAgICBSLnBhdGhUb1JlbGF0aXZlID0gcGF0aFRvUmVsYXRpdmU7XG4gICAgUi5fZW5naW5lID0ge307XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwucGF0aDJjdXJ2ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBDb252ZXJ0cyBwYXRoIHRvIGEgbmV3IHBhdGggd2hlcmUgYWxsIHNlZ21lbnRzIGFyZSBjdWJpYyBiZXppZXIgY3VydmVzLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBwYXRoU3RyaW5nIChzdHJpbmd8YXJyYXkpIHBhdGggc3RyaW5nIG9yIGFycmF5IG9mIHNlZ21lbnRzXG4gICAgID0gKGFycmF5KSBhcnJheSBvZiBzZWdtZW50cy5cbiAgICBcXCovXG4gICAgUi5wYXRoMmN1cnZlID0gcGF0aDJjdXJ2ZTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5tYXRyaXhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogUmV0dXJucyBtYXRyaXggYmFzZWQgb24gZ2l2ZW4gcGFyYW1ldGVycy5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gYSAobnVtYmVyKVxuICAgICAtIGIgKG51bWJlcilcbiAgICAgLSBjIChudW1iZXIpXG4gICAgIC0gZCAobnVtYmVyKVxuICAgICAtIGUgKG51bWJlcilcbiAgICAgLSBmIChudW1iZXIpXG4gICAgID0gKG9iamVjdCkgQE1hdHJpeFxuICAgIFxcKi9cbiAgICBSLm1hdHJpeCA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkLCBlLCBmKSB7XG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4KGEsIGIsIGMsIGQsIGUsIGYpO1xuICAgIH07XG4gICAgZnVuY3Rpb24gTWF0cml4KGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgICAgICAgaWYgKGEgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5hID0gK2E7XG4gICAgICAgICAgICB0aGlzLmIgPSArYjtcbiAgICAgICAgICAgIHRoaXMuYyA9ICtjO1xuICAgICAgICAgICAgdGhpcy5kID0gK2Q7XG4gICAgICAgICAgICB0aGlzLmUgPSArZTtcbiAgICAgICAgICAgIHRoaXMuZiA9ICtmO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hID0gMTtcbiAgICAgICAgICAgIHRoaXMuYiA9IDA7XG4gICAgICAgICAgICB0aGlzLmMgPSAwO1xuICAgICAgICAgICAgdGhpcy5kID0gMTtcbiAgICAgICAgICAgIHRoaXMuZSA9IDA7XG4gICAgICAgICAgICB0aGlzLmYgPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIChmdW5jdGlvbiAobWF0cml4cHJvdG8pIHtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBNYXRyaXguYWRkXG4gICAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBBZGRzIGdpdmVuIG1hdHJpeCB0byBleGlzdGluZyBvbmUuXG4gICAgICAgICA+IFBhcmFtZXRlcnNcbiAgICAgICAgIC0gYSAobnVtYmVyKVxuICAgICAgICAgLSBiIChudW1iZXIpXG4gICAgICAgICAtIGMgKG51bWJlcilcbiAgICAgICAgIC0gZCAobnVtYmVyKVxuICAgICAgICAgLSBlIChudW1iZXIpXG4gICAgICAgICAtIGYgKG51bWJlcilcbiAgICAgICAgIG9yXG4gICAgICAgICAtIG1hdHJpeCAob2JqZWN0KSBATWF0cml4XG4gICAgICAgIFxcKi9cbiAgICAgICAgbWF0cml4cHJvdG8uYWRkID0gZnVuY3Rpb24gKGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgICAgICAgICAgIHZhciBvdXQgPSBbW10sIFtdLCBbXV0sXG4gICAgICAgICAgICAgICAgbSA9IFtbdGhpcy5hLCB0aGlzLmMsIHRoaXMuZV0sIFt0aGlzLmIsIHRoaXMuZCwgdGhpcy5mXSwgWzAsIDAsIDFdXSxcbiAgICAgICAgICAgICAgICBtYXRyaXggPSBbW2EsIGMsIGVdLCBbYiwgZCwgZl0sIFswLCAwLCAxXV0sXG4gICAgICAgICAgICAgICAgeCwgeSwgeiwgcmVzO1xuXG4gICAgICAgICAgICBpZiAoYSAmJiBhIGluc3RhbmNlb2YgTWF0cml4KSB7XG4gICAgICAgICAgICAgICAgbWF0cml4ID0gW1thLmEsIGEuYywgYS5lXSwgW2EuYiwgYS5kLCBhLmZdLCBbMCwgMCwgMV1dO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHggPSAwOyB4IDwgMzsgeCsrKSB7XG4gICAgICAgICAgICAgICAgZm9yICh5ID0gMDsgeSA8IDM7IHkrKykge1xuICAgICAgICAgICAgICAgICAgICByZXMgPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHogPSAwOyB6IDwgMzsgeisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXMgKz0gbVt4XVt6XSAqIG1hdHJpeFt6XVt5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvdXRbeF1beV0gPSByZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5hID0gb3V0WzBdWzBdO1xuICAgICAgICAgICAgdGhpcy5iID0gb3V0WzFdWzBdO1xuICAgICAgICAgICAgdGhpcy5jID0gb3V0WzBdWzFdO1xuICAgICAgICAgICAgdGhpcy5kID0gb3V0WzFdWzFdO1xuICAgICAgICAgICAgdGhpcy5lID0gb3V0WzBdWzJdO1xuICAgICAgICAgICAgdGhpcy5mID0gb3V0WzFdWzJdO1xuICAgICAgICB9O1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIE1hdHJpeC5pbnZlcnRcbiAgICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFJldHVybnMgaW52ZXJ0ZWQgdmVyc2lvbiBvZiB0aGUgbWF0cml4XG4gICAgICAgICA9IChvYmplY3QpIEBNYXRyaXhcbiAgICAgICAgXFwqL1xuICAgICAgICBtYXRyaXhwcm90by5pbnZlcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbWUgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHggPSBtZS5hICogbWUuZCAtIG1lLmIgKiBtZS5jO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXgobWUuZCAvIHgsIC1tZS5iIC8geCwgLW1lLmMgLyB4LCBtZS5hIC8geCwgKG1lLmMgKiBtZS5mIC0gbWUuZCAqIG1lLmUpIC8geCwgKG1lLmIgKiBtZS5lIC0gbWUuYSAqIG1lLmYpIC8geCk7XG4gICAgICAgIH07XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogTWF0cml4LmNsb25lXG4gICAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBSZXR1cm5zIGNvcHkgb2YgdGhlIG1hdHJpeFxuICAgICAgICAgPSAob2JqZWN0KSBATWF0cml4XG4gICAgICAgIFxcKi9cbiAgICAgICAgbWF0cml4cHJvdG8uY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hdHJpeCh0aGlzLmEsIHRoaXMuYiwgdGhpcy5jLCB0aGlzLmQsIHRoaXMuZSwgdGhpcy5mKTtcbiAgICAgICAgfTtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBNYXRyaXgudHJhbnNsYXRlXG4gICAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBUcmFuc2xhdGUgdGhlIG1hdHJpeFxuICAgICAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICAgICAtIHggKG51bWJlcilcbiAgICAgICAgIC0geSAobnVtYmVyKVxuICAgICAgICBcXCovXG4gICAgICAgIG1hdHJpeHByb3RvLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgICAgICB0aGlzLmFkZCgxLCAwLCAwLCAxLCB4LCB5KTtcbiAgICAgICAgfTtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBNYXRyaXguc2NhbGVcbiAgICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFNjYWxlcyB0aGUgbWF0cml4XG4gICAgICAgICA+IFBhcmFtZXRlcnNcbiAgICAgICAgIC0geCAobnVtYmVyKVxuICAgICAgICAgLSB5IChudW1iZXIpICNvcHRpb25hbFxuICAgICAgICAgLSBjeCAobnVtYmVyKSAjb3B0aW9uYWxcbiAgICAgICAgIC0gY3kgKG51bWJlcikgI29wdGlvbmFsXG4gICAgICAgIFxcKi9cbiAgICAgICAgbWF0cml4cHJvdG8uc2NhbGUgPSBmdW5jdGlvbiAoeCwgeSwgY3gsIGN5KSB7XG4gICAgICAgICAgICB5ID09IG51bGwgJiYgKHkgPSB4KTtcbiAgICAgICAgICAgIChjeCB8fCBjeSkgJiYgdGhpcy5hZGQoMSwgMCwgMCwgMSwgY3gsIGN5KTtcbiAgICAgICAgICAgIHRoaXMuYWRkKHgsIDAsIDAsIHksIDAsIDApO1xuICAgICAgICAgICAgKGN4IHx8IGN5KSAmJiB0aGlzLmFkZCgxLCAwLCAwLCAxLCAtY3gsIC1jeSk7XG4gICAgICAgIH07XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogTWF0cml4LnJvdGF0ZVxuICAgICAgICAgWyBtZXRob2QgXVxuICAgICAgICAgKipcbiAgICAgICAgICogUm90YXRlcyB0aGUgbWF0cml4XG4gICAgICAgICA+IFBhcmFtZXRlcnNcbiAgICAgICAgIC0gYSAobnVtYmVyKVxuICAgICAgICAgLSB4IChudW1iZXIpXG4gICAgICAgICAtIHkgKG51bWJlcilcbiAgICAgICAgXFwqL1xuICAgICAgICBtYXRyaXhwcm90by5yb3RhdGUgPSBmdW5jdGlvbiAoYSwgeCwgeSkge1xuICAgICAgICAgICAgYSA9IFIucmFkKGEpO1xuICAgICAgICAgICAgeCA9IHggfHwgMDtcbiAgICAgICAgICAgIHkgPSB5IHx8IDA7XG4gICAgICAgICAgICB2YXIgY29zID0gK21hdGguY29zKGEpLnRvRml4ZWQoOSksXG4gICAgICAgICAgICAgICAgc2luID0gK21hdGguc2luKGEpLnRvRml4ZWQoOSk7XG4gICAgICAgICAgICB0aGlzLmFkZChjb3MsIHNpbiwgLXNpbiwgY29zLCB4LCB5KTtcbiAgICAgICAgICAgIHRoaXMuYWRkKDEsIDAsIDAsIDEsIC14LCAteSk7XG4gICAgICAgIH07XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogTWF0cml4LnhcbiAgICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFJldHVybiB4IGNvb3JkaW5hdGUgZm9yIGdpdmVuIHBvaW50IGFmdGVyIHRyYW5zZm9ybWF0aW9uIGRlc2NyaWJlZCBieSB0aGUgbWF0cml4LiBTZWUgYWxzbyBATWF0cml4LnlcbiAgICAgICAgID4gUGFyYW1ldGVyc1xuICAgICAgICAgLSB4IChudW1iZXIpXG4gICAgICAgICAtIHkgKG51bWJlcilcbiAgICAgICAgID0gKG51bWJlcikgeFxuICAgICAgICBcXCovXG4gICAgICAgIG1hdHJpeHByb3RvLnggPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHggKiB0aGlzLmEgKyB5ICogdGhpcy5jICsgdGhpcy5lO1xuICAgICAgICB9O1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIE1hdHJpeC55XG4gICAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBSZXR1cm4geSBjb29yZGluYXRlIGZvciBnaXZlbiBwb2ludCBhZnRlciB0cmFuc2Zvcm1hdGlvbiBkZXNjcmliZWQgYnkgdGhlIG1hdHJpeC4gU2VlIGFsc28gQE1hdHJpeC54XG4gICAgICAgICA+IFBhcmFtZXRlcnNcbiAgICAgICAgIC0geCAobnVtYmVyKVxuICAgICAgICAgLSB5IChudW1iZXIpXG4gICAgICAgICA9IChudW1iZXIpIHlcbiAgICAgICAgXFwqL1xuICAgICAgICBtYXRyaXhwcm90by55ID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgICAgIHJldHVybiB4ICogdGhpcy5iICsgeSAqIHRoaXMuZCArIHRoaXMuZjtcbiAgICAgICAgfTtcbiAgICAgICAgbWF0cml4cHJvdG8uZ2V0ID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHJldHVybiArdGhpc1tTdHIuZnJvbUNoYXJDb2RlKDk3ICsgaSldLnRvRml4ZWQoNCk7XG4gICAgICAgIH07XG4gICAgICAgIG1hdHJpeHByb3RvLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIFIuc3ZnID9cbiAgICAgICAgICAgICAgICBcIm1hdHJpeChcIiArIFt0aGlzLmdldCgwKSwgdGhpcy5nZXQoMSksIHRoaXMuZ2V0KDIpLCB0aGlzLmdldCgzKSwgdGhpcy5nZXQoNCksIHRoaXMuZ2V0KDUpXS5qb2luKCkgKyBcIilcIiA6XG4gICAgICAgICAgICAgICAgW3RoaXMuZ2V0KDApLCB0aGlzLmdldCgyKSwgdGhpcy5nZXQoMSksIHRoaXMuZ2V0KDMpLCAwLCAwXS5qb2luKCk7XG4gICAgICAgIH07XG4gICAgICAgIG1hdHJpeHByb3RvLnRvRmlsdGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIFwicHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0Lk1hdHJpeChNMTE9XCIgKyB0aGlzLmdldCgwKSArXG4gICAgICAgICAgICAgICAgXCIsIE0xMj1cIiArIHRoaXMuZ2V0KDIpICsgXCIsIE0yMT1cIiArIHRoaXMuZ2V0KDEpICsgXCIsIE0yMj1cIiArIHRoaXMuZ2V0KDMpICtcbiAgICAgICAgICAgICAgICBcIiwgRHg9XCIgKyB0aGlzLmdldCg0KSArIFwiLCBEeT1cIiArIHRoaXMuZ2V0KDUpICsgXCIsIHNpemluZ21ldGhvZD0nYXV0byBleHBhbmQnKVwiO1xuICAgICAgICB9O1xuICAgICAgICBtYXRyaXhwcm90by5vZmZzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gW3RoaXMuZS50b0ZpeGVkKDQpLCB0aGlzLmYudG9GaXhlZCg0KV07XG4gICAgICAgIH07XG4gICAgICAgIGZ1bmN0aW9uIG5vcm0oYSkge1xuICAgICAgICAgICAgcmV0dXJuIGFbMF0gKiBhWzBdICsgYVsxXSAqIGFbMV07XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gbm9ybWFsaXplKGEpIHtcbiAgICAgICAgICAgIHZhciBtYWcgPSBtYXRoLnNxcnQobm9ybShhKSk7XG4gICAgICAgICAgICBhWzBdICYmIChhWzBdIC89IG1hZyk7XG4gICAgICAgICAgICBhWzFdICYmIChhWzFdIC89IG1hZyk7XG4gICAgICAgIH1cbiAgICAgICAgLypcXFxuICAgICAgICAgKiBNYXRyaXguc3BsaXRcbiAgICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFNwbGl0cyBtYXRyaXggaW50byBwcmltaXRpdmUgdHJhbnNmb3JtYXRpb25zXG4gICAgICAgICA9IChvYmplY3QpIGluIGZvcm1hdDpcbiAgICAgICAgIG8gZHggKG51bWJlcikgdHJhbnNsYXRpb24gYnkgeFxuICAgICAgICAgbyBkeSAobnVtYmVyKSB0cmFuc2xhdGlvbiBieSB5XG4gICAgICAgICBvIHNjYWxleCAobnVtYmVyKSBzY2FsZSBieSB4XG4gICAgICAgICBvIHNjYWxleSAobnVtYmVyKSBzY2FsZSBieSB5XG4gICAgICAgICBvIHNoZWFyIChudW1iZXIpIHNoZWFyXG4gICAgICAgICBvIHJvdGF0ZSAobnVtYmVyKSByb3RhdGlvbiBpbiBkZWdcbiAgICAgICAgIG8gaXNTaW1wbGUgKGJvb2xlYW4pIGNvdWxkIGl0IGJlIHJlcHJlc2VudGVkIHZpYSBzaW1wbGUgdHJhbnNmb3JtYXRpb25zXG4gICAgICAgIFxcKi9cbiAgICAgICAgbWF0cml4cHJvdG8uc3BsaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgb3V0ID0ge307XG4gICAgICAgICAgICAvLyB0cmFuc2xhdGlvblxuICAgICAgICAgICAgb3V0LmR4ID0gdGhpcy5lO1xuICAgICAgICAgICAgb3V0LmR5ID0gdGhpcy5mO1xuXG4gICAgICAgICAgICAvLyBzY2FsZSBhbmQgc2hlYXJcbiAgICAgICAgICAgIHZhciByb3cgPSBbW3RoaXMuYSwgdGhpcy5jXSwgW3RoaXMuYiwgdGhpcy5kXV07XG4gICAgICAgICAgICBvdXQuc2NhbGV4ID0gbWF0aC5zcXJ0KG5vcm0ocm93WzBdKSk7XG4gICAgICAgICAgICBub3JtYWxpemUocm93WzBdKTtcblxuICAgICAgICAgICAgb3V0LnNoZWFyID0gcm93WzBdWzBdICogcm93WzFdWzBdICsgcm93WzBdWzFdICogcm93WzFdWzFdO1xuICAgICAgICAgICAgcm93WzFdID0gW3Jvd1sxXVswXSAtIHJvd1swXVswXSAqIG91dC5zaGVhciwgcm93WzFdWzFdIC0gcm93WzBdWzFdICogb3V0LnNoZWFyXTtcblxuICAgICAgICAgICAgb3V0LnNjYWxleSA9IG1hdGguc3FydChub3JtKHJvd1sxXSkpO1xuICAgICAgICAgICAgbm9ybWFsaXplKHJvd1sxXSk7XG4gICAgICAgICAgICBvdXQuc2hlYXIgLz0gb3V0LnNjYWxleTtcblxuICAgICAgICAgICAgLy8gcm90YXRpb25cbiAgICAgICAgICAgIHZhciBzaW4gPSAtcm93WzBdWzFdLFxuICAgICAgICAgICAgICAgIGNvcyA9IHJvd1sxXVsxXTtcbiAgICAgICAgICAgIGlmIChjb3MgPCAwKSB7XG4gICAgICAgICAgICAgICAgb3V0LnJvdGF0ZSA9IFIuZGVnKG1hdGguYWNvcyhjb3MpKTtcbiAgICAgICAgICAgICAgICBpZiAoc2luIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBvdXQucm90YXRlID0gMzYwIC0gb3V0LnJvdGF0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dC5yb3RhdGUgPSBSLmRlZyhtYXRoLmFzaW4oc2luKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG91dC5pc1NpbXBsZSA9ICErb3V0LnNoZWFyLnRvRml4ZWQoOSkgJiYgKG91dC5zY2FsZXgudG9GaXhlZCg5KSA9PSBvdXQuc2NhbGV5LnRvRml4ZWQoOSkgfHwgIW91dC5yb3RhdGUpO1xuICAgICAgICAgICAgb3V0LmlzU3VwZXJTaW1wbGUgPSAhK291dC5zaGVhci50b0ZpeGVkKDkpICYmIG91dC5zY2FsZXgudG9GaXhlZCg5KSA9PSBvdXQuc2NhbGV5LnRvRml4ZWQoOSkgJiYgIW91dC5yb3RhdGU7XG4gICAgICAgICAgICBvdXQubm9Sb3RhdGlvbiA9ICErb3V0LnNoZWFyLnRvRml4ZWQoOSkgJiYgIW91dC5yb3RhdGU7XG4gICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9O1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIE1hdHJpeC50b1RyYW5zZm9ybVN0cmluZ1xuICAgICAgICAgWyBtZXRob2QgXVxuICAgICAgICAgKipcbiAgICAgICAgICogUmV0dXJuIHRyYW5zZm9ybSBzdHJpbmcgdGhhdCByZXByZXNlbnRzIGdpdmVuIG1hdHJpeFxuICAgICAgICAgPSAoc3RyaW5nKSB0cmFuc2Zvcm0gc3RyaW5nXG4gICAgICAgIFxcKi9cbiAgICAgICAgbWF0cml4cHJvdG8udG9UcmFuc2Zvcm1TdHJpbmcgPSBmdW5jdGlvbiAoc2hvcnRlcikge1xuICAgICAgICAgICAgdmFyIHMgPSBzaG9ydGVyIHx8IHRoaXNbc3BsaXRdKCk7XG4gICAgICAgICAgICBpZiAocy5pc1NpbXBsZSkge1xuICAgICAgICAgICAgICAgIHMuc2NhbGV4ID0gK3Muc2NhbGV4LnRvRml4ZWQoNCk7XG4gICAgICAgICAgICAgICAgcy5zY2FsZXkgPSArcy5zY2FsZXkudG9GaXhlZCg0KTtcbiAgICAgICAgICAgICAgICBzLnJvdGF0ZSA9ICtzLnJvdGF0ZS50b0ZpeGVkKDQpO1xuICAgICAgICAgICAgICAgIHJldHVybiAgKHMuZHggfHwgcy5keSA/IFwidFwiICsgW3MuZHgsIHMuZHldIDogRSkgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgIChzLnNjYWxleCAhPSAxIHx8IHMuc2NhbGV5ICE9IDEgPyBcInNcIiArIFtzLnNjYWxleCwgcy5zY2FsZXksIDAsIDBdIDogRSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKHMucm90YXRlID8gXCJyXCIgKyBbcy5yb3RhdGUsIDAsIDBdIDogRSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIm1cIiArIFt0aGlzLmdldCgwKSwgdGhpcy5nZXQoMSksIHRoaXMuZ2V0KDIpLCB0aGlzLmdldCgzKSwgdGhpcy5nZXQoNCksIHRoaXMuZ2V0KDUpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KShNYXRyaXgucHJvdG90eXBlKTtcblxuICAgIC8vIFdlYktpdCByZW5kZXJpbmcgYnVnIHdvcmthcm91bmQgbWV0aG9kXG4gICAgdmFyIHZlcnNpb24gPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9WZXJzaW9uXFwvKC4qPylcXHMvKSB8fCBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9DaHJvbWVcXC8oXFxkKykvKTtcbiAgICBpZiAoKG5hdmlnYXRvci52ZW5kb3IgPT0gXCJBcHBsZSBDb21wdXRlciwgSW5jLlwiKSAmJiAodmVyc2lvbiAmJiB2ZXJzaW9uWzFdIDwgNCB8fCBuYXZpZ2F0b3IucGxhdGZvcm0uc2xpY2UoMCwgMikgPT0gXCJpUFwiKSB8fFxuICAgICAgICAobmF2aWdhdG9yLnZlbmRvciA9PSBcIkdvb2dsZSBJbmMuXCIgJiYgdmVyc2lvbiAmJiB2ZXJzaW9uWzFdIDwgOCkpIHtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBQYXBlci5zYWZhcmlcbiAgICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFRoZXJlIGlzIGFuIGluY29udmVuaWVudCByZW5kZXJpbmcgYnVnIGluIFNhZmFyaSAoV2ViS2l0KTpcbiAgICAgICAgICogc29tZXRpbWVzIHRoZSByZW5kZXJpbmcgc2hvdWxkIGJlIGZvcmNlZC5cbiAgICAgICAgICogVGhpcyBtZXRob2Qgc2hvdWxkIGhlbHAgd2l0aCBkZWFsaW5nIHdpdGggdGhpcyBidWcuXG4gICAgICAgIFxcKi9cbiAgICAgICAgcGFwZXJwcm90by5zYWZhcmkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcmVjdCA9IHRoaXMucmVjdCgtOTksIC05OSwgdGhpcy53aWR0aCArIDk5LCB0aGlzLmhlaWdodCArIDk5KS5hdHRyKHtzdHJva2U6IFwibm9uZVwifSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtyZWN0LnJlbW92ZSgpO30pO1xuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcGVycHJvdG8uc2FmYXJpID0gZnVuO1xuICAgIH1cbiBcbiAgICB2YXIgcHJldmVudERlZmF1bHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICB9LFxuICAgIHByZXZlbnRUb3VjaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3JpZ2luYWxFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0sXG4gICAgc3RvcFByb3BhZ2F0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNhbmNlbEJ1YmJsZSA9IHRydWU7XG4gICAgfSxcbiAgICBzdG9wVG91Y2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yaWdpbmFsRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSxcbiAgICBhZGRFdmVudCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChnLmRvYy5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgdHlwZSwgZm4sIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVhbE5hbWUgPSBzdXBwb3J0c1RvdWNoICYmIHRvdWNoTWFwW3R5cGVdID8gdG91Y2hNYXBbdHlwZV0gOiB0eXBlLFxuICAgICAgICAgICAgICAgICAgICBmID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzY3JvbGxZID0gZy5kb2MuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBnLmRvYy5ib2R5LnNjcm9sbFRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxYID0gZy5kb2MuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgfHwgZy5kb2MuYm9keS5zY3JvbGxMZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggPSBlLmNsaWVudFggKyBzY3JvbGxYLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkgPSBlLmNsaWVudFkgKyBzY3JvbGxZO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3VwcG9ydHNUb3VjaCAmJiB0b3VjaE1hcFtoYXNdKHR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBlLnRhcmdldFRvdWNoZXMgJiYgZS50YXJnZXRUb3VjaGVzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS50YXJnZXRUb3VjaGVzW2ldLnRhcmdldCA9PSBvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZGUgPSBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlID0gZS50YXJnZXRUb3VjaGVzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLm9yaWdpbmFsRXZlbnQgPSBvbGRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0ID0gcHJldmVudFRvdWNoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbiA9IHN0b3BUb3VjaDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmbi5jYWxsKGVsZW1lbnQsIGUsIHgsIHkpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgb2JqLmFkZEV2ZW50TGlzdGVuZXIocmVhbE5hbWUsIGYsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcihyZWFsTmFtZSwgZiwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChnLmRvYy5hdHRhY2hFdmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIHR5cGUsIGZuLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGYgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBlID0gZSB8fCBnLndpbi5ldmVudDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjcm9sbFkgPSBnLmRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGcuZG9jLmJvZHkuc2Nyb2xsVG9wLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsWCA9IGcuZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IHx8IGcuZG9jLmJvZHkuc2Nyb2xsTGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHggPSBlLmNsaWVudFggKyBzY3JvbGxYLFxuICAgICAgICAgICAgICAgICAgICAgICAgeSA9IGUuY2xpZW50WSArIHNjcm9sbFk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQgPSBlLnByZXZlbnREZWZhdWx0IHx8IHByZXZlbnREZWZhdWx0O1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbiA9IGUuc3RvcFByb3BhZ2F0aW9uIHx8IHN0b3BQcm9wYWdhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuLmNhbGwoZWxlbWVudCwgZSwgeCwgeSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBvYmouYXR0YWNoRXZlbnQoXCJvblwiICsgdHlwZSwgZik7XG4gICAgICAgICAgICAgICAgdmFyIGRldGFjaGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBvYmouZGV0YWNoRXZlbnQoXCJvblwiICsgdHlwZSwgZik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldGFjaGVyO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0pKCksXG4gICAgZHJhZyA9IFtdLFxuICAgIGRyYWdNb3ZlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIHggPSBlLmNsaWVudFgsXG4gICAgICAgICAgICB5ID0gZS5jbGllbnRZLFxuICAgICAgICAgICAgc2Nyb2xsWSA9IGcuZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZy5kb2MuYm9keS5zY3JvbGxUb3AsXG4gICAgICAgICAgICBzY3JvbGxYID0gZy5kb2MuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgfHwgZy5kb2MuYm9keS5zY3JvbGxMZWZ0LFxuICAgICAgICAgICAgZHJhZ2ksXG4gICAgICAgICAgICBqID0gZHJhZy5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChqLS0pIHtcbiAgICAgICAgICAgIGRyYWdpID0gZHJhZ1tqXTtcbiAgICAgICAgICAgIGlmIChzdXBwb3J0c1RvdWNoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSBlLnRvdWNoZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICB0b3VjaDtcbiAgICAgICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdWNoID0gZS50b3VjaGVzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAodG91Y2guaWRlbnRpZmllciA9PSBkcmFnaS5lbC5fZHJhZy5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgeCA9IHRvdWNoLmNsaWVudFg7XG4gICAgICAgICAgICAgICAgICAgICAgICB5ID0gdG91Y2guY2xpZW50WTtcbiAgICAgICAgICAgICAgICAgICAgICAgIChlLm9yaWdpbmFsRXZlbnQgPyBlLm9yaWdpbmFsRXZlbnQgOiBlKS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBub2RlID0gZHJhZ2kuZWwubm9kZSxcbiAgICAgICAgICAgICAgICBvLFxuICAgICAgICAgICAgICAgIG5leHQgPSBub2RlLm5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICAgIHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZSxcbiAgICAgICAgICAgICAgICBkaXNwbGF5ID0gbm9kZS5zdHlsZS5kaXNwbGF5O1xuICAgICAgICAgICAgZy53aW4ub3BlcmEgJiYgcGFyZW50LnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgICAgICAgbm9kZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICBvID0gZHJhZ2kuZWwucGFwZXIuZ2V0RWxlbWVudEJ5UG9pbnQoeCwgeSk7XG4gICAgICAgICAgICBub2RlLnN0eWxlLmRpc3BsYXkgPSBkaXNwbGF5O1xuICAgICAgICAgICAgZy53aW4ub3BlcmEgJiYgKG5leHQgPyBwYXJlbnQuaW5zZXJ0QmVmb3JlKG5vZGUsIG5leHQpIDogcGFyZW50LmFwcGVuZENoaWxkKG5vZGUpKTtcbiAgICAgICAgICAgIG8gJiYgZXZlKFwicmFwaGFlbC5kcmFnLm92ZXIuXCIgKyBkcmFnaS5lbC5pZCwgZHJhZ2kuZWwsIG8pO1xuICAgICAgICAgICAgeCArPSBzY3JvbGxYO1xuICAgICAgICAgICAgeSArPSBzY3JvbGxZO1xuICAgICAgICAgICAgZXZlKFwicmFwaGFlbC5kcmFnLm1vdmUuXCIgKyBkcmFnaS5lbC5pZCwgZHJhZ2kubW92ZV9zY29wZSB8fCBkcmFnaS5lbCwgeCAtIGRyYWdpLmVsLl9kcmFnLngsIHkgLSBkcmFnaS5lbC5fZHJhZy55LCB4LCB5LCBlKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZHJhZ1VwID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgUi51bm1vdXNlbW92ZShkcmFnTW92ZSkudW5tb3VzZXVwKGRyYWdVcCk7XG4gICAgICAgIHZhciBpID0gZHJhZy5sZW5ndGgsXG4gICAgICAgICAgICBkcmFnaTtcbiAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgZHJhZ2kgPSBkcmFnW2ldO1xuICAgICAgICAgICAgZHJhZ2kuZWwuX2RyYWcgPSB7fTtcbiAgICAgICAgICAgIGV2ZShcInJhcGhhZWwuZHJhZy5lbmQuXCIgKyBkcmFnaS5lbC5pZCwgZHJhZ2kuZW5kX3Njb3BlIHx8IGRyYWdpLnN0YXJ0X3Njb3BlIHx8IGRyYWdpLm1vdmVfc2NvcGUgfHwgZHJhZ2kuZWwsIGUpO1xuICAgICAgICB9XG4gICAgICAgIGRyYWcgPSBbXTtcbiAgICB9LFxuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmVsXG4gICAgIFsgcHJvcGVydHkgKG9iamVjdCkgXVxuICAgICAqKlxuICAgICAqIFlvdSBjYW4gYWRkIHlvdXIgb3duIG1ldGhvZCB0byBlbGVtZW50cy4gVGhpcyBpcyB1c2VmdWxsIHdoZW4geW91IHdhbnQgdG8gaGFjayBkZWZhdWx0IGZ1bmN0aW9uYWxpdHkgb3JcbiAgICAgKiB3YW50IHRvIHdyYXAgc29tZSBjb21tb24gdHJhbnNmb3JtYXRpb24gb3IgYXR0cmlidXRlcyBpbiBvbmUgbWV0aG9kLiBJbiBkaWZmZXJlbmNlIHRvIGNhbnZhcyBtZXRob2RzLFxuICAgICAqIHlvdSBjYW4gcmVkZWZpbmUgZWxlbWVudCBtZXRob2QgYXQgYW55IHRpbWUuIEV4cGVuZGluZyBlbGVtZW50IG1ldGhvZHMgd291bGRu4oCZdCBhZmZlY3Qgc2V0LlxuICAgICA+IFVzYWdlXG4gICAgIHwgUmFwaGFlbC5lbC5yZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgIHwgICAgIHRoaXMuYXR0cih7ZmlsbDogXCIjZjAwXCJ9KTtcbiAgICAgfCB9O1xuICAgICB8IC8vIHRoZW4gdXNlIGl0XG4gICAgIHwgcGFwZXIuY2lyY2xlKDEwMCwgMTAwLCAyMCkucmVkKCk7XG4gICAgXFwqL1xuICAgIGVscHJvdG8gPSBSLmVsID0ge307XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuY2xpY2tcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlciBmb3IgY2xpY2sgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5jbGlja1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBldmVudCBoYW5kbGVyIGZvciBjbGljayBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5kYmxjbGlja1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBldmVudCBoYW5kbGVyIGZvciBkb3VibGUgY2xpY2sgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5kYmxjbGlja1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBldmVudCBoYW5kbGVyIGZvciBkb3VibGUgY2xpY2sgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQubW91c2Vkb3duXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXIgZm9yIG1vdXNlZG93biBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bm1vdXNlZG93blxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBldmVudCBoYW5kbGVyIGZvciBtb3VzZWRvd24gZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQubW91c2Vtb3ZlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXIgZm9yIG1vdXNlbW92ZSBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bm1vdXNlbW92ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBldmVudCBoYW5kbGVyIGZvciBtb3VzZW1vdmUgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQubW91c2VvdXRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlciBmb3IgbW91c2VvdXQgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5tb3VzZW91dFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBldmVudCBoYW5kbGVyIGZvciBtb3VzZW91dCBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5tb3VzZW92ZXJcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlciBmb3IgbW91c2VvdmVyIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVubW91c2VvdmVyXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGV2ZW50IGhhbmRsZXIgZm9yIG1vdXNlb3ZlciBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5tb3VzZXVwXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXIgZm9yIG1vdXNldXAgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5tb3VzZXVwXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGV2ZW50IGhhbmRsZXIgZm9yIG1vdXNldXAgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudG91Y2hzdGFydFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBldmVudCBoYW5kbGVyIGZvciB0b3VjaHN0YXJ0IGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVudG91Y2hzdGFydFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBldmVudCBoYW5kbGVyIGZvciB0b3VjaHN0YXJ0IGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIFxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnRvdWNobW92ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBldmVudCBoYW5kbGVyIGZvciB0b3VjaG1vdmUgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW50b3VjaG1vdmVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlciBmb3IgdG91Y2htb3ZlIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIFxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnRvdWNoZW5kXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXIgZm9yIHRvdWNoZW5kIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVudG91Y2hlbmRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlciBmb3IgdG91Y2hlbmQgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudG91Y2hjYW5jZWxcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlciBmb3IgdG91Y2hjYW5jZWwgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW50b3VjaGNhbmNlbFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBldmVudCBoYW5kbGVyIGZvciB0b3VjaGNhbmNlbCBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBmb3IgKHZhciBpID0gZXZlbnRzLmxlbmd0aDsgaS0tOykge1xuICAgICAgICAoZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuICAgICAgICAgICAgUltldmVudE5hbWVdID0gZWxwcm90b1tldmVudE5hbWVdID0gZnVuY3Rpb24gKGZuLCBzY29wZSkge1xuICAgICAgICAgICAgICAgIGlmIChSLmlzKGZuLCBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzID0gdGhpcy5ldmVudHMgfHwgW107XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzLnB1c2goe25hbWU6IGV2ZW50TmFtZSwgZjogZm4sIHVuYmluZDogYWRkRXZlbnQodGhpcy5zaGFwZSB8fCB0aGlzLm5vZGUgfHwgZy5kb2MsIGV2ZW50TmFtZSwgZm4sIHNjb3BlIHx8IHRoaXMpfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFJbXCJ1blwiICsgZXZlbnROYW1lXSA9IGVscHJvdG9bXCJ1blwiICsgZXZlbnROYW1lXSA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIHZhciBldmVudHMgPSB0aGlzLmV2ZW50cyB8fCBbXSxcbiAgICAgICAgICAgICAgICAgICAgbCA9IGV2ZW50cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGwtLSkgaWYgKGV2ZW50c1tsXS5uYW1lID09IGV2ZW50TmFtZSAmJiBldmVudHNbbF0uZiA9PSBmbikge1xuICAgICAgICAgICAgICAgICAgICBldmVudHNbbF0udW5iaW5kKCk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50cy5zcGxpY2UobCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICFldmVudHMubGVuZ3RoICYmIGRlbGV0ZSB0aGlzLmV2ZW50cztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSkoZXZlbnRzW2ldKTtcbiAgICB9XG4gICAgXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuZGF0YVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBvciByZXRyaWV2ZXMgZ2l2ZW4gdmFsdWUgYXNvY2lhdGVkIHdpdGggZ2l2ZW4ga2V5LlxuICAgICAqKiBcbiAgICAgKiBTZWUgYWxzbyBARWxlbWVudC5yZW1vdmVEYXRhXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGtleSAoc3RyaW5nKSBrZXkgdG8gc3RvcmUgZGF0YVxuICAgICAtIHZhbHVlIChhbnkpICNvcHRpb25hbCB2YWx1ZSB0byBzdG9yZVxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgICogb3IsIGlmIHZhbHVlIGlzIG5vdCBzcGVjaWZpZWQ6XG4gICAgID0gKGFueSkgdmFsdWVcbiAgICAgPiBVc2FnZVxuICAgICB8IGZvciAodmFyIGkgPSAwLCBpIDwgNSwgaSsrKSB7XG4gICAgIHwgICAgIHBhcGVyLmNpcmNsZSgxMCArIDE1ICogaSwgMTAsIDEwKVxuICAgICB8ICAgICAgICAgIC5hdHRyKHtmaWxsOiBcIiMwMDBcIn0pXG4gICAgIHwgICAgICAgICAgLmRhdGEoXCJpXCIsIGkpXG4gICAgIHwgICAgICAgICAgLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgfCAgICAgICAgICAgICBhbGVydCh0aGlzLmRhdGEoXCJpXCIpKTtcbiAgICAgfCAgICAgICAgICB9KTtcbiAgICAgfCB9XG4gICAgXFwqL1xuICAgIGVscHJvdG8uZGF0YSA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgIHZhciBkYXRhID0gZWxkYXRhW3RoaXMuaWRdID0gZWxkYXRhW3RoaXMuaWRdIHx8IHt9O1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICBpZiAoUi5pcyhrZXksIFwib2JqZWN0XCIpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBrZXkpIGlmIChrZXlbaGFzXShpKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGEoaSwga2V5W2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBldmUoXCJyYXBoYWVsLmRhdGEuZ2V0LlwiICsgdGhpcy5pZCwgdGhpcywgZGF0YVtrZXldLCBrZXkpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGFba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgZXZlKFwicmFwaGFlbC5kYXRhLnNldC5cIiArIHRoaXMuaWQsIHRoaXMsIHZhbHVlLCBrZXkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnJlbW92ZURhdGFcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIGFuIGVsZW1lbnQgYnkgZ2l2ZW4ga2V5LlxuICAgICAqIElmIGtleSBpcyBub3QgcHJvdmlkZWQsIHJlbW92ZXMgYWxsIHRoZSBkYXRhIG9mIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBrZXkgKHN0cmluZykgI29wdGlvbmFsIGtleVxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8ucmVtb3ZlRGF0YSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKGtleSA9PSBudWxsKSB7XG4gICAgICAgICAgICBlbGRhdGFbdGhpcy5pZF0gPSB7fTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZGF0YVt0aGlzLmlkXSAmJiBkZWxldGUgZWxkYXRhW3RoaXMuaWRdW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAgLypcXFxuICAgICAqIEVsZW1lbnQuZ2V0RGF0YVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0cmlldmVzIHRoZSBlbGVtZW50IGRhdGFcbiAgICAgPSAob2JqZWN0KSBkYXRhXG4gICAgXFwqL1xuICAgIGVscHJvdG8uZ2V0RGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGNsb25lKGVsZGF0YVt0aGlzLmlkXSB8fCB7fSk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5ob3ZlclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgaG92ZXIgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBmX2luIChmdW5jdGlvbikgaGFuZGxlciBmb3IgaG92ZXIgaW5cbiAgICAgLSBmX291dCAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIGhvdmVyIG91dFxuICAgICAtIGljb250ZXh0IChvYmplY3QpICNvcHRpb25hbCBjb250ZXh0IGZvciBob3ZlciBpbiBoYW5kbGVyXG4gICAgIC0gb2NvbnRleHQgKG9iamVjdCkgI29wdGlvbmFsIGNvbnRleHQgZm9yIGhvdmVyIG91dCBoYW5kbGVyXG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5ob3ZlciA9IGZ1bmN0aW9uIChmX2luLCBmX291dCwgc2NvcGVfaW4sIHNjb3BlX291dCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW92ZXIoZl9pbiwgc2NvcGVfaW4pLm1vdXNlb3V0KGZfb3V0LCBzY29wZV9vdXQgfHwgc2NvcGVfaW4pO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5ob3ZlclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBldmVudCBoYW5kbGVycyBmb3IgaG92ZXIgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBmX2luIChmdW5jdGlvbikgaGFuZGxlciBmb3IgaG92ZXIgaW5cbiAgICAgLSBmX291dCAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIGhvdmVyIG91dFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8udW5ob3ZlciA9IGZ1bmN0aW9uIChmX2luLCBmX291dCkge1xuICAgICAgICByZXR1cm4gdGhpcy51bm1vdXNlb3ZlcihmX2luKS51bm1vdXNlb3V0KGZfb3V0KTtcbiAgICB9O1xuICAgIHZhciBkcmFnZ2FibGUgPSBbXTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5kcmFnXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIGZvciBkcmFnIG9mIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBvbm1vdmUgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciBtb3ZpbmdcbiAgICAgLSBvbnN0YXJ0IChmdW5jdGlvbikgaGFuZGxlciBmb3IgZHJhZyBzdGFydFxuICAgICAtIG9uZW5kIChmdW5jdGlvbikgaGFuZGxlciBmb3IgZHJhZyBlbmRcbiAgICAgLSBtY29udGV4dCAob2JqZWN0KSAjb3B0aW9uYWwgY29udGV4dCBmb3IgbW92aW5nIGhhbmRsZXJcbiAgICAgLSBzY29udGV4dCAob2JqZWN0KSAjb3B0aW9uYWwgY29udGV4dCBmb3IgZHJhZyBzdGFydCBoYW5kbGVyXG4gICAgIC0gZWNvbnRleHQgKG9iamVjdCkgI29wdGlvbmFsIGNvbnRleHQgZm9yIGRyYWcgZW5kIGhhbmRsZXJcbiAgICAgKiBBZGRpdGlvbmFseSBmb2xsb3dpbmcgYGRyYWdgIGV2ZW50cyB3aWxsIGJlIHRyaWdnZXJlZDogYGRyYWcuc3RhcnQuPGlkPmAgb24gc3RhcnQsIFxuICAgICAqIGBkcmFnLmVuZC48aWQ+YCBvbiBlbmQgYW5kIGBkcmFnLm1vdmUuPGlkPmAgb24gZXZlcnkgbW92ZS4gV2hlbiBlbGVtZW50IHdpbGwgYmUgZHJhZ2dlZCBvdmVyIGFub3RoZXIgZWxlbWVudCBcbiAgICAgKiBgZHJhZy5vdmVyLjxpZD5gIHdpbGwgYmUgZmlyZWQgYXMgd2VsbC5cbiAgICAgKlxuICAgICAqIFN0YXJ0IGV2ZW50IGFuZCBzdGFydCBoYW5kbGVyIHdpbGwgYmUgY2FsbGVkIGluIHNwZWNpZmllZCBjb250ZXh0IG9yIGluIGNvbnRleHQgb2YgdGhlIGVsZW1lbnQgd2l0aCBmb2xsb3dpbmcgcGFyYW1ldGVyczpcbiAgICAgbyB4IChudW1iZXIpIHggcG9zaXRpb24gb2YgdGhlIG1vdXNlXG4gICAgIG8geSAobnVtYmVyKSB5IHBvc2l0aW9uIG9mIHRoZSBtb3VzZVxuICAgICBvIGV2ZW50IChvYmplY3QpIERPTSBldmVudCBvYmplY3RcbiAgICAgKiBNb3ZlIGV2ZW50IGFuZCBtb3ZlIGhhbmRsZXIgd2lsbCBiZSBjYWxsZWQgaW4gc3BlY2lmaWVkIGNvbnRleHQgb3IgaW4gY29udGV4dCBvZiB0aGUgZWxlbWVudCB3aXRoIGZvbGxvd2luZyBwYXJhbWV0ZXJzOlxuICAgICBvIGR4IChudW1iZXIpIHNoaWZ0IGJ5IHggZnJvbSB0aGUgc3RhcnQgcG9pbnRcbiAgICAgbyBkeSAobnVtYmVyKSBzaGlmdCBieSB5IGZyb20gdGhlIHN0YXJ0IHBvaW50XG4gICAgIG8geCAobnVtYmVyKSB4IHBvc2l0aW9uIG9mIHRoZSBtb3VzZVxuICAgICBvIHkgKG51bWJlcikgeSBwb3NpdGlvbiBvZiB0aGUgbW91c2VcbiAgICAgbyBldmVudCAob2JqZWN0KSBET00gZXZlbnQgb2JqZWN0XG4gICAgICogRW5kIGV2ZW50IGFuZCBlbmQgaGFuZGxlciB3aWxsIGJlIGNhbGxlZCBpbiBzcGVjaWZpZWQgY29udGV4dCBvciBpbiBjb250ZXh0IG9mIHRoZSBlbGVtZW50IHdpdGggZm9sbG93aW5nIHBhcmFtZXRlcnM6XG4gICAgIG8gZXZlbnQgKG9iamVjdCkgRE9NIGV2ZW50IG9iamVjdFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8uZHJhZyA9IGZ1bmN0aW9uIChvbm1vdmUsIG9uc3RhcnQsIG9uZW5kLCBtb3ZlX3Njb3BlLCBzdGFydF9zY29wZSwgZW5kX3Njb3BlKSB7XG4gICAgICAgIGZ1bmN0aW9uIHN0YXJ0KGUpIHtcbiAgICAgICAgICAgIChlLm9yaWdpbmFsRXZlbnQgfHwgZSkucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHZhciBzY3JvbGxZID0gZy5kb2MuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBnLmRvYy5ib2R5LnNjcm9sbFRvcCxcbiAgICAgICAgICAgICAgICBzY3JvbGxYID0gZy5kb2MuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgfHwgZy5kb2MuYm9keS5zY3JvbGxMZWZ0O1xuICAgICAgICAgICAgdGhpcy5fZHJhZy54ID0gZS5jbGllbnRYICsgc2Nyb2xsWDtcbiAgICAgICAgICAgIHRoaXMuX2RyYWcueSA9IGUuY2xpZW50WSArIHNjcm9sbFk7XG4gICAgICAgICAgICB0aGlzLl9kcmFnLmlkID0gZS5pZGVudGlmaWVyO1xuICAgICAgICAgICAgIWRyYWcubGVuZ3RoICYmIFIubW91c2Vtb3ZlKGRyYWdNb3ZlKS5tb3VzZXVwKGRyYWdVcCk7XG4gICAgICAgICAgICBkcmFnLnB1c2goe2VsOiB0aGlzLCBtb3ZlX3Njb3BlOiBtb3ZlX3Njb3BlLCBzdGFydF9zY29wZTogc3RhcnRfc2NvcGUsIGVuZF9zY29wZTogZW5kX3Njb3BlfSk7XG4gICAgICAgICAgICBvbnN0YXJ0ICYmIGV2ZS5vbihcInJhcGhhZWwuZHJhZy5zdGFydC5cIiArIHRoaXMuaWQsIG9uc3RhcnQpO1xuICAgICAgICAgICAgb25tb3ZlICYmIGV2ZS5vbihcInJhcGhhZWwuZHJhZy5tb3ZlLlwiICsgdGhpcy5pZCwgb25tb3ZlKTtcbiAgICAgICAgICAgIG9uZW5kICYmIGV2ZS5vbihcInJhcGhhZWwuZHJhZy5lbmQuXCIgKyB0aGlzLmlkLCBvbmVuZCk7XG4gICAgICAgICAgICBldmUoXCJyYXBoYWVsLmRyYWcuc3RhcnQuXCIgKyB0aGlzLmlkLCBzdGFydF9zY29wZSB8fCBtb3ZlX3Njb3BlIHx8IHRoaXMsIGUuY2xpZW50WCArIHNjcm9sbFgsIGUuY2xpZW50WSArIHNjcm9sbFksIGUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2RyYWcgPSB7fTtcbiAgICAgICAgZHJhZ2dhYmxlLnB1c2goe2VsOiB0aGlzLCBzdGFydDogc3RhcnR9KTtcbiAgICAgICAgdGhpcy5tb3VzZWRvd24oc3RhcnQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50Lm9uRHJhZ092ZXJcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFNob3J0Y3V0IGZvciBhc3NpZ25pbmcgZXZlbnQgaGFuZGxlciBmb3IgYGRyYWcub3Zlci48aWQ+YCBldmVudCwgd2hlcmUgaWQgaXMgaWQgb2YgdGhlIGVsZW1lbnQgKHNlZSBARWxlbWVudC5pZCkuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGYgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciBldmVudCwgZmlyc3QgYXJndW1lbnQgd291bGQgYmUgdGhlIGVsZW1lbnQgeW91IGFyZSBkcmFnZ2luZyBvdmVyXG4gICAgXFwqL1xuICAgIGVscHJvdG8ub25EcmFnT3ZlciA9IGZ1bmN0aW9uIChmKSB7XG4gICAgICAgIGYgPyBldmUub24oXCJyYXBoYWVsLmRyYWcub3Zlci5cIiArIHRoaXMuaWQsIGYpIDogZXZlLnVuYmluZChcInJhcGhhZWwuZHJhZy5vdmVyLlwiICsgdGhpcy5pZCk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bmRyYWdcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgYWxsIGRyYWcgZXZlbnQgaGFuZGxlcnMgZnJvbSBnaXZlbiBlbGVtZW50LlxuICAgIFxcKi9cbiAgICBlbHByb3RvLnVuZHJhZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGkgPSBkcmFnZ2FibGUubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaS0tKSBpZiAoZHJhZ2dhYmxlW2ldLmVsID09IHRoaXMpIHtcbiAgICAgICAgICAgIHRoaXMudW5tb3VzZWRvd24oZHJhZ2dhYmxlW2ldLnN0YXJ0KTtcbiAgICAgICAgICAgIGRyYWdnYWJsZS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBldmUudW5iaW5kKFwicmFwaGFlbC5kcmFnLiouXCIgKyB0aGlzLmlkKTtcbiAgICAgICAgfVxuICAgICAgICAhZHJhZ2dhYmxlLmxlbmd0aCAmJiBSLnVubW91c2Vtb3ZlKGRyYWdNb3ZlKS51bm1vdXNldXAoZHJhZ1VwKTtcbiAgICAgICAgZHJhZyA9IFtdO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLmNpcmNsZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRHJhd3MgYSBjaXJjbGUuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHggKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSBjZW50cmVcbiAgICAgLSB5IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgY2VudHJlXG4gICAgIC0gciAobnVtYmVyKSByYWRpdXNcbiAgICAgPSAob2JqZWN0KSBSYXBoYcOrbCBlbGVtZW50IG9iamVjdCB3aXRoIHR5cGUg4oCcY2lyY2xl4oCdXG4gICAgICoqXG4gICAgID4gVXNhZ2VcbiAgICAgfCB2YXIgYyA9IHBhcGVyLmNpcmNsZSg1MCwgNTAsIDQwKTtcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5jaXJjbGUgPSBmdW5jdGlvbiAoeCwgeSwgcikge1xuICAgICAgICB2YXIgb3V0ID0gUi5fZW5naW5lLmNpcmNsZSh0aGlzLCB4IHx8IDAsIHkgfHwgMCwgciB8fCAwKTtcbiAgICAgICAgdGhpcy5fX3NldF9fICYmIHRoaXMuX19zZXRfXy5wdXNoKG91dCk7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIucmVjdFxuICAgICBbIG1ldGhvZCBdXG4gICAgICpcbiAgICAgKiBEcmF3cyBhIHJlY3RhbmdsZS5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0geCAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIHRvcCBsZWZ0IGNvcm5lclxuICAgICAtIHkgKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSB0b3AgbGVmdCBjb3JuZXJcbiAgICAgLSB3aWR0aCAobnVtYmVyKSB3aWR0aFxuICAgICAtIGhlaWdodCAobnVtYmVyKSBoZWlnaHRcbiAgICAgLSByIChudW1iZXIpICNvcHRpb25hbCByYWRpdXMgZm9yIHJvdW5kZWQgY29ybmVycywgZGVmYXVsdCBpcyAwXG4gICAgID0gKG9iamVjdCkgUmFwaGHDq2wgZWxlbWVudCBvYmplY3Qgd2l0aCB0eXBlIOKAnHJlY3TigJ1cbiAgICAgKipcbiAgICAgPiBVc2FnZVxuICAgICB8IC8vIHJlZ3VsYXIgcmVjdGFuZ2xlXG4gICAgIHwgdmFyIGMgPSBwYXBlci5yZWN0KDEwLCAxMCwgNTAsIDUwKTtcbiAgICAgfCAvLyByZWN0YW5nbGUgd2l0aCByb3VuZGVkIGNvcm5lcnNcbiAgICAgfCB2YXIgYyA9IHBhcGVyLnJlY3QoNDAsIDQwLCA1MCwgNTAsIDEwKTtcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5yZWN0ID0gZnVuY3Rpb24gKHgsIHksIHcsIGgsIHIpIHtcbiAgICAgICAgdmFyIG91dCA9IFIuX2VuZ2luZS5yZWN0KHRoaXMsIHggfHwgMCwgeSB8fCAwLCB3IHx8IDAsIGggfHwgMCwgciB8fCAwKTtcbiAgICAgICAgdGhpcy5fX3NldF9fICYmIHRoaXMuX19zZXRfXy5wdXNoKG91dCk7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuZWxsaXBzZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRHJhd3MgYW4gZWxsaXBzZS5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0geCAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRyZVxuICAgICAtIHkgKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBjZW50cmVcbiAgICAgLSByeCAobnVtYmVyKSBob3Jpem9udGFsIHJhZGl1c1xuICAgICAtIHJ5IChudW1iZXIpIHZlcnRpY2FsIHJhZGl1c1xuICAgICA9IChvYmplY3QpIFJhcGhhw6tsIGVsZW1lbnQgb2JqZWN0IHdpdGggdHlwZSDigJxlbGxpcHNl4oCdXG4gICAgICoqXG4gICAgID4gVXNhZ2VcbiAgICAgfCB2YXIgYyA9IHBhcGVyLmVsbGlwc2UoNTAsIDUwLCA0MCwgMjApO1xuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLmVsbGlwc2UgPSBmdW5jdGlvbiAoeCwgeSwgcngsIHJ5KSB7XG4gICAgICAgIHZhciBvdXQgPSBSLl9lbmdpbmUuZWxsaXBzZSh0aGlzLCB4IHx8IDAsIHkgfHwgMCwgcnggfHwgMCwgcnkgfHwgMCk7XG4gICAgICAgIHRoaXMuX19zZXRfXyAmJiB0aGlzLl9fc2V0X18ucHVzaChvdXQpO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnBhdGhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgYSBwYXRoIGVsZW1lbnQgYnkgZ2l2ZW4gcGF0aCBkYXRhIHN0cmluZy5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gcGF0aFN0cmluZyAoc3RyaW5nKSAjb3B0aW9uYWwgcGF0aCBzdHJpbmcgaW4gU1ZHIGZvcm1hdC5cbiAgICAgKiBQYXRoIHN0cmluZyBjb25zaXN0cyBvZiBvbmUtbGV0dGVyIGNvbW1hbmRzLCBmb2xsb3dlZCBieSBjb21tYSBzZXByYXJhdGVkIGFyZ3VtZW50cyBpbiBudW1lcmNhbCBmb3JtLiBFeGFtcGxlOlxuICAgICB8IFwiTTEwLDIwTDMwLDQwXCJcbiAgICAgKiBIZXJlIHdlIGNhbiBzZWUgdHdvIGNvbW1hbmRzOiDigJxN4oCdLCB3aXRoIGFyZ3VtZW50cyBgKDEwLCAyMClgIGFuZCDigJxM4oCdIHdpdGggYXJndW1lbnRzIGAoMzAsIDQwKWAuIFVwcGVyIGNhc2UgbGV0dGVyIG1lYW4gY29tbWFuZCBpcyBhYnNvbHV0ZSwgbG93ZXIgY2FzZeKAlHJlbGF0aXZlLlxuICAgICAqXG4gICAgICMgPHA+SGVyZSBpcyBzaG9ydCBsaXN0IG9mIGNvbW1hbmRzIGF2YWlsYWJsZSwgZm9yIG1vcmUgZGV0YWlscyBzZWUgPGEgaHJlZj1cImh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy9wYXRocy5odG1sI1BhdGhEYXRhXCIgdGl0bGU9XCJEZXRhaWxzIG9mIGEgcGF0aCdzIGRhdGEgYXR0cmlidXRlJ3MgZm9ybWF0IGFyZSBkZXNjcmliZWQgaW4gdGhlIFNWRyBzcGVjaWZpY2F0aW9uLlwiPlNWRyBwYXRoIHN0cmluZyBmb3JtYXQ8L2E+LjwvcD5cbiAgICAgIyA8dGFibGU+PHRoZWFkPjx0cj48dGg+Q29tbWFuZDwvdGg+PHRoPk5hbWU8L3RoPjx0aD5QYXJhbWV0ZXJzPC90aD48L3RyPjwvdGhlYWQ+PHRib2R5PlxuICAgICAjIDx0cj48dGQ+TTwvdGQ+PHRkPm1vdmV0bzwvdGQ+PHRkPih4IHkpKzwvdGQ+PC90cj5cbiAgICAgIyA8dHI+PHRkPlo8L3RkPjx0ZD5jbG9zZXBhdGg8L3RkPjx0ZD4obm9uZSk8L3RkPjwvdHI+XG4gICAgICMgPHRyPjx0ZD5MPC90ZD48dGQ+bGluZXRvPC90ZD48dGQ+KHggeSkrPC90ZD48L3RyPlxuICAgICAjIDx0cj48dGQ+SDwvdGQ+PHRkPmhvcml6b250YWwgbGluZXRvPC90ZD48dGQ+eCs8L3RkPjwvdHI+XG4gICAgICMgPHRyPjx0ZD5WPC90ZD48dGQ+dmVydGljYWwgbGluZXRvPC90ZD48dGQ+eSs8L3RkPjwvdHI+XG4gICAgICMgPHRyPjx0ZD5DPC90ZD48dGQ+Y3VydmV0bzwvdGQ+PHRkPih4MSB5MSB4MiB5MiB4IHkpKzwvdGQ+PC90cj5cbiAgICAgIyA8dHI+PHRkPlM8L3RkPjx0ZD5zbW9vdGggY3VydmV0bzwvdGQ+PHRkPih4MiB5MiB4IHkpKzwvdGQ+PC90cj5cbiAgICAgIyA8dHI+PHRkPlE8L3RkPjx0ZD5xdWFkcmF0aWMgQsOpemllciBjdXJ2ZXRvPC90ZD48dGQ+KHgxIHkxIHggeSkrPC90ZD48L3RyPlxuICAgICAjIDx0cj48dGQ+VDwvdGQ+PHRkPnNtb290aCBxdWFkcmF0aWMgQsOpemllciBjdXJ2ZXRvPC90ZD48dGQ+KHggeSkrPC90ZD48L3RyPlxuICAgICAjIDx0cj48dGQ+QTwvdGQ+PHRkPmVsbGlwdGljYWwgYXJjPC90ZD48dGQ+KHJ4IHJ5IHgtYXhpcy1yb3RhdGlvbiBsYXJnZS1hcmMtZmxhZyBzd2VlcC1mbGFnIHggeSkrPC90ZD48L3RyPlxuICAgICAjIDx0cj48dGQ+UjwvdGQ+PHRkPjxhIGhyZWY9XCJodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NhdG11bGzigJNSb21fc3BsaW5lI0NhdG11bGwuRTIuODAuOTNSb21fc3BsaW5lXCI+Q2F0bXVsbC1Sb20gY3VydmV0bzwvYT4qPC90ZD48dGQ+eDEgeTEgKHggeSkrPC90ZD48L3RyPjwvdGJvZHk+PC90YWJsZT5cbiAgICAgKiAqIOKAnENhdG11bGwtUm9tIGN1cnZldG/igJ0gaXMgYSBub3Qgc3RhbmRhcmQgU1ZHIGNvbW1hbmQgYW5kIGFkZGVkIGluIDIuMCB0byBtYWtlIGxpZmUgZWFzaWVyLlxuICAgICAqIE5vdGU6IHRoZXJlIGlzIGEgc3BlY2lhbCBjYXNlIHdoZW4gcGF0aCBjb25zaXN0IG9mIGp1c3QgdGhyZWUgY29tbWFuZHM6IOKAnE0xMCwxMFLigKZ64oCdLiBJbiB0aGlzIGNhc2UgcGF0aCB3aWxsIHNtb290aGx5IGNvbm5lY3RzIHRvIGl0cyBiZWdpbm5pbmcuXG4gICAgID4gVXNhZ2VcbiAgICAgfCB2YXIgYyA9IHBhcGVyLnBhdGgoXCJNMTAgMTBMOTAgOTBcIik7XG4gICAgIHwgLy8gZHJhdyBhIGRpYWdvbmFsIGxpbmU6XG4gICAgIHwgLy8gbW92ZSB0byAxMCwxMCwgbGluZSB0byA5MCw5MFxuICAgICAqIEZvciBleGFtcGxlIG9mIHBhdGggc3RyaW5ncywgY2hlY2sgb3V0IHRoZXNlIGljb25zOiBodHRwOi8vcmFwaGFlbGpzLmNvbS9pY29ucy9cbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5wYXRoID0gZnVuY3Rpb24gKHBhdGhTdHJpbmcpIHtcbiAgICAgICAgcGF0aFN0cmluZyAmJiAhUi5pcyhwYXRoU3RyaW5nLCBzdHJpbmcpICYmICFSLmlzKHBhdGhTdHJpbmdbMF0sIGFycmF5KSAmJiAocGF0aFN0cmluZyArPSBFKTtcbiAgICAgICAgdmFyIG91dCA9IFIuX2VuZ2luZS5wYXRoKFIuZm9ybWF0W2FwcGx5XShSLCBhcmd1bWVudHMpLCB0aGlzKTtcbiAgICAgICAgdGhpcy5fX3NldF9fICYmIHRoaXMuX19zZXRfXy5wdXNoKG91dCk7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuaW1hZ2VcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEVtYmVkcyBhbiBpbWFnZSBpbnRvIHRoZSBzdXJmYWNlLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBzcmMgKHN0cmluZykgVVJJIG9mIHRoZSBzb3VyY2UgaW1hZ2VcbiAgICAgLSB4IChudW1iZXIpIHggY29vcmRpbmF0ZSBwb3NpdGlvblxuICAgICAtIHkgKG51bWJlcikgeSBjb29yZGluYXRlIHBvc2l0aW9uXG4gICAgIC0gd2lkdGggKG51bWJlcikgd2lkdGggb2YgdGhlIGltYWdlXG4gICAgIC0gaGVpZ2h0IChudW1iZXIpIGhlaWdodCBvZiB0aGUgaW1hZ2VcbiAgICAgPSAob2JqZWN0KSBSYXBoYcOrbCBlbGVtZW50IG9iamVjdCB3aXRoIHR5cGUg4oCcaW1hZ2XigJ1cbiAgICAgKipcbiAgICAgPiBVc2FnZVxuICAgICB8IHZhciBjID0gcGFwZXIuaW1hZ2UoXCJhcHBsZS5wbmdcIiwgMTAsIDEwLCA4MCwgODApO1xuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLmltYWdlID0gZnVuY3Rpb24gKHNyYywgeCwgeSwgdywgaCkge1xuICAgICAgICB2YXIgb3V0ID0gUi5fZW5naW5lLmltYWdlKHRoaXMsIHNyYyB8fCBcImFib3V0OmJsYW5rXCIsIHggfHwgMCwgeSB8fCAwLCB3IHx8IDAsIGggfHwgMCk7XG4gICAgICAgIHRoaXMuX19zZXRfXyAmJiB0aGlzLl9fc2V0X18ucHVzaChvdXQpO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnRleHRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIERyYXdzIGEgdGV4dCBzdHJpbmcuIElmIHlvdSBuZWVkIGxpbmUgYnJlYWtzLCBwdXQg4oCcXFxu4oCdIGluIHRoZSBzdHJpbmcuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHggKG51bWJlcikgeCBjb29yZGluYXRlIHBvc2l0aW9uXG4gICAgIC0geSAobnVtYmVyKSB5IGNvb3JkaW5hdGUgcG9zaXRpb25cbiAgICAgLSB0ZXh0IChzdHJpbmcpIFRoZSB0ZXh0IHN0cmluZyB0byBkcmF3XG4gICAgID0gKG9iamVjdCkgUmFwaGHDq2wgZWxlbWVudCBvYmplY3Qgd2l0aCB0eXBlIOKAnHRleHTigJ1cbiAgICAgKipcbiAgICAgPiBVc2FnZVxuICAgICB8IHZhciB0ID0gcGFwZXIudGV4dCg1MCwgNTAsIFwiUmFwaGHDq2xcXG5raWNrc1xcbmJ1dHQhXCIpO1xuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLnRleHQgPSBmdW5jdGlvbiAoeCwgeSwgdGV4dCkge1xuICAgICAgICB2YXIgb3V0ID0gUi5fZW5naW5lLnRleHQodGhpcywgeCB8fCAwLCB5IHx8IDAsIFN0cih0ZXh0KSk7XG4gICAgICAgIHRoaXMuX19zZXRfXyAmJiB0aGlzLl9fc2V0X18ucHVzaChvdXQpO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnNldFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ3JlYXRlcyBhcnJheS1saWtlIG9iamVjdCB0byBrZWVwIGFuZCBvcGVyYXRlIHNldmVyYWwgZWxlbWVudHMgYXQgb25jZS5cbiAgICAgKiBXYXJuaW5nOiBpdCBkb2VzbuKAmXQgY3JlYXRlIGFueSBlbGVtZW50cyBmb3IgaXRzZWxmIGluIHRoZSBwYWdlLCBpdCBqdXN0IGdyb3VwcyBleGlzdGluZyBlbGVtZW50cy5cbiAgICAgKiBTZXRzIGFjdCBhcyBwc2V1ZG8gZWxlbWVudHMg4oCUIGFsbCBtZXRob2RzIGF2YWlsYWJsZSB0byBhbiBlbGVtZW50IGNhbiBiZSB1c2VkIG9uIGEgc2V0LlxuICAgICA9IChvYmplY3QpIGFycmF5LWxpa2Ugb2JqZWN0IHRoYXQgcmVwcmVzZW50cyBzZXQgb2YgZWxlbWVudHNcbiAgICAgKipcbiAgICAgPiBVc2FnZVxuICAgICB8IHZhciBzdCA9IHBhcGVyLnNldCgpO1xuICAgICB8IHN0LnB1c2goXG4gICAgIHwgICAgIHBhcGVyLmNpcmNsZSgxMCwgMTAsIDUpLFxuICAgICB8ICAgICBwYXBlci5jaXJjbGUoMzAsIDEwLCA1KVxuICAgICB8ICk7XG4gICAgIHwgc3QuYXR0cih7ZmlsbDogXCJyZWRcIn0pOyAvLyBjaGFuZ2VzIHRoZSBmaWxsIG9mIGJvdGggY2lyY2xlc1xuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLnNldCA9IGZ1bmN0aW9uIChpdGVtc0FycmF5KSB7XG4gICAgICAgICFSLmlzKGl0ZW1zQXJyYXksIFwiYXJyYXlcIikgJiYgKGl0ZW1zQXJyYXkgPSBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmNhbGwoYXJndW1lbnRzLCAwLCBhcmd1bWVudHMubGVuZ3RoKSk7XG4gICAgICAgIHZhciBvdXQgPSBuZXcgU2V0KGl0ZW1zQXJyYXkpO1xuICAgICAgICB0aGlzLl9fc2V0X18gJiYgdGhpcy5fX3NldF9fLnB1c2gob3V0KTtcbiAgICAgICAgb3V0W1wicGFwZXJcIl0gPSB0aGlzO1xuICAgICAgICBvdXRbXCJ0eXBlXCJdID0gXCJzZXRcIjtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5zZXRTdGFydFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ3JlYXRlcyBAUGFwZXIuc2V0LiBBbGwgZWxlbWVudHMgdGhhdCB3aWxsIGJlIGNyZWF0ZWQgYWZ0ZXIgY2FsbGluZyB0aGlzIG1ldGhvZCBhbmQgYmVmb3JlIGNhbGxpbmdcbiAgICAgKiBAUGFwZXIuc2V0RmluaXNoIHdpbGwgYmUgYWRkZWQgdG8gdGhlIHNldC5cbiAgICAgKipcbiAgICAgPiBVc2FnZVxuICAgICB8IHBhcGVyLnNldFN0YXJ0KCk7XG4gICAgIHwgcGFwZXIuY2lyY2xlKDEwLCAxMCwgNSksXG4gICAgIHwgcGFwZXIuY2lyY2xlKDMwLCAxMCwgNSlcbiAgICAgfCB2YXIgc3QgPSBwYXBlci5zZXRGaW5pc2goKTtcbiAgICAgfCBzdC5hdHRyKHtmaWxsOiBcInJlZFwifSk7IC8vIGNoYW5nZXMgdGhlIGZpbGwgb2YgYm90aCBjaXJjbGVzXG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8uc2V0U3RhcnQgPSBmdW5jdGlvbiAoc2V0KSB7XG4gICAgICAgIHRoaXMuX19zZXRfXyA9IHNldCB8fCB0aGlzLnNldCgpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnNldEZpbmlzaFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogU2VlIEBQYXBlci5zZXRTdGFydC4gVGhpcyBtZXRob2QgZmluaXNoZXMgY2F0Y2hpbmcgYW5kIHJldHVybnMgcmVzdWx0aW5nIHNldC5cbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBzZXRcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5zZXRGaW5pc2ggPSBmdW5jdGlvbiAoc2V0KSB7XG4gICAgICAgIHZhciBvdXQgPSB0aGlzLl9fc2V0X187XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9fc2V0X187XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuc2V0U2l6ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogSWYgeW91IG5lZWQgdG8gY2hhbmdlIGRpbWVuc2lvbnMgb2YgdGhlIGNhbnZhcyBjYWxsIHRoaXMgbWV0aG9kXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHdpZHRoIChudW1iZXIpIG5ldyB3aWR0aCBvZiB0aGUgY2FudmFzXG4gICAgIC0gaGVpZ2h0IChudW1iZXIpIG5ldyBoZWlnaHQgb2YgdGhlIGNhbnZhc1xuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLnNldFNpemUgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCkge1xuICAgICAgICByZXR1cm4gUi5fZW5naW5lLnNldFNpemUuY2FsbCh0aGlzLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5zZXRWaWV3Qm94XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBTZXRzIHRoZSB2aWV3IGJveCBvZiB0aGUgcGFwZXIuIFByYWN0aWNhbGx5IGl0IGdpdmVzIHlvdSBhYmlsaXR5IHRvIHpvb20gYW5kIHBhbiB3aG9sZSBwYXBlciBzdXJmYWNlIGJ5IFxuICAgICAqIHNwZWNpZnlpbmcgbmV3IGJvdW5kYXJpZXMuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHggKG51bWJlcikgbmV3IHggcG9zaXRpb24sIGRlZmF1bHQgaXMgYDBgXG4gICAgIC0geSAobnVtYmVyKSBuZXcgeSBwb3NpdGlvbiwgZGVmYXVsdCBpcyBgMGBcbiAgICAgLSB3IChudW1iZXIpIG5ldyB3aWR0aCBvZiB0aGUgY2FudmFzXG4gICAgIC0gaCAobnVtYmVyKSBuZXcgaGVpZ2h0IG9mIHRoZSBjYW52YXNcbiAgICAgLSBmaXQgKGJvb2xlYW4pIGB0cnVlYCBpZiB5b3Ugd2FudCBncmFwaGljcyB0byBmaXQgaW50byBuZXcgYm91bmRhcnkgYm94XG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8uc2V0Vmlld0JveCA9IGZ1bmN0aW9uICh4LCB5LCB3LCBoLCBmaXQpIHtcbiAgICAgICAgcmV0dXJuIFIuX2VuZ2luZS5zZXRWaWV3Qm94LmNhbGwodGhpcywgeCwgeSwgdywgaCwgZml0KTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci50b3BcbiAgICAgWyBwcm9wZXJ0eSBdXG4gICAgICoqXG4gICAgICogUG9pbnRzIHRvIHRoZSB0b3Btb3N0IGVsZW1lbnQgb24gdGhlIHBhcGVyXG4gICAgXFwqL1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5ib3R0b21cbiAgICAgWyBwcm9wZXJ0eSBdXG4gICAgICoqXG4gICAgICogUG9pbnRzIHRvIHRoZSBib3R0b20gZWxlbWVudCBvbiB0aGUgcGFwZXJcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by50b3AgPSBwYXBlcnByb3RvLmJvdHRvbSA9IG51bGw7XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnJhcGhhZWxcbiAgICAgWyBwcm9wZXJ0eSBdXG4gICAgICoqXG4gICAgICogUG9pbnRzIHRvIHRoZSBAUmFwaGFlbCBvYmplY3QvZnVuY3Rpb25cbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5yYXBoYWVsID0gUjtcbiAgICB2YXIgZ2V0T2Zmc2V0ID0gZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgdmFyIGJveCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICBkb2MgPSBlbGVtLm93bmVyRG9jdW1lbnQsXG4gICAgICAgICAgICBib2R5ID0gZG9jLmJvZHksXG4gICAgICAgICAgICBkb2NFbGVtID0gZG9jLmRvY3VtZW50RWxlbWVudCxcbiAgICAgICAgICAgIGNsaWVudFRvcCA9IGRvY0VsZW0uY2xpZW50VG9wIHx8IGJvZHkuY2xpZW50VG9wIHx8IDAsIGNsaWVudExlZnQgPSBkb2NFbGVtLmNsaWVudExlZnQgfHwgYm9keS5jbGllbnRMZWZ0IHx8IDAsXG4gICAgICAgICAgICB0b3AgID0gYm94LnRvcCAgKyAoZy53aW4ucGFnZVlPZmZzZXQgfHwgZG9jRWxlbS5zY3JvbGxUb3AgfHwgYm9keS5zY3JvbGxUb3AgKSAtIGNsaWVudFRvcCxcbiAgICAgICAgICAgIGxlZnQgPSBib3gubGVmdCArIChnLndpbi5wYWdlWE9mZnNldCB8fCBkb2NFbGVtLnNjcm9sbExlZnQgfHwgYm9keS5zY3JvbGxMZWZ0KSAtIGNsaWVudExlZnQ7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB5OiB0b3AsXG4gICAgICAgICAgICB4OiBsZWZ0XG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuZ2V0RWxlbWVudEJ5UG9pbnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgeW91IHRvcG1vc3QgZWxlbWVudCB1bmRlciBnaXZlbiBwb2ludC5cbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBSYXBoYcOrbCBlbGVtZW50IG9iamVjdFxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSB4IChudW1iZXIpIHggY29vcmRpbmF0ZSBmcm9tIHRoZSB0b3AgbGVmdCBjb3JuZXIgb2YgdGhlIHdpbmRvd1xuICAgICAtIHkgKG51bWJlcikgeSBjb29yZGluYXRlIGZyb20gdGhlIHRvcCBsZWZ0IGNvcm5lciBvZiB0aGUgd2luZG93XG4gICAgID4gVXNhZ2VcbiAgICAgfCBwYXBlci5nZXRFbGVtZW50QnlQb2ludChtb3VzZVgsIG1vdXNlWSkuYXR0cih7c3Ryb2tlOiBcIiNmMDBcIn0pO1xuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLmdldEVsZW1lbnRCeVBvaW50ID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgdmFyIHBhcGVyID0gdGhpcyxcbiAgICAgICAgICAgIHN2ZyA9IHBhcGVyLmNhbnZhcyxcbiAgICAgICAgICAgIHRhcmdldCA9IGcuZG9jLmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gICAgICAgIGlmIChnLndpbi5vcGVyYSAmJiB0YXJnZXQudGFnTmFtZSA9PSBcInN2Z1wiKSB7XG4gICAgICAgICAgICB2YXIgc28gPSBnZXRPZmZzZXQoc3ZnKSxcbiAgICAgICAgICAgICAgICBzciA9IHN2Zy5jcmVhdGVTVkdSZWN0KCk7XG4gICAgICAgICAgICBzci54ID0geCAtIHNvLng7XG4gICAgICAgICAgICBzci55ID0geSAtIHNvLnk7XG4gICAgICAgICAgICBzci53aWR0aCA9IHNyLmhlaWdodCA9IDE7XG4gICAgICAgICAgICB2YXIgaGl0cyA9IHN2Zy5nZXRJbnRlcnNlY3Rpb25MaXN0KHNyLCBudWxsKTtcbiAgICAgICAgICAgIGlmIChoaXRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IGhpdHNbaGl0cy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHRhcmdldC5wYXJlbnROb2RlICYmIHRhcmdldCAhPSBzdmcucGFyZW50Tm9kZSAmJiAhdGFyZ2V0LnJhcGhhZWwpIHtcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldCA9PSBwYXBlci5jYW52YXMucGFyZW50Tm9kZSAmJiAodGFyZ2V0ID0gc3ZnKTtcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0ICYmIHRhcmdldC5yYXBoYWVsID8gcGFwZXIuZ2V0QnlJZCh0YXJnZXQucmFwaGFlbGlkKSA6IG51bGw7XG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfTtcblxuICAgIC8qXFxcbiAgICAgKiBQYXBlci5nZXRFbGVtZW50c0J5QkJveFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBzZXQgb2YgZWxlbWVudHMgdGhhdCBoYXZlIGFuIGludGVyc2VjdGluZyBib3VuZGluZyBib3hcbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gYmJveCAob2JqZWN0KSBiYm94IHRvIGNoZWNrIHdpdGhcbiAgICAgPSAob2JqZWN0KSBAU2V0XG4gICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLmdldEVsZW1lbnRzQnlCQm94ID0gZnVuY3Rpb24gKGJib3gpIHtcbiAgICAgICAgdmFyIHNldCA9IHRoaXMuc2V0KCk7XG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIGlmIChSLmlzQkJveEludGVyc2VjdChlbC5nZXRCQm94KCksIGJib3gpKSB7XG4gICAgICAgICAgICAgICAgc2V0LnB1c2goZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHNldDtcbiAgICB9O1xuXG4gICAgLypcXFxuICAgICAqIFBhcGVyLmdldEJ5SWRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgeW91IGVsZW1lbnQgYnkgaXRzIGludGVybmFsIElELlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBpZCAobnVtYmVyKSBpZFxuICAgICA9IChvYmplY3QpIFJhcGhhw6tsIGVsZW1lbnQgb2JqZWN0XG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8uZ2V0QnlJZCA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICB2YXIgYm90ID0gdGhpcy5ib3R0b207XG4gICAgICAgIHdoaWxlIChib3QpIHtcbiAgICAgICAgICAgIGlmIChib3QuaWQgPT0gaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYm90O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm90ID0gYm90Lm5leHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuZm9yRWFjaFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRXhlY3V0ZXMgZ2l2ZW4gZnVuY3Rpb24gZm9yIGVhY2ggZWxlbWVudCBvbiB0aGUgcGFwZXJcbiAgICAgKlxuICAgICAqIElmIGNhbGxiYWNrIGZ1bmN0aW9uIHJldHVybnMgYGZhbHNlYCBpdCB3aWxsIHN0b3AgbG9vcCBydW5uaW5nLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBjYWxsYmFjayAoZnVuY3Rpb24pIGZ1bmN0aW9uIHRvIHJ1blxuICAgICAtIHRoaXNBcmcgKG9iamVjdCkgY29udGV4dCBvYmplY3QgZm9yIHRoZSBjYWxsYmFja1xuICAgICA9IChvYmplY3QpIFBhcGVyIG9iamVjdFxuICAgICA+IFVzYWdlXG4gICAgIHwgcGFwZXIuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgfCAgICAgZWwuYXR0cih7IHN0cm9rZTogXCJibHVlXCIgfSk7XG4gICAgIHwgfSk7XG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8uZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgICB2YXIgYm90ID0gdGhpcy5ib3R0b207XG4gICAgICAgIHdoaWxlIChib3QpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjay5jYWxsKHRoaXNBcmcsIGJvdCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib3QgPSBib3QubmV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5nZXRFbGVtZW50c0J5UG9pbnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgc2V0IG9mIGVsZW1lbnRzIHRoYXQgaGF2ZSBjb21tb24gcG9pbnQgaW5zaWRlXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHggKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSBwb2ludFxuICAgICAtIHkgKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBwb2ludFxuICAgICA9IChvYmplY3QpIEBTZXRcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5nZXRFbGVtZW50c0J5UG9pbnQgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICB2YXIgc2V0ID0gdGhpcy5zZXQoKTtcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgaWYgKGVsLmlzUG9pbnRJbnNpZGUoeCwgeSkpIHtcbiAgICAgICAgICAgICAgICBzZXQucHVzaChlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc2V0O1xuICAgIH07XG4gICAgZnVuY3Rpb24geF95KCkge1xuICAgICAgICByZXR1cm4gdGhpcy54ICsgUyArIHRoaXMueTtcbiAgICB9XG4gICAgZnVuY3Rpb24geF95X3dfaCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueCArIFMgKyB0aGlzLnkgKyBTICsgdGhpcy53aWR0aCArIFwiIFxceGQ3IFwiICsgdGhpcy5oZWlnaHQ7XG4gICAgfVxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmlzUG9pbnRJbnNpZGVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIERldGVybWluZSBpZiBnaXZlbiBwb2ludCBpcyBpbnNpZGUgdGhpcyBlbGVtZW504oCZcyBzaGFwZVxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSB4IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnRcbiAgICAgLSB5IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnRcbiAgICAgPSAoYm9vbGVhbikgYHRydWVgIGlmIHBvaW50IGluc2lkZSB0aGUgc2hhcGVcbiAgICBcXCovXG4gICAgZWxwcm90by5pc1BvaW50SW5zaWRlID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgdmFyIHJwID0gdGhpcy5yZWFsUGF0aCA9IHRoaXMucmVhbFBhdGggfHwgZ2V0UGF0aFt0aGlzLnR5cGVdKHRoaXMpO1xuICAgICAgICByZXR1cm4gUi5pc1BvaW50SW5zaWRlUGF0aChycCwgeCwgeSk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5nZXRCQm94XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm4gYm91bmRpbmcgYm94IGZvciBhIGdpdmVuIGVsZW1lbnRcbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gaXNXaXRob3V0VHJhbnNmb3JtIChib29sZWFuKSBmbGFnLCBgdHJ1ZWAgaWYgeW91IHdhbnQgdG8gaGF2ZSBib3VuZGluZyBib3ggYmVmb3JlIHRyYW5zZm9ybWF0aW9ucy4gRGVmYXVsdCBpcyBgZmFsc2VgLlxuICAgICA9IChvYmplY3QpIEJvdW5kaW5nIGJveCBvYmplY3Q6XG4gICAgIG8ge1xuICAgICBvICAgICB4OiAobnVtYmVyKSB0b3AgbGVmdCBjb3JuZXIgeFxuICAgICBvICAgICB5OiAobnVtYmVyKSB0b3AgbGVmdCBjb3JuZXIgeVxuICAgICBvICAgICB4MjogKG51bWJlcikgYm90dG9tIHJpZ2h0IGNvcm5lciB4XG4gICAgIG8gICAgIHkyOiAobnVtYmVyKSBib3R0b20gcmlnaHQgY29ybmVyIHlcbiAgICAgbyAgICAgd2lkdGg6IChudW1iZXIpIHdpZHRoXG4gICAgIG8gICAgIGhlaWdodDogKG51bWJlcikgaGVpZ2h0XG4gICAgIG8gfVxuICAgIFxcKi9cbiAgICBlbHByb3RvLmdldEJCb3ggPSBmdW5jdGlvbiAoaXNXaXRob3V0VHJhbnNmb3JtKSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgXyA9IHRoaXMuXztcbiAgICAgICAgaWYgKGlzV2l0aG91dFRyYW5zZm9ybSkge1xuICAgICAgICAgICAgaWYgKF8uZGlydHkgfHwgIV8uYmJveHd0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWFsUGF0aCA9IGdldFBhdGhbdGhpcy50eXBlXSh0aGlzKTtcbiAgICAgICAgICAgICAgICBfLmJib3h3dCA9IHBhdGhEaW1lbnNpb25zKHRoaXMucmVhbFBhdGgpO1xuICAgICAgICAgICAgICAgIF8uYmJveHd0LnRvU3RyaW5nID0geF95X3dfaDtcbiAgICAgICAgICAgICAgICBfLmRpcnR5ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfLmJib3h3dDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy5kaXJ0eSB8fCBfLmRpcnR5VCB8fCAhXy5iYm94KSB7XG4gICAgICAgICAgICBpZiAoXy5kaXJ0eSB8fCAhdGhpcy5yZWFsUGF0aCkge1xuICAgICAgICAgICAgICAgIF8uYmJveHd0ID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWxQYXRoID0gZ2V0UGF0aFt0aGlzLnR5cGVdKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXy5iYm94ID0gcGF0aERpbWVuc2lvbnMobWFwUGF0aCh0aGlzLnJlYWxQYXRoLCB0aGlzLm1hdHJpeCkpO1xuICAgICAgICAgICAgXy5iYm94LnRvU3RyaW5nID0geF95X3dfaDtcbiAgICAgICAgICAgIF8uZGlydHkgPSBfLmRpcnR5VCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF8uYmJveDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmNsb25lXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBjbG9uZSBvZiBhIGdpdmVuIGVsZW1lbnRcbiAgICAgKipcbiAgICBcXCovXG4gICAgZWxwcm90by5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG91dCA9IHRoaXMucGFwZXJbdGhpcy50eXBlXSgpLmF0dHIodGhpcy5hdHRyKCkpO1xuICAgICAgICB0aGlzLl9fc2V0X18gJiYgdGhpcy5fX3NldF9fLnB1c2gob3V0KTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50Lmdsb3dcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybiBzZXQgb2YgZWxlbWVudHMgdGhhdCBjcmVhdGUgZ2xvdy1saWtlIGVmZmVjdCBhcm91bmQgZ2l2ZW4gZWxlbWVudC4gU2VlIEBQYXBlci5zZXQuXG4gICAgICpcbiAgICAgKiBOb3RlOiBHbG93IGlzIG5vdCBjb25uZWN0ZWQgdG8gdGhlIGVsZW1lbnQuIElmIHlvdSBjaGFuZ2UgZWxlbWVudCBhdHRyaWJ1dGVzIGl0IHdvbuKAmXQgYWRqdXN0IGl0c2VsZi5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gZ2xvdyAob2JqZWN0KSAjb3B0aW9uYWwgcGFyYW1ldGVycyBvYmplY3Qgd2l0aCBhbGwgcHJvcGVydGllcyBvcHRpb25hbDpcbiAgICAgbyB7XG4gICAgIG8gICAgIHdpZHRoIChudW1iZXIpIHNpemUgb2YgdGhlIGdsb3csIGRlZmF1bHQgaXMgYDEwYFxuICAgICBvICAgICBmaWxsIChib29sZWFuKSB3aWxsIGl0IGJlIGZpbGxlZCwgZGVmYXVsdCBpcyBgZmFsc2VgXG4gICAgIG8gICAgIG9wYWNpdHkgKG51bWJlcikgb3BhY2l0eSwgZGVmYXVsdCBpcyBgMC41YFxuICAgICBvICAgICBvZmZzZXR4IChudW1iZXIpIGhvcml6b250YWwgb2Zmc2V0LCBkZWZhdWx0IGlzIGAwYFxuICAgICBvICAgICBvZmZzZXR5IChudW1iZXIpIHZlcnRpY2FsIG9mZnNldCwgZGVmYXVsdCBpcyBgMGBcbiAgICAgbyAgICAgY29sb3IgKHN0cmluZykgZ2xvdyBjb2xvdXIsIGRlZmF1bHQgaXMgYGJsYWNrYFxuICAgICBvIH1cbiAgICAgPSAob2JqZWN0KSBAUGFwZXIuc2V0IG9mIGVsZW1lbnRzIHRoYXQgcmVwcmVzZW50cyBnbG93XG4gICAgXFwqL1xuICAgIGVscHJvdG8uZ2xvdyA9IGZ1bmN0aW9uIChnbG93KSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gXCJ0ZXh0XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGdsb3cgPSBnbG93IHx8IHt9O1xuICAgICAgICB2YXIgcyA9IHtcbiAgICAgICAgICAgIHdpZHRoOiAoZ2xvdy53aWR0aCB8fCAxMCkgKyAoK3RoaXMuYXR0cihcInN0cm9rZS13aWR0aFwiKSB8fCAxKSxcbiAgICAgICAgICAgIGZpbGw6IGdsb3cuZmlsbCB8fCBmYWxzZSxcbiAgICAgICAgICAgIG9wYWNpdHk6IGdsb3cub3BhY2l0eSB8fCAuNSxcbiAgICAgICAgICAgIG9mZnNldHg6IGdsb3cub2Zmc2V0eCB8fCAwLFxuICAgICAgICAgICAgb2Zmc2V0eTogZ2xvdy5vZmZzZXR5IHx8IDAsXG4gICAgICAgICAgICBjb2xvcjogZ2xvdy5jb2xvciB8fCBcIiMwMDBcIlxuICAgICAgICB9LFxuICAgICAgICAgICAgYyA9IHMud2lkdGggLyAyLFxuICAgICAgICAgICAgciA9IHRoaXMucGFwZXIsXG4gICAgICAgICAgICBvdXQgPSByLnNldCgpLFxuICAgICAgICAgICAgcGF0aCA9IHRoaXMucmVhbFBhdGggfHwgZ2V0UGF0aFt0aGlzLnR5cGVdKHRoaXMpO1xuICAgICAgICBwYXRoID0gdGhpcy5tYXRyaXggPyBtYXBQYXRoKHBhdGgsIHRoaXMubWF0cml4KSA6IHBhdGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYyArIDE7IGkrKykge1xuICAgICAgICAgICAgb3V0LnB1c2goci5wYXRoKHBhdGgpLmF0dHIoe1xuICAgICAgICAgICAgICAgIHN0cm9rZTogcy5jb2xvcixcbiAgICAgICAgICAgICAgICBmaWxsOiBzLmZpbGwgPyBzLmNvbG9yIDogXCJub25lXCIsXG4gICAgICAgICAgICAgICAgXCJzdHJva2UtbGluZWpvaW5cIjogXCJyb3VuZFwiLFxuICAgICAgICAgICAgICAgIFwic3Ryb2tlLWxpbmVjYXBcIjogXCJyb3VuZFwiLFxuICAgICAgICAgICAgICAgIFwic3Ryb2tlLXdpZHRoXCI6ICsocy53aWR0aCAvIGMgKiBpKS50b0ZpeGVkKDMpLFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6ICsocy5vcGFjaXR5IC8gYykudG9GaXhlZCgzKVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXQuaW5zZXJ0QmVmb3JlKHRoaXMpLnRyYW5zbGF0ZShzLm9mZnNldHgsIHMub2Zmc2V0eSk7XG4gICAgfTtcbiAgICB2YXIgY3VydmVzbGVuZ3RocyA9IHt9LFxuICAgIGdldFBvaW50QXRTZWdtZW50TGVuZ3RoID0gZnVuY3Rpb24gKHAxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5LCBsZW5ndGgpIHtcbiAgICAgICAgaWYgKGxlbmd0aCA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gYmV6bGVuKHAxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBSLmZpbmREb3RzQXRTZWdtZW50KHAxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5LCBnZXRUYXRMZW4ocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnksIGxlbmd0aCkpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXRMZW5ndGhGYWN0b3J5ID0gZnVuY3Rpb24gKGlzdG90YWwsIHN1YnBhdGgpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChwYXRoLCBsZW5ndGgsIG9ubHlzdGFydCkge1xuICAgICAgICAgICAgcGF0aCA9IHBhdGgyY3VydmUocGF0aCk7XG4gICAgICAgICAgICB2YXIgeCwgeSwgcCwgbCwgc3AgPSBcIlwiLCBzdWJwYXRocyA9IHt9LCBwb2ludCxcbiAgICAgICAgICAgICAgICBsZW4gPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gcGF0aC5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcCA9IHBhdGhbaV07XG4gICAgICAgICAgICAgICAgaWYgKHBbMF0gPT0gXCJNXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgeCA9ICtwWzFdO1xuICAgICAgICAgICAgICAgICAgICB5ID0gK3BbMl07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbCA9IGdldFBvaW50QXRTZWdtZW50TGVuZ3RoKHgsIHksIHBbMV0sIHBbMl0sIHBbM10sIHBbNF0sIHBbNV0sIHBbNl0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGVuICsgbCA+IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN1YnBhdGggJiYgIXN1YnBhdGhzLnN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnQgPSBnZXRQb2ludEF0U2VnbWVudExlbmd0aCh4LCB5LCBwWzFdLCBwWzJdLCBwWzNdLCBwWzRdLCBwWzVdLCBwWzZdLCBsZW5ndGggLSBsZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwICs9IFtcIkNcIiArIHBvaW50LnN0YXJ0LngsIHBvaW50LnN0YXJ0LnksIHBvaW50Lm0ueCwgcG9pbnQubS55LCBwb2ludC54LCBwb2ludC55XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAob25seXN0YXJ0KSB7cmV0dXJuIHNwO31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJwYXRocy5zdGFydCA9IHNwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwID0gW1wiTVwiICsgcG9pbnQueCwgcG9pbnQueSArIFwiQ1wiICsgcG9pbnQubi54LCBwb2ludC5uLnksIHBvaW50LmVuZC54LCBwb2ludC5lbmQueSwgcFs1XSwgcFs2XV0uam9pbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbiArPSBsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggPSArcFs1XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ID0gK3BbNl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzdG90YWwgJiYgIXN1YnBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludCA9IGdldFBvaW50QXRTZWdtZW50TGVuZ3RoKHgsIHksIHBbMV0sIHBbMl0sIHBbM10sIHBbNF0sIHBbNV0sIHBbNl0sIGxlbmd0aCAtIGxlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHt4OiBwb2ludC54LCB5OiBwb2ludC55LCBhbHBoYTogcG9pbnQuYWxwaGF9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxlbiArPSBsO1xuICAgICAgICAgICAgICAgICAgICB4ID0gK3BbNV07XG4gICAgICAgICAgICAgICAgICAgIHkgPSArcFs2XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3AgKz0gcC5zaGlmdCgpICsgcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1YnBhdGhzLmVuZCA9IHNwO1xuICAgICAgICAgICAgcG9pbnQgPSBpc3RvdGFsID8gbGVuIDogc3VicGF0aCA/IHN1YnBhdGhzIDogUi5maW5kRG90c0F0U2VnbWVudCh4LCB5LCBwWzBdLCBwWzFdLCBwWzJdLCBwWzNdLCBwWzRdLCBwWzVdLCAxKTtcbiAgICAgICAgICAgIHBvaW50LmFscGhhICYmIChwb2ludCA9IHt4OiBwb2ludC54LCB5OiBwb2ludC55LCBhbHBoYTogcG9pbnQuYWxwaGF9KTtcbiAgICAgICAgICAgIHJldHVybiBwb2ludDtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIHZhciBnZXRUb3RhbExlbmd0aCA9IGdldExlbmd0aEZhY3RvcnkoMSksXG4gICAgICAgIGdldFBvaW50QXRMZW5ndGggPSBnZXRMZW5ndGhGYWN0b3J5KCksXG4gICAgICAgIGdldFN1YnBhdGhzQXRMZW5ndGggPSBnZXRMZW5ndGhGYWN0b3J5KDAsIDEpO1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmdldFRvdGFsTGVuZ3RoXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIGxlbmd0aCBvZiB0aGUgZ2l2ZW4gcGF0aCBpbiBwaXhlbHMuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHBhdGggKHN0cmluZykgU1ZHIHBhdGggc3RyaW5nLlxuICAgICAqKlxuICAgICA9IChudW1iZXIpIGxlbmd0aC5cbiAgICBcXCovXG4gICAgUi5nZXRUb3RhbExlbmd0aCA9IGdldFRvdGFsTGVuZ3RoO1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmdldFBvaW50QXRMZW5ndGhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybiBjb29yZGluYXRlcyBvZiB0aGUgcG9pbnQgbG9jYXRlZCBhdCB0aGUgZ2l2ZW4gbGVuZ3RoIG9uIHRoZSBnaXZlbiBwYXRoLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBwYXRoIChzdHJpbmcpIFNWRyBwYXRoIHN0cmluZ1xuICAgICAtIGxlbmd0aCAobnVtYmVyKVxuICAgICAqKlxuICAgICA9IChvYmplY3QpIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwb2ludDpcbiAgICAgbyB7XG4gICAgIG8gICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZVxuICAgICBvICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGVcbiAgICAgbyAgICAgYWxwaGE6IChudW1iZXIpIGFuZ2xlIG9mIGRlcml2YXRpdmVcbiAgICAgbyB9XG4gICAgXFwqL1xuICAgIFIuZ2V0UG9pbnRBdExlbmd0aCA9IGdldFBvaW50QXRMZW5ndGg7XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuZ2V0U3VicGF0aFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJuIHN1YnBhdGggb2YgYSBnaXZlbiBwYXRoIGZyb20gZ2l2ZW4gbGVuZ3RoIHRvIGdpdmVuIGxlbmd0aC5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gcGF0aCAoc3RyaW5nKSBTVkcgcGF0aCBzdHJpbmdcbiAgICAgLSBmcm9tIChudW1iZXIpIHBvc2l0aW9uIG9mIHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudFxuICAgICAtIHRvIChudW1iZXIpIHBvc2l0aW9uIG9mIHRoZSBlbmQgb2YgdGhlIHNlZ21lbnRcbiAgICAgKipcbiAgICAgPSAoc3RyaW5nKSBwYXRoc3RyaW5nIGZvciB0aGUgc2VnbWVudFxuICAgIFxcKi9cbiAgICBSLmdldFN1YnBhdGggPSBmdW5jdGlvbiAocGF0aCwgZnJvbSwgdG8pIHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0VG90YWxMZW5ndGgocGF0aCkgLSB0byA8IDFlLTYpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRTdWJwYXRoc0F0TGVuZ3RoKHBhdGgsIGZyb20pLmVuZDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYSA9IGdldFN1YnBhdGhzQXRMZW5ndGgocGF0aCwgdG8sIDEpO1xuICAgICAgICByZXR1cm4gZnJvbSA/IGdldFN1YnBhdGhzQXRMZW5ndGgoYSwgZnJvbSkuZW5kIDogYTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmdldFRvdGFsTGVuZ3RoXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIGxlbmd0aCBvZiB0aGUgcGF0aCBpbiBwaXhlbHMuIE9ubHkgd29ya3MgZm9yIGVsZW1lbnQgb2Yg4oCccGF0aOKAnSB0eXBlLlxuICAgICA9IChudW1iZXIpIGxlbmd0aC5cbiAgICBcXCovXG4gICAgZWxwcm90by5nZXRUb3RhbExlbmd0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPSBcInBhdGhcIikge3JldHVybjt9XG4gICAgICAgIGlmICh0aGlzLm5vZGUuZ2V0VG90YWxMZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5vZGUuZ2V0VG90YWxMZW5ndGgoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2V0VG90YWxMZW5ndGgodGhpcy5hdHRycy5wYXRoKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmdldFBvaW50QXRMZW5ndGhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybiBjb29yZGluYXRlcyBvZiB0aGUgcG9pbnQgbG9jYXRlZCBhdCB0aGUgZ2l2ZW4gbGVuZ3RoIG9uIHRoZSBnaXZlbiBwYXRoLiBPbmx5IHdvcmtzIGZvciBlbGVtZW50IG9mIOKAnHBhdGjigJ0gdHlwZS5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gbGVuZ3RoIChudW1iZXIpXG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgcmVwcmVzZW50YXRpb24gb2YgdGhlIHBvaW50OlxuICAgICBvIHtcbiAgICAgbyAgICAgeDogKG51bWJlcikgeCBjb29yZGluYXRlXG4gICAgIG8gICAgIHk6IChudW1iZXIpIHkgY29vcmRpbmF0ZVxuICAgICBvICAgICBhbHBoYTogKG51bWJlcikgYW5nbGUgb2YgZGVyaXZhdGl2ZVxuICAgICBvIH1cbiAgICBcXCovXG4gICAgZWxwcm90by5nZXRQb2ludEF0TGVuZ3RoID0gZnVuY3Rpb24gKGxlbmd0aCkge1xuICAgICAgICBpZiAodGhpcy50eXBlICE9IFwicGF0aFwiKSB7cmV0dXJuO31cbiAgICAgICAgcmV0dXJuIGdldFBvaW50QXRMZW5ndGgodGhpcy5hdHRycy5wYXRoLCBsZW5ndGgpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuZ2V0U3VicGF0aFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJuIHN1YnBhdGggb2YgYSBnaXZlbiBlbGVtZW50IGZyb20gZ2l2ZW4gbGVuZ3RoIHRvIGdpdmVuIGxlbmd0aC4gT25seSB3b3JrcyBmb3IgZWxlbWVudCBvZiDigJxwYXRo4oCdIHR5cGUuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGZyb20gKG51bWJlcikgcG9zaXRpb24gb2YgdGhlIHN0YXJ0IG9mIHRoZSBzZWdtZW50XG4gICAgIC0gdG8gKG51bWJlcikgcG9zaXRpb24gb2YgdGhlIGVuZCBvZiB0aGUgc2VnbWVudFxuICAgICAqKlxuICAgICA9IChzdHJpbmcpIHBhdGhzdHJpbmcgZm9yIHRoZSBzZWdtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8uZ2V0U3VicGF0aCA9IGZ1bmN0aW9uIChmcm9tLCB0bykge1xuICAgICAgICBpZiAodGhpcy50eXBlICE9IFwicGF0aFwiKSB7cmV0dXJuO31cbiAgICAgICAgcmV0dXJuIFIuZ2V0U3VicGF0aCh0aGlzLmF0dHJzLnBhdGgsIGZyb20sIHRvKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmVhc2luZ19mb3JtdWxhc1xuICAgICBbIHByb3BlcnR5IF1cbiAgICAgKipcbiAgICAgKiBPYmplY3QgdGhhdCBjb250YWlucyBlYXNpbmcgZm9ybXVsYXMgZm9yIGFuaW1hdGlvbi4gWW91IGNvdWxkIGV4dGVuZCBpdCB3aXRoIHlvdXIgb3duLiBCeSBkZWZhdWx0IGl0IGhhcyBmb2xsb3dpbmcgbGlzdCBvZiBlYXNpbmc6XG4gICAgICMgPHVsPlxuICAgICAjICAgICA8bGk+4oCcbGluZWFy4oCdPC9saT5cbiAgICAgIyAgICAgPGxpPuKAnCZsdDvigJ0gb3Ig4oCcZWFzZUlu4oCdIG9yIOKAnGVhc2UtaW7igJ08L2xpPlxuICAgICAjICAgICA8bGk+4oCcPuKAnSBvciDigJxlYXNlT3V04oCdIG9yIOKAnGVhc2Utb3V04oCdPC9saT5cbiAgICAgIyAgICAgPGxpPuKAnCZsdDs+4oCdIG9yIOKAnGVhc2VJbk91dOKAnSBvciDigJxlYXNlLWluLW91dOKAnTwvbGk+XG4gICAgICMgICAgIDxsaT7igJxiYWNrSW7igJ0gb3Ig4oCcYmFjay1pbuKAnTwvbGk+XG4gICAgICMgICAgIDxsaT7igJxiYWNrT3V04oCdIG9yIOKAnGJhY2stb3V04oCdPC9saT5cbiAgICAgIyAgICAgPGxpPuKAnGVsYXN0aWPigJ08L2xpPlxuICAgICAjICAgICA8bGk+4oCcYm91bmNl4oCdPC9saT5cbiAgICAgIyA8L3VsPlxuICAgICAjIDxwPlNlZSBhbHNvIDxhIGhyZWY9XCJodHRwOi8vcmFwaGFlbGpzLmNvbS9lYXNpbmcuaHRtbFwiPkVhc2luZyBkZW1vPC9hPi48L3A+XG4gICAgXFwqL1xuICAgIHZhciBlZiA9IFIuZWFzaW5nX2Zvcm11bGFzID0ge1xuICAgICAgICBsaW5lYXI6IGZ1bmN0aW9uIChuKSB7XG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgfSxcbiAgICAgICAgXCI8XCI6IGZ1bmN0aW9uIChuKSB7XG4gICAgICAgICAgICByZXR1cm4gcG93KG4sIDEuNyk7XG4gICAgICAgIH0sXG4gICAgICAgIFwiPlwiOiBmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgcmV0dXJuIHBvdyhuLCAuNDgpO1xuICAgICAgICB9LFxuICAgICAgICBcIjw+XCI6IGZ1bmN0aW9uIChuKSB7XG4gICAgICAgICAgICB2YXIgcSA9IC40OCAtIG4gLyAxLjA0LFxuICAgICAgICAgICAgICAgIFEgPSBtYXRoLnNxcnQoLjE3MzQgKyBxICogcSksXG4gICAgICAgICAgICAgICAgeCA9IFEgLSBxLFxuICAgICAgICAgICAgICAgIFggPSBwb3coYWJzKHgpLCAxIC8gMykgKiAoeCA8IDAgPyAtMSA6IDEpLFxuICAgICAgICAgICAgICAgIHkgPSAtUSAtIHEsXG4gICAgICAgICAgICAgICAgWSA9IHBvdyhhYnMoeSksIDEgLyAzKSAqICh5IDwgMCA/IC0xIDogMSksXG4gICAgICAgICAgICAgICAgdCA9IFggKyBZICsgLjU7XG4gICAgICAgICAgICByZXR1cm4gKDEgLSB0KSAqIDMgKiB0ICogdCArIHQgKiB0ICogdDtcbiAgICAgICAgfSxcbiAgICAgICAgYmFja0luOiBmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgdmFyIHMgPSAxLjcwMTU4O1xuICAgICAgICAgICAgcmV0dXJuIG4gKiBuICogKChzICsgMSkgKiBuIC0gcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGJhY2tPdXQ6IGZ1bmN0aW9uIChuKSB7XG4gICAgICAgICAgICBuID0gbiAtIDE7XG4gICAgICAgICAgICB2YXIgcyA9IDEuNzAxNTg7XG4gICAgICAgICAgICByZXR1cm4gbiAqIG4gKiAoKHMgKyAxKSAqIG4gKyBzKSArIDE7XG4gICAgICAgIH0sXG4gICAgICAgIGVsYXN0aWM6IGZ1bmN0aW9uIChuKSB7XG4gICAgICAgICAgICBpZiAobiA9PSAhIW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwb3coMiwgLTEwICogbikgKiBtYXRoLnNpbigobiAtIC4wNzUpICogKDIgKiBQSSkgLyAuMykgKyAxO1xuICAgICAgICB9LFxuICAgICAgICBib3VuY2U6IGZ1bmN0aW9uIChuKSB7XG4gICAgICAgICAgICB2YXIgcyA9IDcuNTYyNSxcbiAgICAgICAgICAgICAgICBwID0gMi43NSxcbiAgICAgICAgICAgICAgICBsO1xuICAgICAgICAgICAgaWYgKG4gPCAoMSAvIHApKSB7XG4gICAgICAgICAgICAgICAgbCA9IHMgKiBuICogbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG4gPCAoMiAvIHApKSB7XG4gICAgICAgICAgICAgICAgICAgIG4gLT0gKDEuNSAvIHApO1xuICAgICAgICAgICAgICAgICAgICBsID0gcyAqIG4gKiBuICsgLjc1O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuIDwgKDIuNSAvIHApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuIC09ICgyLjI1IC8gcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsID0gcyAqIG4gKiBuICsgLjkzNzU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuIC09ICgyLjYyNSAvIHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgbCA9IHMgKiBuICogbiArIC45ODQzNzU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgZWYuZWFzZUluID0gZWZbXCJlYXNlLWluXCJdID0gZWZbXCI8XCJdO1xuICAgIGVmLmVhc2VPdXQgPSBlZltcImVhc2Utb3V0XCJdID0gZWZbXCI+XCJdO1xuICAgIGVmLmVhc2VJbk91dCA9IGVmW1wiZWFzZS1pbi1vdXRcIl0gPSBlZltcIjw+XCJdO1xuICAgIGVmW1wiYmFjay1pblwiXSA9IGVmLmJhY2tJbjtcbiAgICBlZltcImJhY2stb3V0XCJdID0gZWYuYmFja091dDtcblxuICAgIHZhciBhbmltYXRpb25FbGVtZW50cyA9IFtdLFxuICAgICAgICByZXF1ZXN0QW5pbUZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgICB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSAgICB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgMTYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgYW5pbWF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIE5vdyA9ICtuZXcgRGF0ZSxcbiAgICAgICAgICAgICAgICBsID0gMDtcbiAgICAgICAgICAgIGZvciAoOyBsIDwgYW5pbWF0aW9uRWxlbWVudHMubGVuZ3RoOyBsKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZSA9IGFuaW1hdGlvbkVsZW1lbnRzW2xdO1xuICAgICAgICAgICAgICAgIGlmIChlLmVsLnJlbW92ZWQgfHwgZS5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciB0aW1lID0gTm93IC0gZS5zdGFydCxcbiAgICAgICAgICAgICAgICAgICAgbXMgPSBlLm1zLFxuICAgICAgICAgICAgICAgICAgICBlYXNpbmcgPSBlLmVhc2luZyxcbiAgICAgICAgICAgICAgICAgICAgZnJvbSA9IGUuZnJvbSxcbiAgICAgICAgICAgICAgICAgICAgZGlmZiA9IGUuZGlmZixcbiAgICAgICAgICAgICAgICAgICAgdG8gPSBlLnRvLFxuICAgICAgICAgICAgICAgICAgICB0ID0gZS50LFxuICAgICAgICAgICAgICAgICAgICB0aGF0ID0gZS5lbCxcbiAgICAgICAgICAgICAgICAgICAgc2V0ID0ge30sXG4gICAgICAgICAgICAgICAgICAgIG5vdyxcbiAgICAgICAgICAgICAgICAgICAgaW5pdCA9IHt9LFxuICAgICAgICAgICAgICAgICAgICBrZXk7XG4gICAgICAgICAgICAgICAgaWYgKGUuaW5pdHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICB0aW1lID0gKGUuaW5pdHN0YXR1cyAqIGUuYW5pbS50b3AgLSBlLnByZXYpIC8gKGUucGVyY2VudCAtIGUucHJldikgKiBtcztcbiAgICAgICAgICAgICAgICAgICAgZS5zdGF0dXMgPSBlLmluaXRzdGF0dXM7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBlLmluaXRzdGF0dXM7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcCAmJiBhbmltYXRpb25FbGVtZW50cy5zcGxpY2UobC0tLCAxKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlLnN0YXR1cyA9IChlLnByZXYgKyAoZS5wZXJjZW50IC0gZS5wcmV2KSAqICh0aW1lIC8gbXMpKSAvIGUuYW5pbS50b3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aW1lIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRpbWUgPCBtcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcG9zID0gZWFzaW5nKHRpbWUgLyBtcyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGF0dHIgaW4gZnJvbSkgaWYgKGZyb21baGFzXShhdHRyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChhdmFpbGFibGVBbmltQXR0cnNbYXR0cl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIG51OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgPSArZnJvbVthdHRyXSArIHBvcyAqIG1zICogZGlmZlthdHRyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImNvbG91clwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgPSBcInJnYihcIiArIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwdG8yNTUocm91bmQoZnJvbVthdHRyXS5yICsgcG9zICogbXMgKiBkaWZmW2F0dHJdLnIpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwdG8yNTUocm91bmQoZnJvbVthdHRyXS5nICsgcG9zICogbXMgKiBkaWZmW2F0dHJdLmcpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwdG8yNTUocm91bmQoZnJvbVthdHRyXS5iICsgcG9zICogbXMgKiBkaWZmW2F0dHJdLmIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLmpvaW4oXCIsXCIpICsgXCIpXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwYXRoXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBmcm9tW2F0dHJdLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vd1tpXSA9IFtmcm9tW2F0dHJdW2ldWzBdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAxLCBqaiA9IGZyb21bYXR0cl1baV0ubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vd1tpXVtqXSA9ICtmcm9tW2F0dHJdW2ldW2pdICsgcG9zICogbXMgKiBkaWZmW2F0dHJdW2ldW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93W2ldID0gbm93W2ldLmpvaW4oUyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93ID0gbm93LmpvaW4oUyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ0cmFuc2Zvcm1cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpZmZbYXR0cl0ucmVhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwLCBpaSA9IGZyb21bYXR0cl0ubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vd1tpXSA9IFtmcm9tW2F0dHJdW2ldWzBdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGogPSAxLCBqaiA9IGZyb21bYXR0cl1baV0ubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3dbaV1bal0gPSBmcm9tW2F0dHJdW2ldW2pdICsgcG9zICogbXMgKiBkaWZmW2F0dHJdW2ldW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBnZXQgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiArZnJvbVthdHRyXVtpXSArIHBvcyAqIG1zICogZGlmZlthdHRyXVtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3cgPSBbW1wiclwiLCBnZXQoMiksIDAsIDBdLCBbXCJ0XCIsIGdldCgzKSwgZ2V0KDQpXSwgW1wic1wiLCBnZXQoMCksIGdldCgxKSwgMCwgMF1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93ID0gW1tcIm1cIiwgZ2V0KDApLCBnZXQoMSksIGdldCgyKSwgZ2V0KDMpLCBnZXQoNCksIGdldCg1KV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJjc3ZcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHIgPT0gXCJjbGlwLXJlY3RcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpID0gNDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3dbaV0gPSArZnJvbVthdHRyXVtpXSArIHBvcyAqIG1zICogZGlmZlthdHRyXVtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZnJvbTIgPSBbXVtjb25jYXRdKGZyb21bYXR0cl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSA9IHRoYXQucGFwZXIuY3VzdG9tQXR0cmlidXRlc1thdHRyXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vd1tpXSA9ICtmcm9tMltpXSArIHBvcyAqIG1zICogZGlmZlthdHRyXVtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFthdHRyXSA9IG5vdztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LmF0dHIoc2V0KTtcbiAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uIChpZCwgdGhhdCwgYW5pbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlKFwicmFwaGFlbC5hbmltLmZyYW1lLlwiICsgaWQsIHRoYXQsIGFuaW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKHRoYXQuaWQsIHRoYXQsIGUuYW5pbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKGYsIGVsLCBhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZShcInJhcGhhZWwuYW5pbS5mcmFtZS5cIiArIGVsLmlkLCBlbCwgYSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlKFwicmFwaGFlbC5hbmltLmZpbmlzaC5cIiArIGVsLmlkLCBlbCwgYSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUi5pcyhmLCBcImZ1bmN0aW9uXCIpICYmIGYuY2FsbChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkoZS5jYWxsYmFjaywgdGhhdCwgZS5hbmltKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5hdHRyKHRvKTtcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uRWxlbWVudHMuc3BsaWNlKGwtLSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnJlcGVhdCA+IDEgJiYgIWUubmV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gdG8pIGlmICh0b1toYXNdKGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0W2tleV0gPSBlLnRvdGFsT3JpZ2luW2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlLmVsLmF0dHIoaW5pdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5BbmltYXRpb24oZS5hbmltLCBlLmVsLCBlLmFuaW0ucGVyY2VudHNbMF0sIG51bGwsIGUudG90YWxPcmlnaW4sIGUucmVwZWF0IC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGUubmV4dCAmJiAhZS5zdG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5BbmltYXRpb24oZS5hbmltLCBlLmVsLCBlLm5leHQsIG51bGwsIGUudG90YWxPcmlnaW4sIGUucmVwZWF0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFIuc3ZnICYmIHRoYXQgJiYgdGhhdC5wYXBlciAmJiB0aGF0LnBhcGVyLnNhZmFyaSgpO1xuICAgICAgICAgICAgYW5pbWF0aW9uRWxlbWVudHMubGVuZ3RoICYmIHJlcXVlc3RBbmltRnJhbWUoYW5pbWF0aW9uKTtcbiAgICAgICAgfSxcbiAgICAgICAgdXB0bzI1NSA9IGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgICAgICAgcmV0dXJuIGNvbG9yID4gMjU1ID8gMjU1IDogY29sb3IgPCAwID8gMCA6IGNvbG9yO1xuICAgICAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmFuaW1hdGVXaXRoXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBY3RzIHNpbWlsYXIgdG8gQEVsZW1lbnQuYW5pbWF0ZSwgYnV0IGVuc3VyZSB0aGF0IGdpdmVuIGFuaW1hdGlvbiBydW5zIGluIHN5bmMgd2l0aCBhbm90aGVyIGdpdmVuIGVsZW1lbnQuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGVsIChvYmplY3QpIGVsZW1lbnQgdG8gc3luYyB3aXRoXG4gICAgIC0gYW5pbSAob2JqZWN0KSBhbmltYXRpb24gdG8gc3luYyB3aXRoXG4gICAgIC0gcGFyYW1zIChvYmplY3QpICNvcHRpb25hbCBmaW5hbCBhdHRyaWJ1dGVzIGZvciB0aGUgZWxlbWVudCwgc2VlIGFsc28gQEVsZW1lbnQuYXR0clxuICAgICAtIG1zIChudW1iZXIpICNvcHRpb25hbCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciBhbmltYXRpb24gdG8gcnVuXG4gICAgIC0gZWFzaW5nIChzdHJpbmcpICNvcHRpb25hbCBlYXNpbmcgdHlwZS4gQWNjZXB0IG9uIG9mIEBSYXBoYWVsLmVhc2luZ19mb3JtdWxhcyBvciBDU1MgZm9ybWF0OiBgY3ViaWMmI3gyMDEwO2JlemllcihYWCwmIzE2MDtYWCwmIzE2MDtYWCwmIzE2MDtYWClgXG4gICAgIC0gY2FsbGJhY2sgKGZ1bmN0aW9uKSAjb3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24uIFdpbGwgYmUgY2FsbGVkIGF0IHRoZSBlbmQgb2YgYW5pbWF0aW9uLlxuICAgICAqIG9yXG4gICAgIC0gZWxlbWVudCAob2JqZWN0KSBlbGVtZW50IHRvIHN5bmMgd2l0aFxuICAgICAtIGFuaW0gKG9iamVjdCkgYW5pbWF0aW9uIHRvIHN5bmMgd2l0aFxuICAgICAtIGFuaW1hdGlvbiAob2JqZWN0KSAjb3B0aW9uYWwgYW5pbWF0aW9uIG9iamVjdCwgc2VlIEBSYXBoYWVsLmFuaW1hdGlvblxuICAgICAqKlxuICAgICA9IChvYmplY3QpIG9yaWdpbmFsIGVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5hbmltYXRlV2l0aCA9IGZ1bmN0aW9uIChlbCwgYW5pbSwgcGFyYW1zLCBtcywgZWFzaW5nLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZWxlbWVudCA9IHRoaXM7XG4gICAgICAgIGlmIChlbGVtZW50LnJlbW92ZWQpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrLmNhbGwoZWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYSA9IHBhcmFtcyBpbnN0YW5jZW9mIEFuaW1hdGlvbiA/IHBhcmFtcyA6IFIuYW5pbWF0aW9uKHBhcmFtcywgbXMsIGVhc2luZywgY2FsbGJhY2spLFxuICAgICAgICAgICAgeCwgeTtcbiAgICAgICAgcnVuQW5pbWF0aW9uKGEsIGVsZW1lbnQsIGEucGVyY2VudHNbMF0sIG51bGwsIGVsZW1lbnQuYXR0cigpKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gYW5pbWF0aW9uRWxlbWVudHMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFuaW1hdGlvbkVsZW1lbnRzW2ldLmFuaW0gPT0gYW5pbSAmJiBhbmltYXRpb25FbGVtZW50c1tpXS5lbCA9PSBlbCkge1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbkVsZW1lbnRzW2lpIC0gMV0uc3RhcnQgPSBhbmltYXRpb25FbGVtZW50c1tpXS5zdGFydDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgICAgLy8gXG4gICAgICAgIC8vIFxuICAgICAgICAvLyB2YXIgYSA9IHBhcmFtcyA/IFIuYW5pbWF0aW9uKHBhcmFtcywgbXMsIGVhc2luZywgY2FsbGJhY2spIDogYW5pbSxcbiAgICAgICAgLy8gICAgIHN0YXR1cyA9IGVsZW1lbnQuc3RhdHVzKGFuaW0pO1xuICAgICAgICAvLyByZXR1cm4gdGhpcy5hbmltYXRlKGEpLnN0YXR1cyhhLCBzdGF0dXMgKiBhbmltLm1zIC8gYS5tcyk7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBDdWJpY0JlemllckF0VGltZSh0LCBwMXgsIHAxeSwgcDJ4LCBwMnksIGR1cmF0aW9uKSB7XG4gICAgICAgIHZhciBjeCA9IDMgKiBwMXgsXG4gICAgICAgICAgICBieCA9IDMgKiAocDJ4IC0gcDF4KSAtIGN4LFxuICAgICAgICAgICAgYXggPSAxIC0gY3ggLSBieCxcbiAgICAgICAgICAgIGN5ID0gMyAqIHAxeSxcbiAgICAgICAgICAgIGJ5ID0gMyAqIChwMnkgLSBwMXkpIC0gY3ksXG4gICAgICAgICAgICBheSA9IDEgLSBjeSAtIGJ5O1xuICAgICAgICBmdW5jdGlvbiBzYW1wbGVDdXJ2ZVgodCkge1xuICAgICAgICAgICAgcmV0dXJuICgoYXggKiB0ICsgYngpICogdCArIGN4KSAqIHQ7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gc29sdmUoeCwgZXBzaWxvbikge1xuICAgICAgICAgICAgdmFyIHQgPSBzb2x2ZUN1cnZlWCh4LCBlcHNpbG9uKTtcbiAgICAgICAgICAgIHJldHVybiAoKGF5ICogdCArIGJ5KSAqIHQgKyBjeSkgKiB0O1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHNvbHZlQ3VydmVYKHgsIGVwc2lsb24pIHtcbiAgICAgICAgICAgIHZhciB0MCwgdDEsIHQyLCB4MiwgZDIsIGk7XG4gICAgICAgICAgICBmb3IodDIgPSB4LCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgICAgIHgyID0gc2FtcGxlQ3VydmVYKHQyKSAtIHg7XG4gICAgICAgICAgICAgICAgaWYgKGFicyh4MikgPCBlcHNpbG9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0MjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZDIgPSAoMyAqIGF4ICogdDIgKyAyICogYngpICogdDIgKyBjeDtcbiAgICAgICAgICAgICAgICBpZiAoYWJzKGQyKSA8IDFlLTYpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHQyID0gdDIgLSB4MiAvIGQyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdDAgPSAwO1xuICAgICAgICAgICAgdDEgPSAxO1xuICAgICAgICAgICAgdDIgPSB4O1xuICAgICAgICAgICAgaWYgKHQyIDwgdDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodDIgPiB0MSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0MTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlICh0MCA8IHQxKSB7XG4gICAgICAgICAgICAgICAgeDIgPSBzYW1wbGVDdXJ2ZVgodDIpO1xuICAgICAgICAgICAgICAgIGlmIChhYnMoeDIgLSB4KSA8IGVwc2lsb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHQyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoeCA+IHgyKSB7XG4gICAgICAgICAgICAgICAgICAgIHQwID0gdDI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdDEgPSB0MjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdDIgPSAodDEgLSB0MCkgLyAyICsgdDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdDI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNvbHZlKHQsIDEgLyAoMjAwICogZHVyYXRpb24pKTtcbiAgICB9XG4gICAgZWxwcm90by5vbkFuaW1hdGlvbiA9IGZ1bmN0aW9uIChmKSB7XG4gICAgICAgIGYgPyBldmUub24oXCJyYXBoYWVsLmFuaW0uZnJhbWUuXCIgKyB0aGlzLmlkLCBmKSA6IGV2ZS51bmJpbmQoXCJyYXBoYWVsLmFuaW0uZnJhbWUuXCIgKyB0aGlzLmlkKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBBbmltYXRpb24oYW5pbSwgbXMpIHtcbiAgICAgICAgdmFyIHBlcmNlbnRzID0gW10sXG4gICAgICAgICAgICBuZXdBbmltID0ge307XG4gICAgICAgIHRoaXMubXMgPSBtcztcbiAgICAgICAgdGhpcy50aW1lcyA9IDE7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBhdHRyIGluIGFuaW0pIGlmIChhbmltW2hhc10oYXR0cikpIHtcbiAgICAgICAgICAgICAgICBuZXdBbmltW3RvRmxvYXQoYXR0cildID0gYW5pbVthdHRyXTtcbiAgICAgICAgICAgICAgICBwZXJjZW50cy5wdXNoKHRvRmxvYXQoYXR0cikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGVyY2VudHMuc29ydChzb3J0QnlOdW1iZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYW5pbSA9IG5ld0FuaW07XG4gICAgICAgIHRoaXMudG9wID0gcGVyY2VudHNbcGVyY2VudHMubGVuZ3RoIC0gMV07XG4gICAgICAgIHRoaXMucGVyY2VudHMgPSBwZXJjZW50cztcbiAgICB9XG4gICAgLypcXFxuICAgICAqIEFuaW1hdGlvbi5kZWxheVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ3JlYXRlcyBhIGNvcHkgb2YgZXhpc3RpbmcgYW5pbWF0aW9uIG9iamVjdCB3aXRoIGdpdmVuIGRlbGF5LlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBkZWxheSAobnVtYmVyKSBudW1iZXIgb2YgbXMgdG8gcGFzcyBiZXR3ZWVuIGFuaW1hdGlvbiBzdGFydCBhbmQgYWN0dWFsIGFuaW1hdGlvblxuICAgICAqKlxuICAgICA9IChvYmplY3QpIG5ldyBhbHRlcmVkIEFuaW1hdGlvbiBvYmplY3RcbiAgICAgfCB2YXIgYW5pbSA9IFJhcGhhZWwuYW5pbWF0aW9uKHtjeDogMTAsIGN5OiAyMH0sIDJlMyk7XG4gICAgIHwgY2lyY2xlMS5hbmltYXRlKGFuaW0pOyAvLyBydW4gdGhlIGdpdmVuIGFuaW1hdGlvbiBpbW1lZGlhdGVseVxuICAgICB8IGNpcmNsZTIuYW5pbWF0ZShhbmltLmRlbGF5KDUwMCkpOyAvLyBydW4gdGhlIGdpdmVuIGFuaW1hdGlvbiBhZnRlciA1MDAgbXNcbiAgICBcXCovXG4gICAgQW5pbWF0aW9uLnByb3RvdHlwZS5kZWxheSA9IGZ1bmN0aW9uIChkZWxheSkge1xuICAgICAgICB2YXIgYSA9IG5ldyBBbmltYXRpb24odGhpcy5hbmltLCB0aGlzLm1zKTtcbiAgICAgICAgYS50aW1lcyA9IHRoaXMudGltZXM7XG4gICAgICAgIGEuZGVsID0gK2RlbGF5IHx8IDA7XG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEFuaW1hdGlvbi5yZXBlYXRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgYSBjb3B5IG9mIGV4aXN0aW5nIGFuaW1hdGlvbiBvYmplY3Qgd2l0aCBnaXZlbiByZXBldGl0aW9uLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSByZXBlYXQgKG51bWJlcikgbnVtYmVyIGl0ZXJhdGlvbnMgb2YgYW5pbWF0aW9uLiBGb3IgaW5maW5pdGUgYW5pbWF0aW9uIHBhc3MgYEluZmluaXR5YFxuICAgICAqKlxuICAgICA9IChvYmplY3QpIG5ldyBhbHRlcmVkIEFuaW1hdGlvbiBvYmplY3RcbiAgICBcXCovXG4gICAgQW5pbWF0aW9uLnByb3RvdHlwZS5yZXBlYXQgPSBmdW5jdGlvbiAodGltZXMpIHsgXG4gICAgICAgIHZhciBhID0gbmV3IEFuaW1hdGlvbih0aGlzLmFuaW0sIHRoaXMubXMpO1xuICAgICAgICBhLmRlbCA9IHRoaXMuZGVsO1xuICAgICAgICBhLnRpbWVzID0gbWF0aC5mbG9vcihtbWF4KHRpbWVzLCAwKSkgfHwgMTtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBydW5BbmltYXRpb24oYW5pbSwgZWxlbWVudCwgcGVyY2VudCwgc3RhdHVzLCB0b3RhbE9yaWdpbiwgdGltZXMpIHtcbiAgICAgICAgcGVyY2VudCA9IHRvRmxvYXQocGVyY2VudCk7XG4gICAgICAgIHZhciBwYXJhbXMsXG4gICAgICAgICAgICBpc0luQW5pbSxcbiAgICAgICAgICAgIGlzSW5BbmltU2V0LFxuICAgICAgICAgICAgcGVyY2VudHMgPSBbXSxcbiAgICAgICAgICAgIG5leHQsXG4gICAgICAgICAgICBwcmV2LFxuICAgICAgICAgICAgdGltZXN0YW1wLFxuICAgICAgICAgICAgbXMgPSBhbmltLm1zLFxuICAgICAgICAgICAgZnJvbSA9IHt9LFxuICAgICAgICAgICAgdG8gPSB7fSxcbiAgICAgICAgICAgIGRpZmYgPSB7fTtcbiAgICAgICAgaWYgKHN0YXR1cykge1xuICAgICAgICAgICAgZm9yIChpID0gMCwgaWkgPSBhbmltYXRpb25FbGVtZW50cy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGUgPSBhbmltYXRpb25FbGVtZW50c1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoZS5lbC5pZCA9PSBlbGVtZW50LmlkICYmIGUuYW5pbSA9PSBhbmltKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnBlcmNlbnQgIT0gcGVyY2VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uRWxlbWVudHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNJbkFuaW1TZXQgPSAxO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNJbkFuaW0gPSBlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYXR0cihlLnRvdGFsT3JpZ2luKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdHVzID0gK3RvOyAvLyBOYU5cbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBhbmltLnBlcmNlbnRzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhbmltLnBlcmNlbnRzW2ldID09IHBlcmNlbnQgfHwgYW5pbS5wZXJjZW50c1tpXSA+IHN0YXR1cyAqIGFuaW0udG9wKSB7XG4gICAgICAgICAgICAgICAgcGVyY2VudCA9IGFuaW0ucGVyY2VudHNbaV07XG4gICAgICAgICAgICAgICAgcHJldiA9IGFuaW0ucGVyY2VudHNbaSAtIDFdIHx8IDA7XG4gICAgICAgICAgICAgICAgbXMgPSBtcyAvIGFuaW0udG9wICogKHBlcmNlbnQgLSBwcmV2KTtcbiAgICAgICAgICAgICAgICBuZXh0ID0gYW5pbS5wZXJjZW50c1tpICsgMV07XG4gICAgICAgICAgICAgICAgcGFyYW1zID0gYW5pbS5hbmltW3BlcmNlbnRdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmF0dHIoYW5pbS5hbmltW2FuaW0ucGVyY2VudHNbaV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBhcmFtcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNJbkFuaW0pIHtcbiAgICAgICAgICAgIGZvciAodmFyIGF0dHIgaW4gcGFyYW1zKSBpZiAocGFyYW1zW2hhc10oYXR0cikpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXZhaWxhYmxlQW5pbUF0dHJzW2hhc10oYXR0cikgfHwgZWxlbWVudC5wYXBlci5jdXN0b21BdHRyaWJ1dGVzW2hhc10oYXR0cikpIHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbVthdHRyXSA9IGVsZW1lbnQuYXR0cihhdHRyKTtcbiAgICAgICAgICAgICAgICAgICAgKGZyb21bYXR0cl0gPT0gbnVsbCkgJiYgKGZyb21bYXR0cl0gPSBhdmFpbGFibGVBdHRyc1thdHRyXSk7XG4gICAgICAgICAgICAgICAgICAgIHRvW2F0dHJdID0gcGFyYW1zW2F0dHJdO1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGF2YWlsYWJsZUFuaW1BdHRyc1thdHRyXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBudTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmW2F0dHJdID0gKHRvW2F0dHJdIC0gZnJvbVthdHRyXSkgLyBtcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJjb2xvdXJcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tW2F0dHJdID0gUi5nZXRSR0IoZnJvbVthdHRyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRvQ29sb3VyID0gUi5nZXRSR0IodG9bYXR0cl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYXR0cl0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHI6ICh0b0NvbG91ci5yIC0gZnJvbVthdHRyXS5yKSAvIG1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnOiAodG9Db2xvdXIuZyAtIGZyb21bYXR0cl0uZykgLyBtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYjogKHRvQ29sb3VyLmIgLSBmcm9tW2F0dHJdLmIpIC8gbXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInBhdGhcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGF0aGVzID0gcGF0aDJjdXJ2ZShmcm9tW2F0dHJdLCB0b1thdHRyXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvUGF0aCA9IHBhdGhlc1sxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tW2F0dHJdID0gcGF0aGVzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYXR0cl0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwLCBpaSA9IGZyb21bYXR0cl0ubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmW2F0dHJdW2ldID0gWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMSwgamogPSBmcm9tW2F0dHJdW2ldLmxlbmd0aDsgaiA8IGpqOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYXR0cl1baV1bal0gPSAodG9QYXRoW2ldW2pdIC0gZnJvbVthdHRyXVtpXVtqXSkgLyBtcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ0cmFuc2Zvcm1cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgXyA9IGVsZW1lbnQuXyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXEgPSBlcXVhbGlzZVRyYW5zZm9ybShfW2F0dHJdLCB0b1thdHRyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21bYXR0cl0gPSBlcS5mcm9tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b1thdHRyXSA9IGVxLnRvO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmW2F0dHJdID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYXR0cl0ucmVhbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGlpID0gZnJvbVthdHRyXS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmW2F0dHJdW2ldID0gW2Zyb21bYXR0cl1baV1bMF1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMSwgamogPSBmcm9tW2F0dHJdW2ldLmxlbmd0aDsgaiA8IGpqOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmW2F0dHJdW2ldW2pdID0gKHRvW2F0dHJdW2ldW2pdIC0gZnJvbVthdHRyXVtpXVtqXSkgLyBtcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtID0gKGVsZW1lbnQubWF0cml4IHx8IG5ldyBNYXRyaXgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8yID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF86IHt0cmFuc2Zvcm06IF8udHJhbnNmb3JtfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRCQm94OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEJCb3goMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbVthdHRyXSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uYixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uYyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRyYWN0VHJhbnNmb3JtKHRvMiwgdG9bYXR0cl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b1thdHRyXSA9IHRvMi5fLnRyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlthdHRyXSA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0bzIubWF0cml4LmEgLSBtLmEpIC8gbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodG8yLm1hdHJpeC5iIC0gbS5iKSAvIG1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRvMi5tYXRyaXguYyAtIG0uYykgLyBtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0bzIubWF0cml4LmQgLSBtLmQpIC8gbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodG8yLm1hdHJpeC5lIC0gbS5lKSAvIG1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRvMi5tYXRyaXguZiAtIG0uZikgLyBtc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmcm9tW2F0dHJdID0gW18uc3gsIF8uc3ksIF8uZGVnLCBfLmR4LCBfLmR5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdmFyIHRvMiA9IHtfOnt9LCBnZXRCQm94OiBmdW5jdGlvbiAoKSB7IHJldHVybiBlbGVtZW50LmdldEJCb3goKTsgfX07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dHJhY3RUcmFuc2Zvcm0odG8yLCB0b1thdHRyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRpZmZbYXR0cl0gPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAodG8yLl8uc3ggLSBfLnN4KSAvIG1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgKHRvMi5fLnN5IC0gXy5zeSkgLyBtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICh0bzIuXy5kZWcgLSBfLmRlZykgLyBtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICh0bzIuXy5keCAtIF8uZHgpIC8gbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAodG8yLl8uZHkgLSBfLmR5KSAvIG1zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImNzdlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBTdHIocGFyYW1zW2F0dHJdKVtzcGxpdF0oc2VwYXJhdG9yKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTIgPSBTdHIoZnJvbVthdHRyXSlbc3BsaXRdKHNlcGFyYXRvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHIgPT0gXCJjbGlwLXJlY3RcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tW2F0dHJdID0gZnJvbTI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYXR0cl0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSA9IGZyb20yLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlthdHRyXVtpXSA9ICh2YWx1ZXNbaV0gLSBmcm9tW2F0dHJdW2ldKSAvIG1zO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvW2F0dHJdID0gdmFsdWVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgPSBbXVtjb25jYXRdKHBhcmFtc1thdHRyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTIgPSBbXVtjb25jYXRdKGZyb21bYXR0cl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYXR0cl0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpID0gZWxlbWVudC5wYXBlci5jdXN0b21BdHRyaWJ1dGVzW2F0dHJdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYXR0cl1baV0gPSAoKHZhbHVlc1tpXSB8fCAwKSAtIChmcm9tMltpXSB8fCAwKSkgLyBtcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZWFzaW5nID0gcGFyYW1zLmVhc2luZyxcbiAgICAgICAgICAgICAgICBlYXN5ZWFzeSA9IFIuZWFzaW5nX2Zvcm11bGFzW2Vhc2luZ107XG4gICAgICAgICAgICBpZiAoIWVhc3llYXN5KSB7XG4gICAgICAgICAgICAgICAgZWFzeWVhc3kgPSBTdHIoZWFzaW5nKS5tYXRjaChiZXppZXJyZyk7XG4gICAgICAgICAgICAgICAgaWYgKGVhc3llYXN5ICYmIGVhc3llYXN5Lmxlbmd0aCA9PSA1KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJ2ZSA9IGVhc3llYXN5O1xuICAgICAgICAgICAgICAgICAgICBlYXN5ZWFzeSA9IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQ3ViaWNCZXppZXJBdFRpbWUodCwgK2N1cnZlWzFdLCArY3VydmVbMl0sICtjdXJ2ZVszXSwgK2N1cnZlWzRdLCBtcyk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWFzeWVhc3kgPSBwaXBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRpbWVzdGFtcCA9IHBhcmFtcy5zdGFydCB8fCBhbmltLnN0YXJ0IHx8ICtuZXcgRGF0ZTtcbiAgICAgICAgICAgIGUgPSB7XG4gICAgICAgICAgICAgICAgYW5pbTogYW5pbSxcbiAgICAgICAgICAgICAgICBwZXJjZW50OiBwZXJjZW50LFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogdGltZXN0YW1wLFxuICAgICAgICAgICAgICAgIHN0YXJ0OiB0aW1lc3RhbXAgKyAoYW5pbS5kZWwgfHwgMCksXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAwLFxuICAgICAgICAgICAgICAgIGluaXRzdGF0dXM6IHN0YXR1cyB8fCAwLFxuICAgICAgICAgICAgICAgIHN0b3A6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG1zOiBtcyxcbiAgICAgICAgICAgICAgICBlYXNpbmc6IGVhc3llYXN5LFxuICAgICAgICAgICAgICAgIGZyb206IGZyb20sXG4gICAgICAgICAgICAgICAgZGlmZjogZGlmZixcbiAgICAgICAgICAgICAgICB0bzogdG8sXG4gICAgICAgICAgICAgICAgZWw6IGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IHBhcmFtcy5jYWxsYmFjayxcbiAgICAgICAgICAgICAgICBwcmV2OiBwcmV2LFxuICAgICAgICAgICAgICAgIG5leHQ6IG5leHQsXG4gICAgICAgICAgICAgICAgcmVwZWF0OiB0aW1lcyB8fCBhbmltLnRpbWVzLFxuICAgICAgICAgICAgICAgIG9yaWdpbjogZWxlbWVudC5hdHRyKCksXG4gICAgICAgICAgICAgICAgdG90YWxPcmlnaW46IHRvdGFsT3JpZ2luXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYW5pbWF0aW9uRWxlbWVudHMucHVzaChlKTtcbiAgICAgICAgICAgIGlmIChzdGF0dXMgJiYgIWlzSW5BbmltICYmICFpc0luQW5pbVNldCkge1xuICAgICAgICAgICAgICAgIGUuc3RvcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgZS5zdGFydCA9IG5ldyBEYXRlIC0gbXMgKiBzdGF0dXM7XG4gICAgICAgICAgICAgICAgaWYgKGFuaW1hdGlvbkVsZW1lbnRzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNJbkFuaW1TZXQpIHtcbiAgICAgICAgICAgICAgICBlLnN0YXJ0ID0gbmV3IERhdGUgLSBlLm1zICogc3RhdHVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYW5pbWF0aW9uRWxlbWVudHMubGVuZ3RoID09IDEgJiYgcmVxdWVzdEFuaW1GcmFtZShhbmltYXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXNJbkFuaW0uaW5pdHN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgICAgIGlzSW5BbmltLnN0YXJ0ID0gbmV3IERhdGUgLSBpc0luQW5pbS5tcyAqIHN0YXR1cztcbiAgICAgICAgfVxuICAgICAgICBldmUoXCJyYXBoYWVsLmFuaW0uc3RhcnQuXCIgKyBlbGVtZW50LmlkLCBlbGVtZW50LCBhbmltKTtcbiAgICB9XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuYW5pbWF0aW9uXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIGFuIGFuaW1hdGlvbiBvYmplY3QgdGhhdCBjYW4gYmUgcGFzc2VkIHRvIHRoZSBARWxlbWVudC5hbmltYXRlIG9yIEBFbGVtZW50LmFuaW1hdGVXaXRoIG1ldGhvZHMuXG4gICAgICogU2VlIGFsc28gQEFuaW1hdGlvbi5kZWxheSBhbmQgQEFuaW1hdGlvbi5yZXBlYXQgbWV0aG9kcy5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gcGFyYW1zIChvYmplY3QpIGZpbmFsIGF0dHJpYnV0ZXMgZm9yIHRoZSBlbGVtZW50LCBzZWUgYWxzbyBARWxlbWVudC5hdHRyXG4gICAgIC0gbXMgKG51bWJlcikgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmb3IgYW5pbWF0aW9uIHRvIHJ1blxuICAgICAtIGVhc2luZyAoc3RyaW5nKSAjb3B0aW9uYWwgZWFzaW5nIHR5cGUuIEFjY2VwdCBvbmUgb2YgQFJhcGhhZWwuZWFzaW5nX2Zvcm11bGFzIG9yIENTUyBmb3JtYXQ6IGBjdWJpYyYjeDIwMTA7YmV6aWVyKFhYLCYjMTYwO1hYLCYjMTYwO1hYLCYjMTYwO1hYKWBcbiAgICAgLSBjYWxsYmFjayAoZnVuY3Rpb24pICNvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbi4gV2lsbCBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiBhbmltYXRpb24uXG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgQEFuaW1hdGlvblxuICAgIFxcKi9cbiAgICBSLmFuaW1hdGlvbiA9IGZ1bmN0aW9uIChwYXJhbXMsIG1zLCBlYXNpbmcsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChwYXJhbXMgaW5zdGFuY2VvZiBBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFIuaXMoZWFzaW5nLCBcImZ1bmN0aW9uXCIpIHx8ICFlYXNpbmcpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZWFzaW5nIHx8IG51bGw7XG4gICAgICAgICAgICBlYXNpbmcgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHBhcmFtcyA9IE9iamVjdChwYXJhbXMpO1xuICAgICAgICBtcyA9ICttcyB8fCAwO1xuICAgICAgICB2YXIgcCA9IHt9LFxuICAgICAgICAgICAganNvbixcbiAgICAgICAgICAgIGF0dHI7XG4gICAgICAgIGZvciAoYXR0ciBpbiBwYXJhbXMpIGlmIChwYXJhbXNbaGFzXShhdHRyKSAmJiB0b0Zsb2F0KGF0dHIpICE9IGF0dHIgJiYgdG9GbG9hdChhdHRyKSArIFwiJVwiICE9IGF0dHIpIHtcbiAgICAgICAgICAgIGpzb24gPSB0cnVlO1xuICAgICAgICAgICAgcFthdHRyXSA9IHBhcmFtc1thdHRyXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWpzb24pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQW5pbWF0aW9uKHBhcmFtcywgbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWFzaW5nICYmIChwLmVhc2luZyA9IGVhc2luZyk7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiAocC5jYWxsYmFjayA9IGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQW5pbWF0aW9uKHsxMDA6IHB9LCBtcyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmFuaW1hdGVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgYW5kIHN0YXJ0cyBhbmltYXRpb24gZm9yIGdpdmVuIGVsZW1lbnQuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHBhcmFtcyAob2JqZWN0KSBmaW5hbCBhdHRyaWJ1dGVzIGZvciB0aGUgZWxlbWVudCwgc2VlIGFsc28gQEVsZW1lbnQuYXR0clxuICAgICAtIG1zIChudW1iZXIpIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZm9yIGFuaW1hdGlvbiB0byBydW5cbiAgICAgLSBlYXNpbmcgKHN0cmluZykgI29wdGlvbmFsIGVhc2luZyB0eXBlLiBBY2NlcHQgb25lIG9mIEBSYXBoYWVsLmVhc2luZ19mb3JtdWxhcyBvciBDU1MgZm9ybWF0OiBgY3ViaWMmI3gyMDEwO2JlemllcihYWCwmIzE2MDtYWCwmIzE2MDtYWCwmIzE2MDtYWClgXG4gICAgIC0gY2FsbGJhY2sgKGZ1bmN0aW9uKSAjb3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24uIFdpbGwgYmUgY2FsbGVkIGF0IHRoZSBlbmQgb2YgYW5pbWF0aW9uLlxuICAgICAqIG9yXG4gICAgIC0gYW5pbWF0aW9uIChvYmplY3QpIGFuaW1hdGlvbiBvYmplY3QsIHNlZSBAUmFwaGFlbC5hbmltYXRpb25cbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBvcmlnaW5hbCBlbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8uYW5pbWF0ZSA9IGZ1bmN0aW9uIChwYXJhbXMsIG1zLCBlYXNpbmcsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gdGhpcztcbiAgICAgICAgaWYgKGVsZW1lbnQucmVtb3ZlZCkge1xuICAgICAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2suY2FsbChlbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHZhciBhbmltID0gcGFyYW1zIGluc3RhbmNlb2YgQW5pbWF0aW9uID8gcGFyYW1zIDogUi5hbmltYXRpb24ocGFyYW1zLCBtcywgZWFzaW5nLCBjYWxsYmFjayk7XG4gICAgICAgIHJ1bkFuaW1hdGlvbihhbmltLCBlbGVtZW50LCBhbmltLnBlcmNlbnRzWzBdLCBudWxsLCBlbGVtZW50LmF0dHIoKSk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuc2V0VGltZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogU2V0cyB0aGUgc3RhdHVzIG9mIGFuaW1hdGlvbiBvZiB0aGUgZWxlbWVudCBpbiBtaWxsaXNlY29uZHMuIFNpbWlsYXIgdG8gQEVsZW1lbnQuc3RhdHVzIG1ldGhvZC5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gYW5pbSAob2JqZWN0KSBhbmltYXRpb24gb2JqZWN0XG4gICAgIC0gdmFsdWUgKG51bWJlcikgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFuaW1hdGlvblxuICAgICAqKlxuICAgICA9IChvYmplY3QpIG9yaWdpbmFsIGVsZW1lbnQgaWYgYHZhbHVlYCBpcyBzcGVjaWZpZWRcbiAgICAgKiBOb3RlLCB0aGF0IGR1cmluZyBhbmltYXRpb24gZm9sbG93aW5nIGV2ZW50cyBhcmUgdHJpZ2dlcmVkOlxuICAgICAqXG4gICAgICogT24gZWFjaCBhbmltYXRpb24gZnJhbWUgZXZlbnQgYGFuaW0uZnJhbWUuPGlkPmAsIG9uIHN0YXJ0IGBhbmltLnN0YXJ0LjxpZD5gIGFuZCBvbiBlbmQgYGFuaW0uZmluaXNoLjxpZD5gLlxuICAgIFxcKi9cbiAgICBlbHByb3RvLnNldFRpbWUgPSBmdW5jdGlvbiAoYW5pbSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGFuaW0gJiYgdmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXMoYW5pbSwgbW1pbih2YWx1ZSwgYW5pbS5tcykgLyBhbmltLm1zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnN0YXR1c1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogR2V0cyBvciBzZXRzIHRoZSBzdGF0dXMgb2YgYW5pbWF0aW9uIG9mIHRoZSBlbGVtZW50LlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBhbmltIChvYmplY3QpICNvcHRpb25hbCBhbmltYXRpb24gb2JqZWN0XG4gICAgIC0gdmFsdWUgKG51bWJlcikgI29wdGlvbmFsIDAg4oCTIDEuIElmIHNwZWNpZmllZCwgbWV0aG9kIHdvcmtzIGxpa2UgYSBzZXR0ZXIgYW5kIHNldHMgdGhlIHN0YXR1cyBvZiBhIGdpdmVuIGFuaW1hdGlvbiB0byB0aGUgdmFsdWUuIFRoaXMgd2lsbCBjYXVzZSBhbmltYXRpb24gdG8ganVtcCB0byB0aGUgZ2l2ZW4gcG9zaXRpb24uXG4gICAgICoqXG4gICAgID0gKG51bWJlcikgc3RhdHVzXG4gICAgICogb3JcbiAgICAgPSAoYXJyYXkpIHN0YXR1cyBpZiBgYW5pbWAgaXMgbm90IHNwZWNpZmllZC4gQXJyYXkgb2Ygb2JqZWN0cyBpbiBmb3JtYXQ6XG4gICAgIG8ge1xuICAgICBvICAgICBhbmltOiAob2JqZWN0KSBhbmltYXRpb24gb2JqZWN0XG4gICAgIG8gICAgIHN0YXR1czogKG51bWJlcikgc3RhdHVzXG4gICAgIG8gfVxuICAgICAqIG9yXG4gICAgID0gKG9iamVjdCkgb3JpZ2luYWwgZWxlbWVudCBpZiBgdmFsdWVgIGlzIHNwZWNpZmllZFxuICAgIFxcKi9cbiAgICBlbHByb3RvLnN0YXR1cyA9IGZ1bmN0aW9uIChhbmltLCB2YWx1ZSkge1xuICAgICAgICB2YXIgb3V0ID0gW10sXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIGxlbixcbiAgICAgICAgICAgIGU7XG4gICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBydW5BbmltYXRpb24oYW5pbSwgdGhpcywgLTEsIG1taW4odmFsdWUsIDEpKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGVuID0gYW5pbWF0aW9uRWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yICg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGUgPSBhbmltYXRpb25FbGVtZW50c1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoZS5lbC5pZCA9PSB0aGlzLmlkICYmICghYW5pbSB8fCBlLmFuaW0gPT0gYW5pbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFuaW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlLnN0YXR1cztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvdXQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltOiBlLmFuaW0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IGUuc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5wYXVzZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogU3RvcHMgYW5pbWF0aW9uIG9mIHRoZSBlbGVtZW50IHdpdGggYWJpbGl0eSB0byByZXN1bWUgaXQgbGF0ZXIgb24uXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGFuaW0gKG9iamVjdCkgI29wdGlvbmFsIGFuaW1hdGlvbiBvYmplY3RcbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBvcmlnaW5hbCBlbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8ucGF1c2UgPSBmdW5jdGlvbiAoYW5pbSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuaW1hdGlvbkVsZW1lbnRzLmxlbmd0aDsgaSsrKSBpZiAoYW5pbWF0aW9uRWxlbWVudHNbaV0uZWwuaWQgPT0gdGhpcy5pZCAmJiAoIWFuaW0gfHwgYW5pbWF0aW9uRWxlbWVudHNbaV0uYW5pbSA9PSBhbmltKSkge1xuICAgICAgICAgICAgaWYgKGV2ZShcInJhcGhhZWwuYW5pbS5wYXVzZS5cIiArIHRoaXMuaWQsIHRoaXMsIGFuaW1hdGlvbkVsZW1lbnRzW2ldLmFuaW0pICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbkVsZW1lbnRzW2ldLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5yZXN1bWVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlc3VtZXMgYW5pbWF0aW9uIGlmIGl0IHdhcyBwYXVzZWQgd2l0aCBARWxlbWVudC5wYXVzZSBtZXRob2QuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGFuaW0gKG9iamVjdCkgI29wdGlvbmFsIGFuaW1hdGlvbiBvYmplY3RcbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBvcmlnaW5hbCBlbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8ucmVzdW1lID0gZnVuY3Rpb24gKGFuaW0pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbmltYXRpb25FbGVtZW50cy5sZW5ndGg7IGkrKykgaWYgKGFuaW1hdGlvbkVsZW1lbnRzW2ldLmVsLmlkID09IHRoaXMuaWQgJiYgKCFhbmltIHx8IGFuaW1hdGlvbkVsZW1lbnRzW2ldLmFuaW0gPT0gYW5pbSkpIHtcbiAgICAgICAgICAgIHZhciBlID0gYW5pbWF0aW9uRWxlbWVudHNbaV07XG4gICAgICAgICAgICBpZiAoZXZlKFwicmFwaGFlbC5hbmltLnJlc3VtZS5cIiArIHRoaXMuaWQsIHRoaXMsIGUuYW5pbSkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGUucGF1c2VkO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzKGUuYW5pbSwgZS5zdGF0dXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuc3RvcFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogU3RvcHMgYW5pbWF0aW9uIG9mIHRoZSBlbGVtZW50LlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBhbmltIChvYmplY3QpICNvcHRpb25hbCBhbmltYXRpb24gb2JqZWN0XG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgb3JpZ2luYWwgZWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLnN0b3AgPSBmdW5jdGlvbiAoYW5pbSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuaW1hdGlvbkVsZW1lbnRzLmxlbmd0aDsgaSsrKSBpZiAoYW5pbWF0aW9uRWxlbWVudHNbaV0uZWwuaWQgPT0gdGhpcy5pZCAmJiAoIWFuaW0gfHwgYW5pbWF0aW9uRWxlbWVudHNbaV0uYW5pbSA9PSBhbmltKSkge1xuICAgICAgICAgICAgaWYgKGV2ZShcInJhcGhhZWwuYW5pbS5zdG9wLlwiICsgdGhpcy5pZCwgdGhpcywgYW5pbWF0aW9uRWxlbWVudHNbaV0uYW5pbSkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uRWxlbWVudHMuc3BsaWNlKGktLSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBzdG9wQW5pbWF0aW9uKHBhcGVyKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5pbWF0aW9uRWxlbWVudHMubGVuZ3RoOyBpKyspIGlmIChhbmltYXRpb25FbGVtZW50c1tpXS5lbC5wYXBlciA9PSBwYXBlcikge1xuICAgICAgICAgICAgYW5pbWF0aW9uRWxlbWVudHMuc3BsaWNlKGktLSwgMSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXZlLm9uKFwicmFwaGFlbC5yZW1vdmVcIiwgc3RvcEFuaW1hdGlvbik7XG4gICAgZXZlLm9uKFwicmFwaGFlbC5jbGVhclwiLCBzdG9wQW5pbWF0aW9uKTtcbiAgICBlbHByb3RvLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gXCJSYXBoYVxceGVibFxcdTIwMTlzIG9iamVjdFwiO1xuICAgIH07XG5cbiAgICAvLyBTZXRcbiAgICB2YXIgU2V0ID0gZnVuY3Rpb24gKGl0ZW1zKSB7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcbiAgICAgICAgdGhpcy5sZW5ndGggPSAwO1xuICAgICAgICB0aGlzLnR5cGUgPSBcInNldFwiO1xuICAgICAgICBpZiAoaXRlbXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGl0ZW1zLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbXNbaV0gJiYgKGl0ZW1zW2ldLmNvbnN0cnVjdG9yID09IGVscHJvdG8uY29uc3RydWN0b3IgfHwgaXRlbXNbaV0uY29uc3RydWN0b3IgPT0gU2V0KSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW3RoaXMuaXRlbXMubGVuZ3RoXSA9IHRoaXMuaXRlbXNbdGhpcy5pdGVtcy5sZW5ndGhdID0gaXRlbXNbaV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGVuZ3RoKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBzZXRwcm90byA9IFNldC5wcm90b3R5cGU7XG4gICAgLypcXFxuICAgICAqIFNldC5wdXNoXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGVhY2ggYXJndW1lbnQgdG8gdGhlIGN1cnJlbnQgc2V0LlxuICAgICA9IChvYmplY3QpIG9yaWdpbmFsIGVsZW1lbnRcbiAgICBcXCovXG4gICAgc2V0cHJvdG8ucHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGl0ZW0sXG4gICAgICAgICAgICBsZW47XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICBpdGVtID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgaWYgKGl0ZW0gJiYgKGl0ZW0uY29uc3RydWN0b3IgPT0gZWxwcm90by5jb25zdHJ1Y3RvciB8fCBpdGVtLmNvbnN0cnVjdG9yID09IFNldCkpIHtcbiAgICAgICAgICAgICAgICBsZW4gPSB0aGlzLml0ZW1zLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB0aGlzW2xlbl0gPSB0aGlzLml0ZW1zW2xlbl0gPSBpdGVtO1xuICAgICAgICAgICAgICAgIHRoaXMubGVuZ3RoKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU2V0LnBvcFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBsYXN0IGVsZW1lbnQgYW5kIHJldHVybnMgaXQuXG4gICAgID0gKG9iamVjdCkgZWxlbWVudFxuICAgIFxcKi9cbiAgICBzZXRwcm90by5wb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubGVuZ3RoICYmIGRlbGV0ZSB0aGlzW3RoaXMubGVuZ3RoLS1dO1xuICAgICAgICByZXR1cm4gdGhpcy5pdGVtcy5wb3AoKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTZXQuZm9yRWFjaFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRXhlY3V0ZXMgZ2l2ZW4gZnVuY3Rpb24gZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgc2V0LlxuICAgICAqXG4gICAgICogSWYgZnVuY3Rpb24gcmV0dXJucyBgZmFsc2VgIGl0IHdpbGwgc3RvcCBsb29wIHJ1bm5pbmcuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGNhbGxiYWNrIChmdW5jdGlvbikgZnVuY3Rpb24gdG8gcnVuXG4gICAgIC0gdGhpc0FyZyAob2JqZWN0KSBjb250ZXh0IG9iamVjdCBmb3IgdGhlIGNhbGxiYWNrXG4gICAgID0gKG9iamVjdCkgU2V0IG9iamVjdFxuICAgIFxcKi9cbiAgICBzZXRwcm90by5mb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHRoaXMuaXRlbXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdGhpcy5pdGVtc1tpXSwgaSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBmb3IgKHZhciBtZXRob2QgaW4gZWxwcm90bykgaWYgKGVscHJvdG9baGFzXShtZXRob2QpKSB7XG4gICAgICAgIHNldHByb3RvW21ldGhvZF0gPSAoZnVuY3Rpb24gKG1ldGhvZG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgICAgICBlbFttZXRob2RuYW1lXVthcHBseV0oZWwsIGFyZyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KShtZXRob2QpO1xuICAgIH1cbiAgICBzZXRwcm90by5hdHRyID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIGlmIChuYW1lICYmIFIuaXMobmFtZSwgYXJyYXkpICYmIFIuaXMobmFtZVswXSwgXCJvYmplY3RcIikpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwLCBqaiA9IG5hbWUubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXNbal0uYXR0cihuYW1lW2pdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHRoaXMuaXRlbXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0uYXR0cihuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU2V0LmNsZWFyXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVkcyBhbGwgZWxlbWVudHMgZnJvbSB0aGUgc2V0XG4gICAgXFwqL1xuICAgIHNldHByb3RvLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB3aGlsZSAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMucG9wKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTZXQuc3BsaWNlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGdpdmVuIGVsZW1lbnQgZnJvbSB0aGUgc2V0XG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGluZGV4IChudW1iZXIpIHBvc2l0aW9uIG9mIHRoZSBkZWxldGlvblxuICAgICAtIGNvdW50IChudW1iZXIpIG51bWJlciBvZiBlbGVtZW50IHRvIHJlbW92ZVxuICAgICAtIGluc2VydGlvbuKApiAob2JqZWN0KSAjb3B0aW9uYWwgZWxlbWVudHMgdG8gaW5zZXJ0XG4gICAgID0gKG9iamVjdCkgc2V0IGVsZW1lbnRzIHRoYXQgd2VyZSBkZWxldGVkXG4gICAgXFwqL1xuICAgIHNldHByb3RvLnNwbGljZSA9IGZ1bmN0aW9uIChpbmRleCwgY291bnQsIGluc2VydGlvbikge1xuICAgICAgICBpbmRleCA9IGluZGV4IDwgMCA/IG1tYXgodGhpcy5sZW5ndGggKyBpbmRleCwgMCkgOiBpbmRleDtcbiAgICAgICAgY291bnQgPSBtbWF4KDAsIG1taW4odGhpcy5sZW5ndGggLSBpbmRleCwgY291bnQpKTtcbiAgICAgICAgdmFyIHRhaWwgPSBbXSxcbiAgICAgICAgICAgIHRvZGVsID0gW10sXG4gICAgICAgICAgICBhcmdzID0gW10sXG4gICAgICAgICAgICBpO1xuICAgICAgICBmb3IgKGkgPSAyOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgdG9kZWwucHVzaCh0aGlzW2luZGV4ICsgaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoOyBpIDwgdGhpcy5sZW5ndGggLSBpbmRleDsgaSsrKSB7XG4gICAgICAgICAgICB0YWlsLnB1c2godGhpc1tpbmRleCArIGldKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXJnbGVuID0gYXJncy5sZW5ndGg7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBhcmdsZW4gKyB0YWlsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zW2luZGV4ICsgaV0gPSB0aGlzW2luZGV4ICsgaV0gPSBpIDwgYXJnbGVuID8gYXJnc1tpXSA6IHRhaWxbaSAtIGFyZ2xlbl07XG4gICAgICAgIH1cbiAgICAgICAgaSA9IHRoaXMuaXRlbXMubGVuZ3RoID0gdGhpcy5sZW5ndGggLT0gY291bnQgLSBhcmdsZW47XG4gICAgICAgIHdoaWxlICh0aGlzW2ldKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpc1tpKytdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgU2V0KHRvZGVsKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTZXQuZXhjbHVkZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBnaXZlbiBlbGVtZW50IGZyb20gdGhlIHNldFxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBlbGVtZW50IChvYmplY3QpIGVsZW1lbnQgdG8gcmVtb3ZlXG4gICAgID0gKGJvb2xlYW4pIGB0cnVlYCBpZiBvYmplY3Qgd2FzIGZvdW5kICYgcmVtb3ZlZCBmcm9tIHRoZSBzZXRcbiAgICBcXCovXG4gICAgc2V0cHJvdG8uZXhjbHVkZSA9IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSB0aGlzLmxlbmd0aDsgaSA8IGlpOyBpKyspIGlmICh0aGlzW2ldID09IGVsKSB7XG4gICAgICAgICAgICB0aGlzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBzZXRwcm90by5hbmltYXRlID0gZnVuY3Rpb24gKHBhcmFtcywgbXMsIGVhc2luZywgY2FsbGJhY2spIHtcbiAgICAgICAgKFIuaXMoZWFzaW5nLCBcImZ1bmN0aW9uXCIpIHx8ICFlYXNpbmcpICYmIChjYWxsYmFjayA9IGVhc2luZyB8fCBudWxsKTtcbiAgICAgICAgdmFyIGxlbiA9IHRoaXMuaXRlbXMubGVuZ3RoLFxuICAgICAgICAgICAgaSA9IGxlbixcbiAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICBzZXQgPSB0aGlzLFxuICAgICAgICAgICAgY29sbGVjdG9yO1xuICAgICAgICBpZiAoIWxlbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2sgJiYgKGNvbGxlY3RvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICEtLWxlbiAmJiBjYWxsYmFjay5jYWxsKHNldCk7XG4gICAgICAgIH0pO1xuICAgICAgICBlYXNpbmcgPSBSLmlzKGVhc2luZywgc3RyaW5nKSA/IGVhc2luZyA6IGNvbGxlY3RvcjtcbiAgICAgICAgdmFyIGFuaW0gPSBSLmFuaW1hdGlvbihwYXJhbXMsIG1zLCBlYXNpbmcsIGNvbGxlY3Rvcik7XG4gICAgICAgIGl0ZW0gPSB0aGlzLml0ZW1zWy0taV0uYW5pbWF0ZShhbmltKTtcbiAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgdGhpcy5pdGVtc1tpXSAmJiAhdGhpcy5pdGVtc1tpXS5yZW1vdmVkICYmIHRoaXMuaXRlbXNbaV0uYW5pbWF0ZVdpdGgoaXRlbSwgYW5pbSwgYW5pbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBzZXRwcm90by5pbnNlcnRBZnRlciA9IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICB2YXIgaSA9IHRoaXMuaXRlbXMubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldLmluc2VydEFmdGVyKGVsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHNldHByb3RvLmdldEJCb3ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB4ID0gW10sXG4gICAgICAgICAgICB5ID0gW10sXG4gICAgICAgICAgICB4MiA9IFtdLFxuICAgICAgICAgICAgeTIgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IHRoaXMuaXRlbXMubGVuZ3RoOyBpLS07KSBpZiAoIXRoaXMuaXRlbXNbaV0ucmVtb3ZlZCkge1xuICAgICAgICAgICAgdmFyIGJveCA9IHRoaXMuaXRlbXNbaV0uZ2V0QkJveCgpO1xuICAgICAgICAgICAgeC5wdXNoKGJveC54KTtcbiAgICAgICAgICAgIHkucHVzaChib3gueSk7XG4gICAgICAgICAgICB4Mi5wdXNoKGJveC54ICsgYm94LndpZHRoKTtcbiAgICAgICAgICAgIHkyLnB1c2goYm94LnkgKyBib3guaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICB4ID0gbW1pblthcHBseV0oMCwgeCk7XG4gICAgICAgIHkgPSBtbWluW2FwcGx5XSgwLCB5KTtcbiAgICAgICAgeDIgPSBtbWF4W2FwcGx5XSgwLCB4Mik7XG4gICAgICAgIHkyID0gbW1heFthcHBseV0oMCwgeTIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICB4MjogeDIsXG4gICAgICAgICAgICB5MjogeTIsXG4gICAgICAgICAgICB3aWR0aDogeDIgLSB4LFxuICAgICAgICAgICAgaGVpZ2h0OiB5MiAtIHlcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIHNldHByb3RvLmNsb25lID0gZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgcyA9IHRoaXMucGFwZXIuc2V0KCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHRoaXMuaXRlbXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgcy5wdXNoKHRoaXMuaXRlbXNbaV0uY2xvbmUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHM7XG4gICAgfTtcbiAgICBzZXRwcm90by50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFwiUmFwaGFcXHhlYmxcXHUyMDE4cyBzZXRcIjtcbiAgICB9O1xuXG4gICAgc2V0cHJvdG8uZ2xvdyA9IGZ1bmN0aW9uKGdsb3dDb25maWcpIHtcbiAgICAgICAgdmFyIHJldCA9IHRoaXMucGFwZXIuc2V0KCk7XG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihzaGFwZSwgaW5kZXgpe1xuICAgICAgICAgICAgdmFyIGcgPSBzaGFwZS5nbG93KGdsb3dDb25maWcpO1xuICAgICAgICAgICAgaWYoZyAhPSBudWxsKXtcbiAgICAgICAgICAgICAgICBnLmZvckVhY2goZnVuY3Rpb24oc2hhcGUyLCBpbmRleDIpe1xuICAgICAgICAgICAgICAgICAgICByZXQucHVzaChzaGFwZTIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuXG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwucmVnaXN0ZXJGb250XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGdpdmVuIGZvbnQgdG8gdGhlIHJlZ2lzdGVyZWQgc2V0IG9mIGZvbnRzIGZvciBSYXBoYcOrbC4gU2hvdWxkIGJlIHVzZWQgYXMgYW4gaW50ZXJuYWwgY2FsbCBmcm9tIHdpdGhpbiBDdWbDs27igJlzIGZvbnQgZmlsZS5cbiAgICAgKiBSZXR1cm5zIG9yaWdpbmFsIHBhcmFtZXRlciwgc28gaXQgY291bGQgYmUgdXNlZCB3aXRoIGNoYWluaW5nLlxuICAgICAjIDxhIGhyZWY9XCJodHRwOi8vd2lraS5naXRodWIuY29tL3NvcmNjdS9jdWZvbi9hYm91dFwiPk1vcmUgYWJvdXQgQ3Vmw7NuIGFuZCBob3cgdG8gY29udmVydCB5b3VyIGZvbnQgZm9ybSBUVEYsIE9URiwgZXRjIHRvIEphdmFTY3JpcHQgZmlsZS48L2E+XG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGZvbnQgKG9iamVjdCkgdGhlIGZvbnQgdG8gcmVnaXN0ZXJcbiAgICAgPSAob2JqZWN0KSB0aGUgZm9udCB5b3UgcGFzc2VkIGluXG4gICAgID4gVXNhZ2VcbiAgICAgfCBDdWZvbi5yZWdpc3RlckZvbnQoUmFwaGFlbC5yZWdpc3RlckZvbnQoe+KApn0pKTtcbiAgICBcXCovXG4gICAgUi5yZWdpc3RlckZvbnQgPSBmdW5jdGlvbiAoZm9udCkge1xuICAgICAgICBpZiAoIWZvbnQuZmFjZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZvbnQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mb250cyA9IHRoaXMuZm9udHMgfHwge307XG4gICAgICAgIHZhciBmb250Y29weSA9IHtcbiAgICAgICAgICAgICAgICB3OiBmb250LncsXG4gICAgICAgICAgICAgICAgZmFjZToge30sXG4gICAgICAgICAgICAgICAgZ2x5cGhzOiB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbWlseSA9IGZvbnQuZmFjZVtcImZvbnQtZmFtaWx5XCJdO1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIGZvbnQuZmFjZSkgaWYgKGZvbnQuZmFjZVtoYXNdKHByb3ApKSB7XG4gICAgICAgICAgICBmb250Y29weS5mYWNlW3Byb3BdID0gZm9udC5mYWNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmZvbnRzW2ZhbWlseV0pIHtcbiAgICAgICAgICAgIHRoaXMuZm9udHNbZmFtaWx5XS5wdXNoKGZvbnRjb3B5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZm9udHNbZmFtaWx5XSA9IFtmb250Y29weV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmb250LnN2Zykge1xuICAgICAgICAgICAgZm9udGNvcHkuZmFjZVtcInVuaXRzLXBlci1lbVwiXSA9IHRvSW50KGZvbnQuZmFjZVtcInVuaXRzLXBlci1lbVwiXSwgMTApO1xuICAgICAgICAgICAgZm9yICh2YXIgZ2x5cGggaW4gZm9udC5nbHlwaHMpIGlmIChmb250LmdseXBoc1toYXNdKGdseXBoKSkge1xuICAgICAgICAgICAgICAgIHZhciBwYXRoID0gZm9udC5nbHlwaHNbZ2x5cGhdO1xuICAgICAgICAgICAgICAgIGZvbnRjb3B5LmdseXBoc1tnbHlwaF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIHc6IHBhdGgudyxcbiAgICAgICAgICAgICAgICAgICAgazoge30sXG4gICAgICAgICAgICAgICAgICAgIGQ6IHBhdGguZCAmJiBcIk1cIiArIHBhdGguZC5yZXBsYWNlKC9bbWxjeHRydl0vZywgZnVuY3Rpb24gKGNvbW1hbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge2w6IFwiTFwiLCBjOiBcIkNcIiwgeDogXCJ6XCIsIHQ6IFwibVwiLCByOiBcImxcIiwgdjogXCJjXCJ9W2NvbW1hbmRdIHx8IFwiTVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkgKyBcInpcIlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKHBhdGguaykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrIGluIHBhdGguaykgaWYgKHBhdGhbaGFzXShrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9udGNvcHkuZ2x5cGhzW2dseXBoXS5rW2tdID0gcGF0aC5rW2tdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmb250O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLmdldEZvbnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEZpbmRzIGZvbnQgb2JqZWN0IGluIHRoZSByZWdpc3RlcmVkIGZvbnRzIGJ5IGdpdmVuIHBhcmFtZXRlcnMuIFlvdSBjb3VsZCBzcGVjaWZ5IG9ubHkgb25lIHdvcmQgZnJvbSB0aGUgZm9udCBuYW1lLCBsaWtlIOKAnE15cmlhZOKAnSBmb3Ig4oCcTXlyaWFkIFByb+KAnS5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gZmFtaWx5IChzdHJpbmcpIGZvbnQgZmFtaWx5IG5hbWUgb3IgYW55IHdvcmQgZnJvbSBpdFxuICAgICAtIHdlaWdodCAoc3RyaW5nKSAjb3B0aW9uYWwgZm9udCB3ZWlnaHRcbiAgICAgLSBzdHlsZSAoc3RyaW5nKSAjb3B0aW9uYWwgZm9udCBzdHlsZVxuICAgICAtIHN0cmV0Y2ggKHN0cmluZykgI29wdGlvbmFsIGZvbnQgc3RyZXRjaFxuICAgICA9IChvYmplY3QpIHRoZSBmb250IG9iamVjdFxuICAgICA+IFVzYWdlXG4gICAgIHwgcGFwZXIucHJpbnQoMTAwLCAxMDAsIFwiVGVzdCBzdHJpbmdcIiwgcGFwZXIuZ2V0Rm9udChcIlRpbWVzXCIsIDgwMCksIDMwKTtcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5nZXRGb250ID0gZnVuY3Rpb24gKGZhbWlseSwgd2VpZ2h0LCBzdHlsZSwgc3RyZXRjaCkge1xuICAgICAgICBzdHJldGNoID0gc3RyZXRjaCB8fCBcIm5vcm1hbFwiO1xuICAgICAgICBzdHlsZSA9IHN0eWxlIHx8IFwibm9ybWFsXCI7XG4gICAgICAgIHdlaWdodCA9ICt3ZWlnaHQgfHwge25vcm1hbDogNDAwLCBib2xkOiA3MDAsIGxpZ2h0ZXI6IDMwMCwgYm9sZGVyOiA4MDB9W3dlaWdodF0gfHwgNDAwO1xuICAgICAgICBpZiAoIVIuZm9udHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZm9udCA9IFIuZm9udHNbZmFtaWx5XTtcbiAgICAgICAgaWYgKCFmb250KSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IG5ldyBSZWdFeHAoXCIoXnxcXFxccylcIiArIGZhbWlseS5yZXBsYWNlKC9bXlxcd1xcZFxccyshfi46Xy1dL2csIEUpICsgXCIoXFxcXHN8JClcIiwgXCJpXCIpO1xuICAgICAgICAgICAgZm9yICh2YXIgZm9udE5hbWUgaW4gUi5mb250cykgaWYgKFIuZm9udHNbaGFzXShmb250TmFtZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAobmFtZS50ZXN0KGZvbnROYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBmb250ID0gUi5mb250c1tmb250TmFtZV07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgdGhlZm9udDtcbiAgICAgICAgaWYgKGZvbnQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGZvbnQubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoZWZvbnQgPSBmb250W2ldO1xuICAgICAgICAgICAgICAgIGlmICh0aGVmb250LmZhY2VbXCJmb250LXdlaWdodFwiXSA9PSB3ZWlnaHQgJiYgKHRoZWZvbnQuZmFjZVtcImZvbnQtc3R5bGVcIl0gPT0gc3R5bGUgfHwgIXRoZWZvbnQuZmFjZVtcImZvbnQtc3R5bGVcIl0pICYmIHRoZWZvbnQuZmFjZVtcImZvbnQtc3RyZXRjaFwiXSA9PSBzdHJldGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhlZm9udDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5wcmludFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ3JlYXRlcyBwYXRoIHRoYXQgcmVwcmVzZW50IGdpdmVuIHRleHQgd3JpdHRlbiB1c2luZyBnaXZlbiBmb250IGF0IGdpdmVuIHBvc2l0aW9uIHdpdGggZ2l2ZW4gc2l6ZS5cbiAgICAgKiBSZXN1bHQgb2YgdGhlIG1ldGhvZCBpcyBwYXRoIGVsZW1lbnQgdGhhdCBjb250YWlucyB3aG9sZSB0ZXh0IGFzIGEgc2VwYXJhdGUgcGF0aC5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0geCAobnVtYmVyKSB4IHBvc2l0aW9uIG9mIHRoZSB0ZXh0XG4gICAgIC0geSAobnVtYmVyKSB5IHBvc2l0aW9uIG9mIHRoZSB0ZXh0XG4gICAgIC0gc3RyaW5nIChzdHJpbmcpIHRleHQgdG8gcHJpbnRcbiAgICAgLSBmb250IChvYmplY3QpIGZvbnQgb2JqZWN0LCBzZWUgQFBhcGVyLmdldEZvbnRcbiAgICAgLSBzaXplIChudW1iZXIpICNvcHRpb25hbCBzaXplIG9mIHRoZSBmb250LCBkZWZhdWx0IGlzIGAxNmBcbiAgICAgLSBvcmlnaW4gKHN0cmluZykgI29wdGlvbmFsIGNvdWxkIGJlIGBcImJhc2VsaW5lXCJgIG9yIGBcIm1pZGRsZVwiYCwgZGVmYXVsdCBpcyBgXCJtaWRkbGVcImBcbiAgICAgLSBsZXR0ZXJfc3BhY2luZyAobnVtYmVyKSAjb3B0aW9uYWwgbnVtYmVyIGluIHJhbmdlIGAtMS4uMWAsIGRlZmF1bHQgaXMgYDBgXG4gICAgID0gKG9iamVjdCkgcmVzdWx0aW5nIHBhdGggZWxlbWVudCwgd2hpY2ggY29uc2lzdCBvZiBhbGwgbGV0dGVyc1xuICAgICA+IFVzYWdlXG4gICAgIHwgdmFyIHR4dCA9IHIucHJpbnQoMTAsIDUwLCBcInByaW50XCIsIHIuZ2V0Rm9udChcIk11c2VvXCIpLCAzMCkuYXR0cih7ZmlsbDogXCIjZmZmXCJ9KTtcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5wcmludCA9IGZ1bmN0aW9uICh4LCB5LCBzdHJpbmcsIGZvbnQsIHNpemUsIG9yaWdpbiwgbGV0dGVyX3NwYWNpbmcpIHtcbiAgICAgICAgb3JpZ2luID0gb3JpZ2luIHx8IFwibWlkZGxlXCI7IC8vIGJhc2VsaW5lfG1pZGRsZVxuICAgICAgICBsZXR0ZXJfc3BhY2luZyA9IG1tYXgobW1pbihsZXR0ZXJfc3BhY2luZyB8fCAwLCAxKSwgLTEpO1xuICAgICAgICB2YXIgbGV0dGVycyA9IFN0cihzdHJpbmcpW3NwbGl0XShFKSxcbiAgICAgICAgICAgIHNoaWZ0ID0gMCxcbiAgICAgICAgICAgIG5vdGZpcnN0ID0gMCxcbiAgICAgICAgICAgIHBhdGggPSBFLFxuICAgICAgICAgICAgc2NhbGU7XG4gICAgICAgIFIuaXMoZm9udCwgXCJzdHJpbmdcIikgJiYgKGZvbnQgPSB0aGlzLmdldEZvbnQoZm9udCkpO1xuICAgICAgICBpZiAoZm9udCkge1xuICAgICAgICAgICAgc2NhbGUgPSAoc2l6ZSB8fCAxNikgLyBmb250LmZhY2VbXCJ1bml0cy1wZXItZW1cIl07XG4gICAgICAgICAgICB2YXIgYmIgPSBmb250LmZhY2UuYmJveFtzcGxpdF0oc2VwYXJhdG9yKSxcbiAgICAgICAgICAgICAgICB0b3AgPSArYmJbMF0sXG4gICAgICAgICAgICAgICAgbGluZUhlaWdodCA9IGJiWzNdIC0gYmJbMV0sXG4gICAgICAgICAgICAgICAgc2hpZnR5ID0gMCxcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSArYmJbMV0gKyAob3JpZ2luID09IFwiYmFzZWxpbmVcIiA/IGxpbmVIZWlnaHQgKyAoK2ZvbnQuZmFjZS5kZXNjZW50KSA6IGxpbmVIZWlnaHQgLyAyKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGxldHRlcnMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChsZXR0ZXJzW2ldID09IFwiXFxuXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2hpZnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBjdXJyID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbm90Zmlyc3QgPSAwO1xuICAgICAgICAgICAgICAgICAgICBzaGlmdHkgKz0gbGluZUhlaWdodDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJldiA9IG5vdGZpcnN0ICYmIGZvbnQuZ2x5cGhzW2xldHRlcnNbaSAtIDFdXSB8fCB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIgPSBmb250LmdseXBoc1tsZXR0ZXJzW2ldXTtcbiAgICAgICAgICAgICAgICAgICAgc2hpZnQgKz0gbm90Zmlyc3QgPyAocHJldi53IHx8IGZvbnQudykgKyAocHJldi5rICYmIHByZXYua1tsZXR0ZXJzW2ldXSB8fCAwKSArIChmb250LncgKiBsZXR0ZXJfc3BhY2luZykgOiAwO1xuICAgICAgICAgICAgICAgICAgICBub3RmaXJzdCA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjdXJyICYmIGN1cnIuZCkge1xuICAgICAgICAgICAgICAgICAgICBwYXRoICs9IFIudHJhbnNmb3JtUGF0aChjdXJyLmQsIFtcInRcIiwgc2hpZnQgKiBzY2FsZSwgc2hpZnR5ICogc2NhbGUsIFwic1wiLCBzY2FsZSwgc2NhbGUsIHRvcCwgaGVpZ2h0LCBcInRcIiwgKHggLSB0b3ApIC8gc2NhbGUsICh5IC0gaGVpZ2h0KSAvIHNjYWxlXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBhdGgocGF0aCkuYXR0cih7XG4gICAgICAgICAgICBmaWxsOiBcIiMwMDBcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCJub25lXCJcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qXFxcbiAgICAgKiBQYXBlci5hZGRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEltcG9ydHMgZWxlbWVudHMgaW4gSlNPTiBhcnJheSBpbiBmb3JtYXQgYHt0eXBlOiB0eXBlLCA8YXR0cmlidXRlcz59YFxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBqc29uIChhcnJheSlcbiAgICAgPSAob2JqZWN0KSByZXN1bHRpbmcgc2V0IG9mIGltcG9ydGVkIGVsZW1lbnRzXG4gICAgID4gVXNhZ2VcbiAgICAgfCBwYXBlci5hZGQoW1xuICAgICB8ICAgICB7XG4gICAgIHwgICAgICAgICB0eXBlOiBcImNpcmNsZVwiLFxuICAgICB8ICAgICAgICAgY3g6IDEwLFxuICAgICB8ICAgICAgICAgY3k6IDEwLFxuICAgICB8ICAgICAgICAgcjogNVxuICAgICB8ICAgICB9LFxuICAgICB8ICAgICB7XG4gICAgIHwgICAgICAgICB0eXBlOiBcInJlY3RcIixcbiAgICAgfCAgICAgICAgIHg6IDEwLFxuICAgICB8ICAgICAgICAgeTogMTAsXG4gICAgIHwgICAgICAgICB3aWR0aDogMTAsXG4gICAgIHwgICAgICAgICBoZWlnaHQ6IDEwLFxuICAgICB8ICAgICAgICAgZmlsbDogXCIjZmMwXCJcbiAgICAgfCAgICAgfVxuICAgICB8IF0pO1xuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLmFkZCA9IGZ1bmN0aW9uIChqc29uKSB7XG4gICAgICAgIGlmIChSLmlzKGpzb24sIFwiYXJyYXlcIikpIHtcbiAgICAgICAgICAgIHZhciByZXMgPSB0aGlzLnNldCgpLFxuICAgICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICAgIGlpID0ganNvbi5sZW5ndGgsXG4gICAgICAgICAgICAgICAgajtcbiAgICAgICAgICAgIGZvciAoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIGogPSBqc29uW2ldIHx8IHt9O1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzW2hhc10oai50eXBlKSAmJiByZXMucHVzaCh0aGlzW2oudHlwZV0oKS5hdHRyKGopKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH07XG5cbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5mb3JtYXRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFNpbXBsZSBmb3JtYXQgZnVuY3Rpb24uIFJlcGxhY2VzIGNvbnN0cnVjdGlvbiBvZiB0eXBlIOKAnGB7PG51bWJlcj59YOKAnSB0byB0aGUgY29ycmVzcG9uZGluZyBhcmd1bWVudC5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gdG9rZW4gKHN0cmluZykgc3RyaW5nIHRvIGZvcm1hdFxuICAgICAtIOKApiAoc3RyaW5nKSByZXN0IG9mIGFyZ3VtZW50cyB3aWxsIGJlIHRyZWF0ZWQgYXMgcGFyYW1ldGVycyBmb3IgcmVwbGFjZW1lbnRcbiAgICAgPSAoc3RyaW5nKSBmb3JtYXRlZCBzdHJpbmdcbiAgICAgPiBVc2FnZVxuICAgICB8IHZhciB4ID0gMTAsXG4gICAgIHwgICAgIHkgPSAyMCxcbiAgICAgfCAgICAgd2lkdGggPSA0MCxcbiAgICAgfCAgICAgaGVpZ2h0ID0gNTA7XG4gICAgIHwgLy8gdGhpcyB3aWxsIGRyYXcgYSByZWN0YW5ndWxhciBzaGFwZSBlcXVpdmFsZW50IHRvIFwiTTEwLDIwaDQwdjUwaC00MHpcIlxuICAgICB8IHBhcGVyLnBhdGgoUmFwaGFlbC5mb3JtYXQoXCJNezB9LHsxfWh7Mn12ezN9aHs0fXpcIiwgeCwgeSwgd2lkdGgsIGhlaWdodCwgLXdpZHRoKSk7XG4gICAgXFwqL1xuICAgIFIuZm9ybWF0ID0gZnVuY3Rpb24gKHRva2VuLCBwYXJhbXMpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBSLmlzKHBhcmFtcywgYXJyYXkpID8gWzBdW2NvbmNhdF0ocGFyYW1zKSA6IGFyZ3VtZW50cztcbiAgICAgICAgdG9rZW4gJiYgUi5pcyh0b2tlbiwgc3RyaW5nKSAmJiBhcmdzLmxlbmd0aCAtIDEgJiYgKHRva2VuID0gdG9rZW4ucmVwbGFjZShmb3JtYXRyZywgZnVuY3Rpb24gKHN0ciwgaSkge1xuICAgICAgICAgICAgcmV0dXJuIGFyZ3NbKytpXSA9PSBudWxsID8gRSA6IGFyZ3NbaV07XG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIHRva2VuIHx8IEU7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5mdWxsZmlsbFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQSBsaXR0bGUgYml0IG1vcmUgYWR2YW5jZWQgZm9ybWF0IGZ1bmN0aW9uIHRoYW4gQFJhcGhhZWwuZm9ybWF0LiBSZXBsYWNlcyBjb25zdHJ1Y3Rpb24gb2YgdHlwZSDigJxgezxuYW1lPn1g4oCdIHRvIHRoZSBjb3JyZXNwb25kaW5nIGFyZ3VtZW50LlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSB0b2tlbiAoc3RyaW5nKSBzdHJpbmcgdG8gZm9ybWF0XG4gICAgIC0ganNvbiAob2JqZWN0KSBvYmplY3Qgd2hpY2ggcHJvcGVydGllcyB3aWxsIGJlIHVzZWQgYXMgYSByZXBsYWNlbWVudFxuICAgICA9IChzdHJpbmcpIGZvcm1hdGVkIHN0cmluZ1xuICAgICA+IFVzYWdlXG4gICAgIHwgLy8gdGhpcyB3aWxsIGRyYXcgYSByZWN0YW5ndWxhciBzaGFwZSBlcXVpdmFsZW50IHRvIFwiTTEwLDIwaDQwdjUwaC00MHpcIlxuICAgICB8IHBhcGVyLnBhdGgoUmFwaGFlbC5mdWxsZmlsbChcIk17eH0se3l9aHtkaW0ud2lkdGh9dntkaW0uaGVpZ2h0fWh7ZGltWyduZWdhdGl2ZSB3aWR0aCddfXpcIiwge1xuICAgICB8ICAgICB4OiAxMCxcbiAgICAgfCAgICAgeTogMjAsXG4gICAgIHwgICAgIGRpbToge1xuICAgICB8ICAgICAgICAgd2lkdGg6IDQwLFxuICAgICB8ICAgICAgICAgaGVpZ2h0OiA1MCxcbiAgICAgfCAgICAgICAgIFwibmVnYXRpdmUgd2lkdGhcIjogLTQwXG4gICAgIHwgICAgIH1cbiAgICAgfCB9KSk7XG4gICAgXFwqL1xuICAgIFIuZnVsbGZpbGwgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdG9rZW5SZWdleCA9IC9cXHsoW15cXH1dKylcXH0vZyxcbiAgICAgICAgICAgIG9iak5vdGF0aW9uUmVnZXggPSAvKD86KD86XnxcXC4pKC4rPykoPz1cXFt8XFwufCR8XFwoKXxcXFsoJ3xcIikoLis/KVxcMlxcXSkoXFwoXFwpKT8vZywgLy8gbWF0Y2hlcyAueHh4eHggb3IgW1wieHh4eHhcIl0gdG8gcnVuIG92ZXIgb2JqZWN0IHByb3BlcnRpZXNcbiAgICAgICAgICAgIHJlcGxhY2VyID0gZnVuY3Rpb24gKGFsbCwga2V5LCBvYmopIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzID0gb2JqO1xuICAgICAgICAgICAgICAgIGtleS5yZXBsYWNlKG9iak5vdGF0aW9uUmVnZXgsIGZ1bmN0aW9uIChhbGwsIG5hbWUsIHF1b3RlLCBxdW90ZWROYW1lLCBpc0Z1bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUgfHwgcXVvdGVkTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUgaW4gcmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gcmVzW25hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHJlcyA9PSBcImZ1bmN0aW9uXCIgJiYgaXNGdW5jICYmIChyZXMgPSByZXMoKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXMgPSAocmVzID09IG51bGwgfHwgcmVzID09IG9iaiA/IGFsbCA6IHJlcykgKyBcIlwiO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9O1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHN0ciwgb2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nKHN0cikucmVwbGFjZSh0b2tlblJlZ2V4LCBmdW5jdGlvbiAoYWxsLCBrZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVwbGFjZXIoYWxsLCBrZXksIG9iaik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9KSgpO1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLm5pbmphXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBJZiB5b3Ugd2FudCB0byBsZWF2ZSBubyB0cmFjZSBvZiBSYXBoYcOrbCAoV2VsbCwgUmFwaGHDq2wgY3JlYXRlcyBvbmx5IG9uZSBnbG9iYWwgdmFyaWFibGUgYFJhcGhhZWxgLCBidXQgYW55d2F5LikgWW91IGNhbiB1c2UgYG5pbmphYCBtZXRob2QuXG4gICAgICogQmV3YXJlLCB0aGF0IGluIHRoaXMgY2FzZSBwbHVnaW5zIGNvdWxkIHN0b3Agd29ya2luZywgYmVjYXVzZSB0aGV5IGFyZSBkZXBlbmRpbmcgb24gZ2xvYmFsIHZhcmlhYmxlIGV4aXN0YW5jZS5cbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBSYXBoYWVsIG9iamVjdFxuICAgICA+IFVzYWdlXG4gICAgIHwgKGZ1bmN0aW9uIChsb2NhbF9yYXBoYWVsKSB7XG4gICAgIHwgICAgIHZhciBwYXBlciA9IGxvY2FsX3JhcGhhZWwoMTAsIDEwLCAzMjAsIDIwMCk7XG4gICAgIHwgICAgIOKAplxuICAgICB8IH0pKFJhcGhhZWwubmluamEoKSk7XG4gICAgXFwqL1xuICAgIFIubmluamEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG9sZFJhcGhhZWwud2FzID8gKGcud2luLlJhcGhhZWwgPSBvbGRSYXBoYWVsLmlzKSA6IGRlbGV0ZSBSYXBoYWVsO1xuICAgICAgICByZXR1cm4gUjtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnN0XG4gICAgIFsgcHJvcGVydHkgKG9iamVjdCkgXVxuICAgICAqKlxuICAgICAqIFlvdSBjYW4gYWRkIHlvdXIgb3duIG1ldGhvZCB0byBlbGVtZW50cyBhbmQgc2V0cy4gSXQgaXMgd2lzZSB0byBhZGQgYSBzZXQgbWV0aG9kIGZvciBlYWNoIGVsZW1lbnQgbWV0aG9kXG4gICAgICogeW91IGFkZGVkLCBzbyB5b3Ugd2lsbCBiZSBhYmxlIHRvIGNhbGwgdGhlIHNhbWUgbWV0aG9kIG9uIHNldHMgdG9vLlxuICAgICAqKlxuICAgICAqIFNlZSBhbHNvIEBSYXBoYWVsLmVsLlxuICAgICA+IFVzYWdlXG4gICAgIHwgUmFwaGFlbC5lbC5yZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgIHwgICAgIHRoaXMuYXR0cih7ZmlsbDogXCIjZjAwXCJ9KTtcbiAgICAgfCB9O1xuICAgICB8IFJhcGhhZWwuc3QucmVkID0gZnVuY3Rpb24gKCkge1xuICAgICB8ICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgIHwgICAgICAgICBlbC5yZWQoKTtcbiAgICAgfCAgICAgfSk7XG4gICAgIHwgfTtcbiAgICAgfCAvLyB0aGVuIHVzZSBpdFxuICAgICB8IHBhcGVyLnNldChwYXBlci5jaXJjbGUoMTAwLCAxMDAsIDIwKSwgcGFwZXIuY2lyY2xlKDExMCwgMTAwLCAyMCkpLnJlZCgpO1xuICAgIFxcKi9cbiAgICBSLnN0ID0gc2V0cHJvdG87XG4gICAgLy8gRmlyZWZveCA8My42IGZpeDogaHR0cDovL3dlYnJlZmxlY3Rpb24uYmxvZ3Nwb3QuY29tLzIwMDkvMTEvMTk1LWNoYXJzLXRvLWhlbHAtbGF6eS1sb2FkaW5nLmh0bWxcbiAgICAoZnVuY3Rpb24gKGRvYywgbG9hZGVkLCBmKSB7XG4gICAgICAgIGlmIChkb2MucmVhZHlTdGF0ZSA9PSBudWxsICYmIGRvYy5hZGRFdmVudExpc3RlbmVyKXtcbiAgICAgICAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKGxvYWRlZCwgZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcihsb2FkZWQsIGYsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBkb2MucmVhZHlTdGF0ZSA9IFwiY29tcGxldGVcIjtcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgICAgIGRvYy5yZWFkeVN0YXRlID0gXCJsb2FkaW5nXCI7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gaXNMb2FkZWQoKSB7XG4gICAgICAgICAgICAoL2luLykudGVzdChkb2MucmVhZHlTdGF0ZSkgPyBzZXRUaW1lb3V0KGlzTG9hZGVkLCA5KSA6IFIuZXZlKFwicmFwaGFlbC5ET01sb2FkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlzTG9hZGVkKCk7XG4gICAgfSkoZG9jdW1lbnQsIFwiRE9NQ29udGVudExvYWRlZFwiKTtcblxuICAgIG9sZFJhcGhhZWwud2FzID8gKGcud2luLlJhcGhhZWwgPSBSKSA6IChSYXBoYWVsID0gUik7XG4gICAgXG4gICAgZXZlLm9uKFwicmFwaGFlbC5ET01sb2FkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHJlcXVpcmUoJy4vcmFwaGFlbC5zdmcnKTtcbiAgICByZXF1aXJlKCcuL3JhcGhhZWwudm1sJyk7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IFJhcGhhZWw7XG59KSgpO1xuIiwiLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQIFxcXFxcbi8vIOKUgiBSYXBoYcOrbCAtIEphdmFTY3JpcHQgVmVjdG9yIExpYnJhcnkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgXFxcXFxuLy8g4pSc4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkIFxcXFxcbi8vIOKUgiBTVkcgTW9kdWxlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiBcXFxcXG4vLyDilJzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilKQgXFxcXFxuLy8g4pSCIENvcHlyaWdodCAoYykgMjAwOC0yMDExIERtaXRyeSBCYXJhbm92c2tpeSAoaHR0cDovL3JhcGhhZWxqcy5jb20pICAg4pSCIFxcXFxcbi8vIOKUgiBDb3B5cmlnaHQgKGMpIDIwMDgtMjAxMSBTZW5jaGEgTGFicyAoaHR0cDovL3NlbmNoYS5jb20pICAgICAgICAgICAgIOKUgiBcXFxcXG4vLyDilIIgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCAoaHR0cDovL3JhcGhhZWxqcy5jb20vbGljZW5zZS5odG1sKSBsaWNlbnNlLiDilIIgXFxcXFxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYIFxcXFxcbndpbmRvdy5SYXBoYWVsICYmIHdpbmRvdy5SYXBoYWVsLnN2ZyAmJiBmdW5jdGlvbiAoUikge1xuICAgIHZhciBoYXMgPSBcImhhc093blByb3BlcnR5XCIsXG4gICAgICAgIFN0ciA9IFN0cmluZyxcbiAgICAgICAgdG9GbG9hdCA9IHBhcnNlRmxvYXQsXG4gICAgICAgIHRvSW50ID0gcGFyc2VJbnQsXG4gICAgICAgIG1hdGggPSBNYXRoLFxuICAgICAgICBtbWF4ID0gbWF0aC5tYXgsXG4gICAgICAgIGFicyA9IG1hdGguYWJzLFxuICAgICAgICBwb3cgPSBtYXRoLnBvdyxcbiAgICAgICAgc2VwYXJhdG9yID0gL1ssIF0rLyxcbiAgICAgICAgZXZlID0gUi5ldmUsXG4gICAgICAgIEUgPSBcIlwiLFxuICAgICAgICBTID0gXCIgXCI7XG4gICAgdmFyIHhsaW5rID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIsXG4gICAgICAgIG1hcmtlcnMgPSB7XG4gICAgICAgICAgICBibG9jazogXCJNNSwwIDAsMi41IDUsNXpcIixcbiAgICAgICAgICAgIGNsYXNzaWM6IFwiTTUsMCAwLDIuNSA1LDUgMy41LDMgMy41LDJ6XCIsXG4gICAgICAgICAgICBkaWFtb25kOiBcIk0yLjUsMCA1LDIuNSAyLjUsNSAwLDIuNXpcIixcbiAgICAgICAgICAgIG9wZW46IFwiTTYsMSAxLDMuNSA2LDZcIixcbiAgICAgICAgICAgIG92YWw6IFwiTTIuNSwwQTIuNSwyLjUsMCwwLDEsMi41LDUgMi41LDIuNSwwLDAsMSwyLjUsMHpcIlxuICAgICAgICB9LFxuICAgICAgICBtYXJrZXJDb3VudGVyID0ge307XG4gICAgUi50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICBcIllvdXIgYnJvd3NlciBzdXBwb3J0cyBTVkcuXFxuWW91IGFyZSBydW5uaW5nIFJhcGhhXFx4ZWJsIFwiICsgdGhpcy52ZXJzaW9uO1xuICAgIH07XG4gICAgdmFyICQgPSBmdW5jdGlvbiAoZWwsIGF0dHIpIHtcbiAgICAgICAgaWYgKGF0dHIpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZWwgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGVsID0gJChlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gYXR0cikgaWYgKGF0dHJbaGFzXShrZXkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleS5zdWJzdHJpbmcoMCwgNikgPT0gXCJ4bGluazpcIikge1xuICAgICAgICAgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGVOUyh4bGluaywga2V5LnN1YnN0cmluZyg2KSwgU3RyKGF0dHJba2V5XSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShrZXksIFN0cihhdHRyW2tleV0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbCA9IFIuX2cuZG9jLmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIGVsKTtcbiAgICAgICAgICAgIGVsLnN0eWxlICYmIChlbC5zdHlsZS53ZWJraXRUYXBIaWdobGlnaHRDb2xvciA9IFwicmdiYSgwLDAsMCwwKVwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcbiAgICBhZGRHcmFkaWVudEZpbGwgPSBmdW5jdGlvbiAoZWxlbWVudCwgZ3JhZGllbnQpIHtcbiAgICAgICAgdmFyIHR5cGUgPSBcImxpbmVhclwiLFxuICAgICAgICAgICAgaWQgPSBlbGVtZW50LmlkICsgZ3JhZGllbnQsXG4gICAgICAgICAgICBmeCA9IC41LCBmeSA9IC41LFxuICAgICAgICAgICAgbyA9IGVsZW1lbnQubm9kZSxcbiAgICAgICAgICAgIFNWRyA9IGVsZW1lbnQucGFwZXIsXG4gICAgICAgICAgICBzID0gby5zdHlsZSxcbiAgICAgICAgICAgIGVsID0gUi5fZy5kb2MuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgICAgICBpZiAoIWVsKSB7XG4gICAgICAgICAgICBncmFkaWVudCA9IFN0cihncmFkaWVudCkucmVwbGFjZShSLl9yYWRpYWxfZ3JhZGllbnQsIGZ1bmN0aW9uIChhbGwsIF9meCwgX2Z5KSB7XG4gICAgICAgICAgICAgICAgdHlwZSA9IFwicmFkaWFsXCI7XG4gICAgICAgICAgICAgICAgaWYgKF9meCAmJiBfZnkpIHtcbiAgICAgICAgICAgICAgICAgICAgZnggPSB0b0Zsb2F0KF9meCk7XG4gICAgICAgICAgICAgICAgICAgIGZ5ID0gdG9GbG9hdChfZnkpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGlyID0gKChmeSA+IC41KSAqIDIgLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgcG93KGZ4IC0gLjUsIDIpICsgcG93KGZ5IC0gLjUsIDIpID4gLjI1ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAoZnkgPSBtYXRoLnNxcnQoLjI1IC0gcG93KGZ4IC0gLjUsIDIpKSAqIGRpciArIC41KSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZnkgIT0gLjUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIChmeSA9IGZ5LnRvRml4ZWQoNSkgLSAxZS01ICogZGlyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIEU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGdyYWRpZW50ID0gZ3JhZGllbnQuc3BsaXQoL1xccypcXC1cXHMqLyk7XG4gICAgICAgICAgICBpZiAodHlwZSA9PSBcImxpbmVhclwiKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFuZ2xlID0gZ3JhZGllbnQuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICBhbmdsZSA9IC10b0Zsb2F0KGFuZ2xlKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNOYU4oYW5nbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgdmVjdG9yID0gWzAsIDAsIG1hdGguY29zKFIucmFkKGFuZ2xlKSksIG1hdGguc2luKFIucmFkKGFuZ2xlKSldLFxuICAgICAgICAgICAgICAgICAgICBtYXggPSAxIC8gKG1tYXgoYWJzKHZlY3RvclsyXSksIGFicyh2ZWN0b3JbM10pKSB8fCAxKTtcbiAgICAgICAgICAgICAgICB2ZWN0b3JbMl0gKj0gbWF4O1xuICAgICAgICAgICAgICAgIHZlY3RvclszXSAqPSBtYXg7XG4gICAgICAgICAgICAgICAgaWYgKHZlY3RvclsyXSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmVjdG9yWzBdID0gLXZlY3RvclsyXTtcbiAgICAgICAgICAgICAgICAgICAgdmVjdG9yWzJdID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHZlY3RvclszXSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmVjdG9yWzFdID0gLXZlY3RvclszXTtcbiAgICAgICAgICAgICAgICAgICAgdmVjdG9yWzNdID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZG90cyA9IFIuX3BhcnNlRG90cyhncmFkaWVudCk7XG4gICAgICAgICAgICBpZiAoIWRvdHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlkID0gaWQucmVwbGFjZSgvW1xcKFxcKVxccyxcXHhiMCNdL2csIFwiX1wiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuZ3JhZGllbnQgJiYgaWQgIT0gZWxlbWVudC5ncmFkaWVudC5pZCkge1xuICAgICAgICAgICAgICAgIFNWRy5kZWZzLnJlbW92ZUNoaWxkKGVsZW1lbnQuZ3JhZGllbnQpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBlbGVtZW50LmdyYWRpZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWVsZW1lbnQuZ3JhZGllbnQpIHtcbiAgICAgICAgICAgICAgICBlbCA9ICQodHlwZSArIFwiR3JhZGllbnRcIiwge2lkOiBpZH0pO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuZ3JhZGllbnQgPSBlbDtcbiAgICAgICAgICAgICAgICAkKGVsLCB0eXBlID09IFwicmFkaWFsXCIgPyB7XG4gICAgICAgICAgICAgICAgICAgIGZ4OiBmeCxcbiAgICAgICAgICAgICAgICAgICAgZnk6IGZ5XG4gICAgICAgICAgICAgICAgfSA6IHtcbiAgICAgICAgICAgICAgICAgICAgeDE6IHZlY3RvclswXSxcbiAgICAgICAgICAgICAgICAgICAgeTE6IHZlY3RvclsxXSxcbiAgICAgICAgICAgICAgICAgICAgeDI6IHZlY3RvclsyXSxcbiAgICAgICAgICAgICAgICAgICAgeTI6IHZlY3RvclszXSxcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnRUcmFuc2Zvcm06IGVsZW1lbnQubWF0cml4LmludmVydCgpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgU1ZHLmRlZnMuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGRvdHMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBlbC5hcHBlbmRDaGlsZCgkKFwic3RvcFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IGRvdHNbaV0ub2Zmc2V0ID8gZG90c1tpXS5vZmZzZXQgOiBpID8gXCIxMDAlXCIgOiBcIjAlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0b3AtY29sb3JcIjogZG90c1tpXS5jb2xvciB8fCBcIiNmZmZcIlxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgICQobywge1xuICAgICAgICAgICAgZmlsbDogXCJ1cmwoI1wiICsgaWQgKyBcIilcIixcbiAgICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgICBcImZpbGwtb3BhY2l0eVwiOiAxXG4gICAgICAgIH0pO1xuICAgICAgICBzLmZpbGwgPSBFO1xuICAgICAgICBzLm9wYWNpdHkgPSAxO1xuICAgICAgICBzLmZpbGxPcGFjaXR5ID0gMTtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgfSxcbiAgICB1cGRhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uIChvKSB7XG4gICAgICAgIHZhciBiYm94ID0gby5nZXRCQm94KDEpO1xuICAgICAgICAkKG8ucGF0dGVybiwge3BhdHRlcm5UcmFuc2Zvcm06IG8ubWF0cml4LmludmVydCgpICsgXCIgdHJhbnNsYXRlKFwiICsgYmJveC54ICsgXCIsXCIgKyBiYm94LnkgKyBcIilcIn0pO1xuICAgIH0sXG4gICAgYWRkQXJyb3cgPSBmdW5jdGlvbiAobywgdmFsdWUsIGlzRW5kKSB7XG4gICAgICAgIGlmIChvLnR5cGUgPT0gXCJwYXRoXCIpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBTdHIodmFsdWUpLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCItXCIpLFxuICAgICAgICAgICAgICAgIHAgPSBvLnBhcGVyLFxuICAgICAgICAgICAgICAgIHNlID0gaXNFbmQgPyBcImVuZFwiIDogXCJzdGFydFwiLFxuICAgICAgICAgICAgICAgIG5vZGUgPSBvLm5vZGUsXG4gICAgICAgICAgICAgICAgYXR0cnMgPSBvLmF0dHJzLFxuICAgICAgICAgICAgICAgIHN0cm9rZSA9IGF0dHJzW1wic3Ryb2tlLXdpZHRoXCJdLFxuICAgICAgICAgICAgICAgIGkgPSB2YWx1ZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHR5cGUgPSBcImNsYXNzaWNcIixcbiAgICAgICAgICAgICAgICBmcm9tLFxuICAgICAgICAgICAgICAgIHRvLFxuICAgICAgICAgICAgICAgIGR4LFxuICAgICAgICAgICAgICAgIHJlZlgsXG4gICAgICAgICAgICAgICAgYXR0cixcbiAgICAgICAgICAgICAgICB3ID0gMyxcbiAgICAgICAgICAgICAgICBoID0gMyxcbiAgICAgICAgICAgICAgICB0ID0gNTtcbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHZhbHVlc1tpXSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiYmxvY2tcIjpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImNsYXNzaWNcIjpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm92YWxcIjpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImRpYW1vbmRcIjpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm9wZW5cIjpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm5vbmVcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPSB2YWx1ZXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIndpZGVcIjogaCA9IDU7IGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwibmFycm93XCI6IGggPSAyOyBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImxvbmdcIjogdyA9IDU7IGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwic2hvcnRcIjogdyA9IDI7IGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlID09IFwib3BlblwiKSB7XG4gICAgICAgICAgICAgICAgdyArPSAyO1xuICAgICAgICAgICAgICAgIGggKz0gMjtcbiAgICAgICAgICAgICAgICB0ICs9IDI7XG4gICAgICAgICAgICAgICAgZHggPSAxO1xuICAgICAgICAgICAgICAgIHJlZlggPSBpc0VuZCA/IDQgOiAxO1xuICAgICAgICAgICAgICAgIGF0dHIgPSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IFwibm9uZVwiLFxuICAgICAgICAgICAgICAgICAgICBzdHJva2U6IGF0dHJzLnN0cm9rZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlZlggPSBkeCA9IHcgLyAyO1xuICAgICAgICAgICAgICAgIGF0dHIgPSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IGF0dHJzLnN0cm9rZSxcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlOiBcIm5vbmVcIlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoby5fLmFycm93cykge1xuICAgICAgICAgICAgICAgIGlmIChpc0VuZCkge1xuICAgICAgICAgICAgICAgICAgICBvLl8uYXJyb3dzLmVuZFBhdGggJiYgbWFya2VyQ291bnRlcltvLl8uYXJyb3dzLmVuZFBhdGhdLS07XG4gICAgICAgICAgICAgICAgICAgIG8uXy5hcnJvd3MuZW5kTWFya2VyICYmIG1hcmtlckNvdW50ZXJbby5fLmFycm93cy5lbmRNYXJrZXJdLS07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgby5fLmFycm93cy5zdGFydFBhdGggJiYgbWFya2VyQ291bnRlcltvLl8uYXJyb3dzLnN0YXJ0UGF0aF0tLTtcbiAgICAgICAgICAgICAgICAgICAgby5fLmFycm93cy5zdGFydE1hcmtlciAmJiBtYXJrZXJDb3VudGVyW28uXy5hcnJvd3Muc3RhcnRNYXJrZXJdLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvLl8uYXJyb3dzID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZSAhPSBcIm5vbmVcIikge1xuICAgICAgICAgICAgICAgIHZhciBwYXRoSWQgPSBcInJhcGhhZWwtbWFya2VyLVwiICsgdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbWFya2VySWQgPSBcInJhcGhhZWwtbWFya2VyLVwiICsgc2UgKyB0eXBlICsgdyArIGg7XG4gICAgICAgICAgICAgICAgaWYgKCFSLl9nLmRvYy5nZXRFbGVtZW50QnlJZChwYXRoSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHAuZGVmcy5hcHBlbmRDaGlsZCgkKCQoXCJwYXRoXCIpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZS1saW5lY2FwXCI6IFwicm91bmRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGQ6IG1hcmtlcnNbdHlwZV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogcGF0aElkXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyQ291bnRlcltwYXRoSWRdID0gMTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXJDb3VudGVyW3BhdGhJZF0rKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IFIuX2cuZG9jLmdldEVsZW1lbnRCeUlkKG1hcmtlcklkKSxcbiAgICAgICAgICAgICAgICAgICAgdXNlO1xuICAgICAgICAgICAgICAgIGlmICghbWFya2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlciA9ICQoJChcIm1hcmtlclwiKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IG1hcmtlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VySGVpZ2h0OiBoLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyV2lkdGg6IHcsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmllbnQ6IFwiYXV0b1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmWDogcmVmWCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZlk6IGggLyAyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB1c2UgPSAkKCQoXCJ1c2VcIiksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwieGxpbms6aHJlZlwiOiBcIiNcIiArIHBhdGhJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogKGlzRW5kID8gXCJyb3RhdGUoMTgwIFwiICsgdyAvIDIgKyBcIiBcIiArIGggLyAyICsgXCIpIFwiIDogRSkgKyBcInNjYWxlKFwiICsgdyAvIHQgKyBcIixcIiArIGggLyB0ICsgXCIpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZS13aWR0aFwiOiAoMSAvICgodyAvIHQgKyBoIC8gdCkgLyAyKSkudG9GaXhlZCg0KVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyLmFwcGVuZENoaWxkKHVzZSk7XG4gICAgICAgICAgICAgICAgICAgIHAuZGVmcy5hcHBlbmRDaGlsZChtYXJrZXIpO1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXJDb3VudGVyW21hcmtlcklkXSA9IDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyQ291bnRlclttYXJrZXJJZF0rKztcbiAgICAgICAgICAgICAgICAgICAgdXNlID0gbWFya2VyLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidXNlXCIpWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkKHVzZSwgYXR0cik7XG4gICAgICAgICAgICAgICAgdmFyIGRlbHRhID0gZHggKiAodHlwZSAhPSBcImRpYW1vbmRcIiAmJiB0eXBlICE9IFwib3ZhbFwiKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbSA9IG8uXy5hcnJvd3Muc3RhcnRkeCAqIHN0cm9rZSB8fCAwO1xuICAgICAgICAgICAgICAgICAgICB0byA9IFIuZ2V0VG90YWxMZW5ndGgoYXR0cnMucGF0aCkgLSBkZWx0YSAqIHN0cm9rZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmcm9tID0gZGVsdGEgKiBzdHJva2U7XG4gICAgICAgICAgICAgICAgICAgIHRvID0gUi5nZXRUb3RhbExlbmd0aChhdHRycy5wYXRoKSAtIChvLl8uYXJyb3dzLmVuZGR4ICogc3Ryb2tlIHx8IDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhdHRyID0ge307XG4gICAgICAgICAgICAgICAgYXR0cltcIm1hcmtlci1cIiArIHNlXSA9IFwidXJsKCNcIiArIG1hcmtlcklkICsgXCIpXCI7XG4gICAgICAgICAgICAgICAgaWYgKHRvIHx8IGZyb20pIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0ci5kID0gUmFwaGFlbC5nZXRTdWJwYXRoKGF0dHJzLnBhdGgsIGZyb20sIHRvKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJChub2RlLCBhdHRyKTtcbiAgICAgICAgICAgICAgICBvLl8uYXJyb3dzW3NlICsgXCJQYXRoXCJdID0gcGF0aElkO1xuICAgICAgICAgICAgICAgIG8uXy5hcnJvd3Nbc2UgKyBcIk1hcmtlclwiXSA9IG1hcmtlcklkO1xuICAgICAgICAgICAgICAgIG8uXy5hcnJvd3Nbc2UgKyBcImR4XCJdID0gZGVsdGE7XG4gICAgICAgICAgICAgICAgby5fLmFycm93c1tzZSArIFwiVHlwZVwiXSA9IHR5cGU7XG4gICAgICAgICAgICAgICAgby5fLmFycm93c1tzZSArIFwiU3RyaW5nXCJdID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChpc0VuZCkge1xuICAgICAgICAgICAgICAgICAgICBmcm9tID0gby5fLmFycm93cy5zdGFydGR4ICogc3Ryb2tlIHx8IDA7XG4gICAgICAgICAgICAgICAgICAgIHRvID0gUi5nZXRUb3RhbExlbmd0aChhdHRycy5wYXRoKSAtIGZyb207XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRvID0gUi5nZXRUb3RhbExlbmd0aChhdHRycy5wYXRoKSAtIChvLl8uYXJyb3dzLmVuZGR4ICogc3Ryb2tlIHx8IDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvLl8uYXJyb3dzW3NlICsgXCJQYXRoXCJdICYmICQobm9kZSwge2Q6IFJhcGhhZWwuZ2V0U3VicGF0aChhdHRycy5wYXRoLCBmcm9tLCB0byl9KTtcbiAgICAgICAgICAgICAgICBkZWxldGUgby5fLmFycm93c1tzZSArIFwiUGF0aFwiXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgby5fLmFycm93c1tzZSArIFwiTWFya2VyXCJdO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBvLl8uYXJyb3dzW3NlICsgXCJkeFwiXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgby5fLmFycm93c1tzZSArIFwiVHlwZVwiXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgby5fLmFycm93c1tzZSArIFwiU3RyaW5nXCJdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChhdHRyIGluIG1hcmtlckNvdW50ZXIpIGlmIChtYXJrZXJDb3VudGVyW2hhc10oYXR0cikgJiYgIW1hcmtlckNvdW50ZXJbYXR0cl0pIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IFIuX2cuZG9jLmdldEVsZW1lbnRCeUlkKGF0dHIpO1xuICAgICAgICAgICAgICAgIGl0ZW0gJiYgaXRlbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBkYXNoYXJyYXkgPSB7XG4gICAgICAgIFwiXCI6IFswXSxcbiAgICAgICAgXCJub25lXCI6IFswXSxcbiAgICAgICAgXCItXCI6IFszLCAxXSxcbiAgICAgICAgXCIuXCI6IFsxLCAxXSxcbiAgICAgICAgXCItLlwiOiBbMywgMSwgMSwgMV0sXG4gICAgICAgIFwiLS4uXCI6IFszLCAxLCAxLCAxLCAxLCAxXSxcbiAgICAgICAgXCIuIFwiOiBbMSwgM10sXG4gICAgICAgIFwiLSBcIjogWzQsIDNdLFxuICAgICAgICBcIi0tXCI6IFs4LCAzXSxcbiAgICAgICAgXCItIC5cIjogWzQsIDMsIDEsIDNdLFxuICAgICAgICBcIi0tLlwiOiBbOCwgMywgMSwgM10sXG4gICAgICAgIFwiLS0uLlwiOiBbOCwgMywgMSwgMywgMSwgM11cbiAgICB9LFxuICAgIGFkZERhc2hlcyA9IGZ1bmN0aW9uIChvLCB2YWx1ZSwgcGFyYW1zKSB7XG4gICAgICAgIHZhbHVlID0gZGFzaGFycmF5W1N0cih2YWx1ZSkudG9Mb3dlckNhc2UoKV07XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHdpZHRoID0gby5hdHRyc1tcInN0cm9rZS13aWR0aFwiXSB8fCBcIjFcIixcbiAgICAgICAgICAgICAgICBidXR0ID0ge3JvdW5kOiB3aWR0aCwgc3F1YXJlOiB3aWR0aCwgYnV0dDogMH1bby5hdHRyc1tcInN0cm9rZS1saW5lY2FwXCJdIHx8IHBhcmFtc1tcInN0cm9rZS1saW5lY2FwXCJdXSB8fCAwLFxuICAgICAgICAgICAgICAgIGRhc2hlcyA9IFtdLFxuICAgICAgICAgICAgICAgIGkgPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgZGFzaGVzW2ldID0gdmFsdWVbaV0gKiB3aWR0aCArICgoaSAlIDIpID8gMSA6IC0xKSAqIGJ1dHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkKG8ubm9kZSwge1wic3Ryb2tlLWRhc2hhcnJheVwiOiBkYXNoZXMuam9pbihcIixcIil9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc2V0RmlsbEFuZFN0cm9rZSA9IGZ1bmN0aW9uIChvLCBwYXJhbXMpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBvLm5vZGUsXG4gICAgICAgICAgICBhdHRycyA9IG8uYXR0cnMsXG4gICAgICAgICAgICB2aXMgPSBub2RlLnN0eWxlLnZpc2liaWxpdHk7XG4gICAgICAgIG5vZGUuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICAgIGZvciAodmFyIGF0dCBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgIGlmIChwYXJhbXNbaGFzXShhdHQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFSLl9hdmFpbGFibGVBdHRyc1toYXNdKGF0dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHBhcmFtc1thdHRdO1xuICAgICAgICAgICAgICAgIGF0dHJzW2F0dF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGF0dCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiYmx1clwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgby5ibHVyKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiaHJlZlwiOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwidGl0bGVcIjpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInRhcmdldFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBuID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBuLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPSBcImFcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBobCA9ICQoXCJhXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBuLmluc2VydEJlZm9yZShobCwgbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGwuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG4gPSBobDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHQgPT0gXCJ0YXJnZXRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBuLnNldEF0dHJpYnV0ZU5TKHhsaW5rLCBcInNob3dcIiwgdmFsdWUgPT0gXCJibGFua1wiID8gXCJuZXdcIiA6IHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG4uc2V0QXR0cmlidXRlTlMoeGxpbmssIGF0dCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJjdXJzb3JcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc3R5bGUuY3Vyc29yID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInRyYW5zZm9ybVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgby50cmFuc2Zvcm0odmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJhcnJvdy1zdGFydFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkQXJyb3cobywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJhcnJvdy1lbmRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZEFycm93KG8sIHZhbHVlLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiY2xpcC1yZWN0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVjdCA9IFN0cih2YWx1ZSkuc3BsaXQoc2VwYXJhdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWN0Lmxlbmd0aCA9PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgby5jbGlwICYmIG8uY2xpcC5wYXJlbnROb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoby5jbGlwLnBhcmVudE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbCA9ICQoXCJjbGlwUGF0aFwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmMgPSAkKFwicmVjdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5pZCA9IFIuY3JlYXRlVVVJRCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQocmMsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogcmVjdFswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogcmVjdFsxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHJlY3RbMl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogcmVjdFszXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKHJjKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLnBhcGVyLmRlZnMuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQobm9kZSwge1wiY2xpcC1wYXRoXCI6IFwidXJsKCNcIiArIGVsLmlkICsgXCIpXCJ9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmNsaXAgPSByYztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGF0aCA9IG5vZGUuZ2V0QXR0cmlidXRlKFwiY2xpcC1wYXRoXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbGlwID0gUi5fZy5kb2MuZ2V0RWxlbWVudEJ5SWQocGF0aC5yZXBsYWNlKC8oXnVybFxcKCN8XFwpJCkvZywgRSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGlwICYmIGNsaXAucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjbGlwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChub2RlLCB7XCJjbGlwLXBhdGhcIjogRX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgby5jbGlwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwYXRoXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoby50eXBlID09IFwicGF0aFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChub2RlLCB7ZDogdmFsdWUgPyBhdHRycy5wYXRoID0gUi5fcGF0aFRvQWJzb2x1dGUodmFsdWUpIDogXCJNMCwwXCJ9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLl8uZGlydHkgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvLl8uYXJyb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RhcnRTdHJpbmdcIiBpbiBvLl8uYXJyb3dzICYmIGFkZEFycm93KG8sIG8uXy5hcnJvd3Muc3RhcnRTdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImVuZFN0cmluZ1wiIGluIG8uXy5hcnJvd3MgJiYgYWRkQXJyb3cobywgby5fLmFycm93cy5lbmRTdHJpbmcsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwid2lkdGhcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgby5fLmRpcnR5ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy5meCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dCA9IFwieFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gYXR0cnMueDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ4XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuZngpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IC1hdHRycy54IC0gKGF0dHJzLndpZHRoIHx8IDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwicnhcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHQgPT0gXCJyeFwiICYmIG8udHlwZSA9PSBcInJlY3RcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiY3hcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgby5wYXR0ZXJuICYmIHVwZGF0ZVBvc2l0aW9uKG8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgby5fLmRpcnR5ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiaGVpZ2h0XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8uXy5kaXJ0eSA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuZnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHQgPSBcInlcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGF0dHJzLnk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwieVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmZ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAtYXR0cnMueSAtIChhdHRycy5oZWlnaHQgfHwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJyeVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dCA9PSBcInJ5XCIgJiYgby50eXBlID09IFwicmVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJjeVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLnBhdHRlcm4gJiYgdXBkYXRlUG9zaXRpb24obyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLl8uZGlydHkgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJyXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoby50eXBlID09IFwicmVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChub2RlLCB7cng6IHZhbHVlLCByeTogdmFsdWV9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvLl8uZGlydHkgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzcmNcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvLnR5cGUgPT0gXCJpbWFnZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGVOUyh4bGluaywgXCJocmVmXCIsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwic3Ryb2tlLXdpZHRoXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoby5fLnN4ICE9IDEgfHwgby5fLnN5ICE9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSAvPSBtbWF4KGFicyhvLl8uc3gpLCBhYnMoby5fLnN5KSkgfHwgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvLnBhcGVyLl92YlNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSAqPSBvLnBhcGVyLl92YlNpemU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRyc1tcInN0cm9rZS1kYXNoYXJyYXlcIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGREYXNoZXMobywgYXR0cnNbXCJzdHJva2UtZGFzaGFycmF5XCJdLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG8uXy5hcnJvd3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YXJ0U3RyaW5nXCIgaW4gby5fLmFycm93cyAmJiBhZGRBcnJvdyhvLCBvLl8uYXJyb3dzLnN0YXJ0U3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImVuZFN0cmluZ1wiIGluIG8uXy5hcnJvd3MgJiYgYWRkQXJyb3cobywgby5fLmFycm93cy5lbmRTdHJpbmcsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzdHJva2UtZGFzaGFycmF5XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGREYXNoZXMobywgdmFsdWUsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImZpbGxcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpc1VSTCA9IFN0cih2YWx1ZSkubWF0Y2goUi5fSVNVUkwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzVVJMKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwgPSAkKFwicGF0dGVyblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaWcgPSAkKFwiaW1hZ2VcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwuaWQgPSBSLmNyZWF0ZVVVSUQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGVsLCB7eDogMCwgeTogMCwgcGF0dGVyblVuaXRzOiBcInVzZXJTcGFjZU9uVXNlXCIsIGhlaWdodDogMSwgd2lkdGg6IDF9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGlnLCB7eDogMCwgeTogMCwgXCJ4bGluazpocmVmXCI6IGlzVVJMWzFdfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwuYXBwZW5kQ2hpbGQoaWcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSLl9wcmVsb2FkKGlzVVJMWzFdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdyA9IHRoaXMub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCA9IHRoaXMub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChlbCwge3dpZHRoOiB3LCBoZWlnaHQ6IGh9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoaWcsIHt3aWR0aDogdywgaGVpZ2h0OiBofSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLnBhcGVyLnNhZmFyaSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KShlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgby5wYXBlci5kZWZzLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKG5vZGUsIHtmaWxsOiBcInVybCgjXCIgKyBlbC5pZCArIFwiKVwifSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgby5wYXR0ZXJuID0gZWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgby5wYXR0ZXJuICYmIHVwZGF0ZVBvc2l0aW9uKG8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNsciA9IFIuZ2V0UkdCKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2xyLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHBhcmFtcy5ncmFkaWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cnMuZ3JhZGllbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIVIuaXMoYXR0cnMub3BhY2l0eSwgXCJ1bmRlZmluZWRcIikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUi5pcyhwYXJhbXMub3BhY2l0eSwgXCJ1bmRlZmluZWRcIikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChub2RlLCB7b3BhY2l0eTogYXR0cnMub3BhY2l0eX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICFSLmlzKGF0dHJzW1wiZmlsbC1vcGFjaXR5XCJdLCBcInVuZGVmaW5lZFwiKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSLmlzKHBhcmFtc1tcImZpbGwtb3BhY2l0eVwiXSwgXCJ1bmRlZmluZWRcIikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChub2RlLCB7XCJmaWxsLW9wYWNpdHlcIjogYXR0cnNbXCJmaWxsLW9wYWNpdHlcIl19KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoKG8udHlwZSA9PSBcImNpcmNsZVwiIHx8IG8udHlwZSA9PSBcImVsbGlwc2VcIiB8fCBTdHIodmFsdWUpLmNoYXJBdCgpICE9IFwiclwiKSAmJiBhZGRHcmFkaWVudEZpbGwobywgdmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFwib3BhY2l0eVwiIGluIGF0dHJzIHx8IFwiZmlsbC1vcGFjaXR5XCIgaW4gYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGdyYWRpZW50ID0gUi5fZy5kb2MuZ2V0RWxlbWVudEJ5SWQobm9kZS5nZXRBdHRyaWJ1dGUoXCJmaWxsXCIpLnJlcGxhY2UoL151cmxcXCgjfFxcKSQvZywgRSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JhZGllbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdG9wcyA9IGdyYWRpZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic3RvcFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoc3RvcHNbc3RvcHMubGVuZ3RoIC0gMV0sIHtcInN0b3Atb3BhY2l0eVwiOiAoXCJvcGFjaXR5XCIgaW4gYXR0cnMgPyBhdHRycy5vcGFjaXR5IDogMSkgKiAoXCJmaWxsLW9wYWNpdHlcIiBpbiBhdHRycyA/IGF0dHJzW1wiZmlsbC1vcGFjaXR5XCJdIDogMSl9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRycy5ncmFkaWVudCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzLmZpbGwgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNscltoYXNdKFwib3BhY2l0eVwiKSAmJiAkKG5vZGUsIHtcImZpbGwtb3BhY2l0eVwiOiBjbHIub3BhY2l0eSA+IDEgPyBjbHIub3BhY2l0eSAvIDEwMCA6IGNsci5vcGFjaXR5fSk7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJzdHJva2VcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsciA9IFIuZ2V0UkdCKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dCwgY2xyLmhleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdHQgPT0gXCJzdHJva2VcIiAmJiBjbHJbaGFzXShcIm9wYWNpdHlcIikgJiYgJChub2RlLCB7XCJzdHJva2Utb3BhY2l0eVwiOiBjbHIub3BhY2l0eSA+IDEgPyBjbHIub3BhY2l0eSAvIDEwMCA6IGNsci5vcGFjaXR5fSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0ID09IFwic3Ryb2tlXCIgJiYgby5fLmFycm93cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RhcnRTdHJpbmdcIiBpbiBvLl8uYXJyb3dzICYmIGFkZEFycm93KG8sIG8uXy5hcnJvd3Muc3RhcnRTdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZW5kU3RyaW5nXCIgaW4gby5fLmFycm93cyAmJiBhZGRBcnJvdyhvLCBvLl8uYXJyb3dzLmVuZFN0cmluZywgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImdyYWRpZW50XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAoby50eXBlID09IFwiY2lyY2xlXCIgfHwgby50eXBlID09IFwiZWxsaXBzZVwiIHx8IFN0cih2YWx1ZSkuY2hhckF0KCkgIT0gXCJyXCIpICYmIGFkZEdyYWRpZW50RmlsbChvLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm9wYWNpdHlcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy5ncmFkaWVudCAmJiAhYXR0cnNbaGFzXShcInN0cm9rZS1vcGFjaXR5XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChub2RlLCB7XCJzdHJva2Utb3BhY2l0eVwiOiB2YWx1ZSA+IDEgPyB2YWx1ZSAvIDEwMCA6IHZhbHVlfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmYWxsXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJmaWxsLW9wYWNpdHlcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy5ncmFkaWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyYWRpZW50ID0gUi5fZy5kb2MuZ2V0RWxlbWVudEJ5SWQobm9kZS5nZXRBdHRyaWJ1dGUoXCJmaWxsXCIpLnJlcGxhY2UoL151cmxcXCgjfFxcKSQvZywgRSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmFkaWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9wcyA9IGdyYWRpZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic3RvcFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJChzdG9wc1tzdG9wcy5sZW5ndGggLSAxXSwge1wic3RvcC1vcGFjaXR5XCI6IHZhbHVlfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0ID09IFwiZm9udC1zaXplXCIgJiYgKHZhbHVlID0gdG9JbnQodmFsdWUsIDEwKSArIFwicHhcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3NzcnVsZSA9IGF0dC5yZXBsYWNlKC8oXFwtLikvZywgZnVuY3Rpb24gKHcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdy5zdWJzdHJpbmcoMSkudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zdHlsZVtjc3NydWxlXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgby5fLmRpcnR5ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdHVuZVRleHQobywgcGFyYW1zKTtcbiAgICAgICAgbm9kZS5zdHlsZS52aXNpYmlsaXR5ID0gdmlzO1xuICAgIH0sXG4gICAgbGVhZGluZyA9IDEuMixcbiAgICB0dW5lVGV4dCA9IGZ1bmN0aW9uIChlbCwgcGFyYW1zKSB7XG4gICAgICAgIGlmIChlbC50eXBlICE9IFwidGV4dFwiIHx8ICEocGFyYW1zW2hhc10oXCJ0ZXh0XCIpIHx8IHBhcmFtc1toYXNdKFwiZm9udFwiKSB8fCBwYXJhbXNbaGFzXShcImZvbnQtc2l6ZVwiKSB8fCBwYXJhbXNbaGFzXShcInhcIikgfHwgcGFyYW1zW2hhc10oXCJ5XCIpKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhID0gZWwuYXR0cnMsXG4gICAgICAgICAgICBub2RlID0gZWwubm9kZSxcbiAgICAgICAgICAgIGZvbnRTaXplID0gbm9kZS5maXJzdENoaWxkID8gdG9JbnQoUi5fZy5kb2MuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShub2RlLmZpcnN0Q2hpbGQsIEUpLmdldFByb3BlcnR5VmFsdWUoXCJmb250LXNpemVcIiksIDEwKSA6IDEwO1xuXG4gICAgICAgIGlmIChwYXJhbXNbaGFzXShcInRleHRcIikpIHtcbiAgICAgICAgICAgIGEudGV4dCA9IHBhcmFtcy50ZXh0O1xuICAgICAgICAgICAgd2hpbGUgKG5vZGUuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQobm9kZS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0ZXh0cyA9IFN0cihwYXJhbXMudGV4dCkuc3BsaXQoXCJcXG5cIiksXG4gICAgICAgICAgICAgICAgdHNwYW5zID0gW10sXG4gICAgICAgICAgICAgICAgdHNwYW47XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSB0ZXh0cy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdHNwYW4gPSAkKFwidHNwYW5cIik7XG4gICAgICAgICAgICAgICAgaSAmJiAkKHRzcGFuLCB7ZHk6IGZvbnRTaXplICogbGVhZGluZywgeDogYS54fSk7XG4gICAgICAgICAgICAgICAgdHNwYW4uYXBwZW5kQ2hpbGQoUi5fZy5kb2MuY3JlYXRlVGV4dE5vZGUodGV4dHNbaV0pKTtcbiAgICAgICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKHRzcGFuKTtcbiAgICAgICAgICAgICAgICB0c3BhbnNbaV0gPSB0c3BhbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRzcGFucyA9IG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0c3BhblwiKTtcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGlpID0gdHNwYW5zLmxlbmd0aDsgaSA8IGlpOyBpKyspIGlmIChpKSB7XG4gICAgICAgICAgICAgICAgJCh0c3BhbnNbaV0sIHtkeTogZm9udFNpemUgKiBsZWFkaW5nLCB4OiBhLnh9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJCh0c3BhbnNbMF0sIHtkeTogMH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgICQobm9kZSwge3g6IGEueCwgeTogYS55fSk7XG4gICAgICAgIGVsLl8uZGlydHkgPSAxO1xuICAgICAgICB2YXIgYmIgPSBlbC5fZ2V0QkJveCgpLFxuICAgICAgICAgICAgZGlmID0gYS55IC0gKGJiLnkgKyBiYi5oZWlnaHQgLyAyKTtcbiAgICAgICAgZGlmICYmIFIuaXMoZGlmLCBcImZpbml0ZVwiKSAmJiAkKHRzcGFuc1swXSwge2R5OiBkaWZ9KTtcbiAgICB9LFxuICAgIEVsZW1lbnQgPSBmdW5jdGlvbiAobm9kZSwgc3ZnKSB7XG4gICAgICAgIHZhciBYID0gMCxcbiAgICAgICAgICAgIFkgPSAwO1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIEVsZW1lbnQubm9kZVxuICAgICAgICAgWyBwcm9wZXJ0eSAob2JqZWN0KSBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBHaXZlcyB5b3UgYSByZWZlcmVuY2UgdG8gdGhlIERPTSBvYmplY3QsIHNvIHlvdSBjYW4gYXNzaWduIGV2ZW50IGhhbmRsZXJzIG9yIGp1c3QgbWVzcyBhcm91bmQuXG4gICAgICAgICAqKlxuICAgICAgICAgKiBOb3RlOiBEb27igJl0IG1lc3Mgd2l0aCBpdC5cbiAgICAgICAgID4gVXNhZ2VcbiAgICAgICAgIHwgLy8gZHJhdyBhIGNpcmNsZSBhdCBjb29yZGluYXRlIDEwLDEwIHdpdGggcmFkaXVzIG9mIDEwXG4gICAgICAgICB8IHZhciBjID0gcGFwZXIuY2lyY2xlKDEwLCAxMCwgMTApO1xuICAgICAgICAgfCBjLm5vZGUub25jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIHwgICAgIGMuYXR0cihcImZpbGxcIiwgXCJyZWRcIik7XG4gICAgICAgICB8IH07XG4gICAgICAgIFxcKi9cbiAgICAgICAgdGhpc1swXSA9IHRoaXMubm9kZSA9IG5vZGU7XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogRWxlbWVudC5yYXBoYWVsXG4gICAgICAgICBbIHByb3BlcnR5IChvYmplY3QpIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIEludGVybmFsIHJlZmVyZW5jZSB0byBAUmFwaGFlbCBvYmplY3QuIEluIGNhc2UgaXQgaXMgbm90IGF2YWlsYWJsZS5cbiAgICAgICAgID4gVXNhZ2VcbiAgICAgICAgIHwgUmFwaGFlbC5lbC5yZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICB8ICAgICB2YXIgaHNiID0gdGhpcy5wYXBlci5yYXBoYWVsLnJnYjJoc2IodGhpcy5hdHRyKFwiZmlsbFwiKSk7XG4gICAgICAgICB8ICAgICBoc2IuaCA9IDE7XG4gICAgICAgICB8ICAgICB0aGlzLmF0dHIoe2ZpbGw6IHRoaXMucGFwZXIucmFwaGFlbC5oc2IycmdiKGhzYikuaGV4fSk7XG4gICAgICAgICB8IH1cbiAgICAgICAgXFwqL1xuICAgICAgICBub2RlLnJhcGhhZWwgPSB0cnVlO1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIEVsZW1lbnQuaWRcbiAgICAgICAgIFsgcHJvcGVydHkgKG51bWJlcikgXVxuICAgICAgICAgKipcbiAgICAgICAgICogVW5pcXVlIGlkIG9mIHRoZSBlbGVtZW50LiBFc3BlY2lhbGx5IHVzZXNmdWwgd2hlbiB5b3Ugd2FudCB0byBsaXN0ZW4gdG8gZXZlbnRzIG9mIHRoZSBlbGVtZW50LCBcbiAgICAgICAgICogYmVjYXVzZSBhbGwgZXZlbnRzIGFyZSBmaXJlZCBpbiBmb3JtYXQgYDxtb2R1bGU+LjxhY3Rpb24+LjxpZD5gLiBBbHNvIHVzZWZ1bCBmb3IgQFBhcGVyLmdldEJ5SWQgbWV0aG9kLlxuICAgICAgICBcXCovXG4gICAgICAgIHRoaXMuaWQgPSBSLl9vaWQrKztcbiAgICAgICAgbm9kZS5yYXBoYWVsaWQgPSB0aGlzLmlkO1xuICAgICAgICB0aGlzLm1hdHJpeCA9IFIubWF0cml4KCk7XG4gICAgICAgIHRoaXMucmVhbFBhdGggPSBudWxsO1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIEVsZW1lbnQucGFwZXJcbiAgICAgICAgIFsgcHJvcGVydHkgKG9iamVjdCkgXVxuICAgICAgICAgKipcbiAgICAgICAgICogSW50ZXJuYWwgcmVmZXJlbmNlIHRvIOKAnHBhcGVy4oCdIHdoZXJlIG9iamVjdCBkcmF3bi4gTWFpbmx5IGZvciB1c2UgaW4gcGx1Z2lucyBhbmQgZWxlbWVudCBleHRlbnNpb25zLlxuICAgICAgICAgPiBVc2FnZVxuICAgICAgICAgfCBSYXBoYWVsLmVsLmNyb3NzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgfCAgICAgdGhpcy5hdHRyKHtmaWxsOiBcInJlZFwifSk7XG4gICAgICAgICB8ICAgICB0aGlzLnBhcGVyLnBhdGgoXCJNMTAsMTBMNTAsNTBNNTAsMTBMMTAsNTBcIilcbiAgICAgICAgIHwgICAgICAgICAuYXR0cih7c3Ryb2tlOiBcInJlZFwifSk7XG4gICAgICAgICB8IH1cbiAgICAgICAgXFwqL1xuICAgICAgICB0aGlzLnBhcGVyID0gc3ZnO1xuICAgICAgICB0aGlzLmF0dHJzID0gdGhpcy5hdHRycyB8fCB7fTtcbiAgICAgICAgdGhpcy5fID0ge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiBbXSxcbiAgICAgICAgICAgIHN4OiAxLFxuICAgICAgICAgICAgc3k6IDEsXG4gICAgICAgICAgICBkZWc6IDAsXG4gICAgICAgICAgICBkeDogMCxcbiAgICAgICAgICAgIGR5OiAwLFxuICAgICAgICAgICAgZGlydHk6IDFcbiAgICAgICAgfTtcbiAgICAgICAgIXN2Zy5ib3R0b20gJiYgKHN2Zy5ib3R0b20gPSB0aGlzKTtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBFbGVtZW50LnByZXZcbiAgICAgICAgIFsgcHJvcGVydHkgKG9iamVjdCkgXVxuICAgICAgICAgKipcbiAgICAgICAgICogUmVmZXJlbmNlIHRvIHRoZSBwcmV2aW91cyBlbGVtZW50IGluIHRoZSBoaWVyYXJjaHkuXG4gICAgICAgIFxcKi9cbiAgICAgICAgdGhpcy5wcmV2ID0gc3ZnLnRvcDtcbiAgICAgICAgc3ZnLnRvcCAmJiAoc3ZnLnRvcC5uZXh0ID0gdGhpcyk7XG4gICAgICAgIHN2Zy50b3AgPSB0aGlzO1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIEVsZW1lbnQubmV4dFxuICAgICAgICAgWyBwcm9wZXJ0eSAob2JqZWN0KSBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBSZWZlcmVuY2UgdG8gdGhlIG5leHQgZWxlbWVudCBpbiB0aGUgaGllcmFyY2h5LlxuICAgICAgICBcXCovXG4gICAgICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgfSxcbiAgICBlbHByb3RvID0gUi5lbDtcblxuICAgIEVsZW1lbnQucHJvdG90eXBlID0gZWxwcm90bztcbiAgICBlbHByb3RvLmNvbnN0cnVjdG9yID0gRWxlbWVudDtcblxuICAgIFIuX2VuZ2luZS5wYXRoID0gZnVuY3Rpb24gKHBhdGhTdHJpbmcsIFNWRykge1xuICAgICAgICB2YXIgZWwgPSAkKFwicGF0aFwiKTtcbiAgICAgICAgU1ZHLmNhbnZhcyAmJiBTVkcuY2FudmFzLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgdmFyIHAgPSBuZXcgRWxlbWVudChlbCwgU1ZHKTtcbiAgICAgICAgcC50eXBlID0gXCJwYXRoXCI7XG4gICAgICAgIHNldEZpbGxBbmRTdHJva2UocCwge1xuICAgICAgICAgICAgZmlsbDogXCJub25lXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwiIzAwMFwiLFxuICAgICAgICAgICAgcGF0aDogcGF0aFN0cmluZ1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5yb3RhdGVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIERlcHJlY2F0ZWQhIFVzZSBARWxlbWVudC50cmFuc2Zvcm0gaW5zdGVhZC5cbiAgICAgKiBBZGRzIHJvdGF0aW9uIGJ5IGdpdmVuIGFuZ2xlIGFyb3VuZCBnaXZlbiBwb2ludCB0byB0aGUgbGlzdCBvZlxuICAgICAqIHRyYW5zZm9ybWF0aW9ucyBvZiB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gZGVnIChudW1iZXIpIGFuZ2xlIGluIGRlZ3JlZXNcbiAgICAgLSBjeCAobnVtYmVyKSAjb3B0aW9uYWwgeCBjb29yZGluYXRlIG9mIHRoZSBjZW50cmUgb2Ygcm90YXRpb25cbiAgICAgLSBjeSAobnVtYmVyKSAjb3B0aW9uYWwgeSBjb29yZGluYXRlIG9mIHRoZSBjZW50cmUgb2Ygcm90YXRpb25cbiAgICAgKiBJZiBjeCAmIGN5IGFyZW7igJl0IHNwZWNpZmllZCBjZW50cmUgb2YgdGhlIHNoYXBlIGlzIHVzZWQgYXMgYSBwb2ludCBvZiByb3RhdGlvbi5cbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLnJvdGF0ZSA9IGZ1bmN0aW9uIChkZWcsIGN4LCBjeSkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkZWcgPSBTdHIoZGVnKS5zcGxpdChzZXBhcmF0b3IpO1xuICAgICAgICBpZiAoZGVnLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGN4ID0gdG9GbG9hdChkZWdbMV0pO1xuICAgICAgICAgICAgY3kgPSB0b0Zsb2F0KGRlZ1syXSk7XG4gICAgICAgIH1cbiAgICAgICAgZGVnID0gdG9GbG9hdChkZWdbMF0pO1xuICAgICAgICAoY3kgPT0gbnVsbCkgJiYgKGN4ID0gY3kpO1xuICAgICAgICBpZiAoY3ggPT0gbnVsbCB8fCBjeSA9PSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgYmJveCA9IHRoaXMuZ2V0QkJveCgxKTtcbiAgICAgICAgICAgIGN4ID0gYmJveC54ICsgYmJveC53aWR0aCAvIDI7XG4gICAgICAgICAgICBjeSA9IGJib3gueSArIGJib3guaGVpZ2h0IC8gMjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRyYW5zZm9ybSh0aGlzLl8udHJhbnNmb3JtLmNvbmNhdChbW1wiclwiLCBkZWcsIGN4LCBjeV1dKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuc2NhbGVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIERlcHJlY2F0ZWQhIFVzZSBARWxlbWVudC50cmFuc2Zvcm0gaW5zdGVhZC5cbiAgICAgKiBBZGRzIHNjYWxlIGJ5IGdpdmVuIGFtb3VudCByZWxhdGl2ZSB0byBnaXZlbiBwb2ludCB0byB0aGUgbGlzdCBvZlxuICAgICAqIHRyYW5zZm9ybWF0aW9ucyBvZiB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gc3ggKG51bWJlcikgaG9yaXNvbnRhbCBzY2FsZSBhbW91bnRcbiAgICAgLSBzeSAobnVtYmVyKSB2ZXJ0aWNhbCBzY2FsZSBhbW91bnRcbiAgICAgLSBjeCAobnVtYmVyKSAjb3B0aW9uYWwgeCBjb29yZGluYXRlIG9mIHRoZSBjZW50cmUgb2Ygc2NhbGVcbiAgICAgLSBjeSAobnVtYmVyKSAjb3B0aW9uYWwgeSBjb29yZGluYXRlIG9mIHRoZSBjZW50cmUgb2Ygc2NhbGVcbiAgICAgKiBJZiBjeCAmIGN5IGFyZW7igJl0IHNwZWNpZmllZCBjZW50cmUgb2YgdGhlIHNoYXBlIGlzIHVzZWQgaW5zdGVhZC5cbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLnNjYWxlID0gZnVuY3Rpb24gKHN4LCBzeSwgY3gsIGN5KSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHN4ID0gU3RyKHN4KS5zcGxpdChzZXBhcmF0b3IpO1xuICAgICAgICBpZiAoc3gubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgc3kgPSB0b0Zsb2F0KHN4WzFdKTtcbiAgICAgICAgICAgIGN4ID0gdG9GbG9hdChzeFsyXSk7XG4gICAgICAgICAgICBjeSA9IHRvRmxvYXQoc3hbM10pO1xuICAgICAgICB9XG4gICAgICAgIHN4ID0gdG9GbG9hdChzeFswXSk7XG4gICAgICAgIChzeSA9PSBudWxsKSAmJiAoc3kgPSBzeCk7XG4gICAgICAgIChjeSA9PSBudWxsKSAmJiAoY3ggPSBjeSk7XG4gICAgICAgIGlmIChjeCA9PSBudWxsIHx8IGN5ID09IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBiYm94ID0gdGhpcy5nZXRCQm94KDEpO1xuICAgICAgICB9XG4gICAgICAgIGN4ID0gY3ggPT0gbnVsbCA/IGJib3gueCArIGJib3gud2lkdGggLyAyIDogY3g7XG4gICAgICAgIGN5ID0gY3kgPT0gbnVsbCA/IGJib3gueSArIGJib3guaGVpZ2h0IC8gMiA6IGN5O1xuICAgICAgICB0aGlzLnRyYW5zZm9ybSh0aGlzLl8udHJhbnNmb3JtLmNvbmNhdChbW1wic1wiLCBzeCwgc3ksIGN4LCBjeV1dKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudHJhbnNsYXRlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBEZXByZWNhdGVkISBVc2UgQEVsZW1lbnQudHJhbnNmb3JtIGluc3RlYWQuXG4gICAgICogQWRkcyB0cmFuc2xhdGlvbiBieSBnaXZlbiBhbW91bnQgdG8gdGhlIGxpc3Qgb2YgdHJhbnNmb3JtYXRpb25zIG9mIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBkeCAobnVtYmVyKSBob3Jpc29udGFsIHNoaWZ0XG4gICAgIC0gZHkgKG51bWJlcikgdmVydGljYWwgc2hpZnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uIChkeCwgZHkpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZHggPSBTdHIoZHgpLnNwbGl0KHNlcGFyYXRvcik7XG4gICAgICAgIGlmIChkeC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBkeSA9IHRvRmxvYXQoZHhbMV0pO1xuICAgICAgICB9XG4gICAgICAgIGR4ID0gdG9GbG9hdChkeFswXSkgfHwgMDtcbiAgICAgICAgZHkgPSArZHkgfHwgMDtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0odGhpcy5fLnRyYW5zZm9ybS5jb25jYXQoW1tcInRcIiwgZHgsIGR5XV0pKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC50cmFuc2Zvcm1cbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgdHJhbnNmb3JtYXRpb24gdG8gdGhlIGVsZW1lbnQgd2hpY2ggaXMgc2VwYXJhdGUgdG8gb3RoZXIgYXR0cmlidXRlcyxcbiAgICAgKiBpLmUuIHRyYW5zbGF0aW9uIGRvZXNu4oCZdCBjaGFuZ2UgYHhgIG9yIGB5YCBvZiB0aGUgcmVjdGFuZ2UuIFRoZSBmb3JtYXRcbiAgICAgKiBvZiB0cmFuc2Zvcm1hdGlvbiBzdHJpbmcgaXMgc2ltaWxhciB0byB0aGUgcGF0aCBzdHJpbmcgc3ludGF4OlxuICAgICB8IFwidDEwMCwxMDByMzAsMTAwLDEwMHMyLDIsMTAwLDEwMHI0NXMxLjVcIlxuICAgICAqIEVhY2ggbGV0dGVyIGlzIGEgY29tbWFuZC4gVGhlcmUgYXJlIGZvdXIgY29tbWFuZHM6IGB0YCBpcyBmb3IgdHJhbnNsYXRlLCBgcmAgaXMgZm9yIHJvdGF0ZSwgYHNgIGlzIGZvclxuICAgICAqIHNjYWxlIGFuZCBgbWAgaXMgZm9yIG1hdHJpeC5cbiAgICAgKlxuICAgICAqIFRoZXJlIGFyZSBhbHNvIGFsdGVybmF0aXZlIOKAnGFic29sdXRl4oCdIHRyYW5zbGF0aW9uLCByb3RhdGlvbiBhbmQgc2NhbGU6IGBUYCwgYFJgIGFuZCBgU2AuIFRoZXkgd2lsbCBub3QgdGFrZSBwcmV2aW91cyB0cmFuc2Zvcm1hdGlvbiBpbnRvIGFjY291bnQuIEZvciBleGFtcGxlLCBgLi4uVDEwMCwwYCB3aWxsIGFsd2F5cyBtb3ZlIGVsZW1lbnQgMTAwIHB4IGhvcmlzb250YWxseSwgd2hpbGUgYC4uLnQxMDAsMGAgY291bGQgbW92ZSBpdCB2ZXJ0aWNhbGx5IGlmIHRoZXJlIGlzIGByOTBgIGJlZm9yZS4gSnVzdCBjb21wYXJlIHJlc3VsdHMgb2YgYHI5MHQxMDAsMGAgYW5kIGByOTBUMTAwLDBgLlxuICAgICAqXG4gICAgICogU28sIHRoZSBleGFtcGxlIGxpbmUgYWJvdmUgY291bGQgYmUgcmVhZCBsaWtlIOKAnHRyYW5zbGF0ZSBieSAxMDAsIDEwMDsgcm90YXRlIDMwwrAgYXJvdW5kIDEwMCwgMTAwOyBzY2FsZSB0d2ljZSBhcm91bmQgMTAwLCAxMDA7XG4gICAgICogcm90YXRlIDQ1wrAgYXJvdW5kIGNlbnRyZTsgc2NhbGUgMS41IHRpbWVzIHJlbGF0aXZlIHRvIGNlbnRyZeKAnS4gQXMgeW91IGNhbiBzZWUgcm90YXRlIGFuZCBzY2FsZSBjb21tYW5kcyBoYXZlIG9yaWdpblxuICAgICAqIGNvb3JkaW5hdGVzIGFzIG9wdGlvbmFsIHBhcmFtZXRlcnMsIHRoZSBkZWZhdWx0IGlzIHRoZSBjZW50cmUgcG9pbnQgb2YgdGhlIGVsZW1lbnQuXG4gICAgICogTWF0cml4IGFjY2VwdHMgc2l4IHBhcmFtZXRlcnMuXG4gICAgID4gVXNhZ2VcbiAgICAgfCB2YXIgZWwgPSBwYXBlci5yZWN0KDEwLCAyMCwgMzAwLCAyMDApO1xuICAgICB8IC8vIHRyYW5zbGF0ZSAxMDAsIDEwMCwgcm90YXRlIDQ1wrAsIHRyYW5zbGF0ZSAtMTAwLCAwXG4gICAgIHwgZWwudHJhbnNmb3JtKFwidDEwMCwxMDByNDV0LTEwMCwwXCIpO1xuICAgICB8IC8vIGlmIHlvdSB3YW50IHlvdSBjYW4gYXBwZW5kIG9yIHByZXBlbmQgdHJhbnNmb3JtYXRpb25zXG4gICAgIHwgZWwudHJhbnNmb3JtKFwiLi4udDUwLDUwXCIpO1xuICAgICB8IGVsLnRyYW5zZm9ybShcInMyLi4uXCIpO1xuICAgICB8IC8vIG9yIGV2ZW4gd3JhcFxuICAgICB8IGVsLnRyYW5zZm9ybShcInQ1MCw1MC4uLnQtNTAtNTBcIik7XG4gICAgIHwgLy8gdG8gcmVzZXQgdHJhbnNmb3JtYXRpb24gY2FsbCBtZXRob2Qgd2l0aCBlbXB0eSBzdHJpbmdcbiAgICAgfCBlbC50cmFuc2Zvcm0oXCJcIik7XG4gICAgIHwgLy8gdG8gZ2V0IGN1cnJlbnQgdmFsdWUgY2FsbCBpdCB3aXRob3V0IHBhcmFtZXRlcnNcbiAgICAgfCBjb25zb2xlLmxvZyhlbC50cmFuc2Zvcm0oKSk7XG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHRzdHIgKHN0cmluZykgI29wdGlvbmFsIHRyYW5zZm9ybWF0aW9uIHN0cmluZ1xuICAgICAqIElmIHRzdHIgaXNu4oCZdCBzcGVjaWZpZWRcbiAgICAgPSAoc3RyaW5nKSBjdXJyZW50IHRyYW5zZm9ybWF0aW9uIHN0cmluZ1xuICAgICAqIGVsc2VcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLnRyYW5zZm9ybSA9IGZ1bmN0aW9uICh0c3RyKSB7XG4gICAgICAgIHZhciBfID0gdGhpcy5fO1xuICAgICAgICBpZiAodHN0ciA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gXy50cmFuc2Zvcm07XG4gICAgICAgIH1cbiAgICAgICAgUi5fZXh0cmFjdFRyYW5zZm9ybSh0aGlzLCB0c3RyKTtcblxuICAgICAgICB0aGlzLmNsaXAgJiYgJCh0aGlzLmNsaXAsIHt0cmFuc2Zvcm06IHRoaXMubWF0cml4LmludmVydCgpfSk7XG4gICAgICAgIHRoaXMucGF0dGVybiAmJiB1cGRhdGVQb3NpdGlvbih0aGlzKTtcbiAgICAgICAgdGhpcy5ub2RlICYmICQodGhpcy5ub2RlLCB7dHJhbnNmb3JtOiB0aGlzLm1hdHJpeH0pO1xuICAgIFxuICAgICAgICBpZiAoXy5zeCAhPSAxIHx8IF8uc3kgIT0gMSkge1xuICAgICAgICAgICAgdmFyIHN3ID0gdGhpcy5hdHRyc1toYXNdKFwic3Ryb2tlLXdpZHRoXCIpID8gdGhpcy5hdHRyc1tcInN0cm9rZS13aWR0aFwiXSA6IDE7XG4gICAgICAgICAgICB0aGlzLmF0dHIoe1wic3Ryb2tlLXdpZHRoXCI6IHN3fSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmhpZGVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIE1ha2VzIGVsZW1lbnQgaW52aXNpYmxlLiBTZWUgQEVsZW1lbnQuc2hvdy5cbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLmhpZGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICF0aGlzLnJlbW92ZWQgJiYgdGhpcy5wYXBlci5zYWZhcmkodGhpcy5ub2RlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuc2hvd1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogTWFrZXMgZWxlbWVudCB2aXNpYmxlLiBTZWUgQEVsZW1lbnQuaGlkZS5cbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICF0aGlzLnJlbW92ZWQgJiYgdGhpcy5wYXBlci5zYWZhcmkodGhpcy5ub2RlLnN0eWxlLmRpc3BsYXkgPSBcIlwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5yZW1vdmVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZWxlbWVudCBmcm9tIHRoZSBwYXBlci5cbiAgICBcXCovXG4gICAgZWxwcm90by5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQgfHwgIXRoaXMubm9kZS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhcGVyID0gdGhpcy5wYXBlcjtcbiAgICAgICAgcGFwZXIuX19zZXRfXyAmJiBwYXBlci5fX3NldF9fLmV4Y2x1ZGUodGhpcyk7XG4gICAgICAgIGV2ZS51bmJpbmQoXCJyYXBoYWVsLiouKi5cIiArIHRoaXMuaWQpO1xuICAgICAgICBpZiAodGhpcy5ncmFkaWVudCkge1xuICAgICAgICAgICAgcGFwZXIuZGVmcy5yZW1vdmVDaGlsZCh0aGlzLmdyYWRpZW50KTtcbiAgICAgICAgfVxuICAgICAgICBSLl90ZWFyKHRoaXMsIHBhcGVyKTtcbiAgICAgICAgaWYgKHRoaXMubm9kZS5wYXJlbnROb2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PSBcImFcIikge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLm5vZGUucGFyZW50Tm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGkgaW4gdGhpcykge1xuICAgICAgICAgICAgdGhpc1tpXSA9IHR5cGVvZiB0aGlzW2ldID09IFwiZnVuY3Rpb25cIiA/IFIuX3JlbW92ZWRGYWN0b3J5KGkpIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbW92ZWQgPSB0cnVlO1xuICAgIH07XG4gICAgZWxwcm90by5fZ2V0QkJveCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMubm9kZS5zdHlsZS5kaXNwbGF5ID09IFwibm9uZVwiKSB7XG4gICAgICAgICAgICB0aGlzLnNob3coKTtcbiAgICAgICAgICAgIHZhciBoaWRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYmJveCA9IHt9O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYmJveCA9IHRoaXMubm9kZS5nZXRCQm94KCk7XG4gICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgLy8gRmlyZWZveCAzLjAueCBwbGF5cyBiYWRseSBoZXJlXG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBiYm94ID0gYmJveCB8fCB7fTtcbiAgICAgICAgfVxuICAgICAgICBoaWRlICYmIHRoaXMuaGlkZSgpO1xuICAgICAgICByZXR1cm4gYmJveDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmF0dHJcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFNldHMgdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGF0dHJOYW1lIChzdHJpbmcpIGF0dHJpYnV0ZeKAmXMgbmFtZVxuICAgICAtIHZhbHVlIChzdHJpbmcpIHZhbHVlXG4gICAgICogb3JcbiAgICAgLSBwYXJhbXMgKG9iamVjdCkgb2JqZWN0IG9mIG5hbWUvdmFsdWUgcGFpcnNcbiAgICAgKiBvclxuICAgICAtIGF0dHJOYW1lIChzdHJpbmcpIGF0dHJpYnV0ZeKAmXMgbmFtZVxuICAgICAqIG9yXG4gICAgIC0gYXR0ck5hbWVzIChhcnJheSkgaW4gdGhpcyBjYXNlIG1ldGhvZCByZXR1cm5zIGFycmF5IG9mIGN1cnJlbnQgdmFsdWVzIGZvciBnaXZlbiBhdHRyaWJ1dGUgbmFtZXNcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudCBpZiBhdHRyc05hbWUgJiB2YWx1ZSBvciBwYXJhbXMgYXJlIHBhc3NlZCBpbi5cbiAgICAgPSAoLi4uKSB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlIGlmIG9ubHkgYXR0cnNOYW1lIGlzIHBhc3NlZCBpbi5cbiAgICAgPSAoYXJyYXkpIGFycmF5IG9mIHZhbHVlcyBvZiB0aGUgYXR0cmlidXRlIGlmIGF0dHJzTmFtZXMgaXMgcGFzc2VkIGluLlxuICAgICA9IChvYmplY3QpIG9iamVjdCBvZiBhdHRyaWJ1dGVzIGlmIG5vdGhpbmcgaXMgcGFzc2VkIGluLlxuICAgICA+IFBvc3NpYmxlIHBhcmFtZXRlcnNcbiAgICAgIyA8cD5QbGVhc2UgcmVmZXIgdG8gdGhlIDxhIGhyZWY9XCJodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvXCIgdGl0bGU9XCJUaGUgVzNDIFJlY29tbWVuZGF0aW9uIGZvciB0aGUgU1ZHIGxhbmd1YWdlIGRlc2NyaWJlcyB0aGVzZSBwcm9wZXJ0aWVzIGluIGRldGFpbC5cIj5TVkcgc3BlY2lmaWNhdGlvbjwvYT4gZm9yIGFuIGV4cGxhbmF0aW9uIG9mIHRoZXNlIHBhcmFtZXRlcnMuPC9wPlxuICAgICBvIGFycm93LWVuZCAoc3RyaW5nKSBhcnJvd2hlYWQgb24gdGhlIGVuZCBvZiB0aGUgcGF0aC4gVGhlIGZvcm1hdCBmb3Igc3RyaW5nIGlzIGA8dHlwZT5bLTx3aWR0aD5bLTxsZW5ndGg+XV1gLiBQb3NzaWJsZSB0eXBlczogYGNsYXNzaWNgLCBgYmxvY2tgLCBgb3BlbmAsIGBvdmFsYCwgYGRpYW1vbmRgLCBgbm9uZWAsIHdpZHRoOiBgd2lkZWAsIGBuYXJyb3dgLCBgbWVkaXVtYCwgbGVuZ3RoOiBgbG9uZ2AsIGBzaG9ydGAsIGBtaWRpdW1gLlxuICAgICBvIGNsaXAtcmVjdCAoc3RyaW5nKSBjb21tYSBvciBzcGFjZSBzZXBhcmF0ZWQgdmFsdWVzOiB4LCB5LCB3aWR0aCBhbmQgaGVpZ2h0XG4gICAgIG8gY3Vyc29yIChzdHJpbmcpIENTUyB0eXBlIG9mIHRoZSBjdXJzb3JcbiAgICAgbyBjeCAobnVtYmVyKSB0aGUgeC1heGlzIGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgY2lyY2xlLCBvciBlbGxpcHNlXG4gICAgIG8gY3kgKG51bWJlcikgdGhlIHktYXhpcyBjb29yZGluYXRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZSwgb3IgZWxsaXBzZVxuICAgICBvIGZpbGwgKHN0cmluZykgY29sb3VyLCBncmFkaWVudCBvciBpbWFnZVxuICAgICBvIGZpbGwtb3BhY2l0eSAobnVtYmVyKVxuICAgICBvIGZvbnQgKHN0cmluZylcbiAgICAgbyBmb250LWZhbWlseSAoc3RyaW5nKVxuICAgICBvIGZvbnQtc2l6ZSAobnVtYmVyKSBmb250IHNpemUgaW4gcGl4ZWxzXG4gICAgIG8gZm9udC13ZWlnaHQgKHN0cmluZylcbiAgICAgbyBoZWlnaHQgKG51bWJlcilcbiAgICAgbyBocmVmIChzdHJpbmcpIFVSTCwgaWYgc3BlY2lmaWVkIGVsZW1lbnQgYmVoYXZlcyBhcyBoeXBlcmxpbmtcbiAgICAgbyBvcGFjaXR5IChudW1iZXIpXG4gICAgIG8gcGF0aCAoc3RyaW5nKSBTVkcgcGF0aCBzdHJpbmcgZm9ybWF0XG4gICAgIG8gciAobnVtYmVyKSByYWRpdXMgb2YgdGhlIGNpcmNsZSwgZWxsaXBzZSBvciByb3VuZGVkIGNvcm5lciBvbiB0aGUgcmVjdFxuICAgICBvIHJ4IChudW1iZXIpIGhvcmlzb250YWwgcmFkaXVzIG9mIHRoZSBlbGxpcHNlXG4gICAgIG8gcnkgKG51bWJlcikgdmVydGljYWwgcmFkaXVzIG9mIHRoZSBlbGxpcHNlXG4gICAgIG8gc3JjIChzdHJpbmcpIGltYWdlIFVSTCwgb25seSB3b3JrcyBmb3IgQEVsZW1lbnQuaW1hZ2UgZWxlbWVudFxuICAgICBvIHN0cm9rZSAoc3RyaW5nKSBzdHJva2UgY29sb3VyXG4gICAgIG8gc3Ryb2tlLWRhc2hhcnJheSAoc3RyaW5nKSBb4oCc4oCdLCDigJxgLWDigJ0sIOKAnGAuYOKAnSwg4oCcYC0uYOKAnSwg4oCcYC0uLmDigJ0sIOKAnGAuIGDigJ0sIOKAnGAtIGDigJ0sIOKAnGAtLWDigJ0sIOKAnGAtIC5g4oCdLCDigJxgLS0uYOKAnSwg4oCcYC0tLi5g4oCdXVxuICAgICBvIHN0cm9rZS1saW5lY2FwIChzdHJpbmcpIFvigJxgYnV0dGDigJ0sIOKAnGBzcXVhcmVg4oCdLCDigJxgcm91bmRg4oCdXVxuICAgICBvIHN0cm9rZS1saW5lam9pbiAoc3RyaW5nKSBb4oCcYGJldmVsYOKAnSwg4oCcYHJvdW5kYOKAnSwg4oCcYG1pdGVyYOKAnV1cbiAgICAgbyBzdHJva2UtbWl0ZXJsaW1pdCAobnVtYmVyKVxuICAgICBvIHN0cm9rZS1vcGFjaXR5IChudW1iZXIpXG4gICAgIG8gc3Ryb2tlLXdpZHRoIChudW1iZXIpIHN0cm9rZSB3aWR0aCBpbiBwaXhlbHMsIGRlZmF1bHQgaXMgJzEnXG4gICAgIG8gdGFyZ2V0IChzdHJpbmcpIHVzZWQgd2l0aCBocmVmXG4gICAgIG8gdGV4dCAoc3RyaW5nKSBjb250ZW50cyBvZiB0aGUgdGV4dCBlbGVtZW50LiBVc2UgYFxcbmAgZm9yIG11bHRpbGluZSB0ZXh0XG4gICAgIG8gdGV4dC1hbmNob3IgKHN0cmluZykgW+KAnGBzdGFydGDigJ0sIOKAnGBtaWRkbGVg4oCdLCDigJxgZW5kYOKAnV0sIGRlZmF1bHQgaXMg4oCcYG1pZGRsZWDigJ1cbiAgICAgbyB0aXRsZSAoc3RyaW5nKSB3aWxsIGNyZWF0ZSB0b29sdGlwIHdpdGggYSBnaXZlbiB0ZXh0XG4gICAgIG8gdHJhbnNmb3JtIChzdHJpbmcpIHNlZSBARWxlbWVudC50cmFuc2Zvcm1cbiAgICAgbyB3aWR0aCAobnVtYmVyKVxuICAgICBvIHggKG51bWJlcilcbiAgICAgbyB5IChudW1iZXIpXG4gICAgID4gR3JhZGllbnRzXG4gICAgICogTGluZWFyIGdyYWRpZW50IGZvcm1hdDog4oCcYOKAuWFuZ2xl4oC6LeKAuWNvbG91cuKAulst4oC5Y29sb3Vy4oC6WzrigLlvZmZzZXTigLpdXSot4oC5Y29sb3Vy4oC6YOKAnSwgZXhhbXBsZTog4oCcYDkwLSNmZmYtIzAwMGDigJ0g4oCTIDkwwrBcbiAgICAgKiBncmFkaWVudCBmcm9tIHdoaXRlIHRvIGJsYWNrIG9yIOKAnGAwLSNmZmYtI2YwMDoyMC0jMDAwYOKAnSDigJMgMMKwIGdyYWRpZW50IGZyb20gd2hpdGUgdmlhIHJlZCAoYXQgMjAlKSB0byBibGFjay5cbiAgICAgKlxuICAgICAqIHJhZGlhbCBncmFkaWVudDog4oCcYHJbKOKAuWZ44oC6LCDigLlmeeKAuild4oC5Y29sb3Vy4oC6Wy3igLljb2xvdXLigLpbOuKAuW9mZnNldOKAul1dKi3igLljb2xvdXLigLpg4oCdLCBleGFtcGxlOiDigJxgciNmZmYtIzAwMGDigJ0g4oCTXG4gICAgICogZ3JhZGllbnQgZnJvbSB3aGl0ZSB0byBibGFjayBvciDigJxgcigwLjI1LCAwLjc1KSNmZmYtIzAwMGDigJ0g4oCTIGdyYWRpZW50IGZyb20gd2hpdGUgdG8gYmxhY2sgd2l0aCBmb2N1cyBwb2ludFxuICAgICAqIGF0IDAuMjUsIDAuNzUuIEZvY3VzIHBvaW50IGNvb3JkaW5hdGVzIGFyZSBpbiAwLi4xIHJhbmdlLiBSYWRpYWwgZ3JhZGllbnRzIGNhbiBvbmx5IGJlIGFwcGxpZWQgdG8gY2lyY2xlcyBhbmQgZWxsaXBzZXMuXG4gICAgID4gUGF0aCBTdHJpbmdcbiAgICAgIyA8cD5QbGVhc2UgcmVmZXIgdG8gPGEgaHJlZj1cImh0dHA6Ly93d3cudzMub3JnL1RSL1NWRy9wYXRocy5odG1sI1BhdGhEYXRhXCIgdGl0bGU9XCJEZXRhaWxzIG9mIGEgcGF0aOKAmXMgZGF0YSBhdHRyaWJ1dGXigJlzIGZvcm1hdCBhcmUgZGVzY3JpYmVkIGluIHRoZSBTVkcgc3BlY2lmaWNhdGlvbi5cIj5TVkcgZG9jdW1lbnRhdGlvbiByZWdhcmRpbmcgcGF0aCBzdHJpbmc8L2E+LiBSYXBoYcOrbCBmdWxseSBzdXBwb3J0cyBpdC48L3A+XG4gICAgID4gQ29sb3VyIFBhcnNpbmdcbiAgICAgIyA8dWw+XG4gICAgICMgICAgIDxsaT5Db2xvdXIgbmFtZSAo4oCcPGNvZGU+cmVkPC9jb2RlPuKAnSwg4oCcPGNvZGU+Z3JlZW48L2NvZGU+4oCdLCDigJw8Y29kZT5jb3JuZmxvd2VyYmx1ZTwvY29kZT7igJ0sIGV0Yyk8L2xpPlxuICAgICAjICAgICA8bGk+I+KAouKAouKAoiDigJQgc2hvcnRlbmVkIEhUTUwgY29sb3VyOiAo4oCcPGNvZGU+IzAwMDwvY29kZT7igJ0sIOKAnDxjb2RlPiNmYzA8L2NvZGU+4oCdLCBldGMpPC9saT5cbiAgICAgIyAgICAgPGxpPiPigKLigKLigKLigKLigKLigKIg4oCUIGZ1bGwgbGVuZ3RoIEhUTUwgY29sb3VyOiAo4oCcPGNvZGU+IzAwMDAwMDwvY29kZT7igJ0sIOKAnDxjb2RlPiNiZDIzMDA8L2NvZGU+4oCdKTwvbGk+XG4gICAgICMgICAgIDxsaT5yZ2Io4oCi4oCi4oCiLCDigKLigKLigKIsIOKAouKAouKAoikg4oCUIHJlZCwgZ3JlZW4gYW5kIGJsdWUgY2hhbm5lbHPigJkgdmFsdWVzOiAo4oCcPGNvZGU+cmdiKDIwMCwmbmJzcDsxMDAsJm5ic3A7MCk8L2NvZGU+4oCdKTwvbGk+XG4gICAgICMgICAgIDxsaT5yZ2Io4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSkg4oCUIHNhbWUgYXMgYWJvdmUsIGJ1dCBpbiAlOiAo4oCcPGNvZGU+cmdiKDEwMCUsJm5ic3A7MTc1JSwmbmJzcDswJSk8L2NvZGU+4oCdKTwvbGk+XG4gICAgICMgICAgIDxsaT5yZ2JhKOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIsIOKAouKAouKAoikg4oCUIHJlZCwgZ3JlZW4gYW5kIGJsdWUgY2hhbm5lbHPigJkgdmFsdWVzOiAo4oCcPGNvZGU+cmdiYSgyMDAsJm5ic3A7MTAwLCZuYnNwOzAsIC41KTwvY29kZT7igJ0pPC9saT5cbiAgICAgIyAgICAgPGxpPnJnYmEo4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSkg4oCUIHNhbWUgYXMgYWJvdmUsIGJ1dCBpbiAlOiAo4oCcPGNvZGU+cmdiYSgxMDAlLCZuYnNwOzE3NSUsJm5ic3A7MCUsIDUwJSk8L2NvZGU+4oCdKTwvbGk+XG4gICAgICMgICAgIDxsaT5oc2Io4oCi4oCi4oCiLCDigKLigKLigKIsIOKAouKAouKAoikg4oCUIGh1ZSwgc2F0dXJhdGlvbiBhbmQgYnJpZ2h0bmVzcyB2YWx1ZXM6ICjigJw8Y29kZT5oc2IoMC41LCZuYnNwOzAuMjUsJm5ic3A7MSk8L2NvZGU+4oCdKTwvbGk+XG4gICAgICMgICAgIDxsaT5oc2Io4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSkg4oCUIHNhbWUgYXMgYWJvdmUsIGJ1dCBpbiAlPC9saT5cbiAgICAgIyAgICAgPGxpPmhzYmEo4oCi4oCi4oCiLCDigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiKSDigJQgc2FtZSBhcyBhYm92ZSwgYnV0IHdpdGggb3BhY2l0eTwvbGk+XG4gICAgICMgICAgIDxsaT5oc2wo4oCi4oCi4oCiLCDigKLigKLigKIsIOKAouKAouKAoikg4oCUIGFsbW9zdCB0aGUgc2FtZSBhcyBoc2IsIHNlZSA8YSBocmVmPVwiaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IU0xfYW5kX0hTVlwiIHRpdGxlPVwiSFNMIGFuZCBIU1YgLSBXaWtpcGVkaWEsIHRoZSBmcmVlIGVuY3ljbG9wZWRpYVwiPldpa2lwZWRpYSBwYWdlPC9hPjwvbGk+XG4gICAgICMgICAgIDxsaT5oc2wo4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSkg4oCUIHNhbWUgYXMgYWJvdmUsIGJ1dCBpbiAlPC9saT5cbiAgICAgIyAgICAgPGxpPmhzbGEo4oCi4oCi4oCiLCDigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiKSDigJQgc2FtZSBhcyBhYm92ZSwgYnV0IHdpdGggb3BhY2l0eTwvbGk+XG4gICAgICMgICAgIDxsaT5PcHRpb25hbGx5IGZvciBoc2IgYW5kIGhzbCB5b3UgY291bGQgc3BlY2lmeSBodWUgYXMgYSBkZWdyZWU6IOKAnDxjb2RlPmhzbCgyNDBkZWcsJm5ic3A7MSwmbmJzcDsuNSk8L2NvZGU+4oCdIG9yLCBpZiB5b3Ugd2FudCB0byBnbyBmYW5jeSwg4oCcPGNvZGU+aHNsKDI0MMKwLCZuYnNwOzEsJm5ic3A7LjUpPC9jb2RlPuKAnTwvbGk+XG4gICAgICMgPC91bD5cbiAgICBcXCovXG4gICAgZWxwcm90by5hdHRyID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lID09IG51bGwpIHtcbiAgICAgICAgICAgIHZhciByZXMgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGEgaW4gdGhpcy5hdHRycykgaWYgKHRoaXMuYXR0cnNbaGFzXShhKSkge1xuICAgICAgICAgICAgICAgIHJlc1thXSA9IHRoaXMuYXR0cnNbYV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXMuZ3JhZGllbnQgJiYgcmVzLmZpbGwgPT0gXCJub25lXCIgJiYgKHJlcy5maWxsID0gcmVzLmdyYWRpZW50KSAmJiBkZWxldGUgcmVzLmdyYWRpZW50O1xuICAgICAgICAgICAgcmVzLnRyYW5zZm9ybSA9IHRoaXMuXy50cmFuc2Zvcm07XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZSA9PSBudWxsICYmIFIuaXMobmFtZSwgXCJzdHJpbmdcIikpIHtcbiAgICAgICAgICAgIGlmIChuYW1lID09IFwiZmlsbFwiICYmIHRoaXMuYXR0cnMuZmlsbCA9PSBcIm5vbmVcIiAmJiB0aGlzLmF0dHJzLmdyYWRpZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cnMuZ3JhZGllbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobmFtZSA9PSBcInRyYW5zZm9ybVwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuXy50cmFuc2Zvcm07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KHNlcGFyYXRvciksXG4gICAgICAgICAgICAgICAgb3V0ID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBuYW1lcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lIGluIHRoaXMuYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0W25hbWVdID0gdGhpcy5hdHRyc1tuYW1lXTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFIuaXModGhpcy5wYXBlci5jdXN0b21BdHRyaWJ1dGVzW25hbWVdLCBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dFtuYW1lXSA9IHRoaXMucGFwZXIuY3VzdG9tQXR0cmlidXRlc1tuYW1lXS5kZWY7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0W25hbWVdID0gUi5fYXZhaWxhYmxlQXR0cnNbbmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGlpIC0gMSA/IG91dCA6IG91dFtuYW1lc1swXV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlID09IG51bGwgJiYgUi5pcyhuYW1lLCBcImFycmF5XCIpKSB7XG4gICAgICAgICAgICBvdXQgPSB7fTtcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGlpID0gbmFtZS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgb3V0W25hbWVbaV1dID0gdGhpcy5hdHRyKG5hbWVbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHt9O1xuICAgICAgICAgICAgcGFyYW1zW25hbWVdID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAobmFtZSAhPSBudWxsICYmIFIuaXMobmFtZSwgXCJvYmplY3RcIikpIHtcbiAgICAgICAgICAgIHBhcmFtcyA9IG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHBhcmFtcykge1xuICAgICAgICAgICAgZXZlKFwicmFwaGFlbC5hdHRyLlwiICsga2V5ICsgXCIuXCIgKyB0aGlzLmlkLCB0aGlzLCBwYXJhbXNba2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChrZXkgaW4gdGhpcy5wYXBlci5jdXN0b21BdHRyaWJ1dGVzKSBpZiAodGhpcy5wYXBlci5jdXN0b21BdHRyaWJ1dGVzW2hhc10oa2V5KSAmJiBwYXJhbXNbaGFzXShrZXkpICYmIFIuaXModGhpcy5wYXBlci5jdXN0b21BdHRyaWJ1dGVzW2tleV0sIFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgIHZhciBwYXIgPSB0aGlzLnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNba2V5XS5hcHBseSh0aGlzLCBbXS5jb25jYXQocGFyYW1zW2tleV0pKTtcbiAgICAgICAgICAgIHRoaXMuYXR0cnNba2V5XSA9IHBhcmFtc1trZXldO1xuICAgICAgICAgICAgZm9yICh2YXIgc3Via2V5IGluIHBhcikgaWYgKHBhcltoYXNdKHN1YmtleSkpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXNbc3Via2V5XSA9IHBhcltzdWJrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNldEZpbGxBbmRTdHJva2UodGhpcywgcGFyYW1zKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC50b0Zyb250XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBNb3ZlcyB0aGUgZWxlbWVudCBzbyBpdCBpcyB0aGUgY2xvc2VzdCB0byB0aGUgdmlld2Vy4oCZcyBleWVzLCBvbiB0b3Agb2Ygb3RoZXIgZWxlbWVudHMuXG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by50b0Zyb250ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ub2RlLnBhcmVudE5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09IFwiYVwiKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUucGFyZW50Tm9kZS5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMubm9kZS5wYXJlbnROb2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMubm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN2ZyA9IHRoaXMucGFwZXI7XG4gICAgICAgIHN2Zy50b3AgIT0gdGhpcyAmJiBSLl90b2Zyb250KHRoaXMsIHN2Zyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudG9CYWNrXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBNb3ZlcyB0aGUgZWxlbWVudCBzbyBpdCBpcyB0aGUgZnVydGhlc3QgZnJvbSB0aGUgdmlld2Vy4oCZcyBleWVzLCBiZWhpbmQgb3RoZXIgZWxlbWVudHMuXG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by50b0JhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLm5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgaWYgKHBhcmVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gXCJhXCIpIHtcbiAgICAgICAgICAgIHBhcmVudC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLm5vZGUucGFyZW50Tm9kZSwgdGhpcy5ub2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5maXJzdENoaWxkKTsgXG4gICAgICAgIH0gZWxzZSBpZiAocGFyZW50LmZpcnN0Q2hpbGQgIT0gdGhpcy5ub2RlKSB7XG4gICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKHRoaXMubm9kZSwgdGhpcy5ub2RlLnBhcmVudE5vZGUuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgUi5fdG9iYWNrKHRoaXMsIHRoaXMucGFwZXIpO1xuICAgICAgICB2YXIgc3ZnID0gdGhpcy5wYXBlcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5pbnNlcnRBZnRlclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogSW5zZXJ0cyBjdXJyZW50IG9iamVjdCBhZnRlciB0aGUgZ2l2ZW4gb25lLlxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8uaW5zZXJ0QWZ0ZXIgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICB2YXIgbm9kZSA9IGVsZW1lbnQubm9kZSB8fCBlbGVtZW50W2VsZW1lbnQubGVuZ3RoIC0gMV0ubm9kZTtcbiAgICAgICAgaWYgKG5vZGUubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5ub2RlLCBub2RlLm5leHRTaWJsaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIFIuX2luc2VydGFmdGVyKHRoaXMsIGVsZW1lbnQsIHRoaXMucGFwZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50Lmluc2VydEJlZm9yZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogSW5zZXJ0cyBjdXJyZW50IG9iamVjdCBiZWZvcmUgdGhlIGdpdmVuIG9uZS5cbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLmluc2VydEJlZm9yZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHZhciBub2RlID0gZWxlbWVudC5ub2RlIHx8IGVsZW1lbnRbMF0ubm9kZTtcbiAgICAgICAgbm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLm5vZGUsIG5vZGUpO1xuICAgICAgICBSLl9pbnNlcnRiZWZvcmUodGhpcywgZWxlbWVudCwgdGhpcy5wYXBlcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZWxwcm90by5ibHVyID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgICAgLy8gRXhwZXJpbWVudGFsLiBObyBTYWZhcmkgc3VwcG9ydC4gVXNlIGl0IG9uIHlvdXIgb3duIHJpc2suXG4gICAgICAgIHZhciB0ID0gdGhpcztcbiAgICAgICAgaWYgKCtzaXplICE9PSAwKSB7XG4gICAgICAgICAgICB2YXIgZmx0ciA9ICQoXCJmaWx0ZXJcIiksXG4gICAgICAgICAgICAgICAgYmx1ciA9ICQoXCJmZUdhdXNzaWFuQmx1clwiKTtcbiAgICAgICAgICAgIHQuYXR0cnMuYmx1ciA9IHNpemU7XG4gICAgICAgICAgICBmbHRyLmlkID0gUi5jcmVhdGVVVUlEKCk7XG4gICAgICAgICAgICAkKGJsdXIsIHtzdGREZXZpYXRpb246ICtzaXplIHx8IDEuNX0pO1xuICAgICAgICAgICAgZmx0ci5hcHBlbmRDaGlsZChibHVyKTtcbiAgICAgICAgICAgIHQucGFwZXIuZGVmcy5hcHBlbmRDaGlsZChmbHRyKTtcbiAgICAgICAgICAgIHQuX2JsdXIgPSBmbHRyO1xuICAgICAgICAgICAgJCh0Lm5vZGUsIHtmaWx0ZXI6IFwidXJsKCNcIiArIGZsdHIuaWQgKyBcIilcIn0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHQuX2JsdXIpIHtcbiAgICAgICAgICAgICAgICB0Ll9ibHVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodC5fYmx1cik7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHQuX2JsdXI7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHQuYXR0cnMuYmx1cjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHQubm9kZS5yZW1vdmVBdHRyaWJ1dGUoXCJmaWx0ZXJcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFIuX2VuZ2luZS5jaXJjbGUgPSBmdW5jdGlvbiAoc3ZnLCB4LCB5LCByKSB7XG4gICAgICAgIHZhciBlbCA9ICQoXCJjaXJjbGVcIik7XG4gICAgICAgIHN2Zy5jYW52YXMgJiYgc3ZnLmNhbnZhcy5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgIHZhciByZXMgPSBuZXcgRWxlbWVudChlbCwgc3ZnKTtcbiAgICAgICAgcmVzLmF0dHJzID0ge2N4OiB4LCBjeTogeSwgcjogciwgZmlsbDogXCJub25lXCIsIHN0cm9rZTogXCIjMDAwXCJ9O1xuICAgICAgICByZXMudHlwZSA9IFwiY2lyY2xlXCI7XG4gICAgICAgICQoZWwsIHJlcy5hdHRycyk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICBSLl9lbmdpbmUucmVjdCA9IGZ1bmN0aW9uIChzdmcsIHgsIHksIHcsIGgsIHIpIHtcbiAgICAgICAgdmFyIGVsID0gJChcInJlY3RcIik7XG4gICAgICAgIHN2Zy5jYW52YXMgJiYgc3ZnLmNhbnZhcy5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgIHZhciByZXMgPSBuZXcgRWxlbWVudChlbCwgc3ZnKTtcbiAgICAgICAgcmVzLmF0dHJzID0ge3g6IHgsIHk6IHksIHdpZHRoOiB3LCBoZWlnaHQ6IGgsIHI6IHIgfHwgMCwgcng6IHIgfHwgMCwgcnk6IHIgfHwgMCwgZmlsbDogXCJub25lXCIsIHN0cm9rZTogXCIjMDAwXCJ9O1xuICAgICAgICByZXMudHlwZSA9IFwicmVjdFwiO1xuICAgICAgICAkKGVsLCByZXMuYXR0cnMpO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gICAgUi5fZW5naW5lLmVsbGlwc2UgPSBmdW5jdGlvbiAoc3ZnLCB4LCB5LCByeCwgcnkpIHtcbiAgICAgICAgdmFyIGVsID0gJChcImVsbGlwc2VcIik7XG4gICAgICAgIHN2Zy5jYW52YXMgJiYgc3ZnLmNhbnZhcy5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgIHZhciByZXMgPSBuZXcgRWxlbWVudChlbCwgc3ZnKTtcbiAgICAgICAgcmVzLmF0dHJzID0ge2N4OiB4LCBjeTogeSwgcng6IHJ4LCByeTogcnksIGZpbGw6IFwibm9uZVwiLCBzdHJva2U6IFwiIzAwMFwifTtcbiAgICAgICAgcmVzLnR5cGUgPSBcImVsbGlwc2VcIjtcbiAgICAgICAgJChlbCwgcmVzLmF0dHJzKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICAgIFIuX2VuZ2luZS5pbWFnZSA9IGZ1bmN0aW9uIChzdmcsIHNyYywgeCwgeSwgdywgaCkge1xuICAgICAgICB2YXIgZWwgPSAkKFwiaW1hZ2VcIik7XG4gICAgICAgICQoZWwsIHt4OiB4LCB5OiB5LCB3aWR0aDogdywgaGVpZ2h0OiBoLCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOiBcIm5vbmVcIn0pO1xuICAgICAgICBlbC5zZXRBdHRyaWJ1dGVOUyh4bGluaywgXCJocmVmXCIsIHNyYyk7XG4gICAgICAgIHN2Zy5jYW52YXMgJiYgc3ZnLmNhbnZhcy5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgIHZhciByZXMgPSBuZXcgRWxlbWVudChlbCwgc3ZnKTtcbiAgICAgICAgcmVzLmF0dHJzID0ge3g6IHgsIHk6IHksIHdpZHRoOiB3LCBoZWlnaHQ6IGgsIHNyYzogc3JjfTtcbiAgICAgICAgcmVzLnR5cGUgPSBcImltYWdlXCI7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICBSLl9lbmdpbmUudGV4dCA9IGZ1bmN0aW9uIChzdmcsIHgsIHksIHRleHQpIHtcbiAgICAgICAgdmFyIGVsID0gJChcInRleHRcIik7XG4gICAgICAgIHN2Zy5jYW52YXMgJiYgc3ZnLmNhbnZhcy5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgIHZhciByZXMgPSBuZXcgRWxlbWVudChlbCwgc3ZnKTtcbiAgICAgICAgcmVzLmF0dHJzID0ge1xuICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICBcInRleHQtYW5jaG9yXCI6IFwibWlkZGxlXCIsXG4gICAgICAgICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgICAgICAgZm9udDogUi5fYXZhaWxhYmxlQXR0cnMuZm9udCxcbiAgICAgICAgICAgIHN0cm9rZTogXCJub25lXCIsXG4gICAgICAgICAgICBmaWxsOiBcIiMwMDBcIlxuICAgICAgICB9O1xuICAgICAgICByZXMudHlwZSA9IFwidGV4dFwiO1xuICAgICAgICBzZXRGaWxsQW5kU3Ryb2tlKHJlcywgcmVzLmF0dHJzKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICAgIFIuX2VuZ2luZS5zZXRTaXplID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoIHx8IHRoaXMud2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMuaGVpZ2h0O1xuICAgICAgICB0aGlzLmNhbnZhcy5zZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiLCB0aGlzLndpZHRoKTtcbiAgICAgICAgdGhpcy5jYW52YXMuc2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgaWYgKHRoaXMuX3ZpZXdCb3gpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0Vmlld0JveC5hcHBseSh0aGlzLCB0aGlzLl92aWV3Qm94KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFIuX2VuZ2luZS5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb24gPSBSLl9nZXRDb250YWluZXIuYXBwbHkoMCwgYXJndW1lbnRzKSxcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IGNvbiAmJiBjb24uY29udGFpbmVyLFxuICAgICAgICAgICAgeCA9IGNvbi54LFxuICAgICAgICAgICAgeSA9IGNvbi55LFxuICAgICAgICAgICAgd2lkdGggPSBjb24ud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSBjb24uaGVpZ2h0O1xuICAgICAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU1ZHIGNvbnRhaW5lciBub3QgZm91bmQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjbnZzID0gJChcInN2Z1wiKSxcbiAgICAgICAgICAgIGNzcyA9IFwib3ZlcmZsb3c6aGlkZGVuO1wiLFxuICAgICAgICAgICAgaXNGbG9hdGluZztcbiAgICAgICAgeCA9IHggfHwgMDtcbiAgICAgICAgeSA9IHkgfHwgMDtcbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCA1MTI7XG4gICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCAzNDI7XG4gICAgICAgICQoY252cywge1xuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgICB2ZXJzaW9uOiAxLjEsXG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICB4bWxuczogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoY29udGFpbmVyID09IDEpIHtcbiAgICAgICAgICAgIGNudnMuc3R5bGUuY3NzVGV4dCA9IGNzcyArIFwicG9zaXRpb246YWJzb2x1dGU7bGVmdDpcIiArIHggKyBcInB4O3RvcDpcIiArIHkgKyBcInB4XCI7XG4gICAgICAgICAgICBSLl9nLmRvYy5ib2R5LmFwcGVuZENoaWxkKGNudnMpO1xuICAgICAgICAgICAgaXNGbG9hdGluZyA9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbnZzLnN0eWxlLmNzc1RleHQgPSBjc3MgKyBcInBvc2l0aW9uOnJlbGF0aXZlXCI7XG4gICAgICAgICAgICBpZiAoY29udGFpbmVyLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKGNudnMsIGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNudnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnRhaW5lciA9IG5ldyBSLl9QYXBlcjtcbiAgICAgICAgY29udGFpbmVyLndpZHRoID0gd2lkdGg7XG4gICAgICAgIGNvbnRhaW5lci5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIGNvbnRhaW5lci5jYW52YXMgPSBjbnZzO1xuICAgICAgICBjb250YWluZXIuY2xlYXIoKTtcbiAgICAgICAgY29udGFpbmVyLl9sZWZ0ID0gY29udGFpbmVyLl90b3AgPSAwO1xuICAgICAgICBpc0Zsb2F0aW5nICYmIChjb250YWluZXIucmVuZGVyZml4ID0gZnVuY3Rpb24gKCkge30pO1xuICAgICAgICBjb250YWluZXIucmVuZGVyZml4KCk7XG4gICAgICAgIHJldHVybiBjb250YWluZXI7XG4gICAgfTtcbiAgICBSLl9lbmdpbmUuc2V0Vmlld0JveCA9IGZ1bmN0aW9uICh4LCB5LCB3LCBoLCBmaXQpIHtcbiAgICAgICAgZXZlKFwicmFwaGFlbC5zZXRWaWV3Qm94XCIsIHRoaXMsIHRoaXMuX3ZpZXdCb3gsIFt4LCB5LCB3LCBoLCBmaXRdKTtcbiAgICAgICAgdmFyIHNpemUgPSBtbWF4KHcgLyB0aGlzLndpZHRoLCBoIC8gdGhpcy5oZWlnaHQpLFxuICAgICAgICAgICAgdG9wID0gdGhpcy50b3AsXG4gICAgICAgICAgICBhc3BlY3RSYXRpbyA9IGZpdCA/IFwibWVldFwiIDogXCJ4TWluWU1pblwiLFxuICAgICAgICAgICAgdmIsXG4gICAgICAgICAgICBzdztcbiAgICAgICAgaWYgKHggPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3ZiU2l6ZSkge1xuICAgICAgICAgICAgICAgIHNpemUgPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3ZiU2l6ZTtcbiAgICAgICAgICAgIHZiID0gXCIwIDAgXCIgKyB0aGlzLndpZHRoICsgUyArIHRoaXMuaGVpZ2h0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fdmJTaXplID0gc2l6ZTtcbiAgICAgICAgICAgIHZiID0geCArIFMgKyB5ICsgUyArIHcgKyBTICsgaDtcbiAgICAgICAgfVxuICAgICAgICAkKHRoaXMuY2FudmFzLCB7XG4gICAgICAgICAgICB2aWV3Qm94OiB2YixcbiAgICAgICAgICAgIHByZXNlcnZlQXNwZWN0UmF0aW86IGFzcGVjdFJhdGlvXG4gICAgICAgIH0pO1xuICAgICAgICB3aGlsZSAoc2l6ZSAmJiB0b3ApIHtcbiAgICAgICAgICAgIHN3ID0gXCJzdHJva2Utd2lkdGhcIiBpbiB0b3AuYXR0cnMgPyB0b3AuYXR0cnNbXCJzdHJva2Utd2lkdGhcIl0gOiAxO1xuICAgICAgICAgICAgdG9wLmF0dHIoe1wic3Ryb2tlLXdpZHRoXCI6IHN3fSk7XG4gICAgICAgICAgICB0b3AuXy5kaXJ0eSA9IDE7XG4gICAgICAgICAgICB0b3AuXy5kaXJ0eVQgPSAxO1xuICAgICAgICAgICAgdG9wID0gdG9wLnByZXY7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdmlld0JveCA9IFt4LCB5LCB3LCBoLCAhIWZpdF07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnJlbmRlcmZpeFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRml4ZXMgdGhlIGlzc3VlIG9mIEZpcmVmb3ggYW5kIElFOSByZWdhcmRpbmcgc3VicGl4ZWwgcmVuZGVyaW5nLiBJZiBwYXBlciBpcyBkZXBlbmRhbnRcbiAgICAgKiBvbiBvdGhlciBlbGVtZW50cyBhZnRlciByZWZsb3cgaXQgY291bGQgc2hpZnQgaGFsZiBwaXhlbCB3aGljaCBjYXVzZSBmb3IgbGluZXMgdG8gbG9zdCB0aGVpciBjcmlzcG5lc3MuXG4gICAgICogVGhpcyBtZXRob2QgZml4ZXMgdGhlIGlzc3VlLlxuICAgICAqKlxuICAgICAgIFNwZWNpYWwgdGhhbmtzIHRvIE1hcml1c3ogTm93YWsgKGh0dHA6Ly93d3cubWVkaWtvby5jb20vKSBmb3IgdGhpcyBtZXRob2QuXG4gICAgXFwqL1xuICAgIFIucHJvdG90eXBlLnJlbmRlcmZpeCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNudnMgPSB0aGlzLmNhbnZhcyxcbiAgICAgICAgICAgIHMgPSBjbnZzLnN0eWxlLFxuICAgICAgICAgICAgcG9zO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcG9zID0gY252cy5nZXRTY3JlZW5DVE0oKSB8fCBjbnZzLmNyZWF0ZVNWR01hdHJpeCgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBwb3MgPSBjbnZzLmNyZWF0ZVNWR01hdHJpeCgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBsZWZ0ID0gLXBvcy5lICUgMSxcbiAgICAgICAgICAgIHRvcCA9IC1wb3MuZiAlIDE7XG4gICAgICAgIGlmIChsZWZ0IHx8IHRvcCkge1xuICAgICAgICAgICAgaWYgKGxlZnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sZWZ0ID0gKHRoaXMuX2xlZnQgKyBsZWZ0KSAlIDE7XG4gICAgICAgICAgICAgICAgcy5sZWZ0ID0gdGhpcy5fbGVmdCArIFwicHhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0b3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90b3AgPSAodGhpcy5fdG9wICsgdG9wKSAlIDE7XG4gICAgICAgICAgICAgICAgcy50b3AgPSB0aGlzLl90b3AgKyBcInB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5jbGVhclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ2xlYXJzIHRoZSBwYXBlciwgaS5lLiByZW1vdmVzIGFsbCB0aGUgZWxlbWVudHMuXG4gICAgXFwqL1xuICAgIFIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBSLmV2ZShcInJhcGhhZWwuY2xlYXJcIiwgdGhpcyk7XG4gICAgICAgIHZhciBjID0gdGhpcy5jYW52YXM7XG4gICAgICAgIHdoaWxlIChjLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIGMucmVtb3ZlQ2hpbGQoYy5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJvdHRvbSA9IHRoaXMudG9wID0gbnVsbDtcbiAgICAgICAgKHRoaXMuZGVzYyA9ICQoXCJkZXNjXCIpKS5hcHBlbmRDaGlsZChSLl9nLmRvYy5jcmVhdGVUZXh0Tm9kZShcIkNyZWF0ZWQgd2l0aCBSYXBoYVxceGVibCBcIiArIFIudmVyc2lvbikpO1xuICAgICAgICBjLmFwcGVuZENoaWxkKHRoaXMuZGVzYyk7XG4gICAgICAgIGMuYXBwZW5kQ2hpbGQodGhpcy5kZWZzID0gJChcImRlZnNcIikpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnJlbW92ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyB0aGUgcGFwZXIgZnJvbSB0aGUgRE9NLlxuICAgIFxcKi9cbiAgICBSLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGV2ZShcInJhcGhhZWwucmVtb3ZlXCIsIHRoaXMpO1xuICAgICAgICB0aGlzLmNhbnZhcy5wYXJlbnROb2RlICYmIHRoaXMuY2FudmFzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5jYW52YXMpO1xuICAgICAgICBmb3IgKHZhciBpIGluIHRoaXMpIHtcbiAgICAgICAgICAgIHRoaXNbaV0gPSB0eXBlb2YgdGhpc1tpXSA9PSBcImZ1bmN0aW9uXCIgPyBSLl9yZW1vdmVkRmFjdG9yeShpKSA6IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHZhciBzZXRwcm90byA9IFIuc3Q7XG4gICAgZm9yICh2YXIgbWV0aG9kIGluIGVscHJvdG8pIGlmIChlbHByb3RvW2hhc10obWV0aG9kKSAmJiAhc2V0cHJvdG9baGFzXShtZXRob2QpKSB7XG4gICAgICAgIHNldHByb3RvW21ldGhvZF0gPSAoZnVuY3Rpb24gKG1ldGhvZG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgICAgICBlbFttZXRob2RuYW1lXS5hcHBseShlbCwgYXJnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pKG1ldGhvZCk7XG4gICAgfVxufSh3aW5kb3cuUmFwaGFlbCk7IiwiLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQIFxcXFxcbi8vIOKUgiBSYXBoYcOrbCAtIEphdmFTY3JpcHQgVmVjdG9yIExpYnJhcnkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgXFxcXFxuLy8g4pSc4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkIFxcXFxcbi8vIOKUgiBWTUwgTW9kdWxlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiBcXFxcXG4vLyDilJzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilKQgXFxcXFxuLy8g4pSCIENvcHlyaWdodCAoYykgMjAwOC0yMDExIERtaXRyeSBCYXJhbm92c2tpeSAoaHR0cDovL3JhcGhhZWxqcy5jb20pICAg4pSCIFxcXFxcbi8vIOKUgiBDb3B5cmlnaHQgKGMpIDIwMDgtMjAxMSBTZW5jaGEgTGFicyAoaHR0cDovL3NlbmNoYS5jb20pICAgICAgICAgICAgIOKUgiBcXFxcXG4vLyDilIIgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCAoaHR0cDovL3JhcGhhZWxqcy5jb20vbGljZW5zZS5odG1sKSBsaWNlbnNlLiDilIIgXFxcXFxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYIFxcXFxcbndpbmRvdy5SYXBoYWVsICYmIHdpbmRvdy5SYXBoYWVsLnZtbCAmJiBmdW5jdGlvbiAoUikge1xuICAgIHZhciBoYXMgPSBcImhhc093blByb3BlcnR5XCIsXG4gICAgICAgIFN0ciA9IFN0cmluZyxcbiAgICAgICAgdG9GbG9hdCA9IHBhcnNlRmxvYXQsXG4gICAgICAgIG1hdGggPSBNYXRoLFxuICAgICAgICByb3VuZCA9IG1hdGgucm91bmQsXG4gICAgICAgIG1tYXggPSBtYXRoLm1heCxcbiAgICAgICAgbW1pbiA9IG1hdGgubWluLFxuICAgICAgICBhYnMgPSBtYXRoLmFicyxcbiAgICAgICAgZmlsbFN0cmluZyA9IFwiZmlsbFwiLFxuICAgICAgICBzZXBhcmF0b3IgPSAvWywgXSsvLFxuICAgICAgICBldmUgPSBSLmV2ZSxcbiAgICAgICAgbXMgPSBcIiBwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnRcIixcbiAgICAgICAgUyA9IFwiIFwiLFxuICAgICAgICBFID0gXCJcIixcbiAgICAgICAgbWFwID0ge006IFwibVwiLCBMOiBcImxcIiwgQzogXCJjXCIsIFo6IFwieFwiLCBtOiBcInRcIiwgbDogXCJyXCIsIGM6IFwidlwiLCB6OiBcInhcIn0sXG4gICAgICAgIGJpdGVzID0gLyhbY2xtel0pLD8oW15jbG16XSopL2dpLFxuICAgICAgICBibHVycmVnZXhwID0gLyBwcm9naWQ6XFxTK0JsdXJcXChbXlxcKV0rXFwpL2csXG4gICAgICAgIHZhbCA9IC8tP1teLFxccy1dKy9nLFxuICAgICAgICBjc3NEb3QgPSBcInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDt0b3A6MDt3aWR0aDoxcHg7aGVpZ2h0OjFweFwiLFxuICAgICAgICB6b29tID0gMjE2MDAsXG4gICAgICAgIHBhdGhUeXBlcyA9IHtwYXRoOiAxLCByZWN0OiAxLCBpbWFnZTogMX0sXG4gICAgICAgIG92YWxUeXBlcyA9IHtjaXJjbGU6IDEsIGVsbGlwc2U6IDF9LFxuICAgICAgICBwYXRoMnZtbCA9IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgICAgICAgICB2YXIgdG90YWwgPSAgL1thaHFzdHZdL2lnLFxuICAgICAgICAgICAgICAgIGNvbW1hbmQgPSBSLl9wYXRoVG9BYnNvbHV0ZTtcbiAgICAgICAgICAgIFN0cihwYXRoKS5tYXRjaCh0b3RhbCkgJiYgKGNvbW1hbmQgPSBSLl9wYXRoMmN1cnZlKTtcbiAgICAgICAgICAgIHRvdGFsID0gL1tjbG16XS9nO1xuICAgICAgICAgICAgaWYgKGNvbW1hbmQgPT0gUi5fcGF0aFRvQWJzb2x1dGUgJiYgIVN0cihwYXRoKS5tYXRjaCh0b3RhbCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzID0gU3RyKHBhdGgpLnJlcGxhY2UoYml0ZXMsIGZ1bmN0aW9uIChhbGwsIGNvbW1hbmQsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHMgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzTW92ZSA9IGNvbW1hbmQudG9Mb3dlckNhc2UoKSA9PSBcIm1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IG1hcFtjb21tYW5kXTtcbiAgICAgICAgICAgICAgICAgICAgYXJncy5yZXBsYWNlKHZhbCwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNNb3ZlICYmIHZhbHMubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgKz0gdmFscyArIG1hcFtjb21tYW5kID09IFwibVwiID8gXCJsXCIgOiBcIkxcIl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFscy5wdXNoKHJvdW5kKHZhbHVlICogem9vbSkpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcyArIHZhbHM7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwYSA9IGNvbW1hbmQocGF0aCksIHAsIHI7XG4gICAgICAgICAgICByZXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHBhLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwID0gcGFbaV07XG4gICAgICAgICAgICAgICAgciA9IHBhW2ldWzBdLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgciA9PSBcInpcIiAmJiAociA9IFwieFwiKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMSwgamogPSBwLmxlbmd0aDsgaiA8IGpqOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgciArPSByb3VuZChwW2pdICogem9vbSkgKyAoaiAhPSBqaiAtIDEgPyBcIixcIiA6IEUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXMucHVzaChyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXMuam9pbihTKTtcbiAgICAgICAgfSxcbiAgICAgICAgY29tcGVuc2F0aW9uID0gZnVuY3Rpb24gKGRlZywgZHgsIGR5KSB7XG4gICAgICAgICAgICB2YXIgbSA9IFIubWF0cml4KCk7XG4gICAgICAgICAgICBtLnJvdGF0ZSgtZGVnLCAuNSwgLjUpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkeDogbS54KGR4LCBkeSksXG4gICAgICAgICAgICAgICAgZHk6IG0ueShkeCwgZHkpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBzZXRDb29yZHMgPSBmdW5jdGlvbiAocCwgc3gsIHN5LCBkeCwgZHksIGRlZykge1xuICAgICAgICAgICAgdmFyIF8gPSBwLl8sXG4gICAgICAgICAgICAgICAgbSA9IHAubWF0cml4LFxuICAgICAgICAgICAgICAgIGZpbGxwb3MgPSBfLmZpbGxwb3MsXG4gICAgICAgICAgICAgICAgbyA9IHAubm9kZSxcbiAgICAgICAgICAgICAgICBzID0gby5zdHlsZSxcbiAgICAgICAgICAgICAgICB5ID0gMSxcbiAgICAgICAgICAgICAgICBmbGlwID0gXCJcIixcbiAgICAgICAgICAgICAgICBkeGR5LFxuICAgICAgICAgICAgICAgIGt4ID0gem9vbSAvIHN4LFxuICAgICAgICAgICAgICAgIGt5ID0gem9vbSAvIHN5O1xuICAgICAgICAgICAgcy52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgICAgIGlmICghc3ggfHwgIXN5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgby5jb29yZHNpemUgPSBhYnMoa3gpICsgUyArIGFicyhreSk7XG4gICAgICAgICAgICBzLnJvdGF0aW9uID0gZGVnICogKHN4ICogc3kgPCAwID8gLTEgOiAxKTtcbiAgICAgICAgICAgIGlmIChkZWcpIHtcbiAgICAgICAgICAgICAgICB2YXIgYyA9IGNvbXBlbnNhdGlvbihkZWcsIGR4LCBkeSk7XG4gICAgICAgICAgICAgICAgZHggPSBjLmR4O1xuICAgICAgICAgICAgICAgIGR5ID0gYy5keTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN4IDwgMCAmJiAoZmxpcCArPSBcInhcIik7XG4gICAgICAgICAgICBzeSA8IDAgJiYgKGZsaXAgKz0gXCIgeVwiKSAmJiAoeSA9IC0xKTtcbiAgICAgICAgICAgIHMuZmxpcCA9IGZsaXA7XG4gICAgICAgICAgICBvLmNvb3Jkb3JpZ2luID0gKGR4ICogLWt4KSArIFMgKyAoZHkgKiAta3kpO1xuICAgICAgICAgICAgaWYgKGZpbGxwb3MgfHwgXy5maWxsc2l6ZSkge1xuICAgICAgICAgICAgICAgIHZhciBmaWxsID0gby5nZXRFbGVtZW50c0J5VGFnTmFtZShmaWxsU3RyaW5nKTtcbiAgICAgICAgICAgICAgICBmaWxsID0gZmlsbCAmJiBmaWxsWzBdO1xuICAgICAgICAgICAgICAgIG8ucmVtb3ZlQ2hpbGQoZmlsbCk7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGxwb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgYyA9IGNvbXBlbnNhdGlvbihkZWcsIG0ueChmaWxscG9zWzBdLCBmaWxscG9zWzFdKSwgbS55KGZpbGxwb3NbMF0sIGZpbGxwb3NbMV0pKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsbC5wb3NpdGlvbiA9IGMuZHggKiB5ICsgUyArIGMuZHkgKiB5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoXy5maWxsc2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICBmaWxsLnNpemUgPSBfLmZpbGxzaXplWzBdICogYWJzKHN4KSArIFMgKyBfLmZpbGxzaXplWzFdICogYWJzKHN5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgby5hcHBlbmRDaGlsZChmaWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHMudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICB9O1xuICAgIFIudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAgXCJZb3VyIGJyb3dzZXIgZG9lc25cXHUyMDE5dCBzdXBwb3J0IFNWRy4gRmFsbGluZyBkb3duIHRvIFZNTC5cXG5Zb3UgYXJlIHJ1bm5pbmcgUmFwaGFcXHhlYmwgXCIgKyB0aGlzLnZlcnNpb247XG4gICAgfTtcbiAgICB2YXIgYWRkQXJyb3cgPSBmdW5jdGlvbiAobywgdmFsdWUsIGlzRW5kKSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSBTdHIodmFsdWUpLnRvTG93ZXJDYXNlKCkuc3BsaXQoXCItXCIpLFxuICAgICAgICAgICAgc2UgPSBpc0VuZCA/IFwiZW5kXCIgOiBcInN0YXJ0XCIsXG4gICAgICAgICAgICBpID0gdmFsdWVzLmxlbmd0aCxcbiAgICAgICAgICAgIHR5cGUgPSBcImNsYXNzaWNcIixcbiAgICAgICAgICAgIHcgPSBcIm1lZGl1bVwiLFxuICAgICAgICAgICAgaCA9IFwibWVkaXVtXCI7XG4gICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgIHN3aXRjaCAodmFsdWVzW2ldKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImJsb2NrXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImNsYXNzaWNcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwib3ZhbFwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJkaWFtb25kXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcIm9wZW5cIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwibm9uZVwiOlxuICAgICAgICAgICAgICAgICAgICB0eXBlID0gdmFsdWVzW2ldO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwid2lkZVwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJuYXJyb3dcIjogaCA9IHZhbHVlc1tpXTsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcImxvbmdcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwic2hvcnRcIjogdyA9IHZhbHVlc1tpXTsgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN0cm9rZSA9IG8ubm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInN0cm9rZVwiKVswXTtcbiAgICAgICAgc3Ryb2tlW3NlICsgXCJhcnJvd1wiXSA9IHR5cGU7XG4gICAgICAgIHN0cm9rZVtzZSArIFwiYXJyb3dsZW5ndGhcIl0gPSB3O1xuICAgICAgICBzdHJva2Vbc2UgKyBcImFycm93d2lkdGhcIl0gPSBoO1xuICAgIH0sXG4gICAgc2V0RmlsbEFuZFN0cm9rZSA9IGZ1bmN0aW9uIChvLCBwYXJhbXMpIHtcbiAgICAgICAgLy8gby5wYXBlci5jYW52YXMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICBvLmF0dHJzID0gby5hdHRycyB8fCB7fTtcbiAgICAgICAgdmFyIG5vZGUgPSBvLm5vZGUsXG4gICAgICAgICAgICBhID0gby5hdHRycyxcbiAgICAgICAgICAgIHMgPSBub2RlLnN0eWxlLFxuICAgICAgICAgICAgeHksXG4gICAgICAgICAgICBuZXdwYXRoID0gcGF0aFR5cGVzW28udHlwZV0gJiYgKHBhcmFtcy54ICE9IGEueCB8fCBwYXJhbXMueSAhPSBhLnkgfHwgcGFyYW1zLndpZHRoICE9IGEud2lkdGggfHwgcGFyYW1zLmhlaWdodCAhPSBhLmhlaWdodCB8fCBwYXJhbXMuY3ggIT0gYS5jeCB8fCBwYXJhbXMuY3kgIT0gYS5jeSB8fCBwYXJhbXMucnggIT0gYS5yeCB8fCBwYXJhbXMucnkgIT0gYS5yeSB8fCBwYXJhbXMuciAhPSBhLnIpLFxuICAgICAgICAgICAgaXNPdmFsID0gb3ZhbFR5cGVzW28udHlwZV0gJiYgKGEuY3ggIT0gcGFyYW1zLmN4IHx8IGEuY3kgIT0gcGFyYW1zLmN5IHx8IGEuciAhPSBwYXJhbXMuciB8fCBhLnJ4ICE9IHBhcmFtcy5yeCB8fCBhLnJ5ICE9IHBhcmFtcy5yeSksXG4gICAgICAgICAgICByZXMgPSBvO1xuXG5cbiAgICAgICAgZm9yICh2YXIgcGFyIGluIHBhcmFtcykgaWYgKHBhcmFtc1toYXNdKHBhcikpIHtcbiAgICAgICAgICAgIGFbcGFyXSA9IHBhcmFtc1twYXJdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZXdwYXRoKSB7XG4gICAgICAgICAgICBhLnBhdGggPSBSLl9nZXRQYXRoW28udHlwZV0obyk7XG4gICAgICAgICAgICBvLl8uZGlydHkgPSAxO1xuICAgICAgICB9XG4gICAgICAgIHBhcmFtcy5ocmVmICYmIChub2RlLmhyZWYgPSBwYXJhbXMuaHJlZik7XG4gICAgICAgIHBhcmFtcy50aXRsZSAmJiAobm9kZS50aXRsZSA9IHBhcmFtcy50aXRsZSk7XG4gICAgICAgIHBhcmFtcy50YXJnZXQgJiYgKG5vZGUudGFyZ2V0ID0gcGFyYW1zLnRhcmdldCk7XG4gICAgICAgIHBhcmFtcy5jdXJzb3IgJiYgKHMuY3Vyc29yID0gcGFyYW1zLmN1cnNvcik7XG4gICAgICAgIFwiYmx1clwiIGluIHBhcmFtcyAmJiBvLmJsdXIocGFyYW1zLmJsdXIpO1xuICAgICAgICBpZiAocGFyYW1zLnBhdGggJiYgby50eXBlID09IFwicGF0aFwiIHx8IG5ld3BhdGgpIHtcbiAgICAgICAgICAgIG5vZGUucGF0aCA9IHBhdGgydm1sKH5TdHIoYS5wYXRoKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJyXCIpID8gUi5fcGF0aFRvQWJzb2x1dGUoYS5wYXRoKSA6IGEucGF0aCk7XG4gICAgICAgICAgICBpZiAoby50eXBlID09IFwiaW1hZ2VcIikge1xuICAgICAgICAgICAgICAgIG8uXy5maWxscG9zID0gW2EueCwgYS55XTtcbiAgICAgICAgICAgICAgICBvLl8uZmlsbHNpemUgPSBbYS53aWR0aCwgYS5oZWlnaHRdO1xuICAgICAgICAgICAgICAgIHNldENvb3JkcyhvLCAxLCAxLCAwLCAwLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcInRyYW5zZm9ybVwiIGluIHBhcmFtcyAmJiBvLnRyYW5zZm9ybShwYXJhbXMudHJhbnNmb3JtKTtcbiAgICAgICAgaWYgKGlzT3ZhbCkge1xuICAgICAgICAgICAgdmFyIGN4ID0gK2EuY3gsXG4gICAgICAgICAgICAgICAgY3kgPSArYS5jeSxcbiAgICAgICAgICAgICAgICByeCA9ICthLnJ4IHx8ICthLnIgfHwgMCxcbiAgICAgICAgICAgICAgICByeSA9ICthLnJ5IHx8ICthLnIgfHwgMDtcbiAgICAgICAgICAgIG5vZGUucGF0aCA9IFIuZm9ybWF0KFwiYXJ7MH0sezF9LHsyfSx7M30sezR9LHsxfSx7NH0sezF9eFwiLCByb3VuZCgoY3ggLSByeCkgKiB6b29tKSwgcm91bmQoKGN5IC0gcnkpICogem9vbSksIHJvdW5kKChjeCArIHJ4KSAqIHpvb20pLCByb3VuZCgoY3kgKyByeSkgKiB6b29tKSwgcm91bmQoY3ggKiB6b29tKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFwiY2xpcC1yZWN0XCIgaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICB2YXIgcmVjdCA9IFN0cihwYXJhbXNbXCJjbGlwLXJlY3RcIl0pLnNwbGl0KHNlcGFyYXRvcik7XG4gICAgICAgICAgICBpZiAocmVjdC5sZW5ndGggPT0gNCkge1xuICAgICAgICAgICAgICAgIHJlY3RbMl0gPSArcmVjdFsyXSArICgrcmVjdFswXSk7XG4gICAgICAgICAgICAgICAgcmVjdFszXSA9ICtyZWN0WzNdICsgKCtyZWN0WzFdKTtcbiAgICAgICAgICAgICAgICB2YXIgZGl2ID0gbm9kZS5jbGlwUmVjdCB8fCBSLl9nLmRvYy5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgICAgICAgICBkc3R5bGUgPSBkaXYuc3R5bGU7XG4gICAgICAgICAgICAgICAgZHN0eWxlLmNsaXAgPSBSLmZvcm1hdChcInJlY3QoezF9cHggezJ9cHggezN9cHggezB9cHgpXCIsIHJlY3QpO1xuICAgICAgICAgICAgICAgIGlmICghbm9kZS5jbGlwUmVjdCkge1xuICAgICAgICAgICAgICAgICAgICBkc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgICAgICAgICAgICAgICAgIGRzdHlsZS50b3AgPSAwO1xuICAgICAgICAgICAgICAgICAgICBkc3R5bGUubGVmdCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGRzdHlsZS53aWR0aCA9IG8ucGFwZXIud2lkdGggKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgIGRzdHlsZS5oZWlnaHQgPSBvLnBhcGVyLmhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShkaXYsIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuY2xpcFJlY3QgPSBkaXY7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFwYXJhbXNbXCJjbGlwLXJlY3RcIl0pIHtcbiAgICAgICAgICAgICAgICBub2RlLmNsaXBSZWN0ICYmIChub2RlLmNsaXBSZWN0LnN0eWxlLmNsaXAgPSBcImF1dG9cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG8udGV4dHBhdGgpIHtcbiAgICAgICAgICAgIHZhciB0ZXh0cGF0aFN0eWxlID0gby50ZXh0cGF0aC5zdHlsZTtcbiAgICAgICAgICAgIHBhcmFtcy5mb250ICYmICh0ZXh0cGF0aFN0eWxlLmZvbnQgPSBwYXJhbXMuZm9udCk7XG4gICAgICAgICAgICBwYXJhbXNbXCJmb250LWZhbWlseVwiXSAmJiAodGV4dHBhdGhTdHlsZS5mb250RmFtaWx5ID0gJ1wiJyArIHBhcmFtc1tcImZvbnQtZmFtaWx5XCJdLnNwbGl0KFwiLFwiKVswXS5yZXBsYWNlKC9eWydcIl0rfFsnXCJdKyQvZywgRSkgKyAnXCInKTtcbiAgICAgICAgICAgIHBhcmFtc1tcImZvbnQtc2l6ZVwiXSAmJiAodGV4dHBhdGhTdHlsZS5mb250U2l6ZSA9IHBhcmFtc1tcImZvbnQtc2l6ZVwiXSk7XG4gICAgICAgICAgICBwYXJhbXNbXCJmb250LXdlaWdodFwiXSAmJiAodGV4dHBhdGhTdHlsZS5mb250V2VpZ2h0ID0gcGFyYW1zW1wiZm9udC13ZWlnaHRcIl0pO1xuICAgICAgICAgICAgcGFyYW1zW1wiZm9udC1zdHlsZVwiXSAmJiAodGV4dHBhdGhTdHlsZS5mb250U3R5bGUgPSBwYXJhbXNbXCJmb250LXN0eWxlXCJdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJhcnJvdy1zdGFydFwiIGluIHBhcmFtcykge1xuICAgICAgICAgICAgYWRkQXJyb3cocmVzLCBwYXJhbXNbXCJhcnJvdy1zdGFydFwiXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFwiYXJyb3ctZW5kXCIgaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICBhZGRBcnJvdyhyZXMsIHBhcmFtc1tcImFycm93LWVuZFwiXSwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcmFtcy5vcGFjaXR5ICE9IG51bGwgfHwgXG4gICAgICAgICAgICBwYXJhbXNbXCJzdHJva2Utd2lkdGhcIl0gIT0gbnVsbCB8fFxuICAgICAgICAgICAgcGFyYW1zLmZpbGwgIT0gbnVsbCB8fFxuICAgICAgICAgICAgcGFyYW1zLnNyYyAhPSBudWxsIHx8XG4gICAgICAgICAgICBwYXJhbXMuc3Ryb2tlICE9IG51bGwgfHxcbiAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS13aWR0aFwiXSAhPSBudWxsIHx8XG4gICAgICAgICAgICBwYXJhbXNbXCJzdHJva2Utb3BhY2l0eVwiXSAhPSBudWxsIHx8XG4gICAgICAgICAgICBwYXJhbXNbXCJmaWxsLW9wYWNpdHlcIl0gIT0gbnVsbCB8fFxuICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLWRhc2hhcnJheVwiXSAhPSBudWxsIHx8XG4gICAgICAgICAgICBwYXJhbXNbXCJzdHJva2UtbWl0ZXJsaW1pdFwiXSAhPSBudWxsIHx8XG4gICAgICAgICAgICBwYXJhbXNbXCJzdHJva2UtbGluZWpvaW5cIl0gIT0gbnVsbCB8fFxuICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLWxpbmVjYXBcIl0gIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGZpbGwgPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKGZpbGxTdHJpbmcpLFxuICAgICAgICAgICAgICAgIG5ld2ZpbGwgPSBmYWxzZTtcbiAgICAgICAgICAgIGZpbGwgPSBmaWxsICYmIGZpbGxbMF07XG4gICAgICAgICAgICAhZmlsbCAmJiAobmV3ZmlsbCA9IGZpbGwgPSBjcmVhdGVOb2RlKGZpbGxTdHJpbmcpKTtcbiAgICAgICAgICAgIGlmIChvLnR5cGUgPT0gXCJpbWFnZVwiICYmIHBhcmFtcy5zcmMpIHtcbiAgICAgICAgICAgICAgICBmaWxsLnNyYyA9IHBhcmFtcy5zcmM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJhbXMuZmlsbCAmJiAoZmlsbC5vbiA9IHRydWUpO1xuICAgICAgICAgICAgaWYgKGZpbGwub24gPT0gbnVsbCB8fCBwYXJhbXMuZmlsbCA9PSBcIm5vbmVcIiB8fCBwYXJhbXMuZmlsbCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGZpbGwub24gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmaWxsLm9uICYmIHBhcmFtcy5maWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzVVJMID0gU3RyKHBhcmFtcy5maWxsKS5tYXRjaChSLl9JU1VSTCk7XG4gICAgICAgICAgICAgICAgaWYgKGlzVVJMKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGwucGFyZW50Tm9kZSA9PSBub2RlICYmIG5vZGUucmVtb3ZlQ2hpbGQoZmlsbCk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGwucm90YXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZmlsbC5zcmMgPSBpc1VSTFsxXTtcbiAgICAgICAgICAgICAgICAgICAgZmlsbC50eXBlID0gXCJ0aWxlXCI7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYm94ID0gby5nZXRCQm94KDEpO1xuICAgICAgICAgICAgICAgICAgICBmaWxsLnBvc2l0aW9uID0gYmJveC54ICsgUyArIGJib3gueTtcbiAgICAgICAgICAgICAgICAgICAgby5fLmZpbGxwb3MgPSBbYmJveC54LCBiYm94LnldO1xuXG4gICAgICAgICAgICAgICAgICAgIFIuX3ByZWxvYWQoaXNVUkxbMV0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8uXy5maWxsc2l6ZSA9IFt0aGlzLm9mZnNldFdpZHRoLCB0aGlzLm9mZnNldEhlaWdodF07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGwuY29sb3IgPSBSLmdldFJHQihwYXJhbXMuZmlsbCkuaGV4O1xuICAgICAgICAgICAgICAgICAgICBmaWxsLnNyYyA9IEU7XG4gICAgICAgICAgICAgICAgICAgIGZpbGwudHlwZSA9IFwic29saWRcIjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFIuZ2V0UkdCKHBhcmFtcy5maWxsKS5lcnJvciAmJiAocmVzLnR5cGUgaW4ge2NpcmNsZTogMSwgZWxsaXBzZTogMX0gfHwgU3RyKHBhcmFtcy5maWxsKS5jaGFyQXQoKSAhPSBcInJcIikgJiYgYWRkR3JhZGllbnRGaWxsKHJlcywgcGFyYW1zLmZpbGwsIGZpbGwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhLmZpbGwgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGEuZ3JhZGllbnQgPSBwYXJhbXMuZmlsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGwucm90YXRlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXCJmaWxsLW9wYWNpdHlcIiBpbiBwYXJhbXMgfHwgXCJvcGFjaXR5XCIgaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wYWNpdHkgPSAoKCthW1wiZmlsbC1vcGFjaXR5XCJdICsgMSB8fCAyKSAtIDEpICogKCgrYS5vcGFjaXR5ICsgMSB8fCAyKSAtIDEpICogKCgrUi5nZXRSR0IocGFyYW1zLmZpbGwpLm8gKyAxIHx8IDIpIC0gMSk7XG4gICAgICAgICAgICAgICAgb3BhY2l0eSA9IG1taW4obW1heChvcGFjaXR5LCAwKSwgMSk7XG4gICAgICAgICAgICAgICAgZmlsbC5vcGFjaXR5ID0gb3BhY2l0eTtcbiAgICAgICAgICAgICAgICBpZiAoZmlsbC5zcmMpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsbC5jb2xvciA9IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQoZmlsbCk7XG4gICAgICAgICAgICB2YXIgc3Ryb2tlID0gKG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzdHJva2VcIikgJiYgbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInN0cm9rZVwiKVswXSksXG4gICAgICAgICAgICBuZXdzdHJva2UgPSBmYWxzZTtcbiAgICAgICAgICAgICFzdHJva2UgJiYgKG5ld3N0cm9rZSA9IHN0cm9rZSA9IGNyZWF0ZU5vZGUoXCJzdHJva2VcIikpO1xuICAgICAgICAgICAgaWYgKChwYXJhbXMuc3Ryb2tlICYmIHBhcmFtcy5zdHJva2UgIT0gXCJub25lXCIpIHx8XG4gICAgICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLXdpZHRoXCJdIHx8XG4gICAgICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLW9wYWNpdHlcIl0gIT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS1kYXNoYXJyYXlcIl0gfHxcbiAgICAgICAgICAgICAgICBwYXJhbXNbXCJzdHJva2UtbWl0ZXJsaW1pdFwiXSB8fFxuICAgICAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS1saW5lam9pblwiXSB8fFxuICAgICAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS1saW5lY2FwXCJdKSB7XG4gICAgICAgICAgICAgICAgc3Ryb2tlLm9uID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIChwYXJhbXMuc3Ryb2tlID09IFwibm9uZVwiIHx8IHBhcmFtcy5zdHJva2UgPT09IG51bGwgfHwgc3Ryb2tlLm9uID09IG51bGwgfHwgcGFyYW1zLnN0cm9rZSA9PSAwIHx8IHBhcmFtc1tcInN0cm9rZS13aWR0aFwiXSA9PSAwKSAmJiAoc3Ryb2tlLm9uID0gZmFsc2UpO1xuICAgICAgICAgICAgdmFyIHN0cm9rZUNvbG9yID0gUi5nZXRSR0IocGFyYW1zLnN0cm9rZSk7XG4gICAgICAgICAgICBzdHJva2Uub24gJiYgcGFyYW1zLnN0cm9rZSAmJiAoc3Ryb2tlLmNvbG9yID0gc3Ryb2tlQ29sb3IuaGV4KTtcbiAgICAgICAgICAgIG9wYWNpdHkgPSAoKCthW1wic3Ryb2tlLW9wYWNpdHlcIl0gKyAxIHx8IDIpIC0gMSkgKiAoKCthLm9wYWNpdHkgKyAxIHx8IDIpIC0gMSkgKiAoKCtzdHJva2VDb2xvci5vICsgMSB8fCAyKSAtIDEpO1xuICAgICAgICAgICAgdmFyIHdpZHRoID0gKHRvRmxvYXQocGFyYW1zW1wic3Ryb2tlLXdpZHRoXCJdKSB8fCAxKSAqIC43NTtcbiAgICAgICAgICAgIG9wYWNpdHkgPSBtbWluKG1tYXgob3BhY2l0eSwgMCksIDEpO1xuICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLXdpZHRoXCJdID09IG51bGwgJiYgKHdpZHRoID0gYVtcInN0cm9rZS13aWR0aFwiXSk7XG4gICAgICAgICAgICBwYXJhbXNbXCJzdHJva2Utd2lkdGhcIl0gJiYgKHN0cm9rZS53ZWlnaHQgPSB3aWR0aCk7XG4gICAgICAgICAgICB3aWR0aCAmJiB3aWR0aCA8IDEgJiYgKG9wYWNpdHkgKj0gd2lkdGgpICYmIChzdHJva2Uud2VpZ2h0ID0gMSk7XG4gICAgICAgICAgICBzdHJva2Uub3BhY2l0eSA9IG9wYWNpdHk7XG4gICAgICAgIFxuICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLWxpbmVqb2luXCJdICYmIChzdHJva2Uuam9pbnN0eWxlID0gcGFyYW1zW1wic3Ryb2tlLWxpbmVqb2luXCJdIHx8IFwibWl0ZXJcIik7XG4gICAgICAgICAgICBzdHJva2UubWl0ZXJsaW1pdCA9IHBhcmFtc1tcInN0cm9rZS1taXRlcmxpbWl0XCJdIHx8IDg7XG4gICAgICAgICAgICBwYXJhbXNbXCJzdHJva2UtbGluZWNhcFwiXSAmJiAoc3Ryb2tlLmVuZGNhcCA9IHBhcmFtc1tcInN0cm9rZS1saW5lY2FwXCJdID09IFwiYnV0dFwiID8gXCJmbGF0XCIgOiBwYXJhbXNbXCJzdHJva2UtbGluZWNhcFwiXSA9PSBcInNxdWFyZVwiID8gXCJzcXVhcmVcIiA6IFwicm91bmRcIik7XG4gICAgICAgICAgICBpZiAocGFyYW1zW1wic3Ryb2tlLWRhc2hhcnJheVwiXSkge1xuICAgICAgICAgICAgICAgIHZhciBkYXNoYXJyYXkgPSB7XG4gICAgICAgICAgICAgICAgICAgIFwiLVwiOiBcInNob3J0ZGFzaFwiLFxuICAgICAgICAgICAgICAgICAgICBcIi5cIjogXCJzaG9ydGRvdFwiLFxuICAgICAgICAgICAgICAgICAgICBcIi0uXCI6IFwic2hvcnRkYXNoZG90XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiLS4uXCI6IFwic2hvcnRkYXNoZG90ZG90XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiLiBcIjogXCJkb3RcIixcbiAgICAgICAgICAgICAgICAgICAgXCItIFwiOiBcImRhc2hcIixcbiAgICAgICAgICAgICAgICAgICAgXCItLVwiOiBcImxvbmdkYXNoXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiLSAuXCI6IFwiZGFzaGRvdFwiLFxuICAgICAgICAgICAgICAgICAgICBcIi0tLlwiOiBcImxvbmdkYXNoZG90XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiLS0uLlwiOiBcImxvbmdkYXNoZG90ZG90XCJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHN0cm9rZS5kYXNoc3R5bGUgPSBkYXNoYXJyYXlbaGFzXShwYXJhbXNbXCJzdHJva2UtZGFzaGFycmF5XCJdKSA/IGRhc2hhcnJheVtwYXJhbXNbXCJzdHJva2UtZGFzaGFycmF5XCJdXSA6IEU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdzdHJva2UgJiYgbm9kZS5hcHBlbmRDaGlsZChzdHJva2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXMudHlwZSA9PSBcInRleHRcIikge1xuICAgICAgICAgICAgcmVzLnBhcGVyLmNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gRTtcbiAgICAgICAgICAgIHZhciBzcGFuID0gcmVzLnBhcGVyLnNwYW4sXG4gICAgICAgICAgICAgICAgbSA9IDEwMCxcbiAgICAgICAgICAgICAgICBmb250U2l6ZSA9IGEuZm9udCAmJiBhLmZvbnQubWF0Y2goL1xcZCsoPzpcXC5cXGQqKT8oPz1weCkvKTtcbiAgICAgICAgICAgIHMgPSBzcGFuLnN0eWxlO1xuICAgICAgICAgICAgYS5mb250ICYmIChzLmZvbnQgPSBhLmZvbnQpO1xuICAgICAgICAgICAgYVtcImZvbnQtZmFtaWx5XCJdICYmIChzLmZvbnRGYW1pbHkgPSBhW1wiZm9udC1mYW1pbHlcIl0pO1xuICAgICAgICAgICAgYVtcImZvbnQtd2VpZ2h0XCJdICYmIChzLmZvbnRXZWlnaHQgPSBhW1wiZm9udC13ZWlnaHRcIl0pO1xuICAgICAgICAgICAgYVtcImZvbnQtc3R5bGVcIl0gJiYgKHMuZm9udFN0eWxlID0gYVtcImZvbnQtc3R5bGVcIl0pO1xuICAgICAgICAgICAgZm9udFNpemUgPSB0b0Zsb2F0KGFbXCJmb250LXNpemVcIl0gfHwgZm9udFNpemUgJiYgZm9udFNpemVbMF0pIHx8IDEwO1xuICAgICAgICAgICAgcy5mb250U2l6ZSA9IGZvbnRTaXplICogbSArIFwicHhcIjtcbiAgICAgICAgICAgIHJlcy50ZXh0cGF0aC5zdHJpbmcgJiYgKHNwYW4uaW5uZXJIVE1MID0gU3RyKHJlcy50ZXh0cGF0aC5zdHJpbmcpLnJlcGxhY2UoLzwvZywgXCImIzYwO1wiKS5yZXBsYWNlKC8mL2csIFwiJiMzODtcIikucmVwbGFjZSgvXFxuL2csIFwiPGJyPlwiKSk7XG4gICAgICAgICAgICB2YXIgYnJlY3QgPSBzcGFuLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgcmVzLlcgPSBhLncgPSAoYnJlY3QucmlnaHQgLSBicmVjdC5sZWZ0KSAvIG07XG4gICAgICAgICAgICByZXMuSCA9IGEuaCA9IChicmVjdC5ib3R0b20gLSBicmVjdC50b3ApIC8gbTtcbiAgICAgICAgICAgIC8vIHJlcy5wYXBlci5jYW52YXMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgcmVzLlggPSBhLng7XG4gICAgICAgICAgICByZXMuWSA9IGEueSArIHJlcy5IIC8gMjtcblxuICAgICAgICAgICAgKFwieFwiIGluIHBhcmFtcyB8fCBcInlcIiBpbiBwYXJhbXMpICYmIChyZXMucGF0aC52ID0gUi5mb3JtYXQoXCJtezB9LHsxfWx7Mn0sezF9XCIsIHJvdW5kKGEueCAqIHpvb20pLCByb3VuZChhLnkgKiB6b29tKSwgcm91bmQoYS54ICogem9vbSkgKyAxKSk7XG4gICAgICAgICAgICB2YXIgZGlydHlhdHRycyA9IFtcInhcIiwgXCJ5XCIsIFwidGV4dFwiLCBcImZvbnRcIiwgXCJmb250LWZhbWlseVwiLCBcImZvbnQtd2VpZ2h0XCIsIFwiZm9udC1zdHlsZVwiLCBcImZvbnQtc2l6ZVwiXTtcbiAgICAgICAgICAgIGZvciAodmFyIGQgPSAwLCBkZCA9IGRpcnR5YXR0cnMubGVuZ3RoOyBkIDwgZGQ7IGQrKykgaWYgKGRpcnR5YXR0cnNbZF0gaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgcmVzLl8uZGlydHkgPSAxO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgICAgIC8vIHRleHQtYW5jaG9yIGVtdWxhdGlvblxuICAgICAgICAgICAgc3dpdGNoIChhW1widGV4dC1hbmNob3JcIl0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwic3RhcnRcIjpcbiAgICAgICAgICAgICAgICAgICAgcmVzLnRleHRwYXRoLnN0eWxlW1widi10ZXh0LWFsaWduXCJdID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5iYnggPSByZXMuVyAvIDI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgICAgICAgICAgICByZXMudGV4dHBhdGguc3R5bGVbXCJ2LXRleHQtYWxpZ25cIl0gPSBcInJpZ2h0XCI7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5iYnggPSAtcmVzLlcgLyAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJlcy50ZXh0cGF0aC5zdHlsZVtcInYtdGV4dC1hbGlnblwiXSA9IFwiY2VudGVyXCI7XG4gICAgICAgICAgICAgICAgICAgIHJlcy5iYnggPSAwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzLnRleHRwYXRoLnN0eWxlW1widi10ZXh0LWtlcm5cIl0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlcy5wYXBlci5jYW52YXMuc3R5bGUuZGlzcGxheSA9IEU7XG4gICAgfSxcbiAgICBhZGRHcmFkaWVudEZpbGwgPSBmdW5jdGlvbiAobywgZ3JhZGllbnQsIGZpbGwpIHtcbiAgICAgICAgby5hdHRycyA9IG8uYXR0cnMgfHwge307XG4gICAgICAgIHZhciBhdHRycyA9IG8uYXR0cnMsXG4gICAgICAgICAgICBwb3cgPSBNYXRoLnBvdyxcbiAgICAgICAgICAgIG9wYWNpdHksXG4gICAgICAgICAgICBvaW5kZXgsXG4gICAgICAgICAgICB0eXBlID0gXCJsaW5lYXJcIixcbiAgICAgICAgICAgIGZ4ZnkgPSBcIi41IC41XCI7XG4gICAgICAgIG8uYXR0cnMuZ3JhZGllbnQgPSBncmFkaWVudDtcbiAgICAgICAgZ3JhZGllbnQgPSBTdHIoZ3JhZGllbnQpLnJlcGxhY2UoUi5fcmFkaWFsX2dyYWRpZW50LCBmdW5jdGlvbiAoYWxsLCBmeCwgZnkpIHtcbiAgICAgICAgICAgIHR5cGUgPSBcInJhZGlhbFwiO1xuICAgICAgICAgICAgaWYgKGZ4ICYmIGZ5KSB7XG4gICAgICAgICAgICAgICAgZnggPSB0b0Zsb2F0KGZ4KTtcbiAgICAgICAgICAgICAgICBmeSA9IHRvRmxvYXQoZnkpO1xuICAgICAgICAgICAgICAgIHBvdyhmeCAtIC41LCAyKSArIHBvdyhmeSAtIC41LCAyKSA+IC4yNSAmJiAoZnkgPSBtYXRoLnNxcnQoLjI1IC0gcG93KGZ4IC0gLjUsIDIpKSAqICgoZnkgPiAuNSkgKiAyIC0gMSkgKyAuNSk7XG4gICAgICAgICAgICAgICAgZnhmeSA9IGZ4ICsgUyArIGZ5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIEU7XG4gICAgICAgIH0pO1xuICAgICAgICBncmFkaWVudCA9IGdyYWRpZW50LnNwbGl0KC9cXHMqXFwtXFxzKi8pO1xuICAgICAgICBpZiAodHlwZSA9PSBcImxpbmVhclwiKSB7XG4gICAgICAgICAgICB2YXIgYW5nbGUgPSBncmFkaWVudC5zaGlmdCgpO1xuICAgICAgICAgICAgYW5nbGUgPSAtdG9GbG9hdChhbmdsZSk7XG4gICAgICAgICAgICBpZiAoaXNOYU4oYW5nbGUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRvdHMgPSBSLl9wYXJzZURvdHMoZ3JhZGllbnQpO1xuICAgICAgICBpZiAoIWRvdHMpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIG8gPSBvLnNoYXBlIHx8IG8ubm9kZTtcbiAgICAgICAgaWYgKGRvdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBvLnJlbW92ZUNoaWxkKGZpbGwpO1xuICAgICAgICAgICAgZmlsbC5vbiA9IHRydWU7XG4gICAgICAgICAgICBmaWxsLm1ldGhvZCA9IFwibm9uZVwiO1xuICAgICAgICAgICAgZmlsbC5jb2xvciA9IGRvdHNbMF0uY29sb3I7XG4gICAgICAgICAgICBmaWxsLmNvbG9yMiA9IGRvdHNbZG90cy5sZW5ndGggLSAxXS5jb2xvcjtcbiAgICAgICAgICAgIHZhciBjbHJzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBkb3RzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBkb3RzW2ldLm9mZnNldCAmJiBjbHJzLnB1c2goZG90c1tpXS5vZmZzZXQgKyBTICsgZG90c1tpXS5jb2xvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWxsLmNvbG9ycyA9IGNscnMubGVuZ3RoID8gY2xycy5qb2luKCkgOiBcIjAlIFwiICsgZmlsbC5jb2xvcjtcbiAgICAgICAgICAgIGlmICh0eXBlID09IFwicmFkaWFsXCIpIHtcbiAgICAgICAgICAgICAgICBmaWxsLnR5cGUgPSBcImdyYWRpZW50VGl0bGVcIjtcbiAgICAgICAgICAgICAgICBmaWxsLmZvY3VzID0gXCIxMDAlXCI7XG4gICAgICAgICAgICAgICAgZmlsbC5mb2N1c3NpemUgPSBcIjAgMFwiO1xuICAgICAgICAgICAgICAgIGZpbGwuZm9jdXNwb3NpdGlvbiA9IGZ4Znk7XG4gICAgICAgICAgICAgICAgZmlsbC5hbmdsZSA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGZpbGwucm90YXRlPSB0cnVlO1xuICAgICAgICAgICAgICAgIGZpbGwudHlwZSA9IFwiZ3JhZGllbnRcIjtcbiAgICAgICAgICAgICAgICBmaWxsLmFuZ2xlID0gKDI3MCAtIGFuZ2xlKSAlIDM2MDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG8uYXBwZW5kQ2hpbGQoZmlsbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDE7XG4gICAgfSxcbiAgICBFbGVtZW50ID0gZnVuY3Rpb24gKG5vZGUsIHZtbCkge1xuICAgICAgICB0aGlzWzBdID0gdGhpcy5ub2RlID0gbm9kZTtcbiAgICAgICAgbm9kZS5yYXBoYWVsID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pZCA9IFIuX29pZCsrO1xuICAgICAgICBub2RlLnJhcGhhZWxpZCA9IHRoaXMuaWQ7XG4gICAgICAgIHRoaXMuWCA9IDA7XG4gICAgICAgIHRoaXMuWSA9IDA7XG4gICAgICAgIHRoaXMuYXR0cnMgPSB7fTtcbiAgICAgICAgdGhpcy5wYXBlciA9IHZtbDtcbiAgICAgICAgdGhpcy5tYXRyaXggPSBSLm1hdHJpeCgpO1xuICAgICAgICB0aGlzLl8gPSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IFtdLFxuICAgICAgICAgICAgc3g6IDEsXG4gICAgICAgICAgICBzeTogMSxcbiAgICAgICAgICAgIGR4OiAwLFxuICAgICAgICAgICAgZHk6IDAsXG4gICAgICAgICAgICBkZWc6IDAsXG4gICAgICAgICAgICBkaXJ0eTogMSxcbiAgICAgICAgICAgIGRpcnR5VDogMVxuICAgICAgICB9O1xuICAgICAgICAhdm1sLmJvdHRvbSAmJiAodm1sLmJvdHRvbSA9IHRoaXMpO1xuICAgICAgICB0aGlzLnByZXYgPSB2bWwudG9wO1xuICAgICAgICB2bWwudG9wICYmICh2bWwudG9wLm5leHQgPSB0aGlzKTtcbiAgICAgICAgdm1sLnRvcCA9IHRoaXM7XG4gICAgICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgfTtcbiAgICB2YXIgZWxwcm90byA9IFIuZWw7XG5cbiAgICBFbGVtZW50LnByb3RvdHlwZSA9IGVscHJvdG87XG4gICAgZWxwcm90by5jb25zdHJ1Y3RvciA9IEVsZW1lbnQ7XG4gICAgZWxwcm90by50cmFuc2Zvcm0gPSBmdW5jdGlvbiAodHN0cikge1xuICAgICAgICBpZiAodHN0ciA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fLnRyYW5zZm9ybTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdmJzID0gdGhpcy5wYXBlci5fdmlld0JveFNoaWZ0LFxuICAgICAgICAgICAgdmJ0ID0gdmJzID8gXCJzXCIgKyBbdmJzLnNjYWxlLCB2YnMuc2NhbGVdICsgXCItMS0xdFwiICsgW3Zicy5keCwgdmJzLmR5XSA6IEUsXG4gICAgICAgICAgICBvbGR0O1xuICAgICAgICBpZiAodmJzKSB7XG4gICAgICAgICAgICBvbGR0ID0gdHN0ciA9IFN0cih0c3RyKS5yZXBsYWNlKC9cXC57M318XFx1MjAyNi9nLCB0aGlzLl8udHJhbnNmb3JtIHx8IEUpO1xuICAgICAgICB9XG4gICAgICAgIFIuX2V4dHJhY3RUcmFuc2Zvcm0odGhpcywgdmJ0ICsgdHN0cik7XG4gICAgICAgIHZhciBtYXRyaXggPSB0aGlzLm1hdHJpeC5jbG9uZSgpLFxuICAgICAgICAgICAgc2tldyA9IHRoaXMuc2tldyxcbiAgICAgICAgICAgIG8gPSB0aGlzLm5vZGUsXG4gICAgICAgICAgICBzcGxpdCxcbiAgICAgICAgICAgIGlzR3JhZCA9IH5TdHIodGhpcy5hdHRycy5maWxsKS5pbmRleE9mKFwiLVwiKSxcbiAgICAgICAgICAgIGlzUGF0dCA9ICFTdHIodGhpcy5hdHRycy5maWxsKS5pbmRleE9mKFwidXJsKFwiKTtcbiAgICAgICAgbWF0cml4LnRyYW5zbGF0ZSgtLjUsIC0uNSk7XG4gICAgICAgIGlmIChpc1BhdHQgfHwgaXNHcmFkIHx8IHRoaXMudHlwZSA9PSBcImltYWdlXCIpIHtcbiAgICAgICAgICAgIHNrZXcubWF0cml4ID0gXCIxIDAgMCAxXCI7XG4gICAgICAgICAgICBza2V3Lm9mZnNldCA9IFwiMCAwXCI7XG4gICAgICAgICAgICBzcGxpdCA9IG1hdHJpeC5zcGxpdCgpO1xuICAgICAgICAgICAgaWYgKChpc0dyYWQgJiYgc3BsaXQubm9Sb3RhdGlvbikgfHwgIXNwbGl0LmlzU2ltcGxlKSB7XG4gICAgICAgICAgICAgICAgby5zdHlsZS5maWx0ZXIgPSBtYXRyaXgudG9GaWx0ZXIoKTtcbiAgICAgICAgICAgICAgICB2YXIgYmIgPSB0aGlzLmdldEJCb3goKSxcbiAgICAgICAgICAgICAgICAgICAgYmJ0ID0gdGhpcy5nZXRCQm94KDEpLFxuICAgICAgICAgICAgICAgICAgICBkeCA9IGJiLnggLSBiYnQueCxcbiAgICAgICAgICAgICAgICAgICAgZHkgPSBiYi55IC0gYmJ0Lnk7XG4gICAgICAgICAgICAgICAgby5jb29yZG9yaWdpbiA9IChkeCAqIC16b29tKSArIFMgKyAoZHkgKiAtem9vbSk7XG4gICAgICAgICAgICAgICAgc2V0Q29vcmRzKHRoaXMsIDEsIDEsIGR4LCBkeSwgMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG8uc3R5bGUuZmlsdGVyID0gRTtcbiAgICAgICAgICAgICAgICBzZXRDb29yZHModGhpcywgc3BsaXQuc2NhbGV4LCBzcGxpdC5zY2FsZXksIHNwbGl0LmR4LCBzcGxpdC5keSwgc3BsaXQucm90YXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG8uc3R5bGUuZmlsdGVyID0gRTtcbiAgICAgICAgICAgIHNrZXcubWF0cml4ID0gU3RyKG1hdHJpeCk7XG4gICAgICAgICAgICBza2V3Lm9mZnNldCA9IG1hdHJpeC5vZmZzZXQoKTtcbiAgICAgICAgfVxuICAgICAgICBvbGR0ICYmICh0aGlzLl8udHJhbnNmb3JtID0gb2xkdCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZWxwcm90by5yb3RhdGUgPSBmdW5jdGlvbiAoZGVnLCBjeCwgY3kpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlZyA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZGVnID0gU3RyKGRlZykuc3BsaXQoc2VwYXJhdG9yKTtcbiAgICAgICAgaWYgKGRlZy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBjeCA9IHRvRmxvYXQoZGVnWzFdKTtcbiAgICAgICAgICAgIGN5ID0gdG9GbG9hdChkZWdbMl0pO1xuICAgICAgICB9XG4gICAgICAgIGRlZyA9IHRvRmxvYXQoZGVnWzBdKTtcbiAgICAgICAgKGN5ID09IG51bGwpICYmIChjeCA9IGN5KTtcbiAgICAgICAgaWYgKGN4ID09IG51bGwgfHwgY3kgPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGJib3ggPSB0aGlzLmdldEJCb3goMSk7XG4gICAgICAgICAgICBjeCA9IGJib3gueCArIGJib3gud2lkdGggLyAyO1xuICAgICAgICAgICAgY3kgPSBiYm94LnkgKyBiYm94LmhlaWdodCAvIDI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fLmRpcnR5VCA9IDE7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtKHRoaXMuXy50cmFuc2Zvcm0uY29uY2F0KFtbXCJyXCIsIGRlZywgY3gsIGN5XV0pKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBlbHByb3RvLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uIChkeCwgZHkpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZHggPSBTdHIoZHgpLnNwbGl0KHNlcGFyYXRvcik7XG4gICAgICAgIGlmIChkeC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBkeSA9IHRvRmxvYXQoZHhbMV0pO1xuICAgICAgICB9XG4gICAgICAgIGR4ID0gdG9GbG9hdChkeFswXSkgfHwgMDtcbiAgICAgICAgZHkgPSArZHkgfHwgMDtcbiAgICAgICAgaWYgKHRoaXMuXy5iYm94KSB7XG4gICAgICAgICAgICB0aGlzLl8uYmJveC54ICs9IGR4O1xuICAgICAgICAgICAgdGhpcy5fLmJib3gueSArPSBkeTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRyYW5zZm9ybSh0aGlzLl8udHJhbnNmb3JtLmNvbmNhdChbW1widFwiLCBkeCwgZHldXSkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGVscHJvdG8uc2NhbGUgPSBmdW5jdGlvbiAoc3gsIHN5LCBjeCwgY3kpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgc3ggPSBTdHIoc3gpLnNwbGl0KHNlcGFyYXRvcik7XG4gICAgICAgIGlmIChzeC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBzeSA9IHRvRmxvYXQoc3hbMV0pO1xuICAgICAgICAgICAgY3ggPSB0b0Zsb2F0KHN4WzJdKTtcbiAgICAgICAgICAgIGN5ID0gdG9GbG9hdChzeFszXSk7XG4gICAgICAgICAgICBpc05hTihjeCkgJiYgKGN4ID0gbnVsbCk7XG4gICAgICAgICAgICBpc05hTihjeSkgJiYgKGN5ID0gbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgc3ggPSB0b0Zsb2F0KHN4WzBdKTtcbiAgICAgICAgKHN5ID09IG51bGwpICYmIChzeSA9IHN4KTtcbiAgICAgICAgKGN5ID09IG51bGwpICYmIChjeCA9IGN5KTtcbiAgICAgICAgaWYgKGN4ID09IG51bGwgfHwgY3kgPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGJib3ggPSB0aGlzLmdldEJCb3goMSk7XG4gICAgICAgIH1cbiAgICAgICAgY3ggPSBjeCA9PSBudWxsID8gYmJveC54ICsgYmJveC53aWR0aCAvIDIgOiBjeDtcbiAgICAgICAgY3kgPSBjeSA9PSBudWxsID8gYmJveC55ICsgYmJveC5oZWlnaHQgLyAyIDogY3k7XG4gICAgXG4gICAgICAgIHRoaXMudHJhbnNmb3JtKHRoaXMuXy50cmFuc2Zvcm0uY29uY2F0KFtbXCJzXCIsIHN4LCBzeSwgY3gsIGN5XV0pKTtcbiAgICAgICAgdGhpcy5fLmRpcnR5VCA9IDE7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZWxwcm90by5oaWRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAhdGhpcy5yZW1vdmVkICYmICh0aGlzLm5vZGUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBlbHByb3RvLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICF0aGlzLnJlbW92ZWQgJiYgKHRoaXMubm9kZS5zdHlsZS5kaXNwbGF5ID0gRSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZWxwcm90by5fZ2V0QkJveCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiB0aGlzLlggKyAodGhpcy5iYnggfHwgMCkgLSB0aGlzLlcgLyAyLFxuICAgICAgICAgICAgeTogdGhpcy5ZIC0gdGhpcy5ILFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuVyxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5IXG4gICAgICAgIH07XG4gICAgfTtcbiAgICBlbHByb3RvLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCB8fCAhdGhpcy5ub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhcGVyLl9fc2V0X18gJiYgdGhpcy5wYXBlci5fX3NldF9fLmV4Y2x1ZGUodGhpcyk7XG4gICAgICAgIFIuZXZlLnVuYmluZChcInJhcGhhZWwuKi4qLlwiICsgdGhpcy5pZCk7XG4gICAgICAgIFIuX3RlYXIodGhpcywgdGhpcy5wYXBlcik7XG4gICAgICAgIHRoaXMubm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMubm9kZSk7XG4gICAgICAgIHRoaXMuc2hhcGUgJiYgdGhpcy5zaGFwZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuc2hhcGUpO1xuICAgICAgICBmb3IgKHZhciBpIGluIHRoaXMpIHtcbiAgICAgICAgICAgIHRoaXNbaV0gPSB0eXBlb2YgdGhpc1tpXSA9PSBcImZ1bmN0aW9uXCIgPyBSLl9yZW1vdmVkRmFjdG9yeShpKSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW1vdmVkID0gdHJ1ZTtcbiAgICB9O1xuICAgIGVscHJvdG8uYXR0ciA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZSA9PSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgcmVzID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBhIGluIHRoaXMuYXR0cnMpIGlmICh0aGlzLmF0dHJzW2hhc10oYSkpIHtcbiAgICAgICAgICAgICAgICByZXNbYV0gPSB0aGlzLmF0dHJzW2FdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzLmdyYWRpZW50ICYmIHJlcy5maWxsID09IFwibm9uZVwiICYmIChyZXMuZmlsbCA9IHJlcy5ncmFkaWVudCkgJiYgZGVsZXRlIHJlcy5ncmFkaWVudDtcbiAgICAgICAgICAgIHJlcy50cmFuc2Zvcm0gPSB0aGlzLl8udHJhbnNmb3JtO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCAmJiBSLmlzKG5hbWUsIFwic3RyaW5nXCIpKSB7XG4gICAgICAgICAgICBpZiAobmFtZSA9PSBmaWxsU3RyaW5nICYmIHRoaXMuYXR0cnMuZmlsbCA9PSBcIm5vbmVcIiAmJiB0aGlzLmF0dHJzLmdyYWRpZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cnMuZ3JhZGllbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KHNlcGFyYXRvciksXG4gICAgICAgICAgICAgICAgb3V0ID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBuYW1lcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lIGluIHRoaXMuYXR0cnMpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0W25hbWVdID0gdGhpcy5hdHRyc1tuYW1lXTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFIuaXModGhpcy5wYXBlci5jdXN0b21BdHRyaWJ1dGVzW25hbWVdLCBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dFtuYW1lXSA9IHRoaXMucGFwZXIuY3VzdG9tQXR0cmlidXRlc1tuYW1lXS5kZWY7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0W25hbWVdID0gUi5fYXZhaWxhYmxlQXR0cnNbbmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGlpIC0gMSA/IG91dCA6IG91dFtuYW1lc1swXV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYXR0cnMgJiYgdmFsdWUgPT0gbnVsbCAmJiBSLmlzKG5hbWUsIFwiYXJyYXlcIikpIHtcbiAgICAgICAgICAgIG91dCA9IHt9O1xuICAgICAgICAgICAgZm9yIChpID0gMCwgaWkgPSBuYW1lLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvdXRbbmFtZVtpXV0gPSB0aGlzLmF0dHIobmFtZVtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXJhbXM7XG4gICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBwYXJhbXMgPSB7fTtcbiAgICAgICAgICAgIHBhcmFtc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlID09IG51bGwgJiYgUi5pcyhuYW1lLCBcIm9iamVjdFwiKSAmJiAocGFyYW1zID0gbmFtZSk7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgIGV2ZShcInJhcGhhZWwuYXR0ci5cIiArIGtleSArIFwiLlwiICsgdGhpcy5pZCwgdGhpcywgcGFyYW1zW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJhbXMpIHtcbiAgICAgICAgICAgIGZvciAoa2V5IGluIHRoaXMucGFwZXIuY3VzdG9tQXR0cmlidXRlcykgaWYgKHRoaXMucGFwZXIuY3VzdG9tQXR0cmlidXRlc1toYXNdKGtleSkgJiYgcGFyYW1zW2hhc10oa2V5KSAmJiBSLmlzKHRoaXMucGFwZXIuY3VzdG9tQXR0cmlidXRlc1trZXldLCBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhciA9IHRoaXMucGFwZXIuY3VzdG9tQXR0cmlidXRlc1trZXldLmFwcGx5KHRoaXMsIFtdLmNvbmNhdChwYXJhbXNba2V5XSkpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXR0cnNba2V5XSA9IHBhcmFtc1trZXldO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHN1YmtleSBpbiBwYXIpIGlmIChwYXJbaGFzXShzdWJrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtc1tzdWJrZXldID0gcGFyW3N1YmtleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGhpcy5wYXBlci5jYW52YXMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgaWYgKHBhcmFtcy50ZXh0ICYmIHRoaXMudHlwZSA9PSBcInRleHRcIikge1xuICAgICAgICAgICAgICAgIHRoaXMudGV4dHBhdGguc3RyaW5nID0gcGFyYW1zLnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRGaWxsQW5kU3Ryb2tlKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgICAgICAvLyB0aGlzLnBhcGVyLmNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gRTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGVscHJvdG8udG9Gcm9udCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIXRoaXMucmVtb3ZlZCAmJiB0aGlzLm5vZGUucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLm5vZGUpO1xuICAgICAgICB0aGlzLnBhcGVyICYmIHRoaXMucGFwZXIudG9wICE9IHRoaXMgJiYgUi5fdG9mcm9udCh0aGlzLCB0aGlzLnBhcGVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBlbHByb3RvLnRvQmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubm9kZS5wYXJlbnROb2RlLmZpcnN0Q2hpbGQgIT0gdGhpcy5ub2RlKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5ub2RlLCB0aGlzLm5vZGUucGFyZW50Tm9kZS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIFIuX3RvYmFjayh0aGlzLCB0aGlzLnBhcGVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGVscHJvdG8uaW5zZXJ0QWZ0ZXIgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC5jb25zdHJ1Y3RvciA9PSBSLnN0LmNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudFtlbGVtZW50Lmxlbmd0aCAtIDFdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50Lm5vZGUubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgICAgIGVsZW1lbnQubm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLm5vZGUsIGVsZW1lbnQubm9kZS5uZXh0U2libGluZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50Lm5vZGUucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIFIuX2luc2VydGFmdGVyKHRoaXMsIGVsZW1lbnQsIHRoaXMucGFwZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGVscHJvdG8uaW5zZXJ0QmVmb3JlID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQuY29uc3RydWN0b3IgPT0gUi5zdC5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnRbMF07XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5ub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMubm9kZSwgZWxlbWVudC5ub2RlKTtcbiAgICAgICAgUi5faW5zZXJ0YmVmb3JlKHRoaXMsIGVsZW1lbnQsIHRoaXMucGFwZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGVscHJvdG8uYmx1ciA9IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICAgIHZhciBzID0gdGhpcy5ub2RlLnJ1bnRpbWVTdHlsZSxcbiAgICAgICAgICAgIGYgPSBzLmZpbHRlcjtcbiAgICAgICAgZiA9IGYucmVwbGFjZShibHVycmVnZXhwLCBFKTtcbiAgICAgICAgaWYgKCtzaXplICE9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmF0dHJzLmJsdXIgPSBzaXplO1xuICAgICAgICAgICAgcy5maWx0ZXIgPSBmICsgUyArIG1zICsgXCIuQmx1cihwaXhlbHJhZGl1cz1cIiArICgrc2l6ZSB8fCAxLjUpICsgXCIpXCI7XG4gICAgICAgICAgICBzLm1hcmdpbiA9IFIuZm9ybWF0KFwiLXswfXB4IDAgMCAtezB9cHhcIiwgcm91bmQoK3NpemUgfHwgMS41KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzLmZpbHRlciA9IGY7XG4gICAgICAgICAgICBzLm1hcmdpbiA9IDA7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5hdHRycy5ibHVyO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFIuX2VuZ2luZS5wYXRoID0gZnVuY3Rpb24gKHBhdGhTdHJpbmcsIHZtbCkge1xuICAgICAgICB2YXIgZWwgPSBjcmVhdGVOb2RlKFwic2hhcGVcIik7XG4gICAgICAgIGVsLnN0eWxlLmNzc1RleHQgPSBjc3NEb3Q7XG4gICAgICAgIGVsLmNvb3Jkc2l6ZSA9IHpvb20gKyBTICsgem9vbTtcbiAgICAgICAgZWwuY29vcmRvcmlnaW4gPSB2bWwuY29vcmRvcmlnaW47XG4gICAgICAgIHZhciBwID0gbmV3IEVsZW1lbnQoZWwsIHZtbCksXG4gICAgICAgICAgICBhdHRyID0ge2ZpbGw6IFwibm9uZVwiLCBzdHJva2U6IFwiIzAwMFwifTtcbiAgICAgICAgcGF0aFN0cmluZyAmJiAoYXR0ci5wYXRoID0gcGF0aFN0cmluZyk7XG4gICAgICAgIHAudHlwZSA9IFwicGF0aFwiO1xuICAgICAgICBwLnBhdGggPSBbXTtcbiAgICAgICAgcC5QYXRoID0gRTtcbiAgICAgICAgc2V0RmlsbEFuZFN0cm9rZShwLCBhdHRyKTtcbiAgICAgICAgdm1sLmNhbnZhcy5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgIHZhciBza2V3ID0gY3JlYXRlTm9kZShcInNrZXdcIik7XG4gICAgICAgIHNrZXcub24gPSB0cnVlO1xuICAgICAgICBlbC5hcHBlbmRDaGlsZChza2V3KTtcbiAgICAgICAgcC5za2V3ID0gc2tldztcbiAgICAgICAgcC50cmFuc2Zvcm0oRSk7XG4gICAgICAgIHJldHVybiBwO1xuICAgIH07XG4gICAgUi5fZW5naW5lLnJlY3QgPSBmdW5jdGlvbiAodm1sLCB4LCB5LCB3LCBoLCByKSB7XG4gICAgICAgIHZhciBwYXRoID0gUi5fcmVjdFBhdGgoeCwgeSwgdywgaCwgciksXG4gICAgICAgICAgICByZXMgPSB2bWwucGF0aChwYXRoKSxcbiAgICAgICAgICAgIGEgPSByZXMuYXR0cnM7XG4gICAgICAgIHJlcy5YID0gYS54ID0geDtcbiAgICAgICAgcmVzLlkgPSBhLnkgPSB5O1xuICAgICAgICByZXMuVyA9IGEud2lkdGggPSB3O1xuICAgICAgICByZXMuSCA9IGEuaGVpZ2h0ID0gaDtcbiAgICAgICAgYS5yID0gcjtcbiAgICAgICAgYS5wYXRoID0gcGF0aDtcbiAgICAgICAgcmVzLnR5cGUgPSBcInJlY3RcIjtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICAgIFIuX2VuZ2luZS5lbGxpcHNlID0gZnVuY3Rpb24gKHZtbCwgeCwgeSwgcngsIHJ5KSB7XG4gICAgICAgIHZhciByZXMgPSB2bWwucGF0aCgpLFxuICAgICAgICAgICAgYSA9IHJlcy5hdHRycztcbiAgICAgICAgcmVzLlggPSB4IC0gcng7XG4gICAgICAgIHJlcy5ZID0geSAtIHJ5O1xuICAgICAgICByZXMuVyA9IHJ4ICogMjtcbiAgICAgICAgcmVzLkggPSByeSAqIDI7XG4gICAgICAgIHJlcy50eXBlID0gXCJlbGxpcHNlXCI7XG4gICAgICAgIHNldEZpbGxBbmRTdHJva2UocmVzLCB7XG4gICAgICAgICAgICBjeDogeCxcbiAgICAgICAgICAgIGN5OiB5LFxuICAgICAgICAgICAgcng6IHJ4LFxuICAgICAgICAgICAgcnk6IHJ5XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gICAgUi5fZW5naW5lLmNpcmNsZSA9IGZ1bmN0aW9uICh2bWwsIHgsIHksIHIpIHtcbiAgICAgICAgdmFyIHJlcyA9IHZtbC5wYXRoKCksXG4gICAgICAgICAgICBhID0gcmVzLmF0dHJzO1xuICAgICAgICByZXMuWCA9IHggLSByO1xuICAgICAgICByZXMuWSA9IHkgLSByO1xuICAgICAgICByZXMuVyA9IHJlcy5IID0gciAqIDI7XG4gICAgICAgIHJlcy50eXBlID0gXCJjaXJjbGVcIjtcbiAgICAgICAgc2V0RmlsbEFuZFN0cm9rZShyZXMsIHtcbiAgICAgICAgICAgIGN4OiB4LFxuICAgICAgICAgICAgY3k6IHksXG4gICAgICAgICAgICByOiByXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gICAgUi5fZW5naW5lLmltYWdlID0gZnVuY3Rpb24gKHZtbCwgc3JjLCB4LCB5LCB3LCBoKSB7XG4gICAgICAgIHZhciBwYXRoID0gUi5fcmVjdFBhdGgoeCwgeSwgdywgaCksXG4gICAgICAgICAgICByZXMgPSB2bWwucGF0aChwYXRoKS5hdHRyKHtzdHJva2U6IFwibm9uZVwifSksXG4gICAgICAgICAgICBhID0gcmVzLmF0dHJzLFxuICAgICAgICAgICAgbm9kZSA9IHJlcy5ub2RlLFxuICAgICAgICAgICAgZmlsbCA9IG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoZmlsbFN0cmluZylbMF07XG4gICAgICAgIGEuc3JjID0gc3JjO1xuICAgICAgICByZXMuWCA9IGEueCA9IHg7XG4gICAgICAgIHJlcy5ZID0gYS55ID0geTtcbiAgICAgICAgcmVzLlcgPSBhLndpZHRoID0gdztcbiAgICAgICAgcmVzLkggPSBhLmhlaWdodCA9IGg7XG4gICAgICAgIGEucGF0aCA9IHBhdGg7XG4gICAgICAgIHJlcy50eXBlID0gXCJpbWFnZVwiO1xuICAgICAgICBmaWxsLnBhcmVudE5vZGUgPT0gbm9kZSAmJiBub2RlLnJlbW92ZUNoaWxkKGZpbGwpO1xuICAgICAgICBmaWxsLnJvdGF0ZSA9IHRydWU7XG4gICAgICAgIGZpbGwuc3JjID0gc3JjO1xuICAgICAgICBmaWxsLnR5cGUgPSBcInRpbGVcIjtcbiAgICAgICAgcmVzLl8uZmlsbHBvcyA9IFt4LCB5XTtcbiAgICAgICAgcmVzLl8uZmlsbHNpemUgPSBbdywgaF07XG4gICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQoZmlsbCk7XG4gICAgICAgIHNldENvb3JkcyhyZXMsIDEsIDEsIDAsIDAsIDApO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gICAgUi5fZW5naW5lLnRleHQgPSBmdW5jdGlvbiAodm1sLCB4LCB5LCB0ZXh0KSB7XG4gICAgICAgIHZhciBlbCA9IGNyZWF0ZU5vZGUoXCJzaGFwZVwiKSxcbiAgICAgICAgICAgIHBhdGggPSBjcmVhdGVOb2RlKFwicGF0aFwiKSxcbiAgICAgICAgICAgIG8gPSBjcmVhdGVOb2RlKFwidGV4dHBhdGhcIik7XG4gICAgICAgIHggPSB4IHx8IDA7XG4gICAgICAgIHkgPSB5IHx8IDA7XG4gICAgICAgIHRleHQgPSB0ZXh0IHx8IFwiXCI7XG4gICAgICAgIHBhdGgudiA9IFIuZm9ybWF0KFwibXswfSx7MX1sezJ9LHsxfVwiLCByb3VuZCh4ICogem9vbSksIHJvdW5kKHkgKiB6b29tKSwgcm91bmQoeCAqIHpvb20pICsgMSk7XG4gICAgICAgIHBhdGgudGV4dHBhdGhvayA9IHRydWU7XG4gICAgICAgIG8uc3RyaW5nID0gU3RyKHRleHQpO1xuICAgICAgICBvLm9uID0gdHJ1ZTtcbiAgICAgICAgZWwuc3R5bGUuY3NzVGV4dCA9IGNzc0RvdDtcbiAgICAgICAgZWwuY29vcmRzaXplID0gem9vbSArIFMgKyB6b29tO1xuICAgICAgICBlbC5jb29yZG9yaWdpbiA9IFwiMCAwXCI7XG4gICAgICAgIHZhciBwID0gbmV3IEVsZW1lbnQoZWwsIHZtbCksXG4gICAgICAgICAgICBhdHRyID0ge1xuICAgICAgICAgICAgICAgIGZpbGw6IFwiIzAwMFwiLFxuICAgICAgICAgICAgICAgIHN0cm9rZTogXCJub25lXCIsXG4gICAgICAgICAgICAgICAgZm9udDogUi5fYXZhaWxhYmxlQXR0cnMuZm9udCxcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XG4gICAgICAgICAgICB9O1xuICAgICAgICBwLnNoYXBlID0gZWw7XG4gICAgICAgIHAucGF0aCA9IHBhdGg7XG4gICAgICAgIHAudGV4dHBhdGggPSBvO1xuICAgICAgICBwLnR5cGUgPSBcInRleHRcIjtcbiAgICAgICAgcC5hdHRycy50ZXh0ID0gU3RyKHRleHQpO1xuICAgICAgICBwLmF0dHJzLnggPSB4O1xuICAgICAgICBwLmF0dHJzLnkgPSB5O1xuICAgICAgICBwLmF0dHJzLncgPSAxO1xuICAgICAgICBwLmF0dHJzLmggPSAxO1xuICAgICAgICBzZXRGaWxsQW5kU3Ryb2tlKHAsIGF0dHIpO1xuICAgICAgICBlbC5hcHBlbmRDaGlsZChvKTtcbiAgICAgICAgZWwuYXBwZW5kQ2hpbGQocGF0aCk7XG4gICAgICAgIHZtbC5jYW52YXMuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB2YXIgc2tldyA9IGNyZWF0ZU5vZGUoXCJza2V3XCIpO1xuICAgICAgICBza2V3Lm9uID0gdHJ1ZTtcbiAgICAgICAgZWwuYXBwZW5kQ2hpbGQoc2tldyk7XG4gICAgICAgIHAuc2tldyA9IHNrZXc7XG4gICAgICAgIHAudHJhbnNmb3JtKEUpO1xuICAgICAgICByZXR1cm4gcDtcbiAgICB9O1xuICAgIFIuX2VuZ2luZS5zZXRTaXplID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdmFyIGNzID0gdGhpcy5jYW52YXMuc3R5bGU7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHdpZHRoID09ICt3aWR0aCAmJiAod2lkdGggKz0gXCJweFwiKTtcbiAgICAgICAgaGVpZ2h0ID09ICtoZWlnaHQgJiYgKGhlaWdodCArPSBcInB4XCIpO1xuICAgICAgICBjcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICBjcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIGNzLmNsaXAgPSBcInJlY3QoMCBcIiArIHdpZHRoICsgXCIgXCIgKyBoZWlnaHQgKyBcIiAwKVwiO1xuICAgICAgICBpZiAodGhpcy5fdmlld0JveCkge1xuICAgICAgICAgICAgUi5fZW5naW5lLnNldFZpZXdCb3guYXBwbHkodGhpcywgdGhpcy5fdmlld0JveCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBSLl9lbmdpbmUuc2V0Vmlld0JveCA9IGZ1bmN0aW9uICh4LCB5LCB3LCBoLCBmaXQpIHtcbiAgICAgICAgUi5ldmUoXCJyYXBoYWVsLnNldFZpZXdCb3hcIiwgdGhpcywgdGhpcy5fdmlld0JveCwgW3gsIHksIHcsIGgsIGZpdF0pO1xuICAgICAgICB2YXIgd2lkdGggPSB0aGlzLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICBzaXplID0gMSAvIG1tYXgodyAvIHdpZHRoLCBoIC8gaGVpZ2h0KSxcbiAgICAgICAgICAgIEgsIFc7XG4gICAgICAgIGlmIChmaXQpIHtcbiAgICAgICAgICAgIEggPSBoZWlnaHQgLyBoO1xuICAgICAgICAgICAgVyA9IHdpZHRoIC8gdztcbiAgICAgICAgICAgIGlmICh3ICogSCA8IHdpZHRoKSB7XG4gICAgICAgICAgICAgICAgeCAtPSAod2lkdGggLSB3ICogSCkgLyAyIC8gSDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoICogVyA8IGhlaWdodCkge1xuICAgICAgICAgICAgICAgIHkgLT0gKGhlaWdodCAtIGggKiBXKSAvIDIgLyBXO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3ZpZXdCb3ggPSBbeCwgeSwgdywgaCwgISFmaXRdO1xuICAgICAgICB0aGlzLl92aWV3Qm94U2hpZnQgPSB7XG4gICAgICAgICAgICBkeDogLXgsXG4gICAgICAgICAgICBkeTogLXksXG4gICAgICAgICAgICBzY2FsZTogc2l6ZVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICBlbC50cmFuc2Zvcm0oXCIuLi5cIik7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIHZhciBjcmVhdGVOb2RlO1xuICAgIFIuX2VuZ2luZS5pbml0V2luID0gZnVuY3Rpb24gKHdpbikge1xuICAgICAgICAgICAgdmFyIGRvYyA9IHdpbi5kb2N1bWVudDtcbiAgICAgICAgICAgIGRvYy5jcmVhdGVTdHlsZVNoZWV0KCkuYWRkUnVsZShcIi5ydm1sXCIsIFwiYmVoYXZpb3I6dXJsKCNkZWZhdWx0I1ZNTClcIik7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICFkb2MubmFtZXNwYWNlcy5ydm1sICYmIGRvYy5uYW1lc3BhY2VzLmFkZChcInJ2bWxcIiwgXCJ1cm46c2NoZW1hcy1taWNyb3NvZnQtY29tOnZtbFwiKTtcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlID0gZnVuY3Rpb24gKHRhZ05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvYy5jcmVhdGVFbGVtZW50KCc8cnZtbDonICsgdGFnTmFtZSArICcgY2xhc3M9XCJydm1sXCI+Jyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlID0gZnVuY3Rpb24gKHRhZ05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvYy5jcmVhdGVFbGVtZW50KCc8JyArIHRhZ05hbWUgKyAnIHhtbG5zPVwidXJuOnNjaGVtYXMtbWljcm9zb2Z0LmNvbTp2bWxcIiBjbGFzcz1cInJ2bWxcIj4nKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIFIuX2VuZ2luZS5pbml0V2luKFIuX2cud2luKTtcbiAgICBSLl9lbmdpbmUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY29uID0gUi5fZ2V0Q29udGFpbmVyLmFwcGx5KDAsIGFyZ3VtZW50cyksXG4gICAgICAgICAgICBjb250YWluZXIgPSBjb24uY29udGFpbmVyLFxuICAgICAgICAgICAgaGVpZ2h0ID0gY29uLmhlaWdodCxcbiAgICAgICAgICAgIHMsXG4gICAgICAgICAgICB3aWR0aCA9IGNvbi53aWR0aCxcbiAgICAgICAgICAgIHggPSBjb24ueCxcbiAgICAgICAgICAgIHkgPSBjb24ueTtcbiAgICAgICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlZNTCBjb250YWluZXIgbm90IGZvdW5kLlwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzID0gbmV3IFIuX1BhcGVyLFxuICAgICAgICAgICAgYyA9IHJlcy5jYW52YXMgPSBSLl9nLmRvYy5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgY3MgPSBjLnN0eWxlO1xuICAgICAgICB4ID0geCB8fCAwO1xuICAgICAgICB5ID0geSB8fCAwO1xuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IDUxMjtcbiAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IDM0MjtcbiAgICAgICAgcmVzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHJlcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHdpZHRoID09ICt3aWR0aCAmJiAod2lkdGggKz0gXCJweFwiKTtcbiAgICAgICAgaGVpZ2h0ID09ICtoZWlnaHQgJiYgKGhlaWdodCArPSBcInB4XCIpO1xuICAgICAgICByZXMuY29vcmRzaXplID0gem9vbSAqIDFlMyArIFMgKyB6b29tICogMWUzO1xuICAgICAgICByZXMuY29vcmRvcmlnaW4gPSBcIjAgMFwiO1xuICAgICAgICByZXMuc3BhbiA9IFIuX2cuZG9jLmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICByZXMuc3Bhbi5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0Oi05OTk5ZW07dG9wOi05OTk5ZW07cGFkZGluZzowO21hcmdpbjowO2xpbmUtaGVpZ2h0OjE7XCI7XG4gICAgICAgIGMuYXBwZW5kQ2hpbGQocmVzLnNwYW4pO1xuICAgICAgICBjcy5jc3NUZXh0ID0gUi5mb3JtYXQoXCJ0b3A6MDtsZWZ0OjA7d2lkdGg6ezB9O2hlaWdodDp7MX07ZGlzcGxheTppbmxpbmUtYmxvY2s7cG9zaXRpb246cmVsYXRpdmU7Y2xpcDpyZWN0KDAgezB9IHsxfSAwKTtvdmVyZmxvdzpoaWRkZW5cIiwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgIGlmIChjb250YWluZXIgPT0gMSkge1xuICAgICAgICAgICAgUi5fZy5kb2MuYm9keS5hcHBlbmRDaGlsZChjKTtcbiAgICAgICAgICAgIGNzLmxlZnQgPSB4ICsgXCJweFwiO1xuICAgICAgICAgICAgY3MudG9wID0geSArIFwicHhcIjtcbiAgICAgICAgICAgIGNzLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShjLCBjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXMucmVuZGVyZml4ID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICBSLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgUi5ldmUoXCJyYXBoYWVsLmNsZWFyXCIsIHRoaXMpO1xuICAgICAgICB0aGlzLmNhbnZhcy5pbm5lckhUTUwgPSBFO1xuICAgICAgICB0aGlzLnNwYW4gPSBSLl9nLmRvYy5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgICAgdGhpcy5zcGFuLnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6LTk5OTllbTt0b3A6LTk5OTllbTtwYWRkaW5nOjA7bWFyZ2luOjA7bGluZS1oZWlnaHQ6MTtkaXNwbGF5OmlubGluZTtcIjtcbiAgICAgICAgdGhpcy5jYW52YXMuYXBwZW5kQ2hpbGQodGhpcy5zcGFuKTtcbiAgICAgICAgdGhpcy5ib3R0b20gPSB0aGlzLnRvcCA9IG51bGw7XG4gICAgfTtcbiAgICBSLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIFIuZXZlKFwicmFwaGFlbC5yZW1vdmVcIiwgdGhpcyk7XG4gICAgICAgIHRoaXMuY2FudmFzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5jYW52YXMpO1xuICAgICAgICBmb3IgKHZhciBpIGluIHRoaXMpIHtcbiAgICAgICAgICAgIHRoaXNbaV0gPSB0eXBlb2YgdGhpc1tpXSA9PSBcImZ1bmN0aW9uXCIgPyBSLl9yZW1vdmVkRmFjdG9yeShpKSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHZhciBzZXRwcm90byA9IFIuc3Q7XG4gICAgZm9yICh2YXIgbWV0aG9kIGluIGVscHJvdG8pIGlmIChlbHByb3RvW2hhc10obWV0aG9kKSAmJiAhc2V0cHJvdG9baGFzXShtZXRob2QpKSB7XG4gICAgICAgIHNldHByb3RvW21ldGhvZF0gPSAoZnVuY3Rpb24gKG1ldGhvZG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgICAgICBlbFttZXRob2RuYW1lXS5hcHBseShlbCwgYXJnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pKG1ldGhvZCk7XG4gICAgfVxufSh3aW5kb3cuUmFwaGFlbCk7IiwiUmFwaGFlbCA9IHJlcXVpcmUgXCJyYXBoYWVsXCJcbmNhbnZhcyA9IFJhcGhhZWwgXCJsb2dvXCIsIDQwMCwgNDAwXG5cbmdsb2JhbC5taWRYID0gY2FudmFzLndpZHRoIC8gMlxuZ2xvYmFsLm1pZFkgPSBjYW52YXMuaGVpZ2h0IC8gMlxuXG5Qb2ludHMgPSByZXF1aXJlIFwiLi4vbGliL3BvaW50cy5jb2ZmZWVcIlxuYW5pbWF0aW9ucyA9IHJlcXVpcmUoXCIuLi9saWIvcXVldWUuY29mZmVlXCIpKClcblxub3V0ZXJQb2ludHMgPSAzXG57cGFpcnMsIHZlcnRpY2VzfSA9IFBvaW50c1xuICB2ZXJ0aWNlczogb3V0ZXJQb2ludHNcblxuY2FudmFzLnNldFN0YXJ0KClcblxub3V0ZXJSYWRpdXMgPSAxMlxudmVydGljZXMuZm9yRWFjaCAodmVydGV4KSAtPlxuICBhbmltYXRpb25zLnB1c2ggLT5cbiAgICBjYW52YXMuY2lyY2xlKHZlcnRleC54LCB2ZXJ0ZXgueSwgMCkuYXR0clxuICAgICAgc3Ryb2tlOiBcIiMwMDBcIlxuICAgICAgXCJzdHJva2Utd2lkdGhcIjogM1xuICAgICAgZmlsbDogXCIjZmZmXCJcbiAgICAuYW5pbWF0ZSB7IHI6IG91dGVyUmFkaXVzIH0sIDI1MCwgXCJiYWNrT3V0XCIsIGFuaW1hdGlvbnMubmV4dFxuXG4gIGFuaW1hdGlvbnMucHVzaCAtPlxuICAgIGNhbnZhcy5jaXJjbGUodmVydGV4LngsIHZlcnRleC55LCAwKS5hdHRyXG4gICAgICBmaWxsOiBcIiMwMDBcIlxuICAgIC5hbmltYXRlIHsgcjogb3V0ZXJSYWRpdXMgLyAyIH0sIDI1MCwgXCJiYWNrT3V0XCIsIGFuaW1hdGlvbnMubmV4dFxuXG5wYWlycy5mb3JFYWNoIChwYWlyKSAtPlxuICBhbmltYXRpb25zLnB1c2ggLT5cbiAgICBjYW52YXMucGF0aChbXG4gICAgICBcIk1cIiwgcGFpclswXS54LCBwYWlyWzBdLnlcbiAgICAgIFwiTFwiLCBwYWlyWzFdLngsIHBhaXJbMV0ueVxuICAgIF0pLmF0dHJcbiAgICAgIHN0cm9rZTogXCIjZmZmXCJcbiAgICAgIFwic3Ryb2tlLXdpZHRoXCI6IDNcbiAgICAudG9CYWNrKClcblxuICAgIGNhbnZhcy5wYXRoKFtcbiAgICAgIFwiTVwiLCBwYWlyWzBdLngsIHBhaXJbMF0ueVxuICAgICAgXCJMXCIsIHBhaXJbMV0ueCwgcGFpclsxXS55XG4gICAgXSkuYXR0clxuICAgICAgc3Ryb2tlOiBcIiMwMDBcIlxuICAgICAgXCJzdHJva2Utd2lkdGhcIjogMFxuICAgIC50b0JhY2soKVxuICAgIC5hbmltYXRlIHsgXCJzdHJva2Utd2lkdGhcIjogMTAgfSwgNTAwLCBcImJhY2tPdXRcIiwgYW5pbWF0aW9ucy5uZXh0XG5cbmFuaW1hdGlvbnMucHVzaCAtPlxuICBzZXQgPSBjYW52YXMuc2V0RmluaXNoKClcbiAgc2V0LmFuaW1hdGUge3RyYW5zZm9ybTogXCJyMjcwICN7bWlkWH0gI3ttaWRZfVwifSwgMTAwMCwgXCJiYWNrT3V0XCIsIGFuaW1hdGlvbnMubmV4dFxuXG5hbmltYXRpb25zLnB1c2ggLT5cbiAgIyBpbm5lciBvdXRzaWRlIHJpbmdcbiAgY2FudmFzLmNpcmNsZShtaWRYLCBtaWRZLCAwKS5hdHRyXG4gICAgc3Ryb2tlOiBcIiMwMDBcIlxuICAgIFwic3Ryb2tlLXdpZHRoXCI6IDNcbiAgLnRvQmFjaygpXG4gIC5hbmltYXRlIHsgcjogNzAgfSwgNTAwLCBcImJhY2tPdXRcIiwgYW5pbWF0aW9ucy5uZXh0XG5cbmFuaW1hdGlvbnMucHVzaCAtPlxuICAjIG91dGVyIG91dHNpZGUgcmluZ1xuICBjYW52YXMuY2lyY2xlKG1pZFgsIG1pZFksIDApLmF0dHJcbiAgICBzdHJva2U6IFwiIzAwMFwiXG4gICAgXCJzdHJva2Utd2lkdGhcIjogOFxuICAudG9CYWNrKClcbiAgLmFuaW1hdGUgeyByOiA4MCB9LCA1MDAsIFwiYmFja091dFwiLCBhbmltYXRpb25zLm5leHRcblxuYW5pbWF0aW9ucy5zdGFydCgpXG4iXX0=
