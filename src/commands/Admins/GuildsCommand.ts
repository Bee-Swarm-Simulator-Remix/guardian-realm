import { CommandMessage, CommandReturn, EmbedBuilder, Colors } from "discord.js";
import Client from "../../core/Client";
import Command from "../../core/Command";

export default class ListServersCommand extends Command {
    public readonly name = "guilds";
    public readonly description = "List all servers the bot is in.";

    constructor(client: Client<true>) {
        super(client);
    }

    async execute(message: CommandMessage): Promise<CommandReturn> {
        await this.deferIfInteraction(message);

        const guilds = this.client.guilds.cache.array();

        const guildInfo = guilds.map(guild => {
            return {
                name: guild.name,
                id: guild.id
            };
        });

        const embed = new EmbedBuilder()
            .setTitle("List of Guilds")
            .setDescription(guildInfo.map(info => `**${info.name}** - \`${info.id}\``).join("\n"))
            .setColor(Colors.Blue)
            .setTimestamp();

        await this.deferredReply(message, { embeds: [embed] });
    }
}
