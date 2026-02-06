import React from "react";

interface StyledPart {
  text: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
}

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

const MotdTranslate: React.FC<{ motd: string }> = ({ motd }) => {
  const parseMotd = (text: string): StyledPart[] => {
    const parts: StyledPart[] = [];
    let currentPart: StyledPart = { text: "" };

    for (let i = 0; i < text.length; i++) {
      if (text[i] === "§" && i + 1 < text.length) {
        const code = text[i + 1].toLowerCase();

        // Handle hex colors
        if (
          code === "x" &&
          i + 13 < text.length &&
          text[i + 2] === "§" &&
          text[i + 4] === "§" &&
          text[i + 6] === "§" &&
          text[i + 8] === "§" &&
          text[i + 10] === "§" &&
          text[i + 12] === "§"
        ) {
          if (currentPart.text) parts.push(currentPart);

          const hex =
            text[i + 3] +
            text[i + 5] +
            text[i + 7] +
            text[i + 9] +
            text[i + 11] +
            text[i + 13];
          currentPart = { ...currentPart, text: "", color: `#${hex}` };
          i += 13;
          continue;
        }

        if (colorMap[code]) {
          if (currentPart.text) parts.push(currentPart);
          currentPart = { text: "", color: colorMap[code] };
        } else {
          switch (code) {
            case "l":
              currentPart.bold = true;
              break;
            case "o":
              currentPart.italic = true;
              break;
            case "n":
              currentPart.underlined = true;
              break;
            case "m":
              currentPart.strikethrough = true;
              break;
            case "k":
              currentPart.obfuscated = true;
              break;
            case "r":
              if (currentPart.text) parts.push(currentPart);
              currentPart = { text: "" };
              break;
          }
        }
        i++;
      } else {
        currentPart.text += text[i];
      }
    }

    if (currentPart.text) parts.push(currentPart);
    return parts;
  };

  const isRTL = (text: string) => /[\u0590-\u05FF]/.test(text);

  const parts = parseMotd(motd);

  return (
    <div
      style={{
        unicodeBidi: "plaintext",
        whiteSpace: "pre-wrap",
        fontFamily: "'Inter', sans-serif",
        lineHeight: "1.2",
        fontSize: "0.95rem",
        color: "#FFFFFF",
        textShadow: "1px 1px 0px rgba(0,0,0,0.5)",
      }}
    >
      {parts.map((part, index) => (
        <span
          key={index}
          style={{
            color: part.color || "inherit",
            fontWeight: part.bold ? "bold" : "normal",
            fontStyle: part.italic ? "italic" : "normal",
            textDecoration: [
              part.underlined ? "underline" : "",
              part.strikethrough ? "line-through" : "",
            ]
              .filter(Boolean)
              .join(" "),
            direction: isRTL(part.text) ? "rtl" : "ltr",
            unicodeBidi: "embed",
          }}
          className={part.obfuscated ? "animate-pulse" : ""}
        >
          {part.text}
        </span>
      ))}
    </div>
  );
};

export default MotdTranslate;
