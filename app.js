//jshint esversion:6
 
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");
 
 
const itemsSchema = {
  name:String
};
 
const Item = mongoose.model(
  "Item",itemsSchema
);
 
const item1 = new Item({
  name:"work"
})
 
const item2 = new Item({
  name:"play"
})
 
const item3 = new Item({
  name:"gym"
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
  Item.findByIdAndDelete(checkedItemId)
  .then(function(){
    console.log("deleted item");
    })
  .catch(function(err){
    console.log(err);
    });
  res.redirect("/");
})
 
app.post("/", function(req, res){
 
  const itemName = req.body.newItem;
  const item = new Item({
    name:itemName
  })
  item.save();
  res.redirect("/");
 
});
 
app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;
 
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