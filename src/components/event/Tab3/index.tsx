"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Button, Input, Label } from "@/components/ui";
import Typography from "@/components/Typography";
import { CiSquareMinus } from "react-icons/ci";
import { useStore } from "@/hooks";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { SolarAddSquareLinear } from "@/assets/icons/addmore";
import UploadImgGetUrl from "@/components/common/UploadImgGetUrl";
import { IBookingDetail, IEvent } from "@/types/event.type";
import SelectCurrency from "./SelectCurrency";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { eventSpecificTypeEnum } from "@/constants/event.constant";

interface IBookingTab {
	setPageType: React.Dispatch<React.SetStateAction<"CATEGORIES" | "SPORTS" | "LISTING" | "PUBLISH">>;
	updateEvent: (event: IEvent) => void;
	event: IEvent;
}

export default function BookingTab({ setPageType, updateEvent, event }: IBookingTab) {
	// eslint-disable-next-line
	const [loading, setLoading] = useState(false);

	// Initialize state with existing bookingDetails or empty array
	const [bookingDetails, setBookingDetails] = useState<IBookingDetail[]>(event.bookingDetails || []);

	const [termsAndConditions, setTermsAndConditions] = useState(event?.termsAndConditions || "");
	const [seoTags, setSeoTags] = useState<string[]>(event?.seoTags || []);
	const [tagInput, setTagInput] = useState("");
	const [uploadedUrl1, setUploadedUrl1] = useState(event?.images[0] || "");
	const [uploadedUrl2, setUploadedUrl2] = useState(event?.images[1] || "");
	const [uploadedUrl3, setUploadedUrl3] = useState(event?.images[2] || "");

	// Get booking details by type
	const getSingleBooking = useMemo(() => bookingDetails.find((detail) => detail.type === "SINGLE"), [bookingDetails]);
	const getGroupBooking = useMemo(() => bookingDetails.find((detail) => detail.type === "GROUP"), [bookingDetails]);
	const getPackageBookings = useMemo(
		() => bookingDetails.filter((detail) => detail.type === "PACKAGE"),
		[bookingDetails],
	);
	const getSubscriptionBookings = useMemo(
		() => bookingDetails.filter((detail) => detail.type === "SUBSCRIPTION"),
		[bookingDetails],
	);

	// Update subscription details
	const updateSubscriptionDetail = (
		subscriptionIndex: number,
		field: keyof IBookingDetail,
		value: string | number,
	) => {
		setBookingDetails((prev) => {
			const newDetails = [...prev];
			const subscriptionDetails = newDetails.filter((detail) => detail.type === "SUBSCRIPTION");

			if (subscriptionIndex < subscriptionDetails.length) {
				const targetIndex = newDetails.findIndex(
					(detail) => detail.type === "SUBSCRIPTION" && detail === subscriptionDetails[subscriptionIndex],
				);

				if (targetIndex !== -1) {
					newDetails[targetIndex] = {
						...newDetails[targetIndex],
						[field]: field === "amount" || field === "months" ? Number(value) || 0 : value,
					};
				}
			}

			return newDetails;
		});
	};

	// Add new subscription
	const addSubscriptionSlot = () => {
		const currentCurrency = bookingDetails.length > 0 ? bookingDetails[0].currency : "INR";
		const currentCurrencyIcon = bookingDetails.length > 0 ? bookingDetails[0].currencyIcon : "₹";

		const newSubscription: IBookingDetail = {
			type: "SUBSCRIPTION",
			amount: 0,
			months: 1,
			currency: currentCurrency,
			currencyIcon: currentCurrencyIcon,
			description: "",
			id: undefined,
			membersCount: 1, // Default to 1 for subscription since it's per person
		};
		setBookingDetails((prev) => [...prev, newSubscription]);
	};

	// Remove subscription
	const removeSubscriptionSlot = (subscriptionIndex: number) => {
		setBookingDetails((prev) => {
			const subscriptionDetails = prev.filter((detail) => detail.type === "SUBSCRIPTION");
			if (subscriptionIndex < subscriptionDetails.length) {
				const targetIndex = prev.findIndex(
					(detail) => detail.type === "SUBSCRIPTION" && detail === subscriptionDetails[subscriptionIndex],
				);

				if (targetIndex !== -1) {
					const newDetails = [...prev];
					newDetails.splice(targetIndex, 1);
					return newDetails;
				}
			}
			return prev;
		});
	};

	// Use type-based update function
	const updateBookingDetailByType = (
		type: "SINGLE" | "GROUP",
		field: keyof IBookingDetail,
		value: string | number,
	) => {
		setBookingDetails((prev) => {
			return prev.map((detail) => {
				if (detail.type === type) {
					return {
						...detail,
						[field]: field === "amount" || field === "membersCount" ? Number(value) || 0 : value,
					};
				}
				return detail;
			});
		});
	};

	// Update package by index
	const updatePackageDetail = (packageIndex: number, field: keyof IBookingDetail, value: string | number) => {
		setBookingDetails((prev) => {
			const newDetails = [...prev];
			const packageDetails = newDetails.filter((detail) => detail.type === "PACKAGE");

			if (packageIndex < packageDetails.length) {
				const targetIndex = newDetails.findIndex(
					(detail) => detail.type === "PACKAGE" && detail === packageDetails[packageIndex],
				);

				if (targetIndex !== -1) {
					newDetails[targetIndex] = {
						...newDetails[targetIndex],
						[field]: field === "amount" || field === "membersCount" ? Number(value) || 0 : value,
					};
				}
			}

			return newDetails;
		});
	};

	const addPackageSlot = () => {
		// Get the current currency from any existing booking detail
		const currentCurrency = bookingDetails.length > 0 ? bookingDetails[0].currency : "INR";
		const currentCurrencyIcon = bookingDetails.length > 0 ? bookingDetails[0].currencyIcon : "₹";

		const newPackage: IBookingDetail = {
			type: "PACKAGE",
			title: "",
			amount: 0,
			currency: currentCurrency,
			currencyIcon: currentCurrencyIcon,
			description: "",
			membersCount: 1,
			id: undefined,
		};
		setBookingDetails((prev) => [...prev, newPackage]);
	};

	const removePackageSlot = (packageIndex: number) => {
		setBookingDetails((prev) => {
			const packageDetails = prev.filter((detail) => detail.type === "PACKAGE");
			if (packageIndex < packageDetails.length) {
				const targetIndex = prev.findIndex(
					(detail) => detail.type === "PACKAGE" && detail === packageDetails[packageIndex],
				);

				if (targetIndex !== -1) {
					const newDetails = [...prev];
					newDetails.splice(targetIndex, 1);
					return newDetails;
				}
			}
			return prev;
		});
	};

	const isFormValid = useMemo(() => {
		if (event.isMonthlySubscription) {
			// Validation for subscription
			const monthlySubscription = bookingDetails?.filter((detail) => detail.type === "SUBSCRIPTION");
			const isAmountValid = monthlySubscription?.map((detail) => detail.amount).every((amount) => amount > 0);
			const isMonthsValid = monthlySubscription
				?.map((detail) => detail.months)
				.every((months) => (months ?? 0) > 0);
			const isUploadedUrl1Valid = uploadedUrl1 !== "";

			if (!isAmountValid) {
				return {
					message: "Subscription amount is required",
					valid: false,
				};
			} else if (!isMonthsValid) {
				return {
					message: "Subscription months are required",
					valid: false,
				};
			} else if (!isUploadedUrl1Valid) {
				return {
					message: "Banner Image Landscape is required",
					valid: false,
				};
			}

			return {
				message: "All fields are valid",
				valid: true,
			};
		} else {
			// Regular validation logic for non-subscription events
			// Consider only details with amount > 0
			const finalBookingDetails = bookingDetails.filter((detail) => detail.amount > 0);

			// Check if at least one package has been added
			const isPackageAdded = finalBookingDetails.length > 0;

			if (!isPackageAdded) {
				return {
					message: "Please add at least one package",
					valid: false,
				};
			}

			// Validate each field
			const isAmountValid = finalBookingDetails.every((detail) => detail.amount > 0);
			const isCurrencyValid = finalBookingDetails.every((detail) => detail.currency !== "");
			const isMembersCountValid = finalBookingDetails.every((detail) => detail.membersCount > 0);
			const isUploadedUrl1Valid = uploadedUrl1 !== "";

			if (!isAmountValid) {
				return {
					message: "Amount is required",
					valid: false,
				};
			} else if (!isCurrencyValid) {
				return {
					message: "Currency is required",
					valid: false,
				};
			} else if (!isMembersCountValid) {
				return {
					message: "Members count is required",
					valid: false,
				};
			} else if (!isUploadedUrl1Valid) {
				return {
					message: "Banner Image Landscape is required",
					valid: false,
				};
			}

			return {
				message: "All fields are valid",
				valid: true,
			};
		}
	}, [bookingDetails, uploadedUrl1, event.isMonthlySubscription]);

	const onFileUpload1 = (url: string) => {
		setUploadedUrl1(url);
	};

	const onFileUpload2 = (url: string) => {
		setUploadedUrl2(url);
	};

	const onFileUpload3 = (url: string) => {
		setUploadedUrl3(url);
	};

	// Ensure both SINGLE and GROUP always exist in bookingDetails for non-subscription events
	useEffect(() => {
		let newDetails: IBookingDetail[] = [];
		const defaultCurrency = bookingDetails.length > 0 ? bookingDetails[0].currency : "INR";
		const defaultCurrencyIcon = bookingDetails.length > 0 ? bookingDetails[0].currencyIcon : "₹";

		if (event.isMonthlySubscription) {
			// For monthly subscription, only allow SUBSCRIPTION type
			const hasSubscription = bookingDetails.some((detail) => detail.type === "SUBSCRIPTION");

			if (hasSubscription) {
				// Keep only the subscription type bookings
				newDetails = bookingDetails.filter((detail) => detail.type === "SUBSCRIPTION");
			} else {
				// Add a new subscription type if none exists
				const subscriptionDetail: IBookingDetail = {
					type: "SUBSCRIPTION",
					amount: 0,
					months: 1,
					currency: defaultCurrency,
					currencyIcon: defaultCurrencyIcon,
					description: "",
					id: undefined,
					membersCount: 0,
				};
				newDetails = [subscriptionDetail];
			}
		} else {
			// For non-subscription, only allow SINGLE and GROUP types
			const hasSingle = bookingDetails.some((detail) => detail.type === "SINGLE");
			const hasGroup = bookingDetails.some((detail) => detail.type === "GROUP");

			// Keep only non-subscription types
			newDetails = bookingDetails.filter(
				(detail) => detail.type === "SINGLE" || detail.type === "GROUP" || detail.type === "PACKAGE",
			);

			// Add SINGLE type if missing
			if (!hasSingle) {
				const singleDetail: IBookingDetail = {
					type: "SINGLE",
					amount: 0,
					id: undefined,
					membersCount: 1,
					currency: defaultCurrency,
					currencyIcon: defaultCurrencyIcon,
					description: "",
				};
				newDetails.push(singleDetail);
			}

			// Add GROUP type if missing
			if (!hasGroup) {
				const groupDetail: IBookingDetail = {
					type: "GROUP",
					id: undefined,
					membersCount: 0,
					amount: 0,
					currency: defaultCurrency,
					currencyIcon: defaultCurrencyIcon,
					description: "",
				};
				newDetails.push(groupDetail);
			}
		}

		// Only update if the details have actually changed
		if (JSON.stringify(newDetails) !== JSON.stringify(bookingDetails)) {
			setBookingDetails(newDetails);
		}
	}, [bookingDetails, event.isMonthlySubscription]);

	return (
		<>
			<div className="bg-[#F6EFE8] rounded-3xl px-4 sm:px-8 md:px-12 py-6 sm:py-8 max-w-4xl mx-auto border border-[#D5AA72]">
				<div>
					{event.isMonthlySubscription ? (
						// Subscription Details Section
						<div className="space-y-[2px]">
							<h3 className="text-[18px] sm:text-[20px] font-medium text-[#1F1F1F]">
								Subscription Details
							</h3>
							{getSubscriptionBookings.map((detail, index) => (
								<div key={index} className="space-y-4 bg-transparent rounded-md relative mb-6">
									<div
										className="absolute cursor-pointer top-8 right-0 sm:-right-10 text-gray-500 hover:text-red-500 hover:bg-transparent hover:scale-105 transition-all ease duration-300"
										onClick={() => removeSubscriptionSlot(index)}
									>
										<CiSquareMinus className="h-9 w-9 text-[#C3996B]" />
									</div>
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
										<div className="space-y-2">
											<Label
												htmlFor={`subscriptionAmount-${index}`}
												className="text-[16px] sm:text-[20px] font-normal text-[#1F1F1F]"
											>
												Amount
											</Label>
											<Input
												id={`subscriptionAmount-${index}`}
												type="number"
												className="bg-white focus:outline-none h-[40px] sm:h-[48px] focus:border-[#D5AA72] text-[16px] sm:text-[20px] text-[#8E7777]"
												value={detail.amount || ""}
												onChange={(e) =>
													updateSubscriptionDetail(
														index,
														"amount",
														Math.max(0, Number(e.target.value)),
													)
												}
											/>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor={`subscriptionMonths-${index}`}
												className="text-[16px] sm:text-[20px] font-normal text-[#1F1F1F]"
											>
												Months
											</Label>
											<Input
												id={`subscriptionMonths-${index}`}
												type="number"
												className="bg-white focus:outline-none h-[40px] sm:h-[48px] focus:border-[#D5AA72] text-[16px] sm:text-[20px] text-[#8E7777]"
												value={detail.months || ""}
												onChange={(e) =>
													updateSubscriptionDetail(
														index,
														"months",
														Math.max(1, Number(e.target.value)),
													)
												}
											/>
										</div>
										<div className="space-y-2">
											<Label
												htmlFor={`subscriptionCurrency-${index}`}
												className="text-[16px] sm:text-[20px] font-normal text-[#1F1F1F]"
											>
												Currency
											</Label>
											<SelectCurrency
												value={detail.currency || ""}
												onChange={(currency, icon) => {
													updateSubscriptionDetail(index, "currency", currency);
													updateSubscriptionDetail(index, "currencyIcon", icon);
												}}
											/>
										</div>
									</div>
									<div className="space-y-2">
										<div className="relative mt-4">
											<label
												htmlFor={`subscriptionDescription-${index}`}
												className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1F1F1F] text-[16px] sm:text-[20px] font-light transition-all duration-200 ${
													detail.description ? "hidden" : "block"
												}`}
											>
												Description{" "}
												<span className="font-light text-[14px] sm:text-[16px]">
													(Optional)
												</span>
											</label>

											<Input
												id={`subscriptionDescription-${index}`}
												placeholder=""
												className="bg-white h-[40px] sm:h-[48px] placeholder:text-transparent focus:placeholder:text-transparent focus:outline-none focus:border-[#D5AA72] text-[16px] sm:text-[20px] text-[#8E7777] w-full"
												value={detail.description || ""}
												onFocus={(e) => {
													if (e?.target?.previousSibling) {
														(e.target.previousSibling as HTMLElement).style.display =
															"none";
													}
												}}
												onBlur={(e) => {
													if ((e.target as HTMLInputElement).value.length === 0) {
														if (e?.target?.previousSibling) {
															(e.target.previousSibling as HTMLElement).style.display =
																"block";
														}
													}
												}}
												onChange={(e) =>
													updateSubscriptionDetail(index, "description", e.target.value)
												}
											/>
										</div>
									</div>
								</div>
							))}
							<div
								className="mt-2 pt-2 flex justify-center items-center ml-[-2px] text-[#696969] text-left p-0 hover:bg-transparent w-fit cursor-pointer"
								onClick={addSubscriptionSlot}
							>
								<SolarAddSquareLinear className="hover:scale-110 transition-all ease duration-300 h-7 sm:h-9 w-7 sm:w-9" />
								<p className="text-[#696969] my-auto ml-2 text-[16px] sm:text-[18px] font-medium">
									Add subscription
								</p>
							</div>
						</div>
					) : (
						<>
							{/* Per person section */}
							<div className="space-y-[2px]">
								<h3 className="text-[18px] sm:text-[20px] font-medium text-[#1F1F1F]">
									Per person{" "}
									<span className="text-[14px] sm:text-[16px] text-[#8E7777] font-light">
										(Optional)
									</span>
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label
											htmlFor="perPersonAmount"
											className="text-[16px] sm:text-[20px] font-normal text-[#1F1F1F]"
										>
											Amount
										</Label>
										<Input
											id="perPersonAmount"
											type="number"
											className="bg-white focus:outline-none h-[40px] sm:h-[48px] focus:border-[#D5AA72] text-[16px] sm:text-[20px] text-[#8E7777]"
											value={getSingleBooking?.amount || ""}
											onChange={(e) =>
												updateBookingDetailByType(
													"SINGLE",
													"amount",
													Math.max(0, Number(e.target.value)),
												)
											}
										/>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="perPersonCurrency"
											className="text-[16px] sm:text-[20px] font-normal text-[#1F1F1F]"
										>
											Currency
										</Label>
										<SelectCurrency
											value={getSingleBooking?.currency || ""}
											onChange={(currency, icon) => {
												updateBookingDetailByType("SINGLE", "currency", currency);
												updateBookingDetailByType("SINGLE", "currencyIcon", icon);
											}}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<div className="relative mt-4">
										<label
											htmlFor="perPersonDescription"
											className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1F1F1F] text-[16px] sm:text-[20px] font-light transition-all duration-200 ${
												getSingleBooking?.description ? "hidden" : "block"
											}`}
										>
											Description{" "}
											<span className="font-light text-[14px] sm:text-[16px]">(Optional)</span>
										</label>

										<Input
											id="perPersonDescription"
											placeholder=""
											className="bg-white h-[40px] sm:h-[48px] placeholder:text-transparent focus:placeholder:text-transparent focus:outline-none focus:border-[#D5AA72] text-[16px] sm:text-[20px] text-[#8E7777] w-full"
											value={getSingleBooking?.description || ""}
											onFocus={(e) => {
												if (e?.target?.previousSibling) {
													(e.target.previousSibling as HTMLElement).style.display = "none";
												}
											}}
											onBlur={(e) => {
												if ((e.target as HTMLInputElement).value.length === 0) {
													if (e?.target?.previousSibling) {
														(e.target.previousSibling as HTMLElement).style.display =
															"block";
													}
												}
											}}
											onChange={(e) =>
												updateBookingDetailByType("SINGLE", "description", e.target.value)
											}
										/>
									</div>
								</div>
							</div>

							{/* Group section */}
							<div className="space-y-0 mt-6">
								<h3 className="text-[18px] sm:text-[20px] font-medium text-[#1F1F1F]">
									{event.eventSpecificType.includes(eventSpecificTypeEnum.TOURNAMENTS_COMPETITIONS)
										? "Team "
										: "Group "}
									<span className="text-[14px] sm:text-[16px] text-[#8E7777] font-light">
										(Optional)
									</span>
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label
											htmlFor="groupMembers"
											className="text-[16px] sm:text-[20px] font-normal text-[#1F1F1F]"
										>
											Number of Members
										</Label>
										<Input
											id="groupMembers"
											type="number"
											className="bg-white focus:outline-none h-[40px] sm:h-[48px] focus:border-[#D5AA72] text-[16px] sm:text-[20px] text-[#8E7777]"
											value={getGroupBooking?.membersCount || ""}
											onChange={(e) =>
												updateBookingDetailByType(
													"GROUP",
													"membersCount",
													Math.max(0, Number(e.target.value)),
												)
											}
										/>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="groupAmount"
											className="text-[16px] sm:text-[20px] font-normal text-[#1F1F1F]"
										>
											Amount
										</Label>
										<Input
											id="groupAmount"
											type="number"
											className="bg-white focus:outline-none h-[40px] sm:h-[48px] focus:border-[#D5AA72] text-[16px] sm:text-[20px] text-[#8E7777]"
											value={getGroupBooking?.amount || ""}
											onChange={(e) =>
												updateBookingDetailByType(
													"GROUP",
													"amount",
													Math.max(0, Number(e.target.value)),
												)
											}
										/>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="groupCurrency"
											className="text-[16px] sm:text-[20px] font-normal text-[#1F1F1F]"
										>
											Currency
										</Label>
										<SelectCurrency
											value={getGroupBooking?.currency || ""}
											onChange={(currency, icon) => {
												updateBookingDetailByType("GROUP", "currency", currency);
												updateBookingDetailByType("GROUP", "currencyIcon", icon);
											}}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<div className="relative mt-4">
										<label
											htmlFor="groupDescription"
											className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1F1F1F] text-[16px] sm:text-[20px] font-light transition-all duration-200 ${
												getGroupBooking?.description ? "hidden" : "block"
											}`}
										>
											Description{" "}
											<span className="font-light text-[14px] sm:text-[16px]">(Optional)</span>
										</label>

										<Input
											id="groupDescription"
											placeholder=""
											className="bg-white h-[40px] sm:h-[48px] placeholder:text-transparent focus:placeholder:text-transparent focus:outline-none focus:border-[#D5AA72] text-[16px] sm:text-[20px] text-[#8E7777] w-full"
											value={getGroupBooking?.description || ""}
											onFocus={(e) => {
												if (e?.target?.previousSibling) {
													(e.target.previousSibling as HTMLElement).classList.add("hidden");
												}
											}}
											onBlur={(e) => {
												if ((e.target as HTMLInputElement).value.length === 0) {
													if (e?.target?.previousSibling) {
														(e.target.previousSibling as HTMLElement).style.display =
															"block";
													}
												}
											}}
											onChange={(e) =>
												updateBookingDetailByType("GROUP", "description", e.target.value)
											}
										/>
									</div>
								</div>
							</div>

							{/* List Packages section */}
							<div className="space-y-0 mt-6">
								<h3 className="text-[18px] sm:text-[20px] font-medium text-[#1F1F1F]">
									List Packages{" "}
									<span className="text-[14px] sm:text-[16px] text-[#8E7777] font-light">
										(Optional)
									</span>
								</h3>
								{getPackageBookings.map((detail, index) => (
									<div key={index} className="space-y-4 bg-transparent rounded-md relative">
										<div
											className="absolute cursor-pointer top-8 right-0 sm:-right-10 text-gray-500 hover:text-red-500 hover:bg-transparent hover:scale-105 transition-all ease duration-300"
											onClick={() => removePackageSlot(index)}
										>
											<CiSquareMinus className="h-9 w-9 text-[#C3996B]" />
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label
													htmlFor={`packageMembers-${index}`}
													className="text-[16px] sm:text-[18px] font-normal text-[#1F1F1F]"
												>
													Number of Members
												</Label>
												<Input
													id={`packageMembers-${index}`}
													type="number"
													className="bg-white focus:outline-none h-[40px] sm:h-[48px] focus:border-[#D5AA72] text-[16px] sm:text-[20px] text-[#8E7777]"
													value={detail.membersCount || ""}
													onChange={(e) =>
														updatePackageDetail(
															index,
															"membersCount",
															Math.max(0, Number(e.target.value)),
														)
													}
												/>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor={`packageTitle-${index}`}
													className="text-[16px] sm:text-[18px] font-normal text-[#1F1F1F]"
												>
													Title
												</Label>
												<Input
													id={`packageTitle-${index}`}
													className="bg-white focus:outline-none h-[40px] sm:h-[48px] focus:border-[#D5AA72] text-[16px] sm:text-[20px] text-[#8E7777]"
													value={detail.title || ""}
													onChange={(e) =>
														updatePackageDetail(index, "title", e.target.value)
													}
												/>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor={`packageAmount-${index}`}
													className="text-[16px] sm:text-[18px] font-normal text-[#1F1F1F]"
												>
													Amount
												</Label>
												<Input
													id={`packageAmount-${index}`}
													type="number"
													className="bg-white focus:outline-none h-[40px] sm:h-[48px] focus:border-[#D5AA72] text-[16px] sm:text-[20px] text-[#8E7777]"
													value={detail.amount || ""}
													onChange={(e) =>
														updatePackageDetail(
															index,
															"amount",
															Math.max(0, Number(e.target.value)),
														)
													}
												/>
											</div>
											<div className="space-y-2">
												<Label
													htmlFor={`packageCurrency-${index}`}
													className="text-[16px] sm:text-[18px] font-normal text-[#1F1F1F]"
												>
													Currency
												</Label>
												<SelectCurrency
													value={detail?.currency || ""}
													onChange={(currency, icon) => {
														updatePackageDetail(index, "currency", currency);
														updatePackageDetail(index, "currencyIcon", icon);
													}}
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Input
												id={`packageDescription-${index}`}
												placeholder="Description"
												className="bg-white mt-2 placeholder:text-[#1F1F1F] h-[40px] sm:h-[48px] placeholder:text-[16px] sm:text-[18px] text-[16px] placeholder:font-light focus:outline-none focus:border-[#D5AA72]"
												value={detail.description || ""}
												onChange={(e) =>
													updatePackageDetail(index, "description", e.target.value)
												}
											/>
										</div>
									</div>
								))}

								<div
									className="mt-2 pt-2 flex justify-center items-center ml-[-2px] text-[#696969] text-left p-0 hover:bg-transparent w-fit cursor-pointer"
									onClick={addPackageSlot}
								>
									<SolarAddSquareLinear className="hover:scale-110 transition-all ease duration-300 h-7 sm:h-9 w-7 sm:w-9" />
									<p className="text-[#696969] my-auto ml-2 text-[16px] sm:text-[18px] font-medium">
										Add slot
									</p>
								</div>
							</div>
						</>
					)}

					{/* Upload Image section */}
					<div className="space-y-0 mt-6">
						<h3 className="text-[16px] sm:text-lg font-semibold text-gray-700 mb-3">Upload Image</h3>
						<div className="flex flex-col md:flex-row gap-4">
							<div className="w-full md:w-[60%]">
								<h3 className="text-[16px] sm:text-lg font-semibold text-gray-700 mb-3">
									Banner Image Landscape
								</h3>
								<div className="w-full">
									<UploadImgGetUrl
										onFileUpload={onFileUpload1}
										type="landscape"
										initialImageUrl={event.images.length >= 1 ? event.images[0] : ""}
									/>
								</div>
							</div>
							<div className="w-full md:w-[40%]">
								<h3 className="text-[16px] sm:text-lg font-semibold text-gray-700 mb-3">
									Banner Image Portrait (optional)
								</h3>
								<div className="w-full">
									<UploadImgGetUrl
										type="portrait"
										onFileUpload={onFileUpload2}
										initialImageUrl={event.images.length >= 2 ? event.images[1] : ""}
									/>
								</div>
							</div>
						</div>
						<div className="flex flex-col items-left">
							<ul className="mt-2 text-[10px] sm:text-[12px] text-[#655F5F]">
								<Typography className="text-[#655F5F] text-[10px] sm:text-[12px]">
									Please make sure that
								</Typography>
								<li>1. Landscape Banner Ratio Must be 16:9</li>
								<li>2. Portrait Banner ratio must be 4:5</li>
								<li>3. Upload jpeg, PNG, PSF or JPG format only</li>
								<li>4. Image should be less than 2 MB</li>
							</ul>
						</div>
					</div>

					<div className="space-y-0 mt-6">
						<h3 className="text-[16px] sm:text-lg font-semibold text-gray-700 mb-3">
							Sitting Map (optional)
						</h3>
						<div className="flex flex-col md:flex-row w-full">
							<div className="w-full md:w-[60%]">
								<UploadImgGetUrl
									onFileUpload={onFileUpload3}
									type="landscape"
									initialImageUrl={event.images.length >= 3 ? event.images[2] : ""}
								/>
							</div>
							<div className="flex flex-col items-left w-full md:w-[40%] md:ml-6 mt-4 md:mt-10">
								<ul className="mt-2 text-[10px] sm:text-[12px] text-[#655F5F]">
									<Typography className="text-[#655F5F] text-[10px] sm:text-[12px]">
										Please make sure that
									</Typography>
									<li>1. Upload Jpeg, Png, Pdf or Jpg format only.</li>
									<li>2. Image should be less than 2 MB.</li>
								</ul>
							</div>
						</div>
					</div>

					<div className="space-y-2 mt-6">
						<Label htmlFor="tags" className="text-[16px] sm:text-[18px] font-normal text-[#1F1F1F]">
							Tags (Optional)
						</Label>
						<div className="space-y-2">
							<Input
								id="tags"
								type="text"
								placeholder="Type a tag and press Enter or comma to add"
								className="bg-white focus:outline-none h-[40px] sm:h-[48px] focus:border-[#D5AA72] text-[16px] sm:text-[20px] text-[#8E7777]"
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === ",") {
										e.preventDefault();
										const newTag = tagInput.trim();
										if (newTag && !seoTags.includes(newTag)) {
											setSeoTags([...seoTags, newTag]);
											setTagInput("");
										}
									} else if (e.key === "Backspace" && tagInput === "" && seoTags.length > 0) {
										// Remove the last tag when backspace is pressed on empty input
										setSeoTags(seoTags.slice(0, -1));
									}
								}}
								onPaste={(e) => {
									e.preventDefault();
									const pastedText = e.clipboardData.getData("text");
									const tags = pastedText
										.split(/[,\n]/)
										.map((tag) => tag.trim())
										.filter((tag) => tag && !seoTags.includes(tag));
									if (tags.length > 0) {
										setSeoTags([...seoTags, ...tags]);
									}
								}}
							/>
							<div className="flex flex-wrap gap-2">
								{seoTags.map((tag, index) => (
									<div
										key={index}
										className="flex items-center gap-1 px-3 py-1 bg-[#F6EFE8] border border-[#D5AA72] rounded-full"
									>
										<span className="text-[14px] text-[#1F1F1F]">{tag}</span>
										<button
											onClick={() => {
												setSeoTags(seoTags.filter((_, i) => i !== index));
											}}
											className="text-[#8E7777] hover:text-[#1F1F1F] transition-colors"
										>
											×
										</button>
									</div>
								))}
							</div>
						</div>
						<p className="text-[12px] text-[#8E7777] mt-1">
							Add relevant tags to help people find your event
						</p>
					</div>

					<div className="space-y-2 mt-6">
						<Label
							htmlFor="termsAndConditions"
							className="text-[16px] sm:text-[18px] font-normal text-[#1F1F1F]"
						>
							Terms & Conditions (Optional)
						</Label>
						<Input
							id="termsAndConditions"
							type="text"
							className="bg-white focus:outline-none h-[40px] sm:h-[48px] focus:border-[#D5AA72] text-[16px] sm:text-[20px] text-[#8E7777]"
							value={termsAndConditions}
							onChange={(e) => setTermsAndConditions(e.target.value)}
						/>
					</div>
				</div>
			</div>
			<div className="flex justify-center my-4 sm:my-6">
				<Button
					className={cn(
						"bg-black text-[18px] sm:text-[22px] mt-4 sm:mt-6 text-white px-6 sm:px-8 py-[2px] hover:bg-gray-800 hover:scale-95 transition-all ease duration-300",
						!isFormValid.valid && "opacity-90 cursor-not-allowed",
					)}
					onClick={() => {
						const bookingInfo: Partial<IEvent> = {
							bookingDetails: bookingDetails
								.filter((detail) => detail.amount > 0)
								.map((detail) => ({
									...detail,
									amount: Number(detail.amount),
									membersCount: detail.membersCount ? Number(detail.membersCount) : 1,
									currency: detail.currency ?? "INR",
									currencyIcon: detail.currencyIcon ?? "₹",
								})),
							termsAndConditions: termsAndConditions,
							seoTags: seoTags,
							images: [uploadedUrl1, uploadedUrl2, uploadedUrl3].filter((url) => url !== ""),
						};
						updateEvent({ ...event, ...bookingInfo });
						if (!isFormValid.valid) {
							toast.error(isFormValid.message);
							return;
						}
						setPageType("PUBLISH");
					}}
				>
					{loading && <AiOutlineLoading3Quarters size={24} className="animate-spin mr-4" />} Next
				</Button>
			</div>
		</>
	);
}
