import { CommandInteraction, Guild, TextBasedChannels, ChannelType } from "discord.js";
import Client from "../../core/Client";
import Command from "../../core/Command";

export default class ServerInviteCommand extends Command {
    public readonly name = "serverinvite";
    public readonly systemAdminOnly = true;
    public readonly description = "Generate an invite to a specific server.";

    constructor(client: Client<true>) {
        super(client);
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        // Get the guild ID from the interaction options
        const guildId = interaction.options.getString("guildId", true);

        // Get the guild
        const guild = this.client.guilds.cache.get(guildId);

        if (!guild) {
            await interaction.followUp("Invalid guild ID provided.");
            return;
        }

        // Find a suitable text-based channel to create an invite
        const systemChannel = guild.systemChannel || guild.channels.cache.find((ch) => ch.type === ChannelType.GUILD_TEXT);

        if (!systemChannel) {
            await interaction.followUp("Unable to find a suitable channel to create an invite.");
            return;
        }

        // Create an invite for the system channel
        try {
            const invite = await systemChannel.createInvite({
                maxAge: 86400, // 24 hours
                maxUses: 1, // one-time use
                unique: true // ensure a unique invite code
            });

            await interaction.followUp(`Here is the invite to the server: ${invite.url}`);
        } catch (error) {
            await interaction.followUp("Failed to create an invite to the server.");
            console.error("Failed to create invite:", error);
        }
    }
}
