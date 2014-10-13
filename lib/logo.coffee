Raphael = require "raphael"

canvas = Raphael "logo", window.outerWidth, window.outerHeight

Points = require "../lib/points.coffee"
Queue = require("../lib/queue.coffee")

circlesDrawn = {}

module.exports =
  add: (opts={}) ->
    nodeAnimations = Queue()
    pathAnimations = Queue()

    points = opts.vertices - 1
    {pairs, vertices} = Points(points, opts.center)

    outerRadius = 12
    vertices.forEach (vertex) ->
      {x, y} = vertex

      unless circlesDrawn["#{x},#{y}"]
        circlesDrawn["#{x},#{y}"] = true

        nodeAnimations.push ->
          # outer vertex
          canvas.circle(x, y, 0).attr
            stroke: "#000"
            "stroke-width": 3
            fill: "#fff"
          .animate { r: outerRadius }, 250, "backOut", nodeAnimations.next

        nodeAnimations.push ->
          # inner vertex
          c = canvas.circle(x, y, 0).attr
            fill: "#000"
          .animate { r: outerRadius / 2 }, 250, "backOut", nodeAnimations.next

          c.mouseover ->
            hues = (angle for angle in [0..360] by 15)
            hue = hues[Math.floor(Math.random()*hues.length)]
            color = Raphael.hsl(hue, 75, 50)
            c.animate {
              fill: color
              stroke: color
              transform: "s1.5, 1.5, #{x}, #{y}"
            }, 250, "backOut"

          c.mouseout ->
            c.animate { transform: "s1, 1, #{x}, #{y}" }, 250, "backOut"

    pairs.forEach (pair) ->
      [{x:x1, y:y1}, {x:x2, y:y2}] = pair

      start = "M#{x1} #{y1}"
      line = "L#{x2} #{y2}"

      pathAnimations.push ->
        canvas.path(start).attr
          stroke: "#fff"
          "stroke-width": 4
        .toBack()
        .animate { path: "#{start} #{line}" }, 150, pathAnimations.next

      pathAnimations.push ->
        canvas.path(start).attr
          stroke: "#000"
          "stroke-width": 10
        .toBack()
        .animate { path: "#{start} #{line}" }, 150, pathAnimations.next

    setTimeout(nodeAnimations.start, Math.random() * 5000)
    # HACK to get lines drawing after nodes
    setTimeout(pathAnimations.start, 5000)
