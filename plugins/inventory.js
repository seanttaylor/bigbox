import MKPlugin from '../src/plugin.js';

const INVENTORY_REPORT_INTERVAL_MILLIS = 860000;

/**
 * 
 * @param {Object} db - an instance of the database
 * @returns {Inventory}
 */
export default function PluginFactory(db) {
  class Inventory extends MKPlugin {
    #core;
    #unavailableItems = new Set();

    constructor(name = 'com.beepboop.plugin.inventory', version = '0.0.1') {
      super(name, version);
    }

    /**
     * @param {Message} message
     */
    #onLowInventoryDetected(message) {}

    /**
     * @param {Message} message
     */
    async #onInventoryUnavailable(message) {
      const { payload } = message.value();
      payload.unavailableItems.forEach((item)=> {
        this.#unavailableItems.add(`${item.id}:${new Date().toISOString()}`);
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

      setInterval(() => {
        const currentInventory = { 
            allItems: db.items,
            unvailableItems: this.#unavailableItems,
        };
        core.emit('items.inventory_report_required', currentInventory); 
      }, INVENTORY_REPORT_INTERVAL_MILLIS);
    }
  }

  return new Inventory();
}
