Raphael = require "raphael"
canvas = Raphael "logo", 400, 400

global.midX = canvas.width / 2
global.midY = canvas.height / 2

Points = require "../lib/points.coffee"
animations = require("../lib/queue.coffee")()

outerPoints = 3
{pairs, vertices} = Points
  vertices: outerPoints

canvas.setStart()

outerRadius = 12
vertices.forEach (vertex) ->
  animations.push ->
    canvas.circle(vertex.x, vertex.y, 0).attr
      stroke: "#000"
      "stroke-width": 3
      fill: "#fff"
    .animate { r: outerRadius }, 250, "backOut", animations.next

  animations.push ->
    canvas.circle(vertex.x, vertex.y, 0).attr
      fill: "#000"
    .animate { r: outerRadius / 2 }, 250, "backOut", animations.next

pairs.forEach (pair) ->
  animations.push ->
    canvas.path([
      "M", pair[0].x, pair[0].y
      "L", pair[1].x, pair[1].y
    ]).attr
      stroke: "#fff"
      "stroke-width": 3
    .toBack()

    canvas.path([
      "M", pair[0].x, pair[0].y
      "L", pair[1].x, pair[1].y
    ]).attr
      stroke: "#000"
      "stroke-width": 0
    .toBack()
    .animate { "stroke-width": 10 }, 500, "backOut", animations.next

animations.push ->
  set = canvas.setFinish()
  set.animate {transform: "r270 #{midX} #{midY}"}, 1000, "backOut", animations.next

animations.push ->
  # inner outside ring
  canvas.circle(midX, midY, 0).attr
    stroke: "#000"
    "stroke-width": 3
  .toBack()
  .animate { r: 70 }, 500, "backOut", animations.next

animations.push ->
  # outer outside ring
  canvas.circle(midX, midY, 0).attr
    stroke: "#000"
    "stroke-width": 8
  .toBack()
  .animate { r: 80 }, 500, "backOut", animations.next

animations.start()
