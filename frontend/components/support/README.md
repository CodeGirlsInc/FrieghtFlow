# Support & Help Center Components

This directory contains the components for the FreightFlow Support & Help Center page.

## Components

### SupportHero
The hero section of the support page featuring:
- Search functionality
- Quick action buttons
- Responsive design

**Props:** None

**Usage:**
```jsx
import { SupportHero } from '@/components/support/SupportHero';

<SupportHero />
```

### FAQSection
A comprehensive FAQ section with:
- Searchable FAQ categories
- Expandable FAQ items
- Category filtering
- Responsive design

**Props:** None

**Usage:**
```jsx
import { FAQSection } from '@/components/support/FAQSection';

<FAQSection />
```

### ContactSupportForm
A contact form for support requests with:
- Form validation using react-hook-form
- Multiple subject categories
- Priority levels
- Loading states
- Success/error feedback

**Props:** None

**Usage:**
```jsx
import { ContactSupportForm } from '@/components/support/ContactSupportForm';

<ContactSupportForm />
```

### QuickLinks
A sidebar component with:
- Policy page links
- Helpful resources
- Support statistics
- Emergency contact information

**Props:** None

**Usage:**
```jsx
import { QuickLinks } from '@/components/support/QuickLinks';

<QuickLinks />
```

## Features

### Search Functionality
- Real-time search across FAQ content
- Category-based filtering
- Smooth scrolling to search results

### Form Validation
- Required field validation
- Email format validation
- Minimum length requirements
- Real-time error feedback

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interactions

### Performance Optimizations
- Memoized search results
- Efficient state management
- Optimized re-renders

## Data Structure

### FAQ Data
The FAQ section uses a structured data format:

```javascript
const faqData = [
  {
    category: 'Category Name',
    icon: '🚀',
    items: [
      {
        question: 'Question text?',
        answer: 'Answer text...'
      }
    ]
  }
];
```

### Form Fields
The contact form includes:
- Full Name (required)
- Email Address (required)
- Subject (required, dropdown)
- Priority Level (optional, dropdown)
- Message (required, textarea)

## Styling

All components use:
- Tailwind CSS for styling
- Consistent design system
- CSS variables for theming
- Responsive breakpoints

## Testing

Comprehensive test coverage includes:
- Component rendering
- User interactions
- Form validation
- Search functionality
- Responsive behavior

Run tests with:
```bash
npm test
```

## Dependencies

- React 18+
- Next.js 14+
- react-hook-form
- lucide-react (icons)
- Tailwind CSS
- class-variance-authority

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast compliance 