import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// In-memory cache to prevent excessive requests while keeping instantaneous freshness
interface CacheData {
  data: any;
  timestamp: number;
}
let statsCache: CacheData | null = null;
const CACHE_TTL_MS = 2000;

// Fallback baseline values in case of temporary network timeouts
const FALLBACKS = {
  twitch: 36,
  tiktok: 5862,
  instagram: 193,
  discord: 82,
  whatsapp: 12,
  youtube: 0,
};

// Persistent in-memory cache for Twitch metadata to prevent Decapi 429 rate-limiting
let twitchCache = {
  count: FALLBACKS.twitch,
  isLive: false,
  title: 'SE ME DAÑO LA CAMARA AYUDA',
  game: 'Just Chatting',
  lastFetched: 0,
};

// Validates stream title/game text to reject any 429 or HTTP error strings
function isValidStreamText(text?: string | null): boolean {
  if (!text) return false;
  const clean = text.trim().toLowerCase();
  if (
    clean.includes('429') ||
    clean.includes('too many') ||
    clean.includes('rate limit') ||
    clean.includes('404') ||
    clean.includes('500') ||
    clean.includes('error') ||
    clean.includes('cloudflare') ||
    clean.includes('service unavailable')
  ) {
    return false;
  }
  return clean.length > 0;
}

// 1. Twitch via Decapi Public API with rate-limit protection
async function fetchTwitch(): Promise<{ count: number; isLive: boolean; title?: string; game?: string }> {
  const now = Date.now();
  // Throttle Decapi calls to at most once every 15 seconds to strictly prevent 429 errors
  if (now - twitchCache.lastFetched < 15000 && twitchCache.lastFetched > 0) {
    return {
      count: twitchCache.count,
      isLive: twitchCache.isLive,
      title: twitchCache.title,
      game: twitchCache.game,
    };
  }

  try {
    const [countRes, uptimeRes, titleRes, gameRes] = await Promise.all([
      fetch('https://decapi.me/twitch/followcount/kewisitotv', { headers: { 'User-Agent': 'Mozilla/5.0' } }),
      fetch('https://decapi.me/twitch/uptime/kewisitotv', { headers: { 'User-Agent': 'Mozilla/5.0' } }),
      fetch('https://decapi.me/twitch/status/kewisitotv', { headers: { 'User-Agent': 'Mozilla/5.0' } }),
      fetch('https://decapi.me/twitch/game/kewisitotv', { headers: { 'User-Agent': 'Mozilla/5.0' } }),
    ]);

    if (countRes.ok) {
      const countText = await countRes.text();
      const count = parseInt(countText.trim(), 10);
      if (!isNaN(count)) twitchCache.count = count;
    }

    if (uptimeRes.ok) {
      const uptimeText = await uptimeRes.text();
      twitchCache.isLive = !uptimeText.toLowerCase().includes('offline');
    }

    if (titleRes.ok) {
      const title = (await titleRes.text()).trim();
      if (isValidStreamText(title)) {
        twitchCache.title = title;
      }
    }

    if (gameRes.ok) {
      const game = (await gameRes.text()).trim();
      if (isValidStreamText(game)) {
        twitchCache.game = game;
      }
    }

    twitchCache.lastFetched = now;
  } catch {
    // Keep cached values on any error
  }

  return {
    count: twitchCache.count,
    isLive: twitchCache.isLive,
    title: twitchCache.title,
    game: twitchCache.game,
  };
}

// 2. TikTok via Public Web Profile Scraping
async function fetchTikTok(): Promise<number> {
  try {
    const res = await fetch('https://www.tiktok.com/@kewisito', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const text = await res.text();
    const match = text.match(/"followerCount":\s*([0-9]+)/);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed)) return parsed;
    }
    return FALLBACKS.tiktok;
  } catch {
    return FALLBACKS.tiktok;
  }
}

