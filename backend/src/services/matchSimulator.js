import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateXG, calculateXT, MomentumTracker } from './metricsEngine.js';
import { getInMemoryStore } from '../config/db.js';
import { MatchEvent } from '../models/MatchEvent.js';
import { generateContextualLiveCommentary } from '../agents/liveCommentaryEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the official synthetic La Liga dataset (FC Barcelona vs Deportivo Alavés)
let BAR_ALA_DATA = null;
try {
  const jsonPath = path.join(__dirname, '../data/bar_ala_2026_01.json');
  if (fs.existsSync(jsonPath)) {
    BAR_ALA_DATA = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  }
} catch (err) {
  console.error('[Simulator] Warning: Could not read bar_ala_2026_01.json:', err.message);
}

export const MATCH_METADATA = BAR_ALA_DATA?.match ? {
  matchId: BAR_ALA_DATA.match.id,
  name: BAR_ALA_DATA.match.name,
  competition: BAR_ALA_DATA.match.competition,
  venue: BAR_ALA_DATA.match.venue,
  date: BAR_ALA_DATA.match.date,
  isSynthetic: BAR_ALA_DATA.match.isSynthetic,
  syntheticNotice: BAR_ALA_DATA.match.syntheticNotice,
  homeTeam: {
    ...BAR_ALA_DATA.match.homeTeam,
    short: BAR_ALA_DATA.match.homeTeam.shortName || 'BAR',
    color: BAR_ALA_DATA.match.homeTeam.primaryColor || '#004D98'
  },
  awayTeam: {
    ...BAR_ALA_DATA.match.awayTeam,
    short: BAR_ALA_DATA.match.awayTeam.shortName || 'ALA',
    color: BAR_ALA_DATA.match.awayTeam.primaryColor || '#005BAC'
  }
} : {
  matchId: 'bar_ala_2026_01',
  name: 'FC Barcelona vs Deportivo Alavés',
  competition: 'La Liga EA Sports - Matchday 23',
  venue: 'Estadi Olímpic Lluís Companys, Barcelona',
  homeTeam: { name: 'FC Barcelona', short: 'BAR', color: '#004D98' },
  awayTeam: { name: 'Deportivo Alavés', short: 'ALA', color: '#005BAC' }
};

export const CONTINUOUS_MATCH_EVENTS = BAR_ALA_DATA?.events || [];

export class MatchSimulator {
  constructor(io) {
    this.io = io;
    this.currentIndex = 0;
    this.isRunning = false;
    this.timerId = null;
    this.speedMultiplier = 1; // 0.5x, 1x, 2x
    this.momentumTracker = new MomentumTracker(10);
    this.slidingLeadupBuffer = []; // Sliding micro-buffer for preceding tactical actions (Pillar 1)
    
    this.matchState = {
      matchId: MATCH_METADATA.matchId,
      matchName: MATCH_METADATA.name,
      competition: MATCH_METADATA.competition,
      venue: MATCH_METADATA.venue,
      homeScore: 0,
      awayScore: 0,
      currentMinute: 0,
      currentSecond: 0,
      status: 'idle', // 'idle' | 'live' | 'paused' | 'full_time'
      homeTeam: MATCH_METADATA.homeTeam,
      awayTeam: MATCH_METADATA.awayTeam,
      stats: {
        barcelona: { name: 'FC Barcelona', short: 'BAR', shots: 0, shotsOnTarget: 0, goals: 0, xG: 0.0, possession: 0, fouls: 0, yellowCards: 0, redCards: 0 },
        alaves: { name: 'Deportivo Alavés', short: 'ALA', shots: 0, shotsOnTarget: 0, goals: 0, xG: 0.0, possession: 0, fouls: 0, yellowCards: 0, redCards: 0 },
        // Universal fallbacks for legacy or multi-league consumers
        arsenal: { name: 'FC Barcelona', short: 'BAR', shots: 0, shotsOnTarget: 0, goals: 0, xG: 0.0, possession: 0, fouls: 0, yellowCards: 0, redCards: 0 },
        chelsea: { name: 'Deportivo Alavés', short: 'ALA', shots: 0, shotsOnTarget: 0, goals: 0, xG: 0.0, possession: 0, fouls: 0, yellowCards: 0, redCards: 0 }
      },
      currentMomentum: { score: 15, dominantTeam: 'Barcelona', intensity: 15 },
      eventsHistory: []
    };
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.matchState.status = 'live';
    this.emitStateUpdate();

    if (this.currentIndex === 0) {
      this.tick();
    } else {
      this.scheduleNextTick(1500);
    }
    console.log(`[Simulator] FC Barcelona vs Deportivo Alavés simulation started at ${this.speedMultiplier}x speed.`);
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.matchState.status = 'paused';
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.emitStateUpdate();
    console.log('[Simulator] Simulation paused.');
  }

