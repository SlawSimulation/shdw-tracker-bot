// post-message.js
import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const token = process.env.DISCORD_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;

async function fetchPrices() {
  // Fetch SHDW price in USD from CoinGecko
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=genesysgo-shadow&vs_currencies=usd');
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  console.log('SHDW price API response:', data);

  const priceUsd = Number(data["genesysgo-shadow"]?.usd);
  if (isNaN(priceUsd)) {
    throw new Error('Invalid SHDW price');
  }

  // Fetch USD to GBP exchange rate
  const exchangeResponse = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!exchangeResponse.ok) {
    throw new Error(`Exchange rate API error: ${exchangeResponse.status} ${exchangeResponse.statusText}`);
  }
  const exchangeData = await exchangeResponse.json();
  console.log('Exchange rate API response:', exchangeData);

  const usdToGbpRate = exchangeData.rates?.GBP;
  if (!usdToGbpRate) {
    throw new Error('GBP rate not found in exchange rate API response');
  }

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
      throw new Error('Channel not found');
    }

    await channel.send(
      `📈 **SHDW (Shadow Token) Price:**\n- USD: $${prices.usd}\n- GBP: £${prices.gbp}\n📅 **Updated:** ${now}`
    );

    console.log('Message sent successfully');
  } catch (err) {
    console.error('❌ Error posting SHDW price:', err.message);
  } finally {
    client.destroy();
  }
});

client.login(token);
