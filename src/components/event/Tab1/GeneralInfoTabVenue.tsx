import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { SolarAddSquareLinear } from "@/assets/icons/addmore";
import { IEvent } from "@/types/event.type";
import axios from "axios";
import Select from "react-select";
import toast from "react-hot-toast";

const GeneralInfoTabVenue = ({
	event,
	updateEvent,
	currentPage,
	setCurrentPage,
}: {
	event: IEvent;
	updateEvent: (event: Partial<IEvent>) => void;
	currentPage: number;
	setCurrentPage: (currentPage: number) => void;
}) => {
	// eslint-disable-next-line
	const [venueTypes, setVenueTypes] = useState(["Gym", "Court", "Stadium"]);
	const [eventTypes, setEventTypes] = useState(["Corporate Event", "Training Session", "Recreational Activity"]);
	const [amenities, setAmenities] = useState(["Refreshments", "Wi-Fi Facility", "Parking Space"]);

	const [newVenueTypeValue, setNewVenueTypeValue] = useState("");
	const [newEventTypeValue, setNewEventTypeValue] = useState("");
	const [newAmenitiesTypeValue, setNewAmenitiesTypeValue] = useState("");
	const [isAddingVenue, setIsAddingVenue] = useState(false);
	const [isAddingEvent, setIsAddingEvent] = useState(false);
	const [isAddingAmenities, setIsAddingAmenities] = useState(false);

	const handleAddNewType = (type: string) => {
		switch (type) {
			case "venue":
				setIsAddingVenue(!isAddingVenue);
				break;
			case "event":
				setIsAddingEvent(!isAddingEvent);
				break;
			case "amenities":
				setIsAddingAmenities(!isAddingAmenities);
				break;
		}
	};

	const handleNewTypeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, type: string) => {
		switch (type) {
			case "venue":
				if (e.key === "Enter" && newVenueTypeValue.trim()) {
					setVenueTypes((prev) => [...prev, newVenueTypeValue.trim()]);
					setNewVenueTypeValue("");
					setIsAddingVenue(false);
				}
				break;
			case "event":
				if (e.key === "Enter" && newEventTypeValue !== "" && newEventTypeValue.trim()) {
					setEventTypes((prev) => [...prev, newEventTypeValue.trim()]);
					setNewEventTypeValue("");
					setIsAddingEvent(false);
				}
				break;
			case "amenities":
				if (e.key === "Enter" && newAmenitiesTypeValue.trim()) {
					setAmenities((prev) => [...prev, newAmenitiesTypeValue.trim()]);
					setNewAmenitiesTypeValue("");
					setIsAddingAmenities(false);
				}
				break;
		}
	};

	const handleInputChange = (field: keyof IEvent, value: any) => {
		updateEvent({ ...event, [field]: value });
	};

	const [isLoading, setIsLoading] = useState(false);
	const [countryOptions, setCountryOptions] = useState([]);
	const [stateOptions, setStateOptions] = useState([]);
	const [cityOptions, setCityOptions] = useState([]);

	useEffect(
		() => {
			if (!eventTypes.includes(event.eventType) && event.eventType !== "") {
				setEventTypes([...eventTypes, event.eventType]);
			}
			const newAmenities = event.amenities?.filter((amenity) => !amenities.includes(amenity)) || [];
			if (newAmenities.length > 0) {
				setAmenities([...amenities, ...newAmenities]);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	useEffect(() => {
		// Fetch countries from REST Countries API
		axios
			.get("https://restcountries.com/v2/all?fields=name")
			.then((response) => {
				const countryNames = response.data.map((country: any) => country.name);
				setCountryOptions(
					countryNames.map((country: any, index: any) => ({
						value: index,
						label: country,
					})),
				);
			})
			.catch((error) => {
				console.error("Error fetching countries:", error);
			});
	}, []);

	useEffect(() => {
		// Fetch states based on the selected country
		if (event.country) {
			axios
				.post(`https://countriesnow.space/api/v0.1/countries/states`, {
					country: event.country,
				})
				.then((response) => {
					const selectedCountryData = response.data.data.states;
					const states = selectedCountryData?.map((state: any) => state.name) || [];
					setStateOptions(
						states.map((state: any, index: any) => ({
							value: index,
							label: state,
						})),
					);
				})
				.catch((error) => {
					console.error("Error fetching states:", error);
				});
		}
	}, [event.country]);

	useEffect(() => {
		// Fetch cities using a weather API (OpenWeatherMap in this example)
		if (event.country && event.state) {
			axios
				.post(`https://countriesnow.space/api/v0.1/countries/state/cities`, {
					country: event.country,
					state: event.state,
				})
				.then((response) => {
					const cities = response.data.data;
					setCityOptions(
						cities.map((city: any, index: any) => ({
							value: index,
							label: city,
						})),
					);
				})
				.catch((error) => {
					console.error("Error fetching cities:", error);
				});
		}
	}, [event.country, event.state]);

	const isFormValid = useMemo(() => {
		if (!event?.title) {
			return {
				valid: false,
				message: "Title is required",
			};
		}

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
		<>
			<div className="bg-[#F6EFE8] rounded-[15px] px-4 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8 max-w-4xl mx-auto border border-[#D5AA72]">
				<form>
					<div className="space-y-4">
						<div>
							<Label
								htmlFor="title"
								className="block text-lg sm:text-xl md:text-[22px] font-normal text-[#1F1F1F] mb-1"
							>
								Name of the Sport								
							</Label>
							<Input
								id="title"
								value={event.title || ""}
								onChange={(e) => handleInputChange("title", e.target.value)}
								placeholder={`Name of the Sport`}
								className="bg-white shadow-md mt-2 focus:outline-none focus:border-[#DAC0A3] border border-transparent text-lg text-[#8E7777]"
							/>
						</div>
						<div className="flex space-y-4 w-full flex-col gap-3 items-center mt-2">
							<div className="w-full">
								<label htmlFor="landmark" className="block text-lg font-normal text-[#1F1F1F] mb-1">
									Full Address
								</label>
								<Input
									id="location"
									value={event.location || ""}
									placeholder="Enter Full Address"
									onChange={(e) => {
										handleInputChange("location", e.target.value);
									}}
									className="bg-white h-[48px] shadow-md mt-2 focus:outline-none focus:border-[#DAC0A3] border border-transparent text-lg text-[#8E7777]"
								/>
							</div>

							<section className="flex w-full gap-4 items-center flex-col md:flex-row">
								<div className="w-full md:w-[60%]">
									<label htmlFor="landmark" className="block text-lg font-normal text-[#1F1F1F] mb-1">
										Area
									</label>
									<Input
										id="landmark"
										value={event.landmark || ""} // Add state for landmark
										placeholder="Enter Area"
										onChange={(e) => {
											handleInputChange("landmark", e.target.value);
										}}
										className="bg-white h-[42px] shadow-md  focus:outline-none focus:border-[#DAC0A3] border border-transparent text-lg text-[#8E7777]"
									/>
								</div>
								<div className="w-full md:w-[40%]">
									<Label className="block text-lg mb-1 font-normal text-[#1F1F1F]" htmlFor="country">
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

							<section className="flex w-full gap-4 items-center flex-col md:flex-row">
								<div className="w-full md:w-full">
									<Label className="block text-lg mb-1 font-normal text-[#1F1F1F]" htmlFor="state">
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
									<Label className="block text-lg mb-1 font-normal text-[#1F1F1F]" htmlFor="city">
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
									<label htmlFor="pincode" className="block text-lg mb-1 font-regular text-[#1F1F1F]">
										Pincode
									</label>
									<Input
										id="pincode"
										value={event.pincode || ""} // Add state for pincode
										type="number"
										onChange={(e) => {
											handleInputChange("pincode", e.target.value);
										}} // Add setPincode function
										placeholder="Enter Pincode"
										className="bg-white h-[42px] shadow-md focus:outline-none focus:border-[#DAC0A3] border border-transparent text-lg text-[#8E7777]"
									/>
								</div>
							</section>
						</div>

						{/* <div>
							<label className="block text-[20px] font-regular text-[#1F1F1F] mb-1">
								Venue Type
							</label>
							<Input
								value={event.eventType}
								onChange={(e) => {
									handleInputChange("eventType", e.target.value);
								}}
								className="flex-1  h-[48px] w-full bg-white shadow-md focus:outline-none focus:border-[#DAC0A3] border border-transparent text-[20px] text-[#8E7777]"
							/>
						</div> */}
						{/* <div>
							<label className="block text-lg font-regular text-[#1F1F1F] mb-1">
								Venue type (Optional)
							</label>
							<div className="flex flex-wrap gap-3 md:gap-2 mb-2">
								{eventTypes.map((type, index) => (
									<Button
										key={index}
										variant="outline"
										onClick={(e) => {
											e.preventDefault();
											handleInputChange("eventType", type);
										}}
										className={`flex-1 text-lg h-[48px] min-w-[240px] md:max-w-[260px] font-normal text-[#8E7777] shadow-md hover:text-[#ffffff] transition-all ease-in-out duration-300 ${
											event.eventType === type
												? "bg-[#C3996B] text-white hover:bg-[#C39968]"
												: "hover:bg-[#C3996B] hover:scale-105 transition-all ease-in-out duration-300"
										}`}
									>
										{type}
									</Button>
								))}
							</div>
							{isAddingEvent && (
								<Input
									value={newEventTypeValue}
									onChange={(e) => setNewEventTypeValue(e.target.value)}
									onKeyPress={(e) => handleNewTypeKeyPress(e, "event")}
									placeholder="Type here..."
									className="flex-1 pl-[80px] h-[48px] min-w-[240px] max-w-[260px] bg-white shadow-md focus:outline-none focus:border-[#DAC0A3] border border-transparent text-[20px] text-[#8E7777]"
									autoFocus
								/>
							)}
							<div
								className="text-[#C3996B] flex cursor-pointer w-fit mt-2"
								onClick={() => handleAddNewType("event")}
							>
								<SolarAddSquareLinear className="hover:scale-110 transition-all ease duration-300 h-9 w-9" />
								<p className="text-[#696969] my-auto ml-2 text-[18px] font-medium">Add more</p>
							</div>
						</div> */}
						<div>
							<label className="block text-[20px] font-regular text-[#1F1F1F] mb-1">
								Amenities Provided (Optional)
							</label>
							<div className="flex flex-wrap gap-3 md:gap-2 mb-2">
								{amenities.map((amenity, index) => (
									<Button
										key={index}
										variant="outline"
										onClick={(e) => {
											e.preventDefault();
											let tempAmenities = [...(event.amenities || [])];

											if (tempAmenities.includes(amenity)) {
												tempAmenities = tempAmenities.filter((a) => a !== amenity);
											} else {
												tempAmenities.push(amenity);
											}

											updateEvent({ ...event, amenities: tempAmenities });
										}}
										className={`flex-1 h-[48px] text-lg min-w-[240px] md:max-w-[260px] font-normal text-[#8E7777] shadow-md hover:text-[#ffffff] transition-all ease-in-out duration-300 ${
											event.amenities?.includes(amenity)
												? "bg-[#C3996B] text-white hover:bg-[#C39968]"
												: "hover:bg-[#C3996B] hover:scale-105 transition-all ease-in-out duration-300"
										}`}
									>
										{amenity}
									</Button>
								))}
							</div>

							{isAddingAmenities && (
								<div className="flex gap-2 items-center">
									<Input
										value={newAmenitiesTypeValue}
										onChange={(e) => setNewAmenitiesTypeValue(e.target.value)}
										onKeyPress={(e) => handleNewTypeKeyPress(e, "amenities")}
										onBlur={() => {
											if (newAmenitiesTypeValue.trim()) {
												setAmenities((prev) => [...prev, newAmenitiesTypeValue.trim()]);
												const newAmenity = newAmenitiesTypeValue.trim();
												updateEvent({
													...event,
													amenities: [...(event.amenities || []), newAmenity],
												});
												setNewAmenitiesTypeValue("");
												setIsAddingAmenities(false);
											}
										}}
										placeholder="Type here..."
										className="flex-1 pl-4 h-[48px] min-w-[240px] md:max-w-[260px] bg-white shadow-md focus:outline-none focus:border-[#DAC0A3] border border-transparent text-[20px] text-[#8E7777]"
										autoFocus
									/>
									<Button
										onClick={(e: React.MouseEvent) => {
											e.preventDefault();
											if (newAmenitiesTypeValue.trim()) {
												setAmenities((prev) => [...prev, newAmenitiesTypeValue.trim()]);
												const newAmenity = newAmenitiesTypeValue.trim();
												updateEvent({
													...event,
													amenities: [...(event.amenities || []), newAmenity],
												});
												setNewAmenitiesTypeValue("");
												setIsAddingAmenities(false);
											}
										}}
										className="h-[48px] bg-[#C3996B] text-white hover:bg-[#B38B61]"
									>
										Add
									</Button>
								</div>
							)}
							<div
								className="text-[#C3996B] flex cursor-pointer w-fit mt-2"
								onClick={() => handleAddNewType("amenities")}
							>
								<SolarAddSquareLinear className="hover:scale-110 transition-all ease duration-300 h-9 w-9" />
								<p className="text-[#696969] my-auto ml-2 text-[20px] font-medium">Add more</p>
							</div>
						</div>
						<div>
							<label htmlFor="description" className="block text-lg font-regular text-[#1F1F1F] mb-1">
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
									className="w-full h-24 text-lg focus:outline-none shadow-md focus:border-[#DAC0A3] text-[#8E7777]"
								/>
								<div className="absolute bottom-2 right-2 text-sm text-gray-500">
									{(event.description || "").length}/1500
								</div>
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
		</>
	);
};

export default GeneralInfoTabVenue;
