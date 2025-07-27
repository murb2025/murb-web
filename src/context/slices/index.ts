import eventReducer from "@/context/slices/event.slice";
import locationReducer from "@/context/slices/location.slice";

const reducers = {
	event: eventReducer,
	location: locationReducer,
};

export default reducers;
