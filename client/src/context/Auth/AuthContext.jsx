import Cookies from "js-cookie";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiKey } from "../../utils/helper";
import { io } from "socket.io-client";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(Cookies.get("token"));
  // for socket
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [user, setUser] = useState({
    fullName: Cookies.get("full_name"),
    avatar: Cookies.get("avatar"),
    userId: Cookies.get("userId"),
  });
  const login = (data) => {
    setToken(data.token);
    setUser({
      fullName: data?.user?.full_name,
      avatar: data?.user?.avatar,
      userId: data?.user?.userId,
    });
    Cookies.set("token", data?.token);
    Cookies.set("full_name", data?.user?.full_name);
    Cookies.set("avatar", data?.user?.avatar);
    Cookies.set("userId", data?.user?.userId);
  };
  const logout = () => {
    setToken();
    setUser({});
    Cookies.remove("token");
    Cookies.remove("full_name");
    Cookies.remove("avatar");
    Cookies.remove("userId");
    navigate("/login");
  };

  useEffect(() => {
    if (token) {
      const socket = io(apiKey, {
        query: {
          userId: user.userId,
        },
      });
      setSocket(socket);
      socket.on("getOnlineUsers", (users) => setOnlineUsers(users));
      return () => socket.close();
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [token]);
  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        login,
        logout,
        user,
        onlineUsers,
        socket,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("AuthContext used outside the AuthProvider");
  return context;
}

export { AuthProvider, useAuth };
