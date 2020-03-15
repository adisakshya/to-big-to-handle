/**
 * Controller
 */

/**
 * Require processHandler
 */
const processHandler = require('../../lib/processHandler');

/**
 * Require task model 
 */
const taskModel = require('../../model/tasks/main');

/**
 * GET all tasks
 * @param {Object} req 
 * @param {Object} res 
 */
const getTasks = async (req, res) => {
    try {
        // GET all tasks
        let tasks = taskModel.getAllTasks();
        return res
            .status(200)
            .json({
                "message": tasks
            });
    } catch(error) {
        return res
            .status(500)
            .json({
                "message": error.message
            });
    }
}

/**
 * GET task by ID
 * @param {Object} req 
 * @param {Object} res 
 */
const getTaskByID = async (req, res) => {
    try {
        // GET task id from params
        const taskID = req.query.id;
        if(!taskID) {
            return res
                .status(400)
                .json({
                    "message": "Missing parameter Task ID"
                });
        }
        // GET task details by ID
        let task = taskModel.getTaskByID(taskID);
        return res
            .status(200)
            .json({
                "message": task
            });
    } catch(error) {
        return res
            .status(500)
            .json({
                "message": error.message
            });
    }
}

exports.getTasks = getTasks;
exports.getTaskByID = getTaskByID;

// exports.uploadRequestHandler = _uploadRequestHandler;
// /**
//  * Process uplaoded CSV
//  * @param {object} req 
//  * @param {object} res 
//  */
// const _uploadRequestHandler = async (req, res) => {
//     try {
//         // GET test csv file name
//         const csvFileName = req.query.csv;

//         // Start processing test CSV file
//         processHandler.processCSV(csvFileName);

//         return res
//             .status(200)
//             .json({
//                 "message": "Your request has been submitted"
//             });
//     } catch(error) {
//         return res
//             .status(500)
//             .json({
//                 "message": error
//             });
//     }
// }