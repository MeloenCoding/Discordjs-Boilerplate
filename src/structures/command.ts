import { APIApplicationCommandOptionChoice, ApplicationCommandOptionType, LocalizationMap, SlashCommandStringOption } from "discord.js";
import { CommandType, CustomCommandType } from "../typings/command";

export class Command {
    constructor(commandOptions: CommandType) {
        Object.assign(this, commandOptions);
    }
}

export class CustomCommandObject {
    constructor(commandOptions: CustomCommandType) {
        Object.assign(this, commandOptions);
    }
}

interface CreateSlashCommandArg {
    name: string, 
    description: string, 
    required: boolean, 
    choices?: APIApplicationCommandOptionChoice<string>[], 
    autocomplete?: boolean, 
    name_localizations?: LocalizationMap, 
    description_localizations?: LocalizationMap, 
    min_length?: number, 
    max_length?: number
}

export function CreateStringSlashCommand(arg: CreateSlashCommandArg): SlashCommandStringOption {  
    return {
        name: arg.name,
        type: ApplicationCommandOptionType.String,
        choices: arg.choices,
        autocomplete: arg.autocomplete ,
        name_localizations: arg.name_localizations ,
        description: arg.description ,
        description_localizations: arg.description_localizations ,
        required: arg.required ,
        max_length: arg.max_length ,
        min_length: arg.min_length
    } as SlashCommandStringOption;
} 