import type { ReactNode } from "react";
import { InlineLink } from "./PublicPage";

function isPlaceholder(value: string) {
  return /^\[[^\]\n]{1,160}\]$/.test(value);
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const token =
    /(\*\*[^*]+?\*\*)|(\*[^*\n]+?\*)|(_[^_\n]+?_)|(\[[^\]\n]{1,160}\])|(https?:\/\/[^\s<]+)|((?:www\.)[^\s<]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = token.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [raw, bold, italic, underscore, placeholder, url, www, email] = match;
    const key = `${keyPrefix}-${index++}`;

    if (bold) {
      nodes.push(<strong key={key}>{renderInline(bold.slice(2, -2), `${key}-b`)}</strong>);
    } else if (italic || underscore) {
      const marked = italic ?? underscore;
      nodes.push(<em key={key}>{renderInline(marked.slice(1, -1), `${key}-i`)}</em>);
    } else if (placeholder && isPlaceholder(placeholder)) {
      nodes.push(
        <span key={key} className="rounded-[2px] bg-gold-deep/12 px-1 py-0.5 text-forest-deep">
          {placeholder}
        </span>,
      );
    } else if (url || www) {
      const href = (url ?? `https://${www}`).replace(/[),.;]+$/, "");
      nodes.push(
        <InlineLink key={key} href={href}>
          {raw.replace(/[),.;]+$/, "")}
        </InlineLink>,
      );
    } else if (email) {
      nodes.push(
        <InlineLink key={key} href={`mailto:${email}`}>
          {email}
        </InlineLink>,
      );
    }

    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function slugifyHeading(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return /^\d/.test(slug) ? `sekce-${slug}` : slug;
}

function parseTableRow(line: string) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line: string) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function renderBlocks(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let skippedTitle = false;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith("# ") && !skippedTitle) {
      skippedTitle = true;
      i += 1;
      continue;
    }

    if (/^##\s+/.test(line)) {
      const title = line.replace(/^##\s+/, "").trim();
      const id = slugifyHeading(title);
      blocks.push(
        <h2
          key={`h2-${id}-${i}`}
          id={id}
          className="scroll-mt-28 pt-6 font-serif-display text-forest-deep first:pt-0"
          style={{ fontSize: "clamp(1.7rem, 3vw, 2.35rem)", lineHeight: 1.15 }}
        >
          {title}
        </h2>,
      );
      i += 1;
      continue;
    }

    if (/^###\s+/.test(line)) {
      const title = line.replace(/^###\s+/, "").trim();
      blocks.push(
        <h3
          key={`h3-${i}`}
          id={slugifyHeading(title)}
          className="scroll-mt-28 font-serif-display text-2xl text-forest-deep"
        >
          {title}
        </h3>,
      );
      i += 1;
      continue;
    }

    if (line.trim().startsWith("|") && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
      const headers = parseTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && !isTableDivider(lines[i])) {
        rows.push(parseTableRow(lines[i]));
        i += 1;
      }
      blocks.push(
        <div key={`table-${i}`} className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm leading-relaxed">
            <thead>
              <tr className="border-b border-gold-deep/35">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-3 py-3 font-medium text-forest-deep"
                    style={{ letterSpacing: "0.02em" }}
                  >
                    {renderInline(header, `th-${header}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`tr-${rowIndex}`} className="border-b border-forest-deep/10 align-top">
                  {row.map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`} className="px-3 py-3 text-ink/72">
                      {renderInline(cell, `td-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i += 1;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="list-disc space-y-2 pl-5 marker:text-gold-deep">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item, `li-${i}-${itemIndex}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].trim().startsWith("|") &&
      !/^[-*]\s+/.test(lines[i])
    ) {
      paragraphLines.push(lines[i]);
      i += 1;
      if (!/ {2}$/.test(paragraphLines[paragraphLines.length - 1])) {
        break;
      }
    }

    const joined = paragraphLines
      .map((paragraphLine, lineIndex) => {
        const hardBreak = / {2}$/.test(paragraphLine) || lineIndex < paragraphLines.length - 1;
        return {
          text: paragraphLine.replace(/ {2}$/, ""),
          hardBreak,
        };
      })
      .filter((part) => part.text.length > 0);

    const isDraftNotice = /^\*\*DRAFT\b/.test(joined[0]?.text ?? "");
    const isClosing =
      joined.length === 1 &&
      (/^_[^_]+_$/.test(joined[0].text) ||
        (/^\*/.test(joined[0].text) && !/^\*\*/.test(joined[0].text)));

    if (isDraftNotice) {
      blocks.push(
        <p
          key={`draft-${i}`}
          className="border border-gold-deep/20 bg-ivory-warm px-5 py-4 text-sm leading-relaxed text-forest-deep/75"
        >
          {renderInline(joined.map((part) => part.text).join(" "), `draft-${i}`)}
        </p>,
      );
      continue;
    }

    blocks.push(
      <p
        key={`p-${i}`}
        className={
          isClosing
            ? "pt-4 text-sm italic text-forest-deep/65"
            : "text-[0.98rem] leading-[1.85] text-ink/72"
        }
      >
        {joined.flatMap((part, partIndex) => {
          const content = renderInline(part.text, `p-${i}-${partIndex}`);
          if (part.hardBreak && partIndex < joined.length - 1) {
            return [...content, <br key={`br-${i}-${partIndex}`} />];
          }
          return content;
        })}
      </p>,
    );
  }

  return blocks;
}

export function LegalMarkdown({ content }: { content: string }) {
  return <div className="space-y-5">{renderBlocks(content)}</div>;
}
