import { onRequestGet } from "../../landing/functions/api/download.js";
import { makeEnv } from "../lib/env.mjs";
export default (request) => onRequestGet({ request, env: makeEnv() });
export const config = { path: "/api/download", method: "GET" };
