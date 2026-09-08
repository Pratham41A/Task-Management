
import { Task } from '../model/task.js';

export async function createTask(req, res) {
  try {
    const { body, userId } = req || {};

    await Task.create({
      ...body,
      createdBy: userId,
    });

    return res.status(201).json({
      message: 'Create Task',
    });
  } catch (error) {
    const { message } = error || {};

    return res.status(500).json({
      error: message,
    });
  }
}

export async function updateTask(req, res) {
  try {
    let { body = {}, userId } = req || {};
    let id, assignedTo;
    ({ id, assignedTo = {}, ...body } = body);

    let task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        error: 'No Task',
      });
    }
    
    const { createdBy, assignedTo: originalAssignedTo = [] } = task || {};
    
    const isAuthorized =
      createdBy.toString() === userId ||
      originalAssignedTo.some(
        (assignedToUserId) => assignedToUserId.toString() === userId
      );

    if (!isAuthorized) {
      return res.status(403).json({
        error: 'No Authorization',
      });
    }

    Object.assign(task, body);
    task.updatedBy = userId;
    
    const {add: assignedToAdd = [], remove: assignedToRemove = []} = assignedTo || {};
    const { length: assignedToAddLength } = assignedToAdd;
    const { length: assignedToRemoveLength } = assignedToRemove;
    
    if (assignedToRemoveLength > 0) {
      const assignedToRemoveSet = new Set(assignedToRemove);
        task.assignedTo = task.assignedTo.filter(
        (assignedToUserId) => !assignedToRemoveSet.has(assignedToUserId.toString())
      );
      }

      if (assignedToAddLength > 0) {
      const assignedToCurrentSet = new Set(task.assignedTo.map(String));
          for (const userId of assignedToAdd) {
            if (!assignedToCurrentSet.has(userId)) {
              task.assignedTo.push(userId);
              assignedToCurrentSet.add(userId);
            }
          }
      }

    await task.save();

    return res.status(200).json({
      message: 'Task Update',
    });
  } catch (error) {
    const { message } = error || {};

    return res.status(500).json({
      error: message,
    });
  }
}

export async function deleteTask(req, res) {
  try {
    const { params: {id} = {}, userId } = req || {};

    const task = await Task.findById(id).lean();

    if (!task) {
      return res.status(404).json({
        error: 'No Task',
      });
    }

    const { createdBy } = task || {};
    if (createdBy.toString() !== userId) {
      return res.status(403).json({
        error: 'No Authorization',
      });
    }

    await Task.findOneAndDelete({
      _id: id,
    });

    return res.status(200).json({
      message: 'Task Delete',
    });
  } catch (error) {
    const { message } = error || {};

    return res.status(500).json({
      error: message,
    });
  }
}

export async function getTasks(req, res) {
  try {
    const { params: {id} = {}, userId } = req || {};

    if (id) {
      const task = await Task.findById(id)
        .populate('assignedTo', 'username email')
        .populate('createdBy', 'username email')
        .populate('updatedBy', 'username email')
        .lean();

      if (!task) {
        return res.status(404).json({
          error: 'No Task',
        });
      }

      const { createdBy = {}, assignedTo } = task || {};
      const { _id: createdByUserId} = createdBy || {};

      const isAuthorized = createdByUserId.toString() === userId 
      ||
      assignedTo.some(
        (assignedToUser) =>{
          const {_id: assignedToUserId} = assignedToUser || {};
          return assignedToUserId.toString() === userId
        }
      ); 

      if (!isAuthorized) {
        return res.status(403).json({
          error: 'No Authorization',
        });
      }

      return res.status(200).json({
        message: task,
      });
    }

    const tasks = await Task.find({
      $or: [
        { createdBy: userId },
        { assignedTo: userId },
      ],
    })
      .populate('assignedTo', 'username email')
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .lean();

    return res.status(200).json({
      message: tasks,
    });
  } catch (error) {
    const { message } = error || {};
    return res.status(500).json({
      error: message,
    });
  }
}