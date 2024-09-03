//CodeConverter sınıfı

import puppeteer from 'puppeteer';
import { setBrowserSettings, goToCreatorPage, setListeners, createSvgElement, goToSavePngPage } from "./browserSettings.js";

class CodeConverter {
    constructor() {
        this.browser = null;
        this.page = null;
        this.page2 = null;
        this.active = false;
        this.lastSave = Date.now();
    }
    async setBrowserSettings(){
        try{
            this.browser = await setBrowserSettings();
        }catch(error){
            console.error("Error setting browser settings: ", error);
        }
    }
    async goToCreatorPage(){
        try{
            this.page = await goToCreatorPage(this.browser);
            this.active = true;
            console.log("Browser Page active");
        }catch(error){
            console.error("Failed to navigate to creator page: ", error);
        }
    }
    async processMessage(msg){
        try{
            if(!this.active){
                throw new Error("Browser page is not active");
            }
            await createSvgElement(this.page, msg.text);
            console.log("SVG Element created");
        }catch(error){
            console.error("Error processing message: ", error);
        }
    }

    async cleanup (){
        try{
            await closeResources(this.browser, this.page, this.page2);
        }catch(error){
            console.error("failed during cleanup: ", error);
        }
    }

    setListeners(){
        try{
            setListeners(this.page, cb);
        }catch(error){
            console.error("Error setting listeners: ", error);
        }
    }

}
export default CodeConverter;