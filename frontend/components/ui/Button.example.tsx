import React, { useState } from 'react';
import Button from './Button';

/**
 * Example usage of the Button component
 */
export default function ButtonExamples() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="p-8 space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Variants</h2>
        <div className="flex gap-4 flex-wrap">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Sizes</h2>
        <div className="flex gap-4 items-center flex-wrap">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Loading State</h2>
        <div className="flex gap-4 flex-wrap">
          <Button isLoading>Loading</Button>
          <Button variant="secondary" isLoading>
            Loading
          </Button>
          <Button variant="outline" onClick={handleClick} isLoading={isLoading}>
            Click to Load
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Disabled State</h2>
        <div className="flex gap-4 flex-wrap">
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled Outline
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Combined Examples</h2>
        <div className="flex gap-4 flex-wrap">
          <Button variant="primary" size="lg">
            Large Primary
          </Button>
          <Button variant="outline" size="sm">
            Small Outline
          </Button>
          <Button variant="ghost" size="md" isLoading>
            Ghost Loading
          </Button>
        </div>
      </section>
    </div>
  );
}