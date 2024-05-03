import { CommandInteraction, Guild, TextChannel, CommandInteractionOptionResolver } from "discord.js";
import { BaseCommand } from "./BaseCommand";

export class ServerInviteCommand extends BaseCommand {
    constructor() {
        super({
            name: "serverinvite",
            description: "Get an invite to a specific server by providing its ID.",
            options: [
                {
                    name: "guildId",
                    description: "The ID of the guild to get the invite for.",
                    type: "STRING",
                    required: true
                }
            ]
        });
    }

    public readonly systemAdminOnly = true;
    async execute(interaction: CommandInteraction, options: CommandInteractionOptionResolver): Promise<void> {
        await this.deferIfInteraction(interaction);

        const guildId = options.getString("guildId", true);
        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) {
            await this.error(interaction, "Invalid guild ID provided.");
            return;
        }

        const systemChannel = guild.systemChannel || guild.channels.cache.find(ch => ch.type === "GUILD_TEXT");
        if (!systemChannel) {
            await this.error(interaction, "Unable to find a suitable channel to create an invite.");
            return;
        }

        if (systemChannel && systemChannel instanceof TextChannel) {
            const invite = await systemChannel.createInvite({
                // Invite options
            });

            await this.success(interaction, `Here is the invite to the server: ${invite.url}`);
        } else {
            await this.error(interaction, "Failed to create an invite to the server.");
        }
    }
}
