/*
 * This file is part of SudoBot.
 *
 * Copyright (C) 2021-2024 OSN Developers.
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

import { TakesArgument } from "@framework/arguments/ArgumentTypes";
import GuildMemberArgument from "@framework/arguments/GuildMemberArgument";
import RestStringArgument from "@framework/arguments/RestStringArgument";
import { Buildable, Command, CommandMessage } from "@framework/commands/Command";
import Context from "@framework/commands/Context";
import { Inject } from "@framework/container/Inject";
import { also } from "@framework/utils/utils";
import { GuildMember } from "discord.js";
import { Colors } from "../../constants/Colors";
import { Limits } from "../../constants/Limits";
import SystemAdminPermission from "../../permissions/SystemAdminPermission";
import InfractionManager from "../../services/InfractionManager";
import PermissionManagerService from "../../services/PermissionManagerService";
import { ErrorMessages } from "../../utils/ErrorMessages";

type BeanCommandArgs = {
    member: GuildMember;
    reason?: string;
};

@TakesArgument<BeanCommandArgs>("member", GuildMemberArgument, false, [
    GuildMemberArgument.defaultErrors
])
@TakesArgument<BeanCommandArgs>("reason", RestStringArgument, true, [ErrorMessages.reason])
class BeanCommand extends Command {
    public override readonly name = "bean";
    public override readonly description = "Beans a user.";
    public override readonly detailedDescription =
        "Sends a DM to the user telling them they've been beaned. It doesn't actually do anything.";
    public override readonly permissions = [SystemAdminPermission];
    public override readonly defer = true;
    public override readonly usage = ["<user: User> [reason: RestString]"];

    @Inject()
    protected readonly infractionManager!: InfractionManager;

    @Inject()
    protected readonly permissionManager!: PermissionManagerService;

    public override build(): Buildable[] {
        return [
            this.buildChatInput()
                .addUserOption(option =>
                    option.setName("user").setDescription("The user to bean.").setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("reason")
                        .setDescription("The reason for the bean.")
                        .setMaxLength(Limits.Reason)
                )
        ];
    }

    public override async execute(
        context: Context<CommandMessage>,
        args: BeanCommandArgs
    ): Promise<void> {
        const { member, reason } = args;

        if (
            !context.member ||
            !(await this.permissionManager.canModerate(member, context.member))
        ) {
            await context.error("You don't have permission to bean this user!");
            return;
        }

        const { overviewEmbed, status } = await this.infractionManager.createBean({
            guildId: context.guildId,
            moderator: context.user,
            reason,
            user: member.user,
            generateOverviewEmbed: true,
            transformNotificationEmbed: embed => also(embed, e => void (e.color = Colors.Success))
        });

        if (status === "failed") {
            await context.error("Failed to bean user.");
            return;
        }

        overviewEmbed.color = Colors.Primary;
        await context.reply({ embeds: [overviewEmbed] });
    }
}

export default BeanCommand;