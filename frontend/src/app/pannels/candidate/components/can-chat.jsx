import { useEffect } from "react";
import SectionCanChat from "../sections/chat/section-can-chat";
import SectionCanChatList from "../sections/chat/section-can-chat-list";
import { loadScript } from "../../../../globals/constants";

function CanChatPage() {

    useEffect(()=>{
        loadScript("js/custom.js")
    })

    return (
        <>
            <div className="twm-right-section-panel site-bg-gray">
                <div className="wt-admin-dashboard-msg-2  twm-dashboard-style-2">
                    
                    {/*Left Msg section*/}
                    <SectionCanChatList />

                    {/*Right Msg section*/}
                    <SectionCanChat />

                </div>
            </div>

        </>
    )
}

export default CanChatPage;
