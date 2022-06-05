import fs from 'fs';
import Axios, { AxiosRequestHeaders, HeadersDefaults } from 'axios';

export function timeProcess(seconds: number) {      
    let interval = seconds / (60 * 60 * 24 * 30 * 365);

    if (interval >= 1) {
        return Math.floor(interval) + " year" + (Math.floor(interval) === 1 ? '' : 's');
    }

    interval = seconds / (60 * 60 * 24 * 30);

    if (interval >= 1) {
        return Math.floor(interval) + " month" + (Math.floor(interval) === 1 ? '' : 's');
    }

    interval = seconds / (60 * 60 * 24);

    if (interval >= 1) {
        return Math.floor(interval) + " day" + (Math.floor(interval) === 1 ? '' : 's');
    }

    interval = seconds / (60 * 60);

    if (interval >= 1) {
        return Math.floor(interval) + " hour" + (Math.floor(interval) === 1 ? '' : 's');
    }

    interval = seconds / 60;

    if (interval >= 1) {
        return Math.floor(interval) + " minute" + (Math.floor(interval) === 1 ? '' : 's');
    }

    interval = seconds;

    return Math.floor(interval) + " second" + (Math.floor(interval) === 1 ? '' : 's');
}

export function escapeRegex(string: string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function timeSince(date: number) {
    const seconds = Math.floor((Date.now() - date) / 1000);
    return timeProcess(seconds) + ' ago';
}

export async function download(url: string, path: string, headers?: AxiosRequestHeaders) {  
    const writer = fs.createWriteStream(path);
    
    const response = await Axios({
        url,
        method: 'GET',
        responseType: 'stream',
        headers
    });
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
        if (response.status !== 200) {
            reject();
        }

        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

export async function deleteFile(path: string) {
    fs.rm(path, (err: any) => {
        if (err) {
            throw new Error(err);
        }
    });
}

export function random(arr: Array <any>) {
    let index = Math.floor(Math.random() * arr.length);
    return arr[index];
}

export function fill(length: number, string: string, token: string = ' ') {
    let safe = 0;

    if (length < string.length)
        return string;

    const diff = length - string.length;

    for (let i = 1; i <= diff; i++, safe++) {
        if (safe >= 500)
            break;        

        string += ' ';
    }   

    return string;
}

export function green(string: string) {
    return '\u001b[1;32m' + string + '\u001b[0m';
}

export function yellow(string: string) {
    return '\u001b[1;33m' + string + '\u001b[0m';
}

export function red(string: string) {
    return '\u001b[1;31m' + string + '\u001b[0m';
}
