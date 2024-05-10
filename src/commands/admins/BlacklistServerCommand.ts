import { Message, ChatInputCommandInteraction } from "discord.js";
import Command, { CommandReturn, AnyCommandContext } from "../../core/Command";

// Import the blacklistedGuilds set from the file where it's defined
import { blacklistedGuilds } from "./path/to/blacklistedGuildsFile";

export default class BlacklistServerCommand extends Command {
    public readonly name = "blacklistserver";
    public readonly systemAdminOnly = true;
    public readonly description = "Blacklist a server from getting invite links.";

    async execute(message: Message | ChatInputCommandInteraction, context: AnyCommandContext): Promise<CommandReturn> {
        await this.deferIfInteraction(message);

        if (!context.args[0] && !context.options.getString("guildId", true)) {
            return void this.error(message, "You must specify a guild ID!");
        }

        const guildId = context.isLegacy ? context.args[0] : context.options.getString("guildId", true);

        // Add the guild ID to the blacklistedGuilds set
        this.blacklistedGuilds.add(guildId);

        // Respond with a success message
        await this.success(message, `Server with ID ${guildId} has been blacklisted.`);
    }
}
