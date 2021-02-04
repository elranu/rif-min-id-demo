import WalletConnectProvider from '@walletconnect/web3-provider'
import React, { useState, useMemo, useEffect } from 'react'
import { IEP1193Provider } from '../Typed/iep1993/iep1193'
import RLogin from '@rsksmart/rlogin'
import { DidProvider } from '../Typed/did/did-provider'

const EthProviderContext = React.createContext(null)

export const rLogin = new RLogin({
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          1: 'https://mainnet.infura.io/v3/8043bb2cf99347b1bfadfb233c5325c0',
          30: 'https://public-node.rsk.co',
          31: 'https://public-node.testnet.rsk.co'
        }
      }
    }
  },
  supportedChains: [1, 30, 31]
})

export function EthProvider (props: any) {
  const [did, setDid] = useState<string>('')
  const [provider, setProvider] = useState(null)
  const [address, setAddress] = useState('')

  async function handleLogin () {
    rLogin.connect().then(async (provider: any) => {
      console.log('Provider: ', provider)

      setProvider(provider)
      const iep = new IEP1193Provider(provider)

      setAddress((await iep.ethAccounts())[0])

      iep.onAccountsChanged.subscribe(async addresses => {
        setAddress(addresses[0])
      })
    }).catch((err: string) => console.log(err))
  }

  useEffect(() => {
    async function getDid () {
      if (provider) {
        const did = await new DidProvider(provider).getDid(address)
        setDid(did)
      }
    }
    getDid()
  }, [address])

  const value = useMemo(() => {
    return ({
      provider,
      handleLogin,
      address,
      did
    })
  }, [provider, address, did])

  return <EthProviderContext.Provider value={value} {...props}></EthProviderContext.Provider>
}

export function useEthProvider () {
  const context = React.useContext(EthProviderContext)
  if (!context) {
    throw new Error('useEthProvider debe estar dentro del proveedor EthProviderContext')
  }

  return context
}
