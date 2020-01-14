// Reference:
// Metamask controller
import { Mutex } from 'await-semaphore'

export default class WalletController {
   constructor (keyringController) {
     console.log("constructing the wallet class");
     this.keyringController = keyringController;
     this.createVaultMutex = new Mutex()
   }
   async unlock (pw) {
    const releaseLock = await this.createVaultMutex.acquire()
    try {
      await keyringController.submitPassword(pw)
      releaseLock()
    } catch (err) {
      releaseLock()
      throw err
    }
    console.log("using wallet class to unlock...")
    return this.keyringController.submitPassword(pw);
   }
   async addNewAccount (keyring) {
    const primaryKeyring = this.keyringController.getKeyringsByType('HD Key Tree')[0]
    if (!primaryKeyring) {
      throw new Error('WalletController - No HD Key Tree found')
    }
    const keyringController = this.keyringController
    const oldAccounts = await keyringController.getAccounts()
    const keyState = await keyringController.addNewAccount(keyring)
    const newAccounts = await keyringController.getAccounts()
    console.log(newAccounts);
    

    // await this.verifySeedPhrase()
    return {...keyState}
   }

   async createNewVaultAndKeychain (password) {
    const releaseLock = await this.createVaultMutex.acquire()
    try {
      let vault
      const accounts = await this.keyringController.getAccounts()
      if (accounts.length > 0) {
        vault = await this.keyringController.fullUpdate()
      } else {
        vault = await this.keyringController.createNewVaultAndKeychain(password)
        const accounts = await this.keyringController.getAccounts()
        // this.preferencesController.setAddresses(accounts)
        // this.selectFirstIdentity()
      }
      releaseLock()
      return vault
    } catch (err) {
      releaseLock()
      throw err
    }

  }
  async createNewVaultAndRestore (password, seed) {
    const releaseLock = await this.createVaultMutex.acquire()
    try {
      const keyringController = this.keyringController
      // create new vault
      const vault = await keyringController.createNewVaultAndRestore(password, seed)

      const primaryKeyring = keyringController.getKeyringsByType('HD Key Tree')[0]
      if (!primaryKeyring) {
        throw new Error('WalletController - No HD Key Tree found')
      }
      releaseLock()
      return vault
    } catch (err) {
      releaseLock()
      throw err
    }
  }
  async addNewKeyring (keyringType) {
    const newring = await keyringController.addNewKeyring(keyringType);
    if (!newring) {
      throw new Error('WalletController - No cosmos keyring created')
    } else {
      console.log("using the wallet lib")
      // const keyringController = this.keyringController
      // const oldAccounts = await keyringController.getAccounts()
      // const keyState = await keyringController.addNewAccount(keyringType)
      // await this.addNewAccount(keyringType);
      // const newAccounts = await keyringController.getAccounts()
    }
    console.log(newring);
    const newVault = await keyringController.memStore.getState();
    window.localStorage.setItem("vault", newVault);
    return newVault;
  }
 }
