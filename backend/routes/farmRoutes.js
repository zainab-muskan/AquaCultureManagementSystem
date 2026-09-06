const express = require('express');
const router = express.Router();
const sql = require('mssql/msnodesqlv8');
const auth = require('../middleware/auth');

// --- SYSTEM CONSTANTS (No Magic Numbers) ---
const SYSTEM_CONSTANTS = {
    CONVERSIONS: {
        SQ_FT_PER_ACRE: 43560,
        LITERS_PER_CUBIC_FOOT: 28.317,
        GALLONS_PER_LITER: 0.264172
    },
    POND: {
        EARTHEN_RATIO: 2.5,
        EARTHEN_DEPTH: 6.5,
        CONCRETE_RATIO: 2.0,
        CONCRETE_DEPTH: 5.0,
        LINED_RATIO: 2.2,
        LINED_DEPTH: 6.0,
        DEFAULT_DEPTH: 5.0
    }
};

// --- HELPER: Logic to calculate specs for the auto-nursery ---
const calculatePondSpecs = (acres, pondType) => {
    const totalSqFt = acres * SYSTEM_CONSTANTS.CONVERSIONS.SQ_FT_PER_ACRE;
    let ratio = SYSTEM_CONSTANTS.POND.EARTHEN_RATIO;
    let depth = SYSTEM_CONSTANTS.POND.EARTHEN_DEPTH;
    const width = Math.sqrt(totalSqFt / ratio);
    const length = width * ratio;
    const volumeLiters = totalSqFt * depth * SYSTEM_CONSTANTS.CONVERSIONS.LITERS_PER_CUBIC_FOOT;

    return {
        length: Math.round(length),
        width: Math.round(width),
        depth: depth,
        volume: Math.round(volumeLiters)
    };
};


