import { world, system, Vector } from '@minecraft/server';

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    if (isBlockOn(player, 'minecraft:beacon')) {
      sell(player);
    }
  }
});

const items = new Map([
  ['dirt', 66],
  ['stone', 1],
  ['smooth_stone', 1]
]);

function sell(player) {
  const inv = inventory(player);
  const item = inv.items.find(i => items.has(i.name));
  if (!item) return;
  const totalPrice = item.amount * items.get(item.name);
  player.runCommandAsync(`scoreboard players add @s money ${totalPrice}`);
  player.runCommandAsync(`clear @s ${item.name} 0 ${item.amount}`);
  player.sendMessage(`§aYou sold ${item.amount} ${item.name} for ${totalPrice} cash!`);
}

function inventory(player) {
  const inv = player.getComponent('inventory').container;
  const itemObjects = Array.from({ length: 36 })
    .map((_, i) => inv.getItem(i))
    .filter(item => item)
    .reduce((accumulator, item) => {
      const name = item.nameTag || item.typeId.split(':')[1];
      const amount = item.amount;
      accumulator[name] = accumulator[name] ? { name, amount: accumulator[name].amount + amount } : { name, amount };
      return accumulator;
    }, {});
  return { items: Object.values(itemObjects) };
}

function isBlockOn(player, itemID) {
return player.dimension.getBlock(new Vector(player.location.x, player.location.y - 1, player.location.z)).typeId === itemID;
}