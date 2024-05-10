import { ChatInputCommandInteraction, Message } from "discord.js";
import Command, { type CommandReturn, type BasicCommandContext } from "../../core/Command";

export default class ServerBlacklistCommand extends Command {
    public readonly name = "serverblacklist";
    public readonly systemAdminOnly = true;
    public readonly description = "Blacklist specific servers from generating invite links.";

    private readonly serverBlacklist: Set<string> = new Set(); // Set of blacklisted server IDs

    async execute(message: Message | ChatInputCommandInteraction, context: BasicCommandContext): Promise<CommandReturn> {
        await this.deferIfInteraction(message);

        if (context.isLegacy && !context.args[0]) {
            return void this.error(message, "You must specify at least one server ID to blacklist.");
        }

        let serverIds: string[];
        if (context.isLegacy) {
            serverIds = context.args;
        } else {
            serverIds = context.options.getString("serverIds", true).split(/[,\s]+/);
        }
        
        if (!serverIds.length) {
            return void this.error(message, "You must specify at least one server ID to blacklist.");
        }

        // Add the provided server IDs to the server blacklist set
        serverIds.forEach(serverId => {
            this.serverBlacklist.add(serverId);
        });

        await this.success(message, `The specified servers have been blacklisted from generating invite links.`);
    }

    isServerBlacklisted(guildId: string): boolean {
        return this.serverBlacklist.has(guildId);
    }
}