// POST /api/farm/calculate-pond-specs - Intelligent Species-Based Calculator
router.post('/calculate-pond-specs', auth, async (req, res) => {
    try {
        const { speciesList, totalFarmArea, stage, cultivationType, pondStructure, pondShape, pondSize } = req.body;

        if (!speciesList || speciesList.length === 0) {
            return res.status(400).json({ error: "No species provided" });
        }

        const pondStage = stage || 'Nursery';
        const pool = req.pool;

        // Strict Requirement: Nursery pond is strictly 10% of Total Farm Area
        const nurseryArea = pondStage === 'Nursery' ? (totalFarmArea || 5.0) * 0.1 : 0;

        let totalFishQuantity = 0;
        let maxRequiredDepth = 0;

        // Fetch requirements for each selected species to get depth and feeding zone
        let speciesInfo = [];
        for (const item of speciesList) {
            totalFishQuantity += Number(item.quantity);

            const result = await pool.request()
                .input('sId', sql.Int, item.speciesId)
                .query(`SELECT IdealDepth, Name, FeedingZone FROM Species WHERE SpeciesId = @sId`);

            if (result.recordset.length > 0) {
                const sp = result.recordset[0];
                const depth = sp.IdealDepth || SYSTEM_CONSTANTS.POND.DEFAULT_DEPTH;

                if (depth > maxRequiredDepth) {
                    maxRequiredDepth = depth;
                }
                speciesInfo.push({
                    speciesId: item.speciesId,
                    name: sp.Name,
                    feedingZone: sp.FeedingZone || 'Column',
                    quantity: Number(item.quantity)
                });
            }
        }

        if (maxRequiredDepth === 0) maxRequiredDepth = 5.0;

        // Fetch Stocking Capacity from DB based on Stage and CultivationType
        // Note: The DB holds 80000 for Extensive Nursery Polyculture, and ~2000 for Extensive Grow-out Default
        const cType = cultivationType || 'Extensive';

        // Normalize stage string to match database ('Grow-out' -> 'Grown-out')
        const dbStage = pondStage === 'Grow-out' ? 'Grown-out' : pondStage;

        const ruleResult = await pool.request()
            .input('pStage', sql.VarChar, dbStage)
            .input('cType', sql.VarChar, cType)
            .query(`
            SELECT MaxFishPerAcre FROM StockingRules 
            WHERE Stage = @pStage AND CultureType = 'Polyculture' AND CultivationType = @cType
        `);
        // If not found, fallback to basic Extensive
        const capacityPerAcre = ruleResult.recordset.length > 0 ? ruleResult.recordset[0].MaxFishPerAcre : (pondStage === 'Nursery' ? 80000 : 2000);

        // Area required for this specific batch
        const requiredAcres = totalFishQuantity / capacityPerAcre;

        if (maxRequiredDepth === 0) maxRequiredDepth = 5.0;

        // Physical Dimensions
        // User-entered pondSize takes priority for ALL pond types.
        // Fallback: Nursery uses 10% of farm area, Grow-out uses computed requiredAcres.
        const userPondSize = pondSize ? Number(pondSize) : null;
        const targetArea = userPondSize || (pondStage === 'Nursery' ? nurseryArea : requiredAcres);
        const totalSqFt = targetArea * SYSTEM_CONSTANTS.CONVERSIONS.SQ_FT_PER_ACRE;

        // Dynamic Ratio and Depth based on Pond Structure
        let ratio = SYSTEM_CONSTANTS.POND.EARTHEN_RATIO;
        const structType = (pondStructure || "").toLowerCase();

        if (structType.includes('concrete')) {
            ratio = SYSTEM_CONSTANTS.POND.CONCRETE_RATIO;
            // Concrete ponds have vertical walls, reducing max required depth slightly
            maxRequiredDepth = Math.max(SYSTEM_CONSTANTS.POND.CONCRETE_DEPTH, maxRequiredDepth - 0.5);
        } else if (structType.includes('lined')) {
            ratio = SYSTEM_CONSTANTS.POND.LINED_RATIO;
        }

        const shapeType = (pondShape || "Rectangle").toLowerCase();
        let width = 0;
        let length = 0;

        if (shapeType === 'square') {
            ratio = 1.0;
            width = Math.sqrt(totalSqFt);
            length = width;
        } else if (shapeType === 'circular') {
            ratio = 1.0;
            const radius = Math.sqrt(totalSqFt / Math.PI);
            width = radius * 2; // Diameter
            length = radius * 2; // Diameter
        } else {
            // Default Rectangle
            width = Math.sqrt(totalSqFt / ratio);
            length = width * ratio;
        }

        const volumeLiters = totalSqFt * maxRequiredDepth * SYSTEM_CONSTANTS.CONVERSIONS.LITERS_PER_CUBIC_FOOT;

        // Calculate per-species max allowed based on 30:40:30 feeding zone ratio
        // userPondSize is already defined above and used in targetArea
        const maxCapacityArea = pondStage === 'Nursery' ? nurseryArea : targetArea;
        const totalCapacity = Math.floor(maxCapacityArea * capacityPerAcre);
        const speciesBreakdown = speciesInfo.map(sp => {
            const zoneRatio = (sp.feedingZone === 'Column') ? 0.40 : 0.30;
            return {
                speciesId: sp.speciesId,
                name: sp.name,
                feedingZone: sp.feedingZone,
                zonePercent: Math.round(zoneRatio * 100),
                maxAllowed: Math.floor(totalCapacity * zoneRatio)
            };
        });

        res.json({
            success: true,
            data: {
                stage: pondStage,
                cultivationType: cType,
                targetArea: Number(targetArea.toFixed(3)),
                fixedNurseryArea: pondStage === 'Nursery' ? Number(nurseryArea.toFixed(3)) : null,
                requiredAcres: Number(requiredAcres.toFixed(4)),
                recommendedDepthFeet: Number(maxRequiredDepth.toFixed(1)),
                recommendedLengthFeet: Math.round(length) || 0,
                recommendedWidthFeet: Math.round(width) || 0,
                estimatedVolumeLiters: Math.round(volumeLiters) || 0,
                estimatedVolumeGallons: Math.round(volumeLiters * SYSTEM_CONSTANTS.CONVERSIONS.GALLONS_PER_LITER) || 0,
                totalCapacity,
                speciesBreakdown
            }
        });

    } catch (err) {
        console.error("Specs Calculation Error:", err);
        res.status(500).json({ error: "Failed to calculate dimensions" });
    }
});

