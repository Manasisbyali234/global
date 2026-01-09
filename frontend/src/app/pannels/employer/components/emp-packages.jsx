function EmpPackagesPage() {
    return (
        <>
            <div className="wt-admin-right-page-header clearfix">
                <h2>Package!</h2>
                <div className="breadcrumbs"><a href="#">Home</a><a href="#">Dasboard</a><span>Package</span></div>
            </div>
            <div className="panel panel-default site-bg-white m-t30">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0"><i className="fa fa-suitcase" />Package</h4>
                </div>
                <div className="panel-body wt-panel-body">
                    <div className="p-a20 table-responsive">
                        <table className="table twm-table table-striped table-borderless">
                            <thead>
                                <tr>
                                    <th>Package Name</th>
                                    <th>Sr. Number</th>
                                    <th>Transaction id</th>
                                    <th>No. of Jobs</th>
                                    <th>Used</th>
                                    <th>Remain</th>
                                    <th>Status</th>
                                    <th>Expired</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><a href="javascript:void(0);" className="site-text-primary">Basic</a></td>
                                    <td>#552030</td>
                                    <td>#HDAC-101512012</td>
                                    <td>20</td>
                                    <td>14</td>
                                    <td>6</td>
                                    <td><span className="text-clr-green2">Active</span></td>
                                    <td>13/06/2023</td>
                                </tr>
                                <tr>
                                    <td><a href="javascript:void(0);" className="site-text-primary">Premium</a></td>
                                    <td>#552045</td>
                                    <td>#ICIC-101512023</td>
                                    <td>35</td>
                                    <td>25</td>
                                    <td>10</td>
                                    <td><span className="text-clr-green2">Active</span></td>
                                    <td>15/06/2023</td>
                                </tr>
                                <tr>
                                    <td><a href="javascript:void(0);" className="site-text-primary">Gold</a></td>
                                    <td>#552050</td>
                                    <td>#AXY-101512050</td>
                                    <td>28</td>
                                    <td>24</td>
                                    <td>4</td>
                                    <td><span className="text-clr-red">Expired</span></td>
                                    <td>17/06/2023</td>
                                </tr>
                                <tr>
                                    <td><a href="javascript:void(0);" className="site-text-primary">Basic</a></td>
                                    <td>#552055</td>
                                    <td>#SBI-101512056</td>
                                    <td>22</td>
                                    <td>14</td>
                                    <td>8</td>
                                    <td><span className="text-clr-green2">Active</span></td>
                                    <td>25/06/2023</td>
                                </tr>
                                <tr>
                                    <td><a href="javascript:void(0);" className="site-text-primary">Gold</a></td>
                                    <td>#552060</td>
                                    <td>#HDAC-1015123552</td>
                                    <td>18</td>
                                    <td>14</td>
                                    <td>4</td>
                                    <td><span className="text-clr-green2">Active</span></td>
                                    <td>15/05/2023</td>
                                </tr>
                                <tr>
                                    <td><a href="javascript:void(0);" className="site-text-primary">Basic</a></td>
                                    <td>#552075</td>
                                    <td>#HDAC-1015121503</td>
                                    <td>20</td>
                                    <td>14</td>
                                    <td>6</td>
                                    <td><span className="text-clr-red">Expired</span></td>
                                    <td>08/05/2023</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}
export default EmpPackagesPage;
