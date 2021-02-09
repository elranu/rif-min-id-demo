import { PublicKey } from 'did-resolver'
import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useEthProvider } from '../../Context/provider-context'
import { DidProvider } from '../../Typed/did/did-provider'
import Loading from '../Loading/Loading'

function PublicKeyComponent () {
  const { authenticatedAddress, provider, isOwner, selectedDid } = useEthProvider()
  const [isLoading, setIsLoading] = useState(false)
  const [showAddPublicKeyModal, setShowAddPublicKeyModal] = useState(false)
  const [publicKeys, setPublicKeys] = useState<PublicKey[]>()

  useEffect(() => {
    async function resolveAndSetDid () {
      await getPublicKeys()
    }

    resolveAndSetDid()
  }, [authenticatedAddress, selectedDid])

  const getPublicKeys = async () => {
    if (authenticatedAddress) {
      const didProvider = new DidProvider(provider)
      const publicKeys = await didProvider.getPublicKeys(selectedDid)
      setPublicKeys(publicKeys)
    }
  }
  const defaults = ({
    algorithm: 'secp256k1',
    purpose: 'veriKey',
    encoding: 'hex',
    validity: '86400',
    value: ''
  })

  const [values, setValues] = useState<{ algorithm: string, purpose: string, encoding: string, validity: string, value: string }>(defaults)
  const sharedProps = (id: string) => ({
    id,
    className: 'line',
    onChange: (evt: { target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement }) =>
      setValues({ ...values, [evt.target.id]: evt.target.value })
  })

  const addPublicKey = async () => {
    setIsLoading(true)
    setShowAddPublicKeyModal(false)
    await new DidProvider(provider).addPublicKey(selectedDid, `did/pub/${values.algorithm}/${values.purpose}/${values.encoding}`, values.value, parseInt(values.validity))
    setIsLoading(false)
    await getPublicKeys()
    alert('PublicKey added successfully')
  }

  const showPublicKeyModal = async () => {
    setShowAddPublicKeyModal(true)
  }

  const hidePublicKeyModal = async () => {
    setShowAddPublicKeyModal(false)
    setValues(defaults)
  }

  return (
    <div>
      <div className="card">
        { isLoading ? <Loading/> : null}
        <div className="card-body">
          <h5 className="card-title">Public Keys
            { isOwner && <button className="btn btn-primary" onClick={(showPublicKeyModal)}>+</button> }
          </h5>
          {(!publicKeys || publicKeys.length === 0) && <li><em>No public keys</em></li>}
          {publicKeys?.map((pk: PublicKey) => (
            <div key={pk.id}>
              <li><strong>{pk.type}</strong><br /> {pk.publicKeyBase64 || pk.publicKeyHex }</li>
            </div>
          ))}
        </div>
      </div>

      <Modal show={showAddPublicKeyModal} onHide={hidePublicKeyModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add PublicKey</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6">
              <label>Key Algorithm</label>
            </div>
            <div className="col-md-6">
              <select {...sharedProps('algorithm')} value={values.algorithm}>
                <option value="secp256k1">secp256k1</option>
                <option value="rsa">RSA</option>
                <option value="Ed25519">Ed25519</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <label htmlFor="purpose">Key Purpose</label>
            </div>
            <div className="col-md-6">
              <select {...sharedProps('purpose')} value={values.purpose}>
                <option value="veriKey">veriKey</option>
                <option value="sigAuth">sigAuth</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <label htmlFor="encoding">Encoding</label>
            </div>
            <div className="col-md-6">
              <select {...sharedProps('encoding')} value={values.encoding}>
                <option value="hex">hex</option>
                <option value="base64">base64</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6"><label htmlFor="validity">Validity <span>(in seconds)</span></label>
            </div>
            <div className="col-md-6">
              <input {...sharedProps('validity')} type="text" value={values.validity} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6"><label>Key</label>
            </div>
            <div className="col-md-6">
              <textarea {...sharedProps('value')}></textarea>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hidePublicKeyModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={addPublicKey}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default PublicKeyComponent
