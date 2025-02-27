import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routes";
import { Events } from "./models/events";
import { createUsersTable } from "./initial-tables-setup";
import { authenticateJWT } from "./middleware/auth";

const app = express();
const port = 3000;

app.use(cors());

const events = new Events();

app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(bodyParser.json());

createUsersTable();

app.use("/auth", router);

app.get("/upcomming-events", async (req, res) => {
  res.json(await events.fetchAllEvents());
});

app.get("/upcomming-events/:eventId", async (req, res) => {
  res.json(await events.getEventById(req.params.eventId));
});

// @ts-ignore
app.post("/upcomming-events", authenticateJWT, async (req, res) => {
  res.json(await events.addNewEvent(req.body));
});

// @ts-ignore
app.put("/upcomming-events/:eventId", authenticateJWT, async (req, res) => {
  await events.isEventPresent(req.params.eventId);

  await events.editEvent(req.params.eventId, req.body);

  // if (!event) {
  //   return res
  //     .json({
  //       message: "Event not found",
  //     })
  //     .status(404);
  // }

  res.send().status(204);
});

// @ts-ignore
app.delete("/upcomming-events/:eventId", authenticateJWT, async (req, res) => {
  await events.isEventPresent(req.params.eventId);
  await events.deleteEventById(req.params.eventId);

  // if (!event) {
  //   return res
  //     .json({
  //       message: "Event not found",
  //     })
  //     .status(404);
  // }

  return res.json([]).status(204);
});

app.listen(port, () => {
  console.log(`Server Running on port ${port}`);
});
