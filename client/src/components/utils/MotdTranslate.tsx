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

  const regex = /(#[0-9A-Fa-f]{6}|[a-z_]+):([^#a-z_]+)?/g;

  const isRTL = (text: string) => /[\u0590-\u05FF]/.test(text);

  const parts: (string | { type: "styled"; content: string; color: string })[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(motd)) !== null) {
    if (match.index > lastIndex) {
      const before = motd.slice(lastIndex, match.index);
      if (before) parts.push(before);
    }

    const rawColor = match[1];
    let text = (match[2] || "");

    if (text.length > 0) {
      if (!text.endsWith(" ")) text += " ";
      const color = rawColor.startsWith("#") ? rawColor : colorMap[rawColor] || "#FFFFFF";
      parts.push({ type: "styled", color, content: text });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < motd.length) {
    parts.push(motd.slice(lastIndex));
  }

  return (
    <div style={{ unicodeBidi: "plaintext", whiteSpace: "pre-wrap" }}>
      {parts.map((part, index) => {
        if (typeof part === "string") {
          return part.split("\n").map((chunk, i, arr) => (
            <React.Fragment key={`${index}-${i}`}>
              {chunk}
              {i < arr.length - 1 && <br />}
            </React.Fragment>
          ));
        }
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
      })}
    </div>
  );
};

export default MotdTranslate;
