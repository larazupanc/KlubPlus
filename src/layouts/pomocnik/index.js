"use client";

import React, { useState, useRef, useEffect } from "react";

function Pomocnik() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("text", input);
      formData.append("language", "sl");

      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const data = await res.json();

      let correctedText = input;
      data.matches
        .sort((a, b) => b.offset - a.offset)
        .forEach((match) => {
          if (match.replacements.length > 0) {
            correctedText =
              correctedText.slice(0, match.offset) +
              match.replacements[0].value +
              correctedText.slice(match.offset + match.length);
          }
        });

      const aiMessage = { role: "assistant", content: correctedText };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Prišlo je do napake pri preverjanju besedila." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Slovnični Pomočnik</h1>

      <div
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <strong>{m.role === "user" ? "Uporabnik: " : "Pomočnik: "}</strong>
            <span>{m.content}</span>
          </div>
        ))}
        {loading && <div>Pomočnik razmišlja...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleCustomSubmit} style={{ display: "flex", marginTop: "10px" }}>
        <input
          style={{ flexGrow: 1, padding: "8px" }}
          value={input}
          placeholder="Vpiši besedilo v slovenščini..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" style={{ padding: "8px", marginLeft: "8px" }}>
          Preveri
        </button>
      </form>
    </div>
  );
}

export default Pomocnik;
