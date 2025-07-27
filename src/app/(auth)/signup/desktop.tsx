import React, { useState, useEffect } from "react";
import EmailInput from "@/components/account/inputs/email";
import { Button } from "@/components/ui/button";
import Typography from "@/components/Typography";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast from "react-hot-toast";
import OTPInput from "@/components/account/inputs/otp";
import { signIn } from "next-auth/react";
import { trpc } from "@/app/provider";

interface ICreateAccount {
	handleAccountSetup: (_: boolean) => void;
	handleUserData: (_id: number, _email: string | null) => void;
	accountRole: "BUYER" | "VENDOR" | null;
}

const CreateAccountDesktop = ({ handleUserData, accountRole }: ICreateAccount) => {
	const [inputType, setInputType] = useState<string>("email");
	const [email, setEmail] = useState<string>("");
	const [mobile, setMobile] = useState<string>("");
	const [isCodeSent, setIsCodeSent] = useState(false);
	const [resendCooldown, setResendCooldown] = useState(0);
	const [otp, setOtp] = useState<string>();
	const router = useRouter();
	const [emailError, setEmailError] = useState<string>("");
	const [otpError, setOtpError] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [selectedRole, setSelectedRole] = useState<"BUYER" | "VENDOR">(accountRole || "BUYER");

	const changeRoleName = (role: "BUYER" | "VENDOR") => {
		if (role === "BUYER") {
			return "Customer";
		} else {
			return "Host";
		}
	};

	const searchParams = useSearchParams();
	const currentQuery = searchParams.toString();
	const queryString = currentQuery ? `?${currentQuery}` : "";

	const redirectUrl = searchParams.get("redirect") || "/";

	const { mutateAsync: createOtpMutation, isLoading: createOtpLoading } = trpc.auth.createOtp.useMutation({
		onSuccess: (data) => {
			setIsCodeSent(true);
			setResendCooldown(60);
			setLoading(false);
			toast.success("OTP sent successfully");
		},
		onError: (error) => {
			setLoading(false);
			if (error.data?.httpStatus === 409) {
				toast.success("User already exists. Please login instead.");
				router.push(`/login${queryString}`);
				return;
			}
			if (error.data?.httpStatus === 400) {
				toast.error("Invalid email address");
				return;
			}
		},
	});

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;
		if (resendCooldown > 0) {
			timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
		}
		return () => clearTimeout(timer);
	}, [resendCooldown]);

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email) {
			setEmailError("Email is required");
			toast.error("Email is required");
			return false;
		}
		if (!emailRegex.test(email)) {
			setEmailError("Please enter a valid email address");
			toast.error("Please enter a valid email address");
			return false;
		}
		setEmailError("");
		return true;
	};

	const validateMobile = (mobile: string) => {
		const mobileRegex = /^[0-9]{10}$/;
		if (!mobile) {
			setEmailError("Mobile number is required");
			toast.error("Mobile number is required");
			return false;
		}
		if (!mobileRegex.test(mobile)) {
			setEmailError("Please enter a valid 10-digit mobile number");
			toast.error("Please enter a valid 10-digit mobile number");
			return false;
		}
		setEmailError("");
		return true;
	};

	const sendCode = async () => {
		if (inputType === "email") {
			if (!validateEmail(email)) return;
		} else {
			if (!validateMobile(mobile)) return;
		}

		setLoading(true);
		try {
			await createOtpMutation({
				email,
				mobileNumber: mobile,
				type: "CREATE_ACCOUNT",
				method: inputType as "email" | "mobile",
				role: selectedRole,
			});
		} catch (error: any) {
			console.error("Error sending code:", error);
			if (error.data?.httpStatus === 401) {
				toast.error("User account is suspended. Please contact support.");
				return;
			} else {
				toast.error("Error sending code");
			}
		}
	};

	const verifyCode = async (code: string) => {
		if (!code || code.length !== 6) {
			setOtpError("Please enter a valid 6-digit OTP");
			toast.error("Please enter a valid 6-digit OTP");
			return;
		}
		setOtpError("");
		setLoading(true);

		await signIn("email-otp", {
			email: email,
			otp: code,
			role: selectedRole,
			redirect: false,
		})
			.then(async (callback) => {
				if (callback?.error) {
					console.error("Invalid credentials", callback?.error);
					toast.error("Invalid credentials");
				} else {
					toast.success("Account created successfully");
					if (!redirectUrl.includes("/event/create")) {
						if (selectedRole === "VENDOR") {
							router.push("/vendor/dashboard");
						} else {
							router.push(redirectUrl || "/");
						}
					} else {
						router.push(redirectUrl || "/");
					}
				}
			})
			.finally(() => setLoading(false));
	};

	handleUserData;

	const handleSubmit = () => {
		if (isCodeSent) {
			verifyCode(otp ?? "");
		} else {
			sendCode();
		}
	};

	const handleResendCode = () => {
		if (resendCooldown === 0) {
			sendCode();
			setOtp("");
		} else {
			toast.error(`Please wait ${resendCooldown} seconds before requesting a new code`);
		}
	};

	return (
		<>
			<div className="flex flex-row justify-between items-center w-screen min-h-screen overflow-y-auto">
				<div className="flex flex-col h-full w-full justify-center px-16 pb-20 pt-4 max-sm:px-4 gap-6">
					<div className="flex flex-col gap-4">
						<Link href={"/"} className="flex flex-row justify-center md:justify-start">
							<Image
								src={"/icons/home-icon.svg"}
								alt="favicon"
								width={1920}
								height={1080}
								className="max-w-[100px] h-auto object-contain"
							/>
						</Link>
						<div className="flex flex-col justify-center">
							<Typography size="xxl" weight="medium">
								Create Account as a {changeRoleName(selectedRole)}
							</Typography>
						</div>
					</div>

					<div className="flex flex-col gap-6">
						<div className="grid grid-cols-1 gap-8">
							{/* User Account Section */}
							<div
								className={`p-4 border rounded-lg ${selectedRole === "BUYER" ? "text-murbBg border-murbBg" : "border-gray-100"}`}
								onClick={() => setSelectedRole("BUYER")}
							>
								<div className="mb-3">
									<Typography size="lg" weight="semi-bold" className="block">
										Murb Customer
									</Typography>
									<Typography size="sm" className="">
										A Murb customer is an individual who uses the Murb platform to discover, book,
										and review various services, such as fitness classes, wellness sessions, and
										local sports experiences.
									</Typography>
								</div>

								<EmailInput
									handleInputType={setInputType}
									handleEmail={setEmail}
									handleMobile={setMobile}
									error={emailError}
									isSelected={selectedRole === "BUYER"}
									disabled={loading || createOtpLoading}
								/>
							</div>

							{/* Host Account Section */}
							<div
								className={`p-4 border rounded-lg ${selectedRole === "VENDOR" ? "text-murbBg border-murbBg" : "border-gray-100"}`}
								onClick={() => setSelectedRole("VENDOR")}
							>
								<div className="mb-3">
									<Typography size="lg" weight="semi-bold" className="block">
										Murb Host
									</Typography>
									<Typography size="sm" className="">
										A Murb host is a service provider who lists their services on the Murb platform.
										Hosts use the Murb platform to showcase their services, manage bookings, and
										connect with customers.
									</Typography>
								</div>

								<EmailInput
									handleInputType={setInputType}
									handleEmail={setEmail}
									handleMobile={setMobile}
									error={emailError}
									isSelected={selectedRole === "VENDOR"}
									disabled={loading || createOtpLoading}
								/>
							</div>
						</div>

						{isCodeSent && (
							<div className="flex flex-col gap-6">
								<Typography size="xxl" weight="medium">
									Enter your code to create account
								</Typography>
								<OTPInput handleOtp={setOtp} error={otpError} disabled={loading || createOtpLoading} />
							</div>
						)}

						<div className={`flex flex-col mt-2 justify-between ${isCodeSent ? "gap-6" : "gap-6"}`}>
							<div className="flex flex-row justify-between w-full max-sm:flex-col max-sm:gap-3">
								<Button
									className="p-6 max-md:w-full font-medium"
									onClick={handleSubmit}
									variant="custom"
									disabled={loading || createOtpLoading}
								>
									{(loading || createOtpLoading) && (
										<AiOutlineLoading3Quarters size={24} className="animate-spin mr-4" />
									)}
									{isCodeSent ? "Create Account" : "Send Code"}
								</Button>

								{isCodeSent && (
									<Button
										className="text-[#7A7474] max-md:max-w-full text-[16px] font-medium p-6 w-full border-black bg-transparent max-w-[180px]"
										variant="outline"
										onClick={handleResendCode}
										disabled={resendCooldown > 0}
									>
										{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
									</Button>
								)}
							</div>

							<div className="flex flex-row justify-between items-center">
								<Link
									href={`/login${queryString}`}
									className="group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gray-100"
								>
									<Typography
										weight="medium"
										className="text-xl text-[#1F1F1F] border-b border-gray-300 group-hover:text-[#C4A484] transition-colors duration-300"
									>
										Already have an account?
									</Typography>
									<span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
										→
									</span>
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className="relative w-full h-full max-md:hidden">
					<div className="absolute z-10 bg-gradient-to-l from-[#F6EFE8] h-full w-full"></div>
					<Image
						src={"/auth/signup-grid.png"}
						alt="logingrid"
						width={641}
						height={654}
						className="w-full h-full object-contain"
					/>
				</div>
			</div>
		</>
	);
};

export default CreateAccountDesktop;
