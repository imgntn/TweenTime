define (require) ->
  d3 = require 'd3'
  Signals = require 'Signal'

  class SelectionManager
    constructor: (@tweenTime) ->
      @selection = []
      @onSelect = new Signals.Signal()

    removeDuplicates: () =>
      result = []
      for item in @selection
        found = false
        for item2 in result
          if item.isEqualNode(item2)
            found = true
            break
        if found == false then result.push(item)

      @selection = result

    reset: () =>
      @selection = []

    select: (item, addToSelection = false) ->
      if !addToSelection then @selection = []
      if item instanceof Array
        for el in item
          @selection.push(el)
      else
        @selection.push(item)

      @removeDuplicates()
      @highlightItems()
      @onSelect.dispatch(@selection, addToSelection)

    getSelection: () =>
      return @selection

    highlightItems: () ->
      d3.selectAll('.bar--selected').classed('bar--selected', false)
      d3.selectAll('.key__shape--selected').classed('key__shape--selected', false)

      for item in @selection
        d3item = d3.select(item)
        if d3item.classed('bar')
          d3item.classed('bar--selected', true)
        else if d3item.classed('key')
          d3item.selectAll('rect').classed('key__shape--selected', true)
