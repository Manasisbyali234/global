import JobZImage from "../jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../globals/route-names";

function AllDemoFloatingOptions(props) {
    return (
        <>
            <div className={"twm-all-demo-list-wrap "+(props.active ? 'active' : '')}>
                <div className="twm-all-demo-inner scrollbar-macosx">
                    <a
                        href="#"
                        className="all-demo-close"
                        onClick={props.onClick}
                    ></a>
                    <ul className="twm-all-demo-list">
                        <li><NavLink to={publicUser.HOME1}><JobZImage src="images/home-14/all-demo-pages/1.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME2}><JobZImage src="images/home-14/all-demo-pages/2.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME3}><JobZImage src="images/home-14/all-demo-pages/3.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME4}><JobZImage src="images/home-14/all-demo-pages/4.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME5}><JobZImage src="images/home-14/all-demo-pages/5.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME6}><JobZImage src="images/home-14/all-demo-pages/6.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME7}><JobZImage src="images/home-14/all-demo-pages/7.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME8}><JobZImage src="images/home-14/all-demo-pages/8.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME9}><JobZImage src="images/home-14/all-demo-pages/9.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME10}><JobZImage src="images/home-14/all-demo-pages/10.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME11}><JobZImage src="images/home-14/all-demo-pages/11.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME12}><JobZImage src="images/home-14/all-demo-pages/12.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME13}><JobZImage src="images/home-14/all-demo-pages/13.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME14}><JobZImage src="images/home-14/all-demo-pages/14.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME15}><JobZImage src="images/home-14/all-demo-pages/15.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME16}><JobZImage src="images/home-14/all-demo-pages/16.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME17}><JobZImage src="images/home-14/all-demo-pages/17.jpg" /></NavLink></li>
                        <li><NavLink to={publicUser.HOME18}><JobZImage src="images/home-14/all-demo-pages/18.jpg" /></NavLink></li>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default AllDemoFloatingOptions;
