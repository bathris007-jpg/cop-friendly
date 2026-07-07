// Secure Admin Panel Logic

async function checkLogin() {
    const cop_id = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cop_id, password })
        });
        const data = await response.json();

        if (data.success) {
            // Unlock
            document.getElementById('security-overlay').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
            
            // Load data
            loadAdminData();
        } else {
            document.getElementById('login-error').style.display = 'block';
            document.getElementById('password-input').value = "";
        }
    } catch (err) {
        document.getElementById('login-error').innerText = "Connection Error";
        document.getElementById('login-error').style.display = 'block';
    }
}

// Allow enter key
document.getElementById('password-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        checkLogin();
    }
});

async function loadAdminData() {
    // 1. Fetch Stats for Charts
    try {
        const statsRes = await fetch('/api/stats');
        const statsData = await statsRes.json();
        
        if (statsData.success) {
            renderCharts(statsData.districtStats, statsData.typeStats);
        }
    } catch (err) {
        console.error("Error fetching stats:", err);
    }

    // 2. Fetch Complaints for Table
    try {
        const compRes = await fetch('/api/complaints');
        const compData = await compRes.json();
        
        if (compData.success) {
            populateTable(compData.complaints);
        }
    } catch (err) {
        console.error("Error fetching complaints:", err);
    }
}

function renderCharts(districtStats, typeStats) {
    // Colors that match our design
    const colors = [
        'rgba(218, 165, 32, 0.8)',   // Gold
        'rgba(0, 71, 171, 0.8)',     // Cobalt
        'rgba(139, 0, 0, 0.8)',      // Maroon
        'rgba(46, 139, 87, 0.8)',    // Pasumai Green
        'rgba(200, 200, 200, 0.8)'   // Silver
    ];

    // Format District Data
    const districtLabels = districtStats.map(d => d._id);
    const districtData = districtStats.map(d => d.count);

    new Chart(document.getElementById('districtChart'), {
        type: 'doughnut',
        data: {
            labels: districtLabels,
            datasets: [{
                data: districtData,
                backgroundColor: colors,
                borderWidth: 1,
                borderColor: '#1a1614'
            }]
        },
        options: {
            plugins: {
                legend: { labels: { color: '#ccc', font: { family: 'JetBrains Mono' } } }
            }
        }
    });

    // Format Type Data
    const typeLabels = typeStats.map(t => t._id);
    const typeData = typeStats.map(t => t.count);

    new Chart(document.getElementById('typeChart'), {
        type: 'bar',
        data: {
            labels: typeLabels,
            datasets: [{
                label: 'Incidents',
                data: typeData,
                backgroundColor: colors[1],
                borderWidth: 1,
                borderColor: '#1a1614'
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, ticks: { color: '#ccc', stepSize: 1 }, grid: { color: 'rgba(218, 165, 32, 0.1)' } },
                x: { ticks: { color: '#ccc' }, grid: { display: false } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function populateTable(complaints) {
    const tbody = document.getElementById('complaints-table-body');
    tbody.innerHTML = '';
    
    if (complaints.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No complaints found.</td></tr>';
        return;
    }

    complaints.forEach(c => {
        const tr = document.createElement('tr');
        
        // Status formatting
        let statusBadge = `<span style="color:var(--text-gold)">[OPEN]</span>`;
        if(c.status === 'closed') {
            statusBadge = `<span style="color:var(--color-pasumai)">[CLOSED]</span>`;
        }
        
        const dateStr = new Date(c.created_at).toLocaleString();

        tr.innerHTML = `
            <td>${dateStr}</td>
            <td><strong style="color:var(--color-electric-cobalt)">${c.district}</strong></td>
            <td>${c.incident_type}</td>
            <td>${c.full_name}</td>
            <td><div style="max-height: 40px; overflow:hidden; text-overflow:ellipsis;" title="${c.description}">${c.description}</div></td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}
