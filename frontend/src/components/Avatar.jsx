export default function Avatar({ user, size = 40 }) {
  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt=""
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shrink-0"
    >
      {initials}
    </div>
  );
}