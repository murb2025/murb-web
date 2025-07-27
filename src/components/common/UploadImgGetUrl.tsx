"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

type UploadImgGetUrlProps = {
	onFileUpload: (url: string) => void;
	initialImageUrl?: string | null; // Optional prop for pre-filled image
	type?: "portrait" | "landscape" | "square";
};

const UploadImgGetUrl: React.FC<UploadImgGetUrlProps> = ({ onFileUpload, initialImageUrl, type = "square" }) => {
	const [file, setFile] = useState<{ file: File; preview: string } | null>(null);
	const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialImageUrl || null);
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [loading, setLoading] = useState(false);

	const uploadFile = async (file: File) => {
		setLoading(true);
		setUploadProgress(0);

		try {
			const formData = new FormData();
			formData.append("file", file); // Append the actual file (not base64)

			// Make the upload request using FormData (multipart/form-data)
			const response = await fetch("/api/upload-file", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Upload failed with status " + response.status);
			}

			// Parse the response to get the uploaded file URL
			const data = await response.json();
			const uploadedUrl = data.url;

			if (!uploadedUrl) {
				throw new Error("No image URL returned from API");
			}

			setUploadedUrl(uploadedUrl);
			setFile((prev) => ({
				file: prev?.file as File,
				preview: uploadedUrl,
			}));

			onFileUpload(uploadedUrl);
			toast.success("File uploaded successfully!");
		} catch (error) {
			console.error("Upload error:", error);
			toast.error(`Error uploading file`);
		} finally {
			setLoading(false);
		}
	};

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		if (file) {
			// Check file type and size
			if (!["image/jpeg", "image/png"].includes(file.type)) {
				toast.error("Only JPEG and PNG files are allowed.");
				return;
			}
			if (file.size > 5 * 1024 * 1024) {
				// 5 MB limit
				toast.error("File size must be less than 5 MB.");
				return;
			}

			const preview = URL.createObjectURL(file);
			setFile({ file, preview });
			setUploadProgress(0); // Reset progress
			await uploadFile(file);
		}
		// eslint-disable-next-line
	}, []);

	const removeFile = () => {
		if (file?.preview) {
			URL.revokeObjectURL(file.preview);
		}
		setFile(null);
		setUploadedUrl(null);
		setUploadProgress(0);
		onFileUpload(""); // Clear the
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "image/jpeg": [], "image/png": [] },
		multiple: false,
	});

	useEffect(() => {
		if (initialImageUrl) {
			setUploadedUrl(initialImageUrl);
			setFile({ file: "" as any, preview: initialImageUrl });
		}
	}, [initialImageUrl]);

	return (
		<form onSubmit={(e) => e.preventDefault()} className="space-y-4">
			{loading && (
				<div className="flex items-center flex-col justify-center">
					<div role="status">
						<svg
							aria-hidden="true"
							className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
							viewBox="0 0 100 101"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
								fill="currentColor"
							/>
							<path
								d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
								fill="currentFill"
							/>
						</svg>
						<span className="sr-only">Uploading...</span>
					</div>
				</div>
			)}
			<div
				{...getRootProps()}
				className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer bg-white"
			>
				<input {...getInputProps()} />
				{isDragActive ? (
					<p>Drop the files here...</p>
				) : file ? (
					<div className="flex flex-col items-center w-full h-full">
						<section
							className={`relative border-2 border-gray-300 rounded-lg h-full w-full ${type === "portrait" ? "aspect-[4/5]" : type === "landscape" ? "aspect-video w-[350px]" : "aspect-square"}`}
						>
							<Image src={file.preview} alt="Preview" fill className="object-cover rounded-lg mb-2" />
						</section>
						<span className="text-sm truncate">{file.file.name}</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={removeFile}
							className="text-red-500 hover:text-red-700"
						>
							Remove
						</Button>
					</div>
				) : (
					<>
						<p className="text-gray-500">Drag & Drop to Upload</p>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							className="mt-2 bg-gray-700 text-white hover:bg-gray-500 hover:scale-105 transition-transform"
						>
							Select File
						</Button>
					</>
				)}
			</div>
			{/* Progress Bar */}
			{uploadProgress > 0 && uploadProgress < 100 && (
				<div className="w-full bg-gray-200 rounded-full h-4">
					<div className="bg-blue-600 h-4 rounded-full" style={{ width: `${uploadProgress}%` }} />
				</div>
			)}
		</form>
	);
};

export default UploadImgGetUrl;
