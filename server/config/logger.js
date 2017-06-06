var winston = require('winston');
var fs = require('fs');
var ambient = process.env.AMBIENTE ;
var logDir ='log';
 
// configuration logger //
// create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
var tsFormat = () => (new Date()).toLocaleDateString();
var logger = new (winston.Logger)({
    transports:[
    // colorize the output to the console
        new (winston.transports.Console)({
            timestamp: tsFormat,
            colorize: true,
            level: 'info'
        }),
        new (winston.transports.File)({
            filename: `${logDir}/results.log`,
            timestamp: tsFormat,
            level: ambient
        })
    ]
});

module.exports = logger;
/*module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};*/