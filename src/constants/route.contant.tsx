const routes = Object.freeze({
	HOME: "/dashboard",
	LOGIN: "/login",
	CREATEACCOUNT: "/signup",
	CREATEEVENT: "/event/create",
	CALENDAR: "/calendar",
	ONBOARDING: "/account/onboarding",
	EVENTS: "/dashboard/events",
	FEEDBACK: "/dashboard/feedbacks",
	BUYER: "/dashboard/buyer",
	DETAILS: "/dashboard/events/details/*",
	MESSAGES: "/dashboard/messages/[userId]",
	PROMOTIONS: "/dashboard/promotions",
	SETTINGS: "/settings",
	ADMINHOMEPAGE: "/admin/dashboard",
});

export const dashboardRoutes = Object.freeze({
	HOME: routes.HOME,
	CALENDAR: routes.CALENDAR,
	FEEDBACK: routes.FEEDBACK,
	EVENTS: routes.EVENTS,
	DETAILS: routes.DETAILS,
	BUYER: routes.BUYER,
	MESSAGES: routes.MESSAGES,
	PROMOTIONS: routes.PROMOTIONS,
});

export const adminDashboardRoutes = Object.freeze({
	ADMINHOMEPAGE: routes.ADMINHOMEPAGE,
	CALENDAR: routes.CALENDAR,
	FEEDBACK: routes.FEEDBACK,
	EVENTS: routes.EVENTS,
	DETAILS: routes.DETAILS,
	BUYER: routes.BUYER,
	MESSAGES: routes.MESSAGES,
	PROMOTIONS: routes.PROMOTIONS,
});

export const onboardingRoutes = Object.freeze({
	LOGIN: routes.LOGIN,
	CREATEACCOUNT: routes.CREATEACCOUNT,
	CREATEEVENT: routes.CREATEEVENT,
	ONBOARDING: routes.ONBOARDING,
});

export default routes;
