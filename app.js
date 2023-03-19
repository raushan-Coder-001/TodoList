const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var favicon = require('serve-favicon');

app.use(favicon(__dirname + '/public/images/favicon.ico'));


// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
mongoose.connect("mongodb+srv://Raushan:MongoDB001@cluster0.j8kbhch.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true})

const itemsSchema = {
    name: String
};

const Item = mongoose.model ("Item", itemsSchema);

const item1 = new Item ({
    name: "Welcome to your todolist!"
});

const item2 = new Item ({
    name: "Hit the + button to add a new Item."
});

const item3 = new Item ({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String, 
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {


    Item.find({}, function(err, foundItems) {
        if(foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
            if(err) {
                console.log(err);
            }
            else {
                console.log("Successfully saved default items into DB.");
                }
            })
            res.redirect("/");
        }
        else{
            res.render("list", {
                // listTitle : day,
                listTitle : "Today",
                newListItems : foundItems
            });
        }
        // console.log(foundItems);
    })

});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList) {
        if(!err) {
            if(!foundList) {
                // Create a list.
                const list = new List ({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                //  Render the existing list.
                res.render("list", {
                    listTitle : foundList.name,
                    newListItems : foundList.items
                });
            }
        }
    });
});

app.post("/", function(req, res) {
    
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item ({
        name: itemName
    });


    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }
    else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
        
});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndDelete(checkedItemId, function(err) {
            if(!err) {
                console.log("Successfully deleted checked item.");
                res.redirect("/");
            }
        });
    }
    else {
        List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:checkedItemId}}}, function(err, foundList) {
            if(!err) {
                res.redirect("/"+listName);
            }
        });
    }
});

app.get("/about", function(req, res) {
    res.render("about");
})

app.post("/work", function(req, res) {
    const item = req.body.newItem;
    workItems.push(item);
    req.redirect("/work");
});


app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port 3000");
});