import { EmbedBuilder } from "discord.js";
import { Command, CreateStringSlashCommand } from "../../structures/command";
import glob from "glob";
import { promisify } from "util";
import { CommandType, CustomCommandType } from "../../typings/command";
import { prefix } from "../../../config.json";

const pageOption = CreateStringSlashCommand({
    name: "page-num",
    description: "Page number",
    required: false
});

export default new Command({
    name: "help",
    description: "Get information about commands.",
    options: [pageOption],
    commandType: "Command",
    run: async ({ interaction }) => {
        const globPromise = promisify(glob);
        const commandList: CommandType[] = [];
        const customCommandList: CustomCommandType[] = [];

        let commandString = "";
        let argsString = "";
        let descString = "";
        
        const pageNumInput = interaction.options.get("page-num")?.value as string;
        const page = parseInt(pageNumInput) || 1;

        const commandFiles = await globPromise(`${__dirname}/../*/*{.ts,.js}`);
        commandFiles.forEach(filePath => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const command: CommandType | CustomCommandType = (require(filePath))?.default;
            if (command) {
                if (command.commandType !== "CustomCommand") commandList.push(command as CommandType);
                if (command.commandType === "CustomCommand") customCommandList.push(command as CustomCommandType);
            }
        });

        commandList.forEach((item) => {
            commandString += "/" + item.name + "\n";
            argsString += (item.options ? item.options?.map((item) => item.name) : "") + "\n";
            descString += item.description + "\n";
        });
        customCommandList.forEach((item) => {
            commandString += prefix + item.name + "\n";
            argsString += item.args + "\n";
            descString += item.description + "\n";
        });

        const embed = new EmbedBuilder()
            .setTitle(`Help - Page ${page}`)
            .addFields(
                {
                    name: "Command",
                    value: commandString,
                    inline: true
                },
                {
                    name: "Arguments",
                    value: argsString,
                    inline: true
                },
                {
                    name: "Description",
                    value: descString,
                    inline: true
                }
            );
        
        await interaction.followUp({ embeds: [embed] });
    }
});