import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  User,
  Bot,
  X,
  MessageSquare,
  Landmark,
  Car,
  Briefcase,
  Building,
  ArrowRight,
  Grid,
  Home,
  Menu,
  FileText,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  FileCheck,
  Phone,
  Users,
  Clock,
  Mail,
  Globe,
  CheckCircle,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

// --- Firebase Configuration ---
const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: "G-9KDDVB1DVR",
      };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rawAppId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const appId = rawAppId.replace(/[^a-zA-Z0-9_-]/g, "_");

// --- Configuration & Data ---

const SITE_BRAND = {
  name: "CivicSphere",
  domain: ".gov",
  description: "The Unified Citizen Services Portal",
};

const THEME = {
  primary: "bg-blue-700",
  primaryHover: "hover:bg-blue-800",
  secondary: "bg-blue-50",
  text: "text-blue-700",
  border: "border-blue-200",
  gradient: "from-blue-700 to-sky-600",
  chatHeader: "bg-blue-700 text-white",
  userBubble: "bg-blue-700 text-white",
  botAvatar: "bg-blue-600 text-white",
  launcher: "bg-blue-700 hover:bg-blue-800",
};

const SCENARIOS = {
  tax: {
    id: "tax",
    name: "Tax Office",
    brand: "TaxCentral",
    icon: <Landmark size={20} />,
    heroTitle: "Annual Tax Assessment",
    heroSubtitle:
      "Review your obligations and submit required fiscal documentation.",
    querySuggestion: "What documents do I need to file?",
  },
  vehicle: {
    id: "vehicle",
    name: "Vehicle Services",
    brand: "AutoReg",
    icon: <Car size={20} />,
    heroTitle: "Vehicle Services Portal",
    heroSubtitle: "Renew registrations, pay fines, and manage titles online.",
    querySuggestion: "Renew vehicle registration",
  },
  benefits: {
    id: "benefits",
    name: "Unemployment",
    brand: "LaborAssist",
    icon: <Briefcase size={20} />,
    heroTitle: "Unemployment Assistance",
    heroSubtitle:
      "Supporting the workforce during transitions with financial aid and job placement.",
    querySuggestion: "Apply for child care benefits",
  },
  housing: {
    id: "housing",
    name: "Housing Authority",
    brand: "CityHomes",
    icon: <Home size={20} />,
    heroTitle: "Affordable Housing Initiative",
    heroSubtitle:
      "Connecting families with safe, affordable, and sustainable housing options.",
    querySuggestion: "How to apply for housing?",
  },
};

const CAROUSEL_SLIDES = [
  {
    url: "https://i.ibb.co/q37JWdzN/family-financial-budget-household-planning-income-allocation-expense-tracking-savings-strategy-econo.webp",
    title: "Fiscal Responsibility",
    subtitle: "Transparent local tax allocation.",
  },
  {
    url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80",
    title: "Infrastructure",
    subtitle: "Building safer, smarter roads.",
  },
  {
    url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80",
    title: "Public Assemblies",
    subtitle: "Engaging our community through dialogue.",
  },
  {
    url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80",
    title: "Community Welfare",
    subtitle: "Supporting families and local youth programs.",
  },
];

const ICON_MAP = {
  FileText,
  DollarSign,
  Car,
  FileCheck,
  Calendar,
  Home,
  MapPin,
  Landmark,
  Grid,
  Users,
  Phone,
  ExternalLink,
  Mail,
  Globe,
  Briefcase,
  CheckCircle,
};

// --- Helper: Markdown & Citation Parser (Prototype A) ---
const parseBotMessage = (text, citations = []) => {
  if (!text) return null;
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, index) => {
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={`link-${index}`}
          href={linkMatch[2]}
          className="text-blue-700 font-bold underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkMatch[1]}
        </a>
      );
    }
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, bIndex) => {
      if (bPart.startsWith("**") && bPart.endsWith("**")) {
        return (
          <strong
            key={`bold-${index}-${bIndex}`}
            className="font-extrabold text-slate-900"
          >
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      const citeParts = bPart.split(/(\[\d+\])/g);
      return citeParts.map((cPart, cIndex) => {
        const citeMatch = cPart.match(/^\[(\d+)\]$/);
        if (citeMatch) {
          return (
            <span
              key={`cite-${index}-${bIndex}-${cIndex}`}
              className="font-bold text-blue-700 ml-0.5 whitespace-nowrap"
            >
              [{citeMatch[1]}]
            </span>
          );
        }
        return <span key={`text-${index}-${bIndex}-${cIndex}`}>{cPart}</span>;
      });
    });
  });
};

