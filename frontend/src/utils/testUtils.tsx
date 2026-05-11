// Testing Utilities for Urban Thread
// This file contains mock implementations for testing

import React from 'react';

// Mock data generators
export const generateMockProduct = (overrides = {}) => ({
  _id: 'product-123',
  name: 'Premium Cotton Shirt',
  description: 'A high-quality cotton shirt perfect for any occasion',
  price: 2999,
  comparePrice: 3999,
  stock: 10,
  category: { _id: 'cat-1', name: 'Shirts' },
  images: ['https://example.com/shirt1.jpg'],
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['Black', 'White'],
  ...overrides,
});

export const generateMockCategory = (overrides = {}) => ({
  _id: 'cat-1',
  name: 'Shirts',
  description: 'Premium collection of shirts',
  image: 'https://example.com/category.jpg',
  products: [],
  ...overrides,
});

export const generateMockCart = (overrides = {}) => ({
  cartId: 'cart-item-123',
  productId: 'product-123',
  name: 'Premium Cotton Shirt',
  price: 2999,
  quantity: 2,
  size: 'M',
  color: 'Black',
  image: 'https://example.com/shirt1.jpg',
  ...overrides,
});

export const generateMockUser = (overrides = {}) => ({
  _id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+923001234567',
  role: 'customer',
  ...overrides,
});

// Mock testing functions (to be replaced with actual testing library)
export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
};

// Note: To use actual testing, install these dependencies:
// npm install --save-dev @testing-library/react @testing-library/user-event @tanstack/react-query jest @types/jest

export default {
  generateMockProduct,
  generateMockCategory,
  generateMockCart,
  generateMockUser,
  mockApiResponse,
};
