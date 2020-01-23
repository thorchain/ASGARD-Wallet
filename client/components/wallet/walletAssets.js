
if (Meteor.isClient) {
  Template.walletAssets.onCreated(function() {
    const self = this;
    self.getAssets = () => {
      const usr = UserAccount.findOne()
      return usr && usr.assets 
    }

    // TODO: Remove from this component, and place in controller class
    self.initTokens = async() => {
      const usr = UserAccount.findOne()
      const assets = usr.assets
      if (assets && assets.length > 0) {
        
        const symbols = assets.map(asset => {
          return asset.symbol
        })

        let page = 1;
        let tokensFound = []
        const initialOffset = 0
        const limit = 2000
        while (tokensFound.length < symbols.length) {
          let request, options = {}
          options.offset = ((page -1) * limit) + initialOffset
          options.limit = limit

          try {
            request = await BNB.getTokens(options)
          } catch (error) {
            break
          }

          if (request && request.data && request.data.length > 0) {
            // Go through the tokens
            for (let i = 0; i < request.data.length; i++) {
              const e = request.data[i];
              // Check for a match to account assets
              const match = symbols.find(s => { return s === e.symbol })
              if (match) { tokensFound.push(e) }
              if (tokensFound.length === symbols.length) { break }
              
            }
            // Safeguard
            if (request.data.length < limit) {
              break
            }
            
          }
          page+=1
        } // end while()

        TokenData.remove({})
        TokenData.batchInsert(tokensFound)

      }
    }

    // Only initTokens if there is no token data
    // TODO: Add ability to sync for new tokens in wallet
    if (!TokenData.find().fetch().length) {
      self.initTokens()
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
      return "$0.00"
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

