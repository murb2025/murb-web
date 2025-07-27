export const eventSpecificTypeEnum = {
	VENUE: "Venue",
	CLASSES_SESSIONS: "Classes / Sessions",
	TOURNAMENTS_COMPETITIONS: "Tournaments / Competitions",
	EVENTS_EXPERIENCES: "Events & Experiences",
	TRAINER: "Trainer",
	WORKSHOPS: "Certifications / Camps / Workshops",
};

export const eventTypes = Object.values(eventSpecificTypeEnum);

export const eventSpecificTypeData = [
	{
		id: 1,
		name: "Venue",
		imgSrc: "/icons/Venue-1.svg",
		imgColorSrc: "/icons/Venues.svg",
		value: "Venue",
	},
	{
		id: 2,
		name: "Classes/Sessions",
		imgColorSrc: "/icons/Class.svg",
		imgSrc: "/icons/Classses-1.svg",
		value: "Classes/ Sessions",
	},
	{
		id: 3,
		imgColorSrc: "/icons/Tournament.svg",
		imgSrc: "/icons/Trophy.svg",
		name: "Tournaments/Competitions",
		value: "Tournaments/ Competitions",
	},
	{
		id: 4,
		name: "Events & Experiences",
		imgColorSrc: "/icons/Events.svg",
		imgSrc: "/icons/Event-1.svg",
		value: "Events & Experiences",
	},
	{
		id: 5,
		imgColorSrc: "/icons/Trainers.svg",
		imgSrc: "/icons/Trainer-1.svg",
		name: "Trainer",
		value: "Trainer",
	},
	{
		id: 6,
		name: "Certifications / Camps / Workshops",
		imgColorSrc: "/icons/Certificates.svg",
		imgSrc: "/icons/Certificate-1.svg",
		value: "Certifications / Camps / Workshops",
	},
];

export const categoriesData: Record<string, string[]> = {
	"Popular Sports": [
		"Golf",
		"Polo",
		"Horse Racing",
		"Sailing",
		"Yachting",
		"Pickleball",
		"Paddleball",
		"Tennis",
		"Ice Hockey",
		"Ice Skating",
		"Cricket",
		"Football",
		"Badminton",
		"Field Hockey",
		"Basketball",
		"Volleyball",
		"Kabaddi",
		"Table Tennis",
		"Athletics",
		"Cycling",
		"Shooting",
		"Chess",
		"Carrom",
		"Squash",
		"Rowing",
		"Rugby",
		"Baseball",
		"Archery",
		"Gymnastics",
		"Roller Skating",
		"Handball",
		"Softball",
		"Lacrosse",
		"Netball",
		"Skateboarding",
		"Swimming",
		"Water Polo",
		"Billiards / Snooker",
		"Formula 1 (Car Racing) / Karting",
	],
	Wellness: [
		"Yoga",
		"Aerial Yoga",
		"Power Yoga",
		"Meditation",
		"Therapy",
		"Zumba",
		"Pilates",
		"Calisthenics",
		"Animal Flow",
		"Hydrotherapy",
		"Cryotherapy",
		"Dance Cardio",
		"Pole Dancing",
		"Holistic Healing",
	],
	"Combat & Martial Arts": [
		"Wrestling",
		"Boxing",
		"Judo",
		"Karate",
		"Taekwondo",
		"Muay Thai",
		"Kickboxing",
		"Jiu-Jitsu",
		"Kung Fu",
		"Kalaripayattu",
		"Fencing",
		"Silambam",
		"Weightlifting",
		"Mixed Martial Arts",
	],
	"Adventure Sports": [
		"Paragliding",
		"Skydiving",
		"Scuba Diving",
		"Snorkelling",
		"Rafting",
		"Caving",
		"Parkour",
		"Skiing",
		"Zip-lining",
		"Kayaking",
		"Surfing",
		"Motocross",
		"Treks",
		"Hikes",
		"BMX Racing",
		"Jet Skiing",
		"Windsurfing",
		"Parasailing",
		"Sandboarding",
		"Wakeboarding",
		"Snowboarding",
		"Hang Gliding",
		"Bungee Jumping",
		"Mountaineering",
		"Mountain Biking",
		"Motorbike Racing",
		"Hot Air Ballooning",
		"Rock Climbing & Bouldering",
	],
	"Gaming & Esports": ["LAN Events", "Virtual Reality", "Console Gaming", "Multiplayer Games"],
	"Fitness & Endurance": [
		"Spartan Races",
		"CrossFit Games",
		"Triathlon",
		"Marathons",
		"Nature walk",
		"Run Club",
		"Mountaineering Challenges",
		"Calisthenics",
		"Gym",
		"Strength Training",
	],
};

export const sportsData = Object.keys(categoriesData)
	.map((key) => categoriesData[key])
	.flat();

export const CONVENIENCE_FEE_PERCENTAGE = 5;
export const CGST_PERCENTAGE = 9;
export const SGST_PERCENTAGE = 9;
export const GST_PERCENTAGE = 18;
export const VENDOR_CONVENIENCE_FEE_PERCENTAGE = 18;
export const TDS_PERCENTAGE = 0.1;
export const TCS_PERCENTAGE = 0.5;
export const COMMISSION_PERCENTAGE = 5;
export const TDS_UNDER_194H_PERCENTAGE = 2;

export const calculateAmountWithTax = (amount: number, isGSTVendor?: boolean) => {
	// Round the input amount to 2 decimal places
	amount = parseFloat(amount.toFixed(2)); // event cost

	console.log("isGSTVendor",isGSTVendor);

	// Calculate with rounding at each step
	const convenienceFee = parseFloat(((amount * CONVENIENCE_FEE_PERCENTAGE) / 100).toFixed(2));
	const cgst = parseFloat(((amount * CGST_PERCENTAGE) / 100).toFixed(2));
	const sgst = parseFloat(((amount * SGST_PERCENTAGE) / 100).toFixed(2));
	const totalGST = parseFloat(((GST_PERCENTAGE / 100) * (amount + convenienceFee)).toFixed(2));
	const amountWithTax = parseFloat((amount + convenienceFee + totalGST).toFixed(2)); // amount received

	const tds = parseFloat(((TDS_PERCENTAGE / 100) * amount).toFixed(2));
	const tcs = parseFloat(((TCS_PERCENTAGE / 100) * amount).toFixed(2));

	const amountPayableToVendor = isGSTVendor
		? parseFloat(((amount + ((GST_PERCENTAGE)/100 * amount)).toFixed(2)))
		: amount;

	const netPayable = parseFloat((amountPayableToVendor - tds - tcs).toFixed(2));
	const commission = parseFloat(((COMMISSION_PERCENTAGE * amount) / 100).toFixed(2));
	const GSTOnCommission = parseFloat((((CGST_PERCENTAGE + SGST_PERCENTAGE) * commission) / 100).toFixed(2));
	const tdsUnder194H = parseFloat(((TDS_UNDER_194H_PERCENTAGE * commission) / 100).toFixed(2));
	const netCommision = commission + GSTOnCommission - tdsUnder194H;
	const tdsWithold = tdsUnder194H;
	const netPayableToVendor = parseFloat((netPayable - netCommision - tdsWithold).toFixed(2));

	return { amountWithTax, convenienceFee, cgst, sgst, tds, tcs, amountPayableToVendor, netPayableToVendor,netPayable, commission, GSTOnCommission, tdsUnder194H, netCommision, tdsWithold, totalGST};
};
