require('dotenv').config()
const { Client, GatewayIntentBits, EmbedBuilder, Routes } = require('discord.js');
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8082 });
const ColorThief = require('color-extr-thief');
const fetch = require("cross-fetch");
const mineflayer = require('mineflayer')
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals
var profanityfinder = require('profanity-finder');
var findprofanity = profanityfinder.findprofanity;
const wash = require('washyourmouthoutwithsoap'); // false

owner = "blessss"

let badusers = []
let maxwarning = 5;
let maxreports = 4;
let onewrdlen = 2;

wordreports = []

let addcmdmain;
let rescmd;
let serverprefix = "{server}";
let wsmain;
let users = [];
let prefix = "!";
let bot;
let argsreuse;
let pvport = 3007;
const fs = require('fs');
const { workerData } = require('worker_threads');
const { stringify } = require('querystring');

onewords = []
onemessages = []

var text = fs.readFileSync("./bad.txt", "utf-8");
var textByLine = text.split("\n")

var exclude = fs.readFileSync("./excludelist.txt", "utf-8");
var excludebyline = exclude.split("\n")

console.log(excludebyline)

function detectbadword(q, m) {
  if (q.replace("!", "").length <= onewrdlen) {
    onewords.push(q.replace("!", ""))
    onemessages.push(m);
    if (textByLine.includes(onewords.join('') + "\r")) {
      console.log("removing")
      w = 0;
      onewords = []
      while (w != onemessages.length) {
        onemessages[w].delete()
        w = w + 1
      }
      onemessages = []
      return false;
    }
  }
  if (textByLine.includes(getargs(q)[0] + "\r") || findprofanity(q) || textByLine.includes(getargs(q)[1] + "\r") || textByLine.includes(q.replaceAll(".", "")) || textByLine.includes(getargs(q)[0].replaceAll(",", "")) || wash.check("en", q)) {
    return true;
  }
}

async function checkbadmsg(m) {

  if (m.author.username == owner) { return; }

  i = 0
  if (getargs(m.content).length > 1) {
    while (getargs(m.content).length != i) {
      if (excludebyline.includes(getargs(m.content)[i] + "\r")) {
        return;
      }
      i = i + 1
    }
  }

  sliceed = m.content.replaceAll(".", "")
  sliceed = sliceed.replaceAll(",", "")
  sliceed = sliceed.replaceAll(" ", "")

  fetch("http://127.0.0.1:5500/?q=" + m.content)
    .then((response) => response.json())
    .then((responsedata) => {
      console.log("word:" + m.content + " results:" + responsedata.results + " detection:" + responsedata.detection)
      if (detectbadword(sliceed, m) && m.author.username != owner && m.author.username != "Bless's Bot" || responsedata.detection) {
        obj = badusers.find(({ user }) => user === m.author.username);
        if (obj != null) {
          obj.times = obj.times + 1
          if (obj.times >= maxwarning) {
            try {
                senddm(m.author.username, "Stop fking spam")
            } catch (error) {

            }
          }
        }
        else {
          push = {
            "user": m.author.username,
            "times": 1
          }
          badusers.push(push);
        }
        try {

        } catch (error) {

        }
        m.delete()
        console.log(badusers)
      }
    });
}
wss.on("connection", ws => {
  wsmain = ws
  console.log("New Client connected")
  ws.send(JSON.stringify(users));
  ws.on("message", data => {
    main = JSON.parse(data)
    returns = senddm(main.tosend, main.msg)
    if (returns == "User Not Found") {
      ws.send("Not Found")
    }
  })
})

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.GuildIntegrations
  ],
});

client.login(process.env.TOKEN);
const ping = {
  name: 'ping',
  description: 'Pings the bot and shows the latency'
};
// For discord badge
const command2 = {
  name: 'command2',
  description: 'yes'
}
const commandsh = [ping, command2];
client.rest.put(Routes.applicationCommands("1055828626068746311"), { body: commandsh });

let commands = getcommands()

client.once('ready', () => {
  console.log("started");
  getmembers()
});

client.on("messageCreate", message => {
  if (message.author.bot) return;
  checkmsg(message)
  checkbadmsg(message)
})

