import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import IssuancePage from '../IssuancePage'
import * as api from '../../api'

vi.mock('../../api')

describe('IssuancePage', () => {
  it('issues credential successfully and shows success alert + details', async () => {
    const mockResponse = {
      success: true,
      message: 'Issued OK',
      credential: { id: 'CRED-1', holderName: 'John Doe', credentialType: 'Passport', issueDate: '2025-01-01' },
      workerId: 'worker-1',
      timestamp: '2025-01-01T00:00:00.000Z'
    }
    ;(api.issueCredential as any).mockResolvedValue(mockResponse)

    render(<IssuancePage />)

    fireEvent.change(screen.getByLabelText(/credential id/i), { target: { value: 'CRED-1' } })
    fireEvent.change(screen.getByLabelText(/holder name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/credential type/i), { target: { value: 'Passport' } })

    fireEvent.click(screen.getByRole('button', { name: /issue credential/i }))

    await waitFor(() => {
      expect(screen.getByText(/issued ok/i)).toBeInTheDocument()
      expect(screen.getByText('CRED-1')).toBeInTheDocument()
    })
  })

  it('shows error alert on failure', async () => {
    ;(api.issueCredential as any).mockRejectedValue(new Error('Boom'))

    render(<IssuancePage />)

    fireEvent.change(screen.getByLabelText(/credential id/i), { target: { value: 'CRED-1' } })
    fireEvent.change(screen.getByLabelText(/holder name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/credential type/i), { target: { value: 'Passport' } })

    fireEvent.click(screen.getByRole('button', { name: /issue credential/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to issue credential|boom/i)).toBeInTheDocument()
    })
  })
})
