import '@testing-library/jest-dom';

// Prevent Vite's import.meta.env usage in tests by mocking the api client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(() => Promise.resolve({ data: null })),
    post: jest.fn(() => Promise.resolve({ data: null })),
    put: jest.fn(() => Promise.resolve({ data: null })),
    delete: jest.fn(() => Promise.resolve({ data: null })),
  },
}));