client.on('interactionCreate', (interaction) => {
  if (interaction.commandName === 'ping') {
    interaction.reply(`Latency is ${Date.now() - interaction.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
  } else if (interaction.commandName === 'command2') { // This is the example command's name!
    interaction.reply('example command');
  } else { // a response if you forget to add the command here
    interaction.reply('this command\'s response has not been added yet!');
  }
});

async function getcommands() {
  res = ""
  await fetch('http://localhost:8080/commands')
    .then((response) => response.json())
    .then((data) => res = data);
  commands = res
}

async function checkmsg(message) {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();
  obj = commands.find(obj => obj.commandmain === command)
  if (obj !== undefined) {
    if (command === obj.commandmain) {
      message.channel.send(obj.res);
    }
  }
  else if (command === "ping") {
    let ping = `🏓Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`
    message.channel.send(ping);
  }
  else if (command === "say") {
    let say = getargs(message)[1]
    message.channel.send(say)
  }
  else if (command === "reload") {
    getcommands()
    message.channel.send("Reloaded")
  }
  else if (command === "resetcmds") {
    fetch("http://localhost:8080/reset")
    getcommands()
    message.channel.send("reset complete")
  }
  else if (command === "addcmd") {
    addcmdmain = getargs(message)[1];
    message.channel.send("Now u can set the response by doing !setres")
  }
  else if (command === "setres") {
    rescmd = getargs(message)[1]
    fetch("http://localhost:8080/add", {

      // Adding method type
      method: "POST",

      // Adding body or contents to send
      body: JSON.stringify({
        cmd: addcmdmain,
        res: rescmd,
      }),

      // Adding headers to the request
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
    await getcommands()
    message.channel.send("Done")
  }
  else if (command === "subs") {
    paramid = getargs(message);
    paraml = paramid.length;
    let dta;
    let stats;
    let channel;
    let id;
    async function run() {
      if (paramid[1] === prefix+"subs") {
        message.channel.send("Usage: "+prefix+"subs Video_Id");
        return;
      }
      await fetch('https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=' + paramid[1]+" "+paramid[2] + '&key=AIzaSyAoN5gPM1ppLrD-ttW70f0KK4HOtRJvn3E')
        .then((response) => response.json())
        .then((data) => channel = data);
      let channelid;

      channel.items.map(data => {
        channelid = data.id.channelId
      })

      await fetch("https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=" + channelid + "&key=AIzaSyAoN5gPM1ppLrD-ttW70f0KK4HOtRJvn3E")
        .then((response) => response.json())
        .then((data) => dta = data);
      await fetch('https://youtube.googleapis.com/youtube/v3/channels?part=statistics&id=' + channelid + '&key=AIzaSyAoN5gPM1ppLrD-ttW70f0KK4HOtRJvn3E')
        .then((response) => response.json())
        .then((data) => stats = data);
      let mapped;
      let stat;
      if (dta.pageInfo.totalResults == 0) {
        message.channel.send("Couldn't find Channel " + paramid[1])
        return;
      };
      dta.items.map(data => {
        mapped = data
      })
      stats.items.map(data => {
        stat = data
      })

      let colour;
      ColorThief.getColor(mapped.snippet.thumbnails.default.url)
        .then(color => {
          colour = rgbToHex(color[0], color[1], color[2])
          send(mapped, stat, colour.toString().toUpperCase());
        })
        .catch(err => { })

      function send(mapped, stat, colour) {
        message.channel.send({ embeds: [Embed(mapped, stat, colour)] })
      }
    }
    run()
  }
  else if (command == "role") {
    argsrole = getargs(message.content);
    role = getargs(message.content)[3]
    if (argsrole[2] == "add") {
      add()
    }
    if (argsrole[2] == "remove") {
      remove()
    }
    function add() {
      try {
        let role = message.guild.roles.cache.find(r => r.name === argsrole[3]);
        let member = message.mentions.members.first();
        member.roles.add(role).catch(console.error);
      } catch (error) {
        console.log(error)
      }
    }
    function remove() {
      try {
        let role = message.guild.roles.cache.find(r => r.name === argsrole[3]);
        let member = message.mentions.members.first();
        member.roles.remove(role).catch(console.error);
      } catch (error) {
        console.log(error)
      }
    }
  }
  else if (command == "summon") {
    bot = mineflayer.createBot({
      host: getargs(message)[1], // minecraft server ip
      username: getargs(message)[2], // minecraft username
      port: getargs(message)[3],                // only set if you need a port that isn't 25565
      // version: false,             // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
      // auth: 'mojang'      // only set if you need microsoft auth, then set this to 'microsoft'
    })
    bot.loadPlugin(pathfinder)
  }
  else if (command == "bot.chat") {
    argumentss = getargs(message)
    bot.chat(argumentss[1]);
  }
  else if (command == "bot.viewer"){
    argumentss = getargs(message)
    mineflayerViewer(bot, { port: pvport, firstPerson: true }) // port is the minecraft server port, if first person is false, you get a bird's-eye view
    message.channel.send("Bot-Viewer is live on port:" + pvport)
  }
  else if (command == "cometo") {
    argsreuse = getargs(message);

    const defaultMove = new Movements(bot)
    const target = bot.players[argsreuse[1]] ? bot.players[argsreuse[1]].entity : null

    if (!target) {
      bot.chat('I don\'t see you !')
      return
    }
    const p = target.position

    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))
  }
  else if (command == "report") {
    obj = wordreports.find(({ word }) => word === getargs(message)[1]);
    console.log(obj)
    if (obj != null) {
      obj.reports = obj.reports + 1
      if (obj.reports >= maxreports) {
        textByLine.push(getargs(message)[1] + "\r")
      }
    }
    else {
      push = {
        "word": getargs(message)[1],
        "reports": 1
      }
      wordreports.push(push);
    }
    console.log(wordreports)
  }
  else if (command == "owner") {
    arrgs = getargs(message.content)
    owner = arrgs[1]
  }
}

function senddm(tosend, msg) {
  if (tosend.toString().includes("{id}")) {
    main = tosend.replace("{id}:", "")
    client.users.fetch(main, false).then((user) => {
      try {
        user.send(msg);
      } catch (error) {

      }
    });
  }
  if (tosend.includes(serverprefix)) {
    var botChannel = client.channels.cache.get(getargs(tosend)[1]);
    botChannel.send(msg.toString())
    return;
  }
  const result = users.find(({ name }) => name === tosend);
  if (result != null) {
    const id = result.id.toString()
    client.users.fetch(id, false).then((user) => {
      try {
        user.send(msg);
      } catch (error) {

      }
    });
  }
  else if (result == null && tosend != serverprefix && !tosend.includes("{id}")) {
    return "User Not Found";
  }
}

function getmembers() {
  const guild = client.guilds.cache.get('929972178210943007');
  // Fetch and get the list named 'mconsoleembers'
  guild.members.fetch().then(members => {
    // Loop through every members
    members.forEach(member => {
      array = {
        name: member.user.username,
        id: member.user.id
      }
      users.push(array)
    });
  });
}

function Embed(mapped, stat, colour) {
  const exampleEmbed = new EmbedBuilder()
    .setColor(colour)
    .setTitle(mapped.snippet.title)
    .setURL("https://youtube.com/channel/" + paramid[1])
    .setAuthor({ name: mapped.snippet.title, iconURL: mapped.snippet.thumbnails.default.url, url: "https://youtube.com/channel/" + mapped.snippet.id })
    .setDescription(mapped.snippet.description)
    .setThumbnail(mapped.snippet.thumbnails.default.url)
    .addFields(
      { name: 'Subscribers', value: abbreviateNumber(stat.statistics.subscriberCount), inline: true },
      { name: 'Total View Count', value: abbreviateNumber(stat.statistics.viewCount), inline: true },
      { name: 'debug', value: stat.toString(), inline: false}
    )
    .setImage(mapped.snippet.thumbnails.default.url)
    .setTimestamp()
  return exampleEmbed;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var SI_SYMBOL = ["", " k", " M", " B", " T", " P", " E"];

function abbreviateNumber(number) {

  // what tier? (determines SI symbol)
  var tier = Math.log10(Math.abs(number)) / 3 | 0;

  // if zero, we don't need a suffix
  if (tier == 0) return number;

  // get suffix and determine scale
  var suffix = SI_SYMBOL[tier];
  var scale = Math.pow(10, tier * 3);

  // scale the number
  var scaled = number / scale;

  // format number and add suffix
  return scaled.toFixed(1) + suffix;
}

function getargs(s) {
  strging = s.toString()
  split = strging.split(' ');
  return split
}