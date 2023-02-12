import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection, GatewayIntentBits } from "discord.js";
import { CommandType, CustomCommandType } from "../typings/command";

import { RegisterCommandsOptions } from "../typings/client";
import { Event } from "./event";
import { token, prefix } from "../../config.json";
import glob from "glob";
import { promisify } from "util";

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();
    customCommands: CustomCommandType[] = [];

    constructor() {
        super({ intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ] });   
    }

    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    start() {
        this.registerModules();
        this.registerCustomCommands();
        this.login(token).then(() => {
            console.log("Logged in");
        });
        this.customCommandHandler();
    }
    
    async registerCustomCommands() {
        const commandFiles = await globPromise(`${__dirname}/../commands/*/*{.ts,.js}`);
        console.log("Registering custom commands");
        
        commandFiles.forEach(async filePath => {
            const command: CustomCommandType = await this.importFile(filePath);
            if (!command.name || command.commandType === "Command") return;
            this.customCommands.push(command);
        });
        
    }

    async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
        if (guildId) {
            await this.guilds.cache.get(guildId)?.commands.cache.clear();
            this.guilds.cache.get(guildId)?.commands.set(commands);
            console.log(`Registering commands to ${guildId}`);
        } else {
            this.application?.commands.set(commands);
            console.log("Registering global commands");
        }
    }

    async registerModules() {
        const mainCommands: ApplicationCommandDataResolvable[] = [];
        const commandFiles = await globPromise(`${__dirname}/../commands/*/*{.ts,.js}`);
        commandFiles.forEach(async filePath => {
            const command: CommandType = await this.importFile(filePath);
            if (!command.name || command.commandType === "CustomCommand") return;
            
            this.commands.set(command.name, command);
            mainCommands.push(command);
        });

        const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);
        eventFiles.forEach(async filePath => {
            const event: Event<keyof ClientEvents> = await this.importFile(filePath);
            this.on(event.event, event.run);
        });

        this.on("ready", () => {
            this.registerCommands({
                commands: mainCommands
            });
        });
    }

    customCommandHandler() {
        this.on("messageCreate", message => {
            if (message.content.startsWith(prefix) && message.content.split(" ")[0] == prefix) {
                const args = message.content.split(" ");
                this.customCommands.forEach(command => {
                    if (args[1] == command.name) {
                        command.run(message, args.slice(2));
                    }
                });
            }
        });
    }
}

