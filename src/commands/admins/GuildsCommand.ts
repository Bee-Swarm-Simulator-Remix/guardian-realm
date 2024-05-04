import { Message, Guild, TextChannel } from "discord.js";
import Client from "../../core/Client";
import Command from "../../core/Command";

export default class ListServersCommand extends Command {
    public readonly name = "listservers";
    public readonly systemAdminOnly = true;
    public readonly description = "List all servers the bot is in.";

    constructor(client: Client<true>) {
        super(client);
    }

    async execute(message: Message): Promise<void> {
        await this.deferIfInteraction(message);

        // Get all the guilds the bot is in
        const guilds = this.client.guilds.cache.values();

        // Create an array to hold information about each guild
        const guildInfo = Array.from(guilds).map(guild => {
            return {
                name: guild.name,
                id: guild.id
            };
        });

        // Create a formatted string containing guild information
        const guildList = guildInfo.map(info => `**${info.name}** - \`${info.id}\``).join("\n");

        // Send the guild list to the user
        await this.deferredReply(message, {    
        content: 'List of Guilds:\n$' .. {guildList}
        });
    }
}
