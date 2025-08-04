import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HomePage from './page'

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Welcome to Menu for All')
  })

  it('renders the description', () => {
    render(<HomePage />)
    
    const description = screen.getByText(/Making restaurant menus accessible to everyone/)
    expect(description).toBeInTheDocument()
  })

  it('renders Get Started button', () => {
    render(<HomePage />)
    
    const getStartedButton = screen.getByRole('button', { name: /get started/i })
    expect(getStartedButton).toBeInTheDocument()
    expect(getStartedButton).toHaveClass('btn-primary')
  })

  it('renders Learn More button', () => {
    render(<HomePage />)
    
    const learnMoreButton = screen.getByRole('button', { name: /learn more/i })
    expect(learnMoreButton).toBeInTheDocument()
    expect(learnMoreButton).toHaveClass('btn-secondary')
  })

  it('has proper responsive classes', () => {
    render(<HomePage />)
    
    const main = screen.getByRole('main')
    expect(main).toHaveClass('min-h-screen')
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-4xl', 'sm:text-5xl', 'lg:text-6xl')
  })
})