const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const Jimp = require('jimp');
const app = express();
const {performQuery} = require('./db');
const {directoryPath,token,uploadPath} = require('./config');
const axios = require('axios');
const cors = require('cors'); 
const FormData = require('form-data');
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static(path.join(process.cwd(), "/images")));

function convertNoRawat(inputDate,info=true) {
  if(info){

    // Extract year, month, day, and time
    const year = inputDate.substring(0, 4);
    const month = inputDate.substring(4, 6);
    const day = inputDate.substring(6, 8);
    const time = inputDate.substring(8);
  
    // Concatenate with slashes
    const formattedDate = `${year}/${month}/${day}/${time}`;
  
    return formattedDate;
  }else{
    return inputDate.replace(/\D/g, '');
  }
}



// Define a route
app.get('/file', (req, res) => {
    const id = req.query.id;

    if(id!==undefined){

      // Define the query and parameters
      const query = `SELECT a.no_rkm_medis, a.no_rawat , b.nm_pasien FROM reg_periksa as a
      join pasien as b on a.no_rkm_medis = b.no_rkm_medis
      WHERE a.no_rawat = ? limit 1`;
      const params = [convertNoRawat(id)]; // Replace your_value with the actual value
  
      performQuery(query, params, (rows) => {
        // Access the performQuery function from the dbQuery module
        let data = []
        fs.readdir(directoryPath, (err, files) => {
          if (err) {
            console.error('Error reading directory:', err);
            return;
          }
          
          files.forEach(file => {
              data.push(file.split('.')[0])
          });
  
          res.render('index', { myArray: data, data_px:rows, title:"test ejs"});
        });
      });
    }else{
      let data = []
      fs.readdir(directoryPath, (err, files) => {
        if (err) {
          console.error('Error reading directory:', err);
          return;
        }
        
        files.forEach(file => {
            data.push(file.split('.')[0])
        });

        res.render('index', { myArray: data, title:"test ejs"});
      });
    }
          
});


// Define a route that accepts a filename parameter
app.get('/image/:filename', (req, res) => {
    // Retrieve the filename parameter from the URL
    const filename = req.params.filename;
    console.log(filename);
    // Assuming your images are stored in a directory named "images"
    const imagePath = `${directoryPath}/${filename}.png`;
    console.log(imagePath);
    // Send the image file as the response
    res.sendFile(imagePath, (err) => {
      if (err) {
        // If there's an error (e.g., file not found), send a 404 status
        res.status(404).send('Image not found');
      }
    });
  });

// Function to create a blank space
const createBlankSpace = (width, height) => {
  return new Jimp(width, height, 0xFFFFFFFF); // White color represented as 0xFFFFFFFF in RGBA format
};

// Function to resize an image
const resizeImage = (image, width, height) => {
  return image.resize(width, height);
};

// Define a route that accepts a filename parameter
app.post('/tarikdata', (req, res) => {
  let data = req.body.info
  let no_rawat = convertNoRawat(req.body.no_rawat,false)
  if (data.length==2) {
    // Load the images you want to merge
    Promise.all([
      Jimp.read(directoryPath+'/'+data[0]+'.png'),
      Jimp.read(directoryPath+'/'+data[1]+'.png')
    ]).then(images => {
      // Define the desired width and height for resizing
      const width = 1500; // Change to your desired width
      const height = 1000; // Change to your desired height
      const spaceWidth = 50; // Change to your desired space width
  
      // Resize both images
      const resizedImages = images.map(image => resizeImage(image, width, height));
  
      // Create a blank space
      const blankSpace = createBlankSpace(spaceWidth, height);
  
      // Merge the resized images with space in between
      const image1 = resizedImages[0];
      const image2 = resizedImages[1];
  
      // Create a new Jimp image with enough width to accommodate both images and space
      const mergedImage = new Jimp(width * 2 + spaceWidth, height);
  
      // Composite the first image onto the left half of the merged image
      mergedImage.composite(image1, 0, 0);
  
      // Composite the blank space onto the middle of the merged image
      mergedImage.composite(blankSpace, width, 0);
  
      // Composite the second image onto the right half of the merged image
      mergedImage.composite(image2, width + spaceWidth, 0);
  
      // Save the merged image
      mergedImage.write(`temp/endoskopi_${no_rawat}.jpg`, (err)=>{
        if(err){
          console.log(err);
        }else{
          uploadData(`temp/endoskopi_${no_rawat}.jpg`,no_rawat)
        }
      });
      
      res.status(200).send('Data Berhasil Disimpan');
    }).catch(err => {
      console.error(err);
  });
  }else{
    res.status(200).send('Image Tidak Boleh Lebih Dari 2 atau kurang dari 1');
  }
});


const uploadData = async (imagePath, no_rawat) => {
  try {
    // Read the image file from the file system
    // const imageData = fs.readFileSync(imagePath);
    
    

    // Create a FormData object and append the image Blob
    const formData = new FormData();
    
    formData.append('token', token);
    formData.append('no_rawat', no_rawat);
    formData.append('kodefile', 'BRKS_ENDSC');
    formData.append('file', fs.createReadStream(imagePath), 'image.jpg');
    
    console.log(formData);

    
    // Make a POST request using Axios
    const response = await axios.post(uploadPath, formData, {
      headers: {
        'Content-Type': 'multipart/form-data;',
      }
    });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};




// Starting the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
