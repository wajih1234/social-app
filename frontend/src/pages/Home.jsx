import { useEffect, useState } from "react";
import api from "../api";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/posts/feed")
      .then((res) => setPosts(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <CreatePost onCreated={(post) => setPosts([post, ...posts])} />

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {!loading && posts.length === 0 && (
        <p className="text-center text-gray-500">
          No posts yet. Add some friends or write your first post!
        </p>
      )}

      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onDelete={(id) => setPosts(posts.filter((p) => p._id !== id))}
        />
      ))}
    </div>
  );
}