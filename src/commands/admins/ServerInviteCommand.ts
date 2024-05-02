import { CommandInteraction, Guild } from "discord.js";
import Client from "../../core/Client";
import Command from "../../core/Command";

export default class ServerInviteCommand extends Command {
    public readonly name = "serverinvite";
    public readonly description = "Generate an invite link to a specific server.";
    public readonly usage = "<guildId>";
    public readonly systemAdminOnly = true;
    public readonly arguments = [
        {
            name: "guildId",
            description: "The ID of the guild you want to generate an invite for.",
            type: "STRING",
            required: true
        }
    ];

    constructor(client: Client<true>) {
        super(client);
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        await this.deferIfInteraction(interaction);

        const guildId = interaction.options.getString("guildId", true);
        const guild = this.client.guilds.cache.get(guildId);

        if (!guild) {
            await interaction.followUp("Invalid guild ID. Please provide a valid guild ID.");
            return;
        }

        try {
            const invite = await this.generateInvite(guild);
            await interaction.followUp(`Here's the invite link to ${guild.name}: ${invite}`);
        } catch (error) {
            console.error("Error generating invite:", error);
            await interaction.followUp("An error occurred while generating the invite link.");
        }
    }

    async generateInvite(guild: Guild): Promise<string> {
        const channel = guild.systemChannel ?? guild.channels.cache.find(ch => ch.type === "text");
        if (!channel) throw new Error("No suitable channel found to create invite.");

        const invite = await channel.createInvite({
            maxAge: 0,
            maxUses: 1
        });

        return invite.url;
    }
}
