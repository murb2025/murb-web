"use client";
import React, { useEffect, useState } from "react";
import { Button, Input, Label } from "@/components/ui";
import Typography from "@/components/Typography";
import Image from "next/image";
import { IoIosArrowBack } from "react-icons/io";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/provider";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { Loader } from "lucide-react";
import UploadImgGetUrl from "@/components/common/UploadImgGetUrl";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
	const { data: UserData, refetch: refetchUserData, isLoading } = trpc.user.getUser.useQuery();
	const userData = UserData?.user;

	const { data: session, update } = useSession();

	const [isEditing, setIsEditing] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	const [frontUrl, setFrontUrl] = useState<string | null>(userData?.vendor?.govermentPhotoIdUrls?.[0] || null);
	const [backUrl, setBackUrl] = useState<string | null>(userData?.vendor?.govermentPhotoIdUrls?.[1] || null);
	// const [photoUrl, setPhotoUrl] = useState<string>(userData?.vendor?.govermentPhotoIdUrls?.[2] || "");
	const [avatarUrl, setAvatarUrl] = useState<string | null>(userData?.avatarUrl || null);
	const [fullName, setFullName] = useState(`${userData?.firstName || ""} ${userData?.lastName || ""}`);
	const [formData, setFormData] = useState({
		firstName: userData?.firstName || "",
		lastName: userData?.lastName || "",
		email: userData?.email || "",
		mobileNumber: userData?.mobileNumber || "",
		aadharNumber: userData?.vendor?.aadharNumber || "",
		panNumber: userData?.vendor?.panNumber || "",
		bankAccountNumber: userData?.vendor?.bankAccountNumber || "",
		ifscCode: userData?.vendor?.ifscCode || "",
		gstNumber: userData?.vendor?.gstNumber || "",
		accountStatus: userData?.accountStatus || "UNVERIFIED",
	});

	useEffect(() => {
		if (userData) {
			setFormData({
				firstName: userData.firstName || "",
				lastName: userData.lastName || "",
				email: userData.email || "",
				mobileNumber: userData.mobileNumber || "",
				aadharNumber: userData.vendor?.aadharNumber || "",
				panNumber: userData.vendor?.panNumber || "",
				bankAccountNumber: userData.vendor?.bankAccountNumber || "",
				ifscCode: userData.vendor?.ifscCode || "",
				gstNumber: userData.vendor?.gstNumber || "",
				accountStatus: userData.accountStatus || "UNVERIFIED",
			});
			setFullName(`${userData.firstName || ""} ${userData.lastName || ""}`);
			// Only set these URLs if we're not in editing mode
			if (!isEditing) {
				setFrontUrl(userData.vendor?.govermentPhotoIdUrls?.[0] || null);
				setBackUrl(userData.vendor?.govermentPhotoIdUrls?.[1] || null);
				setAvatarUrl(userData.avatarUrl || null);
			}
		}
	}, [userData, isEditing]);

	const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
	const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
	const bankAccountRegex = /^[0-9]{9,18}$/;
	const aadharRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
	const mobileRegex = /^\d{10}$/;
	const gstRegex = /^[A-Z0-9]{15}$/;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const router = useRouter();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		setHasChanges(true);
	};

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.target.value = e.target.value.replace(/[^0-9]/g, "");
	};

	const updateUserMutation = trpc.user.updateUser.useMutation({
		onSuccess: () => {
			toast.success("Profile updated successfully");
			setIsEditing(false);
			setHasChanges(false);
			refetchUserData();
			update({
				user: {
					...session?.user,
					vendor: {
						...session?.user.vendor,
					},
				},
			});
		},
		onError: (error) => {
			toast.error(error.message || "Error updating profile");
			console.error(error);
		},
	});

	const handleSubmit = async () => {
		// Email validation
		if (!emailRegex.test(formData.email)) {
			toast.error("Please enter a valid email address");
			return;
		}

		// Validation checks
		if (!formData.ifscCode) {
			toast.error("Please enter IFSC Code");
			return;
		}

		if (!formData.panNumber) {
			toast.error("Please enter PAN/TAN Number");
			return;
		}

		if (!formData.bankAccountNumber) {
			toast.error("Please enter Bank Account Number");
			return;
		}

		if (!formData.aadharNumber) {
			toast.error("Please enter Aadhar Number");
			return;
		}

		if (!formData.mobileNumber) {
			toast.error("Please enter Contact Number");
			return;
		}

		// if (!formData.gstNumber) {
		// 	toast.error("Please enter GST Number");
		// 	return;
		// }

		if (!ifscRegex.test(formData.ifscCode)) {
			toast.error("Invalid IFSC Code");
			return;
		}
		if (!panRegex.test(formData.panNumber)) {
			toast.error("Invalid PAN/TAN Number");
			return;
		}
		if (!bankAccountRegex.test(formData.bankAccountNumber)) {
			toast.error("Invalid Bank Account Number");
			return;
		}
		if (!aadharRegex.test(formData.aadharNumber)) {
			toast.error("Invalid Aadhar Number");
			return;
		}
		if (!isValidPhoneNumber(formData.mobileNumber)) {
			toast.error("Invalid Contact Number");
			return;
		}
		if (formData.gstNumber !== "" && !gstRegex.test(formData.gstNumber)) {
			toast.error("Invalid GST Number");
			return;
		}

		try {
			updateUserMutation.mutate({
				id: userData?.id!,
				payload: {
					firstName: formData.firstName,
					lastName: formData.lastName,
					email: formData.email,
					mobileNumber: formData.mobileNumber,
					avatarUrl: avatarUrl || userData?.avatarUrl || "",
					aadharNumber: formData.aadharNumber,
					panNumber: formData.panNumber,
					bankAccountNumber: formData.bankAccountNumber,
					ifscCode: formData.ifscCode,
					gstNumber: formData.gstNumber,
					govermentPhotoIdUrls: [frontUrl, backUrl],
					accountStatus: userData?.accountStatus === "VERIFIED" ? "UNVERIFIED" : formData.accountStatus,
				},
			});
		} catch (err) {
			console.error(err);
		}
	};

	const [errors, setErrors] = useState({
		ifscCode: "",
		panNumber: "",
		aadharNumber: "",
		bankAccountNumber: "",
		gstNumber: "",
		mobileNumber: "",
		firstName: "",
		lastName: "",
		email: "",
	});

	const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

	const validationPatterns = {
		ifscCode: /^[A-Z]{4}0[A-Z0-9]{6}$/,
		panNumber: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
		bankAccountNumber: /^[0-9]{9,18}$/,
		aadharNumber: /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/,
		mobileNumber: /^\d{10}$/,
		gstNumber: /^[A-Z0-9]{15}$/,
		email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	};

	const validateField = (fieldName: string, value: string) => {
		let errorMessage = "";

		if (!value && fieldName !== "gstNumber") {
			errorMessage = "This field is required";
		} else if (value) {
			switch (fieldName) {
				case "email":
					if (!validationPatterns.email.test(value)) {
						errorMessage = "Invalid email format";
					}
					break;
				case "ifscCode":
					if (!validationPatterns.ifscCode.test(value)) {
						errorMessage = "Invalid IFSC Code format (e.g., HDFC0123456)";
					}
					break;
				case "panNumber":
					if (!validationPatterns.panNumber.test(value)) {
						errorMessage = "Invalid PAN Number format (e.g., ABCDE1234F)";
					}
					break;
				case "aadharNumber":
					if (!validationPatterns.aadharNumber.test(value)) {
						errorMessage = "Invalid Aadhar Number format (12 digits)";
					}
					break;
				case "bankAccountNumber":
					if (!validationPatterns.bankAccountNumber.test(value)) {
						errorMessage = "Invalid Bank Account Number (9-18 digits)";
					}
					break;
				case "gstNumber":
					if (value && !validationPatterns.gstNumber.test(value)) {
						errorMessage = "Invalid GST Number format (15 characters)";
					}
					break;
				case "mobileNumber":
					if (!validationPatterns.mobileNumber.test(value)) {
						errorMessage = "Invalid Mobile Number (10 digits)";
					}
					break;
			}
		}

		setErrors((prev) => ({
			...prev,
			[fieldName]: errorMessage,
		}));

		return errorMessage === "";
	};

	const handleInputFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]: value,
		}));

		if (touchedFields[id]) {
			validateField(id, value);
		}
		setHasChanges(true);
	};

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setTouchedFields((prev) => ({
			...prev,
			[id]: true,
		}));
		validateField(id, value);
	};

	if (isLoading) {
		return (
			<div className="flex h-screen justify-center items-center">
				<Loader className="w-6 h-6 animate-spin" />
			</div>
		);
	}

	return (
		<div className="w-full min-h-screen flex flex-col">
			<div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-[100px] mb-[40px] bg-white mt-[96px]">
				<Button
					variant="ghost"
					className="hover:bg-transparent font-regular align-left w-fit px-0 hover:scale-95 transition-all ease duration-300 mb-6"
					onClick={() => {
						router.push("/vendor/dashboard");
					}}
				>
					<IoIosArrowBack className="w-5 h-5 sm:w-6 sm:h-6 mr-1 font-normal" />
					<p className="text-base sm:text-[20px] font-normal">Back</p>
				</Button>

				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
					{/* <div className="flex items-center gap-2"> */}
					<div className="flex md:flex-row flex-col justify-between gap-4 w-full">
						{isEditing ? (
							<div className="w-full flex md:flex-row flex-col gap-2">
								<input
									type="text"
									name="firstName"
									value={formData.firstName}
									onChange={handleInputChange}
									className="text-xl sm:text-[28px] font-bold border rounded-md border-[#DAC0A3] px-2 py-1 focus:outline-none focus:border-[#DAC0A3] w-full"
								/>
								<input
									type="text"
									name="lastName"
									value={formData.lastName}
									onChange={handleInputChange}
									className="text-xl sm:text-[28px] font-bold border rounded-md border-[#DAC0A3] px-2 py-1 focus:outline-none focus:border-[#DAC0A3] w-full"
								/>
							</div>
						) : (
							<h1 className="leading-[120%] text-xl sm:text-[28px] font-bold">{fullName}</h1>
						)}
						<div className="flex items-center gap-2 mt-1">
							<span
								className={`text-sm ${userData?.accountStatus === "VERIFIED" ? "text-green-600" : "text-orange-500"}`}
							>
								{userData?.accountStatus === "VERIFIED" ? "Verified" : "Unverified"}
							</span>
							{!isEditing ? (
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsEditing(true)}
									className="text-sm"
								>
									Edit Profile
								</Button>
							) : (
								<div className="flex gap-2">
									<Button variant="outline" size="sm" onClick={handleSubmit} className="text-sm">
										{updateUserMutation.isLoading ? (
											<Loader className="w-4 h-4 animate-spin" />
										) : (
											"Save Changes"
										)}
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setIsEditing(false);
											setHasChanges(false);
											// Reset form data and avatar URL to original values
											if (userData) {
												setFormData({
													firstName: userData.firstName || "",
													lastName: userData.lastName || "",
													email: userData.email || "",
													mobileNumber: userData.mobileNumber || "",
													aadharNumber: userData.vendor?.aadharNumber || "",
													panNumber: userData.vendor?.panNumber || "",
													bankAccountNumber: userData.vendor?.bankAccountNumber || "",
													ifscCode: userData.vendor?.ifscCode || "",
													gstNumber: userData.vendor?.gstNumber || "",
													accountStatus: userData.accountStatus || "UNVERIFIED",
												});
												setAvatarUrl(userData.avatarUrl || null);
											}
										}}
										className="text-sm"
									>
										Cancel
									</Button>
								</div>
							)}
						</div>
					</div>
					{/* </div> */}
				</div>

				<div className="space-y-4 sm:space-y-6">
					<div className="bg-[#F6EFE8] p-4 sm:p-6 rounded-[20px] border border-[#DAC0A3]">
						<div className="space-y-4">
							<h1 className="text-xl sm:text-[28px] font-semibold mb-4 sm:mb-6">Personal Info</h1>

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-[50px]">
								{/* Left Column */}
								<div className="space-y-4">
									<div>
										<Label htmlFor="email">
											<Typography className="text-base sm:text-[18px] text-[#1F1F1F] font-medium">
												Email
											</Typography>
										</Label>
										<Input
											id="email"
											type="email"
											value={formData.email}
											onChange={handleInputFieldChange}
											onBlur={handleBlur}
											disabled={true}
											className={`bg-white mt-2 w-full shadow-md focus:outline-none focus:border-[#DAC0A3] border ${
												errors.email && touchedFields.email
													? "border-red-500"
													: "border-transparent"
											} text-sm sm:text-[16px] text-[#8E7777]`}
										/>
										{errors.email && touchedFields.email && (
											<p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>
										)}
									</div>

									<div>
										<Label htmlFor="mobileNumber">
											<Typography className="text-base sm:text-[18px] text-[#1F1F1F] font-medium">
												Mobile Number
											</Typography>
										</Label>
										{!isEditing ? (
											<Input
												id="mobileNumber"
												value={formData.mobileNumber}
												onChange={handleInputFieldChange}
												onBlur={handleBlur}
												disabled={!isEditing}
												className={`bg-white mt-2 w-full shadow-md focus:outline-none focus:border-[#DAC0A3] border 
												} text-sm sm:text-[16px] text-[#8E7777]`}
											/>
										) : (
											<div className="mt-2">
												<PhoneInput
													placeholder="Enter phone number"
													defaultCountry="IN"
													value={formData.mobileNumber}
													className="bg-white w-full px-2 rounded shadow-md flex focus:outline-none focus:border-[#DAC0A3] h-12 border border-transparent text-sm md:text-base text-[#8E7777]"
													onChange={(value) =>
														setFormData({ ...formData, mobileNumber: value ?? "" })
													}
												/>
												{formData.mobileNumber && isValidPhoneNumber(formData.mobileNumber) && (
													<span className="text-green-500">
														{isValidPhoneNumber(formData.mobileNumber)}
													</span>
												)}
											</div>
										)}
									</div>

									<div>
										<Label htmlFor="aadharNumber">
											<Typography className="text-base sm:text-[18px] text-[#1F1F1F] font-medium">
												Aadhar Number / Govt ID No.
											</Typography>
										</Label>
										<Input
											id="aadharNumber"
											type="tel"
											required
											value={formData.aadharNumber}
											onChange={handleInputFieldChange}
											disabled={!isEditing}
											className={`bg-white mt-2 w-full shadow-md focus:outline-none focus:border-[#DAC0A3] border ${
												errors.aadharNumber ? "border-red-500" : "border-transparent"
											} text-sm sm:text-[16px] text-[#8E7777]`}
										/>
										{errors.aadharNumber && (
											<p className="text-red-500 text-xs sm:text-sm mt-1">
												{errors.aadharNumber}
											</p>
										)}
									</div>

									<div>
										<Label htmlFor="panNumber">
											<Typography className="text-base sm:text-[18px] text-[#1F1F1F] font-medium">
												PAN / TAN no.
											</Typography>
										</Label>
										<Input
											id="panNumber"
											type="tel"
											required
											value={formData.panNumber}
											onChange={handleInputFieldChange}
											disabled={!isEditing}
											className={`bg-white mt-2 w-full shadow-md focus:outline-none focus:border-[#DAC0A3] border ${
												errors.panNumber ? "border-red-500" : "border-transparent"
											} text-sm sm:text-[16px] text-[#8E7777]`}
										/>
										{errors.panNumber && (
											<p className="text-red-500 text-xs sm:text-sm mt-1">{errors.panNumber}</p>
										)}
									</div>

									<div>
										<Label htmlFor="bankAccountNumber">
											<Typography className="text-base sm:text-[18px] text-[#1F1F1F] font-medium">
												Bank Account
											</Typography>
										</Label>
										<Input
											id="bankAccountNumber"
											type="tel"
											required
											value={formData.bankAccountNumber}
											onChange={handleInputFieldChange}
											onInput={handleInput}
											disabled={!isEditing}
											className={`bg-white mt-2 w-full shadow-md focus:outline-none focus:border-[#DAC0A3] border ${
												errors.bankAccountNumber ? "border-red-500" : "border-transparent"
											} text-sm sm:text-[16px] text-[#8E7777]`}
										/>
										{errors.bankAccountNumber && (
											<p className="text-red-500 text-xs sm:text-sm mt-1">
												{errors.bankAccountNumber}
											</p>
										)}
									</div>

									<div>
										<Label htmlFor="ifscCode">
											<Typography className="text-base sm:text-[18px] text-[#1F1F1F] font-medium">
												IFSC Code
											</Typography>
										</Label>
										<Input
											id="ifscCode"
											type="tel"
											required
											value={formData.ifscCode}
											onChange={handleInputFieldChange}
											onBlur={handleBlur}
											disabled={!isEditing}
											className={`bg-white mt-2 w-full shadow-md focus:outline-none focus:border-[#DAC0A3] border ${
												errors.ifscCode ? "border-red-500" : "border-transparent"
											} text-sm sm:text-[16px] text-[#8E7777]`}
										/>
										{errors.ifscCode && (
											<p className="text-red-500 text-xs sm:text-sm mt-1">{errors.ifscCode}</p>
										)}
									</div>

									<div>
										<Label htmlFor="gstNumber">
											<Typography className="text-base sm:text-[18px] text-[#1F1F1F] font-medium">
												GSTIN NO (optional)
											</Typography>
										</Label>
										<Input
											id="gstNumber"
											type="tel"
											value={formData.gstNumber}
											onChange={handleInputFieldChange}
											disabled={!isEditing}
											className={`bg-white mt-2 w-full shadow-md focus:outline-none focus:border-[#DAC0A3] border ${
												errors.gstNumber ? "border-red-500" : "border-transparent"
											} text-sm sm:text-[16px] text-[#8E7777]`}
										/>
										{errors.gstNumber && (
											<p className="text-red-500 text-xs sm:text-sm mt-1">{errors.gstNumber}</p>
										)}
									</div>
								</div>

								{/* Right Column */}
								<div className="space-y-4">
									<div className="bg-[#F6EFE8] mt-4 sm:mt-6">
										<h2 className="text-base sm:text-[18px] text-[#1F1F1F] font-medium">Proofs</h2>
										<div className="flex flex-col items-start gap-4 w-[300px]">
											{isEditing ? (
												<>
													<div className="">
														<p className="text-sm sm:text-base">Passport Size photo</p>
														<UploadImgGetUrl
															onFileUpload={(url) => {
																setAvatarUrl(url);
																setHasChanges(true);
															}}
															initialImageUrl={avatarUrl}
															type="square"
														/>
													</div>
													<div className="w-full">
														<p className="text-sm sm:text-base">Front Id</p>
														<UploadImgGetUrl
															onFileUpload={(url) => {
																setFrontUrl(url);
																console.log(url);
																setHasChanges(true);
															}}
															initialImageUrl={frontUrl}
															type="landscape"
														/>
													</div>
													<div className="w-full">
														<p className="text-sm sm:text-base">Back Id</p>
														<UploadImgGetUrl
															onFileUpload={(url) => {
																setBackUrl(url);
																setHasChanges(true);
															}}
															initialImageUrl={backUrl}
															type="landscape"
														/>
													</div>
												</>
											) : (
												<>
													<div className="w-full">
														<p className="text-sm sm:text-base">Passport Size photo</p>
														{avatarUrl ? (
															<section className="relative aspect-square h-40 md:h-48 rounded-lg">
																<Image
																	src={avatarUrl}
																	alt={"passport url"}
																	fill
																	className="w-full aspect-square h-full object-cover rounded-lg"
																/>
															</section>
														) : (
															<section className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
																<div className="text-center">
																	<p className="text-gray-500">
																		No Passport Size photo uploaded
																	</p>
																	<p className="text-sm text-gray-400 mt-1">
																		Please upload the passport size photo by
																		clicking on the Edit Profile button
																	</p>
																</div>
															</section>
														)}
													</div>
													<div className="w-full">
														<p className="text-sm sm:text-base">Front Id</p>
														{frontUrl ? (
															<section className="relative md:h-48 rounded-lg w-full md:w-96 aspect-video">
																<Image
																	src={frontUrl}
																	alt={"front url"}
																	fill
																	className="w-full aspect-video h-full object-cover rounded-lg"
																/>
															</section>
														) : (
															<section className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
																<div className="text-center">
																	<p className="text-gray-500">
																		No Front ID Image uploaded
																	</p>
																	<p className="text-sm text-gray-400 mt-1">
																		Please upload the front side of your ID document
																		by clicking on the Edit Profile button
																	</p>
																</div>
															</section>
														)}
													</div>
													<div className="w-full">
														<p className="text-sm sm:text-base">Back Id</p>
														{backUrl ? (
															<section className="relative aspect-video w-full sm:w-96 rounded-lg">
																<Image
																	src={backUrl}
																	alt={"backUrl url"}
																	fill
																	className="w-full aspect-video h-full object-cover rounded-lg"
																/>
															</section>
														) : (
															<section className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
																<div className="text-center">
																	<p className="text-gray-500">
																		No Back ID Image uploaded
																	</p>
																	<p className="text-sm text-gray-400 mt-1">
																		Please upload the back side of your ID document
																		by clicking on the Edit Profile button
																	</p>
																</div>
															</section>
														)}
													</div>
												</>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
