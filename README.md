# Asgard Wallet #

****

> **Mirror**
>
> This repo mirrors from THORChain Gitlab to Github. 
> To contribute, please contact the team and commit to the Gitlab repo:
>
> https://gitlab.com/thorchain/asgard-wallet


****

Asgard wallet is an application for accessing and managing blockchain assets, on the Binance DEX blockchain. It stores the account keys necessary for authorizing transactions on blockchaian ledges.

Developed using well known and open sourced technology, the Asgard wallet is designed as a multi-platform multi-asset fully featured blockchain wallet. Built using standard web technology and deliverable for specific platforms using Electron, ensures consistent delivery of the applicaiton featureset despite the platform, and from a single codebase.

## Architecture ##

Given the long term requirements of the eventual support of multiple blockchain networks, assets, and transaction features, as well as integration between multiple official (and unofficial) wallets, the architectural choices were such that the eventual long term goal be achievable, while allowing rapid early phase product development (lean/agile) without impedence.

### Mobile/Local First ###

In the development of the architecture and the codebase, the application is developed with first consideration as the primary usage envrionment, and defining requirments that the application be able to function fully solely as a client on a specific device. As such this requires that the user's data is primarily stored within the wallet software, and that the user interface is developed begining and primarily from the mobile view.

### Multi-multi ###

The primary UVP of the Asgard wallet product strategy in the long term is to support multiple blockchains, assets, and clients. This not only supports many assets and features of blockchains, but also provides key added security capability for multi-device and multi-factor authentication imperative for the most secure use of blockchain technology.

As such in addition to the requirments as a result of the previous key strategic component, this 'mobile/local' software should easily sync with other Asgard wallets the user may have on other devices, and allow for secure transaction authentication.

From above, the product's primary architectural requirments:

1. Support Multiple blockchains/assets
2. Mobile-local first development
3. Multi-client synchronization


Given the requirements of the above, it was interesting to consider that the Meteor framework essentially delivers on all the requirements above, and provides this in a comprehensive development framework.

## Framework ##

The Meteor application development framework is a very mature framework under continual development. It uses NodeJS technology to provide a wide range of sophisticated built in features, in addition to the Meteor package ecosystem, as well as supporting the entire NPM package ecosystem. As a preconfigured full-stack framework, this creates an application foundation with tremendous potential with minimal up-front configurations or customizations.

Additionally, the Meteor project is continually implementing advanced technology (Appollo project was first/early GraphQL implemenetation), and certainly is poised given current product strategy, to continue to stay on the leading edge of technology advancements.

The Meteor framework will allow primarily for a very sophisticated client or local data-store for the user's information. Leveraging Meteor's `mini-mongo` as a permanent store, turns the browser environments `indexdb` into a client-side mongodb. The allows for tremendous flexibility in developing the user data model, and ease of consumption of the data model through standard MongoDB api.

Additionally, since the Meteor framework also is designed to synchronize multiple client instances through a server, the user's local datastore can selectively be synced with the user's other devices through this existing framework feature.

The Meteor client can also function independently of any running server, or network connectivity, and will be able to then synchronize across multiple clients the latest selected data from in addition to live blockchain network data. Interestingly, and importantly, the connectivity to these blockchain networks, is done from the client or local device's application.

Given this framework for the application, we are able then to avail ourselves of the broad spectrum of software available in both the Meteor and NPM ecosystems, as well as the existing core client data-store and client synchronization features.

## Keystore ##

Wallets store user's keys, the most sensitive data used to manage or access accounts in blockchain ledgers. These ledgers are immutable, and within the network or blockchain, it is generally considred impossible to recover funds if keys are lost and/or stolen.

Currently, the Asgard Wallet uses the API provided by Binance to generate a standard keystore. This keystore is stored **encrypted** in the applications local storage. Keys or passwords to the keystore are never stored by the application, and the application itself uses sperate authentication for opening/accessing the application and user data. The private keys needed for transactions are decrypted on-the-fly during transaction signing, and required direct user authentication, with the sole information the application requires, which is the user's password.

**Importantly:** The user's password can not be recovered! The only way to recover the account is through the importing of the backup keystore from a file, or regenerating the wallet from the "seed phrase" (mnemonic).



## Dependencies: ##

**Meteor**

Ultra fast prototyping framework.

**Electron**

`meteor-desktop `

Plugin is used to take multi-platform build capabilities of Meteor and extend it to desktop/electron platform.

**Binance**

Uses libraries for accessing Binance blockchain/dex API's

**Keyring-controller:**

Commonly used and testing in the wild keyring/wallet management library. Uses blockchain/key agnostic keyring protocol.

**Cosmos**

Several different cosmos API libs are beign tested for features etc.

### Development  Setup ###

1. Install [Meteor](https://www.meteor.com/developers) if not already

`curl https://install.meteor.com/ | sh`


2. Clone the repository
  
`git clone git@gitlab.com:thorchain/asgard-wallet.git`

3. Install npm dependencies in the new repository directory

`npm install`

4. Run meteor

`meteor run --mobile-server=127.0.0.1:3000`

5. Meteor should tell you which additional packages are need if necessary (repeat step 4 until no errors)

`meteor add <package name>`

6. In seperate shell/terminal session

`npm run desktop`


### Final Build

As per docs of "meteor-desktop" `--help` file

**Important Note**

On Mac OS Catalina (11.15+) the `.zip` produced by "electron-builder" will not work. This is a known issue: [https://medium.com/cacher-app/getting-your-electron-app-working-on-macos-catalina-10-15-63e53f397da2](https://medium.com/cacher-app/getting-your-electron-app-working-on-macos-catalina-10-15-63e53f397da2). Limiting build support to `.dmg` for the time being.