"use client";

import type { NextPage } from "next";
import "./globals.css";
import { LocationProvider } from "@/contexts/LocationContext";
import Topbar from "@/components/Topbar/Topbar";
import HeroSection from "@/components/HeroSection/HeroSection";
import CardsSection from "@/components/CardsSection/CardsSection";
import Footer from "@/components/Footer/Footer";
import { motion } from "framer-motion";

import MapSectionHome from "@/components/MapSectionHome/MapSectionHome";
import SupportSection from "@/components/SupportSection/SupportSection";
import HowItWorks from "@/components/HowItWorks/HowItWorks";
import AboutHero from "@/components/AboutHero/AboutHero";
import { AccordionDemo } from "@/components/Faq/Faq";
import StepsToBuyAndSell from "@/components/StepsToBuy/StepsToBuy";
import printConsoleASCIIArt from "@/utils/ASCIIart";
import { useEffect, useRef } from "react";
import NewApp from "@/components/NewApp/NewApp";
import WhoWeAre from "@/components/WhoWeAre/WhoWeAre";

const Home: NextPage = () => {
	const printedASCII = useRef(false);
	useEffect(() => {
		if (!printedASCII.current) {
			printConsoleASCIIArt();
			printedASCII.current = true;
		}
	}, []);

	return (
		<LocationProvider>
			<Topbar />
			<div className="pt-20">
				<HeroSection />

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 4, duration: 1 }}
				>
					<NewApp />
					<CardsSection />
					{/* <HowItWorks/> */}
					<MapSectionHome />
					<AboutHero />
					<StepsToBuyAndSell />
					<AccordionDemo />
				</motion.div>

				<SupportSection />
				<Footer />
			</div>
		</LocationProvider>
	);
};

export default Home;
