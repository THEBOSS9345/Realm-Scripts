import { Player } from '@minecraft/server';
/**
 * @typedef {Object} Command
 * @property {string} command - The command name.
 * @property {string} description - The command description.
 * @property {string[]} alias - The command aliases.
 * @property {string[]} [permissions] - The required permissions to use the command.
 * @property {(player: Player, args: string) => void} callback - The callback function for the command.
 * @property {Player} player - The player associated with the command.
 * @property {string} args - Additional arguments associated with the command.
 */

/**
 * An array that represents the database of commands.
 * Each element in the array is a command with its properties.
 * @type {Command[]}
 */
export const commandDatabase = [  
  {
    command: 'help',
    description: 'Shows a list of available commands.',
    alias: ['h'],
    callback: (player) => {
      const helpMessage = commandDatabase
        .filter(command => !command.permissions || playerHasPermissions(player, command.permissions))
        .map(command => `----------------\nCommand: ${command.command}\nAliases: ${command.alias ? command.alias.join(', ') : 'No Alias'}\nDescription: ${command.description ? command.description : 'No description'}\n-----------------`)
        .join('\n');
      player.sendMessage(`Available commands:\n${helpMessage}`);
    }
  },  
  {
    command: 'warp',
    alias: ['wa'],
    callback: function (player, args) {
      const tps = {
        NovaCity: '1 1 1',
        Florance: '9 9 9', 
      };
      if (!tps[args]) return player.sendMessage(`Type The right name .warp <name>`);
      if (!player.hasTag(args)) return player.sendMessage(`You Cant Go to ${args}`)
      const destination = tps[args].split(' ');
      const coordinates = destination.map(parseFloat);
      player.runCommandAsync(`tp @s ${coordinates[0]} ${coordinates[1]} ${coordinates[2]}`);
      player.sendMessage(`Teleported to ${args}`);
    }
  }
];
/**
 * Check if the player has the required permissions to use a command.
 * @param {Player} player - The player to check permissions for.
 * @param {string[]} requiredPermissions - The array of required permissions.
 * @returns {boolean} - True if the player has all the required permissions, false otherwise.
 */
function playerHasPermissions(player, requiredPermissions) {
  return requiredPermissions.every(permission => player.hasTag(permission));
}

function formatNum(number) {
  const SI_SYMBOL = ["", "k", "M", "B", "T", "P", "E"];
  const tier = Math.log10(Math.abs(number)) / 3 | 0;
  if (tier == 0) return number;
  return (number / Math.pow(10, tier * 3)).toFixed(1) + SI_SYMBOL[tier];
}