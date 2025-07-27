"use client";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import React, { useEffect, useState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { IoIosArrowBack } from "react-icons/io";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/app/provider";
import UploadImgGetUrl from "@/components/common/UploadImgGetUrl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z
	.object({
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		email: z.string().email("Invalid email format"),
		mobileNumber: z.string(),
		recoveryEmail: z.string().email("Invalid recovery email format").nullable().or(z.literal("")), // Allows empty value
		emergencyMobileNumber: z.string().nullable().or(z.literal("")), // Allows empty value
		address: z.string().optional(),
	})
	.refine((data) => data.email !== data.recoveryEmail, {
		message: "Recovery email must be different from primary email",
		path: ["recoveryEmail"],
	})
	.refine((data) => data.mobileNumber !== data.emergencyMobileNumber, {
		message: "Emergency number must be different from primary number",
		path: ["emergencyMobileNumber"],
	})
	.refine((data) => isValidPhoneNumber(data.mobileNumber), {
		message: "Invalid mobile number",
		path: ["mobileNumber"],
	})
	.refine((data) => (data.emergencyMobileNumber ? isValidPhoneNumber(data.emergencyMobileNumber) : true), {
		message: "Invalid emergency number",
		path: ["emergencyMobileNumber"],
	});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage = () => {
	const [hasChanges, setHasChanges] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState("");
	const [isAvatarChanged, setIsAvatarChanged] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		mode: "onChange",
	});

	const utils = trpc.useContext();

	const { mutateAsync: updateUser, isLoading: isUpdateUserLoading } = trpc.user.updateBuyerProfile.useMutation({
		onSuccess: () => {
			toast.success("Profile updated successfully");
			setHasChanges(false);
			setIsAvatarChanged(false);
			utils.user.getBuyerProfile.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Error updating profile");
		},
	});

	const { data: userData, isLoading: isLoadingUser } = trpc.user.getBuyerProfile.useQuery();

	useEffect(() => {
		if (userData && !isAvatarChanged) {
			reset({
				firstName: userData.firstName || "",
				lastName: userData.lastName || "",
				email: userData.email || "",
				recoveryEmail: userData.buyer?.recoveryEmail || "",
				mobileNumber: userData.mobileNumber || "",
				emergencyMobileNumber: userData.buyer?.emergencyMobileNumber || "",
				address: userData.buyer?.address || "", // Address is now optional
			});
			setAvatarUrl(userData.avatarUrl || "");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData, reset]);

	const onSubmit = async (data: ProfileFormData) => {
		try {
			await updateUser({
				firstName: data.firstName,
				lastName: data.lastName,
				mobileNumber: data.mobileNumber,
				recoveryEmail: data.recoveryEmail || "",
				emergencyMobileNumber: data.emergencyMobileNumber || "",
				address: data.address || "", // Address is now optional
				avatarUrl: avatarUrl,
			});
		} catch (err) {
			console.error(err);
			// toast.error("An error occurred while saving");
		}
	};

	const handleInputChange = () => {
		setHasChanges(true);
	};

	if (isLoadingUser) {
		return (
			<div className="min-h-screen grid place-items-center">
				<Loader className="w-10 h-10 animate-spin" />
			</div>
		);
	}

	return (
		<>
			<div className="hidden">
				<Link href="/">
					<Button variant="ghost" className="mb-6">
						<IoIosArrowBack className="mr-2 h-4 w-4" />
						Back
					</Button>
				</Link>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row items-center gap-4">
						<div className="relative">
							<UploadImgGetUrl
								initialImageUrl={avatarUrl}
								onFileUpload={(url) => {
									setAvatarUrl(url);
									setIsAvatarChanged(true);
									setHasChanges(true);
								}}
							/>
						</div>
						<div className="text-center md:text-left">
							<h2 className="text-xl md:text-2xl font-bold">Profile Information</h2>
							<p className="text-muted-foreground">Update your profile details</p>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(onSubmit)}
						onChange={handleInputChange}
						className="grid gap-4 md:gap-6"
					>
						{hasChanges && (
							<div className="flex justify-end">
								<Button type="submit" variant={"outline"} disabled={isUpdateUserLoading}>
									{isUpdateUserLoading ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						)}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="firstName">First Name</Label>
								<Input
									id="firstName"
									{...register("firstName")}
									className={`mt-1 ${errors.firstName ? "border-red-500" : ""}`}
								/>
								{errors.firstName && (
									<p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
								)}
							</div>
							<div>
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									id="lastName"
									{...register("lastName")}
									className={`mt-1 ${errors.lastName ? "border-red-500" : ""}`}
								/>
								{errors.lastName && (
									<p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
								)}
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									{...register("email")}
									type="email"
									disabled={true}
									className="mt-1"
								/>
							</div>

							<div>
								<Label htmlFor="recoveryEmail">Recovery Email</Label>
								<Input
									id="recoveryEmail"
									{...register("recoveryEmail")}
									type="email"
									className={`mt-1 ${errors.recoveryEmail ? "border-red-500" : ""}`}
								/>
								{errors.recoveryEmail && (
									<p className="text-red-500 text-sm mt-1">{errors.recoveryEmail.message}</p>
								)}
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="mobileNumber">Mobile Number</Label>
								<div className="mt-2 border border-gray-300 rounded-md">
									<PhoneInput
										placeholder="Enter phone number"
										defaultCountry="IN"
										value={watch("mobileNumber")}
										className="bg-white w-full px-2 rounded flex focus:outline-none focus:border-[#DAC0A3] h-12 border border-transparent text-sm md:text-base text-[#8E7777]"
										onChange={(value) => setValue("mobileNumber", value ?? "")}
									/>
								</div>
								{errors.mobileNumber && (
									<p className="text-red-500 text-sm mt-1">{errors.mobileNumber.message}</p>
								)}
							</div>

							<div>
								<Label htmlFor="emergencyMobileNumber">Emergency Mobile Number</Label>
								<div className="mt-2 border border-gray-300 rounded-md">
									<PhoneInput
										placeholder="Enter phone number"
										defaultCountry="IN"
										value={watch("emergencyMobileNumber") || ""}
										className="bg-white w-full px-2 rounded flex focus:outline-none focus:border-[#DAC0A3] h-12 border border-transparent text-sm md:text-base text-[#8E7777]"
										onChange={(value) => setValue("emergencyMobileNumber", value ?? "")}
									/>
								</div>
								{errors.emergencyMobileNumber && (
									<p className="text-red-500 text-sm mt-1">{errors.emergencyMobileNumber.message}</p>
								)}
							</div>
						</div>

						<div>
							<Label htmlFor="address">Address</Label>
							<Input
								id="address"
								{...register("address")}
								className={`mt-1 ${errors.address ? "border-red-500" : ""}`}
							/>
							{errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
						</div>
					</form>
				</CardContent>
			</Card>
		</>
	);
};

export default ProfilePage;
