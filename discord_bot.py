import os
import json
import asyncio
import discord
from discord.ext import commands
from discord import app_commands

CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

config = load_config()
TOKEN = config.get("discord_bot_token", "")

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"✅ Bot ^ON1PL^ zalogowany jako: {bot.user} (ID: {bot.user.id})")
    try:
        synced = await bot.tree.sync()
        print(f"🔄 Zsynchronizowano {len(synced)} komend slash.")
    except Exception as e:
        print(f"Błąd synchronizacji komend: {e}")
    await bot.change_presence(activity=discord.Game(name="War Thunder (^ON1PL^ SQB)"))

# --- SLASH COMMANDS ---

@bot.tree.command(name="sqb", description="Informacje o SQB i zasadach dywizjonu ^ON1PL^")
async def cmd_sqb(interaction: discord.Interaction):
    embed = discord.Embed(
        title="⚔️ Sprawdziany Dywizjonowe (SQB) — ^ON1PL^",
        description="Główny cel dywizjonu to walka o topowe pozycje w rankingu SQB!",
        color=0xe74c3c
    )
    embed.add_field(name="⏰ Godziny SQB (Europe)", value="Codziennie: 15:00 - 23:00 / 01:00 CEST", inline=False)
    embed.add_field(name="📋 Wymagania", value="• Min. maszyny na bieżący BR\n• Aktywność na Discordzie i mikrofon\n• Komunikacja i gra zespołowa", inline=False)
    embed.add_field(name="📊 Statystyki SQB", value="[StatShark](https://statshark.net/) | [Toothless SRE](https://sre.pawjob.us/)", inline=False)
    embed.set_footer(text="^ON1PL^ • Zawsze razem, zawsze po zwycięstwo")
    await interaction.response.send_message(embed=embed)

@bot.tree.command(name="rekrutacja", description="Szablon rekrutacyjny dywizjonu ^ON1PL^")
async def cmd_rekrutacja(interaction: discord.Interaction):
    embed = discord.Embed(
        title="🛡️ Rekrutacja do dywizjonu ^ON1PL^",
        description="Szukamy aktywnych pilotów i czołgistów pod Sprawdziany Dywizjonowe!",
        color=0x3498db
    )
    embed.add_field(name="Oferujemy", value="• Zgraną ekipę do SQB i bitew klanowych\n• Doświadczonych dowódców\n• Luźną, dojrzałą atmosferę bez kija w d...", inline=False)
    embed.add_field(name="Oczekujemy", value="• Zaangażowania w mecze dywizjonowe\n• Kultury osobistej i słuchania rozkazów\n• Chęci rozwoju i podnoszenia skilla", inline=False)
    embed.set_footer(text="Link do Discorda w komentarzu i bio • ^ON1PL^")
    await interaction.response.send_message(embed=embed)

@bot.tree.command(name="arkusz", description="Link do arkusza Google dywizjonu ^ON1PL^")
async def cmd_arkusz(interaction: discord.Interaction):
    sheet_url = config.get("sheet_url", "https://docs.google.com/spreadsheets/d/1KcHjmev34Xtp9oxnQJTHVaU2acvkaYY_kAGelEX_Nuo/edit")
    embed = discord.Embed(
        title="📊 Główny Arkusz Dywizjonu ^ON1PL^",
        description=f"[Kliknij tutaj, aby otworzyć arkusz w Google Sheets]({sheet_url})",
        color=0x2ecc71
    )
    await interaction.response.send_message(embed=embed, ephemeral=True)

@bot.tree.command(name="staty", description="Linki do statystyk SQB i dywizjonu")
@app_commands.describe(nick="Nick gracza w War Thunder (opcjonalnie)")
async def cmd_staty(interaction: discord.Interaction, nick: str = None):
    if nick:
        url = f"https://statshark.net/player/{nick}"
        desc = f"Sprawdź statystyki gracza **{nick}** na StatShark: [Profil gracza]({url})"
    else:
        desc = "• [StatShark Analytics](https://statshark.net/)\n• [Toothless SRE Bot Tracker](https://sre.pawjob.us/)"
    
    embed = discord.Embed(
        title="📈 Statystyki War Thunder",
        description=desc,
        color=0x9b59b6
    )
    await interaction.response.send_message(embed=embed)

if __name__ == "__main__":
    if not TOKEN:
        print("❌ Brak tokenu bota w config.json! Wpisz 'discord_bot_token'.")
    else:
        try:
            bot.run(TOKEN)
        except Exception as e:
            print(f"❌ Błąd uruchamiania bota: {e}")
