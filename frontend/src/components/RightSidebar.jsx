import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Avatar from "./Avatar";

export default function RightSidebar() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get("/users/friends").then((res) => setFriends(res.data));
    api.get("/users/requests").then((res) => setRequests(res.data));
  }, []);

  const accept = async (u) => {
    await api.post(`/users/${u._id}/accept`);
    setRequests(requests.filter((r) => r._id !== u._id));
    setFriends([...friends, u]);
  };

  const decline = async (u) => {
    await api.post(`/users/${u._id}/decline`);
    setRequests(requests.filter((r) => r._id !== u._id));
  };

  return (
    <aside className="hidden lg:block fixed top-14 right-0 w-64 p-3 overflow-y-auto h-[calc(100vh-3.5rem)]">
      {requests.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-500 mb-2">Friend requests</h3>
          {requests.map((u) => (
            <div key={u._id} className="mb-2">
              <Link to={`/profile/${u._id}`} className="flex items-center gap-2 font-medium">
                <Avatar user={u} size={36} />
                {u.firstName} {u.lastName}
              </Link>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => accept(u)}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-1 text-sm"
                >
                  Confirm
                </button>
                <button
                  onClick={() => decline(u)}
                  className="flex-1 bg-gray-200 rounded-lg py-1 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className="font-semibold text-gray-500 mb-2">Friends</h3>
      {friends.length === 0 && <p className="text-sm text-gray-400">No friends yet</p>}
      {friends.map((u) => (
        <Link
          key={u._id}
          to={`/messages/${u._id}`}
          className="flex items-center gap-2 p-2 rounded-lg font-medium hover:bg-gray-200"
        >
          <Avatar user={u} size={32} />
          {u.firstName} {u.lastName}
        </Link>
      ))}
    </aside>
  );
}