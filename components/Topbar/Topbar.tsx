"use client";

import React, { useState, useEffect } from "react";
import logo from "@/public/dewatt_logo_transparent.png";
import Image from "next/image";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Topbar() {
	const router = useRouter();
	const pathname = usePathname();
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 100);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToSection = (id: string) => {
		setTimeout(() => {
			const element = document.getElementById(id);
			element?.scrollIntoView({ behavior: "smooth", block: "center" });
		}, 200);
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 1, delay: 1 }}
			className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
		>
			<div className={`flex justify-between items-center transition-all duration-500 mx-auto ${
				isScrolled 
					? "px-6 py-0 max-w-4xl" 
					: "px-10 py-0 max-w-screen-xl"
			}`}>
				<Link href="/" className="flex items-center">
					<Image 
						src={logo} 
						alt="DeWatt logo" 
						width={isScrolled ? 120 : 150}
						height={isScrolled ? 32 : 40} 
						className="transition-all duration-500 object-contain" 
					/>
				</Link>
				
				<AnimatePresence>
					{!isScrolled && (
						<motion.div
							initial={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							transition={{ duration: 0.3 }}
							className="hidden md:flex items-center gap-8 bg-black/30 backdrop-blur-xl px-10 py-4 rounded-full border border-green-500/20 shadow-2xl shadow-green-500/10 hover:bg-black/40 hover:border-green-500/30 transition-all duration-300"
						>
							<motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
								<Link
									href="/"
									className={`transition-all hover:text-green-400 hover:cursor-pointer font-medium relative ${
										pathname == "/" ? "text-green-400" : "text-zinc-300"
									}`}
								>
									Home
									{pathname == "/" && (
										<motion.div
											layoutId="activeTab"
											className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-400 rounded-full"
										/>
									)}
								</Link>
							</motion.div>
							<motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
								<Link
									href="/"
									onClick={() => scrollToSection("about")}
									className="transition-all hover:text-green-400 hover:cursor-pointer text-zinc-300 font-medium"
								>
									About
								</Link>
							</motion.div>
							<motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
								<Link
									href="/"
									onClick={() => scrollToSection("support")}
									className="transition-all hover:text-green-400 hover:cursor-pointer text-zinc-300 font-medium"
								>
									Contact
								</Link>
							</motion.div>
							<motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
								<Link
									href="/"
									onClick={() => scrollToSection("info")}
									className="transition-all hover:text-green-400 hover:cursor-pointer text-zinc-300 font-medium"
								>
									Info
								</Link>
							</motion.div>
							<motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
								<Link
									href="/"
									onClick={() => scrollToSection("faq")}
									className="transition-all hover:text-green-400 hover:cursor-pointer text-zinc-300 font-medium"
								>
									FAQ
								</Link>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>

				<motion.div
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					<Button
						className={`transition-all duration-500 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black font-bold border-0 shadow-xl shadow-green-500/30 hover:shadow-green-400/40 rounded-full ${
							isScrolled ? "px-6 py-2 text-sm" : "px-10 py-3 text-base"
						}`}
						onClick={() => router.push("/dashboard")}
					>
						Get Started
					</Button>
				</motion.div>
			</div>
		</motion.div>
	);
}
