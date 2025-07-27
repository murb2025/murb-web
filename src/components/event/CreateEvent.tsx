"use client";
import Categories from "@/components/event/Categories";
import EventListing from "@/components/event/EventListing";
import PublishEvent from "@/components/event/PublishEvent";
import TrainerListing from "@/components/event/TrainerListing";
import VenueListing from "@/components/event/VenueListing";
import WorkShopListing from "@/components/event/WorkshopListing";
import React, { useEffect, useState } from "react";
import TournamentListing from "@/components/event/TournamentListing";
import CertificationListing from "@/components/event/CertificationListing";
import { useSession } from "next-auth/react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/hooks";
import { IEvent } from "@/types/event.type";
import { setEvent } from "@/context/slices/event.slice";
import { Button } from "../ui/button";
import { IoIosArrowBack } from "react-icons/io";

const CreateEvent = () => {
	const { data: session } = useSession();
	const [currentPage, setCurrentPage] = useState(0);
	const [pageType, setPageType] = useState<"CATEGORIES" | "SPORTS" | "LISTING" | "PUBLISH">("CATEGORIES");
	const [selectedCategory, setSelectedCategory] = useState("");
	const { event, dispatch } = useStore();
	const searchParams = useSearchParams();
	const isPublish = searchParams.get("isPublish");
	const router = useRouter();
	useEffect(() => {
		if (session?.user.role === "BUYER") {
			notFound();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session]);

	useEffect(() => {
		if (isPublish) {
			setPageType("PUBLISH");
		}
	}, [isPublish]);

	const updateEvent = (newEventData: Partial<IEvent>) => {
		dispatch(setEvent({ ...event, ...newEventData }));
	};

	return (
		<div className="min-h-screen w-full pt-24">
			<Button
				variant="ghost"
				className="hover:bg-transparent font-regular align-left w-fit mx-4 md:ml-40 hover:scale-95 transition-all ease duration-300"
				onClick={() => {
					if (pageType === "CATEGORIES") {
						router.back();
						return;
					} else if (pageType === "SPORTS") {
						setPageType("CATEGORIES");
						return;
					} else if (pageType === "LISTING") {
						if (currentPage === 3) {
							setPageType("PUBLISH");
						} else if (currentPage === 0) {
							setPageType("SPORTS");
						} else {
							setCurrentPage((prev: any) => prev - 1);
						}
						return;
					} else if (pageType === "PUBLISH") {
						setPageType("LISTING");
						return;
					}
				}}
			>
				<IoIosArrowBack className="w-6 h-6 font-normal text-[#1F1F1F]" />
				<p className="text-lg font-normal">Back</p>
			</Button>
			{pageType === "CATEGORIES" || pageType === "SPORTS" ? (
				<Categories
					setPageType={setPageType}
					pageType={pageType}
					handleCategories={setSelectedCategory}
					event={event}
					updateEvent={updateEvent}
				/>
			) : pageType === "LISTING" ? (
				selectedCategory === "Venue" ? (
					<VenueListing setPageType={setPageType} currentPage={currentPage} setCurrentPage={setCurrentPage} />
				) : selectedCategory === "Trainer" ? (
					<TrainerListing
						setPageType={setPageType}
						currentPage={currentPage}
						setCurrentPage={setCurrentPage}
					/>
				) : selectedCategory === "Classes / Sessions" ? (
					<WorkShopListing
						setPageType={setPageType}
						currentPage={currentPage}
						setCurrentPage={setCurrentPage}
					/>
				) : selectedCategory === "Tournaments / Competitions" ? (
					<TournamentListing
						setPageType={setPageType}
						currentPage={currentPage}
						setCurrentPage={setCurrentPage}
					/>
				) : selectedCategory === "Certifications / Camps / Workshops" ? (
					<CertificationListing
						setPageType={setPageType}
						currentPage={currentPage}
						setCurrentPage={setCurrentPage}
					/>
				) : (
					<EventListing setPageType={setPageType} currentPage={currentPage} setCurrentPage={setCurrentPage} />
				)
			) : (
				<div className="sm:px-8 md:px-20">
					<PublishEvent event={event} />
				</div>
			)}
		</div>
	);
};

export default CreateEvent;
