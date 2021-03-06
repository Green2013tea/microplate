import XLSX from 'xlsx';

const encode_cell = XLSX.utils.encode_cell;
const decode_range = XLSX.utils.decode_range;
const encode_range = XLSX.utils.encode_range;

export class Sheet {

    constructor(source = [], name = null) {
        this.name = name;

        if ('!ref' in source) {
            this.contents = source;
            this.range = decode_range(source['!ref']);
        } else {
            this.contents = {};
            this.range = {s: {c: 0, r: 0}, e: {r: 0, c: 0}};

            for (let row = 0; row < source.length; row++) {
                let columns = source[row].length;

                for (let column = 0; column < columns; column++) {
                    this.set(row, column, source[row][column]);
                }
            }
        }
    }

    get columns() {
        return this.range.e.c + 1;
    }

    get rows() {
        return this.range.e.r + 1;
    }

    get(row, column) {
        let cell = this.contents[encode_cell({r: row, c: column})];
        if (cell !== undefined) {
            return cell.v;
        }
        return undefined;
    }

    set(row, column, value) {
        let cell;

        if (typeof value == 'number') {
            cell = {v: value, t: 'n'}
        } else if(value == null) {
            return this.clear(row, column);
        } else {
            cell = {v: value.toString(), t: 's'}
        }

        this.contents[encode_cell({c: column, r: row})] = cell;

        if (this.range.s.r > row) this.range.s.r = row;
        if (this.range.s.c > column) this.range.s.c = column;
        if (this.range.e.r < row) this.range.e.r = row;
        if (this.range.e.c < column) this.range.e.c = column;

        return value;
    }

    clear(row, column) {
        delete this.contents[encode_cell({r: row, c: column})];
    }

    toXLSXSheet() {
        return Object.assign({}, this.contents, {['!ref']: encode_range(this.range)});
    }

    saveAs(filename, filetype = 'csv') {

    }
}


export class Workbook {

    constructor(sheets = {}) {
        if (sheets instanceof Array) {
            this.sheets = {};
            for (let sheet of sheets) {
                sheets[sheet.name] = sheet;
            }
        } else {
            this.sheets = sheets;
        }
    }

    static fromFile(file) {
        let workbook = XLSX.read(file, {type: 'binary'});
        let sheets = {};

        for (let name of workbook.SheetNames) {
            sheets[name] = new Sheet(workbook.Sheets[name], name);
        }

        return new Workbook(sheets);
    }

    sheet(name) {
        return this.sheets[name];
    }

    sheetNames() {
        return Object.keys(this.sheets);
    }

    toBlob() {
        let workbook = {
            SheetNames: this.sheetNames(),
            Sheets: {}
        };

        for (let name of workbook.SheetNames) {
            workbook.Sheets[name] = this.sheets[name].toXLSXSheet();
        }

        let s = XLSX.write(workbook, {
            bookType: 'xlsx',
            bookSST: false,
            type: 'binary'
        });

        let buffer = new ArrayBuffer(s.length);
        let view = new Uint8Array(buffer);
        for (let i = 0; i != s.length; ++i) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }

        return new Blob([buffer], {type: "application/octet-stream"});
    }

    *[Symbol.iterator]() {
        for (let name of this.sheetNames()) {
            yield this.sheets[name];
        }
    }

}