import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loader";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	MessageCircle,
	Star,
	Pencil,
	Trash2,
	MoreVertical,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import { useState } from "react";
import { trpc } from "@/app/provider";
import { useSession } from "next-auth/react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { toast } from "react-hot-toast";

interface IComment {
	id: string;
	content: string;
	createdAt: Date;
	user: {
		firstName: string | null;
		lastName: string | null;
		avatarUrl: string | null;
		email: string | null;
		role: "ADMIN" | "VENDOR" | "BUYER";
	};
}

interface IFeedbackData {
	id: string;
	rating: number;
	name: string | null;
	email: string | null;
	avatarUrl: string | null | undefined;
	comment: string | null;
	createdAt: Date;
	updatedAt: Date;
	eventTitle: string | undefined;
	eventSpecificType: string | undefined;
	sportType: string | undefined;
}

export const CommentDeleteTable = ({
	data,
	isLoading,
	tableHeaders,
	setPage,
	totalPages,
	page,
	refetch,
}: {
	data: IFeedbackData[];
	isLoading: boolean;
	tableHeaders: string[];
	totalPages: number;
	setPage: any;
	page: number;
	refetch: () => void;
}) => {
	const [selectedReview, setSelectedReview] = useState<string | null>(null);
	const [isDeleteReviewDialogOpen, setIsDeleteReviewDialogOpen] = useState(false);

	const { data: comments, refetch: refetchComments } = trpc.feedback.getComments.useQuery(
		{ reviewId: selectedReview || "" },
		{ enabled: !!selectedReview },
	);

	const deleteCommentMutation = trpc.feedback.deleteComment.useMutation({
		onSuccess: () => {
			refetchComments();
		},
	});

	const deleteReviewMutation = trpc.feedback.deleteReview.useMutation({
		onSuccess: () => {
			toast.success("Review deleted successfully");
			refetch();
			setIsDeleteReviewDialogOpen(false);
		},
		onError: (error: { message?: string }) => {
			toast.error(error.message || "Failed to delete review");
		},
	});

	return (
		<>
			<Table className="text-base">
				<TableHeader>
					<TableRow>
						{tableHeaders.map((header, idx: number) => (
							<TableHead className={`text-center`} key={idx}>
								{header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody className="bg-[#FDFDFD]">
					{!isLoading &&
						data &&
						data.length > 0 &&
						data.map((item, index: number) => (
							<TableRow key={index}>
								<TableCell className="text-center">{index + 1}</TableCell>
								<TableCell className="text-center">
									<div className="flex flex-row items-center gap-2">
										<Avatar>
											<AvatarImage
												src={item.avatarUrl || "/placeholder.svg"}
												alt={item.email || ""}
											/>
											<AvatarFallback>{item?.email?.charAt(0).toUpperCase()}</AvatarFallback>
										</Avatar>
										<div className="">
											<p className="font-medium text-left capitalize">{item.name}</p>
											<p className="text-sm text-gray-500">{item.email}</p>
										</div>
									</div>
								</TableCell>
								<TableCell className="text-center whitespace-nowrap capitalize">
									{item?.eventTitle}
								</TableCell>
								<TableCell className="text-center">{item?.comment}</TableCell>
								<TableCell className="text-center flex justify-center items-center">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className={`w-6 h-6 ${
												i < item?.rating ? "text-[#C3996B] fill-[#C3996B]" : "text-[#C3996B]"
											}`}
										/>
									))}
								</TableCell>
								<TableCell className="text-center whitespace-nowrap">
									{moment(item?.createdAt).format("DD, MMM YYYY, hh:mm A")}
								</TableCell>
								<TableCell className="text-center">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<Dialog>
												<DialogTrigger asChild>
													<DropdownMenuItem
														onSelect={(e) => {
															e.preventDefault();
															setSelectedReview(item.id);
														}}
													>
														<MessageCircle className="h-4 w-4 mr-2" />
														View Reply
													</DropdownMenuItem>
												</DialogTrigger>
												<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
													<DialogHeader>
														<DialogTitle>Comments</DialogTitle>
													</DialogHeader>
													<div className="flex flex-col gap-4">
														<div className="border rounded-lg p-4 bg-gray-50">
															<div className="flex items-center gap-2 mb-2">
																<Avatar>
																	<AvatarImage
																		src={item.avatarUrl || "/placeholder.svg"}
																		alt={item.email || ""}
																	/>
																	<AvatarFallback>
																		{item?.email?.charAt(0).toUpperCase()}
																	</AvatarFallback>
																</Avatar>
																<div>
																	{item.name ? (
																		<p className="font-medium">{item.name}</p>
																	) : (
																		""
																	)}
																	<p className="text-sm text-gray-500">
																		{moment(item.createdAt).format(
																			"DD MMM YYYY, hh:mm A",
																		)}
																	</p>
																</div>
															</div>
															<p>{item.comment}</p>
														</div>

														<div className="space-y-4">
															{comments?.data?.map((comment: IComment) => (
																<div key={comment.id} className="border rounded-lg p-4">
																	<div className="flex items-center justify-between mb-2">
																		<div className="flex items-center gap-2">
																			<Avatar>
																				<AvatarImage
																					src={
																						comment.user.avatarUrl ||
																						"/placeholder.svg"
																					}
																					alt={comment.user.email || ""}
																				/>
																				<AvatarFallback>
																					{comment.user.email
																						?.charAt(0)
																						.toUpperCase()}
																				</AvatarFallback>
																			</Avatar>
																			<div className="flex flex-col gap-2">
																				<p className="font-medium">
																					{comment.user.firstName}{" "}
																					{comment.user.lastName}
																				</p>
																				<div className="flex flex-row gap-2">
																					{comment.user.role === "VENDOR" && (
																						<Badge
																							variant="outline"
																							className="bg-[#E5D3BA] text-[#6F6F6F]"
																						>
																							Host
																						</Badge>
																					)}
																					<p className="text-sm text-gray-500">
																						{moment(
																							comment.createdAt,
																						).format(
																							"DD MMM YYYY, hh:mm A",
																						)}
																					</p>
																				</div>
																			</div>
																		</div>
																		{
																			<div className="flex gap-2">
																				<AlertDialog>
																					<AlertDialogTrigger asChild>
																						<Button
																							variant="ghost"
																							size="icon"
																						>
																							<Trash2 className="h-4 w-4" />
																						</Button>
																					</AlertDialogTrigger>
																					<AlertDialogContent>
																						<AlertDialogHeader>
																							<AlertDialogTitle>
																								Are you sure you want to
																								delete this comment?
																							</AlertDialogTitle>
																						</AlertDialogHeader>
																						<AlertDialogFooter>
																							<AlertDialogCancel>
																								Cancel
																							</AlertDialogCancel>
																							<Button
																								variant="destructive"
																								onClick={() => {
																									deleteCommentMutation.mutate(
																										{
																											commentId:
																												comment.id,
																										},
																									);
																									if (
																										deleteCommentMutation.isError
																									) {
																										toast.error(
																											"Failed to delete comment",
																										);
																									} else {
																										toast.success(
																											"Comment deleted successfully",
																										);
																									}
																								}}
																							>
																								{deleteCommentMutation.isLoading ? (
																									<LoadingSpinner className="w-4 h-4" />
																								) : (
																									"Delete"
																								)}
																							</Button>
																						</AlertDialogFooter>
																					</AlertDialogContent>
																				</AlertDialog>
																			</div>
																		}
																	</div>

																	<p>{comment.content}</p>
																</div>
															))}
														</div>
													</div>
												</DialogContent>
											</Dialog>
											<AlertDialog
												open={isDeleteReviewDialogOpen}
												onOpenChange={setIsDeleteReviewDialogOpen}
											>
												<AlertDialogTrigger asChild>
													<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
														<Trash2 className="h-4 w-4 mr-2" />
														Delete Review
													</DropdownMenuItem>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Are you sure you want to delete this review?
														</AlertDialogTitle>
														<AlertDialogDescription>
															This action cannot be undone. This will permanently delete
															the review and all its comments.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<Button
															variant="destructive"
															onClick={() => {
																if (item.id) {
																	deleteReviewMutation.mutate({
																		reviewId: item.id,
																	});
																}
															}}
														>
															{deleteReviewMutation.isLoading ? (
																<LoadingSpinner className="w-4 h-4" />
															) : (
																"Delete"
															)}
														</Button>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
			{data && data.length > 0 && (
				<div className="flex justify-end items-center mt-4">
					<div className="flex items-center gap-2">
						<span>{`Page ${page} of ${totalPages}`}</span>
						<div className="flex space-x-1">
							<Button variant="outline" size="icon" onClick={() => setPage(1)} disabled={page === 1}>
								<ChevronsLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={() => setPage((prev: any) => Math.max(prev - 1, 1))}
								disabled={page === 1}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={() => setPage((prev: any) => Math.min(prev + 1, totalPages))}
								disabled={page === totalPages}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={() => setPage(totalPages)}
								disabled={page === totalPages}
							>
								<ChevronsRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			)}
			{isLoading && (
				<div className="flex flex-row justify-center mt-10 w-full">
					<LoadingSpinner className="text-black w-10 h-10" />
				</div>
			)}
			{!isLoading && data?.length === 0 && <div className="text-center mt-10 w-full">No data found</div>}
		</>
	);
};
