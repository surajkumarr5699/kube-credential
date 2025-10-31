import { render, screen } from '@testing-library/react'
import CredentialDisplay from '../CredentialDisplay'
import { Credential } from '../../types'

describe('CredentialDisplay', () => {
  const base: Credential = {
    id: 'CRED-1',
    holderName: 'Alice',
    credentialType: 'ID Card',
    issueDate: '2025-01-01',
  }

  it('shows core fields', () => {
    render(<CredentialDisplay credential={base} />)
    expect(screen.getByText('Credential Details')).toBeInTheDocument()
    expect(screen.getByText('CRED-1')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('ID Card')).toBeInTheDocument()
    expect(screen.getByText('2025-01-01')).toBeInTheDocument()
  })

  it('shows optional expiry and worker info', () => {
    render(
      <CredentialDisplay
        credential={{ ...base, expiryDate: '2030-01-01' }}
        workerId="worker-1"
        timestamp="2025-01-01T00:00:00.000Z"
      />
    )
    expect(screen.getByText('Expiry Date')).toBeInTheDocument()
    expect(screen.getByText('2030-01-01')).toBeInTheDocument()
    expect(screen.getByText(/processed by worker/i)).toBeInTheDocument()
    expect(screen.getByText('worker-1')).toBeInTheDocument()
  })

  it('shows issuedBy/issuedAt when provided', () => {
    render(
      <CredentialDisplay
        credential={base}
        issuedBy="issuer-1"
        issuedAt="2025-01-02T12:00:00.000Z"
      />
    )
    expect(screen.getByText(/issued by worker/i)).toBeInTheDocument()
    expect(screen.getByText('issuer-1')).toBeInTheDocument()
  })
})
