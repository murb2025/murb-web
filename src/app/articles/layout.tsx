import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/Buyer/nav/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Murb Blogs",
	keywords: "Murb Blogs,blogs,Murb,Murb, Murb,Murb Articles, murb, murb,murb blogs",
};

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Navbar />
			<div className="md:px-16 px-4 bg-white pt-6 flex flex-col flex-1">
				<div className="h-20"></div>
				{children}
			</div>
			<Footer />
		</>
	);
}
