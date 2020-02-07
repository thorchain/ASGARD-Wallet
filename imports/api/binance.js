import axios from 'axios';
import bnbClient from '@binance-chain/javascript-sdk';
// import { NET, isTestnet } from '../env';
const prod_hostnames = ['bepswap.com'];
const dev_hostnames = ['localhost'];

// const isMainnet = prod_hostnames.includes(window.location.hostname);
const isTestnet = true;
// const isTestnet = !isMainnet;
// const isDevnet = dev_hostnames.includes(window.location.hostname);

const NET = isTestnet ? 'testnet' : 'mainnet';
const CHAIN_ID = isTestnet ? 'Binance-Chain-Nile' : 'Binance-Chain-Tigris';


const TokenManagement = bnbClient;

class Binance {
  constructor() {
    this.baseURL = 'https://dex.binance.org';
    this.explorerBaseURL = 'https://explorer.binance.org';
    if (isTestnet) {
      this.baseURL = 'https://testnet-dex.binance.org';
      this.explorerBaseURL = 'https://testnet-explorer.binance.org';
    }

    this.net = NET;

    this.httpClient = axios.create({
      baseURL: this.baseURL + '/api/v1',
      contentType: 'application/json',
    });

    this.sdk = bnbClient;
    this.bnbClient = new bnbClient(this.baseURL);
    this.bnbClient.chooseNetwork(this.net);
    this.bnbClient.initChain();
    this.bnbTokens = new TokenManagement(this.bnbClient).tokens;
  }

  initializeClient = async privateKey => {
    // TODO: Add switch for types of networks (test/main)
    try {
      if (privateKey) {
        await this.bnbClient.setPrivateKey(privateKey);
      }
      this.bnbClient.chooseNetwork(this.net);
      await this.bnbClient.initChain();
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
    return isTestnet ? 'tbnb' : 'bnb';
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
}

// NOTE: cypress expects this here
// window.binance = new Binance();

// const { binance } = window;

// export default binance;
// Letting Meteor component handle context
export default Binance;


