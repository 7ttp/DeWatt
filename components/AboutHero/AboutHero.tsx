import station3d from "@/public/station3d.svg";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function AboutHero() {
  return (
    <div className="flex justify-center" id="about">
      <div className="px-12 md:px-12 mt-4 md:mt-12 max-w-screen-2xl w-[100%]">
        <p className="text-5xl font-semibold md:px-10 mb-2">What is DeWatt? </p>
        <div className="flex items-center jusxatify-center">
          <div className="md:w-[70%] md:h-[80%] md:flex p-4 gap-8">
            <div className="md:w-[50%]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5, duration: 0.5 }}
                className="md:h-full"
              >
                <Card className="md:h-full mb-6 bg-[#080908] border-2 border-[#161d15] md:p-6 p-4">
                  <p className="text-3xl py-2">
                    Empowering Energy for Electric Vehicles
                  </p>
                  <p className="indent-4 mb-2 text-neutral-400">
                    DeWatt revolutionizes the electric vehicle charging
                    experience by connecting station owners directly with
                    renewable energy producers. Our platform enables seamless
                    integration of solar, wind, and other clean energy sources
                    to EV stations, ensuring efficient, eco-friendly charging at
                    competitive rates.
                  </p>
                  <p className="indent-4 mb-2 text-neutral-400">
                    By using the latest in blockchain technology, DeWatt brings
                    simplicity and transparency to the energy market, making it
                    easier than ever for EV drivers to access reliable green
                    energy, all while minimizing their carbon footprint.
                  </p>
                  {/* <p className="indent-4 mb-2 text-neutral-400">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor, Lorem ipsum dolor sit amet, consectetur
                    adipiscing elit, sed do eiusmod tempor Lorem ipsum dolor sit
                    amet, consectetur adipiscing elit, sed do eiusmod tempor,
                  </p> */}
                </Card>
              </motion.div>
            </div>
            <div className="md:w-[50%] ">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <Card className="mb-6 bg-[#080908] border-2 border-[#161d15] md:p-6 p-4">
                  <p className="text-3xl py-2">Sustainability and Innovation</p>
                  <p className="indent-4 text-neutral-400">
                    At DeWatt, sustainability is at the heart of our mission.
                    Our platform encourages the widespread adoption of renewable
                    energy and electric vehicles, promoting a greener future.
                    Using blockchain, every energy transaction is secure,
                    traceable, and tamper-proof, pushing the boundaries of
                    innovation in the energy sector and fostering environmental
                    conservation.
                  </p>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
              >
                <Card className="mb-6 md:mb-0 bg-[#080908] border-2 border-[#161d15] md:p-6 p-4">
                  <p className="text-3xl py-2">
                    Decentralized Energy Marketplace
                  </p>
                  <p className="indent-4 text-neutral-400">
                    DeWatt operates on a decentralized platform powered by the
                    Solana blockchain, creating a direct link between energy
                    producers and consumers. By tokenizing energy, we eliminate
                    intermediaries, ensuring secure, transparent, and real-time
                    transactions, with Solana’s speed and low costs driving
                    efficiency.
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
          <Image
            src={station3d}
            alt="station"
            height={700}
            className="hidden md:block md:-mt-12 max-h-screen-2xl "
          />
        </div>
      </div>
    </div>
  );
}
