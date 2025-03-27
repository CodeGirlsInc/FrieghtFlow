"use client"

const HomepageHero = () => {
    return (
      <section
        className="h-screen w-full bg-cover bg-center "
        style={{ backgroundImage: "url('/shipping-port.svg')" }}
      >
        <div className="inset-0 w-full h-full bg-black bg-opacity-30 flex flex-col items-center justify-center text-white text-center px-6 open_sans space-y-10">
          <h1 className="text-4xl md:text-5xl font-semibold max-w-3xl md:max-w-5xl">
            Seamless Freight & Cargo Management for Businesses of All Sizes
          </h1>
          <p className="mt-4 max-w-4xl font-semibold text-2xl">
            Freightflow connects small businesses, enterprises, and independent shippers with reliable logistics solutions, all powered by blockchain security.
          </p>
          <button className="mt-6 bg-[#B57704] text-2xl hover:opacity-80 text-white font-semibold py-4 px-8 rounded-lg">
            Track Shipment
          </button>
        </div>
        
      </section>
    );
  };
  
  export default HomepageHero;
  