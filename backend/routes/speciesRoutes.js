const express = require('express');
const router = express.Router();
const sql = require('mssql/msnodesqlv8');
const { poolPromise } = require('../config/db');
const auth = require('../middleware/auth');

// 1. GET: Fetch all APPROVED species (Public-facing)
router.get('/', auth, async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        // Return only approved species for the main list
        const query = 'SELECT * FROM Species WHERE IsApproved = 1';

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Database error", message: err.message });
    }
});

// 1b. GET: Fetch regional species (Punjab, Sindh, etc.)
router.get('/regional', auth, async (req, res) => {
    try {
        const province = req.query.province; // e.g., "KPK Valleys (Peshawar, Mardan, Swat)"
        if (!province) return res.status(400).json({ error: "Province is required" });

        // Extract base region name (e.g., "KPK Valleys" from "KPK Valleys (Peshawar...)")
        const baseRegion = province.split('(')[0].trim();

        const pool = await poolPromise;
        const result = await pool.request()
            .input('province', sql.NVarChar, province)
            .input('baseRegion', sql.NVarChar, baseRegion)
            .query(`
                SELECT * FROM Species 
                WHERE (LOWER(CompatibleRegions) LIKE '%' + LOWER(@province) + '%' 
                OR LOWER(CompatibleRegions) LIKE '%' + LOWER(@baseRegion) + '%'
                OR LOWER(CompatibleRegions) LIKE '%all regions%')
                AND IsApproved = 1
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Database error", message: err.message });
    }
});

// 2. GET: Ping test (Public)
router.get('/ping', (req, res) => {
    res.send("Species Route file is loaded and working!");
});

// 2b. GET: Generate dynamic polyculture mixes based on SpeciesCompatibility
router.get('/polyculture/mixes', auth, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                s1.SpeciesId as MainId,
                s1.Name as MainName,
                s2.SpeciesId as PartnerId,
                s2.Name as PartnerName,
                c.CompatibilityReason
            FROM SpeciesCompatibility c
            INNER JOIN Species s1 ON c.SpeciesId = s1.SpeciesId
            INNER JOIN Species s2 ON c.CompatibleWithId = s2.SpeciesId
        `);

        // Group by Main Species
        const grouped = {};
        result.recordset.forEach(row => {
            if (!grouped[row.MainId]) {
                grouped[row.MainId] = {
                    id: row.MainId,
                    name: `${row.MainName}-Centric Mix`,
                    level: "Dynamic Mix",
                    levelColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
                    mainSpecies: row.MainName,
                    partners: [],
                    reasons: []
                };
            }
            grouped[row.MainId].partners.push(row.PartnerName);
            grouped[row.MainId].reasons.push(row.CompatibilityReason);
        });

        const mixes = Object.values(grouped).map(group => {
            const totalSpecies = 1 + group.partners.length;
            const percentage = Math.round(100 / totalSpecies);

            const ratio = [
                { species: group.mainSpecies, percentage: `${percentage}%`, count: "Varies by Pond" }
            ];

            group.partners.forEach(p => {
                ratio.push({ species: p, percentage: `${percentage}%`, count: "Varies by Pond" });
            });

            // Adjust last item to ensure total is 100% just in case of rounding errors (not strictly needed but good for display)

            return {
                id: group.id,
                name: group.name,
                level: group.level,
                levelColor: group.levelColor,
                totalFish: "Varies by Size",
                expectedYield: "Depends on density",
                advantages: group.reasons.join(" "),
                ratio: ratio
            };
        });

        // Add a two-way mix generator as well to make it interesting
        // Some species might only be a partner. We can also do bidirectional grouping, but this is a good start.

        res.json(mixes);
    } catch (err) {
        res.status(500).json({ error: "Database error", message: err.message });
    }
});

