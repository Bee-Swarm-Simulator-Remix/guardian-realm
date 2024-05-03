import { CommandInteraction, Guild, TextChannel, ChannelType } from "discord.js";
import Client from "../../core/Client";
import Command from "../../core/Command";

export default class ServerInviteCommand extends Command {
    public readonly name = "serverinvite";
    public readonly systemAdminOnly = true;
    public readonly description = "Get an invite link to a server by ID.";

    constructor(client: Client<true>) {
        super(client);
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        await this.deferIfInteraction(interaction);

        const guildId = interaction.options.getString("guildId", true);

        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) {
            await this.error(interaction, "Invalid guild ID provided.");
            return;
        }

        const systemChannel = guild.systemChannel || guild.channels.cache.find((ch) => ch.type === ChannelType.GUILD_TEXT);
        if (!systemChannel || !systemChannel.isText()) {
            await this.error(interaction, "Unable to find a suitable channel to create an invite.");
            return;
        }

        try {
            const invite = await (systemChannel as TextChannel).createInvite({ unique: true });
            await this.success(interaction, `Here is the invite to the server: ${invite.url}`);
        } catch (error) {
            await this.error(interaction, "Failed to create an invite to the server.");
        }
    }
}
