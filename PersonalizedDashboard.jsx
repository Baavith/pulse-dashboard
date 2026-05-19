// PersonalizedDashboard.jsx
// Self-contained React demo — drop into any React 18+ / Next.js project.
// Full feature set: AI feed, drag-drop, debounced search, favorites,
// dark/light mode, i18n (EN/HI/ES), skeleton loading, Redux pattern.

import { useState, useEffect, useCallback, useMemo, useReducer } from "react";
import {
  Home, TrendingUp, Heart, Settings, Search, Moon, Sun, X, RefreshCw,
  ExternalLink, Play, Flame, Menu, Check, GripVertical, List,
  LayoutGrid, Loader, Globe, ChevronRight,
} from "lucide-react";

/* ── Constants ───────────────────────────────────────────────────── */
const CATEGORIES = ["Technology","Sports","Finance","Entertainment","Science","Health","Politics","Travel"];
const CAT_EMOJI  = { Technology:"💻",Sports:"⚽",Finance:"📈",Entertainment:"🎬",Science:"🔬",Health:"💊",Politics:"🏛️",Travel:"✈️" };
const CAT_COLOR  = { Technology:"#3B82F6",Sports:"#EF4444",Finance:"#10B981",Entertainment:"#F59E0B",Science:"#8B5CF6",Health:"#EC4899",Politics:"#6366F1",Travel:"#14B8A6" };
const TYPE_CTA   = { news:"Read More",movie:"Watch Now",social:"View Post",recommendation:"Explore" };
const TYPE_ICON  = { news:ExternalLink,movie:Play,social:Globe,recommendation:ChevronRight };

/* ── i18n ────────────────────────────────────────────────────────── */
const I18N = {
  en:{ feed:"Your Feed",trending:"Trending Now",favorites:"Favorites",settings:"Settings",search:"Search articles, movies, posts…",refresh:"AI Refresh",refreshing:"Refreshing…",noResults:"No results found",noContent:"No content for selected filters",addFav:"Added to favorites! ❤️",removeFav:"Removed from favorites",contentRefreshed:"✨ Feed refreshed with AI!",categories:"Categories",appearance:"Appearance",darkMode:"Dark Mode",language:"Language",dragHint:"Drag to reorder",hot:"Hot",collapse:"Collapse",myCategories:"My Categories",stories:"stories",curated:"curated for you",about:"About" },
  hi:{ feed:"आपकी फ़ीड",trending:"ट्रेंडिंग",favorites:"पसंदीदा",settings:"सेटिंग्स",search:"खोजें…",refresh:"AI रिफ्रेश",refreshing:"लोड हो रहा है…",noResults:"कोई परिणाम नहीं",noContent:"कोई सामग्री नहीं",addFav:"पसंदीदा में जोड़ा! ❤️",removeFav:"हटाया गया",contentRefreshed:"✨ फ़ीड अपडेट!",categories:"श्रेणियाँ",appearance:"रूप",darkMode:"डार्क मोड",language:"भाषा",dragHint:"खींचें",hot:"Hot",collapse:"बंद करें",myCategories:"मेरी श्रेणियाँ",stories:"कहानियाँ",curated:"आपके लिए",about:"के बारे में" },
  es:{ feed:"Tu Feed",trending:"Tendencias",favorites:"Favoritos",settings:"Ajustes",search:"Buscar…",refresh:"Refrescar IA",refreshing:"Cargando…",noResults:"Sin resultados",noContent:"Sin contenido",addFav:"¡Guardado! ❤️",removeFav:"Eliminado",contentRefreshed:"✨ Feed actualizado",categories:"Categorías",appearance:"Apariencia",darkMode:"Modo oscuro",language:"Idioma",dragHint:"Arrastra para ordenar",hot:"Tendencia",collapse:"Colapsar",myCategories:"Mis Categorías",stories:"historias",curated:"para ti",about:"Acerca de" },
};
const useT = (lang) => useCallback((k) => I18N[lang]?.[k] ?? I18N.en[k] ?? k, [lang]);

/* ── Themes ──────────────────────────────────────────────────────── */
const TH = {
  dark: { bg:"#0B0F1A",surface:"#141824",surfaceHover:"#1C2234",border:"#232B3E",text:"#E8EDF8",muted:"#6B7A99",accent:"#4D9EFF",accentBg:"rgba(77,158,255,0.1)",accentBorder:"rgba(77,158,255,0.3)",skeleton:"#1A2034",scrollbar:"#2D3748",danger:"#FF6B6B",success:"#4ECDC4",headerBg:"rgba(11,15,26,0.88)" },
  light:{ bg:"#F4EFE6",surface:"#FFFFFF",surfaceHover:"#FAF6F0",border:"#E4DDD4",text:"#1C1917",muted:"#78716C",accent:"#C0392B",accentBg:"rgba(192,57,43,0.08)",accentBorder:"rgba(192,57,43,0.25)",skeleton:"#EDE8E0",scrollbar:"#D6CFC7",danger:"#DC2626",success:"#059669",headerBg:"rgba(244,239,230,0.92)" },
};

