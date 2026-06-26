import React from 'react';
import { render } from '@testing-library/react-native';
import Marketplace from '../Marketplace';

// Mock the API service
jest.mock('../../../services/api', () => ({
  get: jest.fn().mockResolvedValue({
    data: [
      {
        _id: '1',
        name: 'Electric Drill',
        price: 45.99,
        category: 'Tools'
      }
    ]
  }),
}));

// Mock WishlistContext
jest.mock('../../../context/WishlistContext', () => ({
  useWishlist: () => ({
    wishlist: [],
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
  }),
}));

// Mock Navigation
const mockNavigation = {
  navigate: jest.fn(),
};

describe('Mobile App - Marketplace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders marketplace screen and loading state initially', () => {
    const { getByText } = render(
      <Marketplace navigation={mockNavigation} />
    );
    expect(getByText(/Loading products/i)).toBeTruthy();
  });
});
