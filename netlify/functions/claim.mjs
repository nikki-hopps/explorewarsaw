import { onRequestGet } from "../../landing/functions/api/claim.js";
import { makeEnv } from "../lib/env.mjs";
export default (request) => onRequestGet({ request, env: makeEnv() });
export const config = { path: "/api/claim", method: "GET" };
