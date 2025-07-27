import React from "react";

// Currency data JSON
const currencyData = [
	{ code: "USD", name: "US Dollar", symbol: "$", country: "United States", popular: true },
	{ code: "EUR", name: "Euro", symbol: "€", country: "European Union", popular: true },
	{ code: "GBP", name: "British Pound", symbol: "£", country: "United Kingdom", popular: true },
	{ code: "JPY", name: "Japanese Yen", symbol: "¥", country: "Japan", popular: true },
	{ code: "INR", name: "Indian Rupee", symbol: "₹", country: "India", popular: true },
	{ code: "CAD", name: "Canadian Dollar", symbol: "C$", country: "Canada", popular: true },
	{ code: "AUD", name: "Australian Dollar", symbol: "A$", country: "Australia", popular: true },
	{ code: "CHF", name: "Swiss Franc", symbol: "Fr", country: "Switzerland", popular: true },
	{ code: "CNY", name: "Chinese Yuan", symbol: "¥", country: "China", popular: true },
	{ code: "SGD", name: "Singapore Dollar", symbol: "S$", country: "Singapore", popular: true },
	{ code: "AED", name: "UAE Dirham", symbol: "د.إ", country: "United Arab Emirates", popular: false },
	{ code: "AFN", name: "Afghan Afghani", symbol: "؋", country: "Afghanistan", popular: false },
	{ code: "ALL", name: "Albanian Lek", symbol: "L", country: "Albania", popular: false },
	{ code: "AMD", name: "Armenian Dram", symbol: "֏", country: "Armenia", popular: false },
	{
		code: "ANG",
		name: "Netherlands Antillean Guilder",
		symbol: "ƒ",
		country: "Netherlands Antilles",
		popular: false,
	},
	{ code: "AOA", name: "Angolan Kwanza", symbol: "Kz", country: "Angola", popular: false },
	{ code: "ARS", name: "Argentine Peso", symbol: "$", country: "Argentina", popular: false },
	// Add more currencies as needed
];

// React component for currency dropdown
export default function SelectCurrency({
	value,
	onChange,
}: {
	value: string;
	onChange: (currency: string, icon: string) => void;
}) {
	const [selectedCurrency, setSelectedCurrency] = React.useState(value || "INR");
	const [isOpen, setIsOpen] = React.useState(false);
	const [searchTerm, setSearchTerm] = React.useState("");

	// Get the selected currency object
	const selectedCurrencyObj = currencyData.find((currency) => currency.code === selectedCurrency);

	// Filter currencies based on search term
	const filteredCurrencies = currencyData.filter((currency) => {
		const searchLower = searchTerm.toLowerCase();
		return (
			currency.code.toLowerCase().includes(searchLower) ||
			currency.name.toLowerCase().includes(searchLower) ||
			currency.country.toLowerCase().includes(searchLower)
		);
	});

	// Group currencies by popularity
	const popularCurrencies = filteredCurrencies.filter((c) => c.popular);
	const otherCurrencies = filteredCurrencies.filter((c) => !c.popular);

	// Handle currency selection
	const handleSelect = (currencyCode: string) => {
		setSelectedCurrency(currencyCode);
		setIsOpen(false);

		// Example of data to store in database
		const currencyToStore = currencyData.find((c) => c.code === currencyCode);
		onChange(currencyToStore?.code!, currencyToStore?.symbol!);
	};

	return (
		<div className="relative w-full md:max-w-md">
			{/* Selected currency display */}
			<div
				className="bg-white border border-gray-300 rounded-md h-[40px] sm:h-[48px] px-3 flex items-center justify-between cursor-pointer"
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="flex items-center">
					<span className="mr-2 text-xl">{selectedCurrencyObj?.symbol}</span>
					<span className="text-[16px] sm:text-[20px] text-[#8E7777]">{selectedCurrencyObj?.code}</span>
				</div>
				<span className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>▼</span>
			</div>

			{/* Dropdown container */}
			{isOpen && (
				<div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
					{/* Search input */}
					<div className="p-2 border-b">
						<input
							type="text"
							placeholder="Search currency or country..."
							className="w-full p-2 border rounded-md focus:outline-none"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					{/* Currency list */}
					<div className="max-h-60 overflow-y-auto">
						{/* Popular currencies section */}
						{popularCurrencies.length > 0 && (
							<div>
								<div className="px-3 py-1 bg-gray-100 font-medium text-sm">Popular Currencies</div>
								{popularCurrencies.map((currency) => (
									<div
										key={currency.code}
										className={`px-3 py-2 flex items-center hover:bg-gray-100 cursor-pointer ${
											currency.code === selectedCurrency ? "bg-gray-100" : ""
										}`}
										onClick={() => handleSelect(currency.code)}
									>
										<span className="mr-2 text-xl">{currency.symbol}</span>
										<div>
											<div className="font-medium">
												{currency.code} - {currency.name}
											</div>
											<div className="text-sm text-gray-600">{currency.country}</div>
										</div>
									</div>
								))}
							</div>
						)}

						{/* Other currencies section */}
						{otherCurrencies.length > 0 && (
							<div>
								<div className="px-3 py-1 bg-gray-100 font-medium text-sm">Other Currencies</div>
								{otherCurrencies.map((currency) => (
									<div
										key={currency.code}
										className={`px-3 py-2 flex items-center hover:bg-gray-100 cursor-pointer ${
											currency.code === selectedCurrency ? "bg-gray-100" : ""
										}`}
										onClick={() => handleSelect(currency.code)}
									>
										<span className="mr-2 text-xl">{currency.symbol}</span>
										<div>
											<div className="font-medium">
												{currency.code} - {currency.name}
											</div>
											<div className="text-sm text-gray-600">{currency.country}</div>
										</div>
									</div>
								))}
							</div>
						)}

						{/* No results message */}
						{filteredCurrencies.length === 0 && (
							<div className="px-3 py-2 text-center text-gray-500">No currencies found</div>
						)}
					</div>
				</div>
			)}

			{/* Hidden input to store the value (for form submission) */}
			<input id="perPersonCurrency" type="hidden" value={selectedCurrency} />
		</div>
	);
}
