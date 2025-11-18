import appMockup from "@/public/fb010e73-ed58-4eef-ba99-33ef8ce712ab.png";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import appleIcon from "@/public/appstore.svg";
import googleIcon from "@/public/gplay.svg";

export default function NewApp() {
  return (
    <div className="flex justify-center" id="app">
      <div className="flex flex-col items-center px-12 md:px-12 mt-4 md:mt-12 max-w-screen-2xl w-[100%]">
        <p className="text-5xl font-semibold mb-6 text-center">
          Get the DeWatt App
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="flex justify-center md:w-[50%]"
          >
            <Image
              src={appMockup}
              alt="DeWatt App"
              height={700}
              className="max-h-screen-2xl"
            />
          </motion.div>
          <div className="md:w-[50%]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="md:h-full"
            >
              <Card className="md:h-full mb-6 bg-[#080908] border-2 border-[#161d15] md:p-6 p-4">
                <p className="text-3xl py-2 text-center">
                  Seamless Energy Management
                </p>
                <p className="indent-4 mb-2 text-neutral-400 text-center">
                  The DeWatt app puts control of your energy usage in the palm
                  of your hand. Whether you’re charging your electric vehicle or
                  tracking energy consumption, our platform ensures a smooth,
                  user-friendly experience that integrates real-time data and
                  secure transactions.
                </p>
                <p className="indent-4 mb-2 text-neutral-400 text-center">
                  DeWatt makes energy management more accessible and transparent
                  for everyone.
                </p>
                <p className="indent-4 mb-2 text-neutral-200 text-center text-xl">
                  Available soon on:
                </p>
                <div className="flex justify-center gap-8 mb-4">
                  <Image
                    src={appleIcon}
                    alt="Apple App Store"
                    height={30}
                  />
                  <Image
                    src={googleIcon}
                    alt="Google Play Store"
                    height={30}
                  />
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
