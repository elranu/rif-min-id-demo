import { IProvider } from './models/iprovider'
import { Observable } from 'rxjs'
import { Transaction } from './models/transaction'
import { serializeError } from 'eth-rpc-errors'

export interface ConnectInfo {
  chainId: string;
}

export interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

export interface ILogger {
  log(message?: any, ...optionalParams: any[]): void
  warn(message?: any, ...optionalParams: any[]): void
  error(message?: any, ...optionalParams: any[]): void
  info(message?: any, ...optionalParams: any[]): void
}

export interface ProviderMessage {
  type: string;
  data: unknown;
}

export class IEP1193Provider {
  public onAccountsChanged!: Observable<string[]>
  public onChainChanged!: Observable<string>
  public onConnected!: Observable<ConnectInfo>
  public onDisconnected!: Observable<ProviderRpcError>
  public onMessage!: Observable<ProviderMessage>


  constructor (private provider: IProvider, private logger?: ILogger) {
    this.setupEvents()
    this.logger = this.logger ? console : this.logger
  }

  async netVersion (): Promise<string> {
    try {
      return await this.provider.request<string>({ method: 'net_version' })
    } catch (error) {
      this.logger?.error(serializeError(error))
      return Promise.reject(error)
    }
  }

  async ethAccounts (): Promise<string[]> {
    try {
      return await this.provider.request<string[]>({ method: 'eth_accounts' })
    } catch (error) {
      this.logger?.error(serializeError(error))
      return Promise.reject(error)
    }
  }

  async ethGetBalance (account: string): Promise<number> {
    try {
      return this.hexToDecimal(await this.provider.request<string>({
        method: 'eth_getBalance',
        params: [account, 'latest']
      }))
    } catch (error) {
      this.logger?.error(serializeError(error))
      return Promise.reject(error)
    }
  }

  async ethSign (account: string, message: string): Promise<string> {
    try {
      return await this.provider.request<string>({
        method: 'eth_sign',
        params: [account, message]
      })
    } catch (error) {
      this.logger?.error(serializeError(error))
      return Promise.reject(error)
    }
  }

  async getTransactionReceipt (txHash: string): Promise<Transaction | null> {
    try {
      const transaction = await this.provider.request<any>({
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      })
      return transaction ? Transaction.parse(transaction) : null
    } catch (error) {
      this.logger?.error(serializeError(error))
      return Promise.reject(error)
    }
  }

  async sendTransaction () {
    try {
      return this.provider.request<string>({
        method: 'eth_sendTransaction'
      })
    } catch (error) {
      this.logger?.error(serializeError(error))
      return Promise.reject(error)
    }
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
