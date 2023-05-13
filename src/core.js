import id from 'firebase-auto-ids';

export default class CoreSystem {
  constructor() {
    this.plugins = [];
    this.listeners = {};
    this.api = {};
    this.emittedEvents = [];
  }

  /**
   * Register a plugin with the core system
   * @param {MKPlugin} plugin - instance of MKPlugin
   */
  registerPlugin(plugin) {
    this.plugins.push(plugin);

    //console.log(`Plugin ${plugin.getVersion().name} registered with core system`);

    plugin.init(this);
  }
  /**
   * Execute all registered plugins
   */
  run() {
    this.plugins.forEach((plugin) => {
      let { name } = plugin.getVersion();
      this.api[name] = plugin.start();
    });
  }

  /**
   *@return {String}
   */
  generateId() {
    return id(Date.now());
  }

  /**
   * Register an event listener with the core system
   * @param {String} event - the name of an event to listen for
   * @param {Function} listener - a function to execute when the named event is emitted
   */
  on(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(listener);
    // console.log(`Core system registered listener for event (${event})`);
  }

  /**
   * Emit a registered event with data to all listeners
   * @param {String} event
   * @param {Any} data
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener) => {
        this.emittedEvents.push({
          id: this.generateId(),
          name: event,
          timestamp: new Date().toISOString(),
        });
        listener(data);
      });
      console.log(`Core system emitted event (${event})`);
    }
  }
}
