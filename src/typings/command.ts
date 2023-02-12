import { ChatInputApplicationCommandData, CommandInteraction, CommandInteractionOptionResolver, GuildMember, Message } from "discord.js";
import { ExtendedClient } from "../structures/client";

interface RunOptions {
    client: ExtendedClient,
    interaction: ExtendedInteraction,
    args: CommandInteractionOptionResolver
}

type RunFunction = (options: RunOptions) => unknown;

export interface ExtendedInteraction extends CommandInteraction {
    member: GuildMember;
}

export type CommandType = {
    run: RunFunction,
    commandType?: "CustomCommand" | "Command",
} & ChatInputApplicationCommandData


type CustomRunFunction = (message: Message, args: (string | undefined)[]) => void;

export type CustomCommandType = {
    run: CustomRunFunction,
    args: string,
    description: string,
    commandType: "CustomCommand" | "Command",
    name: string
}
