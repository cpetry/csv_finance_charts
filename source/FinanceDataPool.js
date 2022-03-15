//https://gist.github.com/mikaello/06a76bca33e5d79cdd80c162d7774e9c
const groupBy = keys => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = keys.map(key => obj[key]).join('-');
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

class FinanceDataPool 
{
    constructor(){
        this._parseResult = []
    }

    Add(csv_file){
        this._parseResult = this._parseResult.concat(csv_file.getParseResult().data);
    }

    getCategorizedGroupedByMonth(categories)
    {
        let categorizedContent = this.categorizeContent(categories)
        this._categorizedSums = []
        const groupByDate = groupBy(['date']);
        for (const [category, entries] of Object.entries(categorizedContent))
        {
            var categorizedEntry = {}
            let filteredEntries = entries.map(entry => { return {date: this.stringToMonthYearString(entry.date), value: entry.value }})
            let groupedEntries = groupByDate(filteredEntries)
            categorizedEntry.label = category
            categorizedEntry.data = this.createDateSumsForGroups(groupedEntries)
            this._categorizedSums.push(categorizedEntry)
            
        }
        return this._categorizedSums
    }

    categorizeContent(categories)
    {
        let categorizedContent = {}

        this._parseResult.forEach(entry => 
        {
            let category = this.findCategoryForClient(entry.client.toLowerCase(), categories);
            if (!(category in categorizedContent))
                categorizedContent[category] = new Array();
            categorizedContent[category].push(entry);
        });

        return categorizedContent;
    }

    createDateSumsForGroups(groupedEntries)
    {
        const groupDict = []
        for (const [date, entries] of Object.entries(groupedEntries))
        {
            let dateEntry = {} 
            dateEntry.date = date
            let sum = 0
            entries.forEach(entry => {
                sum += entry.value ?? 0
            })
            dateEntry.sum = sum
            dateEntry.values = entries
            groupDict.push(dateEntry)
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
}

if (typeof module !== 'undefined')
    module.exports = FinanceDataPool;