import nodemailer from 'nodemailer';

import MKPlugin from '../src/plugin.js';

const IC_ADMIN_EMAIL = 'adelia.orn45@ethereal.email';
const IC_ADMIN_PASSWORD = 'tuSuyM2kv1zzp6HCPg';
const INVENTORY_REPORT_INTERVAL_MILLIS = 30000;

/**
 * 
 * @param {Object} db 
 * @param {Object} EmailTemplate 
 * @returns 
 */
export default function PluginFactory(db, EmailTemplate) {
  class Mailer extends MKPlugin {
    #transporter;
    #unavailableItems = [];
    #core;

    constructor(name = 'com.beepboop.plugin.mail', version = '0.0.1') {
      super(name, version);

      this.#transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'adelia.orn45@ethereal.email',
          pass: 'tuSuyM2kv1zzp6HCPg',
        },
      });
    }

    /**
     * @param {Array} to
     * @param {String} from
     * @param {String} bcc
     * @param {String} subject
     * @param {String} html
     */
    async #send({ from, to, bcc, subject, html }) {
      const message = {
        to: to.join(', '), // Nodemailer API requires a single comma-separated string of addresses
        from,
        bcc,
        subject,
        html,
      };

      const outboundMessage = await this.#transporter.sendMail(message);

      console.info(`Info: Outbound email delivered (${message.to})`, {
        messageId: outboundMessage.messageId,
        messagePreviewURL: nodemailer.getTestMessageUrl(outboundMessage),
      });
    }

    /**
     * @param {Message} message
     */
    #onInventoryReportRequired() {
      //this.#unavailableItems
      // Pull current inventory from database
      // Highlight items currently unavailable

      /*
      this.#send({
        to: [IC_ADMIN_EMAIL],
        from: 'backend@bigbox.com',
        subject: 'Inventory Report',
        html: await EmailTemplate.of({ templateName: 'orders.inventory_unavailable', data: { unavailableItems })
      });
      */
    }

    /**
     * @param {Object} eventData
     */
    #onLowInventoryDetected(eventData) {}

    /**
     * @param {Message} message
     */
    async #onInventoryUnavailable(message) {
      const { payload } = message.value();
      const order = db.orders.find((i) => i.id === payload.orderId);
      const user = db.users.find((u) => u.id === order.customerId);

      this.#unavailableItems = [...this.#unavailableItems, ...payload.unavailableItems];

      this.#send({
        to: [user.emailAddress],
        from: 'support@bigbox.com',
        subject: 'Some of your items are unvailable',
        html: await EmailTemplate.of({ templateName: 'orders.inventory_unavailable', data: { user, ...payload } })
      });
    }

    /**
     *
     */
    init(core) {
      this.#core = core;

      const { version, name } = super.getVersion();

      console.log(`Plugin ${name} version ${version} initialized`);

      // We use `bind` to ensure the handlers executes with the correct context
      core.on(
        'orders.inventory_unavailable',
        this.#onInventoryUnavailable.bind(this)
      );

      core.on(
        'items.low_inventory_detected',
        this.#onLowInventoryDetected.bind(this)
      );

      core.on(
        'items.inventory_report_required',
        this.#onInventoryReportRequired.bind(this)
      );

      setInterval(() => {
        core.emit('items.inventory_report_required'); 
      }, INVENTORY_REPORT_INTERVAL_MILLIS);
    }
  }

  return new Mailer();
}
