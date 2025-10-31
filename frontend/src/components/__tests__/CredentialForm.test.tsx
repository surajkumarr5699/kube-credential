import { render, screen, fireEvent } from '@testing-library/react'
import CredentialForm from '../CredentialForm'

function fillAndSubmit() {
  const onSubmit = vi.fn()
  render(<CredentialForm onSubmit={onSubmit} isLoading={false} buttonText="Submit" />)

  fireEvent.change(screen.getByLabelText(/credential id/i), { target: { value: 'CRED-1' } })
  fireEvent.change(screen.getByLabelText(/holder name/i), { target: { value: 'John Doe' } })
  fireEvent.change(screen.getByLabelText(/credential type/i), { target: { value: 'Passport' } })
  // issueDate has default; leave it
  fireEvent.click(screen.getByRole('button', { name: /submit/i }))
  return onSubmit
}

describe('CredentialForm', () => {
  it('submits required fields and omits empty expiryDate', () => {
    const onSubmit = fillAndSubmit()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0][0]
    expect(payload).toMatchObject({ id: 'CRED-1', holderName: 'John Doe', credentialType: 'Passport' })
    expect('expiryDate' in payload).toBe(false)
  })

  it('disables button when loading', () => {
    render(<CredentialForm onSubmit={vi.fn()} isLoading={true} buttonText="Go" />)
    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled()
  })
})
