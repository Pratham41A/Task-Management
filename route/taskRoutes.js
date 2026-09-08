import e from "express";
import { createTask, deleteTask, getTasks, updateTask } from "../controller/taskController.js";
import {auth} from "../middleware/auth.js";
import  {validateCreateTask, validateDeleteTask, validateGetTasks, validateUpdateTask } from "../middleware/task.js";

export const taskRouter = e.Router();

taskRouter.post("/", auth, validateCreateTask,createTask);
taskRouter.patch("/", auth, validateUpdateTask,updateTask );
taskRouter.delete("/:id", auth, validateDeleteTask, deleteTask);
taskRouter.get("/:id?", auth, validateGetTasks, getTasks);