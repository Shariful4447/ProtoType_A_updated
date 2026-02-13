import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, X, MessageSquare, Landmark, Car, Briefcase, Building, ArrowRight, Grid, Home, Menu, FileText } from 'lucide-react';

// --- Configuration & Data ---

const SITE_BRAND = {
  name: "CivicSphere",
  domain: ".gov",
  description: "The Unified Citizen Services Portal"
};

const SCENARIOS = {
  tax: {
    id: 'tax',
    name: 'Tax Office',
    brand: 'TaxCentral',
    color: 'blue',
    icon: <Landmark size={24} />,
    defaultPrototype: 'A',
    heroTitle: 'File Your Taxes with Confidence',
    heroSubtitle: 'Our automated systems help you navigate the new fiscal year regulations.',
    querySuggestion: "Can I deduct home office expenses?",
  },
  vehicle: {
    id: 'vehicle',
    name: 'Vehicle Services',
    brand: 'AutoReg',
    color: 'zinc',
    icon: <Car size={24} />,
    defaultPrototype: 'A',
    heroTitle: 'Vehicle Services Portal',
    heroSubtitle: 'Renew registrations, pay fines, and manage titles online.',
    querySuggestion: "How much is the renewal fee?",
  },
  benefits: {
    id: 'benefits',
    name: 'Unemployment',
    brand: 'LaborAssist',
    color: 'emerald',
    icon: <Briefcase size={24} />,
    defaultPrototype: 'A',
    heroTitle: 'Unemployment Assistance',
    heroSubtitle: 'Supporting the workforce during transitions with financial aid and job placement.',
    querySuggestion: "Am I eligible if I quit?",
  },
  housing: {
    id: 'housing',
    name: 'Housing Authority',
    brand: 'CityHomes',
    color: 'orange',
    icon: <Building size={24} />,
    defaultPrototype: 'A',
    heroTitle: 'Affordable Housing Initiative',
    heroSubtitle: 'Connecting families with safe, affordable, and sustainable housing options.',
    querySuggestion: "What is the income limit?",
  }
};

const PROTOTYPES = [
  { id: 'A', name: 'Inline Citations', icon: <sup className="font-bold text-xs">[1]</sup> }
];

// --- Custom NLP API Simulation ---

/**
 * This function simulates a backend API with Natural Language Processing capabilities.
 * It analyzes the user's query text and the current department context to generate
 * a dynamic response with citations.
 */
