import XLSX from 'xlsx';
import {Sheet} from './sheet';
import {convert, validateRecord} from './utils.js';

/**
 * Like Layout, but for tables that are not plate layouts.
 */
export class Table {

    /**
     *
     * @param array<object> contents
     * @param headers if these are not given, they are inferred from the first row.
     */
    constructor(contents = [], headers = null) {
        if(headers === null && contents.length != 0) {
            headers = Object.keys(contents[0]);
        }

        this.headers = headers;
        this.rows = contents;
    }

    async validate(validators, parallel = true) {
        let contents = {};
        let errors = {};

        if(parallel) {
            let ready = Promise.resolve(null);

            for(let [index, content] of this.rows.entries()) {
                ready = ready.then(() =>
                        validateRecord(content, validators).then(
                            (value) => { contents[index] = value },
                            (error) => { errors[index] = error })
                );
                console.log(index, content)
            }

            await ready;
        } else {
            for(let [index, content] of this.rows.entries()) {
                try {
                    contents[index] = await validateRecord(content, validators);
                } catch (e) {
                    errors[index] = e;
                }
            }

        }
        if(Object.keys(errors).length == 0) {
            return new Table([for(index of this.rows.keys()) contents[index]], this.headers);
        } else {
            throw errors;
        }
    }

    static parse(sheet, {required = [], aliases = {}, converters = {}} = {}) {
        let invertedAliases = {};
        for (let name of Object.keys(aliases)) {
            // default alias: lower case -> original case.
            invertedAliases[name.toLowerCase()] = name;
            for (let alias of aliases[name]) {
                invertedAliases[alias.toLowerCase()] = name;
            }
        }

        for(let name of required) {
            invertedAliases[name.toLowerCase()] = name;
        }

        let headers = [];
        for (let c = 0; c < sheet.columns; c++) {
            let name = sheet.get(0, c);

            if (!name) {
                break;
            }

            name = name.toLowerCase();
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
                let value = sheet.get(r, c);

                if(value === undefined) {
                    continue;
                }

                row[header] = convert(value, converters[header]);
            }

            for(let name of required) {
                if(!(name in row)) {
                    throw `Missing required field "${name}" in row #${r + 1}".`;
                }
            }

            rows.push(row);
        }

        return new Table(rows, headers);
    }

    toSheet() {
        let content = [this.headers].concat([for (row of this.rows) [for (header of this.headers) row[header]]]);
        let sheet = new Sheet(content);
        return sheet;

    }

    *[Symbol.iterator]() {
        yield* this.rows;
    }
}