#!/usr/bin/env node
/**
 * Extract captions / subtitles from a YouTube video.
 *
 * No API key and no dependencies — it reads the caption tracks that the
 * YouTube player itself uses, then renders them as text, SRT, WebVTT or JSON.
 *
 *   node scripts/youtube-captions.mjs <url|videoId> [options]
 *
 * Run with --help for the full option list.
 */

const USAGE = `
Extract YouTube video captions.

Usage
  node scripts/youtube-captions.mjs <url|videoId> [options]

Options
  -l, --lang <code>      Preferred caption language (default: en). Use "any"
                         to take the first available track.
  -f, --format <fmt>     txt | srt | vtt | json           (default: txt)
  -o, --out <file>       Write to a file instead of stdout
      --translate <code> Ask YouTube to machine-translate into this language
      --list             List the available caption tracks and exit
      --auto             Prefer auto-generated (ASR) captions
      --no-auto          Ignore auto-generated captions
      --timestamps       Prefix each line with [mm:ss] in txt output
  -h, --help             Show this message

Examples
  node scripts/youtube-captions.mjs https://youtu.be/dQw4w9WgXcQ
  node scripts/youtube-captions.mjs dQw4w9WgXcQ --list
  node scripts/youtube-captions.mjs <url> -l ar -f srt -o captions.srt
  node scripts/youtube-captions.mjs <url> --translate en --timestamps
`.trim();

const BROWSER_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'accept-language': 'en-US,en;q=0.9',
};

/* ------------------------------------------------------------------ args */

function parseArgs(argv) {
  const opts = {
    target: null,
    lang: 'en',
    format: 'txt',
    out: null,
    translate: null,
    list: false,
    auto: null, // null = no preference, true = prefer ASR, false = exclude ASR
    timestamps: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (value === undefined) throw new Error(`Missing value for ${arg}`);
      return value;
    };

    switch (arg) {
      case '-h':
      case '--help':
        opts.help = true;
        break;
      case '-l':
      case '--lang':
        opts.lang = next();
        break;
      case '-f':
      case '--format':
        opts.format = next().toLowerCase();
        break;
      case '-o':
      case '--out':
        opts.out = next();
        break;
      case '--translate':
        opts.translate = next();
        break;
      case '--list':
        opts.list = true;
        break;
      case '--auto':
        opts.auto = true;
        break;
      case '--no-auto':
        opts.auto = false;
        break;
      case '--timestamps':
        opts.timestamps = true;
        break;
      default:
        if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
        if (opts.target) throw new Error(`Unexpected argument: ${arg}`);
        opts.target = arg;
    }
  }

  return opts;
}

/** Accepts a full URL in any of YouTube's shapes, or a bare 11-char video id. */
function extractVideoId(target) {
  if (/^[\w-]{11}$/.test(target)) return target;

  let url;
  try {
    url = new URL(target.includes('://') ? target : `https://${target}`);
  } catch {
    throw new Error(`Could not read a video id from: ${target}`);
  }

  const host = url.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    if (/^[\w-]{11}$/.test(id)) return id;
  }

  if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    const v = url.searchParams.get('v');
    if (v && /^[\w-]{11}$/.test(v)) return v;

    const match = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([\w-]{11})/);
    if (match) return match[1];
  }

  throw new Error(`Could not read a video id from: ${target}`);
}

/* ------------------------------------------------------- player response */

/** Reads a complete JSON object out of `source` starting at the first `{`. */
function readJsonObject(source, from) {
  const start = source.indexOf('{', from);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < source.length; i++) {
    const char = source[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') inString = true;
    else if (char === '{') depth++;
    else if (char === '}' && --depth === 0) {
      try {
        return JSON.parse(source.slice(start, i + 1));
      } catch {
        return null;
      }
    }
  }

  return null;
}

async function playerResponseFromWatchPage(videoId) {
  // bpctr + has_verified skip the consent / confirmation interstitials.
  const url = `https://www.youtube.com/watch?v=${videoId}&hl=en&bpctr=9999999999&has_verified=1`;
  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, cookie: 'CONSENT=YES+cb; SOCS=CAI' },
  });
  if (!res.ok) throw new Error(`YouTube returned HTTP ${res.status} for the watch page`);

  const html = await res.text();
  const marker = html.indexOf('ytInitialPlayerResponse');
  if (marker === -1) return null;

  return readJsonObject(html, marker);
}

