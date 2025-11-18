"use client";
import "@/app/globals.css";

import type { NextPage } from "next";
import { useEffect, useRef } from "react";
import printConsoleASCIIArt from "@/utils/ASCIIart";
import Topbar from "@/components/Topbar/Topbar";
import YouTube, { YouTubeEvent } from "react-youtube";

const Home: NextPage = () => {
	const printedASCII = useRef(false);
	const videoRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<any>(null);

	const opts = {
		height: "100%",
		width: "100%",
		playerVars: {
			controls: 0,
			modestbranding: 1,
			rel: 0,
			iv_load_policy: 3,
			disablekb: 0,
			fs: 0,
			autohide: 1,
			autoplay: 1,
			mute: 0,
		},
	};

	const onReady = (event: YouTubeEvent) => {
		const player = event.target;
		player.setPlaybackQuality("hd1080");
		playerRef.current = player;
	};

	useEffect(() => {
		if (!printedASCII.current) {
			printConsoleASCIIArt();
			printedASCII.current = true;
		}

		if (videoRef.current) {
			videoRef.current.scrollIntoView({ behavior: "smooth" });
		}

		if (playerRef.current) {
			playerRef.current.playVideo();
		}
	}, []);

	return (
		<>
			<Topbar />
			<div
				ref={videoRef}
				className="flex flex-col justify-center items-center min-h-screen h-screen w-screen bg-black md:p-4 lg:p-8"
			>
				<div className="w-full h-full md:rounded-lg">
					<YouTube
						videoId="sANxsPYEb38" // 3m19s
						// videoId="U3xpZtIsfk8" // 4m24s
						opts={{ ...opts, quality: "hd1080" }}
						onReady={onReady}
						className="w-full h-full"
					/>
				</div>
			</div>
		</>
	);
};

export default Home;
