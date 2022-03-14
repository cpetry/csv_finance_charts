class CFG_File
{
    constructor(data){
        this.parse(data);
    }

    parse(data)
    {
        var jsonData = JSON.parse(data);
        this._csv_files = [];
        this._categories = [];
        for (var i in jsonData.csvFiles)
        {
            var csv = jsonData.csvFiles[i];
            this._csv_files.push({name: csv[0], path: csv[1]});
        }

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