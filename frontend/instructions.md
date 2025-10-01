Description Build a reusable <Textarea /> component with character counting and error states.

Tasks
Create Textarea.tsx in components/ui/.
Support resizable by default.
Add optional maxLength with character counter.
Add error state styling.
Add TypeScript props for value, onChange, placeholder, maxLength, error.

Acceptance Criteria
<Textarea maxLength={200} /> shows live character count.
Errors display correctly below the textarea.
Respects TypeScript props.