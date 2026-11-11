
import { useEffect, useState } from "react"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"
import ChatWindow from "../chat/ChatWindow"

function DoctorChat() {

    const [conversations, setConversations] = useState([])
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [errMsg, setErrMsg] = useState("")

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axios.get(
                    API_SERVER_URL_DEV + "/api/chat/doctor/conversations",
                    {
                        headers: {
                            Authorization: "Bearer " +
                                localStorage.getItem("token")
                        }
                    }
                )

                setConversations(response.data)
            } catch (err) {
                if (!err.response) {
                    setErrMsg("Unable to reach the server. Please try again later.")
                } else {
                    setErrMsg(
                        err.response.data?.message ||
                        "Unable to fetch conversations"
                    )
                }
            }
        }

        fetchConversations()
    }, [])

    return (
        <div className="container-fluid py-4">

            <div className="mb-4">
                <h1 className="h3 fw-bold mb-1">Messages</h1>
                <p className="text-muted mb-0">
                    Communicate with your patients.
                </p>
            </div>

            {errMsg && (
                <div className="alert alert-danger">{errMsg}</div>
            )}

            {!selectedConversation && (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">

                        {conversations.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bi bi-chat-dots fs-1 text-muted"></i>
                                <h5 className="mt-3">No conversations yet</h5>
                                <p className="text-muted">
                                    Patient conversations will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="list-group list-group-flush">
                                {conversations.map(conversation => (
                                    <button
                                        key={conversation.conversationId}
                                        className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3"
                                        onClick={() =>
                                            setSelectedConversation(conversation)
                                        }
                                    >
                                        <div className="rounded-circle d-flex align-items-center justify-content-center"
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                background: "#DDF2EA",
                                                color: "#2F8F78"
                                            }}
                                        >
                                            <i className="bi bi-person fs-4"></i>
                                        </div>

                                        <div className="text-start">
                                            <h6 className="fw-semibold mb-1">
                                                {conversation.patientName}
                                            </h6>
                                            <small className="text-muted">
                                                Patient ID: {conversation.patientId}
                                            </small>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            )}

            {selectedConversation && (
                <ChatWindow
                    conversation={selectedConversation}
                    onBack={() => setSelectedConversation(null)}
                />
            )}

        </div>
    )
}

export default DoctorChat
