interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
}

export default function PricingCard({
  title,
  price,
  description,
  features,
  cta,
}: PricingCardProps) {
  return (
    <div className="flex flex-col justify-between border rounded-2xl shadow-md p-6 bg-white hover:shadow-xl transition duration-300">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <p className="text-4xl font-extrabold text-gray-900 mb-6">
          {price}
          <span className="text-lg font-normal text-gray-500">/mo</span>
        </p>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="text-green-500 mr-2">✔</span> {feature}
            </li>
          ))}
        </ul>
      </div>
      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300">
        {cta}
      </button>
    </div>
  );
}
