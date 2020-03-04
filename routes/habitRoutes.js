const db = require("../models");
const router = require("express").Router();
const {hasValidToken} = require("../middleware");
const {generateUuid} = require("../service/idService")
const { JWT_SECRET } = process.env;
const validateHabitText = (text) => {
    return typeof text === "string" && text.trim().length > 0;
}
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
// TODO: work on the routes
router.post("/create", async (req, res) => {
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
            habitText
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
        console.log("Something went wrong");
        return res.status(500).end();
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
            habitUuid: req.params.Uuid,
            userUuid: req.user.uuid
        });
        if(!projection){
            return res.status(404).send("Cannot find a habit belonging to the logged in user with that id")
        }

        // We have found the relevant projection, let's return it
        const { habitUuid, habitText, currentDailyStreak, lastCheckin } = projection;
        res.json({
            habitUuid,
            habitText,
            currentDailyStreak,
            lastCheckin
        });
        
    } catch(ex){
        return res.status(500).send("Something went wrong");
    }
    // res.status(404).send("Route still under construction")
})
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
            habitUuid: req.params.habitUuid
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

module.exports = router;