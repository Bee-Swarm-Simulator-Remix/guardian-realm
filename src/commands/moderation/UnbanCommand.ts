/**
* This file is part of SudoBot.
* 
* Copyright (C) 2021-2023 OSN Developers.
*
* SudoBot is free software; you can redistribute it and/or modify it
* under the terms of the GNU Affero General Public License as published by 
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* SudoBot is distributed in the hope that it will be useful, but
* WITHOUT ANY WARRANTY; without even the implied warranty of 
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License 
* along with SudoBot. If not, see <https://www.gnu.org/licenses/>.
*/

import { PermissionsBitField, User, escapeMarkdown } from "discord.js";
import Command, { AnyCommandContext, ArgumentType, CommandMessage, CommandReturn, ValidationRule } from "../../core/Command";
import { logError } from "../../utils/logger";
import { createModerationEmbed } from "../../utils/utils";

export default class UnbanCommand extends Command {
    public readonly name = "unban";
    public readonly validationRules: ValidationRule[] = [
        {
            types: [ArgumentType.User],
            entityNotNull: true,
            requiredErrorMessage: "You must specify a user to unban!",
            typeErrorMessage: "You have specified an invalid user mention or ID.",
            entityNotNullErrorMessage: "The given user does not exist!",
            name: "user"
        },
        {
            types: [ArgumentType.StringRest],
            optional: true,
            typeErrorMessage: "You have specified an invalid unban reason.",
            lengthMax: 3999,
            name: "reason"
        }
    ];
    public readonly permissions = [PermissionsBitField.Flags.BanMembers];

    async execute(message: CommandMessage, context: AnyCommandContext): Promise<CommandReturn> {
        await this.deferIfInteraction(message);

        const user: User = context.isLegacy ? context.parsedNamedArgs.user : context.options.getUser("user", true);
        const reason: string | undefined = (!context.isLegacy ? context.options.getString('reason') : context.parsedNamedArgs.reason) ?? undefined;

        const id = await this.client.infractionManager.removeUserBan(user, {
            guild: message.guild!,
            moderator: message.member!.user! as User,
            user,
            reason,
            sendLog: true
        }).catch(logError);

        if (!id) {
            await this.error(message);
            return;
        }

        await this.deferredReply(message, {
            embeds: [
                await createModerationEmbed({
                    user,
                    actionDoneName: "unbanned",
                    description: `**${escapeMarkdown(user.tag)}** has been unbanned.`,
                    id: `${id}`,
                    reason
                })
            ]
        });
    }
}