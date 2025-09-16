const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors")
const app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let defaultcmds = [
  {
    commandmain: "help",
    res: "You can make yourself some commands here https://bot-page.sumedhzoting.repl.co/ and do !reload to reload the commands"
  },
  {
    commandmain: "sup",
    res: "Im bored how about you"
  },
  {
    commandmain: "howareyou",
    res: "im good"
  },
]

let commands = defaultcmds;

app.use(cors())

app.get("/commands", (req, res) => {
  res.send(commands)
})

app.post("/add", (req, res) => {
  let main = req.body.cmd;
  let response = req.body.res;
  append = {
    commandmain: main,
    res: response
  }
  commands.push(append)
});

app.get("/reset", (req, res) => {
  commands = [
    {
      commandmain: "help",
      res: "You can make yourself some commands here https://bot-page.sumedhzoting.repl.co/ and do !reload to reload the commands"
    },
    {
      commandmain: "sup",
      res: "Im bored how about you"
    },
    {
      commandmain: "howareyou",
      res: "im good"
    },
  ]
  res.send(commands)
  console.log(commands)
})

app.listen(8080, () => {
  console.log("server started")
})