var width = window.innerWidth;
var value = 4;

if(width >= 992) {
	value = 7;
	apexChartsTotal();
} else {
	window.addEventListener("load", function () {
		apexChartsTotal();
	});
}



function apexChartsTotal() {
	var data = document.querySelector("#total .apexcharts").getAttribute("data-js");
	data = data.split(";").slice(0, value).reverse();

	if(data.length < value) {
		var length = value - data.length;

		for (let i = 0; i < length; i++) {
			data.unshift('0')
		}
	}

	var date = new Date();
	var attr = document.querySelector("body").getAttribute("data-month");
	var months = [];

	for (let i = 0; i < value; i++) {
		date.setMonth(attr - i - 1);

		months.push(date.toLocaleString('en-US', { month: 'short' }));
	}

	months = months.reverse();

	var options = {
		chart: {
			height: 140,
			width: "115%",
			offsetX: -15,
			fontFamily: 'Poppins, sans-serif',
			type: "bar",
			toolbar: false,
			defaultLocale: 'en',
		},
		series: [
			{
				name: 'Streams',
				data: data
			}
		],
		dataLabels: {
			enabled: false
		},
		colors: ["#5d37fe"],
		legend: {
			show: false
		},
		plotOptions: {
			bar: {
				barHeight: '100%',
				columnWidth: 25,
				startingShape: 'rounded',
				endingShape: 'rounded',
				borderRadius: 3.5,
				distributed: true,
				colors: {
					backgroundBarColors: [
						"#eaeaf4",
					],
					backgroundBarRadius: 3.5
				}
			}
		},
		grid: {
			borderColor: '#f7f8fd',
			padding: {
				bottom: -15
			}
		},
		xaxis: {
			categories: months,
			labels: {
				style: {
					colors: "#9394a6",
				}
			},
			axisTicks: {
				show: false
			},
		},
		yaxis: {
			tickAmount: 3,
			labels: {
				show: false
			}
		},
		tooltip: {
			enabled: false
		},
		responsive: [
			{
				breakpoint: 1950,
				options: {
					chart: {
						height: 110,
					}
				},
				breakpoint: 1399,
				options: {
					chart: {
						width: "103%",
					}
				}
			}
		]
	};

	var chart = new ApexCharts(document.querySelector("#total .apexcharts"), options);
	chart.render();
}
