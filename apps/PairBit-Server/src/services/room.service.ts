// interface Room {
//     roomId: number;
//     members: Array<object>;
// }

// let Rooms: Array<Room> = [];

// const createRoom = (roomId: number): Room | null => {
//     if (Rooms.find(room => room.roomId === roomId)) {
//         return null; // Room already exists
//     }
//     const newRoom: Room = { roomId, members: [] };
//     Rooms.push(newRoom);
//     return newRoom;
// };

// const joinRoom = (roomId: number, member: object): boolean => {
//     const room = Rooms.find(room => room.roomId === roomId);
//     if (!room) return false;
//     // Prevent duplicate members (simple check by reference)
//     if (!room.members.includes(member)) {
//         room.members.push(member);
//     }
//     return true;
// };

// const getRoom = (roomId: number): Room | undefined => {
//     return Rooms.find(room => room.roomId === roomId);
// };

// const roomExists = (roomId: number): boolean => {
//     return Rooms.some(room => room.roomId === roomId);
// };

// export { Rooms, createRoom, joinRoom, getRoom, roomExists };