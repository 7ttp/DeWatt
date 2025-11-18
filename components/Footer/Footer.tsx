import React from 'react'
import { Zap, Battery, Leaf, Globe, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from "next/link";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = [
    { icon: Zap, label: "Stations", value: "1,000+" },
    { icon: Battery, label: "Energy", value: "5 GWh" },
    { icon: Leaf, label: "CO₂ Saved", value: "2,500T" },
    { icon: Globe, label: "Cities", value: "50+" }
  ];

  const quickLinks = [
    { name: "About", href: "#about" },
    { name: "Stations", href: "#map" },
    { name: "Contact", href: "#support" },
    { name: "Demo", href: "/demo" }
  ];

  return (
    <footer className='bg-green-500 w-full relative overflow-hidden rounded-t-[3rem] mt-20'>
      <div className='relative z-10'>
        {/* Stats Section */}
        <div className='pt-16 pb-8 px-8'>
          <div className='max-w-5xl mx-auto'>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className='grid grid-cols-4 gap-4 md:gap-8 mb-12'
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1
                  }}
                  viewport={{ once: true }}
                  className='text-center'
                >
                  <div className='bg-black/10 rounded-2xl w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-3 flex items-center justify-center'>
                    <stat.icon size={24} className="text-black md:w-8 md:h-8" />
                  </div>
                  <div className='text-lg md:text-2xl font-bold text-black mb-1'>
                    {stat.value}
                  </div>
                  <div className='text-black/80 text-xs md:text-sm font-medium'>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Main Logo Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className='text-center mb-8'
            >
              <h1 className='text-black font-bold text-5xl md:text-7xl tracking-tight mb-4'>
                DeWatt
              </h1>
              <p className='text-black/70 text-lg md:text-xl mb-6'>
                Electric Vehicle Charging Network
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className='flex flex-wrap justify-center gap-4 mb-8'
            >
              {quickLinks.map((link, index) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  className='bg-black/10 hover:bg-black/20 px-4 py-2 md:px-6 md:py-3 rounded-full text-black font-medium transition-all duration-300 text-sm md:text-base'
                >
                  {link.name}
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className='bg-green-600 py-4 rounded-t-[2rem]'>
          <div className='max-w-5xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center'>
            <div className='text-black/80 text-sm mb-4 md:mb-0 text-center md:text-left'>
              © 2025 DeWatt • Made in India
            </div>
            
            <button
              onClick={scrollToTop}
              className='bg-black/10 hover:bg-black/20 rounded-full p-2 transition-all duration-300'
            >
              <ArrowUp size={18} className="text-black" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
