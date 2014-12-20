let d3 = require('d3');
let Signals = require('js-signals');
let Utils = require('../core/Utils');

class Properties {
  constructor(timeline) {
    this.timeline = timeline;
    this.onKeyAdded = new Signals.Signal()
    this.subGrp = false
  }

  render(bar) {
    var self = this;

    var propVal = function(d, i) {
      if (d.properties) {
        return d.properties;
      } else {
        return [];
      }
    };
    var propKey = function(d) {
      return d.name;
    };
    var visibleProperties = function(d) {
      return d.keys.length;
    };

    var properties = bar.selectAll('.line-item').data(propVal, propKey);

    var dy = 0;
    var subGrp = properties.enter()
      .append('g')
      .filter(visibleProperties)
      .attr("class", 'line-item');

    // Save subGrp in a variable for use in Errors.coffee
    self.subGrp = subGrp;

    properties.filter(visibleProperties)
      .attr ("transform", function(d, i) {
        var sub_height = (i + 1) * self.timeline.lineHeight;
        return "translate(0," + sub_height + ")";
      });

    subGrp.append('rect')
      .attr('class', 'click-handler click-handler--property')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', self.timeline.x(self.timeline.timer.totalDuration + 100))
      .attr('height', self.timeline.lineHeight)
      .on('dblclick', (d) => {
        var lineObject = this.parentNode.parentNode;
        var lineValue = d3.select(lineObject).datum();
        var def = d["default"] ? d["default"] : 0;
        var mouse = d3.mouse(this);
        var dx = self.timeline.x.invert(mouse[0]);
        dx = dx.getTime() / 1000;
        var prevKey = Utils.getPreviousKey(d.keys, dx);
        // set the value to match the previous key if we found one
        if (prevKey) {
          def = prevKey.val;
        }
        var newKey = {
          time: dx,
          val: def
        };
        d.keys.push(newKey);
        // Sort the keys for tweens creation
        d.keys = Utils.sortKeys(d.keys);

        lineValue._isDirty = true;
        keyContainer = this.parentNode;
        self.onKeyAdded.dispatch(newKey, keyContainer);
      });

    // Mask
    subGrp.append('svg')
      .attr('class','line-item__keys timeline__right-mask')
      .attr('width', window.innerWidth - self.timeline.label_position_x)
      .attr('height', self.timeline.lineHeight)
      .attr('fill', '#f00');

    subGrp.append('text')
      .attr("class", "line-label line-label--small")
      .attr("x", self.timeline.label_position_x + 10)
      .attr("y", 15)
      .text(function(d) {
        return d.name;
      });

    subGrp.append("line")
      .attr("class", 'line-separator--secondary')
      .attr("x1", -self.timeline.margin.left)
      .attr("x2", self.timeline.x(self.timeline.timer.totalDuration + 100))
      .attr("y1", self.timeline.lineHeight)
      .attr("y2", self.timeline.lineHeight);

    bar.selectAll('.line-item').attr('display', function(d) {
        var lineObject = this.parentNode;
        var lineValue = d3.select(lineObject).datum();
        if (!lineValue.collapsed) {
          return "block";
        } else {
          return "none";
        }
      });

    return properties;
  }
}

module.exports = Properties;