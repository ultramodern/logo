(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Points, Queue, Raphael, canvas, circlesDrawn;

Raphael = require("raphael");

canvas = Raphael("logo", window.outerWidth, window.outerHeight);

Points = require("../lib/points.coffee");

Queue = require("../lib/queue.coffee");

circlesDrawn = [];

module.exports = {
  add: function(opts) {
    var animations, outerRadius, pairs, points, vertices, _ref;
    if (opts == null) {
      opts = {};
    }
    animations = Queue();
    points = opts.vertices - 1;
    _ref = Points(points, opts.center), pairs = _ref.pairs, vertices = _ref.vertices;
    canvas.setStart();
    outerRadius = 12;
    vertices.forEach(function(vertex) {
      var x, y;
      x = vertex.x;
      y = vertex.y;
      animations.push(function() {
        return canvas.circle(x, y, 0).attr({
          stroke: "#000",
          "stroke-width": 3,
          fill: "#fff"
        }).animate({
          r: outerRadius
        }, 250, "backOut", animations.next);
      });
      return animations.push(function() {
        var c;
        c = canvas.circle(x, y, 0).attr({
          fill: "#000"
        }).animate({
          r: outerRadius / 2
        }, 250, "backOut", animations.next);
        c.mouseover(function() {
          var angle, color, hue, hues;
          hues = (function() {
            var _i, _results;
            _results = [];
            for (angle = _i = 0; _i <= 360; angle = _i += 15) {
              _results.push(angle);
            }
            return _results;
          })();
          hue = hues[Math.floor(Math.random() * hues.length)];
          color = Raphael.hsl(hue, 75, 50);
          return c.animate({
            fill: color,
            stroke: color,
            transform: "s1.25, 1.25, " + x + ", " + y
          }, 250, "backOut");
        });
        return c.mouseout(function() {
          return c.animate({
            transform: "s1, 1, " + x + ", " + y
          }, 250, "backOut");
        });
      });
    });
    pairs.forEach(function(pair) {
      var line, start;
      start = "M" + pair[0].x + " " + pair[0].y;
      line = "L" + pair[1].x + " " + pair[1].y;
      animations.push(function() {
        return canvas.path(start).attr({
          stroke: "#fff",
          "stroke-width": 3
        }).toBack().animate({
          path: "" + start + " " + line
        }, 150, animations.next);
      });
      return animations.push(function() {
        return canvas.path(start).attr({
          stroke: "#000",
          "stroke-width": 10
        }).toBack().animate({
          path: "" + start + " " + line
        }, 150, animations.next);
      });
    });
    return animations.start();
  }
};


},{"../lib/points.coffee":2,"../lib/queue.coffee":3,"raphael":5}],2:[function(require,module,exports){
var TAU, cos, sin;

cos = Math.cos, sin = Math.sin;

TAU = Math.PI * 2;

module.exports = function(numberOfVertices, center) {
  var angleOffset, angles, distanceFromCenter, pairs, vertices, _i, _results;
  angleOffset = 3 * (TAU / 4);
  angles = (function() {
    _results = [];
    for (var _i = 0; 0 <= numberOfVertices ? _i < numberOfVertices : _i > numberOfVertices; 0 <= numberOfVertices ? _i++ : _i--){ _results.push(_i); }
    return _results;
  }).apply(this).map(function(n) {
    return (n * (TAU / numberOfVertices)) + angleOffset;
  });
  pairs = [];
  vertices = [center];
  distanceFromCenter = 50;
  angles.forEach(function(angle) {
    var vertex, x, y;
    x = cos(angle) * distanceFromCenter + center.x;
    y = sin(angle) * distanceFromCenter + center.y;
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


},{}],3:[function(require,module,exports){
module.exports = function() {
  var queue, self;
  queue = [];
  return self = {
    push: function(fn) {
      return queue.push(fn);
    },
    next: function() {
      var nextItemCallback;
      if (queue.length) {
        nextItemCallback = queue.shift();
        return nextItemCallback();
      }
    },
    start: function() {
      return self.next();
    }
  };
};


},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"./raphael.svg":6,"./raphael.vml":7,"eve":4}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
var Logo, columns, evenRow, logoHeight, logoWidth, rows, _i, _results;

Logo = require("../lib/logo.coffee");

logoWidth = 86.5;

logoHeight = 75;

columns = window.outerWidth / logoWidth + 1;

rows = window.outerHeight / logoHeight;

evenRow = false;

(function() {
  _results = [];
  for (var _i = 0; 0 <= rows ? _i <= rows : _i >= rows; 0 <= rows ? _i++ : _i--){ _results.push(_i); }
  return _results;
}).apply(this).forEach(function(row) {
  var _i, _results;
  evenRow = !evenRow;
  return (function() {
    _results = [];
    for (var _i = 0; 0 <= columns ? _i <= columns : _i >= columns; 0 <= columns ? _i++ : _i--){ _results.push(_i); }
    return _results;
  }).apply(this).forEach(function(col) {
    var x;
    if (evenRow) {
      x = logoWidth * col;
    } else {
      x = (logoWidth * col) - logoWidth / 2;
    }
    return Logo.add({
      vertices: 4,
      center: {
        x: x,
        y: logoHeight * row
      }
    });
  });
});


},{"../lib/logo.coffee":1}]},{},[8])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tYXR0L0NvZGUvc3V0L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbWF0dC9Db2RlL3N1dC9saWIvbG9nby5jb2ZmZWUiLCIvVXNlcnMvbWF0dC9Db2RlL3N1dC9saWIvcG9pbnRzLmNvZmZlZSIsIi9Vc2Vycy9tYXR0L0NvZGUvc3V0L2xpYi9xdWV1ZS5jb2ZmZWUiLCIvVXNlcnMvbWF0dC9Db2RlL3N1dC9ub2RlX21vZHVsZXMvcmFwaGFlbC9ub2RlX21vZHVsZXMvZXZlL2V2ZS5qcyIsIi9Vc2Vycy9tYXR0L0NvZGUvc3V0L25vZGVfbW9kdWxlcy9yYXBoYWVsL3JhcGhhZWwuY29yZS5qcyIsIi9Vc2Vycy9tYXR0L0NvZGUvc3V0L25vZGVfbW9kdWxlcy9yYXBoYWVsL3JhcGhhZWwuc3ZnLmpzIiwiL1VzZXJzL21hdHQvQ29kZS9zdXQvbm9kZV9tb2R1bGVzL3JhcGhhZWwvcmFwaGFlbC52bWwuanMiLCIvVXNlcnMvbWF0dC9Db2RlL3N1dC9zaXRlL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSw0Q0FBQTs7QUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVIsQ0FBVixDQUFBOztBQUFBLE1BRUEsR0FBUyxPQUFBLENBQVEsTUFBUixFQUFnQixNQUFNLENBQUMsVUFBdkIsRUFBbUMsTUFBTSxDQUFDLFdBQTFDLENBRlQsQ0FBQTs7QUFBQSxNQUlBLEdBQVMsT0FBQSxDQUFRLHNCQUFSLENBSlQsQ0FBQTs7QUFBQSxLQUtBLEdBQVEsT0FBQSxDQUFRLHFCQUFSLENBTFIsQ0FBQTs7QUFBQSxZQU9BLEdBQWUsRUFQZixDQUFBOztBQUFBLE1BU00sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxFQUFBLEdBQUEsRUFBSyxTQUFDLElBQUQsR0FBQTtBQUNILFFBQUEsc0RBQUE7O01BREksT0FBSztLQUNUO0FBQUEsSUFBQSxVQUFBLEdBQWEsS0FBQSxDQUFBLENBQWIsQ0FBQTtBQUFBLElBRUEsTUFBQSxHQUFTLElBQUksQ0FBQyxRQUFMLEdBQWdCLENBRnpCLENBQUE7QUFBQSxJQUdBLE9BQW9CLE1BQUEsQ0FBTyxNQUFQLEVBQWUsSUFBSSxDQUFDLE1BQXBCLENBQXBCLEVBQUMsYUFBQSxLQUFELEVBQVEsZ0JBQUEsUUFIUixDQUFBO0FBQUEsSUFLQSxNQUFNLENBQUMsUUFBUCxDQUFBLENBTEEsQ0FBQTtBQUFBLElBT0EsV0FBQSxHQUFjLEVBUGQsQ0FBQTtBQUFBLElBUUEsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsU0FBQyxNQUFELEdBQUE7QUFDZixVQUFBLElBQUE7QUFBQSxNQUFBLENBQUEsR0FBSSxNQUFNLENBQUMsQ0FBWCxDQUFBO0FBQUEsTUFDQSxDQUFBLEdBQUksTUFBTSxDQUFDLENBRFgsQ0FBQTtBQUFBLE1BR0EsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsU0FBQSxHQUFBO2VBRWQsTUFBTSxDQUFDLE1BQVAsQ0FBYyxDQUFkLEVBQWlCLENBQWpCLEVBQW9CLENBQXBCLENBQXNCLENBQUMsSUFBdkIsQ0FDRTtBQUFBLFVBQUEsTUFBQSxFQUFRLE1BQVI7QUFBQSxVQUNBLGNBQUEsRUFBZ0IsQ0FEaEI7QUFBQSxVQUVBLElBQUEsRUFBTSxNQUZOO1NBREYsQ0FJQSxDQUFDLE9BSkQsQ0FJUztBQUFBLFVBQUUsQ0FBQSxFQUFHLFdBQUw7U0FKVCxFQUk2QixHQUo3QixFQUlrQyxTQUpsQyxFQUk2QyxVQUFVLENBQUMsSUFKeEQsRUFGYztNQUFBLENBQWhCLENBSEEsQ0FBQTthQVdBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFNBQUEsR0FBQTtBQUVkLFlBQUEsQ0FBQTtBQUFBLFFBQUEsQ0FBQSxHQUFJLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBZCxFQUFpQixDQUFqQixFQUFvQixDQUFwQixDQUFzQixDQUFDLElBQXZCLENBQ0Y7QUFBQSxVQUFBLElBQUEsRUFBTSxNQUFOO1NBREUsQ0FFSixDQUFDLE9BRkcsQ0FFSztBQUFBLFVBQUUsQ0FBQSxFQUFHLFdBQUEsR0FBYyxDQUFuQjtTQUZMLEVBRTZCLEdBRjdCLEVBRWtDLFNBRmxDLEVBRTZDLFVBQVUsQ0FBQyxJQUZ4RCxDQUFKLENBQUE7QUFBQSxRQUlBLENBQUMsQ0FBQyxTQUFGLENBQVksU0FBQSxHQUFBO0FBQ1YsY0FBQSx1QkFBQTtBQUFBLFVBQUEsSUFBQTs7QUFBUTtpQkFBbUIsMkNBQW5CLEdBQUE7QUFBQSw0QkFBQSxNQUFBLENBQUE7QUFBQTs7Y0FBUixDQUFBO0FBQUEsVUFDQSxHQUFBLEdBQU0sSUFBSyxDQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWMsSUFBSSxDQUFDLE1BQTlCLENBQUEsQ0FEWCxDQUFBO0FBQUEsVUFFQSxLQUFBLEdBQVEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxHQUFaLEVBQWlCLEVBQWpCLEVBQXFCLEVBQXJCLENBRlIsQ0FBQTtpQkFHQSxDQUFDLENBQUMsT0FBRixDQUFVO0FBQUEsWUFDUixJQUFBLEVBQU0sS0FERTtBQUFBLFlBRVIsTUFBQSxFQUFRLEtBRkE7QUFBQSxZQUdSLFNBQUEsRUFBWSxlQUFBLEdBQWMsQ0FBZCxHQUFpQixJQUFqQixHQUFvQixDQUh4QjtXQUFWLEVBSUcsR0FKSCxFQUlRLFNBSlIsRUFKVTtRQUFBLENBQVosQ0FKQSxDQUFBO2VBY0EsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsQ0FBQyxDQUFDLE9BQUYsQ0FBVTtBQUFBLFlBQUUsU0FBQSxFQUFZLFNBQUEsR0FBUSxDQUFSLEdBQVcsSUFBWCxHQUFjLENBQTVCO1dBQVYsRUFBOEMsR0FBOUMsRUFBbUQsU0FBbkQsRUFEUztRQUFBLENBQVgsRUFoQmM7TUFBQSxDQUFoQixFQVplO0lBQUEsQ0FBakIsQ0FSQSxDQUFBO0FBQUEsSUF1Q0EsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFDLElBQUQsR0FBQTtBQUNaLFVBQUEsV0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFTLEdBQUEsR0FBRSxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBVixHQUFhLEdBQWIsR0FBZSxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBaEMsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFRLEdBQUEsR0FBRSxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBVixHQUFhLEdBQWIsR0FBZSxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FEL0IsQ0FBQTtBQUFBLE1BR0EsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaLENBQWtCLENBQUMsSUFBbkIsQ0FDRTtBQUFBLFVBQUEsTUFBQSxFQUFRLE1BQVI7QUFBQSxVQUNBLGNBQUEsRUFBZ0IsQ0FEaEI7U0FERixDQUdBLENBQUMsTUFIRCxDQUFBLENBSUEsQ0FBQyxPQUpELENBSVM7QUFBQSxVQUFFLElBQUEsRUFBTSxFQUFBLEdBQUUsS0FBRixHQUFTLEdBQVQsR0FBVyxJQUFuQjtTQUpULEVBSXVDLEdBSnZDLEVBSTRDLFVBQVUsQ0FBQyxJQUp2RCxFQURjO01BQUEsQ0FBaEIsQ0FIQSxDQUFBO2FBVUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaLENBQWtCLENBQUMsSUFBbkIsQ0FDRTtBQUFBLFVBQUEsTUFBQSxFQUFRLE1BQVI7QUFBQSxVQUNBLGNBQUEsRUFBZ0IsRUFEaEI7U0FERixDQUdBLENBQUMsTUFIRCxDQUFBLENBSUEsQ0FBQyxPQUpELENBSVM7QUFBQSxVQUFFLElBQUEsRUFBTSxFQUFBLEdBQUUsS0FBRixHQUFTLEdBQVQsR0FBVyxJQUFuQjtTQUpULEVBSXVDLEdBSnZDLEVBSTRDLFVBQVUsQ0FBQyxJQUp2RCxFQURjO01BQUEsQ0FBaEIsRUFYWTtJQUFBLENBQWQsQ0F2Q0EsQ0FBQTtXQXlEQSxVQUFVLENBQUMsS0FBWCxDQUFBLEVBMURHO0VBQUEsQ0FBTDtDQVZGLENBQUE7Ozs7QUNBQSxJQUFBLGFBQUE7O0FBQUEsV0FBQyxHQUFELEVBQU0sV0FBQSxHQUFOLENBQUE7O0FBQUEsR0FDQSxHQUFNLElBQUksQ0FBQyxFQUFMLEdBQVUsQ0FEaEIsQ0FBQTs7QUFBQSxNQVNNLENBQUMsT0FBUCxHQUFpQixTQUFDLGdCQUFELEVBQW1CLE1BQW5CLEdBQUE7QUFDZixNQUFBLHNFQUFBO0FBQUEsRUFBQSxXQUFBLEdBQWMsQ0FBQSxHQUFJLENBQUMsR0FBQSxHQUFNLENBQVAsQ0FBbEIsQ0FBQTtBQUFBLEVBRUEsTUFBQSxHQUFTOzs7O2dCQUFzQixDQUFDLEdBQXZCLENBQTJCLFNBQUMsQ0FBRCxHQUFBO1dBQ2xDLENBQUMsQ0FBQSxHQUFJLENBQUMsR0FBQSxHQUFNLGdCQUFQLENBQUwsQ0FBQSxHQUFpQyxZQURDO0VBQUEsQ0FBM0IsQ0FGVCxDQUFBO0FBQUEsRUFLQSxLQUFBLEdBQVEsRUFMUixDQUFBO0FBQUEsRUFNQSxRQUFBLEdBQVcsQ0FBQyxNQUFELENBTlgsQ0FBQTtBQUFBLEVBUUEsa0JBQUEsR0FBcUIsRUFSckIsQ0FBQTtBQUFBLEVBU0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSxTQUFDLEtBQUQsR0FBQTtBQUNiLFFBQUEsWUFBQTtBQUFBLElBQUEsQ0FBQSxHQUFJLEdBQUEsQ0FBSSxLQUFKLENBQUEsR0FBYSxrQkFBYixHQUFrQyxNQUFNLENBQUMsQ0FBN0MsQ0FBQTtBQUFBLElBQ0EsQ0FBQSxHQUFJLEdBQUEsQ0FBSSxLQUFKLENBQUEsR0FBYSxrQkFBYixHQUFrQyxNQUFNLENBQUMsQ0FEN0MsQ0FBQTtBQUFBLElBR0EsTUFBQSxHQUFTO0FBQUEsTUFBQyxHQUFBLENBQUQ7QUFBQSxNQUFJLEdBQUEsQ0FBSjtLQUhULENBQUE7QUFBQSxJQUtBLFFBQVEsQ0FBQyxPQUFULENBQWlCLFNBQUMsQ0FBRCxHQUFBO2FBQ2YsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFDLE1BQUQsRUFBUyxDQUFULENBQVgsRUFEZTtJQUFBLENBQWpCLENBTEEsQ0FBQTtXQVFBLFFBQVEsQ0FBQyxJQUFULENBQWMsTUFBZCxFQVRhO0VBQUEsQ0FBZixDQVRBLENBQUE7U0FvQkE7QUFBQSxJQUFDLFVBQUEsUUFBRDtBQUFBLElBQVcsT0FBQSxLQUFYO0lBckJlO0FBQUEsQ0FUakIsQ0FBQTs7OztBQ0dBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FBQTtBQUNmLE1BQUEsV0FBQTtBQUFBLEVBQUEsS0FBQSxHQUFRLEVBQVIsQ0FBQTtTQUVBLElBQUEsR0FDRTtBQUFBLElBQUEsSUFBQSxFQUFNLFNBQUMsRUFBRCxHQUFBO2FBQ0osS0FBSyxDQUFDLElBQU4sQ0FBVyxFQUFYLEVBREk7SUFBQSxDQUFOO0FBQUEsSUFHQSxJQUFBLEVBQU0sU0FBQSxHQUFBO0FBQ0osVUFBQSxnQkFBQTtBQUFBLE1BQUEsSUFBRyxLQUFLLENBQUMsTUFBVDtBQUNFLFFBQUEsZ0JBQUEsR0FBbUIsS0FBSyxDQUFDLEtBQU4sQ0FBQSxDQUFuQixDQUFBO2VBQ0EsZ0JBQUEsQ0FBQSxFQUZGO09BREk7SUFBQSxDQUhOO0FBQUEsSUFRQSxLQUFBLEVBQU8sU0FBQSxHQUFBO2FBQ0wsSUFBSSxDQUFDLElBQUwsQ0FBQSxFQURLO0lBQUEsQ0FSUDtJQUphO0FBQUEsQ0FBakIsQ0FBQTs7OztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZvS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDLzBDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1OEJBLElBQUEsaUVBQUE7O0FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxvQkFBUixDQUFQLENBQUE7O0FBQUEsU0FFQSxHQUFZLElBRlosQ0FBQTs7QUFBQSxVQUdBLEdBQWEsRUFIYixDQUFBOztBQUFBLE9BS0EsR0FBVSxNQUFNLENBQUMsVUFBUCxHQUFvQixTQUFwQixHQUFnQyxDQUwxQyxDQUFBOztBQUFBLElBTUEsR0FBTyxNQUFNLENBQUMsV0FBUCxHQUFxQixVQU41QixDQUFBOztBQUFBLE9BUUEsR0FBVSxLQVJWLENBQUE7O0FBQUE7Ozs7Y0FTUyxDQUFDLE9BQVYsQ0FBa0IsU0FBQyxHQUFELEdBQUE7QUFDaEIsTUFBQSxZQUFBO0FBQUEsRUFBQSxPQUFBLEdBQVUsQ0FBQSxPQUFWLENBQUE7U0FFQTs7OztnQkFBWSxDQUFDLE9BQWIsQ0FBcUIsU0FBQyxHQUFELEdBQUE7QUFDbkIsUUFBQSxDQUFBO0FBQUEsSUFBQSxJQUFHLE9BQUg7QUFDRSxNQUFBLENBQUEsR0FBSSxTQUFBLEdBQVksR0FBaEIsQ0FERjtLQUFBLE1BQUE7QUFHRSxNQUFBLENBQUEsR0FBSSxDQUFDLFNBQUEsR0FBWSxHQUFiLENBQUEsR0FBb0IsU0FBQSxHQUFZLENBQXBDLENBSEY7S0FBQTtXQUtBLElBQUksQ0FBQyxHQUFMLENBQ0U7QUFBQSxNQUFBLFFBQUEsRUFBVSxDQUFWO0FBQUEsTUFDQSxNQUFBLEVBQ0U7QUFBQSxRQUFBLENBQUEsRUFBRyxDQUFIO0FBQUEsUUFDQSxDQUFBLEVBQUcsVUFBQSxHQUFhLEdBRGhCO09BRkY7S0FERixFQU5tQjtFQUFBLENBQXJCLEVBSGdCO0FBQUEsQ0FBbEIsQ0FUQSxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlJhcGhhZWwgPSByZXF1aXJlIFwicmFwaGFlbFwiXG5cbmNhbnZhcyA9IFJhcGhhZWwgXCJsb2dvXCIsIHdpbmRvdy5vdXRlcldpZHRoLCB3aW5kb3cub3V0ZXJIZWlnaHRcblxuUG9pbnRzID0gcmVxdWlyZSBcIi4uL2xpYi9wb2ludHMuY29mZmVlXCJcblF1ZXVlID0gcmVxdWlyZShcIi4uL2xpYi9xdWV1ZS5jb2ZmZWVcIilcblxuY2lyY2xlc0RyYXduID0gW11cblxubW9kdWxlLmV4cG9ydHMgPVxuICBhZGQ6IChvcHRzPXt9KSAtPlxuICAgIGFuaW1hdGlvbnMgPSBRdWV1ZSgpXG5cbiAgICBwb2ludHMgPSBvcHRzLnZlcnRpY2VzIC0gMVxuICAgIHtwYWlycywgdmVydGljZXN9ID0gUG9pbnRzKHBvaW50cywgb3B0cy5jZW50ZXIpXG5cbiAgICBjYW52YXMuc2V0U3RhcnQoKVxuXG4gICAgb3V0ZXJSYWRpdXMgPSAxMlxuICAgIHZlcnRpY2VzLmZvckVhY2ggKHZlcnRleCkgLT5cbiAgICAgIHggPSB2ZXJ0ZXgueFxuICAgICAgeSA9IHZlcnRleC55XG5cbiAgICAgIGFuaW1hdGlvbnMucHVzaCAtPlxuICAgICAgICAjIG91dGVyIHZlcnRleFxuICAgICAgICBjYW52YXMuY2lyY2xlKHgsIHksIDApLmF0dHJcbiAgICAgICAgICBzdHJva2U6IFwiIzAwMFwiXG4gICAgICAgICAgXCJzdHJva2Utd2lkdGhcIjogM1xuICAgICAgICAgIGZpbGw6IFwiI2ZmZlwiXG4gICAgICAgIC5hbmltYXRlIHsgcjogb3V0ZXJSYWRpdXMgfSwgMjUwLCBcImJhY2tPdXRcIiwgYW5pbWF0aW9ucy5uZXh0XG5cbiAgICAgIGFuaW1hdGlvbnMucHVzaCAtPlxuICAgICAgICAjIGlubmVyIHZlcnRleFxuICAgICAgICBjID0gY2FudmFzLmNpcmNsZSh4LCB5LCAwKS5hdHRyXG4gICAgICAgICAgZmlsbDogXCIjMDAwXCJcbiAgICAgICAgLmFuaW1hdGUgeyByOiBvdXRlclJhZGl1cyAvIDIgfSwgMjUwLCBcImJhY2tPdXRcIiwgYW5pbWF0aW9ucy5uZXh0XG5cbiAgICAgICAgYy5tb3VzZW92ZXIgLT5cbiAgICAgICAgICBodWVzID0gKGFuZ2xlIGZvciBhbmdsZSBpbiBbMC4uMzYwXSBieSAxNSlcbiAgICAgICAgICBodWUgPSBodWVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpodWVzLmxlbmd0aCldXG4gICAgICAgICAgY29sb3IgPSBSYXBoYWVsLmhzbChodWUsIDc1LCA1MClcbiAgICAgICAgICBjLmFuaW1hdGUge1xuICAgICAgICAgICAgZmlsbDogY29sb3JcbiAgICAgICAgICAgIHN0cm9rZTogY29sb3JcbiAgICAgICAgICAgIHRyYW5zZm9ybTogXCJzMS4yNSwgMS4yNSwgI3t4fSwgI3t5fVwiXG4gICAgICAgICAgfSwgMjUwLCBcImJhY2tPdXRcIlxuXG4gICAgICAgIGMubW91c2VvdXQgLT5cbiAgICAgICAgICBjLmFuaW1hdGUgeyB0cmFuc2Zvcm06IFwiczEsIDEsICN7eH0sICN7eX1cIiB9LCAyNTAsIFwiYmFja091dFwiXG5cbiAgICBwYWlycy5mb3JFYWNoIChwYWlyKSAtPlxuICAgICAgc3RhcnQgPSBcIk0je3BhaXJbMF0ueH0gI3twYWlyWzBdLnl9XCJcbiAgICAgIGxpbmUgPSBcIkwje3BhaXJbMV0ueH0gI3twYWlyWzFdLnl9XCJcblxuICAgICAgYW5pbWF0aW9ucy5wdXNoIC0+XG4gICAgICAgIGNhbnZhcy5wYXRoKHN0YXJ0KS5hdHRyXG4gICAgICAgICAgc3Ryb2tlOiBcIiNmZmZcIlxuICAgICAgICAgIFwic3Ryb2tlLXdpZHRoXCI6IDNcbiAgICAgICAgLnRvQmFjaygpXG4gICAgICAgIC5hbmltYXRlIHsgcGF0aDogXCIje3N0YXJ0fSAje2xpbmV9XCIgfSwgMTUwLCBhbmltYXRpb25zLm5leHRcblxuICAgICAgYW5pbWF0aW9ucy5wdXNoIC0+XG4gICAgICAgIGNhbnZhcy5wYXRoKHN0YXJ0KS5hdHRyXG4gICAgICAgICAgc3Ryb2tlOiBcIiMwMDBcIlxuICAgICAgICAgIFwic3Ryb2tlLXdpZHRoXCI6IDEwXG4gICAgICAgIC50b0JhY2soKVxuICAgICAgICAuYW5pbWF0ZSB7IHBhdGg6IFwiI3tzdGFydH0gI3tsaW5lfVwiIH0sIDE1MCwgYW5pbWF0aW9ucy5uZXh0XG5cbiAgICBhbmltYXRpb25zLnN0YXJ0KClcbiIsIntjb3MsIHNpbn0gPSBNYXRoXG5UQVUgPSBNYXRoLlBJICogMlxuXG4jIEdpdmVuIGEgbnVtYmVyIG9mIHZlcnRpY2VzIHJldHVybnMgdGhlIGxvY2F0aW9uIG9mIGVhY2ggdmVydGV4IGFyb3VuZCBhIGNpcmNsZVxuIyBvZiByYWRpdXMgYGRpc3RhbmNlRnJvbUNlbnRlcmAuIEluIGFkZGl0aW9uIHRvIGBudW1iZXJPZlZlcnRpY2VzYCBhbiBhZGRpdGlvbmFsXG4jIHBvaW50IGlzIGFkZGVkIGF0IHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZS5cblxuIyBBbHNvLCByZXR1cm5zIGFuIGFycmF5IG9mIGFycmF5cyB3aGljaCBjb25zaXN0cyBvZiBhbGwgdGhlIGNvbWJpbmF0aW9ucyBvZlxuIyB2ZXJ0aWNlcy4gKGVnIGBbWzEsIDJdLCBbMSwgM10sIFsyLCAxXSwgWzIsIDNdLCBbMywgMV0sIFszLCAyXV1gKVxubW9kdWxlLmV4cG9ydHMgPSAobnVtYmVyT2ZWZXJ0aWNlcywgY2VudGVyKSAtPlxuICBhbmdsZU9mZnNldCA9IDMgKiAoVEFVIC8gNClcblxuICBhbmdsZXMgPSBbMC4uLm51bWJlck9mVmVydGljZXNdLm1hcCAobikgLT5cbiAgICAobiAqIChUQVUgLyBudW1iZXJPZlZlcnRpY2VzKSkgKyBhbmdsZU9mZnNldFxuXG4gIHBhaXJzID0gW11cbiAgdmVydGljZXMgPSBbY2VudGVyXVxuXG4gIGRpc3RhbmNlRnJvbUNlbnRlciA9IDUwXG4gIGFuZ2xlcy5mb3JFYWNoIChhbmdsZSkgLT5cbiAgICB4ID0gY29zKGFuZ2xlKSAqIGRpc3RhbmNlRnJvbUNlbnRlciArIGNlbnRlci54XG4gICAgeSA9IHNpbihhbmdsZSkgKiBkaXN0YW5jZUZyb21DZW50ZXIgKyBjZW50ZXIueVxuXG4gICAgdmVydGV4ID0ge3gsIHl9XG5cbiAgICB2ZXJ0aWNlcy5mb3JFYWNoICh2KSAtPlxuICAgICAgcGFpcnMucHVzaCBbdmVydGV4LCB2XVxuXG4gICAgdmVydGljZXMucHVzaCB2ZXJ0ZXhcblxuICB7dmVydGljZXMsIHBhaXJzfVxuIiwiIyBBIHNpbXBsZSBxdWV1ZSB0byBzZXF1ZW50aWFsbHkgdHJpZ2dlciBhbmltYXRpb25zLlxuIyBVc2UgYHN0YXJ0YCB0byBraWNrIG9mZiBhbmltYXRpb25zIGFuZCBgbmV4dGAgd2hlbiB5b3VcbiMgd2FudCB0byBtb3ZlIHRvIHRoZSBuZXh0IGFuaW1hdGlvblxubW9kdWxlLmV4cG9ydHMgPSAtPlxuICBxdWV1ZSA9IFtdXG5cbiAgc2VsZiA9XG4gICAgcHVzaDogKGZuKSAtPlxuICAgICAgcXVldWUucHVzaChmbilcblxuICAgIG5leHQ6IC0+XG4gICAgICBpZiBxdWV1ZS5sZW5ndGhcbiAgICAgICAgbmV4dEl0ZW1DYWxsYmFjayA9IHF1ZXVlLnNoaWZ0KClcbiAgICAgICAgbmV4dEl0ZW1DYWxsYmFjaygpXG5cbiAgICBzdGFydDogLT5cbiAgICAgIHNlbGYubmV4dCgpXG4iLCIvLyBDb3B5cmlnaHQgKGMpIDIwMTMgQWRvYmUgU3lzdGVtcyBJbmNvcnBvcmF0ZWQuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4vLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4vLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbi8vIFxuLy8gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vLyBcbi8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4vLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJAgXFxcXFxuLy8g4pSCIEV2ZSAwLjQuMiAtIEphdmFTY3JpcHQgRXZlbnRzIExpYnJhcnkgICAgICAgICAgICAgICAgICAgICAg4pSCIFxcXFxcbi8vIOKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpCBcXFxcXG4vLyDilIIgQXV0aG9yIERtaXRyeSBCYXJhbm92c2tpeSAoaHR0cDovL2RtaXRyeS5iYXJhbm92c2tpeS5jb20vKSDilIIgXFxcXFxuLy8g4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYIFxcXFxcblxuKGZ1bmN0aW9uIChnbG9iKSB7XG4gICAgdmFyIHZlcnNpb24gPSBcIjAuNC4yXCIsXG4gICAgICAgIGhhcyA9IFwiaGFzT3duUHJvcGVydHlcIixcbiAgICAgICAgc2VwYXJhdG9yID0gL1tcXC5cXC9dLyxcbiAgICAgICAgd2lsZGNhcmQgPSBcIipcIixcbiAgICAgICAgZnVuID0gZnVuY3Rpb24gKCkge30sXG4gICAgICAgIG51bXNvcnQgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGEgLSBiO1xuICAgICAgICB9LFxuICAgICAgICBjdXJyZW50X2V2ZW50LFxuICAgICAgICBzdG9wLFxuICAgICAgICBldmVudHMgPSB7bjoge319LFxuICAgIC8qXFxcbiAgICAgKiBldmVcbiAgICAgWyBtZXRob2QgXVxuXG4gICAgICogRmlyZXMgZXZlbnQgd2l0aCBnaXZlbiBgbmFtZWAsIGdpdmVuIHNjb3BlIGFuZCBvdGhlciBwYXJhbWV0ZXJzLlxuXG4gICAgID4gQXJndW1lbnRzXG5cbiAgICAgLSBuYW1lIChzdHJpbmcpIG5hbWUgb2YgdGhlICpldmVudCosIGRvdCAoYC5gKSBvciBzbGFzaCAoYC9gKSBzZXBhcmF0ZWRcbiAgICAgLSBzY29wZSAob2JqZWN0KSBjb250ZXh0IGZvciB0aGUgZXZlbnQgaGFuZGxlcnNcbiAgICAgLSB2YXJhcmdzICguLi4pIHRoZSByZXN0IG9mIGFyZ3VtZW50cyB3aWxsIGJlIHNlbnQgdG8gZXZlbnQgaGFuZGxlcnNcblxuICAgICA9IChvYmplY3QpIGFycmF5IG9mIHJldHVybmVkIHZhbHVlcyBmcm9tIHRoZSBsaXN0ZW5lcnNcbiAgICBcXCovXG4gICAgICAgIGV2ZSA9IGZ1bmN0aW9uIChuYW1lLCBzY29wZSkge1xuXHRcdFx0bmFtZSA9IFN0cmluZyhuYW1lKTtcbiAgICAgICAgICAgIHZhciBlID0gZXZlbnRzLFxuICAgICAgICAgICAgICAgIG9sZHN0b3AgPSBzdG9wLFxuICAgICAgICAgICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpLFxuICAgICAgICAgICAgICAgIGxpc3RlbmVycyA9IGV2ZS5saXN0ZW5lcnMobmFtZSksXG4gICAgICAgICAgICAgICAgeiA9IDAsXG4gICAgICAgICAgICAgICAgZiA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIGwsXG4gICAgICAgICAgICAgICAgaW5kZXhlZCA9IFtdLFxuICAgICAgICAgICAgICAgIHF1ZXVlID0ge30sXG4gICAgICAgICAgICAgICAgb3V0ID0gW10sXG4gICAgICAgICAgICAgICAgY2UgPSBjdXJyZW50X2V2ZW50LFxuICAgICAgICAgICAgICAgIGVycm9ycyA9IFtdO1xuICAgICAgICAgICAgY3VycmVudF9ldmVudCA9IG5hbWU7XG4gICAgICAgICAgICBzdG9wID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBpaTsgaSsrKSBpZiAoXCJ6SW5kZXhcIiBpbiBsaXN0ZW5lcnNbaV0pIHtcbiAgICAgICAgICAgICAgICBpbmRleGVkLnB1c2gobGlzdGVuZXJzW2ldLnpJbmRleCk7XG4gICAgICAgICAgICAgICAgaWYgKGxpc3RlbmVyc1tpXS56SW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlW2xpc3RlbmVyc1tpXS56SW5kZXhdID0gbGlzdGVuZXJzW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGluZGV4ZWQuc29ydChudW1zb3J0KTtcbiAgICAgICAgICAgIHdoaWxlIChpbmRleGVkW3pdIDwgMCkge1xuICAgICAgICAgICAgICAgIGwgPSBxdWV1ZVtpbmRleGVkW3orK11dO1xuICAgICAgICAgICAgICAgIG91dC5wdXNoKGwuYXBwbHkoc2NvcGUsIGFyZ3MpKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RvcCkge1xuICAgICAgICAgICAgICAgICAgICBzdG9wID0gb2xkc3RvcDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIGwgPSBsaXN0ZW5lcnNbaV07XG4gICAgICAgICAgICAgICAgaWYgKFwiekluZGV4XCIgaW4gbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobC56SW5kZXggPT0gaW5kZXhlZFt6XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0LnB1c2gobC5hcHBseShzY29wZSwgYXJncykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0b3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbCA9IHF1ZXVlW2luZGV4ZWRbel1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGwgJiYgb3V0LnB1c2gobC5hcHBseShzY29wZSwgYXJncykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gd2hpbGUgKGwpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWV1ZVtsLnpJbmRleF0gPSBsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0LnB1c2gobC5hcHBseShzY29wZSwgYXJncykpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdG9wID0gb2xkc3RvcDtcbiAgICAgICAgICAgIGN1cnJlbnRfZXZlbnQgPSBjZTtcbiAgICAgICAgICAgIHJldHVybiBvdXQubGVuZ3RoID8gb3V0IDogbnVsbDtcbiAgICAgICAgfTtcblx0XHQvLyBVbmRvY3VtZW50ZWQuIERlYnVnIG9ubHkuXG5cdFx0ZXZlLl9ldmVudHMgPSBldmVudHM7XG4gICAgLypcXFxuICAgICAqIGV2ZS5saXN0ZW5lcnNcbiAgICAgWyBtZXRob2QgXVxuXG4gICAgICogSW50ZXJuYWwgbWV0aG9kIHdoaWNoIGdpdmVzIHlvdSBhcnJheSBvZiBhbGwgZXZlbnQgaGFuZGxlcnMgdGhhdCB3aWxsIGJlIHRyaWdnZXJlZCBieSB0aGUgZ2l2ZW4gYG5hbWVgLlxuXG4gICAgID4gQXJndW1lbnRzXG5cbiAgICAgLSBuYW1lIChzdHJpbmcpIG5hbWUgb2YgdGhlIGV2ZW50LCBkb3QgKGAuYCkgb3Igc2xhc2ggKGAvYCkgc2VwYXJhdGVkXG5cbiAgICAgPSAoYXJyYXkpIGFycmF5IG9mIGV2ZW50IGhhbmRsZXJzXG4gICAgXFwqL1xuICAgIGV2ZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICB2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KHNlcGFyYXRvciksXG4gICAgICAgICAgICBlID0gZXZlbnRzLFxuICAgICAgICAgICAgaXRlbSxcbiAgICAgICAgICAgIGl0ZW1zLFxuICAgICAgICAgICAgayxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBpaSxcbiAgICAgICAgICAgIGosXG4gICAgICAgICAgICBqaixcbiAgICAgICAgICAgIG5lcyxcbiAgICAgICAgICAgIGVzID0gW2VdLFxuICAgICAgICAgICAgb3V0ID0gW107XG4gICAgICAgIGZvciAoaSA9IDAsIGlpID0gbmFtZXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgbmVzID0gW107XG4gICAgICAgICAgICBmb3IgKGogPSAwLCBqaiA9IGVzLmxlbmd0aDsgaiA8IGpqOyBqKyspIHtcbiAgICAgICAgICAgICAgICBlID0gZXNbal0ubjtcbiAgICAgICAgICAgICAgICBpdGVtcyA9IFtlW25hbWVzW2ldXSwgZVt3aWxkY2FyZF1dO1xuICAgICAgICAgICAgICAgIGsgPSAyO1xuICAgICAgICAgICAgICAgIHdoaWxlIChrLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbSA9IGl0ZW1zW2tdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmVzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXQgPSBvdXQuY29uY2F0KGl0ZW0uZiB8fCBbXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlcyA9IG5lcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG4gICAgXG4gICAgLypcXFxuICAgICAqIGV2ZS5vblxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQmluZHMgZ2l2ZW4gZXZlbnQgaGFuZGxlciB3aXRoIGEgZ2l2ZW4gbmFtZS4gWW91IGNhbiB1c2Ugd2lsZGNhcmRzIOKAnGAqYOKAnSBmb3IgdGhlIG5hbWVzOlxuICAgICB8IGV2ZS5vbihcIioudW5kZXIuKlwiLCBmKTtcbiAgICAgfCBldmUoXCJtb3VzZS51bmRlci5mbG9vclwiKTsgLy8gdHJpZ2dlcnMgZlxuICAgICAqIFVzZSBAZXZlIHRvIHRyaWdnZXIgdGhlIGxpc3RlbmVyLlxuICAgICAqKlxuICAgICA+IEFyZ3VtZW50c1xuICAgICAqKlxuICAgICAtIG5hbWUgKHN0cmluZykgbmFtZSBvZiB0aGUgZXZlbnQsIGRvdCAoYC5gKSBvciBzbGFzaCAoYC9gKSBzZXBhcmF0ZWQsIHdpdGggb3B0aW9uYWwgd2lsZGNhcmRzXG4gICAgIC0gZiAoZnVuY3Rpb24pIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICAgKipcbiAgICAgPSAoZnVuY3Rpb24pIHJldHVybmVkIGZ1bmN0aW9uIGFjY2VwdHMgYSBzaW5nbGUgbnVtZXJpYyBwYXJhbWV0ZXIgdGhhdCByZXByZXNlbnRzIHotaW5kZXggb2YgdGhlIGhhbmRsZXIuIEl0IGlzIGFuIG9wdGlvbmFsIGZlYXR1cmUgYW5kIG9ubHkgdXNlZCB3aGVuIHlvdSBuZWVkIHRvIGVuc3VyZSB0aGF0IHNvbWUgc3Vic2V0IG9mIGhhbmRsZXJzIHdpbGwgYmUgaW52b2tlZCBpbiBhIGdpdmVuIG9yZGVyLCBkZXNwaXRlIG9mIHRoZSBvcmRlciBvZiBhc3NpZ25tZW50LiBcbiAgICAgPiBFeGFtcGxlOlxuICAgICB8IGV2ZS5vbihcIm1vdXNlXCIsIGVhdEl0KSgyKTtcbiAgICAgfCBldmUub24oXCJtb3VzZVwiLCBzY3JlYW0pO1xuICAgICB8IGV2ZS5vbihcIm1vdXNlXCIsIGNhdGNoSXQpKDEpO1xuICAgICAqIFRoaXMgd2lsbCBlbnN1cmUgdGhhdCBgY2F0Y2hJdCgpYCBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBiZWZvcmUgYGVhdEl0KClgLlxuXHQgKlxuICAgICAqIElmIHlvdSB3YW50IHRvIHB1dCB5b3VyIGhhbmRsZXIgYmVmb3JlIG5vbi1pbmRleGVkIGhhbmRsZXJzLCBzcGVjaWZ5IGEgbmVnYXRpdmUgdmFsdWUuXG4gICAgICogTm90ZTogSSBhc3N1bWUgbW9zdCBvZiB0aGUgdGltZSB5b3UgZG9u4oCZdCBuZWVkIHRvIHdvcnJ5IGFib3V0IHotaW5kZXgsIGJ1dCBpdOKAmXMgbmljZSB0byBoYXZlIHRoaXMgZmVhdHVyZSDigJxqdXN0IGluIGNhc2XigJ0uXG4gICAgXFwqL1xuICAgIGV2ZS5vbiA9IGZ1bmN0aW9uIChuYW1lLCBmKSB7XG5cdFx0bmFtZSA9IFN0cmluZyhuYW1lKTtcblx0XHRpZiAodHlwZW9mIGYgIT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge307XG5cdFx0fVxuICAgICAgICB2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KHNlcGFyYXRvciksXG4gICAgICAgICAgICBlID0gZXZlbnRzO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBuYW1lcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICBlID0gZS5uO1xuICAgICAgICAgICAgZSA9IGUuaGFzT3duUHJvcGVydHkobmFtZXNbaV0pICYmIGVbbmFtZXNbaV1dIHx8IChlW25hbWVzW2ldXSA9IHtuOiB7fX0pO1xuICAgICAgICB9XG4gICAgICAgIGUuZiA9IGUuZiB8fCBbXTtcbiAgICAgICAgZm9yIChpID0gMCwgaWkgPSBlLmYubGVuZ3RoOyBpIDwgaWk7IGkrKykgaWYgKGUuZltpXSA9PSBmKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuO1xuICAgICAgICB9XG4gICAgICAgIGUuZi5wdXNoKGYpO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHpJbmRleCkge1xuICAgICAgICAgICAgaWYgKCt6SW5kZXggPT0gK3pJbmRleCkge1xuICAgICAgICAgICAgICAgIGYuekluZGV4ID0gK3pJbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBldmUuZlxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBmdW5jdGlvbiB0aGF0IHdpbGwgZmlyZSBnaXZlbiBldmVudCB3aXRoIG9wdGlvbmFsIGFyZ3VtZW50cy5cblx0ICogQXJndW1lbnRzIHRoYXQgd2lsbCBiZSBwYXNzZWQgdG8gdGhlIHJlc3VsdCBmdW5jdGlvbiB3aWxsIGJlIGFsc29cblx0ICogY29uY2F0ZWQgdG8gdGhlIGxpc3Qgb2YgZmluYWwgYXJndW1lbnRzLlxuIFx0IHwgZWwub25jbGljayA9IGV2ZS5mKFwiY2xpY2tcIiwgMSwgMik7XG4gXHQgfCBldmUub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoYSwgYiwgYykge1xuIFx0IHwgICAgIGNvbnNvbGUubG9nKGEsIGIsIGMpOyAvLyAxLCAyLCBbZXZlbnQgb2JqZWN0XVxuIFx0IHwgfSk7XG4gICAgID4gQXJndW1lbnRzXG5cdCAtIGV2ZW50IChzdHJpbmcpIGV2ZW50IG5hbWVcblx0IC0gdmFyYXJncyAo4oCmKSBhbmQgYW55IG90aGVyIGFyZ3VtZW50c1xuXHQgPSAoZnVuY3Rpb24pIHBvc3NpYmxlIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICBcXCovXG5cdGV2ZS5mID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0dmFyIGF0dHJzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRldmUuYXBwbHkobnVsbCwgW2V2ZW50LCBudWxsXS5jb25jYXQoYXR0cnMpLmNvbmNhdChbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkpKTtcblx0XHR9O1xuXHR9O1xuICAgIC8qXFxcbiAgICAgKiBldmUuc3RvcFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogSXMgdXNlZCBpbnNpZGUgYW4gZXZlbnQgaGFuZGxlciB0byBzdG9wIHRoZSBldmVudCwgcHJldmVudGluZyBhbnkgc3Vic2VxdWVudCBsaXN0ZW5lcnMgZnJvbSBmaXJpbmcuXG4gICAgXFwqL1xuICAgIGV2ZS5zdG9wID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzdG9wID0gMTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBldmUubnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENvdWxkIGJlIHVzZWQgaW5zaWRlIGV2ZW50IGhhbmRsZXIgdG8gZmlndXJlIG91dCBhY3R1YWwgbmFtZSBvZiB0aGUgZXZlbnQuXG4gICAgICoqXG4gICAgID4gQXJndW1lbnRzXG4gICAgICoqXG4gICAgIC0gc3VibmFtZSAoc3RyaW5nKSAjb3B0aW9uYWwgc3VibmFtZSBvZiB0aGUgZXZlbnRcbiAgICAgKipcbiAgICAgPSAoc3RyaW5nKSBuYW1lIG9mIHRoZSBldmVudCwgaWYgYHN1Ym5hbWVgIGlzIG5vdCBzcGVjaWZpZWRcbiAgICAgKiBvclxuICAgICA9IChib29sZWFuKSBgdHJ1ZWAsIGlmIGN1cnJlbnQgZXZlbnTigJlzIG5hbWUgY29udGFpbnMgYHN1Ym5hbWVgXG4gICAgXFwqL1xuICAgIGV2ZS5udCA9IGZ1bmN0aW9uIChzdWJuYW1lKSB7XG4gICAgICAgIGlmIChzdWJuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChcIig/OlxcXFwufFxcXFwvfF4pXCIgKyBzdWJuYW1lICsgXCIoPzpcXFxcLnxcXFxcL3wkKVwiKS50ZXN0KGN1cnJlbnRfZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdXJyZW50X2V2ZW50O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIGV2ZS5udHNcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENvdWxkIGJlIHVzZWQgaW5zaWRlIGV2ZW50IGhhbmRsZXIgdG8gZmlndXJlIG91dCBhY3R1YWwgbmFtZSBvZiB0aGUgZXZlbnQuXG4gICAgICoqXG4gICAgICoqXG4gICAgID0gKGFycmF5KSBuYW1lcyBvZiB0aGUgZXZlbnRcbiAgICBcXCovXG4gICAgZXZlLm50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRfZXZlbnQuc3BsaXQoc2VwYXJhdG9yKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBldmUub2ZmXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGdpdmVuIGZ1bmN0aW9uIGZyb20gdGhlIGxpc3Qgb2YgZXZlbnQgbGlzdGVuZXJzIGFzc2lnbmVkIHRvIGdpdmVuIG5hbWUuXG5cdCAqIElmIG5vIGFyZ3VtZW50cyBzcGVjaWZpZWQgYWxsIHRoZSBldmVudHMgd2lsbCBiZSBjbGVhcmVkLlxuICAgICAqKlxuICAgICA+IEFyZ3VtZW50c1xuICAgICAqKlxuICAgICAtIG5hbWUgKHN0cmluZykgbmFtZSBvZiB0aGUgZXZlbnQsIGRvdCAoYC5gKSBvciBzbGFzaCAoYC9gKSBzZXBhcmF0ZWQsIHdpdGggb3B0aW9uYWwgd2lsZGNhcmRzXG4gICAgIC0gZiAoZnVuY3Rpb24pIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICBcXCovXG4gICAgLypcXFxuICAgICAqIGV2ZS51bmJpbmRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFNlZSBAZXZlLm9mZlxuICAgIFxcKi9cbiAgICBldmUub2ZmID0gZXZlLnVuYmluZCA9IGZ1bmN0aW9uIChuYW1lLCBmKSB7XG5cdFx0aWYgKCFuYW1lKSB7XG5cdFx0ICAgIGV2ZS5fZXZlbnRzID0gZXZlbnRzID0ge246IHt9fTtcblx0XHRcdHJldHVybjtcblx0XHR9XG4gICAgICAgIHZhciBuYW1lcyA9IG5hbWUuc3BsaXQoc2VwYXJhdG9yKSxcbiAgICAgICAgICAgIGUsXG4gICAgICAgICAgICBrZXksXG4gICAgICAgICAgICBzcGxpY2UsXG4gICAgICAgICAgICBpLCBpaSwgaiwgamosXG4gICAgICAgICAgICBjdXIgPSBbZXZlbnRzXTtcbiAgICAgICAgZm9yIChpID0gMCwgaWkgPSBuYW1lcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgY3VyLmxlbmd0aDsgaiArPSBzcGxpY2UubGVuZ3RoIC0gMikge1xuICAgICAgICAgICAgICAgIHNwbGljZSA9IFtqLCAxXTtcbiAgICAgICAgICAgICAgICBlID0gY3VyW2pdLm47XG4gICAgICAgICAgICAgICAgaWYgKG5hbWVzW2ldICE9IHdpbGRjYXJkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlW25hbWVzW2ldXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3BsaWNlLnB1c2goZVtuYW1lc1tpXV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gZSkgaWYgKGVbaGFzXShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGxpY2UucHVzaChlW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1ci5zcGxpY2UuYXBwbHkoY3VyLCBzcGxpY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDAsIGlpID0gY3VyLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgIGUgPSBjdXJbaV07XG4gICAgICAgICAgICB3aGlsZSAoZS5uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGYpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUuZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMCwgamogPSBlLmYubGVuZ3RoOyBqIDwgamo7IGorKykgaWYgKGUuZltqXSA9PSBmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5mLnNwbGljZShqLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICFlLmYubGVuZ3RoICYmIGRlbGV0ZSBlLmY7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gZS5uKSBpZiAoZS5uW2hhc10oa2V5KSAmJiBlLm5ba2V5XS5mKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZnVuY3MgPSBlLm5ba2V5XS5mO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMCwgamogPSBmdW5jcy5sZW5ndGg7IGogPCBqajsgaisrKSBpZiAoZnVuY3Nbal0gPT0gZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmNzLnNwbGljZShqLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICFmdW5jcy5sZW5ndGggJiYgZGVsZXRlIGUubltrZXldLmY7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZS5mO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGtleSBpbiBlLm4pIGlmIChlLm5baGFzXShrZXkpICYmIGUubltrZXldLmYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBlLm5ba2V5XS5mO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGUgPSBlLm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBldmUub25jZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQmluZHMgZ2l2ZW4gZXZlbnQgaGFuZGxlciB3aXRoIGEgZ2l2ZW4gbmFtZSB0byBvbmx5IHJ1biBvbmNlIHRoZW4gdW5iaW5kIGl0c2VsZi5cbiAgICAgfCBldmUub25jZShcImxvZ2luXCIsIGYpO1xuICAgICB8IGV2ZShcImxvZ2luXCIpOyAvLyB0cmlnZ2VycyBmXG4gICAgIHwgZXZlKFwibG9naW5cIik7IC8vIG5vIGxpc3RlbmVyc1xuICAgICAqIFVzZSBAZXZlIHRvIHRyaWdnZXIgdGhlIGxpc3RlbmVyLlxuICAgICAqKlxuICAgICA+IEFyZ3VtZW50c1xuICAgICAqKlxuICAgICAtIG5hbWUgKHN0cmluZykgbmFtZSBvZiB0aGUgZXZlbnQsIGRvdCAoYC5gKSBvciBzbGFzaCAoYC9gKSBzZXBhcmF0ZWQsIHdpdGggb3B0aW9uYWwgd2lsZGNhcmRzXG4gICAgIC0gZiAoZnVuY3Rpb24pIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICAgKipcbiAgICAgPSAoZnVuY3Rpb24pIHNhbWUgcmV0dXJuIGZ1bmN0aW9uIGFzIEBldmUub25cbiAgICBcXCovXG4gICAgZXZlLm9uY2UgPSBmdW5jdGlvbiAobmFtZSwgZikge1xuICAgICAgICB2YXIgZjIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBldmUudW5iaW5kKG5hbWUsIGYyKTtcbiAgICAgICAgICAgIHJldHVybiBmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBldmUub24obmFtZSwgZjIpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIGV2ZS52ZXJzaW9uXG4gICAgIFsgcHJvcGVydHkgKHN0cmluZykgXVxuICAgICAqKlxuICAgICAqIEN1cnJlbnQgdmVyc2lvbiBvZiB0aGUgbGlicmFyeS5cbiAgICBcXCovXG4gICAgZXZlLnZlcnNpb24gPSB2ZXJzaW9uO1xuICAgIGV2ZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFwiWW91IGFyZSBydW5uaW5nIEV2ZSBcIiArIHZlcnNpb247XG4gICAgfTtcbiAgICAodHlwZW9mIG1vZHVsZSAhPSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZS5leHBvcnRzKSA/IChtb2R1bGUuZXhwb3J0cyA9IGV2ZSkgOiAodHlwZW9mIGRlZmluZSAhPSBcInVuZGVmaW5lZFwiID8gKGRlZmluZShcImV2ZVwiLCBbXSwgZnVuY3Rpb24oKSB7IHJldHVybiBldmU7IH0pKSA6IChnbG9iLmV2ZSA9IGV2ZSkpO1xufSkodGhpcyk7XG4iLCIvLyDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJAgXFxcXFxuLy8g4pSCIFwiUmFwaGHDq2wgMi4xLjBcIiAtIEphdmFTY3JpcHQgVmVjdG9yIExpYnJhcnkgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIFxcXFxcbi8vIOKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpCBcXFxcXG4vLyDilIIgQ29weXJpZ2h0IChjKSAyMDA4LTIwMTEgRG1pdHJ5IEJhcmFub3Zza2l5IChodHRwOi8vcmFwaGFlbGpzLmNvbSkgICDilIIgXFxcXFxuLy8g4pSCIENvcHlyaWdodCAoYykgMjAwOC0yMDExIFNlbmNoYSBMYWJzIChodHRwOi8vc2VuY2hhLmNvbSkgICAgICAgICAgICAg4pSCIFxcXFxcbi8vIOKUgiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIChodHRwOi8vcmFwaGFlbGpzLmNvbS9saWNlbnNlLmh0bWwpIGxpY2Vuc2UuIOKUgiBcXFxcXG4vLyDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJggXFxcXFxuXG52YXIgZXZlID0gcmVxdWlyZSgnZXZlJyk7XG5cbihmdW5jdGlvbiAoKSB7XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWxcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgYSBjYW52YXMgb2JqZWN0IG9uIHdoaWNoIHRvIGRyYXcuXG4gICAgICogWW91IG11c3QgZG8gdGhpcyBmaXJzdCwgYXMgYWxsIGZ1dHVyZSBjYWxscyB0byBkcmF3aW5nIG1ldGhvZHNcbiAgICAgKiBmcm9tIHRoaXMgaW5zdGFuY2Ugd2lsbCBiZSBib3VuZCB0byB0aGlzIGNhbnZhcy5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gY29udGFpbmVyIChIVE1MRWxlbWVudHxzdHJpbmcpIERPTSBlbGVtZW50IG9yIGl0cyBJRCB3aGljaCBpcyBnb2luZyB0byBiZSBhIHBhcmVudCBmb3IgZHJhd2luZyBzdXJmYWNlXG4gICAgIC0gd2lkdGggKG51bWJlcilcbiAgICAgLSBoZWlnaHQgKG51bWJlcilcbiAgICAgLSBjYWxsYmFjayAoZnVuY3Rpb24pICNvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB3aGljaCBpcyBnb2luZyB0byBiZSBleGVjdXRlZCBpbiB0aGUgY29udGV4dCBvZiBuZXdseSBjcmVhdGVkIHBhcGVyXG4gICAgICogb3JcbiAgICAgLSB4IChudW1iZXIpXG4gICAgIC0geSAobnVtYmVyKVxuICAgICAtIHdpZHRoIChudW1iZXIpXG4gICAgIC0gaGVpZ2h0IChudW1iZXIpXG4gICAgIC0gY2FsbGJhY2sgKGZ1bmN0aW9uKSAjb3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24gd2hpY2ggaXMgZ29pbmcgdG8gYmUgZXhlY3V0ZWQgaW4gdGhlIGNvbnRleHQgb2YgbmV3bHkgY3JlYXRlZCBwYXBlclxuICAgICAqIG9yXG4gICAgIC0gYWxsIChhcnJheSkgKGZpcnN0IDMgb3IgNCBlbGVtZW50cyBpbiB0aGUgYXJyYXkgYXJlIGVxdWFsIHRvIFtjb250YWluZXJJRCwgd2lkdGgsIGhlaWdodF0gb3IgW3gsIHksIHdpZHRoLCBoZWlnaHRdLiBUaGUgcmVzdCBhcmUgZWxlbWVudCBkZXNjcmlwdGlvbnMgaW4gZm9ybWF0IHt0eXBlOiB0eXBlLCA8YXR0cmlidXRlcz59KS4gU2VlIEBQYXBlci5hZGQuXG4gICAgIC0gY2FsbGJhY2sgKGZ1bmN0aW9uKSAjb3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24gd2hpY2ggaXMgZ29pbmcgdG8gYmUgZXhlY3V0ZWQgaW4gdGhlIGNvbnRleHQgb2YgbmV3bHkgY3JlYXRlZCBwYXBlclxuICAgICAqIG9yXG4gICAgIC0gb25SZWFkeUNhbGxiYWNrIChmdW5jdGlvbikgZnVuY3Rpb24gdGhhdCBpcyBnb2luZyB0byBiZSBjYWxsZWQgb24gRE9NIHJlYWR5IGV2ZW50LiBZb3UgY2FuIGFsc28gc3Vic2NyaWJlIHRvIHRoaXMgZXZlbnQgdmlhIEV2ZeKAmXMg4oCcRE9NTG9hZOKAnSBldmVudC4gSW4gdGhpcyBjYXNlIG1ldGhvZCByZXR1cm5zIGB1bmRlZmluZWRgLlxuICAgICA9IChvYmplY3QpIEBQYXBlclxuICAgICA+IFVzYWdlXG4gICAgIHwgLy8gRWFjaCBvZiB0aGUgZm9sbG93aW5nIGV4YW1wbGVzIGNyZWF0ZSBhIGNhbnZhc1xuICAgICB8IC8vIHRoYXQgaXMgMzIwcHggd2lkZSBieSAyMDBweCBoaWdoLlxuICAgICB8IC8vIENhbnZhcyBpcyBjcmVhdGVkIGF0IHRoZSB2aWV3cG9ydOKAmXMgMTAsNTAgY29vcmRpbmF0ZS5cbiAgICAgfCB2YXIgcGFwZXIgPSBSYXBoYWVsKDEwLCA1MCwgMzIwLCAyMDApO1xuICAgICB8IC8vIENhbnZhcyBpcyBjcmVhdGVkIGF0IHRoZSB0b3AgbGVmdCBjb3JuZXIgb2YgdGhlICNub3RlcGFkIGVsZW1lbnRcbiAgICAgfCAvLyAob3IgaXRzIHRvcCByaWdodCBjb3JuZXIgaW4gZGlyPVwicnRsXCIgZWxlbWVudHMpXG4gICAgIHwgdmFyIHBhcGVyID0gUmFwaGFlbChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5vdGVwYWRcIiksIDMyMCwgMjAwKTtcbiAgICAgfCAvLyBTYW1lIGFzIGFib3ZlXG4gICAgIHwgdmFyIHBhcGVyID0gUmFwaGFlbChcIm5vdGVwYWRcIiwgMzIwLCAyMDApO1xuICAgICB8IC8vIEltYWdlIGR1bXBcbiAgICAgfCB2YXIgc2V0ID0gUmFwaGFlbChbXCJub3RlcGFkXCIsIDMyMCwgMjAwLCB7XG4gICAgIHwgICAgIHR5cGU6IFwicmVjdFwiLFxuICAgICB8ICAgICB4OiAxMCxcbiAgICAgfCAgICAgeTogMTAsXG4gICAgIHwgICAgIHdpZHRoOiAyNSxcbiAgICAgfCAgICAgaGVpZ2h0OiAyNSxcbiAgICAgfCAgICAgc3Ryb2tlOiBcIiNmMDBcIlxuICAgICB8IH0sIHtcbiAgICAgfCAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgIHwgICAgIHg6IDMwLFxuICAgICB8ICAgICB5OiA0MCxcbiAgICAgfCAgICAgdGV4dDogXCJEdW1wXCJcbiAgICAgfCB9XSk7XG4gICAgXFwqL1xuICAgIGZ1bmN0aW9uIFIoZmlyc3QpIHtcbiAgICAgICAgaWYgKFIuaXMoZmlyc3QsIFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2FkZWQgPyBmaXJzdCgpIDogZXZlLm9uKFwicmFwaGFlbC5ET01sb2FkXCIsIGZpcnN0KTtcbiAgICAgICAgfSBlbHNlIGlmIChSLmlzKGZpcnN0LCBhcnJheSkpIHtcbiAgICAgICAgICAgIHJldHVybiBSLl9lbmdpbmUuY3JlYXRlW2FwcGx5XShSLCBmaXJzdC5zcGxpY2UoMCwgMyArIFIuaXMoZmlyc3RbMF0sIG51KSkpLmFkZChmaXJzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgICAgICAgICBpZiAoUi5pcyhhcmdzW2FyZ3MubGVuZ3RoIC0gMV0sIFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICAgICAgICB2YXIgZiA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRlZCA/IGYuY2FsbChSLl9lbmdpbmUuY3JlYXRlW2FwcGx5XShSLCBhcmdzKSkgOiBldmUub24oXCJyYXBoYWVsLkRPTWxvYWRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBmLmNhbGwoUi5fZW5naW5lLmNyZWF0ZVthcHBseV0oUiwgYXJncykpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUi5fZW5naW5lLmNyZWF0ZVthcHBseV0oUiwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBSLnZlcnNpb24gPSBcIjIuMS4wXCI7XG4gICAgUi5ldmUgPSBldmU7XG4gICAgdmFyIGxvYWRlZCxcbiAgICAgICAgc2VwYXJhdG9yID0gL1ssIF0rLyxcbiAgICAgICAgZWxlbWVudHMgPSB7Y2lyY2xlOiAxLCByZWN0OiAxLCBwYXRoOiAxLCBlbGxpcHNlOiAxLCB0ZXh0OiAxLCBpbWFnZTogMX0sXG4gICAgICAgIGZvcm1hdHJnID0gL1xceyhcXGQrKVxcfS9nLFxuICAgICAgICBwcm90byA9IFwicHJvdG90eXBlXCIsXG4gICAgICAgIGhhcyA9IFwiaGFzT3duUHJvcGVydHlcIixcbiAgICAgICAgZyA9IHtcbiAgICAgICAgICAgIGRvYzogZG9jdW1lbnQsXG4gICAgICAgICAgICB3aW46IHdpbmRvd1xuICAgICAgICB9LFxuICAgICAgICBvbGRSYXBoYWVsID0ge1xuICAgICAgICAgICAgd2FzOiBPYmplY3QucHJvdG90eXBlW2hhc10uY2FsbChnLndpbiwgXCJSYXBoYWVsXCIpLFxuICAgICAgICAgICAgaXM6IGcud2luLlJhcGhhZWxcbiAgICAgICAgfSxcbiAgICAgICAgUGFwZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvKlxcXG4gICAgICAgICAgICAgKiBQYXBlci5jYVxuICAgICAgICAgICAgIFsgcHJvcGVydHkgKG9iamVjdCkgXVxuICAgICAgICAgICAgICoqXG4gICAgICAgICAgICAgKiBTaG9ydGN1dCBmb3IgQFBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNcbiAgICAgICAgICAgIFxcKi9cbiAgICAgICAgICAgIC8qXFxcbiAgICAgICAgICAgICAqIFBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNcbiAgICAgICAgICAgICBbIHByb3BlcnR5IChvYmplY3QpIF1cbiAgICAgICAgICAgICAqKlxuICAgICAgICAgICAgICogSWYgeW91IGhhdmUgYSBzZXQgb2YgYXR0cmlidXRlcyB0aGF0IHlvdSB3b3VsZCBsaWtlIHRvIHJlcHJlc2VudFxuICAgICAgICAgICAgICogYXMgYSBmdW5jdGlvbiBvZiBzb21lIG51bWJlciB5b3UgY2FuIGRvIGl0IGVhc2lseSB3aXRoIGN1c3RvbSBhdHRyaWJ1dGVzOlxuICAgICAgICAgICAgID4gVXNhZ2VcbiAgICAgICAgICAgICB8IHBhcGVyLmN1c3RvbUF0dHJpYnV0ZXMuaHVlID0gZnVuY3Rpb24gKG51bSkge1xuICAgICAgICAgICAgIHwgICAgIG51bSA9IG51bSAlIDE7XG4gICAgICAgICAgICAgfCAgICAgcmV0dXJuIHtmaWxsOiBcImhzYihcIiArIG51bSArIFwiLCAwLjc1LCAxKVwifTtcbiAgICAgICAgICAgICB8IH07XG4gICAgICAgICAgICAgfCAvLyBDdXN0b20gYXR0cmlidXRlIOKAnGh1ZeKAnSB3aWxsIGNoYW5nZSBmaWxsXG4gICAgICAgICAgICAgfCAvLyB0byBiZSBnaXZlbiBodWUgd2l0aCBmaXhlZCBzYXR1cmF0aW9uIGFuZCBicmlnaHRuZXNzLlxuICAgICAgICAgICAgIHwgLy8gTm93IHlvdSBjYW4gdXNlIGl0IGxpa2UgdGhpczpcbiAgICAgICAgICAgICB8IHZhciBjID0gcGFwZXIuY2lyY2xlKDEwLCAxMCwgMTApLmF0dHIoe2h1ZTogLjQ1fSk7XG4gICAgICAgICAgICAgfCAvLyBvciBldmVuIGxpa2UgdGhpczpcbiAgICAgICAgICAgICB8IGMuYW5pbWF0ZSh7aHVlOiAxfSwgMWUzKTtcbiAgICAgICAgICAgICB8IFxuICAgICAgICAgICAgIHwgLy8gWW91IGNvdWxkIGFsc28gY3JlYXRlIGN1c3RvbSBhdHRyaWJ1dGVcbiAgICAgICAgICAgICB8IC8vIHdpdGggbXVsdGlwbGUgcGFyYW1ldGVyczpcbiAgICAgICAgICAgICB8IHBhcGVyLmN1c3RvbUF0dHJpYnV0ZXMuaHNiID0gZnVuY3Rpb24gKGgsIHMsIGIpIHtcbiAgICAgICAgICAgICB8ICAgICByZXR1cm4ge2ZpbGw6IFwiaHNiKFwiICsgW2gsIHMsIGJdLmpvaW4oXCIsXCIpICsgXCIpXCJ9O1xuICAgICAgICAgICAgIHwgfTtcbiAgICAgICAgICAgICB8IGMuYXR0cih7aHNiOiBcIjAuNSAuOCAxXCJ9KTtcbiAgICAgICAgICAgICB8IGMuYW5pbWF0ZSh7aHNiOiBbMSwgMCwgMC41XX0sIDFlMyk7XG4gICAgICAgICAgICBcXCovXG4gICAgICAgICAgICB0aGlzLmNhID0gdGhpcy5jdXN0b21BdHRyaWJ1dGVzID0ge307XG4gICAgICAgIH0sXG4gICAgICAgIHBhcGVycHJvdG8sXG4gICAgICAgIGFwcGVuZENoaWxkID0gXCJhcHBlbmRDaGlsZFwiLFxuICAgICAgICBhcHBseSA9IFwiYXBwbHlcIixcbiAgICAgICAgY29uY2F0ID0gXCJjb25jYXRcIixcbiAgICAgICAgc3VwcG9ydHNUb3VjaCA9IFwiY3JlYXRlVG91Y2hcIiBpbiBnLmRvYyxcbiAgICAgICAgRSA9IFwiXCIsXG4gICAgICAgIFMgPSBcIiBcIixcbiAgICAgICAgU3RyID0gU3RyaW5nLFxuICAgICAgICBzcGxpdCA9IFwic3BsaXRcIixcbiAgICAgICAgZXZlbnRzID0gXCJjbGljayBkYmxjbGljayBtb3VzZWRvd24gbW91c2Vtb3ZlIG1vdXNlb3V0IG1vdXNlb3ZlciBtb3VzZXVwIHRvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsXCJbc3BsaXRdKFMpLFxuICAgICAgICB0b3VjaE1hcCA9IHtcbiAgICAgICAgICAgIG1vdXNlZG93bjogXCJ0b3VjaHN0YXJ0XCIsXG4gICAgICAgICAgICBtb3VzZW1vdmU6IFwidG91Y2htb3ZlXCIsXG4gICAgICAgICAgICBtb3VzZXVwOiBcInRvdWNoZW5kXCJcbiAgICAgICAgfSxcbiAgICAgICAgbG93ZXJDYXNlID0gU3RyLnByb3RvdHlwZS50b0xvd2VyQ2FzZSxcbiAgICAgICAgbWF0aCA9IE1hdGgsXG4gICAgICAgIG1tYXggPSBtYXRoLm1heCxcbiAgICAgICAgbW1pbiA9IG1hdGgubWluLFxuICAgICAgICBhYnMgPSBtYXRoLmFicyxcbiAgICAgICAgcG93ID0gbWF0aC5wb3csXG4gICAgICAgIFBJID0gbWF0aC5QSSxcbiAgICAgICAgbnUgPSBcIm51bWJlclwiLFxuICAgICAgICBzdHJpbmcgPSBcInN0cmluZ1wiLFxuICAgICAgICBhcnJheSA9IFwiYXJyYXlcIixcbiAgICAgICAgdG9TdHJpbmcgPSBcInRvU3RyaW5nXCIsXG4gICAgICAgIGZpbGxTdHJpbmcgPSBcImZpbGxcIixcbiAgICAgICAgb2JqZWN0VG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgICAgICBwYXBlciA9IHt9LFxuICAgICAgICBwdXNoID0gXCJwdXNoXCIsXG4gICAgICAgIElTVVJMID0gUi5fSVNVUkwgPSAvXnVybFxcKFsnXCJdPyhbXlxcKV0rPylbJ1wiXT9cXCkkL2ksXG4gICAgICAgIGNvbG91clJlZ0V4cCA9IC9eXFxzKigoI1thLWZcXGRdezZ9KXwoI1thLWZcXGRdezN9KXxyZ2JhP1xcKFxccyooW1xcZFxcLl0rJT9cXHMqLFxccypbXFxkXFwuXSslP1xccyosXFxzKltcXGRcXC5dKyU/KD86XFxzKixcXHMqW1xcZFxcLl0rJT8pPylcXHMqXFwpfGhzYmE/XFwoXFxzKihbXFxkXFwuXSsoPzpkZWd8XFx4YjB8JSk/XFxzKixcXHMqW1xcZFxcLl0rJT9cXHMqLFxccypbXFxkXFwuXSsoPzolP1xccyosXFxzKltcXGRcXC5dKyk/KSU/XFxzKlxcKXxoc2xhP1xcKFxccyooW1xcZFxcLl0rKD86ZGVnfFxceGIwfCUpP1xccyosXFxzKltcXGRcXC5dKyU/XFxzKixcXHMqW1xcZFxcLl0rKD86JT9cXHMqLFxccypbXFxkXFwuXSspPyklP1xccypcXCkpXFxzKiQvaSxcbiAgICAgICAgaXNuYW4gPSB7XCJOYU5cIjogMSwgXCJJbmZpbml0eVwiOiAxLCBcIi1JbmZpbml0eVwiOiAxfSxcbiAgICAgICAgYmV6aWVycmcgPSAvXig/OmN1YmljLSk/YmV6aWVyXFwoKFteLF0rKSwoW14sXSspLChbXixdKyksKFteXFwpXSspXFwpLyxcbiAgICAgICAgcm91bmQgPSBtYXRoLnJvdW5kLFxuICAgICAgICBzZXRBdHRyaWJ1dGUgPSBcInNldEF0dHJpYnV0ZVwiLFxuICAgICAgICB0b0Zsb2F0ID0gcGFyc2VGbG9hdCxcbiAgICAgICAgdG9JbnQgPSBwYXJzZUludCxcbiAgICAgICAgdXBwZXJDYXNlID0gU3RyLnByb3RvdHlwZS50b1VwcGVyQ2FzZSxcbiAgICAgICAgYXZhaWxhYmxlQXR0cnMgPSBSLl9hdmFpbGFibGVBdHRycyA9IHtcbiAgICAgICAgICAgIFwiYXJyb3ctZW5kXCI6IFwibm9uZVwiLFxuICAgICAgICAgICAgXCJhcnJvdy1zdGFydFwiOiBcIm5vbmVcIixcbiAgICAgICAgICAgIGJsdXI6IDAsXG4gICAgICAgICAgICBcImNsaXAtcmVjdFwiOiBcIjAgMCAxZTkgMWU5XCIsXG4gICAgICAgICAgICBjdXJzb3I6IFwiZGVmYXVsdFwiLFxuICAgICAgICAgICAgY3g6IDAsXG4gICAgICAgICAgICBjeTogMCxcbiAgICAgICAgICAgIGZpbGw6IFwiI2ZmZlwiLFxuICAgICAgICAgICAgXCJmaWxsLW9wYWNpdHlcIjogMSxcbiAgICAgICAgICAgIGZvbnQ6ICcxMHB4IFwiQXJpYWxcIicsXG4gICAgICAgICAgICBcImZvbnQtZmFtaWx5XCI6ICdcIkFyaWFsXCInLFxuICAgICAgICAgICAgXCJmb250LXNpemVcIjogXCIxMFwiLFxuICAgICAgICAgICAgXCJmb250LXN0eWxlXCI6IFwibm9ybWFsXCIsXG4gICAgICAgICAgICBcImZvbnQtd2VpZ2h0XCI6IDQwMCxcbiAgICAgICAgICAgIGdyYWRpZW50OiAwLFxuICAgICAgICAgICAgaGVpZ2h0OiAwLFxuICAgICAgICAgICAgaHJlZjogXCJodHRwOi8vcmFwaGFlbGpzLmNvbS9cIixcbiAgICAgICAgICAgIFwibGV0dGVyLXNwYWNpbmdcIjogMCxcbiAgICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgICBwYXRoOiBcIk0wLDBcIixcbiAgICAgICAgICAgIHI6IDAsXG4gICAgICAgICAgICByeDogMCxcbiAgICAgICAgICAgIHJ5OiAwLFxuICAgICAgICAgICAgc3JjOiBcIlwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcIiMwMDBcIixcbiAgICAgICAgICAgIFwic3Ryb2tlLWRhc2hhcnJheVwiOiBcIlwiLFxuICAgICAgICAgICAgXCJzdHJva2UtbGluZWNhcFwiOiBcImJ1dHRcIixcbiAgICAgICAgICAgIFwic3Ryb2tlLWxpbmVqb2luXCI6IFwiYnV0dFwiLFxuICAgICAgICAgICAgXCJzdHJva2UtbWl0ZXJsaW1pdFwiOiAwLFxuICAgICAgICAgICAgXCJzdHJva2Utb3BhY2l0eVwiOiAxLFxuICAgICAgICAgICAgXCJzdHJva2Utd2lkdGhcIjogMSxcbiAgICAgICAgICAgIHRhcmdldDogXCJfYmxhbmtcIixcbiAgICAgICAgICAgIFwidGV4dC1hbmNob3JcIjogXCJtaWRkbGVcIixcbiAgICAgICAgICAgIHRpdGxlOiBcIlJhcGhhZWxcIixcbiAgICAgICAgICAgIHRyYW5zZm9ybTogXCJcIixcbiAgICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgfSxcbiAgICAgICAgYXZhaWxhYmxlQW5pbUF0dHJzID0gUi5fYXZhaWxhYmxlQW5pbUF0dHJzID0ge1xuICAgICAgICAgICAgYmx1cjogbnUsXG4gICAgICAgICAgICBcImNsaXAtcmVjdFwiOiBcImNzdlwiLFxuICAgICAgICAgICAgY3g6IG51LFxuICAgICAgICAgICAgY3k6IG51LFxuICAgICAgICAgICAgZmlsbDogXCJjb2xvdXJcIixcbiAgICAgICAgICAgIFwiZmlsbC1vcGFjaXR5XCI6IG51LFxuICAgICAgICAgICAgXCJmb250LXNpemVcIjogbnUsXG4gICAgICAgICAgICBoZWlnaHQ6IG51LFxuICAgICAgICAgICAgb3BhY2l0eTogbnUsXG4gICAgICAgICAgICBwYXRoOiBcInBhdGhcIixcbiAgICAgICAgICAgIHI6IG51LFxuICAgICAgICAgICAgcng6IG51LFxuICAgICAgICAgICAgcnk6IG51LFxuICAgICAgICAgICAgc3Ryb2tlOiBcImNvbG91clwiLFxuICAgICAgICAgICAgXCJzdHJva2Utb3BhY2l0eVwiOiBudSxcbiAgICAgICAgICAgIFwic3Ryb2tlLXdpZHRoXCI6IG51LFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBcInRyYW5zZm9ybVwiLFxuICAgICAgICAgICAgd2lkdGg6IG51LFxuICAgICAgICAgICAgeDogbnUsXG4gICAgICAgICAgICB5OiBudVxuICAgICAgICB9LFxuICAgICAgICB3aGl0ZXNwYWNlID0gL1tcXHgwOVxceDBhXFx4MGJcXHgwY1xceDBkXFx4MjBcXHhhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDBcXHUyMDI4XFx1MjAyOV0vZyxcbiAgICAgICAgY29tbWFTcGFjZXMgPSAvW1xceDA5XFx4MGFcXHgwYlxceDBjXFx4MGRcXHgyMFxceGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XSosW1xceDA5XFx4MGFcXHgwYlxceDBjXFx4MGRcXHgyMFxceGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XSovLFxuICAgICAgICBoc3JnID0ge2hzOiAxLCByZzogMX0sXG4gICAgICAgIHAycyA9IC8sPyhbYWNobG1xcnN0dnh6XSksPy9naSxcbiAgICAgICAgcGF0aENvbW1hbmQgPSAvKFthY2hsbXJxc3R2el0pW1xceDA5XFx4MGFcXHgwYlxceDBjXFx4MGRcXHgyMFxceGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5LF0qKCgtP1xcZCpcXC4/XFxkKig/OmVbXFwtK10/XFxkKyk/W1xceDA5XFx4MGFcXHgwYlxceDBjXFx4MGRcXHgyMFxceGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XSosP1tcXHgwOVxceDBhXFx4MGJcXHgwY1xceDBkXFx4MjBcXHhhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDBcXHUyMDI4XFx1MjAyOV0qKSspL2lnLFxuICAgICAgICB0Q29tbWFuZCA9IC8oW3JzdG1dKVtcXHgwOVxceDBhXFx4MGJcXHgwY1xceDBkXFx4MjBcXHhhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDBcXHUyMDI4XFx1MjAyOSxdKigoLT9cXGQqXFwuP1xcZCooPzplW1xcLStdP1xcZCspP1tcXHgwOVxceDBhXFx4MGJcXHgwY1xceDBkXFx4MjBcXHhhMFxcdTE2ODBcXHUxODBlXFx1MjAwMFxcdTIwMDFcXHUyMDAyXFx1MjAwM1xcdTIwMDRcXHUyMDA1XFx1MjAwNlxcdTIwMDdcXHUyMDA4XFx1MjAwOVxcdTIwMGFcXHUyMDJmXFx1MjA1ZlxcdTMwMDBcXHUyMDI4XFx1MjAyOV0qLD9bXFx4MDlcXHgwYVxceDBiXFx4MGNcXHgwZFxceDIwXFx4YTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjldKikrKS9pZyxcbiAgICAgICAgcGF0aFZhbHVlcyA9IC8oLT9cXGQqXFwuP1xcZCooPzplW1xcLStdP1xcZCspPylbXFx4MDlcXHgwYVxceDBiXFx4MGNcXHgwZFxceDIwXFx4YTBcXHUxNjgwXFx1MTgwZVxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBhXFx1MjAyZlxcdTIwNWZcXHUzMDAwXFx1MjAyOFxcdTIwMjldKiw/W1xceDA5XFx4MGFcXHgwYlxceDBjXFx4MGRcXHgyMFxceGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XSovaWcsXG4gICAgICAgIHJhZGlhbF9ncmFkaWVudCA9IFIuX3JhZGlhbF9ncmFkaWVudCA9IC9ecig/OlxcKChbXixdKz8pW1xceDA5XFx4MGFcXHgwYlxceDBjXFx4MGRcXHgyMFxceGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XSosW1xceDA5XFx4MGFcXHgwYlxceDBjXFx4MGRcXHgyMFxceGEwXFx1MTY4MFxcdTE4MGVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwYVxcdTIwMmZcXHUyMDVmXFx1MzAwMFxcdTIwMjhcXHUyMDI5XSooW15cXCldKz8pXFwpKT8vLFxuICAgICAgICBlbGRhdGEgPSB7fSxcbiAgICAgICAgc29ydEJ5S2V5ID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLmtleSAtIGIua2V5O1xuICAgICAgICB9LFxuICAgICAgICBzb3J0QnlOdW1iZXIgPSBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIHRvRmxvYXQoYSkgLSB0b0Zsb2F0KGIpO1xuICAgICAgICB9LFxuICAgICAgICBmdW4gPSBmdW5jdGlvbiAoKSB7fSxcbiAgICAgICAgcGlwZSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgfSxcbiAgICAgICAgcmVjdFBhdGggPSBSLl9yZWN0UGF0aCA9IGZ1bmN0aW9uICh4LCB5LCB3LCBoLCByKSB7XG4gICAgICAgICAgICBpZiAocikge1xuICAgICAgICAgICAgICAgIHJldHVybiBbW1wiTVwiLCB4ICsgciwgeV0sIFtcImxcIiwgdyAtIHIgKiAyLCAwXSwgW1wiYVwiLCByLCByLCAwLCAwLCAxLCByLCByXSwgW1wibFwiLCAwLCBoIC0gciAqIDJdLCBbXCJhXCIsIHIsIHIsIDAsIDAsIDEsIC1yLCByXSwgW1wibFwiLCByICogMiAtIHcsIDBdLCBbXCJhXCIsIHIsIHIsIDAsIDAsIDEsIC1yLCAtcl0sIFtcImxcIiwgMCwgciAqIDIgLSBoXSwgW1wiYVwiLCByLCByLCAwLCAwLCAxLCByLCAtcl0sIFtcInpcIl1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFtbXCJNXCIsIHgsIHldLCBbXCJsXCIsIHcsIDBdLCBbXCJsXCIsIDAsIGhdLCBbXCJsXCIsIC13LCAwXSwgW1wielwiXV07XG4gICAgICAgIH0sXG4gICAgICAgIGVsbGlwc2VQYXRoID0gZnVuY3Rpb24gKHgsIHksIHJ4LCByeSkge1xuICAgICAgICAgICAgaWYgKHJ5ID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByeSA9IHJ4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFtbXCJNXCIsIHgsIHldLCBbXCJtXCIsIDAsIC1yeV0sIFtcImFcIiwgcngsIHJ5LCAwLCAxLCAxLCAwLCAyICogcnldLCBbXCJhXCIsIHJ4LCByeSwgMCwgMSwgMSwgMCwgLTIgKiByeV0sIFtcInpcIl1dO1xuICAgICAgICB9LFxuICAgICAgICBnZXRQYXRoID0gUi5fZ2V0UGF0aCA9IHtcbiAgICAgICAgICAgIHBhdGg6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbC5hdHRyKFwicGF0aFwiKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaXJjbGU6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgIHZhciBhID0gZWwuYXR0cnM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsbGlwc2VQYXRoKGEuY3gsIGEuY3ksIGEucik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZWxsaXBzZTogZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGEgPSBlbC5hdHRycztcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxsaXBzZVBhdGgoYS5jeCwgYS5jeSwgYS5yeCwgYS5yeSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVjdDogZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGEgPSBlbC5hdHRycztcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjdFBhdGgoYS54LCBhLnksIGEud2lkdGgsIGEuaGVpZ2h0LCBhLnIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGltYWdlOiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgYSA9IGVsLmF0dHJzO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWN0UGF0aChhLngsIGEueSwgYS53aWR0aCwgYS5oZWlnaHQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRleHQ6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgIHZhciBiYm94ID0gZWwuX2dldEJCb3goKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjdFBhdGgoYmJveC54LCBiYm94LnksIGJib3gud2lkdGgsIGJib3guaGVpZ2h0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQgOiBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgICAgIHZhciBiYm94ID0gZWwuX2dldEJCb3goKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjdFBhdGgoYmJveC54LCBiYm94LnksIGJib3gud2lkdGgsIGJib3guaGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBSYXBoYWVsLm1hcFBhdGhcbiAgICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFRyYW5zZm9ybSB0aGUgcGF0aCBzdHJpbmcgd2l0aCBnaXZlbiBtYXRyaXguXG4gICAgICAgICA+IFBhcmFtZXRlcnNcbiAgICAgICAgIC0gcGF0aCAoc3RyaW5nKSBwYXRoIHN0cmluZ1xuICAgICAgICAgLSBtYXRyaXggKG9iamVjdCkgc2VlIEBNYXRyaXhcbiAgICAgICAgID0gKHN0cmluZykgdHJhbnNmb3JtZWQgcGF0aCBzdHJpbmdcbiAgICAgICAgXFwqL1xuICAgICAgICBtYXBQYXRoID0gUi5tYXBQYXRoID0gZnVuY3Rpb24gKHBhdGgsIG1hdHJpeCkge1xuICAgICAgICAgICAgaWYgKCFtYXRyaXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB4LCB5LCBpLCBqLCBpaSwgamosIHBhdGhpO1xuICAgICAgICAgICAgcGF0aCA9IHBhdGgyY3VydmUocGF0aCk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBpaSA9IHBhdGgubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIHBhdGhpID0gcGF0aFtpXTtcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAxLCBqaiA9IHBhdGhpLmxlbmd0aDsgaiA8IGpqOyBqICs9IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgeCA9IG1hdHJpeC54KHBhdGhpW2pdLCBwYXRoaVtqICsgMV0pO1xuICAgICAgICAgICAgICAgICAgICB5ID0gbWF0cml4LnkocGF0aGlbal0sIHBhdGhpW2ogKyAxXSk7XG4gICAgICAgICAgICAgICAgICAgIHBhdGhpW2pdID0geDtcbiAgICAgICAgICAgICAgICAgICAgcGF0aGlbaiArIDFdID0geTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcGF0aDtcbiAgICAgICAgfTtcblxuICAgIFIuX2cgPSBnO1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnR5cGVcbiAgICAgWyBwcm9wZXJ0eSAoc3RyaW5nKSBdXG4gICAgICoqXG4gICAgICogQ2FuIGJlIOKAnFNWR+KAnSwg4oCcVk1M4oCdIG9yIGVtcHR5LCBkZXBlbmRpbmcgb24gYnJvd3NlciBzdXBwb3J0LlxuICAgIFxcKi9cbiAgICBSLnR5cGUgPSAoZy53aW4uU1ZHQW5nbGUgfHwgZy5kb2MuaW1wbGVtZW50YXRpb24uaGFzRmVhdHVyZShcImh0dHA6Ly93d3cudzMub3JnL1RSL1NWRzExL2ZlYXR1cmUjQmFzaWNTdHJ1Y3R1cmVcIiwgXCIxLjFcIikgPyBcIlNWR1wiIDogXCJWTUxcIik7XG4gICAgaWYgKFIudHlwZSA9PSBcIlZNTFwiKSB7XG4gICAgICAgIHZhciBkID0gZy5kb2MuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcbiAgICAgICAgICAgIGI7XG4gICAgICAgIGQuaW5uZXJIVE1MID0gJzx2OnNoYXBlIGFkaj1cIjFcIi8+JztcbiAgICAgICAgYiA9IGQuZmlyc3RDaGlsZDtcbiAgICAgICAgYi5zdHlsZS5iZWhhdmlvciA9IFwidXJsKCNkZWZhdWx0I1ZNTClcIjtcbiAgICAgICAgaWYgKCEoYiAmJiB0eXBlb2YgYi5hZGogPT0gXCJvYmplY3RcIikpIHtcbiAgICAgICAgICAgIHJldHVybiAoUi50eXBlID0gRSk7XG4gICAgICAgIH1cbiAgICAgICAgZCA9IG51bGw7XG4gICAgfVxuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnN2Z1xuICAgICBbIHByb3BlcnR5IChib29sZWFuKSBdXG4gICAgICoqXG4gICAgICogYHRydWVgIGlmIGJyb3dzZXIgc3VwcG9ydHMgU1ZHLlxuICAgIFxcKi9cbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC52bWxcbiAgICAgWyBwcm9wZXJ0eSAoYm9vbGVhbikgXVxuICAgICAqKlxuICAgICAqIGB0cnVlYCBpZiBicm93c2VyIHN1cHBvcnRzIFZNTC5cbiAgICBcXCovXG4gICAgUi5zdmcgPSAhKFIudm1sID0gUi50eXBlID09IFwiVk1MXCIpO1xuICAgIFIuX1BhcGVyID0gUGFwZXI7XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuZm5cbiAgICAgWyBwcm9wZXJ0eSAob2JqZWN0KSBdXG4gICAgICoqXG4gICAgICogWW91IGNhbiBhZGQgeW91ciBvd24gbWV0aG9kIHRvIHRoZSBjYW52YXMuIEZvciBleGFtcGxlIGlmIHlvdSB3YW50IHRvIGRyYXcgYSBwaWUgY2hhcnQsXG4gICAgICogeW91IGNhbiBjcmVhdGUgeW91ciBvd24gcGllIGNoYXJ0IGZ1bmN0aW9uIGFuZCBzaGlwIGl0IGFzIGEgUmFwaGHDq2wgcGx1Z2luLiBUbyBkbyB0aGlzXG4gICAgICogeW91IG5lZWQgdG8gZXh0ZW5kIHRoZSBgUmFwaGFlbC5mbmAgb2JqZWN0LiBZb3Ugc2hvdWxkIG1vZGlmeSB0aGUgYGZuYCBvYmplY3QgYmVmb3JlIGFcbiAgICAgKiBSYXBoYcOrbCBpbnN0YW5jZSBpcyBjcmVhdGVkLCBvdGhlcndpc2UgaXQgd2lsbCB0YWtlIG5vIGVmZmVjdC4gUGxlYXNlIG5vdGUgdGhhdCB0aGVcbiAgICAgKiBhYmlsaXR5IGZvciBuYW1lc3BhY2VkIHBsdWdpbnMgd2FzIHJlbW92ZWQgaW4gUmFwaGFlbCAyLjAuIEl0IGlzIHVwIHRvIHRoZSBwbHVnaW4gdG9cbiAgICAgKiBlbnN1cmUgYW55IG5hbWVzcGFjaW5nIGVuc3VyZXMgcHJvcGVyIGNvbnRleHQuXG4gICAgID4gVXNhZ2VcbiAgICAgfCBSYXBoYWVsLmZuLmFycm93ID0gZnVuY3Rpb24gKHgxLCB5MSwgeDIsIHkyLCBzaXplKSB7XG4gICAgIHwgICAgIHJldHVybiB0aGlzLnBhdGgoIC4uLiApO1xuICAgICB8IH07XG4gICAgIHwgLy8gb3IgY3JlYXRlIG5hbWVzcGFjZVxuICAgICB8IFJhcGhhZWwuZm4ubXlzdHVmZiA9IHtcbiAgICAgfCAgICAgYXJyb3c6IGZ1bmN0aW9uICgpIHvigKZ9LFxuICAgICB8ICAgICBzdGFyOiBmdW5jdGlvbiAoKSB74oCmfSxcbiAgICAgfCAgICAgLy8gZXRj4oCmXG4gICAgIHwgfTtcbiAgICAgfCB2YXIgcGFwZXIgPSBSYXBoYWVsKDEwLCAxMCwgNjMwLCA0ODApO1xuICAgICB8IC8vIHRoZW4gdXNlIGl0XG4gICAgIHwgcGFwZXIuYXJyb3coMTAsIDEwLCAzMCwgMzAsIDUpLmF0dHIoe2ZpbGw6IFwiI2YwMFwifSk7XG4gICAgIHwgcGFwZXIubXlzdHVmZi5hcnJvdygpO1xuICAgICB8IHBhcGVyLm15c3R1ZmYuc3RhcigpO1xuICAgIFxcKi9cbiAgICBSLmZuID0gcGFwZXJwcm90byA9IFBhcGVyLnByb3RvdHlwZSA9IFIucHJvdG90eXBlO1xuICAgIFIuX2lkID0gMDtcbiAgICBSLl9vaWQgPSAwO1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmlzXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBIYW5kZnVsbCByZXBsYWNlbWVudCBmb3IgYHR5cGVvZmAgb3BlcmF0b3IuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIG8gKOKApikgYW55IG9iamVjdCBvciBwcmltaXRpdmVcbiAgICAgLSB0eXBlIChzdHJpbmcpIG5hbWUgb2YgdGhlIHR5cGUsIGkuZS4g4oCcc3RyaW5n4oCdLCDigJxmdW5jdGlvbuKAnSwg4oCcbnVtYmVy4oCdLCBldGMuXG4gICAgID0gKGJvb2xlYW4pIGlzIGdpdmVuIHZhbHVlIGlzIG9mIGdpdmVuIHR5cGVcbiAgICBcXCovXG4gICAgUi5pcyA9IGZ1bmN0aW9uIChvLCB0eXBlKSB7XG4gICAgICAgIHR5cGUgPSBsb3dlckNhc2UuY2FsbCh0eXBlKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gXCJmaW5pdGVcIikge1xuICAgICAgICAgICAgcmV0dXJuICFpc25hbltoYXNdKCtvKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PSBcImFycmF5XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBvIGluc3RhbmNlb2YgQXJyYXk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICAodHlwZSA9PSBcIm51bGxcIiAmJiBvID09PSBudWxsKSB8fFxuICAgICAgICAgICAgICAgICh0eXBlID09IHR5cGVvZiBvICYmIG8gIT09IG51bGwpIHx8XG4gICAgICAgICAgICAgICAgKHR5cGUgPT0gXCJvYmplY3RcIiAmJiBvID09PSBPYmplY3QobykpIHx8XG4gICAgICAgICAgICAgICAgKHR5cGUgPT0gXCJhcnJheVwiICYmIEFycmF5LmlzQXJyYXkgJiYgQXJyYXkuaXNBcnJheShvKSkgfHxcbiAgICAgICAgICAgICAgICBvYmplY3RUb1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKS50b0xvd2VyQ2FzZSgpID09IHR5cGU7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGNsb25lKG9iaikge1xuICAgICAgICBpZiAoT2JqZWN0KG9iaikgIT09IG9iaikge1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzID0gbmV3IG9iai5jb25zdHJ1Y3RvcjtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKG9ialtoYXNdKGtleSkpIHtcbiAgICAgICAgICAgIHJlc1trZXldID0gY2xvbmUob2JqW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuYW5nbGVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgYW5nbGUgYmV0d2VlbiB0d28gb3IgdGhyZWUgcG9pbnRzXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHgxIChudW1iZXIpIHggY29vcmQgb2YgZmlyc3QgcG9pbnRcbiAgICAgLSB5MSAobnVtYmVyKSB5IGNvb3JkIG9mIGZpcnN0IHBvaW50XG4gICAgIC0geDIgKG51bWJlcikgeCBjb29yZCBvZiBzZWNvbmQgcG9pbnRcbiAgICAgLSB5MiAobnVtYmVyKSB5IGNvb3JkIG9mIHNlY29uZCBwb2ludFxuICAgICAtIHgzIChudW1iZXIpICNvcHRpb25hbCB4IGNvb3JkIG9mIHRoaXJkIHBvaW50XG4gICAgIC0geTMgKG51bWJlcikgI29wdGlvbmFsIHkgY29vcmQgb2YgdGhpcmQgcG9pbnRcbiAgICAgPSAobnVtYmVyKSBhbmdsZSBpbiBkZWdyZWVzLlxuICAgIFxcKi9cbiAgICBSLmFuZ2xlID0gZnVuY3Rpb24gKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMpIHtcbiAgICAgICAgaWYgKHgzID09IG51bGwpIHtcbiAgICAgICAgICAgIHZhciB4ID0geDEgLSB4MixcbiAgICAgICAgICAgICAgICB5ID0geTEgLSB5MjtcbiAgICAgICAgICAgIGlmICgheCAmJiAheSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICgxODAgKyBtYXRoLmF0YW4yKC15LCAteCkgKiAxODAgLyBQSSArIDM2MCkgJSAzNjA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUi5hbmdsZSh4MSwgeTEsIHgzLCB5MykgLSBSLmFuZ2xlKHgyLCB5MiwgeDMsIHkzKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwucmFkXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBUcmFuc2Zvcm0gYW5nbGUgdG8gcmFkaWFuc1xuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBkZWcgKG51bWJlcikgYW5nbGUgaW4gZGVncmVlc1xuICAgICA9IChudW1iZXIpIGFuZ2xlIGluIHJhZGlhbnMuXG4gICAgXFwqL1xuICAgIFIucmFkID0gZnVuY3Rpb24gKGRlZykge1xuICAgICAgICByZXR1cm4gZGVnICUgMzYwICogUEkgLyAxODA7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5kZWdcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFRyYW5zZm9ybSBhbmdsZSB0byBkZWdyZWVzXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGRlZyAobnVtYmVyKSBhbmdsZSBpbiByYWRpYW5zXG4gICAgID0gKG51bWJlcikgYW5nbGUgaW4gZGVncmVlcy5cbiAgICBcXCovXG4gICAgUi5kZWcgPSBmdW5jdGlvbiAocmFkKSB7XG4gICAgICAgIHJldHVybiByYWQgKiAxODAgLyBQSSAlIDM2MDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnNuYXBUb1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogU25hcHMgZ2l2ZW4gdmFsdWUgdG8gZ2l2ZW4gZ3JpZC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gdmFsdWVzIChhcnJheXxudW1iZXIpIGdpdmVuIGFycmF5IG9mIHZhbHVlcyBvciBzdGVwIG9mIHRoZSBncmlkXG4gICAgIC0gdmFsdWUgKG51bWJlcikgdmFsdWUgdG8gYWRqdXN0XG4gICAgIC0gdG9sZXJhbmNlIChudW1iZXIpICNvcHRpb25hbCB0b2xlcmFuY2UgZm9yIHNuYXBwaW5nLiBEZWZhdWx0IGlzIGAxMGAuXG4gICAgID0gKG51bWJlcikgYWRqdXN0ZWQgdmFsdWUuXG4gICAgXFwqL1xuICAgIFIuc25hcFRvID0gZnVuY3Rpb24gKHZhbHVlcywgdmFsdWUsIHRvbGVyYW5jZSkge1xuICAgICAgICB0b2xlcmFuY2UgPSBSLmlzKHRvbGVyYW5jZSwgXCJmaW5pdGVcIikgPyB0b2xlcmFuY2UgOiAxMDtcbiAgICAgICAgaWYgKFIuaXModmFsdWVzLCBhcnJheSkpIHtcbiAgICAgICAgICAgIHZhciBpID0gdmFsdWVzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlIChpLS0pIGlmIChhYnModmFsdWVzW2ldIC0gdmFsdWUpIDw9IHRvbGVyYW5jZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZXNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSArdmFsdWVzO1xuICAgICAgICAgICAgdmFyIHJlbSA9IHZhbHVlICUgdmFsdWVzO1xuICAgICAgICAgICAgaWYgKHJlbSA8IHRvbGVyYW5jZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAtIHJlbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZW0gPiB2YWx1ZXMgLSB0b2xlcmFuY2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgLSByZW0gKyB2YWx1ZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gICAgXG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuY3JlYXRlVVVJRFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBSRkM0MTIyLCB2ZXJzaW9uIDQgSURcbiAgICBcXCovXG4gICAgdmFyIGNyZWF0ZVVVSUQgPSBSLmNyZWF0ZVVVSUQgPSAoZnVuY3Rpb24gKHV1aWRSZWdFeCwgdXVpZFJlcGxhY2VyKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHhcIi5yZXBsYWNlKHV1aWRSZWdFeCwgdXVpZFJlcGxhY2VyKS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICB9O1xuICAgIH0pKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgIHZhciByID0gbWF0aC5yYW5kb20oKSAqIDE2IHwgMCxcbiAgICAgICAgICAgIHYgPSBjID09IFwieFwiID8gciA6IChyICYgMyB8IDgpO1xuICAgICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG5cbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5zZXRXaW5kb3dcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFVzZWQgd2hlbiB5b3UgbmVlZCB0byBkcmF3IGluIGAmbHQ7aWZyYW1lPmAuIFN3aXRjaGVkIHdpbmRvdyB0byB0aGUgaWZyYW1lIG9uZS5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gbmV3d2luICh3aW5kb3cpIG5ldyB3aW5kb3cgb2JqZWN0XG4gICAgXFwqL1xuICAgIFIuc2V0V2luZG93ID0gZnVuY3Rpb24gKG5ld3dpbikge1xuICAgICAgICBldmUoXCJyYXBoYWVsLnNldFdpbmRvd1wiLCBSLCBnLndpbiwgbmV3d2luKTtcbiAgICAgICAgZy53aW4gPSBuZXd3aW47XG4gICAgICAgIGcuZG9jID0gZy53aW4uZG9jdW1lbnQ7XG4gICAgICAgIGlmIChSLl9lbmdpbmUuaW5pdFdpbikge1xuICAgICAgICAgICAgUi5fZW5naW5lLmluaXRXaW4oZy53aW4pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgdG9IZXggPSBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICAgICAgaWYgKFIudm1sKSB7XG4gICAgICAgICAgICAvLyBodHRwOi8vZGVhbi5lZHdhcmRzLm5hbWUvd2VibG9nLzIwMDkvMTAvY29udmVydC1hbnktY29sb3VyLXZhbHVlLXRvLWhleC1pbi1tc2llL1xuICAgICAgICAgICAgdmFyIHRyaW0gPSAvXlxccyt8XFxzKyQvZztcbiAgICAgICAgICAgIHZhciBib2Q7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBkb2N1bSA9IG5ldyBBY3RpdmVYT2JqZWN0KFwiaHRtbGZpbGVcIik7XG4gICAgICAgICAgICAgICAgZG9jdW0ud3JpdGUoXCI8Ym9keT5cIik7XG4gICAgICAgICAgICAgICAgZG9jdW0uY2xvc2UoKTtcbiAgICAgICAgICAgICAgICBib2QgPSBkb2N1bS5ib2R5O1xuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgYm9kID0gY3JlYXRlUG9wdXAoKS5kb2N1bWVudC5ib2R5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJhbmdlID0gYm9kLmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgdG9IZXggPSBjYWNoZXIoZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYm9kLnN0eWxlLmNvbG9yID0gU3RyKGNvbG9yKS5yZXBsYWNlKHRyaW0sIEUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSByYW5nZS5xdWVyeUNvbW1hbmRWYWx1ZShcIkZvcmVDb2xvclwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAoKHZhbHVlICYgMjU1KSA8PCAxNikgfCAodmFsdWUgJiA2NTI4MCkgfCAoKHZhbHVlICYgMTY3MTE2ODApID4+PiAxNik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiNcIiArIChcIjAwMDAwMFwiICsgdmFsdWUudG9TdHJpbmcoMTYpKS5zbGljZSgtNik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBpID0gZy5kb2MuY3JlYXRlRWxlbWVudChcImlcIik7XG4gICAgICAgICAgICBpLnRpdGxlID0gXCJSYXBoYVxceGVibCBDb2xvdXIgUGlja2VyXCI7XG4gICAgICAgICAgICBpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIGcuZG9jLmJvZHkuYXBwZW5kQ2hpbGQoaSk7XG4gICAgICAgICAgICB0b0hleCA9IGNhY2hlcihmdW5jdGlvbiAoY29sb3IpIHtcbiAgICAgICAgICAgICAgICBpLnN0eWxlLmNvbG9yID0gY29sb3I7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGcuZG9jLmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoaSwgRSkuZ2V0UHJvcGVydHlWYWx1ZShcImNvbG9yXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRvSGV4KGNvbG9yKTtcbiAgICB9LFxuICAgIGhzYnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gXCJoc2IoXCIgKyBbdGhpcy5oLCB0aGlzLnMsIHRoaXMuYl0gKyBcIilcIjtcbiAgICB9LFxuICAgIGhzbHRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gXCJoc2woXCIgKyBbdGhpcy5oLCB0aGlzLnMsIHRoaXMubF0gKyBcIilcIjtcbiAgICB9LFxuICAgIHJnYnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oZXg7XG4gICAgfSxcbiAgICBwcmVwYXJlUkdCID0gZnVuY3Rpb24gKHIsIGcsIGIpIHtcbiAgICAgICAgaWYgKGcgPT0gbnVsbCAmJiBSLmlzKHIsIFwib2JqZWN0XCIpICYmIFwiclwiIGluIHIgJiYgXCJnXCIgaW4gciAmJiBcImJcIiBpbiByKSB7XG4gICAgICAgICAgICBiID0gci5iO1xuICAgICAgICAgICAgZyA9IHIuZztcbiAgICAgICAgICAgIHIgPSByLnI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGcgPT0gbnVsbCAmJiBSLmlzKHIsIHN0cmluZykpIHtcbiAgICAgICAgICAgIHZhciBjbHIgPSBSLmdldFJHQihyKTtcbiAgICAgICAgICAgIHIgPSBjbHIucjtcbiAgICAgICAgICAgIGcgPSBjbHIuZztcbiAgICAgICAgICAgIGIgPSBjbHIuYjtcbiAgICAgICAgfVxuICAgICAgICBpZiAociA+IDEgfHwgZyA+IDEgfHwgYiA+IDEpIHtcbiAgICAgICAgICAgIHIgLz0gMjU1O1xuICAgICAgICAgICAgZyAvPSAyNTU7XG4gICAgICAgICAgICBiIC89IDI1NTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIFtyLCBnLCBiXTtcbiAgICB9LFxuICAgIHBhY2thZ2VSR0IgPSBmdW5jdGlvbiAociwgZywgYiwgbykge1xuICAgICAgICByICo9IDI1NTtcbiAgICAgICAgZyAqPSAyNTU7XG4gICAgICAgIGIgKj0gMjU1O1xuICAgICAgICB2YXIgcmdiID0ge1xuICAgICAgICAgICAgcjogcixcbiAgICAgICAgICAgIGc6IGcsXG4gICAgICAgICAgICBiOiBiLFxuICAgICAgICAgICAgaGV4OiBSLnJnYihyLCBnLCBiKSxcbiAgICAgICAgICAgIHRvU3RyaW5nOiByZ2J0b1N0cmluZ1xuICAgICAgICB9O1xuICAgICAgICBSLmlzKG8sIFwiZmluaXRlXCIpICYmIChyZ2Iub3BhY2l0eSA9IG8pO1xuICAgICAgICByZXR1cm4gcmdiO1xuICAgIH07XG4gICAgXG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuY29sb3JcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFBhcnNlcyB0aGUgY29sb3Igc3RyaW5nIGFuZCByZXR1cm5zIG9iamVjdCB3aXRoIGFsbCB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBjb2xvci5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gY2xyIChzdHJpbmcpIGNvbG9yIHN0cmluZyBpbiBvbmUgb2YgdGhlIHN1cHBvcnRlZCBmb3JtYXRzIChzZWUgQFJhcGhhZWwuZ2V0UkdCKVxuICAgICA9IChvYmplY3QpIENvbWJpbmVkIFJHQiAmIEhTQiBvYmplY3QgaW4gZm9ybWF0OlxuICAgICBvIHtcbiAgICAgbyAgICAgciAobnVtYmVyKSByZWQsXG4gICAgIG8gICAgIGcgKG51bWJlcikgZ3JlZW4sXG4gICAgIG8gICAgIGIgKG51bWJlcikgYmx1ZSxcbiAgICAgbyAgICAgaGV4IChzdHJpbmcpIGNvbG9yIGluIEhUTUwvQ1NTIGZvcm1hdDogI+KAouKAouKAouKAouKAouKAoixcbiAgICAgbyAgICAgZXJyb3IgKGJvb2xlYW4pIGB0cnVlYCBpZiBzdHJpbmcgY2Fu4oCZdCBiZSBwYXJzZWQsXG4gICAgIG8gICAgIGggKG51bWJlcikgaHVlLFxuICAgICBvICAgICBzIChudW1iZXIpIHNhdHVyYXRpb24sXG4gICAgIG8gICAgIHYgKG51bWJlcikgdmFsdWUgKGJyaWdodG5lc3MpLFxuICAgICBvICAgICBsIChudW1iZXIpIGxpZ2h0bmVzc1xuICAgICBvIH1cbiAgICBcXCovXG4gICAgUi5jb2xvciA9IGZ1bmN0aW9uIChjbHIpIHtcbiAgICAgICAgdmFyIHJnYjtcbiAgICAgICAgaWYgKFIuaXMoY2xyLCBcIm9iamVjdFwiKSAmJiBcImhcIiBpbiBjbHIgJiYgXCJzXCIgaW4gY2xyICYmIFwiYlwiIGluIGNscikge1xuICAgICAgICAgICAgcmdiID0gUi5oc2IycmdiKGNscik7XG4gICAgICAgICAgICBjbHIuciA9IHJnYi5yO1xuICAgICAgICAgICAgY2xyLmcgPSByZ2IuZztcbiAgICAgICAgICAgIGNsci5iID0gcmdiLmI7XG4gICAgICAgICAgICBjbHIuaGV4ID0gcmdiLmhleDtcbiAgICAgICAgfSBlbHNlIGlmIChSLmlzKGNsciwgXCJvYmplY3RcIikgJiYgXCJoXCIgaW4gY2xyICYmIFwic1wiIGluIGNsciAmJiBcImxcIiBpbiBjbHIpIHtcbiAgICAgICAgICAgIHJnYiA9IFIuaHNsMnJnYihjbHIpO1xuICAgICAgICAgICAgY2xyLnIgPSByZ2IucjtcbiAgICAgICAgICAgIGNsci5nID0gcmdiLmc7XG4gICAgICAgICAgICBjbHIuYiA9IHJnYi5iO1xuICAgICAgICAgICAgY2xyLmhleCA9IHJnYi5oZXg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoUi5pcyhjbHIsIFwic3RyaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgY2xyID0gUi5nZXRSR0IoY2xyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChSLmlzKGNsciwgXCJvYmplY3RcIikgJiYgXCJyXCIgaW4gY2xyICYmIFwiZ1wiIGluIGNsciAmJiBcImJcIiBpbiBjbHIpIHtcbiAgICAgICAgICAgICAgICByZ2IgPSBSLnJnYjJoc2woY2xyKTtcbiAgICAgICAgICAgICAgICBjbHIuaCA9IHJnYi5oO1xuICAgICAgICAgICAgICAgIGNsci5zID0gcmdiLnM7XG4gICAgICAgICAgICAgICAgY2xyLmwgPSByZ2IubDtcbiAgICAgICAgICAgICAgICByZ2IgPSBSLnJnYjJoc2IoY2xyKTtcbiAgICAgICAgICAgICAgICBjbHIudiA9IHJnYi5iO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjbHIgPSB7aGV4OiBcIm5vbmVcIn07XG4gICAgICAgICAgICAgICAgY2xyLnIgPSBjbHIuZyA9IGNsci5iID0gY2xyLmggPSBjbHIucyA9IGNsci52ID0gY2xyLmwgPSAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjbHIudG9TdHJpbmcgPSByZ2J0b1N0cmluZztcbiAgICAgICAgcmV0dXJuIGNscjtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmhzYjJyZ2JcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENvbnZlcnRzIEhTQiB2YWx1ZXMgdG8gUkdCIG9iamVjdC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaCAobnVtYmVyKSBodWVcbiAgICAgLSBzIChudW1iZXIpIHNhdHVyYXRpb25cbiAgICAgLSB2IChudW1iZXIpIHZhbHVlIG9yIGJyaWdodG5lc3NcbiAgICAgPSAob2JqZWN0KSBSR0Igb2JqZWN0IGluIGZvcm1hdDpcbiAgICAgbyB7XG4gICAgIG8gICAgIHIgKG51bWJlcikgcmVkLFxuICAgICBvICAgICBnIChudW1iZXIpIGdyZWVuLFxuICAgICBvICAgICBiIChudW1iZXIpIGJsdWUsXG4gICAgIG8gICAgIGhleCAoc3RyaW5nKSBjb2xvciBpbiBIVE1ML0NTUyBmb3JtYXQ6ICPigKLigKLigKLigKLigKLigKJcbiAgICAgbyB9XG4gICAgXFwqL1xuICAgIFIuaHNiMnJnYiA9IGZ1bmN0aW9uIChoLCBzLCB2LCBvKSB7XG4gICAgICAgIGlmICh0aGlzLmlzKGgsIFwib2JqZWN0XCIpICYmIFwiaFwiIGluIGggJiYgXCJzXCIgaW4gaCAmJiBcImJcIiBpbiBoKSB7XG4gICAgICAgICAgICB2ID0gaC5iO1xuICAgICAgICAgICAgcyA9IGgucztcbiAgICAgICAgICAgIGggPSBoLmg7XG4gICAgICAgICAgICBvID0gaC5vO1xuICAgICAgICB9XG4gICAgICAgIGggKj0gMzYwO1xuICAgICAgICB2YXIgUiwgRywgQiwgWCwgQztcbiAgICAgICAgaCA9IChoICUgMzYwKSAvIDYwO1xuICAgICAgICBDID0gdiAqIHM7XG4gICAgICAgIFggPSBDICogKDEgLSBhYnMoaCAlIDIgLSAxKSk7XG4gICAgICAgIFIgPSBHID0gQiA9IHYgLSBDO1xuXG4gICAgICAgIGggPSB+fmg7XG4gICAgICAgIFIgKz0gW0MsIFgsIDAsIDAsIFgsIENdW2hdO1xuICAgICAgICBHICs9IFtYLCBDLCBDLCBYLCAwLCAwXVtoXTtcbiAgICAgICAgQiArPSBbMCwgMCwgWCwgQywgQywgWF1baF07XG4gICAgICAgIHJldHVybiBwYWNrYWdlUkdCKFIsIEcsIEIsIG8pO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuaHNsMnJnYlxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ29udmVydHMgSFNMIHZhbHVlcyB0byBSR0Igb2JqZWN0LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoIChudW1iZXIpIGh1ZVxuICAgICAtIHMgKG51bWJlcikgc2F0dXJhdGlvblxuICAgICAtIGwgKG51bWJlcikgbHVtaW5vc2l0eVxuICAgICA9IChvYmplY3QpIFJHQiBvYmplY3QgaW4gZm9ybWF0OlxuICAgICBvIHtcbiAgICAgbyAgICAgciAobnVtYmVyKSByZWQsXG4gICAgIG8gICAgIGcgKG51bWJlcikgZ3JlZW4sXG4gICAgIG8gICAgIGIgKG51bWJlcikgYmx1ZSxcbiAgICAgbyAgICAgaGV4IChzdHJpbmcpIGNvbG9yIGluIEhUTUwvQ1NTIGZvcm1hdDogI+KAouKAouKAouKAouKAouKAolxuICAgICBvIH1cbiAgICBcXCovXG4gICAgUi5oc2wycmdiID0gZnVuY3Rpb24gKGgsIHMsIGwsIG8pIHtcbiAgICAgICAgaWYgKHRoaXMuaXMoaCwgXCJvYmplY3RcIikgJiYgXCJoXCIgaW4gaCAmJiBcInNcIiBpbiBoICYmIFwibFwiIGluIGgpIHtcbiAgICAgICAgICAgIGwgPSBoLmw7XG4gICAgICAgICAgICBzID0gaC5zO1xuICAgICAgICAgICAgaCA9IGguaDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaCA+IDEgfHwgcyA+IDEgfHwgbCA+IDEpIHtcbiAgICAgICAgICAgIGggLz0gMzYwO1xuICAgICAgICAgICAgcyAvPSAxMDA7XG4gICAgICAgICAgICBsIC89IDEwMDtcbiAgICAgICAgfVxuICAgICAgICBoICo9IDM2MDtcbiAgICAgICAgdmFyIFIsIEcsIEIsIFgsIEM7XG4gICAgICAgIGggPSAoaCAlIDM2MCkgLyA2MDtcbiAgICAgICAgQyA9IDIgKiBzICogKGwgPCAuNSA/IGwgOiAxIC0gbCk7XG4gICAgICAgIFggPSBDICogKDEgLSBhYnMoaCAlIDIgLSAxKSk7XG4gICAgICAgIFIgPSBHID0gQiA9IGwgLSBDIC8gMjtcblxuICAgICAgICBoID0gfn5oO1xuICAgICAgICBSICs9IFtDLCBYLCAwLCAwLCBYLCBDXVtoXTtcbiAgICAgICAgRyArPSBbWCwgQywgQywgWCwgMCwgMF1baF07XG4gICAgICAgIEIgKz0gWzAsIDAsIFgsIEMsIEMsIFhdW2hdO1xuICAgICAgICByZXR1cm4gcGFja2FnZVJHQihSLCBHLCBCLCBvKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnJnYjJoc2JcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENvbnZlcnRzIFJHQiB2YWx1ZXMgdG8gSFNCIG9iamVjdC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gciAobnVtYmVyKSByZWRcbiAgICAgLSBnIChudW1iZXIpIGdyZWVuXG4gICAgIC0gYiAobnVtYmVyKSBibHVlXG4gICAgID0gKG9iamVjdCkgSFNCIG9iamVjdCBpbiBmb3JtYXQ6XG4gICAgIG8ge1xuICAgICBvICAgICBoIChudW1iZXIpIGh1ZVxuICAgICBvICAgICBzIChudW1iZXIpIHNhdHVyYXRpb25cbiAgICAgbyAgICAgYiAobnVtYmVyKSBicmlnaHRuZXNzXG4gICAgIG8gfVxuICAgIFxcKi9cbiAgICBSLnJnYjJoc2IgPSBmdW5jdGlvbiAociwgZywgYikge1xuICAgICAgICBiID0gcHJlcGFyZVJHQihyLCBnLCBiKTtcbiAgICAgICAgciA9IGJbMF07XG4gICAgICAgIGcgPSBiWzFdO1xuICAgICAgICBiID0gYlsyXTtcblxuICAgICAgICB2YXIgSCwgUywgViwgQztcbiAgICAgICAgViA9IG1tYXgociwgZywgYik7XG4gICAgICAgIEMgPSBWIC0gbW1pbihyLCBnLCBiKTtcbiAgICAgICAgSCA9IChDID09IDAgPyBudWxsIDpcbiAgICAgICAgICAgICBWID09IHIgPyAoZyAtIGIpIC8gQyA6XG4gICAgICAgICAgICAgViA9PSBnID8gKGIgLSByKSAvIEMgKyAyIDpcbiAgICAgICAgICAgICAgICAgICAgICAociAtIGcpIC8gQyArIDRcbiAgICAgICAgICAgICk7XG4gICAgICAgIEggPSAoKEggKyAzNjApICUgNikgKiA2MCAvIDM2MDtcbiAgICAgICAgUyA9IEMgPT0gMCA/IDAgOiBDIC8gVjtcbiAgICAgICAgcmV0dXJuIHtoOiBILCBzOiBTLCBiOiBWLCB0b1N0cmluZzogaHNidG9TdHJpbmd9O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwucmdiMmhzbFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ29udmVydHMgUkdCIHZhbHVlcyB0byBIU0wgb2JqZWN0LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSByIChudW1iZXIpIHJlZFxuICAgICAtIGcgKG51bWJlcikgZ3JlZW5cbiAgICAgLSBiIChudW1iZXIpIGJsdWVcbiAgICAgPSAob2JqZWN0KSBIU0wgb2JqZWN0IGluIGZvcm1hdDpcbiAgICAgbyB7XG4gICAgIG8gICAgIGggKG51bWJlcikgaHVlXG4gICAgIG8gICAgIHMgKG51bWJlcikgc2F0dXJhdGlvblxuICAgICBvICAgICBsIChudW1iZXIpIGx1bWlub3NpdHlcbiAgICAgbyB9XG4gICAgXFwqL1xuICAgIFIucmdiMmhzbCA9IGZ1bmN0aW9uIChyLCBnLCBiKSB7XG4gICAgICAgIGIgPSBwcmVwYXJlUkdCKHIsIGcsIGIpO1xuICAgICAgICByID0gYlswXTtcbiAgICAgICAgZyA9IGJbMV07XG4gICAgICAgIGIgPSBiWzJdO1xuXG4gICAgICAgIHZhciBILCBTLCBMLCBNLCBtLCBDO1xuICAgICAgICBNID0gbW1heChyLCBnLCBiKTtcbiAgICAgICAgbSA9IG1taW4ociwgZywgYik7XG4gICAgICAgIEMgPSBNIC0gbTtcbiAgICAgICAgSCA9IChDID09IDAgPyBudWxsIDpcbiAgICAgICAgICAgICBNID09IHIgPyAoZyAtIGIpIC8gQyA6XG4gICAgICAgICAgICAgTSA9PSBnID8gKGIgLSByKSAvIEMgKyAyIDpcbiAgICAgICAgICAgICAgICAgICAgICAociAtIGcpIC8gQyArIDQpO1xuICAgICAgICBIID0gKChIICsgMzYwKSAlIDYpICogNjAgLyAzNjA7XG4gICAgICAgIEwgPSAoTSArIG0pIC8gMjtcbiAgICAgICAgUyA9IChDID09IDAgPyAwIDpcbiAgICAgICAgICAgICBMIDwgLjUgPyBDIC8gKDIgKiBMKSA6XG4gICAgICAgICAgICAgICAgICAgICAgQyAvICgyIC0gMiAqIEwpKTtcbiAgICAgICAgcmV0dXJuIHtoOiBILCBzOiBTLCBsOiBMLCB0b1N0cmluZzogaHNsdG9TdHJpbmd9O1xuICAgIH07XG4gICAgUi5fcGF0aDJzdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmpvaW4oXCIsXCIpLnJlcGxhY2UocDJzLCBcIiQxXCIpO1xuICAgIH07XG4gICAgZnVuY3Rpb24gcmVwdXNoKGFycmF5LCBpdGVtKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGFycmF5Lmxlbmd0aDsgaSA8IGlpOyBpKyspIGlmIChhcnJheVtpXSA9PT0gaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5LnB1c2goYXJyYXkuc3BsaWNlKGksIDEpWzBdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBjYWNoZXIoZiwgc2NvcGUsIHBvc3Rwcm9jZXNzb3IpIHtcbiAgICAgICAgZnVuY3Rpb24gbmV3ZigpIHtcbiAgICAgICAgICAgIHZhciBhcmcgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApLFxuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmcuam9pbihcIlxcdTI0MDBcIiksXG4gICAgICAgICAgICAgICAgY2FjaGUgPSBuZXdmLmNhY2hlID0gbmV3Zi5jYWNoZSB8fCB7fSxcbiAgICAgICAgICAgICAgICBjb3VudCA9IG5ld2YuY291bnQgPSBuZXdmLmNvdW50IHx8IFtdO1xuICAgICAgICAgICAgaWYgKGNhY2hlW2hhc10oYXJncykpIHtcbiAgICAgICAgICAgICAgICByZXB1c2goY291bnQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIHJldHVybiBwb3N0cHJvY2Vzc29yID8gcG9zdHByb2Nlc3NvcihjYWNoZVthcmdzXSkgOiBjYWNoZVthcmdzXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvdW50Lmxlbmd0aCA+PSAxZTMgJiYgZGVsZXRlIGNhY2hlW2NvdW50LnNoaWZ0KCldO1xuICAgICAgICAgICAgY291bnQucHVzaChhcmdzKTtcbiAgICAgICAgICAgIGNhY2hlW2FyZ3NdID0gZlthcHBseV0oc2NvcGUsIGFyZyk7XG4gICAgICAgICAgICByZXR1cm4gcG9zdHByb2Nlc3NvciA/IHBvc3Rwcm9jZXNzb3IoY2FjaGVbYXJnc10pIDogY2FjaGVbYXJnc107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld2Y7XG4gICAgfVxuXG4gICAgdmFyIHByZWxvYWQgPSBSLl9wcmVsb2FkID0gZnVuY3Rpb24gKHNyYywgZikge1xuICAgICAgICB2YXIgaW1nID0gZy5kb2MuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgaW1nLnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6LTk5OTllbTt0b3A6LTk5OTllbVwiO1xuICAgICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZi5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5vbmxvYWQgPSBudWxsO1xuICAgICAgICAgICAgZy5kb2MuYm9keS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgICAgaW1nLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBnLmRvYy5ib2R5LnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgICBnLmRvYy5ib2R5LmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgIGltZy5zcmMgPSBzcmM7XG4gICAgfTtcbiAgICBcbiAgICBmdW5jdGlvbiBjbHJUb1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGV4O1xuICAgIH1cblxuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmdldFJHQlxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUGFyc2VzIGNvbG91ciBzdHJpbmcgYXMgUkdCIG9iamVjdFxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBjb2xvdXIgKHN0cmluZykgY29sb3VyIHN0cmluZyBpbiBvbmUgb2YgZm9ybWF0czpcbiAgICAgIyA8dWw+XG4gICAgICMgICAgIDxsaT5Db2xvdXIgbmFtZSAo4oCcPGNvZGU+cmVkPC9jb2RlPuKAnSwg4oCcPGNvZGU+Z3JlZW48L2NvZGU+4oCdLCDigJw8Y29kZT5jb3JuZmxvd2VyYmx1ZTwvY29kZT7igJ0sIGV0Yyk8L2xpPlxuICAgICAjICAgICA8bGk+I+KAouKAouKAoiDigJQgc2hvcnRlbmVkIEhUTUwgY29sb3VyOiAo4oCcPGNvZGU+IzAwMDwvY29kZT7igJ0sIOKAnDxjb2RlPiNmYzA8L2NvZGU+4oCdLCBldGMpPC9saT5cbiAgICAgIyAgICAgPGxpPiPigKLigKLigKLigKLigKLigKIg4oCUIGZ1bGwgbGVuZ3RoIEhUTUwgY29sb3VyOiAo4oCcPGNvZGU+IzAwMDAwMDwvY29kZT7igJ0sIOKAnDxjb2RlPiNiZDIzMDA8L2NvZGU+4oCdKTwvbGk+XG4gICAgICMgICAgIDxsaT5yZ2Io4oCi4oCi4oCiLCDigKLigKLigKIsIOKAouKAouKAoikg4oCUIHJlZCwgZ3JlZW4gYW5kIGJsdWUgY2hhbm5lbHPigJkgdmFsdWVzOiAo4oCcPGNvZGU+cmdiKDIwMCwmbmJzcDsxMDAsJm5ic3A7MCk8L2NvZGU+4oCdKTwvbGk+XG4gICAgICMgICAgIDxsaT5yZ2Io4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSkg4oCUIHNhbWUgYXMgYWJvdmUsIGJ1dCBpbiAlOiAo4oCcPGNvZGU+cmdiKDEwMCUsJm5ic3A7MTc1JSwmbmJzcDswJSk8L2NvZGU+4oCdKTwvbGk+XG4gICAgICMgICAgIDxsaT5oc2Io4oCi4oCi4oCiLCDigKLigKLigKIsIOKAouKAouKAoikg4oCUIGh1ZSwgc2F0dXJhdGlvbiBhbmQgYnJpZ2h0bmVzcyB2YWx1ZXM6ICjigJw8Y29kZT5oc2IoMC41LCZuYnNwOzAuMjUsJm5ic3A7MSk8L2NvZGU+4oCdKTwvbGk+XG4gICAgICMgICAgIDxsaT5oc2Io4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSkg4oCUIHNhbWUgYXMgYWJvdmUsIGJ1dCBpbiAlPC9saT5cbiAgICAgIyAgICAgPGxpPmhzbCjigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiKSDigJQgc2FtZSBhcyBoc2I8L2xpPlxuICAgICAjICAgICA8bGk+aHNsKOKAouKAouKAoiUsIOKAouKAouKAoiUsIOKAouKAouKAoiUpIOKAlCBzYW1lIGFzIGhzYjwvbGk+XG4gICAgICMgPC91bD5cbiAgICAgPSAob2JqZWN0KSBSR0Igb2JqZWN0IGluIGZvcm1hdDpcbiAgICAgbyB7XG4gICAgIG8gICAgIHIgKG51bWJlcikgcmVkLFxuICAgICBvICAgICBnIChudW1iZXIpIGdyZWVuLFxuICAgICBvICAgICBiIChudW1iZXIpIGJsdWVcbiAgICAgbyAgICAgaGV4IChzdHJpbmcpIGNvbG9yIGluIEhUTUwvQ1NTIGZvcm1hdDogI+KAouKAouKAouKAouKAouKAoixcbiAgICAgbyAgICAgZXJyb3IgKGJvb2xlYW4pIHRydWUgaWYgc3RyaW5nIGNhbuKAmXQgYmUgcGFyc2VkXG4gICAgIG8gfVxuICAgIFxcKi9cbiAgICBSLmdldFJHQiA9IGNhY2hlcihmdW5jdGlvbiAoY29sb3VyKSB7XG4gICAgICAgIGlmICghY29sb3VyIHx8ICEhKChjb2xvdXIgPSBTdHIoY29sb3VyKSkuaW5kZXhPZihcIi1cIikgKyAxKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtyOiAtMSwgZzogLTEsIGI6IC0xLCBoZXg6IFwibm9uZVwiLCBlcnJvcjogMSwgdG9TdHJpbmc6IGNsclRvU3RyaW5nfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29sb3VyID09IFwibm9uZVwiKSB7XG4gICAgICAgICAgICByZXR1cm4ge3I6IC0xLCBnOiAtMSwgYjogLTEsIGhleDogXCJub25lXCIsIHRvU3RyaW5nOiBjbHJUb1N0cmluZ307XG4gICAgICAgIH1cbiAgICAgICAgIShoc3JnW2hhc10oY29sb3VyLnRvTG93ZXJDYXNlKCkuc3Vic3RyaW5nKDAsIDIpKSB8fCBjb2xvdXIuY2hhckF0KCkgPT0gXCIjXCIpICYmIChjb2xvdXIgPSB0b0hleChjb2xvdXIpKTtcbiAgICAgICAgdmFyIHJlcyxcbiAgICAgICAgICAgIHJlZCxcbiAgICAgICAgICAgIGdyZWVuLFxuICAgICAgICAgICAgYmx1ZSxcbiAgICAgICAgICAgIG9wYWNpdHksXG4gICAgICAgICAgICB0LFxuICAgICAgICAgICAgdmFsdWVzLFxuICAgICAgICAgICAgcmdiID0gY29sb3VyLm1hdGNoKGNvbG91clJlZ0V4cCk7XG4gICAgICAgIGlmIChyZ2IpIHtcbiAgICAgICAgICAgIGlmIChyZ2JbMl0pIHtcbiAgICAgICAgICAgICAgICBibHVlID0gdG9JbnQocmdiWzJdLnN1YnN0cmluZyg1KSwgMTYpO1xuICAgICAgICAgICAgICAgIGdyZWVuID0gdG9JbnQocmdiWzJdLnN1YnN0cmluZygzLCA1KSwgMTYpO1xuICAgICAgICAgICAgICAgIHJlZCA9IHRvSW50KHJnYlsyXS5zdWJzdHJpbmcoMSwgMyksIDE2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZ2JbM10pIHtcbiAgICAgICAgICAgICAgICBibHVlID0gdG9JbnQoKHQgPSByZ2JbM10uY2hhckF0KDMpKSArIHQsIDE2KTtcbiAgICAgICAgICAgICAgICBncmVlbiA9IHRvSW50KCh0ID0gcmdiWzNdLmNoYXJBdCgyKSkgKyB0LCAxNik7XG4gICAgICAgICAgICAgICAgcmVkID0gdG9JbnQoKHQgPSByZ2JbM10uY2hhckF0KDEpKSArIHQsIDE2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZ2JbNF0pIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSByZ2JbNF1bc3BsaXRdKGNvbW1hU3BhY2VzKTtcbiAgICAgICAgICAgICAgICByZWQgPSB0b0Zsb2F0KHZhbHVlc1swXSk7XG4gICAgICAgICAgICAgICAgdmFsdWVzWzBdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAocmVkICo9IDIuNTUpO1xuICAgICAgICAgICAgICAgIGdyZWVuID0gdG9GbG9hdCh2YWx1ZXNbMV0pO1xuICAgICAgICAgICAgICAgIHZhbHVlc1sxXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKGdyZWVuICo9IDIuNTUpO1xuICAgICAgICAgICAgICAgIGJsdWUgPSB0b0Zsb2F0KHZhbHVlc1syXSk7XG4gICAgICAgICAgICAgICAgdmFsdWVzWzJdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAoYmx1ZSAqPSAyLjU1KTtcbiAgICAgICAgICAgICAgICByZ2JbMV0udG9Mb3dlckNhc2UoKS5zbGljZSgwLCA0KSA9PSBcInJnYmFcIiAmJiAob3BhY2l0eSA9IHRvRmxvYXQodmFsdWVzWzNdKSk7XG4gICAgICAgICAgICAgICAgdmFsdWVzWzNdICYmIHZhbHVlc1szXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKG9wYWNpdHkgLz0gMTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZ2JbNV0pIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSByZ2JbNV1bc3BsaXRdKGNvbW1hU3BhY2VzKTtcbiAgICAgICAgICAgICAgICByZWQgPSB0b0Zsb2F0KHZhbHVlc1swXSk7XG4gICAgICAgICAgICAgICAgdmFsdWVzWzBdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAocmVkICo9IDIuNTUpO1xuICAgICAgICAgICAgICAgIGdyZWVuID0gdG9GbG9hdCh2YWx1ZXNbMV0pO1xuICAgICAgICAgICAgICAgIHZhbHVlc1sxXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKGdyZWVuICo9IDIuNTUpO1xuICAgICAgICAgICAgICAgIGJsdWUgPSB0b0Zsb2F0KHZhbHVlc1syXSk7XG4gICAgICAgICAgICAgICAgdmFsdWVzWzJdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAoYmx1ZSAqPSAyLjU1KTtcbiAgICAgICAgICAgICAgICAodmFsdWVzWzBdLnNsaWNlKC0zKSA9PSBcImRlZ1wiIHx8IHZhbHVlc1swXS5zbGljZSgtMSkgPT0gXCJcXHhiMFwiKSAmJiAocmVkIC89IDM2MCk7XG4gICAgICAgICAgICAgICAgcmdiWzFdLnRvTG93ZXJDYXNlKCkuc2xpY2UoMCwgNCkgPT0gXCJoc2JhXCIgJiYgKG9wYWNpdHkgPSB0b0Zsb2F0KHZhbHVlc1szXSkpO1xuICAgICAgICAgICAgICAgIHZhbHVlc1szXSAmJiB2YWx1ZXNbM10uc2xpY2UoLTEpID09IFwiJVwiICYmIChvcGFjaXR5IC89IDEwMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFIuaHNiMnJnYihyZWQsIGdyZWVuLCBibHVlLCBvcGFjaXR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZ2JbNl0pIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXMgPSByZ2JbNl1bc3BsaXRdKGNvbW1hU3BhY2VzKTtcbiAgICAgICAgICAgICAgICByZWQgPSB0b0Zsb2F0KHZhbHVlc1swXSk7XG4gICAgICAgICAgICAgICAgdmFsdWVzWzBdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAocmVkICo9IDIuNTUpO1xuICAgICAgICAgICAgICAgIGdyZWVuID0gdG9GbG9hdCh2YWx1ZXNbMV0pO1xuICAgICAgICAgICAgICAgIHZhbHVlc1sxXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKGdyZWVuICo9IDIuNTUpO1xuICAgICAgICAgICAgICAgIGJsdWUgPSB0b0Zsb2F0KHZhbHVlc1syXSk7XG4gICAgICAgICAgICAgICAgdmFsdWVzWzJdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAoYmx1ZSAqPSAyLjU1KTtcbiAgICAgICAgICAgICAgICAodmFsdWVzWzBdLnNsaWNlKC0zKSA9PSBcImRlZ1wiIHx8IHZhbHVlc1swXS5zbGljZSgtMSkgPT0gXCJcXHhiMFwiKSAmJiAocmVkIC89IDM2MCk7XG4gICAgICAgICAgICAgICAgcmdiWzFdLnRvTG93ZXJDYXNlKCkuc2xpY2UoMCwgNCkgPT0gXCJoc2xhXCIgJiYgKG9wYWNpdHkgPSB0b0Zsb2F0KHZhbHVlc1szXSkpO1xuICAgICAgICAgICAgICAgIHZhbHVlc1szXSAmJiB2YWx1ZXNbM10uc2xpY2UoLTEpID09IFwiJVwiICYmIChvcGFjaXR5IC89IDEwMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFIuaHNsMnJnYihyZWQsIGdyZWVuLCBibHVlLCBvcGFjaXR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJnYiA9IHtyOiByZWQsIGc6IGdyZWVuLCBiOiBibHVlLCB0b1N0cmluZzogY2xyVG9TdHJpbmd9O1xuICAgICAgICAgICAgcmdiLmhleCA9IFwiI1wiICsgKDE2Nzc3MjE2IHwgYmx1ZSB8IChncmVlbiA8PCA4KSB8IChyZWQgPDwgMTYpKS50b1N0cmluZygxNikuc2xpY2UoMSk7XG4gICAgICAgICAgICBSLmlzKG9wYWNpdHksIFwiZmluaXRlXCIpICYmIChyZ2Iub3BhY2l0eSA9IG9wYWNpdHkpO1xuICAgICAgICAgICAgcmV0dXJuIHJnYjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge3I6IC0xLCBnOiAtMSwgYjogLTEsIGhleDogXCJub25lXCIsIGVycm9yOiAxLCB0b1N0cmluZzogY2xyVG9TdHJpbmd9O1xuICAgIH0sIFIpO1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmhzYlxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ29udmVydHMgSFNCIHZhbHVlcyB0byBoZXggcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbG91ci5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaCAobnVtYmVyKSBodWVcbiAgICAgLSBzIChudW1iZXIpIHNhdHVyYXRpb25cbiAgICAgLSBiIChudW1iZXIpIHZhbHVlIG9yIGJyaWdodG5lc3NcbiAgICAgPSAoc3RyaW5nKSBoZXggcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbG91ci5cbiAgICBcXCovXG4gICAgUi5oc2IgPSBjYWNoZXIoZnVuY3Rpb24gKGgsIHMsIGIpIHtcbiAgICAgICAgcmV0dXJuIFIuaHNiMnJnYihoLCBzLCBiKS5oZXg7XG4gICAgfSk7XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuaHNsXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDb252ZXJ0cyBIU0wgdmFsdWVzIHRvIGhleCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29sb3VyLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoIChudW1iZXIpIGh1ZVxuICAgICAtIHMgKG51bWJlcikgc2F0dXJhdGlvblxuICAgICAtIGwgKG51bWJlcikgbHVtaW5vc2l0eVxuICAgICA9IChzdHJpbmcpIGhleCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29sb3VyLlxuICAgIFxcKi9cbiAgICBSLmhzbCA9IGNhY2hlcihmdW5jdGlvbiAoaCwgcywgbCkge1xuICAgICAgICByZXR1cm4gUi5oc2wycmdiKGgsIHMsIGwpLmhleDtcbiAgICB9KTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5yZ2JcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENvbnZlcnRzIFJHQiB2YWx1ZXMgdG8gaGV4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb2xvdXIuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHIgKG51bWJlcikgcmVkXG4gICAgIC0gZyAobnVtYmVyKSBncmVlblxuICAgICAtIGIgKG51bWJlcikgYmx1ZVxuICAgICA9IChzdHJpbmcpIGhleCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29sb3VyLlxuICAgIFxcKi9cbiAgICBSLnJnYiA9IGNhY2hlcihmdW5jdGlvbiAociwgZywgYikge1xuICAgICAgICByZXR1cm4gXCIjXCIgKyAoMTY3NzcyMTYgfCBiIHwgKGcgPDwgOCkgfCAociA8PCAxNikpLnRvU3RyaW5nKDE2KS5zbGljZSgxKTtcbiAgICB9KTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5nZXRDb2xvclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogT24gZWFjaCBjYWxsIHJldHVybnMgbmV4dCBjb2xvdXIgaW4gdGhlIHNwZWN0cnVtLiBUbyByZXNldCBpdCBiYWNrIHRvIHJlZCBjYWxsIEBSYXBoYWVsLmdldENvbG9yLnJlc2V0XG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHZhbHVlIChudW1iZXIpICNvcHRpb25hbCBicmlnaHRuZXNzLCBkZWZhdWx0IGlzIGAwLjc1YFxuICAgICA9IChzdHJpbmcpIGhleCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29sb3VyLlxuICAgIFxcKi9cbiAgICBSLmdldENvbG9yID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBzdGFydCA9IHRoaXMuZ2V0Q29sb3Iuc3RhcnQgPSB0aGlzLmdldENvbG9yLnN0YXJ0IHx8IHtoOiAwLCBzOiAxLCBiOiB2YWx1ZSB8fCAuNzV9LFxuICAgICAgICAgICAgcmdiID0gdGhpcy5oc2IycmdiKHN0YXJ0LmgsIHN0YXJ0LnMsIHN0YXJ0LmIpO1xuICAgICAgICBzdGFydC5oICs9IC4wNzU7XG4gICAgICAgIGlmIChzdGFydC5oID4gMSkge1xuICAgICAgICAgICAgc3RhcnQuaCA9IDA7XG4gICAgICAgICAgICBzdGFydC5zIC09IC4yO1xuICAgICAgICAgICAgc3RhcnQucyA8PSAwICYmICh0aGlzLmdldENvbG9yLnN0YXJ0ID0ge2g6IDAsIHM6IDEsIGI6IHN0YXJ0LmJ9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmdiLmhleDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmdldENvbG9yLnJlc2V0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXNldHMgc3BlY3RydW0gcG9zaXRpb24gZm9yIEBSYXBoYWVsLmdldENvbG9yIGJhY2sgdG8gcmVkLlxuICAgIFxcKi9cbiAgICBSLmdldENvbG9yLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBkZWxldGUgdGhpcy5zdGFydDtcbiAgICB9O1xuXG4gICAgLy8gaHR0cDovL3NjaGVwZXJzLmNjL2dldHRpbmctdG8tdGhlLXBvaW50XG4gICAgZnVuY3Rpb24gY2F0bXVsbFJvbTJiZXppZXIoY3JwLCB6KSB7XG4gICAgICAgIHZhciBkID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpTGVuID0gY3JwLmxlbmd0aDsgaUxlbiAtIDIgKiAheiA+IGk7IGkgKz0gMikge1xuICAgICAgICAgICAgdmFyIHAgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7eDogK2NycFtpIC0gMl0sIHk6ICtjcnBbaSAtIDFdfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt4OiArY3JwW2ldLCAgICAgeTogK2NycFtpICsgMV19LFxuICAgICAgICAgICAgICAgICAgICAgICAge3g6ICtjcnBbaSArIDJdLCB5OiArY3JwW2kgKyAzXX0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7eDogK2NycFtpICsgNF0sIHk6ICtjcnBbaSArIDVdfVxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgaWYgKHopIHtcbiAgICAgICAgICAgICAgICBpZiAoIWkpIHtcbiAgICAgICAgICAgICAgICAgICAgcFswXSA9IHt4OiArY3JwW2lMZW4gLSAyXSwgeTogK2NycFtpTGVuIC0gMV19O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaUxlbiAtIDQgPT0gaSkge1xuICAgICAgICAgICAgICAgICAgICBwWzNdID0ge3g6ICtjcnBbMF0sIHk6ICtjcnBbMV19O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaUxlbiAtIDIgPT0gaSkge1xuICAgICAgICAgICAgICAgICAgICBwWzJdID0ge3g6ICtjcnBbMF0sIHk6ICtjcnBbMV19O1xuICAgICAgICAgICAgICAgICAgICBwWzNdID0ge3g6ICtjcnBbMl0sIHk6ICtjcnBbM119O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGlMZW4gLSA0ID09IGkpIHtcbiAgICAgICAgICAgICAgICAgICAgcFszXSA9IHBbMl07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghaSkge1xuICAgICAgICAgICAgICAgICAgICBwWzBdID0ge3g6ICtjcnBbaV0sIHk6ICtjcnBbaSArIDFdfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkLnB1c2goW1wiQ1wiLFxuICAgICAgICAgICAgICAgICAgKC1wWzBdLnggKyA2ICogcFsxXS54ICsgcFsyXS54KSAvIDYsXG4gICAgICAgICAgICAgICAgICAoLXBbMF0ueSArIDYgKiBwWzFdLnkgKyBwWzJdLnkpIC8gNixcbiAgICAgICAgICAgICAgICAgIChwWzFdLnggKyA2ICogcFsyXS54IC0gcFszXS54KSAvIDYsXG4gICAgICAgICAgICAgICAgICAocFsxXS55ICsgNipwWzJdLnkgLSBwWzNdLnkpIC8gNixcbiAgICAgICAgICAgICAgICAgIHBbMl0ueCxcbiAgICAgICAgICAgICAgICAgIHBbMl0ueVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZDtcbiAgICB9XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwucGFyc2VQYXRoU3RyaW5nXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIFBhcnNlcyBnaXZlbiBwYXRoIHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIGFycmF5cyBvZiBwYXRoIHNlZ21lbnRzLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBwYXRoU3RyaW5nIChzdHJpbmd8YXJyYXkpIHBhdGggc3RyaW5nIG9yIGFycmF5IG9mIHNlZ21lbnRzIChpbiB0aGUgbGFzdCBjYXNlIGl0IHdpbGwgYmUgcmV0dXJuZWQgc3RyYWlnaHQgYXdheSlcbiAgICAgPSAoYXJyYXkpIGFycmF5IG9mIHNlZ21lbnRzLlxuICAgIFxcKi9cbiAgICBSLnBhcnNlUGF0aFN0cmluZyA9IGZ1bmN0aW9uIChwYXRoU3RyaW5nKSB7XG4gICAgICAgIGlmICghcGF0aFN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHB0aCA9IHBhdGhzKHBhdGhTdHJpbmcpO1xuICAgICAgICBpZiAocHRoLmFycikge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGhDbG9uZShwdGguYXJyKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHBhcmFtQ291bnRzID0ge2E6IDcsIGM6IDYsIGg6IDEsIGw6IDIsIG06IDIsIHI6IDQsIHE6IDQsIHM6IDQsIHQ6IDIsIHY6IDEsIHo6IDB9LFxuICAgICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgICBpZiAoUi5pcyhwYXRoU3RyaW5nLCBhcnJheSkgJiYgUi5pcyhwYXRoU3RyaW5nWzBdLCBhcnJheSkpIHsgLy8gcm91Z2ggYXNzdW1wdGlvblxuICAgICAgICAgICAgZGF0YSA9IHBhdGhDbG9uZShwYXRoU3RyaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICBTdHIocGF0aFN0cmluZykucmVwbGFjZShwYXRoQ29tbWFuZCwgZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW1zID0gW10sXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBiLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgYy5yZXBsYWNlKHBhdGhWYWx1ZXMsIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgIGIgJiYgcGFyYW1zLnB1c2goK2IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lID09IFwibVwiICYmIHBhcmFtcy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChbYl1bY29uY2F0XShwYXJhbXMuc3BsaWNlKDAsIDIpKSk7XG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBcImxcIjtcbiAgICAgICAgICAgICAgICAgICAgYiA9IGIgPT0gXCJtXCIgPyBcImxcIiA6IFwiTFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmFtZSA9PSBcInJcIikge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2goW2JdW2NvbmNhdF0ocGFyYW1zKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHdoaWxlIChwYXJhbXMubGVuZ3RoID49IHBhcmFtQ291bnRzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChbYl1bY29uY2F0XShwYXJhbXMuc3BsaWNlKDAsIHBhcmFtQ291bnRzW25hbWVdKSkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXBhcmFtQ291bnRzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGRhdGEudG9TdHJpbmcgPSBSLl9wYXRoMnN0cmluZztcbiAgICAgICAgcHRoLmFyciA9IHBhdGhDbG9uZShkYXRhKTtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5wYXJzZVRyYW5zZm9ybVN0cmluZ1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBQYXJzZXMgZ2l2ZW4gcGF0aCBzdHJpbmcgaW50byBhbiBhcnJheSBvZiB0cmFuc2Zvcm1hdGlvbnMuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIFRTdHJpbmcgKHN0cmluZ3xhcnJheSkgdHJhbnNmb3JtIHN0cmluZyBvciBhcnJheSBvZiB0cmFuc2Zvcm1hdGlvbnMgKGluIHRoZSBsYXN0IGNhc2UgaXQgd2lsbCBiZSByZXR1cm5lZCBzdHJhaWdodCBhd2F5KVxuICAgICA9IChhcnJheSkgYXJyYXkgb2YgdHJhbnNmb3JtYXRpb25zLlxuICAgIFxcKi9cbiAgICBSLnBhcnNlVHJhbnNmb3JtU3RyaW5nID0gY2FjaGVyKGZ1bmN0aW9uIChUU3RyaW5nKSB7XG4gICAgICAgIGlmICghVFN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhcmFtQ291bnRzID0ge3I6IDMsIHM6IDQsIHQ6IDIsIG06IDZ9LFxuICAgICAgICAgICAgZGF0YSA9IFtdO1xuICAgICAgICBpZiAoUi5pcyhUU3RyaW5nLCBhcnJheSkgJiYgUi5pcyhUU3RyaW5nWzBdLCBhcnJheSkpIHsgLy8gcm91Z2ggYXNzdW1wdGlvblxuICAgICAgICAgICAgZGF0YSA9IHBhdGhDbG9uZShUU3RyaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICBTdHIoVFN0cmluZykucmVwbGFjZSh0Q29tbWFuZCwgZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW1zID0gW10sXG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBsb3dlckNhc2UuY2FsbChiKTtcbiAgICAgICAgICAgICAgICBjLnJlcGxhY2UocGF0aFZhbHVlcywgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgYiAmJiBwYXJhbXMucHVzaCgrYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZGF0YS5wdXNoKFtiXVtjb25jYXRdKHBhcmFtcykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZGF0YS50b1N0cmluZyA9IFIuX3BhdGgyc3RyaW5nO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9KTtcbiAgICAvLyBQQVRIU1xuICAgIHZhciBwYXRocyA9IGZ1bmN0aW9uIChwcykge1xuICAgICAgICB2YXIgcCA9IHBhdGhzLnBzID0gcGF0aHMucHMgfHwge307XG4gICAgICAgIGlmIChwW3BzXSkge1xuICAgICAgICAgICAgcFtwc10uc2xlZXAgPSAxMDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwW3BzXSA9IHtcbiAgICAgICAgICAgICAgICBzbGVlcDogMTAwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIHApIGlmIChwW2hhc10oa2V5KSAmJiBrZXkgIT0gcHMpIHtcbiAgICAgICAgICAgICAgICBwW2tleV0uc2xlZXAtLTtcbiAgICAgICAgICAgICAgICAhcFtrZXldLnNsZWVwICYmIGRlbGV0ZSBwW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcFtwc107XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5maW5kRG90c0F0U2VnbWVudFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBGaW5kIGRvdCBjb29yZGluYXRlcyBvbiB0aGUgZ2l2ZW4gY3ViaWMgYmV6aWVyIGN1cnZlIGF0IHRoZSBnaXZlbiB0LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBwMXggKG51bWJlcikgeCBvZiB0aGUgZmlyc3QgcG9pbnQgb2YgdGhlIGN1cnZlXG4gICAgIC0gcDF5IChudW1iZXIpIHkgb2YgdGhlIGZpcnN0IHBvaW50IG9mIHRoZSBjdXJ2ZVxuICAgICAtIGMxeCAobnVtYmVyKSB4IG9mIHRoZSBmaXJzdCBhbmNob3Igb2YgdGhlIGN1cnZlXG4gICAgIC0gYzF5IChudW1iZXIpIHkgb2YgdGhlIGZpcnN0IGFuY2hvciBvZiB0aGUgY3VydmVcbiAgICAgLSBjMnggKG51bWJlcikgeCBvZiB0aGUgc2Vjb25kIGFuY2hvciBvZiB0aGUgY3VydmVcbiAgICAgLSBjMnkgKG51bWJlcikgeSBvZiB0aGUgc2Vjb25kIGFuY2hvciBvZiB0aGUgY3VydmVcbiAgICAgLSBwMnggKG51bWJlcikgeCBvZiB0aGUgc2Vjb25kIHBvaW50IG9mIHRoZSBjdXJ2ZVxuICAgICAtIHAyeSAobnVtYmVyKSB5IG9mIHRoZSBzZWNvbmQgcG9pbnQgb2YgdGhlIGN1cnZlXG4gICAgIC0gdCAobnVtYmVyKSBwb3NpdGlvbiBvbiB0aGUgY3VydmUgKDAuLjEpXG4gICAgID0gKG9iamVjdCkgcG9pbnQgaW5mb3JtYXRpb24gaW4gZm9ybWF0OlxuICAgICBvIHtcbiAgICAgbyAgICAgeDogKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSBwb2ludFxuICAgICBvICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50XG4gICAgIG8gICAgIG06IHtcbiAgICAgbyAgICAgICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgbGVmdCBhbmNob3JcbiAgICAgbyAgICAgICAgIHk6IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgbGVmdCBhbmNob3JcbiAgICAgbyAgICAgfVxuICAgICBvICAgICBuOiB7XG4gICAgIG8gICAgICAgICB4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIHJpZ2h0IGFuY2hvclxuICAgICBvICAgICAgICAgeTogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSByaWdodCBhbmNob3JcbiAgICAgbyAgICAgfVxuICAgICBvICAgICBzdGFydDoge1xuICAgICBvICAgICAgICAgeDogKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSBzdGFydCBvZiB0aGUgY3VydmVcbiAgICAgbyAgICAgICAgIHk6IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgc3RhcnQgb2YgdGhlIGN1cnZlXG4gICAgIG8gICAgIH1cbiAgICAgbyAgICAgZW5kOiB7XG4gICAgIG8gICAgICAgICB4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIGVuZCBvZiB0aGUgY3VydmVcbiAgICAgbyAgICAgICAgIHk6IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgZW5kIG9mIHRoZSBjdXJ2ZVxuICAgICBvICAgICB9XG4gICAgIG8gICAgIGFscGhhOiAobnVtYmVyKSBhbmdsZSBvZiB0aGUgY3VydmUgZGVyaXZhdGl2ZSBhdCB0aGUgcG9pbnRcbiAgICAgbyB9XG4gICAgXFwqL1xuICAgIFIuZmluZERvdHNBdFNlZ21lbnQgPSBmdW5jdGlvbiAocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnksIHQpIHtcbiAgICAgICAgdmFyIHQxID0gMSAtIHQsXG4gICAgICAgICAgICB0MTMgPSBwb3codDEsIDMpLFxuICAgICAgICAgICAgdDEyID0gcG93KHQxLCAyKSxcbiAgICAgICAgICAgIHQyID0gdCAqIHQsXG4gICAgICAgICAgICB0MyA9IHQyICogdCxcbiAgICAgICAgICAgIHggPSB0MTMgKiBwMXggKyB0MTIgKiAzICogdCAqIGMxeCArIHQxICogMyAqIHQgKiB0ICogYzJ4ICsgdDMgKiBwMngsXG4gICAgICAgICAgICB5ID0gdDEzICogcDF5ICsgdDEyICogMyAqIHQgKiBjMXkgKyB0MSAqIDMgKiB0ICogdCAqIGMyeSArIHQzICogcDJ5LFxuICAgICAgICAgICAgbXggPSBwMXggKyAyICogdCAqIChjMXggLSBwMXgpICsgdDIgKiAoYzJ4IC0gMiAqIGMxeCArIHAxeCksXG4gICAgICAgICAgICBteSA9IHAxeSArIDIgKiB0ICogKGMxeSAtIHAxeSkgKyB0MiAqIChjMnkgLSAyICogYzF5ICsgcDF5KSxcbiAgICAgICAgICAgIG54ID0gYzF4ICsgMiAqIHQgKiAoYzJ4IC0gYzF4KSArIHQyICogKHAyeCAtIDIgKiBjMnggKyBjMXgpLFxuICAgICAgICAgICAgbnkgPSBjMXkgKyAyICogdCAqIChjMnkgLSBjMXkpICsgdDIgKiAocDJ5IC0gMiAqIGMyeSArIGMxeSksXG4gICAgICAgICAgICBheCA9IHQxICogcDF4ICsgdCAqIGMxeCxcbiAgICAgICAgICAgIGF5ID0gdDEgKiBwMXkgKyB0ICogYzF5LFxuICAgICAgICAgICAgY3ggPSB0MSAqIGMyeCArIHQgKiBwMngsXG4gICAgICAgICAgICBjeSA9IHQxICogYzJ5ICsgdCAqIHAyeSxcbiAgICAgICAgICAgIGFscGhhID0gKDkwIC0gbWF0aC5hdGFuMihteCAtIG54LCBteSAtIG55KSAqIDE4MCAvIFBJKTtcbiAgICAgICAgKG14ID4gbnggfHwgbXkgPCBueSkgJiYgKGFscGhhICs9IDE4MCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgIG06IHt4OiBteCwgeTogbXl9LFxuICAgICAgICAgICAgbjoge3g6IG54LCB5OiBueX0sXG4gICAgICAgICAgICBzdGFydDoge3g6IGF4LCB5OiBheX0sXG4gICAgICAgICAgICBlbmQ6IHt4OiBjeCwgeTogY3l9LFxuICAgICAgICAgICAgYWxwaGE6IGFscGhhXG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5iZXppZXJCQm94XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIFJldHVybiBib3VuZGluZyBib3ggb2YgYSBnaXZlbiBjdWJpYyBiZXppZXIgY3VydmVcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gcDF4IChudW1iZXIpIHggb2YgdGhlIGZpcnN0IHBvaW50IG9mIHRoZSBjdXJ2ZVxuICAgICAtIHAxeSAobnVtYmVyKSB5IG9mIHRoZSBmaXJzdCBwb2ludCBvZiB0aGUgY3VydmVcbiAgICAgLSBjMXggKG51bWJlcikgeCBvZiB0aGUgZmlyc3QgYW5jaG9yIG9mIHRoZSBjdXJ2ZVxuICAgICAtIGMxeSAobnVtYmVyKSB5IG9mIHRoZSBmaXJzdCBhbmNob3Igb2YgdGhlIGN1cnZlXG4gICAgIC0gYzJ4IChudW1iZXIpIHggb2YgdGhlIHNlY29uZCBhbmNob3Igb2YgdGhlIGN1cnZlXG4gICAgIC0gYzJ5IChudW1iZXIpIHkgb2YgdGhlIHNlY29uZCBhbmNob3Igb2YgdGhlIGN1cnZlXG4gICAgIC0gcDJ4IChudW1iZXIpIHggb2YgdGhlIHNlY29uZCBwb2ludCBvZiB0aGUgY3VydmVcbiAgICAgLSBwMnkgKG51bWJlcikgeSBvZiB0aGUgc2Vjb25kIHBvaW50IG9mIHRoZSBjdXJ2ZVxuICAgICAqIG9yXG4gICAgIC0gYmV6IChhcnJheSkgYXJyYXkgb2Ygc2l4IHBvaW50cyBmb3IgYmV6aWVyIGN1cnZlXG4gICAgID0gKG9iamVjdCkgcG9pbnQgaW5mb3JtYXRpb24gaW4gZm9ybWF0OlxuICAgICBvIHtcbiAgICAgbyAgICAgbWluOiB7XG4gICAgIG8gICAgICAgICB4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIGxlZnQgcG9pbnRcbiAgICAgbyAgICAgICAgIHk6IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgdG9wIHBvaW50XG4gICAgIG8gICAgIH1cbiAgICAgbyAgICAgbWF4OiB7XG4gICAgIG8gICAgICAgICB4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIHJpZ2h0IHBvaW50XG4gICAgIG8gICAgICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIGJvdHRvbSBwb2ludFxuICAgICBvICAgICB9XG4gICAgIG8gfVxuICAgIFxcKi9cbiAgICBSLmJlemllckJCb3ggPSBmdW5jdGlvbiAocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnkpIHtcbiAgICAgICAgaWYgKCFSLmlzKHAxeCwgXCJhcnJheVwiKSkge1xuICAgICAgICAgICAgcDF4ID0gW3AxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5XTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYmJveCA9IGN1cnZlRGltLmFwcGx5KG51bGwsIHAxeCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBiYm94Lm1pbi54LFxuICAgICAgICAgICAgeTogYmJveC5taW4ueSxcbiAgICAgICAgICAgIHgyOiBiYm94Lm1heC54LFxuICAgICAgICAgICAgeTI6IGJib3gubWF4LnksXG4gICAgICAgICAgICB3aWR0aDogYmJveC5tYXgueCAtIGJib3gubWluLngsXG4gICAgICAgICAgICBoZWlnaHQ6IGJib3gubWF4LnkgLSBiYm94Lm1pbi55XG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5pc1BvaW50SW5zaWRlQkJveFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBnaXZlbiBwb2ludCBpcyBpbnNpZGUgYm91bmRpbmcgYm94ZXMuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGJib3ggKHN0cmluZykgYm91bmRpbmcgYm94XG4gICAgIC0geCAoc3RyaW5nKSB4IGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50XG4gICAgIC0geSAoc3RyaW5nKSB5IGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50XG4gICAgID0gKGJvb2xlYW4pIGB0cnVlYCBpZiBwb2ludCBpbnNpZGVcbiAgICBcXCovXG4gICAgUi5pc1BvaW50SW5zaWRlQkJveCA9IGZ1bmN0aW9uIChiYm94LCB4LCB5KSB7XG4gICAgICAgIHJldHVybiB4ID49IGJib3gueCAmJiB4IDw9IGJib3gueDIgJiYgeSA+PSBiYm94LnkgJiYgeSA8PSBiYm94LnkyO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuaXNCQm94SW50ZXJzZWN0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIHR3byBib3VuZGluZyBib3hlcyBpbnRlcnNlY3RcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gYmJveDEgKHN0cmluZykgZmlyc3QgYm91bmRpbmcgYm94XG4gICAgIC0gYmJveDIgKHN0cmluZykgc2Vjb25kIGJvdW5kaW5nIGJveFxuICAgICA9IChib29sZWFuKSBgdHJ1ZWAgaWYgdGhleSBpbnRlcnNlY3RcbiAgICBcXCovXG4gICAgUi5pc0JCb3hJbnRlcnNlY3QgPSBmdW5jdGlvbiAoYmJveDEsIGJib3gyKSB7XG4gICAgICAgIHZhciBpID0gUi5pc1BvaW50SW5zaWRlQkJveDtcbiAgICAgICAgcmV0dXJuIGkoYmJveDIsIGJib3gxLngsIGJib3gxLnkpXG4gICAgICAgICAgICB8fCBpKGJib3gyLCBiYm94MS54MiwgYmJveDEueSlcbiAgICAgICAgICAgIHx8IGkoYmJveDIsIGJib3gxLngsIGJib3gxLnkyKVxuICAgICAgICAgICAgfHwgaShiYm94MiwgYmJveDEueDIsIGJib3gxLnkyKVxuICAgICAgICAgICAgfHwgaShiYm94MSwgYmJveDIueCwgYmJveDIueSlcbiAgICAgICAgICAgIHx8IGkoYmJveDEsIGJib3gyLngyLCBiYm94Mi55KVxuICAgICAgICAgICAgfHwgaShiYm94MSwgYmJveDIueCwgYmJveDIueTIpXG4gICAgICAgICAgICB8fCBpKGJib3gxLCBiYm94Mi54MiwgYmJveDIueTIpXG4gICAgICAgICAgICB8fCAoYmJveDEueCA8IGJib3gyLngyICYmIGJib3gxLnggPiBiYm94Mi54IHx8IGJib3gyLnggPCBiYm94MS54MiAmJiBiYm94Mi54ID4gYmJveDEueClcbiAgICAgICAgICAgICYmIChiYm94MS55IDwgYmJveDIueTIgJiYgYmJveDEueSA+IGJib3gyLnkgfHwgYmJveDIueSA8IGJib3gxLnkyICYmIGJib3gyLnkgPiBiYm94MS55KTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGJhc2UzKHQsIHAxLCBwMiwgcDMsIHA0KSB7XG4gICAgICAgIHZhciB0MSA9IC0zICogcDEgKyA5ICogcDIgLSA5ICogcDMgKyAzICogcDQsXG4gICAgICAgICAgICB0MiA9IHQgKiB0MSArIDYgKiBwMSAtIDEyICogcDIgKyA2ICogcDM7XG4gICAgICAgIHJldHVybiB0ICogdDIgLSAzICogcDEgKyAzICogcDI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGJlemxlbih4MSwgeTEsIHgyLCB5MiwgeDMsIHkzLCB4NCwgeTQsIHopIHtcbiAgICAgICAgaWYgKHogPT0gbnVsbCkge1xuICAgICAgICAgICAgeiA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgeiA9IHogPiAxID8gMSA6IHogPCAwID8gMCA6IHo7XG4gICAgICAgIHZhciB6MiA9IHogLyAyLFxuICAgICAgICAgICAgbiA9IDEyLFxuICAgICAgICAgICAgVHZhbHVlcyA9IFstMC4xMjUyLDAuMTI1MiwtMC4zNjc4LDAuMzY3OCwtMC41ODczLDAuNTg3MywtMC43Njk5LDAuNzY5OSwtMC45MDQxLDAuOTA0MSwtMC45ODE2LDAuOTgxNl0sXG4gICAgICAgICAgICBDdmFsdWVzID0gWzAuMjQ5MSwwLjI0OTEsMC4yMzM1LDAuMjMzNSwwLjIwMzIsMC4yMDMyLDAuMTYwMSwwLjE2MDEsMC4xMDY5LDAuMTA2OSwwLjA0NzIsMC4wNDcyXSxcbiAgICAgICAgICAgIHN1bSA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY3QgPSB6MiAqIFR2YWx1ZXNbaV0gKyB6MixcbiAgICAgICAgICAgICAgICB4YmFzZSA9IGJhc2UzKGN0LCB4MSwgeDIsIHgzLCB4NCksXG4gICAgICAgICAgICAgICAgeWJhc2UgPSBiYXNlMyhjdCwgeTEsIHkyLCB5MywgeTQpLFxuICAgICAgICAgICAgICAgIGNvbWIgPSB4YmFzZSAqIHhiYXNlICsgeWJhc2UgKiB5YmFzZTtcbiAgICAgICAgICAgIHN1bSArPSBDdmFsdWVzW2ldICogbWF0aC5zcXJ0KGNvbWIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB6MiAqIHN1bTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0VGF0TGVuKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCwgbGwpIHtcbiAgICAgICAgaWYgKGxsIDwgMCB8fCBiZXpsZW4oeDEsIHkxLCB4MiwgeTIsIHgzLCB5MywgeDQsIHk0KSA8IGxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHQgPSAxLFxuICAgICAgICAgICAgc3RlcCA9IHQgLyAyLFxuICAgICAgICAgICAgdDIgPSB0IC0gc3RlcCxcbiAgICAgICAgICAgIGwsXG4gICAgICAgICAgICBlID0gLjAxO1xuICAgICAgICBsID0gYmV6bGVuKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCwgdDIpO1xuICAgICAgICB3aGlsZSAoYWJzKGwgLSBsbCkgPiBlKSB7XG4gICAgICAgICAgICBzdGVwIC89IDI7XG4gICAgICAgICAgICB0MiArPSAobCA8IGxsID8gMSA6IC0xKSAqIHN0ZXA7XG4gICAgICAgICAgICBsID0gYmV6bGVuKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCwgdDIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0MjtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW50ZXJzZWN0KHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICBtbWF4KHgxLCB4MikgPCBtbWluKHgzLCB4NCkgfHxcbiAgICAgICAgICAgIG1taW4oeDEsIHgyKSA+IG1tYXgoeDMsIHg0KSB8fFxuICAgICAgICAgICAgbW1heCh5MSwgeTIpIDwgbW1pbih5MywgeTQpIHx8XG4gICAgICAgICAgICBtbWluKHkxLCB5MikgPiBtbWF4KHkzLCB5NClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG54ID0gKHgxICogeTIgLSB5MSAqIHgyKSAqICh4MyAtIHg0KSAtICh4MSAtIHgyKSAqICh4MyAqIHk0IC0geTMgKiB4NCksXG4gICAgICAgICAgICBueSA9ICh4MSAqIHkyIC0geTEgKiB4MikgKiAoeTMgLSB5NCkgLSAoeTEgLSB5MikgKiAoeDMgKiB5NCAtIHkzICogeDQpLFxuICAgICAgICAgICAgZGVub21pbmF0b3IgPSAoeDEgLSB4MikgKiAoeTMgLSB5NCkgLSAoeTEgLSB5MikgKiAoeDMgLSB4NCk7XG5cbiAgICAgICAgaWYgKCFkZW5vbWluYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBweCA9IG54IC8gZGVub21pbmF0b3IsXG4gICAgICAgICAgICBweSA9IG55IC8gZGVub21pbmF0b3IsXG4gICAgICAgICAgICBweDIgPSArcHgudG9GaXhlZCgyKSxcbiAgICAgICAgICAgIHB5MiA9ICtweS50b0ZpeGVkKDIpO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICBweDIgPCArbW1pbih4MSwgeDIpLnRvRml4ZWQoMikgfHxcbiAgICAgICAgICAgIHB4MiA+ICttbWF4KHgxLCB4MikudG9GaXhlZCgyKSB8fFxuICAgICAgICAgICAgcHgyIDwgK21taW4oeDMsIHg0KS50b0ZpeGVkKDIpIHx8XG4gICAgICAgICAgICBweDIgPiArbW1heCh4MywgeDQpLnRvRml4ZWQoMikgfHxcbiAgICAgICAgICAgIHB5MiA8ICttbWluKHkxLCB5MikudG9GaXhlZCgyKSB8fFxuICAgICAgICAgICAgcHkyID4gK21tYXgoeTEsIHkyKS50b0ZpeGVkKDIpIHx8XG4gICAgICAgICAgICBweTIgPCArbW1pbih5MywgeTQpLnRvRml4ZWQoMikgfHxcbiAgICAgICAgICAgIHB5MiA+ICttbWF4KHkzLCB5NCkudG9GaXhlZCgyKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge3g6IHB4LCB5OiBweX07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludGVyKGJlejEsIGJlejIpIHtcbiAgICAgICAgcmV0dXJuIGludGVySGVscGVyKGJlejEsIGJlejIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbnRlckNvdW50KGJlejEsIGJlejIpIHtcbiAgICAgICAgcmV0dXJuIGludGVySGVscGVyKGJlejEsIGJlejIsIDEpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbnRlckhlbHBlcihiZXoxLCBiZXoyLCBqdXN0Q291bnQpIHtcbiAgICAgICAgdmFyIGJib3gxID0gUi5iZXppZXJCQm94KGJlejEpLFxuICAgICAgICAgICAgYmJveDIgPSBSLmJlemllckJCb3goYmV6Mik7XG4gICAgICAgIGlmICghUi5pc0JCb3hJbnRlcnNlY3QoYmJveDEsIGJib3gyKSkge1xuICAgICAgICAgICAgcmV0dXJuIGp1c3RDb3VudCA/IDAgOiBbXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbDEgPSBiZXpsZW4uYXBwbHkoMCwgYmV6MSksXG4gICAgICAgICAgICBsMiA9IGJlemxlbi5hcHBseSgwLCBiZXoyKSxcbiAgICAgICAgICAgIG4xID0gfn4obDEgLyA1KSxcbiAgICAgICAgICAgIG4yID0gfn4obDIgLyA1KSxcbiAgICAgICAgICAgIGRvdHMxID0gW10sXG4gICAgICAgICAgICBkb3RzMiA9IFtdLFxuICAgICAgICAgICAgeHkgPSB7fSxcbiAgICAgICAgICAgIHJlcyA9IGp1c3RDb3VudCA/IDAgOiBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuMSArIDE7IGkrKykge1xuICAgICAgICAgICAgdmFyIHAgPSBSLmZpbmREb3RzQXRTZWdtZW50LmFwcGx5KFIsIGJlejEuY29uY2F0KGkgLyBuMSkpO1xuICAgICAgICAgICAgZG90czEucHVzaCh7eDogcC54LCB5OiBwLnksIHQ6IGkgLyBuMX0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBuMiArIDE7IGkrKykge1xuICAgICAgICAgICAgcCA9IFIuZmluZERvdHNBdFNlZ21lbnQuYXBwbHkoUiwgYmV6Mi5jb25jYXQoaSAvIG4yKSk7XG4gICAgICAgICAgICBkb3RzMi5wdXNoKHt4OiBwLngsIHk6IHAueSwgdDogaSAvIG4yfSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG4xOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbjI7IGorKykge1xuICAgICAgICAgICAgICAgIHZhciBkaSA9IGRvdHMxW2ldLFxuICAgICAgICAgICAgICAgICAgICBkaTEgPSBkb3RzMVtpICsgMV0sXG4gICAgICAgICAgICAgICAgICAgIGRqID0gZG90czJbal0sXG4gICAgICAgICAgICAgICAgICAgIGRqMSA9IGRvdHMyW2ogKyAxXSxcbiAgICAgICAgICAgICAgICAgICAgY2kgPSBhYnMoZGkxLnggLSBkaS54KSA8IC4wMDEgPyBcInlcIiA6IFwieFwiLFxuICAgICAgICAgICAgICAgICAgICBjaiA9IGFicyhkajEueCAtIGRqLngpIDwgLjAwMSA/IFwieVwiIDogXCJ4XCIsXG4gICAgICAgICAgICAgICAgICAgIGlzID0gaW50ZXJzZWN0KGRpLngsIGRpLnksIGRpMS54LCBkaTEueSwgZGoueCwgZGoueSwgZGoxLngsIGRqMS55KTtcbiAgICAgICAgICAgICAgICBpZiAoaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHh5W2lzLngudG9GaXhlZCg0KV0gPT0gaXMueS50b0ZpeGVkKDQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB4eVtpcy54LnRvRml4ZWQoNCldID0gaXMueS50b0ZpeGVkKDQpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdDEgPSBkaS50ICsgYWJzKChpc1tjaV0gLSBkaVtjaV0pIC8gKGRpMVtjaV0gLSBkaVtjaV0pKSAqIChkaTEudCAtIGRpLnQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdDIgPSBkai50ICsgYWJzKChpc1tjal0gLSBkaltjal0pIC8gKGRqMVtjal0gLSBkaltjal0pKSAqIChkajEudCAtIGRqLnQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodDEgPj0gMCAmJiB0MSA8PSAxICYmIHQyID49IDAgJiYgdDIgPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGp1c3RDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IGlzLngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGlzLnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQxOiB0MSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdDI6IHQyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwucGF0aEludGVyc2VjdGlvblxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBGaW5kcyBpbnRlcnNlY3Rpb25zIG9mIHR3byBwYXRoc1xuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBwYXRoMSAoc3RyaW5nKSBwYXRoIHN0cmluZ1xuICAgICAtIHBhdGgyIChzdHJpbmcpIHBhdGggc3RyaW5nXG4gICAgID0gKGFycmF5KSBkb3RzIG9mIGludGVyc2VjdGlvblxuICAgICBvIFtcbiAgICAgbyAgICAge1xuICAgICBvICAgICAgICAgeDogKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSBwb2ludFxuICAgICBvICAgICAgICAgeTogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBwb2ludFxuICAgICBvICAgICAgICAgdDE6IChudW1iZXIpIHQgdmFsdWUgZm9yIHNlZ21lbnQgb2YgcGF0aDFcbiAgICAgbyAgICAgICAgIHQyOiAobnVtYmVyKSB0IHZhbHVlIGZvciBzZWdtZW50IG9mIHBhdGgyXG4gICAgIG8gICAgICAgICBzZWdtZW50MTogKG51bWJlcikgb3JkZXIgbnVtYmVyIGZvciBzZWdtZW50IG9mIHBhdGgxXG4gICAgIG8gICAgICAgICBzZWdtZW50MjogKG51bWJlcikgb3JkZXIgbnVtYmVyIGZvciBzZWdtZW50IG9mIHBhdGgyXG4gICAgIG8gICAgICAgICBiZXoxOiAoYXJyYXkpIGVpZ2h0IGNvb3JkaW5hdGVzIHJlcHJlc2VudGluZyBiZXppw6lyIGN1cnZlIGZvciB0aGUgc2VnbWVudCBvZiBwYXRoMVxuICAgICBvICAgICAgICAgYmV6MjogKGFycmF5KSBlaWdodCBjb29yZGluYXRlcyByZXByZXNlbnRpbmcgYmV6acOpciBjdXJ2ZSBmb3IgdGhlIHNlZ21lbnQgb2YgcGF0aDJcbiAgICAgbyAgICAgfVxuICAgICBvIF1cbiAgICBcXCovXG4gICAgUi5wYXRoSW50ZXJzZWN0aW9uID0gZnVuY3Rpb24gKHBhdGgxLCBwYXRoMikge1xuICAgICAgICByZXR1cm4gaW50ZXJQYXRoSGVscGVyKHBhdGgxLCBwYXRoMik7XG4gICAgfTtcbiAgICBSLnBhdGhJbnRlcnNlY3Rpb25OdW1iZXIgPSBmdW5jdGlvbiAocGF0aDEsIHBhdGgyKSB7XG4gICAgICAgIHJldHVybiBpbnRlclBhdGhIZWxwZXIocGF0aDEsIHBhdGgyLCAxKTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGludGVyUGF0aEhlbHBlcihwYXRoMSwgcGF0aDIsIGp1c3RDb3VudCkge1xuICAgICAgICBwYXRoMSA9IFIuX3BhdGgyY3VydmUocGF0aDEpO1xuICAgICAgICBwYXRoMiA9IFIuX3BhdGgyY3VydmUocGF0aDIpO1xuICAgICAgICB2YXIgeDEsIHkxLCB4MiwgeTIsIHgxbSwgeTFtLCB4Mm0sIHkybSwgYmV6MSwgYmV6MixcbiAgICAgICAgICAgIHJlcyA9IGp1c3RDb3VudCA/IDAgOiBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gcGF0aDEubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgdmFyIHBpID0gcGF0aDFbaV07XG4gICAgICAgICAgICBpZiAocGlbMF0gPT0gXCJNXCIpIHtcbiAgICAgICAgICAgICAgICB4MSA9IHgxbSA9IHBpWzFdO1xuICAgICAgICAgICAgICAgIHkxID0geTFtID0gcGlbMl07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChwaVswXSA9PSBcIkNcIikge1xuICAgICAgICAgICAgICAgICAgICBiZXoxID0gW3gxLCB5MV0uY29uY2F0KHBpLnNsaWNlKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgeDEgPSBiZXoxWzZdO1xuICAgICAgICAgICAgICAgICAgICB5MSA9IGJlejFbN107XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmV6MSA9IFt4MSwgeTEsIHgxLCB5MSwgeDFtLCB5MW0sIHgxbSwgeTFtXTtcbiAgICAgICAgICAgICAgICAgICAgeDEgPSB4MW07XG4gICAgICAgICAgICAgICAgICAgIHkxID0geTFtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMCwgamogPSBwYXRoMi5sZW5ndGg7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwaiA9IHBhdGgyW2pdO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGpbMF0gPT0gXCJNXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHgyID0geDJtID0gcGpbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICB5MiA9IHkybSA9IHBqWzJdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBqWzBdID09IFwiQ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmV6MiA9IFt4MiwgeTJdLmNvbmNhdChwai5zbGljZSgxKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDIgPSBiZXoyWzZdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkyID0gYmV6Mls3XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmV6MiA9IFt4MiwgeTIsIHgyLCB5MiwgeDJtLCB5Mm0sIHgybSwgeTJtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4MiA9IHgybTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5MiA9IHkybTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbnRyID0gaW50ZXJIZWxwZXIoYmV6MSwgYmV6MiwganVzdENvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqdXN0Q291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgKz0gaW50cjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgayA9IDAsIGtrID0gaW50ci5sZW5ndGg7IGsgPCBrazsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludHJba10uc2VnbWVudDEgPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRyW2tdLnNlZ21lbnQyID0gajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50cltrXS5iZXoxID0gYmV6MTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50cltrXS5iZXoyID0gYmV6MjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gcmVzLmNvbmNhdChpbnRyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5pc1BvaW50SW5zaWRlUGF0aFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBnaXZlbiBwb2ludCBpcyBpbnNpZGUgYSBnaXZlbiBjbG9zZWQgcGF0aC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gcGF0aCAoc3RyaW5nKSBwYXRoIHN0cmluZ1xuICAgICAtIHggKG51bWJlcikgeCBvZiB0aGUgcG9pbnRcbiAgICAgLSB5IChudW1iZXIpIHkgb2YgdGhlIHBvaW50XG4gICAgID0gKGJvb2xlYW4pIHRydWUsIGlmIHBvaW50IGlzIGluc2lkZSB0aGUgcGF0aFxuICAgIFxcKi9cbiAgICBSLmlzUG9pbnRJbnNpZGVQYXRoID0gZnVuY3Rpb24gKHBhdGgsIHgsIHkpIHtcbiAgICAgICAgdmFyIGJib3ggPSBSLnBhdGhCQm94KHBhdGgpO1xuICAgICAgICByZXR1cm4gUi5pc1BvaW50SW5zaWRlQkJveChiYm94LCB4LCB5KSAmJlxuICAgICAgICAgICAgICAgaW50ZXJQYXRoSGVscGVyKHBhdGgsIFtbXCJNXCIsIHgsIHldLCBbXCJIXCIsIGJib3gueDIgKyAxMF1dLCAxKSAlIDIgPT0gMTtcbiAgICB9O1xuICAgIFIuX3JlbW92ZWRGYWN0b3J5ID0gZnVuY3Rpb24gKG1ldGhvZG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGV2ZShcInJhcGhhZWwubG9nXCIsIG51bGwsIFwiUmFwaGFcXHhlYmw6IHlvdSBhcmUgY2FsbGluZyB0byBtZXRob2QgXFx1MjAxY1wiICsgbWV0aG9kbmFtZSArIFwiXFx1MjAxZCBvZiByZW1vdmVkIG9iamVjdFwiLCBtZXRob2RuYW1lKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnBhdGhCQm94XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIFJldHVybiBib3VuZGluZyBib3ggb2YgYSBnaXZlbiBwYXRoXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHBhdGggKHN0cmluZykgcGF0aCBzdHJpbmdcbiAgICAgPSAob2JqZWN0KSBib3VuZGluZyBib3hcbiAgICAgbyB7XG4gICAgIG8gICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgbGVmdCB0b3AgcG9pbnQgb2YgdGhlIGJveFxuICAgICBvICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIGxlZnQgdG9wIHBvaW50IG9mIHRoZSBib3hcbiAgICAgbyAgICAgeDI6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgcmlnaHQgYm90dG9tIHBvaW50IG9mIHRoZSBib3hcbiAgICAgbyAgICAgeTI6IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgcmlnaHQgYm90dG9tIHBvaW50IG9mIHRoZSBib3hcbiAgICAgbyAgICAgd2lkdGg6IChudW1iZXIpIHdpZHRoIG9mIHRoZSBib3hcbiAgICAgbyAgICAgaGVpZ2h0OiAobnVtYmVyKSBoZWlnaHQgb2YgdGhlIGJveFxuICAgICBvICAgICBjeDogKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIGJveFxuICAgICBvICAgICBjeTogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIGJveFxuICAgICBvIH1cbiAgICBcXCovXG4gICAgdmFyIHBhdGhEaW1lbnNpb25zID0gUi5wYXRoQkJveCA9IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgICAgIHZhciBwdGggPSBwYXRocyhwYXRoKTtcbiAgICAgICAgaWYgKHB0aC5iYm94KSB7XG4gICAgICAgICAgICByZXR1cm4gY2xvbmUocHRoLmJib3gpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGF0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHt4OiAwLCB5OiAwLCB3aWR0aDogMCwgaGVpZ2h0OiAwLCB4MjogMCwgeTI6IDB9O1xuICAgICAgICB9XG4gICAgICAgIHBhdGggPSBwYXRoMmN1cnZlKHBhdGgpO1xuICAgICAgICB2YXIgeCA9IDAsIFxuICAgICAgICAgICAgeSA9IDAsXG4gICAgICAgICAgICBYID0gW10sXG4gICAgICAgICAgICBZID0gW10sXG4gICAgICAgICAgICBwO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBwYXRoLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgIHAgPSBwYXRoW2ldO1xuICAgICAgICAgICAgaWYgKHBbMF0gPT0gXCJNXCIpIHtcbiAgICAgICAgICAgICAgICB4ID0gcFsxXTtcbiAgICAgICAgICAgICAgICB5ID0gcFsyXTtcbiAgICAgICAgICAgICAgICBYLnB1c2goeCk7XG4gICAgICAgICAgICAgICAgWS5wdXNoKHkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgZGltID0gY3VydmVEaW0oeCwgeSwgcFsxXSwgcFsyXSwgcFszXSwgcFs0XSwgcFs1XSwgcFs2XSk7XG4gICAgICAgICAgICAgICAgWCA9IFhbY29uY2F0XShkaW0ubWluLngsIGRpbS5tYXgueCk7XG4gICAgICAgICAgICAgICAgWSA9IFlbY29uY2F0XShkaW0ubWluLnksIGRpbS5tYXgueSk7XG4gICAgICAgICAgICAgICAgeCA9IHBbNV07XG4gICAgICAgICAgICAgICAgeSA9IHBbNl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHhtaW4gPSBtbWluW2FwcGx5XSgwLCBYKSxcbiAgICAgICAgICAgIHltaW4gPSBtbWluW2FwcGx5XSgwLCBZKSxcbiAgICAgICAgICAgIHhtYXggPSBtbWF4W2FwcGx5XSgwLCBYKSxcbiAgICAgICAgICAgIHltYXggPSBtbWF4W2FwcGx5XSgwLCBZKSxcbiAgICAgICAgICAgIHdpZHRoID0geG1heCAtIHhtaW4sXG4gICAgICAgICAgICBoZWlnaHQgPSB5bWF4IC0geW1pbixcbiAgICAgICAgICAgICAgICBiYiA9IHtcbiAgICAgICAgICAgICAgICB4OiB4bWluLFxuICAgICAgICAgICAgICAgIHk6IHltaW4sXG4gICAgICAgICAgICAgICAgeDI6IHhtYXgsXG4gICAgICAgICAgICAgICAgeTI6IHltYXgsXG4gICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgICAgIGN4OiB4bWluICsgd2lkdGggLyAyLFxuICAgICAgICAgICAgICAgIGN5OiB5bWluICsgaGVpZ2h0IC8gMlxuICAgICAgICAgICAgfTtcbiAgICAgICAgcHRoLmJib3ggPSBjbG9uZShiYik7XG4gICAgICAgIHJldHVybiBiYjtcbiAgICB9LFxuICAgICAgICBwYXRoQ2xvbmUgPSBmdW5jdGlvbiAocGF0aEFycmF5KSB7XG4gICAgICAgICAgICB2YXIgcmVzID0gY2xvbmUocGF0aEFycmF5KTtcbiAgICAgICAgICAgIHJlcy50b1N0cmluZyA9IFIuX3BhdGgyc3RyaW5nO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfSxcbiAgICAgICAgcGF0aFRvUmVsYXRpdmUgPSBSLl9wYXRoVG9SZWxhdGl2ZSA9IGZ1bmN0aW9uIChwYXRoQXJyYXkpIHtcbiAgICAgICAgICAgIHZhciBwdGggPSBwYXRocyhwYXRoQXJyYXkpO1xuICAgICAgICAgICAgaWYgKHB0aC5yZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF0aENsb25lKHB0aC5yZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFSLmlzKHBhdGhBcnJheSwgYXJyYXkpIHx8ICFSLmlzKHBhdGhBcnJheSAmJiBwYXRoQXJyYXlbMF0sIGFycmF5KSkgeyAvLyByb3VnaCBhc3N1bXB0aW9uXG4gICAgICAgICAgICAgICAgcGF0aEFycmF5ID0gUi5wYXJzZVBhdGhTdHJpbmcocGF0aEFycmF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZXMgPSBbXSxcbiAgICAgICAgICAgICAgICB4ID0gMCxcbiAgICAgICAgICAgICAgICB5ID0gMCxcbiAgICAgICAgICAgICAgICBteCA9IDAsXG4gICAgICAgICAgICAgICAgbXkgPSAwLFxuICAgICAgICAgICAgICAgIHN0YXJ0ID0gMDtcbiAgICAgICAgICAgIGlmIChwYXRoQXJyYXlbMF1bMF0gPT0gXCJNXCIpIHtcbiAgICAgICAgICAgICAgICB4ID0gcGF0aEFycmF5WzBdWzFdO1xuICAgICAgICAgICAgICAgIHkgPSBwYXRoQXJyYXlbMF1bMl07XG4gICAgICAgICAgICAgICAgbXggPSB4O1xuICAgICAgICAgICAgICAgIG15ID0geTtcbiAgICAgICAgICAgICAgICBzdGFydCsrO1xuICAgICAgICAgICAgICAgIHJlcy5wdXNoKFtcIk1cIiwgeCwgeV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IHN0YXJ0LCBpaSA9IHBhdGhBcnJheS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHIgPSByZXNbaV0gPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgcGEgPSBwYXRoQXJyYXlbaV07XG4gICAgICAgICAgICAgICAgaWYgKHBhWzBdICE9IGxvd2VyQ2FzZS5jYWxsKHBhWzBdKSkge1xuICAgICAgICAgICAgICAgICAgICByWzBdID0gbG93ZXJDYXNlLmNhbGwocGFbMF0pO1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHJbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJhXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgclsxXSA9IHBhWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbMl0gPSBwYVsyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzNdID0gcGFbM107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcls0XSA9IHBhWzRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbNV0gPSBwYVs1XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzZdID0gKyhwYVs2XSAtIHgpLnRvRml4ZWQoMyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcls3XSA9ICsocGFbN10gLSB5KS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInZcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzFdID0gKyhwYVsxXSAtIHkpLnRvRml4ZWQoMyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwibVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG14ID0gcGFbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXkgPSBwYVsyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDEsIGpqID0gcGEubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByW2pdID0gKyhwYVtqXSAtICgoaiAlIDIpID8geCA6IHkpKS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHIgPSByZXNbaV0gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhWzBdID09IFwibVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBteCA9IHBhWzFdICsgeDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG15ID0gcGFbMl0gKyB5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSAwLCBrayA9IHBhLmxlbmd0aDsgayA8IGtrOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc1tpXVtrXSA9IHBhW2tdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBsZW4gPSByZXNbaV0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocmVzW2ldWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ6XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB4ID0gbXg7XG4gICAgICAgICAgICAgICAgICAgICAgICB5ID0gbXk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImhcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHggKz0gK3Jlc1tpXVtsZW4gLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwidlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgeSArPSArcmVzW2ldW2xlbiAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB4ICs9ICtyZXNbaV1bbGVuIC0gMl07XG4gICAgICAgICAgICAgICAgICAgICAgICB5ICs9ICtyZXNbaV1bbGVuIC0gMV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzLnRvU3RyaW5nID0gUi5fcGF0aDJzdHJpbmc7XG4gICAgICAgICAgICBwdGgucmVsID0gcGF0aENsb25lKHJlcyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9LFxuICAgICAgICBwYXRoVG9BYnNvbHV0ZSA9IFIuX3BhdGhUb0Fic29sdXRlID0gZnVuY3Rpb24gKHBhdGhBcnJheSkge1xuICAgICAgICAgICAgdmFyIHB0aCA9IHBhdGhzKHBhdGhBcnJheSk7XG4gICAgICAgICAgICBpZiAocHRoLmFicykge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXRoQ2xvbmUocHRoLmFicyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIVIuaXMocGF0aEFycmF5LCBhcnJheSkgfHwgIVIuaXMocGF0aEFycmF5ICYmIHBhdGhBcnJheVswXSwgYXJyYXkpKSB7IC8vIHJvdWdoIGFzc3VtcHRpb25cbiAgICAgICAgICAgICAgICBwYXRoQXJyYXkgPSBSLnBhcnNlUGF0aFN0cmluZyhwYXRoQXJyYXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFwYXRoQXJyYXkgfHwgIXBhdGhBcnJheS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1tcIk1cIiwgMCwgMF1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJlcyA9IFtdLFxuICAgICAgICAgICAgICAgIHggPSAwLFxuICAgICAgICAgICAgICAgIHkgPSAwLFxuICAgICAgICAgICAgICAgIG14ID0gMCxcbiAgICAgICAgICAgICAgICBteSA9IDAsXG4gICAgICAgICAgICAgICAgc3RhcnQgPSAwO1xuICAgICAgICAgICAgaWYgKHBhdGhBcnJheVswXVswXSA9PSBcIk1cIikge1xuICAgICAgICAgICAgICAgIHggPSArcGF0aEFycmF5WzBdWzFdO1xuICAgICAgICAgICAgICAgIHkgPSArcGF0aEFycmF5WzBdWzJdO1xuICAgICAgICAgICAgICAgIG14ID0geDtcbiAgICAgICAgICAgICAgICBteSA9IHk7XG4gICAgICAgICAgICAgICAgc3RhcnQrKztcbiAgICAgICAgICAgICAgICByZXNbMF0gPSBbXCJNXCIsIHgsIHldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGNyeiA9IHBhdGhBcnJheS5sZW5ndGggPT0gMyAmJiBwYXRoQXJyYXlbMF1bMF0gPT0gXCJNXCIgJiYgcGF0aEFycmF5WzFdWzBdLnRvVXBwZXJDYXNlKCkgPT0gXCJSXCIgJiYgcGF0aEFycmF5WzJdWzBdLnRvVXBwZXJDYXNlKCkgPT0gXCJaXCI7XG4gICAgICAgICAgICBmb3IgKHZhciByLCBwYSwgaSA9IHN0YXJ0LCBpaSA9IHBhdGhBcnJheS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVzLnB1c2gociA9IFtdKTtcbiAgICAgICAgICAgICAgICBwYSA9IHBhdGhBcnJheVtpXTtcbiAgICAgICAgICAgICAgICBpZiAocGFbMF0gIT0gdXBwZXJDYXNlLmNhbGwocGFbMF0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJbMF0gPSB1cHBlckNhc2UuY2FsbChwYVswXSk7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoclswXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkFcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzFdID0gcGFbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgclsyXSA9IHBhWzJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbM10gPSBwYVszXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByWzRdID0gcGFbNF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcls1XSA9IHBhWzVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbNl0gPSArKHBhWzZdICsgeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcls3XSA9ICsocGFbN10gKyB5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJWXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgclsxXSA9ICtwYVsxXSArIHk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiSFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJbMV0gPSArcGFbMV0gKyB4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlJcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZG90cyA9IFt4LCB5XVtjb25jYXRdKHBhLnNsaWNlKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMiwgamogPSBkb3RzLmxlbmd0aDsgaiA8IGpqOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90c1tqXSA9ICtkb3RzW2pdICsgeDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90c1srK2pdID0gK2RvdHNbal0gKyB5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gcmVzW2NvbmNhdF0oY2F0bXVsbFJvbTJiZXppZXIoZG90cywgY3J6KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG14ID0gK3BhWzFdICsgeDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBteSA9ICtwYVsyXSArIHk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDEsIGpqID0gcGEubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByW2pdID0gK3BhW2pdICsgKChqICUgMikgPyB4IDogeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYVswXSA9PSBcIlJcIikge1xuICAgICAgICAgICAgICAgICAgICBkb3RzID0gW3gsIHldW2NvbmNhdF0ocGEuc2xpY2UoMSkpO1xuICAgICAgICAgICAgICAgICAgICByZXMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlcyA9IHJlc1tjb25jYXRdKGNhdG11bGxSb20yYmV6aWVyKGRvdHMsIGNyeikpO1xuICAgICAgICAgICAgICAgICAgICByID0gW1wiUlwiXVtjb25jYXRdKHBhLnNsaWNlKC0yKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgayA9IDAsIGtrID0gcGEubGVuZ3RoOyBrIDwga2s7IGsrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcltrXSA9IHBhW2tdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN3aXRjaCAoclswXSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiWlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgeCA9IG14O1xuICAgICAgICAgICAgICAgICAgICAgICAgeSA9IG15O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJIXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB4ID0gclsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiVlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgeSA9IHJbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk1cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIG14ID0gcltyLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgbXkgPSByW3IubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB4ID0gcltyLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgeSA9IHJbci5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXMudG9TdHJpbmcgPSBSLl9wYXRoMnN0cmluZztcbiAgICAgICAgICAgIHB0aC5hYnMgPSBwYXRoQ2xvbmUocmVzKTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH0sXG4gICAgICAgIGwyYyA9IGZ1bmN0aW9uICh4MSwgeTEsIHgyLCB5Mikge1xuICAgICAgICAgICAgcmV0dXJuIFt4MSwgeTEsIHgyLCB5MiwgeDIsIHkyXTtcbiAgICAgICAgfSxcbiAgICAgICAgcTJjID0gZnVuY3Rpb24gKHgxLCB5MSwgYXgsIGF5LCB4MiwgeTIpIHtcbiAgICAgICAgICAgIHZhciBfMTMgPSAxIC8gMyxcbiAgICAgICAgICAgICAgICBfMjMgPSAyIC8gMztcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIF8xMyAqIHgxICsgXzIzICogYXgsXG4gICAgICAgICAgICAgICAgICAgIF8xMyAqIHkxICsgXzIzICogYXksXG4gICAgICAgICAgICAgICAgICAgIF8xMyAqIHgyICsgXzIzICogYXgsXG4gICAgICAgICAgICAgICAgICAgIF8xMyAqIHkyICsgXzIzICogYXksXG4gICAgICAgICAgICAgICAgICAgIHgyLFxuICAgICAgICAgICAgICAgICAgICB5MlxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgIH0sXG4gICAgICAgIGEyYyA9IGZ1bmN0aW9uICh4MSwgeTEsIHJ4LCByeSwgYW5nbGUsIGxhcmdlX2FyY19mbGFnLCBzd2VlcF9mbGFnLCB4MiwgeTIsIHJlY3Vyc2l2ZSkge1xuICAgICAgICAgICAgLy8gZm9yIG1vcmUgaW5mb3JtYXRpb24gb2Ygd2hlcmUgdGhpcyBtYXRoIGNhbWUgZnJvbSB2aXNpdDpcbiAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRzExL2ltcGxub3RlLmh0bWwjQXJjSW1wbGVtZW50YXRpb25Ob3Rlc1xuICAgICAgICAgICAgdmFyIF8xMjAgPSBQSSAqIDEyMCAvIDE4MCxcbiAgICAgICAgICAgICAgICByYWQgPSBQSSAvIDE4MCAqICgrYW5nbGUgfHwgMCksXG4gICAgICAgICAgICAgICAgcmVzID0gW10sXG4gICAgICAgICAgICAgICAgeHksXG4gICAgICAgICAgICAgICAgcm90YXRlID0gY2FjaGVyKGZ1bmN0aW9uICh4LCB5LCByYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIFggPSB4ICogbWF0aC5jb3MocmFkKSAtIHkgKiBtYXRoLnNpbihyYWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgWSA9IHggKiBtYXRoLnNpbihyYWQpICsgeSAqIG1hdGguY29zKHJhZCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7eDogWCwgeTogWX07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXJlY3Vyc2l2ZSkge1xuICAgICAgICAgICAgICAgIHh5ID0gcm90YXRlKHgxLCB5MSwgLXJhZCk7XG4gICAgICAgICAgICAgICAgeDEgPSB4eS54O1xuICAgICAgICAgICAgICAgIHkxID0geHkueTtcbiAgICAgICAgICAgICAgICB4eSA9IHJvdGF0ZSh4MiwgeTIsIC1yYWQpO1xuICAgICAgICAgICAgICAgIHgyID0geHkueDtcbiAgICAgICAgICAgICAgICB5MiA9IHh5Lnk7XG4gICAgICAgICAgICAgICAgdmFyIGNvcyA9IG1hdGguY29zKFBJIC8gMTgwICogYW5nbGUpLFxuICAgICAgICAgICAgICAgICAgICBzaW4gPSBtYXRoLnNpbihQSSAvIDE4MCAqIGFuZ2xlKSxcbiAgICAgICAgICAgICAgICAgICAgeCA9ICh4MSAtIHgyKSAvIDIsXG4gICAgICAgICAgICAgICAgICAgIHkgPSAoeTEgLSB5MikgLyAyO1xuICAgICAgICAgICAgICAgIHZhciBoID0gKHggKiB4KSAvIChyeCAqIHJ4KSArICh5ICogeSkgLyAocnkgKiByeSk7XG4gICAgICAgICAgICAgICAgaWYgKGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGggPSBtYXRoLnNxcnQoaCk7XG4gICAgICAgICAgICAgICAgICAgIHJ4ID0gaCAqIHJ4O1xuICAgICAgICAgICAgICAgICAgICByeSA9IGggKiByeTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHJ4MiA9IHJ4ICogcngsXG4gICAgICAgICAgICAgICAgICAgIHJ5MiA9IHJ5ICogcnksXG4gICAgICAgICAgICAgICAgICAgIGsgPSAobGFyZ2VfYXJjX2ZsYWcgPT0gc3dlZXBfZmxhZyA/IC0xIDogMSkgKlxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0aC5zcXJ0KGFicygocngyICogcnkyIC0gcngyICogeSAqIHkgLSByeTIgKiB4ICogeCkgLyAocngyICogeSAqIHkgKyByeTIgKiB4ICogeCkpKSxcbiAgICAgICAgICAgICAgICAgICAgY3ggPSBrICogcnggKiB5IC8gcnkgKyAoeDEgKyB4MikgLyAyLFxuICAgICAgICAgICAgICAgICAgICBjeSA9IGsgKiAtcnkgKiB4IC8gcnggKyAoeTEgKyB5MikgLyAyLFxuICAgICAgICAgICAgICAgICAgICBmMSA9IG1hdGguYXNpbigoKHkxIC0gY3kpIC8gcnkpLnRvRml4ZWQoOSkpLFxuICAgICAgICAgICAgICAgICAgICBmMiA9IG1hdGguYXNpbigoKHkyIC0gY3kpIC8gcnkpLnRvRml4ZWQoOSkpO1xuXG4gICAgICAgICAgICAgICAgZjEgPSB4MSA8IGN4ID8gUEkgLSBmMSA6IGYxO1xuICAgICAgICAgICAgICAgIGYyID0geDIgPCBjeCA/IFBJIC0gZjIgOiBmMjtcbiAgICAgICAgICAgICAgICBmMSA8IDAgJiYgKGYxID0gUEkgKiAyICsgZjEpO1xuICAgICAgICAgICAgICAgIGYyIDwgMCAmJiAoZjIgPSBQSSAqIDIgKyBmMik7XG4gICAgICAgICAgICAgICAgaWYgKHN3ZWVwX2ZsYWcgJiYgZjEgPiBmMikge1xuICAgICAgICAgICAgICAgICAgICBmMSA9IGYxIC0gUEkgKiAyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXN3ZWVwX2ZsYWcgJiYgZjIgPiBmMSkge1xuICAgICAgICAgICAgICAgICAgICBmMiA9IGYyIC0gUEkgKiAyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZjEgPSByZWN1cnNpdmVbMF07XG4gICAgICAgICAgICAgICAgZjIgPSByZWN1cnNpdmVbMV07XG4gICAgICAgICAgICAgICAgY3ggPSByZWN1cnNpdmVbMl07XG4gICAgICAgICAgICAgICAgY3kgPSByZWN1cnNpdmVbM107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZGYgPSBmMiAtIGYxO1xuICAgICAgICAgICAgaWYgKGFicyhkZikgPiBfMTIwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGYyb2xkID0gZjIsXG4gICAgICAgICAgICAgICAgICAgIHgyb2xkID0geDIsXG4gICAgICAgICAgICAgICAgICAgIHkyb2xkID0geTI7XG4gICAgICAgICAgICAgICAgZjIgPSBmMSArIF8xMjAgKiAoc3dlZXBfZmxhZyAmJiBmMiA+IGYxID8gMSA6IC0xKTtcbiAgICAgICAgICAgICAgICB4MiA9IGN4ICsgcnggKiBtYXRoLmNvcyhmMik7XG4gICAgICAgICAgICAgICAgeTIgPSBjeSArIHJ5ICogbWF0aC5zaW4oZjIpO1xuICAgICAgICAgICAgICAgIHJlcyA9IGEyYyh4MiwgeTIsIHJ4LCByeSwgYW5nbGUsIDAsIHN3ZWVwX2ZsYWcsIHgyb2xkLCB5Mm9sZCwgW2YyLCBmMm9sZCwgY3gsIGN5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZiA9IGYyIC0gZjE7XG4gICAgICAgICAgICB2YXIgYzEgPSBtYXRoLmNvcyhmMSksXG4gICAgICAgICAgICAgICAgczEgPSBtYXRoLnNpbihmMSksXG4gICAgICAgICAgICAgICAgYzIgPSBtYXRoLmNvcyhmMiksXG4gICAgICAgICAgICAgICAgczIgPSBtYXRoLnNpbihmMiksXG4gICAgICAgICAgICAgICAgdCA9IG1hdGgudGFuKGRmIC8gNCksXG4gICAgICAgICAgICAgICAgaHggPSA0IC8gMyAqIHJ4ICogdCxcbiAgICAgICAgICAgICAgICBoeSA9IDQgLyAzICogcnkgKiB0LFxuICAgICAgICAgICAgICAgIG0xID0gW3gxLCB5MV0sXG4gICAgICAgICAgICAgICAgbTIgPSBbeDEgKyBoeCAqIHMxLCB5MSAtIGh5ICogYzFdLFxuICAgICAgICAgICAgICAgIG0zID0gW3gyICsgaHggKiBzMiwgeTIgLSBoeSAqIGMyXSxcbiAgICAgICAgICAgICAgICBtNCA9IFt4MiwgeTJdO1xuICAgICAgICAgICAgbTJbMF0gPSAyICogbTFbMF0gLSBtMlswXTtcbiAgICAgICAgICAgIG0yWzFdID0gMiAqIG0xWzFdIC0gbTJbMV07XG4gICAgICAgICAgICBpZiAocmVjdXJzaXZlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFttMiwgbTMsIG00XVtjb25jYXRdKHJlcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlcyA9IFttMiwgbTMsIG00XVtjb25jYXRdKHJlcykuam9pbigpW3NwbGl0XShcIixcIik7XG4gICAgICAgICAgICAgICAgdmFyIG5ld3JlcyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHJlcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld3Jlc1tpXSA9IGkgJSAyID8gcm90YXRlKHJlc1tpIC0gMV0sIHJlc1tpXSwgcmFkKS55IDogcm90YXRlKHJlc1tpXSwgcmVzW2kgKyAxXSwgcmFkKS54O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3cmVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBmaW5kRG90QXRTZWdtZW50ID0gZnVuY3Rpb24gKHAxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5LCB0KSB7XG4gICAgICAgICAgICB2YXIgdDEgPSAxIC0gdDtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgeDogcG93KHQxLCAzKSAqIHAxeCArIHBvdyh0MSwgMikgKiAzICogdCAqIGMxeCArIHQxICogMyAqIHQgKiB0ICogYzJ4ICsgcG93KHQsIDMpICogcDJ4LFxuICAgICAgICAgICAgICAgIHk6IHBvdyh0MSwgMykgKiBwMXkgKyBwb3codDEsIDIpICogMyAqIHQgKiBjMXkgKyB0MSAqIDMgKiB0ICogdCAqIGMyeSArIHBvdyh0LCAzKSAqIHAyeVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgY3VydmVEaW0gPSBjYWNoZXIoZnVuY3Rpb24gKHAxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5KSB7XG4gICAgICAgICAgICB2YXIgYSA9IChjMnggLSAyICogYzF4ICsgcDF4KSAtIChwMnggLSAyICogYzJ4ICsgYzF4KSxcbiAgICAgICAgICAgICAgICBiID0gMiAqIChjMXggLSBwMXgpIC0gMiAqIChjMnggLSBjMXgpLFxuICAgICAgICAgICAgICAgIGMgPSBwMXggLSBjMXgsXG4gICAgICAgICAgICAgICAgdDEgPSAoLWIgKyBtYXRoLnNxcnQoYiAqIGIgLSA0ICogYSAqIGMpKSAvIDIgLyBhLFxuICAgICAgICAgICAgICAgIHQyID0gKC1iIC0gbWF0aC5zcXJ0KGIgKiBiIC0gNCAqIGEgKiBjKSkgLyAyIC8gYSxcbiAgICAgICAgICAgICAgICB5ID0gW3AxeSwgcDJ5XSxcbiAgICAgICAgICAgICAgICB4ID0gW3AxeCwgcDJ4XSxcbiAgICAgICAgICAgICAgICBkb3Q7XG4gICAgICAgICAgICBhYnModDEpID4gXCIxZTEyXCIgJiYgKHQxID0gLjUpO1xuICAgICAgICAgICAgYWJzKHQyKSA+IFwiMWUxMlwiICYmICh0MiA9IC41KTtcbiAgICAgICAgICAgIGlmICh0MSA+IDAgJiYgdDEgPCAxKSB7XG4gICAgICAgICAgICAgICAgZG90ID0gZmluZERvdEF0U2VnbWVudChwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeSwgdDEpO1xuICAgICAgICAgICAgICAgIHgucHVzaChkb3QueCk7XG4gICAgICAgICAgICAgICAgeS5wdXNoKGRvdC55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0MiA+IDAgJiYgdDIgPCAxKSB7XG4gICAgICAgICAgICAgICAgZG90ID0gZmluZERvdEF0U2VnbWVudChwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeSwgdDIpO1xuICAgICAgICAgICAgICAgIHgucHVzaChkb3QueCk7XG4gICAgICAgICAgICAgICAgeS5wdXNoKGRvdC55KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGEgPSAoYzJ5IC0gMiAqIGMxeSArIHAxeSkgLSAocDJ5IC0gMiAqIGMyeSArIGMxeSk7XG4gICAgICAgICAgICBiID0gMiAqIChjMXkgLSBwMXkpIC0gMiAqIChjMnkgLSBjMXkpO1xuICAgICAgICAgICAgYyA9IHAxeSAtIGMxeTtcbiAgICAgICAgICAgIHQxID0gKC1iICsgbWF0aC5zcXJ0KGIgKiBiIC0gNCAqIGEgKiBjKSkgLyAyIC8gYTtcbiAgICAgICAgICAgIHQyID0gKC1iIC0gbWF0aC5zcXJ0KGIgKiBiIC0gNCAqIGEgKiBjKSkgLyAyIC8gYTtcbiAgICAgICAgICAgIGFicyh0MSkgPiBcIjFlMTJcIiAmJiAodDEgPSAuNSk7XG4gICAgICAgICAgICBhYnModDIpID4gXCIxZTEyXCIgJiYgKHQyID0gLjUpO1xuICAgICAgICAgICAgaWYgKHQxID4gMCAmJiB0MSA8IDEpIHtcbiAgICAgICAgICAgICAgICBkb3QgPSBmaW5kRG90QXRTZWdtZW50KHAxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5LCB0MSk7XG4gICAgICAgICAgICAgICAgeC5wdXNoKGRvdC54KTtcbiAgICAgICAgICAgICAgICB5LnB1c2goZG90LnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHQyID4gMCAmJiB0MiA8IDEpIHtcbiAgICAgICAgICAgICAgICBkb3QgPSBmaW5kRG90QXRTZWdtZW50KHAxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5LCB0Mik7XG4gICAgICAgICAgICAgICAgeC5wdXNoKGRvdC54KTtcbiAgICAgICAgICAgICAgICB5LnB1c2goZG90LnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtaW46IHt4OiBtbWluW2FwcGx5XSgwLCB4KSwgeTogbW1pblthcHBseV0oMCwgeSl9LFxuICAgICAgICAgICAgICAgIG1heDoge3g6IG1tYXhbYXBwbHldKDAsIHgpLCB5OiBtbWF4W2FwcGx5XSgwLCB5KX1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICBwYXRoMmN1cnZlID0gUi5fcGF0aDJjdXJ2ZSA9IGNhY2hlcihmdW5jdGlvbiAocGF0aCwgcGF0aDIpIHtcbiAgICAgICAgICAgIHZhciBwdGggPSAhcGF0aDIgJiYgcGF0aHMocGF0aCk7XG4gICAgICAgICAgICBpZiAoIXBhdGgyICYmIHB0aC5jdXJ2ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXRoQ2xvbmUocHRoLmN1cnZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwID0gcGF0aFRvQWJzb2x1dGUocGF0aCksXG4gICAgICAgICAgICAgICAgcDIgPSBwYXRoMiAmJiBwYXRoVG9BYnNvbHV0ZShwYXRoMiksXG4gICAgICAgICAgICAgICAgYXR0cnMgPSB7eDogMCwgeTogMCwgYng6IDAsIGJ5OiAwLCBYOiAwLCBZOiAwLCBxeDogbnVsbCwgcXk6IG51bGx9LFxuICAgICAgICAgICAgICAgIGF0dHJzMiA9IHt4OiAwLCB5OiAwLCBieDogMCwgYnk6IDAsIFg6IDAsIFk6IDAsIHF4OiBudWxsLCBxeTogbnVsbH0sXG4gICAgICAgICAgICAgICAgcHJvY2Vzc1BhdGggPSBmdW5jdGlvbiAocGF0aCwgZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbngsIG55O1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbXCJDXCIsIGQueCwgZC55LCBkLngsIGQueSwgZC54LCBkLnldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICEocGF0aFswXSBpbiB7VDoxLCBROjF9KSAmJiAoZC5xeCA9IGQucXkgPSBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwYXRoWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQuWCA9IHBhdGhbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZC5ZID0gcGF0aFsyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJBXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCA9IFtcIkNcIl1bY29uY2F0XShhMmNbYXBwbHldKDAsIFtkLngsIGQueV1bY29uY2F0XShwYXRoLnNsaWNlKDEpKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlNcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBueCA9IGQueCArIChkLnggLSAoZC5ieCB8fCBkLngpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBueSA9IGQueSArIChkLnkgLSAoZC5ieSB8fCBkLnkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoID0gW1wiQ1wiLCBueCwgbnldW2NvbmNhdF0ocGF0aC5zbGljZSgxKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiVFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQucXggPSBkLnggKyAoZC54IC0gKGQucXggfHwgZC54KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZC5xeSA9IGQueSArIChkLnkgLSAoZC5xeSB8fCBkLnkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoID0gW1wiQ1wiXVtjb25jYXRdKHEyYyhkLngsIGQueSwgZC5xeCwgZC5xeSwgcGF0aFsxXSwgcGF0aFsyXSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlFcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkLnF4ID0gcGF0aFsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkLnF5ID0gcGF0aFsyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoID0gW1wiQ1wiXVtjb25jYXRdKHEyYyhkLngsIGQueSwgcGF0aFsxXSwgcGF0aFsyXSwgcGF0aFszXSwgcGF0aFs0XSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkxcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoID0gW1wiQ1wiXVtjb25jYXRdKGwyYyhkLngsIGQueSwgcGF0aFsxXSwgcGF0aFsyXSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkhcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoID0gW1wiQ1wiXVtjb25jYXRdKGwyYyhkLngsIGQueSwgcGF0aFsxXSwgZC55KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiVlwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGggPSBbXCJDXCJdW2NvbmNhdF0obDJjKGQueCwgZC55LCBkLngsIHBhdGhbMV0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJaXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCA9IFtcIkNcIl1bY29uY2F0XShsMmMoZC54LCBkLnksIGQuWCwgZC5ZKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmaXhBcmMgPSBmdW5jdGlvbiAocHAsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBwW2ldLmxlbmd0aCA+IDcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBwW2ldLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGkgPSBwcFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChwaS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcC5zcGxpY2UoaSsrLCAwLCBbXCJDXCJdW2NvbmNhdF0ocGkuc3BsaWNlKDAsIDYpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBwcC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpaSA9IG1tYXgocC5sZW5ndGgsIHAyICYmIHAyLmxlbmd0aCB8fCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZml4TSA9IGZ1bmN0aW9uIChwYXRoMSwgcGF0aDIsIGExLCBhMiwgaSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocGF0aDEgJiYgcGF0aDIgJiYgcGF0aDFbaV1bMF0gPT0gXCJNXCIgJiYgcGF0aDJbaV1bMF0gIT0gXCJNXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgyLnNwbGljZShpLCAwLCBbXCJNXCIsIGEyLngsIGEyLnldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGExLmJ4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGExLmJ5ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGExLnggPSBwYXRoMVtpXVsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGExLnkgPSBwYXRoMVtpXVsyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlpID0gbW1heChwLmxlbmd0aCwgcDIgJiYgcDIubGVuZ3RoIHx8IDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IG1tYXgocC5sZW5ndGgsIHAyICYmIHAyLmxlbmd0aCB8fCAwKTsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwW2ldID0gcHJvY2Vzc1BhdGgocFtpXSwgYXR0cnMpO1xuICAgICAgICAgICAgICAgIGZpeEFyYyhwLCBpKTtcbiAgICAgICAgICAgICAgICBwMiAmJiAocDJbaV0gPSBwcm9jZXNzUGF0aChwMltpXSwgYXR0cnMyKSk7XG4gICAgICAgICAgICAgICAgcDIgJiYgZml4QXJjKHAyLCBpKTtcbiAgICAgICAgICAgICAgICBmaXhNKHAsIHAyLCBhdHRycywgYXR0cnMyLCBpKTtcbiAgICAgICAgICAgICAgICBmaXhNKHAyLCBwLCBhdHRyczIsIGF0dHJzLCBpKTtcbiAgICAgICAgICAgICAgICB2YXIgc2VnID0gcFtpXSxcbiAgICAgICAgICAgICAgICAgICAgc2VnMiA9IHAyICYmIHAyW2ldLFxuICAgICAgICAgICAgICAgICAgICBzZWdsZW4gPSBzZWcubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBzZWcybGVuID0gcDIgJiYgc2VnMi5sZW5ndGg7XG4gICAgICAgICAgICAgICAgYXR0cnMueCA9IHNlZ1tzZWdsZW4gLSAyXTtcbiAgICAgICAgICAgICAgICBhdHRycy55ID0gc2VnW3NlZ2xlbiAtIDFdO1xuICAgICAgICAgICAgICAgIGF0dHJzLmJ4ID0gdG9GbG9hdChzZWdbc2VnbGVuIC0gNF0pIHx8IGF0dHJzLng7XG4gICAgICAgICAgICAgICAgYXR0cnMuYnkgPSB0b0Zsb2F0KHNlZ1tzZWdsZW4gLSAzXSkgfHwgYXR0cnMueTtcbiAgICAgICAgICAgICAgICBhdHRyczIuYnggPSBwMiAmJiAodG9GbG9hdChzZWcyW3NlZzJsZW4gLSA0XSkgfHwgYXR0cnMyLngpO1xuICAgICAgICAgICAgICAgIGF0dHJzMi5ieSA9IHAyICYmICh0b0Zsb2F0KHNlZzJbc2VnMmxlbiAtIDNdKSB8fCBhdHRyczIueSk7XG4gICAgICAgICAgICAgICAgYXR0cnMyLnggPSBwMiAmJiBzZWcyW3NlZzJsZW4gLSAyXTtcbiAgICAgICAgICAgICAgICBhdHRyczIueSA9IHAyICYmIHNlZzJbc2VnMmxlbiAtIDFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFwMikge1xuICAgICAgICAgICAgICAgIHB0aC5jdXJ2ZSA9IHBhdGhDbG9uZShwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwMiA/IFtwLCBwMl0gOiBwO1xuICAgICAgICB9LCBudWxsLCBwYXRoQ2xvbmUpLFxuICAgICAgICBwYXJzZURvdHMgPSBSLl9wYXJzZURvdHMgPSBjYWNoZXIoZnVuY3Rpb24gKGdyYWRpZW50KSB7XG4gICAgICAgICAgICB2YXIgZG90cyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gZ3JhZGllbnQubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBkb3QgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgcGFyID0gZ3JhZGllbnRbaV0ubWF0Y2goL14oW146XSopOj8oW1xcZFxcLl0qKS8pO1xuICAgICAgICAgICAgICAgIGRvdC5jb2xvciA9IFIuZ2V0UkdCKHBhclsxXSk7XG4gICAgICAgICAgICAgICAgaWYgKGRvdC5jb2xvci5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZG90LmNvbG9yID0gZG90LmNvbG9yLmhleDtcbiAgICAgICAgICAgICAgICBwYXJbMl0gJiYgKGRvdC5vZmZzZXQgPSBwYXJbMl0gKyBcIiVcIik7XG4gICAgICAgICAgICAgICAgZG90cy5wdXNoKGRvdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGkgPSAxLCBpaSA9IGRvdHMubGVuZ3RoIC0gMTsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoIWRvdHNbaV0ub2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IHRvRmxvYXQoZG90c1tpIC0gMV0ub2Zmc2V0IHx8IDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgaWk7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvdHNbal0ub2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kID0gZG90c1tqXS5vZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZCA9IDEwMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGogPSBpaTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbmQgPSB0b0Zsb2F0KGVuZCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gKGVuZCAtIHN0YXJ0KSAvIChqIC0gaSArIDEpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQgKz0gZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvdHNbaV0ub2Zmc2V0ID0gc3RhcnQgKyBcIiVcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkb3RzO1xuICAgICAgICB9KSxcbiAgICAgICAgdGVhciA9IFIuX3RlYXIgPSBmdW5jdGlvbiAoZWwsIHBhcGVyKSB7XG4gICAgICAgICAgICBlbCA9PSBwYXBlci50b3AgJiYgKHBhcGVyLnRvcCA9IGVsLnByZXYpO1xuICAgICAgICAgICAgZWwgPT0gcGFwZXIuYm90dG9tICYmIChwYXBlci5ib3R0b20gPSBlbC5uZXh0KTtcbiAgICAgICAgICAgIGVsLm5leHQgJiYgKGVsLm5leHQucHJldiA9IGVsLnByZXYpO1xuICAgICAgICAgICAgZWwucHJldiAmJiAoZWwucHJldi5uZXh0ID0gZWwubmV4dCk7XG4gICAgICAgIH0sXG4gICAgICAgIHRvZnJvbnQgPSBSLl90b2Zyb250ID0gZnVuY3Rpb24gKGVsLCBwYXBlcikge1xuICAgICAgICAgICAgaWYgKHBhcGVyLnRvcCA9PT0gZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ZWFyKGVsLCBwYXBlcik7XG4gICAgICAgICAgICBlbC5uZXh0ID0gbnVsbDtcbiAgICAgICAgICAgIGVsLnByZXYgPSBwYXBlci50b3A7XG4gICAgICAgICAgICBwYXBlci50b3AubmV4dCA9IGVsO1xuICAgICAgICAgICAgcGFwZXIudG9wID0gZWw7XG4gICAgICAgIH0sXG4gICAgICAgIHRvYmFjayA9IFIuX3RvYmFjayA9IGZ1bmN0aW9uIChlbCwgcGFwZXIpIHtcbiAgICAgICAgICAgIGlmIChwYXBlci5ib3R0b20gPT09IGVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGVhcihlbCwgcGFwZXIpO1xuICAgICAgICAgICAgZWwubmV4dCA9IHBhcGVyLmJvdHRvbTtcbiAgICAgICAgICAgIGVsLnByZXYgPSBudWxsO1xuICAgICAgICAgICAgcGFwZXIuYm90dG9tLnByZXYgPSBlbDtcbiAgICAgICAgICAgIHBhcGVyLmJvdHRvbSA9IGVsO1xuICAgICAgICB9LFxuICAgICAgICBpbnNlcnRhZnRlciA9IFIuX2luc2VydGFmdGVyID0gZnVuY3Rpb24gKGVsLCBlbDIsIHBhcGVyKSB7XG4gICAgICAgICAgICB0ZWFyKGVsLCBwYXBlcik7XG4gICAgICAgICAgICBlbDIgPT0gcGFwZXIudG9wICYmIChwYXBlci50b3AgPSBlbCk7XG4gICAgICAgICAgICBlbDIubmV4dCAmJiAoZWwyLm5leHQucHJldiA9IGVsKTtcbiAgICAgICAgICAgIGVsLm5leHQgPSBlbDIubmV4dDtcbiAgICAgICAgICAgIGVsLnByZXYgPSBlbDI7XG4gICAgICAgICAgICBlbDIubmV4dCA9IGVsO1xuICAgICAgICB9LFxuICAgICAgICBpbnNlcnRiZWZvcmUgPSBSLl9pbnNlcnRiZWZvcmUgPSBmdW5jdGlvbiAoZWwsIGVsMiwgcGFwZXIpIHtcbiAgICAgICAgICAgIHRlYXIoZWwsIHBhcGVyKTtcbiAgICAgICAgICAgIGVsMiA9PSBwYXBlci5ib3R0b20gJiYgKHBhcGVyLmJvdHRvbSA9IGVsKTtcbiAgICAgICAgICAgIGVsMi5wcmV2ICYmIChlbDIucHJldi5uZXh0ID0gZWwpO1xuICAgICAgICAgICAgZWwucHJldiA9IGVsMi5wcmV2O1xuICAgICAgICAgICAgZWwyLnByZXYgPSBlbDtcbiAgICAgICAgICAgIGVsLm5leHQgPSBlbDI7XG4gICAgICAgIH0sXG4gICAgICAgIC8qXFxcbiAgICAgICAgICogUmFwaGFlbC50b01hdHJpeFxuICAgICAgICAgWyBtZXRob2QgXVxuICAgICAgICAgKipcbiAgICAgICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgICAgICoqXG4gICAgICAgICAqIFJldHVybnMgbWF0cml4IG9mIHRyYW5zZm9ybWF0aW9ucyBhcHBsaWVkIHRvIGEgZ2l2ZW4gcGF0aFxuICAgICAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICAgICAtIHBhdGggKHN0cmluZykgcGF0aCBzdHJpbmdcbiAgICAgICAgIC0gdHJhbnNmb3JtIChzdHJpbmd8YXJyYXkpIHRyYW5zZm9ybWF0aW9uIHN0cmluZ1xuICAgICAgICAgPSAob2JqZWN0KSBATWF0cml4XG4gICAgICAgIFxcKi9cbiAgICAgICAgdG9NYXRyaXggPSBSLnRvTWF0cml4ID0gZnVuY3Rpb24gKHBhdGgsIHRyYW5zZm9ybSkge1xuICAgICAgICAgICAgdmFyIGJiID0gcGF0aERpbWVuc2lvbnMocGF0aCksXG4gICAgICAgICAgICAgICAgZWwgPSB7XG4gICAgICAgICAgICAgICAgICAgIF86IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogRVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBnZXRCQm94OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgZXh0cmFjdFRyYW5zZm9ybShlbCwgdHJhbnNmb3JtKTtcbiAgICAgICAgICAgIHJldHVybiBlbC5tYXRyaXg7XG4gICAgICAgIH0sXG4gICAgICAgIC8qXFxcbiAgICAgICAgICogUmFwaGFlbC50cmFuc2Zvcm1QYXRoXG4gICAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAgICAgKipcbiAgICAgICAgICogUmV0dXJucyBwYXRoIHRyYW5zZm9ybWVkIGJ5IGEgZ2l2ZW4gdHJhbnNmb3JtYXRpb25cbiAgICAgICAgID4gUGFyYW1ldGVyc1xuICAgICAgICAgLSBwYXRoIChzdHJpbmcpIHBhdGggc3RyaW5nXG4gICAgICAgICAtIHRyYW5zZm9ybSAoc3RyaW5nfGFycmF5KSB0cmFuc2Zvcm1hdGlvbiBzdHJpbmdcbiAgICAgICAgID0gKHN0cmluZykgcGF0aFxuICAgICAgICBcXCovXG4gICAgICAgIHRyYW5zZm9ybVBhdGggPSBSLnRyYW5zZm9ybVBhdGggPSBmdW5jdGlvbiAocGF0aCwgdHJhbnNmb3JtKSB7XG4gICAgICAgICAgICByZXR1cm4gbWFwUGF0aChwYXRoLCB0b01hdHJpeChwYXRoLCB0cmFuc2Zvcm0pKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXh0cmFjdFRyYW5zZm9ybSA9IFIuX2V4dHJhY3RUcmFuc2Zvcm0gPSBmdW5jdGlvbiAoZWwsIHRzdHIpIHtcbiAgICAgICAgICAgIGlmICh0c3RyID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWwuXy50cmFuc2Zvcm07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0c3RyID0gU3RyKHRzdHIpLnJlcGxhY2UoL1xcLnszfXxcXHUyMDI2L2csIGVsLl8udHJhbnNmb3JtIHx8IEUpO1xuICAgICAgICAgICAgdmFyIHRkYXRhID0gUi5wYXJzZVRyYW5zZm9ybVN0cmluZyh0c3RyKSxcbiAgICAgICAgICAgICAgICBkZWcgPSAwLFxuICAgICAgICAgICAgICAgIGR4ID0gMCxcbiAgICAgICAgICAgICAgICBkeSA9IDAsXG4gICAgICAgICAgICAgICAgc3ggPSAxLFxuICAgICAgICAgICAgICAgIHN5ID0gMSxcbiAgICAgICAgICAgICAgICBfID0gZWwuXyxcbiAgICAgICAgICAgICAgICBtID0gbmV3IE1hdHJpeDtcbiAgICAgICAgICAgIF8udHJhbnNmb3JtID0gdGRhdGEgfHwgW107XG4gICAgICAgICAgICBpZiAodGRhdGEpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSB0ZGF0YS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0ID0gdGRhdGFbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0bGVuID0gdC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kID0gU3RyKHRbMF0pLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBhYnNvbHV0ZSA9IHRbMF0gIT0gY29tbWFuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGludmVyID0gYWJzb2x1dGUgPyBtLmludmVydCgpIDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHgxLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTEsXG4gICAgICAgICAgICAgICAgICAgICAgICB4MixcbiAgICAgICAgICAgICAgICAgICAgICAgIHkyLFxuICAgICAgICAgICAgICAgICAgICAgICAgYmI7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21tYW5kID09IFwidFwiICYmIHRsZW4gPT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFic29sdXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDEgPSBpbnZlci54KDAsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkxID0gaW52ZXIueSgwLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4MiA9IGludmVyLngodFsxXSwgdFsyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTIgPSBpbnZlci55KHRbMV0sIHRbMl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJhbnNsYXRlKHgyIC0geDEsIHkyIC0geTEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRyYW5zbGF0ZSh0WzFdLCB0WzJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb21tYW5kID09IFwiclwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGxlbiA9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmIgPSBiYiB8fCBlbC5nZXRCQm94KDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0ucm90YXRlKHRbMV0sIGJiLnggKyBiYi53aWR0aCAvIDIsIGJiLnkgKyBiYi5oZWlnaHQgLyAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWcgKz0gdFsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGxlbiA9PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFic29sdXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgyID0gaW52ZXIueCh0WzJdLCB0WzNdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTIgPSBpbnZlci55KHRbMl0sIHRbM10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnJvdGF0ZSh0WzFdLCB4MiwgeTIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0ucm90YXRlKHRbMV0sIHRbMl0sIHRbM10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWcgKz0gdFsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb21tYW5kID09IFwic1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGxlbiA9PSAyIHx8IHRsZW4gPT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJiID0gYmIgfHwgZWwuZ2V0QkJveCgxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnNjYWxlKHRbMV0sIHRbdGxlbiAtIDFdLCBiYi54ICsgYmIud2lkdGggLyAyLCBiYi55ICsgYmIuaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ggKj0gdFsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeSAqPSB0W3RsZW4gLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGxlbiA9PSA1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFic29sdXRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgyID0gaW52ZXIueCh0WzNdLCB0WzRdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTIgPSBpbnZlci55KHRbM10sIHRbNF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnNjYWxlKHRbMV0sIHRbMl0sIHgyLCB5Mik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5zY2FsZSh0WzFdLCB0WzJdLCB0WzNdLCB0WzRdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ggKj0gdFsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeSAqPSB0WzJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT0gXCJtXCIgJiYgdGxlbiA9PSA3KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtLmFkZCh0WzFdLCB0WzJdLCB0WzNdLCB0WzRdLCB0WzVdLCB0WzZdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfLmRpcnR5VCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGVsLm1hdHJpeCA9IG07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKlxcXG4gICAgICAgICAgICAgKiBFbGVtZW50Lm1hdHJpeFxuICAgICAgICAgICAgIFsgcHJvcGVydHkgKG9iamVjdCkgXVxuICAgICAgICAgICAgICoqXG4gICAgICAgICAgICAgKiBLZWVwcyBATWF0cml4IG9iamVjdCwgd2hpY2ggcmVwcmVzZW50cyBlbGVtZW50IHRyYW5zZm9ybWF0aW9uXG4gICAgICAgICAgICBcXCovXG4gICAgICAgICAgICBlbC5tYXRyaXggPSBtO1xuXG4gICAgICAgICAgICBfLnN4ID0gc3g7XG4gICAgICAgICAgICBfLnN5ID0gc3k7XG4gICAgICAgICAgICBfLmRlZyA9IGRlZztcbiAgICAgICAgICAgIF8uZHggPSBkeCA9IG0uZTtcbiAgICAgICAgICAgIF8uZHkgPSBkeSA9IG0uZjtcblxuICAgICAgICAgICAgaWYgKHN4ID09IDEgJiYgc3kgPT0gMSAmJiAhZGVnICYmIF8uYmJveCkge1xuICAgICAgICAgICAgICAgIF8uYmJveC54ICs9ICtkeDtcbiAgICAgICAgICAgICAgICBfLmJib3gueSArPSArZHk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF8uZGlydHlUID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ2V0RW1wdHkgPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgdmFyIGwgPSBpdGVtWzBdO1xuICAgICAgICAgICAgc3dpdGNoIChsLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwidFwiOiByZXR1cm4gW2wsIDAsIDBdO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJtXCI6IHJldHVybiBbbCwgMSwgMCwgMCwgMSwgMCwgMF07XG4gICAgICAgICAgICAgICAgY2FzZSBcInJcIjogaWYgKGl0ZW0ubGVuZ3RoID09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtsLCAwLCBpdGVtWzJdLCBpdGVtWzNdXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2wsIDBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlIFwic1wiOiBpZiAoaXRlbS5sZW5ndGggPT0gNSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2wsIDEsIDEsIGl0ZW1bM10sIGl0ZW1bNF1dO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS5sZW5ndGggPT0gMykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2wsIDEsIDFdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbbCwgMV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlcXVhbGlzZVRyYW5zZm9ybSA9IFIuX2VxdWFsaXNlVHJhbnNmb3JtID0gZnVuY3Rpb24gKHQxLCB0Mikge1xuICAgICAgICAgICAgdDIgPSBTdHIodDIpLnJlcGxhY2UoL1xcLnszfXxcXHUyMDI2L2csIHQxKTtcbiAgICAgICAgICAgIHQxID0gUi5wYXJzZVRyYW5zZm9ybVN0cmluZyh0MSkgfHwgW107XG4gICAgICAgICAgICB0MiA9IFIucGFyc2VUcmFuc2Zvcm1TdHJpbmcodDIpIHx8IFtdO1xuICAgICAgICAgICAgdmFyIG1heGxlbmd0aCA9IG1tYXgodDEubGVuZ3RoLCB0Mi5sZW5ndGgpLFxuICAgICAgICAgICAgICAgIGZyb20gPSBbXSxcbiAgICAgICAgICAgICAgICB0byA9IFtdLFxuICAgICAgICAgICAgICAgIGkgPSAwLCBqLCBqaixcbiAgICAgICAgICAgICAgICB0dDEsIHR0MjtcbiAgICAgICAgICAgIGZvciAoOyBpIDwgbWF4bGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0dDEgPSB0MVtpXSB8fCBnZXRFbXB0eSh0MltpXSk7XG4gICAgICAgICAgICAgICAgdHQyID0gdDJbaV0gfHwgZ2V0RW1wdHkodHQxKTtcbiAgICAgICAgICAgICAgICBpZiAoKHR0MVswXSAhPSB0dDJbMF0pIHx8XG4gICAgICAgICAgICAgICAgICAgICh0dDFbMF0udG9Mb3dlckNhc2UoKSA9PSBcInJcIiAmJiAodHQxWzJdICE9IHR0MlsyXSB8fCB0dDFbM10gIT0gdHQyWzNdKSkgfHxcbiAgICAgICAgICAgICAgICAgICAgKHR0MVswXS50b0xvd2VyQ2FzZSgpID09IFwic1wiICYmICh0dDFbM10gIT0gdHQyWzNdIHx8IHR0MVs0XSAhPSB0dDJbNF0pKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmcm9tW2ldID0gW107XG4gICAgICAgICAgICAgICAgdG9baV0gPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAwLCBqaiA9IG1tYXgodHQxLmxlbmd0aCwgdHQyLmxlbmd0aCk7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIGogaW4gdHQxICYmIChmcm9tW2ldW2pdID0gdHQxW2pdKTtcbiAgICAgICAgICAgICAgICAgICAgaiBpbiB0dDIgJiYgKHRvW2ldW2pdID0gdHQyW2pdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZyb206IGZyb20sXG4gICAgICAgICAgICAgICAgdG86IHRvXG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgIFIuX2dldENvbnRhaW5lciA9IGZ1bmN0aW9uICh4LCB5LCB3LCBoKSB7XG4gICAgICAgIHZhciBjb250YWluZXI7XG4gICAgICAgIGNvbnRhaW5lciA9IGggPT0gbnVsbCAmJiAhUi5pcyh4LCBcIm9iamVjdFwiKSA/IGcuZG9jLmdldEVsZW1lbnRCeUlkKHgpIDogeDtcbiAgICAgICAgaWYgKGNvbnRhaW5lciA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbnRhaW5lci50YWdOYW1lKSB7XG4gICAgICAgICAgICBpZiAoeSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyOiBjb250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBjb250YWluZXIuc3R5bGUucGl4ZWxXaWR0aCB8fCBjb250YWluZXIub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogY29udGFpbmVyLnN0eWxlLnBpeGVsSGVpZ2h0IHx8IGNvbnRhaW5lci5vZmZzZXRIZWlnaHRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHksXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogd1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbnRhaW5lcjogMSxcbiAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgd2lkdGg6IHcsXG4gICAgICAgICAgICBoZWlnaHQ6IGhcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnBhdGhUb1JlbGF0aXZlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIENvbnZlcnRzIHBhdGggdG8gcmVsYXRpdmUgZm9ybVxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBwYXRoU3RyaW5nIChzdHJpbmd8YXJyYXkpIHBhdGggc3RyaW5nIG9yIGFycmF5IG9mIHNlZ21lbnRzXG4gICAgID0gKGFycmF5KSBhcnJheSBvZiBzZWdtZW50cy5cbiAgICBcXCovXG4gICAgUi5wYXRoVG9SZWxhdGl2ZSA9IHBhdGhUb1JlbGF0aXZlO1xuICAgIFIuX2VuZ2luZSA9IHt9O1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnBhdGgyY3VydmVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogQ29udmVydHMgcGF0aCB0byBhIG5ldyBwYXRoIHdoZXJlIGFsbCBzZWdtZW50cyBhcmUgY3ViaWMgYmV6aWVyIGN1cnZlcy5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gcGF0aFN0cmluZyAoc3RyaW5nfGFycmF5KSBwYXRoIHN0cmluZyBvciBhcnJheSBvZiBzZWdtZW50c1xuICAgICA9IChhcnJheSkgYXJyYXkgb2Ygc2VnbWVudHMuXG4gICAgXFwqL1xuICAgIFIucGF0aDJjdXJ2ZSA9IHBhdGgyY3VydmU7XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwubWF0cml4XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIFJldHVybnMgbWF0cml4IGJhc2VkIG9uIGdpdmVuIHBhcmFtZXRlcnMuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGEgKG51bWJlcilcbiAgICAgLSBiIChudW1iZXIpXG4gICAgIC0gYyAobnVtYmVyKVxuICAgICAtIGQgKG51bWJlcilcbiAgICAgLSBlIChudW1iZXIpXG4gICAgIC0gZiAobnVtYmVyKVxuICAgICA9IChvYmplY3QpIEBNYXRyaXhcbiAgICBcXCovXG4gICAgUi5tYXRyaXggPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgZSwgZikge1xuICAgICAgICByZXR1cm4gbmV3IE1hdHJpeChhLCBiLCBjLCBkLCBlLCBmKTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIE1hdHJpeChhLCBiLCBjLCBkLCBlLCBmKSB7XG4gICAgICAgIGlmIChhICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuYSA9ICthO1xuICAgICAgICAgICAgdGhpcy5iID0gK2I7XG4gICAgICAgICAgICB0aGlzLmMgPSArYztcbiAgICAgICAgICAgIHRoaXMuZCA9ICtkO1xuICAgICAgICAgICAgdGhpcy5lID0gK2U7XG4gICAgICAgICAgICB0aGlzLmYgPSArZjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYSA9IDE7XG4gICAgICAgICAgICB0aGlzLmIgPSAwO1xuICAgICAgICAgICAgdGhpcy5jID0gMDtcbiAgICAgICAgICAgIHRoaXMuZCA9IDE7XG4gICAgICAgICAgICB0aGlzLmUgPSAwO1xuICAgICAgICAgICAgdGhpcy5mID0gMDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAoZnVuY3Rpb24gKG1hdHJpeHByb3RvKSB7XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogTWF0cml4LmFkZFxuICAgICAgICAgWyBtZXRob2QgXVxuICAgICAgICAgKipcbiAgICAgICAgICogQWRkcyBnaXZlbiBtYXRyaXggdG8gZXhpc3Rpbmcgb25lLlxuICAgICAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICAgICAtIGEgKG51bWJlcilcbiAgICAgICAgIC0gYiAobnVtYmVyKVxuICAgICAgICAgLSBjIChudW1iZXIpXG4gICAgICAgICAtIGQgKG51bWJlcilcbiAgICAgICAgIC0gZSAobnVtYmVyKVxuICAgICAgICAgLSBmIChudW1iZXIpXG4gICAgICAgICBvclxuICAgICAgICAgLSBtYXRyaXggKG9iamVjdCkgQE1hdHJpeFxuICAgICAgICBcXCovXG4gICAgICAgIG1hdHJpeHByb3RvLmFkZCA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkLCBlLCBmKSB7XG4gICAgICAgICAgICB2YXIgb3V0ID0gW1tdLCBbXSwgW11dLFxuICAgICAgICAgICAgICAgIG0gPSBbW3RoaXMuYSwgdGhpcy5jLCB0aGlzLmVdLCBbdGhpcy5iLCB0aGlzLmQsIHRoaXMuZl0sIFswLCAwLCAxXV0sXG4gICAgICAgICAgICAgICAgbWF0cml4ID0gW1thLCBjLCBlXSwgW2IsIGQsIGZdLCBbMCwgMCwgMV1dLFxuICAgICAgICAgICAgICAgIHgsIHksIHosIHJlcztcblxuICAgICAgICAgICAgaWYgKGEgJiYgYSBpbnN0YW5jZW9mIE1hdHJpeCkge1xuICAgICAgICAgICAgICAgIG1hdHJpeCA9IFtbYS5hLCBhLmMsIGEuZV0sIFthLmIsIGEuZCwgYS5mXSwgWzAsIDAsIDFdXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh4ID0gMDsgeCA8IDM7IHgrKykge1xuICAgICAgICAgICAgICAgIGZvciAoeSA9IDA7IHkgPCAzOyB5KyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh6ID0gMDsgeiA8IDM7IHorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzICs9IG1beF1bel0gKiBtYXRyaXhbel1beV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb3V0W3hdW3ldID0gcmVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYSA9IG91dFswXVswXTtcbiAgICAgICAgICAgIHRoaXMuYiA9IG91dFsxXVswXTtcbiAgICAgICAgICAgIHRoaXMuYyA9IG91dFswXVsxXTtcbiAgICAgICAgICAgIHRoaXMuZCA9IG91dFsxXVsxXTtcbiAgICAgICAgICAgIHRoaXMuZSA9IG91dFswXVsyXTtcbiAgICAgICAgICAgIHRoaXMuZiA9IG91dFsxXVsyXTtcbiAgICAgICAgfTtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBNYXRyaXguaW52ZXJ0XG4gICAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBSZXR1cm5zIGludmVydGVkIHZlcnNpb24gb2YgdGhlIG1hdHJpeFxuICAgICAgICAgPSAob2JqZWN0KSBATWF0cml4XG4gICAgICAgIFxcKi9cbiAgICAgICAgbWF0cml4cHJvdG8uaW52ZXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG1lID0gdGhpcyxcbiAgICAgICAgICAgICAgICB4ID0gbWUuYSAqIG1lLmQgLSBtZS5iICogbWUuYztcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWF0cml4KG1lLmQgLyB4LCAtbWUuYiAvIHgsIC1tZS5jIC8geCwgbWUuYSAvIHgsIChtZS5jICogbWUuZiAtIG1lLmQgKiBtZS5lKSAvIHgsIChtZS5iICogbWUuZSAtIG1lLmEgKiBtZS5mKSAvIHgpO1xuICAgICAgICB9O1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIE1hdHJpeC5jbG9uZVxuICAgICAgICAgWyBtZXRob2QgXVxuICAgICAgICAgKipcbiAgICAgICAgICogUmV0dXJucyBjb3B5IG9mIHRoZSBtYXRyaXhcbiAgICAgICAgID0gKG9iamVjdCkgQE1hdHJpeFxuICAgICAgICBcXCovXG4gICAgICAgIG1hdHJpeHByb3RvLmNsb25lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXgodGhpcy5hLCB0aGlzLmIsIHRoaXMuYywgdGhpcy5kLCB0aGlzLmUsIHRoaXMuZik7XG4gICAgICAgIH07XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogTWF0cml4LnRyYW5zbGF0ZVxuICAgICAgICAgWyBtZXRob2QgXVxuICAgICAgICAgKipcbiAgICAgICAgICogVHJhbnNsYXRlIHRoZSBtYXRyaXhcbiAgICAgICAgID4gUGFyYW1ldGVyc1xuICAgICAgICAgLSB4IChudW1iZXIpXG4gICAgICAgICAtIHkgKG51bWJlcilcbiAgICAgICAgXFwqL1xuICAgICAgICBtYXRyaXhwcm90by50cmFuc2xhdGUgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICAgICAgdGhpcy5hZGQoMSwgMCwgMCwgMSwgeCwgeSk7XG4gICAgICAgIH07XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogTWF0cml4LnNjYWxlXG4gICAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBTY2FsZXMgdGhlIG1hdHJpeFxuICAgICAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICAgICAtIHggKG51bWJlcilcbiAgICAgICAgIC0geSAobnVtYmVyKSAjb3B0aW9uYWxcbiAgICAgICAgIC0gY3ggKG51bWJlcikgI29wdGlvbmFsXG4gICAgICAgICAtIGN5IChudW1iZXIpICNvcHRpb25hbFxuICAgICAgICBcXCovXG4gICAgICAgIG1hdHJpeHByb3RvLnNjYWxlID0gZnVuY3Rpb24gKHgsIHksIGN4LCBjeSkge1xuICAgICAgICAgICAgeSA9PSBudWxsICYmICh5ID0geCk7XG4gICAgICAgICAgICAoY3ggfHwgY3kpICYmIHRoaXMuYWRkKDEsIDAsIDAsIDEsIGN4LCBjeSk7XG4gICAgICAgICAgICB0aGlzLmFkZCh4LCAwLCAwLCB5LCAwLCAwKTtcbiAgICAgICAgICAgIChjeCB8fCBjeSkgJiYgdGhpcy5hZGQoMSwgMCwgMCwgMSwgLWN4LCAtY3kpO1xuICAgICAgICB9O1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIE1hdHJpeC5yb3RhdGVcbiAgICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFJvdGF0ZXMgdGhlIG1hdHJpeFxuICAgICAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICAgICAtIGEgKG51bWJlcilcbiAgICAgICAgIC0geCAobnVtYmVyKVxuICAgICAgICAgLSB5IChudW1iZXIpXG4gICAgICAgIFxcKi9cbiAgICAgICAgbWF0cml4cHJvdG8ucm90YXRlID0gZnVuY3Rpb24gKGEsIHgsIHkpIHtcbiAgICAgICAgICAgIGEgPSBSLnJhZChhKTtcbiAgICAgICAgICAgIHggPSB4IHx8IDA7XG4gICAgICAgICAgICB5ID0geSB8fCAwO1xuICAgICAgICAgICAgdmFyIGNvcyA9ICttYXRoLmNvcyhhKS50b0ZpeGVkKDkpLFxuICAgICAgICAgICAgICAgIHNpbiA9ICttYXRoLnNpbihhKS50b0ZpeGVkKDkpO1xuICAgICAgICAgICAgdGhpcy5hZGQoY29zLCBzaW4sIC1zaW4sIGNvcywgeCwgeSk7XG4gICAgICAgICAgICB0aGlzLmFkZCgxLCAwLCAwLCAxLCAteCwgLXkpO1xuICAgICAgICB9O1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIE1hdHJpeC54XG4gICAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBSZXR1cm4geCBjb29yZGluYXRlIGZvciBnaXZlbiBwb2ludCBhZnRlciB0cmFuc2Zvcm1hdGlvbiBkZXNjcmliZWQgYnkgdGhlIG1hdHJpeC4gU2VlIGFsc28gQE1hdHJpeC55XG4gICAgICAgICA+IFBhcmFtZXRlcnNcbiAgICAgICAgIC0geCAobnVtYmVyKVxuICAgICAgICAgLSB5IChudW1iZXIpXG4gICAgICAgICA9IChudW1iZXIpIHhcbiAgICAgICAgXFwqL1xuICAgICAgICBtYXRyaXhwcm90by54ID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgICAgIHJldHVybiB4ICogdGhpcy5hICsgeSAqIHRoaXMuYyArIHRoaXMuZTtcbiAgICAgICAgfTtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBNYXRyaXgueVxuICAgICAgICAgWyBtZXRob2QgXVxuICAgICAgICAgKipcbiAgICAgICAgICogUmV0dXJuIHkgY29vcmRpbmF0ZSBmb3IgZ2l2ZW4gcG9pbnQgYWZ0ZXIgdHJhbnNmb3JtYXRpb24gZGVzY3JpYmVkIGJ5IHRoZSBtYXRyaXguIFNlZSBhbHNvIEBNYXRyaXgueFxuICAgICAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICAgICAtIHggKG51bWJlcilcbiAgICAgICAgIC0geSAobnVtYmVyKVxuICAgICAgICAgPSAobnVtYmVyKSB5XG4gICAgICAgIFxcKi9cbiAgICAgICAgbWF0cml4cHJvdG8ueSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgICAgICByZXR1cm4geCAqIHRoaXMuYiArIHkgKiB0aGlzLmQgKyB0aGlzLmY7XG4gICAgICAgIH07XG4gICAgICAgIG1hdHJpeHByb3RvLmdldCA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICByZXR1cm4gK3RoaXNbU3RyLmZyb21DaGFyQ29kZSg5NyArIGkpXS50b0ZpeGVkKDQpO1xuICAgICAgICB9O1xuICAgICAgICBtYXRyaXhwcm90by50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBSLnN2ZyA/XG4gICAgICAgICAgICAgICAgXCJtYXRyaXgoXCIgKyBbdGhpcy5nZXQoMCksIHRoaXMuZ2V0KDEpLCB0aGlzLmdldCgyKSwgdGhpcy5nZXQoMyksIHRoaXMuZ2V0KDQpLCB0aGlzLmdldCg1KV0uam9pbigpICsgXCIpXCIgOlxuICAgICAgICAgICAgICAgIFt0aGlzLmdldCgwKSwgdGhpcy5nZXQoMiksIHRoaXMuZ2V0KDEpLCB0aGlzLmdldCgzKSwgMCwgMF0uam9pbigpO1xuICAgICAgICB9O1xuICAgICAgICBtYXRyaXhwcm90by50b0ZpbHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBcInByb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5NYXRyaXgoTTExPVwiICsgdGhpcy5nZXQoMCkgK1xuICAgICAgICAgICAgICAgIFwiLCBNMTI9XCIgKyB0aGlzLmdldCgyKSArIFwiLCBNMjE9XCIgKyB0aGlzLmdldCgxKSArIFwiLCBNMjI9XCIgKyB0aGlzLmdldCgzKSArXG4gICAgICAgICAgICAgICAgXCIsIER4PVwiICsgdGhpcy5nZXQoNCkgKyBcIiwgRHk9XCIgKyB0aGlzLmdldCg1KSArIFwiLCBzaXppbmdtZXRob2Q9J2F1dG8gZXhwYW5kJylcIjtcbiAgICAgICAgfTtcbiAgICAgICAgbWF0cml4cHJvdG8ub2Zmc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIFt0aGlzLmUudG9GaXhlZCg0KSwgdGhpcy5mLnRvRml4ZWQoNCldO1xuICAgICAgICB9O1xuICAgICAgICBmdW5jdGlvbiBub3JtKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBhWzBdICogYVswXSArIGFbMV0gKiBhWzFdO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZShhKSB7XG4gICAgICAgICAgICB2YXIgbWFnID0gbWF0aC5zcXJ0KG5vcm0oYSkpO1xuICAgICAgICAgICAgYVswXSAmJiAoYVswXSAvPSBtYWcpO1xuICAgICAgICAgICAgYVsxXSAmJiAoYVsxXSAvPSBtYWcpO1xuICAgICAgICB9XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogTWF0cml4LnNwbGl0XG4gICAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBTcGxpdHMgbWF0cml4IGludG8gcHJpbWl0aXZlIHRyYW5zZm9ybWF0aW9uc1xuICAgICAgICAgPSAob2JqZWN0KSBpbiBmb3JtYXQ6XG4gICAgICAgICBvIGR4IChudW1iZXIpIHRyYW5zbGF0aW9uIGJ5IHhcbiAgICAgICAgIG8gZHkgKG51bWJlcikgdHJhbnNsYXRpb24gYnkgeVxuICAgICAgICAgbyBzY2FsZXggKG51bWJlcikgc2NhbGUgYnkgeFxuICAgICAgICAgbyBzY2FsZXkgKG51bWJlcikgc2NhbGUgYnkgeVxuICAgICAgICAgbyBzaGVhciAobnVtYmVyKSBzaGVhclxuICAgICAgICAgbyByb3RhdGUgKG51bWJlcikgcm90YXRpb24gaW4gZGVnXG4gICAgICAgICBvIGlzU2ltcGxlIChib29sZWFuKSBjb3VsZCBpdCBiZSByZXByZXNlbnRlZCB2aWEgc2ltcGxlIHRyYW5zZm9ybWF0aW9uc1xuICAgICAgICBcXCovXG4gICAgICAgIG1hdHJpeHByb3RvLnNwbGl0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG91dCA9IHt9O1xuICAgICAgICAgICAgLy8gdHJhbnNsYXRpb25cbiAgICAgICAgICAgIG91dC5keCA9IHRoaXMuZTtcbiAgICAgICAgICAgIG91dC5keSA9IHRoaXMuZjtcblxuICAgICAgICAgICAgLy8gc2NhbGUgYW5kIHNoZWFyXG4gICAgICAgICAgICB2YXIgcm93ID0gW1t0aGlzLmEsIHRoaXMuY10sIFt0aGlzLmIsIHRoaXMuZF1dO1xuICAgICAgICAgICAgb3V0LnNjYWxleCA9IG1hdGguc3FydChub3JtKHJvd1swXSkpO1xuICAgICAgICAgICAgbm9ybWFsaXplKHJvd1swXSk7XG5cbiAgICAgICAgICAgIG91dC5zaGVhciA9IHJvd1swXVswXSAqIHJvd1sxXVswXSArIHJvd1swXVsxXSAqIHJvd1sxXVsxXTtcbiAgICAgICAgICAgIHJvd1sxXSA9IFtyb3dbMV1bMF0gLSByb3dbMF1bMF0gKiBvdXQuc2hlYXIsIHJvd1sxXVsxXSAtIHJvd1swXVsxXSAqIG91dC5zaGVhcl07XG5cbiAgICAgICAgICAgIG91dC5zY2FsZXkgPSBtYXRoLnNxcnQobm9ybShyb3dbMV0pKTtcbiAgICAgICAgICAgIG5vcm1hbGl6ZShyb3dbMV0pO1xuICAgICAgICAgICAgb3V0LnNoZWFyIC89IG91dC5zY2FsZXk7XG5cbiAgICAgICAgICAgIC8vIHJvdGF0aW9uXG4gICAgICAgICAgICB2YXIgc2luID0gLXJvd1swXVsxXSxcbiAgICAgICAgICAgICAgICBjb3MgPSByb3dbMV1bMV07XG4gICAgICAgICAgICBpZiAoY29zIDwgMCkge1xuICAgICAgICAgICAgICAgIG91dC5yb3RhdGUgPSBSLmRlZyhtYXRoLmFjb3MoY29zKSk7XG4gICAgICAgICAgICAgICAgaWYgKHNpbiA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0LnJvdGF0ZSA9IDM2MCAtIG91dC5yb3RhdGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXQucm90YXRlID0gUi5kZWcobWF0aC5hc2luKHNpbikpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvdXQuaXNTaW1wbGUgPSAhK291dC5zaGVhci50b0ZpeGVkKDkpICYmIChvdXQuc2NhbGV4LnRvRml4ZWQoOSkgPT0gb3V0LnNjYWxleS50b0ZpeGVkKDkpIHx8ICFvdXQucm90YXRlKTtcbiAgICAgICAgICAgIG91dC5pc1N1cGVyU2ltcGxlID0gIStvdXQuc2hlYXIudG9GaXhlZCg5KSAmJiBvdXQuc2NhbGV4LnRvRml4ZWQoOSkgPT0gb3V0LnNjYWxleS50b0ZpeGVkKDkpICYmICFvdXQucm90YXRlO1xuICAgICAgICAgICAgb3V0Lm5vUm90YXRpb24gPSAhK291dC5zaGVhci50b0ZpeGVkKDkpICYmICFvdXQucm90YXRlO1xuICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfTtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBNYXRyaXgudG9UcmFuc2Zvcm1TdHJpbmdcbiAgICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFJldHVybiB0cmFuc2Zvcm0gc3RyaW5nIHRoYXQgcmVwcmVzZW50cyBnaXZlbiBtYXRyaXhcbiAgICAgICAgID0gKHN0cmluZykgdHJhbnNmb3JtIHN0cmluZ1xuICAgICAgICBcXCovXG4gICAgICAgIG1hdHJpeHByb3RvLnRvVHJhbnNmb3JtU3RyaW5nID0gZnVuY3Rpb24gKHNob3J0ZXIpIHtcbiAgICAgICAgICAgIHZhciBzID0gc2hvcnRlciB8fCB0aGlzW3NwbGl0XSgpO1xuICAgICAgICAgICAgaWYgKHMuaXNTaW1wbGUpIHtcbiAgICAgICAgICAgICAgICBzLnNjYWxleCA9ICtzLnNjYWxleC50b0ZpeGVkKDQpO1xuICAgICAgICAgICAgICAgIHMuc2NhbGV5ID0gK3Muc2NhbGV5LnRvRml4ZWQoNCk7XG4gICAgICAgICAgICAgICAgcy5yb3RhdGUgPSArcy5yb3RhdGUudG9GaXhlZCg0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gIChzLmR4IHx8IHMuZHkgPyBcInRcIiArIFtzLmR4LCBzLmR5XSA6IEUpICsgXG4gICAgICAgICAgICAgICAgICAgICAgICAocy5zY2FsZXggIT0gMSB8fCBzLnNjYWxleSAhPSAxID8gXCJzXCIgKyBbcy5zY2FsZXgsIHMuc2NhbGV5LCAwLCAwXSA6IEUpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChzLnJvdGF0ZSA/IFwiclwiICsgW3Mucm90YXRlLCAwLCAwXSA6IEUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJtXCIgKyBbdGhpcy5nZXQoMCksIHRoaXMuZ2V0KDEpLCB0aGlzLmdldCgyKSwgdGhpcy5nZXQoMyksIHRoaXMuZ2V0KDQpLCB0aGlzLmdldCg1KV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSkoTWF0cml4LnByb3RvdHlwZSk7XG5cbiAgICAvLyBXZWJLaXQgcmVuZGVyaW5nIGJ1ZyB3b3JrYXJvdW5kIG1ldGhvZFxuICAgIHZhciB2ZXJzaW9uID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvVmVyc2lvblxcLyguKj8pXFxzLykgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvQ2hyb21lXFwvKFxcZCspLyk7XG4gICAgaWYgKChuYXZpZ2F0b3IudmVuZG9yID09IFwiQXBwbGUgQ29tcHV0ZXIsIEluYy5cIikgJiYgKHZlcnNpb24gJiYgdmVyc2lvblsxXSA8IDQgfHwgbmF2aWdhdG9yLnBsYXRmb3JtLnNsaWNlKDAsIDIpID09IFwiaVBcIikgfHxcbiAgICAgICAgKG5hdmlnYXRvci52ZW5kb3IgPT0gXCJHb29nbGUgSW5jLlwiICYmIHZlcnNpb24gJiYgdmVyc2lvblsxXSA8IDgpKSB7XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogUGFwZXIuc2FmYXJpXG4gICAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBUaGVyZSBpcyBhbiBpbmNvbnZlbmllbnQgcmVuZGVyaW5nIGJ1ZyBpbiBTYWZhcmkgKFdlYktpdCk6XG4gICAgICAgICAqIHNvbWV0aW1lcyB0aGUgcmVuZGVyaW5nIHNob3VsZCBiZSBmb3JjZWQuXG4gICAgICAgICAqIFRoaXMgbWV0aG9kIHNob3VsZCBoZWxwIHdpdGggZGVhbGluZyB3aXRoIHRoaXMgYnVnLlxuICAgICAgICBcXCovXG4gICAgICAgIHBhcGVycHJvdG8uc2FmYXJpID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHJlY3QgPSB0aGlzLnJlY3QoLTk5LCAtOTksIHRoaXMud2lkdGggKyA5OSwgdGhpcy5oZWlnaHQgKyA5OSkuYXR0cih7c3Ryb2tlOiBcIm5vbmVcIn0pO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7cmVjdC5yZW1vdmUoKTt9KTtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwYXBlcnByb3RvLnNhZmFyaSA9IGZ1bjtcbiAgICB9XG4gXG4gICAgdmFyIHByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgfSxcbiAgICBwcmV2ZW50VG91Y2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9yaWdpbmFsRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9LFxuICAgIHN0b3BQcm9wYWdhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jYW5jZWxCdWJibGUgPSB0cnVlO1xuICAgIH0sXG4gICAgc3RvcFRvdWNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcmlnaW5hbEV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0sXG4gICAgYWRkRXZlbnQgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoZy5kb2MuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIHR5cGUsIGZuLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlYWxOYW1lID0gc3VwcG9ydHNUb3VjaCAmJiB0b3VjaE1hcFt0eXBlXSA/IHRvdWNoTWFwW3R5cGVdIDogdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZiA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsWSA9IGcuZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZy5kb2MuYm9keS5zY3JvbGxUb3AsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsWCA9IGcuZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IHx8IGcuZG9jLmJvZHkuc2Nyb2xsTGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ID0gZS5jbGllbnRYICsgc2Nyb2xsWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5ID0gZS5jbGllbnRZICsgc2Nyb2xsWTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1cHBvcnRzVG91Y2ggJiYgdG91Y2hNYXBbaGFzXSh0eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gZS50YXJnZXRUb3VjaGVzICYmIGUudGFyZ2V0VG91Y2hlcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0VG91Y2hlc1tpXS50YXJnZXQgPT0gb2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbGRlID0gZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZSA9IGUudGFyZ2V0VG91Y2hlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5vcmlnaW5hbEV2ZW50ID0gb2xkZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCA9IHByZXZlbnRUb3VjaDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24gPSBzdG9wVG91Y2g7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4uY2FsbChlbGVtZW50LCBlLCB4LCB5KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyKHJlYWxOYW1lLCBmLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIocmVhbE5hbWUsIGYsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAoZy5kb2MuYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCB0eXBlLCBmbiwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHZhciBmID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZSA9IGUgfHwgZy53aW4uZXZlbnQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzY3JvbGxZID0gZy5kb2MuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBnLmRvYy5ib2R5LnNjcm9sbFRvcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbFggPSBnLmRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCB8fCBnLmRvYy5ib2R5LnNjcm9sbExlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICB4ID0gZS5jbGllbnRYICsgc2Nyb2xsWCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgPSBlLmNsaWVudFkgKyBzY3JvbGxZO1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0ID0gZS5wcmV2ZW50RGVmYXVsdCB8fCBwcmV2ZW50RGVmYXVsdDtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24gPSBlLnN0b3BQcm9wYWdhdGlvbiB8fCBzdG9wUHJvcGFnYXRpb247XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmbi5jYWxsKGVsZW1lbnQsIGUsIHgsIHkpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgb2JqLmF0dGFjaEV2ZW50KFwib25cIiArIHR5cGUsIGYpO1xuICAgICAgICAgICAgICAgIHZhciBkZXRhY2hlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmRldGFjaEV2ZW50KFwib25cIiArIHR5cGUsIGYpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBkZXRhY2hlcjtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9KSgpLFxuICAgIGRyYWcgPSBbXSxcbiAgICBkcmFnTW92ZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciB4ID0gZS5jbGllbnRYLFxuICAgICAgICAgICAgeSA9IGUuY2xpZW50WSxcbiAgICAgICAgICAgIHNjcm9sbFkgPSBnLmRvYy5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGcuZG9jLmJvZHkuc2Nyb2xsVG9wLFxuICAgICAgICAgICAgc2Nyb2xsWCA9IGcuZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IHx8IGcuZG9jLmJvZHkuc2Nyb2xsTGVmdCxcbiAgICAgICAgICAgIGRyYWdpLFxuICAgICAgICAgICAgaiA9IGRyYWcubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoai0tKSB7XG4gICAgICAgICAgICBkcmFnaSA9IGRyYWdbal07XG4gICAgICAgICAgICBpZiAoc3VwcG9ydHNUb3VjaCkge1xuICAgICAgICAgICAgICAgIHZhciBpID0gZS50b3VjaGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgdG91Y2g7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgICAgICB0b3VjaCA9IGUudG91Y2hlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvdWNoLmlkZW50aWZpZXIgPT0gZHJhZ2kuZWwuX2RyYWcuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHggPSB0b3VjaC5jbGllbnRYO1xuICAgICAgICAgICAgICAgICAgICAgICAgeSA9IHRvdWNoLmNsaWVudFk7XG4gICAgICAgICAgICAgICAgICAgICAgICAoZS5vcmlnaW5hbEV2ZW50ID8gZS5vcmlnaW5hbEV2ZW50IDogZSkucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbm9kZSA9IGRyYWdpLmVsLm5vZGUsXG4gICAgICAgICAgICAgICAgbyxcbiAgICAgICAgICAgICAgICBuZXh0ID0gbm9kZS5uZXh0U2libGluZyxcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGUsXG4gICAgICAgICAgICAgICAgZGlzcGxheSA9IG5vZGUuc3R5bGUuZGlzcGxheTtcbiAgICAgICAgICAgIGcud2luLm9wZXJhICYmIHBhcmVudC5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgICAgIG5vZGUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgbyA9IGRyYWdpLmVsLnBhcGVyLmdldEVsZW1lbnRCeVBvaW50KHgsIHkpO1xuICAgICAgICAgICAgbm9kZS5zdHlsZS5kaXNwbGF5ID0gZGlzcGxheTtcbiAgICAgICAgICAgIGcud2luLm9wZXJhICYmIChuZXh0ID8gcGFyZW50Lmluc2VydEJlZm9yZShub2RlLCBuZXh0KSA6IHBhcmVudC5hcHBlbmRDaGlsZChub2RlKSk7XG4gICAgICAgICAgICBvICYmIGV2ZShcInJhcGhhZWwuZHJhZy5vdmVyLlwiICsgZHJhZ2kuZWwuaWQsIGRyYWdpLmVsLCBvKTtcbiAgICAgICAgICAgIHggKz0gc2Nyb2xsWDtcbiAgICAgICAgICAgIHkgKz0gc2Nyb2xsWTtcbiAgICAgICAgICAgIGV2ZShcInJhcGhhZWwuZHJhZy5tb3ZlLlwiICsgZHJhZ2kuZWwuaWQsIGRyYWdpLm1vdmVfc2NvcGUgfHwgZHJhZ2kuZWwsIHggLSBkcmFnaS5lbC5fZHJhZy54LCB5IC0gZHJhZ2kuZWwuX2RyYWcueSwgeCwgeSwgZSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRyYWdVcCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIFIudW5tb3VzZW1vdmUoZHJhZ01vdmUpLnVubW91c2V1cChkcmFnVXApO1xuICAgICAgICB2YXIgaSA9IGRyYWcubGVuZ3RoLFxuICAgICAgICAgICAgZHJhZ2k7XG4gICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgIGRyYWdpID0gZHJhZ1tpXTtcbiAgICAgICAgICAgIGRyYWdpLmVsLl9kcmFnID0ge307XG4gICAgICAgICAgICBldmUoXCJyYXBoYWVsLmRyYWcuZW5kLlwiICsgZHJhZ2kuZWwuaWQsIGRyYWdpLmVuZF9zY29wZSB8fCBkcmFnaS5zdGFydF9zY29wZSB8fCBkcmFnaS5tb3ZlX3Njb3BlIHx8IGRyYWdpLmVsLCBlKTtcbiAgICAgICAgfVxuICAgICAgICBkcmFnID0gW107XG4gICAgfSxcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5lbFxuICAgICBbIHByb3BlcnR5IChvYmplY3QpIF1cbiAgICAgKipcbiAgICAgKiBZb3UgY2FuIGFkZCB5b3VyIG93biBtZXRob2QgdG8gZWxlbWVudHMuIFRoaXMgaXMgdXNlZnVsbCB3aGVuIHlvdSB3YW50IHRvIGhhY2sgZGVmYXVsdCBmdW5jdGlvbmFsaXR5IG9yXG4gICAgICogd2FudCB0byB3cmFwIHNvbWUgY29tbW9uIHRyYW5zZm9ybWF0aW9uIG9yIGF0dHJpYnV0ZXMgaW4gb25lIG1ldGhvZC4gSW4gZGlmZmVyZW5jZSB0byBjYW52YXMgbWV0aG9kcyxcbiAgICAgKiB5b3UgY2FuIHJlZGVmaW5lIGVsZW1lbnQgbWV0aG9kIGF0IGFueSB0aW1lLiBFeHBlbmRpbmcgZWxlbWVudCBtZXRob2RzIHdvdWxkbuKAmXQgYWZmZWN0IHNldC5cbiAgICAgPiBVc2FnZVxuICAgICB8IFJhcGhhZWwuZWwucmVkID0gZnVuY3Rpb24gKCkge1xuICAgICB8ICAgICB0aGlzLmF0dHIoe2ZpbGw6IFwiI2YwMFwifSk7XG4gICAgIHwgfTtcbiAgICAgfCAvLyB0aGVuIHVzZSBpdFxuICAgICB8IHBhcGVyLmNpcmNsZSgxMDAsIDEwMCwgMjApLnJlZCgpO1xuICAgIFxcKi9cbiAgICBlbHByb3RvID0gUi5lbCA9IHt9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmNsaWNrXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXIgZm9yIGNsaWNrIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVuY2xpY2tcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlciBmb3IgY2xpY2sgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuZGJsY2xpY2tcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlciBmb3IgZG91YmxlIGNsaWNrIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVuZGJsY2xpY2tcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlciBmb3IgZG91YmxlIGNsaWNrIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIFxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50Lm1vdXNlZG93blxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBldmVudCBoYW5kbGVyIGZvciBtb3VzZWRvd24gZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5tb3VzZWRvd25cbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlciBmb3IgbW91c2Vkb3duIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIFxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50Lm1vdXNlbW92ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBldmVudCBoYW5kbGVyIGZvciBtb3VzZW1vdmUgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5tb3VzZW1vdmVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlciBmb3IgbW91c2Vtb3ZlIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIFxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50Lm1vdXNlb3V0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXIgZm9yIG1vdXNlb3V0IGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVubW91c2VvdXRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlciBmb3IgbW91c2VvdXQgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQubW91c2VvdmVyXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXIgZm9yIG1vdXNlb3ZlciBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bm1vdXNlb3ZlclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBldmVudCBoYW5kbGVyIGZvciBtb3VzZW92ZXIgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQubW91c2V1cFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBldmVudCBoYW5kbGVyIGZvciBtb3VzZXVwIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVubW91c2V1cFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBldmVudCBoYW5kbGVyIGZvciBtb3VzZXVwIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIFxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnRvdWNoc3RhcnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlciBmb3IgdG91Y2hzdGFydCBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bnRvdWNoc3RhcnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlciBmb3IgdG91Y2hzdGFydCBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC50b3VjaG1vdmVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlciBmb3IgdG91Y2htb3ZlIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVudG91Y2htb3ZlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGV2ZW50IGhhbmRsZXIgZm9yIHRvdWNobW92ZSBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC50b3VjaGVuZFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBldmVudCBoYW5kbGVyIGZvciB0b3VjaGVuZCBmb3IgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bnRvdWNoZW5kXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGV2ZW50IGhhbmRsZXIgZm9yIHRvdWNoZW5kIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIFxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnRvdWNoY2FuY2VsXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXIgZm9yIHRvdWNoY2FuY2VsIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVudG91Y2hjYW5jZWxcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlciBmb3IgdG91Y2hjYW5jZWwgZm9yIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZm9yICh2YXIgaSA9IGV2ZW50cy5sZW5ndGg7IGktLTspIHtcbiAgICAgICAgKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICAgICAgICAgIFJbZXZlbnROYW1lXSA9IGVscHJvdG9bZXZlbnROYW1lXSA9IGZ1bmN0aW9uIChmbiwgc2NvcGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoUi5pcyhmbiwgXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV2ZW50cyA9IHRoaXMuZXZlbnRzIHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV2ZW50cy5wdXNoKHtuYW1lOiBldmVudE5hbWUsIGY6IGZuLCB1bmJpbmQ6IGFkZEV2ZW50KHRoaXMuc2hhcGUgfHwgdGhpcy5ub2RlIHx8IGcuZG9jLCBldmVudE5hbWUsIGZuLCBzY29wZSB8fCB0aGlzKX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBSW1widW5cIiArIGV2ZW50TmFtZV0gPSBlbHByb3RvW1widW5cIiArIGV2ZW50TmFtZV0gPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICB2YXIgZXZlbnRzID0gdGhpcy5ldmVudHMgfHwgW10sXG4gICAgICAgICAgICAgICAgICAgIGwgPSBldmVudHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHdoaWxlIChsLS0pIGlmIChldmVudHNbbF0ubmFtZSA9PSBldmVudE5hbWUgJiYgZXZlbnRzW2xdLmYgPT0gZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzW2xdLnVuYmluZCgpO1xuICAgICAgICAgICAgICAgICAgICBldmVudHMuc3BsaWNlKGwsIDEpO1xuICAgICAgICAgICAgICAgICAgICAhZXZlbnRzLmxlbmd0aCAmJiBkZWxldGUgdGhpcy5ldmVudHM7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pKGV2ZW50c1tpXSk7XG4gICAgfVxuICAgIFxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmRhdGFcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgb3IgcmV0cmlldmVzIGdpdmVuIHZhbHVlIGFzb2NpYXRlZCB3aXRoIGdpdmVuIGtleS5cbiAgICAgKiogXG4gICAgICogU2VlIGFsc28gQEVsZW1lbnQucmVtb3ZlRGF0YVxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBrZXkgKHN0cmluZykga2V5IHRvIHN0b3JlIGRhdGFcbiAgICAgLSB2YWx1ZSAoYW55KSAjb3B0aW9uYWwgdmFsdWUgdG8gc3RvcmVcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgICAqIG9yLCBpZiB2YWx1ZSBpcyBub3Qgc3BlY2lmaWVkOlxuICAgICA9IChhbnkpIHZhbHVlXG4gICAgID4gVXNhZ2VcbiAgICAgfCBmb3IgKHZhciBpID0gMCwgaSA8IDUsIGkrKykge1xuICAgICB8ICAgICBwYXBlci5jaXJjbGUoMTAgKyAxNSAqIGksIDEwLCAxMClcbiAgICAgfCAgICAgICAgICAuYXR0cih7ZmlsbDogXCIjMDAwXCJ9KVxuICAgICB8ICAgICAgICAgIC5kYXRhKFwiaVwiLCBpKVxuICAgICB8ICAgICAgICAgIC5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgIHwgICAgICAgICAgICAgYWxlcnQodGhpcy5kYXRhKFwiaVwiKSk7XG4gICAgIHwgICAgICAgICAgfSk7XG4gICAgIHwgfVxuICAgIFxcKi9cbiAgICBlbHByb3RvLmRhdGEgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICB2YXIgZGF0YSA9IGVsZGF0YVt0aGlzLmlkXSA9IGVsZGF0YVt0aGlzLmlkXSB8fCB7fTtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgaWYgKFIuaXMoa2V5LCBcIm9iamVjdFwiKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4ga2V5KSBpZiAoa2V5W2hhc10oaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhKGksIGtleVtpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXZlKFwicmFwaGFlbC5kYXRhLmdldC5cIiArIHRoaXMuaWQsIHRoaXMsIGRhdGFba2V5XSwga2V5KTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgZGF0YVtrZXldID0gdmFsdWU7XG4gICAgICAgIGV2ZShcInJhcGhhZWwuZGF0YS5zZXQuXCIgKyB0aGlzLmlkLCB0aGlzLCB2YWx1ZSwga2V5KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5yZW1vdmVEYXRhXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCBhbiBlbGVtZW50IGJ5IGdpdmVuIGtleS5cbiAgICAgKiBJZiBrZXkgaXMgbm90IHByb3ZpZGVkLCByZW1vdmVzIGFsbCB0aGUgZGF0YSBvZiB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0ga2V5IChzdHJpbmcpICNvcHRpb25hbCBrZXlcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLnJlbW92ZURhdGEgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGlmIChrZXkgPT0gbnVsbCkge1xuICAgICAgICAgICAgZWxkYXRhW3RoaXMuaWRdID0ge307XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGRhdGFbdGhpcy5pZF0gJiYgZGVsZXRlIGVsZGF0YVt0aGlzLmlkXVtrZXldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmdldERhdGFcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHJpZXZlcyB0aGUgZWxlbWVudCBkYXRhXG4gICAgID0gKG9iamVjdCkgZGF0YVxuICAgIFxcKi9cbiAgICBlbHByb3RvLmdldERhdGEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBjbG9uZShlbGRhdGFbdGhpcy5pZF0gfHwge30pO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuaG92ZXJcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgZm9yIGhvdmVyIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gZl9pbiAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIGhvdmVyIGluXG4gICAgIC0gZl9vdXQgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciBob3ZlciBvdXRcbiAgICAgLSBpY29udGV4dCAob2JqZWN0KSAjb3B0aW9uYWwgY29udGV4dCBmb3IgaG92ZXIgaW4gaGFuZGxlclxuICAgICAtIG9jb250ZXh0IChvYmplY3QpICNvcHRpb25hbCBjb250ZXh0IGZvciBob3ZlciBvdXQgaGFuZGxlclxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8uaG92ZXIgPSBmdW5jdGlvbiAoZl9pbiwgZl9vdXQsIHNjb3BlX2luLCBzY29wZV9vdXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2VvdmVyKGZfaW4sIHNjb3BlX2luKS5tb3VzZW91dChmX291dCwgc2NvcGVfb3V0IHx8IHNjb3BlX2luKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVuaG92ZXJcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZXZlbnQgaGFuZGxlcnMgZm9yIGhvdmVyIGZvciB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gZl9pbiAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIGhvdmVyIGluXG4gICAgIC0gZl9vdXQgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciBob3ZlciBvdXRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLnVuaG92ZXIgPSBmdW5jdGlvbiAoZl9pbiwgZl9vdXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudW5tb3VzZW92ZXIoZl9pbikudW5tb3VzZW91dChmX291dCk7XG4gICAgfTtcbiAgICB2YXIgZHJhZ2dhYmxlID0gW107XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuZHJhZ1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgZHJhZyBvZiB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gb25tb3ZlIChmdW5jdGlvbikgaGFuZGxlciBmb3IgbW92aW5nXG4gICAgIC0gb25zdGFydCAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIGRyYWcgc3RhcnRcbiAgICAgLSBvbmVuZCAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIGRyYWcgZW5kXG4gICAgIC0gbWNvbnRleHQgKG9iamVjdCkgI29wdGlvbmFsIGNvbnRleHQgZm9yIG1vdmluZyBoYW5kbGVyXG4gICAgIC0gc2NvbnRleHQgKG9iamVjdCkgI29wdGlvbmFsIGNvbnRleHQgZm9yIGRyYWcgc3RhcnQgaGFuZGxlclxuICAgICAtIGVjb250ZXh0IChvYmplY3QpICNvcHRpb25hbCBjb250ZXh0IGZvciBkcmFnIGVuZCBoYW5kbGVyXG4gICAgICogQWRkaXRpb25hbHkgZm9sbG93aW5nIGBkcmFnYCBldmVudHMgd2lsbCBiZSB0cmlnZ2VyZWQ6IGBkcmFnLnN0YXJ0LjxpZD5gIG9uIHN0YXJ0LCBcbiAgICAgKiBgZHJhZy5lbmQuPGlkPmAgb24gZW5kIGFuZCBgZHJhZy5tb3ZlLjxpZD5gIG9uIGV2ZXJ5IG1vdmUuIFdoZW4gZWxlbWVudCB3aWxsIGJlIGRyYWdnZWQgb3ZlciBhbm90aGVyIGVsZW1lbnQgXG4gICAgICogYGRyYWcub3Zlci48aWQ+YCB3aWxsIGJlIGZpcmVkIGFzIHdlbGwuXG4gICAgICpcbiAgICAgKiBTdGFydCBldmVudCBhbmQgc3RhcnQgaGFuZGxlciB3aWxsIGJlIGNhbGxlZCBpbiBzcGVjaWZpZWQgY29udGV4dCBvciBpbiBjb250ZXh0IG9mIHRoZSBlbGVtZW50IHdpdGggZm9sbG93aW5nIHBhcmFtZXRlcnM6XG4gICAgIG8geCAobnVtYmVyKSB4IHBvc2l0aW9uIG9mIHRoZSBtb3VzZVxuICAgICBvIHkgKG51bWJlcikgeSBwb3NpdGlvbiBvZiB0aGUgbW91c2VcbiAgICAgbyBldmVudCAob2JqZWN0KSBET00gZXZlbnQgb2JqZWN0XG4gICAgICogTW92ZSBldmVudCBhbmQgbW92ZSBoYW5kbGVyIHdpbGwgYmUgY2FsbGVkIGluIHNwZWNpZmllZCBjb250ZXh0IG9yIGluIGNvbnRleHQgb2YgdGhlIGVsZW1lbnQgd2l0aCBmb2xsb3dpbmcgcGFyYW1ldGVyczpcbiAgICAgbyBkeCAobnVtYmVyKSBzaGlmdCBieSB4IGZyb20gdGhlIHN0YXJ0IHBvaW50XG4gICAgIG8gZHkgKG51bWJlcikgc2hpZnQgYnkgeSBmcm9tIHRoZSBzdGFydCBwb2ludFxuICAgICBvIHggKG51bWJlcikgeCBwb3NpdGlvbiBvZiB0aGUgbW91c2VcbiAgICAgbyB5IChudW1iZXIpIHkgcG9zaXRpb24gb2YgdGhlIG1vdXNlXG4gICAgIG8gZXZlbnQgKG9iamVjdCkgRE9NIGV2ZW50IG9iamVjdFxuICAgICAqIEVuZCBldmVudCBhbmQgZW5kIGhhbmRsZXIgd2lsbCBiZSBjYWxsZWQgaW4gc3BlY2lmaWVkIGNvbnRleHQgb3IgaW4gY29udGV4dCBvZiB0aGUgZWxlbWVudCB3aXRoIGZvbGxvd2luZyBwYXJhbWV0ZXJzOlxuICAgICBvIGV2ZW50IChvYmplY3QpIERPTSBldmVudCBvYmplY3RcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLmRyYWcgPSBmdW5jdGlvbiAob25tb3ZlLCBvbnN0YXJ0LCBvbmVuZCwgbW92ZV9zY29wZSwgc3RhcnRfc2NvcGUsIGVuZF9zY29wZSkge1xuICAgICAgICBmdW5jdGlvbiBzdGFydChlKSB7XG4gICAgICAgICAgICAoZS5vcmlnaW5hbEV2ZW50IHx8IGUpLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB2YXIgc2Nyb2xsWSA9IGcuZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZy5kb2MuYm9keS5zY3JvbGxUb3AsXG4gICAgICAgICAgICAgICAgc2Nyb2xsWCA9IGcuZG9jLmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IHx8IGcuZG9jLmJvZHkuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgIHRoaXMuX2RyYWcueCA9IGUuY2xpZW50WCArIHNjcm9sbFg7XG4gICAgICAgICAgICB0aGlzLl9kcmFnLnkgPSBlLmNsaWVudFkgKyBzY3JvbGxZO1xuICAgICAgICAgICAgdGhpcy5fZHJhZy5pZCA9IGUuaWRlbnRpZmllcjtcbiAgICAgICAgICAgICFkcmFnLmxlbmd0aCAmJiBSLm1vdXNlbW92ZShkcmFnTW92ZSkubW91c2V1cChkcmFnVXApO1xuICAgICAgICAgICAgZHJhZy5wdXNoKHtlbDogdGhpcywgbW92ZV9zY29wZTogbW92ZV9zY29wZSwgc3RhcnRfc2NvcGU6IHN0YXJ0X3Njb3BlLCBlbmRfc2NvcGU6IGVuZF9zY29wZX0pO1xuICAgICAgICAgICAgb25zdGFydCAmJiBldmUub24oXCJyYXBoYWVsLmRyYWcuc3RhcnQuXCIgKyB0aGlzLmlkLCBvbnN0YXJ0KTtcbiAgICAgICAgICAgIG9ubW92ZSAmJiBldmUub24oXCJyYXBoYWVsLmRyYWcubW92ZS5cIiArIHRoaXMuaWQsIG9ubW92ZSk7XG4gICAgICAgICAgICBvbmVuZCAmJiBldmUub24oXCJyYXBoYWVsLmRyYWcuZW5kLlwiICsgdGhpcy5pZCwgb25lbmQpO1xuICAgICAgICAgICAgZXZlKFwicmFwaGFlbC5kcmFnLnN0YXJ0LlwiICsgdGhpcy5pZCwgc3RhcnRfc2NvcGUgfHwgbW92ZV9zY29wZSB8fCB0aGlzLCBlLmNsaWVudFggKyBzY3JvbGxYLCBlLmNsaWVudFkgKyBzY3JvbGxZLCBlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9kcmFnID0ge307XG4gICAgICAgIGRyYWdnYWJsZS5wdXNoKHtlbDogdGhpcywgc3RhcnQ6IHN0YXJ0fSk7XG4gICAgICAgIHRoaXMubW91c2Vkb3duKHN0YXJ0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5vbkRyYWdPdmVyXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBTaG9ydGN1dCBmb3IgYXNzaWduaW5nIGV2ZW50IGhhbmRsZXIgZm9yIGBkcmFnLm92ZXIuPGlkPmAgZXZlbnQsIHdoZXJlIGlkIGlzIGlkIG9mIHRoZSBlbGVtZW50IChzZWUgQEVsZW1lbnQuaWQpLlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBmIChmdW5jdGlvbikgaGFuZGxlciBmb3IgZXZlbnQsIGZpcnN0IGFyZ3VtZW50IHdvdWxkIGJlIHRoZSBlbGVtZW50IHlvdSBhcmUgZHJhZ2dpbmcgb3ZlclxuICAgIFxcKi9cbiAgICBlbHByb3RvLm9uRHJhZ092ZXIgPSBmdW5jdGlvbiAoZikge1xuICAgICAgICBmID8gZXZlLm9uKFwicmFwaGFlbC5kcmFnLm92ZXIuXCIgKyB0aGlzLmlkLCBmKSA6IGV2ZS51bmJpbmQoXCJyYXBoYWVsLmRyYWcub3Zlci5cIiArIHRoaXMuaWQpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5kcmFnXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGFsbCBkcmFnIGV2ZW50IGhhbmRsZXJzIGZyb20gZ2l2ZW4gZWxlbWVudC5cbiAgICBcXCovXG4gICAgZWxwcm90by51bmRyYWcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpID0gZHJhZ2dhYmxlLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKGktLSkgaWYgKGRyYWdnYWJsZVtpXS5lbCA9PSB0aGlzKSB7XG4gICAgICAgICAgICB0aGlzLnVubW91c2Vkb3duKGRyYWdnYWJsZVtpXS5zdGFydCk7XG4gICAgICAgICAgICBkcmFnZ2FibGUuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgZXZlLnVuYmluZChcInJhcGhhZWwuZHJhZy4qLlwiICsgdGhpcy5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgIWRyYWdnYWJsZS5sZW5ndGggJiYgUi51bm1vdXNlbW92ZShkcmFnTW92ZSkudW5tb3VzZXVwKGRyYWdVcCk7XG4gICAgICAgIGRyYWcgPSBbXTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5jaXJjbGVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIERyYXdzIGEgY2lyY2xlLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSB4IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgY2VudHJlXG4gICAgIC0geSAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRyZVxuICAgICAtIHIgKG51bWJlcikgcmFkaXVzXG4gICAgID0gKG9iamVjdCkgUmFwaGHDq2wgZWxlbWVudCBvYmplY3Qgd2l0aCB0eXBlIOKAnGNpcmNsZeKAnVxuICAgICAqKlxuICAgICA+IFVzYWdlXG4gICAgIHwgdmFyIGMgPSBwYXBlci5jaXJjbGUoNTAsIDUwLCA0MCk7XG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8uY2lyY2xlID0gZnVuY3Rpb24gKHgsIHksIHIpIHtcbiAgICAgICAgdmFyIG91dCA9IFIuX2VuZ2luZS5jaXJjbGUodGhpcywgeCB8fCAwLCB5IHx8IDAsIHIgfHwgMCk7XG4gICAgICAgIHRoaXMuX19zZXRfXyAmJiB0aGlzLl9fc2V0X18ucHVzaChvdXQpO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnJlY3RcbiAgICAgWyBtZXRob2QgXVxuICAgICAqXG4gICAgICogRHJhd3MgYSByZWN0YW5nbGUuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHggKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSB0b3AgbGVmdCBjb3JuZXJcbiAgICAgLSB5IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgdG9wIGxlZnQgY29ybmVyXG4gICAgIC0gd2lkdGggKG51bWJlcikgd2lkdGhcbiAgICAgLSBoZWlnaHQgKG51bWJlcikgaGVpZ2h0XG4gICAgIC0gciAobnVtYmVyKSAjb3B0aW9uYWwgcmFkaXVzIGZvciByb3VuZGVkIGNvcm5lcnMsIGRlZmF1bHQgaXMgMFxuICAgICA9IChvYmplY3QpIFJhcGhhw6tsIGVsZW1lbnQgb2JqZWN0IHdpdGggdHlwZSDigJxyZWN04oCdXG4gICAgICoqXG4gICAgID4gVXNhZ2VcbiAgICAgfCAvLyByZWd1bGFyIHJlY3RhbmdsZVxuICAgICB8IHZhciBjID0gcGFwZXIucmVjdCgxMCwgMTAsIDUwLCA1MCk7XG4gICAgIHwgLy8gcmVjdGFuZ2xlIHdpdGggcm91bmRlZCBjb3JuZXJzXG4gICAgIHwgdmFyIGMgPSBwYXBlci5yZWN0KDQwLCA0MCwgNTAsIDUwLCAxMCk7XG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8ucmVjdCA9IGZ1bmN0aW9uICh4LCB5LCB3LCBoLCByKSB7XG4gICAgICAgIHZhciBvdXQgPSBSLl9lbmdpbmUucmVjdCh0aGlzLCB4IHx8IDAsIHkgfHwgMCwgdyB8fCAwLCBoIHx8IDAsIHIgfHwgMCk7XG4gICAgICAgIHRoaXMuX19zZXRfXyAmJiB0aGlzLl9fc2V0X18ucHVzaChvdXQpO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLmVsbGlwc2VcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIERyYXdzIGFuIGVsbGlwc2UuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHggKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSBjZW50cmVcbiAgICAgLSB5IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgY2VudHJlXG4gICAgIC0gcnggKG51bWJlcikgaG9yaXpvbnRhbCByYWRpdXNcbiAgICAgLSByeSAobnVtYmVyKSB2ZXJ0aWNhbCByYWRpdXNcbiAgICAgPSAob2JqZWN0KSBSYXBoYcOrbCBlbGVtZW50IG9iamVjdCB3aXRoIHR5cGUg4oCcZWxsaXBzZeKAnVxuICAgICAqKlxuICAgICA+IFVzYWdlXG4gICAgIHwgdmFyIGMgPSBwYXBlci5lbGxpcHNlKDUwLCA1MCwgNDAsIDIwKTtcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5lbGxpcHNlID0gZnVuY3Rpb24gKHgsIHksIHJ4LCByeSkge1xuICAgICAgICB2YXIgb3V0ID0gUi5fZW5naW5lLmVsbGlwc2UodGhpcywgeCB8fCAwLCB5IHx8IDAsIHJ4IHx8IDAsIHJ5IHx8IDApO1xuICAgICAgICB0aGlzLl9fc2V0X18gJiYgdGhpcy5fX3NldF9fLnB1c2gob3V0KTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5wYXRoXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIGEgcGF0aCBlbGVtZW50IGJ5IGdpdmVuIHBhdGggZGF0YSBzdHJpbmcuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHBhdGhTdHJpbmcgKHN0cmluZykgI29wdGlvbmFsIHBhdGggc3RyaW5nIGluIFNWRyBmb3JtYXQuXG4gICAgICogUGF0aCBzdHJpbmcgY29uc2lzdHMgb2Ygb25lLWxldHRlciBjb21tYW5kcywgZm9sbG93ZWQgYnkgY29tbWEgc2VwcmFyYXRlZCBhcmd1bWVudHMgaW4gbnVtZXJjYWwgZm9ybS4gRXhhbXBsZTpcbiAgICAgfCBcIk0xMCwyMEwzMCw0MFwiXG4gICAgICogSGVyZSB3ZSBjYW4gc2VlIHR3byBjb21tYW5kczog4oCcTeKAnSwgd2l0aCBhcmd1bWVudHMgYCgxMCwgMjApYCBhbmQg4oCcTOKAnSB3aXRoIGFyZ3VtZW50cyBgKDMwLCA0MClgLiBVcHBlciBjYXNlIGxldHRlciBtZWFuIGNvbW1hbmQgaXMgYWJzb2x1dGUsIGxvd2VyIGNhc2XigJRyZWxhdGl2ZS5cbiAgICAgKlxuICAgICAjIDxwPkhlcmUgaXMgc2hvcnQgbGlzdCBvZiBjb21tYW5kcyBhdmFpbGFibGUsIGZvciBtb3JlIGRldGFpbHMgc2VlIDxhIGhyZWY9XCJodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvcGF0aHMuaHRtbCNQYXRoRGF0YVwiIHRpdGxlPVwiRGV0YWlscyBvZiBhIHBhdGgncyBkYXRhIGF0dHJpYnV0ZSdzIGZvcm1hdCBhcmUgZGVzY3JpYmVkIGluIHRoZSBTVkcgc3BlY2lmaWNhdGlvbi5cIj5TVkcgcGF0aCBzdHJpbmcgZm9ybWF0PC9hPi48L3A+XG4gICAgICMgPHRhYmxlPjx0aGVhZD48dHI+PHRoPkNvbW1hbmQ8L3RoPjx0aD5OYW1lPC90aD48dGg+UGFyYW1ldGVyczwvdGg+PC90cj48L3RoZWFkPjx0Ym9keT5cbiAgICAgIyA8dHI+PHRkPk08L3RkPjx0ZD5tb3ZldG88L3RkPjx0ZD4oeCB5KSs8L3RkPjwvdHI+XG4gICAgICMgPHRyPjx0ZD5aPC90ZD48dGQ+Y2xvc2VwYXRoPC90ZD48dGQ+KG5vbmUpPC90ZD48L3RyPlxuICAgICAjIDx0cj48dGQ+TDwvdGQ+PHRkPmxpbmV0bzwvdGQ+PHRkPih4IHkpKzwvdGQ+PC90cj5cbiAgICAgIyA8dHI+PHRkPkg8L3RkPjx0ZD5ob3Jpem9udGFsIGxpbmV0bzwvdGQ+PHRkPngrPC90ZD48L3RyPlxuICAgICAjIDx0cj48dGQ+VjwvdGQ+PHRkPnZlcnRpY2FsIGxpbmV0bzwvdGQ+PHRkPnkrPC90ZD48L3RyPlxuICAgICAjIDx0cj48dGQ+QzwvdGQ+PHRkPmN1cnZldG88L3RkPjx0ZD4oeDEgeTEgeDIgeTIgeCB5KSs8L3RkPjwvdHI+XG4gICAgICMgPHRyPjx0ZD5TPC90ZD48dGQ+c21vb3RoIGN1cnZldG88L3RkPjx0ZD4oeDIgeTIgeCB5KSs8L3RkPjwvdHI+XG4gICAgICMgPHRyPjx0ZD5RPC90ZD48dGQ+cXVhZHJhdGljIELDqXppZXIgY3VydmV0bzwvdGQ+PHRkPih4MSB5MSB4IHkpKzwvdGQ+PC90cj5cbiAgICAgIyA8dHI+PHRkPlQ8L3RkPjx0ZD5zbW9vdGggcXVhZHJhdGljIELDqXppZXIgY3VydmV0bzwvdGQ+PHRkPih4IHkpKzwvdGQ+PC90cj5cbiAgICAgIyA8dHI+PHRkPkE8L3RkPjx0ZD5lbGxpcHRpY2FsIGFyYzwvdGQ+PHRkPihyeCByeSB4LWF4aXMtcm90YXRpb24gbGFyZ2UtYXJjLWZsYWcgc3dlZXAtZmxhZyB4IHkpKzwvdGQ+PC90cj5cbiAgICAgIyA8dHI+PHRkPlI8L3RkPjx0ZD48YSBocmVmPVwiaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DYXRtdWxs4oCTUm9tX3NwbGluZSNDYXRtdWxsLkUyLjgwLjkzUm9tX3NwbGluZVwiPkNhdG11bGwtUm9tIGN1cnZldG88L2E+KjwvdGQ+PHRkPngxIHkxICh4IHkpKzwvdGQ+PC90cj48L3Rib2R5PjwvdGFibGU+XG4gICAgICogKiDigJxDYXRtdWxsLVJvbSBjdXJ2ZXRv4oCdIGlzIGEgbm90IHN0YW5kYXJkIFNWRyBjb21tYW5kIGFuZCBhZGRlZCBpbiAyLjAgdG8gbWFrZSBsaWZlIGVhc2llci5cbiAgICAgKiBOb3RlOiB0aGVyZSBpcyBhIHNwZWNpYWwgY2FzZSB3aGVuIHBhdGggY29uc2lzdCBvZiBqdXN0IHRocmVlIGNvbW1hbmRzOiDigJxNMTAsMTBS4oCmeuKAnS4gSW4gdGhpcyBjYXNlIHBhdGggd2lsbCBzbW9vdGhseSBjb25uZWN0cyB0byBpdHMgYmVnaW5uaW5nLlxuICAgICA+IFVzYWdlXG4gICAgIHwgdmFyIGMgPSBwYXBlci5wYXRoKFwiTTEwIDEwTDkwIDkwXCIpO1xuICAgICB8IC8vIGRyYXcgYSBkaWFnb25hbCBsaW5lOlxuICAgICB8IC8vIG1vdmUgdG8gMTAsMTAsIGxpbmUgdG8gOTAsOTBcbiAgICAgKiBGb3IgZXhhbXBsZSBvZiBwYXRoIHN0cmluZ3MsIGNoZWNrIG91dCB0aGVzZSBpY29uczogaHR0cDovL3JhcGhhZWxqcy5jb20vaWNvbnMvXG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8ucGF0aCA9IGZ1bmN0aW9uIChwYXRoU3RyaW5nKSB7XG4gICAgICAgIHBhdGhTdHJpbmcgJiYgIVIuaXMocGF0aFN0cmluZywgc3RyaW5nKSAmJiAhUi5pcyhwYXRoU3RyaW5nWzBdLCBhcnJheSkgJiYgKHBhdGhTdHJpbmcgKz0gRSk7XG4gICAgICAgIHZhciBvdXQgPSBSLl9lbmdpbmUucGF0aChSLmZvcm1hdFthcHBseV0oUiwgYXJndW1lbnRzKSwgdGhpcyk7XG4gICAgICAgIHRoaXMuX19zZXRfXyAmJiB0aGlzLl9fc2V0X18ucHVzaChvdXQpO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLmltYWdlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBFbWJlZHMgYW4gaW1hZ2UgaW50byB0aGUgc3VyZmFjZS5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gc3JjIChzdHJpbmcpIFVSSSBvZiB0aGUgc291cmNlIGltYWdlXG4gICAgIC0geCAobnVtYmVyKSB4IGNvb3JkaW5hdGUgcG9zaXRpb25cbiAgICAgLSB5IChudW1iZXIpIHkgY29vcmRpbmF0ZSBwb3NpdGlvblxuICAgICAtIHdpZHRoIChudW1iZXIpIHdpZHRoIG9mIHRoZSBpbWFnZVxuICAgICAtIGhlaWdodCAobnVtYmVyKSBoZWlnaHQgb2YgdGhlIGltYWdlXG4gICAgID0gKG9iamVjdCkgUmFwaGHDq2wgZWxlbWVudCBvYmplY3Qgd2l0aCB0eXBlIOKAnGltYWdl4oCdXG4gICAgICoqXG4gICAgID4gVXNhZ2VcbiAgICAgfCB2YXIgYyA9IHBhcGVyLmltYWdlKFwiYXBwbGUucG5nXCIsIDEwLCAxMCwgODAsIDgwKTtcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5pbWFnZSA9IGZ1bmN0aW9uIChzcmMsIHgsIHksIHcsIGgpIHtcbiAgICAgICAgdmFyIG91dCA9IFIuX2VuZ2luZS5pbWFnZSh0aGlzLCBzcmMgfHwgXCJhYm91dDpibGFua1wiLCB4IHx8IDAsIHkgfHwgMCwgdyB8fCAwLCBoIHx8IDApO1xuICAgICAgICB0aGlzLl9fc2V0X18gJiYgdGhpcy5fX3NldF9fLnB1c2gob3V0KTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci50ZXh0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBEcmF3cyBhIHRleHQgc3RyaW5nLiBJZiB5b3UgbmVlZCBsaW5lIGJyZWFrcywgcHV0IOKAnFxcbuKAnSBpbiB0aGUgc3RyaW5nLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSB4IChudW1iZXIpIHggY29vcmRpbmF0ZSBwb3NpdGlvblxuICAgICAtIHkgKG51bWJlcikgeSBjb29yZGluYXRlIHBvc2l0aW9uXG4gICAgIC0gdGV4dCAoc3RyaW5nKSBUaGUgdGV4dCBzdHJpbmcgdG8gZHJhd1xuICAgICA9IChvYmplY3QpIFJhcGhhw6tsIGVsZW1lbnQgb2JqZWN0IHdpdGggdHlwZSDigJx0ZXh04oCdXG4gICAgICoqXG4gICAgID4gVXNhZ2VcbiAgICAgfCB2YXIgdCA9IHBhcGVyLnRleHQoNTAsIDUwLCBcIlJhcGhhw6tsXFxua2lja3NcXG5idXR0IVwiKTtcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by50ZXh0ID0gZnVuY3Rpb24gKHgsIHksIHRleHQpIHtcbiAgICAgICAgdmFyIG91dCA9IFIuX2VuZ2luZS50ZXh0KHRoaXMsIHggfHwgMCwgeSB8fCAwLCBTdHIodGV4dCkpO1xuICAgICAgICB0aGlzLl9fc2V0X18gJiYgdGhpcy5fX3NldF9fLnB1c2gob3V0KTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5zZXRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgYXJyYXktbGlrZSBvYmplY3QgdG8ga2VlcCBhbmQgb3BlcmF0ZSBzZXZlcmFsIGVsZW1lbnRzIGF0IG9uY2UuXG4gICAgICogV2FybmluZzogaXQgZG9lc27igJl0IGNyZWF0ZSBhbnkgZWxlbWVudHMgZm9yIGl0c2VsZiBpbiB0aGUgcGFnZSwgaXQganVzdCBncm91cHMgZXhpc3RpbmcgZWxlbWVudHMuXG4gICAgICogU2V0cyBhY3QgYXMgcHNldWRvIGVsZW1lbnRzIOKAlCBhbGwgbWV0aG9kcyBhdmFpbGFibGUgdG8gYW4gZWxlbWVudCBjYW4gYmUgdXNlZCBvbiBhIHNldC5cbiAgICAgPSAob2JqZWN0KSBhcnJheS1saWtlIG9iamVjdCB0aGF0IHJlcHJlc2VudHMgc2V0IG9mIGVsZW1lbnRzXG4gICAgICoqXG4gICAgID4gVXNhZ2VcbiAgICAgfCB2YXIgc3QgPSBwYXBlci5zZXQoKTtcbiAgICAgfCBzdC5wdXNoKFxuICAgICB8ICAgICBwYXBlci5jaXJjbGUoMTAsIDEwLCA1KSxcbiAgICAgfCAgICAgcGFwZXIuY2lyY2xlKDMwLCAxMCwgNSlcbiAgICAgfCApO1xuICAgICB8IHN0LmF0dHIoe2ZpbGw6IFwicmVkXCJ9KTsgLy8gY2hhbmdlcyB0aGUgZmlsbCBvZiBib3RoIGNpcmNsZXNcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5zZXQgPSBmdW5jdGlvbiAoaXRlbXNBcnJheSkge1xuICAgICAgICAhUi5pcyhpdGVtc0FycmF5LCBcImFycmF5XCIpICYmIChpdGVtc0FycmF5ID0gQXJyYXkucHJvdG90eXBlLnNwbGljZS5jYWxsKGFyZ3VtZW50cywgMCwgYXJndW1lbnRzLmxlbmd0aCkpO1xuICAgICAgICB2YXIgb3V0ID0gbmV3IFNldChpdGVtc0FycmF5KTtcbiAgICAgICAgdGhpcy5fX3NldF9fICYmIHRoaXMuX19zZXRfXy5wdXNoKG91dCk7XG4gICAgICAgIG91dFtcInBhcGVyXCJdID0gdGhpcztcbiAgICAgICAgb3V0W1widHlwZVwiXSA9IFwic2V0XCI7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuc2V0U3RhcnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgQFBhcGVyLnNldC4gQWxsIGVsZW1lbnRzIHRoYXQgd2lsbCBiZSBjcmVhdGVkIGFmdGVyIGNhbGxpbmcgdGhpcyBtZXRob2QgYW5kIGJlZm9yZSBjYWxsaW5nXG4gICAgICogQFBhcGVyLnNldEZpbmlzaCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBzZXQuXG4gICAgICoqXG4gICAgID4gVXNhZ2VcbiAgICAgfCBwYXBlci5zZXRTdGFydCgpO1xuICAgICB8IHBhcGVyLmNpcmNsZSgxMCwgMTAsIDUpLFxuICAgICB8IHBhcGVyLmNpcmNsZSgzMCwgMTAsIDUpXG4gICAgIHwgdmFyIHN0ID0gcGFwZXIuc2V0RmluaXNoKCk7XG4gICAgIHwgc3QuYXR0cih7ZmlsbDogXCJyZWRcIn0pOyAvLyBjaGFuZ2VzIHRoZSBmaWxsIG9mIGJvdGggY2lyY2xlc1xuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLnNldFN0YXJ0ID0gZnVuY3Rpb24gKHNldCkge1xuICAgICAgICB0aGlzLl9fc2V0X18gPSBzZXQgfHwgdGhpcy5zZXQoKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5zZXRGaW5pc2hcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFNlZSBAUGFwZXIuc2V0U3RhcnQuIFRoaXMgbWV0aG9kIGZpbmlzaGVzIGNhdGNoaW5nIGFuZCByZXR1cm5zIHJlc3VsdGluZyBzZXQuXG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgc2V0XG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8uc2V0RmluaXNoID0gZnVuY3Rpb24gKHNldCkge1xuICAgICAgICB2YXIgb3V0ID0gdGhpcy5fX3NldF9fO1xuICAgICAgICBkZWxldGUgdGhpcy5fX3NldF9fO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnNldFNpemVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIElmIHlvdSBuZWVkIHRvIGNoYW5nZSBkaW1lbnNpb25zIG9mIHRoZSBjYW52YXMgY2FsbCB0aGlzIG1ldGhvZFxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSB3aWR0aCAobnVtYmVyKSBuZXcgd2lkdGggb2YgdGhlIGNhbnZhc1xuICAgICAtIGhlaWdodCAobnVtYmVyKSBuZXcgaGVpZ2h0IG9mIHRoZSBjYW52YXNcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5zZXRTaXplID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIFIuX2VuZ2luZS5zZXRTaXplLmNhbGwodGhpcywgd2lkdGgsIGhlaWdodCk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuc2V0Vmlld0JveFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogU2V0cyB0aGUgdmlldyBib3ggb2YgdGhlIHBhcGVyLiBQcmFjdGljYWxseSBpdCBnaXZlcyB5b3UgYWJpbGl0eSB0byB6b29tIGFuZCBwYW4gd2hvbGUgcGFwZXIgc3VyZmFjZSBieSBcbiAgICAgKiBzcGVjaWZ5aW5nIG5ldyBib3VuZGFyaWVzLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSB4IChudW1iZXIpIG5ldyB4IHBvc2l0aW9uLCBkZWZhdWx0IGlzIGAwYFxuICAgICAtIHkgKG51bWJlcikgbmV3IHkgcG9zaXRpb24sIGRlZmF1bHQgaXMgYDBgXG4gICAgIC0gdyAobnVtYmVyKSBuZXcgd2lkdGggb2YgdGhlIGNhbnZhc1xuICAgICAtIGggKG51bWJlcikgbmV3IGhlaWdodCBvZiB0aGUgY2FudmFzXG4gICAgIC0gZml0IChib29sZWFuKSBgdHJ1ZWAgaWYgeW91IHdhbnQgZ3JhcGhpY3MgdG8gZml0IGludG8gbmV3IGJvdW5kYXJ5IGJveFxuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLnNldFZpZXdCb3ggPSBmdW5jdGlvbiAoeCwgeSwgdywgaCwgZml0KSB7XG4gICAgICAgIHJldHVybiBSLl9lbmdpbmUuc2V0Vmlld0JveC5jYWxsKHRoaXMsIHgsIHksIHcsIGgsIGZpdCk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIudG9wXG4gICAgIFsgcHJvcGVydHkgXVxuICAgICAqKlxuICAgICAqIFBvaW50cyB0byB0aGUgdG9wbW9zdCBlbGVtZW50IG9uIHRoZSBwYXBlclxuICAgIFxcKi9cbiAgICAvKlxcXG4gICAgICogUGFwZXIuYm90dG9tXG4gICAgIFsgcHJvcGVydHkgXVxuICAgICAqKlxuICAgICAqIFBvaW50cyB0byB0aGUgYm90dG9tIGVsZW1lbnQgb24gdGhlIHBhcGVyXG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8udG9wID0gcGFwZXJwcm90by5ib3R0b20gPSBudWxsO1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5yYXBoYWVsXG4gICAgIFsgcHJvcGVydHkgXVxuICAgICAqKlxuICAgICAqIFBvaW50cyB0byB0aGUgQFJhcGhhZWwgb2JqZWN0L2Z1bmN0aW9uXG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8ucmFwaGFlbCA9IFI7XG4gICAgdmFyIGdldE9mZnNldCA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICAgIHZhciBib3ggPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICAgICAgZG9jID0gZWxlbS5vd25lckRvY3VtZW50LFxuICAgICAgICAgICAgYm9keSA9IGRvYy5ib2R5LFxuICAgICAgICAgICAgZG9jRWxlbSA9IGRvYy5kb2N1bWVudEVsZW1lbnQsXG4gICAgICAgICAgICBjbGllbnRUb3AgPSBkb2NFbGVtLmNsaWVudFRvcCB8fCBib2R5LmNsaWVudFRvcCB8fCAwLCBjbGllbnRMZWZ0ID0gZG9jRWxlbS5jbGllbnRMZWZ0IHx8IGJvZHkuY2xpZW50TGVmdCB8fCAwLFxuICAgICAgICAgICAgdG9wICA9IGJveC50b3AgICsgKGcud2luLnBhZ2VZT2Zmc2V0IHx8IGRvY0VsZW0uc2Nyb2xsVG9wIHx8IGJvZHkuc2Nyb2xsVG9wICkgLSBjbGllbnRUb3AsXG4gICAgICAgICAgICBsZWZ0ID0gYm94LmxlZnQgKyAoZy53aW4ucGFnZVhPZmZzZXQgfHwgZG9jRWxlbS5zY3JvbGxMZWZ0IHx8IGJvZHkuc2Nyb2xsTGVmdCkgLSBjbGllbnRMZWZ0O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeTogdG9wLFxuICAgICAgICAgICAgeDogbGVmdFxuICAgICAgICB9O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLmdldEVsZW1lbnRCeVBvaW50XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIHlvdSB0b3Btb3N0IGVsZW1lbnQgdW5kZXIgZ2l2ZW4gcG9pbnQuXG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgUmFwaGHDq2wgZWxlbWVudCBvYmplY3RcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0geCAobnVtYmVyKSB4IGNvb3JkaW5hdGUgZnJvbSB0aGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSB3aW5kb3dcbiAgICAgLSB5IChudW1iZXIpIHkgY29vcmRpbmF0ZSBmcm9tIHRoZSB0b3AgbGVmdCBjb3JuZXIgb2YgdGhlIHdpbmRvd1xuICAgICA+IFVzYWdlXG4gICAgIHwgcGFwZXIuZ2V0RWxlbWVudEJ5UG9pbnQobW91c2VYLCBtb3VzZVkpLmF0dHIoe3N0cm9rZTogXCIjZjAwXCJ9KTtcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5nZXRFbGVtZW50QnlQb2ludCA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIHZhciBwYXBlciA9IHRoaXMsXG4gICAgICAgICAgICBzdmcgPSBwYXBlci5jYW52YXMsXG4gICAgICAgICAgICB0YXJnZXQgPSBnLmRvYy5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuICAgICAgICBpZiAoZy53aW4ub3BlcmEgJiYgdGFyZ2V0LnRhZ05hbWUgPT0gXCJzdmdcIikge1xuICAgICAgICAgICAgdmFyIHNvID0gZ2V0T2Zmc2V0KHN2ZyksXG4gICAgICAgICAgICAgICAgc3IgPSBzdmcuY3JlYXRlU1ZHUmVjdCgpO1xuICAgICAgICAgICAgc3IueCA9IHggLSBzby54O1xuICAgICAgICAgICAgc3IueSA9IHkgLSBzby55O1xuICAgICAgICAgICAgc3Iud2lkdGggPSBzci5oZWlnaHQgPSAxO1xuICAgICAgICAgICAgdmFyIGhpdHMgPSBzdmcuZ2V0SW50ZXJzZWN0aW9uTGlzdChzciwgbnVsbCk7XG4gICAgICAgICAgICBpZiAoaGl0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBoaXRzW2hpdHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlICh0YXJnZXQucGFyZW50Tm9kZSAmJiB0YXJnZXQgIT0gc3ZnLnBhcmVudE5vZGUgJiYgIXRhcmdldC5yYXBoYWVsKSB7XG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcbiAgICAgICAgfVxuICAgICAgICB0YXJnZXQgPT0gcGFwZXIuY2FudmFzLnBhcmVudE5vZGUgJiYgKHRhcmdldCA9IHN2Zyk7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldCAmJiB0YXJnZXQucmFwaGFlbCA/IHBhcGVyLmdldEJ5SWQodGFyZ2V0LnJhcGhhZWxpZCkgOiBudWxsO1xuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH07XG5cbiAgICAvKlxcXG4gICAgICogUGFwZXIuZ2V0RWxlbWVudHNCeUJCb3hcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgc2V0IG9mIGVsZW1lbnRzIHRoYXQgaGF2ZSBhbiBpbnRlcnNlY3RpbmcgYm91bmRpbmcgYm94XG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGJib3ggKG9iamVjdCkgYmJveCB0byBjaGVjayB3aXRoXG4gICAgID0gKG9iamVjdCkgQFNldFxuICAgICBcXCovXG4gICAgcGFwZXJwcm90by5nZXRFbGVtZW50c0J5QkJveCA9IGZ1bmN0aW9uIChiYm94KSB7XG4gICAgICAgIHZhciBzZXQgPSB0aGlzLnNldCgpO1xuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICBpZiAoUi5pc0JCb3hJbnRlcnNlY3QoZWwuZ2V0QkJveCgpLCBiYm94KSkge1xuICAgICAgICAgICAgICAgIHNldC5wdXNoKGVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzZXQ7XG4gICAgfTtcblxuICAgIC8qXFxcbiAgICAgKiBQYXBlci5nZXRCeUlkXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIHlvdSBlbGVtZW50IGJ5IGl0cyBpbnRlcm5hbCBJRC5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gaWQgKG51bWJlcikgaWRcbiAgICAgPSAob2JqZWN0KSBSYXBoYcOrbCBlbGVtZW50IG9iamVjdFxuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLmdldEJ5SWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgdmFyIGJvdCA9IHRoaXMuYm90dG9tO1xuICAgICAgICB3aGlsZSAoYm90KSB7XG4gICAgICAgICAgICBpZiAoYm90LmlkID09IGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJvdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJvdCA9IGJvdC5uZXh0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLmZvckVhY2hcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEV4ZWN1dGVzIGdpdmVuIGZ1bmN0aW9uIGZvciBlYWNoIGVsZW1lbnQgb24gdGhlIHBhcGVyXG4gICAgICpcbiAgICAgKiBJZiBjYWxsYmFjayBmdW5jdGlvbiByZXR1cm5zIGBmYWxzZWAgaXQgd2lsbCBzdG9wIGxvb3AgcnVubmluZy5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gY2FsbGJhY2sgKGZ1bmN0aW9uKSBmdW5jdGlvbiB0byBydW5cbiAgICAgLSB0aGlzQXJnIChvYmplY3QpIGNvbnRleHQgb2JqZWN0IGZvciB0aGUgY2FsbGJhY2tcbiAgICAgPSAob2JqZWN0KSBQYXBlciBvYmplY3RcbiAgICAgPiBVc2FnZVxuICAgICB8IHBhcGVyLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgIHwgICAgIGVsLmF0dHIoeyBzdHJva2U6IFwiYmx1ZVwiIH0pO1xuICAgICB8IH0pO1xuICAgIFxcKi9cbiAgICBwYXBlcnByb3RvLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgICAgdmFyIGJvdCA9IHRoaXMuYm90dG9tO1xuICAgICAgICB3aGlsZSAoYm90KSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2suY2FsbCh0aGlzQXJnLCBib3QpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm90ID0gYm90Lm5leHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuZ2V0RWxlbWVudHNCeVBvaW50XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIHNldCBvZiBlbGVtZW50cyB0aGF0IGhhdmUgY29tbW9uIHBvaW50IGluc2lkZVxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSB4IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnRcbiAgICAgLSB5IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnRcbiAgICAgPSAob2JqZWN0KSBAU2V0XG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8uZ2V0RWxlbWVudHNCeVBvaW50ID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgdmFyIHNldCA9IHRoaXMuc2V0KCk7XG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIGlmIChlbC5pc1BvaW50SW5zaWRlKHgsIHkpKSB7XG4gICAgICAgICAgICAgICAgc2V0LnB1c2goZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHNldDtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIHhfeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueCArIFMgKyB0aGlzLnk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHhfeV93X2goKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnggKyBTICsgdGhpcy55ICsgUyArIHRoaXMud2lkdGggKyBcIiBcXHhkNyBcIiArIHRoaXMuaGVpZ2h0O1xuICAgIH1cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5pc1BvaW50SW5zaWRlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBEZXRlcm1pbmUgaWYgZ2l2ZW4gcG9pbnQgaXMgaW5zaWRlIHRoaXMgZWxlbWVudOKAmXMgc2hhcGVcbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0geCAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50XG4gICAgIC0geSAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50XG4gICAgID0gKGJvb2xlYW4pIGB0cnVlYCBpZiBwb2ludCBpbnNpZGUgdGhlIHNoYXBlXG4gICAgXFwqL1xuICAgIGVscHJvdG8uaXNQb2ludEluc2lkZSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIHZhciBycCA9IHRoaXMucmVhbFBhdGggPSB0aGlzLnJlYWxQYXRoIHx8IGdldFBhdGhbdGhpcy50eXBlXSh0aGlzKTtcbiAgICAgICAgcmV0dXJuIFIuaXNQb2ludEluc2lkZVBhdGgocnAsIHgsIHkpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuZ2V0QkJveFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJuIGJvdW5kaW5nIGJveCBmb3IgYSBnaXZlbiBlbGVtZW50XG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGlzV2l0aG91dFRyYW5zZm9ybSAoYm9vbGVhbikgZmxhZywgYHRydWVgIGlmIHlvdSB3YW50IHRvIGhhdmUgYm91bmRpbmcgYm94IGJlZm9yZSB0cmFuc2Zvcm1hdGlvbnMuIERlZmF1bHQgaXMgYGZhbHNlYC5cbiAgICAgPSAob2JqZWN0KSBCb3VuZGluZyBib3ggb2JqZWN0OlxuICAgICBvIHtcbiAgICAgbyAgICAgeDogKG51bWJlcikgdG9wIGxlZnQgY29ybmVyIHhcbiAgICAgbyAgICAgeTogKG51bWJlcikgdG9wIGxlZnQgY29ybmVyIHlcbiAgICAgbyAgICAgeDI6IChudW1iZXIpIGJvdHRvbSByaWdodCBjb3JuZXIgeFxuICAgICBvICAgICB5MjogKG51bWJlcikgYm90dG9tIHJpZ2h0IGNvcm5lciB5XG4gICAgIG8gICAgIHdpZHRoOiAobnVtYmVyKSB3aWR0aFxuICAgICBvICAgICBoZWlnaHQ6IChudW1iZXIpIGhlaWdodFxuICAgICBvIH1cbiAgICBcXCovXG4gICAgZWxwcm90by5nZXRCQm94ID0gZnVuY3Rpb24gKGlzV2l0aG91dFRyYW5zZm9ybSkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgICAgdmFyIF8gPSB0aGlzLl87XG4gICAgICAgIGlmIChpc1dpdGhvdXRUcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgIGlmIChfLmRpcnR5IHx8ICFfLmJib3h3dCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVhbFBhdGggPSBnZXRQYXRoW3RoaXMudHlwZV0odGhpcyk7XG4gICAgICAgICAgICAgICAgXy5iYm94d3QgPSBwYXRoRGltZW5zaW9ucyh0aGlzLnJlYWxQYXRoKTtcbiAgICAgICAgICAgICAgICBfLmJib3h3dC50b1N0cmluZyA9IHhfeV93X2g7XG4gICAgICAgICAgICAgICAgXy5kaXJ0eSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gXy5iYm94d3Q7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8uZGlydHkgfHwgXy5kaXJ0eVQgfHwgIV8uYmJveCkge1xuICAgICAgICAgICAgaWYgKF8uZGlydHkgfHwgIXRoaXMucmVhbFBhdGgpIHtcbiAgICAgICAgICAgICAgICBfLmJib3h3dCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWFsUGF0aCA9IGdldFBhdGhbdGhpcy50eXBlXSh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF8uYmJveCA9IHBhdGhEaW1lbnNpb25zKG1hcFBhdGgodGhpcy5yZWFsUGF0aCwgdGhpcy5tYXRyaXgpKTtcbiAgICAgICAgICAgIF8uYmJveC50b1N0cmluZyA9IHhfeV93X2g7XG4gICAgICAgICAgICBfLmRpcnR5ID0gXy5kaXJ0eVQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfLmJib3g7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5jbG9uZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgY2xvbmUgb2YgYSBnaXZlbiBlbGVtZW50XG4gICAgICoqXG4gICAgXFwqL1xuICAgIGVscHJvdG8uY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHZhciBvdXQgPSB0aGlzLnBhcGVyW3RoaXMudHlwZV0oKS5hdHRyKHRoaXMuYXR0cigpKTtcbiAgICAgICAgdGhpcy5fX3NldF9fICYmIHRoaXMuX19zZXRfXy5wdXNoKG91dCk7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5nbG93XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm4gc2V0IG9mIGVsZW1lbnRzIHRoYXQgY3JlYXRlIGdsb3ctbGlrZSBlZmZlY3QgYXJvdW5kIGdpdmVuIGVsZW1lbnQuIFNlZSBAUGFwZXIuc2V0LlxuICAgICAqXG4gICAgICogTm90ZTogR2xvdyBpcyBub3QgY29ubmVjdGVkIHRvIHRoZSBlbGVtZW50LiBJZiB5b3UgY2hhbmdlIGVsZW1lbnQgYXR0cmlidXRlcyBpdCB3b27igJl0IGFkanVzdCBpdHNlbGYuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGdsb3cgKG9iamVjdCkgI29wdGlvbmFsIHBhcmFtZXRlcnMgb2JqZWN0IHdpdGggYWxsIHByb3BlcnRpZXMgb3B0aW9uYWw6XG4gICAgIG8ge1xuICAgICBvICAgICB3aWR0aCAobnVtYmVyKSBzaXplIG9mIHRoZSBnbG93LCBkZWZhdWx0IGlzIGAxMGBcbiAgICAgbyAgICAgZmlsbCAoYm9vbGVhbikgd2lsbCBpdCBiZSBmaWxsZWQsIGRlZmF1bHQgaXMgYGZhbHNlYFxuICAgICBvICAgICBvcGFjaXR5IChudW1iZXIpIG9wYWNpdHksIGRlZmF1bHQgaXMgYDAuNWBcbiAgICAgbyAgICAgb2Zmc2V0eCAobnVtYmVyKSBob3Jpem9udGFsIG9mZnNldCwgZGVmYXVsdCBpcyBgMGBcbiAgICAgbyAgICAgb2Zmc2V0eSAobnVtYmVyKSB2ZXJ0aWNhbCBvZmZzZXQsIGRlZmF1bHQgaXMgYDBgXG4gICAgIG8gICAgIGNvbG9yIChzdHJpbmcpIGdsb3cgY29sb3VyLCBkZWZhdWx0IGlzIGBibGFja2BcbiAgICAgbyB9XG4gICAgID0gKG9iamVjdCkgQFBhcGVyLnNldCBvZiBlbGVtZW50cyB0aGF0IHJlcHJlc2VudHMgZ2xvd1xuICAgIFxcKi9cbiAgICBlbHByb3RvLmdsb3cgPSBmdW5jdGlvbiAoZ2xvdykge1xuICAgICAgICBpZiAodGhpcy50eXBlID09IFwidGV4dFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBnbG93ID0gZ2xvdyB8fCB7fTtcbiAgICAgICAgdmFyIHMgPSB7XG4gICAgICAgICAgICB3aWR0aDogKGdsb3cud2lkdGggfHwgMTApICsgKCt0aGlzLmF0dHIoXCJzdHJva2Utd2lkdGhcIikgfHwgMSksXG4gICAgICAgICAgICBmaWxsOiBnbG93LmZpbGwgfHwgZmFsc2UsXG4gICAgICAgICAgICBvcGFjaXR5OiBnbG93Lm9wYWNpdHkgfHwgLjUsXG4gICAgICAgICAgICBvZmZzZXR4OiBnbG93Lm9mZnNldHggfHwgMCxcbiAgICAgICAgICAgIG9mZnNldHk6IGdsb3cub2Zmc2V0eSB8fCAwLFxuICAgICAgICAgICAgY29sb3I6IGdsb3cuY29sb3IgfHwgXCIjMDAwXCJcbiAgICAgICAgfSxcbiAgICAgICAgICAgIGMgPSBzLndpZHRoIC8gMixcbiAgICAgICAgICAgIHIgPSB0aGlzLnBhcGVyLFxuICAgICAgICAgICAgb3V0ID0gci5zZXQoKSxcbiAgICAgICAgICAgIHBhdGggPSB0aGlzLnJlYWxQYXRoIHx8IGdldFBhdGhbdGhpcy50eXBlXSh0aGlzKTtcbiAgICAgICAgcGF0aCA9IHRoaXMubWF0cml4ID8gbWFwUGF0aChwYXRoLCB0aGlzLm1hdHJpeCkgOiBwYXRoO1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGMgKyAxOyBpKyspIHtcbiAgICAgICAgICAgIG91dC5wdXNoKHIucGF0aChwYXRoKS5hdHRyKHtcbiAgICAgICAgICAgICAgICBzdHJva2U6IHMuY29sb3IsXG4gICAgICAgICAgICAgICAgZmlsbDogcy5maWxsID8gcy5jb2xvciA6IFwibm9uZVwiLFxuICAgICAgICAgICAgICAgIFwic3Ryb2tlLWxpbmVqb2luXCI6IFwicm91bmRcIixcbiAgICAgICAgICAgICAgICBcInN0cm9rZS1saW5lY2FwXCI6IFwicm91bmRcIixcbiAgICAgICAgICAgICAgICBcInN0cm9rZS13aWR0aFwiOiArKHMud2lkdGggLyBjICogaSkudG9GaXhlZCgzKSxcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiArKHMub3BhY2l0eSAvIGMpLnRvRml4ZWQoMylcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0Lmluc2VydEJlZm9yZSh0aGlzKS50cmFuc2xhdGUocy5vZmZzZXR4LCBzLm9mZnNldHkpO1xuICAgIH07XG4gICAgdmFyIGN1cnZlc2xlbmd0aHMgPSB7fSxcbiAgICBnZXRQb2ludEF0U2VnbWVudExlbmd0aCA9IGZ1bmN0aW9uIChwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeSwgbGVuZ3RoKSB7XG4gICAgICAgIGlmIChsZW5ndGggPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGJlemxlbihwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUi5maW5kRG90c0F0U2VnbWVudChwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeSwgZ2V0VGF0TGVuKHAxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5LCBsZW5ndGgpKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0TGVuZ3RoRmFjdG9yeSA9IGZ1bmN0aW9uIChpc3RvdGFsLCBzdWJwYXRoKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAocGF0aCwgbGVuZ3RoLCBvbmx5c3RhcnQpIHtcbiAgICAgICAgICAgIHBhdGggPSBwYXRoMmN1cnZlKHBhdGgpO1xuICAgICAgICAgICAgdmFyIHgsIHksIHAsIGwsIHNwID0gXCJcIiwgc3VicGF0aHMgPSB7fSwgcG9pbnQsXG4gICAgICAgICAgICAgICAgbGVuID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHBhdGgubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIHAgPSBwYXRoW2ldO1xuICAgICAgICAgICAgICAgIGlmIChwWzBdID09IFwiTVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSArcFsxXTtcbiAgICAgICAgICAgICAgICAgICAgeSA9ICtwWzJdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGwgPSBnZXRQb2ludEF0U2VnbWVudExlbmd0aCh4LCB5LCBwWzFdLCBwWzJdLCBwWzNdLCBwWzRdLCBwWzVdLCBwWzZdKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxlbiArIGwgPiBsZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdWJwYXRoICYmICFzdWJwYXRocy5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50ID0gZ2V0UG9pbnRBdFNlZ21lbnRMZW5ndGgoeCwgeSwgcFsxXSwgcFsyXSwgcFszXSwgcFs0XSwgcFs1XSwgcFs2XSwgbGVuZ3RoIC0gbGVuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcCArPSBbXCJDXCIgKyBwb2ludC5zdGFydC54LCBwb2ludC5zdGFydC55LCBwb2ludC5tLngsIHBvaW50Lm0ueSwgcG9pbnQueCwgcG9pbnQueV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9ubHlzdGFydCkge3JldHVybiBzcDt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VicGF0aHMuc3RhcnQgPSBzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcCA9IFtcIk1cIiArIHBvaW50LngsIHBvaW50LnkgKyBcIkNcIiArIHBvaW50Lm4ueCwgcG9pbnQubi55LCBwb2ludC5lbmQueCwgcG9pbnQuZW5kLnksIHBbNV0sIHBbNl1dLmpvaW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW4gKz0gbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ID0gK3BbNV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeSA9ICtwWzZdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc3RvdGFsICYmICFzdWJwYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnQgPSBnZXRQb2ludEF0U2VnbWVudExlbmd0aCh4LCB5LCBwWzFdLCBwWzJdLCBwWzNdLCBwWzRdLCBwWzVdLCBwWzZdLCBsZW5ndGggLSBsZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7eDogcG9pbnQueCwgeTogcG9pbnQueSwgYWxwaGE6IHBvaW50LmFscGhhfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZW4gKz0gbDtcbiAgICAgICAgICAgICAgICAgICAgeCA9ICtwWzVdO1xuICAgICAgICAgICAgICAgICAgICB5ID0gK3BbNl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNwICs9IHAuc2hpZnQoKSArIHA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdWJwYXRocy5lbmQgPSBzcDtcbiAgICAgICAgICAgIHBvaW50ID0gaXN0b3RhbCA/IGxlbiA6IHN1YnBhdGggPyBzdWJwYXRocyA6IFIuZmluZERvdHNBdFNlZ21lbnQoeCwgeSwgcFswXSwgcFsxXSwgcFsyXSwgcFszXSwgcFs0XSwgcFs1XSwgMSk7XG4gICAgICAgICAgICBwb2ludC5hbHBoYSAmJiAocG9pbnQgPSB7eDogcG9pbnQueCwgeTogcG9pbnQueSwgYWxwaGE6IHBvaW50LmFscGhhfSk7XG4gICAgICAgICAgICByZXR1cm4gcG9pbnQ7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICB2YXIgZ2V0VG90YWxMZW5ndGggPSBnZXRMZW5ndGhGYWN0b3J5KDEpLFxuICAgICAgICBnZXRQb2ludEF0TGVuZ3RoID0gZ2V0TGVuZ3RoRmFjdG9yeSgpLFxuICAgICAgICBnZXRTdWJwYXRoc0F0TGVuZ3RoID0gZ2V0TGVuZ3RoRmFjdG9yeSgwLCAxKTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5nZXRUb3RhbExlbmd0aFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBsZW5ndGggb2YgdGhlIGdpdmVuIHBhdGggaW4gcGl4ZWxzLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBwYXRoIChzdHJpbmcpIFNWRyBwYXRoIHN0cmluZy5cbiAgICAgKipcbiAgICAgPSAobnVtYmVyKSBsZW5ndGguXG4gICAgXFwqL1xuICAgIFIuZ2V0VG90YWxMZW5ndGggPSBnZXRUb3RhbExlbmd0aDtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5nZXRQb2ludEF0TGVuZ3RoXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm4gY29vcmRpbmF0ZXMgb2YgdGhlIHBvaW50IGxvY2F0ZWQgYXQgdGhlIGdpdmVuIGxlbmd0aCBvbiB0aGUgZ2l2ZW4gcGF0aC5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gcGF0aCAoc3RyaW5nKSBTVkcgcGF0aCBzdHJpbmdcbiAgICAgLSBsZW5ndGggKG51bWJlcilcbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSByZXByZXNlbnRhdGlvbiBvZiB0aGUgcG9pbnQ6XG4gICAgIG8ge1xuICAgICBvICAgICB4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGVcbiAgICAgbyAgICAgeTogKG51bWJlcikgeSBjb29yZGluYXRlXG4gICAgIG8gICAgIGFscGhhOiAobnVtYmVyKSBhbmdsZSBvZiBkZXJpdmF0aXZlXG4gICAgIG8gfVxuICAgIFxcKi9cbiAgICBSLmdldFBvaW50QXRMZW5ndGggPSBnZXRQb2ludEF0TGVuZ3RoO1xuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmdldFN1YnBhdGhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybiBzdWJwYXRoIG9mIGEgZ2l2ZW4gcGF0aCBmcm9tIGdpdmVuIGxlbmd0aCB0byBnaXZlbiBsZW5ndGguXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHBhdGggKHN0cmluZykgU1ZHIHBhdGggc3RyaW5nXG4gICAgIC0gZnJvbSAobnVtYmVyKSBwb3NpdGlvbiBvZiB0aGUgc3RhcnQgb2YgdGhlIHNlZ21lbnRcbiAgICAgLSB0byAobnVtYmVyKSBwb3NpdGlvbiBvZiB0aGUgZW5kIG9mIHRoZSBzZWdtZW50XG4gICAgICoqXG4gICAgID0gKHN0cmluZykgcGF0aHN0cmluZyBmb3IgdGhlIHNlZ21lbnRcbiAgICBcXCovXG4gICAgUi5nZXRTdWJwYXRoID0gZnVuY3Rpb24gKHBhdGgsIGZyb20sIHRvKSB7XG4gICAgICAgIGlmICh0aGlzLmdldFRvdGFsTGVuZ3RoKHBhdGgpIC0gdG8gPCAxZS02KSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0U3VicGF0aHNBdExlbmd0aChwYXRoLCBmcm9tKS5lbmQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGEgPSBnZXRTdWJwYXRoc0F0TGVuZ3RoKHBhdGgsIHRvLCAxKTtcbiAgICAgICAgcmV0dXJuIGZyb20gPyBnZXRTdWJwYXRoc0F0TGVuZ3RoKGEsIGZyb20pLmVuZCA6IGE7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5nZXRUb3RhbExlbmd0aFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBsZW5ndGggb2YgdGhlIHBhdGggaW4gcGl4ZWxzLiBPbmx5IHdvcmtzIGZvciBlbGVtZW50IG9mIOKAnHBhdGjigJ0gdHlwZS5cbiAgICAgPSAobnVtYmVyKSBsZW5ndGguXG4gICAgXFwqL1xuICAgIGVscHJvdG8uZ2V0VG90YWxMZW5ndGggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgIT0gXCJwYXRoXCIpIHtyZXR1cm47fVxuICAgICAgICBpZiAodGhpcy5ub2RlLmdldFRvdGFsTGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ub2RlLmdldFRvdGFsTGVuZ3RoKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdldFRvdGFsTGVuZ3RoKHRoaXMuYXR0cnMucGF0aCk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5nZXRQb2ludEF0TGVuZ3RoXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm4gY29vcmRpbmF0ZXMgb2YgdGhlIHBvaW50IGxvY2F0ZWQgYXQgdGhlIGdpdmVuIGxlbmd0aCBvbiB0aGUgZ2l2ZW4gcGF0aC4gT25seSB3b3JrcyBmb3IgZWxlbWVudCBvZiDigJxwYXRo4oCdIHR5cGUuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGxlbmd0aCAobnVtYmVyKVxuICAgICAqKlxuICAgICA9IChvYmplY3QpIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwb2ludDpcbiAgICAgbyB7XG4gICAgIG8gICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZVxuICAgICBvICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGVcbiAgICAgbyAgICAgYWxwaGE6IChudW1iZXIpIGFuZ2xlIG9mIGRlcml2YXRpdmVcbiAgICAgbyB9XG4gICAgXFwqL1xuICAgIGVscHJvdG8uZ2V0UG9pbnRBdExlbmd0aCA9IGZ1bmN0aW9uIChsZW5ndGgpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPSBcInBhdGhcIikge3JldHVybjt9XG4gICAgICAgIHJldHVybiBnZXRQb2ludEF0TGVuZ3RoKHRoaXMuYXR0cnMucGF0aCwgbGVuZ3RoKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmdldFN1YnBhdGhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybiBzdWJwYXRoIG9mIGEgZ2l2ZW4gZWxlbWVudCBmcm9tIGdpdmVuIGxlbmd0aCB0byBnaXZlbiBsZW5ndGguIE9ubHkgd29ya3MgZm9yIGVsZW1lbnQgb2Yg4oCccGF0aOKAnSB0eXBlLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBmcm9tIChudW1iZXIpIHBvc2l0aW9uIG9mIHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudFxuICAgICAtIHRvIChudW1iZXIpIHBvc2l0aW9uIG9mIHRoZSBlbmQgb2YgdGhlIHNlZ21lbnRcbiAgICAgKipcbiAgICAgPSAoc3RyaW5nKSBwYXRoc3RyaW5nIGZvciB0aGUgc2VnbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLmdldFN1YnBhdGggPSBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPSBcInBhdGhcIikge3JldHVybjt9XG4gICAgICAgIHJldHVybiBSLmdldFN1YnBhdGgodGhpcy5hdHRycy5wYXRoLCBmcm9tLCB0byk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5lYXNpbmdfZm9ybXVsYXNcbiAgICAgWyBwcm9wZXJ0eSBdXG4gICAgICoqXG4gICAgICogT2JqZWN0IHRoYXQgY29udGFpbnMgZWFzaW5nIGZvcm11bGFzIGZvciBhbmltYXRpb24uIFlvdSBjb3VsZCBleHRlbmQgaXQgd2l0aCB5b3VyIG93bi4gQnkgZGVmYXVsdCBpdCBoYXMgZm9sbG93aW5nIGxpc3Qgb2YgZWFzaW5nOlxuICAgICAjIDx1bD5cbiAgICAgIyAgICAgPGxpPuKAnGxpbmVhcuKAnTwvbGk+XG4gICAgICMgICAgIDxsaT7igJwmbHQ74oCdIG9yIOKAnGVhc2VJbuKAnSBvciDigJxlYXNlLWlu4oCdPC9saT5cbiAgICAgIyAgICAgPGxpPuKAnD7igJ0gb3Ig4oCcZWFzZU91dOKAnSBvciDigJxlYXNlLW91dOKAnTwvbGk+XG4gICAgICMgICAgIDxsaT7igJwmbHQ7PuKAnSBvciDigJxlYXNlSW5PdXTigJ0gb3Ig4oCcZWFzZS1pbi1vdXTigJ08L2xpPlxuICAgICAjICAgICA8bGk+4oCcYmFja0lu4oCdIG9yIOKAnGJhY2staW7igJ08L2xpPlxuICAgICAjICAgICA8bGk+4oCcYmFja091dOKAnSBvciDigJxiYWNrLW91dOKAnTwvbGk+XG4gICAgICMgICAgIDxsaT7igJxlbGFzdGlj4oCdPC9saT5cbiAgICAgIyAgICAgPGxpPuKAnGJvdW5jZeKAnTwvbGk+XG4gICAgICMgPC91bD5cbiAgICAgIyA8cD5TZWUgYWxzbyA8YSBocmVmPVwiaHR0cDovL3JhcGhhZWxqcy5jb20vZWFzaW5nLmh0bWxcIj5FYXNpbmcgZGVtbzwvYT4uPC9wPlxuICAgIFxcKi9cbiAgICB2YXIgZWYgPSBSLmVhc2luZ19mb3JtdWxhcyA9IHtcbiAgICAgICAgbGluZWFyOiBmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIH0sXG4gICAgICAgIFwiPFwiOiBmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgcmV0dXJuIHBvdyhuLCAxLjcpO1xuICAgICAgICB9LFxuICAgICAgICBcIj5cIjogZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgIHJldHVybiBwb3cobiwgLjQ4KTtcbiAgICAgICAgfSxcbiAgICAgICAgXCI8PlwiOiBmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgdmFyIHEgPSAuNDggLSBuIC8gMS4wNCxcbiAgICAgICAgICAgICAgICBRID0gbWF0aC5zcXJ0KC4xNzM0ICsgcSAqIHEpLFxuICAgICAgICAgICAgICAgIHggPSBRIC0gcSxcbiAgICAgICAgICAgICAgICBYID0gcG93KGFicyh4KSwgMSAvIDMpICogKHggPCAwID8gLTEgOiAxKSxcbiAgICAgICAgICAgICAgICB5ID0gLVEgLSBxLFxuICAgICAgICAgICAgICAgIFkgPSBwb3coYWJzKHkpLCAxIC8gMykgKiAoeSA8IDAgPyAtMSA6IDEpLFxuICAgICAgICAgICAgICAgIHQgPSBYICsgWSArIC41O1xuICAgICAgICAgICAgcmV0dXJuICgxIC0gdCkgKiAzICogdCAqIHQgKyB0ICogdCAqIHQ7XG4gICAgICAgIH0sXG4gICAgICAgIGJhY2tJbjogZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgIHZhciBzID0gMS43MDE1ODtcbiAgICAgICAgICAgIHJldHVybiBuICogbiAqICgocyArIDEpICogbiAtIHMpO1xuICAgICAgICB9LFxuICAgICAgICBiYWNrT3V0OiBmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgbiA9IG4gLSAxO1xuICAgICAgICAgICAgdmFyIHMgPSAxLjcwMTU4O1xuICAgICAgICAgICAgcmV0dXJuIG4gKiBuICogKChzICsgMSkgKiBuICsgcykgKyAxO1xuICAgICAgICB9LFxuICAgICAgICBlbGFzdGljOiBmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgaWYgKG4gPT0gISFuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcG93KDIsIC0xMCAqIG4pICogbWF0aC5zaW4oKG4gLSAuMDc1KSAqICgyICogUEkpIC8gLjMpICsgMTtcbiAgICAgICAgfSxcbiAgICAgICAgYm91bmNlOiBmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgdmFyIHMgPSA3LjU2MjUsXG4gICAgICAgICAgICAgICAgcCA9IDIuNzUsXG4gICAgICAgICAgICAgICAgbDtcbiAgICAgICAgICAgIGlmIChuIDwgKDEgLyBwKSkge1xuICAgICAgICAgICAgICAgIGwgPSBzICogbiAqIG47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChuIDwgKDIgLyBwKSkge1xuICAgICAgICAgICAgICAgICAgICBuIC09ICgxLjUgLyBwKTtcbiAgICAgICAgICAgICAgICAgICAgbCA9IHMgKiBuICogbiArIC43NTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAobiA8ICgyLjUgLyBwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbiAtPSAoMi4yNSAvIHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgbCA9IHMgKiBuICogbiArIC45Mzc1O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbiAtPSAoMi42MjUgLyBwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGwgPSBzICogbiAqIG4gKyAuOTg0Mzc1O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGw7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGVmLmVhc2VJbiA9IGVmW1wiZWFzZS1pblwiXSA9IGVmW1wiPFwiXTtcbiAgICBlZi5lYXNlT3V0ID0gZWZbXCJlYXNlLW91dFwiXSA9IGVmW1wiPlwiXTtcbiAgICBlZi5lYXNlSW5PdXQgPSBlZltcImVhc2UtaW4tb3V0XCJdID0gZWZbXCI8PlwiXTtcbiAgICBlZltcImJhY2staW5cIl0gPSBlZi5iYWNrSW47XG4gICAgZWZbXCJiYWNrLW91dFwiXSA9IGVmLmJhY2tPdXQ7XG5cbiAgICB2YXIgYW5pbWF0aW9uRWxlbWVudHMgPSBbXSxcbiAgICAgICAgcmVxdWVzdEFuaW1GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgICAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIDE2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgIGFuaW1hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBOb3cgPSArbmV3IERhdGUsXG4gICAgICAgICAgICAgICAgbCA9IDA7XG4gICAgICAgICAgICBmb3IgKDsgbCA8IGFuaW1hdGlvbkVsZW1lbnRzLmxlbmd0aDsgbCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGUgPSBhbmltYXRpb25FbGVtZW50c1tsXTtcbiAgICAgICAgICAgICAgICBpZiAoZS5lbC5yZW1vdmVkIHx8IGUucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgdGltZSA9IE5vdyAtIGUuc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIG1zID0gZS5tcyxcbiAgICAgICAgICAgICAgICAgICAgZWFzaW5nID0gZS5lYXNpbmcsXG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSBlLmZyb20sXG4gICAgICAgICAgICAgICAgICAgIGRpZmYgPSBlLmRpZmYsXG4gICAgICAgICAgICAgICAgICAgIHRvID0gZS50byxcbiAgICAgICAgICAgICAgICAgICAgdCA9IGUudCxcbiAgICAgICAgICAgICAgICAgICAgdGhhdCA9IGUuZWwsXG4gICAgICAgICAgICAgICAgICAgIHNldCA9IHt9LFxuICAgICAgICAgICAgICAgICAgICBub3csXG4gICAgICAgICAgICAgICAgICAgIGluaXQgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAga2V5O1xuICAgICAgICAgICAgICAgIGlmIChlLmluaXRzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGltZSA9IChlLmluaXRzdGF0dXMgKiBlLmFuaW0udG9wIC0gZS5wcmV2KSAvIChlLnBlcmNlbnQgLSBlLnByZXYpICogbXM7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RhdHVzID0gZS5pbml0c3RhdHVzO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgZS5pbml0c3RhdHVzO1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3AgJiYgYW5pbWF0aW9uRWxlbWVudHMuc3BsaWNlKGwtLSwgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZS5zdGF0dXMgPSAoZS5wcmV2ICsgKGUucGVyY2VudCAtIGUucHJldikgKiAodGltZSAvIG1zKSkgLyBlLmFuaW0udG9wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGltZSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aW1lIDwgbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBvcyA9IGVhc2luZyh0aW1lIC8gbXMpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBhdHRyIGluIGZyb20pIGlmIChmcm9tW2hhc10oYXR0cikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoYXZhaWxhYmxlQW5pbUF0dHJzW2F0dHJdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBudTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93ID0gK2Zyb21bYXR0cl0gKyBwb3MgKiBtcyAqIGRpZmZbYXR0cl07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJjb2xvdXJcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93ID0gXCJyZ2IoXCIgKyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cHRvMjU1KHJvdW5kKGZyb21bYXR0cl0uciArIHBvcyAqIG1zICogZGlmZlthdHRyXS5yKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cHRvMjU1KHJvdW5kKGZyb21bYXR0cl0uZyArIHBvcyAqIG1zICogZGlmZlthdHRyXS5nKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cHRvMjU1KHJvdW5kKGZyb21bYXR0cl0uYiArIHBvcyAqIG1zICogZGlmZlthdHRyXS5iKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXS5qb2luKFwiLFwiKSArIFwiKVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicGF0aFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gZnJvbVthdHRyXS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3dbaV0gPSBbZnJvbVthdHRyXVtpXVswXV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMSwgamogPSBmcm9tW2F0dHJdW2ldLmxlbmd0aDsgaiA8IGpqOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3dbaV1bal0gPSArZnJvbVthdHRyXVtpXVtqXSArIHBvcyAqIG1zICogZGlmZlthdHRyXVtpXVtqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vd1tpXSA9IG5vd1tpXS5qb2luKFMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyA9IG5vdy5qb2luKFMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidHJhbnNmb3JtXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaWZmW2F0dHJdLnJlYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMCwgaWkgPSBmcm9tW2F0dHJdLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3dbaV0gPSBbZnJvbVthdHRyXVtpXVswXV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMSwgamogPSBmcm9tW2F0dHJdW2ldLmxlbmd0aDsgaiA8IGpqOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93W2ldW2pdID0gZnJvbVthdHRyXVtpXVtqXSArIHBvcyAqIG1zICogZGlmZlthdHRyXVtpXVtqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2V0ID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gK2Zyb21bYXR0cl1baV0gKyBwb3MgKiBtcyAqIGRpZmZbYXR0cl1baV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm93ID0gW1tcInJcIiwgZ2V0KDIpLCAwLCAwXSwgW1widFwiLCBnZXQoMyksIGdldCg0KV0sIFtcInNcIiwgZ2V0KDApLCBnZXQoMSksIDAsIDBdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyA9IFtbXCJtXCIsIGdldCgwKSwgZ2V0KDEpLCBnZXQoMiksIGdldCgzKSwgZ2V0KDQpLCBnZXQoNSldXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiY3N2XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRyID09IFwiY2xpcC1yZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSA9IDQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93W2ldID0gK2Zyb21bYXR0cl1baV0gKyBwb3MgKiBtcyAqIGRpZmZbYXR0cl1baV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZyb20yID0gW11bY29uY2F0XShmcm9tW2F0dHJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm93ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgPSB0aGF0LnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNbYXR0cl0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3dbaV0gPSArZnJvbTJbaV0gKyBwb3MgKiBtcyAqIGRpZmZbYXR0cl1baV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRbYXR0cl0gPSBub3c7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhhdC5hdHRyKHNldCk7XG4gICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoaWQsIHRoYXQsIGFuaW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZShcInJhcGhhZWwuYW5pbS5mcmFtZS5cIiArIGlkLCB0aGF0LCBhbmltKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KSh0aGF0LmlkLCB0aGF0LCBlLmFuaW0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbihmLCBlbCwgYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmUoXCJyYXBoYWVsLmFuaW0uZnJhbWUuXCIgKyBlbC5pZCwgZWwsIGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZShcInJhcGhhZWwuYW5pbS5maW5pc2guXCIgKyBlbC5pZCwgZWwsIGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFIuaXMoZiwgXCJmdW5jdGlvblwiKSAmJiBmLmNhbGwoZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKGUuY2FsbGJhY2ssIHRoYXQsIGUuYW5pbSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuYXR0cih0byk7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkVsZW1lbnRzLnNwbGljZShsLS0sIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS5yZXBlYXQgPiAxICYmICFlLm5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIHRvKSBpZiAodG9baGFzXShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdFtrZXldID0gZS50b3RhbE9yaWdpbltrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5lbC5hdHRyKGluaXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVuQW5pbWF0aW9uKGUuYW5pbSwgZS5lbCwgZS5hbmltLnBlcmNlbnRzWzBdLCBudWxsLCBlLnRvdGFsT3JpZ2luLCBlLnJlcGVhdCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLm5leHQgJiYgIWUuc3RvcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVuQW5pbWF0aW9uKGUuYW5pbSwgZS5lbCwgZS5uZXh0LCBudWxsLCBlLnRvdGFsT3JpZ2luLCBlLnJlcGVhdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBSLnN2ZyAmJiB0aGF0ICYmIHRoYXQucGFwZXIgJiYgdGhhdC5wYXBlci5zYWZhcmkoKTtcbiAgICAgICAgICAgIGFuaW1hdGlvbkVsZW1lbnRzLmxlbmd0aCAmJiByZXF1ZXN0QW5pbUZyYW1lKGFuaW1hdGlvbik7XG4gICAgICAgIH0sXG4gICAgICAgIHVwdG8yNTUgPSBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBjb2xvciA+IDI1NSA/IDI1NSA6IGNvbG9yIDwgMCA/IDAgOiBjb2xvcjtcbiAgICAgICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5hbmltYXRlV2l0aFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWN0cyBzaW1pbGFyIHRvIEBFbGVtZW50LmFuaW1hdGUsIGJ1dCBlbnN1cmUgdGhhdCBnaXZlbiBhbmltYXRpb24gcnVucyBpbiBzeW5jIHdpdGggYW5vdGhlciBnaXZlbiBlbGVtZW50LlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBlbCAob2JqZWN0KSBlbGVtZW50IHRvIHN5bmMgd2l0aFxuICAgICAtIGFuaW0gKG9iamVjdCkgYW5pbWF0aW9uIHRvIHN5bmMgd2l0aFxuICAgICAtIHBhcmFtcyAob2JqZWN0KSAjb3B0aW9uYWwgZmluYWwgYXR0cmlidXRlcyBmb3IgdGhlIGVsZW1lbnQsIHNlZSBhbHNvIEBFbGVtZW50LmF0dHJcbiAgICAgLSBtcyAobnVtYmVyKSAjb3B0aW9uYWwgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmb3IgYW5pbWF0aW9uIHRvIHJ1blxuICAgICAtIGVhc2luZyAoc3RyaW5nKSAjb3B0aW9uYWwgZWFzaW5nIHR5cGUuIEFjY2VwdCBvbiBvZiBAUmFwaGFlbC5lYXNpbmdfZm9ybXVsYXMgb3IgQ1NTIGZvcm1hdDogYGN1YmljJiN4MjAxMDtiZXppZXIoWFgsJiMxNjA7WFgsJiMxNjA7WFgsJiMxNjA7WFgpYFxuICAgICAtIGNhbGxiYWNrIChmdW5jdGlvbikgI29wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uLiBXaWxsIGJlIGNhbGxlZCBhdCB0aGUgZW5kIG9mIGFuaW1hdGlvbi5cbiAgICAgKiBvclxuICAgICAtIGVsZW1lbnQgKG9iamVjdCkgZWxlbWVudCB0byBzeW5jIHdpdGhcbiAgICAgLSBhbmltIChvYmplY3QpIGFuaW1hdGlvbiB0byBzeW5jIHdpdGhcbiAgICAgLSBhbmltYXRpb24gKG9iamVjdCkgI29wdGlvbmFsIGFuaW1hdGlvbiBvYmplY3QsIHNlZSBAUmFwaGFlbC5hbmltYXRpb25cbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBvcmlnaW5hbCBlbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8uYW5pbWF0ZVdpdGggPSBmdW5jdGlvbiAoZWwsIGFuaW0sIHBhcmFtcywgbXMsIGVhc2luZywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzO1xuICAgICAgICBpZiAoZWxlbWVudC5yZW1vdmVkKSB7XG4gICAgICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjay5jYWxsKGVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGEgPSBwYXJhbXMgaW5zdGFuY2VvZiBBbmltYXRpb24gPyBwYXJhbXMgOiBSLmFuaW1hdGlvbihwYXJhbXMsIG1zLCBlYXNpbmcsIGNhbGxiYWNrKSxcbiAgICAgICAgICAgIHgsIHk7XG4gICAgICAgIHJ1bkFuaW1hdGlvbihhLCBlbGVtZW50LCBhLnBlcmNlbnRzWzBdLCBudWxsLCBlbGVtZW50LmF0dHIoKSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGFuaW1hdGlvbkVsZW1lbnRzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhbmltYXRpb25FbGVtZW50c1tpXS5hbmltID09IGFuaW0gJiYgYW5pbWF0aW9uRWxlbWVudHNbaV0uZWwgPT0gZWwpIHtcbiAgICAgICAgICAgICAgICBhbmltYXRpb25FbGVtZW50c1tpaSAtIDFdLnN0YXJ0ID0gYW5pbWF0aW9uRWxlbWVudHNbaV0uc3RhcnQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICAgIC8vIFxuICAgICAgICAvLyBcbiAgICAgICAgLy8gdmFyIGEgPSBwYXJhbXMgPyBSLmFuaW1hdGlvbihwYXJhbXMsIG1zLCBlYXNpbmcsIGNhbGxiYWNrKSA6IGFuaW0sXG4gICAgICAgIC8vICAgICBzdGF0dXMgPSBlbGVtZW50LnN0YXR1cyhhbmltKTtcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuYW5pbWF0ZShhKS5zdGF0dXMoYSwgc3RhdHVzICogYW5pbS5tcyAvIGEubXMpO1xuICAgIH07XG4gICAgZnVuY3Rpb24gQ3ViaWNCZXppZXJBdFRpbWUodCwgcDF4LCBwMXksIHAyeCwgcDJ5LCBkdXJhdGlvbikge1xuICAgICAgICB2YXIgY3ggPSAzICogcDF4LFxuICAgICAgICAgICAgYnggPSAzICogKHAyeCAtIHAxeCkgLSBjeCxcbiAgICAgICAgICAgIGF4ID0gMSAtIGN4IC0gYngsXG4gICAgICAgICAgICBjeSA9IDMgKiBwMXksXG4gICAgICAgICAgICBieSA9IDMgKiAocDJ5IC0gcDF5KSAtIGN5LFxuICAgICAgICAgICAgYXkgPSAxIC0gY3kgLSBieTtcbiAgICAgICAgZnVuY3Rpb24gc2FtcGxlQ3VydmVYKHQpIHtcbiAgICAgICAgICAgIHJldHVybiAoKGF4ICogdCArIGJ4KSAqIHQgKyBjeCkgKiB0O1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHNvbHZlKHgsIGVwc2lsb24pIHtcbiAgICAgICAgICAgIHZhciB0ID0gc29sdmVDdXJ2ZVgoeCwgZXBzaWxvbik7XG4gICAgICAgICAgICByZXR1cm4gKChheSAqIHQgKyBieSkgKiB0ICsgY3kpICogdDtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBzb2x2ZUN1cnZlWCh4LCBlcHNpbG9uKSB7XG4gICAgICAgICAgICB2YXIgdDAsIHQxLCB0MiwgeDIsIGQyLCBpO1xuICAgICAgICAgICAgZm9yKHQyID0geCwgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgICAgICB4MiA9IHNhbXBsZUN1cnZlWCh0MikgLSB4O1xuICAgICAgICAgICAgICAgIGlmIChhYnMoeDIpIDwgZXBzaWxvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdDI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGQyID0gKDMgKiBheCAqIHQyICsgMiAqIGJ4KSAqIHQyICsgY3g7XG4gICAgICAgICAgICAgICAgaWYgKGFicyhkMikgPCAxZS02KSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0MiA9IHQyIC0geDIgLyBkMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHQwID0gMDtcbiAgICAgICAgICAgIHQxID0gMTtcbiAgICAgICAgICAgIHQyID0geDtcbiAgICAgICAgICAgIGlmICh0MiA8IHQwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHQwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHQyID4gdDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSAodDAgPCB0MSkge1xuICAgICAgICAgICAgICAgIHgyID0gc2FtcGxlQ3VydmVYKHQyKTtcbiAgICAgICAgICAgICAgICBpZiAoYWJzKHgyIC0geCkgPCBlcHNpbG9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0MjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHggPiB4Mikge1xuICAgICAgICAgICAgICAgICAgICB0MCA9IHQyO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHQxID0gdDI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHQyID0gKHQxIC0gdDApIC8gMiArIHQwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHQyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzb2x2ZSh0LCAxIC8gKDIwMCAqIGR1cmF0aW9uKSk7XG4gICAgfVxuICAgIGVscHJvdG8ub25BbmltYXRpb24gPSBmdW5jdGlvbiAoZikge1xuICAgICAgICBmID8gZXZlLm9uKFwicmFwaGFlbC5hbmltLmZyYW1lLlwiICsgdGhpcy5pZCwgZikgOiBldmUudW5iaW5kKFwicmFwaGFlbC5hbmltLmZyYW1lLlwiICsgdGhpcy5pZCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZnVuY3Rpb24gQW5pbWF0aW9uKGFuaW0sIG1zKSB7XG4gICAgICAgIHZhciBwZXJjZW50cyA9IFtdLFxuICAgICAgICAgICAgbmV3QW5pbSA9IHt9O1xuICAgICAgICB0aGlzLm1zID0gbXM7XG4gICAgICAgIHRoaXMudGltZXMgPSAxO1xuICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgICAgZm9yICh2YXIgYXR0ciBpbiBhbmltKSBpZiAoYW5pbVtoYXNdKGF0dHIpKSB7XG4gICAgICAgICAgICAgICAgbmV3QW5pbVt0b0Zsb2F0KGF0dHIpXSA9IGFuaW1bYXR0cl07XG4gICAgICAgICAgICAgICAgcGVyY2VudHMucHVzaCh0b0Zsb2F0KGF0dHIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBlcmNlbnRzLnNvcnQoc29ydEJ5TnVtYmVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFuaW0gPSBuZXdBbmltO1xuICAgICAgICB0aGlzLnRvcCA9IHBlcmNlbnRzW3BlcmNlbnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICB0aGlzLnBlcmNlbnRzID0gcGVyY2VudHM7XG4gICAgfVxuICAgIC8qXFxcbiAgICAgKiBBbmltYXRpb24uZGVsYXlcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgYSBjb3B5IG9mIGV4aXN0aW5nIGFuaW1hdGlvbiBvYmplY3Qgd2l0aCBnaXZlbiBkZWxheS5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gZGVsYXkgKG51bWJlcikgbnVtYmVyIG9mIG1zIHRvIHBhc3MgYmV0d2VlbiBhbmltYXRpb24gc3RhcnQgYW5kIGFjdHVhbCBhbmltYXRpb25cbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBuZXcgYWx0ZXJlZCBBbmltYXRpb24gb2JqZWN0XG4gICAgIHwgdmFyIGFuaW0gPSBSYXBoYWVsLmFuaW1hdGlvbih7Y3g6IDEwLCBjeTogMjB9LCAyZTMpO1xuICAgICB8IGNpcmNsZTEuYW5pbWF0ZShhbmltKTsgLy8gcnVuIHRoZSBnaXZlbiBhbmltYXRpb24gaW1tZWRpYXRlbHlcbiAgICAgfCBjaXJjbGUyLmFuaW1hdGUoYW5pbS5kZWxheSg1MDApKTsgLy8gcnVuIHRoZSBnaXZlbiBhbmltYXRpb24gYWZ0ZXIgNTAwIG1zXG4gICAgXFwqL1xuICAgIEFuaW1hdGlvbi5wcm90b3R5cGUuZGVsYXkgPSBmdW5jdGlvbiAoZGVsYXkpIHtcbiAgICAgICAgdmFyIGEgPSBuZXcgQW5pbWF0aW9uKHRoaXMuYW5pbSwgdGhpcy5tcyk7XG4gICAgICAgIGEudGltZXMgPSB0aGlzLnRpbWVzO1xuICAgICAgICBhLmRlbCA9ICtkZWxheSB8fCAwO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBBbmltYXRpb24ucmVwZWF0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIGEgY29weSBvZiBleGlzdGluZyBhbmltYXRpb24gb2JqZWN0IHdpdGggZ2l2ZW4gcmVwZXRpdGlvbi5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gcmVwZWF0IChudW1iZXIpIG51bWJlciBpdGVyYXRpb25zIG9mIGFuaW1hdGlvbi4gRm9yIGluZmluaXRlIGFuaW1hdGlvbiBwYXNzIGBJbmZpbml0eWBcbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBuZXcgYWx0ZXJlZCBBbmltYXRpb24gb2JqZWN0XG4gICAgXFwqL1xuICAgIEFuaW1hdGlvbi5wcm90b3R5cGUucmVwZWF0ID0gZnVuY3Rpb24gKHRpbWVzKSB7IFxuICAgICAgICB2YXIgYSA9IG5ldyBBbmltYXRpb24odGhpcy5hbmltLCB0aGlzLm1zKTtcbiAgICAgICAgYS5kZWwgPSB0aGlzLmRlbDtcbiAgICAgICAgYS50aW1lcyA9IG1hdGguZmxvb3IobW1heCh0aW1lcywgMCkpIHx8IDE7XG4gICAgICAgIHJldHVybiBhO1xuICAgIH07XG4gICAgZnVuY3Rpb24gcnVuQW5pbWF0aW9uKGFuaW0sIGVsZW1lbnQsIHBlcmNlbnQsIHN0YXR1cywgdG90YWxPcmlnaW4sIHRpbWVzKSB7XG4gICAgICAgIHBlcmNlbnQgPSB0b0Zsb2F0KHBlcmNlbnQpO1xuICAgICAgICB2YXIgcGFyYW1zLFxuICAgICAgICAgICAgaXNJbkFuaW0sXG4gICAgICAgICAgICBpc0luQW5pbVNldCxcbiAgICAgICAgICAgIHBlcmNlbnRzID0gW10sXG4gICAgICAgICAgICBuZXh0LFxuICAgICAgICAgICAgcHJldixcbiAgICAgICAgICAgIHRpbWVzdGFtcCxcbiAgICAgICAgICAgIG1zID0gYW5pbS5tcyxcbiAgICAgICAgICAgIGZyb20gPSB7fSxcbiAgICAgICAgICAgIHRvID0ge30sXG4gICAgICAgICAgICBkaWZmID0ge307XG4gICAgICAgIGlmIChzdGF0dXMpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGlpID0gYW5pbWF0aW9uRWxlbWVudHMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBlID0gYW5pbWF0aW9uRWxlbWVudHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKGUuZWwuaWQgPT0gZWxlbWVudC5pZCAmJiBlLmFuaW0gPT0gYW5pbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS5wZXJjZW50ICE9IHBlcmNlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkVsZW1lbnRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzSW5BbmltU2V0ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzSW5BbmltID0gZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmF0dHIoZS50b3RhbE9yaWdpbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXR1cyA9ICt0bzsgLy8gTmFOXG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gYW5pbS5wZXJjZW50cy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYW5pbS5wZXJjZW50c1tpXSA9PSBwZXJjZW50IHx8IGFuaW0ucGVyY2VudHNbaV0gPiBzdGF0dXMgKiBhbmltLnRvcCkge1xuICAgICAgICAgICAgICAgIHBlcmNlbnQgPSBhbmltLnBlcmNlbnRzW2ldO1xuICAgICAgICAgICAgICAgIHByZXYgPSBhbmltLnBlcmNlbnRzW2kgLSAxXSB8fCAwO1xuICAgICAgICAgICAgICAgIG1zID0gbXMgLyBhbmltLnRvcCAqIChwZXJjZW50IC0gcHJldik7XG4gICAgICAgICAgICAgICAgbmV4dCA9IGFuaW0ucGVyY2VudHNbaSArIDFdO1xuICAgICAgICAgICAgICAgIHBhcmFtcyA9IGFuaW0uYW5pbVtwZXJjZW50XTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hdHRyKGFuaW0uYW5pbVthbmltLnBlcmNlbnRzW2ldXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFwYXJhbXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzSW5BbmltKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBhdHRyIGluIHBhcmFtcykgaWYgKHBhcmFtc1toYXNdKGF0dHIpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF2YWlsYWJsZUFuaW1BdHRyc1toYXNdKGF0dHIpIHx8IGVsZW1lbnQucGFwZXIuY3VzdG9tQXR0cmlidXRlc1toYXNdKGF0dHIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZyb21bYXR0cl0gPSBlbGVtZW50LmF0dHIoYXR0cik7XG4gICAgICAgICAgICAgICAgICAgIChmcm9tW2F0dHJdID09IG51bGwpICYmIChmcm9tW2F0dHJdID0gYXZhaWxhYmxlQXR0cnNbYXR0cl0pO1xuICAgICAgICAgICAgICAgICAgICB0b1thdHRyXSA9IHBhcmFtc1thdHRyXTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChhdmFpbGFibGVBbmltQXR0cnNbYXR0cl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgbnU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlthdHRyXSA9ICh0b1thdHRyXSAtIGZyb21bYXR0cl0pIC8gbXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiY29sb3VyXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbVthdHRyXSA9IFIuZ2V0UkdCKGZyb21bYXR0cl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0b0NvbG91ciA9IFIuZ2V0UkdCKHRvW2F0dHJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmW2F0dHJdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByOiAodG9Db2xvdXIuciAtIGZyb21bYXR0cl0ucikgLyBtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZzogKHRvQ29sb3VyLmcgLSBmcm9tW2F0dHJdLmcpIC8gbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGI6ICh0b0NvbG91ci5iIC0gZnJvbVthdHRyXS5iKSAvIG1zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJwYXRoXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhdGhlcyA9IHBhdGgyY3VydmUoZnJvbVthdHRyXSwgdG9bYXR0cl0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b1BhdGggPSBwYXRoZXNbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbVthdHRyXSA9IHBhdGhlc1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmW2F0dHJdID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMCwgaWkgPSBmcm9tW2F0dHJdLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlthdHRyXVtpXSA9IFswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDEsIGpqID0gZnJvbVthdHRyXVtpXS5sZW5ndGg7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmW2F0dHJdW2ldW2pdID0gKHRvUGF0aFtpXVtqXSAtIGZyb21bYXR0cl1baV1bal0pIC8gbXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwidHJhbnNmb3JtXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF8gPSBlbGVtZW50Ll8sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVxID0gZXF1YWxpc2VUcmFuc2Zvcm0oX1thdHRyXSwgdG9bYXR0cl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tW2F0dHJdID0gZXEuZnJvbTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9bYXR0cl0gPSBlcS50bztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlthdHRyXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmW2F0dHJdLnJlYWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwLCBpaSA9IGZyb21bYXR0cl0ubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlthdHRyXVtpXSA9IFtmcm9tW2F0dHJdW2ldWzBdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IDEsIGpqID0gZnJvbVthdHRyXVtpXS5sZW5ndGg7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlmZlthdHRyXVtpXVtqXSA9ICh0b1thdHRyXVtpXVtqXSAtIGZyb21bYXR0cl1baV1bal0pIC8gbXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbSA9IChlbGVtZW50Lm1hdHJpeCB8fCBuZXcgTWF0cml4KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvMiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfOiB7dHJhbnNmb3JtOiBfLnRyYW5zZm9ybX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0QkJveDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCQm94KDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21bYXR0cl0gPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0cmFjdFRyYW5zZm9ybSh0bzIsIHRvW2F0dHJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9bYXR0cl0gPSB0bzIuXy50cmFuc2Zvcm07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYXR0cl0gPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodG8yLm1hdHJpeC5hIC0gbS5hKSAvIG1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRvMi5tYXRyaXguYiAtIG0uYikgLyBtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0bzIubWF0cml4LmMgLSBtLmMpIC8gbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodG8yLm1hdHJpeC5kIC0gbS5kKSAvIG1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRvMi5tYXRyaXguZSAtIG0uZSkgLyBtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0bzIubWF0cml4LmYgLSBtLmYpIC8gbXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZnJvbVthdHRyXSA9IFtfLnN4LCBfLnN5LCBfLmRlZywgXy5keCwgXy5keV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHZhciB0bzIgPSB7Xzp7fSwgZ2V0QkJveDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZWxlbWVudC5nZXRCQm94KCk7IH19O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRyYWN0VHJhbnNmb3JtKHRvMiwgdG9bYXR0cl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkaWZmW2F0dHJdID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgKHRvMi5fLnN4IC0gXy5zeCkgLyBtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICh0bzIuXy5zeSAtIF8uc3kpIC8gbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAodG8yLl8uZGVnIC0gXy5kZWcpIC8gbXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAodG8yLl8uZHggLSBfLmR4KSAvIG1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgKHRvMi5fLmR5IC0gXy5keSkgLyBtc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJjc3ZcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWVzID0gU3RyKHBhcmFtc1thdHRyXSlbc3BsaXRdKHNlcGFyYXRvciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20yID0gU3RyKGZyb21bYXR0cl0pW3NwbGl0XShzZXBhcmF0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRyID09IFwiY2xpcC1yZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbVthdHRyXSA9IGZyb20yO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmW2F0dHJdID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgPSBmcm9tMi5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZbYXR0cl1baV0gPSAodmFsdWVzW2ldIC0gZnJvbVthdHRyXVtpXSkgLyBtcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b1thdHRyXSA9IHZhbHVlcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gW11bY29uY2F0XShwYXJhbXNbYXR0cl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20yID0gW11bY29uY2F0XShmcm9tW2F0dHJdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmW2F0dHJdID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSA9IGVsZW1lbnQucGFwZXIuY3VzdG9tQXR0cmlidXRlc1thdHRyXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWZmW2F0dHJdW2ldID0gKCh2YWx1ZXNbaV0gfHwgMCkgLSAoZnJvbTJbaV0gfHwgMCkpIC8gbXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGVhc2luZyA9IHBhcmFtcy5lYXNpbmcsXG4gICAgICAgICAgICAgICAgZWFzeWVhc3kgPSBSLmVhc2luZ19mb3JtdWxhc1tlYXNpbmddO1xuICAgICAgICAgICAgaWYgKCFlYXN5ZWFzeSkge1xuICAgICAgICAgICAgICAgIGVhc3llYXN5ID0gU3RyKGVhc2luZykubWF0Y2goYmV6aWVycmcpO1xuICAgICAgICAgICAgICAgIGlmIChlYXN5ZWFzeSAmJiBlYXN5ZWFzeS5sZW5ndGggPT0gNSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VydmUgPSBlYXN5ZWFzeTtcbiAgICAgICAgICAgICAgICAgICAgZWFzeWVhc3kgPSBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEN1YmljQmV6aWVyQXRUaW1lKHQsICtjdXJ2ZVsxXSwgK2N1cnZlWzJdLCArY3VydmVbM10sICtjdXJ2ZVs0XSwgbXMpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVhc3llYXN5ID0gcGlwZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aW1lc3RhbXAgPSBwYXJhbXMuc3RhcnQgfHwgYW5pbS5zdGFydCB8fCArbmV3IERhdGU7XG4gICAgICAgICAgICBlID0ge1xuICAgICAgICAgICAgICAgIGFuaW06IGFuaW0sXG4gICAgICAgICAgICAgICAgcGVyY2VudDogcGVyY2VudCxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgICBzdGFydDogdGltZXN0YW1wICsgKGFuaW0uZGVsIHx8IDApLFxuICAgICAgICAgICAgICAgIHN0YXR1czogMCxcbiAgICAgICAgICAgICAgICBpbml0c3RhdHVzOiBzdGF0dXMgfHwgMCxcbiAgICAgICAgICAgICAgICBzdG9wOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBtczogbXMsXG4gICAgICAgICAgICAgICAgZWFzaW5nOiBlYXN5ZWFzeSxcbiAgICAgICAgICAgICAgICBmcm9tOiBmcm9tLFxuICAgICAgICAgICAgICAgIGRpZmY6IGRpZmYsXG4gICAgICAgICAgICAgICAgdG86IHRvLFxuICAgICAgICAgICAgICAgIGVsOiBlbGVtZW50LFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBwYXJhbXMuY2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgcHJldjogcHJldixcbiAgICAgICAgICAgICAgICBuZXh0OiBuZXh0LFxuICAgICAgICAgICAgICAgIHJlcGVhdDogdGltZXMgfHwgYW5pbS50aW1lcyxcbiAgICAgICAgICAgICAgICBvcmlnaW46IGVsZW1lbnQuYXR0cigpLFxuICAgICAgICAgICAgICAgIHRvdGFsT3JpZ2luOiB0b3RhbE9yaWdpblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGFuaW1hdGlvbkVsZW1lbnRzLnB1c2goZSk7XG4gICAgICAgICAgICBpZiAoc3RhdHVzICYmICFpc0luQW5pbSAmJiAhaXNJbkFuaW1TZXQpIHtcbiAgICAgICAgICAgICAgICBlLnN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGUuc3RhcnQgPSBuZXcgRGF0ZSAtIG1zICogc3RhdHVzO1xuICAgICAgICAgICAgICAgIGlmIChhbmltYXRpb25FbGVtZW50cy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW5pbWF0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzSW5BbmltU2V0KSB7XG4gICAgICAgICAgICAgICAgZS5zdGFydCA9IG5ldyBEYXRlIC0gZS5tcyAqIHN0YXR1cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFuaW1hdGlvbkVsZW1lbnRzLmxlbmd0aCA9PSAxICYmIHJlcXVlc3RBbmltRnJhbWUoYW5pbWF0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlzSW5BbmltLmluaXRzdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgICAgICBpc0luQW5pbS5zdGFydCA9IG5ldyBEYXRlIC0gaXNJbkFuaW0ubXMgKiBzdGF0dXM7XG4gICAgICAgIH1cbiAgICAgICAgZXZlKFwicmFwaGFlbC5hbmltLnN0YXJ0LlwiICsgZWxlbWVudC5pZCwgZWxlbWVudCwgYW5pbSk7XG4gICAgfVxuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLmFuaW1hdGlvblxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ3JlYXRlcyBhbiBhbmltYXRpb24gb2JqZWN0IHRoYXQgY2FuIGJlIHBhc3NlZCB0byB0aGUgQEVsZW1lbnQuYW5pbWF0ZSBvciBARWxlbWVudC5hbmltYXRlV2l0aCBtZXRob2RzLlxuICAgICAqIFNlZSBhbHNvIEBBbmltYXRpb24uZGVsYXkgYW5kIEBBbmltYXRpb24ucmVwZWF0IG1ldGhvZHMuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHBhcmFtcyAob2JqZWN0KSBmaW5hbCBhdHRyaWJ1dGVzIGZvciB0aGUgZWxlbWVudCwgc2VlIGFsc28gQEVsZW1lbnQuYXR0clxuICAgICAtIG1zIChudW1iZXIpIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZm9yIGFuaW1hdGlvbiB0byBydW5cbiAgICAgLSBlYXNpbmcgKHN0cmluZykgI29wdGlvbmFsIGVhc2luZyB0eXBlLiBBY2NlcHQgb25lIG9mIEBSYXBoYWVsLmVhc2luZ19mb3JtdWxhcyBvciBDU1MgZm9ybWF0OiBgY3ViaWMmI3gyMDEwO2JlemllcihYWCwmIzE2MDtYWCwmIzE2MDtYWCwmIzE2MDtYWClgXG4gICAgIC0gY2FsbGJhY2sgKGZ1bmN0aW9uKSAjb3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24uIFdpbGwgYmUgY2FsbGVkIGF0IHRoZSBlbmQgb2YgYW5pbWF0aW9uLlxuICAgICAqKlxuICAgICA9IChvYmplY3QpIEBBbmltYXRpb25cbiAgICBcXCovXG4gICAgUi5hbmltYXRpb24gPSBmdW5jdGlvbiAocGFyYW1zLCBtcywgZWFzaW5nLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAocGFyYW1zIGluc3RhbmNlb2YgQW5pbWF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgICAgICB9XG4gICAgICAgIGlmIChSLmlzKGVhc2luZywgXCJmdW5jdGlvblwiKSB8fCAhZWFzaW5nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGVhc2luZyB8fCBudWxsO1xuICAgICAgICAgICAgZWFzaW5nID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBwYXJhbXMgPSBPYmplY3QocGFyYW1zKTtcbiAgICAgICAgbXMgPSArbXMgfHwgMDtcbiAgICAgICAgdmFyIHAgPSB7fSxcbiAgICAgICAgICAgIGpzb24sXG4gICAgICAgICAgICBhdHRyO1xuICAgICAgICBmb3IgKGF0dHIgaW4gcGFyYW1zKSBpZiAocGFyYW1zW2hhc10oYXR0cikgJiYgdG9GbG9hdChhdHRyKSAhPSBhdHRyICYmIHRvRmxvYXQoYXR0cikgKyBcIiVcIiAhPSBhdHRyKSB7XG4gICAgICAgICAgICBqc29uID0gdHJ1ZTtcbiAgICAgICAgICAgIHBbYXR0cl0gPSBwYXJhbXNbYXR0cl07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFqc29uKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEFuaW1hdGlvbihwYXJhbXMsIG1zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVhc2luZyAmJiAocC5lYXNpbmcgPSBlYXNpbmcpO1xuICAgICAgICAgICAgY2FsbGJhY2sgJiYgKHAuY2FsbGJhY2sgPSBjYWxsYmFjayk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEFuaW1hdGlvbih7MTAwOiBwfSwgbXMpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5hbmltYXRlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIGFuZCBzdGFydHMgYW5pbWF0aW9uIGZvciBnaXZlbiBlbGVtZW50LlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBwYXJhbXMgKG9iamVjdCkgZmluYWwgYXR0cmlidXRlcyBmb3IgdGhlIGVsZW1lbnQsIHNlZSBhbHNvIEBFbGVtZW50LmF0dHJcbiAgICAgLSBtcyAobnVtYmVyKSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGZvciBhbmltYXRpb24gdG8gcnVuXG4gICAgIC0gZWFzaW5nIChzdHJpbmcpICNvcHRpb25hbCBlYXNpbmcgdHlwZS4gQWNjZXB0IG9uZSBvZiBAUmFwaGFlbC5lYXNpbmdfZm9ybXVsYXMgb3IgQ1NTIGZvcm1hdDogYGN1YmljJiN4MjAxMDtiZXppZXIoWFgsJiMxNjA7WFgsJiMxNjA7WFgsJiMxNjA7WFgpYFxuICAgICAtIGNhbGxiYWNrIChmdW5jdGlvbikgI29wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uLiBXaWxsIGJlIGNhbGxlZCBhdCB0aGUgZW5kIG9mIGFuaW1hdGlvbi5cbiAgICAgKiBvclxuICAgICAtIGFuaW1hdGlvbiAob2JqZWN0KSBhbmltYXRpb24gb2JqZWN0LCBzZWUgQFJhcGhhZWwuYW5pbWF0aW9uXG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgb3JpZ2luYWwgZWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLmFuaW1hdGUgPSBmdW5jdGlvbiAocGFyYW1zLCBtcywgZWFzaW5nLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZWxlbWVudCA9IHRoaXM7XG4gICAgICAgIGlmIChlbGVtZW50LnJlbW92ZWQpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrLmNhbGwoZWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYW5pbSA9IHBhcmFtcyBpbnN0YW5jZW9mIEFuaW1hdGlvbiA/IHBhcmFtcyA6IFIuYW5pbWF0aW9uKHBhcmFtcywgbXMsIGVhc2luZywgY2FsbGJhY2spO1xuICAgICAgICBydW5BbmltYXRpb24oYW5pbSwgZWxlbWVudCwgYW5pbS5wZXJjZW50c1swXSwgbnVsbCwgZWxlbWVudC5hdHRyKCkpO1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnNldFRpbWVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFNldHMgdGhlIHN0YXR1cyBvZiBhbmltYXRpb24gb2YgdGhlIGVsZW1lbnQgaW4gbWlsbGlzZWNvbmRzLiBTaW1pbGFyIHRvIEBFbGVtZW50LnN0YXR1cyBtZXRob2QuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGFuaW0gKG9iamVjdCkgYW5pbWF0aW9uIG9iamVjdFxuICAgICAtIHZhbHVlIChudW1iZXIpIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhbmltYXRpb25cbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBvcmlnaW5hbCBlbGVtZW50IGlmIGB2YWx1ZWAgaXMgc3BlY2lmaWVkXG4gICAgICogTm90ZSwgdGhhdCBkdXJpbmcgYW5pbWF0aW9uIGZvbGxvd2luZyBldmVudHMgYXJlIHRyaWdnZXJlZDpcbiAgICAgKlxuICAgICAqIE9uIGVhY2ggYW5pbWF0aW9uIGZyYW1lIGV2ZW50IGBhbmltLmZyYW1lLjxpZD5gLCBvbiBzdGFydCBgYW5pbS5zdGFydC48aWQ+YCBhbmQgb24gZW5kIGBhbmltLmZpbmlzaC48aWQ+YC5cbiAgICBcXCovXG4gICAgZWxwcm90by5zZXRUaW1lID0gZnVuY3Rpb24gKGFuaW0sIHZhbHVlKSB7XG4gICAgICAgIGlmIChhbmltICYmIHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzKGFuaW0sIG1taW4odmFsdWUsIGFuaW0ubXMpIC8gYW5pbS5tcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5zdGF0dXNcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEdldHMgb3Igc2V0cyB0aGUgc3RhdHVzIG9mIGFuaW1hdGlvbiBvZiB0aGUgZWxlbWVudC5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gYW5pbSAob2JqZWN0KSAjb3B0aW9uYWwgYW5pbWF0aW9uIG9iamVjdFxuICAgICAtIHZhbHVlIChudW1iZXIpICNvcHRpb25hbCAwIOKAkyAxLiBJZiBzcGVjaWZpZWQsIG1ldGhvZCB3b3JrcyBsaWtlIGEgc2V0dGVyIGFuZCBzZXRzIHRoZSBzdGF0dXMgb2YgYSBnaXZlbiBhbmltYXRpb24gdG8gdGhlIHZhbHVlLiBUaGlzIHdpbGwgY2F1c2UgYW5pbWF0aW9uIHRvIGp1bXAgdG8gdGhlIGdpdmVuIHBvc2l0aW9uLlxuICAgICAqKlxuICAgICA9IChudW1iZXIpIHN0YXR1c1xuICAgICAqIG9yXG4gICAgID0gKGFycmF5KSBzdGF0dXMgaWYgYGFuaW1gIGlzIG5vdCBzcGVjaWZpZWQuIEFycmF5IG9mIG9iamVjdHMgaW4gZm9ybWF0OlxuICAgICBvIHtcbiAgICAgbyAgICAgYW5pbTogKG9iamVjdCkgYW5pbWF0aW9uIG9iamVjdFxuICAgICBvICAgICBzdGF0dXM6IChudW1iZXIpIHN0YXR1c1xuICAgICBvIH1cbiAgICAgKiBvclxuICAgICA9IChvYmplY3QpIG9yaWdpbmFsIGVsZW1lbnQgaWYgYHZhbHVlYCBpcyBzcGVjaWZpZWRcbiAgICBcXCovXG4gICAgZWxwcm90by5zdGF0dXMgPSBmdW5jdGlvbiAoYW5pbSwgdmFsdWUpIHtcbiAgICAgICAgdmFyIG91dCA9IFtdLFxuICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICBsZW4sXG4gICAgICAgICAgICBlO1xuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgcnVuQW5pbWF0aW9uKGFuaW0sIHRoaXMsIC0xLCBtbWluKHZhbHVlLCAxKSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlbiA9IGFuaW1hdGlvbkVsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBlID0gYW5pbWF0aW9uRWxlbWVudHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKGUuZWwuaWQgPT0gdGhpcy5pZCAmJiAoIWFuaW0gfHwgZS5hbmltID09IGFuaW0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS5zdGF0dXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb3V0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbTogZS5hbmltLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBlLnN0YXR1c1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQucGF1c2VcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFN0b3BzIGFuaW1hdGlvbiBvZiB0aGUgZWxlbWVudCB3aXRoIGFiaWxpdHkgdG8gcmVzdW1lIGl0IGxhdGVyIG9uLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBhbmltIChvYmplY3QpICNvcHRpb25hbCBhbmltYXRpb24gb2JqZWN0XG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgb3JpZ2luYWwgZWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLnBhdXNlID0gZnVuY3Rpb24gKGFuaW0pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbmltYXRpb25FbGVtZW50cy5sZW5ndGg7IGkrKykgaWYgKGFuaW1hdGlvbkVsZW1lbnRzW2ldLmVsLmlkID09IHRoaXMuaWQgJiYgKCFhbmltIHx8IGFuaW1hdGlvbkVsZW1lbnRzW2ldLmFuaW0gPT0gYW5pbSkpIHtcbiAgICAgICAgICAgIGlmIChldmUoXCJyYXBoYWVsLmFuaW0ucGF1c2UuXCIgKyB0aGlzLmlkLCB0aGlzLCBhbmltYXRpb25FbGVtZW50c1tpXS5hbmltKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBhbmltYXRpb25FbGVtZW50c1tpXS5wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQucmVzdW1lXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXN1bWVzIGFuaW1hdGlvbiBpZiBpdCB3YXMgcGF1c2VkIHdpdGggQEVsZW1lbnQucGF1c2UgbWV0aG9kLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBhbmltIChvYmplY3QpICNvcHRpb25hbCBhbmltYXRpb24gb2JqZWN0XG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgb3JpZ2luYWwgZWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLnJlc3VtZSA9IGZ1bmN0aW9uIChhbmltKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5pbWF0aW9uRWxlbWVudHMubGVuZ3RoOyBpKyspIGlmIChhbmltYXRpb25FbGVtZW50c1tpXS5lbC5pZCA9PSB0aGlzLmlkICYmICghYW5pbSB8fCBhbmltYXRpb25FbGVtZW50c1tpXS5hbmltID09IGFuaW0pKSB7XG4gICAgICAgICAgICB2YXIgZSA9IGFuaW1hdGlvbkVsZW1lbnRzW2ldO1xuICAgICAgICAgICAgaWYgKGV2ZShcInJhcGhhZWwuYW5pbS5yZXN1bWUuXCIgKyB0aGlzLmlkLCB0aGlzLCBlLmFuaW0pICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBlLnBhdXNlZDtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXR1cyhlLmFuaW0sIGUuc3RhdHVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnN0b3BcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFN0b3BzIGFuaW1hdGlvbiBvZiB0aGUgZWxlbWVudC5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gYW5pbSAob2JqZWN0KSAjb3B0aW9uYWwgYW5pbWF0aW9uIG9iamVjdFxuICAgICAqKlxuICAgICA9IChvYmplY3QpIG9yaWdpbmFsIGVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5zdG9wID0gZnVuY3Rpb24gKGFuaW0pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbmltYXRpb25FbGVtZW50cy5sZW5ndGg7IGkrKykgaWYgKGFuaW1hdGlvbkVsZW1lbnRzW2ldLmVsLmlkID09IHRoaXMuaWQgJiYgKCFhbmltIHx8IGFuaW1hdGlvbkVsZW1lbnRzW2ldLmFuaW0gPT0gYW5pbSkpIHtcbiAgICAgICAgICAgIGlmIChldmUoXCJyYXBoYWVsLmFuaW0uc3RvcC5cIiArIHRoaXMuaWQsIHRoaXMsIGFuaW1hdGlvbkVsZW1lbnRzW2ldLmFuaW0pICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbkVsZW1lbnRzLnNwbGljZShpLS0sIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZnVuY3Rpb24gc3RvcEFuaW1hdGlvbihwYXBlcikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuaW1hdGlvbkVsZW1lbnRzLmxlbmd0aDsgaSsrKSBpZiAoYW5pbWF0aW9uRWxlbWVudHNbaV0uZWwucGFwZXIgPT0gcGFwZXIpIHtcbiAgICAgICAgICAgIGFuaW1hdGlvbkVsZW1lbnRzLnNwbGljZShpLS0sIDEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGV2ZS5vbihcInJhcGhhZWwucmVtb3ZlXCIsIHN0b3BBbmltYXRpb24pO1xuICAgIGV2ZS5vbihcInJhcGhhZWwuY2xlYXJcIiwgc3RvcEFuaW1hdGlvbik7XG4gICAgZWxwcm90by50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFwiUmFwaGFcXHhlYmxcXHUyMDE5cyBvYmplY3RcIjtcbiAgICB9O1xuXG4gICAgLy8gU2V0XG4gICAgdmFyIFNldCA9IGZ1bmN0aW9uIChpdGVtcykge1xuICAgICAgICB0aGlzLml0ZW1zID0gW107XG4gICAgICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgICAgICAgdGhpcy50eXBlID0gXCJzZXRcIjtcbiAgICAgICAgaWYgKGl0ZW1zKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBpdGVtcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1zW2ldICYmIChpdGVtc1tpXS5jb25zdHJ1Y3RvciA9PSBlbHByb3RvLmNvbnN0cnVjdG9yIHx8IGl0ZW1zW2ldLmNvbnN0cnVjdG9yID09IFNldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpc1t0aGlzLml0ZW1zLmxlbmd0aF0gPSB0aGlzLml0ZW1zW3RoaXMuaXRlbXMubGVuZ3RoXSA9IGl0ZW1zW2ldO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxlbmd0aCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgc2V0cHJvdG8gPSBTZXQucHJvdG90eXBlO1xuICAgIC8qXFxcbiAgICAgKiBTZXQucHVzaFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBlYWNoIGFyZ3VtZW50IHRvIHRoZSBjdXJyZW50IHNldC5cbiAgICAgPSAob2JqZWN0KSBvcmlnaW5hbCBlbGVtZW50XG4gICAgXFwqL1xuICAgIHNldHByb3RvLnB1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpdGVtLFxuICAgICAgICAgICAgbGVuO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgaXRlbSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGlmIChpdGVtICYmIChpdGVtLmNvbnN0cnVjdG9yID09IGVscHJvdG8uY29uc3RydWN0b3IgfHwgaXRlbS5jb25zdHJ1Y3RvciA9PSBTZXQpKSB7XG4gICAgICAgICAgICAgICAgbGVuID0gdGhpcy5pdGVtcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdGhpc1tsZW5dID0gdGhpcy5pdGVtc1tsZW5dID0gaXRlbTtcbiAgICAgICAgICAgICAgICB0aGlzLmxlbmd0aCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNldC5wb3BcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgbGFzdCBlbGVtZW50IGFuZCByZXR1cm5zIGl0LlxuICAgICA9IChvYmplY3QpIGVsZW1lbnRcbiAgICBcXCovXG4gICAgc2V0cHJvdG8ucG9wID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxlbmd0aCAmJiBkZWxldGUgdGhpc1t0aGlzLmxlbmd0aC0tXTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbXMucG9wKCk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU2V0LmZvckVhY2hcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEV4ZWN1dGVzIGdpdmVuIGZ1bmN0aW9uIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIHNldC5cbiAgICAgKlxuICAgICAqIElmIGZ1bmN0aW9uIHJldHVybnMgYGZhbHNlYCBpdCB3aWxsIHN0b3AgbG9vcCBydW5uaW5nLlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBjYWxsYmFjayAoZnVuY3Rpb24pIGZ1bmN0aW9uIHRvIHJ1blxuICAgICAtIHRoaXNBcmcgKG9iamVjdCkgY29udGV4dCBvYmplY3QgZm9yIHRoZSBjYWxsYmFja1xuICAgICA9IChvYmplY3QpIFNldCBvYmplY3RcbiAgICBcXCovXG4gICAgc2V0cHJvdG8uZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc0FyZykge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSB0aGlzLml0ZW1zLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHRoaXMuaXRlbXNbaV0sIGkpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZm9yICh2YXIgbWV0aG9kIGluIGVscHJvdG8pIGlmIChlbHByb3RvW2hhc10obWV0aG9kKSkge1xuICAgICAgICBzZXRwcm90b1ttZXRob2RdID0gKGZ1bmN0aW9uIChtZXRob2RuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBhcmcgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxbbWV0aG9kbmFtZV1bYXBwbHldKGVsLCBhcmcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSkobWV0aG9kKTtcbiAgICB9XG4gICAgc2V0cHJvdG8uYXR0ciA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgICBpZiAobmFtZSAmJiBSLmlzKG5hbWUsIGFycmF5KSAmJiBSLmlzKG5hbWVbMF0sIFwib2JqZWN0XCIpKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMCwgamogPSBuYW1lLmxlbmd0aDsgaiA8IGpqOyBqKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zW2pdLmF0dHIobmFtZVtqXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSB0aGlzLml0ZW1zLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zW2ldLmF0dHIobmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNldC5jbGVhclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlZHMgYWxsIGVsZW1lbnRzIGZyb20gdGhlIHNldFxuICAgIFxcKi9cbiAgICBzZXRwcm90by5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnBvcCgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU2V0LnNwbGljZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBnaXZlbiBlbGVtZW50IGZyb20gdGhlIHNldFxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBpbmRleCAobnVtYmVyKSBwb3NpdGlvbiBvZiB0aGUgZGVsZXRpb25cbiAgICAgLSBjb3VudCAobnVtYmVyKSBudW1iZXIgb2YgZWxlbWVudCB0byByZW1vdmVcbiAgICAgLSBpbnNlcnRpb27igKYgKG9iamVjdCkgI29wdGlvbmFsIGVsZW1lbnRzIHRvIGluc2VydFxuICAgICA9IChvYmplY3QpIHNldCBlbGVtZW50cyB0aGF0IHdlcmUgZGVsZXRlZFxuICAgIFxcKi9cbiAgICBzZXRwcm90by5zcGxpY2UgPSBmdW5jdGlvbiAoaW5kZXgsIGNvdW50LCBpbnNlcnRpb24pIHtcbiAgICAgICAgaW5kZXggPSBpbmRleCA8IDAgPyBtbWF4KHRoaXMubGVuZ3RoICsgaW5kZXgsIDApIDogaW5kZXg7XG4gICAgICAgIGNvdW50ID0gbW1heCgwLCBtbWluKHRoaXMubGVuZ3RoIC0gaW5kZXgsIGNvdW50KSk7XG4gICAgICAgIHZhciB0YWlsID0gW10sXG4gICAgICAgICAgICB0b2RlbCA9IFtdLFxuICAgICAgICAgICAgYXJncyA9IFtdLFxuICAgICAgICAgICAgaTtcbiAgICAgICAgZm9yIChpID0gMjsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJncy5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHRvZGVsLnB1c2godGhpc1tpbmRleCArIGldKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKDsgaSA8IHRoaXMubGVuZ3RoIC0gaW5kZXg7IGkrKykge1xuICAgICAgICAgICAgdGFpbC5wdXNoKHRoaXNbaW5kZXggKyBpXSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFyZ2xlbiA9IGFyZ3MubGVuZ3RoO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYXJnbGVuICsgdGFpbC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5pdGVtc1tpbmRleCArIGldID0gdGhpc1tpbmRleCArIGldID0gaSA8IGFyZ2xlbiA/IGFyZ3NbaV0gOiB0YWlsW2kgLSBhcmdsZW5dO1xuICAgICAgICB9XG4gICAgICAgIGkgPSB0aGlzLml0ZW1zLmxlbmd0aCA9IHRoaXMubGVuZ3RoIC09IGNvdW50IC0gYXJnbGVuO1xuICAgICAgICB3aGlsZSAodGhpc1tpXSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXNbaSsrXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFNldCh0b2RlbCk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU2V0LmV4Y2x1ZGVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgZ2l2ZW4gZWxlbWVudCBmcm9tIHRoZSBzZXRcbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gZWxlbWVudCAob2JqZWN0KSBlbGVtZW50IHRvIHJlbW92ZVxuICAgICA9IChib29sZWFuKSBgdHJ1ZWAgaWYgb2JqZWN0IHdhcyBmb3VuZCAmIHJlbW92ZWQgZnJvbSB0aGUgc2V0XG4gICAgXFwqL1xuICAgIHNldHByb3RvLmV4Y2x1ZGUgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gdGhpcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSBpZiAodGhpc1tpXSA9PSBlbCkge1xuICAgICAgICAgICAgdGhpcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgc2V0cHJvdG8uYW5pbWF0ZSA9IGZ1bmN0aW9uIChwYXJhbXMsIG1zLCBlYXNpbmcsIGNhbGxiYWNrKSB7XG4gICAgICAgIChSLmlzKGVhc2luZywgXCJmdW5jdGlvblwiKSB8fCAhZWFzaW5nKSAmJiAoY2FsbGJhY2sgPSBlYXNpbmcgfHwgbnVsbCk7XG4gICAgICAgIHZhciBsZW4gPSB0aGlzLml0ZW1zLmxlbmd0aCxcbiAgICAgICAgICAgIGkgPSBsZW4sXG4gICAgICAgICAgICBpdGVtLFxuICAgICAgICAgICAgc2V0ID0gdGhpcyxcbiAgICAgICAgICAgIGNvbGxlY3RvcjtcbiAgICAgICAgaWYgKCFsZW4pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrICYmIChjb2xsZWN0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAhLS1sZW4gJiYgY2FsbGJhY2suY2FsbChzZXQpO1xuICAgICAgICB9KTtcbiAgICAgICAgZWFzaW5nID0gUi5pcyhlYXNpbmcsIHN0cmluZykgPyBlYXNpbmcgOiBjb2xsZWN0b3I7XG4gICAgICAgIHZhciBhbmltID0gUi5hbmltYXRpb24ocGFyYW1zLCBtcywgZWFzaW5nLCBjb2xsZWN0b3IpO1xuICAgICAgICBpdGVtID0gdGhpcy5pdGVtc1stLWldLmFuaW1hdGUoYW5pbSk7XG4gICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0gJiYgIXRoaXMuaXRlbXNbaV0ucmVtb3ZlZCAmJiB0aGlzLml0ZW1zW2ldLmFuaW1hdGVXaXRoKGl0ZW0sIGFuaW0sIGFuaW0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgc2V0cHJvdG8uaW5zZXJ0QWZ0ZXIgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgdmFyIGkgPSB0aGlzLml0ZW1zLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgdGhpcy5pdGVtc1tpXS5pbnNlcnRBZnRlcihlbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBzZXRwcm90by5nZXRCQm94ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgeCA9IFtdLFxuICAgICAgICAgICAgeSA9IFtdLFxuICAgICAgICAgICAgeDIgPSBbXSxcbiAgICAgICAgICAgIHkyID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSB0aGlzLml0ZW1zLmxlbmd0aDsgaS0tOykgaWYgKCF0aGlzLml0ZW1zW2ldLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHZhciBib3ggPSB0aGlzLml0ZW1zW2ldLmdldEJCb3goKTtcbiAgICAgICAgICAgIHgucHVzaChib3gueCk7XG4gICAgICAgICAgICB5LnB1c2goYm94LnkpO1xuICAgICAgICAgICAgeDIucHVzaChib3gueCArIGJveC53aWR0aCk7XG4gICAgICAgICAgICB5Mi5wdXNoKGJveC55ICsgYm94LmhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgeCA9IG1taW5bYXBwbHldKDAsIHgpO1xuICAgICAgICB5ID0gbW1pblthcHBseV0oMCwgeSk7XG4gICAgICAgIHgyID0gbW1heFthcHBseV0oMCwgeDIpO1xuICAgICAgICB5MiA9IG1tYXhbYXBwbHldKDAsIHkyKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgeDI6IHgyLFxuICAgICAgICAgICAgeTI6IHkyLFxuICAgICAgICAgICAgd2lkdGg6IHgyIC0geCxcbiAgICAgICAgICAgIGhlaWdodDogeTIgLSB5XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBzZXRwcm90by5jbG9uZSA9IGZ1bmN0aW9uIChzKSB7XG4gICAgICAgIHMgPSB0aGlzLnBhcGVyLnNldCgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSB0aGlzLml0ZW1zLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgIHMucHVzaCh0aGlzLml0ZW1zW2ldLmNsb25lKCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzO1xuICAgIH07XG4gICAgc2V0cHJvdG8udG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBcIlJhcGhhXFx4ZWJsXFx1MjAxOHMgc2V0XCI7XG4gICAgfTtcblxuICAgIHNldHByb3RvLmdsb3cgPSBmdW5jdGlvbihnbG93Q29uZmlnKSB7XG4gICAgICAgIHZhciByZXQgPSB0aGlzLnBhcGVyLnNldCgpO1xuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oc2hhcGUsIGluZGV4KXtcbiAgICAgICAgICAgIHZhciBnID0gc2hhcGUuZ2xvdyhnbG93Q29uZmlnKTtcbiAgICAgICAgICAgIGlmKGcgIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgZy5mb3JFYWNoKGZ1bmN0aW9uKHNoYXBlMiwgaW5kZXgyKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goc2hhcGUyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfTtcblxuICAgIC8qXFxcbiAgICAgKiBSYXBoYWVsLnJlZ2lzdGVyRm9udFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBnaXZlbiBmb250IHRvIHRoZSByZWdpc3RlcmVkIHNldCBvZiBmb250cyBmb3IgUmFwaGHDq2wuIFNob3VsZCBiZSB1c2VkIGFzIGFuIGludGVybmFsIGNhbGwgZnJvbSB3aXRoaW4gQ3Vmw7Nu4oCZcyBmb250IGZpbGUuXG4gICAgICogUmV0dXJucyBvcmlnaW5hbCBwYXJhbWV0ZXIsIHNvIGl0IGNvdWxkIGJlIHVzZWQgd2l0aCBjaGFpbmluZy5cbiAgICAgIyA8YSBocmVmPVwiaHR0cDovL3dpa2kuZ2l0aHViLmNvbS9zb3JjY3UvY3Vmb24vYWJvdXRcIj5Nb3JlIGFib3V0IEN1ZsOzbiBhbmQgaG93IHRvIGNvbnZlcnQgeW91ciBmb250IGZvcm0gVFRGLCBPVEYsIGV0YyB0byBKYXZhU2NyaXB0IGZpbGUuPC9hPlxuICAgICAqKlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgKipcbiAgICAgLSBmb250IChvYmplY3QpIHRoZSBmb250IHRvIHJlZ2lzdGVyXG4gICAgID0gKG9iamVjdCkgdGhlIGZvbnQgeW91IHBhc3NlZCBpblxuICAgICA+IFVzYWdlXG4gICAgIHwgQ3Vmb24ucmVnaXN0ZXJGb250KFJhcGhhZWwucmVnaXN0ZXJGb250KHvigKZ9KSk7XG4gICAgXFwqL1xuICAgIFIucmVnaXN0ZXJGb250ID0gZnVuY3Rpb24gKGZvbnQpIHtcbiAgICAgICAgaWYgKCFmb250LmZhY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmb250O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZm9udHMgPSB0aGlzLmZvbnRzIHx8IHt9O1xuICAgICAgICB2YXIgZm9udGNvcHkgPSB7XG4gICAgICAgICAgICAgICAgdzogZm9udC53LFxuICAgICAgICAgICAgICAgIGZhY2U6IHt9LFxuICAgICAgICAgICAgICAgIGdseXBoczoge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYW1pbHkgPSBmb250LmZhY2VbXCJmb250LWZhbWlseVwiXTtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBmb250LmZhY2UpIGlmIChmb250LmZhY2VbaGFzXShwcm9wKSkge1xuICAgICAgICAgICAgZm9udGNvcHkuZmFjZVtwcm9wXSA9IGZvbnQuZmFjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5mb250c1tmYW1pbHldKSB7XG4gICAgICAgICAgICB0aGlzLmZvbnRzW2ZhbWlseV0ucHVzaChmb250Y29weSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmZvbnRzW2ZhbWlseV0gPSBbZm9udGNvcHldO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZm9udC5zdmcpIHtcbiAgICAgICAgICAgIGZvbnRjb3B5LmZhY2VbXCJ1bml0cy1wZXItZW1cIl0gPSB0b0ludChmb250LmZhY2VbXCJ1bml0cy1wZXItZW1cIl0sIDEwKTtcbiAgICAgICAgICAgIGZvciAodmFyIGdseXBoIGluIGZvbnQuZ2x5cGhzKSBpZiAoZm9udC5nbHlwaHNbaGFzXShnbHlwaCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGF0aCA9IGZvbnQuZ2x5cGhzW2dseXBoXTtcbiAgICAgICAgICAgICAgICBmb250Y29weS5nbHlwaHNbZ2x5cGhdID0ge1xuICAgICAgICAgICAgICAgICAgICB3OiBwYXRoLncsXG4gICAgICAgICAgICAgICAgICAgIGs6IHt9LFxuICAgICAgICAgICAgICAgICAgICBkOiBwYXRoLmQgJiYgXCJNXCIgKyBwYXRoLmQucmVwbGFjZSgvW21sY3h0cnZdL2csIGZ1bmN0aW9uIChjb21tYW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtsOiBcIkxcIiwgYzogXCJDXCIsIHg6IFwielwiLCB0OiBcIm1cIiwgcjogXCJsXCIsIHY6IFwiY1wifVtjb21tYW5kXSB8fCBcIk1cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pICsgXCJ6XCJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmIChwYXRoLmspIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiBwYXRoLmspIGlmIChwYXRoW2hhc10oaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRjb3B5LmdseXBoc1tnbHlwaF0ua1trXSA9IHBhdGgua1trXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZm9udDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5nZXRGb250XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBGaW5kcyBmb250IG9iamVjdCBpbiB0aGUgcmVnaXN0ZXJlZCBmb250cyBieSBnaXZlbiBwYXJhbWV0ZXJzLiBZb3UgY291bGQgc3BlY2lmeSBvbmx5IG9uZSB3b3JkIGZyb20gdGhlIGZvbnQgbmFtZSwgbGlrZSDigJxNeXJpYWTigJ0gZm9yIOKAnE15cmlhZCBQcm/igJ0uXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIGZhbWlseSAoc3RyaW5nKSBmb250IGZhbWlseSBuYW1lIG9yIGFueSB3b3JkIGZyb20gaXRcbiAgICAgLSB3ZWlnaHQgKHN0cmluZykgI29wdGlvbmFsIGZvbnQgd2VpZ2h0XG4gICAgIC0gc3R5bGUgKHN0cmluZykgI29wdGlvbmFsIGZvbnQgc3R5bGVcbiAgICAgLSBzdHJldGNoIChzdHJpbmcpICNvcHRpb25hbCBmb250IHN0cmV0Y2hcbiAgICAgPSAob2JqZWN0KSB0aGUgZm9udCBvYmplY3RcbiAgICAgPiBVc2FnZVxuICAgICB8IHBhcGVyLnByaW50KDEwMCwgMTAwLCBcIlRlc3Qgc3RyaW5nXCIsIHBhcGVyLmdldEZvbnQoXCJUaW1lc1wiLCA4MDApLCAzMCk7XG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8uZ2V0Rm9udCA9IGZ1bmN0aW9uIChmYW1pbHksIHdlaWdodCwgc3R5bGUsIHN0cmV0Y2gpIHtcbiAgICAgICAgc3RyZXRjaCA9IHN0cmV0Y2ggfHwgXCJub3JtYWxcIjtcbiAgICAgICAgc3R5bGUgPSBzdHlsZSB8fCBcIm5vcm1hbFwiO1xuICAgICAgICB3ZWlnaHQgPSArd2VpZ2h0IHx8IHtub3JtYWw6IDQwMCwgYm9sZDogNzAwLCBsaWdodGVyOiAzMDAsIGJvbGRlcjogODAwfVt3ZWlnaHRdIHx8IDQwMDtcbiAgICAgICAgaWYgKCFSLmZvbnRzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZvbnQgPSBSLmZvbnRzW2ZhbWlseV07XG4gICAgICAgIGlmICghZm9udCkge1xuICAgICAgICAgICAgdmFyIG5hbWUgPSBuZXcgUmVnRXhwKFwiKF58XFxcXHMpXCIgKyBmYW1pbHkucmVwbGFjZSgvW15cXHdcXGRcXHMrIX4uOl8tXS9nLCBFKSArIFwiKFxcXFxzfCQpXCIsIFwiaVwiKTtcbiAgICAgICAgICAgIGZvciAodmFyIGZvbnROYW1lIGluIFIuZm9udHMpIGlmIChSLmZvbnRzW2hhc10oZm9udE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUudGVzdChmb250TmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9udCA9IFIuZm9udHNbZm9udE5hbWVdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRoZWZvbnQ7XG4gICAgICAgIGlmIChmb250KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBmb250Lmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGVmb250ID0gZm9udFtpXTtcbiAgICAgICAgICAgICAgICBpZiAodGhlZm9udC5mYWNlW1wiZm9udC13ZWlnaHRcIl0gPT0gd2VpZ2h0ICYmICh0aGVmb250LmZhY2VbXCJmb250LXN0eWxlXCJdID09IHN0eWxlIHx8ICF0aGVmb250LmZhY2VbXCJmb250LXN0eWxlXCJdKSAmJiB0aGVmb250LmZhY2VbXCJmb250LXN0cmV0Y2hcIl0gPT0gc3RyZXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoZWZvbnQ7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIucHJpbnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgcGF0aCB0aGF0IHJlcHJlc2VudCBnaXZlbiB0ZXh0IHdyaXR0ZW4gdXNpbmcgZ2l2ZW4gZm9udCBhdCBnaXZlbiBwb3NpdGlvbiB3aXRoIGdpdmVuIHNpemUuXG4gICAgICogUmVzdWx0IG9mIHRoZSBtZXRob2QgaXMgcGF0aCBlbGVtZW50IHRoYXQgY29udGFpbnMgd2hvbGUgdGV4dCBhcyBhIHNlcGFyYXRlIHBhdGguXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHggKG51bWJlcikgeCBwb3NpdGlvbiBvZiB0aGUgdGV4dFxuICAgICAtIHkgKG51bWJlcikgeSBwb3NpdGlvbiBvZiB0aGUgdGV4dFxuICAgICAtIHN0cmluZyAoc3RyaW5nKSB0ZXh0IHRvIHByaW50XG4gICAgIC0gZm9udCAob2JqZWN0KSBmb250IG9iamVjdCwgc2VlIEBQYXBlci5nZXRGb250XG4gICAgIC0gc2l6ZSAobnVtYmVyKSAjb3B0aW9uYWwgc2l6ZSBvZiB0aGUgZm9udCwgZGVmYXVsdCBpcyBgMTZgXG4gICAgIC0gb3JpZ2luIChzdHJpbmcpICNvcHRpb25hbCBjb3VsZCBiZSBgXCJiYXNlbGluZVwiYCBvciBgXCJtaWRkbGVcImAsIGRlZmF1bHQgaXMgYFwibWlkZGxlXCJgXG4gICAgIC0gbGV0dGVyX3NwYWNpbmcgKG51bWJlcikgI29wdGlvbmFsIG51bWJlciBpbiByYW5nZSBgLTEuLjFgLCBkZWZhdWx0IGlzIGAwYFxuICAgICA9IChvYmplY3QpIHJlc3VsdGluZyBwYXRoIGVsZW1lbnQsIHdoaWNoIGNvbnNpc3Qgb2YgYWxsIGxldHRlcnNcbiAgICAgPiBVc2FnZVxuICAgICB8IHZhciB0eHQgPSByLnByaW50KDEwLCA1MCwgXCJwcmludFwiLCByLmdldEZvbnQoXCJNdXNlb1wiKSwgMzApLmF0dHIoe2ZpbGw6IFwiI2ZmZlwifSk7XG4gICAgXFwqL1xuICAgIHBhcGVycHJvdG8ucHJpbnQgPSBmdW5jdGlvbiAoeCwgeSwgc3RyaW5nLCBmb250LCBzaXplLCBvcmlnaW4sIGxldHRlcl9zcGFjaW5nKSB7XG4gICAgICAgIG9yaWdpbiA9IG9yaWdpbiB8fCBcIm1pZGRsZVwiOyAvLyBiYXNlbGluZXxtaWRkbGVcbiAgICAgICAgbGV0dGVyX3NwYWNpbmcgPSBtbWF4KG1taW4obGV0dGVyX3NwYWNpbmcgfHwgMCwgMSksIC0xKTtcbiAgICAgICAgdmFyIGxldHRlcnMgPSBTdHIoc3RyaW5nKVtzcGxpdF0oRSksXG4gICAgICAgICAgICBzaGlmdCA9IDAsXG4gICAgICAgICAgICBub3RmaXJzdCA9IDAsXG4gICAgICAgICAgICBwYXRoID0gRSxcbiAgICAgICAgICAgIHNjYWxlO1xuICAgICAgICBSLmlzKGZvbnQsIFwic3RyaW5nXCIpICYmIChmb250ID0gdGhpcy5nZXRGb250KGZvbnQpKTtcbiAgICAgICAgaWYgKGZvbnQpIHtcbiAgICAgICAgICAgIHNjYWxlID0gKHNpemUgfHwgMTYpIC8gZm9udC5mYWNlW1widW5pdHMtcGVyLWVtXCJdO1xuICAgICAgICAgICAgdmFyIGJiID0gZm9udC5mYWNlLmJib3hbc3BsaXRdKHNlcGFyYXRvciksXG4gICAgICAgICAgICAgICAgdG9wID0gK2JiWzBdLFxuICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQgPSBiYlszXSAtIGJiWzFdLFxuICAgICAgICAgICAgICAgIHNoaWZ0eSA9IDAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gK2JiWzFdICsgKG9yaWdpbiA9PSBcImJhc2VsaW5lXCIgPyBsaW5lSGVpZ2h0ICsgKCtmb250LmZhY2UuZGVzY2VudCkgOiBsaW5lSGVpZ2h0IC8gMik7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBsZXR0ZXJzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAobGV0dGVyc1tpXSA9PSBcIlxcblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHNoaWZ0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgY3VyciA9IDA7XG4gICAgICAgICAgICAgICAgICAgIG5vdGZpcnN0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgc2hpZnR5ICs9IGxpbmVIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByZXYgPSBub3RmaXJzdCAmJiBmb250LmdseXBoc1tsZXR0ZXJzW2kgLSAxXV0gfHwge30sXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyID0gZm9udC5nbHlwaHNbbGV0dGVyc1tpXV07XG4gICAgICAgICAgICAgICAgICAgIHNoaWZ0ICs9IG5vdGZpcnN0ID8gKHByZXYudyB8fCBmb250LncpICsgKHByZXYuayAmJiBwcmV2LmtbbGV0dGVyc1tpXV0gfHwgMCkgKyAoZm9udC53ICogbGV0dGVyX3NwYWNpbmcpIDogMDtcbiAgICAgICAgICAgICAgICAgICAgbm90Zmlyc3QgPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY3VyciAmJiBjdXJyLmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aCArPSBSLnRyYW5zZm9ybVBhdGgoY3Vyci5kLCBbXCJ0XCIsIHNoaWZ0ICogc2NhbGUsIHNoaWZ0eSAqIHNjYWxlLCBcInNcIiwgc2NhbGUsIHNjYWxlLCB0b3AsIGhlaWdodCwgXCJ0XCIsICh4IC0gdG9wKSAvIHNjYWxlLCAoeSAtIGhlaWdodCkgLyBzY2FsZV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5wYXRoKHBhdGgpLmF0dHIoe1xuICAgICAgICAgICAgZmlsbDogXCIjMDAwXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwibm9uZVwiXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKlxcXG4gICAgICogUGFwZXIuYWRkXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBJbXBvcnRzIGVsZW1lbnRzIGluIEpTT04gYXJyYXkgaW4gZm9ybWF0IGB7dHlwZTogdHlwZSwgPGF0dHJpYnV0ZXM+fWBcbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0ganNvbiAoYXJyYXkpXG4gICAgID0gKG9iamVjdCkgcmVzdWx0aW5nIHNldCBvZiBpbXBvcnRlZCBlbGVtZW50c1xuICAgICA+IFVzYWdlXG4gICAgIHwgcGFwZXIuYWRkKFtcbiAgICAgfCAgICAge1xuICAgICB8ICAgICAgICAgdHlwZTogXCJjaXJjbGVcIixcbiAgICAgfCAgICAgICAgIGN4OiAxMCxcbiAgICAgfCAgICAgICAgIGN5OiAxMCxcbiAgICAgfCAgICAgICAgIHI6IDVcbiAgICAgfCAgICAgfSxcbiAgICAgfCAgICAge1xuICAgICB8ICAgICAgICAgdHlwZTogXCJyZWN0XCIsXG4gICAgIHwgICAgICAgICB4OiAxMCxcbiAgICAgfCAgICAgICAgIHk6IDEwLFxuICAgICB8ICAgICAgICAgd2lkdGg6IDEwLFxuICAgICB8ICAgICAgICAgaGVpZ2h0OiAxMCxcbiAgICAgfCAgICAgICAgIGZpbGw6IFwiI2ZjMFwiXG4gICAgIHwgICAgIH1cbiAgICAgfCBdKTtcbiAgICBcXCovXG4gICAgcGFwZXJwcm90by5hZGQgPSBmdW5jdGlvbiAoanNvbikge1xuICAgICAgICBpZiAoUi5pcyhqc29uLCBcImFycmF5XCIpKSB7XG4gICAgICAgICAgICB2YXIgcmVzID0gdGhpcy5zZXQoKSxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBpaSA9IGpzb24ubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGo7XG4gICAgICAgICAgICBmb3IgKDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICBqID0ganNvbltpXSB8fCB7fTtcbiAgICAgICAgICAgICAgICBlbGVtZW50c1toYXNdKGoudHlwZSkgJiYgcmVzLnB1c2godGhpc1tqLnR5cGVdKCkuYXR0cihqKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuXG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuZm9ybWF0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBTaW1wbGUgZm9ybWF0IGZ1bmN0aW9uLiBSZXBsYWNlcyBjb25zdHJ1Y3Rpb24gb2YgdHlwZSDigJxgezxudW1iZXI+fWDigJ0gdG8gdGhlIGNvcnJlc3BvbmRpbmcgYXJndW1lbnQuXG4gICAgICoqXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAqKlxuICAgICAtIHRva2VuIChzdHJpbmcpIHN0cmluZyB0byBmb3JtYXRcbiAgICAgLSDigKYgKHN0cmluZykgcmVzdCBvZiBhcmd1bWVudHMgd2lsbCBiZSB0cmVhdGVkIGFzIHBhcmFtZXRlcnMgZm9yIHJlcGxhY2VtZW50XG4gICAgID0gKHN0cmluZykgZm9ybWF0ZWQgc3RyaW5nXG4gICAgID4gVXNhZ2VcbiAgICAgfCB2YXIgeCA9IDEwLFxuICAgICB8ICAgICB5ID0gMjAsXG4gICAgIHwgICAgIHdpZHRoID0gNDAsXG4gICAgIHwgICAgIGhlaWdodCA9IDUwO1xuICAgICB8IC8vIHRoaXMgd2lsbCBkcmF3IGEgcmVjdGFuZ3VsYXIgc2hhcGUgZXF1aXZhbGVudCB0byBcIk0xMCwyMGg0MHY1MGgtNDB6XCJcbiAgICAgfCBwYXBlci5wYXRoKFJhcGhhZWwuZm9ybWF0KFwiTXswfSx7MX1oezJ9dnszfWh7NH16XCIsIHgsIHksIHdpZHRoLCBoZWlnaHQsIC13aWR0aCkpO1xuICAgIFxcKi9cbiAgICBSLmZvcm1hdCA9IGZ1bmN0aW9uICh0b2tlbiwgcGFyYW1zKSB7XG4gICAgICAgIHZhciBhcmdzID0gUi5pcyhwYXJhbXMsIGFycmF5KSA/IFswXVtjb25jYXRdKHBhcmFtcykgOiBhcmd1bWVudHM7XG4gICAgICAgIHRva2VuICYmIFIuaXModG9rZW4sIHN0cmluZykgJiYgYXJncy5sZW5ndGggLSAxICYmICh0b2tlbiA9IHRva2VuLnJlcGxhY2UoZm9ybWF0cmcsIGZ1bmN0aW9uIChzdHIsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiBhcmdzWysraV0gPT0gbnVsbCA/IEUgOiBhcmdzW2ldO1xuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiB0b2tlbiB8fCBFO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFJhcGhhZWwuZnVsbGZpbGxcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEEgbGl0dGxlIGJpdCBtb3JlIGFkdmFuY2VkIGZvcm1hdCBmdW5jdGlvbiB0aGFuIEBSYXBoYWVsLmZvcm1hdC4gUmVwbGFjZXMgY29uc3RydWN0aW9uIG9mIHR5cGUg4oCcYHs8bmFtZT59YOKAnSB0byB0aGUgY29ycmVzcG9uZGluZyBhcmd1bWVudC5cbiAgICAgKipcbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgICoqXG4gICAgIC0gdG9rZW4gKHN0cmluZykgc3RyaW5nIHRvIGZvcm1hdFxuICAgICAtIGpzb24gKG9iamVjdCkgb2JqZWN0IHdoaWNoIHByb3BlcnRpZXMgd2lsbCBiZSB1c2VkIGFzIGEgcmVwbGFjZW1lbnRcbiAgICAgPSAoc3RyaW5nKSBmb3JtYXRlZCBzdHJpbmdcbiAgICAgPiBVc2FnZVxuICAgICB8IC8vIHRoaXMgd2lsbCBkcmF3IGEgcmVjdGFuZ3VsYXIgc2hhcGUgZXF1aXZhbGVudCB0byBcIk0xMCwyMGg0MHY1MGgtNDB6XCJcbiAgICAgfCBwYXBlci5wYXRoKFJhcGhhZWwuZnVsbGZpbGwoXCJNe3h9LHt5fWh7ZGltLndpZHRofXZ7ZGltLmhlaWdodH1oe2RpbVsnbmVnYXRpdmUgd2lkdGgnXX16XCIsIHtcbiAgICAgfCAgICAgeDogMTAsXG4gICAgIHwgICAgIHk6IDIwLFxuICAgICB8ICAgICBkaW06IHtcbiAgICAgfCAgICAgICAgIHdpZHRoOiA0MCxcbiAgICAgfCAgICAgICAgIGhlaWdodDogNTAsXG4gICAgIHwgICAgICAgICBcIm5lZ2F0aXZlIHdpZHRoXCI6IC00MFxuICAgICB8ICAgICB9XG4gICAgIHwgfSkpO1xuICAgIFxcKi9cbiAgICBSLmZ1bGxmaWxsID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRva2VuUmVnZXggPSAvXFx7KFteXFx9XSspXFx9L2csXG4gICAgICAgICAgICBvYmpOb3RhdGlvblJlZ2V4ID0gLyg/Oig/Ol58XFwuKSguKz8pKD89XFxbfFxcLnwkfFxcKCl8XFxbKCd8XCIpKC4rPylcXDJcXF0pKFxcKFxcKSk/L2csIC8vIG1hdGNoZXMgLnh4eHh4IG9yIFtcInh4eHh4XCJdIHRvIHJ1biBvdmVyIG9iamVjdCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICByZXBsYWNlciA9IGZ1bmN0aW9uIChhbGwsIGtleSwgb2JqKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlcyA9IG9iajtcbiAgICAgICAgICAgICAgICBrZXkucmVwbGFjZShvYmpOb3RhdGlvblJlZ2V4LCBmdW5jdGlvbiAoYWxsLCBuYW1lLCBxdW90ZSwgcXVvdGVkTmFtZSwgaXNGdW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lIHx8IHF1b3RlZE5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuYW1lIGluIHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IHJlc1tuYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiByZXMgPT0gXCJmdW5jdGlvblwiICYmIGlzRnVuYyAmJiAocmVzID0gcmVzKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmVzID0gKHJlcyA9PSBudWxsIHx8IHJlcyA9PSBvYmogPyBhbGwgOiByZXMpICsgXCJcIjtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzdHIsIG9iaikge1xuICAgICAgICAgICAgcmV0dXJuIFN0cmluZyhzdHIpLnJlcGxhY2UodG9rZW5SZWdleCwgZnVuY3Rpb24gKGFsbCwga2V5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VyKGFsbCwga2V5LCBvYmopO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfSkoKTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5uaW5qYVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogSWYgeW91IHdhbnQgdG8gbGVhdmUgbm8gdHJhY2Ugb2YgUmFwaGHDq2wgKFdlbGwsIFJhcGhhw6tsIGNyZWF0ZXMgb25seSBvbmUgZ2xvYmFsIHZhcmlhYmxlIGBSYXBoYWVsYCwgYnV0IGFueXdheS4pIFlvdSBjYW4gdXNlIGBuaW5qYWAgbWV0aG9kLlxuICAgICAqIEJld2FyZSwgdGhhdCBpbiB0aGlzIGNhc2UgcGx1Z2lucyBjb3VsZCBzdG9wIHdvcmtpbmcsIGJlY2F1c2UgdGhleSBhcmUgZGVwZW5kaW5nIG9uIGdsb2JhbCB2YXJpYWJsZSBleGlzdGFuY2UuXG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgUmFwaGFlbCBvYmplY3RcbiAgICAgPiBVc2FnZVxuICAgICB8IChmdW5jdGlvbiAobG9jYWxfcmFwaGFlbCkge1xuICAgICB8ICAgICB2YXIgcGFwZXIgPSBsb2NhbF9yYXBoYWVsKDEwLCAxMCwgMzIwLCAyMDApO1xuICAgICB8ICAgICDigKZcbiAgICAgfCB9KShSYXBoYWVsLm5pbmphKCkpO1xuICAgIFxcKi9cbiAgICBSLm5pbmphID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBvbGRSYXBoYWVsLndhcyA/IChnLndpbi5SYXBoYWVsID0gb2xkUmFwaGFlbC5pcykgOiBkZWxldGUgUmFwaGFlbDtcbiAgICAgICAgcmV0dXJuIFI7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUmFwaGFlbC5zdFxuICAgICBbIHByb3BlcnR5IChvYmplY3QpIF1cbiAgICAgKipcbiAgICAgKiBZb3UgY2FuIGFkZCB5b3VyIG93biBtZXRob2QgdG8gZWxlbWVudHMgYW5kIHNldHMuIEl0IGlzIHdpc2UgdG8gYWRkIGEgc2V0IG1ldGhvZCBmb3IgZWFjaCBlbGVtZW50IG1ldGhvZFxuICAgICAqIHlvdSBhZGRlZCwgc28geW91IHdpbGwgYmUgYWJsZSB0byBjYWxsIHRoZSBzYW1lIG1ldGhvZCBvbiBzZXRzIHRvby5cbiAgICAgKipcbiAgICAgKiBTZWUgYWxzbyBAUmFwaGFlbC5lbC5cbiAgICAgPiBVc2FnZVxuICAgICB8IFJhcGhhZWwuZWwucmVkID0gZnVuY3Rpb24gKCkge1xuICAgICB8ICAgICB0aGlzLmF0dHIoe2ZpbGw6IFwiI2YwMFwifSk7XG4gICAgIHwgfTtcbiAgICAgfCBSYXBoYWVsLnN0LnJlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgfCAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICB8ICAgICAgICAgZWwucmVkKCk7XG4gICAgIHwgICAgIH0pO1xuICAgICB8IH07XG4gICAgIHwgLy8gdGhlbiB1c2UgaXRcbiAgICAgfCBwYXBlci5zZXQocGFwZXIuY2lyY2xlKDEwMCwgMTAwLCAyMCksIHBhcGVyLmNpcmNsZSgxMTAsIDEwMCwgMjApKS5yZWQoKTtcbiAgICBcXCovXG4gICAgUi5zdCA9IHNldHByb3RvO1xuICAgIC8vIEZpcmVmb3ggPDMuNiBmaXg6IGh0dHA6Ly93ZWJyZWZsZWN0aW9uLmJsb2dzcG90LmNvbS8yMDA5LzExLzE5NS1jaGFycy10by1oZWxwLWxhenktbG9hZGluZy5odG1sXG4gICAgKGZ1bmN0aW9uIChkb2MsIGxvYWRlZCwgZikge1xuICAgICAgICBpZiAoZG9jLnJlYWR5U3RhdGUgPT0gbnVsbCAmJiBkb2MuYWRkRXZlbnRMaXN0ZW5lcil7XG4gICAgICAgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcihsb2FkZWQsIGYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIobG9hZGVkLCBmLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgZG9jLnJlYWR5U3RhdGUgPSBcImNvbXBsZXRlXCI7XG4gICAgICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgICAgICBkb2MucmVhZHlTdGF0ZSA9IFwibG9hZGluZ1wiO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGlzTG9hZGVkKCkge1xuICAgICAgICAgICAgKC9pbi8pLnRlc3QoZG9jLnJlYWR5U3RhdGUpID8gc2V0VGltZW91dChpc0xvYWRlZCwgOSkgOiBSLmV2ZShcInJhcGhhZWwuRE9NbG9hZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpc0xvYWRlZCgpO1xuICAgIH0pKGRvY3VtZW50LCBcIkRPTUNvbnRlbnRMb2FkZWRcIik7XG5cbiAgICBvbGRSYXBoYWVsLndhcyA/IChnLndpbi5SYXBoYWVsID0gUikgOiAoUmFwaGFlbCA9IFIpO1xuICAgIFxuICAgIGV2ZS5vbihcInJhcGhhZWwuRE9NbG9hZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxvYWRlZCA9IHRydWU7XG4gICAgfSk7XG5cbiAgICByZXF1aXJlKCcuL3JhcGhhZWwuc3ZnJyk7XG4gICAgcmVxdWlyZSgnLi9yYXBoYWVsLnZtbCcpO1xuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBSYXBoYWVsO1xufSkoKTtcbiIsIi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkCBcXFxcXG4vLyDilIIgUmFwaGHDq2wgLSBKYXZhU2NyaXB0IFZlY3RvciBMaWJyYXJ5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIFxcXFxcbi8vIOKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpCBcXFxcXG4vLyDilIIgU1ZHIE1vZHVsZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgXFxcXFxuLy8g4pSc4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkIFxcXFxcbi8vIOKUgiBDb3B5cmlnaHQgKGMpIDIwMDgtMjAxMSBEbWl0cnkgQmFyYW5vdnNraXkgKGh0dHA6Ly9yYXBoYWVsanMuY29tKSAgIOKUgiBcXFxcXG4vLyDilIIgQ29weXJpZ2h0IChjKSAyMDA4LTIwMTEgU2VuY2hhIExhYnMgKGh0dHA6Ly9zZW5jaGEuY29tKSAgICAgICAgICAgICDilIIgXFxcXFxuLy8g4pSCIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgKGh0dHA6Ly9yYXBoYWVsanMuY29tL2xpY2Vuc2UuaHRtbCkgbGljZW5zZS4g4pSCIFxcXFxcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmCBcXFxcXG53aW5kb3cuUmFwaGFlbCAmJiB3aW5kb3cuUmFwaGFlbC5zdmcgJiYgZnVuY3Rpb24gKFIpIHtcbiAgICB2YXIgaGFzID0gXCJoYXNPd25Qcm9wZXJ0eVwiLFxuICAgICAgICBTdHIgPSBTdHJpbmcsXG4gICAgICAgIHRvRmxvYXQgPSBwYXJzZUZsb2F0LFxuICAgICAgICB0b0ludCA9IHBhcnNlSW50LFxuICAgICAgICBtYXRoID0gTWF0aCxcbiAgICAgICAgbW1heCA9IG1hdGgubWF4LFxuICAgICAgICBhYnMgPSBtYXRoLmFicyxcbiAgICAgICAgcG93ID0gbWF0aC5wb3csXG4gICAgICAgIHNlcGFyYXRvciA9IC9bLCBdKy8sXG4gICAgICAgIGV2ZSA9IFIuZXZlLFxuICAgICAgICBFID0gXCJcIixcbiAgICAgICAgUyA9IFwiIFwiO1xuICAgIHZhciB4bGluayA9IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLFxuICAgICAgICBtYXJrZXJzID0ge1xuICAgICAgICAgICAgYmxvY2s6IFwiTTUsMCAwLDIuNSA1LDV6XCIsXG4gICAgICAgICAgICBjbGFzc2ljOiBcIk01LDAgMCwyLjUgNSw1IDMuNSwzIDMuNSwyelwiLFxuICAgICAgICAgICAgZGlhbW9uZDogXCJNMi41LDAgNSwyLjUgMi41LDUgMCwyLjV6XCIsXG4gICAgICAgICAgICBvcGVuOiBcIk02LDEgMSwzLjUgNiw2XCIsXG4gICAgICAgICAgICBvdmFsOiBcIk0yLjUsMEEyLjUsMi41LDAsMCwxLDIuNSw1IDIuNSwyLjUsMCwwLDEsMi41LDB6XCJcbiAgICAgICAgfSxcbiAgICAgICAgbWFya2VyQ291bnRlciA9IHt9O1xuICAgIFIudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAgXCJZb3VyIGJyb3dzZXIgc3VwcG9ydHMgU1ZHLlxcbllvdSBhcmUgcnVubmluZyBSYXBoYVxceGVibCBcIiArIHRoaXMudmVyc2lvbjtcbiAgICB9O1xuICAgIHZhciAkID0gZnVuY3Rpb24gKGVsLCBhdHRyKSB7XG4gICAgICAgIGlmIChhdHRyKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGVsID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBlbCA9ICQoZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGF0dHIpIGlmIChhdHRyW2hhc10oa2V5KSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXkuc3Vic3RyaW5nKDAsIDYpID09IFwieGxpbms6XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlTlMoeGxpbmssIGtleS5zdWJzdHJpbmcoNiksIFN0cihhdHRyW2tleV0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBTdHIoYXR0cltrZXldKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWwgPSBSLl9nLmRvYy5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBlbCk7XG4gICAgICAgICAgICBlbC5zdHlsZSAmJiAoZWwuc3R5bGUud2Via2l0VGFwSGlnaGxpZ2h0Q29sb3IgPSBcInJnYmEoMCwwLDAsMClcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG4gICAgYWRkR3JhZGllbnRGaWxsID0gZnVuY3Rpb24gKGVsZW1lbnQsIGdyYWRpZW50KSB7XG4gICAgICAgIHZhciB0eXBlID0gXCJsaW5lYXJcIixcbiAgICAgICAgICAgIGlkID0gZWxlbWVudC5pZCArIGdyYWRpZW50LFxuICAgICAgICAgICAgZnggPSAuNSwgZnkgPSAuNSxcbiAgICAgICAgICAgIG8gPSBlbGVtZW50Lm5vZGUsXG4gICAgICAgICAgICBTVkcgPSBlbGVtZW50LnBhcGVyLFxuICAgICAgICAgICAgcyA9IG8uc3R5bGUsXG4gICAgICAgICAgICBlbCA9IFIuX2cuZG9jLmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgICAgZ3JhZGllbnQgPSBTdHIoZ3JhZGllbnQpLnJlcGxhY2UoUi5fcmFkaWFsX2dyYWRpZW50LCBmdW5jdGlvbiAoYWxsLCBfZngsIF9meSkge1xuICAgICAgICAgICAgICAgIHR5cGUgPSBcInJhZGlhbFwiO1xuICAgICAgICAgICAgICAgIGlmIChfZnggJiYgX2Z5KSB7XG4gICAgICAgICAgICAgICAgICAgIGZ4ID0gdG9GbG9hdChfZngpO1xuICAgICAgICAgICAgICAgICAgICBmeSA9IHRvRmxvYXQoX2Z5KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpciA9ICgoZnkgPiAuNSkgKiAyIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIHBvdyhmeCAtIC41LCAyKSArIHBvdyhmeSAtIC41LCAyKSA+IC4yNSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgKGZ5ID0gbWF0aC5zcXJ0KC4yNSAtIHBvdyhmeCAtIC41LCAyKSkgKiBkaXIgKyAuNSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ5ICE9IC41ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAoZnkgPSBmeS50b0ZpeGVkKDUpIC0gMWUtNSAqIGRpcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBFO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBncmFkaWVudCA9IGdyYWRpZW50LnNwbGl0KC9cXHMqXFwtXFxzKi8pO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT0gXCJsaW5lYXJcIikge1xuICAgICAgICAgICAgICAgIHZhciBhbmdsZSA9IGdyYWRpZW50LnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgYW5nbGUgPSAtdG9GbG9hdChhbmdsZSk7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKGFuZ2xlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHZlY3RvciA9IFswLCAwLCBtYXRoLmNvcyhSLnJhZChhbmdsZSkpLCBtYXRoLnNpbihSLnJhZChhbmdsZSkpXSxcbiAgICAgICAgICAgICAgICAgICAgbWF4ID0gMSAvIChtbWF4KGFicyh2ZWN0b3JbMl0pLCBhYnModmVjdG9yWzNdKSkgfHwgMSk7XG4gICAgICAgICAgICAgICAgdmVjdG9yWzJdICo9IG1heDtcbiAgICAgICAgICAgICAgICB2ZWN0b3JbM10gKj0gbWF4O1xuICAgICAgICAgICAgICAgIGlmICh2ZWN0b3JbMl0gPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlY3RvclswXSA9IC12ZWN0b3JbMl07XG4gICAgICAgICAgICAgICAgICAgIHZlY3RvclsyXSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh2ZWN0b3JbM10gPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlY3RvclsxXSA9IC12ZWN0b3JbM107XG4gICAgICAgICAgICAgICAgICAgIHZlY3RvclszXSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRvdHMgPSBSLl9wYXJzZURvdHMoZ3JhZGllbnQpO1xuICAgICAgICAgICAgaWYgKCFkb3RzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZCA9IGlkLnJlcGxhY2UoL1tcXChcXClcXHMsXFx4YjAjXS9nLCBcIl9cIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmdyYWRpZW50ICYmIGlkICE9IGVsZW1lbnQuZ3JhZGllbnQuaWQpIHtcbiAgICAgICAgICAgICAgICBTVkcuZGVmcy5yZW1vdmVDaGlsZChlbGVtZW50LmdyYWRpZW50KTtcbiAgICAgICAgICAgICAgICBkZWxldGUgZWxlbWVudC5ncmFkaWVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFlbGVtZW50LmdyYWRpZW50KSB7XG4gICAgICAgICAgICAgICAgZWwgPSAkKHR5cGUgKyBcIkdyYWRpZW50XCIsIHtpZDogaWR9KTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmdyYWRpZW50ID0gZWw7XG4gICAgICAgICAgICAgICAgJChlbCwgdHlwZSA9PSBcInJhZGlhbFwiID8ge1xuICAgICAgICAgICAgICAgICAgICBmeDogZngsXG4gICAgICAgICAgICAgICAgICAgIGZ5OiBmeVxuICAgICAgICAgICAgICAgIH0gOiB7XG4gICAgICAgICAgICAgICAgICAgIHgxOiB2ZWN0b3JbMF0sXG4gICAgICAgICAgICAgICAgICAgIHkxOiB2ZWN0b3JbMV0sXG4gICAgICAgICAgICAgICAgICAgIHgyOiB2ZWN0b3JbMl0sXG4gICAgICAgICAgICAgICAgICAgIHkyOiB2ZWN0b3JbM10sXG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50VHJhbnNmb3JtOiBlbGVtZW50Lm1hdHJpeC5pbnZlcnQoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFNWRy5kZWZzLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBkb3RzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgZWwuYXBwZW5kQ2hpbGQoJChcInN0b3BcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiBkb3RzW2ldLm9mZnNldCA/IGRvdHNbaV0ub2Zmc2V0IDogaSA/IFwiMTAwJVwiIDogXCIwJVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9wLWNvbG9yXCI6IGRvdHNbaV0uY29sb3IgfHwgXCIjZmZmXCJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAkKG8sIHtcbiAgICAgICAgICAgIGZpbGw6IFwidXJsKCNcIiArIGlkICsgXCIpXCIsXG4gICAgICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICAgICAgXCJmaWxsLW9wYWNpdHlcIjogMVxuICAgICAgICB9KTtcbiAgICAgICAgcy5maWxsID0gRTtcbiAgICAgICAgcy5vcGFjaXR5ID0gMTtcbiAgICAgICAgcy5maWxsT3BhY2l0eSA9IDE7XG4gICAgICAgIHJldHVybiAxO1xuICAgIH0sXG4gICAgdXBkYXRlUG9zaXRpb24gPSBmdW5jdGlvbiAobykge1xuICAgICAgICB2YXIgYmJveCA9IG8uZ2V0QkJveCgxKTtcbiAgICAgICAgJChvLnBhdHRlcm4sIHtwYXR0ZXJuVHJhbnNmb3JtOiBvLm1hdHJpeC5pbnZlcnQoKSArIFwiIHRyYW5zbGF0ZShcIiArIGJib3gueCArIFwiLFwiICsgYmJveC55ICsgXCIpXCJ9KTtcbiAgICB9LFxuICAgIGFkZEFycm93ID0gZnVuY3Rpb24gKG8sIHZhbHVlLCBpc0VuZCkge1xuICAgICAgICBpZiAoby50eXBlID09IFwicGF0aFwiKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gU3RyKHZhbHVlKS50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiLVwiKSxcbiAgICAgICAgICAgICAgICBwID0gby5wYXBlcixcbiAgICAgICAgICAgICAgICBzZSA9IGlzRW5kID8gXCJlbmRcIiA6IFwic3RhcnRcIixcbiAgICAgICAgICAgICAgICBub2RlID0gby5ub2RlLFxuICAgICAgICAgICAgICAgIGF0dHJzID0gby5hdHRycyxcbiAgICAgICAgICAgICAgICBzdHJva2UgPSBhdHRyc1tcInN0cm9rZS13aWR0aFwiXSxcbiAgICAgICAgICAgICAgICBpID0gdmFsdWVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICB0eXBlID0gXCJjbGFzc2ljXCIsXG4gICAgICAgICAgICAgICAgZnJvbSxcbiAgICAgICAgICAgICAgICB0byxcbiAgICAgICAgICAgICAgICBkeCxcbiAgICAgICAgICAgICAgICByZWZYLFxuICAgICAgICAgICAgICAgIGF0dHIsXG4gICAgICAgICAgICAgICAgdyA9IDMsXG4gICAgICAgICAgICAgICAgaCA9IDMsXG4gICAgICAgICAgICAgICAgdCA9IDU7XG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh2YWx1ZXNbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImJsb2NrXCI6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJjbGFzc2ljXCI6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJvdmFsXCI6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJkaWFtb25kXCI6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJvcGVuXCI6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJub25lXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlID0gdmFsdWVzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ3aWRlXCI6IGggPSA1OyBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm5hcnJvd1wiOiBoID0gMjsgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJsb25nXCI6IHcgPSA1OyBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInNob3J0XCI6IHcgPSAyOyBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZSA9PSBcIm9wZW5cIikge1xuICAgICAgICAgICAgICAgIHcgKz0gMjtcbiAgICAgICAgICAgICAgICBoICs9IDI7XG4gICAgICAgICAgICAgICAgdCArPSAyO1xuICAgICAgICAgICAgICAgIGR4ID0gMTtcbiAgICAgICAgICAgICAgICByZWZYID0gaXNFbmQgPyA0IDogMTtcbiAgICAgICAgICAgICAgICBhdHRyID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxsOiBcIm5vbmVcIixcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlOiBhdHRycy5zdHJva2VcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWZYID0gZHggPSB3IC8gMjtcbiAgICAgICAgICAgICAgICBhdHRyID0ge1xuICAgICAgICAgICAgICAgICAgICBmaWxsOiBhdHRycy5zdHJva2UsXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZTogXCJub25lXCJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG8uXy5hcnJvd3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgby5fLmFycm93cy5lbmRQYXRoICYmIG1hcmtlckNvdW50ZXJbby5fLmFycm93cy5lbmRQYXRoXS0tO1xuICAgICAgICAgICAgICAgICAgICBvLl8uYXJyb3dzLmVuZE1hcmtlciAmJiBtYXJrZXJDb3VudGVyW28uXy5hcnJvd3MuZW5kTWFya2VyXS0tO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG8uXy5hcnJvd3Muc3RhcnRQYXRoICYmIG1hcmtlckNvdW50ZXJbby5fLmFycm93cy5zdGFydFBhdGhdLS07XG4gICAgICAgICAgICAgICAgICAgIG8uXy5hcnJvd3Muc3RhcnRNYXJrZXIgJiYgbWFya2VyQ291bnRlcltvLl8uYXJyb3dzLnN0YXJ0TWFya2VyXS0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgby5fLmFycm93cyA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGUgIT0gXCJub25lXCIpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGF0aElkID0gXCJyYXBoYWVsLW1hcmtlci1cIiArIHR5cGUsXG4gICAgICAgICAgICAgICAgICAgIG1hcmtlcklkID0gXCJyYXBoYWVsLW1hcmtlci1cIiArIHNlICsgdHlwZSArIHcgKyBoO1xuICAgICAgICAgICAgICAgIGlmICghUi5fZy5kb2MuZ2V0RWxlbWVudEJ5SWQocGF0aElkKSkge1xuICAgICAgICAgICAgICAgICAgICBwLmRlZnMuYXBwZW5kQ2hpbGQoJCgkKFwicGF0aFwiKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHJva2UtbGluZWNhcFwiOiBcInJvdW5kXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkOiBtYXJrZXJzW3R5cGVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHBhdGhJZFxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlckNvdW50ZXJbcGF0aElkXSA9IDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyQ291bnRlcltwYXRoSWRdKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBSLl9nLmRvYy5nZXRFbGVtZW50QnlJZChtYXJrZXJJZCksXG4gICAgICAgICAgICAgICAgICAgIHVzZTtcbiAgICAgICAgICAgICAgICBpZiAoIW1hcmtlcikge1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXIgPSAkKCQoXCJtYXJrZXJcIiksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBtYXJrZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlckhlaWdodDogaCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlcldpZHRoOiB3LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZW50OiBcImF1dG9cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZlg6IHJlZlgsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZZOiBoIC8gMlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdXNlID0gJCgkKFwidXNlXCIpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInhsaW5rOmhyZWZcIjogXCIjXCIgKyBwYXRoSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IChpc0VuZCA/IFwicm90YXRlKDE4MCBcIiArIHcgLyAyICsgXCIgXCIgKyBoIC8gMiArIFwiKSBcIiA6IEUpICsgXCJzY2FsZShcIiArIHcgLyB0ICsgXCIsXCIgKyBoIC8gdCArIFwiKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHJva2Utd2lkdGhcIjogKDEgLyAoKHcgLyB0ICsgaCAvIHQpIC8gMikpLnRvRml4ZWQoNClcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlci5hcHBlbmRDaGlsZCh1c2UpO1xuICAgICAgICAgICAgICAgICAgICBwLmRlZnMuYXBwZW5kQ2hpbGQobWFya2VyKTtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyQ291bnRlclttYXJrZXJJZF0gPSAxO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlckNvdW50ZXJbbWFya2VySWRdKys7XG4gICAgICAgICAgICAgICAgICAgIHVzZSA9IG1hcmtlci5nZXRFbGVtZW50c0J5VGFnTmFtZShcInVzZVwiKVswXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJCh1c2UsIGF0dHIpO1xuICAgICAgICAgICAgICAgIHZhciBkZWx0YSA9IGR4ICogKHR5cGUgIT0gXCJkaWFtb25kXCIgJiYgdHlwZSAhPSBcIm92YWxcIik7XG4gICAgICAgICAgICAgICAgaWYgKGlzRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSBvLl8uYXJyb3dzLnN0YXJ0ZHggKiBzdHJva2UgfHwgMDtcbiAgICAgICAgICAgICAgICAgICAgdG8gPSBSLmdldFRvdGFsTGVuZ3RoKGF0dHJzLnBhdGgpIC0gZGVsdGEgKiBzdHJva2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbSA9IGRlbHRhICogc3Ryb2tlO1xuICAgICAgICAgICAgICAgICAgICB0byA9IFIuZ2V0VG90YWxMZW5ndGgoYXR0cnMucGF0aCkgLSAoby5fLmFycm93cy5lbmRkeCAqIHN0cm9rZSB8fCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXR0ciA9IHt9O1xuICAgICAgICAgICAgICAgIGF0dHJbXCJtYXJrZXItXCIgKyBzZV0gPSBcInVybCgjXCIgKyBtYXJrZXJJZCArIFwiKVwiO1xuICAgICAgICAgICAgICAgIGlmICh0byB8fCBmcm9tKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHIuZCA9IFJhcGhhZWwuZ2V0U3VicGF0aChhdHRycy5wYXRoLCBmcm9tLCB0byk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICQobm9kZSwgYXR0cik7XG4gICAgICAgICAgICAgICAgby5fLmFycm93c1tzZSArIFwiUGF0aFwiXSA9IHBhdGhJZDtcbiAgICAgICAgICAgICAgICBvLl8uYXJyb3dzW3NlICsgXCJNYXJrZXJcIl0gPSBtYXJrZXJJZDtcbiAgICAgICAgICAgICAgICBvLl8uYXJyb3dzW3NlICsgXCJkeFwiXSA9IGRlbHRhO1xuICAgICAgICAgICAgICAgIG8uXy5hcnJvd3Nbc2UgKyBcIlR5cGVcIl0gPSB0eXBlO1xuICAgICAgICAgICAgICAgIG8uXy5hcnJvd3Nbc2UgKyBcIlN0cmluZ1wiXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbSA9IG8uXy5hcnJvd3Muc3RhcnRkeCAqIHN0cm9rZSB8fCAwO1xuICAgICAgICAgICAgICAgICAgICB0byA9IFIuZ2V0VG90YWxMZW5ndGgoYXR0cnMucGF0aCkgLSBmcm9tO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSAwO1xuICAgICAgICAgICAgICAgICAgICB0byA9IFIuZ2V0VG90YWxMZW5ndGgoYXR0cnMucGF0aCkgLSAoby5fLmFycm93cy5lbmRkeCAqIHN0cm9rZSB8fCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgby5fLmFycm93c1tzZSArIFwiUGF0aFwiXSAmJiAkKG5vZGUsIHtkOiBSYXBoYWVsLmdldFN1YnBhdGgoYXR0cnMucGF0aCwgZnJvbSwgdG8pfSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG8uXy5hcnJvd3Nbc2UgKyBcIlBhdGhcIl07XG4gICAgICAgICAgICAgICAgZGVsZXRlIG8uXy5hcnJvd3Nbc2UgKyBcIk1hcmtlclwiXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgby5fLmFycm93c1tzZSArIFwiZHhcIl07XG4gICAgICAgICAgICAgICAgZGVsZXRlIG8uXy5hcnJvd3Nbc2UgKyBcIlR5cGVcIl07XG4gICAgICAgICAgICAgICAgZGVsZXRlIG8uXy5hcnJvd3Nbc2UgKyBcIlN0cmluZ1wiXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoYXR0ciBpbiBtYXJrZXJDb3VudGVyKSBpZiAobWFya2VyQ291bnRlcltoYXNdKGF0dHIpICYmICFtYXJrZXJDb3VudGVyW2F0dHJdKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBSLl9nLmRvYy5nZXRFbGVtZW50QnlJZChhdHRyKTtcbiAgICAgICAgICAgICAgICBpdGVtICYmIGl0ZW0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgZGFzaGFycmF5ID0ge1xuICAgICAgICBcIlwiOiBbMF0sXG4gICAgICAgIFwibm9uZVwiOiBbMF0sXG4gICAgICAgIFwiLVwiOiBbMywgMV0sXG4gICAgICAgIFwiLlwiOiBbMSwgMV0sXG4gICAgICAgIFwiLS5cIjogWzMsIDEsIDEsIDFdLFxuICAgICAgICBcIi0uLlwiOiBbMywgMSwgMSwgMSwgMSwgMV0sXG4gICAgICAgIFwiLiBcIjogWzEsIDNdLFxuICAgICAgICBcIi0gXCI6IFs0LCAzXSxcbiAgICAgICAgXCItLVwiOiBbOCwgM10sXG4gICAgICAgIFwiLSAuXCI6IFs0LCAzLCAxLCAzXSxcbiAgICAgICAgXCItLS5cIjogWzgsIDMsIDEsIDNdLFxuICAgICAgICBcIi0tLi5cIjogWzgsIDMsIDEsIDMsIDEsIDNdXG4gICAgfSxcbiAgICBhZGREYXNoZXMgPSBmdW5jdGlvbiAobywgdmFsdWUsIHBhcmFtcykge1xuICAgICAgICB2YWx1ZSA9IGRhc2hhcnJheVtTdHIodmFsdWUpLnRvTG93ZXJDYXNlKCldO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciB3aWR0aCA9IG8uYXR0cnNbXCJzdHJva2Utd2lkdGhcIl0gfHwgXCIxXCIsXG4gICAgICAgICAgICAgICAgYnV0dCA9IHtyb3VuZDogd2lkdGgsIHNxdWFyZTogd2lkdGgsIGJ1dHQ6IDB9W28uYXR0cnNbXCJzdHJva2UtbGluZWNhcFwiXSB8fCBwYXJhbXNbXCJzdHJva2UtbGluZWNhcFwiXV0gfHwgMCxcbiAgICAgICAgICAgICAgICBkYXNoZXMgPSBbXSxcbiAgICAgICAgICAgICAgICBpID0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgIGRhc2hlc1tpXSA9IHZhbHVlW2ldICogd2lkdGggKyAoKGkgJSAyKSA/IDEgOiAtMSkgKiBidXR0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJChvLm5vZGUsIHtcInN0cm9rZS1kYXNoYXJyYXlcIjogZGFzaGVzLmpvaW4oXCIsXCIpfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNldEZpbGxBbmRTdHJva2UgPSBmdW5jdGlvbiAobywgcGFyYW1zKSB7XG4gICAgICAgIHZhciBub2RlID0gby5ub2RlLFxuICAgICAgICAgICAgYXR0cnMgPSBvLmF0dHJzLFxuICAgICAgICAgICAgdmlzID0gbm9kZS5zdHlsZS52aXNpYmlsaXR5O1xuICAgICAgICBub2RlLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgICAgICBmb3IgKHZhciBhdHQgaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICBpZiAocGFyYW1zW2hhc10oYXR0KSkge1xuICAgICAgICAgICAgICAgIGlmICghUi5fYXZhaWxhYmxlQXR0cnNbaGFzXShhdHQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBwYXJhbXNbYXR0XTtcbiAgICAgICAgICAgICAgICBhdHRyc1thdHRdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChhdHQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImJsdXJcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIG8uYmx1cih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImhyZWZcIjpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInRpdGxlXCI6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ0YXJnZXRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwbiA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbi50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT0gXCJhXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaGwgPSAkKFwiYVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbi5pbnNlcnRCZWZvcmUoaGwsIG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhsLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBuID0gaGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0ID09IFwidGFyZ2V0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbi5zZXRBdHRyaWJ1dGVOUyh4bGluaywgXCJzaG93XCIsIHZhbHVlID09IFwiYmxhbmtcIiA/IFwibmV3XCIgOiB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBuLnNldEF0dHJpYnV0ZU5TKHhsaW5rLCBhdHQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiY3Vyc29yXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnN0eWxlLmN1cnNvciA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ0cmFuc2Zvcm1cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIG8udHJhbnNmb3JtKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiYXJyb3ctc3RhcnRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZEFycm93KG8sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiYXJyb3ctZW5kXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRBcnJvdyhvLCB2YWx1ZSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImNsaXAtcmVjdFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlY3QgPSBTdHIodmFsdWUpLnNwbGl0KHNlcGFyYXRvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVjdC5sZW5ndGggPT0gNCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uY2xpcCAmJiBvLmNsaXAucGFyZW50Tm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG8uY2xpcC5wYXJlbnROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZWwgPSAkKFwiY2xpcFBhdGhcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJjID0gJChcInJlY3RcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwuaWQgPSBSLmNyZWF0ZVVVSUQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHJjLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IHJlY3RbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHJlY3RbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiByZWN0WzJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHJlY3RbM11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5hcHBlbmRDaGlsZChyYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgby5wYXBlci5kZWZzLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKG5vZGUsIHtcImNsaXAtcGF0aFwiOiBcInVybCgjXCIgKyBlbC5pZCArIFwiKVwifSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgby5jbGlwID0gcmM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhdGggPSBub2RlLmdldEF0dHJpYnV0ZShcImNsaXAtcGF0aFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2xpcCA9IFIuX2cuZG9jLmdldEVsZW1lbnRCeUlkKHBhdGgucmVwbGFjZSgvKF51cmxcXCgjfFxcKSQpL2csIEUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpcCAmJiBjbGlwLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY2xpcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQobm9kZSwge1wiY2xpcC1wYXRoXCI6IEV9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG8uY2xpcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwicGF0aFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG8udHlwZSA9PSBcInBhdGhcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQobm9kZSwge2Q6IHZhbHVlID8gYXR0cnMucGF0aCA9IFIuX3BhdGhUb0Fic29sdXRlKHZhbHVlKSA6IFwiTTAsMFwifSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgby5fLmRpcnR5ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoby5fLmFycm93cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YXJ0U3RyaW5nXCIgaW4gby5fLmFycm93cyAmJiBhZGRBcnJvdyhvLCBvLl8uYXJyb3dzLnN0YXJ0U3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJlbmRTdHJpbmdcIiBpbiBvLl8uYXJyb3dzICYmIGFkZEFycm93KG8sIG8uXy5hcnJvd3MuZW5kU3RyaW5nLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIndpZHRoXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8uXy5kaXJ0eSA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuZngpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHQgPSBcInhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGF0dHJzLng7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwieFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmZ4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAtYXR0cnMueCAtIChhdHRycy53aWR0aCB8fCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInJ4XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0ID09IFwicnhcIiAmJiBvLnR5cGUgPT0gXCJyZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImN4XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8ucGF0dGVybiAmJiB1cGRhdGVQb3NpdGlvbihvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8uXy5kaXJ0eSA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImhlaWdodFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLl8uZGlydHkgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJzLmZ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0ID0gXCJ5XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBhdHRycy55O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInlcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy5meSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gLWF0dHJzLnkgLSAoYXR0cnMuaGVpZ2h0IHx8IDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwicnlcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHQgPT0gXCJyeVwiICYmIG8udHlwZSA9PSBcInJlY3RcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiY3lcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgby5wYXR0ZXJuICYmIHVwZGF0ZVBvc2l0aW9uKG8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgby5fLmRpcnR5ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiclwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG8udHlwZSA9PSBcInJlY3RcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQobm9kZSwge3J4OiB2YWx1ZSwgcnk6IHZhbHVlfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgby5fLmRpcnR5ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwic3JjXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoby50eXBlID09IFwiaW1hZ2VcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlTlMoeGxpbmssIFwiaHJlZlwiLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInN0cm9rZS13aWR0aFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG8uXy5zeCAhPSAxIHx8IG8uXy5zeSAhPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgLz0gbW1heChhYnMoby5fLnN4KSwgYWJzKG8uXy5zeSkpIHx8IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoby5wYXBlci5fdmJTaXplKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgKj0gby5wYXBlci5fdmJTaXplO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnNbXCJzdHJva2UtZGFzaGFycmF5XCJdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRGFzaGVzKG8sIGF0dHJzW1wic3Ryb2tlLWRhc2hhcnJheVwiXSwgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvLl8uYXJyb3dzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdGFydFN0cmluZ1wiIGluIG8uXy5hcnJvd3MgJiYgYWRkQXJyb3cobywgby5fLmFycm93cy5zdGFydFN0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJlbmRTdHJpbmdcIiBpbiBvLl8uYXJyb3dzICYmIGFkZEFycm93KG8sIG8uXy5hcnJvd3MuZW5kU3RyaW5nLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwic3Ryb2tlLWRhc2hhcnJheVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkRGFzaGVzKG8sIHZhbHVlLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJmaWxsXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXNVUkwgPSBTdHIodmFsdWUpLm1hdGNoKFIuX0lTVVJMKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1VSTCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsID0gJChcInBhdHRlcm5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlnID0gJChcImltYWdlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLmlkID0gUi5jcmVhdGVVVUlEKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChlbCwge3g6IDAsIHk6IDAsIHBhdHRlcm5Vbml0czogXCJ1c2VyU3BhY2VPblVzZVwiLCBoZWlnaHQ6IDEsIHdpZHRoOiAxfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChpZywge3g6IDAsIHk6IDAsIFwieGxpbms6aHJlZlwiOiBpc1VSTFsxXX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKGlnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUi5fcHJlbG9hZChpc1VSTFsxXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHcgPSB0aGlzLm9mZnNldFdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGggPSB0aGlzLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoZWwsIHt3aWR0aDogdywgaGVpZ2h0OiBofSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGlnLCB7d2lkdGg6IHcsIGhlaWdodDogaH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5wYXBlci5zYWZhcmkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkoZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ucGFwZXIuZGVmcy5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChub2RlLCB7ZmlsbDogXCJ1cmwoI1wiICsgZWwuaWQgKyBcIilcIn0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ucGF0dGVybiA9IGVsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ucGF0dGVybiAmJiB1cGRhdGVQb3NpdGlvbihvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbHIgPSBSLmdldFJHQih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNsci5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBwYXJhbXMuZ3JhZGllbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJzLmdyYWRpZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICFSLmlzKGF0dHJzLm9wYWNpdHksIFwidW5kZWZpbmVkXCIpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFIuaXMocGFyYW1zLm9wYWNpdHksIFwidW5kZWZpbmVkXCIpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQobm9kZSwge29wYWNpdHk6IGF0dHJzLm9wYWNpdHl9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAhUi5pcyhhdHRyc1tcImZpbGwtb3BhY2l0eVwiXSwgXCJ1bmRlZmluZWRcIikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUi5pcyhwYXJhbXNbXCJmaWxsLW9wYWNpdHlcIl0sIFwidW5kZWZpbmVkXCIpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQobm9kZSwge1wiZmlsbC1vcGFjaXR5XCI6IGF0dHJzW1wiZmlsbC1vcGFjaXR5XCJdfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKChvLnR5cGUgPT0gXCJjaXJjbGVcIiB8fCBvLnR5cGUgPT0gXCJlbGxpcHNlXCIgfHwgU3RyKHZhbHVlKS5jaGFyQXQoKSAhPSBcInJcIikgJiYgYWRkR3JhZGllbnRGaWxsKG8sIHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcIm9wYWNpdHlcIiBpbiBhdHRycyB8fCBcImZpbGwtb3BhY2l0eVwiIGluIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBncmFkaWVudCA9IFIuX2cuZG9jLmdldEVsZW1lbnRCeUlkKG5vZGUuZ2V0QXR0cmlidXRlKFwiZmlsbFwiKS5yZXBsYWNlKC9edXJsXFwoI3xcXCkkL2csIEUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyYWRpZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcHMgPSBncmFkaWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInN0b3BcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHN0b3BzW3N0b3BzLmxlbmd0aCAtIDFdLCB7XCJzdG9wLW9wYWNpdHlcIjogKFwib3BhY2l0eVwiIGluIGF0dHJzID8gYXR0cnMub3BhY2l0eSA6IDEpICogKFwiZmlsbC1vcGFjaXR5XCIgaW4gYXR0cnMgPyBhdHRyc1tcImZpbGwtb3BhY2l0eVwiXSA6IDEpfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnMuZ3JhZGllbnQgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRycy5maWxsID0gXCJub25lXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbHJbaGFzXShcIm9wYWNpdHlcIikgJiYgJChub2RlLCB7XCJmaWxsLW9wYWNpdHlcIjogY2xyLm9wYWNpdHkgPiAxID8gY2xyLm9wYWNpdHkgLyAxMDAgOiBjbHIub3BhY2l0eX0pO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwic3Ryb2tlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjbHIgPSBSLmdldFJHQih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHQsIGNsci5oZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXR0ID09IFwic3Ryb2tlXCIgJiYgY2xyW2hhc10oXCJvcGFjaXR5XCIpICYmICQobm9kZSwge1wic3Ryb2tlLW9wYWNpdHlcIjogY2xyLm9wYWNpdHkgPiAxID8gY2xyLm9wYWNpdHkgLyAxMDAgOiBjbHIub3BhY2l0eX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dCA9PSBcInN0cm9rZVwiICYmIG8uXy5hcnJvd3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0YXJ0U3RyaW5nXCIgaW4gby5fLmFycm93cyAmJiBhZGRBcnJvdyhvLCBvLl8uYXJyb3dzLnN0YXJ0U3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImVuZFN0cmluZ1wiIGluIG8uXy5hcnJvd3MgJiYgYWRkQXJyb3cobywgby5fLmFycm93cy5lbmRTdHJpbmcsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJncmFkaWVudFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgKG8udHlwZSA9PSBcImNpcmNsZVwiIHx8IG8udHlwZSA9PSBcImVsbGlwc2VcIiB8fCBTdHIodmFsdWUpLmNoYXJBdCgpICE9IFwiclwiKSAmJiBhZGRHcmFkaWVudEZpbGwobywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJvcGFjaXR5XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuZ3JhZGllbnQgJiYgIWF0dHJzW2hhc10oXCJzdHJva2Utb3BhY2l0eVwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQobm9kZSwge1wic3Ryb2tlLW9wYWNpdHlcIjogdmFsdWUgPiAxID8gdmFsdWUgLyAxMDAgOiB2YWx1ZX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmFsbFxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZmlsbC1vcGFjaXR5XCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuZ3JhZGllbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudCA9IFIuX2cuZG9jLmdldEVsZW1lbnRCeUlkKG5vZGUuZ2V0QXR0cmlidXRlKFwiZmlsbFwiKS5yZXBsYWNlKC9edXJsXFwoI3xcXCkkL2csIEUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JhZGllbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcHMgPSBncmFkaWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInN0b3BcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoc3RvcHNbc3RvcHMubGVuZ3RoIC0gMV0sIHtcInN0b3Atb3BhY2l0eVwiOiB2YWx1ZX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dCA9PSBcImZvbnQtc2l6ZVwiICYmICh2YWx1ZSA9IHRvSW50KHZhbHVlLCAxMCkgKyBcInB4XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNzc3J1bGUgPSBhdHQucmVwbGFjZSgvKFxcLS4pL2csIGZ1bmN0aW9uICh3KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHcuc3Vic3RyaW5nKDEpLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc3R5bGVbY3NzcnVsZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8uXy5kaXJ0eSA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHR1bmVUZXh0KG8sIHBhcmFtcyk7XG4gICAgICAgIG5vZGUuc3R5bGUudmlzaWJpbGl0eSA9IHZpcztcbiAgICB9LFxuICAgIGxlYWRpbmcgPSAxLjIsXG4gICAgdHVuZVRleHQgPSBmdW5jdGlvbiAoZWwsIHBhcmFtcykge1xuICAgICAgICBpZiAoZWwudHlwZSAhPSBcInRleHRcIiB8fCAhKHBhcmFtc1toYXNdKFwidGV4dFwiKSB8fCBwYXJhbXNbaGFzXShcImZvbnRcIikgfHwgcGFyYW1zW2hhc10oXCJmb250LXNpemVcIikgfHwgcGFyYW1zW2hhc10oXCJ4XCIpIHx8IHBhcmFtc1toYXNdKFwieVwiKSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYSA9IGVsLmF0dHJzLFxuICAgICAgICAgICAgbm9kZSA9IGVsLm5vZGUsXG4gICAgICAgICAgICBmb250U2l6ZSA9IG5vZGUuZmlyc3RDaGlsZCA/IHRvSW50KFIuX2cuZG9jLmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUobm9kZS5maXJzdENoaWxkLCBFKS5nZXRQcm9wZXJ0eVZhbHVlKFwiZm9udC1zaXplXCIpLCAxMCkgOiAxMDtcblxuICAgICAgICBpZiAocGFyYW1zW2hhc10oXCJ0ZXh0XCIpKSB7XG4gICAgICAgICAgICBhLnRleHQgPSBwYXJhbXMudGV4dDtcbiAgICAgICAgICAgIHdoaWxlIChub2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG5vZGUuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdGV4dHMgPSBTdHIocGFyYW1zLnRleHQpLnNwbGl0KFwiXFxuXCIpLFxuICAgICAgICAgICAgICAgIHRzcGFucyA9IFtdLFxuICAgICAgICAgICAgICAgIHRzcGFuO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gdGV4dHMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIHRzcGFuID0gJChcInRzcGFuXCIpO1xuICAgICAgICAgICAgICAgIGkgJiYgJCh0c3Bhbiwge2R5OiBmb250U2l6ZSAqIGxlYWRpbmcsIHg6IGEueH0pO1xuICAgICAgICAgICAgICAgIHRzcGFuLmFwcGVuZENoaWxkKFIuX2cuZG9jLmNyZWF0ZVRleHROb2RlKHRleHRzW2ldKSk7XG4gICAgICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZCh0c3Bhbik7XG4gICAgICAgICAgICAgICAgdHNwYW5zW2ldID0gdHNwYW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0c3BhbnMgPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidHNwYW5cIik7XG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBpaSA9IHRzcGFucy5sZW5ndGg7IGkgPCBpaTsgaSsrKSBpZiAoaSkge1xuICAgICAgICAgICAgICAgICQodHNwYW5zW2ldLCB7ZHk6IGZvbnRTaXplICogbGVhZGluZywgeDogYS54fSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQodHNwYW5zWzBdLCB7ZHk6IDB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAkKG5vZGUsIHt4OiBhLngsIHk6IGEueX0pO1xuICAgICAgICBlbC5fLmRpcnR5ID0gMTtcbiAgICAgICAgdmFyIGJiID0gZWwuX2dldEJCb3goKSxcbiAgICAgICAgICAgIGRpZiA9IGEueSAtIChiYi55ICsgYmIuaGVpZ2h0IC8gMik7XG4gICAgICAgIGRpZiAmJiBSLmlzKGRpZiwgXCJmaW5pdGVcIikgJiYgJCh0c3BhbnNbMF0sIHtkeTogZGlmfSk7XG4gICAgfSxcbiAgICBFbGVtZW50ID0gZnVuY3Rpb24gKG5vZGUsIHN2Zykge1xuICAgICAgICB2YXIgWCA9IDAsXG4gICAgICAgICAgICBZID0gMDtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBFbGVtZW50Lm5vZGVcbiAgICAgICAgIFsgcHJvcGVydHkgKG9iamVjdCkgXVxuICAgICAgICAgKipcbiAgICAgICAgICogR2l2ZXMgeW91IGEgcmVmZXJlbmNlIHRvIHRoZSBET00gb2JqZWN0LCBzbyB5b3UgY2FuIGFzc2lnbiBldmVudCBoYW5kbGVycyBvciBqdXN0IG1lc3MgYXJvdW5kLlxuICAgICAgICAgKipcbiAgICAgICAgICogTm90ZTogRG9u4oCZdCBtZXNzIHdpdGggaXQuXG4gICAgICAgICA+IFVzYWdlXG4gICAgICAgICB8IC8vIGRyYXcgYSBjaXJjbGUgYXQgY29vcmRpbmF0ZSAxMCwxMCB3aXRoIHJhZGl1cyBvZiAxMFxuICAgICAgICAgfCB2YXIgYyA9IHBhcGVyLmNpcmNsZSgxMCwgMTAsIDEwKTtcbiAgICAgICAgIHwgYy5ub2RlLm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICB8ICAgICBjLmF0dHIoXCJmaWxsXCIsIFwicmVkXCIpO1xuICAgICAgICAgfCB9O1xuICAgICAgICBcXCovXG4gICAgICAgIHRoaXNbMF0gPSB0aGlzLm5vZGUgPSBub2RlO1xuICAgICAgICAvKlxcXG4gICAgICAgICAqIEVsZW1lbnQucmFwaGFlbFxuICAgICAgICAgWyBwcm9wZXJ0eSAob2JqZWN0KSBdXG4gICAgICAgICAqKlxuICAgICAgICAgKiBJbnRlcm5hbCByZWZlcmVuY2UgdG8gQFJhcGhhZWwgb2JqZWN0LiBJbiBjYXNlIGl0IGlzIG5vdCBhdmFpbGFibGUuXG4gICAgICAgICA+IFVzYWdlXG4gICAgICAgICB8IFJhcGhhZWwuZWwucmVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgfCAgICAgdmFyIGhzYiA9IHRoaXMucGFwZXIucmFwaGFlbC5yZ2IyaHNiKHRoaXMuYXR0cihcImZpbGxcIikpO1xuICAgICAgICAgfCAgICAgaHNiLmggPSAxO1xuICAgICAgICAgfCAgICAgdGhpcy5hdHRyKHtmaWxsOiB0aGlzLnBhcGVyLnJhcGhhZWwuaHNiMnJnYihoc2IpLmhleH0pO1xuICAgICAgICAgfCB9XG4gICAgICAgIFxcKi9cbiAgICAgICAgbm9kZS5yYXBoYWVsID0gdHJ1ZTtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBFbGVtZW50LmlkXG4gICAgICAgICBbIHByb3BlcnR5IChudW1iZXIpIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFVuaXF1ZSBpZCBvZiB0aGUgZWxlbWVudC4gRXNwZWNpYWxseSB1c2VzZnVsIHdoZW4geW91IHdhbnQgdG8gbGlzdGVuIHRvIGV2ZW50cyBvZiB0aGUgZWxlbWVudCwgXG4gICAgICAgICAqIGJlY2F1c2UgYWxsIGV2ZW50cyBhcmUgZmlyZWQgaW4gZm9ybWF0IGA8bW9kdWxlPi48YWN0aW9uPi48aWQ+YC4gQWxzbyB1c2VmdWwgZm9yIEBQYXBlci5nZXRCeUlkIG1ldGhvZC5cbiAgICAgICAgXFwqL1xuICAgICAgICB0aGlzLmlkID0gUi5fb2lkKys7XG4gICAgICAgIG5vZGUucmFwaGFlbGlkID0gdGhpcy5pZDtcbiAgICAgICAgdGhpcy5tYXRyaXggPSBSLm1hdHJpeCgpO1xuICAgICAgICB0aGlzLnJlYWxQYXRoID0gbnVsbDtcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBFbGVtZW50LnBhcGVyXG4gICAgICAgICBbIHByb3BlcnR5IChvYmplY3QpIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIEludGVybmFsIHJlZmVyZW5jZSB0byDigJxwYXBlcuKAnSB3aGVyZSBvYmplY3QgZHJhd24uIE1haW5seSBmb3IgdXNlIGluIHBsdWdpbnMgYW5kIGVsZW1lbnQgZXh0ZW5zaW9ucy5cbiAgICAgICAgID4gVXNhZ2VcbiAgICAgICAgIHwgUmFwaGFlbC5lbC5jcm9zcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIHwgICAgIHRoaXMuYXR0cih7ZmlsbDogXCJyZWRcIn0pO1xuICAgICAgICAgfCAgICAgdGhpcy5wYXBlci5wYXRoKFwiTTEwLDEwTDUwLDUwTTUwLDEwTDEwLDUwXCIpXG4gICAgICAgICB8ICAgICAgICAgLmF0dHIoe3N0cm9rZTogXCJyZWRcIn0pO1xuICAgICAgICAgfCB9XG4gICAgICAgIFxcKi9cbiAgICAgICAgdGhpcy5wYXBlciA9IHN2ZztcbiAgICAgICAgdGhpcy5hdHRycyA9IHRoaXMuYXR0cnMgfHwge307XG4gICAgICAgIHRoaXMuXyA9IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogW10sXG4gICAgICAgICAgICBzeDogMSxcbiAgICAgICAgICAgIHN5OiAxLFxuICAgICAgICAgICAgZGVnOiAwLFxuICAgICAgICAgICAgZHg6IDAsXG4gICAgICAgICAgICBkeTogMCxcbiAgICAgICAgICAgIGRpcnR5OiAxXG4gICAgICAgIH07XG4gICAgICAgICFzdmcuYm90dG9tICYmIChzdmcuYm90dG9tID0gdGhpcyk7XG4gICAgICAgIC8qXFxcbiAgICAgICAgICogRWxlbWVudC5wcmV2XG4gICAgICAgICBbIHByb3BlcnR5IChvYmplY3QpIF1cbiAgICAgICAgICoqXG4gICAgICAgICAqIFJlZmVyZW5jZSB0byB0aGUgcHJldmlvdXMgZWxlbWVudCBpbiB0aGUgaGllcmFyY2h5LlxuICAgICAgICBcXCovXG4gICAgICAgIHRoaXMucHJldiA9IHN2Zy50b3A7XG4gICAgICAgIHN2Zy50b3AgJiYgKHN2Zy50b3AubmV4dCA9IHRoaXMpO1xuICAgICAgICBzdmcudG9wID0gdGhpcztcbiAgICAgICAgLypcXFxuICAgICAgICAgKiBFbGVtZW50Lm5leHRcbiAgICAgICAgIFsgcHJvcGVydHkgKG9iamVjdCkgXVxuICAgICAgICAgKipcbiAgICAgICAgICogUmVmZXJlbmNlIHRvIHRoZSBuZXh0IGVsZW1lbnQgaW4gdGhlIGhpZXJhcmNoeS5cbiAgICAgICAgXFwqL1xuICAgICAgICB0aGlzLm5leHQgPSBudWxsO1xuICAgIH0sXG4gICAgZWxwcm90byA9IFIuZWw7XG5cbiAgICBFbGVtZW50LnByb3RvdHlwZSA9IGVscHJvdG87XG4gICAgZWxwcm90by5jb25zdHJ1Y3RvciA9IEVsZW1lbnQ7XG5cbiAgICBSLl9lbmdpbmUucGF0aCA9IGZ1bmN0aW9uIChwYXRoU3RyaW5nLCBTVkcpIHtcbiAgICAgICAgdmFyIGVsID0gJChcInBhdGhcIik7XG4gICAgICAgIFNWRy5jYW52YXMgJiYgU1ZHLmNhbnZhcy5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgIHZhciBwID0gbmV3IEVsZW1lbnQoZWwsIFNWRyk7XG4gICAgICAgIHAudHlwZSA9IFwicGF0aFwiO1xuICAgICAgICBzZXRGaWxsQW5kU3Ryb2tlKHAsIHtcbiAgICAgICAgICAgIGZpbGw6IFwibm9uZVwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcIiMwMDBcIixcbiAgICAgICAgICAgIHBhdGg6IHBhdGhTdHJpbmdcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQucm90YXRlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBEZXByZWNhdGVkISBVc2UgQEVsZW1lbnQudHJhbnNmb3JtIGluc3RlYWQuXG4gICAgICogQWRkcyByb3RhdGlvbiBieSBnaXZlbiBhbmdsZSBhcm91bmQgZ2l2ZW4gcG9pbnQgdG8gdGhlIGxpc3Qgb2ZcbiAgICAgKiB0cmFuc2Zvcm1hdGlvbnMgb2YgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIGRlZyAobnVtYmVyKSBhbmdsZSBpbiBkZWdyZWVzXG4gICAgIC0gY3ggKG51bWJlcikgI29wdGlvbmFsIHggY29vcmRpbmF0ZSBvZiB0aGUgY2VudHJlIG9mIHJvdGF0aW9uXG4gICAgIC0gY3kgKG51bWJlcikgI29wdGlvbmFsIHkgY29vcmRpbmF0ZSBvZiB0aGUgY2VudHJlIG9mIHJvdGF0aW9uXG4gICAgICogSWYgY3ggJiBjeSBhcmVu4oCZdCBzcGVjaWZpZWQgY2VudHJlIG9mIHRoZSBzaGFwZSBpcyB1c2VkIGFzIGEgcG9pbnQgb2Ygcm90YXRpb24uXG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5yb3RhdGUgPSBmdW5jdGlvbiAoZGVnLCBjeCwgY3kpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVnID0gU3RyKGRlZykuc3BsaXQoc2VwYXJhdG9yKTtcbiAgICAgICAgaWYgKGRlZy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBjeCA9IHRvRmxvYXQoZGVnWzFdKTtcbiAgICAgICAgICAgIGN5ID0gdG9GbG9hdChkZWdbMl0pO1xuICAgICAgICB9XG4gICAgICAgIGRlZyA9IHRvRmxvYXQoZGVnWzBdKTtcbiAgICAgICAgKGN5ID09IG51bGwpICYmIChjeCA9IGN5KTtcbiAgICAgICAgaWYgKGN4ID09IG51bGwgfHwgY3kgPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGJib3ggPSB0aGlzLmdldEJCb3goMSk7XG4gICAgICAgICAgICBjeCA9IGJib3gueCArIGJib3gud2lkdGggLyAyO1xuICAgICAgICAgICAgY3kgPSBiYm94LnkgKyBiYm94LmhlaWdodCAvIDI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50cmFuc2Zvcm0odGhpcy5fLnRyYW5zZm9ybS5jb25jYXQoW1tcInJcIiwgZGVnLCBjeCwgY3ldXSkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnNjYWxlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBEZXByZWNhdGVkISBVc2UgQEVsZW1lbnQudHJhbnNmb3JtIGluc3RlYWQuXG4gICAgICogQWRkcyBzY2FsZSBieSBnaXZlbiBhbW91bnQgcmVsYXRpdmUgdG8gZ2l2ZW4gcG9pbnQgdG8gdGhlIGxpc3Qgb2ZcbiAgICAgKiB0cmFuc2Zvcm1hdGlvbnMgb2YgdGhlIGVsZW1lbnQuXG4gICAgID4gUGFyYW1ldGVyc1xuICAgICAtIHN4IChudW1iZXIpIGhvcmlzb250YWwgc2NhbGUgYW1vdW50XG4gICAgIC0gc3kgKG51bWJlcikgdmVydGljYWwgc2NhbGUgYW1vdW50XG4gICAgIC0gY3ggKG51bWJlcikgI29wdGlvbmFsIHggY29vcmRpbmF0ZSBvZiB0aGUgY2VudHJlIG9mIHNjYWxlXG4gICAgIC0gY3kgKG51bWJlcikgI29wdGlvbmFsIHkgY29vcmRpbmF0ZSBvZiB0aGUgY2VudHJlIG9mIHNjYWxlXG4gICAgICogSWYgY3ggJiBjeSBhcmVu4oCZdCBzcGVjaWZpZWQgY2VudHJlIG9mIHRoZSBzaGFwZSBpcyB1c2VkIGluc3RlYWQuXG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5zY2FsZSA9IGZ1bmN0aW9uIChzeCwgc3ksIGN4LCBjeSkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBzeCA9IFN0cihzeCkuc3BsaXQoc2VwYXJhdG9yKTtcbiAgICAgICAgaWYgKHN4Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIHN5ID0gdG9GbG9hdChzeFsxXSk7XG4gICAgICAgICAgICBjeCA9IHRvRmxvYXQoc3hbMl0pO1xuICAgICAgICAgICAgY3kgPSB0b0Zsb2F0KHN4WzNdKTtcbiAgICAgICAgfVxuICAgICAgICBzeCA9IHRvRmxvYXQoc3hbMF0pO1xuICAgICAgICAoc3kgPT0gbnVsbCkgJiYgKHN5ID0gc3gpO1xuICAgICAgICAoY3kgPT0gbnVsbCkgJiYgKGN4ID0gY3kpO1xuICAgICAgICBpZiAoY3ggPT0gbnVsbCB8fCBjeSA9PSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgYmJveCA9IHRoaXMuZ2V0QkJveCgxKTtcbiAgICAgICAgfVxuICAgICAgICBjeCA9IGN4ID09IG51bGwgPyBiYm94LnggKyBiYm94LndpZHRoIC8gMiA6IGN4O1xuICAgICAgICBjeSA9IGN5ID09IG51bGwgPyBiYm94LnkgKyBiYm94LmhlaWdodCAvIDIgOiBjeTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0odGhpcy5fLnRyYW5zZm9ybS5jb25jYXQoW1tcInNcIiwgc3gsIHN5LCBjeCwgY3ldXSkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnRyYW5zbGF0ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRGVwcmVjYXRlZCEgVXNlIEBFbGVtZW50LnRyYW5zZm9ybSBpbnN0ZWFkLlxuICAgICAqIEFkZHMgdHJhbnNsYXRpb24gYnkgZ2l2ZW4gYW1vdW50IHRvIHRoZSBsaXN0IG9mIHRyYW5zZm9ybWF0aW9ucyBvZiB0aGUgZWxlbWVudC5cbiAgICAgPiBQYXJhbWV0ZXJzXG4gICAgIC0gZHggKG51bWJlcikgaG9yaXNvbnRhbCBzaGlmdFxuICAgICAtIGR5IChudW1iZXIpIHZlcnRpY2FsIHNoaWZ0XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by50cmFuc2xhdGUgPSBmdW5jdGlvbiAoZHgsIGR5KSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGR4ID0gU3RyKGR4KS5zcGxpdChzZXBhcmF0b3IpO1xuICAgICAgICBpZiAoZHgubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgZHkgPSB0b0Zsb2F0KGR4WzFdKTtcbiAgICAgICAgfVxuICAgICAgICBkeCA9IHRvRmxvYXQoZHhbMF0pIHx8IDA7XG4gICAgICAgIGR5ID0gK2R5IHx8IDA7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtKHRoaXMuXy50cmFuc2Zvcm0uY29uY2F0KFtbXCJ0XCIsIGR4LCBkeV1dKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudHJhbnNmb3JtXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIHRyYW5zZm9ybWF0aW9uIHRvIHRoZSBlbGVtZW50IHdoaWNoIGlzIHNlcGFyYXRlIHRvIG90aGVyIGF0dHJpYnV0ZXMsXG4gICAgICogaS5lLiB0cmFuc2xhdGlvbiBkb2VzbuKAmXQgY2hhbmdlIGB4YCBvciBgeWAgb2YgdGhlIHJlY3RhbmdlLiBUaGUgZm9ybWF0XG4gICAgICogb2YgdHJhbnNmb3JtYXRpb24gc3RyaW5nIGlzIHNpbWlsYXIgdG8gdGhlIHBhdGggc3RyaW5nIHN5bnRheDpcbiAgICAgfCBcInQxMDAsMTAwcjMwLDEwMCwxMDBzMiwyLDEwMCwxMDByNDVzMS41XCJcbiAgICAgKiBFYWNoIGxldHRlciBpcyBhIGNvbW1hbmQuIFRoZXJlIGFyZSBmb3VyIGNvbW1hbmRzOiBgdGAgaXMgZm9yIHRyYW5zbGF0ZSwgYHJgIGlzIGZvciByb3RhdGUsIGBzYCBpcyBmb3JcbiAgICAgKiBzY2FsZSBhbmQgYG1gIGlzIGZvciBtYXRyaXguXG4gICAgICpcbiAgICAgKiBUaGVyZSBhcmUgYWxzbyBhbHRlcm5hdGl2ZSDigJxhYnNvbHV0ZeKAnSB0cmFuc2xhdGlvbiwgcm90YXRpb24gYW5kIHNjYWxlOiBgVGAsIGBSYCBhbmQgYFNgLiBUaGV5IHdpbGwgbm90IHRha2UgcHJldmlvdXMgdHJhbnNmb3JtYXRpb24gaW50byBhY2NvdW50LiBGb3IgZXhhbXBsZSwgYC4uLlQxMDAsMGAgd2lsbCBhbHdheXMgbW92ZSBlbGVtZW50IDEwMCBweCBob3Jpc29udGFsbHksIHdoaWxlIGAuLi50MTAwLDBgIGNvdWxkIG1vdmUgaXQgdmVydGljYWxseSBpZiB0aGVyZSBpcyBgcjkwYCBiZWZvcmUuIEp1c3QgY29tcGFyZSByZXN1bHRzIG9mIGByOTB0MTAwLDBgIGFuZCBgcjkwVDEwMCwwYC5cbiAgICAgKlxuICAgICAqIFNvLCB0aGUgZXhhbXBsZSBsaW5lIGFib3ZlIGNvdWxkIGJlIHJlYWQgbGlrZSDigJx0cmFuc2xhdGUgYnkgMTAwLCAxMDA7IHJvdGF0ZSAzMMKwIGFyb3VuZCAxMDAsIDEwMDsgc2NhbGUgdHdpY2UgYXJvdW5kIDEwMCwgMTAwO1xuICAgICAqIHJvdGF0ZSA0NcKwIGFyb3VuZCBjZW50cmU7IHNjYWxlIDEuNSB0aW1lcyByZWxhdGl2ZSB0byBjZW50cmXigJ0uIEFzIHlvdSBjYW4gc2VlIHJvdGF0ZSBhbmQgc2NhbGUgY29tbWFuZHMgaGF2ZSBvcmlnaW5cbiAgICAgKiBjb29yZGluYXRlcyBhcyBvcHRpb25hbCBwYXJhbWV0ZXJzLCB0aGUgZGVmYXVsdCBpcyB0aGUgY2VudHJlIHBvaW50IG9mIHRoZSBlbGVtZW50LlxuICAgICAqIE1hdHJpeCBhY2NlcHRzIHNpeCBwYXJhbWV0ZXJzLlxuICAgICA+IFVzYWdlXG4gICAgIHwgdmFyIGVsID0gcGFwZXIucmVjdCgxMCwgMjAsIDMwMCwgMjAwKTtcbiAgICAgfCAvLyB0cmFuc2xhdGUgMTAwLCAxMDAsIHJvdGF0ZSA0NcKwLCB0cmFuc2xhdGUgLTEwMCwgMFxuICAgICB8IGVsLnRyYW5zZm9ybShcInQxMDAsMTAwcjQ1dC0xMDAsMFwiKTtcbiAgICAgfCAvLyBpZiB5b3Ugd2FudCB5b3UgY2FuIGFwcGVuZCBvciBwcmVwZW5kIHRyYW5zZm9ybWF0aW9uc1xuICAgICB8IGVsLnRyYW5zZm9ybShcIi4uLnQ1MCw1MFwiKTtcbiAgICAgfCBlbC50cmFuc2Zvcm0oXCJzMi4uLlwiKTtcbiAgICAgfCAvLyBvciBldmVuIHdyYXBcbiAgICAgfCBlbC50cmFuc2Zvcm0oXCJ0NTAsNTAuLi50LTUwLTUwXCIpO1xuICAgICB8IC8vIHRvIHJlc2V0IHRyYW5zZm9ybWF0aW9uIGNhbGwgbWV0aG9kIHdpdGggZW1wdHkgc3RyaW5nXG4gICAgIHwgZWwudHJhbnNmb3JtKFwiXCIpO1xuICAgICB8IC8vIHRvIGdldCBjdXJyZW50IHZhbHVlIGNhbGwgaXQgd2l0aG91dCBwYXJhbWV0ZXJzXG4gICAgIHwgY29uc29sZS5sb2coZWwudHJhbnNmb3JtKCkpO1xuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSB0c3RyIChzdHJpbmcpICNvcHRpb25hbCB0cmFuc2Zvcm1hdGlvbiBzdHJpbmdcbiAgICAgKiBJZiB0c3RyIGlzbuKAmXQgc3BlY2lmaWVkXG4gICAgID0gKHN0cmluZykgY3VycmVudCB0cmFuc2Zvcm1hdGlvbiBzdHJpbmdcbiAgICAgKiBlbHNlXG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by50cmFuc2Zvcm0gPSBmdW5jdGlvbiAodHN0cikge1xuICAgICAgICB2YXIgXyA9IHRoaXMuXztcbiAgICAgICAgaWYgKHRzdHIgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIF8udHJhbnNmb3JtO1xuICAgICAgICB9XG4gICAgICAgIFIuX2V4dHJhY3RUcmFuc2Zvcm0odGhpcywgdHN0cik7XG5cbiAgICAgICAgdGhpcy5jbGlwICYmICQodGhpcy5jbGlwLCB7dHJhbnNmb3JtOiB0aGlzLm1hdHJpeC5pbnZlcnQoKX0pO1xuICAgICAgICB0aGlzLnBhdHRlcm4gJiYgdXBkYXRlUG9zaXRpb24odGhpcyk7XG4gICAgICAgIHRoaXMubm9kZSAmJiAkKHRoaXMubm9kZSwge3RyYW5zZm9ybTogdGhpcy5tYXRyaXh9KTtcbiAgICBcbiAgICAgICAgaWYgKF8uc3ggIT0gMSB8fCBfLnN5ICE9IDEpIHtcbiAgICAgICAgICAgIHZhciBzdyA9IHRoaXMuYXR0cnNbaGFzXShcInN0cm9rZS13aWR0aFwiKSA/IHRoaXMuYXR0cnNbXCJzdHJva2Utd2lkdGhcIl0gOiAxO1xuICAgICAgICAgICAgdGhpcy5hdHRyKHtcInN0cm9rZS13aWR0aFwiOiBzd30pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5oaWRlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBNYWtlcyBlbGVtZW50IGludmlzaWJsZS4gU2VlIEBFbGVtZW50LnNob3cuXG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5oaWRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAhdGhpcy5yZW1vdmVkICYmIHRoaXMucGFwZXIuc2FmYXJpKHRoaXMubm9kZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnNob3dcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIE1ha2VzIGVsZW1lbnQgdmlzaWJsZS4gU2VlIEBFbGVtZW50LmhpZGUuXG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAhdGhpcy5yZW1vdmVkICYmIHRoaXMucGFwZXIuc2FmYXJpKHRoaXMubm9kZS5zdHlsZS5kaXNwbGF5ID0gXCJcIik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQucmVtb3ZlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGVsZW1lbnQgZnJvbSB0aGUgcGFwZXIuXG4gICAgXFwqL1xuICAgIGVscHJvdG8ucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkIHx8ICF0aGlzLm5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwYXBlciA9IHRoaXMucGFwZXI7XG4gICAgICAgIHBhcGVyLl9fc2V0X18gJiYgcGFwZXIuX19zZXRfXy5leGNsdWRlKHRoaXMpO1xuICAgICAgICBldmUudW5iaW5kKFwicmFwaGFlbC4qLiouXCIgKyB0aGlzLmlkKTtcbiAgICAgICAgaWYgKHRoaXMuZ3JhZGllbnQpIHtcbiAgICAgICAgICAgIHBhcGVyLmRlZnMucmVtb3ZlQ2hpbGQodGhpcy5ncmFkaWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgUi5fdGVhcih0aGlzLCBwYXBlcik7XG4gICAgICAgIGlmICh0aGlzLm5vZGUucGFyZW50Tm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gXCJhXCIpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5ub2RlLnBhcmVudE5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5ub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpIGluIHRoaXMpIHtcbiAgICAgICAgICAgIHRoaXNbaV0gPSB0eXBlb2YgdGhpc1tpXSA9PSBcImZ1bmN0aW9uXCIgPyBSLl9yZW1vdmVkRmFjdG9yeShpKSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW1vdmVkID0gdHJ1ZTtcbiAgICB9O1xuICAgIGVscHJvdG8uX2dldEJCb3ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLm5vZGUuc3R5bGUuZGlzcGxheSA9PSBcIm5vbmVcIikge1xuICAgICAgICAgICAgdGhpcy5zaG93KCk7XG4gICAgICAgICAgICB2YXIgaGlkZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJib3ggPSB7fTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGJib3ggPSB0aGlzLm5vZGUuZ2V0QkJveCgpO1xuICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgIC8vIEZpcmVmb3ggMy4wLnggcGxheXMgYmFkbHkgaGVyZVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgYmJveCA9IGJib3ggfHwge307XG4gICAgICAgIH1cbiAgICAgICAgaGlkZSAmJiB0aGlzLmhpZGUoKTtcbiAgICAgICAgcmV0dXJuIGJib3g7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5hdHRyXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBTZXRzIHRoZSBhdHRyaWJ1dGVzIG9mIHRoZSBlbGVtZW50LlxuICAgICA+IFBhcmFtZXRlcnNcbiAgICAgLSBhdHRyTmFtZSAoc3RyaW5nKSBhdHRyaWJ1dGXigJlzIG5hbWVcbiAgICAgLSB2YWx1ZSAoc3RyaW5nKSB2YWx1ZVxuICAgICAqIG9yXG4gICAgIC0gcGFyYW1zIChvYmplY3QpIG9iamVjdCBvZiBuYW1lL3ZhbHVlIHBhaXJzXG4gICAgICogb3JcbiAgICAgLSBhdHRyTmFtZSAoc3RyaW5nKSBhdHRyaWJ1dGXigJlzIG5hbWVcbiAgICAgKiBvclxuICAgICAtIGF0dHJOYW1lcyAoYXJyYXkpIGluIHRoaXMgY2FzZSBtZXRob2QgcmV0dXJucyBhcnJheSBvZiBjdXJyZW50IHZhbHVlcyBmb3IgZ2l2ZW4gYXR0cmlidXRlIG5hbWVzXG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnQgaWYgYXR0cnNOYW1lICYgdmFsdWUgb3IgcGFyYW1zIGFyZSBwYXNzZWQgaW4uXG4gICAgID0gKC4uLikgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZSBpZiBvbmx5IGF0dHJzTmFtZSBpcyBwYXNzZWQgaW4uXG4gICAgID0gKGFycmF5KSBhcnJheSBvZiB2YWx1ZXMgb2YgdGhlIGF0dHJpYnV0ZSBpZiBhdHRyc05hbWVzIGlzIHBhc3NlZCBpbi5cbiAgICAgPSAob2JqZWN0KSBvYmplY3Qgb2YgYXR0cmlidXRlcyBpZiBub3RoaW5nIGlzIHBhc3NlZCBpbi5cbiAgICAgPiBQb3NzaWJsZSBwYXJhbWV0ZXJzXG4gICAgICMgPHA+UGxlYXNlIHJlZmVyIHRvIHRoZSA8YSBocmVmPVwiaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL1wiIHRpdGxlPVwiVGhlIFczQyBSZWNvbW1lbmRhdGlvbiBmb3IgdGhlIFNWRyBsYW5ndWFnZSBkZXNjcmliZXMgdGhlc2UgcHJvcGVydGllcyBpbiBkZXRhaWwuXCI+U1ZHIHNwZWNpZmljYXRpb248L2E+IGZvciBhbiBleHBsYW5hdGlvbiBvZiB0aGVzZSBwYXJhbWV0ZXJzLjwvcD5cbiAgICAgbyBhcnJvdy1lbmQgKHN0cmluZykgYXJyb3doZWFkIG9uIHRoZSBlbmQgb2YgdGhlIHBhdGguIFRoZSBmb3JtYXQgZm9yIHN0cmluZyBpcyBgPHR5cGU+Wy08d2lkdGg+Wy08bGVuZ3RoPl1dYC4gUG9zc2libGUgdHlwZXM6IGBjbGFzc2ljYCwgYGJsb2NrYCwgYG9wZW5gLCBgb3ZhbGAsIGBkaWFtb25kYCwgYG5vbmVgLCB3aWR0aDogYHdpZGVgLCBgbmFycm93YCwgYG1lZGl1bWAsIGxlbmd0aDogYGxvbmdgLCBgc2hvcnRgLCBgbWlkaXVtYC5cbiAgICAgbyBjbGlwLXJlY3QgKHN0cmluZykgY29tbWEgb3Igc3BhY2Ugc2VwYXJhdGVkIHZhbHVlczogeCwgeSwgd2lkdGggYW5kIGhlaWdodFxuICAgICBvIGN1cnNvciAoc3RyaW5nKSBDU1MgdHlwZSBvZiB0aGUgY3Vyc29yXG4gICAgIG8gY3ggKG51bWJlcikgdGhlIHgtYXhpcyBjb29yZGluYXRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZSwgb3IgZWxsaXBzZVxuICAgICBvIGN5IChudW1iZXIpIHRoZSB5LWF4aXMgY29vcmRpbmF0ZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBjaXJjbGUsIG9yIGVsbGlwc2VcbiAgICAgbyBmaWxsIChzdHJpbmcpIGNvbG91ciwgZ3JhZGllbnQgb3IgaW1hZ2VcbiAgICAgbyBmaWxsLW9wYWNpdHkgKG51bWJlcilcbiAgICAgbyBmb250IChzdHJpbmcpXG4gICAgIG8gZm9udC1mYW1pbHkgKHN0cmluZylcbiAgICAgbyBmb250LXNpemUgKG51bWJlcikgZm9udCBzaXplIGluIHBpeGVsc1xuICAgICBvIGZvbnQtd2VpZ2h0IChzdHJpbmcpXG4gICAgIG8gaGVpZ2h0IChudW1iZXIpXG4gICAgIG8gaHJlZiAoc3RyaW5nKSBVUkwsIGlmIHNwZWNpZmllZCBlbGVtZW50IGJlaGF2ZXMgYXMgaHlwZXJsaW5rXG4gICAgIG8gb3BhY2l0eSAobnVtYmVyKVxuICAgICBvIHBhdGggKHN0cmluZykgU1ZHIHBhdGggc3RyaW5nIGZvcm1hdFxuICAgICBvIHIgKG51bWJlcikgcmFkaXVzIG9mIHRoZSBjaXJjbGUsIGVsbGlwc2Ugb3Igcm91bmRlZCBjb3JuZXIgb24gdGhlIHJlY3RcbiAgICAgbyByeCAobnVtYmVyKSBob3Jpc29udGFsIHJhZGl1cyBvZiB0aGUgZWxsaXBzZVxuICAgICBvIHJ5IChudW1iZXIpIHZlcnRpY2FsIHJhZGl1cyBvZiB0aGUgZWxsaXBzZVxuICAgICBvIHNyYyAoc3RyaW5nKSBpbWFnZSBVUkwsIG9ubHkgd29ya3MgZm9yIEBFbGVtZW50LmltYWdlIGVsZW1lbnRcbiAgICAgbyBzdHJva2UgKHN0cmluZykgc3Ryb2tlIGNvbG91clxuICAgICBvIHN0cm9rZS1kYXNoYXJyYXkgKHN0cmluZykgW+KAnOKAnSwg4oCcYC1g4oCdLCDigJxgLmDigJ0sIOKAnGAtLmDigJ0sIOKAnGAtLi5g4oCdLCDigJxgLiBg4oCdLCDigJxgLSBg4oCdLCDigJxgLS1g4oCdLCDigJxgLSAuYOKAnSwg4oCcYC0tLmDigJ0sIOKAnGAtLS4uYOKAnV1cbiAgICAgbyBzdHJva2UtbGluZWNhcCAoc3RyaW5nKSBb4oCcYGJ1dHRg4oCdLCDigJxgc3F1YXJlYOKAnSwg4oCcYHJvdW5kYOKAnV1cbiAgICAgbyBzdHJva2UtbGluZWpvaW4gKHN0cmluZykgW+KAnGBiZXZlbGDigJ0sIOKAnGByb3VuZGDigJ0sIOKAnGBtaXRlcmDigJ1dXG4gICAgIG8gc3Ryb2tlLW1pdGVybGltaXQgKG51bWJlcilcbiAgICAgbyBzdHJva2Utb3BhY2l0eSAobnVtYmVyKVxuICAgICBvIHN0cm9rZS13aWR0aCAobnVtYmVyKSBzdHJva2Ugd2lkdGggaW4gcGl4ZWxzLCBkZWZhdWx0IGlzICcxJ1xuICAgICBvIHRhcmdldCAoc3RyaW5nKSB1c2VkIHdpdGggaHJlZlxuICAgICBvIHRleHQgKHN0cmluZykgY29udGVudHMgb2YgdGhlIHRleHQgZWxlbWVudC4gVXNlIGBcXG5gIGZvciBtdWx0aWxpbmUgdGV4dFxuICAgICBvIHRleHQtYW5jaG9yIChzdHJpbmcpIFvigJxgc3RhcnRg4oCdLCDigJxgbWlkZGxlYOKAnSwg4oCcYGVuZGDigJ1dLCBkZWZhdWx0IGlzIOKAnGBtaWRkbGVg4oCdXG4gICAgIG8gdGl0bGUgKHN0cmluZykgd2lsbCBjcmVhdGUgdG9vbHRpcCB3aXRoIGEgZ2l2ZW4gdGV4dFxuICAgICBvIHRyYW5zZm9ybSAoc3RyaW5nKSBzZWUgQEVsZW1lbnQudHJhbnNmb3JtXG4gICAgIG8gd2lkdGggKG51bWJlcilcbiAgICAgbyB4IChudW1iZXIpXG4gICAgIG8geSAobnVtYmVyKVxuICAgICA+IEdyYWRpZW50c1xuICAgICAqIExpbmVhciBncmFkaWVudCBmb3JtYXQ6IOKAnGDigLlhbmdsZeKAui3igLljb2xvdXLigLpbLeKAuWNvbG91cuKAuls64oC5b2Zmc2V04oC6XV0qLeKAuWNvbG91cuKAumDigJ0sIGV4YW1wbGU6IOKAnGA5MC0jZmZmLSMwMDBg4oCdIOKAkyA5MMKwXG4gICAgICogZ3JhZGllbnQgZnJvbSB3aGl0ZSB0byBibGFjayBvciDigJxgMC0jZmZmLSNmMDA6MjAtIzAwMGDigJ0g4oCTIDDCsCBncmFkaWVudCBmcm9tIHdoaXRlIHZpYSByZWQgKGF0IDIwJSkgdG8gYmxhY2suXG4gICAgICpcbiAgICAgKiByYWRpYWwgZ3JhZGllbnQ6IOKAnGByWyjigLlmeOKAuiwg4oC5ZnnigLopXeKAuWNvbG91cuKAulst4oC5Y29sb3Vy4oC6WzrigLlvZmZzZXTigLpdXSot4oC5Y29sb3Vy4oC6YOKAnSwgZXhhbXBsZTog4oCcYHIjZmZmLSMwMDBg4oCdIOKAk1xuICAgICAqIGdyYWRpZW50IGZyb20gd2hpdGUgdG8gYmxhY2sgb3Ig4oCcYHIoMC4yNSwgMC43NSkjZmZmLSMwMDBg4oCdIOKAkyBncmFkaWVudCBmcm9tIHdoaXRlIHRvIGJsYWNrIHdpdGggZm9jdXMgcG9pbnRcbiAgICAgKiBhdCAwLjI1LCAwLjc1LiBGb2N1cyBwb2ludCBjb29yZGluYXRlcyBhcmUgaW4gMC4uMSByYW5nZS4gUmFkaWFsIGdyYWRpZW50cyBjYW4gb25seSBiZSBhcHBsaWVkIHRvIGNpcmNsZXMgYW5kIGVsbGlwc2VzLlxuICAgICA+IFBhdGggU3RyaW5nXG4gICAgICMgPHA+UGxlYXNlIHJlZmVyIHRvIDxhIGhyZWY9XCJodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvcGF0aHMuaHRtbCNQYXRoRGF0YVwiIHRpdGxlPVwiRGV0YWlscyBvZiBhIHBhdGjigJlzIGRhdGEgYXR0cmlidXRl4oCZcyBmb3JtYXQgYXJlIGRlc2NyaWJlZCBpbiB0aGUgU1ZHIHNwZWNpZmljYXRpb24uXCI+U1ZHIGRvY3VtZW50YXRpb24gcmVnYXJkaW5nIHBhdGggc3RyaW5nPC9hPi4gUmFwaGHDq2wgZnVsbHkgc3VwcG9ydHMgaXQuPC9wPlxuICAgICA+IENvbG91ciBQYXJzaW5nXG4gICAgICMgPHVsPlxuICAgICAjICAgICA8bGk+Q29sb3VyIG5hbWUgKOKAnDxjb2RlPnJlZDwvY29kZT7igJ0sIOKAnDxjb2RlPmdyZWVuPC9jb2RlPuKAnSwg4oCcPGNvZGU+Y29ybmZsb3dlcmJsdWU8L2NvZGU+4oCdLCBldGMpPC9saT5cbiAgICAgIyAgICAgPGxpPiPigKLigKLigKIg4oCUIHNob3J0ZW5lZCBIVE1MIGNvbG91cjogKOKAnDxjb2RlPiMwMDA8L2NvZGU+4oCdLCDigJw8Y29kZT4jZmMwPC9jb2RlPuKAnSwgZXRjKTwvbGk+XG4gICAgICMgICAgIDxsaT4j4oCi4oCi4oCi4oCi4oCi4oCiIOKAlCBmdWxsIGxlbmd0aCBIVE1MIGNvbG91cjogKOKAnDxjb2RlPiMwMDAwMDA8L2NvZGU+4oCdLCDigJw8Y29kZT4jYmQyMzAwPC9jb2RlPuKAnSk8L2xpPlxuICAgICAjICAgICA8bGk+cmdiKOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIpIOKAlCByZWQsIGdyZWVuIGFuZCBibHVlIGNoYW5uZWxz4oCZIHZhbHVlczogKOKAnDxjb2RlPnJnYigyMDAsJm5ic3A7MTAwLCZuYnNwOzApPC9jb2RlPuKAnSk8L2xpPlxuICAgICAjICAgICA8bGk+cmdiKOKAouKAouKAoiUsIOKAouKAouKAoiUsIOKAouKAouKAoiUpIOKAlCBzYW1lIGFzIGFib3ZlLCBidXQgaW4gJTogKOKAnDxjb2RlPnJnYigxMDAlLCZuYnNwOzE3NSUsJm5ic3A7MCUpPC9jb2RlPuKAnSk8L2xpPlxuICAgICAjICAgICA8bGk+cmdiYSjigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIpIOKAlCByZWQsIGdyZWVuIGFuZCBibHVlIGNoYW5uZWxz4oCZIHZhbHVlczogKOKAnDxjb2RlPnJnYmEoMjAwLCZuYnNwOzEwMCwmbmJzcDswLCAuNSk8L2NvZGU+4oCdKTwvbGk+XG4gICAgICMgICAgIDxsaT5yZ2JhKOKAouKAouKAoiUsIOKAouKAouKAoiUsIOKAouKAouKAoiUsIOKAouKAouKAoiUpIOKAlCBzYW1lIGFzIGFib3ZlLCBidXQgaW4gJTogKOKAnDxjb2RlPnJnYmEoMTAwJSwmbmJzcDsxNzUlLCZuYnNwOzAlLCA1MCUpPC9jb2RlPuKAnSk8L2xpPlxuICAgICAjICAgICA8bGk+aHNiKOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIpIOKAlCBodWUsIHNhdHVyYXRpb24gYW5kIGJyaWdodG5lc3MgdmFsdWVzOiAo4oCcPGNvZGU+aHNiKDAuNSwmbmJzcDswLjI1LCZuYnNwOzEpPC9jb2RlPuKAnSk8L2xpPlxuICAgICAjICAgICA8bGk+aHNiKOKAouKAouKAoiUsIOKAouKAouKAoiUsIOKAouKAouKAoiUpIOKAlCBzYW1lIGFzIGFib3ZlLCBidXQgaW4gJTwvbGk+XG4gICAgICMgICAgIDxsaT5oc2JhKOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIsIOKAouKAouKAoikg4oCUIHNhbWUgYXMgYWJvdmUsIGJ1dCB3aXRoIG9wYWNpdHk8L2xpPlxuICAgICAjICAgICA8bGk+aHNsKOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIpIOKAlCBhbG1vc3QgdGhlIHNhbWUgYXMgaHNiLCBzZWUgPGEgaHJlZj1cImh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSFNMX2FuZF9IU1ZcIiB0aXRsZT1cIkhTTCBhbmQgSFNWIC0gV2lraXBlZGlhLCB0aGUgZnJlZSBlbmN5Y2xvcGVkaWFcIj5XaWtpcGVkaWEgcGFnZTwvYT48L2xpPlxuICAgICAjICAgICA8bGk+aHNsKOKAouKAouKAoiUsIOKAouKAouKAoiUsIOKAouKAouKAoiUpIOKAlCBzYW1lIGFzIGFib3ZlLCBidXQgaW4gJTwvbGk+XG4gICAgICMgICAgIDxsaT5oc2xhKOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIsIOKAouKAouKAoikg4oCUIHNhbWUgYXMgYWJvdmUsIGJ1dCB3aXRoIG9wYWNpdHk8L2xpPlxuICAgICAjICAgICA8bGk+T3B0aW9uYWxseSBmb3IgaHNiIGFuZCBoc2wgeW91IGNvdWxkIHNwZWNpZnkgaHVlIGFzIGEgZGVncmVlOiDigJw8Y29kZT5oc2woMjQwZGVnLCZuYnNwOzEsJm5ic3A7LjUpPC9jb2RlPuKAnSBvciwgaWYgeW91IHdhbnQgdG8gZ28gZmFuY3ksIOKAnDxjb2RlPmhzbCgyNDDCsCwmbmJzcDsxLCZuYnNwOy41KTwvY29kZT7igJ08L2xpPlxuICAgICAjIDwvdWw+XG4gICAgXFwqL1xuICAgIGVscHJvdG8uYXR0ciA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBpZiAobmFtZSA9PSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgcmVzID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBhIGluIHRoaXMuYXR0cnMpIGlmICh0aGlzLmF0dHJzW2hhc10oYSkpIHtcbiAgICAgICAgICAgICAgICByZXNbYV0gPSB0aGlzLmF0dHJzW2FdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzLmdyYWRpZW50ICYmIHJlcy5maWxsID09IFwibm9uZVwiICYmIChyZXMuZmlsbCA9IHJlcy5ncmFkaWVudCkgJiYgZGVsZXRlIHJlcy5ncmFkaWVudDtcbiAgICAgICAgICAgIHJlcy50cmFuc2Zvcm0gPSB0aGlzLl8udHJhbnNmb3JtO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCAmJiBSLmlzKG5hbWUsIFwic3RyaW5nXCIpKSB7XG4gICAgICAgICAgICBpZiAobmFtZSA9PSBcImZpbGxcIiAmJiB0aGlzLmF0dHJzLmZpbGwgPT0gXCJub25lXCIgJiYgdGhpcy5hdHRycy5ncmFkaWVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHJzLmdyYWRpZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5hbWUgPT0gXCJ0cmFuc2Zvcm1cIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl8udHJhbnNmb3JtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG5hbWVzID0gbmFtZS5zcGxpdChzZXBhcmF0b3IpLFxuICAgICAgICAgICAgICAgIG91dCA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gbmFtZXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZSBpbiB0aGlzLmF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dFtuYW1lXSA9IHRoaXMuYXR0cnNbbmFtZV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChSLmlzKHRoaXMucGFwZXIuY3VzdG9tQXR0cmlidXRlc1tuYW1lXSwgXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgICAgICBvdXRbbmFtZV0gPSB0aGlzLnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNbbmFtZV0uZGVmO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG91dFtuYW1lXSA9IFIuX2F2YWlsYWJsZUF0dHJzW25hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpaSAtIDEgPyBvdXQgOiBvdXRbbmFtZXNbMF1dO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2YWx1ZSA9PSBudWxsICYmIFIuaXMobmFtZSwgXCJhcnJheVwiKSkge1xuICAgICAgICAgICAgb3V0ID0ge307XG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBpaSA9IG5hbWUubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIG91dFtuYW1lW2ldXSA9IHRoaXMuYXR0cihuYW1lW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7fTtcbiAgICAgICAgICAgIHBhcmFtc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKG5hbWUgIT0gbnVsbCAmJiBSLmlzKG5hbWUsIFwib2JqZWN0XCIpKSB7XG4gICAgICAgICAgICBwYXJhbXMgPSBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgIGV2ZShcInJhcGhhZWwuYXR0ci5cIiArIGtleSArIFwiLlwiICsgdGhpcy5pZCwgdGhpcywgcGFyYW1zW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoa2V5IGluIHRoaXMucGFwZXIuY3VzdG9tQXR0cmlidXRlcykgaWYgKHRoaXMucGFwZXIuY3VzdG9tQXR0cmlidXRlc1toYXNdKGtleSkgJiYgcGFyYW1zW2hhc10oa2V5KSAmJiBSLmlzKHRoaXMucGFwZXIuY3VzdG9tQXR0cmlidXRlc1trZXldLCBcImZ1bmN0aW9uXCIpKSB7XG4gICAgICAgICAgICB2YXIgcGFyID0gdGhpcy5wYXBlci5jdXN0b21BdHRyaWJ1dGVzW2tleV0uYXBwbHkodGhpcywgW10uY29uY2F0KHBhcmFtc1trZXldKSk7XG4gICAgICAgICAgICB0aGlzLmF0dHJzW2tleV0gPSBwYXJhbXNba2V5XTtcbiAgICAgICAgICAgIGZvciAodmFyIHN1YmtleSBpbiBwYXIpIGlmIChwYXJbaGFzXShzdWJrZXkpKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zW3N1YmtleV0gPSBwYXJbc3Via2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzZXRGaWxsQW5kU3Ryb2tlKHRoaXMsIHBhcmFtcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudG9Gcm9udFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogTW92ZXMgdGhlIGVsZW1lbnQgc28gaXQgaXMgdGhlIGNsb3Nlc3QgdG8gdGhlIHZpZXdlcuKAmXMgZXllcywgb24gdG9wIG9mIG90aGVyIGVsZW1lbnRzLlxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8udG9Gcm9udCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubm9kZS5wYXJlbnROb2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PSBcImFcIikge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnBhcmVudE5vZGUucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLm5vZGUucGFyZW50Tm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdmcgPSB0aGlzLnBhcGVyO1xuICAgICAgICBzdmcudG9wICE9IHRoaXMgJiYgUi5fdG9mcm9udCh0aGlzLCBzdmcpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnRvQmFja1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogTW92ZXMgdGhlIGVsZW1lbnQgc28gaXQgaXMgdGhlIGZ1cnRoZXN0IGZyb20gdGhlIHZpZXdlcuKAmXMgZXllcywgYmVoaW5kIG90aGVyIGVsZW1lbnRzLlxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuICAgIGVscHJvdG8udG9CYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5ub2RlLnBhcmVudE5vZGU7XG4gICAgICAgIGlmIChwYXJlbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09IFwiYVwiKSB7XG4gICAgICAgICAgICBwYXJlbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5ub2RlLnBhcmVudE5vZGUsIHRoaXMubm9kZS5wYXJlbnROb2RlLnBhcmVudE5vZGUuZmlyc3RDaGlsZCk7IFxuICAgICAgICB9IGVsc2UgaWYgKHBhcmVudC5maXJzdENoaWxkICE9IHRoaXMubm9kZSkge1xuICAgICAgICAgICAgcGFyZW50Lmluc2VydEJlZm9yZSh0aGlzLm5vZGUsIHRoaXMubm9kZS5wYXJlbnROb2RlLmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIFIuX3RvYmFjayh0aGlzLCB0aGlzLnBhcGVyKTtcbiAgICAgICAgdmFyIHN2ZyA9IHRoaXMucGFwZXI7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuaW5zZXJ0QWZ0ZXJcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEluc2VydHMgY3VycmVudCBvYmplY3QgYWZ0ZXIgdGhlIGdpdmVuIG9uZS5cbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cbiAgICBlbHByb3RvLmluc2VydEFmdGVyID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5vZGUgPSBlbGVtZW50Lm5vZGUgfHwgZWxlbWVudFtlbGVtZW50Lmxlbmd0aCAtIDFdLm5vZGU7XG4gICAgICAgIGlmIChub2RlLm5leHRTaWJsaW5nKSB7XG4gICAgICAgICAgICBub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMubm9kZSwgbm9kZS5uZXh0U2libGluZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub2RlLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5ub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBSLl9pbnNlcnRhZnRlcih0aGlzLCBlbGVtZW50LCB0aGlzLnBhcGVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5pbnNlcnRCZWZvcmVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEluc2VydHMgY3VycmVudCBvYmplY3QgYmVmb3JlIHRoZSBnaXZlbiBvbmUuXG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG4gICAgZWxwcm90by5pbnNlcnRCZWZvcmUgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICB2YXIgbm9kZSA9IGVsZW1lbnQubm9kZSB8fCBlbGVtZW50WzBdLm5vZGU7XG4gICAgICAgIG5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5ub2RlLCBub2RlKTtcbiAgICAgICAgUi5faW5zZXJ0YmVmb3JlKHRoaXMsIGVsZW1lbnQsIHRoaXMucGFwZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGVscHJvdG8uYmx1ciA9IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICAgIC8vIEV4cGVyaW1lbnRhbC4gTm8gU2FmYXJpIHN1cHBvcnQuIFVzZSBpdCBvbiB5b3VyIG93biByaXNrLlxuICAgICAgICB2YXIgdCA9IHRoaXM7XG4gICAgICAgIGlmICgrc2l6ZSAhPT0gMCkge1xuICAgICAgICAgICAgdmFyIGZsdHIgPSAkKFwiZmlsdGVyXCIpLFxuICAgICAgICAgICAgICAgIGJsdXIgPSAkKFwiZmVHYXVzc2lhbkJsdXJcIik7XG4gICAgICAgICAgICB0LmF0dHJzLmJsdXIgPSBzaXplO1xuICAgICAgICAgICAgZmx0ci5pZCA9IFIuY3JlYXRlVVVJRCgpO1xuICAgICAgICAgICAgJChibHVyLCB7c3RkRGV2aWF0aW9uOiArc2l6ZSB8fCAxLjV9KTtcbiAgICAgICAgICAgIGZsdHIuYXBwZW5kQ2hpbGQoYmx1cik7XG4gICAgICAgICAgICB0LnBhcGVyLmRlZnMuYXBwZW5kQ2hpbGQoZmx0cik7XG4gICAgICAgICAgICB0Ll9ibHVyID0gZmx0cjtcbiAgICAgICAgICAgICQodC5ub2RlLCB7ZmlsdGVyOiBcInVybCgjXCIgKyBmbHRyLmlkICsgXCIpXCJ9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0Ll9ibHVyKSB7XG4gICAgICAgICAgICAgICAgdC5fYmx1ci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHQuX2JsdXIpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0Ll9ibHVyO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0LmF0dHJzLmJsdXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0Lm5vZGUucmVtb3ZlQXR0cmlidXRlKFwiZmlsdGVyXCIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBSLl9lbmdpbmUuY2lyY2xlID0gZnVuY3Rpb24gKHN2ZywgeCwgeSwgcikge1xuICAgICAgICB2YXIgZWwgPSAkKFwiY2lyY2xlXCIpO1xuICAgICAgICBzdmcuY2FudmFzICYmIHN2Zy5jYW52YXMuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB2YXIgcmVzID0gbmV3IEVsZW1lbnQoZWwsIHN2Zyk7XG4gICAgICAgIHJlcy5hdHRycyA9IHtjeDogeCwgY3k6IHksIHI6IHIsIGZpbGw6IFwibm9uZVwiLCBzdHJva2U6IFwiIzAwMFwifTtcbiAgICAgICAgcmVzLnR5cGUgPSBcImNpcmNsZVwiO1xuICAgICAgICAkKGVsLCByZXMuYXR0cnMpO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gICAgUi5fZW5naW5lLnJlY3QgPSBmdW5jdGlvbiAoc3ZnLCB4LCB5LCB3LCBoLCByKSB7XG4gICAgICAgIHZhciBlbCA9ICQoXCJyZWN0XCIpO1xuICAgICAgICBzdmcuY2FudmFzICYmIHN2Zy5jYW52YXMuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB2YXIgcmVzID0gbmV3IEVsZW1lbnQoZWwsIHN2Zyk7XG4gICAgICAgIHJlcy5hdHRycyA9IHt4OiB4LCB5OiB5LCB3aWR0aDogdywgaGVpZ2h0OiBoLCByOiByIHx8IDAsIHJ4OiByIHx8IDAsIHJ5OiByIHx8IDAsIGZpbGw6IFwibm9uZVwiLCBzdHJva2U6IFwiIzAwMFwifTtcbiAgICAgICAgcmVzLnR5cGUgPSBcInJlY3RcIjtcbiAgICAgICAgJChlbCwgcmVzLmF0dHJzKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICAgIFIuX2VuZ2luZS5lbGxpcHNlID0gZnVuY3Rpb24gKHN2ZywgeCwgeSwgcngsIHJ5KSB7XG4gICAgICAgIHZhciBlbCA9ICQoXCJlbGxpcHNlXCIpO1xuICAgICAgICBzdmcuY2FudmFzICYmIHN2Zy5jYW52YXMuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB2YXIgcmVzID0gbmV3IEVsZW1lbnQoZWwsIHN2Zyk7XG4gICAgICAgIHJlcy5hdHRycyA9IHtjeDogeCwgY3k6IHksIHJ4OiByeCwgcnk6IHJ5LCBmaWxsOiBcIm5vbmVcIiwgc3Ryb2tlOiBcIiMwMDBcIn07XG4gICAgICAgIHJlcy50eXBlID0gXCJlbGxpcHNlXCI7XG4gICAgICAgICQoZWwsIHJlcy5hdHRycyk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICBSLl9lbmdpbmUuaW1hZ2UgPSBmdW5jdGlvbiAoc3ZnLCBzcmMsIHgsIHksIHcsIGgpIHtcbiAgICAgICAgdmFyIGVsID0gJChcImltYWdlXCIpO1xuICAgICAgICAkKGVsLCB7eDogeCwgeTogeSwgd2lkdGg6IHcsIGhlaWdodDogaCwgcHJlc2VydmVBc3BlY3RSYXRpbzogXCJub25lXCJ9KTtcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlTlMoeGxpbmssIFwiaHJlZlwiLCBzcmMpO1xuICAgICAgICBzdmcuY2FudmFzICYmIHN2Zy5jYW52YXMuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB2YXIgcmVzID0gbmV3IEVsZW1lbnQoZWwsIHN2Zyk7XG4gICAgICAgIHJlcy5hdHRycyA9IHt4OiB4LCB5OiB5LCB3aWR0aDogdywgaGVpZ2h0OiBoLCBzcmM6IHNyY307XG4gICAgICAgIHJlcy50eXBlID0gXCJpbWFnZVwiO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gICAgUi5fZW5naW5lLnRleHQgPSBmdW5jdGlvbiAoc3ZnLCB4LCB5LCB0ZXh0KSB7XG4gICAgICAgIHZhciBlbCA9ICQoXCJ0ZXh0XCIpO1xuICAgICAgICBzdmcuY2FudmFzICYmIHN2Zy5jYW52YXMuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB2YXIgcmVzID0gbmV3IEVsZW1lbnQoZWwsIHN2Zyk7XG4gICAgICAgIHJlcy5hdHRycyA9IHtcbiAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgXCJ0ZXh0LWFuY2hvclwiOiBcIm1pZGRsZVwiLFxuICAgICAgICAgICAgdGV4dDogdGV4dCxcbiAgICAgICAgICAgIGZvbnQ6IFIuX2F2YWlsYWJsZUF0dHJzLmZvbnQsXG4gICAgICAgICAgICBzdHJva2U6IFwibm9uZVwiLFxuICAgICAgICAgICAgZmlsbDogXCIjMDAwXCJcbiAgICAgICAgfTtcbiAgICAgICAgcmVzLnR5cGUgPSBcInRleHRcIjtcbiAgICAgICAgc2V0RmlsbEFuZFN0cm9rZShyZXMsIHJlcy5hdHRycyk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICBSLl9lbmdpbmUuc2V0U2l6ZSA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aCB8fCB0aGlzLndpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodCB8fCB0aGlzLmhlaWdodDtcbiAgICAgICAgdGhpcy5jYW52YXMuc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgdGhpcy53aWR0aCk7XG4gICAgICAgIHRoaXMuY2FudmFzLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIGlmICh0aGlzLl92aWV3Qm94KSB7XG4gICAgICAgICAgICB0aGlzLnNldFZpZXdCb3guYXBwbHkodGhpcywgdGhpcy5fdmlld0JveCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBSLl9lbmdpbmUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY29uID0gUi5fZ2V0Q29udGFpbmVyLmFwcGx5KDAsIGFyZ3VtZW50cyksXG4gICAgICAgICAgICBjb250YWluZXIgPSBjb24gJiYgY29uLmNvbnRhaW5lcixcbiAgICAgICAgICAgIHggPSBjb24ueCxcbiAgICAgICAgICAgIHkgPSBjb24ueSxcbiAgICAgICAgICAgIHdpZHRoID0gY29uLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0ID0gY29uLmhlaWdodDtcbiAgICAgICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNWRyBjb250YWluZXIgbm90IGZvdW5kLlwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY252cyA9ICQoXCJzdmdcIiksXG4gICAgICAgICAgICBjc3MgPSBcIm92ZXJmbG93OmhpZGRlbjtcIixcbiAgICAgICAgICAgIGlzRmxvYXRpbmc7XG4gICAgICAgIHggPSB4IHx8IDA7XG4gICAgICAgIHkgPSB5IHx8IDA7XG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgNTEyO1xuICAgICAgICBoZWlnaHQgPSBoZWlnaHQgfHwgMzQyO1xuICAgICAgICAkKGNudnMsIHtcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgdmVyc2lvbjogMS4xLFxuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgeG1sbnM6IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGNvbnRhaW5lciA9PSAxKSB7XG4gICAgICAgICAgICBjbnZzLnN0eWxlLmNzc1RleHQgPSBjc3MgKyBcInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6XCIgKyB4ICsgXCJweDt0b3A6XCIgKyB5ICsgXCJweFwiO1xuICAgICAgICAgICAgUi5fZy5kb2MuYm9keS5hcHBlbmRDaGlsZChjbnZzKTtcbiAgICAgICAgICAgIGlzRmxvYXRpbmcgPSAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY252cy5zdHlsZS5jc3NUZXh0ID0gY3NzICsgXCJwb3NpdGlvbjpyZWxhdGl2ZVwiO1xuICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmluc2VydEJlZm9yZShjbnZzLCBjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjbnZzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb250YWluZXIgPSBuZXcgUi5fUGFwZXI7XG4gICAgICAgIGNvbnRhaW5lci53aWR0aCA9IHdpZHRoO1xuICAgICAgICBjb250YWluZXIuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBjb250YWluZXIuY2FudmFzID0gY252cztcbiAgICAgICAgY29udGFpbmVyLmNsZWFyKCk7XG4gICAgICAgIGNvbnRhaW5lci5fbGVmdCA9IGNvbnRhaW5lci5fdG9wID0gMDtcbiAgICAgICAgaXNGbG9hdGluZyAmJiAoY29udGFpbmVyLnJlbmRlcmZpeCA9IGZ1bmN0aW9uICgpIHt9KTtcbiAgICAgICAgY29udGFpbmVyLnJlbmRlcmZpeCgpO1xuICAgICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH07XG4gICAgUi5fZW5naW5lLnNldFZpZXdCb3ggPSBmdW5jdGlvbiAoeCwgeSwgdywgaCwgZml0KSB7XG4gICAgICAgIGV2ZShcInJhcGhhZWwuc2V0Vmlld0JveFwiLCB0aGlzLCB0aGlzLl92aWV3Qm94LCBbeCwgeSwgdywgaCwgZml0XSk7XG4gICAgICAgIHZhciBzaXplID0gbW1heCh3IC8gdGhpcy53aWR0aCwgaCAvIHRoaXMuaGVpZ2h0KSxcbiAgICAgICAgICAgIHRvcCA9IHRoaXMudG9wLFxuICAgICAgICAgICAgYXNwZWN0UmF0aW8gPSBmaXQgPyBcIm1lZXRcIiA6IFwieE1pbllNaW5cIixcbiAgICAgICAgICAgIHZiLFxuICAgICAgICAgICAgc3c7XG4gICAgICAgIGlmICh4ID09IG51bGwpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl92YlNpemUpIHtcbiAgICAgICAgICAgICAgICBzaXplID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl92YlNpemU7XG4gICAgICAgICAgICB2YiA9IFwiMCAwIFwiICsgdGhpcy53aWR0aCArIFMgKyB0aGlzLmhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3ZiU2l6ZSA9IHNpemU7XG4gICAgICAgICAgICB2YiA9IHggKyBTICsgeSArIFMgKyB3ICsgUyArIGg7XG4gICAgICAgIH1cbiAgICAgICAgJCh0aGlzLmNhbnZhcywge1xuICAgICAgICAgICAgdmlld0JveDogdmIsXG4gICAgICAgICAgICBwcmVzZXJ2ZUFzcGVjdFJhdGlvOiBhc3BlY3RSYXRpb1xuICAgICAgICB9KTtcbiAgICAgICAgd2hpbGUgKHNpemUgJiYgdG9wKSB7XG4gICAgICAgICAgICBzdyA9IFwic3Ryb2tlLXdpZHRoXCIgaW4gdG9wLmF0dHJzID8gdG9wLmF0dHJzW1wic3Ryb2tlLXdpZHRoXCJdIDogMTtcbiAgICAgICAgICAgIHRvcC5hdHRyKHtcInN0cm9rZS13aWR0aFwiOiBzd30pO1xuICAgICAgICAgICAgdG9wLl8uZGlydHkgPSAxO1xuICAgICAgICAgICAgdG9wLl8uZGlydHlUID0gMTtcbiAgICAgICAgICAgIHRvcCA9IHRvcC5wcmV2O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3ZpZXdCb3ggPSBbeCwgeSwgdywgaCwgISFmaXRdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5yZW5kZXJmaXhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEZpeGVzIHRoZSBpc3N1ZSBvZiBGaXJlZm94IGFuZCBJRTkgcmVnYXJkaW5nIHN1YnBpeGVsIHJlbmRlcmluZy4gSWYgcGFwZXIgaXMgZGVwZW5kYW50XG4gICAgICogb24gb3RoZXIgZWxlbWVudHMgYWZ0ZXIgcmVmbG93IGl0IGNvdWxkIHNoaWZ0IGhhbGYgcGl4ZWwgd2hpY2ggY2F1c2UgZm9yIGxpbmVzIHRvIGxvc3QgdGhlaXIgY3Jpc3BuZXNzLlxuICAgICAqIFRoaXMgbWV0aG9kIGZpeGVzIHRoZSBpc3N1ZS5cbiAgICAgKipcbiAgICAgICBTcGVjaWFsIHRoYW5rcyB0byBNYXJpdXN6IE5vd2FrIChodHRwOi8vd3d3Lm1lZGlrb28uY29tLykgZm9yIHRoaXMgbWV0aG9kLlxuICAgIFxcKi9cbiAgICBSLnByb3RvdHlwZS5yZW5kZXJmaXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjbnZzID0gdGhpcy5jYW52YXMsXG4gICAgICAgICAgICBzID0gY252cy5zdHlsZSxcbiAgICAgICAgICAgIHBvcztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBvcyA9IGNudnMuZ2V0U2NyZWVuQ1RNKCkgfHwgY252cy5jcmVhdGVTVkdNYXRyaXgoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcG9zID0gY252cy5jcmVhdGVTVkdNYXRyaXgoKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbGVmdCA9IC1wb3MuZSAlIDEsXG4gICAgICAgICAgICB0b3AgPSAtcG9zLmYgJSAxO1xuICAgICAgICBpZiAobGVmdCB8fCB0b3ApIHtcbiAgICAgICAgICAgIGlmIChsZWZ0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGVmdCA9ICh0aGlzLl9sZWZ0ICsgbGVmdCkgJSAxO1xuICAgICAgICAgICAgICAgIHMubGVmdCA9IHRoaXMuX2xlZnQgKyBcInB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodG9wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdG9wID0gKHRoaXMuX3RvcCArIHRvcCkgJSAxO1xuICAgICAgICAgICAgICAgIHMudG9wID0gdGhpcy5fdG9wICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuY2xlYXJcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENsZWFycyB0aGUgcGFwZXIsIGkuZS4gcmVtb3ZlcyBhbGwgdGhlIGVsZW1lbnRzLlxuICAgIFxcKi9cbiAgICBSLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgUi5ldmUoXCJyYXBoYWVsLmNsZWFyXCIsIHRoaXMpO1xuICAgICAgICB2YXIgYyA9IHRoaXMuY2FudmFzO1xuICAgICAgICB3aGlsZSAoYy5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICBjLnJlbW92ZUNoaWxkKGMuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ib3R0b20gPSB0aGlzLnRvcCA9IG51bGw7XG4gICAgICAgICh0aGlzLmRlc2MgPSAkKFwiZGVzY1wiKSkuYXBwZW5kQ2hpbGQoUi5fZy5kb2MuY3JlYXRlVGV4dE5vZGUoXCJDcmVhdGVkIHdpdGggUmFwaGFcXHhlYmwgXCIgKyBSLnZlcnNpb24pKTtcbiAgICAgICAgYy5hcHBlbmRDaGlsZCh0aGlzLmRlc2MpO1xuICAgICAgICBjLmFwcGVuZENoaWxkKHRoaXMuZGVmcyA9ICQoXCJkZWZzXCIpKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5yZW1vdmVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgdGhlIHBhcGVyIGZyb20gdGhlIERPTS5cbiAgICBcXCovXG4gICAgUi5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBldmUoXCJyYXBoYWVsLnJlbW92ZVwiLCB0aGlzKTtcbiAgICAgICAgdGhpcy5jYW52YXMucGFyZW50Tm9kZSAmJiB0aGlzLmNhbnZhcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuY2FudmFzKTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzKSB7XG4gICAgICAgICAgICB0aGlzW2ldID0gdHlwZW9mIHRoaXNbaV0gPT0gXCJmdW5jdGlvblwiID8gUi5fcmVtb3ZlZEZhY3RvcnkoaSkgOiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgc2V0cHJvdG8gPSBSLnN0O1xuICAgIGZvciAodmFyIG1ldGhvZCBpbiBlbHByb3RvKSBpZiAoZWxwcm90b1toYXNdKG1ldGhvZCkgJiYgIXNldHByb3RvW2hhc10obWV0aG9kKSkge1xuICAgICAgICBzZXRwcm90b1ttZXRob2RdID0gKGZ1bmN0aW9uIChtZXRob2RuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBhcmcgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxbbWV0aG9kbmFtZV0uYXBwbHkoZWwsIGFyZyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KShtZXRob2QpO1xuICAgIH1cbn0od2luZG93LlJhcGhhZWwpOyIsIi8vIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkCBcXFxcXG4vLyDilIIgUmFwaGHDq2wgLSBKYXZhU2NyaXB0IFZlY3RvciBMaWJyYXJ5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIFxcXFxcbi8vIOKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpCBcXFxcXG4vLyDilIIgVk1MIE1vZHVsZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgXFxcXFxuLy8g4pSc4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkIFxcXFxcbi8vIOKUgiBDb3B5cmlnaHQgKGMpIDIwMDgtMjAxMSBEbWl0cnkgQmFyYW5vdnNraXkgKGh0dHA6Ly9yYXBoYWVsanMuY29tKSAgIOKUgiBcXFxcXG4vLyDilIIgQ29weXJpZ2h0IChjKSAyMDA4LTIwMTEgU2VuY2hhIExhYnMgKGh0dHA6Ly9zZW5jaGEuY29tKSAgICAgICAgICAgICDilIIgXFxcXFxuLy8g4pSCIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgKGh0dHA6Ly9yYXBoYWVsanMuY29tL2xpY2Vuc2UuaHRtbCkgbGljZW5zZS4g4pSCIFxcXFxcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmCBcXFxcXG53aW5kb3cuUmFwaGFlbCAmJiB3aW5kb3cuUmFwaGFlbC52bWwgJiYgZnVuY3Rpb24gKFIpIHtcbiAgICB2YXIgaGFzID0gXCJoYXNPd25Qcm9wZXJ0eVwiLFxuICAgICAgICBTdHIgPSBTdHJpbmcsXG4gICAgICAgIHRvRmxvYXQgPSBwYXJzZUZsb2F0LFxuICAgICAgICBtYXRoID0gTWF0aCxcbiAgICAgICAgcm91bmQgPSBtYXRoLnJvdW5kLFxuICAgICAgICBtbWF4ID0gbWF0aC5tYXgsXG4gICAgICAgIG1taW4gPSBtYXRoLm1pbixcbiAgICAgICAgYWJzID0gbWF0aC5hYnMsXG4gICAgICAgIGZpbGxTdHJpbmcgPSBcImZpbGxcIixcbiAgICAgICAgc2VwYXJhdG9yID0gL1ssIF0rLyxcbiAgICAgICAgZXZlID0gUi5ldmUsXG4gICAgICAgIG1zID0gXCIgcHJvZ2lkOkRYSW1hZ2VUcmFuc2Zvcm0uTWljcm9zb2Z0XCIsXG4gICAgICAgIFMgPSBcIiBcIixcbiAgICAgICAgRSA9IFwiXCIsXG4gICAgICAgIG1hcCA9IHtNOiBcIm1cIiwgTDogXCJsXCIsIEM6IFwiY1wiLCBaOiBcInhcIiwgbTogXCJ0XCIsIGw6IFwiclwiLCBjOiBcInZcIiwgejogXCJ4XCJ9LFxuICAgICAgICBiaXRlcyA9IC8oW2NsbXpdKSw/KFteY2xtel0qKS9naSxcbiAgICAgICAgYmx1cnJlZ2V4cCA9IC8gcHJvZ2lkOlxcUytCbHVyXFwoW15cXCldK1xcKS9nLFxuICAgICAgICB2YWwgPSAvLT9bXixcXHMtXSsvZyxcbiAgICAgICAgY3NzRG90ID0gXCJwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOjA7d2lkdGg6MXB4O2hlaWdodDoxcHhcIixcbiAgICAgICAgem9vbSA9IDIxNjAwLFxuICAgICAgICBwYXRoVHlwZXMgPSB7cGF0aDogMSwgcmVjdDogMSwgaW1hZ2U6IDF9LFxuICAgICAgICBvdmFsVHlwZXMgPSB7Y2lyY2xlOiAxLCBlbGxpcHNlOiAxfSxcbiAgICAgICAgcGF0aDJ2bWwgPSBmdW5jdGlvbiAocGF0aCkge1xuICAgICAgICAgICAgdmFyIHRvdGFsID0gIC9bYWhxc3R2XS9pZyxcbiAgICAgICAgICAgICAgICBjb21tYW5kID0gUi5fcGF0aFRvQWJzb2x1dGU7XG4gICAgICAgICAgICBTdHIocGF0aCkubWF0Y2godG90YWwpICYmIChjb21tYW5kID0gUi5fcGF0aDJjdXJ2ZSk7XG4gICAgICAgICAgICB0b3RhbCA9IC9bY2xtel0vZztcbiAgICAgICAgICAgIGlmIChjb21tYW5kID09IFIuX3BhdGhUb0Fic29sdXRlICYmICFTdHIocGF0aCkubWF0Y2godG90YWwpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlcyA9IFN0cihwYXRoKS5yZXBsYWNlKGJpdGVzLCBmdW5jdGlvbiAoYWxsLCBjb21tYW5kLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWxzID0gW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBpc01vdmUgPSBjb21tYW5kLnRvTG93ZXJDYXNlKCkgPT0gXCJtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMgPSBtYXBbY29tbWFuZF07XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MucmVwbGFjZSh2YWwsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzTW92ZSAmJiB2YWxzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzICs9IHZhbHMgKyBtYXBbY29tbWFuZCA9PSBcIm1cIiA/IFwibFwiIDogXCJMXCJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHMucHVzaChyb3VuZCh2YWx1ZSAqIHpvb20pKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXMgKyB2YWxzO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcGEgPSBjb21tYW5kKHBhdGgpLCBwLCByO1xuICAgICAgICAgICAgcmVzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBwYS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcCA9IHBhW2ldO1xuICAgICAgICAgICAgICAgIHIgPSBwYVtpXVswXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIHIgPT0gXCJ6XCIgJiYgKHIgPSBcInhcIik7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDEsIGpqID0gcC5sZW5ndGg7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHIgKz0gcm91bmQocFtqXSAqIHpvb20pICsgKGogIT0gamogLSAxID8gXCIsXCIgOiBFKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzLnB1c2gocik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzLmpvaW4oUyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbXBlbnNhdGlvbiA9IGZ1bmN0aW9uIChkZWcsIGR4LCBkeSkge1xuICAgICAgICAgICAgdmFyIG0gPSBSLm1hdHJpeCgpO1xuICAgICAgICAgICAgbS5yb3RhdGUoLWRlZywgLjUsIC41KTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZHg6IG0ueChkeCwgZHkpLFxuICAgICAgICAgICAgICAgIGR5OiBtLnkoZHgsIGR5KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0Q29vcmRzID0gZnVuY3Rpb24gKHAsIHN4LCBzeSwgZHgsIGR5LCBkZWcpIHtcbiAgICAgICAgICAgIHZhciBfID0gcC5fLFxuICAgICAgICAgICAgICAgIG0gPSBwLm1hdHJpeCxcbiAgICAgICAgICAgICAgICBmaWxscG9zID0gXy5maWxscG9zLFxuICAgICAgICAgICAgICAgIG8gPSBwLm5vZGUsXG4gICAgICAgICAgICAgICAgcyA9IG8uc3R5bGUsXG4gICAgICAgICAgICAgICAgeSA9IDEsXG4gICAgICAgICAgICAgICAgZmxpcCA9IFwiXCIsXG4gICAgICAgICAgICAgICAgZHhkeSxcbiAgICAgICAgICAgICAgICBreCA9IHpvb20gLyBzeCxcbiAgICAgICAgICAgICAgICBreSA9IHpvb20gLyBzeTtcbiAgICAgICAgICAgIHMudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICAgICAgICBpZiAoIXN4IHx8ICFzeSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG8uY29vcmRzaXplID0gYWJzKGt4KSArIFMgKyBhYnMoa3kpO1xuICAgICAgICAgICAgcy5yb3RhdGlvbiA9IGRlZyAqIChzeCAqIHN5IDwgMCA/IC0xIDogMSk7XG4gICAgICAgICAgICBpZiAoZGVnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGMgPSBjb21wZW5zYXRpb24oZGVnLCBkeCwgZHkpO1xuICAgICAgICAgICAgICAgIGR4ID0gYy5keDtcbiAgICAgICAgICAgICAgICBkeSA9IGMuZHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzeCA8IDAgJiYgKGZsaXAgKz0gXCJ4XCIpO1xuICAgICAgICAgICAgc3kgPCAwICYmIChmbGlwICs9IFwiIHlcIikgJiYgKHkgPSAtMSk7XG4gICAgICAgICAgICBzLmZsaXAgPSBmbGlwO1xuICAgICAgICAgICAgby5jb29yZG9yaWdpbiA9IChkeCAqIC1reCkgKyBTICsgKGR5ICogLWt5KTtcbiAgICAgICAgICAgIGlmIChmaWxscG9zIHx8IF8uZmlsbHNpemUpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmlsbCA9IG8uZ2V0RWxlbWVudHNCeVRhZ05hbWUoZmlsbFN0cmluZyk7XG4gICAgICAgICAgICAgICAgZmlsbCA9IGZpbGwgJiYgZmlsbFswXTtcbiAgICAgICAgICAgICAgICBvLnJlbW92ZUNoaWxkKGZpbGwpO1xuICAgICAgICAgICAgICAgIGlmIChmaWxscG9zKSB7XG4gICAgICAgICAgICAgICAgICAgIGMgPSBjb21wZW5zYXRpb24oZGVnLCBtLngoZmlsbHBvc1swXSwgZmlsbHBvc1sxXSksIG0ueShmaWxscG9zWzBdLCBmaWxscG9zWzFdKSk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGwucG9zaXRpb24gPSBjLmR4ICogeSArIFMgKyBjLmR5ICogeTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF8uZmlsbHNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsbC5zaXplID0gXy5maWxsc2l6ZVswXSAqIGFicyhzeCkgKyBTICsgXy5maWxsc2l6ZVsxXSAqIGFicyhzeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG8uYXBwZW5kQ2hpbGQoZmlsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgfTtcbiAgICBSLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gIFwiWW91ciBicm93c2VyIGRvZXNuXFx1MjAxOXQgc3VwcG9ydCBTVkcuIEZhbGxpbmcgZG93biB0byBWTUwuXFxuWW91IGFyZSBydW5uaW5nIFJhcGhhXFx4ZWJsIFwiICsgdGhpcy52ZXJzaW9uO1xuICAgIH07XG4gICAgdmFyIGFkZEFycm93ID0gZnVuY3Rpb24gKG8sIHZhbHVlLCBpc0VuZCkge1xuICAgICAgICB2YXIgdmFsdWVzID0gU3RyKHZhbHVlKS50b0xvd2VyQ2FzZSgpLnNwbGl0KFwiLVwiKSxcbiAgICAgICAgICAgIHNlID0gaXNFbmQgPyBcImVuZFwiIDogXCJzdGFydFwiLFxuICAgICAgICAgICAgaSA9IHZhbHVlcy5sZW5ndGgsXG4gICAgICAgICAgICB0eXBlID0gXCJjbGFzc2ljXCIsXG4gICAgICAgICAgICB3ID0gXCJtZWRpdW1cIixcbiAgICAgICAgICAgIGggPSBcIm1lZGl1bVwiO1xuICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHZhbHVlc1tpXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJibG9ja1wiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJjbGFzc2ljXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcIm92YWxcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwiZGlhbW9uZFwiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJvcGVuXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcIm5vbmVcIjpcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9IHZhbHVlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIndpZGVcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwibmFycm93XCI6IGggPSB2YWx1ZXNbaV07IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJsb25nXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcInNob3J0XCI6IHcgPSB2YWx1ZXNbaV07IGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBzdHJva2UgPSBvLm5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzdHJva2VcIilbMF07XG4gICAgICAgIHN0cm9rZVtzZSArIFwiYXJyb3dcIl0gPSB0eXBlO1xuICAgICAgICBzdHJva2Vbc2UgKyBcImFycm93bGVuZ3RoXCJdID0gdztcbiAgICAgICAgc3Ryb2tlW3NlICsgXCJhcnJvd3dpZHRoXCJdID0gaDtcbiAgICB9LFxuICAgIHNldEZpbGxBbmRTdHJva2UgPSBmdW5jdGlvbiAobywgcGFyYW1zKSB7XG4gICAgICAgIC8vIG8ucGFwZXIuY2FudmFzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgby5hdHRycyA9IG8uYXR0cnMgfHwge307XG4gICAgICAgIHZhciBub2RlID0gby5ub2RlLFxuICAgICAgICAgICAgYSA9IG8uYXR0cnMsXG4gICAgICAgICAgICBzID0gbm9kZS5zdHlsZSxcbiAgICAgICAgICAgIHh5LFxuICAgICAgICAgICAgbmV3cGF0aCA9IHBhdGhUeXBlc1tvLnR5cGVdICYmIChwYXJhbXMueCAhPSBhLnggfHwgcGFyYW1zLnkgIT0gYS55IHx8IHBhcmFtcy53aWR0aCAhPSBhLndpZHRoIHx8IHBhcmFtcy5oZWlnaHQgIT0gYS5oZWlnaHQgfHwgcGFyYW1zLmN4ICE9IGEuY3ggfHwgcGFyYW1zLmN5ICE9IGEuY3kgfHwgcGFyYW1zLnJ4ICE9IGEucnggfHwgcGFyYW1zLnJ5ICE9IGEucnkgfHwgcGFyYW1zLnIgIT0gYS5yKSxcbiAgICAgICAgICAgIGlzT3ZhbCA9IG92YWxUeXBlc1tvLnR5cGVdICYmIChhLmN4ICE9IHBhcmFtcy5jeCB8fCBhLmN5ICE9IHBhcmFtcy5jeSB8fCBhLnIgIT0gcGFyYW1zLnIgfHwgYS5yeCAhPSBwYXJhbXMucnggfHwgYS5yeSAhPSBwYXJhbXMucnkpLFxuICAgICAgICAgICAgcmVzID0gbztcblxuXG4gICAgICAgIGZvciAodmFyIHBhciBpbiBwYXJhbXMpIGlmIChwYXJhbXNbaGFzXShwYXIpKSB7XG4gICAgICAgICAgICBhW3Bhcl0gPSBwYXJhbXNbcGFyXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV3cGF0aCkge1xuICAgICAgICAgICAgYS5wYXRoID0gUi5fZ2V0UGF0aFtvLnR5cGVdKG8pO1xuICAgICAgICAgICAgby5fLmRpcnR5ID0gMTtcbiAgICAgICAgfVxuICAgICAgICBwYXJhbXMuaHJlZiAmJiAobm9kZS5ocmVmID0gcGFyYW1zLmhyZWYpO1xuICAgICAgICBwYXJhbXMudGl0bGUgJiYgKG5vZGUudGl0bGUgPSBwYXJhbXMudGl0bGUpO1xuICAgICAgICBwYXJhbXMudGFyZ2V0ICYmIChub2RlLnRhcmdldCA9IHBhcmFtcy50YXJnZXQpO1xuICAgICAgICBwYXJhbXMuY3Vyc29yICYmIChzLmN1cnNvciA9IHBhcmFtcy5jdXJzb3IpO1xuICAgICAgICBcImJsdXJcIiBpbiBwYXJhbXMgJiYgby5ibHVyKHBhcmFtcy5ibHVyKTtcbiAgICAgICAgaWYgKHBhcmFtcy5wYXRoICYmIG8udHlwZSA9PSBcInBhdGhcIiB8fCBuZXdwYXRoKSB7XG4gICAgICAgICAgICBub2RlLnBhdGggPSBwYXRoMnZtbCh+U3RyKGEucGF0aCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKFwiclwiKSA/IFIuX3BhdGhUb0Fic29sdXRlKGEucGF0aCkgOiBhLnBhdGgpO1xuICAgICAgICAgICAgaWYgKG8udHlwZSA9PSBcImltYWdlXCIpIHtcbiAgICAgICAgICAgICAgICBvLl8uZmlsbHBvcyA9IFthLngsIGEueV07XG4gICAgICAgICAgICAgICAgby5fLmZpbGxzaXplID0gW2Eud2lkdGgsIGEuaGVpZ2h0XTtcbiAgICAgICAgICAgICAgICBzZXRDb29yZHMobywgMSwgMSwgMCwgMCwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXCJ0cmFuc2Zvcm1cIiBpbiBwYXJhbXMgJiYgby50cmFuc2Zvcm0ocGFyYW1zLnRyYW5zZm9ybSk7XG4gICAgICAgIGlmIChpc092YWwpIHtcbiAgICAgICAgICAgIHZhciBjeCA9ICthLmN4LFxuICAgICAgICAgICAgICAgIGN5ID0gK2EuY3ksXG4gICAgICAgICAgICAgICAgcnggPSArYS5yeCB8fCArYS5yIHx8IDAsXG4gICAgICAgICAgICAgICAgcnkgPSArYS5yeSB8fCArYS5yIHx8IDA7XG4gICAgICAgICAgICBub2RlLnBhdGggPSBSLmZvcm1hdChcImFyezB9LHsxfSx7Mn0sezN9LHs0fSx7MX0sezR9LHsxfXhcIiwgcm91bmQoKGN4IC0gcngpICogem9vbSksIHJvdW5kKChjeSAtIHJ5KSAqIHpvb20pLCByb3VuZCgoY3ggKyByeCkgKiB6b29tKSwgcm91bmQoKGN5ICsgcnkpICogem9vbSksIHJvdW5kKGN4ICogem9vbSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChcImNsaXAtcmVjdFwiIGluIHBhcmFtcykge1xuICAgICAgICAgICAgdmFyIHJlY3QgPSBTdHIocGFyYW1zW1wiY2xpcC1yZWN0XCJdKS5zcGxpdChzZXBhcmF0b3IpO1xuICAgICAgICAgICAgaWYgKHJlY3QubGVuZ3RoID09IDQpIHtcbiAgICAgICAgICAgICAgICByZWN0WzJdID0gK3JlY3RbMl0gKyAoK3JlY3RbMF0pO1xuICAgICAgICAgICAgICAgIHJlY3RbM10gPSArcmVjdFszXSArICgrcmVjdFsxXSk7XG4gICAgICAgICAgICAgICAgdmFyIGRpdiA9IG5vZGUuY2xpcFJlY3QgfHwgUi5fZy5kb2MuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcbiAgICAgICAgICAgICAgICAgICAgZHN0eWxlID0gZGl2LnN0eWxlO1xuICAgICAgICAgICAgICAgIGRzdHlsZS5jbGlwID0gUi5mb3JtYXQoXCJyZWN0KHsxfXB4IHsyfXB4IHszfXB4IHswfXB4KVwiLCByZWN0KTtcbiAgICAgICAgICAgICAgICBpZiAoIW5vZGUuY2xpcFJlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgZHN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgICAgICAgICAgICAgICAgICBkc3R5bGUudG9wID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZHN0eWxlLmxlZnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBkc3R5bGUud2lkdGggPSBvLnBhcGVyLndpZHRoICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICBkc3R5bGUuaGVpZ2h0ID0gby5wYXBlci5oZWlnaHQgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZGl2LCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICBub2RlLmNsaXBSZWN0ID0gZGl2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcGFyYW1zW1wiY2xpcC1yZWN0XCJdKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5jbGlwUmVjdCAmJiAobm9kZS5jbGlwUmVjdC5zdHlsZS5jbGlwID0gXCJhdXRvXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvLnRleHRwYXRoKSB7XG4gICAgICAgICAgICB2YXIgdGV4dHBhdGhTdHlsZSA9IG8udGV4dHBhdGguc3R5bGU7XG4gICAgICAgICAgICBwYXJhbXMuZm9udCAmJiAodGV4dHBhdGhTdHlsZS5mb250ID0gcGFyYW1zLmZvbnQpO1xuICAgICAgICAgICAgcGFyYW1zW1wiZm9udC1mYW1pbHlcIl0gJiYgKHRleHRwYXRoU3R5bGUuZm9udEZhbWlseSA9ICdcIicgKyBwYXJhbXNbXCJmb250LWZhbWlseVwiXS5zcGxpdChcIixcIilbMF0ucmVwbGFjZSgvXlsnXCJdK3xbJ1wiXSskL2csIEUpICsgJ1wiJyk7XG4gICAgICAgICAgICBwYXJhbXNbXCJmb250LXNpemVcIl0gJiYgKHRleHRwYXRoU3R5bGUuZm9udFNpemUgPSBwYXJhbXNbXCJmb250LXNpemVcIl0pO1xuICAgICAgICAgICAgcGFyYW1zW1wiZm9udC13ZWlnaHRcIl0gJiYgKHRleHRwYXRoU3R5bGUuZm9udFdlaWdodCA9IHBhcmFtc1tcImZvbnQtd2VpZ2h0XCJdKTtcbiAgICAgICAgICAgIHBhcmFtc1tcImZvbnQtc3R5bGVcIl0gJiYgKHRleHRwYXRoU3R5bGUuZm9udFN0eWxlID0gcGFyYW1zW1wiZm9udC1zdHlsZVwiXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFwiYXJyb3ctc3RhcnRcIiBpbiBwYXJhbXMpIHtcbiAgICAgICAgICAgIGFkZEFycm93KHJlcywgcGFyYW1zW1wiYXJyb3ctc3RhcnRcIl0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChcImFycm93LWVuZFwiIGluIHBhcmFtcykge1xuICAgICAgICAgICAgYWRkQXJyb3cocmVzLCBwYXJhbXNbXCJhcnJvdy1lbmRcIl0sIDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJhbXMub3BhY2l0eSAhPSBudWxsIHx8IFxuICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLXdpZHRoXCJdICE9IG51bGwgfHxcbiAgICAgICAgICAgIHBhcmFtcy5maWxsICE9IG51bGwgfHxcbiAgICAgICAgICAgIHBhcmFtcy5zcmMgIT0gbnVsbCB8fFxuICAgICAgICAgICAgcGFyYW1zLnN0cm9rZSAhPSBudWxsIHx8XG4gICAgICAgICAgICBwYXJhbXNbXCJzdHJva2Utd2lkdGhcIl0gIT0gbnVsbCB8fFxuICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLW9wYWNpdHlcIl0gIT0gbnVsbCB8fFxuICAgICAgICAgICAgcGFyYW1zW1wiZmlsbC1vcGFjaXR5XCJdICE9IG51bGwgfHxcbiAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS1kYXNoYXJyYXlcIl0gIT0gbnVsbCB8fFxuICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLW1pdGVybGltaXRcIl0gIT0gbnVsbCB8fFxuICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLWxpbmVqb2luXCJdICE9IG51bGwgfHxcbiAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS1saW5lY2FwXCJdICE9IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBmaWxsID0gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZShmaWxsU3RyaW5nKSxcbiAgICAgICAgICAgICAgICBuZXdmaWxsID0gZmFsc2U7XG4gICAgICAgICAgICBmaWxsID0gZmlsbCAmJiBmaWxsWzBdO1xuICAgICAgICAgICAgIWZpbGwgJiYgKG5ld2ZpbGwgPSBmaWxsID0gY3JlYXRlTm9kZShmaWxsU3RyaW5nKSk7XG4gICAgICAgICAgICBpZiAoby50eXBlID09IFwiaW1hZ2VcIiAmJiBwYXJhbXMuc3JjKSB7XG4gICAgICAgICAgICAgICAgZmlsbC5zcmMgPSBwYXJhbXMuc3JjO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyYW1zLmZpbGwgJiYgKGZpbGwub24gPSB0cnVlKTtcbiAgICAgICAgICAgIGlmIChmaWxsLm9uID09IG51bGwgfHwgcGFyYW1zLmZpbGwgPT0gXCJub25lXCIgfHwgcGFyYW1zLmZpbGwgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBmaWxsLm9uID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZmlsbC5vbiAmJiBwYXJhbXMuZmlsbCkge1xuICAgICAgICAgICAgICAgIHZhciBpc1VSTCA9IFN0cihwYXJhbXMuZmlsbCkubWF0Y2goUi5fSVNVUkwpO1xuICAgICAgICAgICAgICAgIGlmIChpc1VSTCkge1xuICAgICAgICAgICAgICAgICAgICBmaWxsLnBhcmVudE5vZGUgPT0gbm9kZSAmJiBub2RlLnJlbW92ZUNoaWxkKGZpbGwpO1xuICAgICAgICAgICAgICAgICAgICBmaWxsLnJvdGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGZpbGwuc3JjID0gaXNVUkxbMV07XG4gICAgICAgICAgICAgICAgICAgIGZpbGwudHlwZSA9IFwidGlsZVwiO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmJveCA9IG8uZ2V0QkJveCgxKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsbC5wb3NpdGlvbiA9IGJib3gueCArIFMgKyBiYm94Lnk7XG4gICAgICAgICAgICAgICAgICAgIG8uXy5maWxscG9zID0gW2Jib3gueCwgYmJveC55XTtcblxuICAgICAgICAgICAgICAgICAgICBSLl9wcmVsb2FkKGlzVVJMWzFdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLl8uZmlsbHNpemUgPSBbdGhpcy5vZmZzZXRXaWR0aCwgdGhpcy5vZmZzZXRIZWlnaHRdO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmaWxsLmNvbG9yID0gUi5nZXRSR0IocGFyYW1zLmZpbGwpLmhleDtcbiAgICAgICAgICAgICAgICAgICAgZmlsbC5zcmMgPSBFO1xuICAgICAgICAgICAgICAgICAgICBmaWxsLnR5cGUgPSBcInNvbGlkXCI7XG4gICAgICAgICAgICAgICAgICAgIGlmIChSLmdldFJHQihwYXJhbXMuZmlsbCkuZXJyb3IgJiYgKHJlcy50eXBlIGluIHtjaXJjbGU6IDEsIGVsbGlwc2U6IDF9IHx8IFN0cihwYXJhbXMuZmlsbCkuY2hhckF0KCkgIT0gXCJyXCIpICYmIGFkZEdyYWRpZW50RmlsbChyZXMsIHBhcmFtcy5maWxsLCBmaWxsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYS5maWxsID0gXCJub25lXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBhLmdyYWRpZW50ID0gcGFyYW1zLmZpbGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsLnJvdGF0ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKFwiZmlsbC1vcGFjaXR5XCIgaW4gcGFyYW1zIHx8IFwib3BhY2l0eVwiIGluIHBhcmFtcykge1xuICAgICAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gKCgrYVtcImZpbGwtb3BhY2l0eVwiXSArIDEgfHwgMikgLSAxKSAqICgoK2Eub3BhY2l0eSArIDEgfHwgMikgLSAxKSAqICgoK1IuZ2V0UkdCKHBhcmFtcy5maWxsKS5vICsgMSB8fCAyKSAtIDEpO1xuICAgICAgICAgICAgICAgIG9wYWNpdHkgPSBtbWluKG1tYXgob3BhY2l0eSwgMCksIDEpO1xuICAgICAgICAgICAgICAgIGZpbGwub3BhY2l0eSA9IG9wYWNpdHk7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGwuc3JjKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGwuY29sb3IgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKGZpbGwpO1xuICAgICAgICAgICAgdmFyIHN0cm9rZSA9IChub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic3Ryb2tlXCIpICYmIG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzdHJva2VcIilbMF0pLFxuICAgICAgICAgICAgbmV3c3Ryb2tlID0gZmFsc2U7XG4gICAgICAgICAgICAhc3Ryb2tlICYmIChuZXdzdHJva2UgPSBzdHJva2UgPSBjcmVhdGVOb2RlKFwic3Ryb2tlXCIpKTtcbiAgICAgICAgICAgIGlmICgocGFyYW1zLnN0cm9rZSAmJiBwYXJhbXMuc3Ryb2tlICE9IFwibm9uZVwiKSB8fFxuICAgICAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS13aWR0aFwiXSB8fFxuICAgICAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS1vcGFjaXR5XCJdICE9IG51bGwgfHxcbiAgICAgICAgICAgICAgICBwYXJhbXNbXCJzdHJva2UtZGFzaGFycmF5XCJdIHx8XG4gICAgICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLW1pdGVybGltaXRcIl0gfHxcbiAgICAgICAgICAgICAgICBwYXJhbXNbXCJzdHJva2UtbGluZWpvaW5cIl0gfHxcbiAgICAgICAgICAgICAgICBwYXJhbXNbXCJzdHJva2UtbGluZWNhcFwiXSkge1xuICAgICAgICAgICAgICAgIHN0cm9rZS5vbiA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAocGFyYW1zLnN0cm9rZSA9PSBcIm5vbmVcIiB8fCBwYXJhbXMuc3Ryb2tlID09PSBudWxsIHx8IHN0cm9rZS5vbiA9PSBudWxsIHx8IHBhcmFtcy5zdHJva2UgPT0gMCB8fCBwYXJhbXNbXCJzdHJva2Utd2lkdGhcIl0gPT0gMCkgJiYgKHN0cm9rZS5vbiA9IGZhbHNlKTtcbiAgICAgICAgICAgIHZhciBzdHJva2VDb2xvciA9IFIuZ2V0UkdCKHBhcmFtcy5zdHJva2UpO1xuICAgICAgICAgICAgc3Ryb2tlLm9uICYmIHBhcmFtcy5zdHJva2UgJiYgKHN0cm9rZS5jb2xvciA9IHN0cm9rZUNvbG9yLmhleCk7XG4gICAgICAgICAgICBvcGFjaXR5ID0gKCgrYVtcInN0cm9rZS1vcGFjaXR5XCJdICsgMSB8fCAyKSAtIDEpICogKCgrYS5vcGFjaXR5ICsgMSB8fCAyKSAtIDEpICogKCgrc3Ryb2tlQ29sb3IubyArIDEgfHwgMikgLSAxKTtcbiAgICAgICAgICAgIHZhciB3aWR0aCA9ICh0b0Zsb2F0KHBhcmFtc1tcInN0cm9rZS13aWR0aFwiXSkgfHwgMSkgKiAuNzU7XG4gICAgICAgICAgICBvcGFjaXR5ID0gbW1pbihtbWF4KG9wYWNpdHksIDApLCAxKTtcbiAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS13aWR0aFwiXSA9PSBudWxsICYmICh3aWR0aCA9IGFbXCJzdHJva2Utd2lkdGhcIl0pO1xuICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLXdpZHRoXCJdICYmIChzdHJva2Uud2VpZ2h0ID0gd2lkdGgpO1xuICAgICAgICAgICAgd2lkdGggJiYgd2lkdGggPCAxICYmIChvcGFjaXR5ICo9IHdpZHRoKSAmJiAoc3Ryb2tlLndlaWdodCA9IDEpO1xuICAgICAgICAgICAgc3Ryb2tlLm9wYWNpdHkgPSBvcGFjaXR5O1xuICAgICAgICBcbiAgICAgICAgICAgIHBhcmFtc1tcInN0cm9rZS1saW5lam9pblwiXSAmJiAoc3Ryb2tlLmpvaW5zdHlsZSA9IHBhcmFtc1tcInN0cm9rZS1saW5lam9pblwiXSB8fCBcIm1pdGVyXCIpO1xuICAgICAgICAgICAgc3Ryb2tlLm1pdGVybGltaXQgPSBwYXJhbXNbXCJzdHJva2UtbWl0ZXJsaW1pdFwiXSB8fCA4O1xuICAgICAgICAgICAgcGFyYW1zW1wic3Ryb2tlLWxpbmVjYXBcIl0gJiYgKHN0cm9rZS5lbmRjYXAgPSBwYXJhbXNbXCJzdHJva2UtbGluZWNhcFwiXSA9PSBcImJ1dHRcIiA/IFwiZmxhdFwiIDogcGFyYW1zW1wic3Ryb2tlLWxpbmVjYXBcIl0gPT0gXCJzcXVhcmVcIiA/IFwic3F1YXJlXCIgOiBcInJvdW5kXCIpO1xuICAgICAgICAgICAgaWYgKHBhcmFtc1tcInN0cm9rZS1kYXNoYXJyYXlcIl0pIHtcbiAgICAgICAgICAgICAgICB2YXIgZGFzaGFycmF5ID0ge1xuICAgICAgICAgICAgICAgICAgICBcIi1cIjogXCJzaG9ydGRhc2hcIixcbiAgICAgICAgICAgICAgICAgICAgXCIuXCI6IFwic2hvcnRkb3RcIixcbiAgICAgICAgICAgICAgICAgICAgXCItLlwiOiBcInNob3J0ZGFzaGRvdFwiLFxuICAgICAgICAgICAgICAgICAgICBcIi0uLlwiOiBcInNob3J0ZGFzaGRvdGRvdFwiLFxuICAgICAgICAgICAgICAgICAgICBcIi4gXCI6IFwiZG90XCIsXG4gICAgICAgICAgICAgICAgICAgIFwiLSBcIjogXCJkYXNoXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiLS1cIjogXCJsb25nZGFzaFwiLFxuICAgICAgICAgICAgICAgICAgICBcIi0gLlwiOiBcImRhc2hkb3RcIixcbiAgICAgICAgICAgICAgICAgICAgXCItLS5cIjogXCJsb25nZGFzaGRvdFwiLFxuICAgICAgICAgICAgICAgICAgICBcIi0tLi5cIjogXCJsb25nZGFzaGRvdGRvdFwiXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzdHJva2UuZGFzaHN0eWxlID0gZGFzaGFycmF5W2hhc10ocGFyYW1zW1wic3Ryb2tlLWRhc2hhcnJheVwiXSkgPyBkYXNoYXJyYXlbcGFyYW1zW1wic3Ryb2tlLWRhc2hhcnJheVwiXV0gOiBFO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3c3Ryb2tlICYmIG5vZGUuYXBwZW5kQ2hpbGQoc3Ryb2tlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzLnR5cGUgPT0gXCJ0ZXh0XCIpIHtcbiAgICAgICAgICAgIHJlcy5wYXBlci5jYW52YXMuc3R5bGUuZGlzcGxheSA9IEU7XG4gICAgICAgICAgICB2YXIgc3BhbiA9IHJlcy5wYXBlci5zcGFuLFxuICAgICAgICAgICAgICAgIG0gPSAxMDAsXG4gICAgICAgICAgICAgICAgZm9udFNpemUgPSBhLmZvbnQgJiYgYS5mb250Lm1hdGNoKC9cXGQrKD86XFwuXFxkKik/KD89cHgpLyk7XG4gICAgICAgICAgICBzID0gc3Bhbi5zdHlsZTtcbiAgICAgICAgICAgIGEuZm9udCAmJiAocy5mb250ID0gYS5mb250KTtcbiAgICAgICAgICAgIGFbXCJmb250LWZhbWlseVwiXSAmJiAocy5mb250RmFtaWx5ID0gYVtcImZvbnQtZmFtaWx5XCJdKTtcbiAgICAgICAgICAgIGFbXCJmb250LXdlaWdodFwiXSAmJiAocy5mb250V2VpZ2h0ID0gYVtcImZvbnQtd2VpZ2h0XCJdKTtcbiAgICAgICAgICAgIGFbXCJmb250LXN0eWxlXCJdICYmIChzLmZvbnRTdHlsZSA9IGFbXCJmb250LXN0eWxlXCJdKTtcbiAgICAgICAgICAgIGZvbnRTaXplID0gdG9GbG9hdChhW1wiZm9udC1zaXplXCJdIHx8IGZvbnRTaXplICYmIGZvbnRTaXplWzBdKSB8fCAxMDtcbiAgICAgICAgICAgIHMuZm9udFNpemUgPSBmb250U2l6ZSAqIG0gKyBcInB4XCI7XG4gICAgICAgICAgICByZXMudGV4dHBhdGguc3RyaW5nICYmIChzcGFuLmlubmVySFRNTCA9IFN0cihyZXMudGV4dHBhdGguc3RyaW5nKS5yZXBsYWNlKC88L2csIFwiJiM2MDtcIikucmVwbGFjZSgvJi9nLCBcIiYjMzg7XCIpLnJlcGxhY2UoL1xcbi9nLCBcIjxicj5cIikpO1xuICAgICAgICAgICAgdmFyIGJyZWN0ID0gc3Bhbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgIHJlcy5XID0gYS53ID0gKGJyZWN0LnJpZ2h0IC0gYnJlY3QubGVmdCkgLyBtO1xuICAgICAgICAgICAgcmVzLkggPSBhLmggPSAoYnJlY3QuYm90dG9tIC0gYnJlY3QudG9wKSAvIG07XG4gICAgICAgICAgICAvLyByZXMucGFwZXIuY2FudmFzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIHJlcy5YID0gYS54O1xuICAgICAgICAgICAgcmVzLlkgPSBhLnkgKyByZXMuSCAvIDI7XG5cbiAgICAgICAgICAgIChcInhcIiBpbiBwYXJhbXMgfHwgXCJ5XCIgaW4gcGFyYW1zKSAmJiAocmVzLnBhdGgudiA9IFIuZm9ybWF0KFwibXswfSx7MX1sezJ9LHsxfVwiLCByb3VuZChhLnggKiB6b29tKSwgcm91bmQoYS55ICogem9vbSksIHJvdW5kKGEueCAqIHpvb20pICsgMSkpO1xuICAgICAgICAgICAgdmFyIGRpcnR5YXR0cnMgPSBbXCJ4XCIsIFwieVwiLCBcInRleHRcIiwgXCJmb250XCIsIFwiZm9udC1mYW1pbHlcIiwgXCJmb250LXdlaWdodFwiLCBcImZvbnQtc3R5bGVcIiwgXCJmb250LXNpemVcIl07XG4gICAgICAgICAgICBmb3IgKHZhciBkID0gMCwgZGQgPSBkaXJ0eWF0dHJzLmxlbmd0aDsgZCA8IGRkOyBkKyspIGlmIChkaXJ0eWF0dHJzW2RdIGluIHBhcmFtcykge1xuICAgICAgICAgICAgICAgIHJlcy5fLmRpcnR5ID0gMTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICAgICAvLyB0ZXh0LWFuY2hvciBlbXVsYXRpb25cbiAgICAgICAgICAgIHN3aXRjaCAoYVtcInRleHQtYW5jaG9yXCJdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcInN0YXJ0XCI6XG4gICAgICAgICAgICAgICAgICAgIHJlcy50ZXh0cGF0aC5zdHlsZVtcInYtdGV4dC1hbGlnblwiXSA9IFwibGVmdFwiO1xuICAgICAgICAgICAgICAgICAgICByZXMuYmJ4ID0gcmVzLlcgLyAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgICAgICAgICAgcmVzLnRleHRwYXRoLnN0eWxlW1widi10ZXh0LWFsaWduXCJdID0gXCJyaWdodFwiO1xuICAgICAgICAgICAgICAgICAgICByZXMuYmJ4ID0gLXJlcy5XIC8gMjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXMudGV4dHBhdGguc3R5bGVbXCJ2LXRleHQtYWxpZ25cIl0gPSBcImNlbnRlclwiO1xuICAgICAgICAgICAgICAgICAgICByZXMuYmJ4ID0gMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcy50ZXh0cGF0aC5zdHlsZVtcInYtdGV4dC1rZXJuXCJdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZXMucGFwZXIuY2FudmFzLnN0eWxlLmRpc3BsYXkgPSBFO1xuICAgIH0sXG4gICAgYWRkR3JhZGllbnRGaWxsID0gZnVuY3Rpb24gKG8sIGdyYWRpZW50LCBmaWxsKSB7XG4gICAgICAgIG8uYXR0cnMgPSBvLmF0dHJzIHx8IHt9O1xuICAgICAgICB2YXIgYXR0cnMgPSBvLmF0dHJzLFxuICAgICAgICAgICAgcG93ID0gTWF0aC5wb3csXG4gICAgICAgICAgICBvcGFjaXR5LFxuICAgICAgICAgICAgb2luZGV4LFxuICAgICAgICAgICAgdHlwZSA9IFwibGluZWFyXCIsXG4gICAgICAgICAgICBmeGZ5ID0gXCIuNSAuNVwiO1xuICAgICAgICBvLmF0dHJzLmdyYWRpZW50ID0gZ3JhZGllbnQ7XG4gICAgICAgIGdyYWRpZW50ID0gU3RyKGdyYWRpZW50KS5yZXBsYWNlKFIuX3JhZGlhbF9ncmFkaWVudCwgZnVuY3Rpb24gKGFsbCwgZngsIGZ5KSB7XG4gICAgICAgICAgICB0eXBlID0gXCJyYWRpYWxcIjtcbiAgICAgICAgICAgIGlmIChmeCAmJiBmeSkge1xuICAgICAgICAgICAgICAgIGZ4ID0gdG9GbG9hdChmeCk7XG4gICAgICAgICAgICAgICAgZnkgPSB0b0Zsb2F0KGZ5KTtcbiAgICAgICAgICAgICAgICBwb3coZnggLSAuNSwgMikgKyBwb3coZnkgLSAuNSwgMikgPiAuMjUgJiYgKGZ5ID0gbWF0aC5zcXJ0KC4yNSAtIHBvdyhmeCAtIC41LCAyKSkgKiAoKGZ5ID4gLjUpICogMiAtIDEpICsgLjUpO1xuICAgICAgICAgICAgICAgIGZ4ZnkgPSBmeCArIFMgKyBmeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBFO1xuICAgICAgICB9KTtcbiAgICAgICAgZ3JhZGllbnQgPSBncmFkaWVudC5zcGxpdCgvXFxzKlxcLVxccyovKTtcbiAgICAgICAgaWYgKHR5cGUgPT0gXCJsaW5lYXJcIikge1xuICAgICAgICAgICAgdmFyIGFuZ2xlID0gZ3JhZGllbnQuc2hpZnQoKTtcbiAgICAgICAgICAgIGFuZ2xlID0gLXRvRmxvYXQoYW5nbGUpO1xuICAgICAgICAgICAgaWYgKGlzTmFOKGFuZ2xlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBkb3RzID0gUi5fcGFyc2VEb3RzKGdyYWRpZW50KTtcbiAgICAgICAgaWYgKCFkb3RzKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBvID0gby5zaGFwZSB8fCBvLm5vZGU7XG4gICAgICAgIGlmIChkb3RzLmxlbmd0aCkge1xuICAgICAgICAgICAgby5yZW1vdmVDaGlsZChmaWxsKTtcbiAgICAgICAgICAgIGZpbGwub24gPSB0cnVlO1xuICAgICAgICAgICAgZmlsbC5tZXRob2QgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIGZpbGwuY29sb3IgPSBkb3RzWzBdLmNvbG9yO1xuICAgICAgICAgICAgZmlsbC5jb2xvcjIgPSBkb3RzW2RvdHMubGVuZ3RoIC0gMV0uY29sb3I7XG4gICAgICAgICAgICB2YXIgY2xycyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gZG90cy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZG90c1tpXS5vZmZzZXQgJiYgY2xycy5wdXNoKGRvdHNbaV0ub2Zmc2V0ICsgUyArIGRvdHNbaV0uY29sb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsbC5jb2xvcnMgPSBjbHJzLmxlbmd0aCA/IGNscnMuam9pbigpIDogXCIwJSBcIiArIGZpbGwuY29sb3I7XG4gICAgICAgICAgICBpZiAodHlwZSA9PSBcInJhZGlhbFwiKSB7XG4gICAgICAgICAgICAgICAgZmlsbC50eXBlID0gXCJncmFkaWVudFRpdGxlXCI7XG4gICAgICAgICAgICAgICAgZmlsbC5mb2N1cyA9IFwiMTAwJVwiO1xuICAgICAgICAgICAgICAgIGZpbGwuZm9jdXNzaXplID0gXCIwIDBcIjtcbiAgICAgICAgICAgICAgICBmaWxsLmZvY3VzcG9zaXRpb24gPSBmeGZ5O1xuICAgICAgICAgICAgICAgIGZpbGwuYW5nbGUgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBmaWxsLnJvdGF0ZT0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBmaWxsLnR5cGUgPSBcImdyYWRpZW50XCI7XG4gICAgICAgICAgICAgICAgZmlsbC5hbmdsZSA9ICgyNzAgLSBhbmdsZSkgJSAzNjA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvLmFwcGVuZENoaWxkKGZpbGwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAxO1xuICAgIH0sXG4gICAgRWxlbWVudCA9IGZ1bmN0aW9uIChub2RlLCB2bWwpIHtcbiAgICAgICAgdGhpc1swXSA9IHRoaXMubm9kZSA9IG5vZGU7XG4gICAgICAgIG5vZGUucmFwaGFlbCA9IHRydWU7XG4gICAgICAgIHRoaXMuaWQgPSBSLl9vaWQrKztcbiAgICAgICAgbm9kZS5yYXBoYWVsaWQgPSB0aGlzLmlkO1xuICAgICAgICB0aGlzLlggPSAwO1xuICAgICAgICB0aGlzLlkgPSAwO1xuICAgICAgICB0aGlzLmF0dHJzID0ge307XG4gICAgICAgIHRoaXMucGFwZXIgPSB2bWw7XG4gICAgICAgIHRoaXMubWF0cml4ID0gUi5tYXRyaXgoKTtcbiAgICAgICAgdGhpcy5fID0ge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiBbXSxcbiAgICAgICAgICAgIHN4OiAxLFxuICAgICAgICAgICAgc3k6IDEsXG4gICAgICAgICAgICBkeDogMCxcbiAgICAgICAgICAgIGR5OiAwLFxuICAgICAgICAgICAgZGVnOiAwLFxuICAgICAgICAgICAgZGlydHk6IDEsXG4gICAgICAgICAgICBkaXJ0eVQ6IDFcbiAgICAgICAgfTtcbiAgICAgICAgIXZtbC5ib3R0b20gJiYgKHZtbC5ib3R0b20gPSB0aGlzKTtcbiAgICAgICAgdGhpcy5wcmV2ID0gdm1sLnRvcDtcbiAgICAgICAgdm1sLnRvcCAmJiAodm1sLnRvcC5uZXh0ID0gdGhpcyk7XG4gICAgICAgIHZtbC50b3AgPSB0aGlzO1xuICAgICAgICB0aGlzLm5leHQgPSBudWxsO1xuICAgIH07XG4gICAgdmFyIGVscHJvdG8gPSBSLmVsO1xuXG4gICAgRWxlbWVudC5wcm90b3R5cGUgPSBlbHByb3RvO1xuICAgIGVscHJvdG8uY29uc3RydWN0b3IgPSBFbGVtZW50O1xuICAgIGVscHJvdG8udHJhbnNmb3JtID0gZnVuY3Rpb24gKHRzdHIpIHtcbiAgICAgICAgaWYgKHRzdHIgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuXy50cmFuc2Zvcm07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHZicyA9IHRoaXMucGFwZXIuX3ZpZXdCb3hTaGlmdCxcbiAgICAgICAgICAgIHZidCA9IHZicyA/IFwic1wiICsgW3Zicy5zY2FsZSwgdmJzLnNjYWxlXSArIFwiLTEtMXRcIiArIFt2YnMuZHgsIHZicy5keV0gOiBFLFxuICAgICAgICAgICAgb2xkdDtcbiAgICAgICAgaWYgKHZicykge1xuICAgICAgICAgICAgb2xkdCA9IHRzdHIgPSBTdHIodHN0cikucmVwbGFjZSgvXFwuezN9fFxcdTIwMjYvZywgdGhpcy5fLnRyYW5zZm9ybSB8fCBFKTtcbiAgICAgICAgfVxuICAgICAgICBSLl9leHRyYWN0VHJhbnNmb3JtKHRoaXMsIHZidCArIHRzdHIpO1xuICAgICAgICB2YXIgbWF0cml4ID0gdGhpcy5tYXRyaXguY2xvbmUoKSxcbiAgICAgICAgICAgIHNrZXcgPSB0aGlzLnNrZXcsXG4gICAgICAgICAgICBvID0gdGhpcy5ub2RlLFxuICAgICAgICAgICAgc3BsaXQsXG4gICAgICAgICAgICBpc0dyYWQgPSB+U3RyKHRoaXMuYXR0cnMuZmlsbCkuaW5kZXhPZihcIi1cIiksXG4gICAgICAgICAgICBpc1BhdHQgPSAhU3RyKHRoaXMuYXR0cnMuZmlsbCkuaW5kZXhPZihcInVybChcIik7XG4gICAgICAgIG1hdHJpeC50cmFuc2xhdGUoLS41LCAtLjUpO1xuICAgICAgICBpZiAoaXNQYXR0IHx8IGlzR3JhZCB8fCB0aGlzLnR5cGUgPT0gXCJpbWFnZVwiKSB7XG4gICAgICAgICAgICBza2V3Lm1hdHJpeCA9IFwiMSAwIDAgMVwiO1xuICAgICAgICAgICAgc2tldy5vZmZzZXQgPSBcIjAgMFwiO1xuICAgICAgICAgICAgc3BsaXQgPSBtYXRyaXguc3BsaXQoKTtcbiAgICAgICAgICAgIGlmICgoaXNHcmFkICYmIHNwbGl0Lm5vUm90YXRpb24pIHx8ICFzcGxpdC5pc1NpbXBsZSkge1xuICAgICAgICAgICAgICAgIG8uc3R5bGUuZmlsdGVyID0gbWF0cml4LnRvRmlsdGVyKCk7XG4gICAgICAgICAgICAgICAgdmFyIGJiID0gdGhpcy5nZXRCQm94KCksXG4gICAgICAgICAgICAgICAgICAgIGJidCA9IHRoaXMuZ2V0QkJveCgxKSxcbiAgICAgICAgICAgICAgICAgICAgZHggPSBiYi54IC0gYmJ0LngsXG4gICAgICAgICAgICAgICAgICAgIGR5ID0gYmIueSAtIGJidC55O1xuICAgICAgICAgICAgICAgIG8uY29vcmRvcmlnaW4gPSAoZHggKiAtem9vbSkgKyBTICsgKGR5ICogLXpvb20pO1xuICAgICAgICAgICAgICAgIHNldENvb3Jkcyh0aGlzLCAxLCAxLCBkeCwgZHksIDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvLnN0eWxlLmZpbHRlciA9IEU7XG4gICAgICAgICAgICAgICAgc2V0Q29vcmRzKHRoaXMsIHNwbGl0LnNjYWxleCwgc3BsaXQuc2NhbGV5LCBzcGxpdC5keCwgc3BsaXQuZHksIHNwbGl0LnJvdGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvLnN0eWxlLmZpbHRlciA9IEU7XG4gICAgICAgICAgICBza2V3Lm1hdHJpeCA9IFN0cihtYXRyaXgpO1xuICAgICAgICAgICAgc2tldy5vZmZzZXQgPSBtYXRyaXgub2Zmc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgb2xkdCAmJiAodGhpcy5fLnRyYW5zZm9ybSA9IG9sZHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGVscHJvdG8ucm90YXRlID0gZnVuY3Rpb24gKGRlZywgY3gsIGN5KSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZWcgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRlZyA9IFN0cihkZWcpLnNwbGl0KHNlcGFyYXRvcik7XG4gICAgICAgIGlmIChkZWcubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgY3ggPSB0b0Zsb2F0KGRlZ1sxXSk7XG4gICAgICAgICAgICBjeSA9IHRvRmxvYXQoZGVnWzJdKTtcbiAgICAgICAgfVxuICAgICAgICBkZWcgPSB0b0Zsb2F0KGRlZ1swXSk7XG4gICAgICAgIChjeSA9PSBudWxsKSAmJiAoY3ggPSBjeSk7XG4gICAgICAgIGlmIChjeCA9PSBudWxsIHx8IGN5ID09IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBiYm94ID0gdGhpcy5nZXRCQm94KDEpO1xuICAgICAgICAgICAgY3ggPSBiYm94LnggKyBiYm94LndpZHRoIC8gMjtcbiAgICAgICAgICAgIGN5ID0gYmJveC55ICsgYmJveC5oZWlnaHQgLyAyO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuXy5kaXJ0eVQgPSAxO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybSh0aGlzLl8udHJhbnNmb3JtLmNvbmNhdChbW1wiclwiLCBkZWcsIGN4LCBjeV1dKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZWxwcm90by50cmFuc2xhdGUgPSBmdW5jdGlvbiAoZHgsIGR5KSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGR4ID0gU3RyKGR4KS5zcGxpdChzZXBhcmF0b3IpO1xuICAgICAgICBpZiAoZHgubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgZHkgPSB0b0Zsb2F0KGR4WzFdKTtcbiAgICAgICAgfVxuICAgICAgICBkeCA9IHRvRmxvYXQoZHhbMF0pIHx8IDA7XG4gICAgICAgIGR5ID0gK2R5IHx8IDA7XG4gICAgICAgIGlmICh0aGlzLl8uYmJveCkge1xuICAgICAgICAgICAgdGhpcy5fLmJib3gueCArPSBkeDtcbiAgICAgICAgICAgIHRoaXMuXy5iYm94LnkgKz0gZHk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50cmFuc2Zvcm0odGhpcy5fLnRyYW5zZm9ybS5jb25jYXQoW1tcInRcIiwgZHgsIGR5XV0pKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBlbHByb3RvLnNjYWxlID0gZnVuY3Rpb24gKHN4LCBzeSwgY3gsIGN5KSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHN4ID0gU3RyKHN4KS5zcGxpdChzZXBhcmF0b3IpO1xuICAgICAgICBpZiAoc3gubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgc3kgPSB0b0Zsb2F0KHN4WzFdKTtcbiAgICAgICAgICAgIGN4ID0gdG9GbG9hdChzeFsyXSk7XG4gICAgICAgICAgICBjeSA9IHRvRmxvYXQoc3hbM10pO1xuICAgICAgICAgICAgaXNOYU4oY3gpICYmIChjeCA9IG51bGwpO1xuICAgICAgICAgICAgaXNOYU4oY3kpICYmIChjeSA9IG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHN4ID0gdG9GbG9hdChzeFswXSk7XG4gICAgICAgIChzeSA9PSBudWxsKSAmJiAoc3kgPSBzeCk7XG4gICAgICAgIChjeSA9PSBudWxsKSAmJiAoY3ggPSBjeSk7XG4gICAgICAgIGlmIChjeCA9PSBudWxsIHx8IGN5ID09IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBiYm94ID0gdGhpcy5nZXRCQm94KDEpO1xuICAgICAgICB9XG4gICAgICAgIGN4ID0gY3ggPT0gbnVsbCA/IGJib3gueCArIGJib3gud2lkdGggLyAyIDogY3g7XG4gICAgICAgIGN5ID0gY3kgPT0gbnVsbCA/IGJib3gueSArIGJib3guaGVpZ2h0IC8gMiA6IGN5O1xuICAgIFxuICAgICAgICB0aGlzLnRyYW5zZm9ybSh0aGlzLl8udHJhbnNmb3JtLmNvbmNhdChbW1wic1wiLCBzeCwgc3ksIGN4LCBjeV1dKSk7XG4gICAgICAgIHRoaXMuXy5kaXJ0eVQgPSAxO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGVscHJvdG8uaGlkZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIXRoaXMucmVtb3ZlZCAmJiAodGhpcy5ub2RlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZWxwcm90by5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAhdGhpcy5yZW1vdmVkICYmICh0aGlzLm5vZGUuc3R5bGUuZGlzcGxheSA9IEUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIGVscHJvdG8uX2dldEJCb3ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogdGhpcy5YICsgKHRoaXMuYmJ4IHx8IDApIC0gdGhpcy5XIC8gMixcbiAgICAgICAgICAgIHk6IHRoaXMuWSAtIHRoaXMuSCxcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLlcsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuSFxuICAgICAgICB9O1xuICAgIH07XG4gICAgZWxwcm90by5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQgfHwgIXRoaXMubm9kZS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wYXBlci5fX3NldF9fICYmIHRoaXMucGFwZXIuX19zZXRfXy5leGNsdWRlKHRoaXMpO1xuICAgICAgICBSLmV2ZS51bmJpbmQoXCJyYXBoYWVsLiouKi5cIiArIHRoaXMuaWQpO1xuICAgICAgICBSLl90ZWFyKHRoaXMsIHRoaXMucGFwZXIpO1xuICAgICAgICB0aGlzLm5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLm5vZGUpO1xuICAgICAgICB0aGlzLnNoYXBlICYmIHRoaXMuc2hhcGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLnNoYXBlKTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzKSB7XG4gICAgICAgICAgICB0aGlzW2ldID0gdHlwZW9mIHRoaXNbaV0gPT0gXCJmdW5jdGlvblwiID8gUi5fcmVtb3ZlZEZhY3RvcnkoaSkgOiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlZCA9IHRydWU7XG4gICAgfTtcbiAgICBlbHByb3RvLmF0dHIgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hbWUgPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIHJlcyA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgYSBpbiB0aGlzLmF0dHJzKSBpZiAodGhpcy5hdHRyc1toYXNdKGEpKSB7XG4gICAgICAgICAgICAgICAgcmVzW2FdID0gdGhpcy5hdHRyc1thXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcy5ncmFkaWVudCAmJiByZXMuZmlsbCA9PSBcIm5vbmVcIiAmJiAocmVzLmZpbGwgPSByZXMuZ3JhZGllbnQpICYmIGRlbGV0ZSByZXMuZ3JhZGllbnQ7XG4gICAgICAgICAgICByZXMudHJhbnNmb3JtID0gdGhpcy5fLnRyYW5zZm9ybTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlID09IG51bGwgJiYgUi5pcyhuYW1lLCBcInN0cmluZ1wiKSkge1xuICAgICAgICAgICAgaWYgKG5hbWUgPT0gZmlsbFN0cmluZyAmJiB0aGlzLmF0dHJzLmZpbGwgPT0gXCJub25lXCIgJiYgdGhpcy5hdHRycy5ncmFkaWVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHJzLmdyYWRpZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG5hbWVzID0gbmFtZS5zcGxpdChzZXBhcmF0b3IpLFxuICAgICAgICAgICAgICAgIG91dCA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gbmFtZXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZSBpbiB0aGlzLmF0dHJzKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dFtuYW1lXSA9IHRoaXMuYXR0cnNbbmFtZV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChSLmlzKHRoaXMucGFwZXIuY3VzdG9tQXR0cmlidXRlc1tuYW1lXSwgXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgICAgICBvdXRbbmFtZV0gPSB0aGlzLnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNbbmFtZV0uZGVmO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG91dFtuYW1lXSA9IFIuX2F2YWlsYWJsZUF0dHJzW25hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpaSAtIDEgPyBvdXQgOiBvdXRbbmFtZXNbMF1dO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmF0dHJzICYmIHZhbHVlID09IG51bGwgJiYgUi5pcyhuYW1lLCBcImFycmF5XCIpKSB7XG4gICAgICAgICAgICBvdXQgPSB7fTtcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGlpID0gbmFtZS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgb3V0W25hbWVbaV1dID0gdGhpcy5hdHRyKG5hbWVbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGFyYW1zO1xuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgcGFyYW1zID0ge307XG4gICAgICAgICAgICBwYXJhbXNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB2YWx1ZSA9PSBudWxsICYmIFIuaXMobmFtZSwgXCJvYmplY3RcIikgJiYgKHBhcmFtcyA9IG5hbWUpO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICBldmUoXCJyYXBoYWVsLmF0dHIuXCIgKyBrZXkgKyBcIi5cIiArIHRoaXMuaWQsIHRoaXMsIHBhcmFtc1trZXldKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyYW1zKSB7XG4gICAgICAgICAgICBmb3IgKGtleSBpbiB0aGlzLnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXMpIGlmICh0aGlzLnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNbaGFzXShrZXkpICYmIHBhcmFtc1toYXNdKGtleSkgJiYgUi5pcyh0aGlzLnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNba2V5XSwgXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIHZhciBwYXIgPSB0aGlzLnBhcGVyLmN1c3RvbUF0dHJpYnV0ZXNba2V5XS5hcHBseSh0aGlzLCBbXS5jb25jYXQocGFyYW1zW2tleV0pKTtcbiAgICAgICAgICAgICAgICB0aGlzLmF0dHJzW2tleV0gPSBwYXJhbXNba2V5XTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBzdWJrZXkgaW4gcGFyKSBpZiAocGFyW2hhc10oc3Via2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJhbXNbc3Via2V5XSA9IHBhcltzdWJrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHRoaXMucGFwZXIuY2FudmFzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIGlmIChwYXJhbXMudGV4dCAmJiB0aGlzLnR5cGUgPT0gXCJ0ZXh0XCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRleHRwYXRoLnN0cmluZyA9IHBhcmFtcy50ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0RmlsbEFuZFN0cm9rZSh0aGlzLCBwYXJhbXMpO1xuICAgICAgICAgICAgLy8gdGhpcy5wYXBlci5jYW52YXMuc3R5bGUuZGlzcGxheSA9IEU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBlbHByb3RvLnRvRnJvbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICF0aGlzLnJlbW92ZWQgJiYgdGhpcy5ub2RlLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5ub2RlKTtcbiAgICAgICAgdGhpcy5wYXBlciAmJiB0aGlzLnBhcGVyLnRvcCAhPSB0aGlzICYmIFIuX3RvZnJvbnQodGhpcywgdGhpcy5wYXBlcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgZWxwcm90by50b0JhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm5vZGUucGFyZW50Tm9kZS5maXJzdENoaWxkICE9IHRoaXMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMubm9kZSwgdGhpcy5ub2RlLnBhcmVudE5vZGUuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICBSLl90b2JhY2sodGhpcywgdGhpcy5wYXBlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBlbHByb3RvLmluc2VydEFmdGVyID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnQuY29uc3RydWN0b3IgPT0gUi5zdC5jb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnRbZWxlbWVudC5sZW5ndGggLSAxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudC5ub2RlLm5leHRTaWJsaW5nKSB7XG4gICAgICAgICAgICBlbGVtZW50Lm5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5ub2RlLCBlbGVtZW50Lm5vZGUubmV4dFNpYmxpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudC5ub2RlLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5ub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBSLl9pbnNlcnRhZnRlcih0aGlzLCBlbGVtZW50LCB0aGlzLnBhcGVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBlbHByb3RvLmluc2VydEJlZm9yZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbGVtZW50LmNvbnN0cnVjdG9yID09IFIuc3QuY29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50WzBdO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQubm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLm5vZGUsIGVsZW1lbnQubm9kZSk7XG4gICAgICAgIFIuX2luc2VydGJlZm9yZSh0aGlzLCBlbGVtZW50LCB0aGlzLnBhcGVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBlbHByb3RvLmJsdXIgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICAgICAgICB2YXIgcyA9IHRoaXMubm9kZS5ydW50aW1lU3R5bGUsXG4gICAgICAgICAgICBmID0gcy5maWx0ZXI7XG4gICAgICAgIGYgPSBmLnJlcGxhY2UoYmx1cnJlZ2V4cCwgRSk7XG4gICAgICAgIGlmICgrc2l6ZSAhPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5hdHRycy5ibHVyID0gc2l6ZTtcbiAgICAgICAgICAgIHMuZmlsdGVyID0gZiArIFMgKyBtcyArIFwiLkJsdXIocGl4ZWxyYWRpdXM9XCIgKyAoK3NpemUgfHwgMS41KSArIFwiKVwiO1xuICAgICAgICAgICAgcy5tYXJnaW4gPSBSLmZvcm1hdChcIi17MH1weCAwIDAgLXswfXB4XCIsIHJvdW5kKCtzaXplIHx8IDEuNSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcy5maWx0ZXIgPSBmO1xuICAgICAgICAgICAgcy5tYXJnaW4gPSAwO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuYXR0cnMuYmx1cjtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBSLl9lbmdpbmUucGF0aCA9IGZ1bmN0aW9uIChwYXRoU3RyaW5nLCB2bWwpIHtcbiAgICAgICAgdmFyIGVsID0gY3JlYXRlTm9kZShcInNoYXBlXCIpO1xuICAgICAgICBlbC5zdHlsZS5jc3NUZXh0ID0gY3NzRG90O1xuICAgICAgICBlbC5jb29yZHNpemUgPSB6b29tICsgUyArIHpvb207XG4gICAgICAgIGVsLmNvb3Jkb3JpZ2luID0gdm1sLmNvb3Jkb3JpZ2luO1xuICAgICAgICB2YXIgcCA9IG5ldyBFbGVtZW50KGVsLCB2bWwpLFxuICAgICAgICAgICAgYXR0ciA9IHtmaWxsOiBcIm5vbmVcIiwgc3Ryb2tlOiBcIiMwMDBcIn07XG4gICAgICAgIHBhdGhTdHJpbmcgJiYgKGF0dHIucGF0aCA9IHBhdGhTdHJpbmcpO1xuICAgICAgICBwLnR5cGUgPSBcInBhdGhcIjtcbiAgICAgICAgcC5wYXRoID0gW107XG4gICAgICAgIHAuUGF0aCA9IEU7XG4gICAgICAgIHNldEZpbGxBbmRTdHJva2UocCwgYXR0cik7XG4gICAgICAgIHZtbC5jYW52YXMuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB2YXIgc2tldyA9IGNyZWF0ZU5vZGUoXCJza2V3XCIpO1xuICAgICAgICBza2V3Lm9uID0gdHJ1ZTtcbiAgICAgICAgZWwuYXBwZW5kQ2hpbGQoc2tldyk7XG4gICAgICAgIHAuc2tldyA9IHNrZXc7XG4gICAgICAgIHAudHJhbnNmb3JtKEUpO1xuICAgICAgICByZXR1cm4gcDtcbiAgICB9O1xuICAgIFIuX2VuZ2luZS5yZWN0ID0gZnVuY3Rpb24gKHZtbCwgeCwgeSwgdywgaCwgcikge1xuICAgICAgICB2YXIgcGF0aCA9IFIuX3JlY3RQYXRoKHgsIHksIHcsIGgsIHIpLFxuICAgICAgICAgICAgcmVzID0gdm1sLnBhdGgocGF0aCksXG4gICAgICAgICAgICBhID0gcmVzLmF0dHJzO1xuICAgICAgICByZXMuWCA9IGEueCA9IHg7XG4gICAgICAgIHJlcy5ZID0gYS55ID0geTtcbiAgICAgICAgcmVzLlcgPSBhLndpZHRoID0gdztcbiAgICAgICAgcmVzLkggPSBhLmhlaWdodCA9IGg7XG4gICAgICAgIGEuciA9IHI7XG4gICAgICAgIGEucGF0aCA9IHBhdGg7XG4gICAgICAgIHJlcy50eXBlID0gXCJyZWN0XCI7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICBSLl9lbmdpbmUuZWxsaXBzZSA9IGZ1bmN0aW9uICh2bWwsIHgsIHksIHJ4LCByeSkge1xuICAgICAgICB2YXIgcmVzID0gdm1sLnBhdGgoKSxcbiAgICAgICAgICAgIGEgPSByZXMuYXR0cnM7XG4gICAgICAgIHJlcy5YID0geCAtIHJ4O1xuICAgICAgICByZXMuWSA9IHkgLSByeTtcbiAgICAgICAgcmVzLlcgPSByeCAqIDI7XG4gICAgICAgIHJlcy5IID0gcnkgKiAyO1xuICAgICAgICByZXMudHlwZSA9IFwiZWxsaXBzZVwiO1xuICAgICAgICBzZXRGaWxsQW5kU3Ryb2tlKHJlcywge1xuICAgICAgICAgICAgY3g6IHgsXG4gICAgICAgICAgICBjeTogeSxcbiAgICAgICAgICAgIHJ4OiByeCxcbiAgICAgICAgICAgIHJ5OiByeVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICAgIFIuX2VuZ2luZS5jaXJjbGUgPSBmdW5jdGlvbiAodm1sLCB4LCB5LCByKSB7XG4gICAgICAgIHZhciByZXMgPSB2bWwucGF0aCgpLFxuICAgICAgICAgICAgYSA9IHJlcy5hdHRycztcbiAgICAgICAgcmVzLlggPSB4IC0gcjtcbiAgICAgICAgcmVzLlkgPSB5IC0gcjtcbiAgICAgICAgcmVzLlcgPSByZXMuSCA9IHIgKiAyO1xuICAgICAgICByZXMudHlwZSA9IFwiY2lyY2xlXCI7XG4gICAgICAgIHNldEZpbGxBbmRTdHJva2UocmVzLCB7XG4gICAgICAgICAgICBjeDogeCxcbiAgICAgICAgICAgIGN5OiB5LFxuICAgICAgICAgICAgcjogclxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICAgIFIuX2VuZ2luZS5pbWFnZSA9IGZ1bmN0aW9uICh2bWwsIHNyYywgeCwgeSwgdywgaCkge1xuICAgICAgICB2YXIgcGF0aCA9IFIuX3JlY3RQYXRoKHgsIHksIHcsIGgpLFxuICAgICAgICAgICAgcmVzID0gdm1sLnBhdGgocGF0aCkuYXR0cih7c3Ryb2tlOiBcIm5vbmVcIn0pLFxuICAgICAgICAgICAgYSA9IHJlcy5hdHRycyxcbiAgICAgICAgICAgIG5vZGUgPSByZXMubm9kZSxcbiAgICAgICAgICAgIGZpbGwgPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKGZpbGxTdHJpbmcpWzBdO1xuICAgICAgICBhLnNyYyA9IHNyYztcbiAgICAgICAgcmVzLlggPSBhLnggPSB4O1xuICAgICAgICByZXMuWSA9IGEueSA9IHk7XG4gICAgICAgIHJlcy5XID0gYS53aWR0aCA9IHc7XG4gICAgICAgIHJlcy5IID0gYS5oZWlnaHQgPSBoO1xuICAgICAgICBhLnBhdGggPSBwYXRoO1xuICAgICAgICByZXMudHlwZSA9IFwiaW1hZ2VcIjtcbiAgICAgICAgZmlsbC5wYXJlbnROb2RlID09IG5vZGUgJiYgbm9kZS5yZW1vdmVDaGlsZChmaWxsKTtcbiAgICAgICAgZmlsbC5yb3RhdGUgPSB0cnVlO1xuICAgICAgICBmaWxsLnNyYyA9IHNyYztcbiAgICAgICAgZmlsbC50eXBlID0gXCJ0aWxlXCI7XG4gICAgICAgIHJlcy5fLmZpbGxwb3MgPSBbeCwgeV07XG4gICAgICAgIHJlcy5fLmZpbGxzaXplID0gW3csIGhdO1xuICAgICAgICBub2RlLmFwcGVuZENoaWxkKGZpbGwpO1xuICAgICAgICBzZXRDb29yZHMocmVzLCAxLCAxLCAwLCAwLCAwKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICAgIFIuX2VuZ2luZS50ZXh0ID0gZnVuY3Rpb24gKHZtbCwgeCwgeSwgdGV4dCkge1xuICAgICAgICB2YXIgZWwgPSBjcmVhdGVOb2RlKFwic2hhcGVcIiksXG4gICAgICAgICAgICBwYXRoID0gY3JlYXRlTm9kZShcInBhdGhcIiksXG4gICAgICAgICAgICBvID0gY3JlYXRlTm9kZShcInRleHRwYXRoXCIpO1xuICAgICAgICB4ID0geCB8fCAwO1xuICAgICAgICB5ID0geSB8fCAwO1xuICAgICAgICB0ZXh0ID0gdGV4dCB8fCBcIlwiO1xuICAgICAgICBwYXRoLnYgPSBSLmZvcm1hdChcIm17MH0sezF9bHsyfSx7MX1cIiwgcm91bmQoeCAqIHpvb20pLCByb3VuZCh5ICogem9vbSksIHJvdW5kKHggKiB6b29tKSArIDEpO1xuICAgICAgICBwYXRoLnRleHRwYXRob2sgPSB0cnVlO1xuICAgICAgICBvLnN0cmluZyA9IFN0cih0ZXh0KTtcbiAgICAgICAgby5vbiA9IHRydWU7XG4gICAgICAgIGVsLnN0eWxlLmNzc1RleHQgPSBjc3NEb3Q7XG4gICAgICAgIGVsLmNvb3Jkc2l6ZSA9IHpvb20gKyBTICsgem9vbTtcbiAgICAgICAgZWwuY29vcmRvcmlnaW4gPSBcIjAgMFwiO1xuICAgICAgICB2YXIgcCA9IG5ldyBFbGVtZW50KGVsLCB2bWwpLFxuICAgICAgICAgICAgYXR0ciA9IHtcbiAgICAgICAgICAgICAgICBmaWxsOiBcIiMwMDBcIixcbiAgICAgICAgICAgICAgICBzdHJva2U6IFwibm9uZVwiLFxuICAgICAgICAgICAgICAgIGZvbnQ6IFIuX2F2YWlsYWJsZUF0dHJzLmZvbnQsXG4gICAgICAgICAgICAgICAgdGV4dDogdGV4dFxuICAgICAgICAgICAgfTtcbiAgICAgICAgcC5zaGFwZSA9IGVsO1xuICAgICAgICBwLnBhdGggPSBwYXRoO1xuICAgICAgICBwLnRleHRwYXRoID0gbztcbiAgICAgICAgcC50eXBlID0gXCJ0ZXh0XCI7XG4gICAgICAgIHAuYXR0cnMudGV4dCA9IFN0cih0ZXh0KTtcbiAgICAgICAgcC5hdHRycy54ID0geDtcbiAgICAgICAgcC5hdHRycy55ID0geTtcbiAgICAgICAgcC5hdHRycy53ID0gMTtcbiAgICAgICAgcC5hdHRycy5oID0gMTtcbiAgICAgICAgc2V0RmlsbEFuZFN0cm9rZShwLCBhdHRyKTtcbiAgICAgICAgZWwuYXBwZW5kQ2hpbGQobyk7XG4gICAgICAgIGVsLmFwcGVuZENoaWxkKHBhdGgpO1xuICAgICAgICB2bWwuY2FudmFzLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgdmFyIHNrZXcgPSBjcmVhdGVOb2RlKFwic2tld1wiKTtcbiAgICAgICAgc2tldy5vbiA9IHRydWU7XG4gICAgICAgIGVsLmFwcGVuZENoaWxkKHNrZXcpO1xuICAgICAgICBwLnNrZXcgPSBza2V3O1xuICAgICAgICBwLnRyYW5zZm9ybShFKTtcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgfTtcbiAgICBSLl9lbmdpbmUuc2V0U2l6ZSA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHZhciBjcyA9IHRoaXMuY2FudmFzLnN0eWxlO1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB3aWR0aCA9PSArd2lkdGggJiYgKHdpZHRoICs9IFwicHhcIik7XG4gICAgICAgIGhlaWdodCA9PSAraGVpZ2h0ICYmIChoZWlnaHQgKz0gXCJweFwiKTtcbiAgICAgICAgY3Mud2lkdGggPSB3aWR0aDtcbiAgICAgICAgY3MuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBjcy5jbGlwID0gXCJyZWN0KDAgXCIgKyB3aWR0aCArIFwiIFwiICsgaGVpZ2h0ICsgXCIgMClcIjtcbiAgICAgICAgaWYgKHRoaXMuX3ZpZXdCb3gpIHtcbiAgICAgICAgICAgIFIuX2VuZ2luZS5zZXRWaWV3Qm94LmFwcGx5KHRoaXMsIHRoaXMuX3ZpZXdCb3gpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgUi5fZW5naW5lLnNldFZpZXdCb3ggPSBmdW5jdGlvbiAoeCwgeSwgdywgaCwgZml0KSB7XG4gICAgICAgIFIuZXZlKFwicmFwaGFlbC5zZXRWaWV3Qm94XCIsIHRoaXMsIHRoaXMuX3ZpZXdCb3gsIFt4LCB5LCB3LCBoLCBmaXRdKTtcbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgc2l6ZSA9IDEgLyBtbWF4KHcgLyB3aWR0aCwgaCAvIGhlaWdodCksXG4gICAgICAgICAgICBILCBXO1xuICAgICAgICBpZiAoZml0KSB7XG4gICAgICAgICAgICBIID0gaGVpZ2h0IC8gaDtcbiAgICAgICAgICAgIFcgPSB3aWR0aCAvIHc7XG4gICAgICAgICAgICBpZiAodyAqIEggPCB3aWR0aCkge1xuICAgICAgICAgICAgICAgIHggLT0gKHdpZHRoIC0gdyAqIEgpIC8gMiAvIEg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaCAqIFcgPCBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgICB5IC09IChoZWlnaHQgLSBoICogVykgLyAyIC8gVztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl92aWV3Qm94ID0gW3gsIHksIHcsIGgsICEhZml0XTtcbiAgICAgICAgdGhpcy5fdmlld0JveFNoaWZ0ID0ge1xuICAgICAgICAgICAgZHg6IC14LFxuICAgICAgICAgICAgZHk6IC15LFxuICAgICAgICAgICAgc2NhbGU6IHNpemVcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgZWwudHJhbnNmb3JtKFwiLi4uXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICB2YXIgY3JlYXRlTm9kZTtcbiAgICBSLl9lbmdpbmUuaW5pdFdpbiA9IGZ1bmN0aW9uICh3aW4pIHtcbiAgICAgICAgICAgIHZhciBkb2MgPSB3aW4uZG9jdW1lbnQ7XG4gICAgICAgICAgICBkb2MuY3JlYXRlU3R5bGVTaGVldCgpLmFkZFJ1bGUoXCIucnZtbFwiLCBcImJlaGF2aW9yOnVybCgjZGVmYXVsdCNWTUwpXCIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAhZG9jLm5hbWVzcGFjZXMucnZtbCAmJiBkb2MubmFtZXNwYWNlcy5hZGQoXCJydm1sXCIsIFwidXJuOnNjaGVtYXMtbWljcm9zb2Z0LWNvbTp2bWxcIik7XG4gICAgICAgICAgICAgICAgY3JlYXRlTm9kZSA9IGZ1bmN0aW9uICh0YWdOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkb2MuY3JlYXRlRWxlbWVudCgnPHJ2bWw6JyArIHRhZ05hbWUgKyAnIGNsYXNzPVwicnZtbFwiPicpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlTm9kZSA9IGZ1bmN0aW9uICh0YWdOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkb2MuY3JlYXRlRWxlbWVudCgnPCcgKyB0YWdOYW1lICsgJyB4bWxucz1cInVybjpzY2hlbWFzLW1pY3Jvc29mdC5jb206dm1sXCIgY2xhc3M9XCJydm1sXCI+Jyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICBSLl9lbmdpbmUuaW5pdFdpbihSLl9nLndpbik7XG4gICAgUi5fZW5naW5lLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNvbiA9IFIuX2dldENvbnRhaW5lci5hcHBseSgwLCBhcmd1bWVudHMpLFxuICAgICAgICAgICAgY29udGFpbmVyID0gY29uLmNvbnRhaW5lcixcbiAgICAgICAgICAgIGhlaWdodCA9IGNvbi5oZWlnaHQsXG4gICAgICAgICAgICBzLFxuICAgICAgICAgICAgd2lkdGggPSBjb24ud2lkdGgsXG4gICAgICAgICAgICB4ID0gY29uLngsXG4gICAgICAgICAgICB5ID0gY29uLnk7XG4gICAgICAgIGlmICghY29udGFpbmVyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWTUwgY29udGFpbmVyIG5vdCBmb3VuZC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlcyA9IG5ldyBSLl9QYXBlcixcbiAgICAgICAgICAgIGMgPSByZXMuY2FudmFzID0gUi5fZy5kb2MuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcbiAgICAgICAgICAgIGNzID0gYy5zdHlsZTtcbiAgICAgICAgeCA9IHggfHwgMDtcbiAgICAgICAgeSA9IHkgfHwgMDtcbiAgICAgICAgd2lkdGggPSB3aWR0aCB8fCA1MTI7XG4gICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCAzNDI7XG4gICAgICAgIHJlcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICByZXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB3aWR0aCA9PSArd2lkdGggJiYgKHdpZHRoICs9IFwicHhcIik7XG4gICAgICAgIGhlaWdodCA9PSAraGVpZ2h0ICYmIChoZWlnaHQgKz0gXCJweFwiKTtcbiAgICAgICAgcmVzLmNvb3Jkc2l6ZSA9IHpvb20gKiAxZTMgKyBTICsgem9vbSAqIDFlMztcbiAgICAgICAgcmVzLmNvb3Jkb3JpZ2luID0gXCIwIDBcIjtcbiAgICAgICAgcmVzLnNwYW4gPSBSLl9nLmRvYy5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgICAgcmVzLnNwYW4uc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246YWJzb2x1dGU7bGVmdDotOTk5OWVtO3RvcDotOTk5OWVtO3BhZGRpbmc6MDttYXJnaW46MDtsaW5lLWhlaWdodDoxO1wiO1xuICAgICAgICBjLmFwcGVuZENoaWxkKHJlcy5zcGFuKTtcbiAgICAgICAgY3MuY3NzVGV4dCA9IFIuZm9ybWF0KFwidG9wOjA7bGVmdDowO3dpZHRoOnswfTtoZWlnaHQ6ezF9O2Rpc3BsYXk6aW5saW5lLWJsb2NrO3Bvc2l0aW9uOnJlbGF0aXZlO2NsaXA6cmVjdCgwIHswfSB7MX0gMCk7b3ZlcmZsb3c6aGlkZGVuXCIsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICBpZiAoY29udGFpbmVyID09IDEpIHtcbiAgICAgICAgICAgIFIuX2cuZG9jLmJvZHkuYXBwZW5kQ2hpbGQoYyk7XG4gICAgICAgICAgICBjcy5sZWZ0ID0geCArIFwicHhcIjtcbiAgICAgICAgICAgIGNzLnRvcCA9IHkgKyBcInB4XCI7XG4gICAgICAgICAgICBjcy5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbnNlcnRCZWZvcmUoYywgY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzLnJlbmRlcmZpeCA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gICAgUi5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIFIuZXZlKFwicmFwaGFlbC5jbGVhclwiLCB0aGlzKTtcbiAgICAgICAgdGhpcy5jYW52YXMuaW5uZXJIVE1MID0gRTtcbiAgICAgICAgdGhpcy5zcGFuID0gUi5fZy5kb2MuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgIHRoaXMuc3Bhbi5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0Oi05OTk5ZW07dG9wOi05OTk5ZW07cGFkZGluZzowO21hcmdpbjowO2xpbmUtaGVpZ2h0OjE7ZGlzcGxheTppbmxpbmU7XCI7XG4gICAgICAgIHRoaXMuY2FudmFzLmFwcGVuZENoaWxkKHRoaXMuc3Bhbik7XG4gICAgICAgIHRoaXMuYm90dG9tID0gdGhpcy50b3AgPSBudWxsO1xuICAgIH07XG4gICAgUi5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBSLmV2ZShcInJhcGhhZWwucmVtb3ZlXCIsIHRoaXMpO1xuICAgICAgICB0aGlzLmNhbnZhcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuY2FudmFzKTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzKSB7XG4gICAgICAgICAgICB0aGlzW2ldID0gdHlwZW9mIHRoaXNbaV0gPT0gXCJmdW5jdGlvblwiID8gUi5fcmVtb3ZlZEZhY3RvcnkoaSkgOiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICB2YXIgc2V0cHJvdG8gPSBSLnN0O1xuICAgIGZvciAodmFyIG1ldGhvZCBpbiBlbHByb3RvKSBpZiAoZWxwcm90b1toYXNdKG1ldGhvZCkgJiYgIXNldHByb3RvW2hhc10obWV0aG9kKSkge1xuICAgICAgICBzZXRwcm90b1ttZXRob2RdID0gKGZ1bmN0aW9uIChtZXRob2RuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBhcmcgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxbbWV0aG9kbmFtZV0uYXBwbHkoZWwsIGFyZyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KShtZXRob2QpO1xuICAgIH1cbn0od2luZG93LlJhcGhhZWwpOyIsIkxvZ28gPSByZXF1aXJlIFwiLi4vbGliL2xvZ28uY29mZmVlXCJcblxubG9nb1dpZHRoID0gODYuNVxubG9nb0hlaWdodCA9IDc1XG5cbmNvbHVtbnMgPSB3aW5kb3cub3V0ZXJXaWR0aCAvIGxvZ29XaWR0aCArIDFcbnJvd3MgPSB3aW5kb3cub3V0ZXJIZWlnaHQgLyBsb2dvSGVpZ2h0XG5cbmV2ZW5Sb3cgPSBmYWxzZVxuWzAuLnJvd3NdLmZvckVhY2ggKHJvdykgLT5cbiAgZXZlblJvdyA9ICFldmVuUm93XG5cbiAgWzAuLmNvbHVtbnNdLmZvckVhY2ggKGNvbCkgLT5cbiAgICBpZiBldmVuUm93XG4gICAgICB4ID0gbG9nb1dpZHRoICogY29sXG4gICAgZWxzZVxuICAgICAgeCA9IChsb2dvV2lkdGggKiBjb2wpIC0gbG9nb1dpZHRoIC8gMlxuXG4gICAgTG9nby5hZGRcbiAgICAgIHZlcnRpY2VzOiA0XG4gICAgICBjZW50ZXI6XG4gICAgICAgIHg6IHhcbiAgICAgICAgeTogbG9nb0hlaWdodCAqIHJvd1xuIl19
