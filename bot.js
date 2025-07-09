// bot.js
import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // optional, safe to include
  ],
});

const token = process.env.DISCORD_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;

async function fetchDogePrice() {
  const response = await fetch('https://api.api-ninjas.com/v1/cryptoprice?symbol=DOGEUSD', {
    headers: { 'X-Api-Key': process.env.API_KEY },
  });

  if (!response.ok) throw new Error(`API error: ${response.statusText}`);

  const data = await response.json();
  return data.price.toFixed(4);
}

client.once('ready', async () => {
  try {
    console.log(`Logged in as ${client.user.tag}`);
    const price = await fetchDogePrice();
    const now = new Date().toUTCString();
    const channel = await client.channels.fetch(channelId);
    await channel.send(`📈 **Dogecoin Price:** $${price}\n📅 **Updated:** ${now}`);
  } catch (err) {
    console.error('❌ Error posting Doge price:', err.message);
  } finally {
    client.destroy();
  }
});

client.login(token);
