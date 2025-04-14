import connectToDb from "../db/connectToDb.js";
import { app } from "./app.js";
import "dotenv/config";
connectToDb()
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT} 🛜`);
});