// 3. Instagram via Public Embed API
async function fetchInstagram(): Promise<number> {
  try {
    const res = await fetch('https://www.instagram.com/kewisito/embed/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const text = await res.text();
    const match = text.match(/\\"followers_count\\":\s*([0-9]+)/);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed)) return parsed;
    }
    return FALLBACKS.instagram;
  } catch {
    return FALLBACKS.instagram;
  }
}

// 4. Discord via Official Guild Invite Public API
async function fetchDiscord(): Promise<number> {
  try {
    const res = await fetch('https://discord.com/api/v10/invites/f7ysRu8bZK?with_counts=true');
    if (res.ok) {
      const json = await res.json();
      if (typeof json.approximate_member_count === 'number') {
        return json.approximate_member_count;
      }
    }
    return FALLBACKS.discord;
  } catch {
    return FALLBACKS.discord;
  }
}

// 5. WhatsApp via Official Public Channel Meta
async function fetchWhatsApp(): Promise<number> {
  try {
    const res = await fetch('https://www.whatsapp.com/channel/0029VaCgfLNEquiYiVSH4z1M', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const text = await res.text();
    const match = text.match(/([0-9,.]+)\s*followers/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1].replace(/,/g, ''), 10);
      if (!isNaN(parsed)) return parsed;
    }
    return FALLBACKS.whatsapp;
  } catch {
    return FALLBACKS.whatsapp;
  }
}

// 6. YouTube via Public Channel Data
async function fetchYouTube(): Promise<number> {
  try {
    const res = await fetch('https://www.youtube.com/@Kewisito', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const text = await res.text();
    const match = text.match(/"subscriberCountText":\{"simpleText":"([0-9,.]+[KkMm]?)\s*sub/i);
    if (match && match[1]) {
      const raw = match[1];
      if (raw.toLowerCase().includes('k')) return Math.round(parseFloat(raw) * 1000);
      if (raw.toLowerCase().includes('m')) return Math.round(parseFloat(raw) * 1000000);
      const parsed = parseInt(raw.replace(/,/g, ''), 10);
      if (!isNaN(parsed)) return parsed;
    }
    return FALLBACKS.youtube;
  } catch {
    return FALLBACKS.youtube;
  }
}

async function fetchAllSocialStats(force = false) {
  const now = Date.now();
  if (!force && statsCache && now - statsCache.timestamp < CACHE_TTL_MS) {
    return statsCache.data;
  }

  const [twitchData, tiktokFollowers, instagramFollowers, discordMembers, whatsappFollowers, youtubeSubs] =
    await Promise.all([
      fetchTwitch(),
      fetchTikTok(),
      fetchInstagram(),
      fetchDiscord(),
      fetchWhatsApp(),
      fetchYouTube(),
    ]);

  const responseData = {
    twitch: {
      followers: twitchData.count,
      isLive: twitchData.isLive,
      title: twitchData.title,
      game: twitchData.game,
    },
    tiktok: {
      followers: tiktokFollowers,
    },
    instagram: {
      followers: instagramFollowers,
    },
    discord: {
      followers: discordMembers,
    },
    whatsapp: {
      followers: whatsappFollowers,
    },
    youtube: {
      followers: youtubeSubs,
    },
    timestamp: new Date().toISOString(),
  };

  statsCache = {
    data: responseData,
    timestamp: now,
  };

  return responseData;
}

// Active Server-Sent Events (SSE) clients for instant push
const sseClients = new Set<Response>();

function broadcastStats(data: any) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// SSE stream for instantaneous real-time updates
app.get('/api/followers/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send current cached data immediately
  if (statsCache) {
    res.write(`data: ${JSON.stringify(statsCache.data)}\n\n`);
  } else {
    fetchAllSocialStats().then((data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// REST API endpoint for real-time follower counts with strict anti-cache headers
app.get('/api/followers', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  try {
    const stats = await fetchAllSocialStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'Error fetching real-time stats',
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

  // Background ticker that queries platforms continuously and pushes instant updates
  setInterval(async () => {
    try {
      const freshData = await fetchAllSocialStats(true);
      broadcastStats(freshData);
    } catch {
      // Ignore background transient errors
    }
  }, 2500);
}

startServer();
