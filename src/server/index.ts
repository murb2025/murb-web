import { router } from "@/server/trpc";
import { userRouter } from "@/server/router/user";
import { authRouter } from "@/server/router/auth";
import { emailRouter } from "@/server/router/email";
import { eventRouter } from "@/server/router/event";
import { chatRouter } from "@/server/router/chat";
import { feedbackRouter } from "@/server/router/feedback";
import { bookingRouter } from "@/server/router/booking";
import { adminRouter } from "@/server/router/admin";
import { bookmarkRouter } from "@/server/router/bookmark";
import { featuredRouter } from "@/server/router/featured";
import { promotionRouter } from "@/server/router/package-addon";
import { trendingRouter } from "@/server/router/trending";
import { waNotifierRouter } from "@/server/router/wa-notifier";
import { notificationRouter } from "@/server/router/notification";
export const appRouter = router({
	user: userRouter,
	auth: authRouter,
	email: emailRouter,
	chat: chatRouter,
	event: eventRouter,
	feedback: feedbackRouter,
	booking: bookingRouter,
	admin: adminRouter,
	bookmark: bookmarkRouter,
	featured: featuredRouter,
	promotion: promotionRouter,
	trending: trendingRouter,
	waNotifier: waNotifierRouter,
	notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
