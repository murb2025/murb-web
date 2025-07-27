import EventEmitter from "events";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOption";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { prisma } from "@/server/db";
import { isAdminEmailServer } from "./helper/route.helper";
// import { type Server as SocketIOServer } from "socket.io";

const ee = new EventEmitter();

export const createTRPCContext = async (opts: { req: Request; res: Response }) => {
	const session = await getServerSession(authOptions);

	return {
		prisma,
		session,
		req: opts.req,
		res: opts.res,
		ee,
	};
};

const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
			},
		};
	},
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(
	t.middleware(({ ctx, next }) => {
		if (!ctx.session?.user) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Not authenticated",
			});
		}
		return next();
	}),
);
export const adminProcedure = t.procedure.use(
	t.middleware(({ ctx, next }) => {
		if (!ctx.session?.user) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Not authenticated",
			});
		}
		if (!isAdminEmailServer(ctx.session?.user?.email ?? "")) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Not enough permission",
			});
		}
		return next();
	}),
);

// export const createContext = async (
//   opts?:
//     | trpcNext.CreateNextContextOptions
//     | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>
// ) => {
//   const req = opts?.req;
//   const res = opts?.res;

//   const session = req && res && (await getSession({ req }));

//   return {
//     req,
//     res,
//     session,
//     prisma,
//     ee,
//   };
// };
