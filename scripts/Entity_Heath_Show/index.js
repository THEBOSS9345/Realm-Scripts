import { world, system, EntityHealthComponent } from "@minecraft/server";
system.runInterval(() => {
  world.getDimension('overworld').getEntities().forEach(entity => {
    const typeId = entity.typeId;
    if (typeId === 'minecraft:player') return
    const maxhealth =  Math.ceil(entity.getComponent('health')?.defaultValue).toFixed(2) / 2;
    entity.nameTag = `${typeId.replace('minecraft:', '').toLocaleUpperCase()}\n${Math.ceil(entity.getComponent('health')?.currentValue) / 2} / ${maxhealth}`;
  });
});
