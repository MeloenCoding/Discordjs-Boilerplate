import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection, GatewayIntentBits } from "discord.js";
import { CommandType, CustomCommand } from "../typings/command";

import { RegisterCommandsOptions } from "../typings/client";
import { Event } from "./event";
import { token } from "../../config.json";
import glob from "glob";
import { promisify } from "util";

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();
    customCommands: CustomCommand[] = [];
    defaultPrefix = ".srpg";

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
            console.log("Custom Commands: ", this.customCommands);
        });
        this.customCommandHandler();
    }
    
    async registerCustomCommands() {
        const commandFiles = await globPromise(`${__dirname}/../commands/*/*{.ts,.js}`);
        
        commandFiles.forEach(async filePath => {
            const command: CustomCommand = await this.importFile(filePath);
            if (!command.name) return;
            if (command.type != "CustomCommand") return;
            
            this.customCommands.push(command);
        });
        
    }

    async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
        if (guildId) {
            this.guilds.cache.get(guildId)?.commands.cache.clear();
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
            if (!command.name) return;
            if (command.type) return;
            
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
            if (message.content.startsWith(this.defaultPrefix) && message.content.split(" ")[0] == this.defaultPrefix) {
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

