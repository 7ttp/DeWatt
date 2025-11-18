"use client";
import { NextPage } from "next";
import { useEffect } from "react";

const Resources: NextPage = () => {
	useEffect(() => {
		window.location.href =
			"https://drive.google.com/drive/u/3/folders/1auyDSagGdwYz28UgOmwnuwc0sAO1F9WP";
	}, []);

	return null;
};

export default Resources;
