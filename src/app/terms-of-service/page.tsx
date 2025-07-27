import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
	return (
		<div className="max-w-7xl container mx-auto py-6 px-4">
			<h1 className="text-3xl font-bold mb-4">Terms of Service</h1>

			<div className="max-w-7xl mx-auto grid gap-8">
				<Card>
					<CardHeader>
						<CardTitle>Terms for Users</CardTitle>
						<CardDescription>Please read these terms carefully before using our services.</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="list-disc pl-5 space-y-4">
							<li>
								<strong>Booking Confirmation:</strong> Users must present the booking confirmation
								receipt at the venue or event.
							</li>
							<li>
								<strong>Cancellation and Refunds:</strong>
								<ul className="list-circle pl-5 mt-2 space-y-2">
									<li>Users are not allowed to cancel bookings.</li>
									<li>Refunds will only be provided if the vendor cancels the booking.</li>
									<li>
										If you are unable to attend, you may forward your ticket to someone else,
										allowing them to use the booking on your behalf.
									</li>
								</ul>
							</li>
							<li>
								<strong>Payment Policy:</strong>
								<ul className="list-circle pl-5 mt-2 space-y-2">
									<li>All transactions must be completed through the Murb platform.</li>
									<li>
										Direct cash or off-platform transactions with vendors are strictly prohibited.
										Violations will result in account deactivation.
									</li>
								</ul>
							</li>
							<li>
								<strong>Liability Disclaimer:</strong> Murb acts solely as an aggregator and is not
								liable for damages, injuries, or losses incurred during the use of booked services.
							</li>
							<li>
								<strong>User Responsibility:</strong> Damages caused by the user to the venue or
								equipment may incur additional charges.
							</li>
							<li>
								<strong>Illegal Activities:</strong> Use of services for unlawful purposes is strictly
								forbidden.
							</li>
							<li>
								<strong>Privacy Compliance:</strong> User data is processed in line with applicable data
								protection laws.
							</li>
							<li>
								<strong>Behavioral Expectations:</strong> Users must maintain respectful conduct during
								interactions with vendors and comply with booked time slots.
							</li>
							<li>
								<strong>Information Accuracy:</strong> Users must provide accurate information when
								booking and adhere to venue or trainer-specific requirements.
							</li>
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Terms for Hosts</CardTitle>
						<CardDescription>
							Please read these terms carefully before offering your services.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="list-disc pl-5 space-y-4">
							<li>
								<strong>Service Accuracy:</strong> Hosts must ensure services are accurately described
								and available as per the confirmed details.
							</li>
							<li>
								<strong>Quality Standards:</strong> Hosts are required to uphold the quality and safety
								of their offerings at all times.
							</li>
							<li>
								<strong>Cancellation Policy:</strong>
								<ul className="list-circle pl-5 mt-2 space-y-2">
									<li>
										Hosts may cancel services only if there is an emergency but must notify Murb
										team via call or email in advance.
									</li>
									<li>
										Cancellations will result in penalties, such as reduced listing visibility or
										account suspension.
									</li>
									<li>
										If a vendor cancels an event and takes direct payment from users, their account
										will be immediately suspended.
									</li>
								</ul>
							</li>
							<li>
								<strong>Commission and Payment:</strong>
								<ul className="list-circle pl-5 mt-2 space-y-2">
									<li>Murb deducts a predefined commission on successful bookings.</li>
									<li>
										Payments to vendors will be processed within a specified timeframe (e.g., 7–10
										business days) post-service completion.
									</li>
								</ul>
							</li>
							<li>
								<strong>Taxes and Documentation:</strong> Hosts are responsible for accurate business
								information, required documentation (e.g., licenses, tax details), and applicable taxes.
							</li>
							<li>
								<strong>Prohibited Practices:</strong> Sharing user data outside the platform, engaging
								in fraudulent activities, or violating laws is strictly forbidden and will result in
								legal repercussions.
							</li>
							<li>
								<strong>Liability:</strong> Hosts are accountable for obtaining and maintaining required
								insurance coverage for their services. Murb is not liable for damages, injuries, or
								losses from vendor services.
							</li>
							<li>
								<strong>Behavioral Standards:</strong> Hosts must maintain professionalism and adhere to
								booked time slots. Misconduct may result in account suspension.
							</li>
							<li>
								<strong>Performance Monitoring:</strong> Murb reserves the right to conduct periodic
								reviews of vendor performance and user feedback.
							</li>
							<li>
								<strong>Dispute Resolution:</strong> Hosts are expected to cooperate with Murb in
								resolving user disputes amicably.
							</li>
							<li>
								<strong>Direct Transactions:</strong> Cash or direct transactions with users are
								strictly prohibited and will result in penalties and legal action.
							</li>
							<li>
								<strong>Account Termination:</strong> Murb retains the right to suspend or terminate
								vendor accounts for terms violations, poor performance, or fraudulent activity.
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
