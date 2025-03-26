import Image from "next/image";

const testimonials = [
  {
    image: "/Ellipse 17.png", // Replace with actual image path
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    image: "/Ellipse 17.png",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    image: "/Ellipse 17.png",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
];

export default function Testimonials() {
  return (
    <section className="w-full text-center py-12 px-4">
      <h2 className="text-[32px] font-semibold text-[#956811] uppercase mb-8">
        Testimonials
      </h2>
      <div className="relative flex flex-col items-center mt-48">
        <span className="absolute -left-12 -top-64 text-[220px] text-[#B57704] hidden md:block">
          &ldquo;
        </span>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-40 md:space-y-0 md:space-x-8 w-full">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center bg-white rounded-[50px] h-[453px] w-[355px] p-6 text-center shadow-lg shadow-[#393B3C40] border border-[#D9D9D9]"
            >
              <div className="absolute -top-[25%] flex justify-center mb-4">
                <Image
                  src={testimonial.image}
                  alt="Testimonial"
                  width={215}
                  height={215}
                  className="rounded-full border border-gray-300 object-cover"
                />
              </div>
              <div className="h-full flex flex-col justify-center items-center mt-16">
                <p className="text-[16px] italic leading-10 text-[#4A493E] px-4">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
        <span className="absolute -right-[60px] -bottom-72 transform text-[220px] text-[#B57704] hidden md:block">
          &rdquo;
        </span>
      </div>
    </section>
  );
}
