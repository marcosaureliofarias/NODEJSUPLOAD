const express = require('express')

const multer = require('multer')

const admzip = require('adm-zip')

const path = require('path')

const fs = require('fs')

const app = express()

let dir = "public" 
let subDirectory = "public/uploads";

app.use(express.static('public'))

if(!fs.existsSync(dir)) {
    fs.mkdirSync(dir)

    fs.mkdirSync(subDirectory);
}

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

  let maxSize = 10 * 1024 * 1024

  let compressfilesupload = multer({ storage: storage,limits:{fileSize:maxSize}});


app.get('/',(req,res) => {
    res.sendFile(__dirname + "/index.html")
})

app.post('/compressfiles',compressfilesupload.array('file',100),(req,res) => {

    const zip = new admzip()
    if(req.files){
        req.files.forEach(file => {
            console.log(file.path)
            zip.addLocalFile(file.path)
        });

        let outputPath = Date.now() + "output.zip"

        fs.writeFileSync(outputPath,zip.toBuffer())

        res.download(outputPath,(err) => {
            if(err){
                // limpa os arquivos zipados
                req.files.forEach(file => {
                    fs.unlinkSync(file.path)
                });
                fs.unlinkSync(outputPath)
                res.send("Error in downloading zip file")
            }

            //limpa os arquivos zipados
            req.files.forEach(file => {
                fs.unlinkSync(file.path)
            });
            fs.unlinkSync(outputPath)
        })
    }
})

app.listen(4000,() => {
    console.log("App is listening on POrt 4000")
})