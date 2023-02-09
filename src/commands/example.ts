import { CustomCommandObject } from "../structures/command";

export default new CustomCommandObject({
    name: "ping",
    description: "Reply with pong",
    type: "CustomCommand",
    args: "[amount] [custom string]",
    run: async (messageObj, args) => {
        const [amount, customStr] = args;
        messageObj.channel.send(`Ping ${amount} ${customStr}`);
    }
});