  setSpeed(multiplier) {
    this.speedMultiplier = Number(multiplier) || 1;
    if (this.isRunning) {
      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
      this.scheduleNextTick();
    }
    this.emitStateUpdate();
    console.log(`[Simulator] Speed updated to ${this.speedMultiplier}x.`);
  }

  reset() {
    this.pause();
    this.currentIndex = 0;
    this.momentumTracker = new MomentumTracker(10);
    this.slidingLeadupBuffer = [];
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.matchState = {
      matchId: MATCH_METADATA.matchId,
      matchName: MATCH_METADATA.name,
      competition: MATCH_METADATA.competition,
      venue: MATCH_METADATA.venue,
      homeScore: 0,
      awayScore: 0,
      currentMinute: 0,
      currentSecond: 0,
      status: 'idle',
      homeTeam: MATCH_METADATA.homeTeam,
      awayTeam: MATCH_METADATA.awayTeam,
      stats: {
        barcelona: { name: 'FC Barcelona', short: 'BAR', shots: 0, shotsOnTarget: 0, goals: 0, xG: 0.0, possession: 0, fouls: 0, yellowCards: 0, redCards: 0 },
        alaves: { name: 'Deportivo Alavés', short: 'ALA', shots: 0, shotsOnTarget: 0, goals: 0, xG: 0.0, possession: 0, fouls: 0, yellowCards: 0, redCards: 0 },
        arsenal: { name: 'FC Barcelona', short: 'BAR', shots: 0, shotsOnTarget: 0, goals: 0, xG: 0.0, possession: 0, fouls: 0, yellowCards: 0, redCards: 0 },
        chelsea: { name: 'Deportivo Alavés', short: 'ALA', shots: 0, shotsOnTarget: 0, goals: 0, xG: 0.0, possession: 0, fouls: 0, yellowCards: 0, redCards: 0 }
      },
      currentMomentum: { score: 15, dominantTeam: 'Barcelona', intensity: 15 },
      eventsHistory: []
    };
    this.emitStateUpdate();
    console.log('[Simulator] Match simulation reset to 00:00.');
  }

  calculateNextEventDelay() {
    if (this.currentIndex >= CONTINUOUS_MATCH_EVENTS.length) return 3000;
    const prevIndex = Math.max(this.currentIndex - 1, 0);
    const currentEvent = CONTINUOUS_MATCH_EVENTS[prevIndex];
    const nextEvent = this.currentIndex < CONTINUOUS_MATCH_EVENTS.length ? CONTINUOUS_MATCH_EVENTS[this.currentIndex] : null;

    // Base delay allocated for viewing the event, pitch action, and reading commentary
    let baseDelayMs = 4200; // default for routine passes, turnovers, and throw-ins
    if (currentEvent.type === 'goal') {
      baseDelayMs = 9500; // Goal celebration, pitch replay & deep commentary reading time
    } else if (currentEvent.type === 'red_card' || currentEvent.type === 'penalty_awarded') {
      baseDelayMs = 8000; // Major inflection point
    } else if (currentEvent.type === 'shot_saved' || currentEvent.type === 'shot_woodwork' || Boolean(currentEvent.isKeyMomentCandidate)) {
      baseDelayMs = 6500; // Big chance & near miss
    } else if (currentEvent.type === 'yellow_card' || currentEvent.type === 'substitution') {
      baseDelayMs = 5200; // Tactical stoppage
    }

    // Chronological gap between event match minutes (e.g. 27' to 31' adds a smooth transition)
    if (nextEvent && nextEvent.minute > currentEvent.minute) {
      const minGap = nextEvent.minute - currentEvent.minute;
      baseDelayMs += Math.min(minGap * 400, 2000);
    }

    return Math.max(Math.round(baseDelayMs / this.speedMultiplier), 1800);
  }

