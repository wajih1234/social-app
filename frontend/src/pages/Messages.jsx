import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Avatar from "../components/Avatar";

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const friend = friends.find((f) => f._id === userId);

  useEffect(() => {
    api.get("/users/friends").then((res) => setFriends(res.data));
  }, []);

  // load the history when the conversation changes
  useEffect(() => {
    if (!userId) return;
    setMessages([]);
    setError("");
    api.get(`/messages/${userId}`).then((res) => setMessages(res.data));
  }, [userId]);

  // receive messages in real time
  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (msg) => {
      if (msg.sender === userId) setMessages((prev) => [...prev, msg]);
    };
    socket.on("newMessage", onNewMessage);
    return () => socket.off("newMessage", onNewMessage);
  }, [socket, userId]);

  // scroll to the last message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError("");
    try {
      const res = await api.post(`/messages/${userId}`, { text });
      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch (err) {
      setError(err.response?.data?.message || "Message not sent");
    }
  };

  // no friend selected: show the list
  if (!userId) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        {friends.length === 0 && (
          <p className="text-gray-500">Add some friends to start chatting.</p>
        )}
        {friends.map((f) => (
          <Link
            key={f._id}
            to={`/messages/${f._id}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 font-medium"
          >
            <Avatar user={f} size={44} />
            {f.firstName} {f.lastName}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow flex flex-col h-[calc(100vh-6rem)]">
      <div className="p-3 border-b flex items-center gap-3">
        <Link to="/messages" className="text-blue-600 font-bold text-xl px-2">
          ←
        </Link>
        {friend && (
          <Link to={`/profile/${friend._id}`} className="flex items-center gap-3 font-semibold">
            <Avatar user={friend} size={40} />
            {friend.firstName} {friend.lastName}
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-4">No messages yet. Say hi!</p>
        )}
        {messages.map((m) => {
          const mine = m.sender === user._id;
          return (
            <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl break-words ${
                  mine ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
                }`}
              >
                {m.text}
                <p className={`text-[10px] mt-1 ${mine ? "text-blue-100" : "text-gray-500"}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-red-600 text-sm px-4">{error}</p>}
      <form onSubmit={send} className="p-3 border-t flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Aa"
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none"
        />
        <button className="bg-blue-600 text-white font-semibold rounded-full px-5 hover:bg-blue-700">
          Send
        </button>
      </form>
    </div>
  );
}