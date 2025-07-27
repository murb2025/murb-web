import { S3Client } from "@aws-sdk/client-s3";
import { Agent } from "https";

// Increase the maximum listeners
require("events").EventEmitter.defaultMaxListeners = 15;

// Create a singleton instance
class S3ClientSingleton {
	private static instance: S3Client;
	private static agent: Agent;

	public static getInstance(): S3Client {
		if (!S3ClientSingleton.instance) {
			// Create a new agent for each instance
			this.agent = new Agent({
				keepAlive: false,
				maxSockets: 50,
				timeout: 60000,
			});

			S3ClientSingleton.instance = new S3Client({
				region: "us-east-1",
				credentials: {
					accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
					secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
				},
				requestHandler: {
					httpOptions: {
						agent: this.agent,
						timeout: 60000,
					},
				},
				maxAttempts: 1,
			});
		}
		return S3ClientSingleton.instance;
	}

	public static destroyAgent() {
		if (this.agent) {
			this.agent.destroy();
		}
	}
}

export const getS3Client = () => S3ClientSingleton.getInstance();
export const destroyS3Agent = () => S3ClientSingleton.destroyAgent();
