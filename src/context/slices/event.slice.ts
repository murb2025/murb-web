import { IEvent } from "@/types/event.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Partial<IEvent> = {
	vendorId: undefined,

	// Event Specific
	eventSpecificType: "",
	sportType: "",
	tags: "",

	// General Info
	title: "",
	host: "",
	description: "",
	eventType: "",
	isOnline: false,
	location: "",
	landmark: "",
	city: "",
	state: "",
	country: "",
	pincode: "",
	amenities: [], //only in venue

	// Schedule Tab
	isMonthlySubscription: false,
	isHomeService: false,
	multipleDays: false,
	startDate: "",
	endDate: "",
	weekDays: [],
	startingTime: "09:00",
	endingTime: "17:00",
	numberOfDays: 1,
	isHaveSlots: true,
	slotDuration: 30,
	slots: [],
	isTeamEvent: false,
	teamSize: 0,
	maximumParticipants: 10, // how many can sit
	minimumParticipants: undefined, // how many can sit
	bookingChart: [],

	images: [],
	seoTags: [],

	language: "English",

	status: "PENDING",
	visibility: "PUBLIC",

	bookingDetails: [],
	termsAndConditions: "",
};

export const eventSlice = createSlice({
	name: "event",
	initialState,
	reducers: {
		setEvent: (state, action: PayloadAction<Partial<IEvent>>) => {
			// console.log("Event->>: ", action.payload);
			return { ...state, ...action.payload };
		},
		resetEvent: () => initialState,
	},
});

export const { setEvent, resetEvent } = eventSlice.actions;
export default eventSlice.reducer;
export const eventSelector = (state: { event: IEvent }) => state.event;
