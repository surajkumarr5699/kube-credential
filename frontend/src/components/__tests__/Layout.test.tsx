import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../Layout'

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={["/issuance"]}>{children}</MemoryRouter>
)

describe('Layout', () => {
  it('renders title and nav links', () => {
    render(
      <Wrapper>
        <Layout>
          <div>content</div>
        </Layout>
      </Wrapper>
    )

    expect(screen.getByText(/kube credential/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /issue credential/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /verify credential/i })).toBeInTheDocument()
  })
})
