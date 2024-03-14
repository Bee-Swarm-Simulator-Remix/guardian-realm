/*
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

import { Awaitable } from "discord.js";
import { ZodSchema } from "zod";
import Client from "../../core/Client";

export abstract class Extension {
    public readonly name?: string;

    constructor(protected readonly client: Client) {}

    commands(): Awaitable<string[] | null> {
        return null;
    }

    events(): Awaitable<string[] | null> {
        return null;
    }

    services(): Awaitable<string[] | null> {
        return null;
    }

    guildConfig(): Awaitable<
        | {
              [K in PropertyKey]: ZodSchema<unknown>;
          }
        | null
    > {
        return null;
    }

    systemConfig(): Awaitable<
        | {
              [K in PropertyKey]: ZodSchema<unknown>;
          }
        | null
    > {
        return null;
    }
}