import { CommandMessage } from "discord.js";
import Command, { CommandReturn, AnyCommandContext } from "../../core/Command";

// Define a list of blacklisted guild IDs
const blacklistedGuilds = ["911987536379912193", "1216386140265906227", "1238351985627893830"];

export default class ServerInviteCommand extends Command {
    public readonly name = "serverinvite";
    public readonly systemAdminOnly = true;
    public readonly description = "Get an invite link to a server by ID.";

    async execute(message: CommandMessage, context: AnyCommandContext): Promise<CommandReturn> {
        await this.deferIfInteraction(message);

        if (context.isLegacy && !context.args[0]) {
            return void this.error(message, "You must specify a guild ID!");
        }

        const guildId = context.isLegacy ? context.args[0] : context.options.getString("guildId", true);

        // Check if the guild is blacklisted
        if (blacklistedGuilds.includes(guildId)) {
            await this.error(message, "Sorry, this server is blacklisted and you cannot get an invite.");
            return;
        }

        const guild = this.client.guilds.cache.get(guildId);

        if (!guild) {
            await this.error(message, "Invalid guild ID provided.");
            return;
        }

        const systemChannel = guild.systemChannel || guild.channels.cache.find(ch => ch.type === "GUILD_TEXT");
        if (!systemChannel) {
            await this.error(message, "Unable to find a suitable channel to create an invite.");
            return;
        }

        try {
            const invite = await systemChannel.createInvite({ unique: true });
            await this.success(message, `Here is the invite to the server: ${invite.url}`);
        } catch (error) {
            await this.error(message, "Failed to create an invite to the server.");
        }
    }
}
