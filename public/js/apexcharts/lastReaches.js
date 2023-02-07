var width = window.innerWidth;
var value = 4;

if(width >= 992) {
	value = 7;
}

var data1 = document.querySelector("#lastReaches .apexcharts").getAttribute("data-js-streams");
var data2 = document.querySelector("#lastReaches .apexcharts").getAttribute("data-js-downloads");
data1 = data1.split(";").slice(0, value).reverse();
data2 = data2.split(";").slice(0, value).reverse();

var date = new Date();
var attr = document.querySelector("body").getAttribute("data-month");
var months = [];

for (let i = 0; i < value; i++) {
	date.setMonth(attr - i - 1);

	months.push(date.toLocaleString('en-US', { month: 'short' }));
}

months = months.reverse();

if(data1.length < value) {
	var length = value - data1.length;

	for (let i = 0; i < length; i++) {
		data1.unshift('0')
	}
}

if(data2.length < value) {
	var length = value - data2.length;

	for (let i = 0; i < length; i++) {
		data2.unshift('0')
	}
}

var options = {
	chart: {
		height: 270,
		fontFamily: 'Poppins, sans-serif',
		type: "bar",
		toolbar: false,
		defaultLocale: 'en',
		offsetX: -15,
		width: "102%",
	},
	series: [
		{
			name: 'Streams',
			data: data1
		},
		{
			name: 'Downloads',
			data: data2
		}
	],
	dataLabels: {
		enabled: false
	},
	colors: ["#5d37fe", "#999ad3"],
	stroke: {
		curve: 'smooth',
		lineCap: "round",
		width: 4,
		colors: ['transparent']
	},
	plotOptions: {
		bar: {
			borderRadius: 3,
			horizontal: false,
			columnWidth: 45,
		},
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
		},
		axisTicks: {
			show: false
		},
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

var chart = new ApexCharts(document.querySelector("#lastReaches .apexcharts"), options);
chart.render();