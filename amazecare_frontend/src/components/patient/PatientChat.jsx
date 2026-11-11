
import { useEffect, useState } from "react"
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"
import ChatWindow from "../chat/ChatWindow"

function PatientChat() {

    const [conversations, setConversations] = useState([])
    const [selectedConversation, setSelectedConversation] = useState(null)

    const [errMsg, setErrMsg] = useState("")

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axios.get(
                    API_SERVER_URL_DEV + "/api/chat/patient/conversations",
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
                    Chat with your doctors.
                </p>
            </div>

            {errMsg && (
                <div className="alert alert-danger">
                    {errMsg}
                </div>
            )}

            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    {conversations.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-chat-dots fs-1 text-muted"></i>
                            <h5 className="mt-3">No conversations yet</h5>
                            <p className="text-muted mb-0">
                                Select a doctor to start a conversation.
                            </p>
                        </div>
                    ) : (
                        <div className="list-group list-group-flush">
                            {conversations.map((conversation) => (
                                <button
                                    key={conversation.conversationId}
                                    type="button"
                                    className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3"
                                    onClick={() =>
                                        setSelectedConversation(conversation)
                                    }
                                >
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center"
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            background: "#DDF2EA",
                                            color: "#2F8F78"
                                        }}
                                    >
                                        <i className="bi bi-person-badge fs-4"></i>
                                    </div>

                                    <div className="flex-grow-1 text-start">
                                        <h6 className="fw-semibold mb-1">
                                            Dr. {conversation.doctorName}
                                        </h6>
                                        <small className="text-muted">
                                            {conversation.specialization}
                                        </small>
                                    </div>

                                    <div className="text-end">
                                        <small className="text-muted">
                                            {conversation.lastMessageAt
                                                ? new Date(
                                                    conversation.lastMessageAt
                                                ).toLocaleDateString()
                                                : ""}
                                        </small>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedConversation && (
                <div className="mt-3">
                    <ChatWindow
                        conversation={selectedConversation}
                        onBack={() => setSelectedConversation(null)}
                    />
                </div>
            )}
        </div>
    )
}

export default PatientChat
