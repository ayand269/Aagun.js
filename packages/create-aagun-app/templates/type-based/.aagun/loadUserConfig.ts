import path from "path";
import { pathToFileURL } from "url";

export async function loadUserAagunConfig() {
  const configPath = pathToFileURL(
    path.resolve(process.cwd(), "aagun.config.js")
  ).href;

  try {
    return (await import(configPath)).default;
  } catch (e) {
    console.warn("⚠️ Failed to load aagun.config.js. Using fallback config.");
    console.error(e);
    return {};
  }
}
