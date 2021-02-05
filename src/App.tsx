import React, { useEffect, useState } from 'react'
import './App.scss'
import { IEP1193Provider } from './Typed/iep1993/iep1193'
import Navbar from './components/Navbar/Navbar'
import { DidProvider } from './Typed/did/did-provider'
import { useEthProvider } from './Context/provider-context'
import Dashboard from './components/Dashboard/Dashboard'
import ManageIdentity from './components/ManageIdentity/ManageIdentity'

function App () {
  const { handleLogin, address, provider } = useEthProvider()

  const [did, setDid] = useState('')
  const [balance, setBalance] = useState(-1)
  const [hashMessage, setHashMessage] = useState<string>()

  const signMessage = async () => {
    const message = await new IEP1193Provider(provider).ethSign(address, 'Este es el mensaje a firmar')
    console.log('message', message)
    setHashMessage(message)
  }

  const createDid = async () => {
    const didProvider = new DidProvider(provider)
    const did = await didProvider.getDid(address)
    setDid(did)
  }

  let walletData

  return (
    <div className="App">
      <Navbar></Navbar>
      <div className="container">
        {!address
          ? <button className="btn btn-primary" onClick={handleLogin}>Open Wallet</button> : null}
        {address
          ? <div><Dashboard></Dashboard> <ManageIdentity></ManageIdentity></div> : null}
      </div>
    </div>
  )
}

export default App
