import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RoomsPage from '../RoomsPage';

jest.mock('@/hooks/useApi', () => ({
  useAccommodations: jest.fn(),
  useNavigation: jest.fn(() => ({ data: [], loading: false, error: null })),
}));

const { useAccommodations, useNavigation } = require('@/hooks/useApi');

describe('RoomsPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Provide default mock implementations so Header/Layout render without errors
    useNavigation.mockReturnValue({ data: [], loading: false, error: null, refetch: jest.fn() });
    useAccommodations.mockReturnValue({ data: null, loading: true, error: null });
  });

  test('renders loading state', () => {
    useAccommodations.mockReturnValue({ data: null, loading: true, error: null });
    render(<MemoryRouter><RoomsPage /></MemoryRouter>);
    expect(screen.getByText(/Loading accommodations|Loading/)).toBeInTheDocument();
  });

  test('renders empty state when no accommodations', async () => {
    useAccommodations.mockReturnValue({ data: [], loading: false, error: null });
    render(<MemoryRouter><RoomsPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText(/No rooms found/i)).toBeInTheDocument());
  });

  test('renders error state when API fails', async () => {
    useAccommodations.mockReturnValue({ data: null, loading: false, error: { detail: 'Server error' } });
    render(<MemoryRouter><RoomsPage /></MemoryRouter>);
    expect(screen.getByText(/Failed to load accommodations/i)).toBeInTheDocument();
  });

  test('sorts by price desc and size correctly and shows featured badge and generated id', async () => {
    const accommodations = [
      { name: 'Small Cheap', price_per_night: 100, size: 20, capacity: 2, images: [], rating: 3.2 },
      { id: 'b2', name: 'Medium', price_per_night: 300, size: 50, capacity: 3, images: ['http://example.com/m.jpg'], rating: 4.8 },
      { name: 'Large Expensive', price: 2000, size: 120, capacity: 5, images: [], rating: 4.9 },
    ];

    useAccommodations.mockReturnValue({ data: accommodations, loading: false, error: null });

    render(<MemoryRouter><RoomsPage /></MemoryRouter>);

    // initial sort is price-asc: Small Cheap, Medium, Large Expensive
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(expect.arrayContaining(['Small Cheap', 'Medium', 'Large Expensive']));

    // Change to price-desc
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /Sort accommodations by price or size/i }), 'price-desc');
    await waitFor(() => {
      const large = screen.getByText('Large Expensive');
      const small = screen.getByText('Small Cheap');
      // Large Expensive should appear before Small Cheap
      expect(large.compareDocumentPosition(small) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    // Change to size (largest first)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /Sort accommodations by price or size/i }), 'size');
    await waitFor(() => {
      const large = screen.getByText('Large Expensive');
      const medium = screen.getByText('Medium');
      // Large Expensive should appear before Medium (largest first)
      expect(large.compareDocumentPosition(medium) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    // Featured badge should show for rating >= 4.5 (Medium and Large Expensive)
    expect(screen.getAllByText(/Featured/i).length).toBeGreaterThanOrEqual(1);

    // Generated id for 'Large Expensive' (no id provided) should slugify name
    const link = document.querySelector('a[href="/rooms/large-expensive"]');
    expect(link).toBeTruthy();
  });

  test('renders rooms and filters by category and sorts', async () => {
    const accommodations = [
      { id: 'a1', name: 'Suite One', category: 'suite', description: 'Nice suite', price_per_night: 1200, capacity: 4, size: 70, images: [] },
      { id: 'a2', name: 'Deluxe One', category: 'deluxe', description: 'Nice deluxe', price_per_night: 500, capacity: 2, size: 35, images: ['http://example.com/d.jpg'] },
    ];

    useAccommodations.mockReturnValue({ data: accommodations, loading: false, error: null });

    render(<MemoryRouter><RoomsPage /></MemoryRouter>);

    // Both rooms should render
    expect(screen.getByText('Suite One')).toBeInTheDocument();
    expect(screen.getByText('Deluxe One')).toBeInTheDocument();

    // Filter to Suites
    await userEvent.click(screen.getByRole('button', { name: /Suites/i }));
    expect(screen.queryByText('Deluxe One')).not.toBeInTheDocument();
    expect(screen.getByText('Suite One')).toBeInTheDocument();

    // Check price formatting
    const priceText = screen.getByText(/\$1,200/);
    expect(priceText).toBeInTheDocument();

    // Image fallback for Suite (no images) should render using img element
    const suiteImg = screen.getAllByAltText('Suite One')[0];
    expect(suiteImg).toBeInTheDocument();
  });
});
