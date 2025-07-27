"use client";
import EmailInput from "@/components/account/inputs/email";
import OTPInput from "@/components/account/inputs/otp";
import { Button } from "@/components/ui/button";
import Typography from "@/components/Typography";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast from "react-hot-toast";
import { trpc } from "@/app/provider";
import { signIn, useSession } from "next-auth/react";

const LoginDesktop = () => {
	const [inputType, setInputType] = useState<string>("email");
	const [email, setEmail] = useState<string>("");
	const [mobile, setMobile] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [verifyLoading, setVerifyLoading] = useState(false);
	const [resendCooldown, setResendCooldown] = useState(0);
	const [isCodeSent, setIsCodeSent] = useState(false);
	const [ongoingEvent, setOngoingEvent] = useState<number | undefined>();
	const [otp, setOtp] = useState<string>();
	const [emailError, setEmailError] = useState<string>("");
	const [otpError, setOtpError] = useState<string>("");
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentQuery = searchParams.toString();
	const queryString = currentQuery ? `?${currentQuery}` : "";

	const redirectUrl = searchParams.get("redirect") || "/";

	const { mutateAsync: sendOtpMutation, error: sendOtpError } = trpc.auth.createOtp.useMutation({
		onSuccess: (data) => {
			setIsCodeSent(true);
			setResendCooldown(60);
			setLoading(false);
		},
		onError: (error) => {
			setLoading(false);
			if (error.data?.httpStatus === 400) {
				toast.error("Invalid email address");
				return;
			}
		},
	});

	useEffect(() => {
		// eslint-disable-next-line no-undef
		let timer: NodeJS.Timeout;
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
			await sendOtpMutation({ email, method: inputType as "email" | "mobile", type: "LOGIN", role: "VENDOR" });
		} catch (error: any) {
			console.error("Error sending code:", error);
			if (error.data?.httpStatus === 409) {
				toast.success("User doesn't exist please create your account first");
				router.push(`/signup${queryString}`);
				return;
			} else if (error.data?.httpStatus === 401) {
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
		setVerifyLoading(true);
		await signIn("email-otp", { email: email, otp: code, redirect: false })
			.then(async (callback) => {
				if (callback?.error) {
					console.error("Invalid credentials", callback?.error);
					toast.error("Invalid credentials");
				} else {
					toast.success("Login successful");
					// Get updated session
					const response = await fetch("/api/auth/session");
					const updatedSession = await response.json();

					if (!redirectUrl.includes("/event/create")) {
						if (updatedSession?.user?.role === "VENDOR") {
							router.push("/vendor/dashboard");
						} else {
							router.push(redirectUrl || "/");
						}
					} else {
						router.push(redirectUrl || "/");
					}
				}
			})
			.finally(() => setVerifyLoading(false));
	};

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
		} else {
			toast.error(`Please wait ${resendCooldown} seconds before requesting a new code`);
		}
	};

	return (
		<>
			<div className="flex flex-row justify-between items-center  w-full h-screen">
				<div className="h-full w-full ">
					<div className="hidden md:absolute z-10 bg-gradient-to-r from-[#F6EFE8] w-1/4 h-full"></div>
					<Image
						src={"/auth/login-grid.png"}
						alt="logingrid"
						width={1920}
						height={1080}
						className="  h-full object-cover max-sm:hidden"
					/>
				</div>

				<div className="flex flex-col w-full mb-20 justify-center max-sm:min-w-full max-sm:p-6  sm:p-12 sm:pl-16 sm:pr-16">
					<Link href={"/"} className="flex flex-row justify-center mb-2 md:mb-0 md:justify-end">
						<Image
							src={"/icons/home-icon.svg"}
							alt="favicon"
							width={1920}
							height={1080}
							className="max-w-[100px] h-auto object-contain"
						/>
					</Link>
					<div className="mb-2 leading-8">
						{isCodeSent ? (
							<Typography size="xxxl" weight="medium" className="text-3xl">
								Login
							</Typography>
						) : (
							<>
								<span className="font-medium md:hidden  text-3xl">Unleash the Magic of Sports</span>
								<span className="font-medium md:block hidden text-3xl">Unleash the</span>
								<span className="font-medium md:block hidden text-3xl">Magic of Sports</span>
							</>
						)}
					</div>

					{!isCodeSent && (
						<Typography size="xl" className="text-[#1F1F1F] pt-2 pb-2" weight="medium">
							Enter your login details{" "}
						</Typography>
					)}
					<div className="flex flex-col gap-10 mt-3">
						<EmailInput
							handleInputType={setInputType}
							handleEmail={setEmail}
							handleMobile={setMobile}
							error={emailError}
							disabled={loading}
						/>
						{isCodeSent && (
							<div className="flex flex-col gap-2">
								<Typography size="xxl" weight="medium" className="text-xl">
									Enter your Code to Login
								</Typography>
								<OTPInput handleOtp={setOtp} error={otpError} disabled={loading} />
							</div>
						)}
						<div className={`flex flex-col justify-start ${isCodeSent ? "gap-4" : "gap-8"}`}>
							<div className="flex flex-row justify-between w-full max-sm:flex-col max-sm:gap-3">
								<Button
									size="lg"
									className="text-white max-md:w-full p-6 font-medium text-[16px] bg-black rounded-lg hover:opacity-50 hover:bg-black"
									onClick={handleSubmit}
									disabled={loading}
								>
									{(isCodeSent ? verifyLoading : loading) && (
										<AiOutlineLoading3Quarters size={24} className="animate-spin mr-4" />
									)}{" "}
									{isCodeSent ? "Login" : "Send Code"}
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
									href={`/signup${queryString}`}
									className="group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gray-100"
								>
									<Typography
										weight="medium"
										className="text-xl text-[#1F1F1F] border-b border-gray-300 group-hover:text-[#C4A484] transition-colors duration-300"
									>
										Don&apos;t have an account?
									</Typography>
									<span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
										→
									</span>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default LoginDesktop;
