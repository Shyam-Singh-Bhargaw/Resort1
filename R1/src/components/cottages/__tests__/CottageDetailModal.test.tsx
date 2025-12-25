import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CottageDetailModal from '../CottageDetailModal';

// Mock hooks
jest.mock('@/hooks/useApi', () => ({
  useCottage: (id: any) => ({
    data: {
      id: '69493d8447713d1510e10edf',
      name: 'Garden Suite',
      description: 'Cozy suite overlooking the tea gardens',
      price_per_night: 120,
      capacity: 2,
      rooms: [
        { id: 'r1', name: 'Garden Suite Room 1', capacity: 2, price_per_night: 120, available: true },
        { id: 'r2', name: 'Garden Suite Room 2', capacity: 2, price_per_night: 120, available: true }
      ]
    },
    loading: false,
    error: null
  }),
  useExtraBedsForAccommodation: () => ({ data: [], loading: false, error: null })
}));

describe('CottageDetailModal', () => {
  test('renders rooms and calls onBook with selected room id', () => {
    const onClose = jest.fn();
    const onBook = jest.fn();

    render(<CottageDetailModal id={'69493d8447713d1510e10edf'} onClose={onClose} onBook={onBook} />);

    // Rooms should render
    expect(screen.getByText('Rooms')).toBeInTheDocument();
    expect(screen.getByLabelText('Select room Garden Suite Room 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Select room Garden Suite Room 2')).toBeInTheDocument();

    // Select second room
    const radio2 = screen.getByLabelText('Select room Garden Suite Room 2') as HTMLInputElement;
    fireEvent.click(radio2);
    expect(radio2.checked).toBe(true);

    // Click Book (target actual button, not the mention in the instruction text)
    const bookBtn = screen.getByRole('button', { name: /Book This Cottage/i });
    fireEvent.click(bookBtn);

    expect(onBook).toHaveBeenCalledTimes(1);
    expect(onBook).toHaveBeenCalledWith('r2', expect.any(Boolean));
  });
});