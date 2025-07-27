"use client";
export function isAdminEmail(email: string) {
	const envEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
	// console.log(envEmails, email);
	if (!envEmails) return false;

	const emailsArr = envEmails?.split(",").map((em) => em.trim());

	return emailsArr.includes(email);
}

export function enhanceHtmlContent(htmlContent: string): string {
	// Create a temporary DOM element to parse the HTML content
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = htmlContent;

	// Select and enhance all code blocks
	const codeBlocks = tempDiv.querySelectorAll("pre code");
	codeBlocks.forEach((codeBlock) => {
		const pre = codeBlock.parentNode;
		const header = document.createElement("div");
		header.className = "code-block-header";
		pre?.parentNode?.insertBefore(header, pre);

		// Append language to header
		const lang = codeBlock.className.replace("lang-", "");
		const langSpan = document.createElement("span");
		langSpan.className = "language";
		langSpan.innerText = lang;
		header.appendChild(langSpan);

		// Create a button to copy code
		const copyButton = document.createElement("button");
		copyButton.className = "copy-btn";
		copyButton.type = "button";
		copyButton.innerText = "Copy";

		// Append copy button to header
		header.appendChild(copyButton);
	});

	// Select and enhance all headings
	const headings = tempDiv.querySelectorAll("h1, h2, h3, h4, h5, h6");
	headings.forEach((heading) => {
		const id = heading.id || heading.textContent?.trim().replace(/\s+/g, "-").toLowerCase() || "";
		heading.id = id;
		heading.className = "heading";

		// Create an <a> tag and wrap the heading
		const anchor = document.createElement("a");
		anchor.href = `#${id}`;
		anchor.style.textDecoration = "none"; // Remove underline from link

		// Insert "#" before the heading
		anchor.innerHTML = `
		${heading.outerHTML}
	  `;

		// Replace the original heading with the wrapped version
		heading.parentNode?.replaceChild(anchor, heading);
	});

	// Return the modified HTML content
	return tempDiv.innerHTML;
}
