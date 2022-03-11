const Papa = require("../dependencies/papaparse.min.js");

class CSV_File_DKB
{
    constructor(data){
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
        this.parse(data);
    }

    parse(data)
    {
        // break the textblock into an array of lines
        var lines = data.split('\n');
        this.parseAccountInfo(lines.splice(0,6));
        var contentData = lines.join('\n');

        this._parseResult = Papa.parse(contentData, this._papaConfig);
    }


    parseAccountInfo(infoLines)
    {
        console.log(infoLines[0])
        this._accountNumber = infoLines[0].split(';')[1]
        let balanceString = infoLines[4].split(';')[1]
        this._accountBalance = this.convertCurrencyStringToNumber(balanceString)
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

module.exports = CSV_File_DKB;