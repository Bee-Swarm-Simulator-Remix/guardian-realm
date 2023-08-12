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

import { Message, PermissionsBitField, SlashCommandBuilder, TextBasedChannel } from "discord.js";
import path from "path";
import Command, { ArgumentType, BasicCommandContext, CommandMessage, CommandReturn, ValidationRule } from "../../core/Command";
import QueueEntry from "../../utils/QueueEntry";
import { logError } from "../../utils/logger";
import { stringToTimeInterval } from "../../utils/utils";

export default class ScheduleAndExpireCommand extends Command {
    public readonly name = "scheduleandexpire";
    public readonly validationRules: ValidationRule[] = [
        {
            types: [ArgumentType.TimeInterval],
            minValue: 1,
            minMaxErrorMessage: "Please specify a valid time interval!",
            requiredErrorMessage: "Please specify after how long the message should be sent!",
            typeErrorMessage: "Please specify a valid time interval!",
            timeMilliseconds: true,
            name: "time_interval_send"
        },
        {
            types: [ArgumentType.TimeInterval],
            minValue: 1,
            minMaxErrorMessage: "Please specify a valid deletion time interval!",
            requiredErrorMessage: "Please specify after how long the message should be deleted!",
            typeErrorMessage: "Please specify a valid deletion time interval!",
            timeMilliseconds: true,
            name: "time_interval_remove"
        },
        {
            types: [ArgumentType.StringRest],
            optional: true,
            requiredErrorMessage: "Please specify a message content!",
            typeErrorMessage: "Please specify a valid message content!",
            name: "content"
        }
    ];
    public readonly permissions = [PermissionsBitField.Flags.ManageMessages];
    public readonly aliases = ["expiresc", "scex", "schedulexp"];

    public readonly description = "Sends a message and deletes it after the given primary and secondary timeframe, respectively.";
    public readonly argumentSyntaxes = ["<send_after> <expire_after> [content]"];
    public readonly slashCommandBuilder = new SlashCommandBuilder()
        .addStringOption(option => option.setName("content").setDescription("The message content").setRequired(true))
        .addStringOption(option =>
            option
                .setName("send_after")
                .setDescription("Specify the time after the bot should send the message")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("expire_after")
                .setDescription("Specify the time after the bot should remove the message")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel where the message will be sent, defaults to the current channel")
        );

    async execute(message: CommandMessage, context: BasicCommandContext): Promise<CommandReturn> {
        await this.deferIfInteraction(message);

        let timeIntervalSend = context.isLegacy
            ? context.parsedNamedArgs.time_interval_send
            : context.options.getString("send_after", true);

        if (!context.isLegacy) {
            const { error, result } = stringToTimeInterval(timeIntervalSend, {
                milliseconds: true
            });

            if (error) {
                await this.error(message, error);
                return;
            }

            timeIntervalSend = result;
        }

        let timeIntervalRemove = context.isLegacy
            ? context.parsedNamedArgs.time_interval_remove
            : context.options.getString("expire_after", true);

        if (!context.isLegacy) {
            const { error, result } = stringToTimeInterval(timeIntervalRemove, {
                milliseconds: true
            });

            if (error) {
                await this.error(message, error);
                return;
            }

            timeIntervalRemove = result;
        }

        const content: string = context.isLegacy ? context.parsedNamedArgs.content : context.options.getString("content");
        const channel = (
            context.isLegacy ? message.channel! : context.options.getChannel("channel") ?? message.channel!
        ) as TextBasedChannel;

        if (!channel.isTextBased()) {
            await this.error(message, "Cannot send messages to a non-text based channel!");
            return;
        }

        await this.client.queueManager.add(
            new QueueEntry({
                args: [channel.id, timeIntervalRemove.toString(), content],
                client: this.client,
                createdAt: new Date(),
                filePath: path.resolve(__dirname, "../../queues/ScheduleAndExpireMessageQueue"),
                guild: message.guild!,
                name: "ScheduleAndExpireMessageQueue",
                userId: message.member!.user.id,
                willRunAt: new Date(Date.now() + timeIntervalSend)
            })
        );

        if (message instanceof Message) {
            await message.react(this.emoji("check")).catch(logError);
        } else {
            await this.success(message, "Successfully scheduled message.");
        }
    }
}
