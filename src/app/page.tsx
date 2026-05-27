export default function Home() {
  return (
    <main style={{ fontFamily: "var(--font-body)" }}>
      {/* NAVBAR */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #ede9fe", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px", position: "sticky", top: 0, zIndex: 50 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", color: "#7c3aed" }}>VoiceTranslate</span>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <a href="#features" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.9rem" }}>Fonctionnalites</a>
          <a href="#how" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.9rem" }}>Comment ca marche</a>
          <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" style={{ background: "#7c3aed", color: "#fff", padding: "0.5rem 1.25rem", borderRadius: "8px", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>Demo gratuite</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", padding: "5rem 2rem 4rem", textAlign: "center" }}>
        <span style={{ display: "inline-block", background: "#7c3aed", color: "#fff", borderRadius: "999px", padding: "0.4rem 1.2rem", fontSize: "0.8rem", fontWeight: 600, marginBottom: "1.5rem", letterSpacing: "0.05em" }}>Traduction vocale temps reel</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.15, color: "#0f172a", marginBottom: "1.5rem", maxWidth: "800px", margin: "0 auto 1.5rem" }}>
          Parlez. Votre audience comprend.<br /><span style={{ color: "#7c3aed" }}>En direct. Dans 40+ langues.</span>
        </h1>
        <p style={{ color: "#475569", fontSize: "1.15rem", maxWidth: "560px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          ASR + traduction neurale + TTS &mdash; traduction vocale en direct avec moins de 500ms de latence, qualite broadcast.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3.5rem" }}>
          <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" style={{ background: "#7c3aed", color: "#fff", padding: "0.85rem 2rem", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "1rem" }}>Demander une demo</a>
          <a href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20VoiceTranslate%20avec%20Wikolabs." target="_blank" rel="noopener noreferrer" style={{ background: "#25d366", color: "#fff", padding: "0.85rem 2rem", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "1rem" }}>WhatsApp</a>
        </div>
        <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
          {[{ value: "<500ms", label: "latence" }, { value: "40+", label: "langues" }, { value: "99.1%", label: "precision" }, { value: "Broadcast", label: "quality" }].map((m) => (
            <div key={m.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "#7c3aed" }}>{m.value}</div>
              <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "5rem 2rem", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: "0.75rem" }}>La chaine vocale complete</h2>
          <p style={{ color: "#64748b", textAlign: "center", marginBottom: "3rem", fontSize: "1rem" }}>ASR, traduction et synthese vocale optimises pour la qualite broadcast.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {[
              { icon: "🎙", title: "ASR multilingue", desc: "Reconnaissance vocale de precision broadcast sur 40+ langues avec adaptation au vocabulaire metier, accents et environnements bruites." },
              { icon: "🌍", title: "Traduction neurale", desc: "Modeles de traduction specialises par paire de langues -- plus precis que les APIs generiques sur les textes techniques et professionnels." },
              { icon: "🔊", title: "TTS naturel", desc: "Synthese vocale indiscernable du naturel, avec preservation du rythme, des pauses et de l'intonation du locuteur original." },
            ].map((f) => (
              <div key={f.title} style={{ background: "#f5f3ff", borderRadius: "16px", padding: "2rem", border: "1px solid #ede9fe" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{f.icon}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "#0f172a", marginBottom: "0.75rem" }}>{f.title}</h3>
                <p style={{ color: "#475569", lineHeight: 1.7, fontSize: "0.95rem" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "5rem 2rem", background: "#f5f3ff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "#0f172a", textAlign: "center", marginBottom: "0.75rem" }}>Comment ca marche</h2>
          <p style={{ color: "#64748b", textAlign: "center", marginBottom: "3rem", fontSize: "1rem" }}>Integrez VoiceTranslate en quelques heures, diffusez en direct.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {[
              { step: "01", title: "Configurez la langue source", desc: "Selectionnez la langue d'entree et les langues de sortie. Ajoutez votre vocabulaire metier pour ameliorer la precision." },
              { step: "02", title: "Flux audio en entree", desc: "API WebSocket ou WebRTC pour flux temps reel. Support des fichiers audio/video pour traitement en batch." },
              { step: "03", title: "Traduction diffusee en direct", desc: "Le flux traduit est disponible en moins de 500ms : audio synthetise, sous-titres WebVTT, transcript JSON -- selon votre usage." },
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", background: "#fff", borderRadius: "16px", padding: "1.75rem", border: "1px solid #ede9fe" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "#7c3aed", minWidth: "3rem" }}>{s.step}</span>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "#0f172a", marginBottom: "0.5rem" }}>{s.title}</h3>
                  <p style={{ color: "#475569", lineHeight: 1.7, fontSize: "0.95rem" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 2rem", background: "#7c3aed", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", fontWeight: 800, color: "#fff", marginBottom: "1rem" }}>Brisez la barriere de la langue en 24h</h2>
        <p style={{ color: "#ede9fe", fontSize: "1.1rem", marginBottom: "2rem" }}>Demo live sur votre cas d&apos;usage. Sans engagement.</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" style={{ background: "#fff", color: "#7c3aed", padding: "0.9rem 2.25rem", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "1rem" }}>Planifier une demo</a>
          <a href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20VoiceTranslate%20avec%20Wikolabs." target="_blank" rel="noopener noreferrer" style={{ background: "#25d366", color: "#fff", padding: "0.9rem 2.25rem", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "1rem" }}>WhatsApp</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "2.5rem 2rem", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "#fff", marginBottom: "0.5rem" }}>VoiceTranslate by Wikolabs</div>
        <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
          <a href="mailto:team@wikolabs.com" style={{ color: "#94a3b8", textDecoration: "none" }}>team@wikolabs.com</a>
          {" · "}
          <a href="https://wikolabs.com" target="_blank" rel="noopener noreferrer" style={{ color: "#94a3b8", textDecoration: "none" }}>wikolabs.com</a>
        </div>
        <div style={{ fontSize: "0.8rem", color: "#475569" }}>c 2026 Wikolabs. Tous droits reserves.</div>
      </footer>
    </main>
  );
}