import { ChatInputCommandInteraction, Message, TextChannel, ChannelType, Guild } from "discord.js";
import Command, { type CommandReturn, type BasicCommandContext } from "../../core/Command";
export default class ServerInviteCommand extends Command {
    public readonly name = "serverinvite";
    public readonly systemAdminOnly = true;
    public readonly description = "Get an invite link to a server by ID or name.";
    private readonly blacklistedGuilds: string[] = ["911987536379912193", "1216386140265906227"];
    async execute(message: Message | ChatInputCommandInteraction, context: BasicCommandContext): Promise<CommandReturn> {
        await this.deferIfInteraction(message);
        if (context.isLegacy && !context.args[0]) {
            return void this.error(message, "You must specify at least one guild ID or name!");
        }
        let guildIdOrNames: string[];
        if (context.isLegacy) {
            guildIdOrNames = context.args[0].split(",");
        } else {
            guildIdOrNames = context.options.getString("guildIdOrNames", true).split(",");
        }
        
        const invites: string[] = [];
        for (const guildIdOrName of guildIdOrNames) {
            let guild: Guild | undefined;
            if (!isNaN(Number(guildIdOrName))) {
                // If the input is a number, consider it as a guild ID
                guild = this.client.guilds.cache.get(guildIdOrName);
            } else {
                // Otherwise, try to find the guild by name
                guild = this.client.guilds.cache.find(guild => guild.name.toLowerCase() === guildIdOrName.toLowerCase());
            }
    
            if (!guild) {
                invites.push(`<:error:1216024851744161902> Invalid guild ID or name provided: ${guildIdOrName}`);
                continue;
            }

            if (this.isGuildBlacklisted(guild.id)) {
                invites.push(`<:error:1216024851744161902> The guild you have tried to create an invite for, ${guild.name}, is a guild exempt from getting an invite as per Lute's rules.`);
                continue;
            }

            const systemChannel = guild.systemChannel || guild.channels.cache.find(ch => ch.type === ChannelType.GuildText) as TextChannel;
            if (!systemChannel) {
                invites.push(`<:error:1216024851744161902> Unable to find a suitable channel to create an invite for guild: ${guild.name}`);
                continue;
            }
    
            try {
                const invite = await systemChannel.createInvite({ unique: true });
                invites.push(`Invite to ${guild.name}: ${invite.url}`);
            } catch (error) {
                invites.push(`<:error:1216024851744161902> Failed to create an invite for guild: ${guild.name}`);
            }
        }
        await this.success(message, invites.join("\n"));
    }
    private isGuildBlacklisted(guildId: string): boolean {
        return this.blacklistedGuilds.includes(guildId);
    }
}
