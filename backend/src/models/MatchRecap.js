import mongoose from 'mongoose';

const HighlightMarkerSchema = new mongoose.Schema({
  timestamp: String,
  minute: Number,
  title: String,
  clipDurationSeconds: Number,
  keyPlayer: String,
  xG: Number,
  commentaryCue: String
});

const MatchRecapSchema = new mongoose.Schema({
  recapId: { type: String, required: true, unique: true },
  matchId: { type: String, default: 'PL-2026-ARS-CHE' },
  minute: { type: Number, required: true },
  headline: { type: String, required: true },
  leadParagraph: { type: String, required: true },
  tacticalSummary: { type: String },
  turningPoints: [{ type: String }],
  socialReelScript: {
    hook: String,
    visualCues: [String],
    audioScript: String
  },
  highlights: [HighlightMarkerSchema],
  audioRecapText: { type: String },
  languages: {
    type: Map,
    of: {
      headline: String,
      summary: String,
      audioScript: String
    }
  },
  createdAt: { type: Date, default: Date.now }
});

export const MatchRecap = mongoose.models.MatchRecap || mongoose.model('MatchRecap', MatchRecapSchema);