// POST /api/farm/provision-pond - Adds a new Pond and its Stocking records
router.post('/provision-pond', auth, async (req, res) => {
    let transaction;
    try {
        const { pondPlan, pondSpecs } = req.body;

        if (!pondPlan || !pondSpecs) {
            return res.status(400).json({ error: "Missing provisioning parameters" });
        }

        const pool = req.pool;

        // 1. Get the user's Farm and Region
        const farmResult = await pool.request()
            .input("uId", sql.Int, req.user.id)
            .query(`SELECT FarmId, RegionId FROM Farm WHERE UserId = @uId`);

        if (farmResult.recordset.length === 0) {
            return res.status(404).json({ error: "Farm not found for this user." });
        }

        const farm = farmResult.recordset[0];
        const farmId = farm.FarmId;
        const regionId = farm.RegionId;

        // 2. Start Transaction
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // 3. Create Pond
        const pondResult = await transaction.request()
            .input("uId", sql.Int, req.user.id)
            .input("fId", sql.Int, farmId)
            .input("rId", sql.Int, regionId)
            .input("pSize", sql.Decimal(10, 2), pondSpecs.targetArea)
            .input("len", sql.Int, pondSpecs.recommendedLengthFeet)
            .input("wid", sql.Int, pondSpecs.recommendedWidthFeet)
            .input("dep", sql.Decimal(4, 2), pondSpecs.recommendedDepthFeet)
            .input("vol", sql.BigInt, Math.round(Number(pondSpecs.estimatedVolumeLiters) || 0))
            .input("volGal", sql.BigInt, pondSpecs.estimatedVolumeGallons || Math.round((Number(pondSpecs.estimatedVolumeLiters) || 0) * 0.264172))
            .input("pStage", sql.VarChar, pondSpecs.stage)
            .input("cType", sql.VarChar, pondSpecs.cultivationType || 'Extensive')
            .input("culType", sql.VarChar, pondSpecs.cultureType || 'Polyculture')
            .input("pName", sql.VarChar, pondSpecs.pondName || 'New Polyculture Pond')
            .input("pType", sql.VarChar, pondSpecs.pondType || 'Earthen')
            .query(`
                INSERT INTO Ponds (
                    UserId, FarmId, RegionId, PondName, Stage, 
                    CultureType, PondType, Size, CultivationType, LengthFeet, WidthFeet, DepthFeet, VolumeLiters, VolumeGallons, CreatedAt
                ) 
                OUTPUT INSERTED.PondId
                VALUES (
                    @uId, @fId, @rId, @pName, @pStage, 
                    @culType, @pType, @pSize, @cType, @len, @wid, @dep, @vol, @volGal, GETDATE()
                )
            `);

        const newPondId = pondResult.recordset[0].PondId;

        // 4. Create Stocking Records
        for (const batch of pondPlan) {
            // Get species price
            const speciesResult = await transaction.request()
                .input("sId", sql.Int, batch.speciesId)
                .query(`SELECT ISNULL(MinMarketPrice, 0.0) as Price FROM Species WHERE SpeciesId = @sId`);
            const fingerlingPrice = speciesResult.recordset.length > 0 ? (speciesResult.recordset[0].Price * 0.1) : 15.0;

            await transaction.request()
                .input("sId", sql.Int, batch.speciesId)
                .input("pondId", sql.BigInt, newPondId)
                .input("uId", sql.Int, req.user.id)
                .input("qty", sql.Int, batch.quantity)
                .input("pp", sql.Decimal(10, 2), fingerlingPrice)
                .input("pStage", sql.VarChar, pondSpecs.stage)
                .query(`
                    INSERT INTO Stocking (
                        SpeciesId, Quantity, PricePerPiece, CurrentSizeInches, TargetSizeInches,
                        Status, OriginalPondId, CurrentPondId, UserId, StockingDate
                    )
                    VALUES (
                        @sId, @qty, @pp, 2.0, 20.0, 
                        @pStage, @pondId, @pondId, @uId, GETDATE()
                    )
                `);
        }

        // 5. Computed columns automatically handle RemainingArea. No need to manually deduct.

        await transaction.commit();
        res.status(201).json({ success: true, pondId: newPondId });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("PROVISION TRANSACTION ERROR:", err);
        res.status(500).json({ error: "Pond provisioning failed", details: err.message });
    }
});

