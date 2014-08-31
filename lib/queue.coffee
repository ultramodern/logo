module.exports = ->
  queue = []

  self =
    push: (fn) ->
      queue.push(fn)

    next: ->
      queue.shift().call() if queue.length

    start: ->
      self.next()
