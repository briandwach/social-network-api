const { format } = require("date-fns");

const { Schema, Types } = require('mongoose');

const reactionSchema = new Schema(
  {
    reactionId: {
      type: Schema.Types.ObjectId,
      default: () => new Types.ObjectId(),
    },
    reactionBody: {
      type: String,
      required: true,
      maxlength: 280
    },
    username: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: formatTime
    },
  },
  {
    toJSON: {
      getters: true,
    },
    // Enabling getters when coverting toObject as well
    toObject: {
      getters: true,
    },
    id: false
  }
);

// Getter function to return timestamp in an easier format to read
function formatTime(createdAt) {
  return format(createdAt, "PPpp");
}

module.exports = reactionSchema;