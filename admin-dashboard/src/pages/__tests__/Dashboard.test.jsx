import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Dashboard from '../Dashboard'

// Mock the API lib
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
  }
}))

import api from '@/lib/api'

describe('Admin Dashboard - Main Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock the responses for dashboard metrics
    api.get.mockImplementation((url) => {
      if (url === '/admin/metrics') {
        return Promise.resolve({
          data: {
            users: 150,
            bookings: 45,
            revenue: 5200,
            activeServices: 12
          }
        })
      }
      return Promise.resolve({ data: [] })
    })
  })

  it('renders dashboard metrics successfully', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    expect(screen.getByText(/Dashboard Overview/i)).toBeInTheDocument()

    // Wait for API to resolve and metrics to appear
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument() // Users
      expect(screen.getByText('45')).toBeInTheDocument() // Bookings
    })
  })

  it('handles API error gracefully', async () => {
    api.get.mockRejectedValueOnce(new Error('API Down'))

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to load/i)).toBeInTheDocument()
    })
  })
})
