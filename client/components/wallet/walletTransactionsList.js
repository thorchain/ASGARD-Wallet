import './walletTransactionsList.html'
// const shell = require('electron').shell;
// UserTransactions collection
if (Meteor.isClient) {
  Template.walletTransactionsList.onCreated(function() {
    // const self = this
  });
  Template.walletTransactionsList.helpers({
    transactions () {
      const symbol = FlowRouter.getParam('symbol')
      const select = {} // For optionally filtered list
      if (symbol) { select.txAsset = symbol }
      const result =  UserTransactions.find(select,{sort: {timeStamp: -1}}).fetch()
      // const result =  UserTransactions.find(select).fetch()
      return result
    },
    sender (addr) {
      return UserAccount.findOne().address === addr ? "self" : addr
    },
    decimals (val) {
      return parseFloat(val).toFixed(2)
    },
    eq (v1, v2) {
      return v1 === v2 ? true : false
    }
  });
  Template.transactionsList.helpers({
    txKind (from, to) {
      const usr = UserAccount.findOne()
      if (from === usr.address) {
        return {msg:"send", label: "to", address:to, color:"danger", op:"-"}
      } else if (to === usr.address) {
        return {msg:"receive", label: "from", address:from, color:"success", op:"+"}
      }
    },
    shortSym (symbol) {
      return symbol.split("-")[0].substr(0,4)
    },
    toCurrency (num) {
      if (typeof num === "number") {

        num = Math.round(num * 100);
      } else {
        num = parseFloat(num)
        num = Math.round(num * 100);
      }
      var len = num.toString().length;

      if (num !== 0) {
        num = (num / 100).toPrecision(len);
      } else {
        num = "0.00";
      }
      return num;
    },
  })
  Template.transactionsTable.helpers({
    selfAddr (addr) {
      // TODO: return to above eventually
      const acc = UserAccount.findOne()
      return acc.address === addr ? "self" : addr
    },
    isWith (from, to) {
      const usr = UserAccount.findOne()
      if (from === usr.address) {
        return {msg:"To:", address:to}
      } else if (to === usr.address) {
        return {msg:"From:", address:from}
      }
    },
    shortSymbol (symbol) {
      return symbol.split("-")[0].substr(0,4)
    },
    link (hash) {
      return BNB.explorerBaseURL + "/tx/" + hash
    },
    toCurrency (num) {
      if (typeof num === "number") {

        num = Math.round(num * 100);
      } else {
        num = parseFloat(num)
        num = Math.round(num * 100);
      }
      var len = num.toString().length;

      if (num !== 0) {
        num = (num / 100).toPrecision(len);
      } else {
        num = "0.00";
      }
      return num;
    },
  })
  Template.transactionsTable.events({
    "click [data-event='externalLink']": function () {
      event.preventDefault();
      // shell.openExternal(event.currenTarget.href);
    }
  })
}

