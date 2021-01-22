import { IEP1193Provider } from '../iep1993/iep1193'
import EthrDID from '@rsksmart/ethr-did'
import { getDIDRegistryAddress, getRPCUrl } from '../../config/getConfig'
import { DIDDocument, PublicKey, Resolver, ServiceEndpoint } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'
import { DidDocument } from './model/did-document'

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
        default: return address
      }

      //   const ethrDid = new EthrDID({
      //     address: address,
      //     provider: this.provider,
      //     registry: getDIDRegistryAddress(parseInt(await this.iep1193.netVersion()))
      //   })
      //   console.log('did', ethrDid)
      //   return ethrDid.did
    }

    async resolveDidDocument (address: string): Promise<DIDDocument> {
      await this.iep1193.netVersion()
      const didResolver = new Resolver(getResolver(this.resolverProviderConfig))
      const did = await this.getDid(address)
      const data = await didResolver.resolve(did)
      debugger
      return data
      //   .then((data: DIDDocument) => resolve(dispatch(resolveDid({ data }))))
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

    async getDelegates (address: string): Promise<PublicKey[]> {
      return (await this.resolveDidDocument(address)).publicKey?.filter((pk: PublicKey) => !pk.id.endsWith('controller') &&
        !pk.id.endsWith('owner') && pk.ethereumAddress)
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
        { name: 'development', registry: getDIDRegistryAddress(5777), rpcUrl: getRPCUrl(5777) }
      ]
    }
}
