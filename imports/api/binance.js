import axios from 'axios';
import bnbClient from '@binance-chain/javascript-sdk';

const networks = {
  mainnet: {
    name: 'mainnet',
    chainId: 'Binance-Chain-Tigris',
    baseURL: 'https://dex.binance.org',
    explorerBaseURL: 'https://explorer.binance.org',
    addressPrefix: 'bnb'
  },
  testnet: {
    name: 'testnet',
    chainId: 'Binance-Chain-Nile',
    baseURL: 'https://testnet-dex.binance.org',
    explorerBaseURL: 'https://testnet-explorer.binance.org',
    addressPrefix: 'tbnb'
  }
}

const TokenManagement = bnbClient;

class Binance {
  constructor() {
    // Defaults to testnet
    this.net = networks.testnet
    this.sdk = bnbClient;
    this.baseURL = networks.testnet.baseURL
    this.explorerBaseURL = networks.testnet.explorerBaseURL
  }
  setNetwork = (network) => {
    if (networks[network]) {
      this.net = networks[network]
      this.baseURL = this.net.baseURL
      this.explorerBaseURL = this.net.explorerBaseURL
    } else {
      throw Error('Incorrect network name')
    }
  }

  initializeClient = async privateKey => {
    try {
      this.bnbClient = new bnbClient(this.baseURL);
      this.httpClient = axios.create({
        baseURL: this.baseURL + '/api/v1',
        contentType: 'application/json',
      });
      if (privateKey) {
        await this.bnbClient.setPrivateKey(privateKey);
      }
      await this.bnbClient.chooseNetwork(this.net.name);
      await this.bnbClient.initChain();
      this.bnbTokens = new TokenManagement(this.bnbClient).tokens;
    } catch (error) {
      return error;
    }
  };

  useLedgerSigningDelegate = (
    ledgerApp,
    preSignCb,
    postSignCb,
    errCb,
    hdPath,
  ) => {
    return this.bnbClient.useLedgerSigningDelegate(
      ledgerApp,
      preSignCb,
      postSignCb,
      errCb,
      hdPath,
    );
  };

  clearPrivateKey = () => {
    this.bnbClient.privateKey = null;
  };

  getBinanceUrl = () => {
    return this.baseURL;
  };

  getPrefix = () => {
    return this.net.name === 'testnet' ? 'tbnb' : 'bnb';
  };

  isValidAddress = address => {
    return bnbClient.crypto.checkAddress(address, this.getPrefix());
  };

  txURL = tx => {
    return this.explorerBaseURL + '/tx/' + tx;
  };

  fees = () => {
    return this.httpClient.get('/fees');
  };
  getFee = async (txType) => {
    try {

      const res = await this.fees()
      console.log(res)
      const fee = res.data.find((item) => {
        return item.msg_type === txType
      })
      return fee.fee
    } catch (error) {
      throw Error(error)
    }
  }

  getTokens = (options) => {
    let query = "/tokens"
    if (options && options.limit) {
      query += "?limit=" + options.limit
      if (options.offset) {
        query += "&offset=" + options.offset
      }
    }
    return this.httpClient.get(query);
  }
  getTokenInfo = (symbol) => {
    // const query = "/tokens?token=" + symbol
    // return this.httpClient.get(query)
  }

  setMarketRates = async symbols => {
    // TODO: Make to handle an array
    const bnb = await axios.get(
      'https://api.cryptonator.com/api/ticker/bnb-usd',
    );

    /* ***************************** */
        let page = 1;
        let pairsFound = []
        const initialOffset = 0
        const limit = 1000
        while (pairsFound.length < symbols.length) {
          let request, options = {}
          options.offset = ((page -1) * limit) + initialOffset
          options.limit = limit

          try {
            let query = "/markets"
            if (options && options.limit) {
              query += "?limit=" + options.limit
              if (options.offset) {
                query += "&offset=" + options.offset
              }
            }
            request = await this.httpClient.get(query);
            
          } catch (error) {
            break
          }

          if (request && request.data && request.data.length > 0) {
            // Go through the pairs
            for (let i = 0; i < request.data.length; i++) {
              const e = request.data[i];
              
              // Check for a match to account assets
              const match = symbols.find(s => { return s === e.base_asset_symbol })
              if (match) { 
                // TODO: Add check for price only in BNB
                // Below should be done on demand for UI, saving writes
                // e.price = (parseFloat(bnb.data.ticker.price) * parseFloat(symbol_data.list_price))
                // push unique only
                const repeat = pairsFound.find(p => { return p.base_asset_symbol === e.base_asset_symbol})

                if (!repeat) {
                  pairsFound.push(e)
                }
              }
              if (pairsFound.length === symbols.length) { break }
              
            }
            // Safeguard
            if (request.data.length < limit) {
              break
            }
            
          }
          page+=1
        } // end while()

        MarketData.remove({})
        MarketData.batchInsert(pairsFound)
    /* ***************************** */

    // const rune = await this.httpClient.get('/markets?limit=200');
    // console.log(rune);
    // const symbol_data = rune.data.find(s => {
    //   // must also have bnb as quote asset
    //   return s.base_asset_symbol === symbol;
    // });
    
    // return (
    //   parseFloat(bnb.data.ticker.price) * parseFloat(symbol_data.list_price)
    // );
  };

  // convert fee number into BNB tokens
  calculateFee = x => {
    return x / 100000000;
  };

  getBalances = address => {
    return this.bnbClient.getBalance(address);
  };

  getTransactions = (address, options) => {
    let query = '/transactions?address=' + address
    // TODO: Valid options not checked yet
    if (options) {
      for (const key in options) {
        if (options.hasOwnProperty(key)) {
          const element = options[key];
          query += '&' + key + '=' + element
        }
      }
    }
    return this.httpClient(query)
  }

  getAccount = address => {
    return this.bnbClient.getAccount(address);
  };

  getMarkets = (limit = 1000, offset = 0) => {
    return this.bnbClient.getMarkets(limit, offset);
  };

  multiSend = async (address, transactions, memo = '') => {
    const result = await this.bnbClient.multiSend(address, transactions, memo);
    return result;
  };

  transfer = async (fromAddress, toAddress, amount, asset, memo = '') => {
    const result = await this.bnbClient.transfer(
      fromAddress,
      toAddress,
      amount,
      asset,
      memo,
    );

    return result;
  };

  // SECURITY: Private keys are here
  sendRawTransaction = (sender, recipient, amount, asset, key) => {
    // let stdSignMsg = cosmosjs.newStdMsg({
    //   msgs: [
    //     {
    //       type: "cosmos-sdk/MsgSend",
    //       value: {
    //         amount: [
    //           {
    //             amount: String(amount),
    //             denom: asset
    //             // denom: "uatom"
    //           }
    //         ],
    //         from_address: sender,
    //         to_address: recipient
    //       }
    //     }
    //   ],
    //   chain_id: CHAIN_ID, // replace with local member
    //   fee: { amount: [ { amount: String(5000), denom: "bnb" } ], gas: String(200000) },
    //   memo: "",
    //   account_number: String(data.result.value.account_number),
    //   sequence: String(data.result.value.sequence)
    // });

    // const signedTx = cosmosjs.sign(stdSignMsg, ecpairPriv);

  }

}

// NOTE: cypress expects this here
// window.binance = new Binance();

// const { binance } = window;

// export default binance;
// Letting Meteor component handle context
export default Binance;


