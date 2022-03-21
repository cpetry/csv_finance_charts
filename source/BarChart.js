class BarChart
{
    constructor()
    {

        this._lastClickTime = performance.now()
        let config = {
            type: 'bar',
            options: {
                maintainAspectRatio: false,
                responsive: true,
                interaction: {
                    //intersect: false,
                    mode: 'x'
                },
                animation: {
                    duration: 800,
                },
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true
                    }
                },
                parsing: {
                    xAxisKey: 'date',
                    yAxisKey: 'sum'
                },
                
                events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],

                onClick: (event, clickedElements) => this.ChartClickHandler(event, clickedElements),

                plugins: {
                    tooltip: {
                    callbacks: {
                        afterTitle: this.ToolTipSum
                        //label: toolTipContent
                    }
                    },
                    legend: {
                        onClick: this.NewLegendClickHandler,
                        labels: {
                            filter: this.LegendFilter,
                            sort: this.LegendSorting
                        }
                    }
                }
            }
        };
        this._chartCtx = document.getElementById('myChart');
        this._chart = new Chart(this._chartCtx, config);
        this._defaultLegendClickHandler = Chart.defaults.plugins.legend.onClick;
    }

    AddListenerOnSelection(action)
    {
        this._onSelectionChanged = action;
    }

    UpdateChart(financeDataPool, valueSign)
    {
        this._valueSign = valueSign;
        let categories = _cfgFile.getCategories()
        
        let ignoredCategories = []
        if (valueSign == ValueSign.TOTAL)
            ignoredCategories = ["Hausbau"]

        let categorizedSums = financeDataPool.getCategorizedGroupedByMonth(categories, valueSign, /*recreate*/ true, ignoredCategories = ignoredCategories);
        let labels = financeDataPool.getDateLabels()

        this._chart.options.scales.x.labels = labels
        this._chart.data.datasets = categorizedSums
        this._chart.update();
    }

    ChangeHoverOption(option)
    {
        let mode = ""
        switch(option){
            case "single":
                this._chart.options.interaction.intersect = true
                this._chart.options.interaction.mode = "nearest"
                break;
            case "bar":
            default:
                this._chart.options.interaction.intersect = true
                this._chart.options.interaction.mode = "x"
                break;
        }
        this._chart.update();
    }

    ToolTipSum(tooltipItems)
    {
        let sum = 0;    
        tooltipItems.forEach(function(tooltipItem) {
            sum += tooltipItem.parsed.y;
        });

        // round to two decimals
        sum = Math.round((sum + Number.EPSILON) * 100) / 100
        return 'Sum: ' + sum;
    };

    ToolTipContent(tooltipItems)
    {
        let label = tooltipItems.dataset.label;
        let dataOfCategory = tooltipItems.dataset.data[tooltipItems.dataIndex]

        sum = dataOfCategory.sum
        sum = Math.round((sum + Number.EPSILON) * 100) / 100
        let details = []
        details.push(label + ':')

        // sort detail info descending by value
        dataList = dataOfCategory.values
        dataList = dataList.sort(function(a, b) {
            return -(a.value - b.value);
        });
        dataList.forEach((entry) => details.push(entry.client + ': ' + entry.value + '\r'))

        return details;
    }

    ChartClickHandler(event, clickedElements)
    {
        if (clickedElements.length === 0) return

        const index = clickedElements[0].index;
        const datasetIndex = clickedElements[0].datasetIndex;

        let tableData = []
        if (this._chart.options.interaction.mode == 'x')
        {
            let filterDate = this._chart.data.datasets[datasetIndex].data[index].date;
            if (this._valueSign == ValueSign.TOTAL)
                tableData = this.GetTableDataFromMultipleDatasets(filterDate, /*onlySums*/ true)
            else
                tableData = this.GetTableDataFromMultipleDatasets(filterDate, /*onlySums*/ false)
        }
        else 
        {
            
            if (this._valueSign == ValueSign.TOTAL)
                tableData = this._chart.data.datasets[datasetIndex].data[index]
            else
                tableData = this._chart.data.datasets[datasetIndex].data[index].values
        }

        if(this._onSelectionChanged != undefined)
            this._onSelectionChanged(tableData);
    }
    
    GetTableDataFromMultipleDatasets(filterDate, onlySums)
    {
        let tableData = []
        for(var i=0; i<this._chart.data.datasets.length; i++) {
            let isVisible = this._chart.isDatasetVisible(i)
            if (!isVisible)
                continue;

            let dataset = this._chart.data.datasets[i]
            let categoryData = dataset.data.find((data) => data.date == filterDate);
            if (categoryData == undefined)
                continue

            let values = []
            if (onlySums)
                values = categoryData
            else
                values = categoryData.values.filter(x => x != undefined)
            tableData = tableData.concat(values)
        }
        return tableData
    }

    GetLatestTableData()
    {
        return this._tableData
    }

    NewLegendClickHandler(event, legendItem, legend) 
    {
        let now = performance.now()
        let doubleClicked = false
        if (now - this._lastClickTime < 200)
            doubleClicked = true
        this._lastClickTime = performance.now()
        
        const clickedIndex = legendItem.datasetIndex;

        if (!doubleClicked) {
            Chart.defaults.plugins.legend.onClick(event, legendItem, legend);
        } else {
            const ci = legend.chart;

            var allOthersAreInvisible = true
            for (var i=0; i < legend.legendItems.length; i++)
            {
                if (i != clickedIndex && ci.isDatasetVisible(i)){
                    allOthersAreInvisible = false
                    break;
                }
            }

            for (var i=0; i < legend.legendItems.length; i++){
                if (allOthersAreInvisible){
                    ci.show(i);
                    legendItem.hidden = false;
                } else {
                    ci.hide(i);
                    legendItem.hidden = true;
                }
            }

            ci.show(clickedIndex);
            legendItem.hidden = false;
        }
    }

    
    LegendSorting(legendItemA, legendItemB, data)
    {
        if (legendItemA.text > legendItemB.text)
            return 1
        else if (legendItemA.text < legendItemB.text)
            return -1
        else
            return 0;
    }

    LegendFilter(legendItem, data)
    {
        var categoryIndex = legendItem.datasetIndex
        var dataOfCategory = data.datasets[categoryIndex].data
        return dataOfCategory.length > 0
    }

    Reset()
    {
        if(this._chart instanceof Chart)
            this._chart.destroy();
    }
}