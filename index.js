const fs = require("fs"); // Use require for the file system module
const url = "https://mainnet.helius-rpc.com/?api-key=<yourAPIkey>";

const getTokenAccounts = async () => {
    const fetch = (await import("node-fetch")).default; 
    let allOwners = new Set(); 
    let cursor; 

    while (true) {
        let params = {
            limit: 1000, 
            mint: "tokenADDRESShere" 
        };

        if (cursor != undefined) {
            params.cursor = cursor;
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: "helius-test",
                method: "getTokenAccounts",
                params: params,
            }),
        });

        const data = await response.json();
   
        if (!data.result || data.result.token_accounts.length === 0) {
            console.log("No more results");
            break;
        }

        data.result.token_accounts.forEach((account) => {
            allOwners.add(account.owner);
        });

        cursor = data.result.cursor;
    }

    const csvRows = ["owner"]; // Header for CSV
    Array.from(allOwners).forEach((owner) => {
        csvRows.push(owner); // Add each owner as a new row
    });

    fs.writeFileSync("token_owners.csv", csvRows.join("\n"), "utf8");
    console.log("Data saved to token_owners.csv");
};

getTokenAccounts();
