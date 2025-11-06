import mongoose from 'mongoose'

const ComponentScheme = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    html_content: {
      required: true,
      type: String,
    },
    variables_accepted: {
      type: [String],
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

export default mongoose.model('component', ComponentScheme)
