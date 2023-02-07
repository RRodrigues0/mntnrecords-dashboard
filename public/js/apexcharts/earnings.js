var width = window.innerWidth;
var value = 4;

if(width >= 992) {
	value = 7;
}

var data = document.querySelector("#earnings .apexcharts").getAttribute("data-js");
data = data.split(";").slice(0, value).reverse();

var date = new Date();
var attr = document.querySelector("body").getAttribute("data-month");
var months = [];

for (let i = 0; i < value; i++) {
	date.setMonth(attr - i - 1);

	months.push(date.toLocaleString('en-US', { month: 'short' }));
}

months = months.reverse();

if(data.length < value) {
	var length = value - data.length;

	for (let i = 0; i < length; i++) {
		data.unshift('0')
	}
}

var options = {
	chart: {
		height: 270,
		width: "105%",
		fontFamily: 'Poppins, sans-serif',
		type: "line",
		toolbar: false,
		defaultLocale: 'en',
		offsetX: -15,
	},
	series: [
		{
			name: 'series1',
			data: data
		}
	],
	dataLabels: {
		enabled: false
	},
	colors: ["#5d37fe"],
	stroke: {
		curve: 'smooth',
		lineCap: "round",
		width: 5
	},
	grid: {
		borderColor: '#f7f8fd',
	},
	xaxis: {
		categories: months,
		labels: {
			style: {
				colors: "#9394a6",
			}
		}
	},
	yaxis: {
		tickAmount: 3,
		labels: {
			style: {
				colors: "#9394a6",
			}
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
					height: 230,
				}
			}
		}
	]
};

var chart = new ApexCharts(document.querySelector("#earnings .apexcharts"), options);
chart.render();