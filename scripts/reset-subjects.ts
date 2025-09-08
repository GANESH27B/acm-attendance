require('dotenv').config({ path: './.env.local' });
import pool, { executeQuery } from '../lib/database';

const resetSubjects = async () => {
  console.log('Connecting to the database to reset subjects...');
  try {
    console.log('Executing TRUNCATE TABLE subjects...');
    const result = await executeQuery('TRUNCATE TABLE subjects', []);

    if (result.success) {
      console.log('✅ Successfully reset the subjects table.');
      console.log('The "Total Events" count is now zero. New events will be counted from now on.');
    } else {
      console.warn('TRUNCATE failed, attempting DELETE. This may be due to foreign key constraints. Past attendance records will now have null subject names.');
      const deleteResult = await executeQuery('DELETE FROM subjects', []);
      if (deleteResult.success) {
        console.log('✅ Successfully deleted all records from the subjects table.');
      } else {
        console.error('❌ Failed to reset subjects table using both TRUNCATE and DELETE.', deleteResult.error);
      }
    }
  } catch (error) {
    console.error('❌ An error occurred while resetting the subjects table:', error);
  } finally {
    await pool.end();
    console.log('Database connection pool closed.');
  }
};

resetSubjects();
