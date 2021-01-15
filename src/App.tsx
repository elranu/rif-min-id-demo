import React, { useState } from 'react'
import './App.scss'
import RLogin from '@rsksmart/rlogin'
import WalletConnectProvider from '@walletconnect/web3-provider'

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

function App () {
  const [address, setAddress] = useState('')

  const handleLogin = () => {
    rLogin.connect().then(async (provider: any) => {
      console.log('Provider: ', provider)
      const req = (await provider.request({ method: 'eth_accounts' }))[0]
      console.log('Request: ', req)
      setAddress(req)
      provider.on('accountsChanged', (accounts: Array<string>) => {
        setAddress(accounts[0])
      }
      )
    })
      .catch((err: string) => console.log(err))
  }


  return (
    <div className="App">
      <button onClick={handleLogin}>Wallet</button>
      <div>
        <label>Address: {address}</label>
      </div>
    </div>

  )
}

export default App
