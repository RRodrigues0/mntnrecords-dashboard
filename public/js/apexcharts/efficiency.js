var data = document.querySelector("#efficiency .apexcharts").getAttribute("data-js");
data = data.split(";").slice(0, 2).reverse();

if(data.length < 2) {
	var length = 2 - data.length;

	for (let i = 0; i < length; i++) {
		data.unshift(0)
	}
}

var before = data[0];
var now = data[1];
var percent = 0;

if(before !== 0 && now !== 0) {
	percent = (1 - (before / now)) * 100;
} else {
	percent = 0;
}

var data1 = percent;
var data2 = 100 - percent;

var options = {
	chart: {
		height: 270,
		fontFamily: 'Poppins, sans-serif',
		type: 'donut',
		toolbar: false,
		defaultLocale: 'en',
		offsetX: -8,
	},
	series: [data1,data2],
	dataLabels: {
		enabled: false
	},
	labels: ['This month', 'Last month'],
	stroke: {
		width: 0,
		lineCap: 'round'
	},
	colors: ["#5d37fe", "#999ad3"],
	plotOptions: {
		pie: {
			donut: {
				size: '90%',
				labels: {
					show: true,
					name: {
						fontSize: '0.938rem',
						offsetY: 20,
					},
					value: {
						show: true,
						fontSize: '1.625rem',
						fontWeight: '500',
						offsetY: -20,
					},
					total: {
						show: true,
						label: "Growth",

						formatter: function () {
								return ((Math.round(percent).toString()).slice(0, 2) + "%");
						}
					}
				}
			}
		}
	},
	legend: {
		show: true,
		position: 'bottom',
		horizontalAlign: 'center',
		offsetX: 0,
		offsetY: -15,
		markers: {
			radius: 2,
		},
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

var chart = new ApexCharts(document.querySelector("#efficiency .apexcharts"), options);
chart.render();