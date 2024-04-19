import { Page } from "puppeteer";

export async function handleCongestionMessage(page: Page) {
    try {
        while (true) {

            const pageTitleElementHandle = await page.$('.page-english-title');

            if (!pageTitleElementHandle) {
                console.error("Element .page-english-title not found, skipping...");
                return;
            }

            const pageTitleText = await page.evaluate(el => el.textContent, pageTitleElementHandle);

            console.log("Page title: ", pageTitleText);

            if (pageTitleText !== "The site is congested due to heavy access.") {
                console.log("Congestion message not found, exiting loop.");
                return;
            }

            console.log("The site is congested due to heavy access. Refreshing...");
            const reloadButton = await page.$('.button-container a.button.arrow-down');
            if (reloadButton) {
                await reloadButton.click();
            } else {
                console.error("Could not find the reload button... manually refreshing the page.");
                await page.reload({ waitUntil: ['domcontentloaded', 'networkidle0'] });
            }
        }
    } catch (error) {
        console.log('Error handling congestion message: ', error);
        // screenshot and save the page for debugging. Add date and time to the file name.
        await page.screenshot({ path: `debug/congestion-handler/pokemon-cafe-congestion-handler-${new Date().toLocaleTimeString()}.png` });

    }
}


