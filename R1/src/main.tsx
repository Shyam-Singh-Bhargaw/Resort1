import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handlers to surface runtime errors directly in the page.
function showFatalError(msg: string) {
	try {
		// Render error UI into a standalone overlay element so we don't mutate
		// React's root DOM while it may be committing. This avoids removeChild
		// errors when the renderer is in the middle of updates.
		let overlay = document.getElementById("fatal-error-overlay");
		if (!overlay) {
			overlay = document.createElement("div");
			overlay.id = "fatal-error-overlay";
			Object.assign(overlay.style, {
				position: "fixed",
				inset: "16px",
				zIndex: "2147483647",
				overflow: "auto",
				background: "rgba(255,255,255,0.98)",
				border: "1px solid #eee",
				borderRadius: "8px",
				padding: "18px",
				boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
				fontFamily: "system-ui,Segoe UI,Roboto,Arial",
				color: "#111",
			});
			document.body.appendChild(overlay);
		}
		overlay.innerHTML = `
			<div>
				<h1 style="font-size:20px;margin:0 0 12px">Application Error</h1>
				<pre style="white-space:pre-wrap;word-break:break-word;background:#fff;border:1px solid #eee;padding:12px;border-radius:6px">${String(
					msg
		).replace(/</g, "&lt;")}</pre>
			</div>
		`;
	} catch (e) {
		console.error("Failed to render fatal error UI", e);
	}
}

window.addEventListener("error", (event) => {
	const err = (event && (event.error || event.message)) || "Unknown error";
	console.error("Global error:", err, event);
	showFatalError(err instanceof Error ? err.stack || err.message : JSON.stringify(err));
});

window.addEventListener("unhandledrejection", (event) => {
	console.error("Unhandled Rejection:", event.reason);
	const reason = event && (event.reason && (event.reason.stack || event.reason.message)) || JSON.stringify(event.reason || "Unknown rejection");
	showFatalError(String(reason));
});

// Robust mount: wait for DOM, create #root if necessary, then mount once.
function mountApp() {
	let container = document.getElementById("root");
	if (!container) {
		// Create root if missing (prevents blank when index.html lacks #root or script runs early)
		console.warn("#root not found — creating one dynamically");
		container = document.createElement("div");
		container.id = "root";
		// Ensure body exists
		if (!document.body) {
			// If body is not yet present, try again shortly
			return setTimeout(mountApp, 50);
		}
		document.body.prepend(container);
	}

	try {
		const root = createRoot(container);
		root.render(
			<React.StrictMode>
				<App />
			</React.StrictMode>
		);
		console.log("DEBUG: React mounted into #root");
	} catch (err) {
		console.error("Error mounting React app:", err);
		showFatalError(String(err));
	}
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", mountApp);
	// Also try a fallback in case DOMContentLoaded already passed unusually
	setTimeout(() => {
		if (!document.getElementById("root")) mountApp();
	}, 100);
} else {
	mountApp();
}
