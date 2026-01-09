const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderModel' },
  senderModel: { type: String, required: true, enum: ['Candidate', 'Employer'] },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'receiverModel' },
  receiverModel: { type: String, required: true, enum: ['Candidate', 'Employer'] },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  attachments: [String],
  conversationId: { type: String, required: true }
}, {
  timestamps: true
});

messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);