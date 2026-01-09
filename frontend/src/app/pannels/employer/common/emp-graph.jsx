import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";

function EmployerDashboardJobFunnelChart({ stats = {} }) {
	const chartData = {
		labels: [
			"Jobs Posted",
			"Applications",
			"Shortlisted",
			"Interviewed",
			"Selected",
		],
		datasets: [
			{
				label: "Candidate Flow",
				data: [stats.totalJobs || 0, stats.totalApplications || 0, stats.shortlisted || 0, Math.floor((stats.shortlisted || 0) * 0.5), Math.floor((stats.shortlisted || 0) * 0.2)],
				backgroundColor: (context) => {
					const chart = context.chart;
					const { ctx, chartArea } = chart;
					if (!chartArea) return;

					const gradient = ctx.createLinearGradient(
						0,
						chartArea.bottom,
						0,
						chartArea.top
					);
					gradient.addColorStop(0, "#fceabb");
					gradient.addColorStop(1, "#f8b500");
					return gradient;
				},
				borderRadius: 12,
				barThickness: 40,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				backgroundColor: "#333",
				titleColor: "#fff",
				bodyColor: "#fff",
				padding: 10,
				cornerRadius: 6,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: {
					stepSize: 50,
				},
				grid: {
					color: "#f0f0f0",
				},
			},
			x: {
				grid: {
					display: false,
				},
			},
		},
	};

	return (
		<div className="panel panel-default site-bg-white">
			<div className="panel-heading wt-panel-heading p-a20">
				<h4 className="panel-tittle m-a0">
					<i className="fas fa-briefcase" /> Job Funnel Overview
				</h4>
			</div>

			<div className="panel-body wt-panel-body twm-pro-view-chart ">
				<Bar data={chartData} options={chartOptions} />
			</div>
		</div>
	);
}

export default EmployerDashboardJobFunnelChart;
