import nodemailer from 'nodemailer';

import MKPlugin from '../src/plugin.js';

export default function PluginFactory(db) {
  class Mailer extends MKPlugin {
    #transporter;
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

      console.log({
        messageId: outboundMessage.messageId,
        messagePreviewURL: nodemailer.getTestMessageUrl(outboundMessage),
      });
    }

    /**
     * @param {Object} eventData
     */
    #onLowInventoryDetected(eventData) {}

    /**
     * @param {Object} eventData
     */
    #onInventoryUnavailable(eventData) {
      console.log({ eventData });

      const order = db.orders.find((i) => i.id === eventData.orderId);
      const user = db.users.find((u) => u.id === order.customerId);

      //console.log({ user, order });

      this.#send({
        to: [user.emailAddress],
        from: 'backend@bigbox.com',
        subject: 'Unavailable Items',
        html: `
        <div>
          <p>Some of the items you ordered are unavailable</p>
          <code>
            ${eventData.unavailableItems}
          </code>
        </div>`,
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
    }
  }

  return new Mailer();
}
