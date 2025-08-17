import e from "express";
import {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
} from "../controller/taskController.js";
import {auth} from "../middleware/auth.js";
import  {validateCreate, validateDelete, validateUpdate } from "../middleware/task.js";

const taskRouter = e.Router();

taskRouter.post("/createTask", auth, validateCreate, createTask);
taskRouter.get("/getTasks", auth, getTasks);
taskRouter.patch("/updateTask", auth, validateUpdate, updateTask);
taskRouter.delete("/deleteTask", auth, validateDelete, deleteTask);

export default taskRouter;
