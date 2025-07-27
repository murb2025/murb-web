"use client";
import React, { useEffect, useState } from "react";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Select from "react-select";
import axios from "axios";
import toast from "react-hot-toast";
import { useStore } from "@/hooks";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const popularCities = [
	"All",
	"Bengaluru",
	"Delhi",
	"Mumbai",
	"Chennai",
	"Kolkata",
	"Hyderabad",
	"Chandigarh",
	"Ahmedabad",
	"Pune",
	"Jaipur",
	"Lucknow",
	"Surat",
	"Kanpur",
	"Nagpur",
	"Patna",
	"Indore",
	"Bhopal",
	"Ludhiana",
	"Agra",
	"Varanasi",
	"Coimbatore",
	"Thiruvananthapuram",
	"Visakhapatnam",
	"Vadodara",
];


const LocationSelector = ({ onOpenHamburg }: { onOpenHamburg?: React.Dispatch<React.SetStateAction<boolean>> }) => {
	const { location, setLocation, resetLocation, dispatch } = useStore();
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [cityOptions, setCityOptions] = useState(popularCities.map((city) => ({ value: city, label: city })));
	const [city, setCity] = useState(location.city || "");

	useEffect(() => {
		(async () => {
			try {
				const data = await fetchLocation();
				if (!data?.location) return;
				
				if (location.city === "") {
					setOpen(true);
				}
			} catch (error) {
				console.error("Error checking location:", error);
			}
		})();
	}, []);

	const fetchLocation = async () => {
		setIsLoading(true);
		try {
			// If no cached data, fetch from API
			const response = await fetch("https://ipapi.co/json/");
			if (!response.ok) {
				throw new Error(`API responded with status: ${response.status}`);
			}

			const data = await response.json();
			
			// Validate the response data
			if (!data.city || !data.country_name) {
				throw new Error("Invalid location data received");
			}

			const locationData = {
				country: data.country_name,
				city: data.city,
				timezone: data.timezone,
				latitude: data.latitude,
				longitude: data.longitude,
				ip: data.ip,
			};

			return {
				location: locationData,
				error: false,
			};
		} catch (err) {
			// Don't show error toast in case of API errors		
			// toast.error("Failed to get location");
			return {
				location: null,
				error: true,
			};
		} finally {
			setIsLoading(false);
		}
	};

	const fetchCities = async (query: string) => {
		if (!query) {
			setCityOptions([]);
			return;
		}

		try {
			const response = await axios.post(`https://countriesnow.space/api/v0.1/countries/cities`, {
				country: "India",
			});
			const cities = ["All", ...response.data.data] as string[];

			const filteredCities = cities
				.filter((city: string) => city.toLowerCase().includes(query.toLowerCase()))
				.slice(0, 10);

			setCityOptions(
				filteredCities.map((city: string) => ({
					value: city,
					label: city,
				})),
			);
		} catch (error) {
			console.error("Error fetching cities:", error);
			setCityOptions([]);
		}
	};

	const handleCityChange = (e: any) => {
		dispatch(setLocation({ city: e.label }));
		setCity(e.label);
		fetchCities(e.label);
	};

	const handleClear = () => {
		setCity("");
		dispatch(resetLocation());
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				setOpen(open);
				onOpenHamburg && onOpenHamburg(open);
			}}
		>
			<DialogTrigger asChild>
				<div className="flex justify-center w-full py-2 sm:py-3 items-center duration-200 hover:scale-105 cursor-pointer">
					<MapPin className="h-4 w-4 sm:h-6 sm:w-6 mr-1 sm:mr-2" />
					<span className="text-base sm:text-[16px]">
						{location.city !== "All" ? location.city : "Location"}
					</span>
				</div>
			</DialogTrigger>

			<DialogContent showClose={false} className="w-[95%] max-w-[90vw] sm:max-w-4xl mx-auto">
				<div className="flex justify-end absolute top-4 right-4 cursor-pointer">
					<X
						className="h-5 w-5"
						onClick={() => {
							if (location.city === "All" || location.city === "") {
								dispatch(setLocation({ city: "All" }));
							}
							setOpen(false);
						}}
					/>
				</div>
				<div className="flex flex-col md:flex-row gap-4 sm:gap-8 p-4 sm:p-8 bg-white rounded-lg">
					<div className="w-full md:w-1/3">
						<h2 className="text-2xl sm:text-3xl font-semibold text-[#C17D55] mb-2">Location</h2>
						<p className="text-base sm:text-lg text-black mb-4 sm:mb-6 leading-auto">
							Set your location to discover events near you.
						</p>
						<div className="hidden md:block relative w-full h-48">
							<Image
								fill
								src="/images/people.svg"
								alt="Activities illustration"
								className="object-contain"
							/>
						</div>
					</div>
					<div className="w-full md:w-2/3 space-y-3 sm:space-y-4">
						<div className="relative flex items-center flex-col sm:flex-row gap-2 sm:gap-3">
							<Select
								className="w-full text-sm sm:text-base"
								value={city ? { value: city, label: city } : null}
								placeholder="Enter City Name"
								isDisabled={isLoading}
								options={cityOptions}
								onChange={handleCityChange}
								onInputChange={(newValue) => {
									fetchCities(newValue);
								}}
								isSearchable={true}
							/>
							<Button variant={"outline"} className="w-full sm:w-auto" onClick={handleClear} size={"sm"}>
								Clear
							</Button>
						</div>
						{city ? (
							<Button
								variant="outline"
								size={"sm"}
								className="w-full sm:w-[86%]"
								onClick={() => {
									setOpen(false);
									onOpenHamburg && onOpenHamburg(open);
								}}
							>
								Submit
							</Button>
						) : (
							<Button
								variant="default"
								className="w-full sm:w-[86%] bg-black text-white hover:bg-gray-800 text-sm sm:text-base"
								onClick={async () => {
									const data = await fetchLocation();
									if (data?.location) {
										handleCityChange({ label: data.location.city });
									}
								}}
								disabled={isLoading}
								size={"sm"}
							>
								<MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
								{isLoading ? "Getting location..." : "Set Your Current Location"}
							</Button>
						)}
						<div className="space-y-2 sm:space-y-3">
							<h3 className="text-xs sm:text-sm font-semibold">Popular Cities</h3>
							<div className="flex flex-wrap gap-1.5 sm:gap-2">
								{popularCities.map((pcity) => (
									<Badge
										key={pcity}
										variant={"outline"}
										// size={"sm"}
										className="cursor-pointer text-sm sm:text-sm rounded-full hover:bg-gray-100 bg-slate-50 px-2 py-1 sm:px-2 sm:py-2"
										onClick={() => handleCityChange({ label: pcity })}
									>
										{pcity}
									</Badge>
								))}
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default LocationSelector;
