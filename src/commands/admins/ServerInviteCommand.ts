import { CommandInteraction, ChannelType, Guild } from "discord.js";
import Command from "../../core/Command";

export default class ServerInviteCommand extends Command {
    public readonly name = "serverinvite";
    public readonly serverAdminOnly = true;
    public readonly description = "Get an invite to a specific server from the guild ID.";

    async execute(interaction: CommandInteraction): Promise<void> {
        try {
            await interaction.deferReply();

            const guildId = interaction.options.getString("guildId", true);
            const guild = this.client.guilds.cache.get(guildId);

            if (!guild) {
                await interaction.editReply("Invalid guild ID provided.");
                return;
            }

            const systemChannel = guild.systemChannel || guild.channels.cache.find(ch => ch.type === ChannelType.GuildText);

            if (!systemChannel) {
                await interaction.editReply("Unable to find a suitable channel to create an invite.");
                return;
            }

            const invite = await systemChannel.createInvite({
                unique: true,
                maxAge: 86400 // 24 hours
            });

            await interaction.editReply(`Here is the invite to the server: ${invite.url}`);
        } catch (error) {
            console.error("Error creating invite:", error);
            await interaction.editReply("Failed to create an invite to the server.");
        }
    }
}
