import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../SearchBar';
import { describe, it, expect, vi } from 'vitest';

describe('SearchBar', () => {
  it('renders search input with icon', () => {
    const mockOnSearch = vi.fn();
    const mockOnFilterChange = vi.fn();
    
    render(
      <SearchBar 
        onSearch={mockOnSearch} 
        onFilterChange={mockOnFilterChange} 
        value=""
      />
    );

    expect(screen.getByPlaceholderText(/search by artist/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls onSearch when typing in search input', () => {
    const mockOnSearch = vi.fn();
    const mockOnFilterChange = vi.fn();
    
    render(
      <SearchBar 
        onSearch={mockOnSearch} 
        onFilterChange={mockOnFilterChange} 
        value=""
      />
    );

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('has correct styling classes', () => {
    const mockOnSearch = vi.fn();
    const mockOnFilterChange = vi.fn();
    
    render(
      <SearchBar 
        onSearch={mockOnSearch} 
        onFilterChange={mockOnFilterChange} 
        value=""
      />
    );

    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toHaveClass('spotify-input');
    expect(searchInput).toHaveClass('pl-10');
  });
}); 