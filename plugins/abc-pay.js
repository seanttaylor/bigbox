import MKPlugin from '../src/plugin.js';

import { faker } from '@faker-js/faker';

export default function PluginFactory() {
  class ABCPaymentProcessor extends MKPlugin {
    #core;

    constructor(name = 'com.beepboop.plugin.abc_payments', version = '0.0.1') {
      super(name, version);
    }

    /**
     * 
     * @param {Message} message 
     */
    #onPaymentReceived(message) {
      const { payload: { orderId } } = message.value();

      setTimeout(() => {
        this.#core.emit('payments.payment_approved', {
          orderId,
          authorization: this.#core.generateId(),
          timestamp: new Date().toISOString(),
        });
      }, 20000);
    }

    /**
     *
     */
    init(core) {
      this.#core = core;

      const { version, name } = super.getVersion();

      console.log(`Plugin ${name} version ${version} initialized`);

      // We use `bind` to ensure the onPaymentReceived handler executes
      // with the correct context
      core.on('payments.payment_received', this.#onPaymentReceived.bind(this));
    }
  }

  return new ABCPaymentProcessor();
}
