import {schedule} from "node-cron";
import { expireTasks, nearExpiryTasksWarning } from "./jobs.js";
import chalk from "chalk";

export  function jobScheduler() {
    
    schedule("0 0 * * *", async () => {
      try{
 await Promise.all([expireTasks(),nearExpiryTasksWarning()]);
      }
      catch(error){
        console.log(chalk.bgRedBright(error.message))
      }
      
    },
       {
      timezone: "Asia/Kolkata"
    }
  );
}