// 3. POST: Add a new custom Species (Protected)
router.post('/add', auth, async (req, res) => {
    try {
        const data = req.body;
        const pool = await poolPromise;
        const request = pool.request();

        request.input('Name', sql.NVarChar, data.Name);
        request.input('ImageUrl', sql.NVarChar, data.ImageUrl);
        request.input('MaxStockingDensity', sql.Decimal(10, 2), data.MaxStockingDensity);
        const isApprovedStatus = req.user.role === 'admin' ? 1 : 0;
        request.input('IsApproved', sql.Bit, isApprovedStatus);
        request.input('CompatibleRegions', sql.NVarChar, data.CompatibleRegions);
        request.input('MinTemp', sql.Int, data.MinTemp);
        request.input('MaxTemp', sql.Int, data.MaxTemp);
        request.input('MinPH', sql.Decimal(3, 1), data.MinPH);
        request.input('MaxPH', sql.Decimal(3, 1), data.MaxPH);
        request.input('MinDO', sql.Decimal(3, 1), data.MinDO);
        request.input('FingerlingSizeG', sql.Int, data.FingerlingSizeG);
        request.input('MarketSizeKG', sql.Decimal(10, 2), data.MarketSizeKG);
        request.input('HarvestTimeMonths', sql.Int, data.HarvestTimeMonths);
        request.input('SurvivalRateLower', sql.Decimal(5, 2), data.SurvivalRateLower);
        request.input('SurvivalRateUpper', sql.Decimal(5, 2), data.SurvivalRateUpper);
        request.input('MinMarketPrice', sql.Decimal(10, 2), data.MinMarketPrice);
        request.input('MaxMarketPrice', sql.Decimal(10, 2), data.MaxMarketPrice);
        request.input('Description', sql.NVarChar, data.Description);
        request.input('FeedingZone', sql.NVarChar, data.FeedingZone);
        request.input('SubmittedBy', sql.Int, req.user.id);

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const addReq = new sql.Request(transaction);

            // Re-bind all inputs to the transaction request
            addReq.input('Name', sql.NVarChar, data.Name);
            addReq.input('ImageUrl', sql.NVarChar, data.ImageUrl);
            addReq.input('MaxStockingDensity', sql.Decimal(10, 2), data.MaxStockingDensity);
            addReq.input('IsApproved', sql.Bit, isApprovedStatus);
            addReq.input('CompatibleRegions', sql.NVarChar, data.CompatibleRegions);
            addReq.input('MinTemp', sql.Int, data.MinTemp);
            addReq.input('MaxTemp', sql.Int, data.MaxTemp);
            addReq.input('MinPH', sql.Decimal(3, 1), data.MinPH);
            addReq.input('MaxPH', sql.Decimal(3, 1), data.MaxPH);
            addReq.input('MinDO', sql.Decimal(3, 1), data.MinDO);
            addReq.input('FingerlingSizeG', sql.Int, data.FingerlingSizeG);
            addReq.input('MarketSizeKG', sql.Decimal(10, 2), data.MarketSizeKG);
            addReq.input('HarvestTimeMonths', sql.Int, data.HarvestTimeMonths);
            addReq.input('SurvivalRateLower', sql.Decimal(5, 2), data.SurvivalRateLower);
            addReq.input('SurvivalRateUpper', sql.Decimal(5, 2), data.SurvivalRateUpper);
            addReq.input('MinMarketPrice', sql.Decimal(10, 2), data.MinMarketPrice);
            addReq.input('MaxMarketPrice', sql.Decimal(10, 2), data.MaxMarketPrice);
            addReq.input('Description', sql.NVarChar, data.Description);
            addReq.input('FeedingZone', sql.NVarChar, data.FeedingZone);
            addReq.input('SubmittedBy', sql.Int, req.user.id);

            const result = await addReq.query(`
            INSERT INTO Species (
                Name, ImageUrl, MaxStockingDensity, IsApproved, CompatibleRegions, 
                MinTemp, MaxTemp, MinPH, MaxPH, MinDO, FingerlingSizeG, 
                MarketSizeKG, HarvestTimeMonths, SurvivalRateLower, SurvivalRateUpper,
                MinMarketPrice, MaxMarketPrice, Description, FeedingZone, SubmittedBy
            ) VALUES (
                @Name, @ImageUrl, @MaxStockingDensity, @IsApproved, @CompatibleRegions, 
                @MinTemp, @MaxTemp, @MinPH, @MaxPH, @MinDO, @FingerlingSizeG, 
                @MarketSizeKG, @HarvestTimeMonths, @SurvivalRateLower, @SurvivalRateUpper,
                @MinMarketPrice, @MaxMarketPrice, @Description, @FeedingZone, @SubmittedBy
            );
            SELECT CAST(SCOPE_IDENTITY() AS INT) AS NewSpeciesId;
            `);

            const newSpeciesId = result.recordset[0].NewSpeciesId;

            // Insert Compatible Species
            if (data.CompatibleSpeciesIds && Array.isArray(data.CompatibleSpeciesIds)) {
                for (const partnerId of data.CompatibleSpeciesIds) {
                    const compReq = new sql.Request(transaction);
                    compReq.input('SpeciesId', sql.Int, newSpeciesId);
                    compReq.input('CompatibleWithId', sql.Int, partnerId);
                    compReq.input('Reason', sql.NVarChar, 'Custom Poly-culture compatibility');
                    await compReq.query(`
                        INSERT INTO SpeciesCompatibility (SpeciesId, CompatibleWithId, CompatibilityReason)
                        VALUES (@SpeciesId, @CompatibleWithId, @Reason)
                    `);
                }
            }

            // Insert Feed Rules
            const insertFeed = async (stage, feedType, minSize, maxSize, rate, freq) => {
                if (!feedType) return;
                const feedReq = new sql.Request(transaction);
                feedReq.input('SpeciesID', sql.Int, newSpeciesId);
                feedReq.input('Stage', sql.NVarChar, stage);
                feedReq.input('MinSize', sql.Float, minSize);
                feedReq.input('MaxSize', sql.Float, maxSize);
                feedReq.input('Rate', sql.Float, rate);
                feedReq.input('FeedType', sql.NVarChar, feedType);
                feedReq.input('Freq', sql.NVarChar, freq);

                await feedReq.query(`
                    INSERT INTO Feed_Rules (SpeciesID, Stage, MinSize_inch, MaxSize_inch, DailyRate_Percent, ConditionFactor_K, FeedType, Frequency)
                    VALUES (@SpeciesID, @Stage, @MinSize, @MaxSize, @Rate, 0.01, @FeedType, @Freq)
                `);
            };

            await insertFeed('Fingerling', data.FingerlingFeedType, 1.0, 5.0, 5.0, '3-4 times daily');
            await insertFeed('Grow-out', data.GrowOutFeedType, 5.0, 20.0, 3.0, '2-3 times daily');

            await transaction.commit();
            res.status(201).json({ success: true, message: "Custom species and feed guidelines added successfully!" });
        } catch (txnErr) {
            await transaction.rollback();
            throw txnErr;
        }

    } catch (err) {
        console.error("Species Add Error:", err);
        res.status(500).json({ error: "Failed to add species", message: err.message });
    }
});

