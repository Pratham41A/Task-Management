import nodeCron from "node-cron";
import { expireTasks, nearExpiryTasks } from "../service/job.js";

export  function scheduler() {
    //Daily Night 12 PM
    nodeCron.schedule("0 0 * * *", async () => {
      try{
        await nearExpiryTasks();
        await expireTasks();
      }
      catch(err

      ){
        console.log(err.message);
      }
    },{
      timezone: "Asia/Kolkata" 
    });
}
