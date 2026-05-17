import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Footprints, 
  Wallet, 
  Music, 
  Download, 
  Search, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Plus, 
  IndianRupee, 
  Smile, 
  Settings,
  CloudDownload,
  Video,
  Music2,
  MapPin,
  ShieldCheck,
  Trash2,
  Edit3,
  Users,
  ChevronRight,
  Heart,
  Bluetooth,
  Upload,
  User,
  Camera,
  CheckCircle2,
  XCircle,
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard
} from "lucide-react";

// --- Types ---
interface Song {
  title: string;
  artist: string;
  duration: string;
  source?: string;
  isLocal?: boolean;
  file?: File;
}

interface Playlist {
  id: string;
  name: string;
  songs: Song[];
}

interface Contact {
  id: string;
  name: string;
  relation: string;
  isSharing: boolean;
}

interface UserProfile {
  name: string;
  dailyGoal: number;
  avatarVibe: string;
  fastDownload: boolean;
}

export default function App() {
  const [steps, setSteps] = useState(0);
  const [balance, setBalance] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [themeColor, setThemeColor] = useState("#f8fafc");
  const [emotion, setEmotion] = useState("");
  const [imagination, setImagination] = useState("");
  const [musicQuery, setMusicQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  // --- Personalization State ---
  const [profile, setProfile] = useState<UserProfile>({
    name: "User",
    dailyGoal: 10000,
    avatarVibe: "Energetic",
    fastDownload: true
  });
  const [showProfileModal, setShowProfileModal] = useState(false);

  // --- Bank State ---
  const [isBankLinked, setIsBankLinked] = useState(false);
  const [bankAccount, setBankAccount] = useState("");
  const [showBankModal, setShowBankModal] = useState(false);

  // --- Bluetooth State ---
  const [btStatus, setBtStatus] = useState<'disconnected' | 'scanning' | 'connected'>('disconnected');
  const [btDevice, setBtDevice] = useState<string | null>(null);

  // New Features State
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: '1', name: 'Morning Walk', songs: [] }
  ]);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Mom', relation: 'Family', isSharing: false }
  ]);
  const [isSharingLocation, setIsSharingLocation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepInterval = useRef<NodeJS.Timeout | null>(null);

  // --- Bluetooth Logic ---
  const connectBluetooth = async () => {
    setBtStatus('scanning');
    try {
      if ('bluetooth' in navigator) {
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service']
        });
        setBtDevice(device.name || "Bluetooth Device");
        setBtStatus('connected');
      } else {
        setTimeout(() => {
          setBtDevice("Wireless Headphones");
          setBtStatus('connected');
        }, 2000);
      }
    } catch (err) {
      setBtStatus('disconnected');
      console.error(err);
    }
  };

  // --- Local File Upload ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newSongs: Song[] = Array.from(files).map(file => ({
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Local File",
      duration: "Local",
      source: "Device Storage",
      isLocal: true,
      file: file
    }));

    setSearchResults(prev => [...newSongs, ...prev]);
  };

  // --- Step Tracking Logic ---
  useEffect(() => {
    if (isWalking) {
      stepInterval.current = setInterval(() => {
        setSteps(prev => prev + Math.floor(Math.random() * 5) + 2);
      }, 1000);
    } else if (stepInterval.current) {
      clearInterval(stepInterval.current);
    }
    return () => {
      if (stepInterval.current) clearInterval(stepInterval.current);
    };
  }, [isWalking]);

  // --- API Calls ---
  const updateTheme = async (type: 'emotion' | 'imagination') => {
    setLoading(true);
    try {
      const res = await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          emotion: type === 'emotion' ? emotion : undefined,
          imagination: type === 'imagination' ? imagination : undefined
        }),
      });
      const data = await res.json();
      if (data.color) {
        setThemeColor(data.color);
        document.body.style.backgroundColor = data.color;
      }
    } finally {
      setLoading(false);
    }
  };

  const searchMusic = async () => {
    if (!musicQuery) return;
    setLoading(true);
    try {
      const res = await fetch("/api/music/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: musicQuery }),
      });
      const data = await res.json();
      setSearchResults(data.songs || []);
    } finally {
      setLoading(false);
    }
  };

  const claimRewards = async () => {
    if (steps < 100) return;
    try {
      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps }),
      });
      const data = await res.json();
      if (data.success) {
        setBalance(prev => prev + data.amount);
        setSteps(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const downloadMedia = (song: string, format: 'mp3' | 'mp4', source?: string) => {
    setDownloading(`${song}-${format}`);
    // Fast download logic: if enabled, speed up the simulation
    const delay = profile.fastDownload ? 800 : 3000;
    setTimeout(() => {
      setDownloading(null);
      alert(`Download Complete via ${source || 'Cloud'}: ${song}.${format} (${profile.fastDownload ? 'Ultra Fast' : 'Standard Speed'})`);
    }, delay);
  };

  // --- Playlist Logic ---
  const createPlaylist = () => {
    const name = prompt("Enter playlist name:");
    if (!name) return;
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      songs: []
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const deletePlaylist = (id: string) => {
    if (confirm("Delete this playlist?")) {
      setPlaylists(playlists.filter(p => p.id !== id));
      if (activePlaylistId === id) setActivePlaylistId(null);
    }
  };

  const renamePlaylist = (id: string) => {
    const name = prompt("Enter new name:");
    if (!name) return;
    setPlaylists(playlists.map(p => p.id === id ? { ...p, name } : p));
  };

  const addToPlaylist = (song: Song, playlistId: string) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        if (p.songs.some(s => s.title === song.title)) return p;
        return { ...p, songs: [...p.songs, song] };
      }
      return p;
    }));
    alert(`Added ${song.title} to playlist!`);
  };

  // --- Safety Logic ---
  const addContact = () => {
    const name = prompt("Contact Name:");
    const relation = prompt("Relation (e.g. Dad, Sister):");
    if (name && relation) {
      setContacts([...contacts, { id: Date.now().toString(), name, relation, isSharing: false }]);
    }
  };

  const toggleLocationSharing = () => {
    setIsSharingLocation(!isSharingLocation);
    if (!isSharingLocation) {
      alert("Location sharing active with selected family contacts.");
    }
  };

  // --- Bank Logic ---
  const linkBank = () => {
    const acc = prompt("Enter Bank Account Number (Simulated):");
    if (acc) {
      setBankAccount(`**** **** ${acc.slice(-4)}`);
      setIsBankLinked(true);
      alert("Bank Account Linked Successfully!");
    }
  };

  const handleWithdraw = () => {
    if (!isBankLinked) {
      alert("Please link your bank account first!");
      setShowProfileModal(true);
      return;
    }
    const amount = prompt("Enter amount to withdraw to bank (₹):");
    if (amount && parseFloat(amount) <= balance) {
      setBalance(prev => prev - parseFloat(amount));
      alert(`₹${amount} withdrawn to your bank account!`);
    } else {
      alert("Invalid amount or insufficient balance.");
    }
  };

  const handleDeposit = () => {
    if (!isBankLinked) {
      alert("Please link your bank account first!");
      setShowProfileModal(true);
      return;
    }
    const amount = prompt("Enter amount to deposit from bank (₹):");
    if (amount) {
      setBalance(prev => prev + parseFloat(amount));
      alert(`₹${amount} deposited from bank!`);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans transition-colors duration-1000" style={{ backgroundColor: themeColor }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-white/20 p-6 rounded-3xl backdrop-blur-md shadow-sm">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-display font-extrabold tracking-tighter text-slate-800"
          >
            FUN <span className="text-white drop-shadow-sm">N</span> TRUST
          </motion.h1>
          <div className="flex items-center gap-4">
            {/* Bluetooth Indicator */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              onClick={connectBluetooth}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${
                btStatus === 'connected' ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-white/40 text-slate-600 border-white/50'
              }`}
            >
              <Bluetooth className={`w-4 h-4 ${btStatus === 'scanning' ? 'animate-spin' : ''}`} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {btStatus === 'connected' ? btDevice : btStatus === 'scanning' ? 'Scanning...' : 'Connect BT'}
              </span>
            </motion.button>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowBankModal(true)}
              className="flex items-center gap-2 bg-white/40 px-4 py-2 rounded-2xl border border-white/50 cursor-pointer hover:bg-white/60 transition-colors"
            >
              <Wallet className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-slate-700">₹{balance.toFixed(2)}</span>
            </motion.div>
            <button 
              onClick={() => balance > 0 && alert("Payment interface opened! Send to contact...")}
              className="p-2 bg-slate-800 text-white rounded-xl shadow-lg hover:bg-slate-700 transition-colors"
              title="Pay People"
            >
              <IndianRupee className="w-5 h-5" />
            </button>
            <div 
              onClick={() => setShowProfileModal(true)}
              className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center cursor-pointer border-2 border-white shadow-sm overflow-hidden"
            >
              <User className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Fitness & Theme */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* User Personalized Hello */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-[2rem] text-white shadow-lg"
            >
              <h2 className="text-2xl font-display font-bold">Hello, {profile.name}!</h2>
              <p className="text-indigo-100 text-sm mt-1">Ready for your {profile.dailyGoal} step goal?</p>
              <div className="mt-4 bg-white/20 rounded-full h-2 w-full overflow-hidden">
                <motion.div 
                  className="bg-white h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((steps / profile.dailyGoal) * 100, 100)}%` }}
                />
              </div>
            </motion.div>
            
            {/* Step Counter Card */}
            <motion.section 
              whileHover={{ y: -5 }}
              className="bg-white/80 p-8 rounded-[2.5rem] shadow-xl space-y-6 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div className="bg-orange-100 p-3 rounded-2xl">
                    <Footprints className="w-8 h-8 text-orange-500" />
                  </div>
                  <motion.div
                    animate={isWalking ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${isWalking ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {isWalking ? 'TRACKING LIVE' : 'STATIONARY'}
                  </motion.div>
                </div>
                
                <div className="mt-8 text-center">
                  <h2 className="text-6xl font-display font-black text-slate-800 tabular-nums">
                    {steps.toLocaleString()}
                  </h2>
                  <p className="text-slate-500 font-medium">Steps Today</p>
                </div>

                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setIsWalking(!isWalking)}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                      isWalking ? 'bg-slate-200 text-slate-600' : 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                    }`}
                  >
                    {isWalking ? 'Stop Walk' : 'Start Walk'}
                  </button>
                  <button 
                    onClick={claimRewards}
                    disabled={steps < 100}
                    className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold disabled:opacity-50 shadow-lg shadow-emerald-200"
                  >
                    Claim Rewards
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-10">
                <Footprints size={200} />
              </div>
            </motion.section>

            {/* Theme / Emotion Section */}
            <section className="bg-white/90 p-8 rounded-[2.5rem] shadow-xl space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Smile className="text-indigo-500" />
                <h3 className="text-xl font-display font-bold">Emotion Theme</h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {['Happy', 'Calm', 'Brave', 'Dreamy', 'Energetic'].map(emo => (
                    <button 
                      key={emo}
                      onClick={() => { setEmotion(emo); updateTheme('emotion'); }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        emotion === emo ? 'bg-indigo-500 text-white' : 'hover:bg-slate-100 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Describe your imagination..." 
                    className="w-full bg-slate-100 border-none rounded-2xl p-4 pr-12 focus:ring-2 focus:ring-indigo-300"
                    value={imagination}
                    onChange={(e) => setImagination(e.target.value)}
                  />
                  <button 
                    onClick={() => updateTheme('imagination')}
                    className="absolute right-2 top-2 p-2 bg-indigo-500 text-white rounded-xl shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>

            {/* Safety & Trust Section */}
            <section className="bg-white/90 p-8 rounded-[2.5rem] shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-500" />
                  <h3 className="text-xl font-display font-bold">Safety & Trust</h3>
                </div>
                <motion.button 
                   whileTap={{ scale: 0.95 }}
                   onClick={toggleLocationSharing}
                   className={`p-2 rounded-full transition-colors ${isSharingLocation ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                >
                   <MapPin className={`w-5 h-5 ${isSharingLocation ? 'animate-pulse' : ''}`} />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  <span>Family Contacts</span>
                  <button onClick={addContact} className="text-emerald-600 hover:underline">+ New</button>
                </div>
                
                <div className="space-y-2">
                  {contacts.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-100">
                          <Users className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{c.relation}</p>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${isSharingLocation ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-200'}`}></div>
                    </div>
                  ))}
                </div>

                {isSharingLocation && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase">Live Tracking</p>
                      <p className="text-xs text-emerald-600">Sharing walk with {contacts[0]?.name || 'family'}</p>
                    </div>
                    <MapPin className="w-4 h-4 text-emerald-500" />
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Music Hub */}
          <div className="lg:col-span-8">
            <section className="bg-white/95 rounded-[3rem] shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
              
              {/* Music Search */}
              <div className="p-8 border-bottom border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Music className="text-pink-500 w-8 h-8" />
                      <h2 className="text-2xl font-display font-black text-slate-800 tracking-tight">Music Hub</h2>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative w-full max-w-xs">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input 
                          type="text" 
                          placeholder="Search cloud music..." 
                          className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-12 focus:ring-2 focus:ring-pink-300 focus:outline-none shadow-sm"
                          value={musicQuery}
                          onChange={(e) => setMusicQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && searchMusic()}
                        />
                        <button 
                          onClick={searchMusic}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-pink-500 text-white rounded-xl shadow-md hover:bg-pink-600 transition-colors"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      </div>
                      <input 
                        type="file" 
                        accept="audio/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        multiple 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold hover:bg-slate-700 transition shadow-lg shadow-slate-200"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Local Files</span>
                      </button>
                    </div>
                  </div>
              </div>

              {/* Music Content */}
              <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Playlist Sidebar */}
                <div className="md:col-span-3 space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Library</h4>
                     <button onClick={createPlaylist} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                        <Plus size={16} />
                     </button>
                  </div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => setActivePlaylistId(null)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${!activePlaylistId ? 'bg-pink-100 text-pink-600 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                       <Search size={18} />
                       <span className="text-sm">Explore</span>
                    </button>
                    {playlists.map(p => (
                      <div key={p.id} className="group relative">
                        <button 
                          onClick={() => setActivePlaylistId(p.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activePlaylistId === p.id ? 'bg-pink-100 text-pink-600 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                          <Music2 size={18} />
                          <span className="text-sm truncate pr-6">{p.name}</span>
                        </button>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => renamePlaylist(p.id)} className="p-1 text-slate-400 hover:text-slate-600"><Edit3 size={12} /></button>
                          <button onClick={() => deletePlaylist(p.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Results Container */}
                <div className="md:col-span-4 space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
                    {activePlaylistId ? playlists.find(p => p.id === activePlaylistId)?.name : 'Search Results'}
                  </h4>
                  <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                        <p className="text-slate-400 text-sm italic">Gemini is searching...</p>
                      </div>
                    ) : (activePlaylistId ? playlists.find(p => p.id === activePlaylistId)?.songs : searchResults)?.length ? (
                      (activePlaylistId ? playlists.find(p => p.id === activePlaylistId)?.songs : searchResults)?.map((song: any, i: number) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group flex flex-col p-4 bg-slate-50 hover:bg-pink-50 rounded-2xl cursor-pointer transition-colors relative"
                          onClick={() => setCurrentSong(song)}
                        >
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                                <Play className="w-4 h-4 text-slate-500 group-hover:text-pink-600" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-700 leading-tight">{song.title}</p>
                                <p className="text-[10px] text-pink-500 font-bold uppercase mb-0.5">{song.source || 'YouTube'}</p>
                                <p className="text-sm text-slate-400">{song.artist} {song.isLocal && "• Local"}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); downloadMedia(song.title, 'mp3', song.source); }}
                                  className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-pink-500"
                                >
                                  <Music2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); downloadMedia(song.title, 'mp4', song.source); }}
                                  className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-pink-500"
                                >
                                  <Video className="w-4 h-4" />
                                </button>
                              </div>
                               {!activePlaylistId && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); playlists.length > 0 && addToPlaylist(song, playlists[0].id); }}
                                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white rounded-lg text-slate-400 hover:text-pink-500 transition-all border border-slate-100"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                               )}
                               <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center p-12 text-slate-300">
                        <Music size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{activePlaylistId ? 'Playlist is empty' : 'Search for a vibe to start listening!'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Player Interface */}
                <div className="md:col-span-5 bg-slate-900 rounded-[2rem] p-8 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/20 to-indigo-500/20 opacity-30"></div>
                  
                  <div className="relative z-10 text-center space-y-8 mt-4">
                    <div className="w-48 h-48 mx-auto bg-slate-800 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden border border-white/10">
                      {currentSong ? (
                        <motion.div 
                          animate={{ rotate: isPlaying ? 360 : 0 }}
                          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                          className="w-full h-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center"
                        >
                           <Music className="w-20 h-20 text-white/50" />
                        </motion.div>
                      ) : (
                        <Music className="w-16 h-16 text-slate-700" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-2xl font-display font-bold leading-tight">
                        {currentSong?.title || "No Track Selected"}
                      </h3>
                      {currentSong?.source && (
                        <p className="text-pink-400 text-[10px] font-black uppercase tracking-[0.2em]">
                          Synced from {currentSong.source}
                        </p>
                      )}
                      <p className="text-slate-400">
                        {currentSong?.artist || "Pick a song to play"}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-8">
                      <SkipBack className="w-8 h-8 text-slate-400 hover:text-white cursor-pointer" />
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-lg shadow-white/10 hover:scale-105 active:scale-95 transition-all"
                      >
                        {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current translate-x-0.5" />}
                      </button>
                      <SkipForward className="w-8 h-8 text-slate-400 hover:text-white cursor-pointer" />
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 mt-4">
                      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-pink-500"
                          initial={{ width: "0%" }}
                          animate={isPlaying ? { width: "100%" } : {}}
                          transition={{ duration: 180, ease: "linear" }}
                        ></motion.div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 font-mono">
                        <span>0:00</span>
                        <span>{currentSong?.duration || "0:00"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative z-10 flex gap-4 mt-8">
                    <button 
                      onClick={() => currentSong && downloadMedia(currentSong.title, 'mp3', currentSong.source)}
                      disabled={!currentSong}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/5 disabled:opacity-30"
                    >
                      <CloudDownload className="w-4 h-4" />
                      <span className="text-xs font-bold">Fast MP3</span>
                    </button>
                    <button 
                       onClick={() => currentSong && downloadMedia(currentSong.title, 'mp4', currentSong.source)}
                       disabled={!currentSong}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/5 disabled:opacity-30"
                    >
                      <Video className="w-4 h-4" />
                      <span className="text-xs font-bold">Fast Video</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Bank & Finance Modal */}
        <AnimatePresence>
          {showBankModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowBankModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] p-8 relative z-10 shadow-2xl space-y-8"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                    <Wallet size={32} className="text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-display font-black text-slate-800">Your Wallet</h2>
                  <p className="text-slate-400 text-sm">Manage your steps rewards</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Available Balance</p>
                  <p className="text-4xl font-display font-black text-slate-800">₹{balance.toFixed(2)}</p>
                </div>

                {!isBankLinked ? (
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-center space-y-3">
                    <Building2 className="mx-auto text-slate-300" size={32} />
                    <p className="text-sm text-slate-500">Link a bank account to enable withdrawals and deposits.</p>
                    <button 
                      onClick={linkBank}
                      className="px-6 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100"
                    >
                      Link Bank
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <CreditCard className="text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-emerald-800 uppercase">Linked Account</p>
                        <p className="text-sm text-emerald-700 font-medium">{bankAccount}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={handleWithdraw}
                        className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <ArrowUpRight className="text-orange-500" />
                        <span className="text-xs font-bold text-slate-700">Withdraw</span>
                      </button>
                      <button 
                        onClick={handleDeposit}
                        className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <ArrowDownLeft className="text-emerald-500" />
                        <span className="text-xs font-bold text-slate-700">Deposit</span>
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setShowBankModal(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
                >
                  Close Wallet
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Profile Modal */}
        <AnimatePresence>
          {showProfileModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowProfileModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] p-8 relative z-10 shadow-2xl space-y-8"
              >
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4 group">
                    <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center border-4 border-indigo-50 overflow-hidden">
                       <User size={48} className="text-indigo-500" />
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-indigo-500 text-white rounded-full shadow-lg border-2 border-white">
                      <Camera size={14} />
                    </button>
                  </div>
                  <h2 className="text-2xl font-display font-black text-slate-800">Your Profile</h2>
                  <p className="text-slate-400 text-sm">Personalize your Fun N Trust experience</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase px-1">Display Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-300"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase px-1">Daily Step Goal</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-300"
                      value={profile.dailyGoal}
                      onChange={(e) => setProfile({...profile, dailyGoal: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Download className="text-indigo-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-700">Ultra Fast Downloads</p>
                        <p className="text-[10px] text-slate-400">Optimized for YouTube & Cloud sources</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setProfile({...profile, fastDownload: !profile.fastDownload})}
                      className={`w-12 h-6 rounded-full transition-colors relative ${profile.fastDownload ? 'bg-indigo-500' : 'bg-slate-300'}`}
                    >
                       <motion.div 
                        animate={{ x: profile.fastDownload ? 24 : 4 }}
                        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                       />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-2xl text-white">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-500 rounded-lg">
                        <CheckCircle2 size={16} />
                      </div>
                      <h3 className="text-sm font-bold">Play Store Status</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                      App is PWA-ready with manifest and icons. To generate a signed APK for Google Play, you can export the code and use <b>Capacitor</b> or <b>Bubblewrap</b>.
                    </p>
                    <button 
                      onClick={() => alert("To get your APK:\n1. Download the code zip from the AI Studio 'Settings' menu.\n2. Run 'npm run build'.\n3. Use 'npx @capacitor/cli add android' to generate your APK package.")}
                      className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors border border-white/10"
                    >
                      Export APK Instructions
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-400 uppercase px-1">Bank Account</label>
                    <div className="mt-2 flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Building2 className="text-slate-400" />
                        <div>
                          <p className="text-sm font-bold text-slate-700">{isBankLinked ? 'Account Linked' : 'No Bank Linked'}</p>
                          <p className="text-[10px] text-slate-400">{isBankLinked ? bankAccount : 'Link your account to withdraw funds'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={linkBank}
                        className="text-xs font-bold text-indigo-500 hover:underline"
                      >
                        {isBankLinked ? 'Change' : 'Link Now'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                        setShowProfileModal(false);
                        alert("Profile updated!");
                    }}
                    className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Downloading Toast */}
        <AnimatePresence>
          {downloading && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 z-50 border border-white/10"
            >
              <div className="w-6 h-6 border-b-2 border-white rounded-full animate-spin"></div>
              <span className="font-medium tracking-tight">Preparing your download for {downloading.split('-')[0]}...</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

// Add CSS for thin scrollbars
const styles = `
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
