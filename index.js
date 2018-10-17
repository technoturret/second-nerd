// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform
// you.

// REDIS ***NEEDS*** A CALLBACK FUNCTION
if (process.version.slice(1).split(".")[0] < 8) throw new Error("Node 8.0.0 or higher is required. Update Node on your system.");

// Load up the discord.js library
const Discord = require("discord.js");
const express = require("express");
const http = require('http')
var app = express();
var key = process.env.key
// We also load the rest of the things we need in this file:
const { promisify } = require("util");
const cleverbot = require('cleverbot.io')
const ordinal = require('ordinal-js')


// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`,
// or `bot.something`, this is what we're refering to. Your client.
const client = new Discord.Client();


// Here we load the config file that contains our token and our prefix values.
client.config = require("./config.js");
client.config.prefix = ">"
// client.config.token contains the bot's token
// client.config.prefix contains the message prefix

// Require our logger
client.logger = require("./util/Logger");


// Let's start by getting some useful functions that we'll use throughout
// the bot, like logs and elevation features.
require("./modules/functions.js")(client);

app.set('env', 'production')
app.use(bodyParser.json())
app.listen(process.env.PORT || 3000, function() {
  console.log("Running on port " + process.env.PORT)
})

client.lastCommand = "None"

client.cleverbot = new cleverbot(process.env.cbname, process.env.cbkey)
client.cleverbot.setNick("Main Session")

// Aliases and commands are put in collections where they can be read from,
// catalogued, listed, etc.
client.commands = new Enmap();
client.aliases = new Enmap();


// set up redis
// We're doing real fancy node 8 async/await stuff here, and to do that
// we need to wrap stuff in an anonymous function. It's annoying but it works.

const init = async () => {
   // Roblox.post(4044556, "Second test: Hello world!")
  // Here we load **commands** into memory, as a collection, so they're accessible
  // here and everywhere else.
  const cmdFiles = await readdir("./commands/");
  client.logger.log(`Loading a total of ${cmdFiles.length} commands.`);
  //client.startChannel.send(`${cmdFiles.length} commands were loaded`)
  cmdFiles.forEach(f => {
    if (!f.endsWith(".js")) return;
    const response = client.loadCommand(f);
    if (response) console.log(response);
  });

  // Then we load events, which will include our message and ready event.
  const evtFiles = await readdir("./events/");
  client.logger.log(`Loading a total of ${evtFiles.length} events.`);
  evtFiles.forEach(file => {
    const eventName = file.split(".")[0];
    const event = require(`./events/${file}`);
    // This line is awesome by the way. Just sayin'.
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
  });




  // Generate a cache of client permissions for pretty perms
  client.levelCache = {};
  for (let i = 0; i < client.config.permLevels.length; i++) {
    const thisLevel = client.config.permLevels[i];
    client.levelCache[thisLevel.name] = thisLevel.level;
  }


  // Here we login the client.
  client.login(process.env.BOT_TOKEN);


// End top-level async/await function

};

init();
//await client.collection.defer;
//console.log(client.collection.size + " keys were loaded")
