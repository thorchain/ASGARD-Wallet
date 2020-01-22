import { rainbowStop, getIntFromName } from '../../lib/colorHelper';

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
    circleAttributes (symbol) {
      const c = Template.instance().generateColors(symbol)
      const style = "background-image: linear-gradient(45deg,"+ c.start +", " + c.stop +")"
      return {
        style,
        class: "circle-icon-sm d-flex align-items-center text-white"
      }
    }
  });
}
