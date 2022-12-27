require("dotenv").config()
const request = require("request")
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const { urlencoded } = require("body-parser")
const _ = require("lodash")
const date = require(__dirname + "/date.js")
//console.log(date);
const app = express()

// const items = [];
// const workItems=[];
app.set("view engine", "ejs")

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
)
app.use(express.static(__dirname))

//Creating a database
mongoose.connect(process.env.MONGODB, {
	useNewUrlParser: true,
})

//Creating Mongoose Schema
const itemsSchema = new mongoose.Schema({
	name: String,
})
const workSchema = new mongoose.Schema({
	name: String,
})
// // Creating itemsSchema Model
const Item = mongoose.model("Item", itemsSchema)
// Creating another model
const Work = mongoose.model("Work", workSchema)

// Creating third items
const item1 = new Item({
	name: "Welcome to your todolist!",
})
const item2 = new Item({
	name: "Hit the + button to add a new item.",
})
const item3 = new Item({
	name: "Click on checkbox to delete an item.",
})

const defaultItems = [item1, item2, item3]

// For Work items
const workitem1 = new Work({
	name: "Welcome to your todolist!",
})
const workitem2 = new Work({
	name: "Hit the + button to add a new item.",
})
const workitem3 = new Work({
	name: "Click on checkbox to delete an item.",
})

const workdefaultItems = [workitem1, workitem2, workitem3]
const listSchema = new mongoose.Schema({
	name: String,
	items: [itemsSchema],
})

const List = mongoose.model("List", listSchema)

app.get("/", function (request, response) {
	//console.log(request);

	const day = date.headerdate()
	Item.find(function (err, founditems) {
		if (founditems.length === 0) {
			Item.insertMany(defaultItems, function (err) {
				if (err) {
					console.log(err)
				} else {
					console.log("Successfully saved default items to Database")
				}
				response.redirect("/")
			})
		} else {
			if (err) {
				console.log(err)
			} else {
				//   mongoose.connection.close()
				// console.log(founditems)
				response.render("list", {
					listTitle: day,
					newListItems: founditems,
				})
			}
		}
	})
})

app.post("/", function (request, response) {
	//console.log(request.body.list);
	const day = date.headerdate()
	//const listname="today";
	// console.log(request.body.list)
	const listName = request.body.list
	if (listName === day) {
		//items.push(item)
		// console.log("yes")
		const itemName = request.body.newItem
		const newitemName = new Item({
			name: itemName,
		})
		newitemName.save()
		response.redirect("/")
	} else if (listName === "Work List") {
		// console.log("Yes")
		const itemName = request.body.newItem
		const newitemName = new Work({
			name: itemName,
		})
		newitemName.save()
		response.redirect("/work")
	} else {
		//console.log("Home");
		const itemName = request.body.newItem
		console.log(itemName)
		const item = new Item({
			name: itemName,
		})
		List.findOne({ name: listName }, function (err, foundList) {
			foundList.items.push(item)
			foundList.save()
			response.redirect("/" + listName)
		})
	}
})
app.get("/work", function (request, response) {
	//console.log(request);
	Work.find({}, function (err, workitems) {
		// console.log(workitems);
		// console.log("find")
		if (workitems.length === 0) {
			Work.insertMany(workdefaultItems, function (err) {
				if (err) {
					console.log(err)
				} else {
					console.log("Successfully saved work default items to Database")
				}
				response.redirect("/work")
			})
		} else {
			if (err) {
				console.log(err)
			} else {
				// console.log("Work Items");
				// console.log(workitems)
				response.render("list", {
					listTitle: "Work List",
					newListItems: workitems,
				})
			}
		}
	})
})

app.get("/pricing", function (request, response) {
	response.render("pricing")
})

app.post("/delete", function (request, response) {
	const day = date.headerdate()
	const checkeditemId = request.body.checkbox
	const listName = request.body.listName
	//console.log(listName===day);
	if (listName === day) {
		Item.deleteOne({ _id: checkeditemId }, function (err) {
			if (err) {
				console.log(err)
			} else {
				console.log("Successfully deleted the document")
			}
		})
		response.redirect("/")
	} else if (listName === "Work List") {
		Work.deleteOne({ _id: checkeditemId }, function (err) {
			if (err) {
				console.log(err)
			} else {
				console.log("Successfully deleted the document")
			}
		})
		response.redirect("/work")
	} else {
		List.findOneAndUpdate(
			{ name: listName },
			{ $pull: { items: { _id: checkeditemId } } },
			function (err, foundList) {
				if (err) {
					console.log(err)
				} else {
					response.redirect("/" + listName)
				}
			}
		)
	}
})
app.post("/work", function (request, response) {
	response.redirect("/")
})

app.get("/:customListName", function (request, response) {
	const customListName = _.capitalize(request.params.customListName)

	List.findOne({ name: customListName }, function (err, foundList) {
		if (err) {
			console.log(err)
		} else {
			if (!foundList) {
				// console.log("Does not exists")
				//Creating a new list
				const list = new List({
					name: customListName,
					items: defaultItems,
				})
				list.save()
				response.redirect("/" + customListName)
			} else {
				// console.log("Exists")
				//show an existing list
				response.render("list", {
					listTitle: foundList.name,
					newListItems: foundList.items,
				})
			}
		}
	})
})
app.post("/search", function (request, response) {
	const search = request.body.listsearch
	response.redirect("/" + search)
})
app.listen(process.env.PORT || 3000, function () {
	console.log("Server has started successfully.")
})
