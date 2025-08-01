import React, { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Input, Label, Textarea } from "@/components/ui";
import { IEvent } from "@/types/event.type";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { eventSpecificTypeEnum } from "@/constants/event.constant";
import { toast } from "react-hot-toast";

const GeneralInfoTabType1 = ({
	title,
	event,
	updateEvent,
	currentPage,
	setCurrentPage,
}: {
	title: string;
	event: IEvent;
	updateEvent: (event: IEvent) => void;
	currentPage: number;
	setCurrentPage: (currentPage: number) => void;
}) => {
	const handleInputChange = (field: keyof IEvent, value: any) => {
		updateEvent({ ...event, [field]: value });
	};

	const [isLoading, setIsLoading] = useState(false);
	interface SelectOption {
		value: string;
		label: string;
	}

	const [countryOptions, setCountryOptions] = useState<SelectOption[]>([]);
	const [stateOptions, setStateOptions] = useState<SelectOption[]>([]);
	const [cityOptions, setCityOptions] = useState<SelectOption[]>([]);

	useEffect(() => {
		// Get all countries
		const countries = Country.getAllCountries();
		setCountryOptions(
			countries.map((country) => ({
				value: country.isoCode,
				label: country.name,
			})),
		);
	}, []);

	useEffect(() => {
		// Get states for selected country
		if (event.country) {
			const selectedCountry = Country.getAllCountries().find(
				(country) => country.name === event.country
			);
			
			if (selectedCountry) {
				const states = State.getStatesOfCountry(selectedCountry.isoCode);
				setStateOptions(
					states.map((state) => ({
						value: state.isoCode,
						label: state.name,
					})),
				);
			}
		}
	}, [event.country]);

	useEffect(() => {
		// Get cities for selected state and country
		if (event.country && event.state) {
			const selectedCountry = Country.getAllCountries().find(
				(country) => country.name === event.country
			);
			
			if (selectedCountry) {
				const selectedState = State.getStatesOfCountry(selectedCountry.isoCode).find(
					(state) => state.name === event.state
				);

				if (selectedState) {
					const cities = City.getCitiesOfState(
						selectedCountry.isoCode,
						selectedState.isoCode
					);
					setCityOptions(
						cities.map((city) => ({
							value: city.name,
							label: city.name,
						})),
					);
				}
			}
		}
	}, [event.country, event.state]);

	const isFormValid = useMemo(() => {
		if (!event?.title) {
			return {
				valid: false,
				message: "Title is required",
			};
		}

		if (!event?.host) {
			return {
				valid: false,
				message: "Host is required",
			};
		}

		if (event?.isOnline) {
			if (!event?.location) {
				return {
					valid: false,
					message: "Location URL is required",
				};
			}
		} else {
			if (event?.isHomeService) {
				if (!event?.city) {
					return {
						valid: false,
						message: "City is required",
					};
				}

				if (!event?.state) {
					return {
						valid: false,
						message: "State is required",
					};
				}

				if (!event?.country) {
					return {
						valid: false,
						message: "Country is required",
					};
				}
			} else {
				if (!event?.location) {
					return {
						valid: false,
						message: "Full Address is required",
					};
				}

				if (!event?.landmark) {
					return {
						valid: false,
						message: "Area is required",
					};
				}

				if (!event?.city) {
					return {
						valid: false,
						message: "City is required",
					};
				}

				if (!event?.state) {
					return {
						valid: false,
						message: "State is required",
					};
				}

				if (!event?.country) {
					return {
						valid: false,
						message: "Country is required",
					};
				}

				if (!event?.pincode) {
					return {
						valid: false,
						message: "Pincode is required",
					};
				}
			}
		}

		if (event?.description) {
			return {
				valid: true,
				message: "Description is required",
			};
		}

		return {
			valid: false,
			message: "Please fill all the required fields",
		};
	}, [event]);

	return (
		<div className="bg-[#F6EFE8] rounded-[15px] px-4 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8 max-w-4xl mx-auto border border-[#D5AA72]">
			<form className="space-y-4">
				<div>
					<Label
						htmlFor="title"
						className="block text-lg sm:text-xl md:text-[22px] font-normal text-[#1F1F1F] mb-1"
					>
						{event.eventSpecificType !== eventSpecificTypeEnum.TRAINER
							? "Title of the " + title
							: "Name of the Class"}
					</Label>
					<Input
						id="title"
						value={event.title || ""}
						onChange={(e) => handleInputChange("title", e.target.value)}
						placeholder={
							event.eventSpecificType !== eventSpecificTypeEnum.TRAINER
								? "Title of the " + title
								: "Name of the Class"
						}
						className="bg-white shadow-md mt-2 focus:outline-none focus:border-[#DAC0A3] border border-transparent text-lg text-[#8E7777]"
					/>
				</div>
				<div>
					<Label
						htmlFor="host"
						className="block text-lg sm:text-xl md:text-[22px] font-normal text-[#1F1F1F] mb-1"
					>
						Hosted by
					</Label>
					<Input
						id="host"
						value={event.host || ""}
						onChange={(e) => handleInputChange("host", e.target.value)}
						placeholder={`Hosted by`}
						className="bg-white shadow-md mt-2 focus:outline-none focus:border-[#DAC0A3] border border-transparent text-lg text-[#8E7777]"
					/>
				</div>

				<div className="space-y-4">
					<Label
						htmlFor="maxParticipants"
						className="text-lg sm:text-xl md:text-xl font-normal text-[#1F1F1F] mb-1"
					>
						{event.isOnline ? "Location URL" : "Full Address"}
					</Label>
					<div className="flex space-x-2 bg-white px-2 sm:px-4 py-2 rounded-lg w-fit shadow-md">
						<Button
							type="button"
							variant={event.isOnline === true ? "default" : "outline"}
							className={`flex-1 border-0 text-sm sm:text-base md:text-[20px] font-normal ${
								event.isOnline === true
									? "bg-[#C3996B] hover:bg-[#C3996B] text-white"
									: "text-[#8E7777]"
							}`}
							onClick={() =>
								updateEvent({
									...event,
									isOnline: true,
									isHomeService: false,
									location: "",
									landmark: "",
									city: "",
									state: "",
									country: "",
									pincode: "",
								})
							}
						>
							Online
						</Button>
						<Button
							type="button"
							variant={event.isOnline === false ? "default" : "outline"}
							className={`flex-1 border-0 text-sm sm:text-base md:text-[20px] font-normal ${
								event.isOnline === false
									? "bg-[#C3996B] hover:bg-[#C3996B] text-white"
									: "text-[#8E7777]"
							}`}
							onClick={() =>
								updateEvent({
									...event,
									isOnline: false,
									location: "",
									landmark: "",
									city: "",
									state: "",
									country: "",
									pincode: "",
								})
							}
						>
							Offline
						</Button>
					</div>
					{event.isOnline ? (
						<div className="">
							<Input
								id="location"
								placeholder="Enter Location URL or Place"
								value={event.location || ""}
								onChange={(e) => handleInputChange("location", e.target.value)}
								className="bg-white h-[40px] sm:h-[44px] md:h-[48px] shadow-md mt-2 focus:outline-none focus:border-[#DAC0A3] border border-transparent text-sm sm:text-base md:text-[20px] text-[#8E7777]"
							/>
						</div>
					) : (
						<div className="flex flex-col space-y-4 w-full gap-2 items-center">
							<div className="flex items-center w-full gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
								<Checkbox
									id="isHomeService"
									checked={event.isHomeService}
									onCheckedChange={() => {
										updateEvent({
											...event,
											isHomeService: !event.isHomeService,
										});
									}}
									className="h-5 w-5"
								/>
								<Label
									htmlFor="isHomeService"
									className="text-[14px] md:text-[16px] text-[#6F5C5CBA] font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Home Service
								</Label>
							</div>

							<>
								<div className="w-full">
									<Input
										id="location"
										value={event.location || ""}
										placeholder={`Enter Full Address ${event.isHomeService ? "(Optional)" : ""}`}
										onChange={(e) => {
											handleInputChange("location", e.target.value);
										}}
										className="bg-white h-[40px] sm:h-[44px] md:h-[48px] shadow-md mt-2 focus:outline-none focus:border-[#DAC0A3] border border-transparent text-sm sm:text-base md:text-[20px] text-[#8E7777]"
										disabled={event.isHomeService}
									/>
								</div>

								<section className="flex flex-col sm:flex-row w-full gap-2 items-start sm:items-center">
									<div className="w-full sm:w-[60%]">
										<label
											htmlFor="landmark"
											className="block text-base sm:text-lg md:text-[20px] font-normal text-[#1F1F1F] mb-1"
										>
											Area {event.isHomeService ? "(Optional)" : ""}
										</label>
										<Input
											id="Area"
											value={event.landmark || ""}
											placeholder={`Enter Area ${event.isHomeService ? "(Optional)" : ""}`}
											onChange={(e) => {
												handleInputChange("landmark", e.target.value);
											}}
											className="bg-white h-[36px] sm:h-[38px] md:h-[42px] shadow-md focus:outline-none focus:border-[#DAC0A3] border border-transparent text-lg text-[#8E7777]"
											// disabled={event.isHomeService}
										/>
									</div>
									<div className="w-full sm:w-[40%]">
										<Label
											className="block text-base sm:text-lg md:text-[20px] mb-1 font-normal text-[#1F1F1F]"
											htmlFor="country"
										>
											Country
										</Label>
										<Select
											className="bg-white rounded-md focus:border-[#DAC0A3] border-none outline-none shadow-md focus:outline-none text-lg text-[#8E7777]"
											value={{ value: event.country, label: event.country }}
											placeholder="Select Country"
											isDisabled={isLoading}
											options={countryOptions}
											isLoading={countryOptions ? false : true}
											onChange={(e: any) => {
												updateEvent({ ...event, country: e.label, state: "", city: "" });
											}}
										/>
									</div>
								</section>

								<section className="flex flex-col sm:flex-row w-full gap-2 items-start sm:items-center">
									<div className="w-full">
										<Label
											className="block text-base sm:text-lg md:text-[20px] mb-1 font-normal text-[#1F1F1F]"
											htmlFor="state"
										>
											State
										</Label>
										<Select
											className="bg-white rounded-md focus:border-[#DAC0A3] border-none outline-none shadow-md focus:outline-none text-lg text-[#8E7777]"
											value={{ value: event.state, label: event.state }}
											isDisabled={isLoading}
											placeholder="Select State"
											options={stateOptions}
											onChange={(e: any) => {
												updateEvent({ ...event, state: e.label, city: "" });
											}}
										/>
									</div>
									<div className="w-full">
										<Label
											className="block text-base sm:text-lg md:text-[20px] mb-1 font-normal text-[#1F1F1F]"
											htmlFor="city"
										>
											City
										</Label>
										<Select
											className="bg-white rounded-md focus:border-[#DAC0A3] border-none outline-none shadow-md focus:outline-none text-lg text-[#8E7777]"
											value={{ value: event.city, label: event.city }}
											isDisabled={isLoading}
											placeholder="Select City"
											options={cityOptions}
											isLoading={cityOptions ? false : true}
											onChange={(e: any) => {
												updateEvent({ ...event, city: e.label });
											}}
										/>
									</div>
									<div className="w-full">
										<label
											htmlFor="pincode"
											className="block text-base sm:text-lg md:text-[20px] mb-1 font-regular text-[#1F1F1F]"
										>
											Pincode {event.isHomeService ? "(Optional)" : ""}
										</label>
										<Input
											id="pincode"
											value={event.pincode || ""}
											type="number"
											onChange={(e) => {
												handleInputChange("pincode", e.target.value);
											}}
											// disabled={event.isHomeService}
											placeholder={"Enter Pincode"}
											className="bg-white h-[36px] sm:h-[38px] md:h-[42px] shadow-md focus:outline-none focus:border-[#DAC0A3] border border-transparent text-lg text-[#8E7777]"
										/>
									</div>
								</section>
							</>
						</div>
					)}
				</div>

				{/* <div>
					<label className="block text-lg sm:text-xl md:text-[22px] font-regular text-[#1F1F1F] mb-2">
						{title} Type
					</label>
					<Input
						id="certificationType"
						value={event.eventType || ""}
						placeholder={`Enter ${title} Type`}
						onChange={(e) => {
							handleInputChange("eventType", e.target.value);
						}}
						className="bg-white h-[40px] sm:h-[44px] md:h-[48px] shadow-md mt-2 focus:outline-none focus:border-[#DAC0A3] border border-transparent text-lg text-[#8E7777]"
					/>
				</div> */}

				<div>
					<label
						htmlFor="description"
						className="block text-lg sm:text-xl md:text-[22px] font-regular text-[#1F1F1F] mb-1"
					>
						Description{" "}
					</label>
					<div className="relative">
						<Textarea
							id="description"
							value={event.description || ""}
							placeholder={`Enter Description (max 1500 characters)`}
							onChange={(e) => {
								if (e.target.value.length <= 1500) {
									handleInputChange("description", e.target.value);
								}
							}}
							maxLength={1500}
							className="w-full h-20 sm:h-24 text-lg focus:outline-none shadow-md focus:border-[#DAC0A3] text-[#8E7777]"
						/>
						<div className="absolute bottom-2 right-2 text-xs sm:text-sm text-gray-500">
							{(event.description || "").length}/1500
						</div>
					</div>
				</div>
			</form>

			<div className="my-4 sm:my-6 flex justify-center">
				<Button
					className={`${isFormValid.valid ? "" : "opacity-90 cursor-not-allowed"} bg-black text-white text-[22px] px-8 py-[2px] hover:bg-gray-800 hover:scale-95 transition-all ease duration-300 ${currentPage === 0 ? "" : "hidden"}`}
					// disabled={!isFormValid()}
					onClick={() => {
						if (!isFormValid.valid) {
							toast.error(isFormValid.message);
							return;
						}
						setCurrentPage(currentPage + 1);
					}}
				>
					Next
				</Button>
			</div>
		</div>
	);
};

export default GeneralInfoTabType1;
