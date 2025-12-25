import { render, screen } from '@testing-library/react';

// Mock the hook used by RoomsPage
jest.mock('@/hooks/useApi', () => ({
  useAccommodations: jest.fn(),
  useNavigation: jest.fn(() => ({ data: [], loading: false, error: null, refetch: jest.fn() })),
}));

// Import the RoomCard component directly by re-export or you can extract it to its own file; for now, render RoomsPage and rely on component output

describe('RoomCard', () => {
  test('renders price formatted and image alt', () => {
    // Render a minimal RoomsPage with mocked data
    const { useAccommodations } = require('@/hooks/useApi');
    useAccommodations.mockReturnValue({ data: [ { id: 'r1', name: 'Test Room', category: 'deluxe', description: 'desc', price_per_night: 250, capacity: 2, size: 40, images: [] } ], loading: false, error: null });

    const RoomsPage = require('@/pages/RoomsPage').default;
    const { MemoryRouter } = require('react-router-dom');
    render(<MemoryRouter><RoomsPage /></MemoryRouter>);

    expect(screen.getByText(/Test Room/)).toBeInTheDocument();
    expect(screen.getByText(/\$250/)).toBeInTheDocument();
    expect(screen.getByAltText('Test Room')).toBeInTheDocument();
  });
});
