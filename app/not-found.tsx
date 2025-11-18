"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function Custom404() {
	const router = useRouter();
	useEffect(() => {
		toast.info("Page not found", {
			autoClose: 1500,
		});
		router.push("/");
	}, [router]);
	return null;
}
