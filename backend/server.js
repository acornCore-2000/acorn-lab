import errorHandler from "./middleware/errorHandler.js";
import { app } from "./app.js";
import thoughtsRouter from "./routes/thoughts.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import commentRouter from "./routes/comments.js";
import darkmodeRouter from "./routes/darkMode.js";
import settingsRouter from "./routes/settings.js";
import uploadAvatarRouter from "./routes/uploadAvatar.js";
import { createServer } from "http";
import { initializeSocket } from "./socket/index.js";

app.use(thoughtsRouter);
app.use(authRouter);
app.use(userRouter);
app.use(commentRouter);
app.use(darkmodeRouter);
app.use(settingsRouter);
app.use(uploadAvatarRouter);
app.use(errorHandler);


const server = createServer(app);
const port = 5000;

initializeSocket(server);


server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
