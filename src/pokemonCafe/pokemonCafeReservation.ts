import puppeteer, { Browser, Page } from "puppeteer";
import { PokemonCafeLocation } from "../enums";
import { PokemonCafeOptions } from "../interfaces/pokemonCafeOptions";
import { handleCongestionMessage } from "../handlers/pokemonCafeCongestionHandler";
import fs from 'fs';

const pokemonTokyoUrl = "https://reserve.pokemon-cafe.jp/";
const pokemonOsakaUrl = "https://osaka.pokemon-cafe.jp/";
const opn = require('better-opn');

let found = false;


export async function findAndReservePokemonCafe(pokemonCafeOptions: PokemonCafeOptions) {
    console.log("Opening browser...");
    const chromeOptions = {
        headless:false,
        defaultViewport: null
    };

    let browser: Browser;

    (async () => {
        browser = await puppeteer.launch(chromeOptions);
        const page = await browser.newPage();
        await checkPokemonCafePage(page, pokemonCafeOptions).then(async (result) => {
            console.log("Result of checkPokemonCafePage: ", result);
        });

    })().catch((error) => console.error("Error launching browser: ", error))
    .finally(() => {
        if(!found){
            browser.close()
            console.log("Browser closed.");
        }
    });
        

}

async function checkPokemonCafePage(page: Page, pokemonCafeOptions: PokemonCafeOptions): Promise<boolean> {

    const maxRetries = 10; // Maximum number of retries before giving up
    let retries = 0;


    while (retries < maxRetries && !found) {
        console.log(`Attempt ${retries + 1} to find a valid time slot...`);
        retries++;
        try{
            console.log("Checking Pokemon Cafe page...");
            // Step 1 - Go to Pokemon Cafe reservation page
            console.log("Step 1 - Go to Pokemon Cafe reservation page...");
            if(pokemonCafeOptions.location === PokemonCafeLocation.Tokyo){
                await page.goto(pokemonTokyoUrl);
            } else {
                await page.goto(pokemonOsakaUrl);
            }

            // Handle congestion message and refresh page if necessary
            await handleCongestionMessage(page);

            // Agree T&C and proceed
            console.log("Agreeing to T&C and proceeding...");
            await page.click("[class='agreeChecked']");
            await page.click("[class='button']");

            // Handle congestion message and refresh page if necessary
            await handleCongestionMessage(page);
        
            // Wait and click to make a reservation
            console.log("Waiting for reservation button and clicking...");
            await page.waitForSelector("[class='button arrow-down']", { visible: true });
            await page.click("[class='button arrow-down']");

            // Handle congestion message and refresh page if necessary
            await handleCongestionMessage(page);

        
            // Step 3 - Select number of guests:
            console.log("Selecting number of guests...");
            await page.waitForSelector("select");
            await page.select("select", pokemonCafeOptions.numberOfGuests.toString());

            // wait until the calendar is loaded
            await page.waitForSelector("li.calendar-day-cell");

            // Step 4 - Select from calendar:
            console.log("Selecting day from calendar...");
            const goToNextMonthElement = await page.waitForSelector("text/次の月を見る");
            if (!goToNextMonthElement) {
                console.error("Could not find the next month element... exiting.");
                return false;
            }
            await goToNextMonthElement.click();
        
            console.log("Waiting for calendar days...");
            const calendarDays = await page.$$('li.calendar-day-cell');
            console.log("Calendar days found: ", calendarDays.length);
            console.log("Looping through calendar days and check availability...");
            calendarDays.forEach(async (day) => {
                // check if element containes the 'not-available' class in the li element
                const isNotAvailable = await day.evaluate((el) => el.classList.contains('not-available'));

                if (!isNotAvailable) {
                    // Click on the day since it's available :D
                    console.log("Day is available. Clicking on it...");
                    await page.screenshot({ path: `debug/pokemon-cafe-calendar-valid-reservation${Math.floor(Math.random() * 1000000)}.png` });
                    console.log(new Date().toLocaleTimeString());
                    await day.click(); 
                    await page.waitForSelector("#submit_button");
                    await page.click("#submit_button");

                    // Handle congestion message and refresh page if necessary
                    await handleCongestionMessage(page);

                    // Step 5 - Select time slot
                    const timeSlots = await page.$$('td div.time-cell');

                    for (const timeSlot of timeSlots) {
                        const timeSlotText = await timeSlot.$eval('div', el => el.textContent);
                        console.log("Time slot text: ", timeSlotText);
                        if (!timeSlotText.includes('Full')) {

                            // do a screenshot of the page
                            await page.screenshot({ path: `debug/pokemon-cafe-valid-reservation${Math.floor(Math.random() * 1000000)}.png` });

                            // Step 6 - Click on the time slot and reserve
                            console.log("Valid time slot found. Clicking on it and notifying me...");
                            await timeSlot.click();
                            found = true;
                            opn('https://www.youtube.com/watch?v=uDIoEbbFKAY');
                            await page.screenshot({ path: `debug/pokemon-cafe-valid-reservation-final${Math.floor(Math.random() * 1000000)}.png` });


                            // Save html for debugging from current page
                            const html = await page.content();
                            const uuid = Math.floor(Math.random() * 1000000);
                            fs.writeFileSync(`debug/pokemon-cafe-valid-reservation${uuid}.html`, html);
                            // wait undefined time to notify me
                            await new Promise((resolve) => setTimeout(resolve, 100000000));


                            return true;
                        }
                    }

                }
            });

            console.log("Could not find a valid time slot... trying again in 5 seconds.");
            // Wait 5 seconds before continuing to the next iteration
            await new Promise((resolve) => setTimeout(resolve, 5000));
        } catch (error) {
            console.error("Error in checkPokemonCafePage: ", error);
            await page.screenshot({ path: `debug/pokemon-cafe-error/pokemon-cafe-error${Math.floor(Math.random() * 1000000)}.png` });
            // Wait 5 seconds before continuing to the next iteration
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }

    return false;

}
