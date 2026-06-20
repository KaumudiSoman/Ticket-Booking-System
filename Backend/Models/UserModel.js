const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must have atleast 8 characters'],
      maxlength: [60, 'Password can not have more than 60 characters']
    },
  },
  { timestamps: true }
);

userSchema.methods.correctPassword = function (candidatePassword) {
  return candidatePassword === this.password;
};

module.exports = mongoose.model("User", userSchema);