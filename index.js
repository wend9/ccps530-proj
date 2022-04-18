import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import co from "co";
import validator from "validator";
mongoose.Promise = global.Promise;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = 3000;
const API_KEY = "?key=3c21d850-6f7f-4ab9-b09d-90e0f1bddcca"
const url = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/"

var now = new Date();
var tenminsago = new Date(now.getTime() - 5*60*1000);

mongoose.connect("mongodb+srv://wbs530ryerson:Xobni123!@cluster0.2xkh0.mongodb.net/ryerson1?retryWrites=true&w=majority", { useNewUrlParser: true}, {useUnifiedTopology: true });
const formSchema=new mongoose.Schema({
  name : String,
  definition : String,
  img: String,
  time : { type : Date, default: Date.now }

});


const Form=mongoose.model("Form",formSchema);

const notesSchema ={

  name: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    match: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  },
  password: {
    type: String,
    minlength:8
  }
}


const Note =mongoose.model("Note", notesSchema);

app.get("/", function(req,res){
  //res.send("express works");
  res.sendFile("/Users/willame_01/Desktop/newproj/index2.html");
})
app.post("/",function(req,res){
  if (!req.body.password){res.redirect('/');}
  else{
  let newNote = new Note ({
    name:req.body.name,
    password:req.body.password

  });
newNote.save();
res.redirect('/next');
}
})


const url2 = "https://www.merriam-webster.com/assets/mw/static/art/dict/"
app.get("/next", (req, res)=>{
  res.sendFile("/Users/willame_01/Desktop/newproj/project1.html");
});



app.post("/next", (req, res) => {
  //res.status(200).send(" API is running");
  var currword = req.body.word

  axios
  .get(url+currword+API_KEY, {
    "url":{url}

  })
  .then(response => {
    var views = response.data[0].def[0].sseq[0][0][1].dt[0][1]
    Form.find({name: currword,time : {$gt: ((Math.round((new Date()).getTime() / 1000))-600)}}, {_id: 0 , name:0, time:0, __v:0},function (err, data) {
      if (err){

        console.log(err);
      } else if (data.length === 0) {
        console.log('record not found');
        let newForm = new Form ({
          name:req.body.word,
          definition:views,
          img: "url2+response.data[0].art.artid+.gif"

        });
        newForm.save();
        if(response.data[0].hasOwnProperty('art')){
          res.send("definition:"+views + "<br>" + "img:<br>"+"<img src=' "+url2+response.data[0].art.artid+".gif"+"'>")

        }
        else{
          res.send("definition:"+views + "<br>" + "img:<br>"+ "<img src='https://i.imgur.com/D1nM11A.png'>")
        }


      }
      else{
        console.log(data);
        res.send(data);
      }
    });

    // <= send data to the client
  })
  .catch(err => {
    console.log(err)
    res.send({ err }) // <= send error
  })
});


app.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});
