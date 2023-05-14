import path from 'path';
import { fileURLToPath } from 'url';
import { renderFile as _renderFile } from 'ejs';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const renderFile = promisify(_renderFile);
const templateLibrary = {
   'orders.inventory_unavailable': `${__dirname}/inventory-unavailable.ejs`,
   'items.inventory_report_required': `${__dirname}/inventory-report-required.ejs`,
};

/**
 * 
 */
export default class EmailTemplate {
    /**
     * Creates a new email template
     * @param {String} templateName - render a known email template [REQUIRED if `filePath` undefined]
     * @param {Object} data - data used in the rendered template
     * @param {String} filePath - file path to a template [REQUIRED if `templateName` undefined]
     * @returns {String} a rendered HTML string
     */

    static async of({ templateName, data, filePath }) {
        let template;
        const templateExistsInLibrary = Object.keys(templateLibrary).includes(templateName);

        if (!templateExistsInLibrary) {
            template = await renderFile(filePath, { data });
        } else {
            template = await renderFile(templateLibrary[templateName], { data });
        }

        return template;
    }
};