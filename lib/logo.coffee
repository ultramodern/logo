Raphael = require "raphael"

canvas = Raphael "logo", window.outerWidth, window.outerHeight

Points = require "../lib/points.coffee"
Queue = require("../lib/queue.coffee")

circlesDrawn = []

module.exports =
  add: (opts={}) ->
    animations = Queue()

    points = opts.vertices - 1
    {pairs, vertices} = Points(points, opts.center)

    canvas.setStart()

    outerRadius = 12
    vertices.forEach (vertex) ->
      x = vertex.x
      y = vertex.y

      animations.push ->
        # outer vertex
        canvas.circle(x, y, 0).attr
          stroke: "#000"
          "stroke-width": 3
          fill: "#fff"
        .animate { r: outerRadius }, 250, "backOut", animations.next

      animations.push ->
        # inner vertex
        c = canvas.circle(x, y, 0).attr
          fill: "#000"
        .animate { r: outerRadius / 2 }, 250, "backOut", animations.next

        c.mouseover ->
          hues = (angle for angle in [0..360] by 15)
          hue = hues[Math.floor(Math.random()*hues.length)]
          color = Raphael.hsl(hue, 75, 50)
          c.animate {
            fill: color
            stroke: color
            transform: "s1.25, 1.25, #{x}, #{y}"
          }, 250, "backOut"

        c.mouseout ->
          c.animate { transform: "s1, 1, #{x}, #{y}" }, 250, "backOut"

    pairs.forEach (pair) ->
      start = "M#{pair[0].x} #{pair[0].y}"
      line = "L#{pair[1].x} #{pair[1].y}"

      animations.push ->
        canvas.path(start).attr
          stroke: "#fff"
          "stroke-width": 3
        .toBack()
        .animate { path: "#{start} #{line}" }, 150, animations.next

      animations.push ->
        canvas.path(start).attr
          stroke: "#000"
          "stroke-width": 10
        .toBack()
        .animate { path: "#{start} #{line}" }, 150, animations.next

    animations.start()
