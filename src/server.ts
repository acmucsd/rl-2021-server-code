import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import multer from 'multer';
import fs from 'fs';
import extract from 'extract-zip';
import {execSync} from 'child_process';

declare global {
  type $TSFixMe = any;
}
const app = express();
const port = 9000;

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const upload_dir = multer({ dest: 'uploads/' })


app.get("/", (req, res) => {
  res.json({ msg: "online" });
});
const scriptPath = `${__dirname}/Golf-main/testAgent.py`;
app.post("/eval", upload_dir.single('agent'), async (req, res) => {
  
  if (!fs.existsSync(`${__dirname}/Golf-main/agent`)) {
    fs.mkdirSync(`${__dirname}/Golf-main/agent`);
  }
  try {
    await extract(req.file.path, { dir: `${__dirname}/Golf-main/agent` })
  } catch (err) {
    // handle any errors
    res.status(400);
    res.json({msg: "error occured with extracting agent", error: err});
    return;
  } 

  const result = `${execSync("python3 " + scriptPath)}`.split("\n");
  let score = 0;
  let error = {code: 200, error: null, msg: null};
  for (let i = 0; i < result.length; i++) {
    const line = result[i];
    if (line.length >= 5 && line.slice(0,5) === "ERROR") {
      error.error = line;
      error.msg = "error occured";
      error.code = 400;
      break;
    }
    if (line == "RESULT") {
      score = parseFloat(result[i + 1]);
      break;
    }
  }

  fs.unlinkSync(req.file.path);
  `${execSync(`rm -r ${__dirname}/Golf-main/agent/*`)}`

  if (error.code !== 200) {
    res.status(403);
    res.json(error);
  } else {
    res.json({msg: "evalated agent", score});
  }
});

app.listen(port).on("listening", () => {
  console.log(`listening on port ${port}`);
});