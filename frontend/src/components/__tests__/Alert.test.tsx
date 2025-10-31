import { render, screen, fireEvent } from '@testing-library/react'
import Alert from '../Alert'

describe('Alert', () => {
  it('renders message and type styles', () => {
    render(<Alert type="success" message="All good" />)
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(<Alert type="error" message="Oops" onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
