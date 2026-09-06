const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    // Look for the token in the 'Authorization' header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    // Usually, tokens are sent as "Bearer <token>"
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    try {
        const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SECRET_KEY';
        const verified = jwt.verify(token, JWT_SECRET);
        
        // Verify user is still active in the database
        if (req.pool) {
            const result = await req.pool.request()
                .input('uid', require('mssql/msnodesqlv8').Int, verified.id)
                .query('SELECT ISNULL(IsActive, 1) as IsActive FROM Users WHERE UserId = @uid');
            
            if (result.recordset.length === 0 || result.recordset[0].IsActive === false || result.recordset[0].IsActive === 0) {
                return res.status(401).json({ error: "Your account has been suspended." });
            }
        }

        req.user = verified; // This adds the user ID and Role to the request
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        res.status(401).json({ error: "Invalid or expired session" });
    }
};