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
  ChevronLeft,
  ChevronRight,
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

// Theme: Classic CivicSphere (Blue)
const THEME = {
  primary: "bg-blue-700",
  primaryHover: "hover:bg-blue-800",
  secondary: "bg-blue-50",
  text: "text-blue-700",
  border: "border-blue-200",
  gradient: "from-blue-700 to-sky-600",
  chatHeader: "bg-blue-600 text-white",
  userBubble: "bg-blue-600 text-white",
  botAvatar: "bg-blue-600 text-white",
  launcher: "bg-blue-600 hover:bg-blue-700",
};

const SCENARIOS = {
  tax: {
    id: "tax",
    name: "Tax Office",
    brand: "TaxCentral",
    icon: "Landmark",
    heroTitle: "File Your Taxes with Confidence",
    heroSubtitle:
      "Our automated systems help you navigate the new fiscal year regulations.",
    querySuggestion: "What documents do I need to file my tax return?",
  },
  vehicle: {
    id: "vehicle",
    name: "Vehicle Services",
    brand: "AutoReg",
    icon: "Car",
    heroTitle: "Vehicle Services Portal",
    heroSubtitle: "Renew registrations, pay fines, and manage titles online.",
    querySuggestion: "How much is the renewal fee?",
  },
  benefits: {
    id: "benefits",
    name: "Unemployment",
    brand: "LaborAssist",
    icon: "Briefcase",
    heroTitle: "Unemployment Assistance",
    heroSubtitle:
      "Supporting the workforce during transitions with financial aid and job placement.",
    querySuggestion: "Am I eligible if I quit?",
  },
  housing: {
    id: "housing",
    name: "Housing Authority",
    brand: "CityHomes",
    icon: "Home",
    heroTitle: "Affordable Housing Initiative",
    heroSubtitle:
      "Connecting families with safe, affordable, and sustainable housing options.",
    querySuggestion: "What is the income limit?",
  },
};

const CAROUSEL_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80",
    title: "Fiscal Responsibility",
    subtitle: "Transparent tax allocation.",
  },
  {
    url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80",
    title: "Infrastructure",
    subtitle: "Building safer roads.",
  },
  {
    url: "https://i.ibb.co/fBDFjRD/labor-day-job-cartoon-24640-41351.avif",
    title: "Workforce",
    subtitle: "Empowering citizens.",
  },
  {
    url: "https://i.ibb.co/M0WT8Xq/real-estate-management-concept-property-investment-online-housing-rental-service-realty-business-sma.webp",
    title: "Housing",
    subtitle: "Initiatives for every family.",
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
};

const PROTOTYPES = [
  {
    id: "A",
    name: "Inline Citations",
    icon: <sup className="font-bold text-xs">[1]</sup>,
  },
];

