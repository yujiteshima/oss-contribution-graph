// Vercel Serverless Function - OSS Contribution Graph SVG Generator

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';

// 組織IDを取得するクエリ
const ORG_ID_QUERY = `
query($login: String!) {
  organization(login: $login) {
    id
  }
}
`;

// コントリビューションデータを取得するクエリ
const CONTRIBUTION_QUERY = `
query($username: String!, $from: DateTime!, $to: DateTime!, $orgId: ID) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to, organizationID: $orgId) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}
`;

// GitHub APIを呼び出す
async function fetchGitHub(query, variables, token) {
  const response = await fetch(GITHUB_GRAPHQL_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  return response.json();
}

// 組織IDを取得
async function getOrgId(orgName, token) {
  try {
    const result = await fetchGitHub(ORG_ID_QUERY, { login: orgName }, token);
    return result.data?.organization?.id || null;
  } catch (e) {
    console.error(`Failed to get org ID for ${orgName}:`, e);
    return null;
  }
}

// コントリビューションデータを取得
async function getContributions(username, orgId, from, to, token) {
  try {
    const result = await fetchGitHub(CONTRIBUTION_QUERY, {
      username,
      from: from.toISOString(),
      to: to.toISOString(),
      orgId,
    }, token);
    
    const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) return {};
    
    const data = {};
    calendar.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        if (day.contributionCount > 0) {
          data[day.date] = day.contributionCount;
        }
      });
    });
    
    return data;
  } catch (e) {
    console.error(`Failed to get contributions:`, e);
    return {};
  }
}

// 日付範囲を計算
function getDateRange(months) {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - months);
  return { from, to };
}

// セルサイズを計算
function getCellSize(months) {
  if (months <= 3) return 12;
  if (months <= 6) return 10;
  return 7;
}

// 色をRGBに変換
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// SVGを生成
function generateSVG(gridData, organizations, months, username) {
  const cellSize = getCellSize(months);
  const gap = 2;
  const weeks = gridData.length;
  const padding = 40;
  const legendHeight = 30;
  const titleHeight = 25;
  const monthLabelHeight = 20;

  const width = padding + weeks * (cellSize + gap) + padding;
  const height = titleHeight + monthLabelHeight + 7 * (cellSize + gap) + legendHeight + 10;
  
  // 月ラベルを計算
  const monthLabels = [];
  const { from } = getDateRange(months);
  const startDate = new Date(from);
  let lastMonth = -1;
  
  gridData.forEach((week, weekIdx) => {
    const firstDay = week.find(d => d !== null);
    if (firstDay) {
      const date = new Date(firstDay.date);
      const month = date.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({
          name: date.toLocaleDateString('en-US', { month: 'short' }),
          x: padding + weekIdx * (cellSize + gap)
        });
        lastMonth = month;
      }
    }
  });

  // セルの背景を取得
  const getCellFill = (day) => {
    if (!day || day.total === 0) return '#ebedf0';
    
    const orgs = Object.keys(day.contributions);
    if (orgs.length === 1) {
      const org = organizations.find(o => o.name === orgs[0]);
      return org?.color || '#39d353';
    }
    
    // 複数の場合は最初の色（SVGではグラデーションが複雑なので）
    // デフォルトでは混色を表現
    const colors = orgs.map(orgName => {
      const org = organizations.find(o => o.name === orgName);
      return org?.color || '#39d353';
    });
    
    // 2色の平均を取る
    if (colors.length >= 2) {
      const rgb1 = hexToRgb(colors[0]);
      const rgb2 = hexToRgb(colors[1]);
      const mixed = {
        r: Math.round((rgb1.r + rgb2.r) / 2),
        g: Math.round((rgb1.g + rgb2.g) / 2),
        b: Math.round((rgb1.b + rgb2.b) / 2)
      };
      return `rgb(${mixed.r},${mixed.g},${mixed.b})`;
    }
    
    return colors[0];
  };

  // グラデーション定義を生成（複数組織用）
  let gradientDefs = '';
  let gradientId = 0;
  const gradientMap = new Map();
  
  gridData.forEach((week, weekIdx) => {
    week.forEach((day, dayIdx) => {
      if (day && Object.keys(day.contributions).length > 1) {
        const orgs = Object.keys(day.contributions).sort();
        const key = orgs.join('-');
        if (!gradientMap.has(key)) {
          const colors = orgs.map(orgName => {
            const org = organizations.find(o => o.name === orgName);
            return org?.color || '#39d353';
          });
          const id = `grad-${gradientId++}`;
          gradientDefs += `
            <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="50%" style="stop-color:${colors[0]}" />
              <stop offset="50%" style="stop-color:${colors[1] || colors[0]}" />
            </linearGradient>
          `;
          gradientMap.set(key, id);
        }
      }
    });
  });

  // セルの塗りを取得（グラデーション対応）
  const getCellFillWithGradient = (day) => {
    if (!day || day.total === 0) return '#ebedf0';
    
    const orgs = Object.keys(day.contributions).sort();
    if (orgs.length === 1) {
      const org = organizations.find(o => o.name === orgs[0]);
      return org?.color || '#39d353';
    }
    
    const key = orgs.join('-');
    if (gradientMap.has(key)) {
      return `url(#${gradientMap.get(key)})`;
    }
    
    return getCellFill(day);
  };

  // セルを生成
  const gridTop = titleHeight + monthLabelHeight;
  let cells = '';
  gridData.forEach((week, weekIdx) => {
    week.forEach((day, dayIdx) => {
      const x = padding + weekIdx * (cellSize + gap);
      const y = gridTop + dayIdx * (cellSize + gap);
      const fill = day ? getCellFillWithGradient(day) : '#ebedf0';
      const opacity = day ? 1 : 0.3;
      
      cells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${fill}" opacity="${opacity}">`;
      if (day && day.total > 0) {
        const tooltip = Object.entries(day.contributions)
          .map(([org, count]) => `${organizations.find(o => o.name === org)?.label || org}: ${count}`)
          .join(', ');
        cells += `<title>${day.date}: ${tooltip}</title>`;
      }
      cells += `</rect>`;
    });
  });

  // 凡例を生成
  let legend = '';
  let legendX = padding;
  const legendY = gridTop + 7 * (cellSize + gap) + 10;
  organizations.forEach((org, idx) => {
    legend += `
      <rect x="${legendX}" y="${legendY}" width="12" height="12" rx="2" fill="${org.color}" />
      <text x="${legendX + 16}" y="${legendY + 10}" font-size="10" fill="#666">${org.label || org.name}</text>
    `;
    legendX += (org.label || org.name).length * 7 + 30;
  });

  // 月ラベルを生成
  let monthLabelsStr = '';
  monthLabels.forEach(label => {
    monthLabelsStr += `<text x="${label.x}" y="${titleHeight + monthLabelHeight - 5}" font-size="10" fill="#666">${label.name}</text>`;
  });

  // 曜日ラベル
  const dayLabels = `
    <text x="${padding - 5}" y="${gridTop + 1 * (cellSize + gap) + cellSize/2 + 3}" font-size="9" fill="#666" text-anchor="end">Mon</text>
    <text x="${padding - 5}" y="${gridTop + 3 * (cellSize + gap) + cellSize/2 + 3}" font-size="9" fill="#666" text-anchor="end">Wed</text>
    <text x="${padding - 5}" y="${gridTop + 5 * (cellSize + gap) + cellSize/2 + 3}" font-size="9" fill="#666" text-anchor="end">Fri</text>
  `;

  // タイトル
  const title = `<text x="${padding}" y="18" font-size="14" font-weight="bold" fill="#333">🌈 OSS Contributions - ${username}</text>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    rect { transition: opacity 0.1s; }
    rect:hover { opacity: 0.8 !important; }
  </style>
  <defs>
    ${gradientDefs}
  </defs>
  <rect width="100%" height="100%" fill="#ffffff" rx="6" />
  ${title}
  ${monthLabelsStr}
  ${dayLabels}
  ${cells}
  ${legend}
</svg>
  `.trim();
}

