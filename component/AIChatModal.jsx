import React, { useState, useEffect, useRef } from "react";
import { Input, List, Spin, ConfigProvider, Button, message } from "antd";
import { SendOutlined, UserOutlined, RobotOutlined, CopyOutlined, CheckOutlined } from "@ant-design/icons";
import axios from "axios";

const AIChatModal = ({ visible, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [visible]);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageIndex(index);
      message.success('Message copied to clipboard!');
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageIndex(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      message.error('Failed to copy message');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { 
      user: "You", 
      text: userMessage, 
      type: "user", 
      timestamp: new Date(),
      id: Date.now() // Adding unique ID for better key handling
    }]);
    setInput("");
    setLoading(true);

    const BASE_URL = "https://rag-system-4-ujwj.onrender.com/api"

    try {
      const response = await axios.post(
        `${BASE_URL}/chat`,
        { prompt: userMessage },
        { withCredentials: true }
      );
      console.log("AI Data", response);
      const aiReply = response.data.data;

      setMessages((prev) => [...prev, { 
        user: "AI", 
        text: aiReply, 
        type: "ai", 
        timestamp: new Date(),
        id: Date.now() + 1 // Ensuring unique ID
      }]);
    } catch (error) {
      console.error("Error calling chat API:", error);
      setMessages((prev) => [
        ...prev,
        { 
          user: "AI", 
          text: "Sorry, I'm having trouble connecting right now. Please try again.", 
          type: "ai", 
          timestamp: new Date(),
          id: Date.now() + 1
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCopiedMessageIndex(null);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgContainer: "#000000",
          colorTextBase: "#ffffff",
          colorBgElevated: "#111111",
          colorBorder: "#333333",
        },
        components: {
          Input: {
            colorBgContainer: "#111111",
            colorText: "#ffffff",
            colorBorder: "#333333",
            colorBorderHover: "#555555",
            colorPrimaryHover: "#666666",
          },
          Button: {
            colorBgContainer: "#111111",
            colorText: "#ffffff",
            colorBorder: "#333333",
            colorPrimary: "#1890ff",
            colorPrimaryHover: "#40a9ff",
          },
          List: {
            colorBgContainer: "#000000",
            colorText: "#ffffff",
          },
        },
      }}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#000000",
          padding: "0",
        }}
      >
        {/* Chat Header Actions */}
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid #333",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#111111",
          }}
        >
          <span style={{ color: "#888", fontSize: "12px" }}>
            {messages.length} messages
          </span>
          {messages.length > 0 && (
            <Button
              size="small"
              onClick={clearChat}
              style={{
                background: "transparent",
                border: "1px solid #333",
                color: "#888",
                fontSize: "11px",
              }}
            >
              Clear Chat
            </Button>
          )}
        </div>

        {/* Messages Container */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            background: "#000000",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#666",
                marginTop: "40px",
                fontSize: "14px",
              }}
            >
              <RobotOutlined style={{ fontSize: "32px", marginBottom: "16px", display: "block" }} />
              <p>Start a conversation with AI Assistant</p>
              <p style={{ fontSize: "12px", marginTop: "8px" }}>
                Ask me anything about your tasks, projects, or need help with work!
              </p>
            </div>
          ) : (
            messages.map((item, index) => (
              <div
                key={item.id || index}
                style={{
                  display: "flex",
                  flexDirection: item.type === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  gap: "12px",
                  marginBottom: "8px",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (item.type === "ai") {
                    const copyBtn = e.currentTarget.querySelector('.copy-button');
                    if (copyBtn) copyBtn.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (item.type === "ai") {
                    const copyBtn = e.currentTarget.querySelector('.copy-button');
                    if (copyBtn && copiedMessageIndex !== index) copyBtn.style.opacity = '0';
                  }
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: item.type === "user" ? "#1890ff" : "#52c41a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  {item.type === "user" ? <UserOutlined /> : <RobotOutlined />}
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: "50%",
                    background: item.type === "user" ? "#1890ff" : "#262626",
                    color: "#ffffff",
                    padding: "12px 16px",
                    borderRadius: "16px",
                    borderTopLeftRadius: item.type === "user" ? "16px" : "4px",
                    borderTopRightRadius: item.type === "user" ? "4px" : "16px",
                    wordBreak: "break-word",
                    lineHeight: "1.4",
                    position: "relative",
                  }}
                >
                  <div style={{ fontSize: "14px", paddingRight: item.type === "ai" ? "30px" : "0" }}>
                    {item.text}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      opacity: 0.7,
                      marginTop: "4px",
                      textAlign: item.type === "user" ? "right" : "left",
                    }}
                  >
                    {item.timestamp?.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  {/* Copy Button for AI messages */}
                  {item.type === "ai" && (
                    <Button
                      className="copy-button"
                      type="text"
                      size="small"
                      icon={copiedMessageIndex === index ? <CheckOutlined /> : <CopyOutlined />}
                      onClick={() => copyToClipboard(item.text, index)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "24px",
                        height: "24px",
                        minWidth: "24px",
                        padding: "0",
                        border: "none",
                        background: "rgba(255, 255, 255, 0.1)",
                        color: copiedMessageIndex === index ? "#52c41a" : "#ffffff",
                        opacity: copiedMessageIndex === index ? "1" : "0",
                        transition: "all 0.2s ease",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => {
                        if (copiedMessageIndex !== index) {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                      }}
                    />
                  )}
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {loading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#52c41a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "14px",
                }}
              >
                <RobotOutlined />
              </div>
              <div
                style={{
                  background: "#262626",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  borderTopLeftRadius: "4px",
                  color: "#ffffff",
                }}
              >
                <Spin size="small" style={{ marginRight: "8px" }} />
                <span style={{ fontSize: "14px" }}>AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Container */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #333",
            background: "#111111",
          }}
        >
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <Input.TextArea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
              style={{
                background: "#000000",
                color: "#fff",
                border: "1px solid #333",
                borderRadius: "12px",
                resize: "none",
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              loading={loading}
              disabled={!input.trim() || loading}
              style={{
                height: "40px",
                borderRadius: "12px",
                background: input.trim() ? "#1890ff" : "#333",
                border: "none",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#666",
              marginTop: "8px",
              textAlign: "center",
            }}
          >
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default AIChatModal;
