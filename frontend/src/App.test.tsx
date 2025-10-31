import { render, screen } from '@testing-library/react'
import App from './App'

// Basic smoke test to ensure the app renders the header/nav
it('renders the app layout with title and nav links', () => {
  render(<App />)

  // Title from Layout
  expect(screen.getByText(/kube credential/i)).toBeInTheDocument()

  // Nav links
  expect(screen.getByRole('link', { name: /issue credential/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /verify credential/i })).toBeInTheDocument()
})
