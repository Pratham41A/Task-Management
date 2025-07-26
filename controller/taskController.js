import {Task} from "../model/task.js";
import { redisDbClient } from "../config/redisDb.js";
import { sanitize } from "../service/sanitize.js";
//Sanitize/Normalizes Input,Prevents SQL Injection
export async function createTask(req, res) {
  try {
  const { title, description, ...rest } = req.body;

const body = {
  title: sanitize(title),
  ...(description && { description: sanitize(description) }),
  ...rest
};

    const {userId}=req

    await Task.create({ ...body, createdBy: userId });

    res.status(201).json({ message: "Task created" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateTask(req, res) {
  try {
    const {id,title,description,...rest}=req.body;
 const { userId } = req;
 
 const body={
  ...(title&&{title:sanitize(title)}),
  ...(description && { description: sanitize(description) }),
  updatedBy:userId,
  ...rest
 }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id ,$or: [
          { createdBy: userId },
          { assignedTo: userId } 
        ] },
      body,
      { new: false, upsert: false }//new:false returns document before update
      //upsert:true creates new document, if document not found for update
    );
      if (!updatedTask) {
      return res.status(404).json({ error: "Task Not Found or You Are Not The Member Of The Given Task Trying To Update" });
    }
    res.status(200).json({ message: "Task Updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getTasks(req, res) {
  try {

    /*Body:
    {
  "filter": {
    "field": { "$operator": "value" }
  },
  "sort": {
    "field": 1 or -1 //1 for Ascending and -1 for Descending
  }
}*/

       const { filter = {}, sort = {} } = req.body;
        const {userId}=req
 const cacheTasksKey = `tasks:${userId}:${filter}:${sort}`;
    const cachedTasks = await redisDbClient.get(cacheTasksKey);
    if (cachedTasks) {
      return res.status(200).json(JSON.parse(cachedTasks));
    }

   const tasks = await Task.find({...filter,$or: [
          { createdBy: userId },
          { assignedTo: userId } 
        ] })
      .sort(sort)
    if (!tasks) {
      return res.status(404).json({ message: 'No tasks found' });
    }
await redisDbClient.set(cacheTasksKey, JSON.stringify(tasks), { EX: 60 });
    res.status(200).json(tasks);


  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteTask(req, res) {
  try {
    const {id} = req.body
const {userId}=req
    const deletedTask=await Task.findOneAndDelete({ _id: id ,createdBy:userId});
     if (!deletedTask) {
      return res.status(404).json({ error: "Task Not Found or You Are Not The Owner Of The Given Task Trying To Delete" });
    }
    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

