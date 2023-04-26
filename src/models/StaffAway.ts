/**
* This file is part of SudoBot.
* 
* Copyright (C) 2021-2022 OSN Inc.
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

import { Schema, model, Document } from 'mongoose';

export interface IStaffAway extends Document {
    user: string;
    reason?: string;
    guild_id: string;
    createdAt: Date;
    enabled: boolean;
}

const schema = new Schema({
    user: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: false
    },
    guild_id: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: true,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    }
});

export default model('StaffAway', schema);