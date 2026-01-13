import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { api } from "../../../../utils/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function AdminDashboardActivityChart() {
	const [chartData, setChartData] = useState(null);
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const [chartRes, statsRes] = await Promise.all([
				api.getAdminCharts(),
				api.getAdminStats()
			]);

			if (chartRes.success) {
				setChartData(chartRes.chartData);
			} else {
				throw new Error(chartRes.message || 'Failed to fetch chart data');
			}

			if (statsRes.success) {
				setStats(statsRes.stats);
			} else {
				throw new Error(statsRes.message || 'Failed to fetch stats');
			}
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const getMonthName = (monthNum) => {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return months[monthNum - 1];
	};

	if (loading) {
		return <div className="text-center p-5">Loading charts...</div>;
	}

	if (error) {
		return (
			<div className="alert alert-danger m-a20">
				<i className="fa fa-exclamation-triangle me-2"></i>
				Error loading charts: {error}
			</div>
		);
	}

	if (!chartData || !stats) {
		return <div className="text-center p-5">No data available for charts</div>;
	}

	// Safety check for monthlyData
	const monthlyData = chartData.monthlyData || [];
	
	// Process monthly data for bar chart
	const monthLabels = monthlyData.map(item => item.label || '');
	const applicationData = monthlyData.map(item => item.applications || 0);
	const employerData = monthlyData.map(item => item.employers || 0);

	// Bar chart data
	const barData = {
		labels: monthLabels,
		datasets: [
			{
				label: "Applications",
				data: applicationData,
				backgroundColor: "rgba(78, 115, 223, 0.7)",
				borderColor: "#4e73df",
				borderWidth: 2,
			},
			{
				label: "New Employers",
				data: employerData,
				backgroundColor: "rgba(28, 200, 138, 0.7)",
				borderColor: "#1cc88a",
				borderWidth: 2,
			},
		],
	};

	// Pie chart data
	const pieData = {
		labels: ['Total Candidates', 'Total Placements', 'Approved Employers'],
		datasets: [
			{
				data: [
					stats.completedProfileCandidates || 0, 
					stats.totalPlacements || 0, 
					stats.approvedEmployers || 0
				],
				backgroundColor: [
					"#4e73df",
					"#1cc88a",
					"#36b9cc",
				],
				borderColor: "#fff",
				borderWidth: 2,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top",
				labels: {
					color: "#333",
					font: { size: 14, weight: "bold" },
				},
			},
		},
	};

	return (
		<div className="row">
			{/* Bar Chart */}
			<div className="col-lg-6 col-md-12 mb-4">
				<div className="panel panel-default site-bg-white" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
					<div className="panel-heading wt-panel-heading p-a25" style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
						<h4 className="panel-tittle m-a0" style={{ color: '#333', fontSize: '16px', fontWeight: '600' }}>
							<i className="far fa-chart-bar" style={{ color: '#ff6b35', marginRight: '8px' }} /> Monthly Trends (Last 6 Months)
						</h4>
					</div>

					<div className="panel-body wt-panel-body" style={{ height: window.innerWidth <= 768 ? "250px" : "350px", padding: '20px' }}>
						<Bar data={barData} options={chartOptions} />
					</div>
				</div>
			</div>

			{/* Pie Chart */}
			<div className="col-lg-6 col-md-12 mb-4">
				<div className="panel panel-default site-bg-white" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
					<div className="panel-heading wt-panel-heading p-a25" style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
						<h4 className="panel-tittle m-a0" style={{ color: '#333', fontSize: '16px', fontWeight: '600' }}>
							<i className="fas fa-chart-pie" style={{ color: '#ff6b35', marginRight: '8px' }} /> Platform Overview
						</h4>
					</div>
					
					<div className="panel-body wt-panel-body" style={{ height: window.innerWidth <= 768 ? "250px" : "350px", padding: '20px' }}>
						<Pie data={pieData} options={chartOptions} />
					</div>
				</div>
			</div>
		</div>
	);
}

export default AdminDashboardActivityChart;

