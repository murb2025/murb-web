import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
	region: process.env.NEXT_REPORT_ISSUE_AWS_REGION,
	credentials: {
		accessKeyId: process.env.NEXT_AWS_S3_ACCESS_KEY_ID!,
		secretAccessKey: process.env.NEXT_AWS_S3_SECRET_ACCESS_KEY!,
	},
});

async function uploadToS3(base64Image: string, fileName: string) {
	const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
	const buffer = Buffer.from(base64Data, "base64");

	const command = new PutObjectCommand({
		Bucket: process.env.NEXT_REPORT_ISSUE_AWS_BUCKET_NAME!,
		Key: `issue-screenshots/${fileName}`,
		ContentType: "image/png",
		Body: buffer,
	});

	await s3Client.send(command);
	return `https://${process.env.NEXT_REPORT_ISSUE_AWS_BUCKET_NAME}.s3.${process.env.NEXT_REPORT_ISSUE_AWS_REGION}.amazonaws.com/issue-screenshots/${fileName}`;
}

const formatDateTime = () => {
	const now = new Date();
	const date = now.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const time = now.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		timeZoneName: "short",
	});
	return { date, time };
};

const formatIssueBody = ({
	description,
	name,
	email,
	screenshots,
}: {
	description: string;
	name: string;
	email: string;
	screenshots: string[];
}) => {
	const { date, time } = formatDateTime();

	let body = `### Description
${description}

${screenshots.length > 0 ? "### Screenshots\n" + screenshots.map((url) => `![Screenshot](${url})`).join("\n\n") : ""}

---`;

	if (name || email) {
		body += "\n### Reporter Information\n";
		if (name) body += `👤 ${name}\n`;
		if (email) body += `📧 ${email}\n`;
	}

	body += `\n> 📅 ${date} at ${time}`;

	return body;
};

export const POST = async (request: Request) => {
	try {
		const { name, email, title, description, labels, screenshots = [] } = await request.json();

		if (!title || !description || !labels) {
			console.error("Missing required fields in POST /api/report-issue route");
			return NextResponse.json({ error: "Missing required fields", success: false }, { status: 400 });
		}

		const imageUrls = await Promise.all(
			screenshots.map(async (base64: string, index: number) => {
				const fileName = `${Date.now()}-${index}.png`;
				return await uploadToS3(base64, fileName);
			}),
		);

		const octokit = new Octokit({
			auth: process.env.NEXT_GITHUB_TOKEN,
		});

		const issueBody = formatIssueBody({
			description,
			name,
			email,
			screenshots: imageUrls,
		});

		const response = await octokit.issues.create({
			owner: "opengig",
			repo: "murb",
			title,
			body: issueBody,
			labels,
			assignees: ["rtnAyush"],
		});

		if (response.status === 201 || response.status === 200) {
			if (response.data) {
				console.info(`Issue created successfully - ${response.data.html_url}`);
				return NextResponse.json({ success: true }, { status: 200 });
			}
		}

		console.error(`Failed to create issue: ${JSON.stringify(response)}`);
		return NextResponse.json({ success: false, error: "Failed to create issue" }, { status: 500 });
	} catch (e: any) {
		console.error(`Error creating issue: ${e.message}`);
		return NextResponse.json({ success: false, error: e.message }, { status: 500 });
	}
};
