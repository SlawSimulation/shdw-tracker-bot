// post-message.js
import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const token = process.env.DISCORD_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;

async function fetchPrices() {
  // same fetchPrices function as before ...
}

client.once('ready', async () => {
  try {
    console.log(`Logged in as ${client.user.tag}`);
    const prices = await fetchPrices();
    const now = new Date().toUTCString();
    const channel = await client.channels.fetch(channelId);

    if (!channel) throw new Error('Channel not found');

    await channel.send(
      `📈 **Dogecoin Price:**\n- USD: $${prices.usd}\n- GBP: £${prices.gbp}\n📅 **Updated:** ${now}`
    );
    console.log('Message sent successfully');
  } catch (err) {
    console.error('❌ Error posting Doge price:', err.message);
  } finally {
    client.destroy();
  }
});

client.login(token);
