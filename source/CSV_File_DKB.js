class CSV_File_DKB extends CSV_File
{
    constructor(data)
    {
        super(data);
        this.parse(data);
    }

    spliceAccountInfo(lines)
    {
        return lines.splice(0,6)
    }

    parseAccountInfo(infoLines)
    {
        this._accountNumber = infoLines[0].split(';')[1]
        let balanceString = infoLines[4].split(';')[1]
        this._accountBalance = this.convertCurrencyStringToNumber(balanceString)
    }

    renameHeader(headerLine)
    {
        headerLine = headerLine.replace("Buchungstag", CSV_Header.date)
        headerLine = headerLine.replace("Kontonummer", CSV_Header.iban)
        headerLine = headerLine.replace("Verwendungszweck", CSV_Header.usageType)
        headerLine = headerLine.replace(new RegExp("Auftraggeber / Beg.nstigter"), CSV_Header.client)
        headerLine = headerLine.replace("Betrag (EUR)", CSV_Header.value)
        return headerLine;
    }
}