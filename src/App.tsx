import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Settings, Zap, Music, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog } from 'lucide-react';

// --- Types ---
interface WeatherData {
  temp: number;
  condition: string;
  high: number;
  low: number;
  weatherCode: number;
  sunrise: string;
  sunset: string;
  city?: string;
  timestamp?: number;
}

interface AppSettings {
  use24Hour: boolean;
  units: 'metric' | 'us';
  manualLat?: number;
  manualLon?: number;
}

// --- Constants ---
const COZY_VIDEO_URLS = [
  "https://media.istockphoto.com/id/2172386059/video/wood-logs-burning-in-a-cozy-fireplace-at-home-christmas-winter-holiday.mp4?s=mp4-640x640-is&k=20&c=P44r01C0oUPr9xNA_HGLKMP_fzcgEP24kRgrZu6HNNw=",
  "https://pixabay.com/videos/download/video-164909_medium.mp4",
  "https://pixabay.com/videos/download/video-164909_medium.mp4"
];

const WEATHER_CODE_MAP: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
  61: "Light rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
  95: "Thunderstorm",
};

const getWeatherIcon = (code: number, size = 20) => {
  if (code === 0 || code === 1) return <Sun size={size} />;
  if (code === 2 || code === 3) return <Cloud size={size} />;
  if (code >= 51 && code <= 65) return <CloudRain size={size} />;
  if (code >= 71 && code <= 75) return <Snowflake size={size} />;
  if (code >= 95) return <CloudLightning size={size} />;
  if (code === 45 || code === 48) return <CloudFog size={size} />;
  return <Cloud size={size} />;
};

// --- Components ---

const BentoTile = ({ children, className = "", nightMode, onClick }: { children: React.ReactNode, className?: string, nightMode: boolean, onClick?: () => void }) => {
  return (
    <motion.div 
      layout
      onClick={onClick}
      className={`bento-tile ${className} ${nightMode ? 'border-white/5 shadow-none opacity-80' : 'border-white/10 shadow-xl'} transition-all duration-1000 overflow-hidden relative group`}
    >
      {children}
    </motion.div>
  );
};

const AtmosphericVideo = ({ nightMode, className = "", label, forcePlay }: { nightMode: boolean, className?: string, label?: string, forcePlay?: boolean }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      setIsLoading(true);
      setHasError(false);
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        }).catch((err) => {
          console.warn("Autoplay prevented:", err);
          setIsPlaying(false);
          setIsLoading(false);
        });
      }
    }
  }, [forcePlay, videoIndex, retryKey]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasError) {
      handleRetry();
      return;
    }
    
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().then(() => setIsPlaying(true)).catch(console.error);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    // Try the next video in the list
    setVideoIndex((prev) => (prev + 1) % COZY_VIDEO_URLS.length);
    setRetryKey(prev => prev + 1);
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${className} ${!isPlaying || hasError ? 'cursor-pointer' : ''}`}
      onClick={handleTogglePlay}
    >
      <video
        key={`${videoIndex}-${retryKey}`}
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        // @ts-ignore
        webkit-playsinline="true"
        poster={`https://picsum.photos/seed/cozy-fire-${videoIndex}/1280/720`}
        className="w-full h-full object-cover"
        onPlay={() => { setIsPlaying(true); setIsLoading(false); setHasError(false); }}
        onPause={() => setIsPlaying(false)}
        onError={(e) => { 
          console.error("Video loading error:", e);
          setHasError(true); 
          setIsLoading(false); 
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
      >
        <source src={COZY_VIDEO_URLS[videoIndex]} type="video/mp4" />
      </video>

      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
            <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-white/40">Igniting...</p>
          </div>
        </div>
      )}

      {/* Tap to animate overlay */}
      {!isPlaying && !hasError && !isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] transition-all duration-500 hover:bg-black/20">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4 group-hover:scale-110 transition-transform">
             <div className="ml-1 w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/70">Start Atmosphere</p>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-40 bg-gradient-to-b from-zinc-900 to-black">
          <div className="text-center p-6 flex flex-col items-center">
            <div className="bg-white/5 p-4 rounded-full mb-4 inline-block border border-white/10">
              <Cloud size={32} className="opacity-40 text-white animate-pulse" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold mb-1">Atmosphere offline</p>
            <p className="text-[9px] text-white/30 max-w-[180px] mx-auto mb-6">Device incompatible or stream blocked.</p>
            
            <button 
              onClick={(e) => { e.stopPropagation(); handleRetry(); }}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold text-white transition-all active:scale-95"
            >
              Try Alternate
            </button>
          </div>
        </div>
      )}
      
      {label && !hasError && !isLoading && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className={`text-[12px] uppercase tracking-[0.1em] font-semibold ${nightMode ? 'text-zinc-500' : 'text-white/40'}`}>
            {label}
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none z-10" />
    </div>
  );
};

