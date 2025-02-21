import React from "react";

const MotdTranslate: React.FC<{ motd: string }> = ({ motd }) => {
  const colorMap: { [key: string]: string } = {
    black: "#000000",
    dark_blue: "#0000AA",
    dark_green: "#00AA00",
    dark_aqua: "#00AAAA",
    dark_red: "#AA0000",
    dark_purple: "#AA00AA",
    gold: "#FFAA00",
    gray: "#AAAAAA",
    dark_gray: "#555555",
    blue: "#5555FF",
    green: "#55FF55",
    aqua: "#55FFFF",
    red: "#FF5555",
    light_purple: "#FF55FF",
    yellow: "#FFFF55",
    white: "#FFFFFF",
  };

  const regex = /(#[0-9A-Fa-f]{6}|[a-z_]+):([^ ]+)/g;

  const isRTL = (text: string) => {
    const rtlRegex = /[\u0590-\u05FF]/;
    return rtlRegex.test(text);
  };

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(motd)) !== null) {
    if (match.index > lastIndex)
      parts.push({ type: "text", content: motd.slice(lastIndex, match.index) });

    const color = colorMap[match[1]] || match[1];
    const text = match[2].trim();
    parts.push({ type: "styled", color, content: text });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < motd.length)
    parts.push({ type: "text", content: motd.slice(lastIndex) });

  return (
    <div style={{ unicodeBidi: "plaintext" }}>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <span
              key={index}
              style={{
                direction: isRTL(part.content) ? "rtl" : "ltr",
                unicodeBidi: "embed",
              }}
            >
              {part.content}
            </span>
          );
        } else {
          return (
            <span
              key={index}
              style={{
                color: part.color,
                direction: isRTL(part.content) ? "rtl" : "ltr",
                unicodeBidi: "embed",
              }}
            >
              {part.content}
            </span>
          );
        }
      })}
    </div>
  );
};

export default MotdTranslate;