// --- Helper: Markdown Link Parser (For Citations) ---
const parseMarkdownLinks = (text) => {
  if (!text) return null;
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (match) {
      return (
        <a
          key={index}
          href={match[2]}
          className="text-blue-200 font-semibold hover:underline decoration-blue-300 underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[1]}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

// Custom parser for rendering links in the plain text part of bubbles (dark text context)
const parseBodyLinks = (text) => {
  if (!text) return null;
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (match) {
      return (
        <a
          key={index}
          href={match[2]}
          className="text-blue-600 font-bold hover:text-blue-800 hover:underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[1]}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

// --- Custom NLP API Simulation (Prototype A) ---

async function mockNlpApi(query, scenarioId) {
  const delay = Math.floor(Math.random() * 800) + 400;
  await new Promise((resolve) => setTimeout(resolve, delay));
  const text = query.toLowerCase();

  // --- Greeting ---
  if (
    text.match(
      /\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/,
    )
  ) {
    if (scenarioId === "home") {
      return {
        text: "Welcome to CivicSphere. I can direct you to the Tax Office [1], Vehicle Services [2], Unemployment Benefits [3], or Housing Authority [4].",
        citations: [
          { id: 1, source: "Department of Revenue", url: "#tax" },
          { id: 2, source: "Department of Motor Vehicles", url: "#vehicle" },
          { id: 3, source: "Department of Labor", url: "#benefits" },
          { id: 4, source: "Department of Housing", url: "#housing" },
        ],
      };
    } else {
      const scen = SCENARIOS[scenarioId];
      return {
        text: `Hello! I am the ${scen.name} Assistant. How can I help you today? Please refer to our user guide [1] for common questions.`,
        citations: [
          { id: 1, source: `${scen.brand} User Guide`, url: "#help" },
        ],
      };
    }
  }

  // --- Home Page Logic ---
  if (scenarioId === "home") {
    // Check for specific "how to file" intent FIRST before generic routing
    if (
      (text.includes("file") ||
        text.includes("return") ||
        text.includes("process") ||
        text.includes("how to")) &&
      text.includes("tax")
    ) {
      return {
        text: "Filing a tax return is a comprehensive process that begins with preparation. First, you must gather all necessary income documents, specifically your [W-2s](https://www.irs.gov/forms-pubs/about-form-w-2) from employers and [1099s](https://www.irs.gov/forms-pubs/about-form-1099) for other income sources [1]. Next, determine your filing status (e.g., Single, Married Filing Jointly) as this impacts your standard deduction [2]. You can then choose to file electronically for a faster refund or mail a paper return [3]. Finally, review your return for errors and ensure you sign and date it before submission to avoid processing delays.",
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
            source: "Publication 17: Filing Options",
            url: "https://www.irs.gov/publications/p17",
          },
        ],
      };
    }

    if (text.includes("tax")) {
      return {
        text: "For general tax inquiries, visit the Tax Office [1]. They handle filings and deductions [2].",
        citations: [
          { id: 1, source: "Dept of Revenue", url: "#" },
          { id: 2, source: "IRS Guidelines", url: "#" },
        ],
      };
    }
    if (text.includes("vehicle") || text.includes("car")) {
      return {
        text: "Driver services are handled by the Vehicle Services Department [1]. You can renew licenses online [2].",
        citations: [
          { id: 1, source: "DMV Directory", url: "#" },
          { id: 2, source: "Online Portal", url: "#" },
        ],
      };
    }
    if (text.includes("benefit") || text.includes("unemployment")) {
      return {
        text: "Unemployment assistance is managed by the Department of Labor [1]. See eligibility rules [2].",
        citations: [
          { id: 1, source: "LaborAssist Portal", url: "#" },
          { id: 2, source: "Worker Rights Handbook", url: "#" },
        ],
      };
    }
    if (text.includes("housing")) {
      return {
        text: "Housing assistance programs are available via the Housing Authority [1]. Check income limits [2].",
        citations: [
          { id: 1, source: "CityHomes", url: "#" },
          { id: 2, source: "HUD Guidelines", url: "#" },
        ],
      };
    }
    // Generic Fallback
    return {
      text: "I can help with that service. Please select a department from the directory [1].",
      citations: [{ id: 1, source: "CivicSphere Directory", url: "#" }],
    };
  }

  // --- Scenario Logic (Prototype A) ---

  // Tax
  if (scenarioId === "tax") {
    // Specific "What documents..." query logic
    if (
      text.includes("document") ||
      (text.includes("what") && text.includes("need"))
    ) {
      return {
        text: "To prepare your return, you must gather [W-2s](https://www.irs.gov/forms-pubs/about-form-w-2) from all employers and [1099s](https://www.irs.gov/forms-pubs/about-form-1099) to report independent income. Additionally, collect receipts for any itemized deductions [1] you plan to claim.",
        citations: [
          { id: 1, source: "IRS.gov: Income Info", url: "#" },
          { id: 2, source: "Taxpayer Advocate: Form 1099", url: "#" },
          { id: 3, source: "Schedule A Instructions", url: "#" },
        ],
      };
    }

    if (
      text.includes("file") ||
      text.includes("return") ||
      text.includes("how to")
    ) {
      return {
        text: "Filing a tax return is a comprehensive process that begins with preparation. First, you must gather all necessary income documents, specifically your [W-2s](https://www.irs.gov/forms-pubs/about-form-w-2) from employers and [1099s](https://www.irs.gov/forms-pubs/about-form-1099) for other income sources [1]. Next, determine your filing status (e.g., Single, Married Filing Jointly) as this impacts your standard deduction [2]. You can then choose to file electronically for a faster refund or mail a paper return [3]. Finally, review your return for errors and ensure you sign and date it before submission to avoid processing delays.",
        citations: [
          {
            id: 1,
            source: "IRS Checklist: What to Bring",
            url: "https://www.irs.gov/filing/gather-your-documents",
          },
          {
            id: 2,
            source: "Publication 501: Filing Status",
            url: "https://apps.irs.gov/app/understandingTaxes/teacher/hows_mod05.jsp#:~:text=filing%20status-,impacts%20the%20calculation%20of%20income%20tax%2C%20affects%20the%20amount%20of,household%2C%20and%20qualifying%20surviving%20spouse",
          },
          {
            id: 3,
            source: "Publication 17: Filing Options",
            url: "https://www.irs.gov/publications/p17",
          },
        ],
      };
    }
    if (text.includes("office") || text.includes("home")) {
      return {
        text: "Yes, you can deduct home office expenses if the space is used exclusively for business [1]. The simplified method allows $5 per square foot [2].",
        citations: [
          { id: 1, source: "IRS Pub 587", url: "#" },
          { id: 2, source: "Tax Topic 509", url: "#" },
        ],
      };
    }
  }

  // Vehicle
  if (scenarioId === "vehicle") {
    if (text.includes("renew") || text.includes("registration")) {
      return {
        text: "To renew your registration, verify your insurance status [1] and ensure your emissions test is valid. You can then complete the renewal online using your RIN number [2].",
        citations: [
          { id: 1, source: "Insurance Verification Database", url: "#" },
          { id: 2, source: "Online Renewal Portal", url: "#" },
        ],
      };
    }
    if (text.includes("fee")) {
      return {
        text: "The standard renewal fee is $75.00 [1]. Late fees of $20 apply after 30 days [2].",
        citations: [
          { id: 1, source: "State Statute 45.2", url: "#" },
          { id: 2, source: "Reg 12-B", url: "#" },
        ],
      };
    }
  }

  // Benefits
  if (scenarioId === "benefits") {
    if (text.includes("apply") || text.includes("unemployment")) {
      return {
        text: "To apply for benefits, you must first create an account on the Claimant Portal [1]. You will need your employment history for the last 18 months [2].",
        citations: [
          { id: 1, source: "LaborAssist Claimant Portal", url: "#" },
          { id: 2, source: "Application Checklist", url: "#" },
        ],
      };
    }
  }

  // Housing
  if (scenarioId === "housing") {
    if (text.includes("limit") || text.includes("income")) {
      return {
        text: "The income limit is $52,400 for a family of four [1]. This is 50% of the Area Median Income [2].",
        citations: [
          { id: 1, source: "HUD 2024 Memo", url: "#" },
          { id: 2, source: "AMI Tables", url: "#" },
        ],
      };
    }
    if (text.includes("waitlist")) {
      return {
        text: "The Section 8 waitlist is currently open [1]. Priority is given to local residents and veterans [2].",
        citations: [
          { id: 1, source: "Public Notice 22-A", url: "#" },
          { id: 2, source: "Administrative Plan Ch. 3", url: "#" },
        ],
      };
    }
  }

  // Default Fallback
  return {
    text: "I can help with that service. Please be more specific or check the official FAQ [1].",
    citations: [{ id: 1, source: "General FAQ", url: "#" }],
  };
}

// --- Components ---

// Image Carousel Component
const Carousel = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent(
      (prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length,
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl mb-12 group border border-white/20 bg-gray-900">
      {/* Slides */}
      {CAROUSEL_SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex flex-col justify-end p-8">
            <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
              {slide.title}
            </h3>
            <p className="text-white/90 text-lg drop-shadow-sm">
              {slide.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 border border-white/10 z-20"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 border border-white/10 z-20"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {CAROUSEL_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === current
                ? "bg-white w-8"
                : "bg-white/50 w-2 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const CitationTooltip = ({ id, source, url }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative inline-block cursor-pointer ml-1 text-blue-600 font-bold hover:text-blue-800 hover:underline"
  >
    [{id}]
    <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded p-2 z-50 text-center shadow-lg pointer-events-none no-underline">
      Source: {source}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
    </span>
  </a>
);

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";
  const data = message.data || { text: message.content };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div
          className={`max-w-[85%] p-3 rounded-2xl rounded-tr-none text-sm ${THEME.userBubble}`}
        >
          {/* User message: Also parse markdown links if user types them, though simpler */}
          {parseMarkdownLinks(message.content)}
        </div>
      </div>
    );
  }

  // Prototype A Rendering (Inline Citations)
  return (
    <div className="flex justify-start mb-4 gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${THEME.botAvatar}`}
      >
        <Bot size={16} />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-0 shadow-sm max-w-[90%] overflow-hidden">
        {/* Main Text Content */}
        <div className="p-4 text-sm leading-relaxed text-gray-800">
          {data.text.split(/(\[\d+\])/g).map((part, index) => {
            const match = part.match(/\[(\d+)\]/);
            if (match) {
              const cid = parseInt(match[1]);
              const citation = data.citations?.find((c) => c.id === cid);
              return (
                <CitationTooltip
                  key={index}
                  id={cid}
                  source={citation?.source || "Source"}
                  url={citation?.url || "#"}
                />
              );
            }
            return <span key={index}>{parseBodyLinks(part)}</span>;
          })}
        </div>

        {/* Distinct Footer Source List */}
        {data.citations?.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-100 p-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Sources
            </span>
            <ul className="space-y-1.5">
              {data.citations.map((c) => (
                <li
                  key={c.id}
                  className="text-xs flex items-start gap-2 text-gray-600"
                >
                  <span className="font-mono text-blue-600 font-bold text-[10px] bg-blue-50 px-1 rounded border border-blue-100">
                    {c.id}
                  </span>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-700 hover:underline truncate"
                  >
                    {c.source}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [activeScenario, setActiveScenario] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // NEW: Session ID to isolate chats per page load
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const chatEndRef = useRef(null);

  // Auth: Anonymous Sign-in for Persistence
  useEffect(() => {
    const init = async () => {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    init();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Sync Chat History from Firestore
  useEffect(() => {
    if (!user) return;

    // Path: /artifacts/{appId}/users/{userId}/messages
    const messagesRef = collection(
      db,
      "artifacts",
      appId,
      "users",
      user.uid,
      "messages",
    );

    // Query filtered by current scenario
    const q = query(messagesRef, where("scenarioId", "==", activeScenario));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map((d) => d.data());

      // Client-side filtering for current session and sorting
      const msgs = allMsgs
        .filter((m) => m.sessionId === sessionId)
        .sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeA - timeB;
        });

      if (msgs.length === 0) {
        // Create initial welcome message if history is empty for this session
        const welcome = {
          text:
            activeScenario === "home"
              ? `Welcome to ${SITE_BRAND.name}.`
              : `How can I help you with ${SCENARIOS[activeScenario].name}?`,
          citations: [],
        };
        addDoc(messagesRef, {
          role: "assistant",
          content: welcome.text,
          data: welcome,
          scenarioId: activeScenario,
          sessionId: sessionId,
          createdAt: serverTimestamp(),
        });
      } else {
        setMessages(msgs);
      }
    });
    return () => unsubscribe();
  }, [user, activeScenario, sessionId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;
    const txt = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      const messagesRef = collection(
        db,
        "artifacts",
        appId,
        "users",
        user.uid,
        "messages",
      );

      // Save User Message
      await addDoc(messagesRef, {
        role: "user",
        content: txt,
        scenarioId: activeScenario,
        sessionId: sessionId,
        createdAt: serverTimestamp(),
      });

      // Get Bot Response (Mock NLP)
      const resp = await mockNlpApi(txt, activeScenario);

      // Save Bot Message
      await addDoc(messagesRef, {
        role: "assistant",
        content: resp.text,
        data: resp,
        scenarioId: activeScenario,
        sessionId: sessionId,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  const scenario = activeScenario === "home" ? null : SCENARIOS[activeScenario];
  const activeProtoData = { id: "A", name: "Inline Citations" };

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-900">
      {/* Navbar */}
      <div
        className={`h-16 ${THEME.primary} text-white flex items-center px-6 shadow-md justify-between sticky top-0 z-30`}
      >
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setActiveScenario("home")}
        >
          <Grid /> <span className="font-bold text-xl">{SITE_BRAND.name}</span>{" "}
          <span className="opacity-50 text-sm">{SITE_BRAND.domain}</span>
        </div>
        <div className="hidden md:flex gap-4 text-sm font-medium opacity-90">
          <button
            onClick={() => setActiveScenario("home")}
            className="hover:underline"
          >
            Home
          </button>
          {Object.values(SCENARIOS).map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s.id)}
              className="hover:underline flex items-center gap-1"
            >
              {React.createElement(ICON_MAP[s.icon], { size: 14 })} {s.name}
            </button>
          ))}
        </div>
        <button
          className="md:hidden p-2 hover:bg-white/10 rounded"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Menu size={24} />
        </button>
      </div>

      {showMobileMenu && (
        <div className="md:hidden bg-slate-800 text-white p-4 absolute w-full z-20 space-y-2">
          <button
            onClick={() => {
              setActiveScenario("home");
              setShowMobileMenu(false);
            }}
            className="block w-full text-left p-2 hover:bg-slate-700 rounded"
          >
            Home
          </button>
          {Object.values(SCENARIOS).map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveScenario(s.id);
                setShowMobileMenu(false);
              }}
              className="block w-full text-left p-2 hover:bg-slate-700 rounded flex items-center gap-2"
            >
              {React.createElement(ICON_MAP[s.icon], { size: 14 })} {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 pb-24">
        {activeScenario === "home" ? (
          <>
            <div
              className={`rounded-3xl p-12 mb-8 text-center text-white shadow-xl ${THEME.gradient} bg-gradient-to-r`}
            >
              <h1 className="text-5xl font-bold mb-4">
                Welcome to {SITE_BRAND.name}
              </h1>
              <p className="text-xl opacity-90 mb-8">
                {SITE_BRAND.description}
              </p>
              <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-3 bg-white text-gray-900 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
              >
                <MessageSquare size={20} /> Open Assistant
              </button>
            </div>

            <Carousel />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.values(SCENARIOS).map((scen) => (
                <div
                  key={scen.id}
                  onClick={() => setActiveScenario(scen.id)}
                  className="group bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-blue-400 hover:shadow-xl transition-all relative overflow-hidden"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white ${THEME.primary}`}
                  >
                    {React.createElement(ICON_MAP[scen.icon], { size: 24 })}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    {scen.name}
                  </h3>
                  <p className="text-sm text-slate-500">{scen.heroSubtitle}</p>
                  <div className="mt-4 text-blue-600 font-bold text-xs uppercase flex items-center gap-1 group-hover:gap-2 transition-all">
                    Access <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats / Filler */}
            <div className="mt-20 border-t border-gray-200 pt-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center opacity-60">
              <div>
                <div className="text-3xl font-bold text-slate-900">4.2m</div>
                <div className="text-sm text-slate-500">Citizens Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">99.9%</div>
                <div className="text-sm text-slate-500">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">24/7</div>
                <div className="text-sm text-slate-500">Support Access</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">A+</div>
                <div className="text-sm text-slate-500">Security Rating</div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 border border-gray-100 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${THEME.secondary} ${THEME.text}`}
              >
                Official Department
              </span>
              <h1 className="text-4xl font-bold text-slate-900">
                {SCENARIOS[activeScenario].heroTitle}
              </h1>
              <p className="text-gray-600 text-lg">
                {SCENARIOS[activeScenario].heroSubtitle}
              </p>
              <div className="flex gap-4">
                <button
                  className={`px-6 py-3 rounded-lg text-white font-medium ${THEME.primary}`}
                >
                  Start Service
                </button>
                <button
                  onClick={() => setIsOpen(true)}
                  className="px-6 py-3 rounded-lg bg-white border border-gray-200 text-slate-700 font-medium hover:bg-gray-50 flex items-center gap-2"
                >
                  <MessageSquare size={16} /> Ask Assistant
                </button>
              </div>
            </div>
            <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
              {React.createElement(ICON_MAP[SCENARIOS[activeScenario].icon], {
                size: 80,
              })}
            </div>
          </div>
        )}
      </main>

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        {isOpen && (
          <div className="w-[90vw] md:w-[380px] h-[550px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 mb-4 border border-gray-200">
            <div
              className={`p-4 flex justify-between items-center ${THEME.chatHeader}`}
            >
              <div className={`flex items-center gap-2 font-bold text-white`}>
                <Bot size={20} /> askMe
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white opacity-80 hover:opacity-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-none border shadow-sm">
                    <span className="animate-pulse text-gray-400">...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-3 border-t bg-white">
              <div className="flex gap-2">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={`p-2 rounded-full text-white ${THEME.primary} disabled:opacity-50`}
                >
                  <Send size={18} />
                </button>
              </div>
              {activeScenario !== "home" && (
                <button
                  type="button"
                  onClick={() =>
                    setInputValue(SCENARIOS[activeScenario].querySuggestion)
                  }
                  className="mt-2 text-xs text-blue-600 hover:underline w-full text-center"
                >
                  Suggestion: "{SCENARIOS[activeScenario].querySuggestion}"
                </button>
              )}
            </form>
          </div>
        )}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-transform hover:scale-110 ${THEME.launcher}`}
          >
            <MessageSquare size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
