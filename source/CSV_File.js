class CSV_File 
{
    constructor()
    {
        this._papaConfig = {
            delimiter: "",	// auto-detect
            newline: "",	// auto-detect
            quoteChar: '"',
            escapeChar: '',
            header: true,
            transformHeader: undefined,
            dynamicTyping: false,
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
            delimitersToGuess: ['\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
        }

        this._accountBalance = 0
    }

    parse(data)
    {
        // remove all "
        data = data.replace(/\"/g, '');

        // break the textblock into an array of lines
        var lines = data.split('\n');
        let accountInfoLines = this.spliceAccountInfo(lines);
        this.parseAccountInfo(accountInfoLines);

        // filter empty lines
        lines = lines.filter(n => n)

        lines[0] = this.renameHeader(lines[0]);
        var contentData = lines.join('\n');

        this._parseResult = Papa.parse(contentData, this._papaConfig);

        this._parseResult.data = this.filterData(this._parseResult.data)
        this._parseResult.data.forEach(entry => {
            entry.value = this.convertCurrencyStringToNumber(entry.value)
        })
    }

    convertCurrencyStringToNumber(currencyString)
    {
        currencyString = currencyString.replace(".", "")
        currencyString = currencyString.replace(",", ".")
        currencyString = currencyString.replace(/[^0-9\.,-]+/g, "")
        return Number(currencyString);
    }

    // to override in specific class
    spliceAccountInfo(lines)
    {
        throw new TypeError("Must override method");
    }

    filterData(data)
    {
        return data; // optionally override method
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

    getParseResult()
    {
        return this._parseResult;
    }

    getCurrentAccountBalance()
    {
        return this._accountBalance
    }

    getCurrentAccountBalanceDate()
    {
        return this._accountBalanceDate
    }

    getAccountNumber()
    {
        return  this._accountNumber
    }
}

if (typeof module !== 'undefined')
    module.exports = CSV_File;