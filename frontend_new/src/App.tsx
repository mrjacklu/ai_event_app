import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Paper,
  Modal,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stack,
} from "@mui/material";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";

const FONTS = [
  '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  '"Merriweather", serif',
  '"Roboto Mono", monospace',
];
const BG_COLORS = [
  "#fffbe7", // pastel yellow
  "#ffe4ec", // pastel pink
  "#e0f7fa", // pastel blue
  "#e6ffe9", // pastel green
  "#f3e8ff", // pastel purple
  "#fff",    // white
];
const TEXT_COLORS = [
  "#2d3142", // deep blue
  "#ef8354", // orange accent
  "#4f5d75", // slate
  "#b15cff", // purple accent
  "#00897b", // teal accent
];

// Generic event prompts for pills
const GENERIC_EVENTS = [
  { text: '🎉 Plan for a 30th birthday party' },
  { text: '🌳 Plan a picnic day' },
  { text: '🎂 Plan a kids birthday party' },
  { text: '🍽️ Plan a dinner party with friends' },
  { text: '🏖️ Plan a beach day' },
  { text: '🎤 Plan a karaoke night' },
  { text: '🎬 Plan a movie marathon' },
  { text: '🧺 Plan a potluck brunch' },
  { text: '🏕️ Plan a camping trip' },
  { text: '🎮 Plan a game night' },
];

// ICONS for sections
const SECTION_ICONS: Record<string, string> = {
  Theme: '🎉',
  'Date & Time': '📅',
  Venue: '📍',
  'Food & Drinks': '🍽️',
  Activities: '🎤',
  Entertainment: '🎶',
  Flyer: '📰',
  Invitation: '✉️',
};

function FlyerPreview({ flyer, style }: { flyer: string; style: any }) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        minHeight: 300,
        background: style.bgColor,
        color: style.textColor,
        fontFamily: style.font,
        fontSize: style.fontSize,
        transition: "all 0.2s",
        whiteSpace: "pre-wrap",
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: flyer }} />
    </Paper>
  );
}

function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          minWidth: 320,
        }}
      >
        <Typography variant="h6" mb={2} align="center">
          {isLogin ? "Login" : "Sign Up"}
        </Typography>
        <Stack spacing={2}>
          <TextField label="Email" type="email" fullWidth />
          <TextField label="Password" type="password" fullWidth />
          <Button variant="contained" color="primary" fullWidth onClick={onClose}>
            {isLogin ? "Login" : "Sign Up"}
          </Button>
          <Button
            size="small"
            onClick={() => setIsLogin((v) => !v)}
            sx={{ textTransform: "none" }}
          >
            {isLogin ? "No account? Sign Up" : "Have an account? Login"}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

type EventHistoryGroups = { Today: any[]; Yesterday: any[]; Earlier: { [date: string]: any[] } };
function groupEventsByDate(events: any[]): EventHistoryGroups {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const todayStr = today.toISOString().slice(0, 10);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const groups: EventHistoryGroups = { Today: [] as any[], Yesterday: [] as any[], Earlier: {} as { [date: string]: any[] } };
  for (const event of events) {
    const eventDate = new Date(event.timestamp);
    const eventDateStr = eventDate.toISOString().slice(0, 10);
    if (eventDateStr === todayStr) {
      (groups.Today as any[]).push(event);
    } else if (eventDateStr === yesterdayStr) {
      (groups.Yesterday as any[]).push(event);
    } else {
      if (!(groups.Earlier as { [date: string]: any[] })[eventDateStr]) (groups.Earlier as { [date: string]: any[] })[eventDateStr] = [];
      (groups.Earlier as { [date: string]: any[] })[eventDateStr].push(event);
    }
  }
  return groups;
}

