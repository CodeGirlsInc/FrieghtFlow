"use client"
import Button from "./ui/Button"
import SearchButton from "./ui/SearchButton"

const Partners = () => {
  const partners = [1, 2, 3, 4, 5] 

  return (
    <section className="w-full py-12 md:py-16 lg:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-10">
          <h2 className="text-[32px] md:text-4xl font-medium text-[#956811] mb-4">SHIPPING PARTNERS</h2>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl">
            Get personalized recommendations based on your location
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 mb-10 justify-items-center">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-6 rounded-[50px] border-2 border-[#956811]"
              style={{ width: "224px", height: "224px" }}
            >
              <div className="relative w-full h-full">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex justify-center">
                      <img src="/logo.png" alt="Logo" className="w-60 h-50" />
                        
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-xl mx-auto">
          <SearchButton
            text="Search Partners"
            className="rounded-md"
            onClick={() => console.log("Search partners clicked")}
          />
          <Button
            text="Enter Location"
            className="rounded-md "
            onclick={() => console.log("Enter location clicked")}
            type="button"
          />
        </div>
      </div>
    </section>
  )
}

export default Partners;

