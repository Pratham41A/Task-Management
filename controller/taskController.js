
import { Task } from '../model/task.js';
import { sanitize } from '../service/sanitize.js';

export async function createTask(req, res) {
  try {
    const { body, userId } = req;

    const taskBody = {
      ...sanitize(body),
      createdBy: userId,
    };

    await Task.create(taskBody);

    return res.status(201).json({
      message: 'Create Task',
    });
  } catch (error) {
    const { message } = error;

    return res.status(500).json({
      error: message,
    });
  }
}

export async function updateTask(req, res) {
  try {
    const { body: requestBody = {}, userId } = req;
    const { id, assignedTo = {}, ...body } = sanitize(requestBody);

    const task = await Task.findById(id).lean();

    if (!task) {
      return res.status(404).json({
        error: 'No Task',
      });
    }
    
    const { createdBy, assignedTo: originalAssignedTo } = task;
    
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

    const taskBody = {
      $set: {
          ...body,
          updatedBy: userId,
        },
    };
    
    const {add: assignedToAdd = [], remove: assignedToRemove = []} = assignedTo;
    const { length: assignedToAddLength } = assignedToAdd;
    const { length: assignedToRemoveLength } = assignedToRemove;
    
    if (assignedToAddLength > 0) {
        taskBody.$addToSet = {
          assignedTo: {
            $each: assignedToAdd,
          },
        };
      }

      if (assignedToRemoveLength > 0) {
        taskBody.$pull = {
          assignedTo: {
            $in: assignedToRemove,
          },
        };
      }

    await Task.updateOne(
      {
        _id: id,
        $or: [
          { createdBy: userId },
          { assignedTo: userId },
        ],
      },
      taskBody
    );

    return res.status(200).json({
      message: 'Task Update',
    });
  } catch (error) {
    const { message } = error;

    return res.status(500).json({
      error: message,
    });
  }
}

export async function deleteTask(req, res) {
  try {
    const { params = {}, userId } = req;
    const { id } = sanitize(params);

    const task = await Task.findById(id).lean();

    if (!task) {
      return res.status(404).json({
        error: 'No Task',
      });
    }

    const { createdBy } = task;
    if (createdBy.toString() !== userId) {
      return res.status(403).json({
        error: 'No Authorization',
      });
    }

    await Task.findOneAndDelete({
      _id: id,
      createdBy: userId,
    });

    return res.status(200).json({
      message: 'Task Delete',
    });
  } catch (error) {
    const { message } = error;

    return res.status(500).json({
      error: message,
    });
  }
}

export async function getTasks(req, res) {
  try {
    const { params = {}, userId } = req;
    const { id } = sanitize(params);

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

      const { createdBy = {}, assignedTo } = task;
      const { _id: createdByUserId} = createdBy

      const isAuthorized = createdByUserId.toString() === userId 
      ||
      assignedTo.some(
        (assignedToUser) =>{
          const {_id: assignedToUserId} = assignedToUser
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

    const query = {
      $or: [
        { createdBy: userId },
        { assignedTo: userId },
      ],
    };

    const tasks = await Task.find(query)
      .populate('assignedTo', 'username email')
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email')
      .lean();

    return res.status(200).json({
      message: tasks,
    });
  } catch (error) {
    const { message } = error;    
    return res.status(500).json({
      error: message,
    });
  }
}