 import { useState, useEffect } from "react";



import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,Label } from 'recharts';



const BarChartComponent = () => {

         const [va, setva] = useState([]);
     const [selectedMonth, setSelectedMonth] = useState(3);



useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await fetch(`http://localhost:3000/av?month=${selectedMonth}`);
            //const {data}= await response.json();
            const  data  = await response.json()
            
            const valuesArray = data;
            setva(valuesArray)
        
            

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    fetchData();
}, [selectedMonth]);
const handleMonthChange=(e)=>{
    setSelectedMonth(e.target.value)

}
  return (

<>
    <h1>bar char stats</h1>

<label htmlFor="months">Select Month:</label>
                <select id="months" name="months" value={selectedMonth} onChange={handleMonthChange}>
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

 
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={va}>
        <CartesianGrid strokeDasharray="2 2" />
        
        <XAxis dataKey="category" >
        <Label angle={-45} position="insideLeft" style={{ textAnchor: 'end' }} />
        </XAxis>

        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="transaction_count" fill="#82ca9d" label={{ position: 'top' }} />
      </BarChart>
    </ResponsiveContainer>
    </>
  );
};

export default BarChartComponent;
