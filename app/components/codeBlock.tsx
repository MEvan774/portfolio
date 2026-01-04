"use client";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ children }: any) {
  const child = Array.isArray(children) ? children[0] : children;
  const code = child?.props?.children ?? String(children);
  const className = child?.props?.className || "";
  const language = className.replace("language-", "") || "tsx";

  return (
    <div className="my-4 font-sans border border-white/20 sm:rounded-lg c"> {/* enforce site font on surrounding text */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        showLineNumbers
        wrapLongLines
        customStyle={{ background: "transparent", fontFamily: "inherit" }}
      >
        {String(code).trim()}
      </SyntaxHighlighter>
    </div>
  );
}
