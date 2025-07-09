// bot.js
import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const token = process.env.DISCORD_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;

async function fetchPrices() {
  // Dogecoin price (using your API_KEY secret)
  const response = await fetch('https://api.api-ninjas.com/v1/cryptoprice?symbol=DOGEUSD', {
    headers: { 'X-Api-Key': process.env.API_KEY },
  });
  if (!response.ok) throw new Error(`Crypto API error: ${response.statusText}`);
  const data = await response.json();
  console.log('Doge price API response:', data);

  const priceUsd = Number(data.price);
  if (isNaN(priceUsd)) throw new Error('Price is not a valid number');

  // USD to GBP exchange rate (no API key required)
  const exchangeResponse = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!exchangeResponse.ok) throw new Error(`Exchange rate API error: ${exchangeResponse.statusText}`);
  const exchangeData = await exchangeResponse.json();
  console.log('Exchange rate API response:', exchangeData);

  const usdToGbpRate = exchangeData.rates.GBP;
  if (!usdToGbpRate) throw new Error('GBP rate not found in exchange data');

  const priceGbp = priceUsd * usdToGbpRate;

  return {
    usd: priceUsd.toFixed(4),
    gbp: priceGbp.toFixed(4),
  };
}

client.once('ready', async () => {
  try {
    console.log(`Logged in as ${client.user.tag}`);
    const prices = await fetchPrices();
    const now = new Date().toUTCString();
    const channel = await client.channels.fetch(channelId);

    if (!channel) {
      console.error('Channel not found!');
      return;
    }

    await channel.send(
      `📈 **Dogecoin Price:**\n` +
      `- USD: $${prices.usd}\n` +
      `- GBP: £${prices.gbp}\n` +
      `📅 **Updated:** ${now}`
    );

    console.log('Message sent successfully');
  } catch (err) {
    console.error('❌ Error posting Doge price:', err.message);
  } finally {
    client.destroy();
  }
});

client.login(token);
