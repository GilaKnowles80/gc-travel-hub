import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, Loader2, AlertCircle, ChevronDown, ChevronUp, Wrench } from "lucide-react";

const statusConfig = {
  pending: { icon: Loader2, spin: true, text: "Queued", color: "text-slate-500" },
  running: { icon: Loader2, spin: true, text: "Running", color: "text-blue-500" },
  in_progress: { icon: Loader2, spin: true, text: "Working", color: "text-blue-500" },
  completed: { icon: CheckCircle2, spin: false, text: "Done", color: "text-emerald-500" },
  success: { icon: CheckCircle2, spin: false, text: "Success", color: "text-emerald-500" },
  failed: { icon: AlertCircle, spin: false, text: "Failed", color: "text-red-500" },
  error: { icon: AlertCircle, spin: false, text: "Error", color: "text-red-500" },
};

function formatName(name) {
  if (!name) return "Tool";
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function FunctionDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const status = toolCall.status || "pending";
  const cfg = statusConfig[status] || statusConfig.pending;
  const Icon = cfg.icon;
  const projection = toolCall.display_projection || {};
  const hideDetails = projection.hide_details && projection.details_redacted;

  let parsedArgs = toolCall.arguments_string;
  try {
    parsedArgs = JSON.parse(toolCall.arguments_string);
  } catch {
    /* keep raw */
  }

  let parsedResults = toolCall.results;
  if (typeof parsedResults === "string") {
    try {
      parsedResults = JSON.parse(parsedResults);
    } catch {
      /* keep raw */
    }
  }

  const failed = ["failed", "error"].includes(status) ||
    (parsedResults && typeof parsedResults === "object" && parsedResults.success === false) ||
    (typeof parsedResults === "string" && /error|failed/i.test(parsedResults));

  const label = failed
    ? projection.error_label || "Failed"
    : ["pending", "running", "in_progress"].includes(status)
      ? projection.active_label || cfg.text
      : projection.label || cfg.text;

  if (hideDetails) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs">
        <Icon className={`w-3.5 h-3.5 ${failed ? "text-red-500" : cfg.color} ${cfg.spin ? "animate-spin" : ""}`} />
        <span className={failed ? "text-red-600" : "text-slate-600"}>{label}</span>
      </div>
    );
  }

  return (
    <div className="mt-2 text-xs border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 transition-colors text-left"
      >
        <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-medium text-slate-700">{formatName(toolCall.name)}</span>
        <Icon className={`w-3.5 h-3.5 ml-auto ${failed ? "text-red-500" : cfg.color} ${cfg.spin ? "animate-spin" : ""}`} />
        <span className={failed ? "text-red-600" : "text-slate-500"}>{label}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {expanded && (
        <div className="px-3 py-2 border-t border-slate-200 space-y-2">
          {toolCall.arguments_string && (
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Parameters</div>
              <pre className="text-[11px] text-slate-700 overflow-x-auto whitespace-pre-wrap break-words bg-white rounded p-2 border border-slate-100">
                {typeof parsedArgs === "string" ? parsedArgs : JSON.stringify(parsedArgs, null, 2)}
              </pre>
            </div>
          )}
          {toolCall.results !== undefined && toolCall.results !== null && (
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Result</div>
              <pre className="text-[11px] text-slate-700 overflow-x-auto whitespace-pre-wrap break-words bg-white rounded p-2 border border-slate-100 max-h-64">
                {typeof parsedResults === "string" ? parsedResults : JSON.stringify(parsedResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? "order-2" : ""}`}>
        <div
          className={
            isUser
              ? "bg-orange-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5"
              : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm"
          }
        >
          {message.content && (isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ))}
          {message.tool_calls?.map((toolCall, idx) => (
            <FunctionDisplay key={idx} toolCall={toolCall} />
          ))}
        </div>
      </div>
    </div>
  );
}