import XLSX from 'xlsx';

/**
 * Like Layout, but for tables that are not plate layouts.
 */
export class Table {

    /**
     *
     * @param array<object> contents
     * @param headers if these are not given, they are inferred from the first row.
     */
    constructor(contents, headers = null) {
        if(headers === null && contents.length != 0) {
            headers = Object.keys(contents[0]);
        }

        this.headers = headers;
        this.contents = contents;
    }

    static async parse(sheet, {
        required   = [],
        aliases    = {},
        converters = {},
        validators = {},
        parallel   = false
        } = {}) {

        // TODO make validator, required names lower case.

        let invertedAliases = {};
        for (let name of Object.keys(aliases)) {
            name = name.toLowerCase();
            for (let alias of aliases[name]) {
                invertedAliases[alias.toLowerCase()] = name;
            }
        }

        let headers = [];
        for (let c = 0; c < sheet.columns; c++) {
            let name = sheet.get([0, c]);

            if (!name) {
                break;
            }

            if (name in invertedAliases) {
                name = invertedAliases[name];
            }

            headers.push(name);
        }

        for(let name of required) {
            if(!headers.includes(name)) {
                throw `Missing required header in table: "${name}".`;
            }
        }

        let rows = [];
        for (let r = 1; r < sheet.rows; r++) {
            let row = {};
            for (let c = 0; c < headers.length; c++) {
                let header = headers[c];
                let value = sheet.get([r, c]);

                if(value === undefined) {
                    continue;
                }

                if(header in converters) {
                    switch(converters[header]) {
                        case 'number':
                            value = Number(value);
                            break;
                        case 'string[]':
                            value = value.split(',').map((s) => s.trim());
                            break;
                        case 'number[]':
                            value = value.split(',').map(Number);
                            break;
                        case 'string':
                            break;
                    }
                }
            }

            for(let name of required) {
                if(!(name in row)) {
                    throw `Missing required field "${name}" in row #${r + 1}".`;
                }
            }

            rows.push(row);
        }

        let validatedRows;
        if(parallel) {
            validatedRows = await Promise.all([for(row of rows) validateRow(row, validators)])
        } else {
            validatedRows = [];
            for(let row of rows) {
                validatedRows.push(await validateRow(row, validators, validatedRows));
            }
        }

        return new Table(validatedRows, headers);

    }

    appendRow(contents) {


    }

    toSheet() {

    }
}

// TODO validate in parallel within a row
async function validateRow(row, validators, ...args) {
    let output = new Map();

    for(let name of Object.keys(row)) {
        let value = row[name];

        if(name in validators) {
            value = await validators[name](value, ...args);
        }

        output.set(name, value);
    }

    return output;
}