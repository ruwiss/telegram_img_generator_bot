//  Telegram bot kurulum ve ana işlemler

import TelegramBot from 'node-telegram-bot-api';
import { token } from './config.js';
import CodeConverter from './codeConverter.js';
import { code } from 'tar/types';

const bot = new TelegramBot(token, { polling: true });
const codeConverter = new CodeConverter();

bot.on("PollingError", (error) => {
    console.error("Polling error: ", error);
});

bot.onText(/\/(code|kod)/, async (msg) => {

    try{
        await handleMassage(msg);
    }catch(error){
        console.error("Error handling message: ", error);
    }
});

const handleMassage = async (msg) => {
    console.log("Received message: ", msg.text);
    await codeConverter.processMessage(msg)
};

export default bot;