async function mockNlpApi(query, scenarioId) {
  // Simulate network latency (500ms - 1.5s)
  const delay = Math.floor(Math.random() * 1000) + 500;
  await new Promise(resolve => setTimeout(resolve, delay));

  const text = query.toLowerCase();

  // --- GREETING HANDLING ---
  // Returns a friendly welcome instead of the "I can only handle..." exception
  if (text.match(/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/)) {
    if (scenarioId === 'home') {
      return {
        text: "Hello! Welcome to CivicSphere. I can direct you to the Tax Office [1], Vehicle Services [2], Unemployment Benefits [3], or Housing Authority [4].",
        citations: [
          { id: 1, source: "Department of Revenue", url: "#tax" },
          { id: 2, source: "Department of Motor Vehicles", url: "#vehicle" },
          { id: 3, source: "Department of Labor", url: "#labor" },
          { id: 4, source: "Department of Housing", url: "#housing" }
        ]
      };
    } else {
      const scen = SCENARIOS[scenarioId];
      return {
        text: `Hello! I am the ${scen.name} Assistant. How can I help you today? Please refer to our user guide [1] for common questions.`,
        citations: [{id: 1, source: `${scen.brand} User Guide`, url: "#help"}]
      };
    }
  }
  
  // 1. Home Page Logic (Routing & Direct Answers)
  if (scenarioId === 'home') {
    // --- DETAILED "HOW TO" RESPONSES FOR HOME PAGE ---
    
    // Tax Filing Process
    if ((text.includes('tax') && (text.includes('file') || text.includes('return') || text.includes('process'))) || text.includes('how to file')) {
       return {
         text: "Filing a tax return involves three main steps. First, gather your income documents like W-2s and 1099s [1]. Next, choose a filing method such as e-filing or mailing paper forms [2]. Finally, submit your return and track your refund status online [3].",
         citations: [
           {id: 1, source: "IRS Checklist: What to Bring", url: "https://www.irs.gov/checklist"},
           {id: 2, source: "Publication 17: Filing Options", url: "https://www.irs.gov/pub17"},
           {id: 3, source: "Tax Office Portal", url: "#tax"}
         ]
       };
    }

    // Vehicle Renewal Process
    if (text.includes('renew') && (text.includes('license') || text.includes('registration') || text.includes('car'))) {
      return {
        text: "To renew your registration, verify your insurance status [1] and ensure your emissions test is valid. You can then complete the renewal online using your RIN number found on your renewal notice [2].",
        citations: [
          {id: 1, source: "Insurance Verification Database", url: "#insurance"},
          {id: 2, source: "Vehicle Services Portal", url: "#vehicle"}
        ]
      };
    }

    // Unemployment Application Process
    if ((text.includes('benefit') || text.includes('unemployment')) && (text.includes('apply') || text.includes('start') || text.includes('claim'))) {
      return {
        text: "To apply for benefits, you must first create an account on the Claimant Portal [1]. You will need your employment history for the last 18 months. After applying, you must certify your eligibility weekly [2].",
        citations: [
          {id: 1, source: "LaborAssist Claimant Portal", url: "#benefits"},
          {id: 2, source: "Weekly Certification Guide", url: "#certify"}
        ]
      };
    }

    // Housing Application Process
    if ((text.includes('housing') || text.includes('section 8')) && (text.includes('apply') || text.includes('waitlist'))) {
      return {
        text: "Applying for housing assistance starts with submitting a pre-application during the open enrollment period [1]. If selected via lottery, you will be invited for an eligibility interview [2].",
        citations: [
          {id: 1, source: "Housing Choice Voucher Fact Sheet", url: "#voucher"},
          {id: 2, source: "CityHomes Applicant Portal", url: "#housing"}
        ]
      };
    }

    // --- GENERIC ROUTING (Fallback for vague queries) ---

    if (text.includes('tax') || text.includes('money') || text.includes('audit')) {
      return {
        text: "For tax-related inquiries, please visit the Tax Office [1]. They handle filings and deductions [2].",
        citations: [
          {id: 1, source: "Department of Revenue", url: "#tax-office"},
          {id: 2, source: "IRS Guidelines", url: "https://www.irs.gov"}
        ]
      };
    }
    if (text.includes('car') || text.includes('drive') || text.includes('license') || text.includes('vehicle')) {
      return {
        text: "Driver services are handled by the Vehicle Services Department [1]. You can renew licenses online [2].",
        citations: [
          {id: 1, source: "DMV Directory", url: "#dmv"},
          {id: 2, source: "Online Portal Map", url: "#portal"}
        ]
      };
    }
    if (text.includes('job') || text.includes('work') || text.includes('fire') || text.includes('quit')) {
      return {
        text: "Unemployment assistance is managed by the Department of Labor [1]. See eligibility rules [2].",
        citations: [
          {id: 1, source: "LaborAssist Portal", url: "#labor"},
          {id: 2, source: "Worker Rights Handbook", url: "#handbook"}
        ]
      };
    }
    if (text.includes('house') || text.includes('rent') || text.includes('home')) {
      return {
        text: "Housing assistance programs are available via the Housing Authority [1]. Check income limits [2].",
        citations: [
          {id: 1, source: "CityHomes", url: "#housing"},
          {id: 2, source: "HUD Guidelines", url: "#hud"}
        ]
      };
    }
    
    // EXCEPTION HANDLING FOR HOME
    return {
      text: "I can only handle inquiries related to CivicSphere services (Tax, Vehicle, Benefits, Housing). Please check your query or use the menu to navigate [1].",
      citations: [
        { id: 1, source: "CivicSphere User Guide", url: "#help" }
      ]
    };
  }

  // 2. Tax Office Logic
  if (scenarioId === 'tax') {
    if (text.includes('office') || text.includes('home')) {
      return {
        text: "Yes, you can deduct home office expenses if the space is used exclusively for business [1]. The simplified method allows $5 per square foot [2].",
        citations: [
          {id: 1, source: "IRS Pub 587", url: "https://www.irs.gov/publications/p587"}, 
          {id: 2, source: "Tax Topic 509", url: "https://www.irs.gov/taxtopics/tc509"}
        ]
      };
    }
    if (text.includes('return') || text.includes('file') || text.includes('process') || text.includes('how to')) {
       return {
         text: "Filing a tax return involves three main steps. First, gather your income documents like W-2s and 1099s [1]. Next, choose a filing method such as e-filing or mailing paper forms [2]. Finally, submit your return and track your refund status online [3].",
         citations: [
           {id: 1, source: "IRS Checklist: What to Bring", url: "https://www.irs.gov/checklist"},
           {id: 2, source: "Publication 17: Filing Options", url: "https://www.irs.gov/pub17"},
           {id: 3, source: "Where's My Refund Tool", url: "https://www.irs.gov/refunds"}
         ]
       };
    }
    if (text.includes('deadline') || text.includes('when')) {
      return {
        text: "The filing deadline for this fiscal year is April 15th [1]. Extensions can be requested via Form 4868 [2].",
        citations: [
          {id: 1, source: "IRS Calendar", url: "#calendar"}, 
          {id: 2, source: "Form 4868 Instructions", url: "#form4868"}
        ]
      };
    }
    
    // EXCEPTION HANDLING FOR TAX
    return {
      text: "I am the Tax Assistant. I can only handle queries related to tax filings, deductions, and revenue services. Please check your query [1].",
      citations: [
        {id: 1, source: "TaxCentral Scope of Service", url: "#scope"}
      ]
    };
  }

  // 3. Vehicle Services Logic
  if (scenarioId === 'vehicle') {
    if (text.includes('fee') || text.includes('cost') || text.includes('much')) {
      return {
        text: "The standard renewal fee is $75.00 [1]. Late fees of $20 apply after 30 days [2].",
        citations: [
          {id: 1, source: "State Statute 45.2", url: "#statute"}, 
          {id: 2, source: "Reg 12-B", url: "#reg12b"}
        ]
      };
    }
    if (text.includes('renew') || text.includes('registration')) {
      return {
        text: "To renew your registration, verify your insurance status [1] and ensure your emissions test is valid. You can then complete the renewal online using your RIN number found on your renewal notice [2].",
        citations: [
          {id: 1, source: "Insurance Verification Database", url: "#insurance"},
          {id: 2, source: "Online Renewal Portal", url: "#renew"}
        ]
      };
    }
    if (text.includes('license')) {
      return {
        text: "Driver's licenses must be renewed every 4 years [1]. You can renew online if you have no outstanding fines [2].",
        citations: [
          {id: 1, source: "Driver's Manual Ch. 4", url: "#manual"}, 
          {id: 2, source: "Online Eligibility Rules", url: "#rules"}
        ]
      };
    }
    
    // EXCEPTION HANDLING FOR VEHICLE
    return {
      text: "I am the Vehicle Services Assistant. I can only handle queries related to vehicle registration, licenses, and traffic fines. Please check your query [1].",
      citations: [{id: 1, source: "AutoReg FAQ", url: "#faq"}]
    };
  }

  // 4. Unemployment Logic
  if (scenarioId === 'benefits') {
    if (text.includes('apply') || text.includes('start') || text.includes('claim')) {
      return {
        text: "To apply for benefits, you must first create an account on the Claimant Portal [1]. You will need your employment history for the last 18 months. After applying, you must certify your eligibility weekly [2].",
        citations: [
          {id: 1, source: "LaborAssist Claimant Portal", url: "#portal"},
          {id: 2, source: "Weekly Certification Guide", url: "#certify"}
        ]
      };
    }
    if (text.includes('quit') || text.includes('leave') || text.includes('resign')) {
      return {
        text: "Voluntary resignation usually disqualifies applicants [1], unless 'good cause' is proven [2].",
        citations: [
          {id: 1, source: "Section 402(a)", url: "#section402"}, 
          {id: 2, source: "Handbook 10.4", url: "#handbook10"}
        ]
      };
    }
    if (text.includes('fired') || text.includes('terminate')) {
      return {
        text: "If terminated for misconduct, benefits may be denied [1]. You have the right to appeal this decision [2].",
        citations: [
          {id: 1, source: "Labor Code 1256", url: "#code1256"}, 
          {id: 2, source: "Appeals Process Guide", url: "#appeals"}
        ]
      };
    }
    
    // EXCEPTION HANDLING FOR BENEFITS
    return {
      text: "I am the Unemployment Assistant. I can only handle queries related to unemployment benefits and worker claims. Please check your query [1].",
      citations: [{id: 1, source: "LaborAssist Guidelines", url: "#guidelines"}]
    };
  }

  // 5. Housing Logic
  if (scenarioId === 'housing') {
    if (text.includes('apply') || text.includes('voucher') || text.includes('process')) {
      return {
        text: "Applying for housing assistance starts with submitting a pre-application during the open enrollment period [1]. If selected via lottery, you will be invited for an eligibility interview [2].",
        citations: [
          {id: 1, source: "Housing Choice Voucher Fact Sheet", url: "#voucher"},
          {id: 2, source: "Applicant Portal", url: "#portal"}
        ]
      };
    }
    if (text.includes('limit') || text.includes('income') || text.includes('salary')) {
      return {
        text: "The income limit is $52,400 for a family of four [1]. This is 50% of the Area Median Income [2].",
        citations: [
          {id: 1, source: "HUD 2024 Memo", url: "#hud2024"}, 
          {id: 2, source: "AMI Tables", url: "#ami"}
        ]
      };
    }
    if (text.includes('waitlist')) {
      return {
        text: "The Section 8 waitlist is currently open [1]. Priority is given to local residents and veterans [2].",
        citations: [
          {id: 1, source: "Public Notice 22-A", url: "#notice"}, 
          {id: 2, source: "Administrative Plan Ch. 3", url: "#adminplan"}
        ]
      };
    }
    
    // EXCEPTION HANDLING FOR HOUSING
    return {
      text: "I am the Housing Authority Assistant. I can only handle queries related to affordable housing and Section 8. Please check your query [1].",
      citations: [{id: 1, source: "CityHomes Charter", url: "#charter"}]
    };
  }

  // Generic Fallback (Should be unreachable if all scenarios are covered)
  return {
    text: "I can only handle inquiries related to CivicSphere services. Please check your query [1].",
    citations: [
      {id: 1, source: "System Help", url: "#help"}
    ]
  };
}

