
function ChatMessage({ message, isSender }) {

    return (
        <div className={`d-flex mb-3 ${
            isSender ? "justify-content-end" : "justify-content-start"
        }`}>
            <div
                className={`p-3 rounded-3 ${
                    isSender ? "text-white" : "bg-body-tertiary"
                }`}
                style={{
                    maxWidth: "75%",
                    background: isSender ? "#2F8F78" : undefined
                }}
            >
                <p className="mb-1">{message.content}</p>

                <small className={
                    isSender ? "text-white-50" : "text-muted"
                }>
                    {message.sentAt
                        ? new Date(message.sentAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        })
                        : ""}
                </small>
            </div>
        </div>
    )
}

export default ChatMessage
