import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
	region: process.env.AWS_S3_REGION,
	credentials: {
		accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
	},
});

async function uploadFileToS3(file: File, fileName: string) {
	const fileBuffer = file;

	const uniqueName = `${Date.now()}-${fileName}`;

	const params = {
		Bucket: process.env.AWS_S3_BUCKET_NAME,
		Key: `murb/${uniqueName}`,
		Body: fileBuffer,
		ContentType: "image/jpg",
	};

	const command = new PutObjectCommand(params);
	await s3Client.send(command);
	return uniqueName;
}

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get("file");

		if (!file) {
			return NextResponse.json({ error: "File is required." }, { status: 400 });
		}

		const buffer = Buffer.from(await (file as any).arrayBuffer());
		const fileName = await uploadFileToS3(buffer as any, (file as any).name);

		return NextResponse.json(
			{
				success: true,
				fileName,
				url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/murb/${fileName}`,
			},
			{ status: 200 },
		);
	} catch (error: any) {
		return NextResponse.json(
			{
				error: error.message,
			},
			{ status: 500 },
		);
	}
}
