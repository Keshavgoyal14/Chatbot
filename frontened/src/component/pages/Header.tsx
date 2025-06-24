import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

type HeaderProps = {
  createSession: () => Promise<void>;
};

function Header({ createSession }: HeaderProps) {
  const [user, setUser] = useState<{ plan: string; pdfCount: number; chats: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false); // <-- new state for mobile services
  const location = useLocation();
  const userAuth = useAuth();

  useEffect(() => {
    axios
      .get("/user/get-current-user", { withCredentials: true })
      .then((res) => {
        setUser({
          plan: res.data.plan,
          pdfCount: res.data.pdfs.length || 0,
          chats: res.data.chats.length || 0,
        });
      });
  }, []);

  const chatdisabled = user?.plan === "free" && user.chats >= 5;
  const Docdisabled = user?.plan === "free" && user.pdfCount >= 1;

  const handleStartChat = () => {
    if (!chatdisabled) {
      createSession();
    } else {
      toast.error("Free plan limit reached. Upgrade to Pro for unlimited chats.");
      window.location.href = "/#pricing";
    }
  };

  return (
    <div className="fixed top-0 w-full z-30 bg-gray-950 rounded shadow-lg">
      <div className="flex flex-row justify-between items-center p-4 rounded">
        <Link to="/">
          <span className="text-gray-200 font-bold text-3xl m-1 uppercase font-mono">
            Chat.<span className="text-purple-400 ">AI</span>
          </span>
        </Link>

        {/* Hamburger for mobile */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={
                menuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex">
          {userAuth?.isloggedIn ? (
            <div className="flex flex-row gap-3 items-center">
              {(location.pathname.startsWith("/chat-pdf") || location.pathname.startsWith("/chat")) ? (
                <Link to="/">
                  <span className="uppercase font-semibold tracking-wide rounded-lg text-white px-4 py-2 cursor-pointer select-none transition-all duration-200 hover:text-purple-400">
                    Home
                  </span>
                </Link>
              ) : null}

              {/* Services Dropdown */}
              <div className="relative group">
                <span className="uppercase font-semibold tracking-wide rounded-lg text-white px-4 py-2 cursor-pointer select-none transition-all duration-200 hover:text-purple-400">
                  Services
                  <svg className="ml-2 w-4 h-4 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
                <div className="absolute left-0 mt-2 w-44 bg-gray-900 border border-violet-400 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none transition-opacity duration-200 z-50">
                  <ul className="py-2">
                    <li>
                      <button
                        onClick={handleStartChat}
                        className="w-full uppercase text-left px-4 py-2 hover:bg-purple-700 hover:text-white transition rounded"
                      >
                        Start Chat
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          if (!Docdisabled) {
                            window.location.href = "/chat-pdf";
                          } else {
                            toast.error("Free plan limit reached. Upgrade to Pro for unlimited PDFs.");
                            window.location.href = "/#pricing";
                          }
                        }}
                        className="w-full uppercase text-left px-4 py-2 hover:bg-purple-700 hover:text-white transition rounded"
                      >
                        Ask PDF
                      </button>
                    </li>
                    <li>
                      <Link to="/chat-audio">
                        <button className="w-full uppercase text-left px-4 py-2 hover:bg-purple-700 hover:text-white transition rounded">
                          Talk to Audio
                        </button>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <a
                href="/#pricing"
                className="uppercase font-semibold tracking-wide rounded-lg text-white px-4 py-2 cursor-pointer select-none transition-all duration-200 hover:text-purple-400"
              >
                Pricing
              </a>
              {/* Logout button */}
              <Link to="/">
                <Button
                  onClick={userAuth.logout}
                  className="bg-gradient-to-r from-purple-600 to-purple-400 uppercase font-semibold tracking-wide rounded-lg text-white shadow-md transition-all duration-200 hover:from-purple-700 hover:to-purple-500 hover:text-black hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  Logout
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              <Link
                to="#pricing"
                className="uppercase font-semibold tracking-wide rounded-lg text-white px-4 py-2 cursor-pointer select-none transition-all duration-200 hover:text-purple-400"
              >
                Pricing
              </Link>
              <Link to="/login">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-400 uppercase font-semibold tracking-wide mr-2 rounded-lg text-white shadow-md transition-all duration-200 hover:from-purple-700 hover:to-purple-500 hover:text-black hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-400 uppercase font-semibold tracking-wide mr-2 rounded-lg text-white shadow-md transition-all duration-200 hover:from-purple-700 hover:to-purple-500 hover:text-black hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400">
                  Signup
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden absolute top-16 right-4 bg-gray-900 border border-violet-400 rounded-2xl shadow-lg w-56 p-4 z-50">
            {userAuth?.isloggedIn ? (
              <ul className="flex flex-col gap-2">
                {(location.pathname.startsWith("/chat-pdf") || location.pathname.startsWith("/chat")) && (
                  <li>
                    <Link to="/" onClick={() => setMenuOpen(false)}>
                      <span className="uppercase font-semibold tracking-wide rounded-lg text-white px-4 py-2 cursor-pointer select-none transition-all duration-200 hover:text-purple-400">
                        Home
                      </span>
                    </Link>
                  </li>
                )}
                {/* Services collapsible section */}
                <li>
                  <button
                    onClick={() => setServicesOpen(!servicesOpen)}
                    className="w-full uppercase text-left px-4 py-2 hover:bg-purple-700 hover:text-white transition rounded flex items-center justify-between"
                  >
                    Services
                    <svg className="ml-2 w-4 h-4 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={servicesOpen ? "M19 15l-7-7-7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  </button>
                  {servicesOpen && (
                    <ul className="flex flex-col gap-2 mt-2 ml-2">
                      <li>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            handleStartChat();
                          }}
                          className="w-full uppercase text-left px-4 py-2 hover:bg-purple-700 hover:text-white transition rounded"
                        >
                          Start Chat
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            if (!Docdisabled) {
                              window.location.href = "/chat-pdf";
                            } else {
                              toast.error("Free plan limit reached. Upgrade to Pro for unlimited PDFs.");
                              window.location.href = "/#pricing";
                            }
                          }}
                          className="w-full uppercase text-left px-4 py-2 hover:bg-purple-700 hover:text-white transition rounded"
                        >
                          Ask PDF
                        </button>
                      </li>
                      <li>
                        <Link to="/chat-audio" onClick={() => setMenuOpen(false)}>
                          <button className="w-full uppercase text-left px-4 py-2 hover:bg-purple-700 hover:text-white transition rounded">
                            Talk to Audio
                          </button>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
                <li>
                  <a
                    href="/#pricing"
                    className="uppercase font-semibold tracking-wide rounded-lg text-white px-4 py-2 cursor-pointer select-none transition-all duration-200 hover:text-purple-400"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/" onClick={() => setMenuOpen(false)}>
                    <Button
                      onClick={userAuth.logout}
                      className="bg-gradient-to-r from-purple-600 to-purple-400 uppercase font-semibold tracking-wide rounded-lg text-white shadow-md transition-all duration-200 hover:from-purple-700 hover:to-purple-500 hover:text-black hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      Logout
                    </Button>
                  </Link>
                </li>
              </ul>
            ) : (
              <ul className="flex flex-col gap-2">
                <li>
                  <a
                    href="/#pricing"
                    className="uppercase font-semibold tracking-wide rounded-lg text-white px-4 py-2 cursor-pointer select-none transition-all duration-200 hover:text-purple-400"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <Button className="bg-gradient-to-r from-purple-600 to-purple-400 uppercase font-semibold tracking-wide mr-2 rounded-lg text-white shadow-md transition-all duration-200 hover:from-purple-700 hover:to-purple-500 hover:text-black hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400">
                      Login
                    </Button>
                  </Link>
                </li>
                <li>
                  <Link to="/signup" onClick={() => setMenuOpen(false)}>
                    <Button className="bg-gradient-to-r from-purple-600 to-purple-400 uppercase font-semibold tracking-wide mr-2 rounded-lg text-white shadow-md transition-all duration-200 hover:from-purple-700 hover:to-purple-500 hover:text-black hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400">
                      Signup
                    </Button>
                  </Link>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;