let leagueData = { leagueName: "KAB DLS 1.1 LEAGUE", teams: [], matches: [] };

window.onload = function() {
    fetch('data.json')
        .then(res => res.json())
        .then(data => {
            leagueData = data;
            renderPublicView();
        })
        .catch(err => {
            console.error('Error fetching data.json:', err);
        });
};

function switchTab(tab) {
    document.getElementById('tabTableBtn').classList.toggle('active', tab === 'table');
    document.getElementById('tabFixturesBtn').classList.toggle('active', tab === 'fixtures');
    document.getElementById('tableView').style.display = tab === 'table' ? 'block' : 'none';
    document.getElementById('fixturesView').style.display = tab === 'fixtures' ? 'block' : 'none';
}

function renderPublicView() {
    renderPublicStandings();
}

function renderPublicStandings() {
    let stats = {};
    if (!leagueData.teams) return;

    leagueData.teams.forEach(t => {
        stats[t] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    });

    let playedCount = 0;
    if (leagueData.matches) {
        leagueData.matches.forEach(m => {
            if (m.homeScore !== null && m.awayScore !== null && m.homeScore !== "" && m.awayScore !== "") {
                playedCount++;
                const home = stats[m.homeTeam];
                const away = stats[m.awayTeam];

                if (home && away) {
                    const hScore = parseInt(m.homeScore, 10);
                    const aScore = parseInt(m.awayScore, 10);

                    home.played++; away.played++;
                    home.gf += hScore; home.ga += aScore;
                    away.gf += aScore; away.ga += hScore;

                    if (hScore > aScore) {
                        home.won++; home.pts += 3; away.lost++;
                    } else if (hScore < aScore) {
                        away.won++; away.pts += 3; home.lost++;
                    } else {
                        home.drawn++; away.drawn++; home.pts += 1; away.pts += 1;
                    }
                }
            }
        });
    }

    document.getElementById('matchProgress').innerText = `${playedCount} / ${leagueData.matches.length || 132} Played`;

    Object.keys(stats).forEach(t => { stats[t].gd = stats[t].gf - stats[t].ga; });

    const sorted = Object.keys(stats).sort((a, b) => {
        if (stats[b].pts !== stats[a].pts) return stats[b].pts - stats[a].pts;
        if (stats[b].gd !== stats[a].gd) return stats[b].gd - stats[a].gd;
        return stats[b].gf - stats[a].gf;
    });

    const tbody = document.getElementById('publicStandingsBody');
    if (!tbody) return;

    tbody.innerHTML = sorted.map((team, idx) => {
        const s = stats[team];
        const rank = idx + 1;
        
        let badgeClass = "pos-badge rank-normal";
        if (rank === 1) badgeClass = "pos-badge rank-1";
        else if (rank <= 4) badgeClass = "pos-badge rank-top";

        const crownHtml = rank === 1 ? `<span class="crown">👑</span>` : ``;

        return `
            <tr>
                <td><div class="${badgeClass}">${rank}</div></td>
                <td style="text-align: left;">
                    <div class="team-cell">
                        ${crownHtml} <span>${team}</span>
                    </div>
                </td>
                <td>${s.played}</td>
                <td>${s.won}</td>
                <td>${s.drawn}</td>
                <td>${s.lost}</td>
                <td>${s.gf}</td>
                <td>${s.ga}</td>
                <td>${s.gd}</td>
                <td class="pts">${s.pts}</td>
            </tr>
        `;
    }).join('');
}
