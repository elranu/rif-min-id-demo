import { DIDDocument, PublicKey } from 'did-resolver'
import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useEthProvider } from '../../Context/provider-context'
import { DidProvider } from '../../Typed/did/did-provider'
import Loading from '../Loading/Loading'
import DelegateComponent from './Delegates'
import PublicKeyComponent from './PublicKeyComponent'

function ManageIdentity () {
  const { did } = useEthProvider()

  return (
    <div>
      <div className="row pt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Persona Owner</h5>
              <p className="card-text">{did}</p>
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
    </div>
  )
}

export default ManageIdentity
