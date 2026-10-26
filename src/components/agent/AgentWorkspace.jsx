"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { 
  FaYoutube, 
  FaInstagram, 
  FaFacebook, 
  FaLinkedin, 
  FaPinterest, 
  FaRobot, 
  FaMagic, 
  FaPaperPlane, 
  FaCheck, 
  FaClock, 
  FaBolt, 
  FaShareAlt 
} from "react-icons/fa";
import { FaXTwitter, FaThreads } from "react-icons/fa6";
import { SiTiktok } from "react-icons/si";
import { 
  FiExternalLink, 
  FiPlus, 
  FiMessageSquare, 
  FiTrash2, 
  FiCalendar, 
  FiSend, 
  FiInfo,
  FiCheckCircle
} from "react-icons/fi";
import PostComposerModal from "@/components/composer/PostComposerModal";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const PLATFORM_ICONS = {
  youtube: { name: "YouTube", Icon: FaYoutube, color: "text-red-500", bg: "bg-red-500/10 border-red-500/30 text-red-400" },
  tiktok: { name: "TikTok", Icon: SiTiktok, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" },
  instagram: { name: "Instagram", Icon: FaInstagram, color: "text-pink-500", bg: "bg-pink-500/10 border-pink-500/30 text-pink-400" },
  x_twitter: { name: "X (Twitter)", Icon: FaXTwitter, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-400/30 text-sky-400" },
  facebook: { name: "Facebook", Icon: FaFacebook, color: "text-blue-600", bg: "bg-blue-600/10 border-blue-600/30 text-blue-400" },
  linkedin: { name: "LinkedIn", Icon: FaLinkedin, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  threads: { name: "Threads", Icon: FaThreads, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-400/30 text-purple-400" },
  pinterest: { name: "Pinterest", Icon: FaPinterest, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/30 text-rose-400" },
};

const PROMPT_SUGGESTIONS = [
  "Draft a viral product launch announcement across YouTube and X.",
  "Write 3 engaging tweet hooks about AI productivity tips.",
  "Create a week-long content calendar theme for our social channels.",
  "Write an insightful LinkedIn post discussing remote work trends.",
];

// Aggressively sanitize any legacy model name mentions or unparsed raw JSON blocks from text
function sanitizeText(str) {
  if (!str) return "";
  return str
    .replace(/powered by \*\*gpt-5-mini\*\* with context memory\.?/gi, "with persistent context memory.")
    .replace(/\*\*gpt-5-mini\*\*/gi, "AI Assistant")
    .replace(/gpt-5-mini/gi, "AI Assistant")
    .replace(/```(?:json)?\s*\[\s*\{\s*"action":\s*"schedule_post"[\s\S]*?```/gi, "")
    .replace(/```(?:json)?\s*\{\s*"action":\s*"schedule_post"[\s\S]*?```/gi, "");
}

// Markdown Message Renderer using react-markdown with remark-gfm
function FormattedMessage({ content }) {
  if (!content) return null;
  const cleaned = sanitizeText(content);

  return (
    <div className="text-xs text-zinc-200 leading-relaxed break-words space-y-1.5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="text-sm font-bold text-white mt-2.5 mb-1 tracking-wide">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="text-xs font-bold text-white mt-2 mb-1">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-[11px] font-semibold text-zinc-300 mt-1.5 mb-1 uppercase tracking-wider">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-xs text-zinc-200 leading-relaxed my-1">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-300">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 my-1.5 pl-1 list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 my-1.5 pl-4 list-decimal text-zinc-200 text-xs">
              {children}
            </ol>
          ),
          li: ({ children, node }) => {
            const isOrdered = node?.parent?.tagName === "ol";
            if (isOrdered) {
              return (
                <li className="text-xs text-zinc-200 leading-relaxed my-0.5">
                  {children}
                </li>
              );
            }
            return (
              <li className="flex items-start gap-2 text-xs text-zinc-200 leading-relaxed my-0.5">
                <span className="w-1 h-1 rounded-full bg-[#8c66ff] mt-2 shrink-0" />
                <span className="flex-1">{children}</span>
              </li>
            );
          },
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
              <div className="my-2 rounded-md overflow-hidden border border-[#252525] bg-[#101012]">
                {match && (
                  <div className="px-2.5 py-0.5 bg-[#18181b] border-b border-[#252525] text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    {match[1]}
                  </div>
                )}
                <pre className="p-2.5 overflow-x-auto text-xs font-mono text-zinc-300 leading-normal">
                  <code>{children}</code>
                </pre>
              </div>
            ) : (
              <code className="px-1 py-0.2 rounded bg-[#201f1f] border border-[#2a2929] font-mono text-[11px] text-[#8c66ff]" {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#612bd3] pl-2.5 py-0.5 my-1.5 text-xs italic text-zinc-400 bg-[#612bd3]/5 rounded-r">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 border border-[#252525] rounded-md">
              <table className="min-w-full divide-y divide-[#252525] text-xs text-zinc-300">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-2.5 py-1.5 bg-[#1a1919] text-left font-semibold text-white text-xs">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2.5 py-1.5 border-t border-[#252525] text-zinc-300 text-xs">
              {children}
            </td>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-[#8c66ff] hover:underline font-medium" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  );
}

function PostProposalCard({ proposal, index, total, onOpenComposer }) {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(proposal, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-3 rounded-md bg-[#181717] border border-[#262525] space-y-2">
      <div className="flex items-center justify-between border-b border-[#252525] pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-bold text-[#8c66ff] uppercase tracking-wider">
            {total > 1 ? `Proposal #${index + 1}` : "Proposed Post"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {proposal.platforms?.map((pKey) => {
            const pInfo = PLATFORM_ICONS[pKey] || { name: pKey, Icon: FaShareAlt, color: "text-zinc-400" };
            const PIcon = pInfo.Icon;
            return (
              <span
                key={pKey}
                className="p-1 rounded bg-[#201f1f] text-zinc-300"
                title={pInfo.name}
              >
                <PIcon className="text-xs" />
              </span>
            );
          })}
        </div>
      </div>

      {proposal.title && (
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Title
          </span>
          <p className="text-xs font-semibold text-white mt-0.5">
            {proposal.title}
          </p>
        </div>
      )}

      {proposal.description && (
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Content
          </span>
          <p className="text-xs text-zinc-300 mt-0.5 line-clamp-4 whitespace-pre-wrap">
            {proposal.description}
          </p>
        </div>
      )}

      {proposal.tags && (
        <div>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Tags
          </span>
          <p className="text-[11px] text-sky-400 font-mono mt-0.5">
            {proposal.tags}
          </p>
        </div>
      )}

      {/* Action Row */}
      <div className="pt-1.5 border-t border-[#252525] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShowJson(!showJson)}
          className="text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-[#201f1f] hover:bg-[#262525] transition-colors cursor-pointer"
        >
          {showJson ? "Hide JSON" : "JSON"}
        </button>

        <button
          type="button"
          onClick={() => onOpenComposer(proposal)}
          className="px-3 py-1 rounded-md bg-[#612bd3] hover:bg-[#7237e8] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <FiCalendar className="text-xs" />
          <span>Open in Composer</span>
        </button>
      </div>

      {/* Collapsible Raw JSON Display */}
      {showJson && (
        <div className="mt-2 rounded bg-[#101012] border border-[#252525] p-2 relative">
          <div className="flex items-center justify-between mb-1 text-[10px] font-mono text-zinc-400">
            <span>Payload:</span>
            <button
              type="button"
              onClick={handleCopyJson}
              className="text-[#8c66ff] hover:text-[#a082ff] text-[10px] font-semibold cursor-pointer"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto leading-normal whitespace-pre">
            <code>{JSON.stringify(proposal, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

const DEFAULT_WELCOME = `Hello! I am your AI Social Media Marketing Agent with persistent context memory.

### What I can do for you:
- ✍️ **Craft Viral Copy**: Generate high-converting hooks, descriptions, and hashtags.
- 📅 **Multi-Channel Scheduling**: Prepare complete post proposals ready to schedule in 1 click.
- 🧠 **Context Memory**: I remember your brand voice and instructions across our conversation.

Select your target channels on the left and tell me what you'd like to plan!`;

export default function AgentWorkspace() {
  const { data: session, status } = useSession();

  // Connected Accounts
  const [accounts, setAccounts] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);

  // Chat & Threads State
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Composer Modal Integration
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerInitialPost, setComposerInitialPost] = useState(null);

  const messagesEndRef = useRef(null);

  // 1. Fetch connected accounts
  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/social/accounts");
      if (res.ok) {
        const data = await res.json();
        const accList = Array.isArray(data) ? data : [];
        setAccounts(accList);

        // Auto-select all connected platforms initially
        const keys = Array.from(
          new Set(
            accList.map((a) => {
              const p = (a.platform_name || "").toLowerCase();
              return p === "x" || p === "twitter" ? "x_twitter" : p;
            })
          )
        );
        setSelectedChannels(keys);
      }
    } catch (err) {
      console.warn("Failed to fetch accounts:", err);
    }
  }, []);

  // 2. Load threads from localStorage and scrub any old model names permanently
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("social_agent_threads");
        if (saved) {
          let parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Extract proposals from content if not already saved, and scrub any legacy model names
            parsed = parsed.map((thread) => ({
              ...thread,
              messages: (thread.messages || []).map((m) => {
                let proposals = Array.isArray(m.postProposals) && m.postProposals.length > 0
                  ? m.postProposals
                  : (m.postProposal ? [m.postProposal] : []);

                if (proposals.length === 0 && m.content) {
                  const jsonMatch = m.content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                  if (jsonMatch && jsonMatch[1]) {
                    try {
                      const pData = JSON.parse(jsonMatch[1]);
                      const norm = (item) => ({
                        platforms: Array.isArray(item.platforms) && item.platforms.length > 0 ? item.platforms : ["x_twitter"],
                        title: item.title || "",
                        description: item.description || "",
                        tags: item.tags || "",
                      });
                      if (Array.isArray(pData) && pData.length > 0) {
                        proposals = pData.map(norm);
                      } else if (pData && (pData.action === "schedule_post" || pData.title || pData.description)) {
                        proposals = [norm(pData)];
                      }
                    } catch (e) {}
                  }
                }

                return {
                  ...m,
                  content: sanitizeText(m.content),
                  postProposals: proposals.length > 0 ? proposals : null,
                  postProposal: proposals.length > 0 ? proposals[0] : null,
                };
              }),
            }));

            // Save cleaned and extracted version back to localStorage
            localStorage.setItem("social_agent_threads", JSON.stringify(parsed));

            setThreads(parsed);
            setActiveThreadId(parsed[0].id);
            setMessages(parsed[0].messages || []);
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to load threads from localStorage:", e);
      }

      // Initialize default new thread
      const newThread = {
        id: "thread_" + Date.now(),
        title: "New Strategy Chat",
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: "welcome",
            role: "assistant",
            content: DEFAULT_WELCOME,
          },
        ],
      };
      setThreads([newThread]);
      setActiveThreadId(newThread.id);
      setMessages(newThread.messages);
      localStorage.setItem("social_agent_threads", JSON.stringify([newThread]));
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAccounts();
    }
  }, [status, fetchAccounts]);

  // Save current messages to active thread
  const updateThreadMessages = (threadId, newMessages, customTitle = null) => {
    setThreads((prev) => {
      const updated = prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            title: customTitle || t.title,
            messages: newMessages,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      });
      localStorage.setItem("social_agent_threads", JSON.stringify(updated));
      return updated;
    });
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Toggle channel selection
  const toggleChannel = (key) => {
    setSelectedChannels((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Switch Thread
  const handleSelectThread = (threadId) => {
    const found = threads.find((t) => t.id === threadId);
    if (found) {
      setActiveThreadId(found.id);
      setMessages(found.messages || []);
      setErrorMsg("");
    }
  };

  // Create New Thread
  const handleNewThread = () => {
    const targetNames = selectedChannels.map(k => PLATFORM_ICONS[k]?.name || k).join(", ") || "All connected channels";
    const newThread = {
      id: "thread_" + Date.now(),
      title: "New Strategy Chat",
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: "welcome_" + Date.now(),
          role: "assistant",
          content: `New conversation started! Target channels: **${targetNames}**.\n\nWhat social campaign or post would you like to create?`,
        },
      ],
    };

    setThreads((prev) => {
      const updated = [newThread, ...prev];
      localStorage.setItem("social_agent_threads", JSON.stringify(updated));
      return updated;
    });
    setActiveThreadId(newThread.id);
    setMessages(newThread.messages);
    setErrorMsg("");
  };

  // Delete Thread
  const handleDeleteThread = (e, threadId) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this thread?")) return;

    setThreads((prev) => {
      const remaining = prev.filter((t) => t.id !== threadId);
      localStorage.setItem("social_agent_threads", JSON.stringify(remaining));

      if (activeThreadId === threadId) {
        if (remaining.length > 0) {
          setActiveThreadId(remaining[0].id);
          setMessages(remaining[0].messages || []);
        } else {
          handleNewThread();
        }
      }
      return remaining;
    });
  };

  // Send message to Agent
  const handleSendMessage = async (customText = null) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isThinking) return;

    setInputText("");
    setErrorMsg("");

    // Append user message
    const userMsg = {
      id: "msg_" + Date.now(),
      role: "user",
      content: textToSend,
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    // Auto-update thread title if it's the first user message
    let threadTitle = null;
    const userMsgCount = newMessages.filter((m) => m.role === "user").length;
    if (userMsgCount === 1) {
      threadTitle = textToSend.slice(0, 30) + (textToSend.length > 30 ? "..." : "");
    }

    updateThreadMessages(activeThreadId, newMessages, threadTitle);
    setIsThinking(true);

    try {
      // Build strictly last 10 messages for history
      const historyToSend = newMessages
        .slice(-10)
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content || "",
        }));

      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          messages: historyToSend,
          history: historyToSend.slice(0, -1),
          selectedChannels,
          targetChannels: selectedChannels,
          threadId: activeThreadId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const assistantReply = data.reply || "I have analyzed your request. How else can I assist your social strategy?";

      const assistantMsg = {
        id: "msg_" + Date.now(),
        role: "assistant",
        content: assistantReply,
        postProposal: data.postProposal || null,
        postProposals: data.postProposals || (data.postProposal ? [data.postProposal] : []),
        createdAt: new Date().toISOString(),
      };

      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      updateThreadMessages(activeThreadId, finalMessages);
    } catch (err) {
      console.error("Agent chat error:", err);
      setErrorMsg(err.message || "Failed to get response from agent. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  // Open Proposed Post in Composer
  const handleOpenProposalInComposer = (proposal) => {
    setComposerInitialPost({
      platform: proposal.platforms?.[0] || "youtube",
      title: proposal.title || "",
      description: proposal.description || "",
      tags: proposal.tags || "",
      platforms: proposal.platforms || selectedChannels,
    });
    setComposerOpen(true);
  };

  if (status === "unauthenticated") {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-[#141414] text-white">
        <div className="max-w-sm text-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#1a1919] border border-[#252525] text-[#8c66ff] flex items-center justify-center mx-auto">
            <FaRobot className="text-lg" />
          </div>
          <h2 className="text-lg font-bold">Sign In to Use the Agent</h2>
          <p className="text-xs text-[#999999]">
            Authenticate to access your connected social accounts and AI assistant.
          </p>
          <button
            onClick={() => signIn("google")}
            className="px-4 py-2 rounded-md bg-[#612bd3] hover:bg-[#7237e8] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#141414] text-zinc-100 flex flex-col overflow-hidden">
      {/* 3-Panel Main Layout */}
      <div className="flex-1 h-full min-h-0 flex overflow-hidden divide-x divide-[#252525]">
        
        {/* ========================================================= */}
        {/* LEFT SIDEBAR: Select Channels (w-[230px])                  */}
        {/* ========================================================= */}
        <aside className="w-[230px] min-w-[230px] max-w-[230px] h-full bg-[#161515] flex flex-col shrink-0 select-none overflow-hidden">
          <div className="p-3.5 flex flex-col h-full min-h-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Channels
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#612bd3]/15 text-[#8c66ff] border border-[#612bd3]/30">
                {selectedChannels.length} active
              </span>
            </div>

            {/* Channel List */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5">
              {accounts.length === 0 ? (
                <div className="p-3 rounded-md bg-[#1a1919] border border-[#252525] text-center space-y-2 my-1">
                  <p className="text-xs text-zinc-400">No channels connected.</p>
                  <Link
                    href="/integrations"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#612bd3] hover:bg-[#7237e8] text-white text-xs font-medium transition-colors"
                  >
                    <FiPlus className="text-xs" />
                    <span>Connect</span>
                  </Link>
                </div>
              ) : (
                accounts.map((acc) => {
                  const rawPlat = (acc.platform_name || "").toLowerCase();
                  const platKey = rawPlat === "x" || rawPlat === "twitter" ? "x_twitter" : rawPlat;
                  const config = PLATFORM_ICONS[platKey] || { name: acc.platform_name || platKey, Icon: FaShareAlt, color: "text-zinc-400" };
                  const Icon = config.Icon;
                  const isSelected = selectedChannels.includes(platKey);

                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleChannel(platKey)}
                      className={`px-2.5 py-2 rounded-md cursor-pointer transition-colors flex items-center justify-between text-xs border ${
                        isSelected
                          ? "bg-[#201f1f] border-[#2e2d2d] text-white"
                          : "bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1919]"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={`text-sm shrink-0 ${config.color}`} />
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">
                            {config.name}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate">
                            {acc.account_name || "Connected"}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Add Channel Button */}
            <div className="pt-2.5 border-t border-[#252525] mt-auto shrink-0">
              <Link
                href="/integrations"
                className="w-full h-8 rounded-md border border-[#252525] hover:border-[#612bd3] text-zinc-400 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors bg-[#1a1919] hover:bg-[#201f1f]"
              >
                <FiPlus className="text-xs" />
                <span>Add Channel</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* CENTER PANEL: Agent Chat                                  */}
        {/* ========================================================= */}
        <main className="flex-1 h-full min-h-0 flex flex-col bg-[#141414] overflow-hidden relative">
          {/* Top Bar */}
          <div className="shrink-0 px-4 py-2.5 border-b border-[#252525] bg-[#161515] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-[#612bd3]/15 border border-[#612bd3]/30 flex items-center justify-center text-[#8c66ff] text-xs shrink-0">
                <FaRobot />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xs font-bold text-white uppercase tracking-wider">
                    Marketing Agent
                  </h1>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    Active
                  </span>
                </div>
                {/* Active Channel Pills */}
                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-zinc-500">Channels:</span>
                  {selectedChannels.length === 0 ? (
                    <span className="text-[10px] text-amber-400">None selected</span>
                  ) : (
                    selectedChannels.map((k) => {
                      const p = PLATFORM_ICONS[k] || { name: k, Icon: FaShareAlt, color: "text-zinc-400" };
                      const PIcon = p.Icon;
                      return (
                        <span key={k} className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-[#201f1f] text-[10px] text-zinc-300">
                          <PIcon className={`text-[8px] ${p.color}`} />
                          <span>{p.name}</span>
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action: New Chat */}
            <button
              type="button"
              onClick={handleNewThread}
              className="px-2.5 py-1 rounded-md bg-[#201f1f] hover:bg-[#262525] border border-[#2e2d2d] text-xs font-medium text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <FiPlus className="text-xs text-[#8c66ff]" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 min-h-0 p-4 sm:p-5 overflow-y-auto space-y-3.5 scrollbar-subtle">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  {/* Avatar */}
                  <div className="shrink-0 mt-0.5">
                    {isUser ? (
                      <div className="w-6 h-6 rounded-md bg-[#612bd3] text-white flex items-center justify-center font-bold text-[10px]">
                        U
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-[#252525] text-[#8c66ff] flex items-center justify-center text-[10px]">
                        <FaRobot />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-2.5 min-w-0 max-w-[85%]">
                    <div
                      className={`p-3 rounded-lg text-xs leading-relaxed ${
                        isUser
                          ? "bg-[#612bd3] text-white"
                          : "bg-[#1a1919] border border-[#252525] text-zinc-200"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{sanitizeText(msg.content)}</p>
                      ) : (
                        <FormattedMessage content={msg.content} />
                      )}
                    </div>

                    {/* Interactive Post Proposal Cards */}
                    {(() => {
                      const proposals = Array.isArray(msg.postProposals) && msg.postProposals.length > 0
                        ? msg.postProposals
                        : (msg.postProposal ? [msg.postProposal] : []);

                      if (proposals.length === 0) return null;

                      return (
                        <div className="space-y-2 mt-2">
                          {proposals.map((proposal, pIdx) => (
                            <PostProposalCard
                              key={pIdx}
                              proposal={proposal}
                              index={pIdx}
                              total={proposals.length}
                              onOpenComposer={handleOpenProposalInComposer}
                            />
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}

            {/* Thinking Indicator */}
            {isThinking && (
              <div className="flex gap-2.5 max-w-2xl mr-auto">
                <div className="w-6 h-6 rounded-md bg-[#252525] text-[#8c66ff] flex items-center justify-center text-[10px] shrink-0">
                  <FaRobot className="animate-spin" />
                </div>
                <div className="p-2.5 rounded-lg bg-[#1a1919] border border-[#252525] text-xs text-zinc-400 flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-[#8c66ff] border-t-transparent rounded-full animate-spin" />
                  <span>Agent is thinking...</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <FiInfo className="text-sm shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="shrink-0 px-4 pb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(suggestion)}
                    className="px-2.5 py-1 rounded-md bg-[#1a1919] hover:bg-[#201f1f] border border-[#252525] text-[11px] text-zinc-300 hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <FaBolt className="text-[9px] text-amber-400 shrink-0" />
                    <span className="truncate max-w-xs">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Floating Input Box */}
          <div className="shrink-0 p-3 border-t border-[#252525] bg-[#161515]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center bg-[#1a1919] border border-[#282727] rounded-lg focus-within:border-[#612bd3] transition-colors"
            >
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask agent to write, strategize, or schedule posts (Enter to send)..."
                rows={1}
                className="w-full bg-transparent px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none max-h-24 leading-normal"
              />
              <div className="pr-2 flex items-center gap-1.5 shrink-0">
                <button
                  type="submit"
                  disabled={!inputText.trim() || isThinking}
                  className="w-7 h-7 rounded-md bg-[#612bd3] hover:bg-[#7237e8] text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Send"
                >
                  <FaPaperPlane className="text-[10px]" />
                </button>
              </div>
            </form>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1 px-0.5">
              <span>Enter to send • Shift+Enter for newline</span>
              <span>{selectedChannels.length} active channels</span>
            </div>
          </div>
        </main>

        {/* ========================================================= */}
        {/* RIGHT SIDEBAR: Chat History (w-[230px])                   */}
        {/* ========================================================= */}
        <aside className="w-[230px] min-w-[230px] max-w-[230px] h-full bg-[#161515] flex flex-col shrink-0 select-none overflow-hidden">
          <div className="p-3.5 flex flex-col h-full min-h-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                History
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#201f1f] text-zinc-400 border border-[#252525]">
                {threads.length} {threads.length === 1 ? "chat" : "chats"}
              </span>
            </div>

            {/* Start New Chat Button */}
            <div className="mb-2.5 shrink-0">
              <button
                type="button"
                onClick={handleNewThread}
                className="w-full h-8 rounded-md bg-[#612bd3] hover:bg-[#7237e8] text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FiPlus size={14} />
                <span>New chat</span>
              </button>
            </div>

            {/* Threads List */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5">
              {threads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread.id)}
                    className={`group px-2.5 py-1.5 rounded-md cursor-pointer transition-colors flex items-center justify-between text-xs border ${
                      isActive
                        ? "bg-[#201f1f] text-white font-medium border-[#2e2d2d]"
                        : "bg-transparent text-zinc-400 hover:bg-[#1a1919] hover:text-zinc-200 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FiMessageSquare 
                        size={12} 
                        className={`shrink-0 ${isActive ? "text-[#8c66ff]" : "text-zinc-500"}`} 
                      />
                      <span className="text-xs truncate">
                        {thread.title}
                      </span>
                    </div>

                    {threads.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteThread(e, thread.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                        title="Delete Thread"
                      >
                        <FiTrash2 size={11} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Post Composer Modal Integration */}
      {composerOpen && (
        <PostComposerModal
          isOpen={composerOpen}
          onClose={() => {
            setComposerOpen(false);
            setComposerInitialPost(null);
          }}
          initialPost={composerInitialPost}
          onPostSaved={() => {
            setComposerOpen(false);
            setComposerInitialPost(null);
          }}
        />
      )}
    </div>
  );
}
