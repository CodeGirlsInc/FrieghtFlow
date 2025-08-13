const data = [
  { feature: "24/7 Support", smallBiz: true, enterprise: true, shipper: true },
  {
    feature: "Dedicated Account Manager",
    smallBiz: false,
    enterprise: true,
    shipper: false,
  },
  {
    feature: "Real-Time Tracking",
    smallBiz: true,
    enterprise: true,
    shipper: true,
  },
  {
    feature: "Custom Reports",
    smallBiz: false,
    enterprise: true,
    shipper: true,
  },
];

export default function PricingComparison() {
  return (
    <div className="overflow-x-auto mt-10 border rounded-lg">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Features</th>
            <th className="p-4">Small Businesses</th>
            <th className="p-4">Enterprises</th>
            <th className="p-4">Independent Shippers</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              <td className="p-4">{row.feature}</td>
              <td className="p-4 text-center">{row.smallBiz ? "✔" : "—"}</td>
              <td className="p-4 text-center">{row.enterprise ? "✔" : "—"}</td>
              <td className="p-4 text-center">{row.shipper ? "✔" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
