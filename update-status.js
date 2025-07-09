// update-status.js
import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const token = process.env.DISCORD_TOKEN;

async function fetchPrices() {
  // same fetchPrices function as before ...
}

client.once('ready', async () => {
  try {
    console.log(`Logged in as ${client.user.tag}`);

    const prices = await fetchPrices();
    const statusMessage = `Dogecoin Price: USD $${prices.usd} | GBP £${prices.gbp}`;
    await client.user.setActivity(statusMessage, { type: 'WATCHING' });

    console.log(`Status set to: ${statusMessage}`);
  } catch (err) {
    console.error('❌ Error updating status:', err.message);
  } finally {
    client.destroy();
  }
});

client.login(token);
