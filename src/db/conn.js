const mongoose = require('mongoose');

mongoose.connect(`mongodb://127.0.0.1:27017/yocket`).then(()=>{ //yocket is the name of the database
    console.log("mongoose connection succesful");
}).catch((err)=>{
    console.log(err);
})