function EventPromptPage({ onSubmit, initialData, loading, result, history }: { onSubmit: (data: any) => void, initialData: any, loading: boolean, result: any, history: any[] }) {
  const [prompt, setPrompt] = useState(initialData.prompt || "");
  const [date, setDate] = useState(initialData.date || "");
  const [location, setLocation] = useState(initialData.location || "");
  const [time, setTime] = useState(initialData.time || "");
  const [flyerStylePrompt, setFlyerStylePrompt] = useState(initialData.flyer_style || "");
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ prompt, date, location, time, flyer_style: flyerStylePrompt });
    navigate("/result");
  };
  const grouped = groupEventsByDate(history);
  return (
    <Container maxWidth="sm" sx={{ py: 8, background: '#f8f9fa', minHeight: '100vh', borderRadius: 4, boxShadow: '0 2px 16px 0 rgba(60,60,60,0.06)', fontFamily: FONTS[0] }}>
      <Box sx={{ mb: 5, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start" }}>
        <Typography variant="h3" fontWeight={800} fontFamily={FONTS[0]} letterSpacing={1} color="#212529">FizzBuzz</Typography>
        <Typography variant="subtitle1" color="#ef8354" fontWeight={600} mt={1}>
          Instantly generate beautiful, AI-powered event plans and flyers for any occasion!
        </Typography>
      </Box>
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3, background: '#fff', boxShadow: '0 1px 8px 0 rgba(60,60,60,0.04)', display: 'flex', flexDirection: 'column', gap: 2 }} elevation={0}>
        <Typography variant="h5" mb={1} fontWeight={700} fontFamily={FONTS[0]} color="#343a40">Describe your event</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            multiline
            minRows={3}
            fullWidth
            required
            placeholder="e.g. Plan a casual 30th birthday party for 20 people who love craft beer"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            sx={{ mb: 2, background: '#f8f9fa', borderRadius: 2, fontFamily: FONTS[0], fontSize: '1.1rem' }}
            InputProps={{ style: { fontFamily: FONTS[0], fontSize: '1.1rem', color: '#495057' } }}
            label="Event Description"
          />
          <Stack direction="row" spacing={2} mb={2}>
            <TextField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} required sx={{ flex: 1, background: '#f8f9fa', borderRadius: 2 }} />
            <TextField label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} InputLabelProps={{ shrink: true }} required sx={{ flex: 1, background: '#f8f9fa', borderRadius: 2 }} />
          </Stack>
          <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} required fullWidth sx={{ mb: 2, background: '#f8f9fa', borderRadius: 2 }} />
          <TextField label="Flyer Style (e.g. cartoon, minimalist, retro, vibrant)" value={flyerStylePrompt} onChange={(e) => setFlyerStylePrompt(e.target.value)} required fullWidth sx={{ mb: 2, background: '#f8f9fa', borderRadius: 2 }} />
          <Button type="submit" variant="contained" disabled={loading || !prompt.trim() || !date || !location || !time || !flyerStylePrompt} fullWidth sx={{ background: 'linear-gradient(90deg, #dee2e6 0%, #adb5bd 100%)', color: '#212529', fontWeight: 700, fontSize: '1.1rem', borderRadius: 2, boxShadow: 'none', '&:hover': { background: 'linear-gradient(90deg, #ced4da 0%, #868e96 100%)' } }}>{loading ? "Planning..." : "Generate Event Plan"}</Button>
        </form>
      </Paper>
      {result && (
        <Box mt={4}>
          <Typography variant="h5" mb={2} fontWeight={700} fontFamily={FONTS[0]} color="#343a40">Last Generated Event</Typography>
          <Paper sx={{ p: 3, borderRadius: 2, background: '#fff', boxShadow: '0 1px 8px 0 rgba(60,60,60,0.04)', mb: 2 }}>
            <Typography variant="h6" fontWeight={700} color="#ef8354" mb={1} fontFamily={FONTS[0]}>Event Summary</Typography>
            <Typography><b>Theme:</b> {result.theme}</Typography>
            <Typography><b>Date:</b> {result.date}</Typography>
            <Typography><b>Time:</b> {result.time}</Typography>
            <Typography><b>Location:</b> {result.location}</Typography>
            {result.food && result.food.length > 0 && <Typography><b>Food:</b> {result.food.join(", ")}</Typography>}
            {result.drinks && result.drinks.length > 0 && <Typography><b>Drinks:</b> {result.drinks.join(", ")}</Typography>}
            {result.activities && result.activities.length > 0 && <Typography><b>Activities:</b> {result.activities.join(", ")}</Typography>}
            {result.entertainment && result.entertainment.length > 0 && <Typography><b>Entertainment:</b> {result.entertainment.join(", ")}</Typography>}
          </Paper>
          {result.flyer_image_url && (
            <Box mb={2} textAlign="center">
              <img src={result.flyer_image_url} alt="Flyer" style={{ maxWidth: '100%', borderRadius: 12, boxShadow: '0 2px 12px 0 rgba(60,60,60,0.10)' }} />
            </Box>
          )}
          <Paper sx={{ p: 4, borderRadius: 3, background: '#fffbe7', fontFamily: FONTS[0], fontSize: '1.2rem', color: '#2d3142', mt: 2 }}>
            {result.flyer || "No flyer text found."}
          </Paper>
        </Box>
      )}
      {/* Event history section */}
      {history.length > 0 && (
        <Box mt={4}>
          <Typography variant="h5" mb={2} fontWeight={700} fontFamily={FONTS[0]} color="#343a40">Event History</Typography>
          {grouped.Today.length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" color="#ef8354" mb={1}>Today</Typography>
              {grouped.Today.map((event, idx) => (
                <EventHistoryCard key={event.timestamp + idx} event={event} />
              ))}
            </Box>
          )}
          {grouped.Yesterday.length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" color="#b15cff" mb={1}>Yesterday</Typography>
              {grouped.Yesterday.map((event, idx) => (
                <EventHistoryCard key={event.timestamp + idx} event={event} />
              ))}
            </Box>
          )}
          {Object.entries(grouped.Earlier)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([dateStr, events]) => (
              <Box mb={3} key={dateStr}>
                <Typography variant="h6" color="#4f5d75" mb={1}>{new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</Typography>
                {events.map((event: any, idx: number) => (
                  <EventHistoryCard key={event.timestamp + idx} event={event} />
                ))}
              </Box>
            ))}
        </Box>
      )}
    </Container>
  );
}

