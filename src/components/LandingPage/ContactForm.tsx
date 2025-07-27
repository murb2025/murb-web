"use client";
import { Button, Input } from "@/components/ui";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { trpc } from "@/app/provider";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

export default function ContactForm() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		location: "",
	});

	const [status, setStatus] = useState({
		loading: false,
		error: null as string | null,
		success: false,
	});

	const { mutateAsync: sendOrganizerEmail } = trpc.email.sendOrganizerEmail.useMutation();
	const { data: session, update: updateSession } = useSession();

	useEffect(() => {
		setFormData({
			...formData,
			email: session?.user.email!,
			name: session?.user.firstName ? session?.user.firstName + " " + session?.user.lastName : "",
			phone: session?.user.mobileNumber!,
			location: session?.user.buyer?.address!,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus({ loading: true, error: null, success: false });
		if (!isValidPhoneNumber(formData.phone)) {
			setStatus({ loading: false, error: "Invalid phone number", success: false });
			toast.error("Invalid phone number");
			return;
		}

		try {
			const response = await sendOrganizerEmail({
				email: formData.email,
				name: formData.name,
				phone: formData.phone,
				location: formData.location,
			});

			if (response.success && response.user) {
				toast.success(response.message);
				setStatus({ loading: false, error: null, success: true });
				await updateSession({
					user: response.user,
				});
				// if (session?.user && session.user.email === formData.email) {
				// }
				setFormData({
					name: "",
					email: "",
					phone: "",
					location: "",
				});
			} else {
				setStatus({ loading: false, error: response.message, success: false });
				toast.error(response.message);
			}

			setTimeout(() => {
				setStatus((prev) => ({ ...prev, success: false }));
			}, 3000);
		} catch (error) {
			setStatus({
				loading: false,
				error: "Failed to send message. Please try again.",
				success: false,
			});
			toast.error("Failed to send message. Please try again.");
		}
	};

	if (session?.user && session.user.role !== "BUYER") {
		return null;
	}
	return (
		<div
			id="JOIN-THE-COMMUNITY"
			className="w-full flex flex-col items-center px-10 md:px-20 py-10 relative mt-10 scroll-mt-24"
		>
			{/* <div className="w-full  absolute top-0 left-0 z-[-10]"> */}
			<Image
				alt="background"
				src="/images/form.jpg"
				// width={1000}
				fill
				// height={705}
				className="w-full h-full"
			/>
			{/* </div> */}

			{status.success && (
				<div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg w-[55%]">
					Message sent successfully!
				</div>
			)}

			{status.error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg w-[55%]">{status.error}</div>}

			<form onSubmit={handleSubmit} className="flex flex-col gap-2 md:gap-4 w-full md:w-[60%] relative z-10">
				<h2 className="text-3xl font-semibold text-left relative z-10">Join as a Host!</h2>

				<div className="grid gap-x-8 gap-y-4 md:gap-y-6">
					<div>
						<label htmlFor="name" className="block text-xl mb-2">
							Name
						</label>
						<Input
							type="text"
							name="name"
							id="name"
							value={formData.name}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 shadow-sm h-[40px] text-[20px] rounded-lg focus:outline-none"
						/>
					</div>

					<div>
						<label htmlFor="email" className="block text-xl mb-2">
							Email Address
						</label>
						<Input
							type="email"
							name="email"
							id="email"
							value={formData.email}
							onChange={handleChange}
							required
							disabled={true}
							className="w-full px-3 py-2 shadow-sm h-[40px] text-[20px] rounded-lg focus:outline-none"
						/>
					</div>

					<div>
						<label htmlFor="phone" className="block text-xl mb-2">
							Phone Number
						</label>
						<div className="flex items-center gap-2 relative">
							<PhoneInput
								placeholder="Enter phone number"
								defaultCountry="IN"
								value={formData.phone}
								className="w-full px-3 py-2 shadow-sm h-[40px] text-[20px] placeholder:px-2 rounded-lg focus:outline-none"
								onChange={(value) => setFormData({ ...formData, phone: value ?? "" })}
							/>
							{formData.phone && isValidPhoneNumber(formData.phone) && (
								<span className="text-green-500">{isValidPhoneNumber(formData.phone)}</span>
							)}
						</div>
					</div>

					<div>
						<label htmlFor="location" className="block text-xl mb-2">
							Location
						</label>
						<Input
							type="text"
							name="location"
							id="location"
							value={formData.location}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 shadow-sm h-[40px] text-[20px] rounded-lg focus:outline-none"
						/>
					</div>

					{/* <div className="md:col-span-2">
						<label htmlFor="message" className="block text-xl mb-2">
							Message
						</label>
						<textarea
							name="message"
							id="message"
							rows={4}
							value={formData.message}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-[20px]"
						/>
					</div> */}
					<div className="text-center text-sm text-gray-500">
						By submitting this form, you agree to our{" "}
						<Link href="/terms-and-conditions" className="text-blue-500">
							Terms and Conditions
						</Link>{" "}
						and{" "}
						<Link href="/privacy-policy" className="text-blue-500">
							Privacy Policy
						</Link>
						.
					</div>
					<div className="flex justify-center">
						<Button
							type="submit"
							disabled={status.loading}
							className="w-24 py-2 px-4 text-[16px] bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
						>
							{status.loading ? "Sending..." : "Submit"}
						</Button>
					</div>
				</div>
				<section className="text-center text-sm text-gray-500">
					{status.error && <span className="text-red-500">{status.error}</span>}
				</section>
			</form>
		</div>
	);
}
