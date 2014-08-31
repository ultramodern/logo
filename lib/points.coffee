{cos, sin} = Math
TAU = Math.PI * 2

module.exports = (options={}) ->
  angles = (angle for angle in [0...TAU] by TAU / options.vertices)

  pairs = []
  vertices = [
    { x: midX, y: midY }
  ]

  distanceFromCenter = 50
  angles.forEach (angle) ->
    x = cos(angle) * distanceFromCenter + midX
    y = sin(angle) * distanceFromCenter + midY

    vertex = {x, y}

    vertices.forEach (v) ->
      pairs.push [vertex, v]

    vertices.push vertex

  {vertices, pairs}
