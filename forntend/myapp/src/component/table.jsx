import React, { useEffect, useState } from "react";
import './sty.css'
const TransactionsTable = () => {
    const [transactions, setTransactions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(3); 
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/alltransactions?month=${selectedMonth}&search_q=${searchText}&page=${currentPage}`);
                //const {data}= await response.json();
                const {result,total_pages}=await response.json()
                console.log(response)
                setTransactions(result);
                setTotalPages(total_pages);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [selectedMonth, searchText, currentPage]); // Fetch data when month, search text, or page changes

  console.log(transactions)

    const handleMonthChange = (e) => {
        setSelectedMonth(parseInt(e.target.value));
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const handleNextPage = () => {
        setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage(currentPage - 1);
    };

    return (
        <div >
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
            <input type="text" placeholder="Search Transaction" value={searchText} onChange={handleSearch} />
           
            <table style={{backgroundColor:"yellow"}}>
                <thead>
                    <tr>
                        <th>Transaction ID</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>category</th>
                        <th>sold</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(transaction => (
                        <tr key={transaction.id}>
                            <td>{transaction.id}</td>
                            <td>{transaction.title}</td>
                            <td>{transaction.description}</td>
                            <td>{transaction.category }</td>
                            <td>{transaction.sold === 1 ? 'Sold' : 'Not Sold'}</td>
                            <td>{transaction.price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{textAlign:"center"}}>
            <button onClick={handlePrevPage} disabled={currentPage === 1} >Previous</button>
            <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>

            </div>
         

        </div>
    );
};

export default TransactionsTable;
