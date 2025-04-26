import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../SearchBar';
import { describe, it, expect, vi } from 'vitest';

describe('SearchBar', () => {
  it('renders search input with icon', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Search by artist..." />);

    expect(screen.getByPlaceholderText(/search by artist/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('calls onChange when typing in search input', () => {
    const mockOnChange = vi.fn();
    render(<SearchBar value="" onChange={mockOnChange} />);

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('test query');
  });

  it('displays the current search value', () => {
    const searchValue = 'current search';
    render(<SearchBar value={searchValue} onChange={() => {}} />);

    expect(screen.getByRole('textbox')).toHaveValue(searchValue);
  });

  it('has correct styling classes', () => {
    render(<SearchBar value="" onChange={() => {}} />);

    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toHaveClass('pl-10');
  });
}); 