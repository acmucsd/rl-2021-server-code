import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import multer from 'multer';
import fs from 'fs';
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
app.post("/eval", upload_dir.single('agent'), (req, res) => {
  
  // copy file for use
  let testPath = `${__dirname}/Golf-main/origagent.zip`;
  if (!fs.existsSync(`${__dirname}/Golf-main/agent`)) {
    fs.mkdirSync(`${__dirname}/Golf-main/agent`);
  }
  `${execSync(`mv ${req.file.path} ${testPath}`)}`.split("\n");
  `${execSync(`tar -xf ${testPath} -C ${__dirname}/Golf-main/agent --strip-components 1`)}`

  const result = `${execSync("python3 " + scriptPath)}`.split("\n");
  let score = 0;
  for (let i = 0; i < result.length; i++) {
    const line = result[i];
    if (line.length >= 5 && line.slice(0,5) === "ERROR") {
      res.status(403);
      res.json({msg: "Error occured", error: line});
      break;
    }
    if (line == "RESULT") {
      score = parseFloat(result[i + 1]);
      break;
    }
  }

  fs.unlinkSync(testPath);
  `${execSync(`rm -r ${__dirname}/Golf-main/agent/*`)}`

  res.json({msg: "evalated agent", score});
});

app.listen(port).on("listening", () => {
  console.log(`listening on port ${port}`);
});