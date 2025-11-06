import mongoose from 'mongoose'

const EmailScheme = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    to_email: {
      type: String,
      required: true,
    },
    final_body_html: {
      required: true,
      type: String,
    },
    template_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'template',
      required: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export default mongoose.model('email', EmailScheme)
