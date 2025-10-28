import chalk from "chalk";
import { Task } from "../model/task.js";
import { nearExpiryTasksWarningMailTemplate } from "./mailTemplates.js";
import { format } from 'date-fns';
export async function nearExpiryTasksWarning() {
  try {
  const tasks = await Task.find({
    status: "Pending",
    expiryDateTime: {
      $gt: Date.now(),
      $lt: Date.now() + 86400000,
    },  
  }).populate('assignedTo', 'username email')
if(tasks.length === 0) {
    return;
  }


 const nearExpiryTasksWarningMails= tasks.flatMap((task) => {
    const assignedTo = task.assignedTo;
      const title=task.title
      const expiryDateTime = format(task.expiryDateTime, 'yyyy-MM-dd HH:mm:ss');
    return assignedTo.map((user) => {
     const username=user.username
     const email=user.email
     return nearExpiryTasksWarningMailTemplate(email,username, title, expiryDateTime);
    });
  });
  await Promise.all(nearExpiryTasksWarningMails)
}

  catch (error) {
    console.log(chalk.bgRedBright( error.message));
  }
}

export async function expireTasks() {
  try {
     await Task.updateMany(
      {
        status: "Pending",
        expiryDateTime: { $lt: Date.now() },
      },  
      { $set: { status: "Expired" } }
    );

  } catch (error) {
    console.log(chalk.bgRedBright( error.message));
  }
}