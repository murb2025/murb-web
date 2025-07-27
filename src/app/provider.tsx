"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState, useEffect } from "react";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server";
import SuperJSON from "superjson";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { CustomProvider } from "rsuite";
import AOS from "aos";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "@/context";
import React from "react";

import "aos/dist/aos.css";
import "rsuite/dist/rsuite-no-reset.min.css";
import "./globals.css";
import LogoLoader from "@/components/LogoLoader";

export const trpc = createTRPCReact<AppRouter>();

export default function Providers({ children }: { children: React.ReactNode }) {
	const [isClient, setIsClient] = useState(false);
	const [queryClient] = useState(() => new QueryClient());
	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: "/api/trpc",
				}),
			],
			transformer: SuperJSON,
		}),
	);

	useEffect(() => {
		setIsClient(true);
		AOS.init();
	}, []);

	return (
		<Provider store={store}>
			<PersistGate loading={<LogoLoader />} persistor={persistor}>
				<trpc.Provider client={trpcClient} queryClient={queryClient}>
					<QueryClientProvider client={queryClient}>
						<SessionProvider>
							<CustomProvider>{isClient ? children : <LogoLoader />}</CustomProvider>
						</SessionProvider>
					</QueryClientProvider>
				</trpc.Provider>
			</PersistGate>
		</Provider>
	);
}
