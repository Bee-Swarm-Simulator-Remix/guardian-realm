import { existsSync } from "fs";
import IO from "../io/IO";
import { BuiltInTask } from "../types/BuiltInTask";

let ran = false;

export const dependenciesTask: BuiltInTask = {
    name: "dependencies",
    dependsOn: ["metadata"],
    handler: async cli => {
        if (
            !cli.packageManager.packagesNeedUpdate() &&
            !cli.cacheManager.noCacheFileFound() &&
            (existsSync("node_modules") || !existsSync(".blaze/cache.json"))
        ) {
            return;
        }

        const packageManager = cli.packageManager.getPackageManager();

        if (!["bun", "npm", "yarn", "pnpm"].includes(packageManager)) {
            IO.fail(`Unsupported package manager: "${packageManager}"`);
        }

        await cli.execCommand(`${packageManager} ${packageManager === "yarn" ? "" : "install"}`);
        ran = true;
    },
    async onEnd(cli) {
        if (ran && cli.tasks.has("afterDependencies")) {
            await cli.taskManager.execute("afterDependencies");
        }
    }
};