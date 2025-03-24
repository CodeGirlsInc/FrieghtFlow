export default function Services() {
  const services = [
    {
      id: 1,
      title: "Ship Transport",
      img: "/shipping.jpg",
    },
    {
      id: 2,
      title: "Road Transport",
      img: "/road.jpg",
    },
    {
      id: 3,
      title: "Air Transport",
      img: "/plane.jpg",
    },
    {
      id: 4,
      title: "Rail Transport",
      img: "/train.jpg",
    },
  ];

  return (
    <div>
      <div className="flex justify-center items-center text-[#B57704] text-2xl sm:text-3xl md:text-4xl bg-white w-full p-2 sm:p-4">
        <h1>Services</h1>
      </div>
      <div
        className="h-max bg-fixed bg-cover bg-center"
        style={{ backgroundImage: "url('/servicebg.jpg')" }}
      >
        <div className="bg-[#000000]/80 w-full h-max py-8">
          <div className="flex items-center flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16 p-4 sm:p-6 md:p-8 h-full mx-auto">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col justify-center items-center gap-2 sm:gap-4 relative z-20"
              >
                <div className="w-[11rem] h-[18rem] sm:h-[20rem] md:h-[20rem] overflow-hidden rounded-full">
                  <img
                    src={service.img}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-white text-sm sm:text-base md:text-lg font-light text-center">
                  {service.title}
                </h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
