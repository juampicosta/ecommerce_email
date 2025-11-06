import mongoose from 'mongoose'

const TemplateScheme = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    raw_html: {
      type: String,
      required: true,
    },
    variables_accepted: {
      required: true,
      type: [String],
      default: [],
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

export default mongoose.model('template', TemplateScheme)
