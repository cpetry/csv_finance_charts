//https://gist.github.com/mikaello/06a76bca33e5d79cdd80c162d7774e9c
const groupBy = keys => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = keys.map(key => obj[key]).join('-');
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

const ValueSign = Object.freeze({
    ALL: 1,
    POSITIVE : 2,
    NEGATIVE : 3
});

class FinanceDataPool 
{
    constructor(){
        this._parseResult = []
    }

    Add(csv_file){
        this._parseResult = this._parseResult.concat(csv_file.getParseResult().data);
    }

    getCategorizedGroupedByMonth(categories, sign = ValueSign.ALL, recreate = false)
    {
        if (this._categorizedContent == undefined || recreate)
            this._categorizedContent = this.categorizeContent(categories)
        

        let clientNames = []
        for (const [category, entries] of Object.entries(categories))
            clientNames = clientNames.concat(entries);

        let categorizedSums = []
        const groupByDate = groupBy(['date']);
        for (const [category, entries] of Object.entries(this._categorizedContent))
        {
            var categorizedEntry = {}
            let filteredEntries = entries.filter((entry) => filterOnSign(entry, sign));
            let condensedEntries = filteredEntries.map(entry => this.condenseEntry(entry, sign, clientNames));
            let groupedEntries = groupByDate(condensedEntries)
            categorizedEntry.label = category
            categorizedEntry.data = this.createDateSumsForGroups(groupedEntries)
            categorizedEntry.backgroundColor = this.getRandomColor(this.getHashcode(category))
            categorizedSums.push(categorizedEntry)
            
        }
        return categorizedSums
    }

    getDateLabels()
    {
        if (this._categorizedContent == undefined)
            this._categorizedContent = this.categorizeContent(categories)

        let dates = []
        this._parseResult.forEach(entry => {
            let date = this.stringToMonthYearString(entry.date);
            if (!dates.includes(date))
                dates.push(date)
        })

        dates = dates.sort(compareDateStrings)
        return dates
    }

    condenseEntry(entry, sign, clientNames){
        let date = this.stringToMonthYearString(entry.date);
        let value = entry.value;
        if (sign == ValueSign.NEGATIVE)
            value = Math.abs(entry.value)

        let foundName = clientNames.find((name) => this.contains(entry.client, name));
        let clientName = foundName === undefined ? entry.client : foundName;
        return {date: date, value: value, client: clientName, usage: entry.usage }
    }

    contains(a, b){
        return a.toLowerCase().indexOf(b.toLowerCase()) !== -1;
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
        let groupList = []
        for (const [date, entries] of Object.entries(groupedEntries))
        {
            let dateEntry = {} 
            dateEntry.date = date
            let sum = 0
            entries.forEach(entry => {
                sum += entry.value === undefined ? 0 : entry.value
            })
            dateEntry.sum = sum
            dateEntry.values = entries
            groupList.push(dateEntry)
        }
        
        groupList = groupList.sort(compareGroupByDate)

        return groupList
    }

    getRandomColor(number){
        const hue = number * 137.508; // use golden angle approximation
        return `hsl(${hue},85%,85%)`;
    }
    
    getHashcode(str, seed = 0) {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
        h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1>>>0);
    };

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
            let found = Array.from(entries).some((entry) => this.contains(client, entry));
            if (found)
                return category;
        }
        return;
    }
}


      
    
const filterOnSign = (entry, sign) => {
    if (sign == ValueSign.ALL)
        return true;
    else if(sign == ValueSign.POSITIVE)
        return entry.value > 0
    else if(sign == ValueSign.NEGATIVE)
        return entry.value < 0
}

const compareGroupByDate = (a, b) => {
    return compareDateStrings(a.date,b.date)
}

const compareDateStrings = (a, b) => {
    let aYear = a.substring(3)
    let bYear = b.substring(3)
    if (aYear > bYear) {
      return 1;
    }
    else if (aYear < bYear) {
      return -1;
    }
    else{
        let aMonth = a.substring(0,2);
        let bMonth = b.substring(0,2);
        return aYear > bYear ? 1 : -1
    }
  }

if (typeof module !== 'undefined')
    module.exports = FinanceDataPool;