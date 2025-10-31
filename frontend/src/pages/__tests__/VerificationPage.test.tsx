import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VerificationPage from '../VerificationPage'
import * as api from '../../api'

vi.mock('../../api')

describe('VerificationPage', () => {
  it('shows verified state and details when API returns verified=true', async () => {
    const mockResponse = {
      success: true,
      verified: true,
      message: 'Valid',
      credential: { id: 'CRED-1', holderName: 'John Doe', credentialType: 'Passport', issueDate: '2025-01-01' },
      issuedBy: 'issuer-1',
      issuedAt: '2025-01-01T00:00:00.000Z',
      workerId: 'verifier-1',
      timestamp: '2025-01-01T00:00:00.000Z',
    }
    ;(api.verifyCredential as any).mockResolvedValue(mockResponse)

    render(<VerificationPage />)

    fireEvent.change(screen.getByLabelText(/credential id/i), { target: { value: 'CRED-1' } })
    fireEvent.change(screen.getByLabelText(/holder name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/credential type/i), { target: { value: 'Passport' } })

    fireEvent.click(screen.getByRole('button', { name: /verify credential/i }))

    await waitFor(() => {
      expect(screen.getByText(/credential verified/i)).toBeInTheDocument()
      expect(screen.getByText('CRED-1')).toBeInTheDocument()
    })
  })

  it('shows failed state when API returns verified=false', async () => {
    const mockResponse = {
      success: true,
      verified: false,
      message: 'Not found',
      workerId: 'verifier-1',
      timestamp: '2025-01-01T00:00:00.000Z',
    }
    ;(api.verifyCredential as any).mockResolvedValue(mockResponse)

    render(<VerificationPage />)

    fireEvent.change(screen.getByLabelText(/credential id/i), { target: { value: 'CRED-1' } })
    fireEvent.change(screen.getByLabelText(/holder name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/credential type/i), { target: { value: 'Passport' } })

    fireEvent.click(screen.getByRole('button', { name: /verify credential/i }))

    await waitFor(() => {
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument()
      expect(screen.getByText(/not found/i)).toBeInTheDocument()
    })
  })
})
