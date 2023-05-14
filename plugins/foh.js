import jsonServer from 'json-server';

import MKPlugin from '../src/plugin.js';

/**
 * 
 * @param {Object} db - an instance of the database
 * @returns {HTTPServer}
 */
export default function PluginFactory(db) {
  class HTTPServer extends MKPlugin {
    #core;

    constructor(name = 'com.beepboop.plugin.foh', version = '0.0.1') {
      super(name, version);
    }

    /**
     * @param {Message} message
     */
    #onPaymentApproved(message) {
      const { payload } = message.value();
      const { orderId, authorization } = payload;

      const approvedOrder = db.orders.find((item) => item.id === orderId);

      approvedOrder.status.payment = 'approved';
      approvedOrder.status.order = 'preparing';
      approvedOrder.authorizationId = authorization;

      this.#core.emit('orders.fulfillment_required', approvedOrder);
    }

    /**
     *
     */
    start() {
      const port = 3000;
      const _jsonServer = jsonServer.create();
      const jsonRouter = jsonServer.router(db);
      const middlewares = jsonServer.defaults();

      _jsonServer.use(jsonServer.bodyParser);
      _jsonServer.use(middlewares);

      /**
       *
       */
      _jsonServer.get('/events', (req, res) => {
        res.json({
          count: this.#core.emittedEvents.length,
          entries: this.#core.emittedEvents,
        });
      });

      /**
       *
       */
      _jsonServer.post('/orders', (req, res) => {
        const order = {
          id: this.#core.generateId(),
          customerId: req.body.customerId,
          createdDate: new Date().toISOString(),
          status: {
            order: 'pending',
            payment: null,
          },
          items: req.body.items,
        };

        db.orders.push(order);
        res.json({ count: 1, entries: [order] });
      });

      /**
       *
       */
      _jsonServer.post('/orders/:id/payment', (req, res) => {
        const order = db.orders.find((item) => item.id === req.params.id);
        order.status.payment = 'authorizing';

        this.#core.emit('payments.payment_received', {
          orderId: req.params.id,
        });

        res.json({ count: 1, entries: [order] });
      });

      _jsonServer.use(jsonRouter);

      _jsonServer.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
      });

      return {
        name: super.getVersion().name,
      };
    }

    /**
     *
     */
    init(core) {
      this.#core = core;

      const { version, name } = super.getVersion();

      console.log(`Plugin ${name} version ${version} initialized`);

      // We use `bind` to ensure the onPaymentApproved handler
      // executes with the correct context
      core.on('payments.payment_approved', this.#onPaymentApproved.bind(this));
    }
  }

  return new HTTPServer();
}
