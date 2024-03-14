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

import {
    Awaitable,
    ClientEvents as DiscordClientEvents,
    Client as DiscordJSClient
} from "discord.js";
import { ClientEvents } from "../utils/ClientEvents";

abstract class BaseClient<R extends boolean = boolean> extends DiscordJSClient<R> {
    public static instance: BaseClient;

    abstract boot(options?: { commands?: boolean; events?: boolean }): Awaitable<void>;

    public addEventListener<K extends keyof ClientEvents>(
        event: K,
        listener: (...args: ClientEvents[K]) => Awaitable<unknown>
    ) {
        this.on<keyof DiscordClientEvents>(
            event as unknown as keyof DiscordClientEvents,
            listener as unknown as (...args: DiscordClientEvents[keyof DiscordClientEvents]) => void
        );
    }

    public removeEventListener<K extends keyof ClientEvents>(
        event: K,
        listener?: (...args: ClientEvents[K]) => Awaitable<unknown>
    ) {
        this.off<keyof DiscordClientEvents>(
            event as unknown as keyof DiscordClientEvents,
            listener as unknown as (...args: DiscordClientEvents[keyof DiscordClientEvents]) => void
        );
    }
}

export default BaseClient;