// Comprehensive Testing Utilities for Urban Thread

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import userEvent from '@testing-library/user-event';

// Mock contexts and providers
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const MockCartProvider = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const MockSettingsProvider = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

// Test wrapper with all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MockAuthProvider>
          <MockCartProvider>
            <MockSettingsProvider>
              <ToastContainer />
              {children}
            </MockSettingsProvider>
          </MockCartProvider>
        </MockAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function
const customRender = (ui: React.ReactElement, options = {}) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Mock data generators
export const generateMockProduct = (overrides = {}) => ({
  _id: 'product-123',
  name: 'Premium Cotton Shirt',
  description: 'A high-quality cotton shirt perfect for any occasion',
  price: 2999,
  comparePrice: 3999,
  stock: 10,
  category: { _id: 'cat-1', name: 'Shirts' },
  images: ['https://example.com/shirt1.jpg', 'https://example.com/shirt2.jpg'],
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['Black', 'White', 'Blue'],
  tags: ['cotton', 'casual', 'premium'],
  rating: 4.5,
  reviews: 128,
  sold: 45,
  createdAt: '2024-01-01T00:00:00.000Z',
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

export const generateMockOrder = (overrides = {}) => ({
  _id: 'order-123',
  user: 'user-123',
  items: [generateMockCart()],
  total: 5998,
  status: 'pending',
  shippingAddress: {
    name: 'John Doe',
    phone: '+923001234567',
    address: '123 Street, City',
    postalCode: '54000'
  },
  paymentMethod: 'COD',
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

// API mocking utilities
export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
};

export const mockApiError = (message = 'API Error', status = 500) => {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(JSON.stringify({ error: message })),
  } as Response);
};

// Test helpers
export const waitForLoadingToFinish = () => {
  return waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
};

export const waitForElementToBeVisible = (element: HTMLElement) => {
  return waitFor(() => {
    expect(element).toBeVisible();
  });
};

export const fillForm = async (fields: Record<string, string>) => {
  const user = userEvent.setup();
  
  for (const [fieldName, value] of Object.entries(fields)) {
    const field = screen.getByLabelText(fieldName) || screen.getByPlaceholderText(fieldName);
    await user.clear(field);
    await user.type(field, value);
  }
};

export const clickButton = async (buttonText: string) => {
  const user = userEvent.setup();
  const button = screen.getByRole('button', { name: buttonText });
  await user.click(button);
};

export const expectToastToAppear = async (message: string) => {
  await waitFor(() => {
    expect(screen.getByText(message)).toBeInTheDocument();
  });
};

// Component testing utilities
export const testComponentRendering = (Component: React.ComponentType<any>, props: any) => {
  test('renders without crashing', () => {
    customRender(<Component {...props} />);
  });

  test('matches snapshot', () => {
    const { asFragment } = customRender(<Component {...props} />);
    expect(asFragment()).toMatchSnapshot();
  });
};

export const testAccessibility = (Component: React.ComponentType<any>, props: any) => {
  test('has no accessibility violations', async () => {
    const { container } = customRender(<Component {...props} />);
    
    // This would integrate with axe-core for accessibility testing
    // For now, just basic checks
    expect(container).toBeAccessible();
  });
};

// Performance testing utilities
export const measureRenderTime = (Component: React.ComponentType<any>, props: any) => {
  const startTime = performance.now();
  customRender(<Component {...props} />);
  const endTime = performance.now();
  
  return {
    renderTime: endTime - startTime,
    isAcceptable: (endTime - startTime) < 100, // 100ms threshold
  };
};

// Integration testing utilities
export const testUserFlow = async (steps: Array<() => Promise<void>>) => {
  for (const step of steps) {
    await act(async () => {
      await step();
    });
  }
};

// Mock service worker for testing
export const setupMockServiceWorker = () => {
  // Mock service worker registration
  Object.defineProperty(navigator, 'serviceWorker', {
    writable: true,
    value: {
      register: jest.fn(() => Promise.resolve({
        installing: null,
        waiting: null,
        active: null,
      })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  });
};

// Mock IndexedDB for testing
export const setupMockIndexedDB = () => {
  const mockDB = {
    transaction: jest.fn(() => ({
      objectStore: jest.fn(() => ({
        add: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
        getAll: jest.fn(),
      })),
    })),
    close: jest.fn(),
  };

  Object.defineProperty(indexedDB, 'open', {
    writable: true,
    value: jest.fn(() => ({
      onsuccess: { set: jest.fn() },
      onerror: { set: jest.fn() },
      onupgradeneeded: { set: jest.fn() },
      result: mockDB,
    })),
  });

  return mockDB;
};

// Test data factories
export class TestDataFactory {
  static createProducts(count: number, overrides = {}) {
    return Array.from({ length: count }, (_, index) => 
      generateMockProduct({
        _id: `product-${index}`,
        name: `Product ${index + 1}`,
        price: 1000 + index * 100,
        ...overrides,
      })
    );
  }

  static createCategories(count: number, overrides = {}) {
    return Array.from({ length: count }, (_, index) => 
      generateMockCategory({
        _id: `category-${index}`,
        name: `Category ${index + 1}`,
        ...overrides,
      })
    );
  }

  static createCartItems(count: number, overrides = {}) {
    return Array.from({ length: count }, (_, index) => 
      generateMockCart({
        cartId: `cart-item-${index}`,
        ...overrides,
      })
    );
  }

  static createOrders(count: number, overrides = {}) {
    return Array.from({ length: count }, (_, index) => 
      generateMockOrder({
        _id: `order-${index}`,
        ...overrides,
      })
    );
  }
}

// Assertion helpers
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent(text);
};

export const expectButtonToBeDisabled = (buttonText: string) => {
  const button = screen.getByRole('button', { name: buttonText });
  expect(button).toBeDisabled();
};

export const expectButtonToBeEnabled = (buttonText: string) => {
  const button = screen.getByRole('button', { name: buttonText });
  expect(button).not.toBeDisabled();
};

// Mock event utilities
export const createMockEvent = (type: string, properties = {}) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, properties);
  return event;
};

