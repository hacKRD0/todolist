const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); 
const _ = require('lodash');

const app = express();

const items = [];
const workItems = [];

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://dattakeshava:1234567890@cluster0.bmu5rce.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model('Item', itemsSchema);

const listSchema = {
    name: String,

    items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add an item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

app.get('/', (req, res) => {

    Item.find({})
        .then (docs => {
            if(docs.length === 0) {
                Item.insertMany(defaultItems);
                res.redirect('/');
            }               
            res.render("list", { listTitle: 'Today', newList: docs });
        }).catch (err => {
            console.error(err);
        });
})

app.post('/', (req, res) => {
    const itemName = req.body.item;
    const listName = req.body.list;

    const newItem = new Item ({
        name: itemName
    });

    if (listName === "Today") {
        newItem.save();
        res.redirect('/');
    } else {
        List.findOne({ name: listName })
            .then(foundList => {
                foundList.items.push(newItem);
                foundList.save();
                res.redirect("/" + listName);
            }).catch(err => {
                console.log(err);
            })
    }
    
})

app.post('/delete', (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId)
        .then(() => {
            console.log('Successfully deleted item');
            res.redirect('/');
        }).catch(err => {
            console.log(err);
        })
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId }}})   // Pull deletes from the object items using _id ad the quesry to find element to delete.
            .then(() => {
                res.redirect('/' + listName);
            }).catch(err => {
                console.log(err);
            });
    }
    
})

app.get('/:customListName', (req, res) => {
    const customListName = req.params.customListName;

    List.findOne({ name: customListName })
        .then((foundList) => {
            if (!foundList) {
                const list = new List({
                    name: customListName,
            
                    items: defaultItems
                });
            
                list.save();

                res.redirect('/' + customListName);
            } else {
                res.render("list", { listTitle: foundList.name, newList: foundList.items });
            }
        }).catch((err) => {
            console.log(err);
        });
    // res.render('list', { listTitle: "Work", newList: workItems});
})

app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})