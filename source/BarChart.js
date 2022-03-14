
class BarChart
{
    constructor(){
        
    }

    setData(groupedCategories){
        this.data = {
        labels: labels,
        datasets: [{Gas: {
            '12.2017': { values: [Array], sum: -47.13 },
            '11.2017': { values: [Array], sum: -19.82 },
            '10.2017': { values: [Array], sum: -19.82 },
            '09.2017': { values: [Array], sum: -19.82 },
            '08.2017': { values: [Array], sum: -47.13 },
            '07.2017': { values: [Array], sum: -19.82 },
            '06.2017': { values: [Array], sum: -19.82 },
            '04.2017': { values: [Array], sum: -47.13 },
            '03.2017': { values: [Array], sum: -19.82 },
            '02.2017': { values: [Array], sum: -19.82 },
            '01.2017': { values: [Array], sum: -19.82 }
          },
          Orderings: {
            '12.2017': { values: [Array], sum: -88.91 },
            '11.2017': { values: [Array], sum: -63.11000000000001 },
            '10.2017': { values: [Array], sum: -69.34 },
            '09.2017': { values: [Array], sum: -74.94 },
            '08.2017': { values: [Array], sum: -108.73 },
            '07.2017': { values: [Array], sum: -63.11000000000001 },
            '06.2017': { values: [Array], sum: -77.33999999999999 },
            '05.2017': { values: [Array], sum: -94.76 },
            '04.2017': { values: [Array], sum: -95.14 },
            '03.2017': { values: [Array], sum: -63.11000000000001 },
            '02.2017': { values: [Array], sum: -69.34 },
            '01.2017': { values: [Array], sum: -83.71 }
          }
        }],
        };

        this.config = {
            type: 'bar',
            data: data,
            options: {
            plugins: {
                title: {
                display: true,
                text: 'Chart.js Bar Chart - Stacked'
                },
            },
            responsive: true,
            scales: {
                x: {
                stacked: true,
                },
                y: {
                stacked: true
                }
            }
            }
        };
    }
}