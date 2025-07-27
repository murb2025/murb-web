"use client";
import React, { useState } from "react";
import { FAQItem } from "@/components/LandingPage/FAQItem";

const faqData = [
	{
		question: "What is Murb?",
		answer: (
			<>
				<p>
					Murb is a sports tech platform that allows users to book sports venues, certifications for sports,
					courses, workshops, training sessions, and personal instructors. Whether you&apos;re looking for a
					tennis court, a diving certification, or a yoga class, Murb has you covered.
				</p>
			</>
		),
	},
	{
		question: "How do I book a service on Murb?",
		answer: (
			<>
				<ul className="list-disc list-inside">
					<li>Sign up or log in to your Murb account.</li>
					<li>
						Browse the available services or use the search bar to find a specific venue, course, or
						instructor.
					</li>
					<li>Select your desired option, confirm the details, and proceed to payment.</li>
					<li>You will receive a confirmation once the booking is complete.</li>
				</ul>
			</>
		),
	},
	{
		question: "What types of services can I book on Murb?",
		answer: (
			<>
				<p>You can book:</p>
				<ul className="list-disc list-inside">
					<li>Sports venues like tennis courts, turfs, and swimming pools.</li>
					<li>Certifications for sports courses such as open water diving and yoga instructor training.</li>
					<li>Workshops and training sessions for sports like horse riding, tennis, and more.</li>
					<li>Personal yoga instructors or trainers.</li>
				</ul>
			</>
		),
	},
	{
		question: "How are payments processed?",
		answer: (
			<>
				<p>
					Payments are processed securely through our trusted third-party payment gateways. We accept various
					payment methods, including credit/debit cards, UPI, and net banking.
				</p>
			</>
		),
	},
	{
		question: "Can I cancel or reschedule a booking?",
		answer: (
			<>
				<p>
					<ul>
						<li>Users are not allowed to cancel bookings.</li>
					</ul>
				</p>
			</>
		),
	},
	{
		question: "How do I become a vendor on Murb?",
		answer: (
			<>
				<p>
					If you are a service provider, you can sign up as a vendor on Murb. Create a vendor account, list
					your services, and manage bookings directly through our platform. For assistance, email us at{" "}
					<a href="mailto:communication@murb.in">communication@murb.in</a>.
				</p>
			</>
		),
	},
	{
		question: "Does Murb offer customer support?",
		answer: (
			<>
				<p>
					Yes, our customer support team is here to help. You can reach us via email at{" "}
					<a href="mailto:communication@murb.in">
						<strong>communication@murb.in</strong>
					</a>{" "}
					or via phone at{" "}
					<a href="tel:+919163118752">
						<strong>+91 91631-18752</strong>
					</a>
					.
				</p>
			</>
		),
	},
	{
		question: "Is my personal information secure on Murb?",
		answer: (
			<>
				<p>
					Absolutely. We use industry-standard security measures to protect your data. For more information,
					please refer to our Privacy Policy.
				</p>
			</>
		),
	},
	{
		question: "Can I provide feedback on the services I book?",
		answer: (
			<>
				<p>
					Yes, we encourage users to leave reviews and ratings for services they book. Your feedback helps us
					maintain quality and improve our offerings.
				</p>
			</>
		),
	},
	{
		question: "Does Murb offer discounts or promotions?",
		answer: (
			<>
				<p>
					We frequently offer discounts and promotions on various services. Keep an eye on our website or
					subscribe to our newsletter for updates.
				</p>
			</>
		),
	},
	{
		question: "Can I book services for a group?",
		answer: (
			<>
				<p>
					Yes, group bookings are available for many services. Check the specific service details for group
					booking options or contact support for assistance.
				</p>
			</>
		),
	},
	{
		question: "How do I report an issue with a service or vendor?",
		answer: (
			<>
				<p>
					If you encounter any issues, please contact our support team with the details. We&apos;ll work to
					resolve the matter promptly.
				</p>
			</>
		),
	},
	{
		question: "What is Murb's refund policy?",
		answer: (
			<p>
				<ul className="list-disc list-inside">
					<li>Refunds will only be provided if the vendor cancels the booking.</li>
					<li>
						If you are unable to attend, you may forward your ticket to someone else, allowing them to use
						the booking on your behalf.
					</li>
				</ul>
			</p>
		),
	},
	{
		question: "What is the refund timeline?",
		answer: <p>Refund will be processed within 7 working days.</p>,
	},
	{
		question: "Can I save favorite services for future bookings?",
		answer: (
			<>
				<p>Yes, you can add services to your favorites list for quick access and future bookings.</p>
			</>
		),
	},
	{
		question: "What is the refund timeline?",
		answer: <p>Refund will be processed within 7 working days.</p>,
	},
	{
		question: "What happens if I try to book a service outside the Murb platform?",
		answer: (
			<>
				<p>
					At Murb, we strive to provide a secure and streamlined booking experience. To maintain the integrity
					of our platform, we have a strict policy against booking services outside of Murb.
				</p>
				<p>If you attempt to book a service outside the platform, your account will be subject to:</p>
				<ul className="list-disc list-inside">
					<li>
						<strong>Immediate Suspension:</strong> Your account will be temporarily or permanently
						suspended, depending on the severity of the infraction.
					</li>
					<li>
						<strong>Loss of Account Privileges:</strong> You may lose access to your account, including your
						booking history, favorites, and other benefits.
					</li>
				</ul>
			</>
		),
	},
	{
		question:
			"What are the consequences for a vendor if they cancel a booking or take it outside the Murb platform?",
		answer: (
			<>
				<p>
					As a valued vendor on the Murb platform, we encourage you to honor your bookings and commitments.
					However, we understand that unforeseen circumstances may arise.
				</p>
				<p>Please note the following:</p>
				<ul className="list-disc list-inside">
					<li>
						<strong>Cancellation Penalty:</strong> If you need to cancel a booking, a penalty fee of 3000
						will be applied to your account.
					</li>
					<li>
						<strong>Off-Platform Booking Policy:</strong> We kindly request that you do not take bookings
						outside the Murb platform. If you do so, your listing may be temporarily pushed down in search
						results. Repeated instances may lead to further action, up to and including account suspension.
					</li>
				</ul>
			</>
		),
	},
	{
		question: "How do I update my profile information?",
		answer: (
			<>
				<p>
					You can update your profile information by logging into your account, navigating to your profile
					settings, and editing the necessary details.
				</p>
			</>
		),
	},
	{
		question: "Can I share my booking with others?",
		answer: (
			<>
				<p>
					Yes, you can share your booking details with others through the app or by forwarding the
					confirmation email.
				</p>
			</>
		),
	},
	{
		question: "How do I reset my password?",
		answer: (
			<>
				<p>
					To reset your password, click on &apos;Forgot Password&apos; on the login page, and follow the
					instructions to create a new password.
				</p>
			</>
		),
	},
	{
		question: "Can I filter services by location?",
		answer: (
			<>
				<p>Yes, you can use location filters to find services near you.</p>
			</>
		),
	},
	{
		question: "Does Murb support multilingual options?",
		answer: (
			<>
				<p>Currently, Murb supports English, but we plan to introduce more language options soon.</p>
			</>
		),
	},
	{
		question: "What should I do if I forget my account email?",
		answer: (
			<>
				<p>
					Contact our support team with your registered phone number or other details to retrieve your account
					email.
				</p>
			</>
		),
	},
	{
		question: "How do I delete my Murb account?",
		answer: (
			<>
				<p>
					To delete your account, please contact our support team with your request. Note that this action is
					irreversible.
				</p>
			</>
		),
	},
	{
		question: "Are there age restrictions for booking services?",
		answer: (
			<>
				<p>
					Age restrictions vary depending on the service. Check the service details for specific age
					requirements.
				</p>
			</>
		),
	},
	{
		question: "Can I book recurring sessions?",
		answer: (
			<>
				<p>Yes, some services offer recurring session options. Check the details on the service page.</p>
			</>
		),
	},
	{
		question: "Does Murb have a referral program?",
		answer: (
			<>
				<p>
					Yes, Murb offers a referral program where you can earn rewards by referring friends to join and book
					services.
				</p>
			</>
		),
	},
	{
		question: "What happens if a vendor cancels my booking?",
		answer: (
			<>
				<p>
					If a vendor cancels your booking, you will receive a full refund or the option to reschedule,
					depending on your preference.
				</p>
			</>
		),
	},
	{
		question: "Can I gift a booking to someone else?",
		answer: (
			<>
				<p>
					Yes, Murb allows you to gift bookings. Select the gifting option during checkout, and provide the
					recipient&apos;s details.
				</p>
			</>
		),
	},
	{
		question: "Does Murb support corporate bookings?",
		answer: (
			<>
				<p>
					Yes, Murb offers corporate booking options for events, team-building activities, and more. Contact
					our support team for details.
				</p>
			</>
		),
	},
	{
		question: "What should I do if I encounter a technical issue on Murb?",
		answer: (
			<>
				<p>
					If you experience technical issues, try refreshing the page or clearing your browser cache. If the
					issue persists, contact our support team for assistance.
				</p>
			</>
		),
	},
	{
		question: "Are there special accommodations for differently-abled individuals?",
		answer: (
			<>
				<p>
					Many of our listed services provide accommodations for differently-abled individuals. Look for
					accessibility tags or contact vendors for specific details.
				</p>
			</>
		),
	},
	{
		question: "How does Murb ensure the quality of services?",
		answer: (
			<>
				<p>
					We vet our vendors and monitor user reviews to maintain service quality. Your feedback plays a
					crucial role in this process.
				</p>
			</>
		),
	},
];

