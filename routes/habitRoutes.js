const db = require("../models");
const router = require("express").Router();
const moment = require("moment");
const {hasValidToken} = require("../middleware");
const {generateUuid} = require("../service/idService")
const { JWT_SECRET } = process.env;
const validateHabitText = (text) => {
    return typeof text === "string" && text.trim().length > 0;
}

const {midnightsBetweenDates } = require("../utils/timeHelper");

const { updateProjection } = require("../projectors/habitProjector")
const {
    DomainEvents: {
        UserHabitCreatedEvent,
        UserHabitMarkedEvent
    },
    DomainProjections: {
        HabitProjection
    }
} = db;

// need to pull these out into a separate function for testing
// purposes
router.use(hasValidToken);
// TODO: extract route pieces into a controller, I'd love for this to not rely on having the data from the requests and pull all of that data out

// TODO: Enable paging
router.get("/", async (req, res) => {
    try {
        const projections = await HabitProjection.find({ 
            userUuid: req.user.uuid
        });
        if(projections.length === 0){
            return res.status(404).send("Cannot find any habits belonging to the logged in user")
        }

        // We have found the relevant projection, let's return it
        res.json({
            habits: projections.map(projection => {
                const habit = Object.assign({}, projection);
                // any modifications we need we can put in here
                if(midnightsBetweenDates(habit.lastCheckin, moment().toDate()) > 1){
                    habit.currentDailyStreak = 0;
                }
                return habit;
            })
        })
        
        // We're going to quickly check since the last projection and make sure everything
        // Don't want to make extra trips to the database for now, so we'll just make a quick update over the projection
        if(midnightsBetweenDates(lastCheckin, moment().toDate()) > 1){
            currentDailyStreak = 0;
        }

        res.json({
            habitUuid,
            habitText,
            currentDailyStreak,
            lastCheckin
        });
        
    } catch(ex){
        return res.status(500).send("Something went wrong");
    }
})

// Habits can only be retrieved by the user they are related to right now
router.get("/:habitUuid", async (req, res) => {
    // TODO: validate that the resource belongs to the user
    // Retrieve the projection for this habit
    // Ideally everything got recorded and we don't need to check for updates
    
    // This is where we can evolve what they data looks like
    // and add some extra view paramters, we can also do some caching
    try {
        const projection = await HabitProjection.findOne({ 
            habitUuid: req.params.habitUuid,
            userUuid: req.user.uuid
        });
        if(!projection){
            return res.status(404).send("Cannot find a habit belonging to the logged in user with that id")
        }

        // We have found the relevant projection, let's return it
        const { habitUuid, habitText, lastCheckin } = projection;
        let { currentDailyStreak } = projection;
        
        // We're going to quickly check since the last projection and make sure everything
        // Don't want to make extra trips to the database for now, so we'll just make a quick update over the projection
        if(midnightsBetweenDates(lastCheckin, moment().toDate()) > 1){
            currentDailyStreak = 0;
        }

        res.json({
            habitUuid,
            habitText,
            currentDailyStreak,
            lastCheckin
        });
        
    } catch(ex){
        return res.status(500).send("Something went wrong");
    }
})
// TODO: Pull out extra/duplicate checkins in the future
router.patch("/:habitUuid/mark", async (req, res) => {
    try {
        // Eventually we would just publish the event but we are
        // #blessed enough to have this all on a single shard for now
        // so we are leveraging that to update everything

        // Let's work with the projection rather than the event itself
        const projection = await HabitProjection.findOne({ 
            habitUuid: req.params.habitUuid,
            userUuid: req.user.uuid
        });
        if(!projection){
            return res.status(404).send("Cannot find a habit belonging to the logged in user with that id")
        }
        // If this works create an event and update the projection
        const eventUuid = generateUuid();
        const newMarkedEvent = await UserHabitMarkedEvent.create({
            eventUuid,
            habitUuid: req.params.habitUuid,
            version: 1
        });

        // This call mutates the projection
        updateProjection([newMarkedEvent], projection);
        await projection.save();

        res.json({projection})

        throw new Error("Not done yet")
    } catch(ex){
        console.log(ex);
        res.status(500).end()
    }
})
router.post("/", async (req, res) => {
    const habitText = req.body.habitText;
    // Guard Check
    if(!validateHabitText(habitText)){
        return res.status(400).send("The habitText field of the request body has to have non-whitespace content :(")
    }

    const userUuid = req.user.uuid;
    const habitUuid = generateUuid();
    const eventUuid = generateUuid();

    try {
        // Do some better guarantees of this part in particular
        await UserHabitCreatedEvent.create({
            eventUuid,
            habitUuid,
            userUuid,
            habitText,
            version: 1
        });

        // Todo: allow user to specify if they've already done it today
        await HabitProjection.create({
            habitUuid,
            habitText,
            userUuid,
            currentDailyStreak: 0,
            lastCheckin: null // We currently have no checkin
        });

        
        // We finished and everything was fine
        return res.status(200).json({habitUuid})
    } catch(err) {
        console.log(err);
        console.log("Something went wrong");
        return res.status(500).end();
    }
})

// TODO, make this work with graphql

module.exports = router;