const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchApi = async (path: string) => {
  const url = API_BASE
    ? `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`
    : path;  

  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    throw new Error("Network response is not ok");
  }
  return res.json();
};