import WalletConnectProvider from '@walletconnect/web3-provider'
import React, { useState, useMemo, useEffect } from 'react'
import { IEP1193Provider } from '../Typed/iep1993/iep1193'
import RLogin from '@rsksmart/rlogin'
import { DidProvider } from '../Typed/did/did-provider'

export const EthProviderContext = React.createContext(null)

export const rLogin = new RLogin({
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          1: 'https://mainnet.infura.io/v3/8043bb2cf99347b1bfadfb233c5325c0',
          30: 'https://public-node.rsk.co',
          31: 'https://public-node.testnet.rsk.co',
          1337: 'http:///127.0.0.1:8545'
        }
      }
    }
  },
  supportedChains: [1, 30, 31]
})

export function EthProvider (props: any) {
  const [did, setDid] = useState<string>('')
  const [provider, setProvider] = useState(null)
  const [authenticatedAddress, setAuthenticatedAddress] = useState('')
  const [selectedDid, setSelectedDid] = useState('')
  const [isOwner, setIsOwner] = useState<boolean>(false)

  async function handleLogin () {
    rLogin.connect().then(async (provider: any) => {
      console.log('Provider: ', provider)

      setProvider(provider)
      const iep = new IEP1193Provider(provider)

      const account = (await iep.ethAccounts())[0]
      setSelectedDid(account)
      setAuthenticatedAddress(account)

      iep.onAccountsChanged.subscribe(async addresses => {
        setSelectedDid(addresses[0])
        setAuthenticatedAddress(addresses[0])
      })

      iep.onChainChanged.subscribe(async chainId => {
        console.log('ChainId: ', chainId)
      })
    }).catch((err: string) => console.log(err))
  }

  async function handleChangeDid (address: string) {
    setSelectedDid(address)
    alert('Did changed successfully')
  }

  useEffect(() => {
    async function getDid () {
      if (provider) {
        const didProvider = new DidProvider(provider)
        const did = await didProvider.getDid(authenticatedAddress)
        setDid(did)
        const ownerPK = await didProvider.getOwnerFromDidDoc(selectedDid)
        setIsOwner(authenticatedAddress === ownerPK?.ethereumAddress)
        console.log('selectedDid from getDid: ' + selectedDid)
      }
    }
    getDid()
  }, [authenticatedAddress, selectedDid])

  const value = useMemo(() => {
    return ({
      provider,
      handleLogin,
      authenticatedAddress,
      did,
      isOwner,
      selectedDid,
      handleChangeDid,
      setSelectedDid
    })
  }, [provider, authenticatedAddress, did, isOwner, selectedDid])

  return <EthProviderContext.Provider value={value} {...props}></EthProviderContext.Provider>
}

export function useEthProvider () {
  const context = React.useContext(EthProviderContext)

  if (!context) {
    throw new Error('useEthProvider debe estar dentro del proveedor EthProviderContext')
  }

  return context
}
