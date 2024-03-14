import { Awaitable } from "discord.js";
import { HasClient } from "../utils/HasClient";

abstract class Service extends HasClient {
    protected static name: string;
    public boot(): Awaitable<void> {}

    public static getName() {
        return this.name;
    }
}

export { Service };