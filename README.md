# Experimental #

This codebase contains experimental prototyping software for research and development of blockchain keystore/wallet services only. 

*Not for public use!*

## Security ##

Many known security vulnerabilities are included in the prototyping codebase which are not acceptable for production or deployment for live use with crypto-currencies. It should be used only for internal experimentation and development, as well as research.

## Dependencies: ##

**Meteor**

Ultra fast prototyping framework.

`meteor-desktop `

Plugin is used to take multi-platform build capabilities of Meteor and extend it to desktop/electron platform.

**Binance**

Uses libraries for accessing Binance blockchain/dex API's

**Keyring-controller:**

Commonly used and testing in the wild keyring/wallet management library. Uses blockchain/key agnostic keyring protocol.

**Cosmos libs:**

Several different cosmos API libs are beign tested for features etc.

### Dev Setup

*Note: Untested*

1. Install [Meteor](https://www.meteor.com/developers) if not already

`curl https://install.meteor.com/ | sh`


2. Clone the repository
  
`git clone git@gitlab.com:thorchain/asgard-wallet.git`

3. Install npm dependencies in new repo directory

`npm install`

4. Run meteor

`meteor run --mobile-server=127.0.0.1:3000`

5. Meteor should tell you which additional packages, if it needs (repeat step 4 until no errors)

`meteor add <package name>`

6. In seperate shell/terminal session

`npm run desktop`
