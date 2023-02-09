import { Command } from "../structures/command";

export default new Command({
    name: "ping",
    description: "Reply with pong",
    run: async ({ interaction }) => {
        interaction.followUp("Pong");
    }
});