/**
 * Database Handler
 * Save CSV Data Array into MySQL database
 */

/**
 * Require cache utility
 */
const cache = require('./cache');

/**
 * Require connection pool
 */
const pool = require('../rdbms/pool');

/**
 * Execute query to insert a csv row in the database
 * @param {Object} connection 
 * @param {String} taskID 
 * @param {Array} fields 
 */
const executeQuery = async (connection, taskID, fields) => {
    return new Promise((resolve, reject) => {
        // Execute Query
        connection.query('INSERT INTO managerdb.taskData(taskID, rowID, field1, field2, field3, field4, field5, field6, field7, field8, field9, field10, field11, field12, field13, field14, field15, field16, field17, field18, field19, field20) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [taskID].concat(fields), function(err, results) {
            if (err) {
                connection.rollback(function() {
                    connection.release();
                    reject(err);
                });
            } else {
                resolve();
            }
        });
    });
}

/**
 * Insert Data Array fields into MySQL database
 */
const saveToMySQL = async (dataArray, taskID) => {

    // Promise to handle insertion of all rows in a CSV
    return new Promise((resolve, reject) => {

        // Get connection from pool
        pool.getConnection(function(err, connection) {

            // Start transaction
            connection.beginTransaction(async function(err) {

                // Rollback on transaction failure
                if (err) {
                    connection.rollback(function() {
                        // Release connection
                        connection.release();
                        
                        // Reject promise
                        reject(err);
                    });
                } else {

                    // Start insertion of rows in database
                    console.log('Transaction Started for taskID ' + taskID);

                    // Iterate on every row of CSv and insert into database
                    for(let i=0; i<dataArray.length; i++) {

                        // Get cached state of the task
                        let task = await cache.get(taskID);
                        task = JSON.parse(task);

                        // Check if task was terminated
                        // if yes, then rollback and resolve promise
                        if(task.isTerminated) {
                            connection.rollback(function() {
                                // Release connection
                                connection.release();
                                
                                // Resolve promise
                                resolve('Transaction Terminated');
                            });
                        } else if(task.isCompleted) {
                            return;
                        } else if(task.isPaused) {
                            return;
                        }

                        // Extract row fields from dataArray
                        let arr = Array();
                        let rowID = i;
                        arr.push(rowID);
                        let objArr = Array(dataArray[i]);
                        const fields = arr.concat(objArr.map(x => Object.values(x))[0]);
                        
                        // Execute Query
                        await executeQuery(connection, taskID, fields);

                        // Update cached state
                        // increment processed rows by 1
                        task.processedRows += 1;
                        let updatedTask = await cache.set(taskID, JSON.stringify(task));
                        // console.log('Inserted csv row in database for taskID -> ' + taskID + ' processedRow -> ' + task.processedRows.toString());
                    }

                    // After processing complete dataArray
                    // Commit the connection
                    console.log('Comiting Connection');
                    connection.commit(async function(err) {
                        if (err) {
                            // Rollback on commit failure
                            connection.rollback(function() {
                                // Release connection
                                connection.release();

                                // Reject promise
                                reject(err);
                            });
                        } else {
                            // Success
                            
                            // Release connection
                            connection.release();
                            
                            // Update Cached state of task
                            let task = await cache.get(taskID);
                            task = JSON.parse(task);
                            task.isCompleted = 1;
                            let updatedTask = await cache.set(taskID, JSON.stringify(task));

                            // Reolve promise
                            console.log('Transaction Complete for taskID ' + taskID);
                            resolve('Transaction Completed');
                        }
                    });
                }    
            });    
        });
    });
};

exports.saveToMySQL = saveToMySQL;