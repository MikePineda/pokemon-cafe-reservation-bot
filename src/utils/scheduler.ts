import moment, { MomentSetObject } from "moment";

// receive as a parameter the function that we want to schedule
export function scheduleScript(targetTime: MomentSetObject,  functionToSchedule: () => Promise<void>, numberOfCalls: number): void {
    // Get current date and time in JST (UTC + 9 hours)
    const jstNow = moment().utcOffset('+09:00');

    // Set target time to 6 PM JST
    const targetDate = jstNow.clone().set(targetTime);

    // If it's already past 6 PM JST today, schedule for the next day
    if (jstNow.isAfter(targetDate)) {
        targetDate.add(1, 'day');
    }

    // Calculate delay in milliseconds.
    const delay = targetDate.diff(jstNow);

    console.log(`Scheduling script to run at ${targetDate.format()} (JST), which is in ${moment.duration(delay).asMinutes()} minutes`);

    setTimeout(() => {
        // Call the function to schedule numberOfCalls times
        for (let i = 0; i < numberOfCalls; i++) {
            try {
                functionToSchedule();
            } catch (error) {
                console.error("Error calling functionToSchedule: ", error);
            }
        }
    }, delay);
}