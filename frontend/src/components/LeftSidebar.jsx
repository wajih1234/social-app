import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 p-2 rounded-lg font-medium hover:bg-gray-200 ${
    isActive ? "bg-blue-50 text-blue-600" : "text-gray-800"
  }`;

export default function LeftSidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col gap-1 fixed top-14 left-0 w-64 p-3">
      <NavLink to={`/profile/${user._id}`} className={linkClass}>
        <Avatar user={user} size={32} />
        {user.firstName} {user.lastName}
      </NavLink>
      <NavLink to="/" end className={linkClass}>
        <span className="w-8 text-center">🏠</span> Home
      </NavLink>
      <NavLink to="/search" className={linkClass}>
  <span className="w-8 text-center">🔍</span> Find friends
</NavLink>
      <NavLink to="/messages" className={linkClass}>
        <span className="w-8 text-center">💬</span> Messages
      </NavLink>
      <NavLink to="/settings" className={linkClass}>
        <span className="w-8 text-center">⚙️</span> Settings
      </NavLink>
    </aside>
  );
}