import { useDispatch, useSelector } from "react-redux";
import { eventSelector, eventSlice } from "@/context/slices/event.slice";
import { locationSlice, locationSelector } from "@/context/slices/location.slice";

const useStore = () => {
	const dispatch = useDispatch<any>();

	const event = useSelector(eventSelector);
	const location = useSelector(locationSelector);

	return {
		// dispatch takes an action object and sends it to the store
		dispatch,
		event,
		location,
		// actions
		...eventSlice.actions,
		...locationSlice.actions,
	};
};

export default useStore;
