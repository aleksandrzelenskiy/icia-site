import React from "react";

type MarkdownContentProps = {
  content: string;
};

const startsWithSpecialBlock = (line: string) =>
  line.startsWith("#") || line.startsWith("- ") || line.startsWith("> ");

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const nodes: React.ReactNode[] = [];

  let index = 0;
  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={`h3-${index}`} className="text-2xl font-semibold">
          {line.slice(4).trim()}
        </h3>
      );
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={`h2-${index}`} className="text-3xl font-semibold">
          {line.slice(3).trim()}
        </h2>
      );
      index += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      nodes.push(
        <h2 key={`h1-${index}`} className="text-3xl font-semibold">
          {line.slice(2).trim()}
        </h2>
      );
      index += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        quoteLines.push(lines[index].trim().slice(2).trim());
        index += 1;
      }
      nodes.push(
        <blockquote
          key={`quote-${index}`}
          className="border-l-2 border-primary/60 pl-4 text-lg font-semibold text-foreground"
        >
          {quoteLines.join(" ")}
        </blockquote>
      );
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2).trim());
        index += 1;
      }
      nodes.push(
        <ul key={`ul-${index}`} className="space-y-2 pl-5 text-mutedForeground">
          {items.map((item) => (
            <li key={item} className="list-disc">
              {item}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (!current || startsWithSpecialBlock(current)) break;
      paragraphLines.push(current);
      index += 1;
    }
    nodes.push(
      <p key={`p-${index}`} className="text-mutedForeground">
        {paragraphLines.join(" ")}
      </p>
    );
  }

  return <div className="space-y-6 text-[17px] leading-relaxed text-foreground">{nodes}</div>;
}
