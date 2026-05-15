import { useState, useEffect } from "react";

// Poppins font from Google Fonts
const poppinsLink = document.createElement("link");
poppinsLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700;800&display=swap";
poppinsLink.rel = "stylesheet";
document.head.appendChild(poppinsLink);

const SUPA_URL = "https://pttbpywteivrcnvhpmxi.supabase.co";
const SUPA_KEY = "sb_publishable_DHepCUr-K6nqE9YFPGtSXA_niYxTOsK";

const api = async (path, opts = {}) => {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    ...opts,
  });
  if (!res.ok) return null;
  return res.json();
};

const DEMO_SERVICES = [
  { id: 1, name: "Troca de Lâmpadas", icon: "💡", price_min: 60, category: "Elétrica", description: "Substituição de lâmpadas LED e convencionais" },
  { id: 2, name: "Instalação de TV", icon: "📺", price_min: 120, category: "Instalação", description: "Fixação em parede com suporte" },
  { id: 3, name: "Ar Condicionado", icon: "❄️", price_min: 250, category: "Climatização", description: "Instalação completa de split" },
  { id: 4, name: "Chuveiro Elétrico", icon: "🚿", price_min: 150, category: "Hidráulica", description: "Troca ou instalação de chuveiro" },
  { id: 5, name: "Tomadas e Interruptores", icon: "🔌", price_min: 80, category: "Elétrica", description: "Instalação ou troca" },
  { id: 6, name: "Marido de Aluguel", icon: "🔧", price_min: 90, category: "Geral", description: "Serviços gerais residenciais" },
];



const C = {
  purple: "#6B21E8",
  purpleDark: "#4C0FBE",
  purpleLight: "#8B47F0",
  purpleBg: "#F5F0FF",
  purpleCard: "#EDE5FF",
  white: "#FFFFFF",
  gray: "#F7F7F7",
  grayMid: "#E5E5E5",
  text: "#1A1A2E",
  muted: "#8B8FA8",
  green: "#22C55E",
  red: "#EF4444",
  yellow: "#F59E0B",
};

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M14 2L3 11v15h7v-8h8v8h7V11L14 2z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M14 13c0-1.1-.9-2-2-2s-2 .9-2 2c0 .74.4 1.38 1 1.72V17h2v-2.28c.6-.34 1-.98 1-1.72z" fill={C.purple}/>
    <path d="M14 10.5c-.83-1.5-2.5-1.5-2.5-1.5s.5 1.5 0 3c1 .5 2 .5 2.5 0 .5-.5.5-1.5 0-1.5z" fill={C.purple}/>
    <circle cx="14" cy="13.5" r="2.5" fill={C.purple}/>
  </svg>
);

