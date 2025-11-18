import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { KeyRound, Cable, Fuel } from "lucide-react";

export default function CardsSection() {
  return (
    <div className="text-center max-w-screen-xl mx-auto mb-20">
      <h2 className="text-3xl lg:text-4xl text-neutral-200 font-semibold drop-shadow-xl shadow-white md:pt-4 px-2">
        How DeWatt is Transforming the Free Energy Market
      </h2>
      <div className="flex gap-4 md:gap-14 flex-wrap mt-8 justify-center mx-10 md:mx-0 ">
        <div className="w-[95%] md:w-[30%] mb-8">
          <div className="flex-wrap md:p-4 gap-2 items-center justify-start">
            <div className="w-20 h-20 rounded-full bg-[#131413] border-2 border-[#161d15] flex justify-center items-center">
              <Fuel strokeWidth={1.5} size={40} />
            </div>

            <p className="text-3xl text-start mt-4">
              Tokenization for Transparent Trading
            </p>

            <p className="text-start text-neutral-400 mt-2">
              Using Solana’s blockchain, DeWatt tokenizes energy into digital
              assets that can be traded securely and transparently. This allows
              users to buy, sell, or trade energy with real-time pricing,
              supported by Solana’s ultra-fast transaction speeds and low costs.
            </p>
          </div>
        </div>
        <div className="w-[95%] md:w-[30%] mb-8">
          <div className="flex-wrap md:p-4 gap-2 items-center justify-start">
            <div className="w-20 h-20 rounded-full bg-[#131413] border-2 border-[#161d15] flex justify-center items-center">
              <KeyRound strokeWidth={1.5} size={40} />
            </div>

            <p className="text-3xl text-start mt-4">Web3</p>

            <p className="text-start text-neutral-400 mt-2">
              Built on Web3 and powered by Solana, DeWatt offers a seamless
              user experience. The app combines the accessibility of Web 2 with
              the security and decentralization of Web3, making energy
              management as simple as a few taps, with Solana ensuring secure,
              fast transactions.
            </p>
          </div>
        </div>
        <div className="w-[95%] md:w-[30%] mb-8">
          <div className="flex-wrap md:p-4 gap-2 items-center justify-start">
            <div className="w-20 h-20 rounded-full bg-[#131413] border-2 border-[#161d15] flex justify-center items-center">
              <Cable strokeWidth={1.5} size={40} />
            </div>

            <p className="text-3xl text-start mt-4">
              Expanding Access to Renewable Energy
            </p>

            <p className="text-start text-neutral-400 mt-2">
              DeWatt connects both large businesses and individuals directly to
              renewable energy producers, such as solar or wind farms. This
              allows users to easily access clean energy, whether for home use
              or to charge electric vehicles, without intermediaries, leveraging
              Solana’s speed and efficiency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
