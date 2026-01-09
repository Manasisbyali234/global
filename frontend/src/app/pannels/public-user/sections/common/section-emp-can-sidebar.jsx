import SectionContact from "./section-contact";
import SectionLocation from "./section-location";
import SectionProfile from "./section-profile";

function SectionEmployersCandidateSidebar({ type, employer }) {
    return (
			<>
				<div className="side-bar-2">
					{type === "1" ? (
						<>
							<div className="twm-s-info-wrap mb-5">
								<SectionProfile employer={employer} />
							</div>
							
							<div className="twm-s-map mb-5">
								<SectionLocation employer={employer} />
							</div>
						</>
					) : (
						<>
							<div className="twm-s-map mb-5">
								<SectionProfile employer={employer} />
							</div>
							<div className="twm-s-info-wrap mb-5">
								<SectionLocation employer={employer} />
							</div>
						</>
					)}
					
				</div>
			</>
		);
}

export default SectionEmployersCandidateSidebar;
