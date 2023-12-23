import React from "react";
import Time from "./Time"; // Time 컴포넌트를 불러옵니다.

export default function Chat({ chat }) {
  return (
    <>
      <div className={`list ${chat.type}-chat`}>
        <div className="content">{chat.content}</div>
        <Time className="chat-time" time={chat.time} />{" "}
      </div>
    </>
  );
}
