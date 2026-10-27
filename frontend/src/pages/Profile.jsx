import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setProfile(null);
    setError("");
    api
      .get(`/users/${id}`)
      .then((res) => setProfile(res.data))
      .catch(() => setError("User not found"));
    api.get(`/posts/user/${id}`).then((res) => setPosts(res.data));
  }, [id]);

  if (error) return <p className="text-center text-gray-500">{error}</p>;
  if (!profile) return <p className="text-center text-gray-500">Loading...</p>;

  const isMe = profile._id === user._id;
  const isFriend = profile.friends.some((f) => f._id === user._id);

  const addFriend = async () => {
    await api.post(`/users/${id}/friend-request`);
    setProfile({ ...profile, requestSent: true });
  };

  const removeFriend = async () => {
    if (!window.confirm("Remove this friend?")) return;
    await api.delete(`/users/${id}/friend`);
    setProfile({
      ...profile,
      friends: profile.friends.filter((f) => f._id !== user._id),
    });
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow overflow-hidden mb-4">
        <div
          className="h-44 bg-gradient-to-r from-blue-400 to-blue-600 bg-cover bg-center"
          style={profile.coverPhoto ? { backgroundImage: `url(${profile.coverPhoto})` } : {}}
        />
        <div className="px-4 pb-4">
          <div className="-mt-12 flex items-end justify-between">
            <div className="border-4 border-white rounded-full">
              <Avatar user={profile} size={96} />
            </div>
            <div className="flex gap-2">
              {isMe && (
                <Link to="/settings" className="bg-gray-200 hover:bg-gray-300 rounded-lg px-4 py-2 font-medium">
                  Edit profile
                </Link>
              )}
              {!isMe && isFriend && (
                <>
                  <Link to={`/messages/${id}`} className="bg-blue-600 text-white rounded-lg px-4 py-2 font-medium">
                    Message
                  </Link>
                  <button onClick={removeFriend} className="bg-gray-200 hover:bg-gray-300 rounded-lg px-4 py-2 font-medium">
                    Remove friend
                  </button>
                </>
              )}
              {!isMe && !isFriend && (
                <button
                  onClick={addFriend}
                  disabled={profile.requestSent}
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 font-medium disabled:bg-gray-300 disabled:text-gray-600"
                >
                  {profile.requestSent ? "Request sent" : "Add friend"}
                </button>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold mt-2">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-gray-500">{profile.friends.length} friends</p>
        </div>
      </div>

      {profile.friends.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <h2 className="font-bold mb-3">Friends</h2>
          <div className="grid grid-cols-3 gap-3">
            {profile.friends.slice(0, 9).map((f) => (
              <Link key={f._id} to={`/profile/${f._id}`} className="flex flex-col items-center text-center text-sm font-medium">
                <Avatar user={f} size={64} />
                <span className="mt-1">{f.firstName}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {isMe && <CreatePost onCreated={(post) => setPosts([post, ...posts])} />}

      {posts.length === 0 && <p className="text-center text-gray-500">No posts yet</p>}
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onDelete={(pid) => setPosts(posts.filter((p) => p._id !== pid))}
        />
      ))}
    </div>
  );
}