function EventHistoryCard({ event }: { event: any }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 2, background: '#fff', boxShadow: '0 1px 8px 0 rgba(60,60,60,0.04)', mb: 2 }}>
      <Typography variant="subtitle2" color="#868e96" mb={1}>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
      <Typography><b>Theme:</b> {event.theme}</Typography>
      <Typography><b>Date:</b> {event.date}</Typography>
      <Typography><b>Time:</b> {event.time}</Typography>
      <Typography><b>Location:</b> {event.location}</Typography>
      {event.food && event.food.length > 0 && <Typography><b>Food:</b> {event.food.join(", ")}</Typography>}
      {event.drinks && event.drinks.length > 0 && <Typography><b>Drinks:</b> {event.drinks.join(", ")}</Typography>}
      {event.activities && event.activities.length > 0 && <Typography><b>Activities:</b> {event.activities.join(", ")}</Typography>}
      {event.entertainment && event.entertainment.length > 0 && <Typography><b>Entertainment:</b> {event.entertainment.join(", ")}</Typography>}
      {event.flyer_image_url && (
        <Box mb={2} textAlign="center">
          <img src={event.flyer_image_url} alt="Flyer" style={{ maxWidth: '100%', borderRadius: 12, boxShadow: '0 2px 12px 0 rgba(60,60,60,0.10)' }} />
        </Box>
      )}
      <Paper sx={{ p: 2, borderRadius: 2, background: '#fffbe7', fontFamily: FONTS[0], fontSize: '1.1rem', color: '#2d3142', mt: 2 }}>
        {event.flyer || "No flyer text found."}
      </Paper>
    </Paper>
  );
}

