"use client";
import React, { useEffect, useMemo, useState } from "react";
import { PhotoProvider, PhotoSlider } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css"; // Import the CSS for styling
import "./blogpage.css";

interface EnhanceHtmlContentProps {
	htmlContent: string;
}

function extractImageUrls(htmlContent: string): string[] {
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = htmlContent;
	const images = tempDiv.querySelectorAll("img");
	return Array.from(images).map((img) => img.src);
}

const CustomPhotoView: React.FC<EnhanceHtmlContentProps> = ({ htmlContent }) => {
	const [visible, setVisible] = useState(false);
	const [index, setIndex] = useState(0);

	const imageUrls = useMemo(() => {
		if (typeof window === "undefined") return [];
		return extractImageUrls(htmlContent);
	}, [htmlContent]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setVisible(false);
			}
		};

		const handleClick = (i: number) => () => {
			setIndex(i);
			setVisible(true);
		};

		const applyImageListeners = () => {
			const images = document.querySelectorAll(".custom-prose img");
			images.forEach((img, i) => {
				img.classList.add("cursor-pointer");
				img.removeEventListener("click", handleClick(i)); // Remove previous handler if exists
				img.addEventListener("click", handleClick(i));
			});
		};

		// Observe changes in the DOM to apply listeners to newly added images
		const observer = new MutationObserver(() => {
			applyImageListeners();
		});

		// Start observing the target node for configured mutations
		const targetNode = document.querySelector(".custom-prose");
		if (targetNode) {
			observer.observe(targetNode, { childList: true, subtree: true });
		}

		// Apply listeners initially
		applyImageListeners();

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			observer.disconnect();
			document.removeEventListener("keydown", handleKeyDown);
			const images = document.querySelectorAll(".custom-prose img");
			images.forEach((img, i) => {
				img.removeEventListener("click", handleClick(i));
			});
		};
	}, [htmlContent]);

	return (
		<PhotoProvider>
			<div
				itemProp="articleBody"
				className="text-foreground/90 custom-prose animate"
				dangerouslySetInnerHTML={{ __html: htmlContent }}
			></div>
			<PhotoSlider
				images={imageUrls.map((item) => ({ src: item, key: item }))}
				visible={visible}
				onClose={() => setVisible(false)}
				index={index}
				onIndexChange={setIndex}
			/>
		</PhotoProvider>
	);
};

export default CustomPhotoView;