async function playerResponseFromInnertube(videoId) {
  // The mobile client hands back caption tracks without any signature dance.
  const res = await fetch('https://www.youtube.com/youtubei/v1/player', {
    method: 'POST',
    headers: {
      ...BROWSER_HEADERS,
      'content-type': 'application/json',
      'x-youtube-client-name': '3',
      'x-youtube-client-version': '20.10.38',
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'ANDROID',
          clientVersion: '20.10.38',
          androidSdkVersion: 34,
          hl: 'en',
          gl: 'US',
        },
      },
      videoId,
      contentCheckOk: true,
      racyCheckOk: true,
    }),
  });
  if (!res.ok) throw new Error(`YouTube returned HTTP ${res.status} for the player API`);

  return res.json();
}

async function fetchPlayerResponse(videoId) {
  const attempts = [playerResponseFromWatchPage, playerResponseFromInnertube];
  const failures = [];
  let blocked = null;

  for (const attempt of attempts) {
    let response;
    try {
      response = await attempt(videoId);
    } catch (error) {
      failures.push(error.message);
      continue;
    }

    if (response?.captions?.playerCaptionsTracklistRenderer) return response;

    const status = response?.playabilityStatus;
    if (status && status.status !== 'OK') {
      blocked = status.reason || status.messages?.join(' ') || status.status;
    }
  }

  if (blocked) throw new Error(`YouTube will not serve this video: ${blocked}`);
  if (failures.length === attempts.length) {
    throw new Error(`Could not reach YouTube: ${failures.join('; ')}`);
  }

  throw new Error('This video has no caption tracks (or YouTube refused to list them).');
}

/* ---------------------------------------------------------------- tracks */

function listTracks(playerResponse) {
  const renderer = playerResponse.captions.playerCaptionsTracklistRenderer;
  return (renderer.captionTracks || []).map((track) => ({
    lang: track.languageCode,
    name: track.name?.simpleText || track.name?.runs?.map((r) => r.text).join('') || track.languageCode,
    auto: track.kind === 'asr',
    translatable: Boolean(track.isTranslatable),
    baseUrl: track.baseUrl,
  }));
}

function pickTrack(tracks, { lang, auto }) {
  let pool = tracks;
  if (auto === false) pool = pool.filter((t) => !t.auto);
  if (!pool.length) throw new Error('No caption track matches the requested options.');

  const byPreference = (candidates) => {
    if (auto === true) return candidates.find((t) => t.auto) || candidates[0];
    return candidates.find((t) => !t.auto) || candidates[0];
  };

  if (lang && lang !== 'any') {
    const wanted = lang.toLowerCase();
    const exact = pool.filter((t) => t.lang.toLowerCase() === wanted);
    if (exact.length) return byPreference(exact);

    // "en" should still match "en-GB".
    const prefixed = pool.filter((t) => t.lang.toLowerCase().startsWith(`${wanted}-`));
    if (prefixed.length) return byPreference(prefixed);
  }

  return byPreference(pool);
}

/* ----------------------------------------------------------------- cues  */

function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function cuesFromJson3(payload) {
  const cues = [];

  for (const event of payload.events || []) {
    // Rolling "append" events repeat text already emitted by auto-captions.
    if (event.aAppend === 1 || !event.segs) continue;

    const text = event.segs
      .map((seg) => seg.utf8 || '')
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) continue;

    const start = event.tStartMs ?? 0;
    cues.push({ start, end: start + (event.dDurationMs ?? 0), text });
  }

  return cues;
}

function cuesFromXml(xml) {
  const cues = [];
  const pattern = /<text([^>]*)>([\s\S]*?)<\/text>/g;

  for (const [, attrs, body] of xml.matchAll(pattern)) {
    const start = Number(attrs.match(/\bstart="([\d.]+)"/)?.[1] ?? 0) * 1000;
    const dur = Number(attrs.match(/\bdur="([\d.]+)"/)?.[1] ?? 0) * 1000;

    // This endpoint double-escapes its payload ("&" ships as "&amp;amp;"),
    // so the entities need one pass for the XML and one for the caption text.
    const text = decodeEntities(decodeEntities(body.replace(/<[^>]+>/g, '')))
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) continue;

    cues.push({ start, end: start + dur, text });
  }

  return cues;
}