  scheduleNextTick(customDelayMs = null) {
    if (!this.isRunning) return;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    const delay = customDelayMs !== null 
      ? Math.max(Math.round(customDelayMs / this.speedMultiplier), 1000)
      : this.calculateNextEventDelay();

    this.timerId = setTimeout(() => {
      if (this.isRunning) {
        this.tick();
      }
    }, delay);
  }

  async tick() {
    if (this.currentIndex >= CONTINUOUS_MATCH_EVENTS.length) {
      this.matchState.status = 'full_time';
      this.pause();
      this.emitStateUpdate();
      return;
    }

    const rawEvent = CONTINUOUS_MATCH_EVENTS[this.currentIndex];
    this.currentIndex++;

    const isBarca = rawEvent.teamId === 'barcelona' || rawEvent.team === 'Barcelona' || rawEvent.team === 'Arsenal';
    const teamKey = isBarca ? 'barcelona' : 'alaves';

    // Calculate advanced metrics if not pre-calculated
    let xG = rawEvent.xg || rawEvent.metrics?.xG || 0;
    let xT = rawEvent.metrics?.xT || 0;
    
    if (!xG && (rawEvent.type === 'shot' || rawEvent.type === 'goal' || rawEvent.type?.includes('shot'))) {
      const coords = rawEvent.coordinates || { x: 85, y: 50 };
      xG = calculateXG(coords.x, coords.y, rawEvent.metadata?.shotType || 'open_play', false);
    }
    if (!xT && rawEvent.type === 'pass_sequence' && rawEvent.coordinates && rawEvent.endCoordinates) {
      xT = calculateXT(rawEvent.coordinates.x, rawEvent.coordinates.y, rawEvent.endCoordinates.x, rawEvent.endCoordinates.y);
    }

    const enrichedEvent = {
      eventId: rawEvent.id || `EVT-${Date.now()}-${this.currentIndex}`,
      ...rawEvent,
      team: isBarca ? 'FC Barcelona' : 'Deportivo Alavés',
      metrics: {
        xG: +(xG || 0).toFixed(2),
        xT: +(xT || 0).toFixed(3),
        underPressure: Boolean(rawEvent.metadata?.underPressure)
      }
    };

    // Update match state
    this.matchState.currentMinute = enrichedEvent.minute;
    this.matchState.currentSecond = enrichedEvent.second;

    if (enrichedEvent.type === 'goal') {
      if (isBarca) this.matchState.homeScore++;
      else this.matchState.awayScore++;

      this.matchState.stats[teamKey].goals++;
      this.matchState.stats[teamKey].shots++;
      this.matchState.stats[teamKey].shotsOnTarget++;
      this.matchState.stats[teamKey].xG = +(this.matchState.stats[teamKey].xG + xG).toFixed(2);
    } else if (enrichedEvent.type?.includes('shot')) {
      this.matchState.stats[teamKey].shots++;
      if (enrichedEvent.type === 'shot_saved') {
        this.matchState.stats[teamKey].shotsOnTarget++;
      }
      this.matchState.stats[teamKey].xG = +(this.matchState.stats[teamKey].xG + xG).toFixed(2);
    } else if (enrichedEvent.type === 'foul') {
      this.matchState.stats[teamKey].fouls++;
    } else if (enrichedEvent.type === 'yellow_card' || enrichedEvent.type === 'card') {
      this.matchState.stats[teamKey].yellowCards++;
    } else if (enrichedEvent.type === 'red_card') {
      this.matchState.stats[teamKey].redCards++;
    }

    // Push to history
    this.matchState.eventsHistory.unshift(enrichedEvent);

    // Dynamically calculate cumulative possession from match events stream
    let barcaSec = 0;
    let alavesSec = 0;
    for (const e of this.matchState.eventsHistory) {
      const isB = e.teamId === 'barcelona' || e.team === 'Barcelona' || e.team === 'FC Barcelona' || e.team === 'Arsenal';
      const dur = e.possessionDurationSeconds || 25;
      if (isB) barcaSec += dur;
      else alavesSec += dur;
    }
    const totalSec = barcaSec + alavesSec;
    const barcaPoss = totalSec > 0 ? Math.round((barcaSec / totalSec) * 100) : 0;
    const alavesPoss = totalSec > 0 ? (100 - barcaPoss) : 0;

    this.matchState.stats.barcelona.possession = barcaPoss;
    this.matchState.stats.alaves.possession = alavesPoss;

    // Mirror to alias keys so existing consumers never fail
    this.matchState.stats.arsenal = { ...this.matchState.stats.barcelona };
    this.matchState.stats.chelsea = { ...this.matchState.stats.alaves };

    // Update momentum
    const momentumDelta = isBarca ? 15 : -15;
    const currentScore = Math.max(Math.min((this.matchState.currentMomentum?.score || 0) + momentumDelta, 100), -100);
    this.matchState.currentMomentum = {
      score: currentScore,
      dominantTeam: currentScore > 10 ? 'Barcelona' : currentScore < -10 ? 'Alavés' : 'Neutral',
      intensity: Math.abs(currentScore)
    };

    // Capture preceding lead-up events snapshot before pushing current event
    const leadupSnapshot = [...this.slidingLeadupBuffer];
    this.slidingLeadupBuffer.push(enrichedEvent);
    if (this.slidingLeadupBuffer.length > 8) {
      this.slidingLeadupBuffer.shift();
    }

    // Save to DB / In-memory store
    try {
      getInMemoryStore().events.push(enrichedEvent);
      if (MatchEvent.db?.readyState === 1) {
        await MatchEvent.create(enrichedEvent);
      }
    } catch (e) {
      // Non-blocking save
    }

    // Broadcast live event and state via WebSockets
    if (this.io) {
      this.io.emit('match:event', enrichedEvent);
      this.io.emit('match:state', this.matchState);
    }

    // Asynchronously generate contextual live AI commentary for significant moments
    if (this.isSignificantMoment(enrichedEvent)) {
      generateContextualLiveCommentary({
        currentEvent: enrichedEvent,
        leadupEvents: leadupSnapshot,
        matchState: this.matchState,
      })
        .then((result) => {
          if (result && result.success && result.data) {
            enrichedEvent.aiCommentary = result.data;
            if (this.io) {
              this.io.emit('match:ai-commentary', result.data);
            }
          }
        })
        .catch((err) => {
          console.error('[Simulator AI Commentary Error]', err.message);
        });
    }

    // Schedule next tick dynamically based on event significance and reading budget
    this.scheduleNextTick();
  }

  isSignificantMoment(event) {
    if (!event) return false;
    const xG = event.metrics?.xG || event.xg || 0;
    return (
      event.type === 'goal' ||
      event.type === 'red_card' ||
      event.type === 'penalty_awarded' ||
      event.type === 'shot_saved' ||
      event.type === 'shot_woodwork' ||
      Boolean(event.isKeyMomentCandidate) ||
      xG >= 0.20 ||
      event.type === 'yellow_card' ||
      event.type === 'substitution'
    );
  }

  emitStateUpdate() {
    if (this.io) {
      this.io.emit('match:state', this.matchState);
    }
  }

  getCurrentState() {
    return {
      metadata: MATCH_METADATA,
      homeTeam: MATCH_METADATA.homeTeam,
      awayTeam: MATCH_METADATA.awayTeam,
      ...this.matchState
    };
  }
}
