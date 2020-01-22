// UserTransactions collection
if (Meteor.isClient) {
  Template.walletTransactionsList.onCreated(function() {
    const self = this
    self.setTransactions = async () => {
      const addr = UserAccount.findOne().address
      await BNB.getTransactions(addr).then(res => {
        UserTransactions.remove({})
        UserTransactions.batchInsert(res.data.tx)
      })
    }
    self.setTransactions()
  });
  Template.walletTransactionsList.helpers({
    transactions: function () {
      return UserTransactions.find().fetch()
    },
  });
}
