import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Dashboard from '../Dashboard'

// Mock the API lib
vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
  }
}))

import api from '../../lib/api'

describe('Admin Dashboard - Main Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock the responses for dashboard metrics
    api.get.mockImplementation((url) => {
      if (url === '/users/stats') {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              users: { total: 100, technicians: 10, activeTechnicians: 5 },
              bookings: { total: 200, pending: 10 },
              revenue: { total: 5000 },
              services: { total: 5 },
              recentBookings: []
            }
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

    expect(screen.getByText(/Admin 👋/i)).toBeInTheDocument()

    // Wait for API to resolve and metrics to appear
    await waitFor(() => {
      expect(screen.getByText('₹5,000')).toBeInTheDocument() // Revenue
    })
  })

  it('handles API error gracefully and loads fallback data', async () => {
    api.get.mockRejectedValueOnce(new Error('API Down'))

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('185')).toBeInTheDocument() // Fallback active technicians
    })
  })
})
