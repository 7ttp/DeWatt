"use client";

import type { NextPage } from "next";
import Topbar from "@/components/Topbar/Topbar";
import "../globals.css";
import AboutHero from "@/components/AboutHero/AboutHero";
import StepsToBuyAndSell from "@/components/StepsToBuy/StepsToBuy";
import { AccordionDemo } from "@/components/Faq/Faq";
import Footer from "@/components/Footer/Footer";
import { motion } from "framer-motion";

const About: NextPage = () => {

    return (
        <>
            <Topbar />
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5}}
            >
            <AboutHero />
            <StepsToBuyAndSell />
            <AccordionDemo/>
            </motion.div>
            <Footer/>
            
        </>

    );
};

export default About;
