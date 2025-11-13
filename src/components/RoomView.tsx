import type Room from "../models/Room";

type RoomViewProps = {
    room: Room;
};

export default function RoomView({ room }: RoomViewProps) {
    return (
        <canvas
            width={room.width * 64}
            height={room.height * 64}
            ref={canvas => {
                if (canvas) {
                    const ctx = canvas.getContext("2d");
                    if (ctx !== null) {
                        room.draw(ctx);
                    }
                }
            }}
        />
    );
}