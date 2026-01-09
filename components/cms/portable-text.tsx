"use client";

import { useMemo } from "react";

export interface PortableTextBlock {
  _type: "block";
  _key: string;
  style?: string;
  children: Array<{
    _type: "span";
    _key: string;
    text: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _key: string;
    _type: string;
    [key: string]: any;
  }>;
}

export interface PortableTextNode {
  _type: string;
  _key: string;
  [key: string]: any;
}

export type PortableText = Array<PortableTextBlock | PortableTextNode>;

interface PortableTextRendererProps {
  value: PortableText;
  className?: string;
}

export function PortableTextRenderer({
  value,
  className = "",
}: PortableTextRendererProps) {
  const rendered = useMemo(() => {
    if (!value || !Array.isArray(value)) return null;

    return value.map((node, index) => {
      if (node._type === "block") {
        return renderBlock(node as PortableTextBlock, index);
      } else {
        return renderCustomBlock(node, index);
      }
    });
  }, [value]);

  if (!rendered) return null;

  return <div className={`portable-text ${className}`}>{rendered}</div>;
}

function renderBlock(block: PortableTextBlock, index: number) {
  const { style = "normal", children, markDefs } = block;

  const renderedChildren = children.map((child, childIndex) => {
    let text = child.text;
    const marks = child.marks || [];

    // Apply marks (bold, italic, etc.)
    marks.forEach((markKey) => {
      const markDef = markDefs?.find((def) => def._key === markKey);
      if (markDef) {
        switch (markDef._type) {
          case "link":
            text = (
              <a
                key={`${block._key}-${childIndex}-link`}
                href={markDef.href}
                className="text-[#3B82F6] hover:underline"
              >
                {text}
              </a>
            );
            break;
          case "strong":
            text = <strong key={`${block._key}-${childIndex}-strong`}>{text}</strong>;
            break;
          case "em":
            text = <em key={`${block._key}-${childIndex}-em`}>{text}</em>;
            break;
          case "code":
            text = (
              <code
                key={`${block._key}-${childIndex}-code`}
                className="px-1 py-0.5 bg-[#F3F4F6] text-[#111827] rounded text-sm font-mono"
              >
                {text}
              </code>
            );
            break;
        }
      } else {
        // Simple marks without definitions
        if (markKey === "strong") {
          text = <strong key={`${block._key}-${childIndex}-strong`}>{text}</strong>;
        } else if (markKey === "em") {
          text = <em key={`${block._key}-${childIndex}-em`}>{text}</em>;
        } else if (markKey === "code") {
          text = (
            <code
              key={`${block._key}-${childIndex}-code`}
              className="px-1 py-0.5 bg-[#F3F4F6] text-[#111827] rounded text-sm font-mono"
            >
              {text}
            </code>
          );
        }
      }
    });

    return (
      <span key={`${block._key}-${childIndex}`} className="inline">
        {text}
      </span>
    );
  });

  // Render based on style
  const Tag = getTagForStyle(style);

  return (
    <Tag
      key={block._key || index}
      className={getClassNameForStyle(style)}
    >
      {renderedChildren}
    </Tag>
  );
}

function renderCustomBlock(node: PortableTextNode, index: number) {
  switch (node._type) {
    case "image":
      return (
        <img
          key={node._key || index}
          src={node.asset?.url || node.url}
          alt={node.alt || ""}
          className="my-4 rounded-md max-w-full"
        />
      );
    case "code":
      return (
        <pre
          key={node._key || index}
          className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md overflow-x-auto my-4"
        >
          <code className="text-sm font-mono text-[#111827]">
            {node.code}
          </code>
        </pre>
      );
    default:
      return null;
  }
}

function getTagForStyle(style: string): keyof JSX.IntrinsicElements {
  switch (style) {
    case "h1":
      return "h1";
    case "h2":
      return "h2";
    case "h3":
      return "h3";
    case "h4":
      return "h4";
    case "h5":
      return "h5";
    case "h6":
      return "h6";
    case "blockquote":
      return "blockquote";
    default:
      return "p";
  }
}

function getClassNameForStyle(style: string): string {
  const baseClasses = "mb-4 text-[#111827]";
  switch (style) {
    case "h1":
      return `${baseClasses} text-3xl font-semibold mt-6 mb-4`;
    case "h2":
      return `${baseClasses} text-2xl font-semibold mt-5 mb-3`;
    case "h3":
      return `${baseClasses} text-xl font-semibold mt-4 mb-2`;
    case "h4":
      return `${baseClasses} text-lg font-semibold mt-3 mb-2`;
    case "h5":
      return `${baseClasses} text-base font-semibold mt-2 mb-1`;
    case "h6":
      return `${baseClasses} text-sm font-semibold mt-2 mb-1`;
    case "blockquote":
      return `${baseClasses} pl-4 border-l-4 border-[#E5E7EB] italic text-[#6B7280]`;
    default:
      return `${baseClasses} text-sm leading-relaxed`;
  }
}

// Helper to convert HTML/rich text to Portable Text format
export function convertToPortableText(html: string): PortableText {
  // This is a simplified converter - in production, use a proper HTML parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const blocks: PortableText = [];
  let keyCounter = 0;

  Array.from(doc.body.children).forEach((element) => {
    const tagName = element.tagName.toLowerCase();
    const text = element.textContent || "";

    if (tagName === "p" || tagName.startsWith("h")) {
      blocks.push({
        _type: "block",
        _key: `block-${keyCounter++}`,
        style: tagName === "p" ? "normal" : tagName,
        children: [
          {
            _type: "span",
            _key: `span-${keyCounter++}`,
            text,
            marks: [],
          },
        ],
      });
    }
  });

  return blocks;
}







