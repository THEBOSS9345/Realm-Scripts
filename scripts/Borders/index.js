import { BlockVolumeUtils, BoundingBoxUtils, Vector, world, system, Player } from '@minecraft/server';
import { ActionFormData, MessageFormData, ModalFormData } from '@minecraft/server-ui'
const database = new Map()
const validateCoordinates = input => (input.split(', ').map(coord => parseInt(coord.trim())).length === 3 && input.split(', ').every(coord => !isNaN(parseInt(coord.trim())))) ? input.split(', ').map(coord => parseInt(coord.trim())) : null;
world.beforeEvents.chatSend.subscribe((data) => {
    const { sender: player, message } = data;
    if (!message.startsWith('.')) return;
    if (!player.hasTag('Admin')) return;
    const command = message.slice(1);
    data.cancel = true;
    switch (command) {  
        case 'borders': system.run(() => {
            player.sendMessage(`§6<§cSystem§6>§7 Leave The ChatRoom`)
            ViewBordersMenu(player)
        }); break
        default: player.sendMessage(`§6<§cSystem§6>§7 with . you can type borders to open a borders menu`); break
    }
})
function ViewBordersMenu(player) {
    new ActionFormData()
        .title('§cBorders Menu')
        .body(`§6Welcome ${player.name}.§7 What you will like to do?`)
        .button('§bCreate')
        .button('§bDelete')
        .button('§bView')
        .button('§cExit')
        .show(player).then(({ selection, cancelationReason }) => {
            if (cancelationReason === 'UserBusy') return ViewBordersMenu(player)
            switch (selection) {
                case 0: CreateBorders(player); break;
                case 1: DeleteBorders(player); break;
                case 2: ViewBorders(player)
                default: player.sendMessage(`§6<§cSystem§6>§7 You have Left The Borders Menu`)
            }
        })
}
function CreateBorders(player) {
    const data = world.getDynamicProperty('borders') ? JSON.parse(world.getDynamicProperty('borders')) : undefined;
    if (data) return player.sendMessage(`§6<§cSystem§6>§7 You already have a border in the game at from: ${data.from.x}, ${data.from.y}, ${data.from.z} | to: ${data.to.x}, ${data.to.y}, ${data.to.z} `);
    new ModalFormData()
        .title('§cBorders Create')
        .textField(`§6Welcome ${player.name}.§7 Here you can make a new border in the game. Enter from (format: x, y, z)`, '12, 12, -12')
        .textField(`§6Welcome ${player.name}.§7 Here you can make a new border in the game. Enter to (format: x, y, z)`, '20, 20, -12')
        .toggle('§cConfirm this action', false)
        .show(player)
        .then(({ formValues: [selectedfrom, selectedto, confirm], canceled }) => {
            if (canceled || !confirm) return ViewBordersMenu(player);
            const to = validateCoordinates(selectedto);
            const from = validateCoordinates(selectedfrom);
            console.warn(to, from)
            if (!from || !to) return player.sendMessage('§cInvalid input. Please provide valid coordinates for both locations.');
            world.setDynamicProperty('borders', JSON.stringify({ from: { x: from[0], y: from[1], z: from[2] }, to: { x: to[0], y: to[1], z: to[2] } }))
            player.sendMessage(`§6<§cSystem§6>§7 Border created with from: ${from[0]}, ${from[1]}, ${from[2]} and to: ${to[0]}, ${to[1]}, ${to[2]}`);
        });
}
function DeleteBorders(player) {
    const data = world.getDynamicProperty('borders') ? JSON.parse(world.getDynamicProperty('borders')) : undefined;
    if (!data) return player.sendMessage(`§6<§cSystem§6>§7 There is no border to delete.`);
    new ModalFormData()
        .title('§cDelete Borders')
        .toggle(`§cBorder from:\n§7x: ${data.from.x}, y: ${data.from.y}, z: ${data.from.x}\n\n§cto:\n§7x: ${data.to.x}, y: ${data.to.y}, z: ${data.to.x}\n\n§6Confirm deletion`, false)
        .show(player)
        .then(({ formValues: [confirm], canceled }) => {
            if (canceled || !confirm) return ViewBordersMenu(player);
            world.setDynamicProperty('borders', null);
            player.sendMessage(`§6<§cSystem§6>§7 Border deleted successfully.`);
        });
}
function ViewBorders(player) {
    const data = world.getDynamicProperty('borders') ? JSON.parse(world.getDynamicProperty('borders')) : undefined;
    const form = new ActionFormData()
        .title('Border Information')
        .body(data ? `§cfrom:§7 x: ${data.from.x}, y: ${data.from.y}, z: ${data.from.z}\n§cto:§7 x: ${data.to.x}, y: ${data.to.y}, z: ${data.to.z}` : 'No border set in the game.')
        .button('Close');
    form.show(player).then(({ canceled, selection }) => {
        if (canceled || selection === 0) return ViewBordersMenu(player)
    });
}
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const box = (players, res) => BoundingBoxUtils.isInside(BoundingBoxUtils.createValid(res.from, res.to), players.location);
        const bordersdata = world.getDynamicProperty('borders') ? JSON.parse(world.getDynamicProperty('borders')) : null
        const inside = bordersdata ? box(player, bordersdata) : undefined
        if (inside == true) return  database.set(player.name, player.location)
        if (inside !== undefined && !inside && database.get(player.name)) return player.teleport(database.get(player.name)), player.sendMessage('§6<§cSystem§6>§7 You cant go outside the border');
    }
});