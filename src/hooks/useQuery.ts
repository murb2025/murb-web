"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function useQuery() {
	const router = useRouter();
	// const pathname = usePathname();
	const searchParams = useSearchParams();

	const getQuery = (key: string) => {
		const value = searchParams.get(key) as string;
		return value;
	};

	const updateAndPushQuery = (newParams: Record<string, string>) => {
		const params = new URLSearchParams(searchParams.toString());

		Object.entries(newParams).forEach(([key, value]) => {
			params.set(key, value);
		});

		router.push(`${"/"}?${params.toString()}`);
	};

	return { getQuery, updateAndPushQuery };
}
