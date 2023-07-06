//jshint esversion:6
 
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
mongoose.connect("mongodb+srv://victorjc639:Ishmael14@cluster0.ncl6dsh.mongodb.net/?retryWrites=true&w=majority/todolistDB").then(
  app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port 3000");
  })
);;
 
 
const itemsSchema = {
  name:String
};
 
const Item = mongoose.model(
  "Item",itemsSchema
);
 
const item1 = new Item({
  name:"Welcome to your todo list!"
})
 
const item2 = new Item({
  name:"Hit the + button to add an item"
})
 
const item3 = new Item({
  name:"<--- Click on the checkbox to permanently delete an item"
})
 
const listSchema = {
  name:String,
  items:[itemsSchema]
}
 
const defaultItems = [item1,item2,item3];
 
const List = mongoose.model("List", listSchema);
 
 
 
app.get("/", function(req, res) {
 
  Item.find({})
  .then(function(foundItems){
    if(foundItems.length === 0){
 
      Item.insertMany(defaultItems)
        .then(function(){
        console.log("added db");
        })
        .catch(function(err){
        console.log(err);
        });
        res.redirect("/");
    }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  })
  .catch(function(err){
    console.log(err);
  })
 
  
 
});
 
app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItemId)
    .then(function(){
      console.log("deleted item");
      })
    .catch(function(err){
      console.log(err);
      });
    res.redirect("/");
  }else{
    List.findOne({ name: listName })
  .then((foundList) => {
    foundList.items.pull({ _id: checkedItemId });
    return foundList.save();
  })
  .then(() => {
    res.redirect("/" + listName);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("An error occurred");
  });

  };
});
 
app.post("/", function(req, res){
 
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName})
    .then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
    });
  }
 
});
 
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
 
  List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItems
            });
          
            list.save();
            console.log("saved");
            res.redirect("/"+customListName);
          }
          else{
            res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
          }
    })
    .catch(function(err){});
 
 
  
  
})
 
app.get("/about", function(req, res){
  res.render("about");
});
 
app.listen(3000, function() {
  console.log("Server started on port 3000");
});