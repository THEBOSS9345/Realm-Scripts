import { world } from '@minecraft/server';
import { commandDatabase } from './Chat_Commands';

world.beforeEvents.chatSend.subscribe((data) => {
  const { message, sender: player } = data;
  if (!message.startsWith(commandPrefix)) return;
  data.cancel = true;
  const commandString = message.slice(commandPrefix.length).trim();
    const hasPermission = (tags) => tags.some(permission => player.hasTag(permission));
  const matchedCommand = commandDatabase.find(({ command, alias }) => {
    const cmdRegex = new RegExp(`^${command}(\\s|$)`, 'i');
    return cmdRegex.test(commandString) || (alias && alias.some(a => new RegExp(`^${a}(\\s|$)`, 'i').test(commandString)));
  });
  if (matchedCommand && (!matchedCommand.permissions || hasPermission(matchedCommand.permissions))) {
    const args = commandString.slice(matchedCommand.command.length).trim();
    matchedCommand.callback(player, args);
    return;
  }
  player.sendMessage(`§cUnknown command: ${commandString}, Please check that the command exists and that you have permission to use it.`);
});
