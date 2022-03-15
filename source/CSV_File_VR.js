if (typeof require !== 'undefined'){
    CSV_File = require("../source/CSV_File.js");
    Papa = require("../dependencies/papaparse.min.js");
    CSV_Header = require("./CSV_Header.js");
}

class CSV_File_VR extends CSV_File
{
    constructor(data)
    {
        super();
        data = data.replace(/\"/g, '');
        this.parse(data);
    }

    spliceAccountInfo(lines)
    {
        // irrelavant start
        lines.splice(0,4)

        let accountInfo = lines.splice(0,3);
        lines.splice(0,5) // additionalInfo
        let balanceInfo = lines.splice(-3,3)
        accountInfo = accountInfo.concat(balanceInfo)
        return accountInfo;
    }

    parseAccountInfo(infoLines)
    {
        this._accountNumber = infoLines[0].split(';')[1]
        let balanceString = infoLines[5].split(';')[11]
        this._accountBalance = this.convertCurrencyStringToNumber(balanceString)
    }

    renameHeader(headerLine)
    {
        headerLine = headerLine.replace("Buchungstag", CSV_Header.date)
        headerLine = headerLine.replace("IBAN", CSV_Header.iban)
        headerLine = headerLine.replace("Vorgang/Verwendungszweck", CSV_Header.usageType)
        headerLine = headerLine.replace(new RegExp("Auftraggeber/Zahlungsempf.nger"), CSV_Header.client)
        headerLine = headerLine.replace("Umsatz", CSV_Header.value)
        return headerLine;
    }
}

if (typeof module !== 'undefined')
    module.exports = CSV_File_VR;