// POST /api/farm/preview - Calculate Farm Split Dynamically
router.post('/preview', auth, async (req, res) => {
    const { totalArea } = req.body;

    if (!totalArea || totalArea <= 0) {
        return res.status(400).json({ error: "Invalid area" });
    }

    const nurserySize = parseFloat(totalArea) * 0.1;
    const growOutSize = parseFloat(totalArea) - nurserySize;

    res.json({
        success: true,
        data: {
            nurseryArea: nurserySize,
            growOutArea: growOutSize,
            nurseryPercentage: 10,
            growOutPercentage: 90
        }
    });
});

// POST /api/farm/update-preview - Calculate preview for area change
router.post('/update-preview', auth, async (req, res) => {
    const { newTotalArea } = req.body;
    const uId = req.user.id;

    try {
        const pool = req.pool;
        const result = await pool.request()
            .input('uId', sql.Int, uId)
            .query(`
                SELECT 
                    TotalAreaAcres as currentTotal,
                    (SELECT ISNULL(SUM(CAST(Size AS FLOAT)), 0) FROM Ponds WHERE UserId = @uId) as usedArea
                FROM Farm WHERE UserId = @uId
            `);

        if (result.recordset.length === 0) return res.status(404).json({ error: "Farm not found" });

        const { currentTotal, usedArea } = result.recordset[0];
        const additionalSpace = Math.max(newTotalArea - currentTotal, 0);
        const newAvailable = Math.max(newTotalArea - usedArea, 0);

        res.json({
            success: true,
            data: {
                currentTotal,
                usedArea,
                newTotal: newTotalArea,
                newAvailable,
                additionalSpace,
                isValid: newTotalArea >= usedArea
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Preview failed", details: err.message });
    }
});


// GET /api/farm/area-usage
router.get('/area-usage', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = req.pool;

        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT 
                    -- Get the farm's total size from Farm table (TOP 1 to prevent multiple row error)
                    (SELECT TOP 1 ISNULL(TotalAreaAcres, 5.0) FROM Farm WHERE UserId = @userId ORDER BY SetupDate DESC) as totalFarmArea,
                    
                    -- Sum up the size of all ponds owned by this user
                    (SELECT ISNULL(SUM(CAST(Size AS FLOAT)), 0) 
                     FROM Ponds 
                     WHERE UserId = @userId) as usedArea
            `);

        if (!result.recordset || result.recordset.length === 0) {
            return res.json({
                success: true,
                data: { totalArea: 5.0, usedArea: 0, remainingArea: 5.0, usagePercentage: "0.00", unit: "acres" }
            });
        }

        const { totalFarmArea, usedArea } = result.recordset[0];
        const finalTotalArea = Number(totalFarmArea || 5.0);
        const finalUsedArea = Number(usedArea || 0);
        const remainingArea = Math.max(0, finalTotalArea - finalUsedArea);

        // Calculate percentage for the frontend progress bar
        const usagePercentage = finalTotalArea > 0 ? (finalUsedArea / finalTotalArea) * 100 : 0;

        res.json({
            success: true,
            data: {
                totalArea: finalTotalArea,
                usedArea: finalUsedArea,
                remainingArea: remainingArea,
                usagePercentage: (usagePercentage || 0).toFixed(2),
                unit: "acres"
            }
        });
    } catch (err) {
        console.error("FARM AREA ERROR DETAILS:", err);
        res.status(500).json({
            success: false,
            error: "Could not retrieve farm area stats",
            details: err.message
        });
    }
});



// --- 1. READ: Get Farm Details (Protected) ---
router.get("/my-farm", auth, async (req, res) => {
    try {
        const pool = req.pool;
        const result = await pool.request()
            .input("uId", sql.Int, req.user.id)
            .query(`
                SELECT 
                    U.UserId, 
                    U.FullName, 
                    U.Email, 
                    U.FarmName, 
                    F.FarmId, 
                    F.TotalAreaAcres, 
                    F.RegionId, 
                    R.RegionName,
                    F.RemainingArea, 
                    F.SetupDate
                FROM Users U
                LEFT JOIN Farm F ON U.UserId = F.UserId
                LEFT JOIN Regions R ON F.RegionId = R.RegionId
                WHERE U.UserId = @uId
            `);
        if (result.recordset.length === 0) return res.status(404).json({ error: "Farm not found" });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: "Fetch failed", details: err.message });
    }
});

// --- 2. POST: Setup Farm Profile (Now Polyculture Dynamic) ---
router.post('/setup', auth, async (req, res) => {
    const { totalArea, regionId, latitude, longitude, pondPlan, pondSpecs } = req.body;
    let transaction;

    try {
        const pool = req.pool;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Step A: Check if Farm already exists for this user
        const existingFarm = await transaction.request()
            .input("uId", sql.Int, req.user.id)
            .query("SELECT FarmId, RegionId FROM Farm WHERE UserId = @uId");

        let newFarmId;

        if (existingFarm.recordset.length > 0) {
            newFarmId = existingFarm.recordset[0].FarmId;
        } else {
            // Step B: Insert the Farm using ONLY RegionId (and now coordinates)
            const farmResult = await transaction.request()
                .input("uId", sql.Int, req.user.id)
                .input("area", sql.Decimal(10, 2), totalArea || 5.0)
                .input("rId", sql.Int, regionId)
                .input("lat", sql.Decimal(10, 8), latitude || null)
                .input("lng", sql.Decimal(11, 8), longitude || null)
                .query(`
                    INSERT INTO Farm (UserId, TotalAreaAcres, RegionId, Latitude, Longitude, SetupDate)
                    OUTPUT INSERTED.FarmId
                    VALUES (@uId, @area, @rId, @lat, @lng, GETDATE())
                `);
            newFarmId = farmResult.recordset[0].FarmId;
        }

        // Step C: Provision the calculated Pond if pondSpecs was provided
        if (pondSpecs && pondPlan && pondPlan.length > 0) {
            const pondResult = await transaction.request()
                .input("uId", sql.Int, req.user.id)
                .input("fId", sql.Int, newFarmId)
                .input("rId", sql.Int, regionId)
                .input("nSize", sql.Decimal(10, 2), pondSpecs.fixedNurseryArea) // Strictly 10%
                .input("len", sql.Int, pondSpecs.recommendedLengthFeet)
                .input("wid", sql.Int, pondSpecs.recommendedWidthFeet)
                .input("dep", sql.Decimal(4, 2), pondSpecs.recommendedDepthFeet)
                .input("vol", sql.BigInt, pondSpecs.estimatedVolumeLiters)
                .input("volGal", sql.BigInt, pondSpecs.estimatedVolumeGallons)
                .input("cType", sql.VarChar, pondSpecs.cultivationType || 'Extensive')
                .query(`
                    INSERT INTO Ponds (
                        UserId, FarmId, RegionId, PondName, Stage, CultureType, 
                        PondType, Size, CultivationType, LengthFeet, WidthFeet, DepthFeet, VolumeLiters, VolumeGallons, CreatedAt
                    )
                    OUTPUT INSERTED.PondId
                    VALUES (
                        @uId, @fId, @rId, 'Polyculture Pond 1', 'Nursery', 
                        'Polyculture', 'Earthen', @nSize, @cType, @len, @wid, @dep, @vol, @volGal, GETDATE()
                    )
                `);

            const newPondId = pondResult.recordset[0].PondId;

            // Step D: Insert the specific fish batches into the Stocking table
            for (const batch of pondPlan) {
                // Fetch basic pricing details to generate an initial estimated investment
                const priceRes = await transaction.request()
                    .input("sId", sql.Int, batch.speciesId)
                    .query("SELECT MinMarketPrice, FingerlingSizeG FROM Species WHERE SpeciesId = @sId");

                let fingerlingPrice = 5; // default fallback 
                if (priceRes.recordset.length > 0) {
                    // Fingerlings cost a fraction of the adult market price, we'll estimate 5%
                    fingerlingPrice = Math.max(1, (priceRes.recordset[0].MinMarketPrice * 0.05).toFixed(0));
                }

                const totalInvestment = batch.quantity * fingerlingPrice;

                await transaction.request()
                    .input("sId", sql.Int, batch.speciesId)
                    .input("pondId", sql.Int, newPondId)
                    .input("uId", sql.Int, req.user.id)
                    .input("qty", sql.Int, batch.quantity)
                    .input("pp", sql.Decimal(10, 2), fingerlingPrice)
                    .query(`
                        INSERT INTO Stocking (
                            SpeciesId, Quantity, PricePerPiece, CurrentSizeInches, TargetSizeInches,
                            Status, OriginalPondId, CurrentPondId, UserId, StockingDate
                        )
                        VALUES (
                            @sId, @qty, @pp, 2.0, 20.0, 
                            'Nursery', CAST(@pondId AS BIGINT), CAST(@pondId AS BIGINT), @uId, GETDATE()
                        )
                    `);
            }
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: "Farm, Pond, and Polyculture stock created successfully.",
            farmId: newFarmId,
            regionId: regionId
        });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("SETUP TRANSACTION ERROR:", err.message);
        res.status(500).json({ error: "Setup failed", details: err.message });
    }
});

// --- 3. UPDATE: Change Total Area or RegionId (Protected) ---
// --- 3. UPDATE: Change Total Area or RegionId (Improved) ---
router.put("/update", auth, async (req, res) => {
    const { totalArea, regionId, latitude, longitude } = req.body;
    try {
        const pool = req.pool;
        const uId = req.user.id;

        // NEW: Safety Check
        if (totalArea) {
            const usedAreaResult = await pool.request()
                .input("uId", sql.Int, uId)
                .query("SELECT ISNULL(SUM(CAST(Size AS FLOAT)), 0) as used FROM Ponds WHERE UserId = @uId");

            const currentlyUsed = usedAreaResult.recordset[0].used;

            if (totalArea < currentlyUsed) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid Area: You are already using ${currentlyUsed} acres for ponds. You cannot set farm size smaller than that.`
                });
            }
        }

        // Existing Update Logic
        await pool.request()
            .input("uId", sql.Int, uId)
            .input("area", sql.Decimal(10, 2), totalArea || null)
            .input("rId", sql.Int, regionId || null)
            .input("lat", sql.Decimal(10, 8), latitude || null)
            .input("lng", sql.Decimal(11, 8), longitude || null)
            .query(`
                UPDATE Farm 
                SET TotalAreaAcres = ISNULL(@area, TotalAreaAcres),
                    RegionId = ISNULL(@rId, RegionId),
                    Latitude = ISNULL(@lat, Latitude),
                    Longitude = ISNULL(@lng, Longitude)
                WHERE UserId = @uId
            `);

        res.json({
            success: true,
            message: "Farm updated successfully."
        });
    } catch (err) {
        res.status(500).json({ error: "Update failed", details: err.message });
    }
});

