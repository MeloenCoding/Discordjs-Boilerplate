import * as Discord from "discord.js";
import { sleep } from "./client";

/**
 * Default options for the message builder
 */
interface IDefaultMessageBuilderOptions {
    /**
     * Text delay in miliseconds
     * 
     * Defaults is 1000ms
     */
    delay?: number
    /**
     * Is the message a reply
     */
    isReply?: boolean
}

/**
 * Options for the message typer function
 */
type tMessageTyperOptions = {
    /**
     * If true it will 'type' per word else it wil type per character
     * 
     * default: false
     */
    perWord?: boolean
    /**
     * Also delay the first word that gets sent
     * 
     * default: false
     */
    delayFirstPrint?: boolean
} & IDefaultMessageBuilderOptions

/**
 * All options for the question builder
 */
type tMessageQuestionBuilderOptions = {
    /**
     * Maximum amount of time the user can take on the question
     */
    maxTime?: number
    /**
     * When the user didn't respond in time this function will be called
     */
    onTimeout(): void
    /**
     * When the user respondes this function will be called
     */
    onResponse(value: Discord.Collection<string, Discord.Message<boolean>>): boolean
    /**
     * When response returns false
     */
    onFail?: () => void
} & IDefaultMessageBuilderOptions

/**
 * What each part of the dialogue looks like
 */
type tDialogueObject = {
    /**
     * Ask the user a question and wait for reply
     */
    isQuestion?: boolean
    /**
     * Additional question options
     */
    questionOptions?: {
        /**
         * Continue the dialoge if the timer runs out
         */
        continueOnTimeout?: boolean
    } & tMessageQuestionBuilderOptions
    /**
     * Text content
     */
    content: string | Discord.EmbedBuilder,
    /**
     * A way of setting dynamic variables in a dialoge text ($ in text)
     */
    dynamicTextElement?: () => string[]
} & IDefaultMessageBuilderOptions

/**
 * Wrapper for building asdvanced messages easily
 */
class CMessageBuilder {
    // Loops over the content and every time it sees a $ it replaces it with the first value in the vars array
    private parseContent(content: string | Discord.EmbedBuilder, vars: string[]): string | Discord.EmbedBuilder {
        if (typeof content != "string")
            return content;
            
        while (vars.length > 0)
            content = content.replace("$", vars.shift()!); // eslint-disable-line @typescript-eslint/no-non-null-assertion

        return content;
    }

    private messageTypeSender(message: Discord.Message, content: string | Discord.EmbedBuilder, isReply = false): Promise<Discord.Message<boolean>> {
        if (isReply)
            return message.reply(typeof content == "string" ? content : { embeds: [ content ] });

        return message.channel.send(typeof content == "string" ? content : { embeds: [ content ] });
    }

    /**
     * Sends a message after x amount of time, default is 1000ms
     * 
     * options:
     * - delay, default 1000ms
     * - isReply
     */
    public async delayedMessage(message: Discord.Message, content: string | Discord.EmbedBuilder, options?: IDefaultMessageBuilderOptions) {
        await sleep(options?.delay ?? 1000);
        return this.messageTypeSender(message, content, options?.isReply);
    }

    /**
     * Sends a message word for word or character for character, default is per character
     * 
     * options:
     * - delay, default 1000ms
     * - isReply
     * - perWord, default false
     * - delayFirstPrint, default false
     */
    public async messageTyper(message: Discord.Message, content: string, options?: tMessageTyperOptions) {
        const chars = content.split(options?.perWord ? " ": "");

        let sentMessage = chars.shift();
        let sentDiscordMessage = undefined;

        if (options?.delayFirstPrint)
            sentDiscordMessage = await this.delayedMessage(message, sentMessage!, options); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        else
            sentDiscordMessage = await this.messageTypeSender(message, sentMessage!, options?.isReply); // eslint-disable-line @typescript-eslint/no-non-null-assertion

        for (const char of chars) {
            await sleep(options?.delay ?? 1000);
            sentDiscordMessage.edit(sentMessage += char);
        }
    }

    /**
     * Simple way of asking a user a question and waiting for their respone
     * 
     * options:
     * - delay, default 1000ms
     * - isReply
     * - maxTime, default 30000ms
     * - onTimeout
     * - onResponse
     * - onFail
     */
    public async questionBuilder(message: Discord.Message, question: string | Discord.EmbedBuilder, options: tMessageQuestionBuilderOptions) {
        await this.delayedMessage(message, question, options);

        return await message.channel.awaitMessages({
            filter: m => m.author.id == message.author.id,
            max: 1,
            time: options?.maxTime ?? 30000,
            errors: ["time"]
        }).then(messageReponse => {
            if (options.onResponse(messageReponse))
                return 1;
            
            options.onFail && options.onFail();
            
            return 2;
        }).catch(() => {
            options.onTimeout();
            return 0;
        });
    }

    /**
     * Creates a way of making dialoge easily ask questions, etc
     * 
     * $ will be replaced by the dynamicTextElement function
     * 
     * DialogueObject:
     * - delay, default 1000ms
     * - isReply
     * - isQuestion
     * - questionOptions:
     *      - default options
     *      - continueOnTimeout, default is false
     * - dynamicTextElement
     *      - must return a string[]
     */
    public async dialogeBuilder(message: Discord.Message, dialoge: tDialogueObject[]) {
        if (dialoge.length < 1)
            throw new Error("Dialoge too short");

        for (const sentence in dialoge) {
            const delay = parseInt(sentence) == 0 ? 0 : dialoge[sentence].delay;

            if (dialoge[sentence].dynamicTextElement)
                dialoge[sentence].content = this.parseContent(dialoge[sentence].content, dialoge[sentence].dynamicTextElement!()); // eslint-disable-line @typescript-eslint/no-non-null-assertion

            if (dialoge[sentence].isQuestion) {
                dialoge[sentence].delay = 0;
                const result = await this.questionBuilder(message, dialoge[sentence].content, {...dialoge[sentence]!.questionOptions, isReply: dialoge[sentence].isReply } as tMessageQuestionBuilderOptions); // eslint-disable-line @typescript-eslint/no-non-null-assertion

                if (!dialoge[sentence]!.questionOptions?.continueOnTimeout && result != 1) { // eslint-disable-line @typescript-eslint/no-non-null-assertion
                    break;
                }
            } else {
                await this.delayedMessage(message, dialoge[sentence].content, { isReply: dialoge[sentence].isReply, delay });
            }
        }
    }
}

/**
 * Wrapper for building asdvanced messages easily
 */
export const MessageBuilder = new CMessageBuilder();