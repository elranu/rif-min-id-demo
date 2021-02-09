import { IEP1193Provider } from '../iep1993/iep1193'
import EthrDID from '@rsksmart/ethr-did'
import { getDIDRegistryAddress, getRPCUrl } from '../../config/getConfig'
import { DIDDocument, PublicKey, Resolver, ServiceEndpoint } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'

const Secp256k1VerificationKey2018 = '0x73696741757468'

export class DidProvider {
    private provider: any
    private iep1193: IEP1193Provider

    constructor (provider: any) {
      this.iep1193 = new IEP1193Provider(provider)
      this.provider = provider
    }

    async getDid (address: string) {
      const chainId = parseInt(await this.iep1193.netVersion())

      switch (chainId) {
        case 1: return `did:ethr:mainnet:${address}`
        case 30: return `did:ethr:rsk:${address}`
        case 31: return `did:ethr:rsk:testnet:${address}`
        case 5777: return `did:ethr:development:${address}`
        case 5194: return `did:ethr:gasnet:${address}`
        default: return address
      }
    }

    async getAddressByDid (did: string): Promise<string> {
      const chainId = parseInt(await this.iep1193.netVersion())

      switch (chainId) {
        case 1: return did.replace('did:ethr:mainnet:', '')
        case 30: return did.replace('did:ethr:rsk:', '')
        case 31: return did.replace('did:ethr:rsk:testnet:', '')
        case 5777: return did.replace('did:ethr:development:', '')
        case 5194: return did.replace('did:ethr:gasnet:', '')
        default: return did
      }
    }

    async resolveDidDocument (address: string): Promise<DIDDocument> {
      const didResolver = new Resolver(getResolver(this.resolverProviderConfig))
      const did = await this.getDid(address)
      const data = await didResolver.resolve(did)
      return data
    }

    async changeOwner (address: string, newOwner: string): Promise<void> {
      const chainId = parseInt(await this.iep1193.netVersion())

      const b = new EthrDID({
        address: address,
        provider: this.provider,
        registry: getDIDRegistryAddress(chainId)
      })

      return new Promise((resolve, reject) => {
        b.changeOwner(newOwner.toLowerCase()
        ).then(async (tx: string) => {
          await this.transactionListener(this.provider, tx)
          resolve()
        })
          .catch((err: Error) => reject(err))
      })
    }

    async addDelegate (address: string, delegateAddress: string): Promise<void> {
      const chainId = parseInt(await this.iep1193.netVersion())

      const b = new EthrDID({
        address: address,
        provider: this.provider,
        registry: getDIDRegistryAddress(chainId)
      })
      return new Promise((resolve, reject) => {
        b.addDelegate(delegateAddress, {
          delegateType: Secp256k1VerificationKey2018
        }).then(async (tx: string) => {
          await this.transactionListener(this.provider, tx)
          resolve()
        })
          .catch((err: Error) => reject(err))
      })
    }

    async revokeDelegate (address: string, delegateAddress: string): Promise<void> {
      const chainId = parseInt(await this.iep1193.netVersion())

      const b = new EthrDID({
        address: address,
        provider: this.provider,
        registry: getDIDRegistryAddress(chainId)
      })
      return new Promise((resolve, reject) => {
        b.revokeDelegate(delegateAddress, {
          delegateType: Secp256k1VerificationKey2018
        }).then(async (tx: string) => {
          await this.transactionListener(this.provider, tx)
          resolve()
        })
          .catch((err: Error) => reject(err))
      })
    }

    async getDelegates (address: string): Promise<PublicKey[]> {
      return (await this.resolveDidDocument(address)).publicKey?.filter((pk: PublicKey) => !pk.id.endsWith('controller') &&
        !pk.id.endsWith('owner') && pk.ethereumAddress)
    }

    async getOwnerFromDidDoc (address: string): Promise<PublicKey | null> {
      // TODO: Ojo, verificar si realmente hay que mostrar el controller o el owner
      const controller = (await this.resolveDidDocument(address)).publicKey.filter((pk: PublicKey) => pk.id.endsWith('#controller'))[0]
      return (typeof controller === 'undefined') ? null : controller
    }

    async addPublicKey (address: string, type: string, value: string, validity?: number) : Promise<void> {
      const chainId = parseInt(await this.iep1193.netVersion())

      const b = new EthrDID({
        address: address,
        provider: this.provider,
        registry: getDIDRegistryAddress(chainId)
      })

      return new Promise((resolve, reject) => {
        b.setAttribute(type, value, validity)
          .then(async (tx: string) => {
            await this.transactionListener(this.provider, tx)
            resolve()
          })
          .catch((err: Error) => reject(err))
      })
    }

    async revokePublicKey (address: string, type: string, value: string, gasLimit: number) : Promise<void> {
      const chainId = parseInt(await this.iep1193.netVersion())

      const b = new EthrDID({
        address: address,
        provider: this.provider,
        registry: getDIDRegistryAddress(chainId)
      })

      return new Promise((resolve, reject) => {
        b.revokeAttribute(type, value, gasLimit)
          .then(async (tx: string) => {
            await this.transactionListener(this.provider, tx)
            resolve()
          })
          .catch((err: Error) => reject(err))
      })
    }

    async getPublicKeys (address: string): Promise<PublicKey[]> {
      return (await this.resolveDidDocument(address)).publicKey?.filter((pk: PublicKey) => pk.publicKeyBase64 || pk.publicKeyHex)
    }

    async getServices (address: string): Promise<ServiceEndpoint[] | undefined> {
      return (await this.resolveDidDocument(address)).service
    }

    transactionListener = (provider: any, txHash: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(async () => {
          const tx = await this.iep1193.getTransactionReceipt(txHash)
          if (tx != null) {
            clearInterval(checkInterval)
            if (tx.status === 1) { resolve(tx.transactionHash) } else { reject(new Error('Transaction Receipt Failed')) }
          }
        }, 2000)
      })
    }

    resolverProviderConfig = {
      networks: [
        { name: 'mainnet', registry: getDIDRegistryAddress(1), rpcUrl: getRPCUrl(1) },
        { name: 'rsk', registry: getDIDRegistryAddress(30), rpcUrl: getRPCUrl(30) },
        { name: 'rsk:testnet', registry: getDIDRegistryAddress(31), rpcUrl: getRPCUrl(31) },
        { name: 'development', registry: getDIDRegistryAddress(5777), rpcUrl: getRPCUrl(5777) },
        { name: 'gasnet', registry: getDIDRegistryAddress(5194), rpcUrl: getRPCUrl(5194) }
      ]
    }
}
