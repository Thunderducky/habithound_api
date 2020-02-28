const uuidv4 = require("uuid/v4");

module.exports = {
    generateUuid: () => {
        return uuidv4()
    }
}