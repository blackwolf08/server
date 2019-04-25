require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const bodyParser    = require('body-parser');
const errorHandler  = require('./handlers/error');
const authRoutes    = require('./routes/auth');
const messagesRoutes    = require('./routes/messages');
const { loginRequired, ensureCorrectUser } = require('./middleware/auth');



const PORT = 2000;
const app     = express();


app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/users/:id/messages',loginRequired, ensureCorrectUser, messagesRoutes);

app.get('api/messages', loginRequired, async function(req, res, next) {
    try {
        let messages = await db.Messages.find()
        .sort({ time: 'desc'})
        .populate('user', {
            username:true,
            profileImageUrl: true
        });
        return res.status(200).json(messages)
        ;
    } catch (error) {
        next(error);
    }
})

app.get('/', (req,res) => {
    res.send("HEllo");
})


//Not found route

app.use((req,res,next) => {
    let err    = new Error('Not Found');
    err.status = 404;
    next(err);
})

app.use(errorHandler);

app.listen(process.env.PORT, ()=>{
    console.log(`Server is running in PORT:${process.env.PORT}`);
})