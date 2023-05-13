import MKPlugin from '../src/plugin.js';

export default function PluginFactory(db) {
  class OrderFulfillment extends MKPlugin {
    #core;

    constructor(name = 'com.beepboop.plugin.fulfillment', version = '0.0.1') {
      super(name, version);
    }

    /**
     * Determines whether the order can be fulfilled
     * @param {Array} unavailableItemList - running list of items that are unavailable per stock levels
     * @returns {Function}
     */
    #validateOrder(unavailableItemList) {
      /**
       * @param {Object} orderItem
       * @returns {Boolean}
       */
      return function (orderItem) {
        let inventoryItem = db.items.find((i) => i.name === orderItem.name);
        let itemAvailable = orderItem.qty < inventoryItem.qty;

        if (!itemAvailable) {
          unavailableItemList.push(inventoryItem);
          return itemAvailable;
        }

        return itemAvailable;
      };
    }

    /**
     * @param {Object} orderItem
     */
    #processOrderItem(orderItem) {
      let inventoryItem = db.items.find((i) => i.name === orderItem.name);
      let currentItemInventoryLevel;
      let alertThreshold;

      inventoryItem.qty -= orderItem.qty;

      /*
      console.log({
        orderItem,
        inventoryItem,
      });
      */

      currentItemInventoryLevel = inventoryItem.qty;
      alertThreshold = inventoryItem.inventoryAlertThreshold;

      if (currentItemInventoryLevel < alertThreshold) {
        this.#core.emit('items.low_inventory_detected', inventoryItem);
      }
    }

    #onFulfillment(eventData) {
      const { id } = eventData;
      const unavailableItems = [];

      console.info(`Info: Preparing order... (${id})`);

      const order = db.orders.find((item) => item.id === id);
      const { items: orderItems } = order;

      const allRequestedItemsAvailable = orderItems.every(
        this.#validateOrder(unavailableItems)
      );

      if (!allRequestedItemsAvailable) {
        // Some items are not available in the desired quantity
        this.#core.emit('orders.inventory_unavailable', {
          orderId: id,
          unavailableItems,
        });
        return;
      }

      orderItems.forEach(this.#processOrderItem);

      this.#core.emit('orders.order_fulfilled');
    }

    /**
     *
     */
    init(core) {
      this.#core = core;

      const { version, name } = super.getVersion();

      console.log(`Plugin ${name} version ${version} initialized`);

      // We use `bind` to ensure the onFulfillment handler
      // executes with the correct context
      core.on('orders.fulfillment_required', this.#onFulfillment.bind(this));
    }
  }

  return new OrderFulfillment();
}
