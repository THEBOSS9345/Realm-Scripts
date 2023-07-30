import { world, system, ItemStack, Vector, ItemDurabilityComponent, EnchantmentTypes, Enchantment, EquipmentSlot, EntityEquipmentInventoryComponent, EnchantmentList, EnchantmentType } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';

const database = new Map();

const handleInterval = () => {
  for (const player of world.getAllPlayers()) {
    const attackKey = `attack ${player.name}`;
    if (database.has(attackKey)) {
      player.addTag('clear test');
      const value = database.get(attackKey) - 1;
      if (value === 0) {
        database.delete(`inv ${player?.name}`);
        database.delete(attackKey);
        player.removeTag('clear test');
      } else {
        database.set(attackKey, value);
      }
      player.onScreenDisplay.setActionBar(`Timer: ${database.get(attackKey) || 0}`);
      database.get(`inv ${player.name}`)[0].items.forEach(e => {
         console.warn(e.typeId, e.amount, e.enchants.level)
      })
    }
  }
} 

const handleInterval2 = () => {
  for (const player of world.getAllPlayers()) {
    const attackKey = `attack ${player.name}`;
    if (database.has(attackKey)) {
      database.set(`inv ${player.name}`, [inventory(player), player.location]);
    }
  }
}

const inventory = (player) => {
  /**@type {EntityEquipmentInventoryComponent} */
  const equipment = player.getComponent('equipment_inventory');
  const armorSlots = ['offhand', 'head', 'chest', 'legs', 'feet'];
  const itemData = { items: [] };
  const armorItems = armorSlots
    .map(slot => equipment.getEquipment(slot))
    .filter(item => item && item.typeId !== 'undefined')
    .map(item => {
      return {
        typeId: item.typeId,
        amount: item.amount,
        enchants: [{ id: item.getComponent('enchantments').id, level: item.getComponent('enchantments').level }]
      };
    });

  const inv = player.getComponent('inventory').container;
  const itemObjects = Array.from({ length: 36 })
    .map((_, i) => inv.getItem(i))
    .filter(item => item)
    .reduce((accumulator, item) => {
      const typeId = item.nameTag || item.typeId.split(':')[1];
      const amount = item.amount;
      accumulator[typeId] = {
        typeId,
        amount,
        enchants: storeItem(item)
      };
      return accumulator;
    }, {});

  itemData.items.push(...Object.values(itemObjects), ...armorItems);

  return itemData;
};



const eventHandlers = {
  entityHitEntity: ({ damagingEntity: entity, hitEntity }) => {
    if (entity?.typeId?.includes('minecraft:player') && hitEntity?.typeId.includes('minecraft:player')) {
      database.set(`attack ${entity?.name}`, 11);
      database.set(`attack ${hitEntity?.name}`, 11);
    }
  },
  playerLeave: ({ playerName }) => {
    const attackKey = `attack ${playerName}`;
    if (database.has(attackKey)) {
      console.warn('Player has left the game');
      const [invItems, playerLocation] = database.get(`inv ${playerName}`);
      if (invItems && playerLocation) {
        for (const item of invItems.items) {
          const itemStack = new ItemStack(item.typeId, item.amount);
          const durability = itemStack.getComponent('minecraft:durability');
          if (item.durability) {
            durability.maxDurability = item.durability;
          }
          world.getDimension('overworld').spawnItem(itemStack, new Vector(...Object.values(playerLocation)));
        }
      }
      database.delete(`inv ${playerName}`);
      database.delete(attackKey);
    }
  },
  entityDie: ({ deadEntity: player }) => {
    const attackKey = `attack ${player.name}`;
    if (database.has(attackKey)) {
      database.delete(`inv ${player.name}`);
      database.delete(attackKey);
      player.removeTag('clear test');
    }
  },
  playerSpawn: ({ player, initialSpawn }) => {
    if (initialSpawn && player.hasTag('clear test')) {
      console.warn('Player has joined the game');
      player.runCommandAsync('clear @s');
      player.sendMessage('Your inventory has been cleared');
      player.removeTag('clear test');
    }
  }
};

Object.entries(eventHandlers).forEach(([eventName, eventHandler]) => {
  world.afterEvents[eventName].subscribe(eventHandler);
});
system.runInterval(handleInterval, 20);
system.runInterval(handleInterval2);

function storeItem(item) {
  const itemData = {
    enchantments: [],
  };
  const enchants = item?.getComponent('enchantments')?.enchantments;
  
  if (enchants) {
    for (let enchant of enchants) {
      if (!enchant) continue;
      itemData.enchantments.push({ id: enchant.type.id, level: enchant.level });
    }
    return itemData;
  }
}
