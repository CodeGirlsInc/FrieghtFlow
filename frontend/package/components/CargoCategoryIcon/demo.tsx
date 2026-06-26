
import { CargoCategoryIcon } from './CargoCategoryIcon';

export function CargoCategoryIconDemo() {
  const categories = [
    'Electronics',
    'Hazardous Materials',
    'Perishable Goods',
    'Furniture',
    'Documents',
    'Machinery',
    'Clothing',
    'Automotive Parts',
    'Other',
    'Unknown Category',
  ];

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {categories.map((category) => (
        <div key={category} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CargoCategoryIcon category={category} size="lg" />
          <span>{category}</span>
        </div>
      ))}
    </div>
  );
}