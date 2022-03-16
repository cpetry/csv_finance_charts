class CFG_File
{
    constructor(data){
        this.parse(data);
    }

    parse(data)
    {
        var jsonData = JSON.parse(data);

        this._csv_files = [];
        for (const [key, value] of Object.entries(jsonData.csvFiles))
            this._csv_files.push({name: key, path: value});

        this._categories = [];
        this._categories = jsonData.categories
    }

    getCSVFileInfos()
    {
        return this._csv_files;
    }

    getCategories()
    {
        return this._categories;
    }
}

if (typeof module !== 'undefined')
    module.exports = CFG_File;