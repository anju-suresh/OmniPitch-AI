import mongoose from 'mongoose';

const SyntheticScenarioSchema = new mongoose.Schema({
  scenarioId: { type: String, required: true },
  tacticalPattern: { type: String, required: true }, // e.g., 'Counter-Attack from Corner', 'Half-Space Penetration'
  attackingFormation: { type: String }, // e.g., '4-3-3', '3-2-4-1'
  defensiveBlock: { type: String }, // e.g., 'Low Block 5-4-1', 'High Press 4-4-2'
  successProbability: { type: Number },
  simulatedEvents: [{
    sequenceOrder: Number,
    eventType: String,
    x: Number,
    y: Number,
    velocity: Number,
    pressureRating: Number,
    actionDescription: String
  }],
  aiEnrichment: {
    tacticalInsight: String,
    vulnerabilityIdentified: String,
    optimalCountermeasure: String
  },
  createdAt: { type: Date, default: Date.now }
});

const SyntheticDatasetSchema = new mongoose.Schema({
  datasetBatchId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  totalScenarios: { type: Number, default: 0 },
  generatedBy: { type: String, default: 'Gemini-2.0-Pro-Augmenter' },
  scenarios: [SyntheticScenarioSchema],
  createdAt: { type: Date, default: Date.now }
});

export const SyntheticDataset = mongoose.models.SyntheticDataset || mongoose.model('SyntheticDataset', SyntheticDatasetSchema);
