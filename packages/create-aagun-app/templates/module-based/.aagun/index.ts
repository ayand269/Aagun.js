import { loadUserAagunConfig } from "./loadUserConfig";
import { startAagunApp } from "@aagun/core";

export async function configureAagunApp() {
  const userConfig = await loadUserAagunConfig();
  return startAagunApp(userConfig);
}
