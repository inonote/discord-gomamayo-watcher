import { Client, EmbedBuilder } from "discord.js";
import { db } from "./database/DatabaseClient";

const reactedMessageCache = new Map<string, true>();

export function registerReactionHandler(client: Client) {
  client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.message.guildId === null) {
      console.error("ERR: reaction.message.guildId === null");
      return;
    }

    // 既にに反応した絵文字
    if (reactedMessageCache.has(reaction.message.id)) {
      return;
    }

    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error("ERR: リアクション取得に失敗", error);
        return;
      }
    }

    if (user.bot) return;

    // 既に反応したメッセージは無視
    const targetEmojis = await db.getReactionEmojis(reaction.message.guildId);
    if (!targetEmojis.some((x) => x === reaction.emoji.name)) return;

    const ignoreChannelIds = await db.getIgnoreChannels(
      reaction.message.guildId,
    );
    if (ignoreChannelIds.some((x) => x === reaction.message.channelId)) return;

    const reportChannelId = await db.getReportChannel(reaction.message.guildId);
    if (!reportChannelId) {
      console.error("ERR: reportChannelId === null");
      return;
    }

    const channel = await client.channels.fetch(reportChannelId);
    if (!channel) {
      console.error(`ERR: 報告チャンネルが未設定: ${reaction.message.guildId}`);
      return;
    }

    if (!channel.isTextBased() || !channel.isSendable()) {
      console.error(
        `ERR: チャンネルがテキスト送信可能ではない: ${reaction.message.guildId}/${reportChannelId}`,
      );
      return;
    }

    reactedMessageCache.set(reaction.message.id, true);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: reaction.message.author
          ? `${reaction.message.author.displayName} @${reaction.message.author.username}`
          : "(unknown author)",
        iconURL: (reaction.message.author
          ? reaction.message.author.displayAvatarURL()
          : undefined) as string,
      })
      .setDescription(reaction.message.content || "(本文はありません)")
      .setTimestamp(reaction.message.createdAt)
      .setURL(reaction.message.url);

    try {
      channel.send({ content: "ゴママヨ発見！", embeds: [embed] });
    } catch (e) {
      console.error(`ERR: 送信失敗: ${reaction.message.guildId}`, e);
    }
  });
}
