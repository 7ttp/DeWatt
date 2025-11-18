import Image from "next/image";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import marceloImage from "@/public/marcelo.jpg";
import matheusImage from "@/public/matheus.jpg";

export default function WhoWeAre() {
  return (
    <div className="flex justify-center" id="who-we-are">
      <div className="px-6 md:px-12 mt-4 md:mt-12 max-w-screen-2xl w-full">
        <p className="text-5xl font-semibold text-center mb-12">Who We Are</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Marcelo's Profile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col md:flex-row items-center bg-[#080908] border-2 border-[#161d15] p-6 rounded-lg"
          >
            <div className="w-[200px] h-[200px] overflow-hidden rounded-lg transition-transform duration-300 ease-in-out hover:scale-105">
              <Image
                src={marceloImage}
                alt="Marcelo Feitoza"
                width={200}
                height={200}
                className="object-cover"
              />
            </div>
            <div className="ml-6">
              <p className="text-3xl font-semibold text-center md:text-left">
                Marcelo Feitoza 🇧🇷
              </p>
              <p className="text-neutral-400 text-left mt-4">
                Q3 Graduate <span className="font-semibold">@ Turbin3</span>
                <br />
                Fellow{" "}
                <span className="font-semibold">
                  @ Solana Summer Fellowship 2024
                </span>
                <br />
                Member <span className="font-semibold">@ Superteam BR</span>
                <br />
                Blockchain Developer{" "}
                <span className="font-semibold">@ Cryptum</span>
                <br />
                Software Engineering Student{" "}
                <span className="font-semibold">@ Inteli</span>
              </p>
            </div>
          </motion.div>

          {/* Matheus's Profile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col md:flex-row items-center bg-[#080908] border-2 border-[#161d15] p-6 rounded-lg"
          >
            <div className="w-[200px] h-[200px] overflow-hidden rounded-lg transition-transform duration-300 ease-in-out hover:scale-105">
              <Image
                src={matheusImage}
                alt="Matheus Macedo"
                width={200}
                height={200}
                className="object-cover"
              />
            </div>
            <div className="ml-6">
              <p className="text-3xl font-semibold text-center md:text-left">
                Matheus Macedo <br /> 🇧🇷 in 🇭🇷
              </p>
              <p className="text-neutral-400 text-left mt-4">
                Media Contributor & Member{" "}
                <span className="font-semibold">@ Superteam BR</span>
                <br />
                Former Software Engineer{" "}
                <span className="font-semibold">@ BTG Pactual</span>
                <br />
                Software Engineering Student{" "}
                <span className="font-semibold">@ Inteli</span>
                <br />
                Master in System Engineering{" "}
                <span className="font-semibold">@ Algebra University</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
