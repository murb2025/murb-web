"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Upload, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select";
import LoadingButton from "./LoadingButton";
import axios from "axios";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

const ReportDialog = ({ setShowReportDialog }: { setShowReportDialog: (show: boolean) => void }) => {
	const [issueData, setIssueData] = React.useState({
		name: "",
		email: "",
		title: "",
		description: "",
		labels: [{ value: "bug", label: "Bug" }],
	});
	const [screenshots, setScreenshots] = useState<{ file: File; preview: string }[]>([]);
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const labelOptions = [
		{ value: "bug", label: "Bug" },
		{ value: "feature request", label: "Feature Request" },
		{ value: "improvement", label: "Improvement" },
		{ value: "enhancement", label: "Enhancement" },
		{ value: "ui", label: "UI/UX" },
		{ value: "performance", label: "Performance" },
		{ value: "p0", label: "Needs Priority" },
	];

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setIssueData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleLabelChange = (selectedLabels: any) => {
		setIssueData((prev) => ({
			...prev,
			labels: selectedLabels,
		}));
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		const imageFiles = files.filter((file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE);

		if (files.length !== imageFiles.length) {
			toast.error("Some files were skipped. Please ensure all files are images under 5MB.");
		}

		const newScreenshots = await Promise.all(
			imageFiles.map(async (file) => ({
				file,
				preview: URL.createObjectURL(file),
			})),
		);

		setScreenshots((prev) => [...prev, ...newScreenshots]);
	};

	const removeScreenshot = (index: number) => {
		setScreenshots((prev) => {
			const newScreenshots = [...prev];
			URL.revokeObjectURL(newScreenshots[index].preview);
			newScreenshots.splice(index, 1);
			return newScreenshots;
		});
	};

	const handleSubmit = async () => {
		try {
			setIsSubmitting(true);
			if (!issueData.title || !issueData.description || issueData.labels.length === 0) {
				return toast.error("Please fill all required fields");
			}

			// Convert screenshots to base64
			const screenshotsBase64 = await Promise.all(
				screenshots.map(async ({ file }) => {
					return new Promise<string>((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = () => resolve(reader.result as string);
						reader.onerror = reject;
						reader.readAsDataURL(file);
					});
				}),
			);

			const body = {
				...issueData,
				labels: issueData.labels.map((label: any) => label.value),
				screenshots: screenshotsBase64,
			};

			const { data } = await axios.post("/api/report-issue", body);

			if (data.success) {
				setShowReportDialog(false);
				return toast.success("Issue reported successfully");
			} else {
				return toast.error("Failed to report issue");
			}
		} catch (e) {
			console.error(e);
			return toast.error("Failed to report issue");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Cleanup URLs on unmount
	React.useEffect(() => {
		return () => {
			screenshots.forEach(({ preview }) => URL.revokeObjectURL(preview));
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			onClick={() => setShowReportDialog(false)}
			className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center"
		>
			<Card
				onClick={(e) => {
					e.stopPropagation();
				}}
				className="w-full lg:w-1/2 2xl:w-1/3 max-h-[95vh] overflow-y-auto"
			>
				<CardHeader>
					<CardTitle className="text-xl">Report Issue</CardTitle>
					<CardDescription>
						Please report any issues you encounter while using the web app. We will try to resolve them as
						soon as possible.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{/* Existing form fields */}
					<div className="flex w-full gap-2">
						<div className="flex flex-col gap-2 w-full">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								name="name"
								value={issueData.name}
								onChange={handleInputChange}
								placeholder="John Doe"
							/>
						</div>
						<div className="flex flex-col gap-2 w-full">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={issueData.email}
								onChange={handleInputChange}
								placeholder="john@example.com"
							/>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="labels">Issue Label*</Label>
						<Select
							id="labels"
							value={issueData.labels}
							isDisabled={isSubmitting}
							options={labelOptions}
							onChange={handleLabelChange}
							isMulti
							isSearchable
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="title">Issue Title*</Label>
						<Input
							id="title"
							name="title"
							value={issueData.title}
							onChange={handleInputChange}
							placeholder="Brief summary of the issue"
							required
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="description">Description*</Label>
						<Textarea
							id="description"
							name="description"
							value={issueData.description}
							onChange={handleInputChange}
							rows={4}
							placeholder="Please provide detailed information about the issue"
							required
						/>
					</div>

					{/* Screenshot upload section */}
					<div className="flex flex-col gap-2">
						<Label>Screenshots (Max 5MB per image)</Label>
						<div className="flex flex-wrap gap-2">
							{screenshots.map(({ preview }, index) => (
								<div key={index} className="relative">
									<img
										src={preview}
										alt={`Screenshot ${index + 1}`}
										className="h-20 w-20 object-cover rounded"
									/>
									<button
										onClick={() => removeScreenshot(index)}
										className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							))}
							<label className="flex items-center justify-center h-20 w-20 border-2 border-dashed rounded cursor-pointer hover:border-blue-500">
								<input
									type="file"
									accept="image/*"
									multiple
									onChange={handleFileChange}
									className="hidden"
								/>
								<Upload className="h-6 w-6 text-gray-400" />
							</label>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex items-center gap-5 justify-between">
					<Button onClick={() => setShowReportDialog(false)} variant="outline">
						Cancel
					</Button>
					<LoadingButton
						isLoading={isSubmitting}
						onClick={handleSubmit}
						disabled={
							!issueData.title || !issueData.description || issueData.labels.length === 0 || isSubmitting
						}
					>
						Submit
					</LoadingButton>
				</CardFooter>
			</Card>
		</div>
	);
};

const ReportIssue = () => {
	const [showReportDialog, setShowReportDialog] = useState(false);

	return (
		<>
			<Button
				onClick={() => setShowReportDialog(!showReportDialog)}
				size="sm"
				className={`
              bg-white shadow-md rounded-full
              hover:bg-red-500 hover:text-white text-red-500
              flex items-center gap-1 px-4 fixed bottom-5 right-5 w-fit group
            `}
			>
				<span className={cn("group-hover:block hidden")}>Report Issue</span>
				<ShieldAlert />
			</Button>
			{showReportDialog && <ReportDialog setShowReportDialog={setShowReportDialog} />}
		</>
	);
};

export default ReportIssue;
