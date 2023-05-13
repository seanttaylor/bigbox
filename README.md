# bigbox

The next everything store

## Local Development

### Getting Started

- Do `npm start` to launch the application

### API

- Create an order

  - `curl -X POST -H "Content-Type: application/json" -d '{ "customerId": "-NVKP0GfTT3RjDk_p4NQ", "items":[{"name":"cookie","qty":1},{"name":"sandwich","qty":1},{"name":"salad","qty":1}] }' http://localhost:3000/orders`

- Pay for an existing order

  - `curl -X POST http://localhost:3000/orders/:orderId/payment`

- Get current inventory
  - `curl -X POST http://localhost:3000/inventory`

- Get all emitted system events
  - `curl http://localhost:3000/events`