const LogoHeart = ({ size = 48, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="12" fill={C.purple}/>
    <path d="M24 9L10 20v20h9V29h10v11h9V20L24 9z" fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M24 24.5c0-2.2-1.8-3.5-3.5-3.5S17 22.3 17 24.5c0 1.2.5 2.2 1.3 2.9L24 32l5.7-4.6c.8-.7 1.3-1.7 1.3-2.9 0-2.2-1.8-3.5-3.5-3.5S24 22.3 24 24.5z" fill={color}/>
  </svg>
);

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [proForm, setProForm] = useState({ name: "", specialty: "", phone: "", cpf: "", city: "", bio: "", docFile: null, photoFile: null });
  const [proStep, setProStep] = useState(1);
  const [proLoading, setProLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [selected, setSelected] = useState(null);
  const [orders, setOrders] = useState([]);
  const [bookingStep, setBookingStep] = useState(1);
  const [booking, setBooking] = useState({ date: "", time: "", address: "", payment: "pix" });
  const [filterCat, setFilterCat] = useState("Todos");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { from: "pro", text: "Olá! Posso te ajudar com algum serviço hoje?", time: "10:00" }
  ]);
  const [selectedPro, setSelectedPro] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const saved = localStorage.getItem("elaresolve_user");
      if (saved) {
        setUser(JSON.parse(saved));
        setScreen("home");
      } else {
        setScreen("auth");
      }
    }, 2200);
    loadServices();
    return () => clearTimeout(t);
  }, []);

  const loadServices = async () => {
    const data = await api("services?select=*&order=name");
    if (data && data.length > 0) setServices(data);
    else setServices(DEMO_SERVICES);
    const pros = await api("professionals?select=*&order=name");
    if (pros) setProfessionals(pros);
  };

  const doLogin = async () => {
    setLoading(true); setMsg("");
    try {
      const res = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: SUPA_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (data.access_token) {
        const u = { email: form.email, name: form.email.split("@")[0], token: data.access_token };
        setUser(u);
        localStorage.setItem("elaresolve_user", JSON.stringify(u));
        setScreen("home");
      } else {
        setMsg("E-mail ou senha incorretos.");
      }
    } catch { setMsg("Erro de conexão."); }
    setLoading(false);
  };

  const doRegister = async () => {
    if (!form.name || !form.email || !form.password) { setMsg("Preencha todos os campos."); return; }
    setLoading(true); setMsg("");
    try {
      const res = await fetch(`${SUPA_URL}/auth/v1/signup`, {
        method: "POST",
        headers: { apikey: SUPA_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (data.id || data.user) {
        setMsg("✓ Conta criada! Faça login.");
        setAuthMode("login");
      } else {
        setMsg(data.msg || data.error_description || "Erro ao cadastrar.");
      }
    } catch { setMsg("Erro de conexão."); }
    setLoading(false);
  };

  const doLogout = () => {
    setUser(null);
    localStorage.removeItem("elaresolve_user");
    setScreen("auth");
  };

  const confirmBooking = async () => {
    const order = {
      service_id: selected?.id,
      service_name: selected?.name,
      date: booking.date,
      time: booking.time,
      address: booking.address,
      payment: booking.payment,
      status: "pending",
      user_email: user?.email,
      total: selected?.price_min,
    };
    await api("orders", { method: "POST", body: JSON.stringify(order) });
    setOrders(prev => [...prev, { ...order, id: Date.now() }]);
    setScreen("orders");
    setBookingStep(1);
    setBooking({ date: "", time: "", address: "", payment: "pix" });
  };

  const doRegisterPro = async () => {
    if (!proForm.name || !proForm.specialty || !proForm.phone || !proForm.cpf || !proForm.city) {
      setMsg("Preencha todos os campos obrigatórios."); return;
    }
    setProLoading(true); setMsg("");
    try {
      const proData = {
        name: proForm.name,
        specialty: proForm.specialty,
        bio: proForm.bio || "",
        phone: proForm.phone,
        cpf: proForm.cpf,
        city: proForm.city,
        verification_status: "pending",
        available: false,
        rating: 0,
      };
      const res = await fetch(`${SUPA_URL}/rest/v1/professionals`, {
        method: "POST",
        headers: {
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(proData),
      });
      const result = await res.json();
      if (res.ok) {
        setMsg("✓ Cadastro enviado! Aguarde a aprovação.");
        setProStep(1);
        setProForm({ name: "", specialty: "", phone: "", cpf: "", city: "", bio: "", docFile: null, photoFile: null });
        setTimeout(() => { setAuthMode("login"); setMsg(""); }, 3000);
      } else {
        setMsg("Erro: " + (result?.message || result?.error || JSON.stringify(result)));
      }
    } catch (e) { setMsg("Erro ao enviar cadastro: " + e.message); }
    setProLoading(false);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setChatMessages(prev => [...prev, { from: "me", text: chatInput, time: now }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages(prev => [...prev, { from: "pro", text: "Entendido! Posso atender você em breve.", time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1200);
  };

  const allSvcs = services.length > 0 ? services : DEMO_SERVICES;
  const categories = ["Todos", ...Array.from(new Set(allSvcs.map(s => s.category)))];
  const filteredServices = allSvcs.filter(s => filterCat === "Todos" || s.category === filterCat);

  const base = {
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    minHeight: "100vh",
    background: C.gray,
    color: C.text,
    paddingBottom: 80,
  };

  const btn = (bg = C.purple, color = C.white) => ({
    background: bg, color, border: "none", borderRadius: 14, padding: "15px 24px",
    fontWeight: 700, fontSize: 16, cursor: "pointer", width: "100%",
    boxShadow: bg === C.purple ? "0 4px 20px #6B21E840" : "none",
  });

  const input = {
    background: C.white, border: `1.5px solid ${C.grayMid}`, borderRadius: 12,
    padding: "14px 16px", color: C.text, fontSize: 15, width: "100%",
    boxSizing: "border-box", outline: "none",
  };

  const card = {
    background: C.white, borderRadius: 18, padding: 18, marginBottom: 12,
    boxShadow: "0 2px 12px #0000000a",
  };

  const pill = (active) => ({
    background: active ? C.purple : C.white,
    color: active ? C.white : C.muted,
    border: `1.5px solid ${active ? C.purple : C.grayMid}`,
    borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 600,
    cursor: "pointer", whiteSpace: "nowrap",
  });

  const tag = (color = C.purple) => ({
    background: color + "18", color, borderRadius: 8, padding: "3px 10px",
    fontSize: 12, fontWeight: 700, display: "inline-block",
  });

  // SPLASH
  if (screen === "splash") {
    return (
      <div style={{ ...base, background: C.purple, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: 0 }}>
        <div style={{ animation: "fadeIn 0.6s ease" }}>
          <LogoHeart size={90} color={C.white} />
        </div>
        <div style={{ color: C.white, fontSize: 36, fontWeight: 800, marginTop: 20, fontFamily: "'Poppins', sans-serif", letterSpacing: -0.5 }}>ElaResolve</div>
        <div style={{ color: "#ffffff99", fontSize: 16, marginTop: 6, fontFamily: "'Poppins', sans-serif", fontWeight: 300 }}>Cuidado & Confiança</div>
        <div style={{ marginTop: 60, display: "flex", gap: 8 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: i === 0 ? 24 : 8, height: 8, borderRadius: 4, background: i === 0 ? C.white : "#ffffff44" }} />)}
        </div>
        <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}`}</style>
      </div>
    );
  }

  // AUTH
  if (screen === "auth") {
    const SPECIALTIES = ["Eletricista", "Hidráulico", "Ar Condicionado", "Pintor", "Marceneiro", "Marido de Aluguel", "Instalador de TV", "Chaveiro", "Outro"];

    // CADASTRO PROFISSIONAL
    if (authMode === "pro") {
      return (
        <div style={{ ...base, paddingBottom: 0 }}>
          <div style={{ background: `linear-gradient(160deg, ${C.purple} 0%, ${C.purpleDark} 100%)`, padding: "28px 24px 32px" }}>
            <button onClick={() => { setAuthMode("login"); setMsg(""); setProStep(1); }} style={{ background: "#ffffff22", border: "none", color: C.white, borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontSize: 13, marginBottom: 16 }}>← Voltar</button>
            <div style={{ color: C.white, fontSize: 22, fontWeight: 800, fontFamily: "'Poppins', sans-serif" }}>Cadastro de Parceiro</div>
            <div style={{ color: "#ffffff88", fontSize: 13, marginTop: 4 }}>Preencha seus dados para se tornar um profissional ElaResolve</div>
            <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
              {[1, 2, 3].map(n => (
                <div key={n} style={{ flex: 1, height: 4, borderRadius: 4, background: proStep >= n ? C.white : "#ffffff33" }} />
              ))}
            </div>
            <div style={{ color: "#ffffff88", fontSize: 12, marginTop: 6 }}>Etapa {proStep} de 3</div>
          </div>

          <div style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
            {msg && (
              <div style={{ background: msg.startsWith("✓") ? C.green + "18" : C.red + "18", color: msg.startsWith("✓") ? C.green : C.red, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 14, fontWeight: 600 }}>{msg}</div>
            )}

            {/* ETAPA 1 — Dados pessoais */}
            {proStep === 1 && (
              <div style={{ background: C.white, borderRadius: 18, padding: 20, boxShadow: "0 2px 12px #0000000a" }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, fontFamily: "'Poppins', sans-serif" }}>👤 Dados Pessoais</div>
                {[
                  ["Nome completo *", "name", "text"],
                  ["CPF *", "cpf", "text"],
                  ["Cidade *", "city", "text"],
                  ["Telefone / WhatsApp *", "phone", "tel"],
                ].map(([label, key, type]) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 6 }}>{label}</label>
                    <input style={input} type={type} placeholder={label.replace(" *", "")} value={proForm[key]} onChange={e => setProForm({ ...proForm, [key]: e.target.value })} />
                  </div>
                ))}
                <button style={{ ...btn(), marginTop: 8 }} onClick={() => {
                  if (!proForm.name || !proForm.cpf || !proForm.city || !proForm.phone) { setMsg("Preencha todos os campos."); return; }
                  setMsg(""); setProStep(2);
                }}>Próximo →</button>
              </div>
            )}

            {/* ETAPA 2 — Especialidade e bio */}
            {proStep === 2 && (
              <div style={{ background: C.white, borderRadius: 18, padding: 20, boxShadow: "0 2px 12px #0000000a" }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, fontFamily: "'Poppins', sans-serif" }}>🔧 Especialidade</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 6 }}>Especialidade *</label>
                  <select style={{ ...input }} value={proForm.specialty} onChange={e => setProForm({ ...proForm, specialty: e.target.value })}>
                    <option value="">Selecione sua especialidade</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 6 }}>Descrição / Bio</label>
                  <textarea style={{ ...input, minHeight: 100, resize: "vertical" }} placeholder="Conte sua experiência, anos de atuação, diferenciais..." value={proForm.bio} onChange={e => setProForm({ ...proForm, bio: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ ...btn(C.grayMid, C.text), flex: 1, boxShadow: "none" }} onClick={() => setProStep(1)}>← Voltar</button>
                  <button style={{ ...btn(), flex: 2 }} onClick={() => {
                    if (!proForm.specialty) { setMsg("Selecione sua especialidade."); return; }
                    setMsg(""); setProStep(3);
                  }}>Próximo →</button>
                </div>
              </div>
            )}

            {/* ETAPA 3 — Documentos */}
            {proStep === 3 && (
              <div style={{ background: C.white, borderRadius: 18, padding: 20, boxShadow: "0 2px 12px #0000000a" }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, fontFamily: "'Poppins', sans-serif" }}>📄 Documentos</div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 6 }}>Foto de perfil</label>
                  <div style={{ border: `2px dashed ${C.grayMid}`, borderRadius: 12, padding: 20, textAlign: "center", cursor: "pointer", background: C.gray }} onClick={() => document.getElementById("photoInput").click()}>
                    {proForm.photoFile ? (
                      <div style={{ color: C.green, fontWeight: 600 }}>✓ {proForm.photoFile.name}</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                        <div style={{ color: C.muted, fontSize: 13 }}>Clique para adicionar foto</div>
                      </>
                    )}
                  </div>
                  <input id="photoInput" type="file" accept="image/*" style={{ display: "none" }} onChange={e => setProForm({ ...proForm, photoFile: e.target.files[0] })} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 6 }}>Documento (RG ou CPF)</label>
                  <div style={{ border: `2px dashed ${C.grayMid}`, borderRadius: 12, padding: 20, textAlign: "center", cursor: "pointer", background: C.gray }} onClick={() => document.getElementById("docInput").click()}>
                    {proForm.docFile ? (
                      <div style={{ color: C.green, fontWeight: 600 }}>✓ {proForm.docFile.name}</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
                        <div style={{ color: C.muted, fontSize: 13 }}>Clique para anexar documento</div>
                      </>
                    )}
                  </div>
                  <input id="docInput" type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => setProForm({ ...proForm, docFile: e.target.files[0] })} />
                </div>
                <div style={{ background: `${C.purple}11`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.purple, marginBottom: 4 }}>🛡️ Seus dados estão seguros</div>
                  <div style={{ color: C.muted, fontSize: 12 }}>Documentos usados apenas para verificação. Após aprovação você aparece no app.</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ ...btn(C.grayMid, C.text), flex: 1, boxShadow: "none" }} onClick={() => setProStep(2)}>← Voltar</button>
                  <button style={{ ...btn(), flex: 2 }} onClick={doRegisterPro} disabled={proLoading}>
                    {proLoading ? "Enviando..." : "✓ Enviar cadastro"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // LOGIN / CADASTRO CLIENTE
    return (
      <div style={{ ...base, paddingBottom: 0 }}>
        <div style={{ background: `linear-gradient(160deg, ${C.purple} 0%, ${C.purpleDark} 100%)`, padding: "50px 24px 40px", textAlign: "center" }}>
          <LogoHeart size={72} color={C.white} />
          <div style={{ color: C.white, fontSize: 30, fontWeight: 800, marginTop: 16, fontFamily: "'Poppins', sans-serif" }}>ElaResolve</div>
          <div style={{ color: "#ffffff88", fontSize: 14, marginTop: 4, fontFamily: "'Poppins', sans-serif", fontWeight: 300 }}>Cuidado & Confiança</div>
        </div>
        <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
          <div style={{ display: "flex", background: C.grayMid, borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setAuthMode(m); setMsg(""); }} style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 10, background: authMode === m ? C.white : "transparent", color: authMode === m ? C.purple : C.muted, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {m === "login" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>
          {msg && (
            <div style={{ background: msg.startsWith("✓") ? C.green + "18" : C.red + "18", color: msg.startsWith("✓") ? C.green : C.red, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 14, fontWeight: 600 }}>{msg}</div>
          )}
          {authMode === "register" && (
            <input style={{ ...input, marginBottom: 12 }} placeholder="Seu nome completo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          )}
          <input style={{ ...input, marginBottom: 12 }} placeholder="E-mail" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input style={{ ...input, marginBottom: 20 }} placeholder="Senha" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button style={btn()} onClick={authMode === "login" ? doLogin : doRegister} disabled={loading}>
            {loading ? "Aguarde..." : authMode === "login" ? "Entrar" : "Criar minha conta"}
          </button>
          <button style={{ ...btn(C.purpleBg, C.purple), marginTop: 12, boxShadow: "none" }} onClick={() => { setUser({ name: "Ana", email: "ana@demo.com" }); setScreen("home"); }}>
            Entrar como visitante
          </button>
          <div style={{ textAlign: "center", marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.grayMid}` }}>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 10 }}>É um profissional?</div>
            <button style={{ ...btn(`${C.purple}18`, C.purple), boxShadow: "none" }} onClick={() => { setAuthMode("pro"); setMsg(""); setProStep(1); }}>
              🔧 Quero ser parceiro ElaResolve
            </button>
          </div>
        </div>
      </div>
    );
  }

  // HOME
  if (screen === "home") {
    return (
      <div style={base}>
        <div style={{ background: `linear-gradient(135deg, ${C.purple} 0%, ${C.purpleDark} 100%)`, padding: "20px 20px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <LogoHeart size={36} color={C.white} />
              <span style={{ color: C.white, fontWeight: 800, fontSize: 20, fontFamily: "'Poppins', sans-serif" }}>ElaResolve</span>
            </div>
            <button onClick={doLogout} style={{ background: "#ffffff22", border: "none", color: C.white, borderRadius: 20, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>Sair</button>
          </div>
          <div style={{ color: "#ffffff88", fontSize: 14, marginBottom: 4 }}>Olá, {user?.name?.split(" ")[0]} 👋</div>
          <div style={{ color: C.white, fontSize: 22, fontWeight: 800 }}>O que você precisa resolver hoje?</div>
        </div>

        <div style={{ background: C.white, margin: "0 16px", marginTop: -16, borderRadius: 18, padding: "16px 16px 4px", boxShadow: "0 4px 20px #0000001a", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12 }}>
            {categories.map(c => (
              <button key={c} style={pill(filterCat === c)} onClick={() => setFilterCat(c)}>{c}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {filteredServices.map(sv => (
              <div key={sv.id} style={{ ...card, padding: 16, cursor: "pointer", marginBottom: 0 }} onClick={() => { setSelected(sv); setScreen("detail"); }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{sv.icon || "🔧"}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{sv.name}</div>
                <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>{sv.category}</div>
                <div style={{ color: C.purple, fontWeight: 800, fontSize: 15 }}>R${sv.price_min}</div>
              </div>
            ))}
          </div>

          <div style={{ background: `${C.purple}11`, border: `1.5px solid ${C.purple}22`, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 28 }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 700, color: C.purple, fontSize: 14 }}>Profissionais verificados</div>
              <div style={{ color: C.muted, fontSize: 12 }}>Serviço garantido e com segurança. Sua prioridade é nossa.</div>
            </div>
          </div>
        </div>

        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.grayMid}`, display: "flex", justifyContent: "space-around", padding: "10px 0 14px", zIndex: 100, boxShadow: "0 -4px 20px #0000000a" }}>
          {[{ id: "home", icon: "🏠", label: "Início" }, { id: "orders", icon: "📋", label: "Pedidos" }, { id: "chat", icon: "💬", label: "Chat" }, { id: "profile", icon: "👤", label: "Perfil" }].map(n => (
            <button key={n.id} style={{ background: "none", border: "none", color: screen === n.id ? C.purple : C.muted, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }} onClick={() => setScreen(n.id)}>
              <span style={{ fontSize: 22 }}>{n.icon}</span>
              <span style={{ fontSize: 11, fontWeight: screen === n.id ? 700 : 400 }}>{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  }

  // DETAIL
  if (screen === "detail" && selected) {
    return (
      <div style={base}>
        <div style={{ background: `linear-gradient(135deg, ${C.purple} 0%, ${C.purpleDark} 100%)`, padding: "20px 20px 40px" }}>
          <button onClick={() => setScreen("home")} style={{ background: "#ffffff22", border: "none", color: C.white, borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontSize: 14, marginBottom: 16 }}>← Voltar</button>
          <div style={{ color: C.white, fontSize: 13, marginBottom: 6 }}>Detalhes do serviço</div>
          <div style={{ color: C.white, fontSize: 26, fontWeight: 800 }}>{selected.name}</div>
        </div>

        <div style={{ padding: "0 16px", marginTop: -20 }}>
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>{selected.icon || "🔧"}</div>
            <div style={{ color: C.muted, textAlign: "center", marginBottom: 16 }}>{selected.description}</div>
            {[["💰 Preço fixo", `R$ ${selected.price_min},00`], ["⏱️ Duração", "Até 1 hora"], ["🛡️ Garantia", "7 dias"], ["✓ Profissional verificado", "Sim"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.grayMid}` }}>
                <span style={{ color: C.muted, fontSize: 14 }}>{k}</span>
                <span style={{ fontWeight: 700, color: C.purple }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Profissionais disponíveis</div>
          {professionals.map(p => (
            <div key={p.id} style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${C.purple}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👤</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div>
                  <div style={{ color: C.muted, fontSize: 13 }}>{p.specialty}</div>
                  <div style={{ color: C.yellow, fontSize: 13, marginTop: 2 }}>⭐ {p.rating} ({p.reviews} avaliações)</div>
                </div>
                <span style={tag(p.badge === "top" ? C.purple : C.green)}>{p.badge === "top" ? "Top" : "✓"}</span>
              </div>
              <div style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>{p.bio}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: p.available ? C.green : C.red, fontWeight: 600, fontSize: 13 }}>
                  {p.available ? "● Disponível agora" : "● Indisponível"}
                </span>
                <button onClick={() => setScreen("chat")} style={{ background: `${C.purple}18`, color: C.purple, border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Entrar em contato</button>
              </div>
              <button style={btn(p.available ? C.purple : C.grayMid, p.available ? C.white : C.muted)} disabled={!p.available}
                onClick={() => { if (p.available) { setSelectedPro(p); setScreen("booking"); setBookingStep(1); } }}>
                {p.available ? "Agendar agora" : "Indisponível"}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // BOOKING
  if (screen === "booking") {
    return (
      <div style={base}>
        <div style={{ background: `linear-gradient(135deg, ${C.purple} 0%, ${C.purpleDark} 100%)`, padding: "20px 20px 28px" }}>
          <button onClick={() => setScreen("detail")} style={{ background: "#ffffff22", border: "none", color: C.white, borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontSize: 14, marginBottom: 16 }}>← Voltar</button>
          <div style={{ color: C.white, fontSize: 22, fontWeight: 800 }}>Agendamento</div>
          <div style={{ color: "#ffffff88", fontSize: 14 }}>{selected?.name}</div>
        </div>

        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {["Data", "Endereço", "Pagamento"].map((label, n) => (
              <div key={n} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: 5, borderRadius: 4, background: bookingStep > n ? C.purple : C.grayMid, marginBottom: 4 }} />
                <div style={{ fontSize: 11, color: bookingStep > n ? C.purple : C.muted, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>

          {bookingStep === 1 && (
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>📅 Escolha a data e horário</div>
              <input style={{ ...input, marginBottom: 12 }} type="date" value={booking.date} onChange={e => setBooking({ ...booking, date: e.target.value })} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                {["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"].map(t => (
                  <button key={t} onClick={() => setBooking({ ...booking, time: t })} style={{ padding: "12px 0", borderRadius: 12, border: `2px solid ${booking.time === t ? C.purple : C.grayMid}`, background: booking.time === t ? `${C.purple}18` : C.white, color: booking.time === t ? C.purple : C.text, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>{t}</button>
                ))}
              </div>
              <button style={btn()} onClick={() => { if (booking.date && booking.time) setBookingStep(2); }}>Próximo →</button>
            </div>
          )}

          {bookingStep === 2 && (
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>📍 Endereço do serviço</div>
              <textarea style={{ ...input, minHeight: 100, resize: "vertical", marginBottom: 20 }} placeholder="Rua, número, bairro, cidade" value={booking.address} onChange={e => setBooking({ ...booking, address: e.target.value })} />
              <button style={btn()} onClick={() => { if (booking.address) setBookingStep(3); }}>Próximo →</button>
            </div>
          )}

          {bookingStep === 3 && (
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>💳 Forma de pagamento</div>
              {[["pix", "💠", "Pix", "Aprovação imediata"], ["cartao", "💳", "Cartão de crédito", "Até 12x"], ["boleto", "📄", "Boleto", "Vence em 3 dias"]].map(([id, icon, label, sub]) => (
                <div key={id} onClick={() => setBooking({ ...booking, payment: id })} style={{ ...card, cursor: "pointer", border: `2px solid ${booking.payment === id ? C.purple : C.grayMid}`, background: booking.payment === id ? `${C.purple}08` : C.white, display: "flex", alignItems: "center", gap: 14, padding: 14, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{label}</div>
                    <div style={{ color: C.muted, fontSize: 12 }}>{sub}</div>
                  </div>
                  {booking.payment === id && <span style={{ color: C.purple, fontWeight: 700 }}>✓</span>}
                </div>
              ))}
              <div style={{ background: `${C.purple}11`, borderRadius: 12, padding: 14, marginBottom: 16, marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.muted }}>Serviço</span>
                  <span style={{ fontWeight: 700 }}>R${selected?.price_min},00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ color: C.muted }}>Taxa da plataforma (10%)</span>
                  <span style={{ color: C.muted }}>R${Math.round(selected?.price_min * 0.1)},00</span>
                </div>
                <div style={{ height: 1, background: C.grayMid, margin: "10px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontWeight: 800, color: C.purple, fontSize: 18 }}>R${selected?.price_min},00</span>
                </div>
              </div>
              <button style={btn(C.purple)} onClick={confirmBooking}>🔒 Confirmar pagamento</button>
              <div style={{ textAlign: "center", color: C.muted, fontSize: 12, marginTop: 8 }}>🛡️ Pagamento 100% seguro</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // CHAT
  if (screen === "chat") {
    return (
      <div style={{ ...base, display: "flex", flexDirection: "column", height: "100vh", paddingBottom: 0 }}>
        <div style={{ background: `linear-gradient(135deg, ${C.purple} 0%, ${C.purpleDark} 100%)`, padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setScreen("home")} style={{ background: "#ffffff22", border: "none", color: C.white, borderRadius: 20, padding: "8px 14px", cursor: "pointer", fontSize: 14 }}>←</button>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#ffffff22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
          <div>
            <div style={{ color: C.white, fontWeight: 700 }}>Seu profissional</div>
            <div style={{ color: C.green, fontSize: 12 }}>● Online agora</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16, background: C.gray }}>
          {chatMessages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start", marginBottom: 10 }}>
              <div style={{ background: m.from === "me" ? C.purple : C.white, color: m.from === "me" ? C.white : C.text, borderRadius: m.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "12px 16px", maxWidth: "75%", boxShadow: "0 2px 8px #00000010" }}>
                <div style={{ fontSize: 14 }}>{m.text}</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6, textAlign: "right" }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 16, background: C.white, display: "flex", gap: 10, borderTop: `1px solid ${C.grayMid}` }}>
          <input style={{ ...input, flex: 1 }} placeholder="Digite uma mensagem..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} />
          <button style={{ background: C.purple, border: "none", color: C.white, borderRadius: 12, width: 48, height: 48, fontSize: 20, cursor: "pointer" }} onClick={sendChat}>➤</button>
        </div>
      </div>
    );
  }

  // ORDERS
  if (screen === "orders") {
    return (
      <div style={base}>
        <div style={{ background: `linear-gradient(135deg, ${C.purple} 0%, ${C.purpleDark} 100%)`, padding: "20px 20px 28px" }}>
          <div style={{ color: C.white, fontSize: 22, fontWeight: 800 }}>Meus Pedidos</div>
        </div>
        <div style={{ padding: "16px 16px" }}>
          {orders.length === 0 ? (
            <div style={{ ...card, textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Nenhum pedido ainda</div>
              <div style={{ color: C.muted, marginBottom: 20 }}>Agende seu primeiro serviço!</div>
              <button style={btn()} onClick={() => setScreen("home")}>Ver serviços</button>
            </div>
          ) : orders.map((o, i) => (
            <div key={i} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{o.service_name}</div>
                <span style={tag(C.yellow)}>Pendente</span>
              </div>
              <div style={{ color: C.muted, fontSize: 13, marginBottom: 4 }}>📅 {o.date} às {o.time}</div>
              <div style={{ color: C.muted, fontSize: 13, marginBottom: 10 }}>📍 {o.address}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, color: C.purple, fontSize: 18 }}>R${o.total},00</span>
                <button onClick={() => setScreen("chat")} style={{ background: `${C.purple}18`, color: C.purple, border: "none", borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Entrar em contato</button>
              </div>
            </div>
          ))}
        </div>
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.grayMid}`, display: "flex", justifyContent: "space-around", padding: "10px 0 14px", zIndex: 100 }}>
          {[{ id: "home", icon: "🏠", label: "Início" }, { id: "orders", icon: "📋", label: "Pedidos" }, { id: "chat", icon: "💬", label: "Chat" }, { id: "profile", icon: "👤", label: "Perfil" }].map(n => (
            <button key={n.id} style={{ background: "none", border: "none", color: screen === n.id ? C.purple : C.muted, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }} onClick={() => setScreen(n.id)}>
              <span style={{ fontSize: 22 }}>{n.icon}</span>
              <span style={{ fontSize: 11, fontWeight: screen === n.id ? 700 : 400 }}>{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  }

  // PROFILE
  return (
    <div style={base}>
      <div style={{ background: `linear-gradient(135deg, ${C.purple} 0%, ${C.purpleDark} 100%)`, padding: "28px 20px 48px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ffffff22", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>👤</div>
        <div style={{ color: C.white, fontWeight: 800, fontSize: 20 }}>{user?.name}</div>
        <div style={{ color: "#ffffff88", fontSize: 13 }}>{user?.email}</div>
      </div>
      <div style={{ padding: 16, marginTop: -20 }}>
        <div style={card}>
          {["Meus endereços", "Notificações", "Segurança", "Ajuda"].map(item => (
            <div key={item} style={{ padding: "14px 4px", borderBottom: `1px solid ${C.grayMid}`, display: "flex", justifyContent: "space-between", cursor: "pointer" }}>
              <span style={{ fontWeight: 600 }}>{item}</span>
              <span style={{ color: C.muted }}>›</span>
            </div>
          ))}
        </div>
        <button style={{ ...btn(`${C.red}18`, C.red), boxShadow: "none" }} onClick={doLogout}>Sair da conta</button>
      </div>
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.grayMid}`, display: "flex", justifyContent: "space-around", padding: "10px 0 14px", zIndex: 100 }}>
        {[{ id: "home", icon: "🏠", label: "Início" }, { id: "orders", icon: "📋", label: "Pedidos" }, { id: "chat", icon: "💬", label: "Chat" }, { id: "profile", icon: "👤", label: "Perfil" }].map(n => (
          <button key={n.id} style={{ background: "none", border: "none", color: screen === n.id ? C.purple : C.muted, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }} onClick={() => setScreen(n.id)}>
            <span style={{ fontSize: 22 }}>{n.icon}</span>
            <span style={{ fontSize: 11, fontWeight: screen === n.id ? 700 : 400 }}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
