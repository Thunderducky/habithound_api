const moment = require("moment");
module.exports = {
    /**
     * How many times has it been midnight between these two times
     * Will always return a positive number
     * @param {number} time1 Unix timestamp
     * @param {number} time2 Unix timestamp
     */
    midnightsBetweenDates : (time1, time2) => {
        const earlierDate = time1 <= time2 ? time1 : time2;
        const laterDate = time1 > time2 ? time1 : time2;
        const beginningOfPrevDay = moment(earlierDate).startOf("day");
        const nextDay = moment(laterDate);
        return moment(nextDay).diff(beginningOfPrevDay, "day")
    }
}