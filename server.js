const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const Form = require("./db/Form");

const app = express();
const port = 3001;

mongoose.connect("mongodb://127.0.0.1:27017/formbuilderdb");

const db = mongoose.connection;

db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

// Upload Header
app.post("/create-form", async (req, res) => {
  const { formName, formDescription } = req.body;
  try {
    if (!formName || !formDescription) {
      return res
      .status(400)
      .json({ error: "FormName and formDescription are required." });
    }
    
    const newForm = new Form({
      name: formName,
      description: formDescription,
      headerImage: null,
      questions: null
    });
    const savedForm = await newForm.save();

    res.status(201).json(savedForm);
  } catch (error) {
    console.error("Error saving data to the database:", error);
    res.status(500).json({ error: "Error saving data to the database" });
  }
});

// Upload Header Image
const upload = multer({ dest: 'uploads/' });

app.post("/update/:id", upload.single('image'), async (req, res) => {
  try {
    const id = req.params.id;

    if(!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    form.headerImage = req.file.filename;
    console.log(form)
    await form.save();
    
    res.json({ message: 'Document updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});

// Upload Form
  app.post("/save-form/:id", async (req, res) => {
  
    try {
      const id = req.params.id;

      const form = await Form.findById(id);
      if (!form) {
        return res.status(404).json({ error: 'Document not found' });
      }
      form.questions = req.body;
      console.log(form)
      await form.save();
      
      res.json({ message: 'Data Saved successfully' });
    } catch(error) {
      console.error(error);
      res.status(500).json({ success: false, message: "An error occurred" });
  }
})

// Receive Header
app.get("/forms/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const data  = await Form.findById(id);

    if (!data) {
      return res.status(404).json({ error: 'Data not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//Receive Forms
app.get("/forms", async (req, res) => {
  try {
    const data  = await Form.find();

    if (!data) {
      return res.status(404).json({ error: 'Data not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Receive Image of forms
app.get("/image/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'uploads', filename);

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});