import { IProvider } from './models/iprovider'
import { Observable } from 'rxjs'
import { Transaction } from './models/transaction'
// import Eth from 'ethjs-query'

export interface ConnectInfo {
  chainId: string;
}

export interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

export interface ProviderMessage {
  type: string;
  data: unknown;
}

export class IEP1193Provider {
  private provider: IProvider;

  public onAccountsChanged!: Observable<string[]>
  public onChainChanged!: Observable<string>
  public onConnected!: Observable<ConnectInfo>
  public onDisconnected!: Observable<ProviderRpcError>
  public onMessage!: Observable<ProviderMessage>


  constructor (provider: IProvider) {
    this.provider = provider
    this.setupEvents()
  }

  async netVersion (): Promise<string> {
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

  async getTransactionReceipt (txHash: string): Promise<Transaction | null> {
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

  private setupEvents (): void {
    this.onAccountsChanged = new Observable(subscriber => {
      this.provider.on<string[]>('accountsChanged', (accounts: string[]) => {
        subscriber.next(accounts)
      })
    })

    this.onChainChanged = new Observable(subscriber => {
      this.provider.on<string>('chainChanged', (chainId: string) => {
        subscriber.next(chainId)
      })
    })

    this.onConnected = new Observable(subscriber => {
      this.provider.on<ConnectInfo>('connect', (info: ConnectInfo) => {
        subscriber.next(info)
      })
    })

    this.onDisconnected = new Observable(subscriber => {
      this.provider.on<ProviderRpcError>('disconnect', (error: ProviderRpcError) => {
        subscriber.next(error)
      })
    })

    this.onMessage = new Observable(subscriber => {
      this.provider.on<ProviderMessage>('message', (message: ProviderMessage) => {
        subscriber.next(message)
      })
    })
  }
}
