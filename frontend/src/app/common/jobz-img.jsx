import { publicUrlFor } from "../../globals/constants";

function JobZImage(props) {
    return(
        <>
            <img {...props} src={publicUrlFor(props.src)} alt={props.alt}/>
        </>
    )
}

export default JobZImage;
