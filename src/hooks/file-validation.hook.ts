import React, { useCallback } from "react";
import { toast } from "react-hot-toast";

// Constants for file validation
const FILE_VALIDATION = {
	MAX_SIZE: 2 * 1024 * 1024, // 2MB
	ACCEPTED_TYPES: ["image/jpeg", "image/png", "image/jpg"],
	ASPECT_RATIOS: {
		LANDSCAPE: 16 / 9,
		PORTRAIT: 4 / 5,
		TOLERANCE: 0.01, // Allow for small rounding differences
	},
};

// Improved file validation functions
const validateFileBasics = (file: File): boolean => {
	// Size validation
	if (file.size > FILE_VALIDATION.MAX_SIZE) {
		toast.error(`File ${file.name} is larger than 2MB`);
		return false;
	}

	// Type validation
	if (!FILE_VALIDATION.ACCEPTED_TYPES.includes(file.type)) {
		toast.error(`File ${file.name} is not a supported format. Please upload JPEG, PNG, or JPG`);
		return false;
	}

	return true;
};

const validateImageDimensions = (file: File): Promise<boolean> => {
	return new Promise((resolve) => {
		const img = new Image();
		const objectUrl = URL.createObjectURL(file);

		img.onload = () => {
			URL.revokeObjectURL(objectUrl);
			const aspectRatio = img.width / img.height;

			// Check if the aspect ratio matches either landscape or portrait with tolerance
			const isLandscape =
				Math.abs(aspectRatio - FILE_VALIDATION.ASPECT_RATIOS.LANDSCAPE) <
				FILE_VALIDATION.ASPECT_RATIOS.TOLERANCE;
			const isPortrait =
				Math.abs(aspectRatio - FILE_VALIDATION.ASPECT_RATIOS.PORTRAIT) <
				FILE_VALIDATION.ASPECT_RATIOS.TOLERANCE;

			if (!isLandscape && !isPortrait) {
				toast.error(
					`${file.name} does not meet aspect ratio requirements (16:9 for landscape or 4:5 for portrait). Current ratio: ${aspectRatio.toFixed(2)}`,
				);
				resolve(false);
			}
			resolve(true);
		};

		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			toast.error(`Error loading ${file.name}`);
			resolve(false);
		};

		img.src = objectUrl;
	});
};

// Improved file handling hook
const useFileValidation = () => {
	const onDropWithValidation = useCallback(
		async (acceptedFiles: File[], setFiles: React.Dispatch<React.SetStateAction<File[]>>) => {
			const validFiles: File[] = [];

			for (const file of acceptedFiles) {
				if (validateFileBasics(file)) {
					const isValidDimensions = await validateImageDimensions(file);
					if (isValidDimensions) {
						validFiles.push(file);
					}
				}
			}

			if (validFiles.length > 0) {
				setFiles((prev) => [...prev, ...validFiles]);
			}

			if (validFiles.length !== acceptedFiles.length) {
				toast.error(
					`${acceptedFiles.length - validFiles.length} files were rejected due to validation failures`,
				);
			}
		},
		[],
	);

	return { onDropWithValidation };
};

export { useFileValidation, FILE_VALIDATION };
