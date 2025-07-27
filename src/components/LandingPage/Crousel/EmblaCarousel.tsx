import React, { useCallback, useEffect, useRef } from "react";
import { EmblaCarouselType, EmblaEventType, EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { NextButton, PrevButton, usePrevNextButtons } from "./EmblaCarouselArrowButtons";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";
import Image from "next/image";
import { ICrousalEvent } from "@/types/event.type";
import { Calendar, Clock, Globe, MapPin, UserIcon } from "lucide-react";
import { formatTime } from "@/components/common/EventCard";
import { useRouter } from "next/navigation";
import Autoplay from "embla-carousel-autoplay";

const TWEEN_FACTOR_BASE = 0.08;

const numberWithinRange = (number: number, min: number, max: number): number => Math.min(Math.max(number, min), max);

type PropType = {
	slides: ICrousalEvent[];
	options?: EmblaOptionsType;
};

const autoplayOptions = {
	delay: 3000, // Autoplay delay in milliseconds
	stopOnInteraction: true, // Stop autoplay when user interacts
	stopOnMouseEnter: true, // Stop autoplay when mouse enters carousel
	rootNode: (emblaRoot: HTMLElement) => emblaRoot, // Root node to detect mouse enter/leave
};

const EmblaCarousel: React.FC<PropType> = (props) => {
	const { slides, options } = props;
	const [emblaRef, emblaApi] = useEmblaCarousel(options, [Autoplay(autoplayOptions)]);
	const tweenFactor = useRef(0);
	const tweenNodes = useRef<HTMLElement[]>([]);

	const router = useRouter();

	const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);

	const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

	const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
		tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
			return slideNode.querySelector(".embla__slide__number") as HTMLElement;
		});
	}, []);

	const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
		tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
	}, []);

	const tweenScale = useCallback((emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
		const engine = emblaApi.internalEngine();
		const scrollProgress = emblaApi.scrollProgress();
		const slidesInView = emblaApi.slidesInView();
		const isScrollEvent = eventName === "scroll";

		emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
			let diffToTarget = scrollSnap - scrollProgress;
			const slidesInSnap = engine.slideRegistry[snapIndex];

			slidesInSnap.forEach((slideIndex) => {
				if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

				if (engine.options.loop) {
					engine.slideLooper.loopPoints.forEach((loopItem) => {
						const target = loopItem.target();

						if (slideIndex === loopItem.index && target !== 0) {
							const sign = Math.sign(target);

							if (sign === -1) {
								diffToTarget = scrollSnap - (1 + scrollProgress);
							}
							if (sign === 1) {
								diffToTarget = scrollSnap + (1 - scrollProgress);
							}
						}
					});
				}

				const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
				const scale = numberWithinRange(tweenValue, 0, 1).toString();
				const tweenNode = tweenNodes.current[slideIndex];
				tweenNode.style.transform = `scale(${scale})`;
			});
		});
	}, []);

	useEffect(() => {
		if (!emblaApi) return;

		setTweenNodes(emblaApi);
		setTweenFactor(emblaApi);
		tweenScale(emblaApi);

		emblaApi
			.on("reInit", setTweenNodes)
			.on("reInit", setTweenFactor)
			.on("reInit", tweenScale)
			.on("scroll", tweenScale)
			.on("slideFocus", tweenScale);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [emblaApi, tweenScale]);

	return (
		<div className="embla">
			<div className="embla__viewport" ref={emblaRef}>
				<div className={`embla__container ${slides.length <= 1 ? "justify-center" : ""}`}>
					{slides.map((slide, index) => (
						<div className="embla__slide group" key={index}>
							<div
								onClick={() => (slide.id ? router.push("/event/detail/" + slide.id) : null)}
								className="embla__slide__number cursor-pointer relative"
							>
								<Image
									src={slide.images[0]}
									alt="slide"
									fill
									className="embla__slide__img object-cover rounded-3xl duration-200 transition-all group-hover:blur-[2px] group-hover:opacity-90"
								/>

								<div className="group-hover:block duration-200 transition-all hidden absolute -top-6 right-4">
									<span className="bg-white text-indigo-600 px-4 py-1 rounded-full text-sm font-medium">
										{slide.tags}
									</span>
								</div>
								<div className="group-hover:block group-hover:bg-gray-400 text-white px-4 group-hover:bg-opacity-15 w-full duration-200 transition-all hidden absolute bottom-0 rounded-b-3xl">
									<h1 className="truncate capitalize text-3xl font-bold">{slide.title}</h1>
									<div className="space-y-2 mb-3">
										<div className="flex-1 flex items-center gap-3">
											<Calendar className="w-5 h-5" />
											<span className="text-[12px] font-medium">{slide.date}</span>
										</div>
										{/* <div className="flex items-center gap-3">
											{slide?.isOnline ? (
												<Globe className="w-5 h-5" />
											) : (
												<MapPin className="w-5 h-5" />
											)}
											<span className="text-[12px] font-medium">{slide.location}</span>
										</div> */}
										{/* <div className='flex items-center gap-3'>
                                            <UserIcon className="w-5 h-5 text-[#CE8330]" />
                                            <span className="text-[12px] font-medium text-black">Ticket Left: {slide.ticketLeft}</span>
                                        </div> */}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{slides.length > 0 && (
				<div className="my-4 flex justify-center w-full">
					<div className="flex">
						<PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
						<div className="embla__dots">
							{scrollSnaps.map((_, index) => (
								<DotButton
									key={index}
									onClick={() => onDotButtonClick(index)}
									className={"embla__dot".concat(
										index === selectedIndex ? " embla__dot--selected" : "",
									)}
								/>
							))}
						</div>

						<NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
					</div>
				</div>
			)}
		</div>
	);
};

export default EmblaCarousel;
