import 'dotenv/config';
import { REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Command } from './types/command';

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = require(filePath).default as Command;
    commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN || '');

(async () => {
    try {
        console.log('Début du déploiement des commandes slash...');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID || ''),
            { body: commands },
        );

        console.log('Les commandes slash ont été déployées avec succès!');
    } catch (error) {
        console.error('Erreur lors du déploiement des commandes:', error);
    }
})();