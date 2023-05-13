import figlet from 'figlet';
import { promisify } from 'util';

import Core from './src/core.js';

/******** PLUGINS ********/
import PluginFOH from './plugins/foh.js';
import PluginABCPayments from './plugins/abc-pay.js';
import PluginFulfillment from './plugins/fulfillment.js';
import PluginInventory from './plugins/inventory.js';

/******** LIBRARIES ********/
import db from './db.js';
import EmailTemplate from './src/lib/mailer/email-template.js'

const APP_NAME = 'big_box';
const APP_VERSION = '0.0.1';

const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);

/******** PLUGIN DEFINITION ********/

const core = new Core();
const foh = PluginFOH(db);
const abcPayments = PluginABCPayments();
const fulfillment = PluginFulfillment(db);
const inventory = PluginInventory(db, EmailTemplate);

/******** PLUGIN REGISTRATION ********/

core.registerPlugin(foh);
core.registerPlugin(abcPayments);
core.registerPlugin(fulfillment);
core.registerPlugin(inventory);

/******** APP START ********/

core.run();
console.log(banner);
