import { onRequestPost } from "../../landing/functions/api/stripe-webhook.js";
import { makeEnv } from "../lib/env.mjs";
export default (request) => onRequestPost({ request, env: makeEnv() });
export const config = { path: "/api/stripe-webhook", method: "POST" };
