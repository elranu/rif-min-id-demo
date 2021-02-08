import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useEthProvider } from '../../Context/provider-context'
import { DidProvider } from '../../Typed/did/did-provider'
import Loading from '../Loading/Loading'
import DelegateComponent from './Delegates'
import PublicKeyComponent from './PublicKeyComponent'

function ManageIdentity () {
  const { authenticatedAddress, provider, isOwner, selectedDid } = useEthProvider()
  const [isLoading, setIsLoading] = useState(false)
  const [didOwner, setDidOwner] = useState<string>('')
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>('')
  const [showTransferModal, setShowTransferModal] = useState(false)

  useEffect(() => {
    async function getOwner () {
      if (authenticatedAddress) {
        const didProvider = new DidProvider(provider)
        const ownerPK = await didProvider.getOwnerFromDidDoc(selectedDid === '' ? authenticatedAddress : selectedDid)
        setDidOwner(await didProvider.getDid(ownerPK?.ethereumAddress ?? ''))
      }
    }

    getOwner()
  }, [authenticatedAddress, selectedDid])

  const hideTransferModal = async () => {
    setShowTransferModal(false)
  }
  const updateNewOwnerAddress = async (evt: any) => {
    setNewOwnerAddress(evt.target.value)
  }

  const transferOwner = async () => {
    setIsLoading(true)
    hideTransferModal()
    await new DidProvider(provider).changeOwner(selectedDid, newOwnerAddress)
    setIsLoading(false)
    alert('Transfer owner successfully')
  }

  return (
    <div>
      { isLoading ? <Loading/> : null}
      <div className="row pt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Persona Owner
                { isOwner && <button className="btn btn-primary" onClick={() => { setShowTransferModal(true) }}>Transfer</button> }
              </h5>
              <p className="card-text">{didOwner}</p>
              {console.log(didOwner)}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <DelegateComponent></DelegateComponent>
        </div>
      </div>
      <div className="row pt-5">
        <div className="col-md-6">
          <PublicKeyComponent></PublicKeyComponent>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Service Endpoints</h5>
              <p className="card-text">No service endpoints setup.</p>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showTransferModal} onHide={hideTransferModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Owner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input className="form-control" placeholder='New Owner Address' value={newOwnerAddress} onChange={updateNewOwnerAddress}></input>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideTransferModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={transferOwner}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ManageIdentity
