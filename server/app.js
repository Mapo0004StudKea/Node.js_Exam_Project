import express from 'express';
import 'dotenv/config';

const app = express();

app.use(express.json());

app.use(express.static("public"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server is running on port", PORT));
