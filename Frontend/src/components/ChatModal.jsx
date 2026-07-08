import { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import axios from 'axios';

const ChatModal = ({ isOpen, onClose, currentUser, otherUser, onMessagesRead }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch Chat History
  const fetchChat = async (isInitial = false) => {
    if (!currentUser?._id || !otherUser?._id) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/messages/chat/${currentUser._id}/${otherUser._id}`);
      setMessages(data);
      if (isInitial) {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // 2. Mark messages as read
  const markRead = async () => {
    if (!currentUser?._id || !otherUser?._id) return;
    try {
      await axios.put('http://localhost:5000/api/messages/read', {
        sender: otherUser._id,
        receiver: currentUser._id
      });
      if (onMessagesRead) {
        onMessagesRead();
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetchChat(true);
    markRead();

    // Start 3s polling for new messages
    pollingRef.current = setInterval(() => {
      fetchChat(false);
      markRead();
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isOpen, otherUser?._id]);

  // Scroll to bottom whenever messages list changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Send Message Handler
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser?._id || !otherUser?._id) return;

    const messageText = inputText;
    setInputText(""); // Optimistically clear input

    try {
      const { data } = await axios.post('http://localhost:5000/api/messages', {
        sender: currentUser._id,
        receiver: otherUser._id,
        text: messageText
      });
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[550px] border border-gray-100">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            {otherUser?.profilePicture ? (
              <img
                src={otherUser.profilePicture}
                alt={otherUser.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-indigo-400"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=random&color=fff`;
                }}
              />
            ) : (
              <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold uppercase">
                {otherUser?.name?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <h3 className="font-bold text-sm tracking-tight">{otherUser?.name || "Chat Room"}</h3>
              <p className="text-[10px] text-gray-300 font-medium truncate max-w-[200px]">{otherUser?.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1.5 hover:bg-gray-800 rounded-full transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-3">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-gray-400 font-medium space-y-2">
              <p className="text-xs">No messages yet. Send a whisper to start!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender?._id === currentUser._id || msg.sender === currentUser._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed font-medium ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right font-light ${
                        isMe ? 'text-indigo-200' : 'text-gray-400'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex gap-2 items-center">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-gray-400 bg-gray-50 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-indigo-650 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
};

export default ChatModal;
