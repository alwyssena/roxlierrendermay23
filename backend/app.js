const express = require("express");
const path = require("path");
const axios = require("axios"); /*Importing the axios library*/
const cors = require("cors")

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(cors())
const dbPath = path.join(__dirname, "transation.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};


const fetchAndInsert = async () => {
  const response = await axios.get(
    "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
  );
  const data = response.data;

  for (let item of data) {
    const queryData = `SELECT id FROM transation WHERE id = ${item.id}`;
    const existingData = await db.get(queryData);
    if (existingData === undefined) {
      const query = `
   INSERT INTO transation (id, title, price, description, category, image, sold, dateOfSale) 
   VALUES (
       ${item.id},
       '${item.title.replace(/'/g, "''")}',
       ${item.price},
       '${item.description.replace(/'/g, "''")}',
       '${item.category.replace(/'/g, "''")}',
       '${item.image.replace(/'/g, "''")}',
       ${item.sold},
       '${item.dateOfSale.replace(/'/g, "''")}'
   );
`; /*The .replace(/'/g, "''") in the SQL query helps prevent SQL injection attacks by escaping single quotes.*/

      await db.run(query);
    }
  }
  console.log("Transaction added");
};

fetchAndInsert();

//API to list the all transactions

app.get("/allrecords", async (req, res) => {
  const {
    search_q = "",
    page = 1
  } = req.query;


  const offset = (page - 1) * 10;

  const query = `
    SELECT * 
    FROM transation 
    WHERE 
         
         (
            title LIKE '%${search_q}%' 
            OR price LIKE '%${search_q}%' 
            OR description LIKE '%${search_q}%'
        )
        order by id 
        LIMIT 10
        OFFSET ${offset}
        ;
`;



  const result = await db.all(query);
  //console.log(result)
  res.send(result)
})


// get all transactions selected month
app.get("/alltransactions", async (req, res) => {
  const {

    month = 3,

    search_q = "",
    page = 1
  } = req.query;

  const offset = (page - 1) * 10;
 
  const query = `
  SELECT * 
  FROM transation 
  WHERE 
      CAST(strftime('%m', dateofsale) AS INTEGER) = ${month} 
      AND (
          title LIKE '%${search_q}%' 
          OR price LIKE '%${search_q}%' 
          OR description LIKE '%${search_q}%'
      )
  ORDER BY id
  LIMIT 10
  OFFSET ${offset};
`;




  const result = await db.all(query);
  //console.log(result)
  res.send({ result, total_pages: Math.ceil(result.length / 10) });
})



app.get("/amount", async (req, res) => {
  // Set default value of 3 for month if query parameter is not provided
  const month = req.query.month || '3';
  console.log(month)
  // Check if the month parameter is invalid
  if (isNaN(parseInt(month))) {
    return res.status(400).send("Invalid month parameter");
  }

  try {
    const query = `
          SELECT 
              SUM(price) AS total_selling_price,
              COUNT(CASE WHEN sold = 0 THEN 1 END) AS total_unsold_items,
              COUNT(CASE WHEN sold = 1 THEN 1 END) AS total_sold_items
          FROM 
              transation 
          WHERE 
              CAST(strftime('%m', dateofsale) AS INTEGER) = ${month}
          GROUP BY 
              strftime('%m', dateofsale);
      `;

    // Execute the SQL query with the month parameter
    const result = await db.get(query);
    res.send(result);
  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/av", async (req, res) => {
  const month = req.query.month || '3';
  const query = `select  
count(CASE WHEN price<=100 THEN 1 end) AS "0-100",
count(CASE WHEN price > 100 and price <=200 THEN 1 end) AS "101-200",
count(case when price >200 and price<=300 then 1 end) as "201-300",
count(case when price>300 and price<=400 then 1 end) as "301-400",
count(case when price>400 and price<=500 then 1 end) as "401-500",
count(case when price>500 and price<=600 then 1 end) as "501-600",
count(case when price>600 and price<=700 then 1 end) as "601-700",
count(case when price>700 and price<=800 then 1 end) as "701-800",
count(case when price>800 and price<=900 then 1 end) as "801-900",
count(case when price>900 then 0 end) as "900-more"
    
    from transation group by strftime('%m', dateofsale) having CAST(strftime('%m', dateofsale) AS INTEGER)=${month};`
  const result = await db.get(query)
  console.log(result)
  const transformedResult = Object.entries(result).map(([category, transaction_count]) => ({ category, transaction_count }));
  res.send(transformedResult)


})






app.get("/b", async (req, res) => {
  const query = `SELECT
      category,
      count(*) AS transaction_count
  FROM
      transation
  WHERE
      CAST(strftime('%m', dateofsale) AS INTEGER) = 5
  GROUP BY
      category;`;

  const result = await db.all(query)

  //   // Remove the "category" key from each object and rename it to the category name
  const transformedResult = result.map(({ category, transaction_count }) => ({ [category]: transaction_count }));

  //   // Send the response
  res.json(transformedResult);
});


initializeDBAndServer();









// count(CASE WHEN price < 100 and price >=200 THEN 1 end) AS "101-200",
// count(case when price <200 and price>=300 then 1 end) as "201-300",
// count(case when price<300 and price>=400 then 1 end) as "301-400"