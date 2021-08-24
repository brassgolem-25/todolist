const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const app = express();
const mongoose = require('mongoose');
const _ = require('lodash');

mongoose.connect('mongodb+srv://admin-Tushar:tushar99@cluster0.jrl8i.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"))
app.set('view engine', 'ejs');
//can apply 'const' to an array
const itemsSchema = new mongoose.Schema({
  name: String
})


const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to your to-do list!!"
})

const defaultArr = [item1];

const listSchema = new mongoose.Schema({
  name: String,
  items:[itemsSchema]
})

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultArr, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully Added");
        }
      });
      res.redirect("/");
    } else {
      res.render('list', {
        kindOfDay: "Today",
        newListItem: foundItems
      });
    }
  });
})

app.post("/", function(req, res) {
const itemName =  req.body.newItem;
const listName = req.body.list;

const item = new Item({
  name : itemName
 })

if(listName==="Today"){
 item.save();
  res.redirect('/');
}else {
  List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
  })
}
})

app.post("/delete",function(req,res){
const deleteId = req.body.check;
const listName = req.body.listName;

if(listName==="Today"){
  Item.findByIdAndRemove(deleteId,function(err){
    if(!err){
      console.log("Successfully deleted");
      res.redirect("/");
    }
  });
}else {
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteId}}},function(err,foundList){
    if(!err){
      res.redirect('/'+listName);
    }
  })
}


})

app.get("/:customList", function(req, res) {
    const customList = _.capitalize(req.params.customList);

    List.findOne({name:customList},function(err,foundList){
      if(!err){
        if(!foundList){
        //Create a list
        const list = new List({
          name : customList,
          items: defaultArr
        });
        list.save();
        res.redirect("/"+customList);
        }else {
        //Show Existing list
        res.render('list', {
          kindOfDay: foundList.name,
          newListItem: foundList.items
        });
        }
      }
    })


})



app.listen(process.env.PORT || 3000, function(req, res) {
  console.log("Server started at port " + process.env.PORT);
})
