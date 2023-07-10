import { Player } from '@minecraft/server';
import { codeUsageMap } from './index';
/**
 * @typedef {Object} Command
 * @property {string} code - The code name.
 * @property {string} description - The code description.
 * @property {string[]} [permissions] - The required permissions to use the code.
 * @property {number} maxUsesPerPlayer - The maximum number of times each player can use the code.
 * @property {(player: Player, args: string) => void} callback - The callback function for the code.
 * @property {Player} player - The player associated with the code.
 */

/**
 * An array that represents the database of commands.
 * Each element in the array is a command with its properties.
 * @type {Command[]}
 */

export const database = [
    {
        code: 'help',
        description: 'Displays available commands and their descriptions.',
        callback: function (player) {
            player.sendMessage('Available commands:');
            database.forEach(command => {
                const { code, description, maxUsesPerPlayer, permissions } = command;
                if (!permissions || permissions.some(permission => player.hasTag(permission))) {
                    const playerUsageCount = codeUsageMap.get(code) || 0;
                    player.sendMessage(`- ${code}: ${description}`);
                    player.sendMessage(`  Max Uses per Player: ${maxUsesPerPlayer ? maxUsesPerPlayer : 'unlimited'}`);
                    player.sendMessage(`  Players Used: ${playerUsageCount}`);
                }
            });
        }
    },
    {
        code: 'minecraft',
        description: 'This Code ......',
        maxUsesPerPlayer: 2,
        callback: function (player) {
            player.sendMessage('test');
        }
    }
];
