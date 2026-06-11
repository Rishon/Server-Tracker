import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface Segment {
  text: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
}

type Style = Omit<Segment, "text">;

const colorMap: Record<string, string> = {
  "0": "#000000",
  "1": "#0000AA",
  "2": "#00AA00",
  "3": "#00AAAA",
  "4": "#AA0000",
  "5": "#AA00AA",
  "6": "#FFAA00",
  "7": "#AAAAAA",
  "8": "#555555",
  "9": "#5555FF",
  a: "#55FF55",
  b: "#55FFFF",
  c: "#FF5555",
  d: "#FF55FF",
  e: "#FFFF55",
  f: "#FFFFFF",
};

const HEX_RE = /^[0-9a-fA-F]$/;

function parseMotd(input: string): Segment[][] {
  const lines: Segment[][] = [[]];
  let style: Style = {};
  let buf = "";

  const flush = () => {
    if (!buf) return;
    lines[lines.length - 1].push({ text: buf, ...style });
    buf = "";
  };

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (ch === "\n") {
      flush();
      lines.push([]);
      continue;
    }

    if (ch === "§" && i + 1 < input.length) {
      const code = input[i + 1].toLowerCase();

      if (
        code === "x" &&
        i + 13 < input.length &&
        input[i + 2] === "§" &&
        input[i + 4] === "§" &&
        input[i + 6] === "§" &&
        input[i + 8] === "§" &&
        input[i + 10] === "§" &&
        input[i + 12] === "§" &&
        HEX_RE.test(input[i + 3]) &&
        HEX_RE.test(input[i + 5]) &&
        HEX_RE.test(input[i + 7]) &&
        HEX_RE.test(input[i + 9]) &&
        HEX_RE.test(input[i + 11]) &&
        HEX_RE.test(input[i + 13])
      ) {
        flush();
        const hex =
          input[i + 3] +
          input[i + 5] +
          input[i + 7] +
          input[i + 9] +
          input[i + 11] +
          input[i + 13];
        style = { color: `#${hex}` };
        i += 13;
        continue;
      }

      if (colorMap[code]) {
        flush();
        style = { color: colorMap[code] };
        i++;
        continue;
      }

      flush();
      switch (code) {
        case "l":
          style = { ...style, bold: true };
          break;
        case "o":
          style = { ...style, italic: true };
          break;
        case "n":
          style = { ...style, underlined: true };
          break;
        case "m":
          style = { ...style, strikethrough: true };
          break;
        case "k":
          style = { ...style, obfuscated: true };
          break;
        case "r":
          style = {};
          break;
      }
      i++;
      continue;
    }

    buf += ch;
  }

  flush();
  return lines.filter((line) => line.some((seg) => seg.text.length > 0));
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const BASE_FONT_REM = 0.95;
const LINE_HEIGHT = 1.25;
const MAX_LINES = 2;

const MotdTranslate: React.FC<{ motd: string }> = ({ motd }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const lines = useMemo(() => parseMotd(motd || ""), [motd]);

  useIsomorphicLayoutEffect(() => {
    const recompute = () => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const w = content.offsetWidth;
      const h = content.offsetHeight;
      if (w === 0 || h === 0) return;

      const next = Math.min(1, cw / w, (ch + 4) / h);
      setScale(next > 0 ? next : 1);
    };

    recompute();

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      ro = new ResizeObserver(recompute);
      ro.observe(containerRef.current);
    }

    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready?.then(recompute).catch(() => {});

    return () => ro?.disconnect();
  }, [lines]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: `${BASE_FONT_REM * LINE_HEIGHT * MAX_LINES}rem`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        ref={contentRef}
        style={{
          display: "inline-block",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          fontFamily: "'Inter', sans-serif",
          fontSize: `${BASE_FONT_REM}rem`,
          lineHeight: LINE_HEIGHT,
          color: "#FFFFFF",
          textShadow: "1px 1px 0 rgba(0,0,0,0.5)",
        }}
      >
        {lines.map((segments, li) => (
          <div
            key={li}
            style={{
              whiteSpace: "pre",
              textAlign: "center",
              unicodeBidi: "plaintext",
            }}
          >
            {segments.map((seg, si) => (
              <span
                key={si}
                className={seg.obfuscated ? "animate-pulse" : undefined}
                style={{
                  color: seg.color,
                  fontWeight: seg.bold ? 700 : undefined,
                  fontStyle: seg.italic ? "italic" : undefined,
                  textDecoration:
                    [
                      seg.underlined ? "underline" : "",
                      seg.strikethrough ? "line-through" : "",
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined,
                }}
              >
                {seg.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MotdTranslate;
