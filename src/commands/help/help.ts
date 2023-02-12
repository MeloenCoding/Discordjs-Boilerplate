import { CustomCommandObject } from "../../structures/command";

export default new CustomCommandObject({
    name: "help",
    description: "Get information about commands.",
    commandType: "CustomCommand",
    args: "[page]",
    run: async (messageObj, ) => {
        messageObj.channel.send("Get information about commands.");
    }
});