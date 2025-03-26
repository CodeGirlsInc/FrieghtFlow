"use client"
import Image from "next/image";

const HomepageHero2 = () => {
  return (
    <section className="h-screen py-16 px-6 md:px-12 text-center md:text-left open_sans flex flex-col  items-center justify-center">
      <div className="mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div className="lg:ml-10 w-full">
          <h2 className="text-3xl md:text-5xl font-bold">
            Trusted by Leading <span className="text-[#956811]">Businesses</span>
          </h2>
          <p className="mt-8 text-[#0C1421] md:w-[80%]">
          Lorem ipsun lorem ipsun Lorem ipsun lorem ipsun Lorem ipsun lorem ipsunLorem ipsun lorem ipsun Lorem ipsun lorem ipsun Lorem ipsun lorem ipsun Lorem ipsun lorem ipsunLorem ipsun lorem ipsun
          </p>
        </div>
        <div className="h-64 lg:scale-105">
          <Image src="/plane.svg" alt="Airplane" className="!relative" layout="fill" objectFit="contain" />
        </div>
      </div>
    </section>
  );
};

export default HomepageHero2;