export function FAQ() {
	const [showAll, setShowAll] = useState(false);

	return (
		<section
			id="FAQ"
			className="py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-10 my-8 sm:my-12 md:my-16 lg:my-20 bg-white w-full flex flex-col items-center scroll-mt-24"
		>
			<div className="w-full flex flex-col items-center justify-center sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%] px-2 sm:px-3 md:px-4">
				<h2 className="text-2xl sm:text-2.5xl md:text-3xl font-bold text-center text-black mb-6 sm:mb-7 md:mb-8 lg:mb-10">
					Frequently Asked Question (FAQ)
				</h2>
				<div className="w-full grid gap-2 sm:gap-2.5 md:gap-3">
					{faqData.slice(0, showAll ? faqData.length : 4).map((faq, index) => (
						<FAQItem key={index} question={faq.question} answer={faq.answer} />
					))}
					{faqData.length > 4 && (
						<button
							onClick={() => setShowAll(!showAll)}
							className="mt-3 sm:mt-4 md:mt-5 lg:mt-6 text-sm sm:text-base md:text-lg text-[#c3996b] hover:text-[#c3996b]/80 font-medium underline underline-offset-4 outline-gray-200 transition-colors"
						>
							{showAll ? "Show Less" : "See More"}
						</button>
					)}
				</div>
			</div>
		</section>
	);
}