// グリッドデータを生成
function generateGridData(contributionData, organizations, months) {
  const { from, to } = getDateRange(months);
  const weeks = [];
  let currentWeek = [];
  const current = new Date(from);

  // 週の開始を日曜日に調整
  const startDay = current.getDay();
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null);
  }

  while (current <= to) {
    const dateStr = current.toISOString().split('T')[0];
    const contributions = {};

    organizations.forEach(org => {
      const count = contributionData[org.name]?.[dateStr] || 0;
      if (count > 0) {
        contributions[org.name] = count;
      }
    });

    currentWeek.push({
      date: dateStr,
      contributions,
      total: Object.values(contributions).reduce((a, b) => a + b, 0)
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    current.setDate(current.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

// デモデータを生成
function generateDemoData(organizations, months) {
  const { from, to } = getDateRange(months);
  const data = {};

  organizations.forEach(org => {
    data[org.name] = {};
    const current = new Date(from);
    while (current <= to) {
      const dateStr = current.toISOString().split('T')[0];
      // ランダムにコントリビューション（15%の確率）
      data[org.name][dateStr] = Math.random() > 0.85 ? Math.floor(Math.random() * 5) + 1 : 0;
      current.setDate(current.getDate() + 1);
    }
  });

  return data;
}

// URLパラメータをパース
function parseOrgs(orgsParam) {
  // Format: rails:CC0000:Rails,hotwired:1a1a1a:Hotwire
  if (!orgsParam) {
    return [
      { name: 'rails', color: '#CC0000', label: 'Rails' },
      { name: 'hotwired', color: '#1a1a1a', label: 'Hotwire' },
    ];
  }
  
  return orgsParam.split(',').map(org => {
    const [name, color, label] = org.split(':');
    return {
      name: name.trim(),
      color: color ? `#${color.trim()}` : '#39d353',
      label: label?.trim() || name.trim()
    };
  });
}

// メインハンドラー
export default async function handler(req, res) {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  const { username = 'yujiteshima', orgs, months = '6', demo, debug } = req.query;
  const monthsNum = Math.min(Math.max(parseInt(months) || 6, 1), 12);
  const organizations = parseOrgs(orgs);
  const token = process.env.GITHUB_TOKEN;

  // デバッグモード
  if (debug === 'true') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPrefix: token?.substring(0, 4) || 'none',
      username,
      organizations: organizations.map(o => o.name),
    });
  }

  let contributionData;

  if (demo === 'true' || !token) {
    // デモモードまたはトークンがない場合
    contributionData = generateDemoData(organizations, monthsNum);
  } else {
    // 実際のGitHubデータを取得
    contributionData = {};
    const { from, to } = getDateRange(monthsNum);
    
    for (const org of organizations) {
      const orgId = await getOrgId(org.name, token);
      if (orgId) {
        contributionData[org.name] = await getContributions(username, orgId, from, to, token);
      } else {
        contributionData[org.name] = {};
      }
    }
  }
  
  const gridData = generateGridData(contributionData, organizations, monthsNum);
  const svg = generateSVG(gridData, organizations, monthsNum, username);
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(svg);
}
