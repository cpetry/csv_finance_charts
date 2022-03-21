const ctx = document.getElementById('myChart');
var _cfgFile
window.electron.onConfigLoaded((data) => {
    console.log("Config data received")
    _cfgFile = new CFG_File(data);

    CreateChart();
    CreateTable();
});

const buttonReload = document.getElementById('buttonReload')
buttonReload.addEventListener('click', () => {
    if(_chart instanceof Chart)
        _chart.destroy();
    if (_financeDataPool !== undefined)
        _financeDataPool.Clear();
    window.electron.onReload()
});

const selectHover = document.getElementById('selectHover')
selectHover.addEventListener('change', () => {
    console.log(selectHover.value)
    ChangeHoverOption(selectHover.value)
});

const selectFilter = document.getElementById('selectFilter')
selectFilter.addEventListener('change', () => {
    UpdateChart();
});


const toolTipSum = (tooltipItems) => {
    let sum = 0;    
    tooltipItems.forEach(function(tooltipItem) {
        sum += tooltipItem.parsed.y;
    });

    // round to two decimals
    sum = Math.round((sum + Number.EPSILON) * 100) / 100
    return 'Sum: ' + sum;
};

const toolTipContent = (tooltipItems) => {
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


_financeDataPool = new FinanceDataPool();

window.electron.onCSVLoaded((data) => {
    console.log("CSV data received")
    let csvFile = new CSV_File_DKB(data);
    _financeDataPool.Add(csvFile);
    
    UpdateChart();
});


var _chart

var lastClickTime = performance.now()

const CreateChart = () => {
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

            onClick(event, clickedElements) {
                chartClickHandler(event, clickedElements)
            },
            plugins: {
                tooltip: {
                  callbacks: {
                    afterTitle: toolTipSum
                    //label: toolTipContent
                  }
                },
                legend: {
                    onClick: newLegendClickHandler,
                    labels: {
                        filter: legendFilter,
                        sort: legendSorting
                    }
                }
            }
        }
    };
    _chart = new Chart(ctx, config);
}

const defaultLegendClickHandler = Chart.defaults.plugins.legend.onClick;

const newLegendClickHandler = function (event, legendItem, legend) {
    let now = performance.now()
    let doubleClicked = false
    if (now - lastClickTime < 200)
        doubleClicked = true
    lastClickTime = performance.now()
    
    const clickedIndex = legendItem.datasetIndex;

    if (!doubleClicked) {
        defaultLegendClickHandler(event, legendItem, legend);
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

const legendSorting = function(legendItemA, legendItemB, data){
    if (legendItemA.text > legendItemB.text)
        return 1
    else if (legendItemA.text < legendItemB.text)
        return -1
    else
        return 0;
}

const legendFilter = function(legendItem, data){
    var categoryIndex = legendItem.datasetIndex
    var dataOfCategory = data.datasets[categoryIndex].data
    return dataOfCategory.length > 0
}

const chartClickHandler = function(event, clickedElements){
    if (clickedElements.length === 0) return

    const index = clickedElements[0].index;

    let tableData = []
    if (_chart.options.interaction.mode == 'x')
    {
        let filterDate = _chart.data.datasets[0].data[index].date;
        if (selectFilter.value == "total")
            tableData = GetTableDataFromMultipleDatasets(filterDate, onlySums = true)
        else
            tableData = GetTableDataFromMultipleDatasets(filterDate, onlySums = false)
    }
    else 
    {
        const datasetIndex = clickedElements[0].datasetIndex;
        
        if (selectFilter.value == "total")
            tableData = _chart.data.datasets[datasetIndex].data[index]
        else
            tableData = _chart.data.datasets[datasetIndex].data[index].values
    }


    UpdateTable(tableData)
}

const GetTableDataFromMultipleDatasets = (filterDate, onlySums) => 
{
    let tableData = []
    for(var i=0; i<_chart.data.datasets.length; i++) {
        let isVisible = _chart.isDatasetVisible(i)
        if (!isVisible)
            continue;

        let dataset = _chart.data.datasets[i]
        let categoryData = dataset.data.find((data) => data.date == filterDate);
        if (categoryData == undefined)
            continue

        if (onlySums)
            values = categoryData
        else
            values = categoryData.values.filter(x => x != undefined)
        tableData = tableData.concat(values)
    }
    return tableData
}

const ChangeHoverOption = (option) => {
    let mode = ""
    switch(option){
        case "single":
            _chart.options.interaction.intersect = true
            _chart.options.interaction.mode = "nearest"
            break;
        case "bar":
        default:
            _chart.options.interaction.intersect = true
            _chart.options.interaction.mode = "x"
            break;
    }
    _chart.update();
}

const UpdateChart = () => {
    let categories = _cfgFile.getCategories()
    let valueSign = ValueSign.NEGATIVE;
    switch(selectFilter.value){
        case "expenses" : 
            valueSign = ValueSign.NEGATIVE;
            break;
        case "income" : 
            valueSign = ValueSign.POSITIVE;
            break;
        case "all" : 
            valueSign = ValueSign.ALL;
            break;
        case "total" : 
            valueSign = ValueSign.TOTAL;
            break;
    }

    let ignoredCategories = []
    if (valueSign == ValueSign.TOTAL)
        ignoredCategories = ["Hausbau"]

    let categorizedSums = _financeDataPool.getCategorizedGroupedByMonth(categories, valueSign, recreate = true, ignoredCategories = ignoredCategories);
    let labels = _financeDataPool.getDateLabels()

    _chart.options.scales.x.labels = labels
    _chart.data.datasets = categorizedSums
    _chart.update();
}

var _table
const CreateTable = () => {
    _table = new Tabulator("#detailsTable", {
        minHeight: 10,
        maxHeight: 500,
        layout:"fitDataStretch",
        autoColumns:true
   });
}

const UpdateTable = (barData) => {
    _table.setData(barData) //assign data to table
}