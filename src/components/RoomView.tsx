import { useGame } from "../hooks";
import type { Game } from "../models/Game";

export default function RoomView() {
    const game = useGame();

    const room = game.player.currentRoom;

    return (
        <canvas
            width={room.width * 64}
            height={room.height * 64}
            ref={(canvas) => drawRoom(canvas, game)}
        />
    );
}

const drawRoom = (canvas: HTMLCanvasElement | null, game: Game) => {
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const room = game.player.currentRoom;

    for (const sprite of room.sprites) {
        sprite.update();
    }

    room.draw(ctx);

    requestAnimationFrame(() => drawRoom(canvas, game));
}