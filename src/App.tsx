import React, { useEffect, useState, useCallback } from 'react'
import './App.scss'
import { IEP1193Provider } from './Typed/iep1993/iep1193'
import Navbar from './components/Navbar/Navbar'
import { DidProvider } from './Typed/did/did-provider'
import { useEthProvider } from './Context/provider-context'
import Dashboard from './components/Dashboard/Dashboard'
import ManageIdentity from './components/ManageIdentity/ManageIdentity'
import { Button, Modal } from 'react-bootstrap'
import Loading from './components/Loading/Loading'

function App () {
  const { handleLogin, handleChangeDid, authenticatedAddress, provider, selectedDid } = useEthProvider()

  const [did, setDid] = useState('')
  const [balance, setBalance] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [showChangeDidModal, setShowChangeDidModal] = useState(false)
  const [selectedDidAddress, setSelectedDidAddress] = useState<string>('')

  const createDid = async () => {
    const didProvider = new DidProvider(provider)
    const did = await didProvider.getDid(authenticatedAddress)
    setDid(did)
  }

  const changeDid = async () => {
    setShowChangeDidModal(false)
    setIsLoading(true)
    const ssd = await (handleChangeDid as any)(selectedDidAddress)
    setIsLoading(false)
  }

  const updateDidAddress = async (evt: any) => {
    setSelectedDidAddress(evt.target.value)
  }

  const showDidModal = async () => {
    setSelectedDidAddress('')
    setShowChangeDidModal(true)
  }

  const hideDidModal = async () => {
    setShowChangeDidModal(false)
  }

  let walletData

  return (
    <div className="App">
      { isLoading ? <Loading/> : null}
      <Navbar></Navbar>
      <div className="container">
        {authenticatedAddress ? <h1>SelectedDid: {selectedDid}</h1> : null}
        {!authenticatedAddress
          ? <button className="btn btn-primary" onClick={handleLogin}>Open Wallet</button> : null}
        {authenticatedAddress
          ? <div>
            <Dashboard></Dashboard><br/>
            <ManageIdentity></ManageIdentity><br/>
            <button className="btn btn-primary" onClick={showDidModal}>Change Did</button>
          </div> : null}
      </div>
      <Modal show={showChangeDidModal} onHide={hideDidModal}>
        <Modal.Header closeButton>
          <Modal.Title>Change Did</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input className="form-control" placeholder='Address' value={selectedDidAddress} onChange={updateDidAddress}></input>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideDidModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={changeDid}>
            Change
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default App
