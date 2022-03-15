class CSV_Header
{
    static date = 'date';
    static client = 'client'
    static iban = 'iban'
    static value = 'value'
    static info = 'info'
    static account = 'account'
    static usageType = 'usage'
    static unknownType = 'undefined'
    static transfer = 'transfer'
    static type = 'type'
}

if (typeof module !== 'undefined')
    module.exports = CSV_Header;