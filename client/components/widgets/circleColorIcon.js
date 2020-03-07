import { rainbowStop, getIntFromName } from '../../lib/colorHelper';
import './circleColorIcon.html'

if (Meteor.isClient) {
  Template.circleColorIcon.onCreated(function() {
    const self = this
    self.generateColors = (symbol) => {
      const numbers = getIntFromName(symbol);
      const start = rainbowStop(numbers[0]);
      const stop = rainbowStop(numbers[1]);
      return {start, stop}
    }
  });

  Template.circleColorIcon.helpers({
    eq (v1, v2) {
      return (v1 === v2) ? true : false; 
    },
    imgSize (size) {
      switch (size) {
        case 'sm':
          return "36px"
        case 'md':
          return "46px"
        case 'lg':
          return "52px"
        default:
          break;
      }
    },
    circleStyle (symbol) {
      const c = Template.instance().generateColors(symbol)
      return "background-image: linear-gradient(45deg,"+ c.start +", " + c.stop +")"
    }
  });
}
