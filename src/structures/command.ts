import { APIApplicationCommandOptionChoice, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ComponentEmojiResolvable, LocalizationMap, SlashCommandStringOption } from "discord.js";
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

interface CreateSlashOptionArg {
    /** The name of the argument. Used for identifying the argument. */
    name: string, 
    /** Give the description of the argument. */
    description: string, 
    /** Set the argument as a required or not. */
    required: boolean, 
    choices?: APIApplicationCommandOptionChoice<string>[], 
    autocomplete?: boolean, 
    /** Set the name of the argument but in different languages */
    name_localizations?: LocalizationMap, 
    /** Set the description of the argument but in different languages */
    description_localizations?: LocalizationMap, 
    min_length?: number, 
    max_length?: number
}

export function CreateStringSlashOption(arg: CreateSlashOptionArg): SlashCommandStringOption {  
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

export interface CreateButtonActionRowArg {
    name: string,
    label: string,
    style: ButtonStyle,
    disabled?: boolean,
    emoji?: ComponentEmojiResolvable,
    url?: string
}

export function CreateButton(arg: CreateButtonActionRowArg): ButtonBuilder {
    return new ButtonBuilder() 
        .setCustomId(arg.name)
        .setLabel(arg.label)
        .setStyle(arg.style)
        .setDisabled(arg.disabled)
        .setEmoji(arg.emoji || "")
        .setURL(arg.url || "");
}