// --- 4. DELETE: Remove Farm — Full Cascade Reset (Protected) ---
router.delete("/reset-farm", auth, async (req, res) => {
    try {
        const pool = req.pool;
        const uId = req.user.id;

        // Verify farm exists
        const farmCheck = await pool.request()
            .input("uId", sql.Int, uId)
            .query("SELECT FarmId FROM Farm WHERE UserId = @uId");

        if (farmCheck.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "No farm found for this user." });
        }

        // Delete in dependency order — each wrapped so missing tables don't crash
        const deletions = [
            "DELETE FROM FeedSchedule WHERE PondId IN (SELECT PondId FROM Ponds WHERE UserId = @uId)",
            "DELETE FROM Feed_Logs WHERE PondId IN (SELECT PondId FROM Ponds WHERE UserId = @uId)",
            "DELETE FROM Fertilizers_Logs WHERE PondId IN (SELECT PondId FROM Ponds WHERE UserId = @uId)",
            "DELETE FROM Treatment_Logs WHERE OutbreakId IN (SELECT OutbreakId FROM Disease_Outbreaks WHERE PondId IN (SELECT PondId FROM Ponds WHERE UserId = @uId))",
            "DELETE FROM Disease_Outbreaks WHERE PondId IN (SELECT PondId FROM Ponds WHERE UserId = @uId)",
            "DELETE FROM Mortality_Logs WHERE PondId IN (SELECT PondId FROM Ponds WHERE UserId = @uId)",
            "DELETE FROM Growth_History WHERE StockId IN (SELECT StockId FROM Stocking WHERE UserId = @uId)",
            "DELETE FROM Harvest_Logs WHERE PondId IN (SELECT PondId FROM Ponds WHERE UserId = @uId)",
            "DELETE FROM Expense_log WHERE UserId = @uId OR PondId IN (SELECT PondId FROM Ponds WHERE UserId = @uId)",
            "DELETE FROM WaterQualityLogs WHERE PondId IN (SELECT PondId FROM Ponds WHERE UserId = @uId)",
            "DELETE FROM Pond_Inventory WHERE PondId IN (SELECT PondId FROM Ponds WHERE UserId = @uId)",
            "DELETE FROM Stocking WHERE UserId = @uId",
            "DELETE FROM Activity_log WHERE UserId = @uId",
            "DELETE FROM FarmTasks WHERE UserId = @uId",
            "DELETE FROM FarmRatings WHERE FarmId IN (SELECT FarmId FROM Farm WHERE UserId = @uId)",
            "DELETE FROM PurchaseRequests WHERE FarmId IN (SELECT FarmId FROM Farm WHERE UserId = @uId)",
            "DELETE FROM Feed_Stock WHERE UserId = @uId",
            "DELETE FROM Fertilizer_Stock WHERE UserId = @uId",
            "DELETE FROM Treatment_Stock WHERE UserId = @uId",
            "DELETE FROM Ponds WHERE UserId = @uId",
            "DELETE FROM Farm WHERE UserId = @uId",
        ];

        for (const query of deletions) {
            try {
                await pool.request().input("uId", sql.Int, uId).query(query);
            } catch (e) {
                console.warn(`Skipped: ${query.substring(0, 50)}... (${e.message})`);
            }
        }

        res.json({ success: true, message: "Farm and all associated data deleted successfully." });
    } catch (err) {
        console.error("FARM RESET ERROR:", err);
        res.status(500).json({ error: "Farm reset failed", details: err.message });
    }
});

