import { ClientEvents } from "discord.js";

export class Event<Key extends keyof ClientEvents> {
    constructor(
        public event: Key,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public run: (...args: ClientEvents[Key]) => any
    ) { }
}