// --- Sub-Components ---

const CitationTooltip = ({ id, source, url }) => (
  <a 
    href={url} 
    target="_blank" 
    rel="noopener noreferrer"
    className="group relative inline-block cursor-pointer ml-1 text-blue-600 font-bold hover:text-blue-800 hover:underline decoration-blue-800 underline-offset-2"
  >
    [{id}]
    <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded p-2 z-50 text-center shadow-lg pointer-events-none no-underline">
      Source: {source}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
    </span>
  </a>
);

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex w-full justify-end mb-4">
        <div className="flex max-w-[90%] flex-row-reverse gap-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-600 text-white shadow-sm mt-auto">
            <User size={14} />
          </div>
          <div className="relative p-3 rounded-2xl shadow-sm bg-indigo-600 text-white rounded-br-none text-sm">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // --- Bot Content Logic (Prototype A) ---
  const responseData = message.data || { 
    text: message.content, 
    citations: [] 
  };

  return (
    <div className="flex w-full justify-start mb-4">
      <div className="flex max-w-[90%] flex-row gap-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-900 text-white shadow-sm mt-auto">
          <Bot size={14} />
        </div>
        <div className="relative p-3 rounded-2xl shadow-sm bg-white border border-gray-100 text-gray-800 rounded-bl-none">
          <div className="text-sm">
            <div className="leading-relaxed">
              {responseData.text.split(/(\[\d+\])/g).map((part, index) => {
                const match = part.match(/\[(\d+)\]/);
                if (match) {
                  const citationId = parseInt(match[1]);
                  const citation = responseData.citations?.find(c => c.id === citationId);
                  // Safety check if citation exists
                  const source = citation ? citation.source : "Source";
                  const url = citation ? citation.url : "#";
                  return <CitationTooltip key={index} id={citationId} source={source} url={url} />;
                }
                return <span key={index}>{part}</span>;
              })}
            </div>
            {responseData.citations && responseData.citations.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                <strong>Sources:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  {responseData.citations.map(c => (
                    <li key={c.id}>
                      <a 
                        href={c.url || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 cursor-pointer hover:underline"
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
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeScenario, setActiveScenario] = useState('home');
  const [activePrototype, setActivePrototype] = useState('A'); 
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // --- Navigation Handler ---
  const handleNavigate = (scenarioId) => {
    setActiveScenario(scenarioId);
    setShowMobileMenu(false);
    setIsOpen(false); 
    
    // Reset Chat State based on destination
    setTimeout(() => {
      setActivePrototype('A');
      
      let welcomeMsg;
      if (scenarioId === 'home') {
        welcomeMsg = { 
          text: "Welcome to CivicSphere. I can direct you to the Tax Office [1], Vehicle Services [2], Unemployment Benefits [3], or Housing Authority [4].",
          citations: [
            { id: 1, source: "Department of Revenue", url: "#tax" },
            { id: 2, source: "Department of Motor Vehicles", url: "#vehicle" },
            { id: 3, source: "Department of Labor", url: "#labor" },
            { id: 4, source: "Department of Housing", url: "#housing" }
          ]
        };
      } else {
        const scenario = SCENARIOS[scenarioId];
        welcomeMsg = {
          text: `Welcome to the ${scenario.name} Assistant. How can I help you today?`,
          citations: []
        };
      }

      setMessages([{ 
        role: 'assistant', 
        data: welcomeMsg
      }]);
    }, 400);
  };

  // Initial Load
  useEffect(() => {
    handleNavigate('home');
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue("");
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsTyping(true);

    // Call Custom Local API
    const aiResponse = await mockNlpApi(userText, activeScenario);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'assistant', data: aiResponse }]);
  };

  // --- Helper Data ---
  const scenario = activeScenario === 'home' ? null : SCENARIOS[activeScenario];
  const activeProtoData = PROTOTYPES[0];

  const getThemeClass = () => {
    if (activeScenario === 'home') return 'from-slate-800 to-slate-900';
    const map = {
      tax: 'from-blue-700 to-sky-600',
      vehicle: 'from-zinc-800 to-zinc-600',
      benefits: 'from-emerald-700 to-emerald-500',
      housing: 'from-orange-600 to-amber-500'
    };
    return map[activeScenario];
  };

  const getTextClass = () => {
    if (activeScenario === 'home') return 'text-slate-600';
    const map = { tax: 'text-blue-600', vehicle: 'text-zinc-600', benefits: 'text-emerald-600', housing: 'text-orange-600' };
    return map[activeScenario];
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col text-gray-800 relative">
      
      {/* --- Unified Top Navigation --- */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          <button onClick={() => handleNavigate('home')} className="flex items-center gap-2 group">
             <div className={`text-white p-1.5 rounded-lg transition-colors ${
               activeScenario === 'home' 
                 ? 'bg-slate-900 group-hover:bg-slate-800' 
                 : `bg-gradient-to-br ${getThemeClass()} shadow-sm`
             }`}>
               {activeScenario === 'home' ? <Grid size={20} /> : scenario.icon}
             </div>
             <div className="flex flex-col items-start leading-none">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  {activeScenario === 'home' ? SITE_BRAND.name : scenario.brand}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {activeScenario === 'home' ? SITE_BRAND.domain : '.gov'}
                </span>
             </div>
          </button>

          <div className="hidden md:flex items-center gap-1">
             <button 
               onClick={() => handleNavigate('home')}
               className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeScenario === 'home' ? 'bg-gray-100 text-slate-900' : 'text-gray-500 hover:text-slate-900 hover:bg-gray-50'}`}
             >
               Portal Home
             </button>
             
             {activeScenario === 'home' ? (
               <>
                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                {Object.values(SCENARIOS).map(scen => (
                  <button
                    key={scen.id}
                    onClick={() => handleNavigate(scen.id)}
                    className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors text-gray-500 hover:text-slate-900 hover:bg-gray-50"
                  >
                    {scen.icon}
                    {scen.name}
                  </button>
                ))}
               </>
             ) : (
               <div className="flex items-center gap-4 ml-4">
                 <a href="#" className="text-sm font-medium text-gray-500 hover:text-black">Services</a>
                 <a href="#" className="text-sm font-medium text-gray-500 hover:text-black">Forms</a>
                 <a href="#" className="text-sm font-medium text-gray-500 hover:text-black">Contact</a>
               </div>
             )}
          </div>

          <button 
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 top-16 shadow-lg p-2 space-y-1 z-40">
            <button onClick={() => handleNavigate('home')} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 font-medium">Portal Home</button>
            {Object.values(SCENARIOS).map(scen => (
               <button key={scen.id} onClick={() => handleNavigate(scen.id)} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-3">
                 {scen.icon} {scen.name}
               </button>
            ))}
          </div>
        )}
      </nav>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-y-auto">
        
        {/* VIEW: Home Landing Page */}
        {activeScenario === 'home' && (
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-blue-600 font-semibold tracking-wider text-sm uppercase mb-3 block">Official Government Portal</span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                One Account. <br/>All Public Services.
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed mb-8">
                Access tax records, manage vehicle registrations, apply for benefits, and find housing assistance—all in one secure place.
              </p>
              <button onClick={() => setIsOpen(true)} className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-1 flex items-center gap-2 mx-auto">
                <MessageSquare size={20} />
                Ask the Virtual Assistant
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.values(SCENARIOS).map(scen => (
                <div 
                  key={scen.id} 
                  onClick={() => handleNavigate(scen.id)}
                  className="group bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-blue-400 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
                    {React.cloneElement(scen.icon, { size: 80 })}
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white bg-gradient-to-br ${
                    scen.id === 'tax' ? 'from-blue-600 to-blue-500' :
                    scen.id === 'vehicle' ? 'from-zinc-700 to-zinc-600' :
                    scen.id === 'benefits' ? 'from-emerald-600 to-emerald-500' :
                    'from-orange-500 to-amber-500'
                  }`}>
                    {scen.icon}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">{scen.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    {scen.heroSubtitle.substring(0, 60)}...
                  </p>
                  <div className="flex items-center text-blue-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                    Access Portal <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              ))}
            </div>

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
          </div>
        )}

        {/* VIEW: Department Pages */}
        {activeScenario !== 'home' && (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <button onClick={() => handleNavigate('home')} className="hover:text-slate-900 flex items-center gap-1">
                <Home size={14} /> Home
              </button>
              <span>/</span>
              <span className={`font-medium ${getTextClass()}`}>{scenario.name}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 items-center mb-20">
              <div className="flex-1 space-y-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-100 ${getTextClass()}`}>
                   Official {scenario.brand} Portal
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                  {scenario.heroTitle}
                </h1>
                <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
                  {scenario.heroSubtitle}
                </p>
                <div className="flex gap-4 pt-2">
                  <button className={`px-6 py-3 rounded-lg text-white font-medium shadow hover:shadow-lg transition-all bg-gradient-to-r ${getThemeClass()}`}>
                    Start Application
                  </button>
                  <button className="px-6 py-3 rounded-lg bg-white border border-gray-200 text-slate-700 font-medium hover:bg-gray-50">
                    Check Status
                  </button>
                </div>
              </div>
              
              <div className="flex-1 w-full max-w-md bg-gray-100 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden border border-gray-200">
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                 <div className={`p-6 rounded-full bg-white shadow-lg text-${scenario.color}-600`}>
                    {React.cloneElement(scenario.icon, { size: 48 })}
                 </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-32 bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-gray-100 rounded"></div>
                      <div className="w-full h-2 bg-gray-50 rounded"></div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

      </main>

      {/* --- Floating Chat Widget --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        
        {isOpen && (
          <div className="w-[90vw] md:w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
            
            <div className={`h-16 bg-gradient-to-r ${getThemeClass()} p-4 flex items-center justify-between shrink-0 transition-all duration-500`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {activeScenario === 'home' ? 'Portal Concierge' : `${scenario.brand} Assistant`}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-white/80">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    Online • {activeProtoData.name}
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <MessageBubble 
                  key={idx} 
                  message={msg} 
                  scenarioId={activeScenario} 
                />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4">
                   <div className="bg-white border border-gray-100 px-3 py-3 rounded-2xl rounded-tl-none shadow-sm">
                     <div className="flex gap-1">
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                     </div>
                   </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
              <div className="relative">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={activeScenario === 'home' ? "Describe what you need help with..." : "Type your message..."}
                  className="w-full bg-gray-100 border-0 rounded-full py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-slate-500/20"
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={`absolute right-1.5 top-1.5 p-1.5 rounded-full transition-all ${
                    inputValue.trim() ? 'bg-slate-800 text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Send size={14} />
                </button>
              </div>
              {activeScenario !== 'home' && (
                <button 
                  type="button"
                  onClick={() => setInputValue(scenario.querySuggestion)}
                  className="mt-2 text-[10px] text-gray-400 hover:text-slate-800 w-full text-center transition-colors"
                >
                  Suggestion: "{scenario.querySuggestion}"
                </button>
              )}
            </form>
          </div>
        )}

        {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            className={`group w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center text-white bg-gradient-to-br ${getThemeClass()}`}
          >
            <MessageSquare size={26} className="fill-current" />
          </button>
        )}
      </div>

    </div>
  );
}