import { world } from '@minecraft/server';
import { commandDatabase } from './Chat_Commands';

world.beforeEvents.chatSend.subscribe((data) => {
  const { message, sender: player } = data;
  if (!message.startsWith('.')) return;
  data.cancel = true;
  const args = message.slice(1).trim().split(' ');
  const commandName = args.shift();
  const command = commandDatabase.find(({ command, alias }) => command === commandName || (alias && alias.includes(commandName)));
  const hasPermission = (tags) => tags.some(permission => player.hasTag(permission));
  if (command && (!command.permissions || hasPermission(command.permissions))) {
    command.callback(player, args.join(' '));
    return;
  }
  player.sendMessage('Unknown command or insufficient permissions.');
});