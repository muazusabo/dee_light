import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Breadcrumbs, EmptyState, Pagination, Price } from '@/components/ui';
import { navItems } from '@/lib/nav';

describe('ui', () => {
  it('renders breadcrumbs with the current page marked', () => {
    render(<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Shoes' }]} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByText('Shoes')).toHaveAttribute('aria-current', 'page');
  });
  it('shows a struck-through comparison price only when higher', () => {
    const { container, rerender } = render(<Price amount="1000" compare="1500" />);
    expect(container.querySelector('s')).not.toBeNull();
    rerender(<Price amount="1000" compare="900" />);
    expect(container.querySelector('s')).toBeNull();
  });
  it('paginates with prev/next links that keep filters', () => {
    render(<Pagination basePath="/shoes" params={{ brand: 'Nike' }} page={2} totalPages={3} />);
    expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute('href', '/shoes?brand=Nike');
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/shoes?brand=Nike&page=3');
  });
  it('renders nothing for a single page', () => { const { container } = render(<Pagination basePath="/x" params={{}} page={1} totalPages={1} />); expect(container).toBeEmptyDOMElement(); });
  it('renders empty states', () => { render(<EmptyState title="No products" message="Try again" />); expect(screen.getByText('No products')).toBeInTheDocument(); });
});
describe('navigation', () => {
  it('orders categories as required and works without API data', () => {
    expect(navItems(null).map((n) => n.label)).toEqual(['Menu', 'Snacks', 'Drinks', 'Materials', 'Shoes', 'Perfumes', 'Jewelry']);
    expect(navItems([{ slug: 'jewelry', name: 'Jewelry' }, { slug: 'menu', name: 'Menu' }]).map((n) => n.href)).toEqual(['/menu', '/jewelry']);
  });
});
