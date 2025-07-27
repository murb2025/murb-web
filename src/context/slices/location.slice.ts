import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ILocationState {
	location: string;
	landmark?: string;
	city: string;
	pincode: string;
	state: string;
	country: string;
	isLocationSet: boolean;
}

const initialState: Partial<ILocationState> = {
	location: "",
	landmark: "",
	city: "",
	state: "",
	country: "",
	pincode: "",
	isLocationSet: false,
};

export const locationSlice = createSlice({
	name: "location",
	initialState,
	reducers: {
		setLocation: (state, action: PayloadAction<Partial<ILocationState>>) => {
			return { ...state, ...action.payload, isLocationSet: true };
		},
		resetLocation: (state) => {
			return { ...initialState };
		},
	},
});

export const { setLocation, resetLocation } = locationSlice.actions;
export default locationSlice.reducer;

export const locationSelector = (state: { location: ILocationState }) => state.location;
