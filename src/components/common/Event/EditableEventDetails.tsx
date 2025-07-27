import { useState } from "react";
import EventFullDetails from "./EventFullDetail";
import { IEvent } from "@/types/event.type";

export default function EditableEventDetails({
	data: initialData,
	isBookingPage = false,
	onSave,
}: {
	data: Partial<IEvent>;
	isBookingPage?: boolean;
	onSave?: (data: Partial<IEvent>) => void;
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [data, setData] = useState(initialData);

	if (!isEditing) {
		return (
			<div className="relative">
				<button
					className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					onClick={() => setIsEditing(true)}
				>
					Edit
				</button>
				<EventFullDetails data={data} isBookingPage={isBookingPage} />
			</div>
		);
	}

	const handleChange = (field: string, value: any) => {
		setData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSave = () => {
		onSave?.(data);
		setIsEditing(false);
	};

	// console.log(data);

	return (
		<div className="container mx-auto p-4 mt-24">
			<div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
				<div className="p-6">
					<div className="grid gap-8 md:grid-cols-2">
						{/* Left Column */}
						<div className="space-y-6">
							<div className="space-y-2">
								<label className="font-semibold">Title</label>
								<input
									className="w-full px-3 py-2 border rounded-md"
									value={data.title || ""}
									onChange={(e) => handleChange("title", e.target.value)}
								/>
							</div>

							{data.host !== undefined && data.host !== "" && (
								<div className="space-y-2">
									<label className="font-semibold">Hosted By</label>
									<input
										className="w-full px-3 py-2 border rounded-md"
										value={data.host || ""}
										onChange={(e) => handleChange("host", e.target.value)}
									/>
								</div>
							)}

							<div className="space-y-2">
								<label className="font-semibold">Description</label>
								<textarea
									className="w-full px-3 py-2 border rounded-md"
									value={data.description || ""}
									onChange={(e) => handleChange("description", e.target.value)}
									rows={4}
								/>
							</div>

							{data.eventSpecificType !== undefined && (
								<div className="space-y-2">
									<label className="font-semibold">Sport Category</label>
									<input
										className="w-full px-3 py-2 border rounded-md"
										value={data.eventSpecificType || ""}
										onChange={(e) => handleChange("eventSpecificType", e.target.value)}
									/>
								</div>
							)}

							{data.sportType !== undefined && (
								<div className="space-y-2">
									<label className="font-semibold">Sport Type</label>
									<input
										className="w-full px-3 py-2 border rounded-md"
										value={data.sportType || ""}
										onChange={(e) => handleChange("sportType", e.target.value)}
									/>
								</div>
							)}

							{data.tags !== undefined && (
								<div className="space-y-2">
									<label className="font-semibold">Tags</label>
									<input
										className="w-full px-3 py-2 border rounded-md"
										value={data.tags || ""}
										onChange={(e) => handleChange("tags", e.target.value)}
									/>
								</div>
							)}
						</div>

						{/* Right Column */}
						<div className="space-y-6">
							<div className="space-y-2">
								<label className="font-semibold">Start Date</label>
								<input
									type="date"
									className="w-full px-3 py-2 border rounded-md"
									value={data.startDate ? new Date(data.startDate).toISOString().split("T")[0] : ""}
									onChange={(e) => handleChange("startDate", e.target.value)}
								/>
							</div>

							{data.endDate !== undefined && (
								<div className="space-y-2">
									<label className="font-semibold">End Date</label>
									<input
										type="date"
										className="w-full px-3 py-2 border rounded-md"
										value={data.endDate ? new Date(data.endDate).toISOString().split("T")[0] : ""}
										onChange={(e) => handleChange("endDate", e.target.value)}
									/>
								</div>
							)}

							{data.startingTime !== undefined && (
								<div className="space-y-2">
									<label className="font-semibold">Opening Time</label>
									<input
										type="time"
										className="w-full px-3 py-2 border rounded-md"
										value={data.startingTime || ""}
										onChange={(e) => handleChange("startingTime", e.target.value)}
									/>
								</div>
							)}

							{data.endingTime !== undefined && (
								<div className="space-y-2">
									<label className="font-semibold">Closing Time</label>
									<input
										type="time"
										className="w-full px-3 py-2 border rounded-md"
										value={data.endingTime || ""}
										onChange={(e) => handleChange("endingTime", e.target.value)}
									/>
								</div>
							)}

							{!data.isOnline && (
								<>
									{data.landmark !== undefined && (
										<div className="space-y-2">
											<label className="font-semibold">Landmark</label>
											<input
												className="w-full px-3 py-2 border rounded-md"
												value={data.landmark || ""}
												onChange={(e) => handleChange("landmark", e.target.value)}
											/>
										</div>
									)}

									<div className="space-y-2">
										<label className="font-semibold">City</label>
										<input
											className="w-full px-3 py-2 border rounded-md"
											value={data.city || ""}
											onChange={(e) => handleChange("city", e.target.value)}
										/>
									</div>

									<div className="space-y-2">
										<label className="font-semibold">State</label>
										<input
											className="w-full px-3 py-2 border rounded-md"
											value={data.state || ""}
											onChange={(e) => handleChange("state", e.target.value)}
										/>
									</div>
								</>
							)}
						</div>
					</div>

					<div className="flex justify-end gap-4 mt-8">
						<button
							className="px-4 py-2 border rounded-md hover:bg-gray-100"
							onClick={() => setIsEditing(false)}
						>
							Cancel
						</button>
						<button
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							onClick={handleSave}
						>
							Save Changes
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
