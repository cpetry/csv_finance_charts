class LineChart
{
    constructor(cfgFile)
    {
        let config = {
            type: 'line'
        };
        this._chartCtx = document.getElementById('lineChart');
        this._chart = new Chart(this._chartCtx, config);
        this._defaultLegendClickHandler = Chart.defaults.plugins.legend.onClick;
        this._cfgFile = cfgFile;
        this._excludedCategories = []
    }

    UpdateChart(financeDataPool)
    {
        let categories = this._cfgFile.getCategories()
        
        let categorizedSums = financeDataPool.getCategorizedGroupedByMonth(categories, /*recreate*/ true, this._excludedCategories);
        let labels = financeDataPool.getDateLabels()

        this._chart.data.datasets = categorizedSums
        this._chart.update();
    }
}