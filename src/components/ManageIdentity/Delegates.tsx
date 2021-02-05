import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useEthProvider } from '../../Context/provider-context'
import { DidProvider } from '../../Typed/did/did-provider'
import Loading from '../Loading/Loading'

function DelegateComponent () {
  const { address, provider, isOwner } = useEthProvider()
  const [isLoading, setIsLoading] = useState(false)
  const [showAddDelegateModal, setShowAddDelegateModal] = useState(false)
  const [selectedDelegateAddress, setSelectedDelegateAddress] = useState<string>('')
  const [delegates, setDelegates] = useState<string[]>()

  useEffect(() => {
    async function resolveAndSetDid () {
      if (address) {
        const didProvider = new DidProvider(provider)
        const publicKeys = await didProvider.getDelegates(address)
        const delegates: string[] = []

        for (const key of publicKeys) {
          delegates.push(await didProvider.getDid(key.ethereumAddress || ''))
        }

        setDelegates(delegates)
      }
    }

    resolveAndSetDid()
  }, [address])

  const addDelegate = async () => {
    setIsLoading(true)
    setShowAddDelegateModal(false)
    await new DidProvider(provider).addDelegate(address, selectedDelegateAddress)
    setIsLoading(false)
    alert('Delegate added successfully')
  }

  const revokeDelegate = async (delegateAddress: string) => {
    setIsLoading(true)
    await new DidProvider(provider).revokeDelegate(address, delegateAddress)
    setIsLoading(false)
    alert('Delegate revoked successfully')
  }

  const updateDelegateAddress = async (evt: any) => {
    setSelectedDelegateAddress(evt.target.value)
  }

  const showDelegateModal = async () => {
    setSelectedDelegateAddress('')
    setShowAddDelegateModal(true)
  }

  const hideDelegateModal = async () => {
    setShowAddDelegateModal(false)
  }

  return (
    <div className="card">
      { isLoading ? <Loading/> : null}
      <div className="card-body">
        <h5 className="card-title">Delegate Entity
          { isOwner && <button className="btn btn-primary pull-right" onClick={(showDelegateModal)}>+</button> }
        </h5>
        <div className="card-text text-left">
          { delegates?.map((delegate, i) =>
            <div key={i}>{delegate}
              { isOwner && <div><button className="btn btn-secondary" onClick={() => revokeDelegate(delegate)}>-</button></div> }
            </div>
          )}
        </div>
      </div>

      <Modal show={showAddDelegateModal} onHide={hideDelegateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add delegate</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input className="form-control" placeholder='Address' value={selectedDelegateAddress} onChange={updateDelegateAddress}></input>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideDelegateModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={addDelegate}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default DelegateComponent
