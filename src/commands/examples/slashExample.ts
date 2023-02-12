import { Command } from "../../structures/command";

export default new Command({
    name: "ping",
    description: "Reply with pong",
    commandType: "Command",
    run: async ({ interaction }) => {
        interaction.followUp("Pong");
    }
});