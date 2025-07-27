import { Octokit } from "@octokit/rest";
import { NextApiRequest, NextApiResponse } from "next";

const formatDateTime = () => {
	const now = new Date();

	// Format date: "October 26, 2024"
	const date = now.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	// Format time: "14:30 EST"
	const time = now.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		timeZoneName: "short",
	});

	return { date, time };
};

const formatIssueBody = ({ description, name, email }: { description: string; name: string; email: string }) => {
	const { date, time } = formatDateTime();

	let body = `### Description
  ${description}
  
  ---`;

	// Add reporter info section only if either name or email exists
	if (name || email) {
		body += "\n### Reporter Information\n";
		if (name) body += `👤 ${name}\n`;
		if (email) body += `📧 ${email}\n`;
	}

	// Add styled date and time
	body += `\n> 📅 ${date} at ${time}`;

	return body;
};

export const reportIssueApi = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		const { name, email, title, description, labels } = req.body;

		if (!title || !description || !labels) {
			return res.status(400).json({
				error: "Missing required fields",
				success: false,
			});
		}

		const octokit = new Octokit({
			auth: process.env.NEXT_GITHUB_TOKEN,
		});

		const issueBody = formatIssueBody({
			description,
			name,
			email,
		});

		const response = await octokit.issues.create({
			owner: "opengig",
			repo: "murb",
			title,
			body: issueBody,
			labels,
			assignees: [""],
		});

		if (response.status === 201 || response.status === 200) {
			if (response.data) {
				return res.status(200).json({
					success: true,
				});
			}
		} else {
			return res.status(500).json({
				success: false,
				error: "Failed to create issue",
			});
		}
	} catch (e) {
		// console.log(e);
		return res.status(500).json({
			success: false,
			error: (e as Error).message,
		});
	}
};
