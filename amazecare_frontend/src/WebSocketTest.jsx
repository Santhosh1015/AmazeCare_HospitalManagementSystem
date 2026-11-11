
import { useState } from "react"
import { Client } from "@stomp/stompjs"

function WebSocketTest() {
    const [connected, setConnected] = useState(false)
    const [messages, setMessages] = useState([])
    const [client, setClient] = useState(null)
    const [messageText, setMessageText] = useState("")
    const [conversationId, setConversationId] = useState("")

    const connectSocket = () => {
        const stompClient = new Client({
            brokerURL: "ws://localhost:8080/ws",
            connectHeaders: {
                Authorization: "Bearer " + localStorage.getItem("token")
            },
            debug: (str) => console.log(str),
            onConnect: () => {
                console.log("STOMP Connected")
                setConnected(true)

                stompClient.subscribe("/user/queue/messages", (message) => {
                    console.log("Received:", message.body)
                    setMessages((prev) => [...prev, JSON.parse(message.body)])
                })
            },
            onStompError: (frame) => {
                console.log("STOMP Error:", frame.headers, frame.body)
            },
            onWebSocketError: (error) => {
                console.log("WebSocket Error:", error)
            },
            onDisconnect: () => {
                setConnected(false)
            }
        })

        setClient(stompClient)
        stompClient.activate()
    }

    const disconnectSocket = () => {
        client?.deactivate()
        setConnected(false)
    }
    const sendMessage = () => {
        if (!client || !connected) {
            alert("Connect to WebSocket first")
            return
        }

        if (!conversationId || !messageText.trim()) {
            alert("Enter conversation ID and message")
            return
        }

        const message = {
            conversationId: Number(conversationId),
            content: messageText
        }

        client.publish({
            destination: "/app/chat.send",
            body: JSON.stringify(message)
        })

        setMessageText("")
    }

    return (
        <div className="p-3">
            <h4>WebSocket Test</h4>

            <p>Status: {connected ? "Connected" : "Disconnected"}</p>

            {!connected ? (
                <button className="btn btn-primary" onClick={connectSocket}>
                    Connect
                </button>
            ) : (
                <button className="btn btn-danger" onClick={disconnectSocket}>
                    Disconnect
                </button>
            )}

            <h5 className="mt-4">Received Messages</h5>

            {messages.map((message, index) => (
                <pre key={index}>{JSON.stringify(message, null, 2)}</pre>
            ))}
            <div className="mt-4">
                <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Conversation ID"
                    value={conversationId}
                    onChange={(e) => setConversationId(e.target.value)}
                />

                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Enter message"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                />

                <button
                    className="btn btn-primary"
                    onClick={sendMessage}
                    disabled={!connected}
                >
                    Send Message
                </button>
            </div>
        </div>
    )
}

export default WebSocketTest
