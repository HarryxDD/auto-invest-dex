import ky from 'ky';
import axios from "axios";

const URL = "http://10.0.2.2:3000";

export const instance = ky.extend({
	// prefixUrl,
	prefixUrl: `${process.env.API_URL ? process.env.API_URL : ''}/`,
	headers: {
		Accept: 'application/json',
	},
});

export const axiosInstance = axios.create({
	baseURL: URL,
	headers: {
		Accept: 'application/json',
	},
});