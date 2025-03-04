document.addEventListener("DOMContentLoaded", () => {
    usersSelect();

    document.querySelector("form").addEventListener("submit", (event) => {
        event.preventDefault();
        getHistory();
    });
});

let all_users = null;
let measurements = null;
let deviationIds = null

async function usersSelect() {
    let url = "http://localhost:3000/Users/getUsers";
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();
        all_users = data.users;
        let s = "";
        for (let user of all_users) {
            s += `<option value="${user.id}">${user.full_name}</option>`;
        }
        document.querySelector(".user-select").innerHTML = s;

    } catch (error) {
        console.error("Error loading users:", error);
    }
}

// Delete measurement
async function deleteMadad(id) {
    const isConfirmed = confirm(`Are you sure you want to delete this measurement? This action cannot be undone.`);

    if (isConfirmed) {
        try {
            const response = await fetch("http://localhost:3000/madadim/deleteMadadim", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({id: id})
            });

            if (response.ok) {
                alert("Measurement deleted successfully");
                getHistory();
            } else {
                throw new Error("Failed to delete measurement");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error deleting measurement");
        }
    }
}

// Update measurement
async function updateMadad(id) {
    const measurement = measurements.find(m => m.id === id);

    try {
        if (!measurement) {
            alert("The measurement cannot be found");
            return;
        }

        const isNumber = (value) => /^\d+$/.test(String(value));

        let newLow;
        let isLowValid = false;
        while (!isLowValid) {
            newLow = prompt("Enter new diastolic value:", measurement.low);
            if (newLow === null) return; // User clicked Cancel

            if (isNumber(newLow) && parseInt(newLow) >= 40 && parseInt(newLow) <= 120) {
                isLowValid = true;
            } else {
                alert("Diastolic value must be a number between 40 and 120");
            }
        }

        let newHigh;
        let isHighValid = false;
        while (!isHighValid) {
            newHigh = prompt("Enter new systolic value:", measurement.high);
            if (newHigh === null) return; // User clicked Cancel

            if (!isNumber(newHigh) || parseInt(newHigh) < 80 || parseInt(newHigh) > 220) {
                alert("Systolic value must be a number between 80 and 220");
            }
            else if (parseInt(newHigh) <= parseInt(newLow)) {
                alert("Systolic value must be greater than diastolic value");
            }
            else {
                isHighValid = true;
            }
        }

        let newPulse;
        let isPulseValid = false;
        while (!isPulseValid) {
            newPulse = prompt("Enter new pulse value:", measurement.pulse);
            if (newPulse === null) return; // User clicked Cancel

            if (isNumber(newPulse) && parseInt(newPulse) >= 40 && parseInt(newPulse) <= 220) {
                isPulseValid = true;
            } else {
                alert("Pulse must be a number between 40 and 220");
            }
        }

        const response = await fetch("http://localhost:3000/madadim/updateMadadim", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                high: newHigh,
                low: newLow,
                pulse: newPulse
            })
        });

        if (response.ok) {
            alert("Measurement updated successfully!");
            getHistory();
        } else {
            const errorText = await response.text();
            console.error("Server error:", errorText);
            alert("Error updating measurement.");
        }

    } catch (error) {
        console.error("error:", error);
        alert("Error connecting to server");
    }
}

async function getHistory() {
    const userId = document.querySelector(".user-select").value;
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    if (!userId || !startDate || !endDate) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const url = "http://localhost:3000/history/getHistory";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: userId,
                startDate: startDate,
                endDate: endDate
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        measurements = data.measurements;
        deviationIds = data.deviationIds;

        CreateTableHeader();
        CreateTableBody();
    } catch (error) {
        console.error("Error loading history:", error);
    }
}

function CreateTableHeader() {
    let s = "";
    s += "<tr>";
    s += "<th>Date</th>";
    s += "<th>Diastolic</th>";
    s += "<th>Systolic</th>";
    s += "<th>Pulse</th>";
    s += "<th>Actions</th>";
    s += "</tr>";
    document.getElementById("mainHeader").innerHTML = s;
}

function CreateTableBody() {
    let s = "";

    if (measurements && measurements.length > 0) {
        for (let i = 0; i < measurements.length; i++) {
            const measurement = measurements[i];
            const date = new Date(measurement.date);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

            const isDeviation = deviationIds?.includes(measurement.id) || false;

            if (isDeviation) {
                s += "<tr>";
                s += `<td class="isBold">${formattedDate}</td>`;
                s += `<td class="isBold">${measurement.low}</td>`;
                s += `<td class="isBold">${measurement.high}</td>`;
                s += `<td class="isBold">${measurement.pulse}</td>`;
                s += `<td class="isBold">
                        <button type="button" class="updateButton" onclick="updateMadad(${measurement.id})">UPDATE</button>
                        <button type="button" class="deleteButton" onclick="deleteMadad(${measurement.id})">DELETE</button>
                     </td>`;
                s += "</tr>";
            } else {
                s += "<tr>";
                s += `<td>${formattedDate}</td>`;
                s += `<td>${measurement.low}</td>`;
                s += `<td>${measurement.high}</td>`;
                s += `<td>${measurement.pulse}</td>`;
                s += `<td>
                        <button type="button" class="updateButton" onclick="updateMadad(${measurement.id})">UPDATE</button>
                        <button type="button" class="deleteButton" onclick="deleteMadad(${measurement.id})">DELETE</button>
                     </td>`;
                s += "</tr>";
            }
        }
    } else {
        s += "<tr><td colspan='5'>No data to display.</td></tr>";
    }

    document.getElementById("mainTableData").innerHTML = s;
}