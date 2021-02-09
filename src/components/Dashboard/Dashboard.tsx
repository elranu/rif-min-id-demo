import React, { useEffect, useState } from 'react'
import { useEthProvider } from '../../Context/provider-context'
import { IEP1193Provider } from '../../Typed/iep1993/iep1193'

function Dashboard () {
  const { authenticatedAddress, provider, selectedDid } = useEthProvider()
  const [balance, setBalance] = useState<number | null>(null)
  const [hashMessage, setHashMessage] = useState<string>()
  const iep = new IEP1193Provider(provider)

  const signMessage = async () => {
    const message = await iep.personalSign(authenticatedAddress, 'Este es el mensaje a firmar Kit de Identidad')
    setHashMessage(message)
  }

  useEffect(() => {
    async function getBalance () {
      setBalance(await iep.ethGetBalance(authenticatedAddress))
    }

    getBalance()
  }, [authenticatedAddress])

  return (
    <div>
      <div className="row pt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Persona Information</h5>
              <h6 className="card-subtitle mb-2 text-muted">Persona Address</h6>
              <p className="card-text">{authenticatedAddress}</p>
            </div>
          </div>
        </div>
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
      <div className="row pt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Persona Information</h5>
              <h6 className="card-subtitle mb-2 text-muted">Persona DID</h6>
              <p className="card-text">{selectedDid}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Sign Content</h5>
              <p className="card-text">{ <button className="btn btn-primary" onClick={signMessage}>Sign</button>}</p>
              <p className="card-text">{hashMessage ? <div>Message: {hashMessage}</div> : null }</p>
            </div>
          </div>
        </div>
      </div>
      <hr></hr>
    </div>
  )
}

export default Dashboard
