Logo = require "../lib/logo.coffee"

logoWidth = 86
logoHeight = 75

columns = window.outerWidth / logoWidth + 1
rows = window.outerHeight / logoHeight

evenRow = false
[0..rows].forEach (row) ->
  evenRow = !evenRow

  [0..columns].forEach (col) ->
    if evenRow
      x = logoWidth * col
    else
      x = (logoWidth * col) - logoWidth / 2

    setTimeout ->
      Logo.add
        vertices: 4
        center:
          x: x
          y: logoHeight * row
    , 10
