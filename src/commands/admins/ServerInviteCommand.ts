import { CommandInteraction, TextChannel } from "discord.js";
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
        try {
            await interaction.deferReply();

            const guildId = interaction.options.getString("guildId", true);
            const guild = this.client.guilds.cache.get(guildId);

            if (!guild) {
                await interaction.editReply("Invalid guild ID provided.");
                return;
            }

            const systemChannel = guild.systemChannel || guild.channels.cache.find(ch => ch.type === "GUILD_TEXT");
            if (!systemChannel || !(systemChannel instanceof TextChannel)) {
                await interaction.editReply("Unable to find a suitable channel to create an invite.");
                return;
            }

            const invite = await systemChannel.createInvite({ unique: true });
            await interaction.editReply(`Here is the invite to the server: ${invite.url}`);
        } catch (error) {
            console.error("Error creating server invite:", error);
            await interaction.editReply("Failed to create an invite to the server.");
        }
    }
}
