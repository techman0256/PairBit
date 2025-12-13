import express, { Request, Response } from "express";
import http from "http"

const app = express();
const  server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req: Request, res: Response) => {
    res.send({message: "PairBit server is running >>>>"})
})

server.listen(3000, () => {
    console.log("Server has started >>>>");
    require("./sockets/room.socket")
});
export default server;