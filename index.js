/*
import TelegramBot from "node-telegram-bot-api";
import puppeteer from "puppeteer";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "fs";
import path from "path";

// replace the value below with the Telegram token you receive from @BotFather
const token = "";

/* --------------------------------------------------------- */
/*
class CodeConverter {
    constructor() {
        this.browser = null;
        this.page = null;
        this.page2 = null;
        this.active = false;
        this.lastSave = Date.now();
    }

    setBrowserSettings = async () => {
        // Replit gibi sitelerde dağıtım yapılacaksa live: true olmalıdır.
        const live = false;

        let chromiumPath = "C:/chromium/chrome.exe";
        if (live) {
            // Chromium yolunu bul - which chromium
            const { stdout: path } = await promisify(exec)("which chromium");
            chromiumPath = path.trim();
        }

        // Puppeteer browser çalıştır
        this.browser = await puppeteer.launch({
            headless: true, // tarayıcı görünürlüğü (gizli)
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--enable-features=ClipboardAPI"],
            executablePath: chromiumPath,
        });

        // Clipboard API permission override işlemi
        const context = this.browser.defaultBrowserContext();
        context.clearPermissionOverrides();
        await context.overridePermissions("https://ray.so/", ["clipboard-read", "clipboard-write", "clipboard-sanitized-write"]);
    };

    copyTextToClipboard = async (text) => {
        await this.page.evaluate((textToCopy) => {
            navigator.clipboard.writeText(textToCopy);
        }, text);
    };

    goToCreatorPage = async () => {
        // Yeni sayfa oluştur
        this.page = await this.browser.newPage();

        // Belirtilen web sayfasına git
        await this.page.goto("https://ray.so/", { waitUntil: "load" });

        // Input alanının yüklenmesini bekle
        await this.page.waitForSelector("textarea");

        // İndirme yolunu belirle
        const downloadPath = path.resolve("./screenshots");
        fs.mkdirSync(downloadPath, { recursive: true });

        // Enable request interception
        await this.page.setRequestInterception(true);

        this.active = true;
        console.log("Active");
    };

    setListeners = (cb) => {
        const requestListener = (request) => {
            // Continue all requests
            request.continue();
        };

        const responseListener = async (response) => {
            // Check if the response is a file download (adjust the condition as needed)
            if (response.headers()["content-type"].startsWith("image/")) {
                // İçeriği html olarak getir
                const responseText = await response.text();

                if (Date.now() - this.lastSave > 1000) {
                    this.lastSave = Date.now();
                    await this.goToSavePngPage(responseText, (filePath) => {
                        cb(filePath);
                        this.page.off("request", requestListener);
                        this.page.off("response", responseListener);
                    });
                }
            }
        };

        this.page.on("request", requestListener);
        this.page.on("response", responseListener);
    };

    createSvgElement = async (code) => {
        // Başlık alanını seç
        const titleElement = await this.page.$("input[type=text]");

        // Başlık alanına tıkla
        await titleElement.click();

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Başlığa yapıştırılacak metin hafızaya al
        await this.copyTextToClipboard("https://t.me/kodlayaz");

        await this.page.keyboard.down("Control");
        await this.page.keyboard.press("KeyA");

        // Yapıştır
        await this.page.keyboard.press("KeyV");
        await this.page.keyboard.up("Control");

        await new Promise((resolve) => setTimeout(resolve, 500));

        // #frame textarea öğesini bul
        const input = await this.page.$("#frame textarea");

        // Bulunan öğeye tıkla
        await input.click();

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Kodu kopyala
        await this.copyTextToClipboard(code);

        // Mevcut kodları seç
        await this.page.keyboard.down("Control");
        await this.page.keyboard.press("KeyA");

        // Kopyalanan kodu yapıştır
        await this.page.keyboard.press("KeyV");
        await this.page.keyboard.up("Control");

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Padding 16 butonuna tıkla
        await this.page.click("[class^='PaddingControl'] > button");

        // indirme butonuna tıkla
        await this.page.click(".buttonGroup > button");
    };

    goToSavePngPage = async (responseText, cb) => {
        // Svg resmi açmak için yeni sayfa oluştur
        this.page2 = await this.browser.newPage();

        // Resim kalitesini arttırmak için sayfayı yakınlaştır
        await this.page2.setViewport({
            width: 800,
            height: 800,
            deviceScaleFactor: 2,
        });

        // Yeni sayfaya svg resmi içeriği yükle
        await this.page2.setContent(responseText);

        // Svg yüklemesini bekle
        const svgElement = await this.page2.waitForSelector("svg");

        // Svg resmini png olarak ekran görüntüsü al
        const screenshot = await svgElement.screenshot({ type: "png" });

        const downloadPath = path.resolve("./screenshots");

        // Alınan ekran görüntüsünü kaydet
        const filePath = path.resolve(downloadPath, "image.png");
        fs.writeFileSync(filePath, Buffer.from(screenshot));
        cb(filePath);
    };
}
/* --------------------------------------------------------- */
/*
const startBot = async () => {
    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, { polling: true });

    const codeConverter = new CodeConverter();

    bot.on("polling_error", (msg) => console.log(msg));

    let onMsgDate = Date.now();
    bot.onText(/\/(code|kod)/, async (msg) => {
        if (Date.now() - onMsgDate < 1000) {
            return;
        }
        onMsgDate = Date.now();
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const firstName = msg.from.first_name || "";
        const lastName = msg.from.last_name || "";
        const username = msg.from.username ? `@${msg.from.username}` : `${firstName} ${lastName}`.trim();
        const messageId = msg.message_id;
        const replyToMessageId = msg.reply_to_message ? msg.reply_to_message.message_id : null;

        if (msg.text.length > 3800) {
            bot.sendMessage(chatId, "Kod boyutu 3800 karakterden fazla olamaz.");
            return;
        }

        if (!codeConverter.active) {
            return;
        }

        console.log(`Kod Geldi: ${onMsgDate.toString()}`);

        const runCodeConverter = async () => {
            let options = {
                parse_mode: "Markdown",
                caption: `${username} tarafından gönderilen kod`,
            };
            if (replyToMessageId) {
                options.reply_to_message_id = replyToMessageId;
            }

            // send a message to the chat acknowledging receipt of their message
            codeConverter.setListeners((imgPath) => {
                bot.sendPhoto(chatId, imgPath, options)
                    .then((m) => {
                        // Try to delete the user message
                        bot.deleteMessage(userId, messageId).catch((err) => {
                            console.error("Failed to delete message:", err.message);
                        });
                    })
                    .catch((err) => {
                        console.error("Failed to send photo:", err.message);
                    });
            });

            const newMsg = msg.text.replace(/\/(code|kod)/, (match) => {
                // İlk eşleşmeyi bulduğunda buraya girer
                return ""; // Boş bir string ile değiştirerek siliyoruz
            });

            await codeConverter.createSvgElement(newMsg.trim());
        };

        const pages = await codeConverter.browser.pages();
        for (const p of pages) {
            if (p.url() === "about:blank") {
                await p.close();
            }
        }
        runCodeConverter();
    });

    await codeConverter.setBrowserSettings();
    await codeConverter.goToCreatorPage();
};

startBot();

*/