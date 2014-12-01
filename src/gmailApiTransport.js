'use strict';

var packageData = require('../package.json');
var google = require('googleapis');
var gmail = google.gmail('v1');

module.exports = function(config) {
    return new GmailAPITransport(config);
};

/**
 * Generates a Transport object for Gmail with google-api.
 *
 * @constructor
 * @param {Object} optional config parameter for the gmail service
 */
function GmailAPITransport(config) {
    // Validations:
    if (!config)
        throw new Error('No "config" param was provided.');
    if (!config.oauth2Client)
        throw new Error('No "oauth2Client" was provided in config param.');

    // Load configuration:redirectUrl
    this.config = config;
    this.name = packageData.version.name;
    this.version = packageData.version;
}

/**
 * Compiles a BuildMail message and sends it.
 *
 * @param {Object} mail Mail object
 * @param {Function} callback Callback function to run when the sending is completed
 */
GmailAPITransport.prototype.send = function(mail, callback) {
    this.generateMessageString(mail.message.createReadStream(), (function(err, messageString) {
        if (err) {
            return typeof callback === 'function' && callback(err);
        }
        this.sendMessage(mail, messageString, callback);
    }).bind(this));
};

/**
 * Compiles the BuildMail object to a string.
 *
 * @param {Object} mailStream BuildMail stream
 * @param {Function} callback Callback function to run once the message has been compiled
 */

GmailAPITransport.prototype.generateMessageString = function(mailStream, callback) {
    var chunks = [];
    var chunklen = 0;

    mailStream.on('data', function(chunk) {
        chunks.push(chunk);
        chunklen += chunk.length;
    });

    mailStream.on('end', function() {
        // chunklen is provided to improve concant performance.
        callback(null, Buffer.concat(chunks, chunklen).toString());
    });
};
/**
 * Sends the request with e-mail data to Gmail API, using google's client library.
 *
 * @param {Object} mail Mail object
 * @param {String} rawMessageString Compiled raw e-mail as a string
 * @param {Function} callback Callback function to run once the message has been sent
 */
GmailAPITransport.prototype.sendMessage = function(mail, rawMessageString, callback) {
    // Encode email using gmail's base64
    var base64EncodedEmail = new Buffer(rawMessageString).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    // Send email using gmail's API
    var sendParams = {
        auth: this.config.oauth2Client,
        userId: "me",
        resource: {
          raw: base64EncodedEmail
        }
    };
    gmail.users.messages.send(sendParams,callback);
};
