
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { Client } from "@stomp/stompjs"
import { API_SERVER_URL_DEV } from "../../config"
import ChatMessage from "./ChatMessage"

function ChatWindow({ conversation, onBack }) {

    const [messages, setMessages] = useState([])
    const [messageText, setMessageText] = useState("")
    const [connected, setConnected] = useState(false)

    const clientRef = useRef(null)
    const bottomRef = useRef(null)

    const conversationId = conversation?.conversationId

    useEffect(() => {
        if (!conversationId) return

        const fetchMessages = async () => {
            try {
                const response = await axios.get(API_SERVER_URL_DEV + `/api/chat/${conversationId}/messages`,
                    {
                        headers: {
                            Authorization: "Bearer " +
                                localStorage.getItem("token")
                        }
                    }
                )

                setMessages(response.data)
            } catch (err) {
                console.log("Message history error:", err)
            }
        }

        fetchMessages()
    }, [conversationId])

    useEffect(() => {
        const client = new Client({
            brokerURL: "ws://localhost:8080/ws",

            connectHeaders: { Authorization: "Bearer " + localStorage.getItem("token") },

            reconnectDelay: 5000,

            onConnect: () => {
                setConnected(true)

                client.subscribe(
                    "/user/queue/messages",
                    (message) => {
                        const received = JSON.parse(message.body)

                        if (
                            received.conversationId === conversationId
                        ) {
                            setMessages(prev => [...prev, received])
                        }
                    }
                )
            },

            onDisconnect: () => setConnected(false),

            onWebSocketClose: () => setConnected(false),

            onStompError: (frame) => {
                console.error("STOMP error:", frame.body)
            }
        })

        clientRef.current = client
        client.activate()

        return () => {
            client.deactivate()
            clientRef.current = null
        }
    }, [conversationId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        })
    }, [messages])

    const sendMessage = () => {
        if (!messageText.trim() || !clientRef.current?.connected) {
            return
        }

        clientRef.current.publish({
            destination: "/app/chat.send",
            body: JSON.stringify({
                conversationId,
                content: messageText.trim()
            })
        })

        setMessages(prev => [
            ...prev,
            {
                conversationId,
                content: messageText.trim(),
                senderEmail: localStorage.getItem("email"),
                sentAt: new Date().toISOString(),
                temporary: true
            }
        ])

        setMessageText("")
    }

    return (
        <div className="card border-0 shadow-sm h-100">

            <div className="card-header bg-body py-3 d-flex align-items-center gap-3">
                <button
                    className="btn btn-light"
                    onClick={onBack}
                >
                    <i className="bi bi-arrow-left"></i>
                </button>

                <div className="flex-grow-1">
                    <h6 className="fw-bold mb-0">
                        {conversation.doctorName ||
                            conversation.patientName}
                    </h6>
                    <small className={connected ? "text-success" : "text-muted"}>
                        {connected ? "Online connection" : "Connecting..."}
                    </small>
                </div>
            </div>

            <div
                className="card-body overflow-auto"
                style={{ height: "450px" }}
            >
                {messages.length === 0 ? (
                    <div className="text-center text-muted py-5">
                        No messages yet. Start a conversation.
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <ChatMessage
                            key={message.messageId || index}
                            message={message}
                            isSender={
                                message.senderEmail === localStorage.getItem("email")
                            }
                        />
                    ))
                )}

                <div ref={bottomRef}></div>
            </div>

            <div className="card-footer bg-body p-3">
                <div className="d-flex gap-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter") sendMessage()
                        }}
                    />

                    <button
                        className="btn btn-primary"
                        style={{ background: "#2F8F78", border: "none" }}
                        onClick={sendMessage}
                        disabled={!connected || !messageText.trim()}
                    >
                        <i className="bi bi-send"></i>
                    </button>
                </div>
            </div>

        </div>
    )
}

export default ChatWindow
