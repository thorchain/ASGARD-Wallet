import 'bootstrap';
import Popper from 'popper.js';
window.Popper = Popper;
import '@fortawesome/fontawesome-free/js/all.min.js';
BlazeLayout.setRoot('body');
import Binance from "/imports/api/binance.js"; // Binance
BNB = new Binance();

// Used for user's account state
UserAccount = new Mongo.Collection(null);

Meteor.startup(function() {
  // console.log("Meteor starting...")
  // we need to get the vault set up...
})
