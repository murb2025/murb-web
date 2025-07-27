"use client";
import { trpc } from "@/app/provider";
import React from "react";
import EmblaCarousel from "./Crousel/EmblaCarousel";
import { ICrousalEvent } from "@/types/event.type";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonCarousel = () => {
	const skeletonSlides: ICrousalEvent[] = Array(3).fill({
		title: "",
		images: [""],
		isOnline: false,
		time: "",
		date: "",
		ticketLeft: "0",
		location: "",
		tags: "",
	});

	return (
		<div className="relative overflow-hidden">
			<div className="embla">
				<div className="embla__viewport">
					<div className="embla__container flex gap-8 px-4">
						{skeletonSlides.map((_, index) => (
							<div className="embla__slide flex-[0_0_calc(100%-2rem)] min-w-0 px-2" key={index}>
								<div className="embla__slide__number relative">
									<Skeleton className="w-full h-[400px] rounded-3xl [animation:none]" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

const Carousel = () => {
	const { data: featuredData, isLoading: isFeaturedDataLoading } = trpc.featured.getFeaturedEvents.useQuery({
		limit: 10,
		offset: 0,
	});

	if (isFeaturedDataLoading) {
		return <SkeletonCarousel />;
	}

	const carouselImages: ICrousalEvent[] = (featuredData || []).map(event => ({
		...event,
		ticketLeft: event.ticketLeft.toString(),
		tags: event.tags || ""
	}));

	return (
		<div className="relative overflow-hidden">
			<EmblaCarousel slides={carouselImages} options={{ loop: true }} />
		</div>
	);
};

export default Carousel;
