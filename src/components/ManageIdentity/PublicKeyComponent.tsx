import { PublicKey } from 'did-resolver'
import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useEthProvider } from '../../Context/provider-context'
import { DidProvider } from '../../Typed/did/did-provider'
import Loading from '../Loading/Loading'

function PublicKeyComponent () {
  const { address, provider } = useEthProvider()
  const [publicKeys, setPublicKeys] = useState<PublicKey[]>()

  useEffect(() => {
    async function resolveAndSetDid () {
      if (address) {
        const didProvider = new DidProvider(provider)
        const publicKeys = await didProvider.getPublicKeys(address)
        debugger
        setPublicKeys(publicKeys)
      }
    }

    resolveAndSetDid()
  }, [address])

  return (
    <div>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Public Keys</h5>
          {(!publicKeys || publicKeys.length === 0) && <li><em>No public keys</em></li>}
          {publicKeys?.map((pk: PublicKey) => (
            <li key={pk.id}><strong>{pk.type}</strong><br /> {pk.publicKeyBase64 || pk.publicKeyHex}</li>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PublicKeyComponent
