import { ChatInputCommandInteraction, Message, TextChannel, ChannelType, Guild } from "discord.js";
import Command, { type CommandReturn, type BasicCommandContext } from "../../core/Command";

export default class ServerInviteCommand extends Command {
    public readonly name = "serverinvite";
    public readonly systemAdminOnly = true;
    public readonly description = "Get an invite link to a server by ID or name.";

    async execute(message: Message | ChatInputCommandInteraction, context: BasicCommandContext): Promise<CommandReturn> {
        await this.deferIfInteraction(message);

        if (context.isLegacy && !context.args[0]) {
            return void this.error(message, "You must specify a guild ID or name!");
        }

        let guildIdOrName = context.isLegacy ? context.args[0] : context.options.getString("guildIdOrName", true);
        
        let guild: Guild | undefined;
        if (!isNaN(Number(guildIdOrName))) {
            // If the input is a number, consider it as a guild ID
            guild = this.client.guilds.cache.get(guildIdOrName);
        } else {
            // Otherwise, try to find the guild by name
            guild = this.client.guilds.cache.find(guild => guild.name.toLowerCase() === guildIdOrName.toLowerCase());
        }

        if (!guild) {
            await this.error(message, "Invalid guild ID or name provided.");
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
