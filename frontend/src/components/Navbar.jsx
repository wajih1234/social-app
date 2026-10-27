import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 inset-x-0 h-14 bg-white shadow flex items-center justify-between px-4 z-10">
      <Link to="/" className="text-2xl font-bold text-blue-600">
        socialapp
      </Link>
      <div className="flex items-center gap-3">
        <Link
          to={`/profile/${user._id}`}
          className="flex items-center gap-2 rounded-full pr-3 hover:bg-gray-100"
        >
          <Avatar user={user} size={36} />
          <span className="font-medium hidden sm:block">{user.firstName}</span>
        </Link>
        <button
          onClick={logout}
          className="bg-gray-200 hover:bg-gray-300 rounded-lg px-3 py-1.5 font-medium"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}