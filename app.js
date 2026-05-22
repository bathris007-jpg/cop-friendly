document.addEventListener('DOMContentLoaded', () => {
    
    // --- Query Hall Logic ---
    const sqlEditor = document.getElementById('sql-editor');
    const btnAadhaar = document.getElementById('btn-aadhaar');
    const btnDistrict = document.getElementById('btn-district');

    btnAadhaar.addEventListener('click', () => {
        sqlEditor.value = "SELECT * FROM CITIZEN\nWHERE Aadhaar_ID = 'XXXX-XXXX-XXXX'\nAND Encryption_Status = 'VALID';";
        sqlEditor.style.color = 'var(--color-pasumai)';
    });

    btnDistrict.addEventListener('click', () => {
        sqlEditor.value = "SELECT FIR_ID, Status FROM FIR_Entries\nWHERE District = 'Madurai'\nORDER BY Date_Filed DESC LIMIT 10;";
        sqlEditor.style.color = 'var(--color-electric-cobalt)';
    });

    sqlEditor.addEventListener('input', () => {
        sqlEditor.style.color = '#a0c4ff'; // Default color while typing
    });

    // --- Live Data Table ---
    // Moved to view_db.html 

    // --- Incident Logs ---
    const incidentList = document.getElementById('incident-list');
    const incidents = [
        "Login from TN-4590 successful",
        "Encrypted record CR-4432 accessed",
        "Query execution time: 14ms",
        "Connection established to Madurai_Data"
    ];

    incidents.forEach(inc => {
        const li = document.createElement('li');
        li.textContent = `> ${inc}`;
        li.style.marginBottom = '8px';
        li.style.fontFamily = 'var(--font-code)';
        li.style.fontSize = '0.85rem';
        li.style.color = '#ccc';
        incidentList.appendChild(li);
    });

    // --- Audit Trail ---
    const auditLogContainer = document.getElementById('audit-log');
    const audits = [
        { time: '23:01:45', user: 'TN-4590', action: 'Access Granted', tamil: 'அனுமதி வழங்கப்பட்டது' },
        { time: '23:02:10', user: 'SYS-AUTO', action: 'Data Synchronization', tamil: 'தரவு ஒத்திசைவு' },
        { time: '23:05:00', user: 'TN-1122', action: 'Record Locked', tamil: 'பதிவு பூட்டப்பட்டது' }
    ];

    audits.forEach(audit => {
        const div = document.createElement('div');
        div.className = 'audit-entry';
        div.innerHTML = `
            <span class="audit-time">[${audit.time}]</span>
            <span class="audit-user">${audit.user}</span>
            <span class="audit-action">${audit.action}</span>
            <span class="audit-tamil">${audit.tamil}</span>
        `;
        auditLogContainer.appendChild(div);
    });

    // --- Active Connections Counter Animation ---
    const connectionsEl = document.getElementById('active-connections');
    setInterval(() => {
        const current = parseInt(connectionsEl.innerText.replace(',', ''));
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        connectionsEl.innerText = (current + change).toLocaleString();
    }, 3000);
    // --- Live Patrol Radar ---
    const radarContainer = document.querySelector('.radar-container');
    if (radarContainer) {
        for(let i=0; i<5; i++) {
            const dot = document.createElement('div');
            dot.className = 'radar-dot';
            dot.style.top = Math.floor(Math.random() * 80 + 10) + '%';
            dot.style.left = Math.floor(Math.random() * 80 + 10) + '%';
            dot.style.animationDelay = (Math.random() * 2) + 's';
            radarContainer.appendChild(dot);
        }
    }

    // --- Suspect Watchlist ---
    const watchlistFeed = document.getElementById('watchlist-feed');
    if (watchlistFeed) {
        const suspects = [
            { id: 'AAD-9988', reason: 'Pending Warrant', class: 'gold-flag' },
            { id: 'UNK-0021', reason: 'High-Risk Target', class: '' },
            { id: 'AAD-4432', reason: 'Parole Violation', class: 'gold-flag' }
        ];
        const inner = document.createElement('div');
        inner.className = 'watchlist-feed-inner';
        suspects.forEach(s => {
            const el = document.createElement('div');
            el.className = `suspect-card ${s.class}`;
            el.innerHTML = `<span style="color:#ccc">ID: ${s.id}</span><br><span class="temple-maroon">${s.reason}</span>`;
            inner.appendChild(el);
        });
        watchlistFeed.appendChild(inner);
    }

    // --- Duty Roster ---
    const rosterList = document.getElementById('roster-list');
    if (rosterList) {
        const officers = [
            { name: 'S. Kumar', rank: 'Inspector', status: 'On Patrol', color: 'var(--color-pasumai)', image: 'assets/avatar_kumar.png' },
            { name: 'R. Anjali', rank: 'Sub-Inspector', status: 'Stationed', color: 'var(--color-electric-cobalt)', image: 'assets/avatar_anjali.png' },
            { name: 'V. Raj', rank: 'Constable', status: 'Interrogation', color: 'var(--color-temple-maroon)', image: 'assets/avatar_raj.png' },
            { name: 'M. Devi', rank: 'Cyber Cell', status: 'Analyzing', color: 'var(--color-royal-gold)', image: 'assets/avatar_devi.png' }
        ];
        officers.forEach(o => {
            const el = document.createElement('div');
            el.className = 'roster-item';
            el.innerHTML = `
                <div class="avatar" style="background: url('${o.image}') no-repeat center center; background-size: cover; border-color:${o.color}"></div>
                <div>
                    <div style="font-family:var(--font-code); color:var(--text-bronze)">${o.name} (${o.rank})</div>
                    <div style="font-size:0.8rem; color:${o.color}">● ${o.status}</div>
                </div>
            `;
            rosterList.appendChild(el);
        });
    }

    // --- Emergency Dispatch ---
    const dispatchBtns = document.querySelectorAll('.dispatch-card .btn');
    dispatchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.innerText;
            alert(`🚨 DISPATCH INITIATED: ${action}\nUnits have been notified and are en route.`);
            
            // Add to incidents log
            const li = document.createElement('li');
            li.innerHTML = `> <span class="temple-maroon">SOS DISPATCH: ${action} deployed at ${new Date().toLocaleTimeString()}</span>`;
            li.style.marginBottom = '8px';
            li.style.fontFamily = 'var(--font-code)';
            li.style.fontSize = '0.85rem';
            if(incidentList) incidentList.prepend(li);
        });
    });

});
