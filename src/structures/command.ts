import { CommandType, CustomCommand } from "../typings/command";

export class Command {
    constructor(commandOptions: CommandType) {
        Object.assign(this, commandOptions);
    }
}

export class CustomCommandObject {
    constructor(commandOptions: CustomCommand) {
        Object.assign(this, commandOptions);
    }
}