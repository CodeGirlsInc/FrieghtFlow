


import Button from "@/components/ui/Button";
import Hero from "@/components/ui/Hero";
import Image from "next/image";


export const metadata = {
  title: "About Us",
  description: "Learn about FreightFlow's mission, values, and team",
  openGraph: {
    title: "About FreightFlow",
    description: "Learn about FreightFlow's mission, values, and team",
    images: [
      {
        url: "https://your-site.com/images/about-og.jpg",
        width: 1200,
        height: 630,
        alt: "About FreightFlow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About FreightFlow",
    description: "Learn about FreightFlow's mission, values, and team",
    //https://your-site.com/images/about-og.jpg
    images: [""],
  },
  other: {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About FreightFlow",
      description: "Learn about FreightFlow's mission, values, and team",
      url: "https://your-site.com/about",
    },
  },
};

export default function About() {









  return (
    <div className="open_sans"  >

      <Hero
      bg={"/about-us-img.jpeg"}
      heading= "Seamless Freight & Cargo Management for Businesses of All Sizes"
      content="Freightflow connects small businesses, enterprises and independent shippers with reliable logistics solutions, all powered by blockchian security"
      buttonText="Track Shipment"
      linkUrl="/"
      />


<section className=" w-full max-w-[1247.7px] flex flex-col gap-[150px] items-center justify-center bg-[#ffffff] py-[10%] px-[4%] mx-auto " >






<div className="w-full flex items-center flex-wrap gap-6  justify-between  " >


<div className=" flex flex-col gap-1 md:gap-5 lg:max-w-[340px] items-start mx-auto lg:mx-0 " >
<h3 className=" font-normal text-sm md:text-lg text-[#B57704]  " >A BIT</h3>
<h1 className=" text-xl  md:text-[52px] font-semibold text-[#10111A] " >ABOUT US</h1>
<p className=" text-[#97918B] font-normal text text-base md:text-lg  " >From they fine john he give of rich he. They age and draw mrs like. Improving end distrusts may instantly was household applauded incommode. Why kept very ever home mrs. Considered sympathize ten uncommonly occasional assistance sufficient not.</p>

<Button text={"Explore More"} className= "max-w-[223px] custom-shadow text-[#ffffff] text-lg font-normal rounded-[10px]  " />


</div>












<div className=" flex flex-col items-center justify-center gap-8 mx-auto md:mx-0 " >
  <Image src={"/grid-img-1.jpeg"} alt="image" height={217.2}  width={692.4} className="bg-cover rounded-[26.4px] h-[150px] md:h-[217.2px]  w-[300px] md:w-[692.4px]  " />
  <div className=" relative  mb-[120px] " >
  <Image src={"/grid-img-2.jpeg"} alt="image" height={317.2}  width={692.4} className="bg-cover rounded-[26.4px] h-[200px] w-[306.2px]   md:h-[317.2px] md:w-[692.4px] " />


<div className=" absolute left-[-10%] top-[50%] bg-[#FFFFFF] p-2 md:p-4 rounded-[26.4px] " >

  <div className="w-full h-full relative " >
    <Image src={"/grid-img-3.jpeg"} alt="image" height={337.2}  width={326.3} className="bg-cover rounded-[26.4px] h-[140px] w-[143.15px]   md:h-[337px] md:w-[326.3px]  " />




    <div  className=" flex flex-col items-center justify-center  absolute bg-[#B57704] h-[84.6px] w-[109.6px]  md:h-[169.2px] md:w-[217.2px] right-[-50%] bottom-7 rounded-[19.2px] stats-shadow  " >
      <h2 className="font-semibold text-2xl md:text-[57.6px] md:leading-[57.6px] text-[#ffffff] " > 1500+ </h2>
      <p className="font-semibold text-base md:text-[28.8px] md:leading-[28.8px] text-[#ffffff] "  >shipments</p>
    </div>
    </div>
    </div>



  </div>


</div>

   </div>




      <div className="flex flex-col  gap-3 items-center justify-center" >

<h2 className=" font-semibold text-3xl md:text-5xl text-center  " >
  <span className="text-[#0C1421] " > HEADING </span>
  <span className=" text-[#B57704] " > HEADING </span>
</h2>

<p className=" text-[#0C1421] font-light text-base md:text2xl "  >
Lorem ipsun lorem ipsun Lorem ipsun lorem ipsun Lorem ipsun lorem ipsunLorem ipsun lorem ipsun Lorem ipsun lorem ipsun Lorem ipsun lorem ipsun Lorem ipsun lorem ipsunLorem ipsun lorem ipsun  Lorem ipsun lorem ipsun Lorem ipsun lorem ipsun Lorem ipsun lorem ipsunLorem ipsun lorem ipsun Lorem ipsun lorem ipsun Lorem ipsun lorem ipsun Lorem ipsun lorem ipsunLorem ipsun lorem ipsunLorem ipsun lorem ipsun Lorem ipsun lorem ipsun Lorem ipsun lorem ipsunLorem ipsun lorem ipsun Lorem ipsun lorem ipsun Lorem
</p>


      </div>


      </section>


    </div>
  );
}