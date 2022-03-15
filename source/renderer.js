const ctx = document.getElementById('myChart');
var cfgFile
window.electron.onConfigLoaded((data) => {
    console.log("Config data received")
    cfgFile = new CFG_File(data);
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
    dataOfCategory.values.forEach((entry) => details.push(entry.client + ': ' + entry.value + '\r'))

    return details;
}

window.electron.onCSVLoaded((data) => {
    console.log("CSV data received")
    let csvFile = new CSV_File_DKB(data);
    let financeDataPool = new FinanceDataPool();
    financeDataPool.Add(csvFile);
    
    let categories = cfgFile.getCategories()
    let categorizedSums = financeDataPool.getCategorizedGroupedByMonth(categories, ValueSign.NEGATIVE);

    

    let config = {
        type: 'bar',
        data: { datasets: 
            categorizedSums
        },
        options: {
            responsive: true,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            scales: {
                x: {
                    stacked: true,
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
                    afterTitle: toolTipSum,
                    label: toolTipContent
                  }
                }
            }
        }
    };
    console.log(config)
    let myChart = new Chart(ctx,
      config
    );
});