// --- Custom NLP API Simulation (Prototype A: Inline Citations) ---

async function mockNlpApi(query, scenarioId) {
  const delay = Math.floor(Math.random() * 400) + 400;
  await new Promise((resolve) => setTimeout(resolve, delay));
  const text = query.toLowerCase().trim();

  // Scenario-specific logic matching CivicSphere.png
  if (text.includes("tax") || scenarioId === "tax") {
    return {
      text: "To file your local taxes, start by gathering your income statements, specifically your **W-2s** from employers and **1099s** [1] for other income sources. You should also check for eligibility regarding **local deductions** which can significantly reduce your tax liability [2]. Finally, submit your return through our secure digital portal for faster processing [3].",
      citations: [
        {
          id: 1,
          source: "IRS Checklist: What to Bring",
          url: "https://www.irs.gov/filing/gather-your-documents",
        },
        {
          id: 2,
          source: "Publication 501: Filing Status",
          url: "https://apps.irs.gov/app/understandingTaxes/teacher/hows_mod05.jsp#:~:text=filing%20status-,impacts%20the%20calculation%20of%20income%20tax%2C%20affects%20the%20amount%20of,household%2C%20and%20qualifying%20surviving%20spouse.",
        },
        {
          id: 3,
          source: "E-Filing Options Guide 2025",
          url: "https://www.irs.gov/faqs/electronic-filing-e-file",
        },
      ],
    };
  }

  if (text.includes("child") || scenarioId === "benefits") {
    return {
      text: "To apply for childcare benefits, verify your eligibility based on household income [1]. Regional schemes such as the NCS in Ireland or CCS in Australia require portal submission [2]. Key documents include proof of income and employment status [3].",
      citations: [
        {
          id: 1,
          source: "Eligibility & Means Testing Guide",
          url: "https://www.ncs.gov.ie/en/how-to-apply/",
        },
        {
          id: 2,
          source: "Services Australia - Benefit Intake",
          url: "https://www.servicesaustralia.gov.au/child-care-subsidy",
        },
        {
          id: 3,
          source: "PPSN / Income Documentation Guide",
          url: "https://www.gov.ie/en/service/child-benefit/",
        },
      ],
    };
  }

  return {
    text: "I can assist you with local government services [1]. Please select a department or type your specific question below.",
    citations: [
      {
        id: 1,
        source: "CivicSphere General Service Catalog",
        url: "https://www.usa.gov/agencies",
      },
    ],
  };
}

// --- Components ---

