import React from 'react'
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

const handleLogin = () => {
  rLogin.connect().then((provider: any) => {
    console.log('Provider: ', provider)
    })
    .catch((err: string) => console.log(err))
}

function App () {
  return (
    <div className="App">
      <button onClick={handleLogin}>Wallet</button>
    </div>
  )
}

export default App
