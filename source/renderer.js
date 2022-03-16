const ctx = document.getElementById('myChart');
var cfgFile
window.electron.onConfigLoaded((data) => {
    console.log("Config data received")
    cfgFile = new CFG_File(data);

    CreateChart();
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
    
    let categories = cfgFile.getCategories()
    let categorizedSums = _financeDataPool.getCategorizedGroupedByMonth(categories, ValueSign.NEGATIVE, recreate = true);
    let labels = _financeDataPool.getDateLabels()
    UpdateChart(categorizedSums, labels)
});


var _chart

const CreateChart = () => {
    let config = {
        type: 'bar',
        options: {
            responsive: true,
            interaction: {
                //intersect: false,
                mode: 'x'
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
            plugins: {
                tooltip: {
                  callbacks: {
                    afterTitle: toolTipSum
                    //label: toolTipContent
                  }
                }
            }
        }
    };
    _chart = new Chart(ctx, config);
}

const UpdateChart = (categorizedSums, labels) => {
    _chart.options.scales.x.labels = labels
    _chart.data.datasets = categorizedSums
    _chart.update();
}