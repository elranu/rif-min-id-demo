import React, { useEffect, useState } from 'react'
import { useEthProvider } from '../../Context/provider-context'
import { IEP1193Provider } from '../../Typed/iep1993/iep1193'

function Dashboard () {
  const { address, provider, did } = useEthProvider()
  const [balance, setBalance] = useState<number | null>(null)
  const [hashMessage, setHashMessage] = useState<string>()
  const iep = new IEP1193Provider(provider)

  const signMessage = async () => {
    const message = await iep.personalSign(address, 'Este es el mensaje a firmar Kit de Identidad')
    setHashMessage(message)
  }

  useEffect(() => {
    async function getBalance () {
      setBalance(await iep.ethGetBalance(address))
    }

    getBalance()
  }, [address])

  return (

    { <button className="btn btn-primary" onClick={signMessage}>Sign</button>}
    {<div>Message: {hashMessage}</div> }
    <div>
      <div className="row pt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Persona Information</h5>
              <h6 className="card-subtitle mb-2 text-muted">Persona DID</h6>
              <p className="card-text">{did}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Persona Information</h5>
              <h6 className="card-subtitle mb-2 text-muted">Persona Address</h6>
              <p className="card-text">{address}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="row pt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">DeFi Summary</h5>
              <h6 className="card-subtitle mb-2 text-muted">Balance</h6>
              <p className="card-text">{balance} TRBTC</p>
            </div>
          </div>
        </div>
      </div>
      {/* <button className="btn btn-primary" onClick={createDid}>Create DID</button>
      <div className="alert alert-danger mt-3">DID: <b>{did}</b></div> */}
    </div>
  )
}

export default Dashboard
