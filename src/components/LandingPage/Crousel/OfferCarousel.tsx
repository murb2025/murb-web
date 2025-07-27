"use client";
import React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import { NextButton, PrevButton, usePrevNextButtons } from "./EmblaCarouselArrowButtons";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";

interface OfferItem {
	title: string;
	description: string;
	image: string;
}

interface PropType {
	offers: OfferItem[];
}

const OPTIONS: EmblaOptionsType = {
	loop: true,
	dragFree: true,
	skipSnaps: false,
	align: "center" as const,
};

const autoplayOptions = {
	delay: 4000,
	stopOnInteraction: true,
	stopOnMouseEnter: true,
	rootNode: (emblaRoot: HTMLElement) => emblaRoot,
};

const OfferCarousel: React.FC<PropType> = ({ offers }) => {
	const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS, [Autoplay(autoplayOptions)]);

	const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);
	const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

	return (
		<div className="relative">
			<div className="overflow-hidden" ref={emblaRef}>
				<div className="flex">
					{offers.map((offer, index) => (
						<div key={index} className="flex-[0_0_100%] min-w-0 pl-4 relative">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="w-full flex relative h-96 justify-center items-center">
									<Image src={offer.image} alt={offer.title} fill className="object-contain" />
								</div>
								<div className="text-center flex justify-center items-center flex-col">
									<h3 className="mb-2 text-2xl font-bold">{offer.title}</h3>
									<p className="text-lg text-gray-700">{offer.description}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className=" top-1/2 left-0 right-0 flex justify-between transform -translate-y-1/2 px-4"></div>

			<div className="flex justify-center items-center gap-2 mt-4">
				<PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
				{scrollSnaps.map((_, index) => (
					<DotButton
						key={index}
						onClick={() => onDotButtonClick(index)}
						className={`w-2 h-2 rounded-full transition-colors ${
							index === selectedIndex ? "bg-gray-800" : "bg-gray-300"
						}`}
					/>
				))}
				<NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
			</div>
		</div>
	);
};

export default OfferCarousel;
