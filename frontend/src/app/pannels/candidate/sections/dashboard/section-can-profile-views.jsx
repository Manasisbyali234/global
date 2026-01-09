// import Chart from "chart.js/auto";
// import { CategoryScale } from "chart.js";
// import { Line } from "react-chartjs-2";
// Chart.register(CategoryScale);

// function SectionCandidateProfileViews() {

//     const chartData = {
//         labels: ['January', 'February', 'March', 'April', 'May', 'June'],
//         datasets: [{
//             label: 'Viewers',
//             data: [200, 250, 350, 200, 250, 150],
//             pointHoverBorderColor: '#1967d2',
//             pointBorderWidth: 10,
//             pointHoverBorderWidth: 3,
//             pointHitRadius: 20,
//             borderWidth: 3,
//             borderColor: '#1967d2',
//             pointBackgroundColor: 'rgba(255, 255, 255, 0)',
//             pointHoverBackgroundColor: 'rgba(255, 255, 255, 1)',
//             pointBorderColor: 'rgba(66, 133, 244, 0)',
//             cubicInterpolationMode: 'monotone',
//             fill: true,
//             backgroundColor: 'rgba(212, 230, 255, 0.2)',
//         }]
//     }

//     return (
//         <>
//             <div className="panel panel-default site-bg-white">
//                 <div className="panel-heading wt-panel-heading p-a20">
//                     <h4 className="panel-tittle m-a0"><i className="far fa-chart-bar" />Your Profile Views</h4>
//                 </div>
//                 <div className="panel-body wt-panel-body twm-pro-view-chart">
//                     <Line data={chartData} />
//                 </div>
//             </div>
//         </>
//     )
// }

// export default SectionCandidateProfileViews;

// import Chart from "chart.js/auto";
// import { Bar } from "react-chartjs-2";

// function SectionCandidateProfileViews() {
// 	const chartData = {
// 		labels: ["Applied", "Shortlisted", "Interviewed", "Selected"],
// 		datasets: [
// 			{
// 				label: "Candidates",
// 				data: [150, 90, 45, 15],
// 				backgroundColor: (context) => {
// 					const chart = context.chart;
// 					const { ctx, chartArea } = chart;

// 					if (!chartArea) return;

// 					const gradient = ctx.createLinearGradient(
// 						0,
// 						chartArea.bottom,
// 						0,
// 						chartArea.top
// 					);
// 					gradient.addColorStop(0, "#e3f2fd");
// 					gradient.addColorStop(1, "#1976d2");

// 					return gradient;
// 				},
// 				borderRadius: 8,
// 				barThickness: 40,
// 			},
// 		],
// 	};

// 	const chartOptions = {
// 		responsive: true,
// 		plugins: {
// 			legend: {
// 				display: false,
// 			},
// 			tooltip: {
// 				backgroundColor: "#333",
// 				titleColor: "#fff",
// 				bodyColor: "#fff",
// 				cornerRadius: 6,
// 				padding: 10,
// 			},
// 		},
// 		scales: {
// 			y: {
// 				beginAtZero: true,
// 				ticks: {
// 					stepSize: 30,
// 				},
// 				grid: {
// 					color: "#f0f0f0",
// 				},
// 			},
// 			x: {
// 				grid: {
// 					display: false,
// 				},
// 			},
// 		},
// 	};

// 	return (
// 		<div className="panel panel-default site-bg-white">
// 			<div className="panel-heading wt-panel-heading p-a20">
// 				<h4 className="panel-tittle m-a0">
// 					<i className="far fa-chart-bar" /> Application Funnel Progress
// 				</h4>
// 			</div>
// 			<div className="panel-body wt-panel-body twm-pro-view-chart">
// 				<Bar data={chartData} options={chartOptions} />
// 			</div>
// 		</div>
// 	);
// }

// export default SectionCandidateProfileViews;

import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";

function SectionCandidateProfileViews() {
	const chartData = {
		labels: ["January", "February", "March", "April", "May", "June"],
		datasets: [
			{
				label: "New Registrations",
				data: [80, 150, 200, 220, 180, 250],
				borderColor: "#4e73df",
				backgroundColor: "rgba(78, 115, 223, 0.1)",
				fill: true,
				tension: 0.4,
				pointRadius: 4,
			},
			{
				label: "Profile Setups",
				data: [60, 130, 180, 200, 160, 230],
				borderColor: "#1cc88a",
				backgroundColor: "rgba(28, 200, 138, 0.1)",
				fill: true,
				tension: 0.4,
				pointRadius: 4,
			},
			{
				label: "Resumes Uploaded",
				data: [50, 120, 160, 190, 140, 220],
				borderColor: "#36b9cc",
				backgroundColor: "rgba(54, 185, 204, 0.1)",
				fill: true,
				tension: 0.4,
				pointRadius: 4,
			},
			{
				label: "Job Applications",
				data: [30, 80, 150, 170, 130, 200],
				borderColor: "#f6c23e",
				backgroundColor: "rgba(246, 194, 62, 0.1)",
				fill: true,
				tension: 0.4,
				pointRadius: 4,
			},
			{
				label: "Payments Made",
				data: [10, 40, 90, 100, 85, 140],
				borderColor: "#e74a3b",
				backgroundColor: "rgba(231, 74, 59, 0.1)",
				fill: true,
				tension: 0.4,
				pointRadius: 4,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: "bottom",
				labels: {
					color: "#333",
					boxWidth: 18,
					font: {
						size: 12,
						weight: "bold",
					},
				},
			},
			tooltip: {
				mode: "index",
				intersect: false,
				backgroundColor: "#111",
				titleColor: "#fff",
				bodyColor: "#eee",
				padding: 12,
				borderColor: "#333",
				borderWidth: 1,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				grid: {
					color: "#eee",
				},
				ticks: {
					color: "#555",
					font: {
						size: 12,
					},
				},
			},
			x: {
				grid: {
					display: false,
				},
				ticks: {
					color: "#555",
					font: {
						size: 12,
					},
				},
			},
		},
	};

	return (
		<div className="panel panel-default site-bg-white">
			<div className="panel-heading wt-panel-heading p-a20">
				<h4 className="panel-tittle m-a0">
					<i className="far fa-chart-bar" /> Candidate Journey Overview
				</h4>
			</div>
			<div className="panel-body wt-panel-body twm-pro-view-chart">
				<Line data={chartData} options={chartOptions} />
			</div>
		</div>
	);
}

export default SectionCandidateProfileViews;
