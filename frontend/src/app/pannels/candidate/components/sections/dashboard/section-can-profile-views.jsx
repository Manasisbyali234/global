
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Line } from "react-chartjs-2";
Chart.register(CategoryScale);

function SectionCandidateProfileViews() {

    const chartData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [{
            label: 'Viewers',
            data: [200, 250, 350, 200, 250, 150],
            pointHoverBorderColor: '#1967d2',
            pointBorderWidth: 10,
            pointHoverBorderWidth: 3,
            pointHitRadius: 20,
            borderWidth: 3,
            borderColor: '#1967d2',
            pointBackgroundColor: 'rgba(255, 255, 255, 0)',
            pointHoverBackgroundColor: 'rgba(255, 255, 255, 1)',
            pointBorderColor: 'rgba(66, 133, 244, 0)',
            cubicInterpolationMode: 'monotone',
            fill: true,
            backgroundColor: 'rgba(212, 230, 255, 0.2)',
        }]
    }

    return (
        <>
            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0"><i className="far fa-chart-bar" />Your Profile Views</h4>
                </div>
                <div className="panel-body wt-panel-body twm-pro-view-chart">
                    <Line data={chartData} />
                </div>
            </div>
        </>
    )
}

export default SectionCandidateProfileViews;
