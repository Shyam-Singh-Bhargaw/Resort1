import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/hooks/useApi', () => ({
  useCottages: jest.fn(),
}));

describe('RoomCard capacity display', () => {
  test('shows adults and children capacities on the card', () => {
    const { useCottages } = require('@/hooks/useApi');
    useCottages.mockReturnValue({ data: [ { id: 'r2', name: 'Capacity Room', category: 'deluxe', description: 'desc', price_per_night: 300, capacity: 2, capacity_adults: 3, capacity_children: 1, size: 40, images: [] } ], loading: false, error: null });

    const RoomsPage = require('@/pages/RoomsPage').default;
    const { MemoryRouter } = require('react-router-dom');
    render(<MemoryRouter><RoomsPage /></MemoryRouter>);

    expect(screen.getByText(/Capacity Room/)).toBeInTheDocument();
    expect(screen.getByText(/3 adults/)).toBeInTheDocument();
    expect(screen.getByText(/1 child/)).toBeInTheDocument();
  });
});