// 4. GET Compatibility for a specific Species (Protected)
router.get('/:id/compatibility', auth, async (req, res) => {
    try {
        const pool = await poolPromise; // Standardized to poolPromise
        const result = await pool.request()
            .input('speciesId', sql.Int, req.params.id)
            .query(`
                SELECT 
                    c.CompatibilityId,
                    s1.Name AS MainSpeciesName,
                    s2.Name AS CompatibleSpeciesName,
                    c.CompatibilityReason
                FROM SpeciesCompatibility c
                INNER JOIN Species s1 ON c.SpeciesId = s1.SpeciesId
                INNER JOIN Species s2 ON c.CompatibleWithId = s2.SpeciesId
                WHERE c.SpeciesId = @speciesId OR c.CompatibleWithId = @speciesId
            `);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Database error", message: err.message });
    }
});

// 5. GET: Admin view of PENDING species (Admin only)
router.get('/admin/pending', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin role required." });
        }

        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Species WHERE IsApproved = 0');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: "Database error", message: err.message });
    }
});

// 6. PUT: Approve a species (Admin only)
router.put('/:id/approve', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin role required." });
        }

        const data = req.body;
        const pool = await poolPromise;
        const request = pool.request();
        
        request.input('speciesId', sql.Int, req.params.id);

        let query = 'UPDATE Species SET IsApproved = 1';

        // Check if data is provided and has keys
        if (data && Object.keys(data).length > 0) {
            const fields = [
                { key: 'Name', type: sql.NVarChar, val: data.Name },
                { key: 'ImageUrl', type: sql.NVarChar, val: data.ImageUrl },
                { key: 'MaxStockingDensity', type: sql.Decimal(10, 2), val: data.MaxStockingDensity },
                { key: 'CompatibleRegions', type: sql.NVarChar, val: data.CompatibleRegions },
                { key: 'MinTemp', type: sql.Int, val: data.MinTemp },
                { key: 'MaxTemp', type: sql.Int, val: data.MaxTemp },
                { key: 'MinPH', type: sql.Decimal(3, 1), val: data.MinPH },
                { key: 'MaxPH', type: sql.Decimal(3, 1), val: data.MaxPH },
                { key: 'MinDO', type: sql.Decimal(3, 1), val: data.MinDO },
                { key: 'FingerlingSizeG', type: sql.Int, val: data.FingerlingSizeG },
                { key: 'MarketSizeKG', type: sql.Decimal(10, 2), val: data.MarketSizeKG },
                { key: 'HarvestTimeMonths', type: sql.Int, val: data.HarvestTimeMonths },
                { key: 'SurvivalRateLower', type: sql.Decimal(5, 2), val: data.SurvivalRateLower },
                { key: 'SurvivalRateUpper', type: sql.Decimal(5, 2), val: data.SurvivalRateUpper },
                { key: 'MinMarketPrice', type: sql.Decimal(10, 2), val: data.MinMarketPrice },
                { key: 'MaxMarketPrice', type: sql.Decimal(10, 2), val: data.MaxMarketPrice },
                { key: 'Description', type: sql.NVarChar, val: data.Description },
                { key: 'FeedingZone', type: sql.NVarChar, val: data.FeedingZone }
            ];

            fields.forEach(field => {
                if (field.val !== undefined) {
                    query += `, ${field.key} = @${field.key}`;
                    request.input(field.key, field.type, field.val);
                }
            });
        }
        
        query += ' WHERE SpeciesId = @speciesId';

        await request.query(query);

        // Update Compatible Species if provided
        if (data && data.CompatibleSpeciesIds && Array.isArray(data.CompatibleSpeciesIds)) {
            // Delete existing compatibilities for this species
            const delReq = pool.request();
            delReq.input('speciesId', sql.Int, req.params.id);
            await delReq.query('DELETE FROM SpeciesCompatibility WHERE SpeciesId = @speciesId');

            // Insert new ones
            for (const partnerId of data.CompatibleSpeciesIds) {
                const compReq = pool.request();
                compReq.input('SpeciesId', sql.Int, req.params.id);
                compReq.input('CompatibleWithId', sql.Int, partnerId);
                compReq.input('Reason', sql.NVarChar, 'Admin approved poly-culture compatibility');
                await compReq.query(`
                    INSERT INTO SpeciesCompatibility (SpeciesId, CompatibleWithId, CompatibilityReason)
                    VALUES (@SpeciesId, @CompatibleWithId, @Reason)
                `);
            }
        }

        res.json({ success: true, message: "Species approved successfully!" });
    } catch (err) {
        console.error("Error approving species:", err);
        res.status(500).json({ error: "Database error", message: err.message });
    }
});

// 7. DELETE: Reject/Delete a species (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin role required." });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Delete dependent records first to resolve Foreign Key constraints
            const request = new sql.Request(transaction);
            request.input('speciesId', sql.Int, req.params.id);

            await request.query('DELETE FROM SpeciesCompatibility WHERE SpeciesId = @speciesId OR CompatibleWithId = @speciesId');
            
            // Delete the actual species
            await request.query('DELETE FROM Species WHERE SpeciesId = @speciesId');

            await transaction.commit();
            res.json({ success: true, message: "Species rejected and deleted." });
        } catch (txnErr) {
            await transaction.rollback();
            throw txnErr; // re-throw to outer catch block
        }
    } catch (err) {
        res.status(500).json({ error: "Database error", message: err.message });
    }
});

module.exports = router;