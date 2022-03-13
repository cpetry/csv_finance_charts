const Papa = require("../dependencies/papaparse.min.js");

//https://gist.github.com/mikaello/06a76bca33e5d79cdd80c162d7774e9c
const groupBy = keys => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = keys.map(key => obj[key]).join('-');
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

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

    categorizeContent(categories)
    {
        this._categorizedContent = {}

        this._parseResult.data.forEach(entry => 
        {
            let category = this.findCategoryForClient(entry.client.toLowerCase(), categories);
            if (!(category in this._categorizedContent))
                this._categorizedContent[category] = new Array();
            this._categorizedContent[category].push(entry);
        });

        return this._categorizedContent;
    }

    getCategorizedGroupedByMonth(categories)
    {
        this.categorizeContent(categories)
        this._categorizedSums = {}
        const groupByDate = groupBy(['date']);
        for (const [category, entries] of Object.entries(this._categorizedContent))
        {
            let filteredEntries = entries.map(entry => { return {date: this.stringToMonthYearString(entry.date), value: this.convertCurrencyStringToNumber(entry.value) }})
            let groupedEntries = groupByDate(filteredEntries)
            this._categorizedSums[category] = this.createSumsForGroups(groupedEntries)
            
        }
        return this._categorizedSums
    }

    createSumsForGroups(groupedEntries)
    {
        const groupDict = {}
        for (const [date, entries] of Object.entries(groupedEntries))
        {
            groupDict[date] = {} 
            groupDict[date].values = entries
            let sum = 0
            entries.forEach(entry => {
                sum += entry.value ?? 0
            })
            groupDict[date].sum = sum
        }
        return groupDict
    }

    stringToMonthYearString(dateString)
    {
        const regEx = /(\d{2})\.(\d{2})\.(\d{4})/;
        const [full, day, month, year] = regEx.exec(dateString);
        const monthYearString = month + "." + year
        return monthYearString;
    }

    findCategoryForClient(client, categories)
    {
        for (const [category, entries] of Object.entries(categories))
        {
            let found = Array.from(entries).some((entry) => client.indexOf(entry.toLowerCase()) !== -1);
            if (found)
                return category;
        }
        return;
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
        currencyString = currencyString.replace(",", ".")
        currencyString = currencyString.replace(/[^0-9\.,-]+/g, "")
        return Number(currencyString);
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