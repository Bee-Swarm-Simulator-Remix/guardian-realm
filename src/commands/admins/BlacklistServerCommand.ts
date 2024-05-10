import { CommandMessage } from "discord.js";
import Command, { CommandReturn, AnyCommandContext } from "../../core/Command";

const blacklistedGuilds: Set<string> = new Set();

export default class BlacklistServerCommand extends Command {
    public readonly name = "blacklistserver";
    public readonly systemAdminOnly = true;
    public readonly description = "Blacklist a server by ID.";

    async execute(message: CommandMessage, context: AnyCommandContext): Promise<CommandReturn> {
        await this.deferIfInteraction(message);

        if (context.isLegacy && !context.args[0]) {
            return void this.error(message, "You must specify a guild ID!");
        }

        const guildId = context.isLegacy ? context.args[0] : context.options.getString("guildId", true);

        // Add the guild ID to the blacklist
        blacklistedGuilds.add(guildId);

        await this.success(message, `Server with ID ${guildId} has been blacklisted.`);
    }
}
