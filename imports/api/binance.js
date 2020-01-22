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
    try {
      await this.bnbClient.setPrivateKey(privateKey);
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
    const query = "/tokens?token=" + symbol
    return this.httpClient.get()
  }

  getMarketRate = async symbol => {
    const bnb = await axios.get(
      'https://api.cryptonator.com/api/ticker/bnb-usd',
    );
    const rune = await this.httpClient.get('/markets');
    const symbol_data = rune.data.find(s => {
      return s.base_asset_symbol === symbol;
    });
    return (
      parseFloat(bnb.data.ticker.price) * parseFloat(symbol_data.list_price)
    );
  };

  // convert fee number into BNB tokens
  calculateFee = x => {
    return x / 100000000;
  };

  getBalances = address => {
    return this.bnbClient.getBalance(address);
  };

  getTransactions = (address, limit) => {
    let query = '/transactions?address=' + address
    if (parseInt(limit)) {
      query += '&limit=' + limit
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


