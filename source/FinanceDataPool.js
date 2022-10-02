const Helper = require("../source/Helper.js");

const ValueSign = Object.freeze({
    ALL: 1,
    POSITIVE : 2,
    NEGATIVE : 3,
    TOTAL : 4
});

const DateFilter = Object.freeze({
    NONE: 1,
    DAY : 2,
    MONTH : 3,
    YEAR : 4
});

class FinanceDataPool 
{
    constructor(){
        this._parseResult = []
        this._accountInfos = {}
        this._categorizedContent = {}
        this._dateSumList = []
    }

    Clear(){
        this._parseResult = []
        this._accountInfos = {}
        this._categorizedContent = {}
        this._dateSumList = []
    }

    Add(csv_file){
        this._parseResult = this._parseResult.concat(csv_file.getParseResult().data);
        this._parseResult = this._parseResult.filter(Helper.onlyUnique);

        let accountNumber = csv_file.getAccountNumber()
        var accountInfo = this._accountInfos[accountNumber];
        if (accountInfo === undefined)
            accountInfo = {}
        accountInfo.number = accountNumber;
        if (accountInfo.balanceDate === undefined || accountInfo.balanceDate < csv_file.getCurrentAccountBalanceDate())
        {
            accountInfo.balanceDate = csv_file.getCurrentAccountBalanceDate();
            accountInfo.balance = csv_file.getCurrentAccountBalance();
        }
        console.log(accountInfo);
        this._accountInfos[accountNumber] = accountInfo;
    }

    createDateSumList(dateFilter = DateFilter.NONE){
        this._dateSumList = []
        var sortedResult = this._parseResult.sort((a,b) => Helper.compareDateStrings(a.date, b.date))
        var currentSum = 0;
        sortedResult.forEach(entry => {
            currentSum += entry.value;
            this._dateSumList.push({ date: entry.date, value: currentSum });
        });
        return this._dateSumList;
    }

    getCategorizedGroupedByMonth(categories, sign = ValueSign.ALL, recreate = false, ignoredCategories = [])
    {
        if (Helper.isEmpty(this._categorizedContent) || recreate)
            this._categorizedContent = this.categorizeContent(categories, sign, ignoredCategories)
        

        let clientNames = []
        let categoryNames = []
        for (const [category, entries] of Object.entries(categories)){
            clientNames = clientNames.concat(entries);
            categoryNames.push(category)
        }

        categoryNames = categoryNames.sort()

        let categorizedSums = []
        const groupByDate = Helper.groupBy(['date']);
        for (const [category, entries] of Object.entries(this._categorizedContent))
        {
            var categorizedEntry = {}
            let filteredEntries = entries.filter((entry) => this.filterOnSign(entry, sign));
            let condensedEntries = filteredEntries.map(entry => this.condenseEntry(entry, sign, category, clientNames));
            let groupedEntries = groupByDate(condensedEntries)
            categorizedEntry.label = category
            if (sign == ValueSign.TOTAL)
                categorizedEntry.label = "total"
            categorizedEntry.data = this.createDateSumsForGroups(groupedEntries)
            var categoryIndex = categoryNames.indexOf(category)
            categorizedEntry.backgroundColor = Helper.getColorFromColorTable(categoryIndex)
            categorizedSums.push(categorizedEntry)
            
        }
        return categorizedSums
    }

    getDateLabels()
    {
        if (isEmpty(this._categorizedContent))
            this._categorizedContent = this.categorizeContent(categories)

        let dates = []
        this._parseResult.forEach(entry => {
            let date = Helper.stringToMonthYearString(entry.date);
            if (!dates.includes(date))
                dates.push(date)
        })

        dates = dates.sort(Helper.compareDateStrings)
        return dates
    }

    condenseEntry(entry, sign, category, clientNames){
        let date = Helper.stringToMonthYearString(entry.date);
        let value = entry.value;
        if (sign == ValueSign.NEGATIVE)
            value = Math.abs(entry.value)
        else if (sign == ValueSign.TOTAL)
            category = "total"

        let foundName = clientNames.find((name) => Helper.contains(entry.client, name));
        let clientName = foundName === undefined ? entry.client : foundName;
        return {date: date, value: value, client: clientName, usage: entry.usage, category: category }
    }
        
    filterOnSign(entry, sign){
        if (sign == ValueSign.ALL || sign == ValueSign.TOTAL)
            return true;
        else if(sign == ValueSign.POSITIVE)
            return entry.value > 0
        else if(sign == ValueSign.NEGATIVE)
            return entry.value < 0
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
        
        groupList = groupList.sort(Helper.compareGroupByDate)

        return groupList
    }

    findCategoryForClient(client, categories)
    {
        for (const [category, entries] of Object.entries(categories))
        {
            let found = Array.from(entries).some((entry) => Helper.contains(client, entry));
            if (found)
                return category;
        }
        return;
    }

    getTotalAccountBalance()
    {
        let sum = 0;
        for (const [accountNumber, accountInfo] of Object.entries(this._accountInfos))
        {
            if (accountInfo === undefined)
                continue;

            let balance = accountInfo.balance
            if (Number(balance))
                sum += balance;
        }
        return sum;
    }
}

if (typeof module !== 'undefined'){
    module.exports = FinanceDataPool;
}