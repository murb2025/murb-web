import axios from "axios";

export const gql = async (query: string, variables = {}) => {
	const data = await axios.post(process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT!, {
		query,
		variables,
	});

	return data.data;
};
