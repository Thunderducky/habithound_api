const chalk = require("chalk");
const NEWLINE = "\n";
const SPACE = " "
const _output = (colorFn, prefix, info) => {
    let finalInfo;
    if(Array.isArray(info)){
        console.log(colorFn(prefix), ...info)
    }
}
const wrapColor = (colorFn, prefix) => {
    return (...info) => {
        _output(colorFn, prefix, info)
    }
}

const log = {
    info: wrapColor(chalk.blue, "INFO"),
    success: wrapColor(chalk.green, "SUCCESS"),
    warn: wrapColor(chalk.yellow, "WARN"),
    error: wrapColor(chalk.red, "ERROR"),
    direct: (...results) => console.log(...results),
    newline: (newlines = 1) => NEWLINE.repeat(newlines),
    indent: (tabLength) => SPACE.repeat(tabLength)
}

module.exports = {
    log,
    NEWLINE,
    SPACE
};