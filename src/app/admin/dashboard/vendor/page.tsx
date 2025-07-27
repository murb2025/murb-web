"use client";
import * as React from "react";
import { useState } from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/app/provider";
import { VendorDataTable } from "@/components/admin/VendorDataTable";
import { IoSearch } from "react-icons/io5";

const Events = () => {
	const [status, setStatus] = useState("ALL");
	const [searchText, setSearchText] = useState("");

	const { data: vendorData, isLoading: isVendorDataLoading } = trpc.admin.getTopVendor.useQuery({
		timeFilter: "all_time",
		limit: 100,
		accountStatus: status as any,
		searchText: searchText,
	});

	return (
		<main className="flex-1 overflow-auto">
			<div className="bg-white rounded-lg">
				<div className="flex flex-row items-center justify-between mb-3">
					<h2 className="text-black text-2xl font-medium">Host&apos;s List</h2>
				</div>

				<div className="w-full flex flex-col md:flex-row justify-between items-center mb-[30px]">
					<div className="w-full px-2 md:px-0 flex flex-col md:flex-row gap-2 md:items-center">
						<div className="flex flex-row justify-between md:w-[360px] px-4 py-1.5 border-[1px] border-[#D9D9D9] rounded-[8px]">
							<input
								placeholder="Search by name, email"
								className="bg-none w-full outline-none text-[#6F6F6F]"
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
							/>
							<IoSearch className="text-[#6D6D6D]" size={24} />
						</div>
						<Select defaultValue={"ALL"} onValueChange={setStatus}>
							<SelectTrigger className="w-full md:w-[200px] flex gap-2 px-4  py-0 text-base border border-black/20 shadow-none rounded-lg hover:bg-gray-50">
								<SelectValue className="w-fit" placeholder={"ALL"} />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{["ALL", "UNVERIFIED", "VERIFIED", "SUSPENDED"].map((str, idx) => (
										<SelectItem key={idx} value={str} className="capitalize">
											{str}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
				<VendorDataTable data={vendorData?.users as any | []} isEventLoading={isVendorDataLoading} />
			</div>
		</main>
	);
};

export default Events;
