import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable from './data-table';

interface MockItem {
  id: number;
  name: string;
  age: number;
}

const mockData: MockItem[] = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Charlie', age: 35 },
  { id: 3, name: 'Bob', age: 30 },
];

const columns = [
  { header: 'Name', accessorKey: 'name' as const },
  { header: 'Age', accessorKey: 'age' as const },
];

describe('DataTable Component', () => {
  it('renders table headers and rows correctly', () => {
    render(<DataTable columns={columns} data={mockData} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders empty state when data is empty', () => {
    render(<DataTable columns={columns} data={[]} />);

    expect(screen.getByText('No data available.')).toBeInTheDocument();
  });

  it('handles sorting when header is clicked', () => {
    render(<DataTable columns={columns} data={mockData} />);

    // Get table rows cells for Name
    const getNames = () =>
      screen
        .getAllByRole('row')
        .slice(1, 4) // exclude the header row
        .map((row) => row.querySelectorAll('td')[0].textContent);

    // Initial order: Alice, Charlie, Bob
    expect(getNames()).toEqual(['Alice', 'Charlie', 'Bob']);

    const nameHeader = screen.getByText('Name');

    // Click header to sort Ascending: Alice, Bob, Charlie
    fireEvent.click(nameHeader);
    expect(getNames()).toEqual(['Alice', 'Bob', 'Charlie']);

    // Click header again to sort Descending: Charlie, Bob, Alice
    fireEvent.click(nameHeader);
    expect(getNames()).toEqual(['Charlie', 'Bob', 'Alice']);
  });

  it('handles pagination and page size changes', () => {
    const largeData = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `User ${String(i + 1).padStart(2, '0')}`,
      age: 20 + i,
    }));

    render(
      <DataTable
        columns={columns}
        data={largeData}
        pageSizeOptions={[5, 10, 20]}
      />
    );

    // Default first option in page size options is 5.
    // Verify first page displays User 01 to User 05
    expect(screen.getByText('User 01')).toBeInTheDocument();
    expect(screen.getByText('User 05')).toBeInTheDocument();
    expect(screen.queryByText('User 06')).not.toBeInTheDocument();

    // Verify pagination controls page text
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();

    // Click 'Next' to go to Page 2
    const nextBtn = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('User 06')).toBeInTheDocument();
    expect(screen.getByText('User 10')).toBeInTheDocument();
    expect(screen.queryByText('User 05')).not.toBeInTheDocument();

    // Click 'Prev' to go back to Page 1
    const prevBtn = screen.getByRole('button', { name: 'Prev' });
    fireEvent.click(prevBtn);
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('User 01')).toBeInTheDocument();

    // Change Page Size to 10
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '10' } });

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('User 01')).toBeInTheDocument();
    expect(screen.getByText('User 10')).toBeInTheDocument();
    expect(screen.queryByText('User 11')).not.toBeInTheDocument();
  });
});
