import { Document, model, Schema } from "mongoose";

interface campus extends Document {
  name: string;
  state: string;
}

const campusSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    unique: true,
  },
  state: {
    type: String,
    required: [true, "State is required"],
  },
});

const Campus = model<campus>("Campus", campusSchema);

export default Campus;
