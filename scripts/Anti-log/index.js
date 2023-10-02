import { world, system, Player } from '@minecraft/server';

const events = {
  database: new Map(),
  timer: new Map(),
  timerValue: 10,
  callback() {
    this.EntityHit = world.afterEvents.entityHitEntity.subscribe(({ damagingEntity: entity, hitEntity }) => {
      if (!(hitEntity instanceof Player) && !(entity instanceof Player)) return
      this.timer.set(entity.id, Date.now());
    });
    this.Run = system.runInterval(() => {
      for (const player of world.getPlayers()) {
        if (!this.timer.has(player.id)) return;
        this.database.set(player.id, [player.dimension.id, player.location, {Items: [["Head", "Chest", "Legs", "Feet"].map(v => player.getComponent("minecraft:equippable").getEquipment(v)).filter(v => v), Array.from({ length: 36 }).map((_, i) => player.getComponent('inventory').container.getItem(i)).filter(v => v !== undefined)].flat()}]);
      }
    });
    this.Leave = world.afterEvents.playerLeave.subscribe(({ playerId, playerName }) => {
      if (!this.timer.has(playerId)) return;
      if (Date.now() - this.timerValue * 1000 > this.timer.get(playerId)) return;
      const info = this.database.get(playerId);
      for (const itemsInfo of info[2].Items) {
          console.warn(JSON.stringify(info[1]), itemsInfo.typeId)
      world.getDimension(info[0]).spawnItem(itemsInfo, info[1]);
    }
  });
    this.Spawn = world.afterEvents.playerSpawn.subscribe(async ({ player, initialSpawn }) => {
      if (!initialSpawn) return;
      if (!(Date.now() - this.timerValue * 1000 > this.timer.get(player.id))) return;
      player.runCommandAsync('clear @s')
      world.sendMessage('The Inv Is Been Cleared')
      this.timer.delete(player.id);
      this.database.delete(player.id);
    });
  }
};

events.callback();
