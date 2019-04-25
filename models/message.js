const mongoose = require('mongoose');
const User = require('./user');

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        maxLength: 160
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    time : { type : Date, default: Date.now }
});

messageSchema.pre('remove', async function(next){
    try {
        let user = User.findById(this.user);
        user.remove(this.id);
        await user.save();
        return next();
    } catch (err) {
        
    }
})

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;