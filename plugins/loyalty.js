import MKPlugin from '../src/plugin.js';

/**
 * Manages customer loyalty points and balances
 * @param {Object} db - an instance of the database
 * @returns {Loyalty}
 */
export default function PluginFactory(db) {
  class Loyalty extends MKPlugin {
    #core;

    constructor(name = 'com.beepboop.plugin.loyalty', version = '0.0.1') {
      super(name, version);
    }

    /**
     * 
     * @param {Message} message 
     */
    #onPaymentApproved(message) {
      const { payload: { orderId } } = message.value();
      const order = db.orders.find((item) => item.id === orderId);
      const user = db.users.find((item) => item.id === order.customerId);

      const updatedPointsBalance = order.items.reduce((balance, currItem) => {
        const { pointsBonus } = db.items.find((inventoryItem => inventoryItem.name === currItem.name));
        return pointsBonus + balance;
      }, user.pointsBalance);

      user.pointsBalance = updatedPointsBalance;
    }

    /**
     *
     */
    init(core) {
      this.#core = core;

      const { version, name } = super.getVersion();

      console.log(`Plugin ${name} version ${version} initialized`);

      // We use `bind` to ensure the onPaymentApproved handler executes
      // with the correct context
      core.on('payments.payment_approved', this.#onPaymentApproved.bind(this));
    }
  }

  return new Loyalty();
}
