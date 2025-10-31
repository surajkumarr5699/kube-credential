import axios from 'axios'
import { issueCredential, verifyCredential, getAllCredentials } from './api'

vi.mock('axios')
const mockedAxios = axios as unknown as { post: any; get: any }

describe('api module', () => {
  it('calls issuance endpoint on issueCredential', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({ data: { success: true } })
    const res = await issueCredential({ id: '1', holderName: 'A', credentialType: 'ID', issueDate: '2025-01-01' })
    expect(res).toEqual({ success: true })
    expect(mockedAxios.post).toHaveBeenCalled()
    const url = mockedAxios.post.mock.calls[0][0] as string
    expect(url).toMatch(/\/api\/issue-credential$/)
  })

  it('calls verification endpoint on verifyCredential', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue({ data: { success: true, verified: true } })
    const res = await verifyCredential({ id: '1', holderName: 'A', credentialType: 'ID', issueDate: '2025-01-01' })
    expect(res).toEqual({ success: true, verified: true })
    const url = mockedAxios.post.mock.calls[0][0] as string
    expect(url).toMatch(/\/api\/verify$/)
  })

  it('calls getAllCredentials', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({ data: { credentials: [{ id: '1' }] } })
    const res = await getAllCredentials()
    expect(res).toEqual([{ id: '1' }])
    const url = mockedAxios.get.mock.calls[0][0] as string
    expect(url).toMatch(/\/api\/credentials$/)
  })
})
