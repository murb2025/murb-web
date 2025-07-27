import Image from "next/image";

const LogoLoader = () => {
	return (
		<div className="loaderContainer">
			<Image src="/brand/brand-logo-black.svg" alt="Logo" className="loader" width={100} height={100} />
		</div>
	);
};

export default LogoLoader;
