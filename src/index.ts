import {
  Client,
  GatewayIntentBits,
  InteractionType,
  Partials,
} from "discord.js";
import { env, exit } from "node:process";
import { CommandRouter } from "./commands/CommandRouter";
import { SetReportChannelCommand } from "./commands/SetReportChannelCommand";
import { db } from "./database/DatabaseClient";
import { registerReactionHandler } from "./reaction-handler";
import { SetReactionEmojisCommand } from "./commands/SetReactionEmojis";
import { GetConfigCommand } from "./commands/GetConfigCommand";
import { SetIgnoreChannelsCommand } from "./commands/SetIgnoreChannelsCommand";

if (env.DISCORD_TOKEN === undefined || env.DISCORD_CLIENT_ID === undefined) {
  console.error("ERR: トークンが .env に指定されていない");
  exit(1);
}

db.init();

// クライアントの初期化
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [
    Partials.GuildMember,
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
  ],
});

// スラッシュ コマンド登録
const commandRouter = new CommandRouter(
  client,
  env.DISCORD_TOKEN,
  env.DISCORD_CLIENT_ID,
);
commandRouter.registerCommands([
  new SetReportChannelCommand(),
  new SetReactionEmojisCommand(),
  new SetIgnoreChannelsCommand(),
  new GetConfigCommand(),
]);

client.once("ready", async () => {
  console.log("INF: ready");
  await commandRouter.deploy(env.DISCORD_DEV_GUILD_ID);
});

client.on("interactionCreate", async (interaction) => {
  if (
    interaction.type === InteractionType.ApplicationCommand &&
    interaction.isChatInputCommand()
  ) {
    await commandRouter.handleInteraction(interaction);
  }
});

registerReactionHandler(client);

client.login(env.DISCORD_TOKEN);
