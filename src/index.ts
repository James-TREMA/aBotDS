import 'dotenv/config';
import { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    Collection,
    ButtonInteraction,
    ChatInputCommandInteraction
} from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { handleTickets } from './handlers/ticketHandler';
import { Command } from './types/command';

declare module 'discord.js' {
    export interface Client {
        commands: Collection<string, Command>;
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel],
});

client.commands = new Collection<string, Command>();
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = require(filePath).default as Command;
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user?.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        const buttonHandler = client.commands.get('openticket')?.handleButton;
        if (buttonHandler) {
            try {
                await buttonHandler(interaction as ButtonInteraction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ 
                    content: 'Une erreur est survenue lors du traitement du bouton.',
                    ephemeral: true 
                });
            }
        }
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction as ChatInputCommandInteraction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ 
            content: 'Une erreur est survenue lors de l\'exécution de la commande.',
            ephemeral: true 
        });
    }
});

client.on('messageCreate', async (message) => {
    await handleTickets(message, client);
});

client.login(process.env.DISCORD_TOKEN);