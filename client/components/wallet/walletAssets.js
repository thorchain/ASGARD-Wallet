
if (Meteor.isClient) {
  Template.walletAssets.onCreated(function() {
    const self = this;
    self.getAssets = () => {
      return UserAssets.find({},{sort: {symbol: 1}}).fetch()
    }
    self.initMarkets = async () => {
      // get the prices
      const assets = self.getAssets()
      // get an array of symbols
      if (assets && assets.length > 0) {
        const symbols = assets.map(e => {return e.symbol})
        BNB.setMarketRates(symbols)
      }
    }

    self.autorun(function() {
    });
  });
  Template.walletAssets.helpers({
    assetsList () {
      return Template.instance().getAssets()
    },
    tokenName (symbol) {
      const token = TokenData.findOne({symbol:symbol})
      return token && token.name
    },
    decimals (val) {
      val = parseFloat(val)
      return val.toFixed(2)
    },
    price (symbol) {
      const res = MarketData.findOne({base_asset_symbol: symbol}) 
      if (res && res.list_price) {
        return res.list_price
      }
      return "1.23"
    }

  });
}
const tokenNames = {
  BNB: {
    mainnet: 'BNB',
    testnet: 'BNB',
  },
  RUNE: {
    mainnet: 'RUNE-B1A',
    testnet: 'RUNE-A1F',
  },
  LOK: {
    mainnet: 'LOKI-6A9',
    testnet: 'LOK-3C0',
  },
  LOKI: {
    mainnet: 'LOKI-6A9',
    testnet: 'LOK-3C0',
  },
  ERD: {
    mainnet: 'ERD-D06',
    testnet: 'ERD-D85',
  },
  FSN: {
    mainnet: 'FSN-E14',
    testnet: 'FSN-F1B',
  },
  FTM: {
    mainnet: 'FTM-A64',
    testnet: 'FTM-585',
  },
  TCAN: {
    mainnet: 'CAN-677',
    testnet: 'TCAN-014',
  },
  CAN: {
    mainnet: 'CAN-677',
    testnet: 'TCAN-014',
  },
  TOMOB: {
    mainnet: 'TOMOB-4BC',
    testnet: 'TOMOB-1E1',
  },
};