const Label = ({ children, nightMode }: { children: React.ReactNode, nightMode: boolean }) => (
  <div className={`text-[12px] uppercase tracking-[0.1em] font-semibold mb-2 ${nightMode ? 'text-zinc-500' : 'text-white/40'}`}>
    {children}
  </div>
);

const DigitalClock = ({ nightMode, use24Hour, theater = false }: { nightMode: boolean, use24Hour: boolean, theater?: boolean }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const displayHours = use24Hour ? hours : (hours % 12 || 12);
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const dateString = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (theater) {
    return (
      <div className="flex flex-col items-center justify-center p-8 select-none relative">
        {/* Cinematic glow behind text */}
        <div className="absolute inset-0 bg-white/5 blur-[120px] rounded-full scale-150 pointer-events-none" />
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center relative z-10"
        >
          <div className="flex items-start">
            <h1 className="text-[160px] md:text-[220px] font-thin tracking-[-0.06em] leading-[0.8] text-white drop-shadow-2xl">
              {displayHours}
              <span className="animate-pulse duration-[2000ms]">:</span>
              {minutes}
            </h1>
            {!use24Hour && (
              <span className="text-xl font-bold mt-6 ml-4 tracking-[0.2em] opacity-30 text-white uppercase">
                {ampm}
              </span>
            )}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-6 mt-8"
          >
            <div className="h-[1px] w-12 bg-white/20" />
            <p className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase text-white/80">
              {dateString}
            </p>
            <div className="h-[1px] w-12 bg-white/20" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 relative select-none">
      <div className={`text-[120px] lg:text-[140px] font-extralight tracking-[-0.04em] leading-none ${nightMode ? 'text-zinc-300' : 'text-white'} transition-colors duration-1000 flex items-baseline`}>
        {displayHours}:{minutes}
        {!use24Hour && (
          <span className={`text-2xl font-bold ml-4 tracking-wider opacity-30 ${nightMode ? 'text-zinc-500' : 'text-white'}`}>
            {ampm}
          </span>
        )}
      </div>
      <div className={`text-xl lg:text-2xl font-normal mt-3 opacity-80 ${nightMode ? 'text-zinc-500' : 'text-white'} transition-colors`}>
        {dateString}
      </div>
    </div>
  );
};

const WeatherWidget = ({ nightMode, weather, units }: { nightMode: boolean, weather: WeatherData | null, units: 'metric' | 'us' }) => {
  if (!weather) return (
    <BentoTile nightMode={nightMode} className="justify-center items-center">
       <Label nightMode={nightMode}>Weather</Label>
       <div className="animate-pulse text-sm opacity-40">Locating...</div>
    </BentoTile>
  );

  const convertTemp = (temp: number) => units === 'us' ? (temp * 9/5) + 32 : temp;
  const unitSymbol = units === 'us' ? '°F' : '°';

  return (
    <BentoTile nightMode={nightMode} className={`${nightMode ? 'bg-zinc-950/40 opacity-60' : 'bg-gradient-to-b from-blue-500 to-blue-700 border-none'}`}>
      <div className="flex justify-between items-start">
        <Label nightMode={nightMode}>Weather</Label>
        <div className={nightMode ? 'text-zinc-500' : 'text-white'}>
          {getWeatherIcon(weather.weatherCode, 24)}
        </div>
      </div>
      <div className="flex flex-col h-full">
        <div className="text-5xl font-bold mb-1">
          {Math.round(convertTemp(weather.temp))}
          <span className="text-xl font-medium opacity-60 ml-0.5">{unitSymbol}</span>
        </div>
        <div className="text-lg opacity-80 font-medium truncate">{weather.condition}</div>
        <div className="text-xs opacity-60 mt-1">
          H: {Math.round(convertTemp(weather.high))}° L: {Math.round(convertTemp(weather.low))}°
        </div>
        {weather.city && <div className="text-[10px] opacity-40 mt-auto">{weather.city}</div>}
      </div>
    </BentoTile>
  );
};

const BatteryWidget = ({ nightMode }: { nightMode: boolean }) => {
  const [level, setLevel] = useState(0.85); 
  const [isCharging, setIsCharging] = useState(true);

  useEffect(() => {
    let batteryInstance: any = null;
    const updateBattery = (battery: any) => {
      setLevel(battery.level);
      setIsCharging(battery.charging);
    };

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryInstance = battery;
        updateBattery(battery);
        battery.addEventListener('levelchange', () => updateBattery(battery));
        battery.addEventListener('chargingchange', () => updateBattery(battery));
      });
    }

    return () => {
      if (batteryInstance) {
        batteryInstance.removeEventListener('levelchange', () => updateBattery(batteryInstance));
        batteryInstance.removeEventListener('chargingchange', () => updateBattery(batteryInstance));
      }
    };
  }, []);

  const displayLevel = Math.round(level * 100);

  return (
    <BentoTile nightMode={nightMode}>
      <Label nightMode={nightMode}>Battery</Label>
      <div className="flex items-center gap-3">
        <div className="w-10 h-5 border-2 border-current rounded-[4px] relative p-[2px]">
           <div 
             className={`h-full rounded-[1px] transition-all duration-1000 ${nightMode ? 'bg-zinc-500' : 'bg-green-500'}`} 
             style={{ width: `${displayLevel}%` }} 
           />
           <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-1 h-2 bg-current rounded-r-[1px]" />
        </div>
        <span className="text-2xl font-bold">{displayLevel}%</span>
      </div>
      <div className="text-xs opacity-40 mt-2 flex items-center gap-1">
        {isCharging ? (
          <><Zap size={10} /> Charging</>
        ) : (
          <div className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
        )}
        {!isCharging && ' Discharging'}
      </div>
    </BentoTile>
  );
};

