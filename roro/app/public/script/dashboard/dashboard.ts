declare const Chart: any;

interface Stats {
  totalGames: number;
  winRate: number;
  currentWinStreak: number; // Number of games
  longestWinStreak: number;
  totalGoalsScored: number;
}

function renderBarChart() {
  const ctx = document.getElementById('bar-chart') as HTMLCanvasElement | null;

  if (!ctx) console.error('Canvas bar-chart element not found'); // ! DEBUG
  new Chart(ctx!, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    },
  
  plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      }
  });
}

  async function fetchStats(): Promise<Stats[] | null> {
    try {
      const res = await fetch(`/api/dashboard/stats`);
      const data = await res.json();
      if (res.status === 404 || res.status === 500) {
        console.log(data.message);
        return (null);
      }
      console.log("DATA FETCHED = ", data); // ! DEBUG
      return data;
    } catch (err) {
      console.error("Failed to fetch or parse JSON:", err);
      return (null);
    }
  }

export default async function displayDashboard() {
  const stats = await fetchStats();
  console.log("STATS = ", stats);
  renderBarChart();
  // renderLineGraph();
  // renderPieChart();
  // renderStats();
}



// 1. USER DASHBOARD
// - Total games played : array length
// - Win rate: loop over array & count Winnner OR ? map new array & count length
// - Current win streak: loop from last index until
// - Longest win streak
// - Total goals scored

// 1. Organize data - OK
// 2. Render charts & graphs
// 3. Check treeshaking





































/* 
1. USER DASHBOARD
- Total games played
- Win rate
- Current win streak
- Longest win streak
- Total goals scored

- Row 1 :
	- Stat = total games played
	- Pie chart = wins vs losses (win rate)
	- Stat = Current win streak (+ below : longest win streak)
- Row 2 : bar chart = games played (y axis) over time (w-axis)
- Row 3 : line graph = win rate progression over time

2. GAME STATISTICS (with filter ?)
- services rates
- Precision
- Duration
- Date & Time
- Mode (1v1 / Tournament)
- Opponent
- Final score
- Result (Win / Loss)
- Goals Scored
*/