const Carousel = () => {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((c) => (c + 1) % CAROUSEL_SLIDES.length),
      5000,
    );
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="relative w-full h-[400px] overflow-hidden bg-slate-900 rounded-[2.5rem] shadow-xl">
      {CAROUSEL_SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-12 bg-gradient-to-t from-black/80 to-transparent text-left">
            <h3 className="text-3xl font-extrabold text-white mb-2 leading-none uppercase tracking-tighter">
              {slide.title}
            </h3>
            <p className="text-white/80 text-xl font-light">{slide.subtitle}</p>
          </div>
        </div>
      ))}
      <div className="absolute bottom-8 left-12 flex gap-2">
        {CAROUSEL_SLIDES.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${i === current ? "bg-white w-8" : "bg-white/30"} transition-all duration-300`}
          />
        ))}
      </div>
    </div>
  );
};

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";
  const data = message.data || { text: message.content, citations: [] };

  if (isUser) {
    return (
      <div className="flex w-full justify-end mb-6">
        <div className="flex max-w-[80%] flex-row-reverse gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white shrink-0 mt-auto shadow-sm">
            <User size={14} />
          </div>
          <div className="bg-blue-700 p-3.5 rounded-2xl rounded-tr-none text-white text-sm shadow-sm leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start mb-6">
      <div className="flex max-w-[95%] flex-row gap-3">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white shadow-sm mt-auto border border-white/20`}
        >
          <Bot size={16} />
        </div>
        <div className="flex flex-col gap-0 w-full bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-lg overflow-hidden">
          <div className="p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {parseBotMessage(data.text, data.citations)}
          </div>

          {data.citations && data.citations.length > 0 && (
            <div className="bg-slate-50 border-t border-slate-100 px-5 py-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">
                Sources
              </div>
              <div className="space-y-2">
                {data.citations.map((cite) => (
                  <a
                    key={cite.id}
                    href={cite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-500 flex items-start gap-2 group cursor-pointer hover:text-blue-700 transition-colors"
                  >
                    <span className="flex-shrink-0 w-4 h-4 rounded bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-[9px] border border-blue-100 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                      {cite.id}
                    </span>
                    <span className="underline decoration-dotted decoration-slate-300 underline-offset-2 group-hover:decoration-blue-700">
                      {cite.source}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeScenario, setActiveScenario] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const chatEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token)
        await signInWithCustomToken(auth, __initial_auth_token);
      else await signInAnonymously(auth);
    };
    init();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const messagesRef = collection(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "messages",
    );
    const q = query(messagesRef, where("scenarioId", "==", activeScenario));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allMsgs = snapshot.docs.map((d) => d.data());
        const msgs = allMsgs
          .filter((m) => m.sessionId === sessionId)
          .sort((a, b) => {
            const timeA = a.createdAt?.toMillis
              ? a.createdAt.toMillis()
              : a.createdAt?.seconds
                ? a.createdAt.seconds * 1000
                : Date.now();
            const timeB = b.createdAt?.toMillis
              ? b.createdAt.toMillis()
              : b.createdAt?.seconds
                ? b.createdAt.seconds * 1000
                : Date.now();
            return timeA - timeB;
          });

        if (msgs.length === 0) {
          const welcomeText = `Welcome to ${SITE_BRAND.name}. How can I assist you with city services today?`;
          addDoc(messagesRef, {
            role: "assistant",
            content: welcomeText,
            data: { text: welcomeText },
            scenarioId: activeScenario,
            sessionId,
            createdAt: serverTimestamp(),
          });
        } else {
          setMessages(msgs);
        }
      },
      (err) => console.error("Firestore error:", err),
    );

    return () => unsubscribe();
  }, [user, activeScenario, sessionId]);

  const handleSend = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inputValue.trim() || !user) return;
    const txt = inputValue;
    setInputValue("");
    setIsTyping(true);
    try {
      const ref = collection(
        db,
        "artifacts",
        appId,
        "users",
        user.uid,
        "messages",
      );
      await addDoc(ref, {
        role: "user",
        content: txt,
        scenarioId: activeScenario,
        sessionId,
        createdAt: serverTimestamp(),
      });
      const resp = await mockNlpApi(txt, activeScenario);
      await addDoc(ref, {
        role: "assistant",
        content: resp.text,
        data: resp,
        scenarioId: activeScenario,
        sessionId,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900 flex flex-col relative overflow-x-hidden">
      {/* Navbar */}
      <nav
        className={`h-16 ${THEME.primary} border-b border-blue-800 sticky top-0 z-50 flex items-center shadow-lg w-full`}
      >
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveScenario("home")}
          >
            <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
              <Grid size={22} className="text-white" />
            </div>
            <span className="font-extrabold text-2xl text-white tracking-tighter uppercase">
              {SITE_BRAND.name}
              <span className="text-blue-100 font-normal opacity-70 lowercase">
                {SITE_BRAND.domain}
              </span>
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => setActiveScenario("home")}
              className="text-[11px] font-black uppercase tracking-widest text-white hover:text-blue-100 transition-colors"
            >
              Home
            </button>
            {Object.values(SCENARIOS).map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveScenario(s.id)}
                className="text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white flex items-center gap-2 transition-colors"
              >
                {React.cloneElement(s.icon, { size: 14 })} {s.name}
              </button>
            ))}
          </div>
          <button className="lg:hidden text-white">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full flex flex-col overflow-y-auto">
        {activeScenario === "home" ? (
          <div className="max-w-7xl mx-auto px-6 py-12 w-full">
            <div
              className={`${THEME.primary} rounded-[2.5rem] p-16 md:p-24 text-center text-white mb-16 shadow-2xl relative overflow-hidden`}
            >
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              <h1 className="text-6xl font-black mb-4 tracking-tighter leading-none uppercase">
                Welcome to {SITE_BRAND.name}
              </h1>
              <p className="text-2xl opacity-90 mb-12 font-light tracking-tight">
                {SITE_BRAND.description}
              </p>
              <button
                onClick={() => setIsOpen(true)}
                className="px-10 py-5 bg-white text-blue-700 rounded-full font-black shadow-2xl hover:scale-105 transition-transform flex items-center gap-3 mx-auto uppercase tracking-widest text-sm"
              >
                <MessageSquare size={22} className="fill-blue-700" /> Open
                Assistant
              </button>
            </div>
            <section className="mb-20">
              <Carousel />
            </section>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
              {Object.values(SCENARIOS).map((scen) => (
                <div
                  key={scen.id}
                  onClick={() => setActiveScenario(scen.id)}
                  className="bg-white border border-slate-100 rounded-[2rem] p-8 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group shadow-sm"
                >
                  <div className="w-14 h-14 rounded-[1rem] bg-blue-50 flex items-center justify-center mb-8 text-blue-700 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                    {React.cloneElement(scen.icon, { size: 30 })}
                  </div>
                  <h3 className="font-black text-xl text-slate-900 mb-3 uppercase tracking-tight">
                    {scen.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-8">
                    {scen.heroSubtitle}
                  </p>
                  <div className="text-blue-700 font-black flex items-center gap-2 group-hover:gap-4 transition-all text-[11px] tracking-widest uppercase">
                    ACCESS <ArrowRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-20 w-full flex-1">
            <div className="bg-white rounded-[3rem] shadow-xl p-16 flex flex-col lg:flex-row gap-16 items-center border border-slate-100">
              <div className="flex-1 space-y-10">
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100 italic">
                  Official Government Portal
                </span>
                <h1 className="text-7xl font-black text-slate-900 leading-tight tracking-tighter uppercase">
                  {SCENARIOS[activeScenario].heroTitle}
                </h1>
                <p className="text-xl text-slate-500 font-light leading-relaxed max-w-2xl">
                  {SCENARIOS[activeScenario].heroSubtitle}
                </p>
                <div className="flex gap-4">
                  <button className="px-10 py-5 bg-blue-700 text-white rounded-2xl font-black shadow-lg hover:bg-blue-800 transition-all uppercase tracking-widest text-sm">
                    Launch Portal
                  </button>
                  <button
                    onClick={() => setIsOpen(true)}
                    className="px-10 py-5 border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all uppercase tracking-widest text-sm"
                  >
                    Consult Assistant
                  </button>
                </div>
              </div>
              <div className="w-full max-w-sm aspect-square bg-slate-50 rounded-[4rem] flex items-center justify-center text-blue-100 shadow-inner">
                {React.cloneElement(SCENARIOS[activeScenario].icon, {
                  size: 160,
                  strokeWidth: 1,
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- Floating Chat Widget --- */}
      <div className="fixed bottom-8 right-8 z-[100]">
        {isOpen && (
          <div className="w-[90vw] md:w-[400px] h-[calc(100vh-140px)] max-h-[650px] bg-white rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 border border-slate-200">
            <div
              className={`h-20 ${THEME.primary} p-6 flex items-center justify-between text-white shrink-0 shadow-lg`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none mb-1 uppercase tracking-tighter">
                    askMe
                  </h3>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest opacity-80">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.8)]"></span>{" "}
                    Live Support
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="opacity-70 hover:opacity-100 transition-opacity p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-3">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-6">
                  <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl rounded-tl-none shadow-sm text-blue-700 text-[10px] font-black uppercase tracking-widest animate-pulse italic">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="p-5 bg-white border-t border-slate-100"
            >
              <div className="relative flex items-center">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-slate-50 border-2 border-blue-600/30 rounded-full py-3.5 pl-6 pr-14 text-sm font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-1.5 p-2 bg-blue-700 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                >
                  <Send size={18} className="rotate-0" />
                </button>
              </div>
            </form>
          </div>
        )}

        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white bg-blue-600 hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20 group overflow-hidden"
          >
            <MessageSquare size={32} className="stroke-[1.5px]" />
          </button>
        )}
      </div>
    </div>
  );
}
