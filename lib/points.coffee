{cos, sin} = Math
TAU = Math.PI * 2

# Given a number of vertices returns the location of each vertex around a circle
# of radius `distanceFromCenter`. In addition to `numberOfVertices` an additional
# point is added at the center of the circle.

# Also, returns an array of arrays which consists of all the combinations of
# vertices. (eg `[[1, 2], [1, 3], [2, 1], [2, 3], [3, 1], [3, 2]]`)
module.exports = (numberOfVertices, center) ->
  angleOffset = 3 * (TAU / 4)

  angles = [0...numberOfVertices].map (n) ->
    (n * (TAU / numberOfVertices)) + angleOffset

  pairs = []
  vertices = [center]

  distanceFromCenter = 50
  angles.forEach (angle) ->
    x = cos(angle) * distanceFromCenter + center.x
    y = sin(angle) * distanceFromCenter + center.y

    vertex = {x, y}

    vertices.forEach (v) ->
      pairs.push [vertex, v]

    vertices.push vertex

  {vertices, pairs}