/* ── Seed content ────────────────────────────────────────────────── */
const SEED = [
  { id:"s1",  type:"news",           category:"Technology",    title:"OpenAI Unveils Reasoning Model with 97% Benchmark Score",            description:"The latest frontier model surpasses human-level performance on graduate science exams. Researchers confirm a 40% improvement in chain-of-thought reasoning over its predecessor.",                          author:"Tech Chronicle",       timeAgo:"1h ago",  imageId:1025,trending:true,  readTime:"4 min" },
  { id:"s2",  type:"movie",          category:"Entertainment", title:"Denis Villeneuve Confirms Dune: Part Three Production Begins",        description:"Filming kicks off in Jordan this autumn with the full returning cast and several major new additions. The director promises a runtime of under three hours.",                                                 author:"Variety",              timeAgo:"2h ago",  imageId:350, trending:false,readTime:"2 min" },
  { id:"s3",  type:"news",           category:"Science",       title:"Webb Telescope Detects Potential Biosignatures 124 Light-Years Away", description:"Astronomers report traces of methane and carbon dioxide in the atmosphere of exoplanet K2-18b. Initial findings have reignited scientific debate about extraterrestrial life.",                           author:"NASA/JPL",             timeAgo:"3h ago",  imageId:1074,trending:true,  readTime:"5 min" },
  { id:"s4",  type:"social",         category:"Technology",    title:"GitHub Celebrates One Million Open Source Contributors Worldwide",     description:"The platform marks a historic milestone as developers from 190 countries unite around collaborative software. Special commemorative profile badges are being awarded automatically.",                        author:"@github",              timeAgo:"30m ago", imageId:101, trending:true,  readTime:"1 min" },
  { id:"s5",  type:"news",           category:"Finance",       title:"Federal Reserve Signals Three Rate Cuts Planned for Late 2026",       description:"Fed Chair signals easing monetary policy as core inflation cools to 2.1%, well within target. Markets responded with the S&P 500 gaining 1.8% on the news.",                                          author:"Bloomberg",            timeAgo:"4h ago",  imageId:241, trending:false,readTime:"3 min" },
  { id:"s6",  type:"recommendation", category:"Entertainment", title:"The Last Frontier — Critics Call It the Year's Best Drama Series",    description:"This eight-part limited series has swept awards season conversations with its unflinching portrayal of life in remote Alaska. The ensemble cast delivers career-defining performances.",                    author:"Netflix",              timeAgo:"6h ago",  imageId:325, trending:true,  readTime:"2 min" },
  { id:"s7",  type:"news",           category:"Health",        title:"CRISPR Gene Therapy Achieves 94% Success Rate in Sickle Cell Trials", description:"A landmark Phase 3 trial shows near-complete remission in patients receiving the novel gene-editing treatment. The FDA has fast-tracked the approval process with a decision expected by August.",  author:"STAT News",            timeAgo:"5h ago",  imageId:534, trending:true,  readTime:"4 min" },
  { id:"s8",  type:"social",         category:"Science",       title:"MIT Team Publishes Room-Temperature Superconductor Breakthrough",      description:"The peer-reviewed paper details a new bismuth-copper compound exhibiting zero electrical resistance at 22°C under standard pressure. Three independent labs have confirmed the results.",               author:"@MIT",                 timeAgo:"8h ago",  imageId:785, trending:false,readTime:"3 min" },
  { id:"s9",  type:"news",           category:"Sports",        title:"World Marathon Record Falls by 47 Seconds at Barcelona",              description:"Eliud Kipchoge's protégé crosses the finish line in an astonishing 1:56:12, rewriting the history books. The runner credits an altitude training camp in the Andes for the breakthrough.",             author:"Sports Illustrated",   timeAgo:"7h ago",  imageId:163, trending:false,readTime:"2 min" },
  { id:"s10", type:"news",           category:"Travel",        title:"Japan Extends Golden Visa Program to Remote Workers Worldwide",        description:"The new five-year residency permits require just 28 days in-country per year. Japan has emerged as one of the most accessible destinations for digital nomads globally.",                             author:"Condé Nast Traveller", timeAgo:"9h ago",  imageId:603, trending:false,readTime:"3 min" },
  { id:"s11", type:"news",           category:"Politics",      title:"UN Climate Summit Reaches Historic Carbon Pricing Agreement",          description:"A binding framework setting a global floor price of $85 per ton of CO₂ was signed by 147 countries in Geneva. Implementation begins January 2027.",                                                      author:"Reuters",              timeAgo:"10h ago", imageId:437, trending:true,  readTime:"5 min" },
  { id:"s12", type:"recommendation", category:"Technology",    title:"The Best Productivity Apps Reshaping How Teams Work in 2026",         description:"From AI-native project managers to async video tools, these twelve applications are fundamentally changing distributed collaboration. Most offer generous free tiers to get started.",              author:"Wired",                timeAgo:"12h ago", imageId:870, trending:false,readTime:"6 min" },
];

/* ── Reducer (Redux pattern) ─────────────────────────────────────── */
const INIT = { content:SEED, favorites:[], prefs:{ categories:["Technology","Entertainment","Science"] }, darkMode:true, lang:"en" };

