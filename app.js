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
    if (incidentList) {
        fetch('/api/dispatches')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.dispatches) {
                    data.dispatches.forEach(dispatch => {
                        const li = document.createElement('li');
                        li.textContent = `> ${dispatch.dispatch_type} - Status: ${dispatch.status}`;
                        li.style.marginBottom = '8px';
                        li.style.fontFamily = 'var(--font-code)';
                        li.style.fontSize = '0.85rem';
                        li.style.color = '#ccc';
                        incidentList.appendChild(li);
                    });
                }
            })
            .catch(err => console.error('Error fetching incidents:', err));
    }

    // --- Audit Trail ---
    const auditLogContainer = document.getElementById('audit-log');
    if (auditLogContainer) {
        fetch('/api/audit-logs')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.logs) {
                    data.logs.forEach(log => {
                        const time = new Date(log.timestamp).toLocaleTimeString();
                        const user = log.cop_id ? log.cop_id.cop_id : 'SYS-AUTO';
                        const div = document.createElement('div');
                        div.className = 'audit-entry';
                        div.innerHTML = `
                            <span class="audit-time">[${time}]</span>
                            <span class="audit-user">${user}</span>
                            <span class="audit-action">${log.action}</span>
                            <span class="audit-tamil">பதிவு</span>
                        `;
                        auditLogContainer.appendChild(div);
                    });
                }
            })
            .catch(err => console.error('Error fetching audit logs:', err));
    }

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
        fetch('/api/suspects')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.suspects) {
                    const inner = document.createElement('div');
                    inner.className = 'watchlist-feed-inner';
                    data.suspects.forEach(s => {
                        const cardClass = s.risk_level === 'High' ? 'gold-flag' : '';
                        const el = document.createElement('div');
                        el.className = `suspect-card ${cardClass}`;
                        el.innerHTML = `<span style="color:#ccc">ID: ${s.aadhaar_id}</span><br><span class="temple-maroon">${s.reason}</span>`;
                        inner.appendChild(el);
                    });
                    watchlistFeed.appendChild(inner);
                }
            })
            .catch(err => console.error('Error fetching suspects:', err));
    }

    // --- Duty Roster ---
    const rosterList = document.getElementById('roster-list');
    if (rosterList) {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.users) {
                    data.users.forEach(o => {
                        const name = o.name || o.cop_id;
                        const rank = o.rank || 'Officer';
                        const status = o.patrol_status || 'On Duty';
                        const color = status === 'On Patrol' ? 'var(--color-pasumai)' : 'var(--color-electric-cobalt)';
                        const el = document.createElement('div');
                        el.className = 'roster-item';
                        el.innerHTML = `
                            <div class="avatar" style="background: #333 no-repeat center center; background-size: cover; border-color:${color}"></div>
                            <div>
                                <div style="font-family:var(--font-code); color:var(--text-bronze)">${name} (${rank})</div>
                                <div style="font-size:0.8rem; color:${color}">● ${status}</div>
                            </div>
                        `;
                        rosterList.appendChild(el);
                    });
                }
            })
            .catch(err => console.error('Error fetching users:', err));
    }

    // --- Emergency Dispatch ---
    const dispatchBtns = document.querySelectorAll('.dispatch-card .btn');
    dispatchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.innerText;
            
            // Send dispatch to database
            fetch('/api/dispatches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: action })
            })
            .then(res => res.json())
            .then(data => {
                alert(`🚨 DISPATCH INITIATED: ${action}\nUnits have been notified and are en route.`);
                
                // Add to incidents log
                const li = document.createElement('li');
                li.innerHTML = `> <span class="temple-maroon">SOS DISPATCH: ${action} deployed at ${new Date().toLocaleTimeString()}</span>`;
                li.style.marginBottom = '8px';
                li.style.fontFamily = 'var(--font-code)';
                li.style.fontSize = '0.85rem';
                if(incidentList) incidentList.prepend(li);
            })
            .catch(err => console.error('Error dispatching:', err));
        });
    });

});
