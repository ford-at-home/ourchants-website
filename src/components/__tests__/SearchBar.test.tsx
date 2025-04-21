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
      />
    );

    expect(screen.getByPlaceholderText(/search by title, artist, or tradition/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls onSearch when typing in search input', () => {
    const mockOnSearch = vi.fn();
    const mockOnFilterChange = vi.fn();
    
    render(
      <SearchBar 
        onSearch={mockOnSearch} 
        onFilterChange={mockOnFilterChange} 
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
      />
    );

    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toHaveClass('pl-10');
    expect(searchInput).toHaveClass('bg-white/5');
    expect(searchInput).toHaveClass('border-none');
    expect(searchInput).toHaveClass('text-white');
  });
}); 