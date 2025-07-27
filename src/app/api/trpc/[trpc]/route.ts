import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server";
import { createTRPCContext } from "@/server/trpc";

const handler = async (req: Request) => {
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: async () =>
			createTRPCContext({
				req,
				res: new Response(),
			}),
	});
};

export { handler as GET, handler as POST };
