import Typography from "@/components/Typography";

export default function VendorDashboard() {
	return (
		<div className="p-6">
			<Typography size="xxxl" weight="medium" className="mb-6">
				Host Dashboard
			</Typography>
			<div className="grid gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<Typography size="xl" weight="medium" className="mb-4">
						Welcome to your Host Dashboard
					</Typography>
					<Typography>Manage your events, bookings, and account settings from here.</Typography>
				</div>
			</div>
		</div>
	);
}
