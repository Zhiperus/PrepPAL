import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  contentUrl: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

const Module = mongoose.model('Module', moduleSchema);

export default Module;
