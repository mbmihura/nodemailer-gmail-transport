'use strict';

var packageData = require('../package.json');

module.exports = function(options) {
    return new GmailAPITransport(options);
};

/**
 * Generates a Transport object for Gmail with google-api.
 *
 * @constructor
 * @param {Object} optional config parameter for the gmail service
 */
function GmailAPITransport(options) {
    this.options = options || {};
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
    // TODO: send mail to api intead of outputting to console.
    var data = new Buffer(rawMessageString, 'utf-8').toString();
    console.log(data);
    callback();
};
