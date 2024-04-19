import moment, { MomentSetObject } from "moment";
import { PokemonCafeLocation } from "./enums";
import { findAndReservePokemonCafe } from "./pokemonCafe/pokemonCafeReservation";
import { PokemonCafeOptions } from "./interfaces/pokemonCafeOptions";
import { scheduleScript } from "./utils/scheduler";


// get current day in Japan
const timeInJapan = moment().utcOffset('+09:00');
const currentDayInJapan = timeInJapan.date();

console.log("Date in JST: ", timeInJapan.format());
console.log("Today in Japan is the day: ", currentDayInJapan);



const pokemonCafeOptions: PokemonCafeOptions = {
    location: PokemonCafeLocation.Tokyo,
    numberOfGuests: 6,
};



const targetTime: MomentSetObject = { hour: 17, minute: 59, second: 59, millisecond: 0 };
const numberOfCalls = 3;


try{
    scheduleScript(targetTime, () => findAndReservePokemonCafe(pokemonCafeOptions), numberOfCalls);
} catch (error) {
    console.error("Error scheduling script: ", error);
}

// Schedule the function to run at 6:15 PM JST. Which in theory should be the time when some slots are available after the congestion.
const targetTime2: MomentSetObject = { hour: 18, minute: 15, second: 0, millisecond: 0 };
const numberOfCalls2 = 3;
try{
    scheduleScript(targetTime2, () => findAndReservePokemonCafe(pokemonCafeOptions), numberOfCalls2);
} catch (error) {
    console.error("Error scheduling script: ", error);
}