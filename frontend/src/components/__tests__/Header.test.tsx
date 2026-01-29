import React from 'react'
import { render, screen } from '@testing-library/react'
import Header from '../Header'

describe('Header Component', () => {
  it('renders the application title', () => {
    render(<Header />)
    
    expect(screen.getByText('AI Retailer Bot')).toBeInTheDocument()
    expect(screen.getByText('Smart Shopping Assistant')).toBeInTheDocument()
  })

  it('renders the logo', () => {
    render(<Header />)
    
    const logo = screen.getByText('AI')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveClass('text-white', 'font-bold')
  })

  it('has proper styling classes', () => {
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b', 'border-gray-200')
  })
})