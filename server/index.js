const express = require('express');
const app = express();
const studentRoutes = require('./Routes/StudentRoutes');
const markRoutes = require('./Routes/MarkRoutes');

app.use(express.json());
app.use('/api', studentRoutes);
app.use("/api", markRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
