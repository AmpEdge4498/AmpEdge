import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Login from '../Login'

// Mock the API lib
vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
  }
}))

import api from '@/lib/api'

describe('Admin Dashboard - Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders login form properly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    expect(screen.getByText(/AmpEdge Admin/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument()
  })

  it('shows error on invalid credentials', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } }
    })

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'wrong@admin.com' } })
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'badpass' } })
    
    fireEvent.click(screen.getByRole('button', { name: /Login/i }))

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('logs in successfully and saves token', async () => {
    api.post.mockResolvedValueOnce({
      data: { token: 'fake_token', user: { role: 'admin' } }
    })

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'admin@ampedge.com' } })
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'securepass' } })
    
    fireEvent.click(screen.getByRole('button', { name: /Login/i }))

    await waitFor(() => {
      expect(localStorage.getItem('adminToken')).toBe('fake_token')
    })
  })
})
