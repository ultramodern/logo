# A simple queue to sequentially trigger animations.
# Use `start` to kick off animations and `next` when you
# want to move to the next animation
module.exports = ->
  queue = []

  self =
    push: (fn) ->
      queue.push(fn)

    next: ->
      if queue.length
        nextItemCallback = queue.shift()
        nextItemCallback()

    start: ->
      self.next()
