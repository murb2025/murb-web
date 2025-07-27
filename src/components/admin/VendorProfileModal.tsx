import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button, Label, Input } from "../ui";
import { IUser } from "@/types/user.type";
import Typography from "../Typography";
import Image from "next/image";
import { trpc } from "@/app/provider";
import { toast } from "react-hot-toast";

export default function VendorProfileModal({ vendorData }: { vendorData: any }) {
	const [percentageShare, setPercentageShare] = useState(vendorData?.vendor?.percentageCut || "");
	const [isUpdating, setIsUpdating] = useState(false);

	// tRPC mutation for updating percentage share
	const { mutateAsync: percentageMutation } = trpc.admin.updatePercentageShare.useMutation({
		onSuccess: () => {
			setIsUpdating(false);
			// You might want to refetch vendor data or show a success message
			toast.success("Percentage share updated successfully!");
		},
		onError: (error) => {
			setIsUpdating(false);
			// Handle error, maybe show an error message
			console.error("Error updating percentage share:", error);
			toast.error("Failed to update percentage share. Please try again.");
		},
	});

	useEffect(() => {
		setPercentageShare(vendorData?.vendor?.percentageCut);
	}, [vendorData]);

	const handleUpdateShare = async () => {
		if (!percentageShare || isNaN(Number(percentageShare))) {
			// Handle validation error
			return;
		}

		setIsUpdating(true);
		await percentageMutation({
			vendorId: vendorData?.id,
			percentageCut: Number(percentageShare),
		});
	};

	if (!vendorData) return null;

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="bg-black text-white rounded-[8px] font-normal text-[15px]">Personal Info</Button>
			</DialogTrigger>
			<DialogContent className="max-w-7xl h-[90vh] overflow-y-auto">
				<DialogTitle></DialogTitle>
				<DialogDescription>
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-2">
							<div className="">
								<h1 className="leading-[120%] text-[28px] font-bold">
									{vendorData?.firstName} {vendorData?.lastName}
								</h1>
							</div>
						</div>
					</div>

					<div className="space-y-6">
						{/* Percentage Share Section */}
						<div className="p-6 rounded-[20px] border border-[#DAC0A3]">
							<div className="space-y-4">
								<h1 className="text-[28px] font-semibold mb-6">Percentage Share</h1>
								<div className="flex items-end gap-4">
									<div className="flex-1">
										<Label htmlFor="percentageShare">
											<Typography className="text-xl text-[#1F1F1F] font-medium">
												Percentage (%)
											</Typography>
										</Label>
										<Input
											id="percentageShare"
											type="number"
											min="0"
											max="100"
											value={percentageShare}
											onChange={(e) => setPercentageShare(e.target.value)}
											placeholder="Enter percentage share"
											className="mt-2 text-xl"
										/>
									</div>
									<Button
										onClick={handleUpdateShare}
										disabled={isUpdating}
										className="bg-black text-white px-6 py-2 rounded-[8px]"
									>
										{isUpdating ? "Updating..." : "Update Share"}
									</Button>
								</div>
								{/* {updatePercentageShare.isError && (
                                    <Typography className="text-red-500 mt-2">
                                        Failed to update percentage share. Please try again.
                                    </Typography>
                                )}
                                {updatePercentageShare.isSuccess && (
                                    <Typography className="text-green-500 mt-2">
                                        Percentage share updated successfully!
                                    </Typography>
                                )} */}
							</div>
						</div>

						<div className="p-6 rounded-[20px] border border-[#DAC0A3]">
							<div className="space-y-4">
								<h1 className="text-[28px] font-semibold mb-6">Personal Info</h1>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-[50px]">
									{/* Left Column */}
									<div className="space-y-4">
										<div>
											<Label htmlFor="email">
												<Typography className="text-xl text-[#1F1F1F] font-medium">
													Email
												</Typography>
											</Label>
											<p className="text-2xl">{vendorData?.email}</p>
										</div>

										<div>
											<Label htmlFor="mobileNumber">
												<Typography className="text-xl text-[#1F1F1F] font-medium">
													Mobile Number
												</Typography>
											</Label>
											<p className="text-2xl">{vendorData?.mobileNumber || "--"}</p>
										</div>

										<div>
											<Label htmlFor="aadharNumber">
												<Typography className="text-xl text-[#1F1F1F] font-medium">
													Aadhar Number / Govt ID No.
												</Typography>
											</Label>
											<p className="text-2xl">{vendorData?.vendor?.aadharNumber || "--"}</p>
										</div>

										<div>
											<Label htmlFor="panNumber">
												<Typography className="text-xl text-[#1F1F1F] font-medium">
													PAN / TAN no.
												</Typography>
											</Label>
											<p className="text-2xl">{vendorData?.vendor?.panNumber || "--"}</p>
										</div>
										<div>
											<Label htmlFor="bankAccountNumber">
												<Typography className="text-xl text-[#1F1F1F] font-medium">
													Bank Account
												</Typography>
											</Label>
											<p className="text-2xl">{vendorData?.vendor?.bankAccountNumber || "--"}</p>
										</div>

										<div>
											<Label htmlFor="ifscCode">
												<Typography className="text-xl text-[#1F1F1F] font-medium">
													IFSC Code
												</Typography>
											</Label>
											<p className="text-2xl">{vendorData?.vendor?.ifscCode || "--"}</p>
										</div>
										<div>
											<Label htmlFor="gstNumber">
												<Typography className="text-xl text-[#1F1F1F] font-medium">
													GSTIN NO
												</Typography>
											</Label>
											<p className="text-2xl">{vendorData?.vendor?.gstNumber || "--"}</p>
										</div>
									</div>

									{/* Right Column */}
									<div className="space-y-4">
										<div className="mt-6">
											<h2 className="text-xl text-[#1F1F1F] font-medium">Proofs</h2>
											<div className="flex flex-col gap-4">
												<div>
													<p>Passport Size photo</p>
													<section className="relative aspect-square h-48 w-48">
														{vendorData?.avatarUrl ? (
															<Image
																src={vendorData?.avatarUrl}
																alt={"photo url"}
																fill
																className="w-full h-full object-cover"
															/>
														) : (
															<section className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
																<div className="text-center">
																	<p className="text-gray-500">
																		No Passport Size photo uploaded
																	</p>
																</div>
															</section>
														)}
													</section>
												</div>
												<div>
													<p>Front Id</p>
													<section className="relative aspect-video h-48">
														{vendorData?.vendor?.govermentPhotoIdUrls &&
														vendorData?.vendor?.govermentPhotoIdUrls.length > 1 &&
														vendorData?.vendor?.govermentPhotoIdUrls[0] !== "" ? (
															<Image
																src={vendorData?.vendor?.govermentPhotoIdUrls[0]}
																alt={"front url"}
																fill
																className="w-full h-full object-cover"
															/>
														) : (
															<section className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
																<div className="text-center">
																	<p className="text-gray-500">
																		No Front ID Image uploaded
																	</p>
																</div>
															</section>
														)}
													</section>
												</div>
												<div>
													<p>Back Id</p>
													<section className="relative aspect-video h-48">
														{vendorData?.vendor?.govermentPhotoIdUrls &&
														vendorData?.vendor?.govermentPhotoIdUrls[1] !== "" ? (
															<Image
																src={vendorData?.vendor?.govermentPhotoIdUrls[1]}
																alt={"backUrl url"}
																fill
																className="w-full h-full object-cover"
															/>
														) : (
															<section className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
																<div className="text-center">
																	<p className="text-gray-500">
																		No Back ID Image uploaded
																	</p>
																</div>
															</section>
														)}
													</section>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
}
