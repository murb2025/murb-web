// file-polyfill.ts
import { Blob } from "buffer";

// Check if File is not defined (server-side environment)
if (typeof globalThis.File === "undefined") {
	class FilePolyfill extends Blob {
		name: string;
		lastModified: number;

		constructor(
			bits: (Blob | ArrayBuffer | string)[],
			name: string,
			options?: { lastModified?: number; type?: string },
		) {
			super(bits, options);
			this.name = name;
			this.lastModified = options?.lastModified || Date.now();
		}
	}

	// Assign to global object
	globalThis.File = FilePolyfill as any;
}

// Ensure the module can be imported
export {};