// --- 5. READ: View Farm by Specific ID (Protected) ---
router.get("/view/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = req.pool;

        const result = await pool.request()
            .input("fId", sql.Int, id)
            .query(`
                SELECT 
                    U.UserId, 
                    U.FullName as OwnerName, 
                    U.Email, 
                    U.FarmName, 
                    F.FarmId, 
                    F.TotalAreaAcres, 
                    F.RegionId, -- Updated to ID
                    F.RemainingArea, 
                    F.SetupDate
                FROM Farm F
                INNER JOIN Users U ON F.UserId = U.UserId
                WHERE F.FarmId = @fId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "No farm found with that ID." });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: "Fetch failed", details: err.message });
    }
});

// --- 6. READ: Get Comprehensive PnL ---
router.get('/pnl', auth, async (req, res) => {
    try {
        const uId = req.user.id;
        const pool = req.pool;

        // 1. Initial Budget
        const farmRes = await pool.request()
            .input('uId', sql.Int, uId)
            .query("SELECT ISNULL(InitialBudget, 0) as InitialBudget FROM Farm WHERE UserId = @uId");

        let initialBudget = 0;
        if (farmRes.recordset.length > 0) {
            initialBudget = farmRes.recordset[0].InitialBudget;
        }

        // 2. Total Expenses
        const expRes = await pool.request()
            .input('uId', sql.Int, uId)
            .query(`
                SELECT ISNULL(SUM(Amount), 0) as TotalExpenses 
                FROM Expense_log 
                WHERE UserId = @uId 
                   OR PondId IN (SELECT PondId FROM Ponds WHERE UserId = @uId)
            `);
        const totalExpenses = expRes.recordset[0].TotalExpenses;

        // 3. Harvest Revenue
        const revRes = await pool.request()
            .input('uId', sql.Int, uId)
            .query(`
                SELECT ISNULL(SUM(H.Revenue_PKR), 0) as TotalRevenue 
                FROM Harvest_Logs H
                JOIN Ponds P ON H.PondId = P.PondId
                WHERE P.UserId = @uId
            `);
        const totalRevenue = revRes.recordset[0].TotalRevenue;

        res.json({
            success: true,
            initialBudget,
            totalExpenses,
            totalRevenue,
            netProfit: totalRevenue - totalExpenses,
            remainingBudget: (initialBudget - totalExpenses) + totalRevenue
        });

    } catch (err) {
        res.status(500).json({ error: "Failed to fetch PNL", details: err.message });
    }
});

// --- 7. UPDATE: Initial Budget ---
router.post('/update-budget', auth, async (req, res) => {
    try {
        const { initialBudget } = req.body;
        await req.pool.request()
            .input('uId', sql.Int, req.user.id)
            .input('budget', sql.Decimal(18, 2), initialBudget || 0)
            .query("UPDATE Farm SET InitialBudget = @budget WHERE UserId = @uId");
        res.json({ success: true, message: "Budget updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Budget update failed", details: err.message });
    }
});

module.exports = router;