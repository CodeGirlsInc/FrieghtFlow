import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function PriceCalculator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Price Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground" role="status">
          Price estimates are temporarily unavailable while the quote service is being built.
          Please enter a price when creating your shipment.
        </p>
      </CardContent>
    </Card>
  );
}
