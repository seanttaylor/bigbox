import crypto from 'crypto';

/**
 * Constructs a valid message header for the ice cream pipeline
 */
class MessageHeader {
    #eventId;
    #eventName;
    #timestamp = new Date().toISOString();

    /**
     * 
     * @param {String} id - an uuid for the message payload data
     * @param {String} eventName - identifier for an event
     */
    constructor({ id,  eventName  }) {
        if (!id ||  !eventName) {
            throw new Error('Cannot create message header');
        }

        this.#eventId = id;
        this.#eventName = eventName;
    }

    value() {
        return {
            eventId: this.#eventId,
            eventName: [
                this.#eventName
            ],
            timestamp: this.#timestamp,
        };
    }
}


/**
 * Constructs a valid message body for the ice cream pipeline
 */
class MessageBody {
    #content;

    constructor(content) {
        // We could validate the payload here
        this.#content = content;
    }

    value() {
        return this.#content
    }
}

/**
 * Builds and validates a message for ingestion into the pipeline
 */
class Message {
    #messageHeader
    #messageBody

    /**
     * 
     * @param {MessageHeader} header 
     * @param {MessageBody} body 
     */
    constructor(header, body) {
        // Or we could validate the payload here...
        this.#messageHeader = header.value();
        this.#messageBody = body.value();
    }

    value() {
        return {
            header: this.#messageHeader,
            payload: this.#messageBody
        }
    }
}

export {
    Message,
    MessageHeader,
    MessageBody
}