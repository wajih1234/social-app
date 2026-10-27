import api from "./api";

export default async function uploadImage(file) {
  const data = new FormData();
  data.append("image", file);
  const res = await api.post("/upload", data);
  return res.data.url;
}