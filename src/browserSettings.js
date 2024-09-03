// Tarayıcı ayarlarını içeren dosya
// Bellek sızınımlarını önlemek için tarayıcı ayarlarını yapılandırır

export const setBrowserSettings = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--enable-features=ClipboardAPI",
      ],
      executablePath: "C:/chromium/chrome.exe",
    });
    console.log("Browser launched successfully");
    return browser;
  } catch (error) {
    console.error("Error launching browser: ", error);
    throw error;
  }
};

export const goToCreatorPage = async (browser) => {
  try {
    const page = await browser.newPage();
    await page.goto("https://ray.so/", { waitUntil: "load" });
    console.log("Navigated to creator page");
    return page;
  } catch (error) {
    console.error("Failed to go to creator page:", error);
    throw error;
  }
};

export const setListeners = (page, cb) => {
  const requestListener = async (request) => {
    request.continue();
  };
  const responseListener = async (response) => {
    if (response.headers()["content-type"]?.startsWith("image/")) {
      const responseText = await response.text();
      cb(responseText);
    }
  };
  page.on("request", requestListener);
  page.on("response", responseListener);
};
//xn--%20bu%20bir%20test%20deiikliidir-ukef94t/
export const createSvgElement = async (page, code) => { 
    try{
        const titleElement = await page.$("input[type=text]");
        await titleElement.click();
        await page.keyboard.type("https://t.me/kodlayaz");
//
        const input = await page.$("#frame textarea");
        await input.click();
        await page.keyboard.type(code);

        await page.click("[class^='PaddingControl'] > button");
        await page.click(".buttonGroup > button");

        console.log("SVG Element created successfully");
    }catch(error){
        console.error("Error creating SVG element: ", error);
    }

};

export const closeResources = async (browser, page, page2) => {
  try {
    if (page2) await page2.close();
    if (page) await page.close();
    if (browser) await browser.close();
    console.log("Resources closed successfully");
  } catch (error) {
    console.error("Error closing resources: ", error);
  }
};