function EventResultPage({ eventData, result, onBack, loading, error }: { eventData: any, result: any, onBack: () => void, loading: boolean, error: string | null }) {
  const navigate = useNavigate();
  const handleBackClick = () => {
    onBack();
    navigate("/");
  };
  return (
    <Container maxWidth="sm" sx={{ py: 8, background: '#f8f9fa', minHeight: '100vh', borderRadius: 4, boxShadow: '0 2px 16px 0 rgba(60,60,60,0.06)', fontFamily: FONTS[0] }}>
      <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h3" fontWeight={800} fontFamily={FONTS[0]} letterSpacing={1} color="#212529">FizzBuzz</Typography>
        <Button variant="contained" color="secondary" onClick={handleBackClick} sx={{ fontWeight: 700, fontSize: '1rem', borderRadius: 2 }}>Back</Button>
      </Box>
      {loading && <Typography variant="h6" color="#868e96" align="center">Generating your event plan...</Typography>}
      {error && <Typography variant="h6" color="error" align="center">{error}</Typography>}
      {!loading && !error && result && (
        <>
          {/* Event summary */}
          <Paper sx={{ p: 3, borderRadius: 2, background: '#fff', boxShadow: '0 1px 8px 0 rgba(60,60,60,0.04)', mb: 2 }}>
            <Typography variant="h6" fontWeight={700} color="#ef8354" mb={1} fontFamily={FONTS[0]}>Event Summary</Typography>
            <Typography><b>Theme:</b> {result.theme}</Typography>
            <Typography><b>Date:</b> {result.date}</Typography>
            <Typography><b>Time:</b> {result.time}</Typography>
            <Typography><b>Location:</b> {result.location}</Typography>
            {result.food && result.food.length > 0 && <Typography><b>Food:</b> {result.food.join(", ")}</Typography>}
            {result.drinks && result.drinks.length > 0 && <Typography><b>Drinks:</b> {result.drinks.join(", ")}</Typography>}
            {result.activities && result.activities.length > 0 && <Typography><b>Activities:</b> {result.activities.join(", ")}</Typography>}
            {result.entertainment && result.entertainment.length > 0 && <Typography><b>Entertainment:</b> {result.entertainment.join(", ")}</Typography>}
          </Paper>
          {/* Flyer image */}
          {result.flyer_image_url && (
            <Box mb={2} textAlign="center">
              <img src={result.flyer_image_url} alt="Flyer" style={{ maxWidth: '100%', borderRadius: 12, boxShadow: '0 2px 12px 0 rgba(60,60,60,0.10)' }} />
            </Box>
          )}
          {/* Flyer text */}
          <Paper sx={{ p: 4, borderRadius: 3, background: '#fffbe7', fontFamily: FONTS[0], fontSize: '1.2rem', color: '#2d3142', mt: 2 }}>
            {result.flyer || "No flyer text found."}
          </Paper>
        </>
      )}
    </Container>
  );
}

function App() {
  const [eventData, setEventData] = useState<any>({});
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('eventHistory');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('eventHistory', JSON.stringify(history));
  }, [history]);

  const handlePromptSubmit = async (data: any) => {
    setEventData(data);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/plan-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to generate event plan");
      const json = await res.json();
      setResult(json);
      // Add to history with timestamp
      const eventWithTimestamp = { ...json, timestamp: new Date().toISOString() };
      setHistory(prev => [eventWithTimestamp, ...prev]);
    } catch (e: any) {
      setError(e.message || "Unknown error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => {
    setError(null);
    setLoading(false);
    // eventData and result are retained
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<EventPromptPage onSubmit={handlePromptSubmit} initialData={eventData} loading={loading} result={result} history={history} />} />
        <Route path="/result" element={<EventResultPage eventData={eventData} result={result} onBack={handleBack} loading={loading} error={error} />} />
      </Routes>
    </Router>
  );
}

export default App;
