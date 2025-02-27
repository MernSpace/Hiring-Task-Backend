const express =require('express');
const UsersController=require("../controllers/UsersController");
const TasksController=require("../controllers/TasksController");
const AuthVerifyMiddleware=require("../middleware/AuthVerifyMiddleware");



const router =express.Router();


router.post("/registration",UsersController.registration);
router.post("/login",UsersController.login);
router.post("/profileUpdate",AuthVerifyMiddleware,UsersController.profileUpdate);
router.get("/profileDetails",AuthVerifyMiddleware,UsersController.profileDetails);






router.get("/RecoverVerifyEmail/:email",UsersController.RecoverVerifyEmail);
router.get("/RecoverVerifyOTP/:email/:otp",UsersController.RecoverVerifyOTP);
router.post("/RecoverResetPass",UsersController.RecoverResetPass);


router.post("/createTask",AuthVerifyMiddleware,TasksController.createTask);

router.get("/updateTaskStatus/:id/:status/:Priority",AuthVerifyMiddleware,TasksController.updateTaskStatus);

router.get("/listTaskByStatus/:status",AuthVerifyMiddleware,TasksController.listTaskByStatus);
router.get("/listTaskByPriority/:priority",AuthVerifyMiddleware,TasksController.listTaskByPriority);

router.get("/taskStatusCount",AuthVerifyMiddleware,TasksController.taskStatusCount);
router.get("/taskPriorityCount",AuthVerifyMiddleware,TasksController.taskPriorityCount);

router.get("/deleteTask/:id",AuthVerifyMiddleware,TasksController.deleteTask);


module.exports=router;






































module.exports=router;