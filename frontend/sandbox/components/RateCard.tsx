import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RateStructure = {
  baseRatePerKg: number;
  minimumCharge: number;
  fuelSurcharge: number;
  handlingFee: number;
  validFrom: string;
  validTo: string;
};

type Props = {
  rates: RateStructure;
};

export default function RateCard({ rates }: Props) {
  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">
        Shipment Rate Card
      </h2>

      <div className="space-y-2">
        <p>Base Rate/kg: ₹{rates.baseRatePerKg}</p>
        <p>Minimum Charge: ₹{rates.minimumCharge}</p>
        <p>Fuel Surcharge: {rates.fuelSurcharge}%</p>
        <p>Handling Fee: ₹{rates.handlingFee}</p>
      </div>

      <Button>
        Request Custom Quote
      </Button>
    </Card>
  );
}