function reducer(state, { type, payload }) {
  switch(type) {
    case "SET_CONTENT":  return { ...state, content: payload };
    case "REORDER":      return { ...state, content: payload };
    case "TOGGLE_FAV": {
      const has = state.favorites.some(f => f.id === payload.id);
      return { ...state, favorites: has ? state.favorites.filter(f => f.id !== payload.id) : [...state.favorites, payload] };
    }
    case "SET_PREFS":    return { ...state, prefs: { ...state.prefs, ...payload } };
    case "SET_DARK":     return { ...state, darkMode: payload };
    case "SET_LANG":     return { ...state, lang: payload };
    default:             return state;
  }
}

/* ── useDebounce ─────────────────────────────────────────────────── */
function useDebounce(val, ms) {
  const [d, setD] = useState(val);
  useEffect(() => { const t = setTimeout(() => setD(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return d;
}

/* ════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [state, dispatch] = useReducer(reducer, INIT, s => {
    try {
      return { ...s,
        favorites: JSON.parse(localStorage.getItem("pd_favs")  || "[]"),
        prefs:     JSON.parse(localStorage.getItem("pd_prefs") || JSON.stringify(s.prefs)),
        darkMode:  JSON.parse(localStorage.getItem("pd_dark")  ?? "true"),
        lang:      localStorage.getItem("pd_lang") || "en",
      };
    } catch { return s; }
  });

  const { content, favorites, prefs, darkMode, lang } = state;
  const th = darkMode ? TH.dark : TH.light;
  const t  = useT(lang);

  const [view,           setView]           = useState("feed");
  const [loading,        setLoading]        = useState(false);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [activeCat,      setActiveCat]      = useState("All");
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [draggedId,      setDraggedId]      = useState(null);
  const [dragOverId,     setDragOverId]     = useState(null);
  const [gridView,       setGridView]       = useState(true);
  const [toast,          setToast]          = useState(null);
  const [loadCount,      setLoadCount]      = useState(0);

  const debSearch = useDebounce(searchQuery, 300);

  // Persist to localStorage
  useEffect(() => { try { localStorage.setItem("pd_favs",  JSON.stringify(favorites)); } catch {} }, [favorites]);
  useEffect(() => { try { localStorage.setItem("pd_prefs", JSON.stringify(prefs));     } catch {} }, [prefs]);
  useEffect(() => { try { localStorage.setItem("pd_dark",  JSON.stringify(darkMode));  } catch {} }, [darkMode]);
  useEffect(() => { try { localStorage.setItem("pd_lang",  lang);                      } catch {} }, [lang]);

  const showToast = useCallback((msg, type="info") => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* AI content fetch */
  const fetchContent = useCallback(async () => {
    setLoading(true); setLoadCount(n => n+1);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1200,
          messages:[{ role:"user", content:`Generate a JSON array of exactly 12 realistic content items for a personalized news dashboard (May 2026). Distribute across: ${prefs.categories.join(", ")}. Each item needs: id (unique), type ("news"|"movie"|"social"|"recommendation"), category, title (max 85 chars), description (2 sentences), author, timeAgo, imageId (integer 100-999), trending (boolean), readTime. Return ONLY a raw JSON array, no markdown.` }],
        }),
      });
      const data  = await res.json();
      const txt   = (data.content||[]).map(b=>b.text||"").join("").replace(/\`\`\`json|\`\`\`/g,"").trim();
      const items = JSON.parse(txt);
      if (Array.isArray(items) && items.length) { dispatch({ type:"SET_CONTENT", payload:items }); showToast(t("contentRefreshed"),"success"); }
      else throw new Error("empty");
    } catch { showToast("Using cached content — API failed","warn"); }
    finally { setLoading(false); }
  }, [prefs.categories, showToast, t]);

  /* Derived content */
  const displayContent = useMemo(() => {
    let items = content.filter(i => prefs.categories.includes(i.category));
    if (activeCat !== "All") items = items.filter(i => i.category === activeCat);
    if (debSearch) { const q = debSearch.toLowerCase(); items = items.filter(i => [i.title,i.description,i.category,i.author].some(s=>s?.toLowerCase().includes(q))); }
    return items;
  }, [content, prefs.categories, activeCat, debSearch]);

  const trendingContent = useMemo(() => content.filter(i => i.trending && prefs.categories.includes(i.category)), [content, prefs.categories]);

  const isFav    = id   => favorites.some(f => f.id === id);
  const toggleFav = item => { dispatch({type:"TOGGLE_FAV",payload:item}); showToast(isFav(item.id)?t("removeFav"):t("addFav"),isFav(item.id)?"info":"success"); };

  /* Drag & drop */
  const onDragStart = (e,id) => { setDraggedId(id); e.dataTransfer.effectAllowed="move"; };
  const onDragOver  = (e,id) => { e.preventDefault(); if(id!==draggedId) setDragOverId(id); };
  const onDrop      = (e,tid) => { e.preventDefault(); if(!draggedId||draggedId===tid) return; const a=[...content],f=a.findIndex(i=>i.id===draggedId),to=a.findIndex(i=>i.id===tid); const [m]=a.splice(f,1); a.splice(to,0,m); dispatch({type:"REORDER",payload:a}); setDraggedId(null); setDragOverId(null); };
  const onDragEnd   = () => { setDraggedId(null); setDragOverId(null); };

  const cp = item => ({ item,th,isFav:isFav(item.id),onFav:()=>toggleFav(item),isDragging:draggedId===item.id,isDragOver:dragOverId===item.id,onDragStart:e=>onDragStart(e,item.id),onDragOver:e=>onDragOver(e,item.id),onDrop:e=>onDrop(e,item.id),onDragEnd,gridView,t });

  const GS = { display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(285px,1fr))",gap:18 };
  const LS = { display:"flex",flexDirection:"column",gap:10 };

  /* CSS-in-JS */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:5px}
    ::-webkit-scrollbar-thumb{background:${th.scrollbar};border-radius:4px}
    button,input{font-family:'DM Sans',sans-serif}
    button{cursor:pointer;border:none;background:none}
    input{outline:none;border:none}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes shimmer{0%{background-position:-800px 0}100%{background-position:800px 0}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes slideToast{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes favBounce{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
    .fu{animation:fadeUp .38s ease both}
    .sk{background:linear-gradient(90deg,${th.surface} 0%,${th.surfaceHover} 50%,${th.surface} 100%);background-size:800px 100%;animation:shimmer 1.5s linear infinite}
    .sp{animation:spin 1s linear infinite}
    .cl{transition:transform .22s ease,box-shadow .22s ease}
    .cl:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.28)}
    .nb:hover{background:${th.surfaceHover}}
    .ib:hover{background:${th.surfaceHover}}
    .fb:hover svg{animation:favBounce .3s ease}
    .drag-over{outline:2px dashed ${th.accent};outline-offset:3px;transform:scale(1.01)}
    .dragging{opacity:.25;transform:rotate(.8deg)}
  `;

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif",background:th.bg,color:th.text,minHeight:"100vh" }}>
      <style>{css}</style>

      {/* Toast */}
      {toast && (
        <div key={toast.id} style={{ position:"fixed",top:20,right:20,zIndex:9999,background:toast.type==="success"?th.success:toast.type==="warn"?"#F59E0B":th.surface,color:toast.type==="success"||toast.type==="warn"?"#fff":th.text,padding:"11px 18px",borderRadius:12,fontSize:13,fontWeight:500,border:`1px solid ${th.border}`,boxShadow:"0 8px 32px rgba(0,0,0,.3)",animation:"slideToast .3s ease",display:"flex",alignItems:"center",gap:8,maxWidth:300 }}>
          {toast.type==="success"?"✓":toast.type==="warn"?"⚠":"ℹ"} {toast.msg}
        </div>
      )}

      <div style={{ display:"flex",height:"100vh",overflow:"hidden" }}>
        {/* ── SIDEBAR ── */}
        <aside style={{ width:sidebarOpen?218:58,transition:"width .3s cubic-bezier(.4,0,.2,1)",background:th.surface,borderRight:`1px solid ${th.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden" }}>
          <div style={{ padding:"16px 10px",borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:34,height:34,borderRadius:10,background:th.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <span style={{ color:"#fff",fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700 }}>P</span>
            </div>
            {sidebarOpen&&<span style={{ fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:th.text,whiteSpace:"nowrap",letterSpacing:"-.02em" }}>Pulse</span>}
          </div>

          <nav style={{ padding:"8px 6px",flex:1,overflowY:"auto" }}>
            {[{id:"feed",icon:Home,label:t("feed")},{id:"trending",icon:TrendingUp,label:t("trending")},{id:"favorites",icon:Heart,label:`${t("favorites")}${favorites.length?` (${favorites.length})`:""}`},{id:"settings",icon:Settings,label:t("settings")}].map(({id,icon:Icon,label})=>(
              <button key={id} data-testid={`nav-${id}`} className="nb" onClick={()=>setView(id)} style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 10px",borderRadius:9,marginBottom:2,background:view===id?th.accentBg:"transparent",color:view===id?th.accent:th.muted,fontWeight:view===id?600:400,fontSize:13,transition:"all .15s ease" }}>
                <Icon size={18} style={{ flexShrink:0 }}/>
                {sidebarOpen&&<span style={{ whiteSpace:"nowrap" }}>{label}</span>}
              </button>
            ))}

            {sidebarOpen&&(
              <div style={{ marginTop:20,paddingTop:14,borderTop:`1px solid ${th.border}` }}>
                <p style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".1em",color:th.muted,padding:"0 10px",marginBottom:8 }}>{t("myCategories")}</p>
                {prefs.categories.map(cat=>(
                  <button key={cat} className="nb" onClick={()=>{setView("feed");setActiveCat(cat);}} style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:"6px 10px",borderRadius:8,marginBottom:2,color:activeCat===cat&&view==="feed"?th.accent:th.muted,fontSize:12,transition:"all .15s" }}>
                    <span style={{ fontSize:14 }}>{CAT_EMOJI[cat]}</span><span>{cat}</span>
                  </button>
                ))}
              </div>
            )}
          </nav>

          <button className="nb" onClick={()=>setSidebarOpen(!sidebarOpen)} style={{ margin:"8px 6px",padding:"9px 10px",borderRadius:9,color:th.muted,display:"flex",alignItems:"center",gap:10,transition:"all .15s" }}>
            <Menu size={18}/>{sidebarOpen&&<span style={{ fontSize:13,whiteSpace:"nowrap" }}>{t("collapse")}</span>}
          </button>
        </aside>

        {/* ── MAIN ── */}
        <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
          {/* Header */}
          <header style={{ background:th.headerBg,backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",borderBottom:`1px solid ${th.border}`,padding:"10px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
            <div style={{ flex:1,maxWidth:440,display:"flex",alignItems:"center",gap:8,background:th.surface,borderRadius:10,padding:"8px 14px",border:`1px solid ${th.border}` }}>
              <Search size={15} color={th.muted}/>
              <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder={t("search")} aria-label="Search content" style={{ flex:1,background:"none",color:th.text,fontSize:13 }}/>
              {searchQuery&&<button onClick={()=>setSearchQuery("")} aria-label="Clear search" style={{ color:th.muted,display:"flex" }}><X size={13}/></button>}
            </div>

            <div style={{ display:"flex",alignItems:"center",gap:8,marginLeft:"auto" }}>
              <button className="ib" onClick={()=>setGridView(!gridView)} aria-label="Toggle layout" style={{ padding:8,borderRadius:9,border:`1px solid ${th.border}`,background:th.surface,color:th.muted,display:"flex",transition:"all .15s" }}>
                {gridView?<List size={16}/>:<LayoutGrid size={16}/>}
              </button>
              <button onClick={fetchContent} disabled={loading} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:9,background:th.accentBg,color:th.accent,border:`1px solid ${th.accentBorder}`,fontSize:12,fontWeight:600,transition:"all .15s",opacity:loading?.7:1 }}>
                {loading?<><Loader size={13} className="sp"/>{t("refreshing")}</>:<><RefreshCw size={13}/>{t("refresh")}</>}
              </button>
              <button className="ib" onClick={()=>dispatch({type:"SET_DARK",payload:!darkMode})} aria-label={darkMode?"Switch to light mode":"Switch to dark mode"} style={{ padding:8,borderRadius:9,border:`1px solid ${th.border}`,background:th.surface,color:th.text,display:"flex",transition:"all .15s" }}>
                {darkMode?<Sun size={16}/>:<Moon size={16}/>}
              </button>
              <div style={{ width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${th.accent},${darkMode?"#8B5CF6":"#7C3AED"})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0 }}>U</div>
            </div>
          </header>

          {/* Page content */}
          <main style={{ flex:1,overflowY:"auto",padding:"20px" }}>

            {/* FEED */}
            {view==="feed"&&(
              <div className="fu">
                <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:16 }}>
                  <div>
                    <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:25,fontWeight:700,color:th.text,letterSpacing:"-.03em" }}>{debSearch?`Results for "${debSearch}"`:t("feed")}</h1>
                    <p style={{ fontSize:13,color:th.muted,marginTop:3 }}>{loading?t("refreshing"):`${displayContent.length} ${t("stories")} · ${t("curated")}`}</p>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:5,color:th.muted,fontSize:11 }}><GripVertical size={12}/><span>{t("dragHint")}</span></div>
                </div>

                <div style={{ display:"flex",gap:6,marginBottom:18,flexWrap:"wrap" }}>
                  {["All",...prefs.categories].map(cat=>(
                    <button key={cat} onClick={()=>setActiveCat(cat)} style={{ padding:"5px 13px",borderRadius:20,fontSize:12,fontWeight:500,background:activeCat===cat?th.accent:th.surface,color:activeCat===cat?"#fff":th.muted,border:`1px solid ${activeCat===cat?th.accent:th.border}`,transition:"all .15s ease" }}>
                      {cat!=="All"&&CAT_EMOJI[cat]+" "}{cat}
                    </button>
                  ))}
                </div>

                {loading?(
                  <div style={gridView?GS:LS}>{[...Array(6)].map((_,i)=><SkeletonCard key={i} th={th} gridView={gridView}/>)}</div>
                ):displayContent.length===0?(
                  <EmptyState message={debSearch?t("noResults"):t("noContent")} th={th}/>
                ):(
                  <div style={gridView?GS:LS}>
                    {displayContent.map((item,idx)=><ContentCard key={item.id} {...cp(item)} delay={idx*.04}/>)}
                  </div>
                )}
              </div>
            )}

            {/* TRENDING */}
            {view==="trending"&&(
              <div className="fu">
                <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:25,fontWeight:700,color:th.text,marginBottom:4,letterSpacing:"-.03em" }}>🔥 {t("trending")}</h1>
                <p style={{ fontSize:13,color:th.muted,marginBottom:20 }}>Hot stories across your categories</p>
                {trendingContent.length>0?(
                  <div style={GS}>{trendingContent.map((item,idx)=><ContentCard key={item.id} {...cp(item)} delay={idx*.06} showTrending/>)}</div>
                ):<EmptyState message="No trending content" th={th}/>}

                <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:th.text,margin:"30px 0 14px",letterSpacing:"-.02em" }}>All Stories Ranked</h2>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {content.filter(i=>prefs.categories.includes(i.category)).map((item,i)=>(
                    <RankRow key={item.id} item={item} rank={i+1} th={th} isFav={isFav(item.id)} onFav={()=>toggleFav(item)}/>
                  ))}
                </div>
              </div>
            )}

            {/* FAVORITES */}
            {view==="favorites"&&(
              <div className="fu">
                <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:25,fontWeight:700,color:th.text,marginBottom:4,letterSpacing:"-.03em" }}>❤️ {t("favorites")}</h1>
                <p style={{ fontSize:13,color:th.muted,marginBottom:20 }}>{favorites.length} saved {favorites.length===1?"item":"items"}</p>
                {favorites.length===0?(
                  <EmptyState message="No favorites yet" sub="Tap ❤ on any card to save it here" th={th}/>
                ):(
                  <div style={gridView?GS:LS}>{favorites.map((item,idx)=><ContentCard key={item.id} {...cp(item)} delay={idx*.05}/>)}</div>
                )}
              </div>
            )}

            {/* SETTINGS */}
            {view==="settings"&&(
              <div className="fu" style={{ maxWidth:570 }}>
                <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:25,fontWeight:700,color:th.text,marginBottom:4,letterSpacing:"-.03em" }}>⚙️ {t("settings")}</h1>
                <p style={{ fontSize:13,color:th.muted,marginBottom:26 }}>Customize your dashboard experience</p>

                {/* Categories */}
                <SS title={t("categories")} sub="Select categories for your personalized feed">
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                    {CATEGORIES.map(cat=>{
                      const sel=prefs.categories.includes(cat);
                      return(
                        <button key={cat} data-testid={`category-btn-${cat}`} aria-pressed={sel} onClick={()=>{
                          if(sel&&prefs.categories.length<=1) return;
                          dispatch({type:"SET_PREFS",payload:{categories:sel?prefs.categories.filter(c=>c!==cat):[...prefs.categories,cat]}});
                        }} style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:10,textAlign:"left",background:sel?th.accentBg:th.surface,border:`1.5px solid ${sel?th.accent:th.border}`,color:th.text,transition:"all .18s ease",cursor:"pointer" }}>
                          <span style={{ fontSize:18 }}>{CAT_EMOJI[cat]}</span>
                          <span style={{ flex:1,fontWeight:500,fontSize:13 }}>{cat}</span>
                          <div style={{ width:18,height:18,borderRadius:5,flexShrink:0,background:sel?th.accent:"transparent",border:`1.5px solid ${sel?th.accent:th.border}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .18s" }}>
                            {sel&&<Check size={11} color="#fff"/>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ fontSize:11,color:th.muted,marginTop:10 }}>{prefs.categories.length} of {CATEGORIES.length} selected · minimum 1 required</p>
                </SS>

                {/* Appearance */}
                <SS title={t("appearance")}>
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    <SR label={t("darkMode")} sub="Toggle between light and dark theme" th={th}><Tog on={darkMode} onToggle={()=>dispatch({type:"SET_DARK",payload:!darkMode})} accent={th.accent}/></SR>
                    <SR label="Grid Layout" sub="Switch between grid and list view" th={th}><Tog on={gridView} onToggle={()=>setGridView(!gridView)} accent={th.accent}/></SR>
                  </div>
                </SS>

                {/* Language */}
                <SS title={t("language")} sub="Switch the dashboard display language">
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    {[["en","English 🇬🇧"],["hi","हिंदी 🇮🇳"],["es","Español 🇪🇸"]].map(([code,label])=>(
                      <button key={code} onClick={()=>dispatch({type:"SET_LANG",payload:code})} style={{ padding:"8px 18px",borderRadius:9,fontSize:13,fontWeight:500,background:lang===code?th.accentBg:th.surface,color:lang===code?th.accent:th.muted,border:`1.5px solid ${lang===code?th.accent:th.border}`,transition:"all .15s" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </SS>

                {/* Content */}
                <SS title="Content & Data" sub="Manage your AI-powered feed">
                  <button onClick={fetchContent} disabled={loading} style={{ display:"flex",alignItems:"center",gap:8,padding:"11px 20px",borderRadius:10,fontSize:13,fontWeight:600,background:th.accent,color:"#fff",opacity:loading?.7:1,transition:"all .15s" }}>
                    {loading?<Loader size={15} className="sp"/>:<RefreshCw size={15}/>}
                    {loading?t("refreshing"):"Refresh Feed with AI"}
                  </button>
                  <p style={{ fontSize:11,color:th.muted,marginTop:8 }}>Fetches fresh content via Claude · {loadCount} refresh{loadCount!==1?"es":""} this session</p>
                </SS>

                {/* About */}
                <SS title={t("about")}>
                  <div style={{ padding:"14px 16px",borderRadius:10,background:th.surface,border:`1px solid ${th.border}` }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
                      <div style={{ width:28,height:28,borderRadius:8,background:th.accent,display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <span style={{ color:"#fff",fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:14 }}>P</span>
                      </div>
                      <div>
                        <p style={{ fontSize:13,fontWeight:600,color:th.text }}>Pulse Dashboard v1.0</p>
                        <p style={{ fontSize:11,color:th.muted }}>SDE Intern Frontend Assignment</p>
                      </div>
                    </div>
                    <p style={{ fontSize:11,color:th.muted,lineHeight:1.7,borderTop:`1px solid ${th.border}`,paddingTop:10 }}>
                      React 18 · useReducer (Redux pattern) · Anthropic API · HTML5 Drag &amp; Drop ·
                      300ms Debounced Search · localStorage Persistence · Dark/Light Mode ·
                      i18n EN/HI/ES · Skeleton Loading · Empty States · Responsive Layout
                    </p>
                  </div>
                </SS>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ── Setting Section / Row helpers ──────────────────────────────── */
function SS({ title, sub, children }) {
  return (
    <section style={{ marginBottom:28 }}>
      <h2 style={{ fontSize:15,fontWeight:600,marginBottom:sub?4:14 }}>{title}</h2>
      {sub&&<p style={{ fontSize:12,opacity:.6,marginBottom:14 }}>{sub}</p>}
      {children}
    </section>
  );
}
function SR({ label, sub, th, children }) {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 15px",borderRadius:10,background:th.surface,border:`1px solid ${th.border}` }}>
      <div><p style={{ fontSize:13,fontWeight:500,color:th.text }}>{label}</p>{sub&&<p style={{ fontSize:11,color:th.muted,marginTop:2 }}>{sub}</p>}</div>
      {children}
    </div>
  );
}
function Tog({ on, onToggle, accent }) {
  return (
    <button onClick={onToggle} aria-label={on?"Turn off":"Turn on"} style={{ width:46,height:25,borderRadius:13,position:"relative",background:on?accent:"#9CA3AF",transition:"background .3s ease",flexShrink:0 }}>
      <span style={{ position:"absolute",top:3,width:19,height:19,borderRadius:"50%",background:"#fff",transition:"left .3s ease",left:on?24:3,boxShadow:"0 1px 4px rgba(0,0,0,.25)" }}/>
    </button>
  );
}

/* ── Content Card ────────────────────────────────────────────────── */
function ContentCard({ item, th, isFav, onFav, isDragging, isDragOver, onDragStart, onDragOver, onDrop, onDragEnd, delay=0, gridView=true, showTrending=false, t }) {
  const Icon  = TYPE_ICON[item.type] || ExternalLink;
  const cta   = TYPE_CTA[item.type]  || "Read More";
  const color = CAT_COLOR[item.category] || th.accent;

  if (!gridView) return (
    <div data-testid="content-card" className={`fu cl ${isDragging?"dragging":""} ${isDragOver?"drag-over":""}`} draggable onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd} style={{ display:"flex",gap:14,padding:14,borderRadius:12,background:th.surface,border:`1px solid ${th.border}`,cursor:"grab",animationDelay:`${delay}s`,transition:"all .2s ease" }}>
      <img src={`https://picsum.photos/seed/${item.imageId}/110/74`} alt="" style={{ width:104,height:70,borderRadius:8,objectFit:"cover",flexShrink:0 }} onError={e=>e.target.src=`https://picsum.photos/110/74?random=${item.id}`}/>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
          <span data-testid="category-badge" style={{ fontSize:11,fontWeight:600,color }}>{CAT_EMOJI[item.category]} {item.category}</span>
          {item.trending&&<span style={{ fontSize:10,fontWeight:600,color:th.danger,display:"flex",alignItems:"center",gap:2 }}><Flame size={9}/>{t?.("hot")||"Hot"}</span>}
        </div>
        <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:700,color:th.text,lineHeight:1.4,marginBottom:3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{item.title}</h3>
        <p style={{ fontSize:11,color:th.muted }}>{item.author} · {item.timeAgo} · {item.readTime}</p>
      </div>
      <button className="fb" onClick={e=>{e.stopPropagation();onFav();}} aria-label={isFav?"Remove from favorites":"Add to favorites"} style={{ color:isFav?th.danger:th.muted,padding:8,flexShrink:0,display:"flex",transition:"color .2s" }}>
        <Heart size={16} fill={isFav?th.danger:"none"}/>
      </button>
    </div>
  );

  return (
    <div data-testid="content-card" className={`fu cl ${isDragging?"dragging":""} ${isDragOver?"drag-over":""}`} draggable onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd} style={{ borderRadius:14,overflow:"hidden",background:th.surface,border:`1px solid ${th.border}`,cursor:"grab",animationDelay:`${delay}s`,display:"flex",flexDirection:"column",transition:"all .2s ease" }}>
      <div style={{ position:"relative",paddingTop:"54%",overflow:"hidden" }}>
        <img src={`https://picsum.photos/seed/${item.imageId}/400/216`} alt={item.title} style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover" }} onError={e=>e.target.src=`https://picsum.photos/400/216?random=${item.id}`}/>
        <div style={{ position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 30%,rgba(0,0,0,.5) 100%)" }}/>
        <span data-testid="category-badge" style={{ position:"absolute",top:10,left:10,padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:700,background:color+"CC",color:"#fff",letterSpacing:".04em" }}>{CAT_EMOJI[item.category]} {item.category}</span>
        {(showTrending||item.trending)&&<span style={{ position:"absolute",top:10,right:10,padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:700,background:th.danger+"BB",color:"#fff",display:"flex",alignItems:"center",gap:3 }}><Flame size={9}/>{t?.("hot")||"Hot"}</span>}
        {item.type==="movie"&&<div style={{ position:"absolute",bottom:10,right:10,width:32,height:32,borderRadius:"50%",background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center" }}><Play size={14} color="#fff" fill="#fff"/></div>}
      </div>
      <div style={{ padding:"14px",flex:1,display:"flex",flexDirection:"column" }}>
        <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:th.text,lineHeight:1.45,marginBottom:7,flex:1,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{item.title}</h3>
        <p style={{ fontSize:12,color:th.muted,lineHeight:1.6,marginBottom:11,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{item.description}</p>
        <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:12 }}>
          <span style={{ fontSize:11,color:th.muted,fontWeight:500,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis" }}>{item.author}</span>
          <span style={{ color:th.border,flexShrink:0 }}>·</span>
          <span style={{ fontSize:11,color:th.muted,flexShrink:0 }}>{item.timeAgo}</span>
          <span style={{ color:th.border,flexShrink:0 }}>·</span>
          <span style={{ fontSize:11,color:th.muted,flexShrink:0 }}>{item.readTime}</span>
        </div>
        <div style={{ display:"flex",gap:7 }}>
          <button style={{ flex:1,padding:"8px 12px",borderRadius:9,fontSize:12,fontWeight:600,background:th.accentBg,color:th.accent,border:`1px solid ${th.accentBorder}`,display:"flex",alignItems:"center",justifyContent:"center",gap:5,transition:"all .15s" }}>
            <Icon size={13}/>{cta}
          </button>
          <button className="fb" onClick={e=>{e.stopPropagation();onFav();}} aria-label={isFav?"Remove from favorites":"Add to favorites"} style={{ padding:"8px 10px",borderRadius:9,background:isFav?"rgba(239,68,68,.1)":"transparent",border:`1px solid ${isFav?th.danger+"40":th.border}`,color:isFav?th.danger:th.muted,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s ease" }}>
            <Heart size={14} fill={isFav?th.danger:"none"}/>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Rank Row ────────────────────────────────────────────────────── */
function RankRow({ item, rank, th, isFav, onFav }) {
  return (
    <div style={{ display:"flex",gap:12,padding:"12px 14px",borderRadius:10,background:th.surface,border:`1px solid ${th.border}`,alignItems:"center" }}>
      <span style={{ fontFamily:"'Playfair Display',serif",fontSize:rank<=3?20:15,fontWeight:700,color:rank<=3?th.accent:th.muted,width:28,textAlign:"center",flexShrink:0 }}>{rank<=3?["🥇","🥈","🥉"][rank-1]:rank.toString().padStart(2,"0")}</span>
      <img src={`https://picsum.photos/seed/${item.imageId}/80/54`} alt="" style={{ width:72,height:50,borderRadius:7,objectFit:"cover",flexShrink:0 }} onError={e=>e.target.src=`https://picsum.photos/80/54?random=${item.id}`}/>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontSize:10,fontWeight:700,color:CAT_COLOR[item.category]||th.accent,marginBottom:3 }}>{CAT_EMOJI[item.category]} {item.category}</div>
        <p style={{ fontSize:13,fontWeight:600,color:th.text,marginBottom:2,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis" }}>{item.title}</p>
        <p style={{ fontSize:11,color:th.muted }}>{item.author} · {item.timeAgo}</p>
      </div>
      {item.trending&&<Flame size={13} color={th.danger} style={{ flexShrink:0 }}/>}
      <button onClick={onFav} aria-label={isFav?"Remove from favorites":"Add to favorites"} style={{ color:isFav?th.danger:th.muted,padding:6,flexShrink:0,display:"flex",transition:"color .2s" }}>
        <Heart size={15} fill={isFav?th.danger:"none"}/>
      </button>
    </div>
  );
}

/* ── Skeleton Card ───────────────────────────────────────────────── */
function SkeletonCard({ th, gridView }) {
  const B=(w,h)=><div className="sk" style={{ width:w,height:h,borderRadius:6,background:th.skeleton,backgroundSize:"800px 100%" }}/>;
  if(!gridView) return(
    <div style={{ display:"flex",gap:14,padding:14,borderRadius:12,background:th.surface,border:`1px solid ${th.border}` }}>
      <div className="sk" style={{ width:104,height:70,borderRadius:8,background:th.skeleton,flexShrink:0,backgroundSize:"800px 100%" }}/>
      <div style={{ flex:1,display:"flex",flexDirection:"column",gap:8,justifyContent:"center" }}>{B("65%",11)}{B("90%",11)}{B("45%",10)}</div>
    </div>
  );
  return(
    <div style={{ borderRadius:14,overflow:"hidden",background:th.surface,border:`1px solid ${th.border}` }}>
      <div className="sk" style={{ paddingTop:"54%",background:th.skeleton,backgroundSize:"800px 100%" }}/>
      <div style={{ padding:14,display:"flex",flexDirection:"column",gap:9 }}>{B("60%",11)}{B("100%",14)}{B("100%",14)}{B("50%",10)}<div className="sk" style={{ height:34,borderRadius:9,background:th.skeleton,backgroundSize:"800px 100%",marginTop:3 }}/></div>
    </div>
  );
}

/* ── Empty State ─────────────────────────────────────────────────── */
function EmptyState({ message, sub, th }) {
  return(
    <div style={{ textAlign:"center",padding:"60px 20px",color:th.muted }}>
      <p style={{ fontSize:42,marginBottom:14 }}>📭</p>
      <p style={{ fontSize:16,fontWeight:600,color:th.text,marginBottom:8 }}>{message}</p>
      {sub&&<p style={{ fontSize:13 }}>{sub}</p>}
    </div>
  );
}