const express = require('express');
const router = express.Router();
const sql = require('mssql/msnodesqlv8');
const auth = require('../middleware/auth');

// --- 1. GET: Fetch Manual + AI Auto-Generated Tasks ---
router.get('/', auth, async (req, res) => {
    try {
        const pool = req.pool;
        const uId = req.user.id;
        const tasks = [];

        // A. Get Manual Tasks
        const manualTasks = await pool.request()
            .input('uId', sql.Int, uId)
            .query('SELECT * FROM FarmTasks WHERE UserId = @uId AND IsCompleted = 0 ORDER BY CreatedAt DESC');
            
        manualTasks.recordset.forEach(task => {
            tasks.push({
                id: task.TaskId,
                description: task.Description,
                isAuto: false,
                isCompleted: false,
                createdAt: task.CreatedAt
            });
        });

        // B. Generate AI Tasks Dynamically

        // 1. Growth Reminder (7 days without size update)
        const growthCheck = await pool.request()
            .input('uId', sql.Int, uId)
            .query(`
                SELECT p.PondName 
                FROM Stocking st
                JOIN Ponds p ON st.CurrentPondId = p.PondId
                WHERE st.UserId = @uId 
                AND (st.LastSizeUpdateDate IS NULL OR DATEDIFF(day, st.LastSizeUpdateDate, GETDATE()) >= 7)
                GROUP BY p.PondName
            `);
            
        growthCheck.recordset.forEach(row => {
            tasks.push({
                id: `auto_growth_${row.PondName.replace(/\s+/g, '_')}`,
                description: `Measure fish size in ${row.PondName}`,
                isAuto: true,
                isCompleted: false,
                category: 'Growth'
            });
        });

        // 2. Water Quality Reminder (Daily check)
        const waterCheck = await pool.request()
            .input('uId', sql.Int, uId)
            .query(`
                SELECT p.PondId, p.PondName 
                FROM Ponds p
                WHERE p.UserId = @uId
                AND EXISTS (SELECT 1 FROM Stocking s WHERE s.CurrentPondId = p.PondId)
                AND NOT EXISTS (
                    SELECT 1 FROM water_quality_logs w 
                    WHERE w.PondId = p.PondId 
                    AND CAST(w.recorded_at AS DATE) = CAST(GETDATE() AS DATE)
                )
            `);
            
        waterCheck.recordset.forEach(row => {
            tasks.push({
                id: `auto_water_${row.PondId}`,
                description: `Check water parameters for ${row.PondName}`,
                isAuto: true,
                isCompleted: false,
                category: 'Water'
            });
        });

        // 3. Feed Reminder (Daily check for stocked ponds)
        const feedCheck = await pool.request()
            .input('uId', sql.Int, uId)
            .query(`
                SELECT p.PondId, p.PondName 
                FROM Ponds p
                WHERE p.UserId = @uId
                AND EXISTS (SELECT 1 FROM Stocking s WHERE s.CurrentPondId = p.PondId)
                AND NOT EXISTS (
                    SELECT 1 FROM Feed_Logs f
                    WHERE f.PondId = p.PondId 
                    AND CAST(f.FeedDate AS DATE) = CAST(GETDATE() AS DATE)
                )
            `);

        feedCheck.recordset.forEach(row => {
            tasks.push({
                id: `auto_feed_${row.PondId}`,
                description: `Feed fish in ${row.PondName}`,
                isAuto: true,
                isCompleted: false,
                category: 'Feed'
            });
        });

        // 4. Fertilizer Reminder (Dynamic schedule)
        const fertCheck = await pool.request()
            .input('uId', sql.Int, uId)
            .query(`
                SELECT p.PondId, p.PondName, p.CultivationType, MAX(fl.ApplicationDate) as lastApplication, p.Size
                FROM Ponds p
                LEFT JOIN Fertilizers_Logs fl ON p.PondId = fl.PondId
                WHERE p.UserId = @uId
                GROUP BY p.PondId, p.PondName, p.CultivationType, p.Size
            `);

        // Get recommendations for frequency
        const fertRecs = await pool.request().query('SELECT * FROM fertilizer_recommendations');
        
        fertCheck.recordset.forEach(row => {
            if (row.CultivationType === 'Intensive') return; // Intensive ponds usually don't need fertilization

            const rec = fertRecs.recordset.find(r => r.cultivation_type === row.CultivationType) || fertRecs.recordset[0];
            const frequencyDays = rec ? rec.frequency_days : 14;

            let isDue = false;
            if (!row.lastApplication) {
                isDue = true;
            } else {
                const daysSince = Math.floor((new Date() - new Date(row.lastApplication)) / (1000 * 60 * 60 * 24));
                if (daysSince >= frequencyDays) {
                    isDue = true;
                }
            }

            if (isDue) {
                tasks.push({
                    id: `auto_fert_${row.PondId}`,
                    description: `Apply fertilizer to ${row.PondName}`,
                    isAuto: true,
                    isCompleted: false,
                    category: 'Fertilizer'
                });
            }
        });

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks", details: err.message });
    }
});

// --- 2. POST: Add Manual Task ---
router.post('/add', auth, async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) return res.status(400).json({ error: "Description is required" });

        await req.pool.request()
            .input('uId', sql.Int, req.user.id)
            .input('desc', sql.NVarChar(255), description)
            .query('INSERT INTO FarmTasks (UserId, Description) VALUES (@uId, @desc)');

        res.json({ success: true, message: "Task added successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to add task", details: err.message });
    }
});

// --- 3. PUT: Complete Manual Task ---
router.put('/complete/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        await req.pool.request()
            .input('id', sql.Int, id)
            .input('uId', sql.Int, req.user.id)
            .query('UPDATE FarmTasks SET IsCompleted = 1 WHERE TaskId = @id AND UserId = @uId');

        res.json({ success: true, message: "Task completed" });
    } catch (err) {
        res.status(500).json({ error: "Failed to complete task", details: err.message });
    }
});

// --- 4. DELETE: Remove Manual Task ---
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        await req.pool.request()
            .input('id', sql.Int, id)
            .input('uId', sql.Int, req.user.id)
            .query('DELETE FROM FarmTasks WHERE TaskId = @id AND UserId = @uId');

        res.json({ success: true, message: "Task removed" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete task", details: err.message });
    }
});

module.exports = router;
