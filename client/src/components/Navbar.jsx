import React from "react";

function Navbar() {
  console.log("✅ Navbar rendered");

  return (
    <nav
      style={{
        background: "#1e293b",
        color: "white",
        padding: "1rem",
        display: "flex",
        alignItems: "center"
      }}
    >
      <h2>🔐 Security Ops Dashboard</h2>
    </nav>
  );
}

export default Navbar;
