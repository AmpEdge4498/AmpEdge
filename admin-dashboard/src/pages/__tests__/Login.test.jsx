import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Login from '../Login'

// Mock the API lib
vi.mock('../../lib/api', () => ({
  default: {
    post: vi.fn(),
  },
  setAuthToken: vi.fn((token) => {
    if (token) {
      localStorage.setItem('adminToken', token);
    } else {
      localStorage.removeItem('adminToken');
    }
  }),
}))

import api, { setAuthToken } from '../../lib/api'

describe('Admin Dashboard - Login Page', () => {
  const mockOnAuth = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders login form properly', () => {
    render(
      <MemoryRouter>
        <Login onAuth={mockOnAuth} />
      </MemoryRouter>
    )

    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/admin@ampedge\.in/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })

  it('shows error on invalid credentials', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } }
    })

    render(
      <MemoryRouter>
        <Login onAuth={mockOnAuth} />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/admin@ampedge\.in/i), { target: { value: 'wrong@admin.com' } })
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'badpass' } })
    
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('logs in successfully and saves token', async () => {
    api.post.mockResolvedValueOnce({
      data: { success: true, token: 'fake_token', user: { role: 'ADMIN' } }
    })

    render(
      <MemoryRouter>
        <Login onAuth={mockOnAuth} />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/admin@ampedge\.in/i), { target: { value: 'admin@ampedge.com' } })
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'securepass' } })
    
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(localStorage.getItem('adminToken')).toBe('fake_token')
      expect(mockOnAuth).toHaveBeenCalled()
    })
  })
})
