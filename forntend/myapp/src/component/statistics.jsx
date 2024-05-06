import React, { useEffect, useState } from "react";

const Statistics = () => {
    const [total, setTotal] = useState("");
    const [month, setMonth] = useState("3"); // Default month value

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/amount?month=${parseInt(month) + 1}`);
                const data = await response.json();
                setTotal(data);
            } catch (error) {
                console.error('Error fetching data:', error);
                // You might want to set an error state here and display it to the user
            }
        };

        fetchData(); // Call the function to fetch data when the component mounts or when month changes
    }, [month]); // Re-run effect when month changes

    const handleMonthChange = (e) => {
        setMonth(e.target.value); // Update month state when dropdown value changes
    };
    console.log(total)
    // Destructure data from total state
    const { total_selling_price, total_unsold_items, total_sold_items } = total;
    console.log(total_selling_price)
    return (
        <div style={{ textAlign: "center" }}>
            <label htmlFor="months" style={{ fontSize: "30px" }}>Statistics : </label>
            <select id="months" name="months" value={month} onChange={handleMonthChange}>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
            </select>
            <div style={{ backgroundColor: "orange", width: "80%", padding: '10px', marginLeft: "90px" }} >
                <h1>total Selling Price: {total_selling_price}</h1>
                <h1>total sold items: {total_sold_items}</h1>
                <h1>total unsold items: {total_unsold_items}</h1>
            </div>
        </div>
    );
}

export default Statistics;
