import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");

  const liked = likes.includes(user._id);

  const toggleLike = async () => {
    const res = await api.put(`/posts/${post._id}/like`);
    setLikes(res.data.likes);
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await api.post(`/posts/${post._id}/comment`, { text });
    setComments(res.data);
    setText("");
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    await api.delete(`/posts/${post._id}`);
    onDelete(post._id);
  };

  return (
    <div className="bg-white rounded-xl shadow mb-4">
      <div className="p-4 flex items-center justify-between">
        <Link to={`/profile/${post.author._id}`} className="flex items-center gap-3">
          <Avatar user={post.author} size={40} />
          <div>
            <p className="font-semibold leading-tight">
              {post.author.firstName} {post.author.lastName}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </Link>
        {post.author._id === user._id && (
          <button onClick={handleDelete} className="text-gray-400 hover:text-red-600 text-sm">
            Delete
          </button>
        )}
      </div>

      {post.text && <p className="px-4 pb-3 whitespace-pre-wrap">{post.text}</p>}
      {post.image && <img src={post.image} alt="" className="w-full max-h-96 object-cover" />}

      <div className="px-4 py-2 flex justify-between text-sm text-gray-500 border-b">
        <span>👍 {likes.length}</span>
        <button onClick={() => setShowComments(!showComments)} className="hover:underline">
          {comments.length} comments
        </button>
      </div>

      <div className="flex px-2 py-1">
        <button
          onClick={toggleLike}
          className={`flex-1 py-2 rounded-lg font-medium hover:bg-gray-100 ${
            liked ? "text-blue-600" : "text-gray-600"
          }`}
        >
          👍 Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100"
        >
          💬 Comment
        </button>
      </div>

      {showComments && (
        <div className="px-4 pb-4 border-t pt-3">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-2 mb-2">
              <Avatar user={c.user} size={32} />
              <div className="bg-gray-100 rounded-2xl px-3 py-2">
                <p className="font-semibold text-sm">
                  {c.user.firstName} {c.user.lastName}
                </p>
                <p className="text-sm">{c.text}</p>
              </div>
            </div>
          ))}
          <form onSubmit={addComment} className="flex gap-2 mt-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
            />
            <button className="text-blue-600 font-semibold text-sm">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}