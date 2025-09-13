import React from 'react';
import { render, screen } from '@testing-library/react';
import { Navigation } from '@components/Navigation';

// Mock the ModernHeader component
jest.mock('@components/ModernHeader', () => ({
  ModernHeader: () => <div data-testid="modern-header">Modern Header Component</div>,
}));

describe('Navigation Component', () => {
  it('should render ModernHeader component', () => {
    render(<Navigation />);
    
    expect(screen.getByTestId('modern-header')).toBeInTheDocument();
    expect(screen.getByText('Modern Header Component')).toBeInTheDocument();
  });

  it('should be a simple wrapper component', () => {
    const { container } = render(<Navigation />);
    
    // The Navigation component should just render the ModernHeader
    expect(container.firstChild).toHaveAttribute('data-testid', 'modern-header');
  });
});