import Image from "next/image";

function PricingCard({ title, price, features, featured, description }) {
  return (
    <div
      className={`flex flex-col justify-between items-start w-[262px] h-[432px] p-6 rounded-lg shadow-lg ${
        featured ? "bg-[#956811]" : "bg-white"
      }`}
    >
      <div className="space-y-5">
        <div
          className={
            featured
              ? "text-white"
              : price === 0
              ? "text-[#6C6E6F]" // Free plan (gray)
              : "text-[#956811]" // Regular plans (gold)
          }
        >
          <h3 className="font-bold text-3xl">{title}</h3>
          <p className="font-medium">{description}</p>
          <p className="font-semibold text-4xl mt-3">${price}</p>
        </div>

        <ul
          className={`space-y-2 ${featured ? "text-white" : "text-[#6C6E6F]"}`}
        >
          {features.map((feature, index) => (
            <li className="flex items-center space-x-2 text-sm" key={index}>
              <Image
                src={
                  featured ? "/check-mark-white.svg" : "/check-mark-blue.svg"
                }
                alt="check mark"
                width={20}
                height={20}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        className={`w-full py-3 rounded-full cursor-pointer hover:scale-105 transition-all duration-300  font-semibold ${
          featured ? "bg-white text-[#956811]" : "bg-[#956811] text-white"
        }`}
      >
        Subscribe Now
      </button>
    </div>
  );
}

export default PricingCard;