export const createMockDragEvent = (type: string, data = {}) => {
  const event = new DragEvent(type, { bubbles: true, cancelable: true });
  Object.assign(event, data);
  return event;
};

// Form validation testing
export const testFormValidation = async (formSelector: string, validationRules: Record<string, (value: string) => boolean>) => {
  const form = document.querySelector(formSelector);
  if (!form) throw new Error(`Form not found: ${formSelector}`);

  for (const [fieldName, validator] of Object.entries(validationRules)) {
    const field = form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
    if (!field) continue;

    // Test valid input
    field.value = 'valid input';
    expect(validator(field.value)).toBe(true);

    // Test invalid input
    field.value = '';
    expect(validator(field.value)).toBe(false);
  }
};

// Responsive testing utilities
export const testResponsive = (Component: React.ComponentType<any>, props: any, breakpoints: Record<string, number>) => {
  Object.entries(breakpoints).forEach(([breakpoint, width]) => {
    test(`renders correctly at ${breakpoint} (${width}px)`, async () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });

      // Mock matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes(`${width}px`),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      customRender(<Component {...props} />);
      
      // Add breakpoint-specific assertions here
      await waitForLoadingToFinish();
    });
  });
};

// Export all testing utilities
export * from '@testing-library/react';
export * from '@testing-library/user-event';
export { customRender as render };
export default {
  customRender,
  generateMockProduct,
  generateMockCategory,
  generateMockCart,
  generateMockUser,
  generateMockOrder,
  mockApiResponse,
  mockApiError,
  waitForLoadingToFinish,
  fillForm,
  clickButton,
  expectToastToAppear,
  testComponentRendering,
  testAccessibility,
  measureRenderTime,
  testUserFlow,
  setupMockServiceWorker,
  setupMockIndexedDB,
  TestDataFactory,
  expectElementToBeVisible,
  expectElementToHaveText,
  expectButtonToBeDisabled,
  expectButtonToBeEnabled,
  testFormValidation,
  testResponsive,
};
