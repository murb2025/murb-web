export const events = [
	{
		title: "Classical Music Symphony",
		date: "15-01-2024",
		time: "7:00 PM",
		location: "Bharat Bhavan Amphitheatre, Bhopal",
		price: 1500,
		seatsLeft: 150,
		imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae",
		category: "Classical",
	},
	{
		title: "Kathak Dance Festival",
		date: "22-01-2024",
		time: "6:30 PM",
		location: "Ravindra Bhavan, MP Nagar, Bhopal",
		price: 1200,
		seatsLeft: 180,
		imageUrl: "https://images.unsplash.com/photo-1516307365426-bea591f05011",
		category: "Dance",
	},
	{
		title: "Sufi Night Extravaganza",
		date: "05-02-2024",
		time: "8:00 PM",
		location: "DB City Mall Amphitheatre, Bhopal",
		price: 2000,
		seatsLeft: 100,
		imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629",
		category: "Sufi",
	},
	{
		title: "Folk Music Fusion",
		date: "18-02-2024",
		time: "6:00 PM",
		location: "Tribal Museum, Shyamla Hills, Bhopal",
		price: 800,
		seatsLeft: 250,
		imageUrl: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f",
		category: "Folk",
	},
	{
		title: "Poetry & Ghazal Night",
		date: "01-03-2024",
		time: "7:30 PM",
		location: "Manas Bhavan, BHEL, Bhopal",
		price: 1000,
		seatsLeft: 120,
		imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea",
		category: "Poetry",
	},
	{
		title: "Hindustani Classical Concert",
		date: "15-03-2024",
		time: "6:30 PM",
		location: "Madhya Pradesh School of Drama, Bhopal",
		price: 1800,
		seatsLeft: 200,
		imageUrl: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f",
		category: "Classical",
	},
] as const;

export type Event = (typeof events)[number];

export const sortDaysOfWeek = (days: string[]): string[] => {
	const orderMap: Record<string, number> = {
		MON: 0,
		TUE: 1,
		WED: 2,
		THU: 3,
		FRI: 4,
		SAT: 5,
		SUN: 6,
	};

	return [...days].sort((a, b) => {
		return orderMap[a] - orderMap[b];
	});
};
