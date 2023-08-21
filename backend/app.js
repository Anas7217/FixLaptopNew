require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');
const handlebars = require('handlebars');
const moment = require('moment-timezone');
const bodyParser = require('body-parser'); 
const hbssecond = require('hbs');
const port = process.env.PORT || 8000; 

const app = express();



  
app.use(express.static(path.join(__dirname, '/public'))); 

// Set the views directory path
// console.log(path.join(__dirname))  
const main_path=path.join(__dirname,"..");



const viewPath = path.join(__dirname, 'views');
// console.log(viewPath)
app.set('views', viewPath);


 

// Set up Handlebars as the view engine
const hbs = exphbs.create({
  extname: '.hbs', // Set the file extension for Handlebars templates
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
hbssecond.registerPartials(__dirname + '/views/layouts/');




app.use(bodyParser.json());

// Create a MongoDB schema and model
  const atlasUri = process.env.MONGO_URL;
  // console.log(atlasUri);  
  mongoose.connect(atlasUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to MongoDB Atlas');
  }).catch(err => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });
  
  // Create a MongoDB schema and model (replace 'YourModelName' and schema definition)
  const fixlaptop = mongoose.model('fixlaptop', new mongoose.Schema({      // fixlaptop is a collection
    productName: { type: String },
    imageLink:{type:String},
    price:{type:Number},
    oldPrice:{type:Number},
    description: { type: String },
    referenceNumber: { type: String },
    condition:{type:String},
    processor:{type:String},
    ram:{type:String},
    hardDisk:{type:String},
    display:{type:String},
    warranty:{type:String},
    shipping:{type:String},   
  }));
 
  const feedbackSchema = new mongoose.Schema({
            name:{type:String},
            email:{type:String},
            phoneNo:{type:Number},
            subject:{type:String},
            message:{type:String},
            timestamp: { type: Date, default: Date.now }
  });

  const Feedback = mongoose.model('Feedback', feedbackSchema);

  // API route to handle feedback submission
  app.post('/submit-feedback', async (req, res) => {
    try {
      const currentTimestampIST = moment().clone().tz('Asia/New_Delhi'); 
      // const currentTimestampNewDelhi = currentTimestampIST.clone().tz('Asia/New_Delhi');
      const newFeedbackData = {

        ...req.body,
        timestamp: currentTimestampIST.format() // Use IST timestamp
      };
      const newFeedback = new Feedback(newFeedbackData);
      const savedFeedback = await newFeedback.save();
      res.status(201).json(savedFeedback);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }); 


  app.get('/', async (req, res) => {
    // console.log(res);
    try {
       
        // Fetch data from the collection
        const data = await fixlaptop.find();   
        // console.log(data)
  
        // Send the data as JSON response
        res.sendFile(path.join(main_path, 'index.html'),{data});
        // res.sendFile(path.join(main_path,'style.css'));
        // res.json(data);  
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  });
  app.get('/fetchData', async (req, res) => {
    // console.log(res);
    try {
       
        // Fetch data from the collection
        const data = await fixlaptop.find(); 
          
  
      res.json(data);
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  });



app.get('/shop', (request, response) => {
  response.render('index');
});

app.get('/getMainHbsContent', async (req, res) => {
  try {
    // Fetch data from the database (replace YourModel.find() with your query)
    const data = await fixlaptop.find();
    // console.log(data);

    

    // Render your HBS template with the fetched data
    res.render('index', { data }); // Assuming your template is named 'index.handlebars'
     
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('Internal Server Error'); 
  }
});


app.get('/open', (req, res) => {
  // Get the content parameter from the query string
  const content = req.query.content;
  // alert(content)
  // console.log(content);
 
  // Render a new page and pass the content to the template
  res.render('open', { content });  
}); 
   
  
 
app.get('/search', async (req, res) => {
  const searchTerm = req.query.q;
  try {
      const filteredProducts = await fixlaptop.find({
          productName: { $regex: searchTerm, $options: 'i' }, 
      });

    

    res.json(filteredProducts);
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
    

  



// handlebars.registerHelper('getProduct', function(data) {
//   return data.productName;
// });
// handlebars.registerHelper('getDescription', function(data) {
//   return data.description;
// });
// handlebars.registerHelper('getImage', function(data) {
//   return data.imageLink;
// });
// handlebars.registerHelper('getPrice', function(data) {
//   return data.price;
// });
// handlebars.registerHelper('getRef', function(data) {
//   return data._id;
// });
  


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


