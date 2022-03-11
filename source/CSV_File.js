const Papa = require("../dependencies/papaparse.min.js");

class CSV_File 
{
    constructor(data)
    {
        this._papaConfig = {
            delimiter: "",	// auto-detect
            newline: "",	// auto-detect
            quoteChar: '"',
            escapeChar: '"',
            header: true,
            transformHeader: undefined,
            dynamicTyping: true,
            preview: 0,
            encoding: "",
            worker: false,
            comments: false,
            step: undefined,
            complete: undefined,
            error: undefined,
            download: false,
            downloadRequestHeaders: undefined,
            downloadRequestBody: undefined,
            skipEmptyLines: true,
            chunk: undefined,
            chunkSize: undefined,
            fastMode: undefined,
            beforeFirstChunk: undefined,
            withCredentials: undefined,
            transform: undefined,
            delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
        }
    }

    parse(data)
    {
        // break the textblock into an array of lines
        var lines = data.split('\n');
        let accountInfoLines = this.spliceAccountInfo(lines);
        this.parseAccountInfo(accountInfoLines);
        lines[0] = this.renameHeader(lines[0]);
        var contentData = lines.join('\n');

        this._parseResult = Papa.parse(contentData, this._papaConfig);
    }

    // to override in specific class
    spliceAccountInfo(lines)
    {
        throw new TypeError("Must override method");
    }

    // to override in specific class
    renameHeader(headerLine)
    {
        throw new TypeError("Must override method");
    }

    parseAccountInfo(accountInfoLines)
    {
        throw new TypeError("Must override method");
    }

    getHeader()
    {
        let firstEntry = this._parseResult.data[0];
        return Object.keys(firstEntry)
    }

    convertCurrencyStringToNumber(currencyString)
    {
        return Number(currencyString.replace(/[^0-9.-]+/g,""));
    }

    getParseResult()
    {
        return this._parseResult;
    }

    getCurrentAccountBalance()
    {
        return  this._accountBalance
    }

    getAccountNumber()
    {
        return  this._accountNumber
    }
}

module.exports = CSV_File;