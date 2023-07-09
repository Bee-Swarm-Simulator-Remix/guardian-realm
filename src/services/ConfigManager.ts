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

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import Service from "../core/Service";
import { isSnowflake } from '../utils/utils';

export const name = "configManager";

const zSnowflake = z.custom<string>(data => {
    return typeof data === 'string' && isSnowflake(data)
});

export const ConfigSchema = z.object({
    prefix: z.string(),
    mod_role: z.string().optional(),
    admin_role: z.string().optional(),
    infractions: z.object({
        send_ids_to_user: z.boolean().default(true)
    }).optional(),
    muting: z.object({
        role: zSnowflake.optional()
    }).optional()
});

export type Config = z.infer<typeof ConfigSchema>;

interface ConfigContainer {
    [guildID: string]: Config | undefined;
}

export default class ConfigManager extends Service {
    configPath = path.resolve(__dirname, "../../config/config.json");
    config: ConfigContainer = {} as ConfigContainer;

    async boot() {
        const configFileBuffer = await fs.readFile(this.configPath);
        this.config = JSON.parse(configFileBuffer.toString());
    }
}