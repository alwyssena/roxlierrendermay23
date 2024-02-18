const express = require("express");
const path = require("path");
const axios = require("axios"); /*Importing the axios library*/

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

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


// get all transactions
app.get("/alltransactions",async(req,res)=>{
    const {
        
        
        order = "ASC",
        order_by = "id",
        search_q = "",
      } = req.query;

    const query=`select * from transation 
    where title LIKE '%${search_q}%' or description LIKE '%${search_q}%' or price LIKE '%${search_q}%'
    
    ORDER BY ${order_by} ${order}
    LIMIT 10 ;`
    const result = await db.all(query);
    //console.log(result)
     res.send(result)
})

app.get("/amount",async(req,res)=>{
    const query=`select sum(price)  ,count(
        CASE
          WHEN sold="0" THEN 1
        END
      ) AS totalunsolditems,count(
        CASE
          WHEN sold="1" THEN 1
        END
      ) AS totalsolditems
    from transation group by strftime('%m', dateofsale) having CAST(strftime('%m', dateofsale) AS INTEGER)=5; `
    const result= await db.get(query)
    res.send(result)
    

})

app.get("/av",async(req,res)=>{
    const query=`select  
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
    
    from transation group by strftime('%m', dateofsale) having CAST(strftime('%m', dateofsale) AS INTEGER)=5;`
    const result= await db.get(query)
    res.send(result)


})


app.get("/b",async(req,res)=>{
    const query=`SELECT
    category,
    count() AS c
  FROM
    transation
    where CAST(strftime('%m', dateofsale) AS INTEGER)=5
  GROUP BY
    category
    ;`
    const result= await db.all(query)
    res.send(result)
    
})





initializeDBAndServer();









// count(CASE WHEN price < 100 and price >=200 THEN 1 end) AS "101-200",
// count(case when price <200 and price>=300 then 1 end) as "201-300",
// count(case when price<300 and price>=400 then 1 end) as "301-400"