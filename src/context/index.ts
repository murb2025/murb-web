import reducers from "@/context/slices";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";

const persistConfig = {
	key: "root",
	storage,
	version: 1,
	migrate: (state: any) => {
		if (!state || !state._persist || !state._persist.version) {
			return Promise.resolve(undefined);
		}
		if (state._persist.version === 1) {
			return Promise.resolve(state);
		}
		return Promise.resolve(undefined);
	},
	//   whitelist: ['venue'] // if you want to add specific slice
};

const combinedReducers = combineReducers(reducers);
const persistedReducer = persistReducer(persistConfig, combinedReducers);

const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

export const persistor = persistStore(store);
export default store;
