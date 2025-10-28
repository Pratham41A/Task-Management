import { Task } from '../model/task.js';
import {sanitize} from '../service/sanitize.js'
export async function createTask(req, res) {
  const { userId } = req
   const body = {...sanitize(req.body),createdBy: userId};

  try {
    await Task.create(body);
    return res.status(201).json({ message: 'Create Task' });
  } catch (error) {
     return res.status(400).json({ error: error.message });
  }
}

//All Assigned Members
export async function updateTask(req, res) {
  var { id, ...body } = sanitize(req.body);
  const {userId}=req
body = {...body,updatedBy: userId};


  try {
    const task=Task.findOne({_id:id, $or: [
        { createdBy: userId },
        { assignedTo: userId },
      ]}).lean()
if(!task){
  return res.status(400).json({ error: 'Task Not Found or Not Eligible' });
}
    await Task.findOneAndUpdate(
    { _id: id },
{     $set: 
          body
        }
    );
    return res.status(200).json({ message: 'Task Update' });
  } catch (error) {
   return  res.status(400).json({ error: error.message });
  }
}


export async function getTasks(req, res) {
   const { userId } = req;
  try {
   

    const tasks = await Task.find({
      $or: [
        { createdBy: userId },
        { assignedTo: userId },
      ]
    })
      .populate('assignedTo', 'username email')
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');

    if (!tasks || tasks.length === 0) {
     return  res.status(404).json({ error: 'No tasks found' });
    }

  return   res.status(200).json({ message:tasks});
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
//Only Owner
export async function deleteTask(req, res) {
  const { id } = sanitize(req.params);
  const { userId } = req

  try {
const task=Task.findOne({_id:id,createdBy: userId}).lean()
if(!task){
  return res.status(400).json({ error: 'Task Not Found or Not Eligible' });
}

    await Task.findOneAndDelete({
      _id: id,
      createdBy: userId,
    });

 return  res.status(200).json({ message: 'Task Delete' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
export async function getTaskById(req, res) {
  const { id } = sanitize(req.params);
   const { userId } = req;

  try {
    const task = await Task.findOne({ _id: id, $or: [{ createdBy: userId }, { assignedTo: userId }] }).lean();
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    return res.status(200).json({ message: task });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}