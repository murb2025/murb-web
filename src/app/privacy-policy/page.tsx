import Link from "next/link";

export default function PrivacyPolicy() {
	return (
		<div className="min-h-screen">
			<main>
				<div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
					<h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
				</div>
				<div className="max-w-7xl mx-auto pb-6 sm:px-6 lg:px-8">
					<div className="px-4 py-6 sm:px-0">
						<div className="bg-white shadow overflow-hidden sm:rounded-lg">
							<div className="px-4 py-5 sm:p-6">
								<h2 className="text-lg leading-6 font-medium text-gray-900">
									Effective Date: 08 Feb 2025
								</h2>
								<div className="mt-5 space-y-6 text-base text-gray-700">
									<section>
										<h3 className="text-lg font-medium text-gray-900">1. Introduction</h3>
										<p>
											Welcome to Murb. Your privacy is important to us. This Privacy Policy
											outlines how we collect, use, disclose, and safeguard your personal
											information when you access our website or services.
										</p>
									</section>

									<section>
										<h3 className="text-lg font-medium text-gray-900">2. Information We Collect</h3>
										<p>
											When you use Murb, we may automatically collect certain information from
											your device, including but not limited to:
										</p>
										<ul className="list-disc pl-5 mt-2 space-y-1">
											<li>Browser type and version</li>
											<li>IP address</li>
											<li>Language preferences</li>
											<li>Operating system details</li>
											<li>Cookies, device ID, and location</li>
											<li>State or country from which you accessed Murb</li>
											<li>Pages viewed and videos watched</li>
											<li>Time spent on pages or videos</li>
											<li>
												Services used and how you interact with them (e.g., clicks, searches,
												transactions)
											</li>
											<li>Date and time of your visit</li>
											<li>Metadata, log files, and error logs</li>
											<li>Geographic and demographic data</li>
											<li>Hardware and software details</li>
											<li>Pop-up or push notifications viewed and responded to</li>
										</ul>
										<p className="mt-2">
											to analyze and enhance our platform, improve user experience, and provide
											better services.
										</p>
										<p className="mt-2">
											If any of this data is associated with your personal identity, it will be
											treated as personal data. Otherwise, it will be considered non-personal
											data.
										</p>
									</section>

									<section>
										<h3 className="text-lg font-medium text-gray-900">
											3. How We Use Your Information
										</h3>
										<p>We use the collected data for the following purposes:</p>
										<ul className="list-disc pl-5 mt-2 space-y-1">
											<li>To operate and improve Murb services.</li>
											<li>To enhance your user experience by providing personalized content.</li>
											<li>To prevent fraudulent activities and enhance security.</li>
											<li>To comply with legal obligations.</li>
											<li>To analyze website performance and trends.</li>
										</ul>
									</section>

									<section>
										<h3 className="text-lg font-medium text-gray-900">4. Sharing of Information</h3>
										<p>
											We do not sell, rent, or share your personal information with third parties
											except in the following cases:
										</p>
										<ul className="list-disc pl-5 mt-2 space-y-1">
											<li>
												<strong>Service Providers:</strong> We may share data with trusted third
												parties who assist in website operations, payment processing, or
												security enhancements.
											</li>
											<li>
												<strong>Legal Compliance:</strong> If required by law, we may disclose
												your data to comply with legal obligations or respond to law enforcement
												requests.
											</li>
											<li>
												<strong>Business Transfers:</strong> In case of a merger, acquisition,
												or sale of assets, your data may be transferred to the new entity.
											</li>
										</ul>
									</section>

									<section>
										<h3 className="text-lg font-medium text-gray-900">
											5. Cookies and Tracking Technologies
										</h3>
										<p>
											We use cookies and similar tracking technologies to enhance user experience
											and gather analytical data. You may control cookies through your browser
											settings.
										</p>
									</section>

									<section>
										<h3 className="text-lg font-medium text-gray-900">6. Data Security</h3>
										<p>
											We implement security measures to protect your personal information from
											unauthorized access, loss, or misuse. However, no method of transmission
											over the internet is completely secure.
										</p>
									</section>

									<section>
										<h3 className="text-lg font-medium text-gray-900">7. User Rights</h3>
										<p>Depending on your jurisdiction, you may have rights such as:</p>
										<ul className="list-disc pl-5 mt-2 space-y-1">
											<li>Accessing your personal data</li>
											<li>Requesting data deletion or correction</li>
											<li>Objecting to data processing</li>
											<li>Opting out of marketing communications</li>
										</ul>
										<p className="mt-2">To exercise these rights, contact us at +91 91631-18752.</p>
									</section>

									<section>
										<h3 className="text-lg font-medium text-gray-900">8. Retention of Data</h3>
										<p>
											We retain collected data for as long as necessary to fulfill the purposes
											outlined in this policy, comply with legal requirements, and resolve
											disputes.
										</p>
									</section>

									<section>
										<h3 className="text-lg font-medium text-gray-900">9. Third-Party Links</h3>
										<p>
											Our platform may contain links to third-party websites. We are not
											responsible for the privacy practices of these external sites.
										</p>
									</section>

									<section>
										<h3 className="text-lg font-medium text-gray-900">
											10. Changes to This Policy
										</h3>
										<p>
											We reserve the right to modify this Privacy Policy. Any updates will be
											posted on this page with the revised effective date.
										</p>
									</section>

									<section>
										<h3 className="text-lg font-medium text-gray-900">11. Contact Us</h3>
										<p>
											If you have any questions regarding this Privacy Policy, you may contact us
											at:
										</p>
										<Link href={"tel:+919163118752"}>+91 91631-18752</Link>
									</section>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