/** Give zero-length cues an end time, so SRT/VTT output stays valid. */
function closeGaps(cues) {
  return cues.map((cue, index) => {
    if (cue.end > cue.start) return cue;
    const next = cues[index + 1];
    return { ...cue, end: next ? Math.max(next.start, cue.start + 500) : cue.start + 2000 };
  });
}

async function fetchCues(track, translate) {
  const url = new URL(track.baseUrl);
  if (translate) url.searchParams.set('tlang', translate);

  // json3 keeps word-level timing metadata; the legacy XML is the fallback.
  url.searchParams.set('fmt', 'json3');
  let res = await fetch(url, { headers: BROWSER_HEADERS });
  let body = res.ok ? await res.text() : '';

  if (body.trim().startsWith('{')) {
    try {
      return closeGaps(cuesFromJson3(JSON.parse(body)));
    } catch {
      /* fall through to XML */
    }
  }

  url.searchParams.delete('fmt');
  res = await fetch(url, { headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error(`Caption download failed with HTTP ${res.status}`);
  body = await res.text();

  const cues = closeGaps(cuesFromXml(body));
  if (!cues.length) throw new Error('The caption track came back empty.');
  return cues;
}

/* -------------------------------------------------------------- formats */

function timecode(ms, msSeparator) {
  const total = Math.max(0, Math.round(ms));
  const hours = String(Math.floor(total / 3600000)).padStart(2, '0');
  const minutes = String(Math.floor(total / 60000) % 60).padStart(2, '0');
  const seconds = String(Math.floor(total / 1000) % 60).padStart(2, '0');
  const millis = String(total % 1000).padStart(3, '0');
  return `${hours}:${minutes}:${seconds}${msSeparator}${millis}`;
}

function shortTimecode(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, '0');
  if (minutes < 60) return `${minutes}:${seconds}`;
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${seconds}`;
}

function render(cues, { format, timestamps }, meta) {
  switch (format) {
    case 'txt':
      return cues
        .map((cue) => (timestamps ? `[${shortTimecode(cue.start)}] ${cue.text}` : cue.text))
        .join('\n');

    case 'srt':
      return cues
        .map((cue, index) =>
          [
            index + 1,
            `${timecode(cue.start, ',')} --> ${timecode(cue.end, ',')}`,
            cue.text,
            '',
          ].join('\n'),
        )
        .join('\n');

    case 'vtt':
      return [
        'WEBVTT',
        '',
        ...cues.map((cue) => `${timecode(cue.start, '.')} --> ${timecode(cue.end, '.')}\n${cue.text}\n`),
      ].join('\n');

    case 'json':
      return JSON.stringify({ ...meta, cues }, null, 2);

    default:
      throw new Error(`Unknown format: ${format}. Use txt, srt, vtt or json.`);
  }
}

/* ----------------------------------------------------------------- main */

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help || !opts.target) {
    console.log(USAGE);
    process.exit(opts.target ? 0 : 1);
  }

  const videoId = extractVideoId(opts.target);
  const playerResponse = await fetchPlayerResponse(videoId);
  const tracks = listTracks(playerResponse);

  if (!tracks.length) throw new Error('This video has no caption tracks.');

  if (opts.list) {
    const title = playerResponse.videoDetails?.title;
    if (title) console.log(`${title}\n`);
    for (const track of tracks) {
      const flags = [track.auto ? 'auto-generated' : 'manual'];
      if (track.translatable) flags.push('translatable');
      console.log(`  ${track.lang.padEnd(8)} ${track.name}  (${flags.join(', ')})`);
    }
    return;
  }

  const track = pickTrack(tracks, opts);

  const wanted = opts.lang.toLowerCase();
  if (wanted !== 'any' && !track.lang.toLowerCase().startsWith(wanted)) {
    console.error(`No "${opts.lang}" captions on this video — falling back to "${track.lang}".`);
  }

  const cues = await fetchCues(track, opts.translate);

  const meta = {
    videoId,
    title: playerResponse.videoDetails?.title ?? null,
    channel: playerResponse.videoDetails?.author ?? null,
    language: opts.translate || track.lang,
    autoGenerated: track.auto,
  };

  const output = render(cues, opts, meta);

  if (opts.out) {
    const { writeFile } = await import('node:fs/promises');
    await writeFile(opts.out, `${output}\n`, 'utf8');
    console.error(`Wrote ${cues.length} caption lines to ${opts.out}`);
  } else {
    process.stdout.write(`${output}\n`);
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
