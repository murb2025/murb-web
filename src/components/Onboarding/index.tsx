"use client";
import React, { useState, useCallback, useEffect } from "react";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { Button, Input } from "@/components/ui";
import Typography from "@/components/Typography";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/app/provider";
import { IUser } from "@/types/user.type";
import UploadImgGetUrl from "../common/UploadImgGetUrl";
import {
	AlertDialogFooter,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogTrigger,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { vendorTermsAndConditions } from "@/constants/booking.constant";
import { Loader2 } from "lucide-react";

interface IOnboarding {
	userData?: IUser;
}

function Onboarding({ userData }: IOnboarding) {
	const [files, setFiles] = useState({
		frontId: "",
		backId: "",
		passport: "",
	});

	const [isLoading, setIsLoading] = useState(false);

	// Initialize form state with userData or empty values
	const [formData, setFormData] = useState({
		firstName: userData?.firstName || "",
		lastName: userData?.lastName || "",
		email: userData?.email || "",
		mobileNumber: userData?.mobileNumber || "",
		aadharNumber: userData?.aadharNumber || "",
		panNumber: userData?.panNumber || "",
		bankAccountNumber: userData?.bankAccountNumber || "",
		ifscCode: userData?.ifscCode || "",
		gstNumber: userData?.gstNumber || "",
		accountStatus: userData?.accountStatus || "unverified",
	});

	useEffect(() => {
		setFormData({
			firstName: userData?.firstName || "",
			lastName: userData?.lastName || "",
			email: userData?.email || "",
			mobileNumber: userData?.mobileNumber || "",
			aadharNumber: userData?.aadharNumber || "",
			panNumber: userData?.panNumber || "",
			bankAccountNumber: userData?.bankAccountNumber || "",
			ifscCode: userData?.ifscCode || "",
			gstNumber: userData?.gstNumber || "",
			accountStatus: userData?.accountStatus || "unverified",
		});
	}, [userData]);
	const router = useRouter();
	const queryClient = useQueryClient();

	const validationPatterns = {
		ifscCode: /^[A-Z]{4}0[A-Z0-9]{6}$/,
		panNumber: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
		bankAccountNumber: /^[0-9]{9,18}$/,
		aadharNumber: /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/,
		mobileNumber: /^\+[1-9]\d{1,14}$/,
		gstNumber: /^[A-Z0-9]{15}$/,
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

	// Add a new state to track which fields have been touched
	const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

	// Add new state for terms agreement
	const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);

	// Add the mutation
	const { mutateAsync: updateUserProfile, isLoading: isUpdating } = trpc.user.updateUser.useMutation({
		onSuccess: async (response) => {
			if (response.success) {
				// Update user data in cache
				queryClient.invalidateQueries(["user"]);
			} else {
				// Add error toast if response is not successful
				toast.error("Failed to update profile");
			}
		},
		onError: (error) => {
			console.error("Update failed:", error);
			toast.error(error.message || "Failed to update profile");
		},
	});

	const validateField = (fieldName: string, value: any) => {
		let errorMessage = "";

		// Skip validation for empty optional GST field
		if (!value && fieldName !== "gstNumber") {
			errorMessage = "This field is required";
		} else if (value) {
			switch (fieldName) {
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
					if (!isValidPhoneNumber(value)) {
						errorMessage = "Invalid phone number";
					}
					break;
			}
		}

		setErrors((prev) => ({
			...prev,
			[fieldName]: errorMessage,
		}));

		return errorMessage === ""; // returns true if valid, false if invalid
	};

	// Handle input changes
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let { id, value } = e.target;
		if (id === "ifscCode" || id === "panNumber") {
			value = value.toUpperCase();
		}
		setFormData((prev) => ({
			...prev,
			[id]: value,
		}));

		// Only validate if the field has been touched before
		if (touchedFields[id]) {
			if (validationPatterns[id as keyof typeof validationPatterns]) {
				validateField(id, value);
			} else if (id === "firstName" || id === "lastName") {
				if (!value.trim()) {
					setErrors((prev) => ({
						...prev,
						[id]: "This field is required",
					}));
				} else {
					setErrors((prev) => ({
						...prev,
						[id]: "",
					}));
				}
			}
		}
	};

	const handleInput = (e: any) => {
		e.target.value = e.target.value.replace(/[^0-9]/g, "");
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Validate required fields
		const fieldsToValidate = [
			"firstName",
			"lastName",
			"mobileNumber",
			"aadharNumber",
			"panNumber",
			"bankAccountNumber",
			"ifscCode",
		];

		let hasErrors = false;
		let newErrors: Record<string, string> = {}; // Temporary error object

		fieldsToValidate.forEach((field) => {
			if (field === "firstName" || field === "lastName") {
				if (!formData[field]?.trim()) {
					newErrors[field] = "This field is required";
					hasErrors = true;
				}
			} else {
				validateField(field, formData[field as keyof typeof formData]);
				if (errors[field as keyof typeof errors]) {
					hasErrors = true;
				}
			}
		});

		// Ensure PAN is provided
		if (!formData.panNumber) {
			toast.error("PAN Number is required");
			newErrors["panNumber"] = "PAN Number is required";
			hasErrors = true;
		}

		setErrors(newErrors as any);
		setIsLoading(true);

		try {
			if (!userData?.id) {
				toast.error("User ID is required");
				return;
			}

			// Regex patterns
			const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
			const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
			const bankAccountRegex = /^[0-9]{9,18}$/;
			const aadharRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
			if (!isValidPhoneNumber(formData.mobileNumber)) {
				toast.error("Invalid Mobile Number");
				return;
			}
			const gstRegex = /^[A-Z0-9]{15}$/;

			// Additional field validations
			if (!ifscRegex.test(formData.ifscCode)) {
				toast.error("Invalid IFSC Code");
				return;
			}
			if (!aadharRegex.test(formData.aadharNumber)) {
				toast.error("Invalid Aadhar Number");
				return;
			}
			if (!bankAccountRegex.test(formData.bankAccountNumber)) {
				toast.error("Invalid Bank Account Number");
				return;
			}
			if (!panRegex.test(formData.panNumber)) {
				toast.error("Invalid PAN Number");
				return;
			}
			if (formData.gstNumber && !gstRegex.test(formData.gstNumber)) {
				toast.error("Invalid GST Number");
				return;
			}
			if (!files.frontId) {
				toast.error("Please upload front ID");
				return;
			}
			if (!files.backId) {
				toast.error("Please upload back ID");
				return;
			}
			if (!files.passport) {
				toast.error("Please upload passport-size photo");
				return;
			}

			// Prepare files
			const governmentPhotoIdUrls: string[] = [];
			if (files.frontId) governmentPhotoIdUrls.push(files.frontId);
			if (files.backId) governmentPhotoIdUrls.push(files.backId);

			// Prepare mutation payload
			const payload = {
				firstName: formData.firstName,
				lastName: formData.lastName,
				mobileNumber: formData.mobileNumber,
				aadharNumber: formData.aadharNumber,
				panNumber: formData.panNumber,
				bankAccountNumber: formData.bankAccountNumber,
				ifscCode: formData.ifscCode,
				gstNumber: formData.gstNumber || undefined,
				accountStatus: "UNVERIFIED",
				avatarUrl: files.passport,
				...(governmentPhotoIdUrls.length > 0 && {
					govermentPhotoIdUrls: governmentPhotoIdUrls,
				}),
			};

			// Execute mutation
			await updateUserProfile({
				id: userData.id,
				payload: {
					...payload,
					accountStatus: "UNVERIFIED" as const,
				},
			});

			router.push("/vendor/dashboard");
		} catch (error) {
			console.error("Error in form submission:", error);
			// toast.error("Failed to process form submission");
		} finally {
			setIsLoading(false);
		}
	};

	// Update loading state to use mutation loading
	const loading = isUpdating;

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		// Mark the field as touched
		setTouchedFields((prev) => ({
			...prev,
			[id]: true,
		}));
		validateField(id, value);
	};

	// Add handler for checkbox change
	const handleAgreementChange = (checked: boolean) => {
		setIsAgreedToTerms(checked);
	};

	const handleUpload1 = (url: string) => {
		// console.log("Uploaded URL:", url);
		setFiles((prev) => ({ ...prev, frontId: url }));
	};
	const handleUpload2 = (url: string) => {
		// console.log("Uploaded URL:", url);
		setFiles((prev) => ({ ...prev, backId: url }));
	};
	const handleUpload3 = (url: string) => {
		console.log("Uploaded URL:", url);
		setFiles((prev) => ({ ...prev, passport: url }));
	};

	return (
		<>
			<form
				className="w-full min-h-screen mx-auto p-4 md:p-6 bg-white mb-5 pt-[94px] max-w-4xl"
				onSubmit={handleSubmit}
			>
				<div className="flex flex-col-reverse">
					<div className="flex items-center mb-4 md:mb-6 gap-1 cursor-pointer">
						<IoChevronBack className="mt-[1px] text-grey-700 w-4 h-4 md:w-6 md:h-6" />
						<Typography
							className="text-base md:text-[20px] font-medium text-grey-700"
							onClick={() => {
								router.push("/event/create?publish=true");
							}}
						>
							Back
						</Typography>
					</div>
					<h1 className="text-2xl md:text-[40px] font-normal text-center mb-4 md:mb-6">Account Setup</h1>
				</div>
				<div className="space-y-4 md:space-y-6">
					<div className="bg-[#F6EFE8] p-4 md:p-6 rounded-lg border border-[#DAC0A3]">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
							<div>
								<Label htmlFor="firstName">
									<Typography className="text-lg md:text-[22px] text-[#1F1F1F]">
										First Name
									</Typography>
								</Label>
								<Input
									id="firstName"
									required
									value={formData.firstName}
									onChange={handleInputChange}
									className={`bg-white mt-2 w-full focus:outline-none shadow-md focus:border-[#DAC0A3] border ${
										errors.firstName ? "border-red-500" : "border-transparent"
									} text-sm md:text-[16px] text-[#8E7777]`}
									onBlur={handleBlur}
								/>
								{errors.firstName && (
									<p className="text-red-500 text-xs md:text-sm mt-1">{errors.firstName}</p>
								)}
							</div>
							<div>
								<Label htmlFor="lastName">
									<Typography className="text-lg md:text-[22px] text-[#1F1F1F]">Last Name</Typography>
								</Label>
								<Input
									id="lastName"
									required
									value={formData.lastName}
									onChange={handleInputChange}
									className={`bg-white mt-2 w-full focus:outline-none shadow-md focus:border-[#DAC0A3] border ${
										errors.lastName ? "border-red-500" : "border-transparent"
									} text-sm md:text-[16px] text-[#8E7777]`}
									onBlur={handleBlur}
								/>
								{errors.lastName && (
									<p className="text-red-500 text-xs md:text-sm mt-1">{errors.lastName}</p>
								)}
							</div>
						</div>
						<div className="space-y-4">
							<div>
								<Label htmlFor="email">
									<Typography className="text-lg md:text-[22px] text-[#1F1F1F]">
										Email address
									</Typography>
								</Label>
								<Input
									id="email"
									type="email"
									value={userData?.email || ""}
									readOnly
									className="bg-white mt-2 w-full md:w-[70%] shadow-md focus:outline-none focus:border-[#DAC0A3] border border-transparent text-sm md:text-[16px] text-[#8E7777]"
								/>
							</div>
							<div>
								<Label htmlFor="mobileNumber">
									<Typography className="text-lg md:text-[22px] text-[#1F1F1F]">
										Contact Number
									</Typography>
								</Label>
								<div className="md:w-[70%] mt-2">
									<PhoneInput
										placeholder="Enter phone number"
										defaultCountry="IN"
										value={formData.mobileNumber}
										className="bg-white w-full px-2 rounded shadow-md flex focus:outline-none focus:border-[#DAC0A3] h-12 border border-transparent text-sm md:text-base text-[#8E7777]"
										onChange={(value) => setFormData({ ...formData, mobileNumber: value ?? "" })}
									/>
									{formData.mobileNumber && isValidPhoneNumber(formData.mobileNumber) && (
										<span className="text-green-500">
											{isValidPhoneNumber(formData.mobileNumber)}
										</span>
									)}
								</div>
								{errors.mobileNumber && (
									<p className="text-red-500 text-xs md:text-sm mt-1">{errors.mobileNumber}</p>
								)}
							</div>
							<div>
								<Label htmlFor="aadharNumber">
									<Typography className="text-lg md:text-[22px] text-[#1F1F1F]">
										Aadhar Number / Govt ID No.
									</Typography>
								</Label>
								<Input
									id="aadharNumber"
									pattern="\d{12}"
									inputMode="numeric"
									minLength={12}
									maxLength={12}
									required
									value={formData.aadharNumber}
									onChange={handleInputChange}
									className={`bg-white mt-2 w-full md:w-[70%] shadow-md focus:outline-none focus:border-[#DAC0A3] border ${
										errors.aadharNumber ? "border-red-500" : "border-transparent"
									} text-sm md:text-[16px] text-[#8E7777]`}
									onBlur={handleBlur}
								/>
								{errors.aadharNumber && (
									<p className="text-red-500 text-xs md:text-sm mt-1">{errors.aadharNumber}</p>
								)}
							</div>
							<div>
								<Label htmlFor="panNumber">
									<Typography className="text-lg md:text-[22px] text-[#1F1F1F]">
										PAN / TAN no.
									</Typography>
								</Label>
								<Input
									id="panNumber"
									required
									value={formData.panNumber}
									onChange={handleInputChange}
									className={`bg-white mt-2 w-full md:w-[70%] shadow-md focus:outline-none focus:border-[#DAC0A3] border ${
										errors.panNumber ? "border-red-500" : "border-transparent"
									} text-sm md:text-[16px] text-[#8E7777]`}
									onBlur={handleBlur}
								/>
								{errors.panNumber && (
									<p className="text-red-500 text-xs md:text-sm mt-1">{errors.panNumber}</p>
								)}
							</div>
							<div className="flex flex-col md:flex-row gap-3 w-full">
								<div className="w-full md:w-[70%]">
									<Label htmlFor="bankAccountNumber">
										<Typography className="text-lg md:text-[22px] text-[#1F1F1F]">
											Bank Account No
										</Typography>
									</Label>
									<Input
										id="bankAccountNumber"
										type="tel"
										required
										value={formData.bankAccountNumber}
										onChange={handleInputChange}
										onInput={handleInput}
										className={`bg-white mt-2 w-full shadow-md focus:outline-none focus:border-[#DAC0A3] border ${
											errors.bankAccountNumber ? "border-red-500" : "border-transparent"
										} text-sm md:text-[16px] text-[#8E7777]`}
										onBlur={handleBlur}
									/>
									{errors.bankAccountNumber && (
										<p className="text-red-500 text-xs md:text-sm mt-1">
											{errors.bankAccountNumber}
										</p>
									)}
								</div>
								<div className="w-full md:w-[30%]">
									<Label htmlFor="ifscCode">
										<Typography className="text-lg md:text-[22px] text-[#1F1F1F]">
											IFSC Code
										</Typography>
									</Label>
									<Input
										id="ifscCode"
										required
										value={formData.ifscCode}
										onChange={handleInputChange}
										className={`bg-white mt-2 w-full md:w-[70%] shadow-md focus:outline-none focus:border-[#DAC0A3] border ${
											errors.ifscCode ? "border-red-500" : "border-transparent"
										} text-sm md:text-[16px] text-[#8E7777]`}
										onBlur={handleBlur}
									/>
									{errors.ifscCode && (
										<p className="text-red-500 text-xs md:text-sm mt-1">{errors.ifscCode}</p>
									)}
								</div>
							</div>
							<div>
								<Label htmlFor="gstNumber">
									<Typography className="text-lg md:text-[22px] text-[#1F1F1F]">
										GST No. (optional)
									</Typography>
								</Label>
								<Input
									id="gstNumber"
									value={formData.gstNumber}
									onChange={handleInputChange}
									className={`bg-white mt-2 w-full md:w-[70%] shadow-md focus:outline-none focus:border-[#DAC0A3] border ${
										errors.gstNumber ? "border-red-500" : "border-transparent"
									} text-sm md:text-[16px] text-[#8E7777]`}
									onBlur={handleBlur}
								/>
								{errors.gstNumber && (
									<p className="text-red-500 text-xs md:text-sm mt-1">{errors.gstNumber}</p>
								)}
							</div>
						</div>
					</div>
					<div className="bg-[#F6EFE8] p-4 md:p-6 rounded-lg border border-[#DAC0A3]">
						<h2 className="text-lg md:text-[22px] text-[#1F1F1F] mb-2">Upload Proofs</h2>
						<ul className="mt-2 mb-4 text-xs md:text-[12px] text-[#655F5F]">
							<Typography className="text-[#655F5F] text-xs md:text-[12px]">
								Please make sure that the image is clear and readable
							</Typography>
							<li>1. Image should be less than 2 MB</li>
						</ul>
						<div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
							<div className="bg-white rounded-lg p-4 md:p-[34px]">
								<p className="text-center mb-5 text-base md:text-[20px] font-normal">
									Upload Govt. Photo ID
								</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									<div>
										<p>Front</p>
										<UploadImgGetUrl
											type="landscape"
											onFileUpload={handleUpload1}
											initialImageUrl={files.frontId || ""}
										/>
									</div>
									<div>
										<p>Back</p>
										<UploadImgGetUrl
											type="landscape"
											onFileUpload={handleUpload2}
											initialImageUrl={files.backId || ""}
										/>
									</div>
								</div>
							</div>
							<div className="bg-white rounded-lg w-full md:w-[300px] p-4 md:p-[34px]">
								<p className="text-center text-base md:text-[20px] font-normal py-4">
									Upload passport size photo (1:1 ratio)
								</p>
								<div>
									<UploadImgGetUrl
										onFileUpload={handleUpload3}
										initialImageUrl={files.passport || ""}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="flex flex-col items-center px-4">
						<h2 className="font-semibold mb-4 text-xl">Agreement</h2>
						<div className="space-y-2">
							<div className="flex items-center">
								<Checkbox
									id="terms"
									required
									checked={isAgreedToTerms}
									onCheckedChange={handleAgreementChange}
								/>

								<AlertDialog>
									<AlertDialogTrigger asChild>
										<label htmlFor="terms" className="text-sm md:text-base ml-2 cursor-pointer">
											By creating an account, you accept our{" "}
											<span className="underline cursor-pointer">
												privacy policy & terms of services
											</span>
										</label>
									</AlertDialogTrigger>
									<AlertDialogContent className="md:min-w-[800px]">
										<AlertDialogHeader>
											<AlertDialogTitle className="text-xl">
												Terms and Conditions
											</AlertDialogTitle>
											<AlertDialogDescription className="px-4 py-2 max-h-[75vh] overflow-y-auto">
												<h1 className="title text-lg">User Agreement</h1>
												<ol className="sub-title text-left list-decimal px-6 overflow-y-auto">
													{vendorTermsAndConditions.map((text, idx) => (
														<li key={idx}>{text}</li>
													))}
												</ol>
											</AlertDialogDescription>
										</AlertDialogHeader>

										<AlertDialogFooter className="flex gap-4">
											<AlertDialogCancel>Close</AlertDialogCancel>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>
					</div>
					<div className="text-center px-4">
						<Button
							type="submit"
							disabled={loading || !isAgreedToTerms}
							className={`bg-black w-full md:w-[180px] text-base md:text-[22px] shadow-md text-white py-3 md:py-5 transition-transform duration-300 transform hover:scale-105 mb-8 ${
								!isAgreedToTerms ? "opacity-50 cursor-not-allowed hover:bg-black" : "hover:bg-black/90"
							}`}
						>
							{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Submit"}
						</Button>
					</div>
				</div>
			</form>
		</>
	);
}

export default Onboarding;