const PhotoWidget = ({ nightMode }: { nightMode: boolean }) => {
  return (
    <BentoTile nightMode={nightMode} className="p-2 overflow-hidden group">
      <div className="w-full h-full rounded-[24px] overflow-hidden relative">
        <img 
          src="https://picsum.photos/seed/standby-bento/800/800"
          alt="Bento Photo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-4 left-4 text-xs font-bold text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          Memories
        </div>
      </div>
    </BentoTile>
  );
};

const CozyVideoWidget = ({ nightMode }: { nightMode: boolean }) => {
  return (
    <BentoTile nightMode={nightMode} className="p-0">
      <AtmosphericVideo 
        nightMode={nightMode} 
        label="Atmosphere"
      />
    </BentoTile>
  );
};

export default function App() {
  const [nightMode, setNightMode] = useState(() => {
    const saved = localStorage.getItem('standby-night-mode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('standby-settings');
    const defaults: AppSettings = {
      use24Hour: false,
      units: 'metric'
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  });

  const [showSettings, setShowSettings] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  const [weather, setWeather] = useState<WeatherData | null>(() => {
    const saved = localStorage.getItem('standby-weather');
    if (saved) {
      const data = JSON.parse(saved);
      if (Date.now() - (data.timestamp || 0) < 1000 * 60 * 60 * 3) {
        return data;
      }
    }
    return null;
  });

  const performWeatherUpdate = useCallback((lat: number, lon: number) => {
    // Robust XMLHttpRequest for older devices like iPad 1 that lack modern fetch
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min&timezone=auto`;
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            const current = data.current;
            const daily = data.daily;
            
            const weatherObj: WeatherData = {
              temp: current.temperature_2m,
              condition: WEATHER_CODE_MAP[current.weather_code] || "Clear",
              weatherCode: current.weather_code,
              high: daily.temperature_2m_max[0],
              low: daily.temperature_2m_min[0],
              sunrise: daily.sunrise[0],
              sunset: daily.sunset[0],
              timestamp: Date.now()
            };

            setWeather(weatherObj);
            localStorage.setItem('standby-weather', JSON.stringify(weatherObj));
          } catch (e) {
            console.error("Weather parse error", e);
          }
        } else {
          console.error("Weather fetch failed with status", xhr.status);
        }
      }
    };
    
    xhr.onerror = function() {
      console.error("Weather fetch network error");
    };
    
    xhr.send();
  }, []);

  useEffect(() => {
    localStorage.setItem('standby-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('standby-night-mode', JSON.stringify(nightMode));
  }, [nightMode]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => performWeatherUpdate(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        console.warn("Geo error", err);
        performWeatherUpdate(51.5074, -0.1278);
      },
      { timeout: 10000 }
    );
  }, [performWeatherUpdate]);

  return (
    <div className={`h-screen w-screen bg-[#09090b] flex items-center justify-center p-6 transition-colors duration-1000 ${nightMode ? 'text-zinc-400' : 'text-white'} overflow-hidden relative`}>
      
      {/* Background Subtle Ambience */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${nightMode ? 'opacity-40 bg-black' : 'opacity-0'}`} />

      {/* Theater Mode Video (Full-screen background overlay) */}
      <AnimatePresence>
        {isTheaterMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 bg-black cursor-pointer group"
            onClick={() => setIsTheaterMode(false)}
          >
            <AtmosphericVideo 
               nightMode={true} 
               className="opacity-80"
               forcePlay={isTheaterMode}
            />
            {/* Cinematic Overlay System */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 transition-opacity duration-1000" />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
            
            {/* Exit hint that appears after a delay */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.4, y: 0 }}
              transition={{ delay: 3 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none group-hover:opacity-80 transition-opacity"
            >
              <div className="w-1 h-8 bg-white/40 rounded-full animate-bounce" />
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/60">Tap to exit</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Grid */}
      <AnimatePresence mode="wait">
        {!isTheaterMode ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="grid grid-cols-4 grid-rows-3 gap-4 w-full max-w-[1200px] aspect-[4/3] max-h-[90vh] z-10"
          >
            {/* Main Clock: 2x2 */}
            <BentoTile nightMode={nightMode} className="col-span-2 row-span-2 justify-center bg-gradient-to-br from-[#18181b] to-[#27272a]">
              <DigitalClock nightMode={nightMode} use24Hour={settings.use24Hour} />
            </BentoTile>

            {/* Weather: 1x1 */}
            <WeatherWidget nightMode={nightMode} weather={weather} units={settings.units} />

            {/* Battery: 1x1 */}
            <BatteryWidget nightMode={nightMode} />

            {/* Video Standby Widget: 2x2 */}
            <div className="col-span-2 row-span-2">
              <CozyVideoWidget nightMode={nightMode} />
            </div>

            {/* Photo: 1x1 */}
            <PhotoWidget nightMode={nightMode} />

            {/* Spacer for bottom left area */}
            <div className="col-span-1" />
          </motion.div>
        ) : (
          <motion.div 
            key="theater"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-10 flex flex-col items-center justify-center pointer-events-none w-full h-full"
          >
            <DigitalClock nightMode={true} use24Hour={settings.use24Hour} theater={true} />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-4 flex items-center gap-8 text-white/50"
            >
              <div className="flex items-center gap-3">
                {weather && getWeatherIcon(weather.weatherCode, 28)}
                <span className="text-3xl font-thin tracking-tighter">
                  {weather ? Math.round(settings.units === 'us' ? (weather.temp * 9/5) + 32 : weather.temp) : '--'}
                  <span className="text-lg opacity-40 ml-1">{settings.units === 'us' ? '°F' : '°C'}</span>
                </span>
              </div>
              <div className="h-6 w-[1px] bg-white/10" />
              <div className="flex flex-col items-start leading-none gap-1">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">Conditions</span>
                <span className="text-sm font-medium tracking-wide uppercase">{weather?.condition || 'Updating...'}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Overlay */}
      <div className="absolute bottom-6 right-6 flex gap-3 z-50">
        <button 
          onClick={() => setIsTheaterMode(!isTheaterMode)}
          className={`p-4 rounded-full transition-all duration-500 shadow-xl ${isTheaterMode ? 'bg-indigo-600 text-white' : 'bg-white/5 border border-white/5 text-white hover:bg-white/10'}`}
          title="Toggle Standby Video"
        >
          <Zap size={20} className={isTheaterMode ? 'animate-pulse' : ''} />
        </button>
        <button 
          onClick={() => setNightMode(!nightMode)}
          className={`p-4 rounded-full transition-all duration-500 shadow-xl ${nightMode ? 'bg-zinc-800 border border-white/10 text-white' : 'bg-white/5 border border-white/5 text-white hover:bg-white/10'}`}
          title="Toggle Night Mode"
        >
          {nightMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-4 rounded-full bg-white/5 border border-white/5 text-white hover:bg-white/10 transition-all shadow-xl"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowSettings(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Preferences</h2>
                  <div className="p-2 bg-white/5 rounded-xl text-xs font-mono opacity-40 text-white">v3.0</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div>
                      <p className="font-semibold text-white">24-Hour Clock</p>
                    </div>
                    <Toggle 
                      active={settings.use24Hour} 
                      onClick={() => setSettings({ ...settings, use24Hour: !settings.use24Hour })} 
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div>
                      <p className="font-semibold text-white">Temperature Unit</p>
                    </div>
                    <div className="flex bg-zinc-800 p-1 rounded-xl">
                      <button 
                        onClick={() => setSettings({ ...settings, units: 'metric' })}
                        className={`px-3 py-1 rounded-lg text-xs transition-colors ${settings.units === 'metric' ? 'bg-zinc-600 text-white' : 'text-zinc-500'}`}
                      >
                        °C
                      </button>
                      <button 
                        onClick={() => setSettings({ ...settings, units: 'us' })}
                        className={`px-3 py-1 rounded-lg text-xs transition-colors ${settings.units === 'us' ? 'bg-zinc-600 text-white' : 'text-zinc-500'}`}
                      >
                        °F
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl text-center">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Weather Sync</p>
                    <p className="text-xs text-zinc-400">
                      {weather ? `Last sync: ${weather.condition}` : 'Waiting for location...'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowSettings(false)}
                  className="mt-8 w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Night Dimmer Effect */}
      {nightMode && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/50 pointer-events-none z-[80]" />}
    </div>
  );
}

const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-12 h-6 rounded-full transition-colors relative ${active ? 'bg-indigo-600' : 'bg-zinc-700'}`}
  >
    <motion.div 
      animate={{ x: active ? 24 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white" 
    />
  </button>
);
