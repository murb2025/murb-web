import VendorDetail from "@/components/admin/VendorDetail";
import HomePage from "@/components/Dashboard/HomePage";
import React from "react";

export default function page({
	params,
}: {
	params: {
		vendorId: string;
	};
}) {
	return (
		<>
			<VendorDetail vendorId={params.vendorId} />
			<HomePage vendorId={params.vendorId} isAdmin={true} />
		</>
	);
}
