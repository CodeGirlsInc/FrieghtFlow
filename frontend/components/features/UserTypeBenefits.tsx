export default function UserTypeBenefits() {
  const benefits = [
    {
      userType: "Small Business",
      points: [
        "Cost-effective shipment automation",
        "Faster payment settlements",
        "Improved delivery reliability",
      ],
    },
    {
      userType: "Large Enterprise",
      points: [
        "Advanced analytics for route optimization",
        "Bulk shipment management",
        "Full compliance and audit trails",
      ],
    },
    {
      userType: "Independent Shipper",
      points: [
        "Low fees with decentralized payments",
        "Direct customer communication",
        "Mobile-first tracking tools",
      ],
    },
  ];

  return (
    <section className="bg-gray-100 py-20 px-6">
      <h2 className="text-3xl font-bold text-center mb-12">
        Benefits for Every User
      </h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {benefits.map((benefit, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-4">{benefit.userType}</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              {benefit.points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
