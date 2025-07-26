import { Task } from "../model/task.js";
import { nearExpiryTasks as nearExpiryTasksMail } from "./mail.js";
export async function nearExpiryTasks() {
  const tasks = await Task.find({
    status: "Pending",
    //Can't use expiryDateTime.getTime(),as in query we use fieldName not a variable.
    expiryDateTime: {
      $gt: new Date(),
      $lt: new Date(Date.now() + 24 * 60 * 60 * 1000),//Date.now() returns milliseconds
    },  
  });

  //while iterating over the values we can use expiryDateTime.getTime() as it is a variable which stores value.
if(tasks.length === 0) {
    return;
  }

 const nearExpiryTasksMails= tasks.flatMap((task) => {
  //flatMap flattens array of depth level 1 
    const assignedUsers = task.assignedTo;
    return assignedUsers.map((user) => {
      const expiryDateTime=task.expiryDateTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
//Doesn't Executes ,instead returns Promise
     return nearExpiryTasksMail(user.email, task.title, expiryDateTime);
    });
  });
  await Promise.all(nearExpiryTasksMails)
}
