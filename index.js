import figlet from 'figlet';
import { promisify } from 'util';

import Core from './src/core.js';

/******** PLUGINS ********/
import PluginFOH from './plugins/foh.js';
import PluginABCPayments from './plugins/abc-pay.js';
import PluginFulfillment from './plugins/fulfillment.js';
import PluginMailer from './plugins/mailer.js';
import PluginInventory from './plugins/inventory.js';
import PluginLoyalty from './plugins/loyalty.js';

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
const mailer = PluginMailer(db, EmailTemplate);
const inventory = PluginInventory(db);
const loyalty = PluginLoyalty(db);

/******** PLUGIN REGISTRATION ********/

core.registerPlugin(foh);
core.registerPlugin(abcPayments);
core.registerPlugin(fulfillment);
core.registerPlugin(mailer);
core.registerPlugin(inventory);
core.registerPlugin(loyalty);

/******** APP START ********/

core.run();
console.log(banner);
