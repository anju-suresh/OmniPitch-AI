import mongoose from 'mongoose';

const MatchEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  matchId: { type: String, default: 'PL-2026-ARS-CHE' },
  minute: { type: Number, required: true },
  second: { type: Number, default: 0 },
  type: { 
    type: String, 
    required: true,
    enum: ['pass', 'shot', 'goal', 'foul', 'tackle', 'turnover', 'card', 'save', 'substitution'] 
  },
  team: { type: String, required: true }, // e.g. 'Arsenal', 'Chelsea'
  player: { type: String, required: true },
  recipient: { type: String },
  coordinates: {
    x: { type: Number, min: 0, max: 100 },
    y: { type: Number, min: 0, max: 100 }
  },
  endCoordinates: {
    x: { type: Number, min: 0, max: 100 },
    y: { type: Number, min: 0, max: 100 }
  },
  metrics: {
    xG: { type: Number, default: 0 },
    xT: { type: Number, default: 0 },
    underPressure: { type: Boolean, default: false }
  },
  tacticalTags: [{ type: String }],
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const MatchEvent = mongoose.models.MatchEvent || mongoose.model('MatchEvent', MatchEventSchema);
