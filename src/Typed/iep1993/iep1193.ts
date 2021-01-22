import { IProvider } from './models/iprovider'
import { Observable } from 'rxjs'
import { Transaction } from './models/transaction'
// import Eth from 'ethjs-query'

export class IEP1193Provider {
    private provider: IProvider;

    public accountsChanged?: Observable<string[]>

    // (addresses: string[]) => void

    constructor (provider: IProvider) {
      this.provider = provider

      this.accountsChanged = new Observable(subscriber => {
        provider.on<Array<string>>('accountsChanged', (accounts: Array<string>) => {
          subscriber.next(accounts)
        })
      })
    }

    async netVersion () : Promise<string> {
      return await this.provider.request<string>({ method: 'net_version' })
    }

    async ethAccounts (): Promise<string[]> {
      return await this.provider.request<string[]>({ method: 'eth_accounts' })
    }

    async ethGetBalance (account: string): Promise<number> {
      return this.hexToDecimal(await this.provider.request<string>({
        method: 'eth_getBalance',
        params: [account, 'latest']
      }))
    }

    async ethSign (account: string, message: string): Promise<string> {
      return await this.provider.request<string>({
        method: 'eth_sign',
        params: [account, message]
      })
    }

    async getTransactionReceipt (txHash: string) : Promise<Transaction | null> {
      const transaction = await this.provider.request<any>({
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      })

      return transaction ? Transaction.parse(transaction) : null
    }

    async sendTransaction () {
      return this.provider.request<string>({
        method: 'eth_sendTransaction'
      })
    }

    private hexToDecimal (hexValue: string): number {
      return parseInt(hexValue, 16)
    }
}
