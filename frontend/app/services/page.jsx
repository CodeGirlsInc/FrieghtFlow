import React from "react";
import Image from "next/image";
import Link from "next/link";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import { mockData } from "./constant";

export const metadata = {
	title: "Our Services",
	description: "Explore FreightFlow's comprehensive logistics and freight management services",
	openGraph: {
		title: "FreightFlow Services",
		description:
			"Explore FreightFlow's comprehensive logistics and freight management services",
		images: [
			{
				url: "https://your-site.com/images/services-og.jpg",
				width: 1200,
				height: 630,
				alt: "FreightFlow Services",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "FreightFlow Services",
		description:
			"Explore FreightFlow's comprehensive logistics and freight management services",
		images: [""],
	},
	other: {
		"script:ld+json": {
			"@context": "https://schema.org",
			"@type": "Service",
			name: "FreightFlow Services",
			description:
				"Explore FreightFlow's comprehensive logistics and freight management services",
			url: "https://your-site.com/services",
			provider: {
				"@type": "Organization",
				name: "FreightFlow",
			},
		},
	},
};

export default function Service() {
	return (
		<main>
			{/* Hero Section */}
			<section
				className="h-screen w-full bg-cover bg-center"
				style={{ backgroundImage: "url('/shipping-port.svg')" }}
			>
				<div className="inset-0 w-full h-full bg-black bg-opacity-30 flex flex-col items-center justify-center text-white text-center px-6 open_sans space-y-10">
					<h1 className="text-4xl md:text-5xl font-semibold max-w-3xl md:max-w-5xl">
						SERVICES
					</h1>
					<p className="mt-4 max-w-4xl font-semibold text-2xl text-center">
						Freightflow connects small businesses, enterprises and independent shippers
						with reliable logistics solutions, all powered by blockchain security
					</p>
					<button className="mt-6 bg-[#B57704] text-2xl hover:opacity-80 text-white font-base py-4 px-8 rounded-lg">
						GET STARTED
					</button>
				</div>
			</section>

			<section className="py-[100px] md:py-[200px] px-6 md:px-12 bg-gray-50">
				<div className="max-w-6xl mx-auto space-y-12 flex flex-col md:gap-[100px]">
					{mockData.map((service, index) => (
						<div
							key={service.name}
							className={`flex flex-col md:flex-row items-center gap-[80px] md:gap-[120px] ${
								index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
							}`}
						>

							<div className="w-full md:w-1/2">
								<Image
									src={service.image}
									alt={`${service.name} service`}
									width={500}
									height={300}
									className="rounded-[80px] object-cover w-full h-64 md:h-80"
								/>
							</div>

				
							<div className="w-full md:w-1/2 space-y-4">
								<div className="flex flex-col text-[40px]  text-gray-800">
									<p className=" text-[40px] font-normal leading-[42px]">
										{service.name}
									</p>
									<p className=" text-[#B57704]">TRANSPORT</p>
								</div>
								<p className="text-[#6C6E6F] leading-relaxed">
									Lorem ipsun Lorem ipsunLorem ipsunvLorem ipsunLorem ipsunLorem
									ipsunLorem ipsunLorem ipsunLorem ipsunLorem ipsunLorem
									ipsunLorem n Lorem ipsunLorem ipsunLorem ipsunLorem ipsunLorem
									ipsunLorem ipsunLorem ipsunLorem
								</p>
								<Link href={service.link}>
									<button className="bg-[#B57704] w-full text-[14px] font-extralight mt-[49px] text-white  py-4 px-6 rounded-lg hover:opacity-80">
										USE SERVICE
									</button>
								</Link>
							</div>
						</div>
					))}
				</div>
			</section>

			<Pricing />
			<div className=" px-12 py-20 md:py-40">
				<Testimonials />
			</div>
      <div className="pb-20 md:pb-40">
				<FAQ />
			</div>
		</main>
	);
}
