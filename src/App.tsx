import React, { useEffect, useState, useCallback } from 'react'
import './App.scss'
import { IEP1193Provider } from './Typed/iep1993/iep1193'
import Navbar from './components/Navbar/Navbar'
import { DidProvider } from './Typed/did/did-provider'
import { useEthProvider, EthProviderContext } from './Context/provider-context'
import Dashboard from './components/Dashboard/Dashboard'
import ManageIdentity from './components/ManageIdentity/ManageIdentity'
import { Button, Modal } from 'react-bootstrap'

function App () {
  const { handleLogin, handleChangeDid, authenticatedAddress, provider } = useEthProvider()

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
    // setSelectedDid('kjhlhjkj')
    //    handleChangeDid()
  //   setIsLoading(true)
  //   setShowChangeDidModal(false)
  //   handleChangeDid
  //   setIsLoading(false)
  //   alert('Did changed successfully')
  }

  const updateDidAddress = async (evt: any) => {
    setSelectedDidAddress(evt.target.value)
  }

  const showDidModal = async () => {
    setSelectedDidAddress('')
    setShowChangeDidModal(true)
  }

  const hideDidModal = async () => {
    // setShowChangeDidModal(false)
  }

  let walletData

  return (
    <div className="App">
      <Navbar></Navbar>
      <div className="container">
        {!authenticatedAddress
          ? <button className="btn btn-primary" onClick={handleLogin}>Open Wallet</button> : null}
        {authenticatedAddress
          ? <div>
            <Dashboard></Dashboard><br/>
            <ManageIdentity></ManageIdentity><br/>
            <button className="btn btn-primary" onClick={handleChangeDid}>Change Did</button>
          </div> : null}
      </div>
      <Modal show={showChangeDidModal} onHide={hideDidModal}>
        <Modal.Header closeButton>
          <Modal.Title>Change Did</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { /* <input className="form-control" placeholder='Address' value={selectedDidAddress}></input>
           <input type="text" value={values.selectedDidAddress} {...sharedProps('selectedDidAddress')}></input> */}
          <input className="form-control" placeholder='Address' value={selectedDidAddress} onChange={updateDidAddress}></input>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideDidModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleChangeDid}>
            Change
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default App
