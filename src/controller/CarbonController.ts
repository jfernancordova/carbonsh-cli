import puppeteer from "puppeteer";
import { SCREENSHOTS_PATH } from "../constants/paths";
import { CarbonParameters } from "../types/carbon.types";

abstract class CarbonController<T> {
    private static CARBON_BASE_PATH: string = 'https://carbon.now.sh/';
    private static CARBON_HTML_SELECTOR: string = 'div.container-bg';

    private static CARBON_DEFAULT_BACKGROUND: string = 'rgba(171, 184, 195, 1)';
    private static CARBON_DEFAULT_THEME: string = 'seti';

    constructor() {

    }

    private getFileName(): string {
        return [
            new Date().toISOString(),
            'png'
        ].join('.');
    }

    protected abstract parseParameters(params: T): CarbonParameters;

    private convertParamsToQuery(params: CarbonParameters): string {
        const paramsMap: Map<string, string> = new Map();
        paramsMap.set('bg', params.background || CarbonController.CARBON_DEFAULT_BACKGROUND);
        paramsMap.set('t', params.theme || CarbonController.CARBON_DEFAULT_THEME);
        paramsMap.set('l', params.language);
        paramsMap.set('code', params.code);

        let paramsList = []
        for (let [key, value] of paramsMap.entries()) {
            paramsList.push(`${key}=${encodeURIComponent(value)}`);
        }

        return paramsList.join('&');
    }

    public async getScreenshot(params: T) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const carbonParsedParameters = this.parseParameters(params);
        const carbonQueryString = this.convertParamsToQuery(carbonParsedParameters);
        const carbonFullPath = [
            CarbonController.CARBON_BASE_PATH, carbonQueryString
        ].join('?');

        await page.goto(carbonFullPath);
        const targetElement = await page.$(CarbonController.CARBON_HTML_SELECTOR);
        if (targetElement) {
            await targetElement.screenshot({
                path: `${SCREENSHOTS_PATH}/${this.getFileName()}`
            })
        } else {
            // TODO something happened
        }

        await browser.close();
    }
}

export default CarbonController;