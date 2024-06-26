import { Chart, TimeScale } from "chart.js/auto";
import 'chartjs-adapter-moment'
import 'chartjs-plugin-streaming'

Chart.register(TimeScale)

export default function records() {

const chart = new Chart(document.getElementById('sensorChart'), {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: 'red',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    pointRadius: 3,
                },
                {
                    label: 'Humidity (%)',
                    data: [],
                    borderColor: 'blue',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    pointRadius: 3,
                },
                {
                    label: 'Light (Lux)',
                    data: [],
                    borderColor: 'green',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    pointRadius: 3,
                },
            ]
        },
        options: {
            responsive: true,
            // maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20
                  }
            },
            scales: {
                x: {
                    type: 'time',
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    // type: 'time',
                    ticks: {
                        suggestedMin: 0, // Set minimum for all y-axes
                    }
                }
            }
        },
        plugins: {
            streaming: {
                options: {
                    duration: 20000, // Display 10 seconds of data (adjust as needed)
                }
            }
        }
    });

const wateredChart = new Chart(document.getElementById('wateredChart'), {
    type: 'doughnut',
    data: {
      labels: ['Watered', 'Dry'],
      datasets: [{
        label: 'Soil Moisture',
        data: [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.2)', // Light blue for watered
          'rgba(255, 99, 132, 0.2)'  // Light red for dry
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)', // Blue for watered
          'rgba(255, 99, 132, 1)'  // Red for dry
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
            'rgba(54, 162, 235, 1)', // Blue for watered
            'rgba(255, 99, 132, 1)'  // Red for dry
        ]

      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false // Allow for different heights
    }
  });


const MAX_ENTRIES = 20; // Define the maximum number of entries to display
let wateredCounter = 0;
let dryCounter = 0;

const fetchData = async () => {
    try {
        const response = await fetch('http://localhost:6969/sensor/info', {
        method: 'POST'
        });
        const data = await response.json();
        const timestamp = new Date().getTime();

        let wateredChartData = wateredChart.data.datasets[0];

        // console.log(wateredChartData);

        if(data.soil == 1){
            wateredCounter++
        } else {
            dryCounter++
        }

        console.log(data.soil)
    
        // Logic containing for the plant state
        wateredChartData.data = [wateredCounter, dryCounter];
        console.log(wateredChartData.data)

        // Limit data before pushing to chart
        chart.data.datasets[0].data = chart.data.datasets[0].data.slice(-MAX_ENTRIES).concat({ x: timestamp, y: data.temperature });
        chart.data.datasets[1].data = chart.data.datasets[1].data.slice(-MAX_ENTRIES).concat({ x: timestamp, y: data.humidity });
        chart.data.datasets[2].data = chart.data.datasets[2].data.slice(-MAX_ENTRIES).concat({ x: timestamp, y: data.light });

        chart.update();
        wateredChart.update();

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        setTimeout(fetchData, 2000);
    }
    }

    fetchData();

    const resizeChart = () => {
            document.addEventListener('DOMContentLoaded', () => {
                const chartCanvas = document.getElementById('sensorChart');

                // Set the canvas width and height based on container width and aspect ratio
                chartCanvas.width = 601;
                chartCanvas.height = 301;
                console.log(chartCanvas.height)
            
                chart.update();
            });
        };
        
        resizeChart();
        
        // Add an event listener for window resize to update the chart on window resize
        window.addEventListener('resize', resizeChart);  
    }