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
    NEGATIVE : 3,
    TOTAL : 4
});

class FinanceDataPool 
{
    constructor(){
        this._parseResult = []
    }

    Clear(){
        this._parseResult = []
    }

    Add(csv_file){
        this._parseResult = this._parseResult.concat(csv_file.getParseResult().data);
        this._parseResult = this._parseResult.filter(onlyUnique);
    }

    getCategorizedGroupedByMonth(categories, sign = ValueSign.ALL, recreate = false, ignoredCategories = [])
    {
        if (this._categorizedContent == undefined || recreate)
            this._categorizedContent = this.categorizeContent(categories, sign, ignoredCategories)
        

        let clientNames = []
        let categoryNames = []
        for (const [category, entries] of Object.entries(categories)){
            clientNames = clientNames.concat(entries);
            categoryNames.push(category)
        }

        categoryNames = categoryNames.sort()

        let categorizedSums = []
        const groupByDate = groupBy(['date']);
        for (const [category, entries] of Object.entries(this._categorizedContent))
        {
            var categorizedEntry = {}
            let filteredEntries = entries.filter((entry) => filterOnSign(entry, sign));
            let condensedEntries = filteredEntries.map(entry => this.condenseEntry(entry, sign, category, clientNames));
            let groupedEntries = groupByDate(condensedEntries)
            categorizedEntry.label = category
            if (sign == ValueSign.TOTAL)
                categorizedEntry.label = "total"
            categorizedEntry.data = this.createDateSumsForGroups(groupedEntries)
            var categoryIndex = categoryNames.indexOf(category)
            categorizedEntry.backgroundColor = this.getColorFromColorTable(categoryIndex)
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

    condenseEntry(entry, sign, category, clientNames){
        let date = this.stringToMonthYearString(entry.date);
        let value = entry.value;
        if (sign == ValueSign.NEGATIVE)
            value = Math.abs(entry.value)
        else if (sign == ValueSign.TOTAL)
            category = "total"

        let foundName = clientNames.find((name) => this.contains(entry.client, name));
        let clientName = foundName === undefined ? entry.client : foundName;
        return {date: date, value: value, client: clientName, usage: entry.usage, category: category }
    }

    contains(a, b){
        return a.toLowerCase().indexOf(b.toLowerCase()) !== -1;
    }

    categorizeContent(categories, sign, ignoredCategories = [])
    {
        let categorizedContent = {}

        this._parseResult.forEach(entry => 
        {
            let category = this.findCategoryForClient(entry.client.toLowerCase(), categories);
            
            if (sign == ValueSign.TOTAL)
            {
                if (ignoredCategories.includes(category))
                    return;
                category = "total"
            }

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
            let sum = 0
            entries.forEach(entry => {
                sum += entry.value === undefined ? 0 : entry.value
            })
            let dateEntry = { 
                date: date, 
                sum: sum, 
                values: entries
            }
            groupList.push(dateEntry)
        }
        
        groupList = groupList.sort(compareGroupByDate)

        return groupList
    }

    getRandomColor(number){
        const hue = number * 137.508; // use golden angle approximation
        return `hsl(${hue},85%,85%)`;
    }

    // to create color palettes : http://vrl.cs.brown.edu/color // awesome!!!
    getColorFromColorTable(number){
        const colorTable = ["#cefa6e", "#aef375", "#8feb7d",  "#6ee386", "#48da8e", "#00d097", "#00c69e", "#00bca4", "#00b1a9", "#00a6ac", "#009bac", "#008fab", "#0084a8", "#0078a2",
            "#006d9b",
            "#006191",
            "#005687",
            "#074a7a",
            "#1f406d",
            "#28355f"
            ]
        return colorTable[number % colorTable.length]
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


    

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}  
    
const filterOnSign = (entry, sign) => {
    if (sign == ValueSign.ALL || sign == ValueSign.TOTAL)
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