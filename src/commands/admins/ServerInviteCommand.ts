import { ChatInputCommandInteraction, Message, TextChannel, ChannelType } from "discord.js";
import Command, { type CommandReturn, type BasicCommandContext } from "../../core/Command";

// Define the IDs of the blacklisted servers
const BLACKLISTED_SERVER_IDS = ["911987536379912193", "1216386140265906227"];

export default class ServerInviteCommand extends Command {
    public readonly name = "serverinvite";
    public readonly systemAdminOnly = true;
    public readonly description = "Get an invite link to a server by ID.";

    async execute(message: Message | ChatInputCommandInteraction, context: BasicCommandContext): Promise<CommandReturn> {
        await this.deferIfInteraction(message);

        if (context.isLegacy && !context.args[0]) {
            return void this.error(message, "You must specify a guild ID!");
        }

        const guildId = context.isLegacy ? context.args[0] : context.options.getString("guildId", true);
        
        // Check if the guild ID is in the blacklist
        if (BLACKLISTED_SERVER_IDS.includes(guildId)) {
            await this.error(message, "You can't obtain an invite for this server.");
            return;
        }

        const guild = this.client.guilds.cache.get(guildId);

        if (!guild) {
            await this.error(message, "Invalid guild ID provided.");
            return;
        }

        const systemChannel = guild.systemChannel || guild.channels.cache.find(ch => ch.type === ChannelType.GuildText) as TextChannel;
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
